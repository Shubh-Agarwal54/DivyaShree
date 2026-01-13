const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adminEmail: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_CREATED', 'USER_UPDATED', 'USER_BLOCKED', 'USER_UNBLOCKED', 'USER_DELETED', 'USER_ROLE_CHANGED',
      'ORDER_CREATED', 'ORDER_UPDATED', 'ORDER_STATUS_CHANGED', 'ORDER_CANCELLED', 'ORDER_DELETED',
      'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED', 'PRODUCT_STOCK_UPDATED',
      'SETTINGS_UPDATED', 'ADMIN_CREATED', 'ADMIN_UPDATED', 'ADMIN_DELETED',
    ],
  },
  resource: {
    type: String,
    required: true,
    enum: ['users', 'orders', 'products', 'settings', 'admins'],
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false, // We use custom timestamp field
});

// Index for fast queries
auditLogSchema.index({ adminId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
