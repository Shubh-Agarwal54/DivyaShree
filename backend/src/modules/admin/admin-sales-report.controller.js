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

      const cur = overviewData[0] || { totalRevenue: 0, totalOrders: 0, totalItems: 0 };
      const prev = prevOverviewData[0] || { totalRevenue: 0, totalOrders: 0 };

      const pctChange = (c, p) => (p === 0 ? 0 : Math.round(((c - p) / p) * 100));

      const overview = {
        totalRevenue: cur.totalRevenue,
        totalOrders: cur.totalOrders,
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

      // ── Revenue by category ──────────────────────────────────────────────────
      const categoryRevenue = await Order.aggregate([
        { $match: revenueFilter },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.category',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            quantity: { $sum: '$items.quantity' },
            orders: { $sum: 1 },
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
        },
      });
    } catch (error) {
      console.error('getSalesReport error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate sales report', error: error.message });
    }
  }
}

module.exports = new SalesReportController();
