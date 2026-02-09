const orderService = require('./order.service');

class OrderController {
  // Create new order
  async createOrder(req, res) {
    try {
      const orderData = req.body;

      // Validation
      const requiredFields = ['items', 'shippingAddress', 'paymentMethod', 'subtotal', 'total'];
      const missingFields = requiredFields.filter(field => !orderData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      // Validate items array
      if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Order must contain at least one item',
        });
      }

      // Validate shipping address
      const addressFields = ['name', 'address', 'city', 'state', 'pincode', 'phone'];
      const missingAddressFields = addressFields.filter(
        field => !orderData.shippingAddress[field]
      );

      if (missingAddressFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing shipping address fields: ${missingAddressFields.join(', ')}`,
        });
      }

      const result = await orderService.createOrder(req.userId, orderData);

      res.status(201).json(result);
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create order',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }

  // Get user orders
  async getUserOrders(req, res) {
    try {
      const result = await orderService.getUserOrders(req.userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message,
      });
    }
  }

  // Get single order
  async getOrderById(req, res) {
    try {
      const { orderId } = req.params;

      const result = await orderService.getOrderById(orderId, req.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch order',
        error: error.message,
      });
    }
  }

  // Track order by order number
  async trackOrder(req, res) {
    try {
      const { orderNumber } = req.params;

      const result = await orderService.getOrderByNumber(orderNumber, req.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to track order',
        error: error.message,
      });
    }
  }

  // Cancel order
  async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;

      const result = await orderService.cancelOrder(orderId, req.userId, reason);

      res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('cannot be cancelled')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to cancel order',
        error: error.message,
      });
    }
  }

  // Request return or exchange
  async requestReturnExchange(req, res) {
    try {
      const { orderId } = req.params;
      const { type, reason } = req.body;

      if (!type || !['return', 'exchange'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid type. Must be "return" or "exchange"',
        });
      }

      if (!reason || reason.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Reason is required',
        });
      }

      const result = await orderService.requestReturnExchange(orderId, req.userId, type, reason);

      res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('can only') || error.message.includes('already exists') || error.message.includes('expired')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to request return/exchange',
        error: error.message,
      });
    }
  }

  // Admin: Get all orders
  async getAllOrders(req, res) {
    try {
      const result = await orderService.getAllOrders();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message,
      });
    }
  }

  // Admin: Update order status
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required',
        });
      }

      const result = await orderService.updateOrderStatus(orderId, status, req.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update order status',
        error: error.message,
      });
    }
  }

  // Admin: Process return/exchange request
  async processReturnExchange(req, res) {
    try {
      const { orderId } = req.params;
      const { action, adminNotes } = req.body;

      if (!action || !['approved', 'rejected'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be "approved" or "rejected"',
        });
      }

      const result = await orderService.processReturnExchange(orderId, action, req.userId, adminNotes);

      res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('No return') || error.message.includes('already been processed')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to process return/exchange request',
        error: error.message,
      });
    }
  }
}

module.exports = new OrderController();
