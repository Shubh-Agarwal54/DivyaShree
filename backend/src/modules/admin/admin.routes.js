const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// Controllers
const adminUserController = require('./admin-user.controller');
const adminOrderController = require('./admin-order.controller');
const adminProductController = require('./admin-product.controller');
const adminDashboardController = require('./admin-dashboard.controller');
const adminAuditService = require('./admin-audit.service');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// Dashboard Routes
router.get('/dashboard', adminDashboardController.getDashboard);
router.get('/analytics', adminDashboardController.getAnalytics);

// User Management Routes
router.get('/users', adminUserController.getAllUsers);
router.get('/users/stats', adminUserController.getUserStats);
router.get('/users/:userId', adminUserController.getUserDetails);
router.put('/users/:userId', adminUserController.updateUser);
router.patch('/users/:userId/block', adminUserController.toggleBlockUser);
router.patch('/users/:userId/verify', adminUserController.verifyUser);
router.delete('/users/:userId', adminUserController.deleteUser);
router.get('/users/:userId/orders', adminUserController.getUserOrders);

// Order Management Routes
router.get('/orders', adminOrderController.getAllOrders);
router.get('/orders/stats', adminOrderController.getOrderStats);
router.get('/orders/:orderId', adminOrderController.getOrderDetails);
router.put('/orders/:orderId', adminOrderController.updateOrder);
router.patch('/orders/:orderId/status', adminOrderController.updateOrderStatus);
router.patch('/orders/:orderId/cancel', adminOrderController.cancelOrder);
router.delete('/orders/:orderId', adminOrderController.deleteOrder);

// Product Management Routes
router.get('/products', adminProductController.getAllProducts);
router.get('/products/stats', adminProductController.getProductStats);
router.post('/products', adminProductController.createProduct);
router.get('/products/:productId', adminProductController.getProduct);
router.put('/products/:productId', adminProductController.updateProduct);
router.patch('/products/:productId/stock', adminProductController.updateStock);
router.delete('/products/:productId', adminProductController.deleteProduct);

// Audit Logs Routes
router.get('/audit-logs', async (req, res) => {
  try {
    const { page, limit, ...filters } = req.query;
    const result = await adminAuditService.getLogs(filters, page, limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message,
    });
  }
});

router.get('/audit-logs/:resource/:resourceId', async (req, res) => {
  try {
    const { resource, resourceId } = req.params;
    const result = await adminAuditService.getResourceAuditTrail(resource, resourceId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit trail',
      error: error.message,
    });
  }
});

module.exports = router;
