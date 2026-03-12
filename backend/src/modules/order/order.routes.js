const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const paymentController = require('./payment.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// ── Payment routes ─────────────────────────────────────────────────────────────
// Create a Razorpay order (must be authenticated)
router.post('/payment/razorpay/create-order', authMiddleware, paymentController.createRazorpayOrder.bind(paymentController));
// Verify payment signature & save order
router.post('/payment/razorpay/verify', authMiddleware, paymentController.verifyPaymentAndCreateOrder.bind(paymentController));
// Log payment failure (no sensitive side effects)
router.post('/payment/razorpay/failure', authMiddleware, paymentController.handlePaymentFailure.bind(paymentController));

// ── User order routes ──────────────────────────────────────────────────────────
router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getUserOrders);
router.get('/:orderId', authMiddleware, orderController.getOrderById);
router.get('/track/:orderNumber', orderController.trackOrder);
router.patch('/:orderId/cancel', authMiddleware, orderController.cancelOrder);
router.post('/:orderId/return-exchange', authMiddleware, orderController.requestReturnExchange);

// Admin routes (protected + admin role)
router.get('/admin/all', authMiddleware, roleMiddleware('admin'), orderController.getAllOrders);
router.patch('/admin/:orderId/status', authMiddleware, roleMiddleware('admin'), orderController.updateOrderStatus);
router.patch('/admin/:orderId/return-exchange', authMiddleware, roleMiddleware('admin'), orderController.processReturnExchange);

module.exports = router;
