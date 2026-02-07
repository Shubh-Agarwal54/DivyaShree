const RolePermission = require('./role-permission.model');
const User = require('../user/user.model');

// Get all role permissions
exports.getAllRolePermissions = async (req, res) => {
  try {
    const roles = await RolePermission.find()
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ roleName: 1 });

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role permissions',
      error: error.message,
    });
  }
};

// Get single role permission
exports.getRolePermission = async (req, res) => {
  try {
    const { roleName } = req.params;
    
    const role = await RolePermission.findOne({ roleName })
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role permission not found',
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role permission',
      error: error.message,
    });
  }
};

// Update role permissions
exports.updateRolePermission = async (req, res) => {
  try {
    const { roleName } = req.params;
    const { permissions, description } = req.body;

    // Prevent editing superadmin by non-superadmin
    if (roleName === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can modify superadmin permissions',
      });
    }

    const role = await RolePermission.findOne({ roleName });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role permission not found',
      });
    }

    // Update permissions
    if (permissions) {
      role.permissions = { ...role.permissions, ...permissions };
    }
    
    if (description) {
      role.description = description;
    }
    
    role.updatedBy = req.user._id;
    await role.save();

    // Log audit trail
    const adminAuditService = require('./admin-audit.service');
    await adminAuditService.log({
      userId: req.user._id,
      action: 'UPDATE',
      resource: 'RolePermission',
      resourceId: role._id,
      changes: { permissions, description },
    });

    res.status(200).json({
      success: true,
      message: 'Role permissions updated successfully',
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update role permissions',
      error: error.message,
    });
  }
};

// Get current user's permissions
exports.getMyPermissions = async (req, res) => {
  try {
    const role = await RolePermission.findOne({ roleName: req.user.role });
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role permissions not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        role: req.user.role,
        permissions: role.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions',
      error: error.message,
    });
  }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { roleName } = req.params;
    
    const users = await User.find({ role: roleName, isBlocked: false })
      .select('firstName lastName email phone isEmailVerified createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        role: roleName,
        count: users.length,
        users,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users by role',
      error: error.message,
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'admin', 'subadmin', 'masteradmin', 'superadmin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    // Only superadmin can assign superadmin role
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can assign superadmin role',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Log audit trail
    const adminAuditService = require('./admin-audit.service');
    await adminAuditService.log({
      userId: req.user._id,
      action: 'UPDATE_ROLE',
      resource: 'User',
      resourceId: userId,
      changes: {
        field: 'role',
        oldValue: oldRole,
        newValue: role,
      },
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        userId: user._id,
        email: user.email,
        oldRole,
        newRole: role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message,
    });
  }
};

// Initialize default permissions
exports.initializeDefaultPermissions = async (req, res) => {
  try {
    await RolePermission.createDefaultPermissions();

    res.status(200).json({
      success: true,
      message: 'Default permissions initialized successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to initialize default permissions',
      error: error.message,
    });
  }
};
