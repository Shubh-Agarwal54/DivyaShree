const mongoose = require('mongoose');

const rolePermissionSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true,
    enum: ['superadmin', 'masteradmin', 'subadmin', 'admin'],
  },
  permissions: {
    dashboard: {
      view: { type: Boolean, default: true },
    },
    users: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      block: { type: Boolean, default: false },
    },
    orders: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      updateStatus: { type: Boolean, default: false },
      cancel: { type: Boolean, default: false },
    },
    products: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      updateStock: { type: Boolean, default: false },
    },
    inventory: {
      view: { type: Boolean, default: false },
      manage: { type: Boolean, default: false },
      lowStockAlerts: { type: Boolean, default: false },
    },
    analytics: {
      view: { type: Boolean, default: false },
    },
    settings: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
    },
    rolePermissions: {
      view: { type: Boolean, default: false },
      manage: { type: Boolean, default: false },
    },
  },
  description: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Default permissions for superadmin
rolePermissionSchema.statics.createDefaultPermissions = async function() {
  const defaults = [
    {
      roleName: 'superadmin',
      description: 'Super Admin with full access to all features',
      permissions: {
        dashboard: { view: true },
        users: { view: true, create: true, edit: true, delete: true, block: true },
        orders: { view: true, create: true, edit: true, delete: true, updateStatus: true, cancel: true },
        products: { view: true, create: true, edit: true, delete: true, updateStock: true },
        inventory: { view: true, manage: true, lowStockAlerts: true },
        analytics: { view: true },
        settings: { view: true, edit: true },
        rolePermissions: { view: true, manage: true },
      },
    },
    {
      roleName: 'masteradmin',
      description: 'Master Admin with access to most features',
      permissions: {
        dashboard: { view: true },
        users: { view: true, create: true, edit: true, delete: false, block: true },
        orders: { view: true, create: true, edit: true, delete: false, updateStatus: true, cancel: true },
        products: { view: true, create: true, edit: true, delete: true, updateStock: true },
        inventory: { view: true, manage: true, lowStockAlerts: true },
        analytics: { view: true },
        settings: { view: true, edit: false },
        rolePermissions: { view: true, manage: false },
      },
    },
    {
      roleName: 'subadmin',
      description: 'Sub Admin with limited access',
      permissions: {
        dashboard: { view: true },
        users: { view: true, create: false, edit: false, delete: false, block: false },
        orders: { view: true, create: false, edit: true, delete: false, updateStatus: true, cancel: false },
        products: { view: true, create: true, edit: true, delete: false, updateStock: true },
        inventory: { view: true, manage: false, lowStockAlerts: true },
        analytics: { view: false },
        settings: { view: false, edit: false },
        rolePermissions: { view: false, manage: false },
      },
    },
    {
      roleName: 'admin',
      description: 'Basic Admin with view and edit access',
      permissions: {
        dashboard: { view: true },
        users: { view: true, create: false, edit: false, delete: false, block: false },
        orders: { view: true, create: false, edit: true, delete: false, updateStatus: true, cancel: false },
        products: { view: true, create: false, edit: true, delete: false, updateStock: true },
        inventory: { view: true, manage: false, lowStockAlerts: false },
        analytics: { view: false },
        settings: { view: false, edit: false },
        rolePermissions: { view: false, manage: false },
      },
    },
  ];

  for (const roleData of defaults) {
    await this.findOneAndUpdate(
      { roleName: roleData.roleName },
      roleData,
      { upsert: true, new: true }
    );
  }
};

module.exports = mongoose.model('RolePermission', rolePermissionSchema);
