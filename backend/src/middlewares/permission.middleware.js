const RolePermission = require('../modules/admin/role-permission.model');

// Check if user has specific permission
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Superadmin always has access
      if (req.user.role === 'superadmin') {
        return next();
      }

      // Get role permissions
      const rolePermission = await RolePermission.findOne({ roleName: req.user.role });
      
      if (!rolePermission) {
        return res.status(403).json({
          success: false,
          message: 'Role permissions not configured',
        });
      }

      // Check if permission exists and is granted
      const hasPermission = rolePermission.permissions?.[resource]?.[action];
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have permission to ${action} ${resource}`,
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: error.message,
      });
    }
  };
};

// Check if user has any admin role
const isAdminRole = (req, res, next) => {
  const adminRoles = ['admin', 'subadmin', 'masteradmin', 'superadmin'];
  
  if (!req.user || !adminRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.',
    });
  }
  
  next();
};

// Check if user is superadmin
const isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin role required.',
    });
  }
  
  next();
};

module.exports = {
  checkPermission,
  isAdminRole,
  isSuperAdmin,
};
