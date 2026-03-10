const Order = require('../order/order.model');
const Product = require('../product/product.model');
const User = require('../user/user.model');
const mongoose = require('mongoose');

class SalesReportController {
  async getSalesReport(req, res) {
    try {
      const {
        startDate,
        endDate,
        period = 'day', // 'day' | 'week' | 'month'
      } = req.query;

      const now = new Date();

      // Build date range
      const start = startDate
        ? new Date(startDate)
        : (() => { const d = new Date(now); d.setDate(d.getDate() - 30); d.setHours(0, 0, 0, 0); return d; })();
      const end = endDate
        ? (() => { const d = new Date(endDate); d.setHours(23, 59, 59, 999); return d; })()
        : (() => { const d = new Date(now); d.setHours(23, 59, 59, 999); return d; })();

      // Previous period of same length for comparison
      const periodMs = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - periodMs - 1);
      const prevEnd = new Date(start.getTime() - 1);

      const dateFilter = { createdAt: { $gte: start, $lte: end } };
      const prevDateFilter = { createdAt: { $gte: prevStart, $lte: prevEnd } };
      const revenueFilter = { ...dateFilter, status: { $ne: 'cancelled' } };
      const prevRevenueFilter = { ...prevDateFilter, status: { $ne: 'cancelled' } };

      // ── Overview ──────────────────────────────────────────────────────────────
      const [
        overviewData,
        prevOverviewData,
        newUsers,
        prevNewUsers,
      ] = await Promise.all([
        Order.aggregate([
          { $match: revenueFilter },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$total' },
              totalOrders: { $sum: 1 },
              totalItems: { $sum: { $sum: '$items.quantity' } },
              totalDiscount: { $sum: '$discount' },
            },
          },
        ]),
        Order.aggregate([
          { $match: prevRevenueFilter },
          { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 } } },
        ]),
        User.countDocuments(dateFilter),
        User.countDocuments(prevDateFilter),
      ]);

      const cur = overviewData[0] || { totalRevenue: 0, totalOrders: 0, totalItems: 0, totalDiscount: 0 };
      const prev = prevOverviewData[0] || { totalRevenue: 0, totalOrders: 0 };

      const pctChange = (c, p) => (p === 0 ? 0 : Math.round(((c - p) / p) * 100));

      const overview = {
        totalRevenue: cur.totalRevenue,
        totalOrders: cur.totalOrders,
        netRevenue: cur.totalRevenue - cur.totalDiscount,
        totalDiscount: cur.totalDiscount,
        avgOrderValue: cur.totalOrders > 0 ? Math.round(cur.totalRevenue / cur.totalOrders) : 0,
        newCustomers: newUsers,
        revenueGrowth: pctChange(cur.totalRevenue, prev.totalRevenue),
        ordersGrowth: pctChange(cur.totalOrders, prev.totalOrders),
        customersGrowth: pctChange(newUsers, prevNewUsers),
      };

      // ── Revenue over time ─────────────────────────────────────────────────────
      let groupId;
      if (period === 'month') {
        groupId = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      } else if (period === 'week') {
        groupId = {
          year: { $isoWeekYear: '$createdAt' },
          week: { $isoWeek: '$createdAt' },
        };
      } else {
        groupId = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      }

      const revenueOverTime = await Order.aggregate([
        { $match: revenueFilter },
        {
          $group: {
            _id: groupId,
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // ── Order status breakdown ───────────────────────────────────────────────
      const orderStatusBreakdown = await Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
        { $sort: { count: -1 } },
      ]);

      // ── Payment method breakdown ─────────────────────────────────────────────
      const paymentBreakdown = await Order.aggregate([
        { $match: revenueFilter },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            revenue: { $sum: '$total' },
          },
        },
        { $sort: { revenue: -1 } },
      ]);

      // ── Top products by revenue ──────────────────────────────────────────────
      const topProducts = await Order.aggregate([
        { $match: revenueFilter },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            category: { $first: '$items.category' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            ordersCount: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]);

      // ── Revenue by category (lookup product category as fallback) ────────────
      const categoryRevenue = await Order.aggregate([
        { $match: revenueFilter },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'productInfo',
          },
        },
        {
          $addFields: {
            resolvedCategory: {
              $ifNull: [
                '$items.category',
                { $arrayElemAt: ['$productInfo.category', 0] },
              ],
            },
          },
        },
        {
          $group: {
            _id: '$resolvedCategory',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            quantity: { $sum: '$items.quantity' },
            orders: { $sum: 1 },
            totalProducts: { $addToSet: '$items.productId' },
          },
        },
        {
          $addFields: {
            totalProducts: { $size: '$totalProducts' },
          },
        },
        { $sort: { revenue: -1 } },
      ]);

      // ── Daily Revenue trend (last 7 days within range) ───────────────────────
      const sevenDayStart = new Date(Math.max(start.getTime(), end.getTime() - 6 * 86400000));
      sevenDayStart.setHours(0, 0, 0, 0);

      const dailyTrend = await Order.aggregate([
        { $match: { createdAt: { $gte: sevenDayStart, $lte: end }, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // ── Shipping city breakdown ──────────────────────────────────────────────
      const cityBreakdown = await Order.aggregate([
        { $match: revenueFilter },
        {
          $group: {
            _id: '$shippingAddress.city',
            orders: { $sum: 1 },
            revenue: { $sum: '$total' },
          },
        },
        { $sort: { orders: -1 } },
        { $limit: 10 },
      ]);

      // ── Sales by Date (tabular, all statuses, includes discount/tax) ──────────
      const salesByDate = await Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orders: { $sum: 1 },
            productsSold: {
              $sum: {
                $reduce: {
                  input: '$items',
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.quantity'] },
                },
              },
            },
            totalSales: {
              $sum: {
                $cond: [{ $ne: ['$status', 'cancelled'] }, '$total', 0],
              },
            },
            totalDiscount: {
              $sum: {
                $cond: [{ $ne: ['$status', 'cancelled'] }, { $ifNull: ['$discount', 0] }, 0],
              },
            },
            totalTax: {
              $sum: {
                $cond: [{ $ne: ['$status', 'cancelled'] }, { $ifNull: ['$tax', 0] }, 0],
              },
            },
          },
        },
        {
          $addFields: {
            netSale: { $subtract: ['$totalSales', '$totalDiscount'] },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // ── Customer-wise sales report ────────────────────────────────────────────
      const customerReport = await Order.aggregate([
        { $match: revenueFilter },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$userId',
            name: {
              $first: {
                $trim: {
                  input: {
                    $concat: [
                      { $ifNull: ['$user.firstName', ''] },
                      ' ',
                      { $ifNull: ['$user.lastName', ''] },
                    ],
                  },
                },
              },
            },
            email: { $first: '$user.email' },
            phone: { $first: '$user.phone' },
            totalOrders: { $sum: 1 },
            totalSpend: { $sum: '$total' },
            avgOrderValue: { $avg: '$total' },
            lastOrderDate: { $max: '$createdAt' },
          },
        },
        { $sort: { totalSpend: -1 } },
        { $limit: 50 },
      ]);

      // ── Product-wise sales report ─────────────────────────────────────────────
      const productReport = await Order.aggregate([
        { $match: revenueFilter },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            category: { $first: '$items.category' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            totalOrders: { $addToSet: '$_id' },
            avgPrice: { $avg: '$items.price' },
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        {
          $addFields: {
            totalOrders: { $size: '$totalOrders' },
            stockRemaining: { $arrayElemAt: ['$product.stock', 0] },
            resolvedCategory: {
              $ifNull: ['$category', { $arrayElemAt: ['$product.category', 0] }],
            },
            sku: { $arrayElemAt: ['$product.sku', 0] },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 100 },
      ]);

      // ── GST Report ────────────────────────────────────────────────────────────
      const gstSummary = await Order.aggregate([
        { $match: revenueFilter },
        {
          $group: {
            _id: null,
            taxableAmount: { $sum: '$subtotal' },
            totalTax: { $sum: { $ifNull: ['$tax', 0] } },
            totalDiscount: { $sum: { $ifNull: ['$discount', 0] } },
            totalOrders: { $sum: 1 },
          },
        },
        {
          $addFields: {
            igst: '$totalTax',
            cgst: { $divide: ['$totalTax', 2] },
            sgst: { $divide: ['$totalTax', 2] },
          },
        },
      ]);

      const gstByDate = await Order.aggregate([
        { $match: revenueFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            taxableAmount: { $sum: '$subtotal' },
            totalTax: { $sum: { $ifNull: ['$tax', 0] } },
            orders: { $sum: 1 },
          },
        },
        {
          $addFields: {
            igst: '$totalTax',
            cgst: { $divide: ['$totalTax', 2] },
            sgst: { $divide: ['$totalTax', 2] },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.status(200).json({
        success: true,
        data: {
          dateRange: { start: start.toISOString(), end: end.toISOString(), period },
          overview,
          revenueOverTime,
          orderStatusBreakdown,
          paymentBreakdown,
          topProducts,
          categoryRevenue,
          dailyTrend,
          cityBreakdown,
          salesByDate,
          customerReport,
          productReport,
          gstSummary: gstSummary[0] || {},
          gstByDate,
        },
      });
    } catch (error) {
      console.error('getSalesReport error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate sales report', error: error.message });
    }
  }
}

module.exports = new SalesReportController();
