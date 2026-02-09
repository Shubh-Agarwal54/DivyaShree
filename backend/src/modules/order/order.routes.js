const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// User routes (protected)
router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getUserOrders);
router.get('/:orderId', authMiddleware, orderController.getOrderById);
router.get('/track/:orderNumber', authMiddleware, orderController.trackOrder);
router.patch('/:orderId/cancel', authMiddleware, orderController.cancelOrder);
router.post('/:orderId/return-exchange', authMiddleware, orderController.requestReturnExchange);

// Admin routes (protected + admin role)
router.get('/admin/all', authMiddleware, roleMiddleware('admin'), orderController.getAllOrders);
router.patch('/admin/:orderId/status', authMiddleware, roleMiddleware('admin'), orderController.updateOrderStatus);
router.patch('/admin/:orderId/return-exchange', authMiddleware, roleMiddleware('admin'), orderController.processReturnExchange);

module.exports = router;
