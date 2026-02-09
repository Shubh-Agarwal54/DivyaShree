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
      const { period } = req.query;

      // Determine date range based on period
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      const query = { createdAt: { $gte: startDate } };

      // Sales Data
      const salesAggregation = await Order.aggregate([
        { $match: { ...query, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' },
          },
        },
      ]);

      const dailySales = await Order.aggregate([
        { $match: { ...query, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const salesData = {
        totalOrders: salesAggregation[0]?.totalOrders || 0,
        totalRevenue: Math.round(salesAggregation[0]?.totalRevenue || 0),
        averageOrderValue: Math.round(salesAggregation[0]?.averageOrderValue || 0),
        conversionRate: 0, // Can be calculated if we track total visits
        dailySales: dailySales.map(day => ({
          date: day._id,
          revenue: Math.round(day.revenue),
          orders: day.orders,
        })),
      };

      // User Growth
      const userStats = await User.aggregate([
        {
          $facet: {
            newUsers: [
              { $match: query },
              { $count: 'count' },
            ],
            totalUsers: [
              { $count: 'count' },
            ],
            previousPeriodUsers: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())),
                    $lt: startDate,
                  },
                },
              },
              { $count: 'count' },
            ],
          },
        },
      ]);

      const newUsers = userStats[0]?.newUsers[0]?.count || 0;
      const totalUsers = userStats[0]?.totalUsers[0]?.count || 0;
      const previousPeriodUsers = userStats[0]?.previousPeriodUsers[0]?.count || 0;
      const growthRate = previousPeriodUsers > 0 
        ? Math.round(((newUsers - previousPeriodUsers) / previousPeriodUsers) * 100)
        : 0;

      const userGrowth = {
        newUsers,
        totalUsers,
        activeUsers: totalUsers, // Can be refined with actual activity tracking
        growthRate,
      };

      // Product Performance
      const topProducts = await Product.find()
        .sort({ soldCount: -1 })
        .limit(5)
        .select('name soldCount price images category');

      const categoryStats = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            revenue: { $sum: { $multiply: ['$price', { $ifNull: ['$soldCount', 0] }] } },
          },
        },
        { $sort: { revenue: -1 } },
      ]);

      const productPerformance = {
        topProducts: topProducts.map(product => ({
          _id: product._id,
          name: product.name,
          images: product.images,
          soldCount: product.soldCount || 0,
          revenue: Math.round((product.price || 0) * (product.soldCount || 0)),
        })),
        categoryStats: categoryStats.map(cat => ({
          _id: cat._id,
          count: cat.count,
          revenue: Math.round(cat.revenue || 0),
        })),
      };

      res.status(200).json({
        success: true,
        data: {
          salesData,
          userGrowth,
          productPerformance,
        },
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
