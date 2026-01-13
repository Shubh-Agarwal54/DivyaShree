const User = require('../user/user.model');
const Order = require('../order/order.model');
const Product = require('../product/product.model');

class AdminDashboardController {
  // Get dashboard overview
  async getDashboard(req, res) {
    try {
      // Get counts
      const totalUsers = await User.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalProducts = await Product.countDocuments();

      // Calculate total revenue (excluding cancelled orders)
      const revenueData = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]);
      const totalRevenue = revenueData[0]?.totalRevenue || 0;

      // Recent orders
      const recentOrders = await Order.find()
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(10);

      // New users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newUsers = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });

      // Pending orders
      const pendingOrders = await Order.countDocuments({ status: 'pending' });

      // Out of stock products
      const outOfStockProducts = await Product.countDocuments({ inStock: false });

      // Order status breakdown
      const orderStatusStats = await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      // Daily sales trend (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const dailySales = await Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Top selling products (last 30 days)
      const topProducts = await Product.find()
        .sort({ soldCount: -1 })
        .limit(5)
        .select('name soldCount price images');

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue,
            newUsers,
            pendingOrders,
            outOfStockProducts,
          },
          recentOrders,
          orderStatusStats,
          dailySales,
          topProducts,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error.message,
      });
    }
  }

  // Get analytics data
  async getAnalytics(req, res) {
    try {
      const { startDate, endDate, metric } = req.query;

      const query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      let analyticsData = {};

      // Sales analytics
      if (!metric || metric === 'sales') {
        const salesData = await Order.aggregate([
          { $match: { ...query, status: { $ne: 'cancelled' } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: '$total' },
              orders: { $sum: 1 },
              avgOrderValue: { $avg: '$total' },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        analyticsData.sales = salesData;
      }

      // User growth analytics
      if (!metric || metric === 'users') {
        const userGrowth = await User.aggregate([
          { $match: query },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              newUsers: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        analyticsData.userGrowth = userGrowth;
      }

      // Product performance
      if (!metric || metric === 'products') {
        const productPerformance = await Product.aggregate([
          {
            $project: {
              name: 1,
              soldCount: 1,
              viewCount: 1,
              revenue: { $multiply: ['$price', '$soldCount'] },
              conversionRate: {
                $cond: [
                  { $gt: ['$viewCount', 0] },
                  { $multiply: [{ $divide: ['$soldCount', '$viewCount'] }, 100] },
                  0,
                ],
              },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 20 },
        ]);

        analyticsData.productPerformance = productPerformance;
      }

      res.status(200).json({
        success: true,
        data: analyticsData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics data',
        error: error.message,
      });
    }
  }
}

module.exports = new AdminDashboardController();
