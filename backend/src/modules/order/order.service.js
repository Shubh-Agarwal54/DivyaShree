const Order = require('./order.model');

class OrderService {
  // Create new order
  async createOrder(userId, orderData) {
    try {
      const order = new Order({
        userId,
        ...orderData,
      });

      await order.save();

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
  async cancelOrder(orderId, userId) {
    try {
      const order = await Order.findOne({
        _id: orderId,
        userId: userId,
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if order can be cancelled
      if (order.status === 'delivered' || order.status === 'cancelled') {
        throw new Error(`Order cannot be cancelled as it is already ${order.status}`);
      }

      order.status = 'cancelled';
      await order.save();

      return {
        success: true,
        message: 'Order cancelled successfully',
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
  async updateOrderStatus(orderId, status) {
    try {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

      if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status');
      }

      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );

      if (!order) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        message: 'Order status updated successfully',
        data: order,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderService();
