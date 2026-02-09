const Order = require('../order/order.model');
const User = require('../user/user.model');
const adminAuditService = require('./admin-audit.service');
const notificationService = require('../../services/notification.service');

class AdminOrderController {
  // Get all orders with pagination and filters
  async getAllOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        status = '',
        paymentMethod = '',
        startDate = '',
        endDate = '',
        sortBy = 'createdAt',
        order = 'desc',
      } = req.query;

      const query = {};

      // Search by order number or customer name
      if (search) {
        const users = await User.find({
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }).select('_id');

        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { userId: { $in: users.map((u) => u._id) } },
        ];
      }

      // Filter by status
      if (status) query.status = status;

      // Filter by payment method
      if (paymentMethod) query.paymentMethod = paymentMethod;

      // Filter by date range
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;
      const sortOrder = order === 'asc' ? 1 : -1;

      const orders = await Order.find(query)
        .populate('userId', 'firstName lastName email phone')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Order.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          orders,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message,
      });
    }
  }

  // Get single order details
  async getOrderDetails(req, res) {
    try {
      const { orderId } = req.params;

      const order = await Order.findById(orderId).populate(
        'userId',
        'firstName lastName email phone'
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order details',
        error: error.message,
      });
    }
  }

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const validStatuses = [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status',
        });
      }

      const order = await Order.findById(orderId).populate('userId');
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      const oldStatus = order.status;
      order.status = status;
      await order.save();

      // Log action
      await adminAuditService.logAction(
        req.userId,
        req.user.email,
        'ORDER_STATUS_CHANGED',
        'orders',
        orderId,
        { before: { status: oldStatus }, after: { status } },
        req.ip,
        req.get('user-agent')
      );

      // Send SMS notification if order is shipped or delivered
      if (status === 'shipped' || status === 'delivered') {
        if (order.userId.phone) {
          await notificationService.sendOrderSMS(
            order.userId.phone,
            order.orderNumber
          );
        }
      }

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update order status',
        error: error.message,
      });
    }
  }

  // Update order details
  async updateOrder(req, res) {
    try {
      const { orderId } = req.params;
      const updates = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Store old values for audit
      const oldValues = JSON.parse(JSON.stringify(order));

      // Update allowed fields
      if (updates.shippingAddress) order.shippingAddress = updates.shippingAddress;
      if (updates.status) order.status = updates.status;

      await order.save();

      // Log action
      await adminAuditService.logAction(
        req.userId,
        req.user.email,
        'ORDER_UPDATED',
        'orders',
        orderId,
        { before: oldValues, after: updates },
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        data: order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update order',
        error: error.message,
      });
    }
  }

  // Cancel order
  async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;

      const order = await Order.findById(orderId).populate('userId');
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      if (order.status === 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel delivered orders',
        });
      }

      const oldStatus = order.status;
      order.status = 'cancelled';
      await order.save();

      // Log action
      await adminAuditService.logAction(
        req.userId,
        req.user.email,
        'ORDER_CANCELLED',
        'orders',
        orderId,
        { before: { status: oldStatus }, after: { status: 'cancelled' } },
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to cancel order',
        error: error.message,
      });
    }
  }

  // Delete order
  async deleteOrder(req, res) {
    try {
      const { orderId } = req.params;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      await order.remove();

      // Log action
      await adminAuditService.logAction(
        req.userId,
        req.user.email,
        'ORDER_DELETED',
        'orders',
        orderId,
        { before: order },
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete order',
        error: error.message,
      });
    }
  }

  // Get order statistics
  async getOrderStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const totalOrders = await Order.countDocuments(query);
      const pendingOrders = await Order.countDocuments({ ...query, status: 'pending' });
      const confirmedOrders = await Order.countDocuments({ ...query, status: 'confirmed' });
      const processingOrders = await Order.countDocuments({ ...query, status: 'processing' });
      const shippedOrders = await Order.countDocuments({ ...query, status: 'shipped' });
      const deliveredOrders = await Order.countDocuments({ ...query, status: 'delivered' });
      const cancelledOrders = await Order.countDocuments({ ...query, status: 'cancelled' });

      // Total revenue
      const revenueData = await Order.aggregate([
        { $match: { ...query, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]);

      const totalRevenue = revenueData[0]?.totalRevenue || 0;

      // Orders by payment method
      const paymentMethodStats = await Order.aggregate([
        { $match: query },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
      ]);

      // Daily sales trend (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailySales = await Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalOrders,
          statusBreakdown: {
            pending: pendingOrders,
            confirmed: confirmedOrders,
            processing: processingOrders,
            shipped: shippedOrders,
            delivered: deliveredOrders,
            cancelled: cancelledOrders,
          },
          totalRevenue,
          paymentMethodStats,
          dailySales,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order statistics',
        error: error.message,
      });
    }
  }

  // Process return/exchange request (approve or reject)
  async processReturnExchange(req, res) {
    try {
      const { orderId } = req.params;
      const { action, adminNotes } = req.body;

      if (!['approved', 'rejected'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be "approved" or "rejected"',
        });
      }

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      if (!order.returnExchange || !order.returnExchange.status) {
        return res.status(400).json({
          success: false,
          message: 'No return/exchange request found for this order',
        });
      }

      if (order.returnExchange.status !== 'requested') {
        return res.status(400).json({
          success: false,
          message: 'This request has already been processed',
        });
      }

      order.returnExchange.status = action;
      order.returnExchange.processedAt = new Date();
      order.returnExchange.processedBy = req.user._id;
      if (adminNotes) {
        order.returnExchange.adminNotes = adminNotes;
      }

      await order.save();

      // Log audit trail
      await adminAuditService.log({
        action: 'RETURN_EXCHANGE_PROCESSED',
        resource: 'Order',
        resourceId: orderId,
        userId: req.user._id,
        details: {
          orderNumber: order.orderNumber,
          action,
          type: order.returnExchange.type,
          adminNotes,
        },
      });

      // Notify customer
      if (order.userId) {
        await notificationService.sendReturnExchangeUpdate(
          order.userId,
          order.orderNumber,
          order.returnExchange.type,
          action
        );
      }

      res.status(200).json({
        success: true,
        message: `Return/Exchange request ${action} successfully`,
        data: order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to process return/exchange request',
        error: error.message,
      });
    }
  }
}

module.exports = new AdminOrderController();
