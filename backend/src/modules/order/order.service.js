const Order = require('./order.model');
const Product = require('../product/product.model');

class OrderService {
  // Create new order
  async createOrder(userId, orderData) {
    try {
      // Generate unique order number
      const timestamp = Date.now().toString().slice(-8);
      const orderNumber = `DS${timestamp}`;

      const order = new Order({
        userId,
        orderNumber,
        ...orderData,
      });

      await order.save();

      // Update product soldCount and stockQuantity
      if (orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          try {
            const product = await Product.findById(item.productId);
            if (product) {
              product.soldCount = (product.soldCount || 0) + (item.quantity || 0);
              product.stockQuantity = Math.max(0, (product.stockQuantity || 0) - (item.quantity || 0));
              product.inStock = product.stockQuantity > 0;
              await product.save();
            }
          } catch (productError) {
            console.error(`Failed to update product ${item.productId}:`, productError.message);
          }
        }
      }

      return {
        success: true,
        message: 'Order placed successfully',
        data: order,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user orders
  async getUserOrders(userId) {
    try {
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: orders,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get single order
  async getOrderById(orderId, userId) {
    try {
      const order = await Order.findOne({
        _id: orderId,
        userId: userId,
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get order by order number
  async getOrderByNumber(orderNumber, userId) {
    try {
      const order = await Order.findOne({
        orderNumber,
        userId,
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId, userId, reason = '') {
    try {
      const order = await Order.findOne({
        _id: orderId,
        userId: userId,
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if order can be cancelled (not processing, shipped, or delivered)
      if (['processing', 'shipped', 'delivered', 'cancelled'].includes(order.status)) {
        throw new Error(`Order cannot be cancelled as it is already ${order.status}`);
      }

      order.status = 'cancelled';
      order.cancellation = {
        reason: reason || 'Cancelled by user',
        cancelledAt: new Date(),
        cancelledBy: 'user',
      };
      await order.save();

      // Restore product stock
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          try {
            const product = await Product.findById(item.productId);
            if (product) {
              product.soldCount = Math.max(0, (product.soldCount || 0) - (item.quantity || 0));
              product.stockQuantity = (product.stockQuantity || 0) + (item.quantity || 0);
              product.inStock = product.stockQuantity > 0;
              await product.save();
            }
          } catch (productError) {
            console.error(`Failed to restore product ${item.productId}:`, productError.message);
          }
        }
      }

      return {
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      };
    } catch (error) {
      throw error;
    }
  }

  // Request return or exchange
  async requestReturnExchange(orderId, userId, type, reason) {
    try {
      const order = await Order.findOne({
        _id: orderId,
        userId: userId,
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if order is delivered
      if (order.status !== 'delivered') {
        throw new Error('Return/Exchange can only be requested for delivered orders');
      }

      // Check if already has a return/exchange request
      if (order.returnExchange && order.returnExchange.status) {
        throw new Error('A return/exchange request already exists for this order');
      }

      // Check 1-day eligibility (24 hours from delivery)
      // Use deliveredAt if available, otherwise use updatedAt as fallback
      const deliveryDate = order.deliveredAt || order.updatedAt;
      const daysSinceDelivery = (new Date() - new Date(deliveryDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceDelivery > 1) {
        throw new Error('Return/Exchange window has expired. Requests must be made within 1 day of delivery.');
      }

      order.returnExchange = {
        type,
        reason,
        status: 'requested',
        requestedAt: new Date(),
      };

      await order.save();

      return {
        success: true,
        message: `${type === 'return' ? 'Return' : 'Exchange'} request submitted successfully`,
        data: order,
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get all orders
  async getAllOrders() {
    try {
      const orders = await Order.find()
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: orders,
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Update order status
  async updateOrderStatus(orderId, status, adminId) {
    try {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

      if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status');
      }

      const order = await Order.findById(orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      order.status = status;

      // Set deliveredAt timestamp when status changes to delivered
      if (status === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }

      // If admin cancels, record it
      if (status === 'cancelled' && !order.cancellation) {
        order.cancellation = {
          reason: 'Cancelled by admin',
          cancelledAt: new Date(),
          cancelledBy: 'admin',
        };
      }

      await order.save();

      return {
        success: true,
        message: 'Order status updated successfully',
        data: order,
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Process return/exchange request
  async processReturnExchange(orderId, action, adminId, adminNotes = '') {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      if (!order.returnExchange || !order.returnExchange.status) {
        throw new Error('No return/exchange request found for this order');
      }

      if (order.returnExchange.status !== 'requested') {
        throw new Error('Return/exchange request has already been processed');
      }

      order.returnExchange.status = action; // 'approved' or 'rejected'
      order.returnExchange.processedAt = new Date();
      order.returnExchange.processedBy = adminId;
      order.returnExchange.adminNotes = adminNotes;

      await order.save();

      return {
        success: true,
        message: `Return/Exchange request ${action} successfully`,
        data: order,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderService();
