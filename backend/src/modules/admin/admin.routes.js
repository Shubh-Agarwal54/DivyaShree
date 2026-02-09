const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const { isAdminRole, checkPermission, isSuperAdmin } = require('../../middlewares/permission.middleware');

// Controllers
const adminUserController = require('./admin-user.controller');
const adminOrderController = require('./admin-order.controller');
const adminProductController = require('./admin-product.controller');
const adminDashboardController = require('./admin-dashboard.controller');
const inventoryController = require('./inventory.controller');
const rolePermissionController = require('./role-permission.controller');
const adminAuditService = require('./admin-audit.service');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(isAdminRole);

// Dashboard Routes
router.get('/dashboard', checkPermission('dashboard', 'view'), adminDashboardController.getDashboard);
router.get('/analytics', checkPermission('analytics', 'view'), adminDashboardController.getAnalytics);

// User Management Routes
router.get('/users', checkPermission('users', 'view'), adminUserController.getAllUsers);
router.get('/users/stats', checkPermission('users', 'view'), adminUserController.getUserStats);
router.get('/users/:userId', checkPermission('users', 'view'), adminUserController.getUserDetails);
router.put('/users/:userId', checkPermission('users', 'edit'), adminUserController.updateUser);
router.patch('/users/:userId/block', checkPermission('users', 'block'), adminUserController.toggleBlockUser);
router.patch('/users/:userId/verify', checkPermission('users', 'edit'), adminUserController.verifyUser);
router.delete('/users/:userId', checkPermission('users', 'delete'), adminUserController.deleteUser);
router.get('/users/:userId/orders', checkPermission('users', 'view'), adminUserController.getUserOrders);

// Order Management Routes
router.get('/orders', checkPermission('orders', 'view'), adminOrderController.getAllOrders);
router.get('/orders/stats', checkPermission('orders', 'view'), adminOrderController.getOrderStats);
router.get('/orders/:orderId', checkPermission('orders', 'view'), adminOrderController.getOrderDetails);
router.put('/orders/:orderId', checkPermission('orders', 'edit'), adminOrderController.updateOrder);
router.patch('/orders/:orderId/status', checkPermission('orders', 'updateStatus'), adminOrderController.updateOrderStatus);
router.patch('/orders/:orderId/cancel', checkPermission('orders', 'cancel'), adminOrderController.cancelOrder);
router.patch('/orders/:orderId/return-exchange', checkPermission('orders', 'edit'), adminOrderController.processReturnExchange);
router.delete('/orders/:orderId', checkPermission('orders', 'delete'), adminOrderController.deleteOrder);

// Product Management Routes
router.get('/products', checkPermission('products', 'view'), adminProductController.getAllProducts);
router.get('/products/stats', checkPermission('products', 'view'), adminProductController.getProductStats);
router.post('/products', checkPermission('products', 'create'), adminProductController.createProduct);
router.get('/products/:productId', checkPermission('products', 'view'), adminProductController.getProduct);
router.put('/products/:productId', checkPermission('products', 'edit'), adminProductController.updateProduct);
router.patch('/products/:productId/stock', checkPermission('products', 'updateStock'), adminProductController.updateStock);
router.delete('/products/:productId', checkPermission('products', 'delete'), adminProductController.deleteProduct);

// Inventory Management Routes
router.get('/inventory', checkPermission('inventory', 'view'), inventoryController.getInventoryOverview);
router.get('/inventory/alerts', checkPermission('inventory', 'view'), inventoryController.getLowStockAlerts);
router.patch('/inventory/:productId/stock', checkPermission('inventory', 'manage'), inventoryController.updateStockQuantity);
router.post('/inventory/bulk-update', checkPermission('inventory', 'manage'), inventoryController.bulkUpdateStock);
router.get('/inventory/:productId/history', checkPermission('inventory', 'view'), inventoryController.getInventoryHistory);

// Role Permission Management Routes
router.get('/permissions/my', rolePermissionController.getMyPermissions);
router.get('/permissions', checkPermission('rolePermissions', 'view'), rolePermissionController.getAllRolePermissions);
router.get('/permissions/:roleName', checkPermission('rolePermissions', 'view'), rolePermissionController.getRolePermission);
router.put('/permissions/:roleName', checkPermission('rolePermissions', 'manage'), rolePermissionController.updateRolePermission);
router.get('/permissions/:roleName/users', checkPermission('rolePermissions', 'view'), rolePermissionController.getUsersByRole);
router.patch('/permissions/user/:userId/role', checkPermission('rolePermissions', 'manage'), rolePermissionController.updateUserRole);
router.post('/permissions/initialize', isSuperAdmin, rolePermissionController.initializeDefaultPermissions);

// Audit Logs Routes
router.get('/audit-logs', checkPermission('settings', 'view'), async (req, res) => {
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
