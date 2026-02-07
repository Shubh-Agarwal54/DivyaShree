const AuditLog = require('./admin-audit.model');

class AdminAuditService {
  // Log admin action (simplified interface)
  async log(options) {
    try {
      const { userId, action, resource, resourceId, changes, ipAddress, userAgent } = options;
      
      // Get user email if not provided
      let adminEmail = options.adminEmail;
      if (!adminEmail && userId) {
        const User = require('../user/user.model');
        const user = await User.findById(userId).select('email');
        adminEmail = user?.email;
      }
      
      return await this.logAction(
        userId,
        adminEmail,
        action,
        resource,
        resourceId,
        changes,
        ipAddress,
        userAgent
      );
    } catch (error) {
      console.error('Failed to log admin action:', error);
      // Don't throw error - logging failure shouldn't break the operation
    }
  }

  // Log admin action (full interface)
  async logAction(adminId, adminEmail, action, resource, resourceId, changes, ipAddress, userAgent) {
    try {
      const log = new AuditLog({
        adminId,
        adminEmail,
        action,
        resource,
        resourceId,
        changes,
        ipAddress,
        userAgent,
      });
      
      await log.save();
      return log;
    } catch (error) {
      console.error('Failed to log admin action:', error);
      // Don't throw error - logging failure shouldn't break the operation
    }
  }

  // Get audit logs with pagination and filters
  async getLogs(filters = {}, page = 1, limit = 50) {
    try {
      const query = {};
      
      if (filters.adminId) query.adminId = filters.adminId;
      if (filters.resource) query.resource = filters.resource;
      if (filters.action) query.action = filters.action;
      if (filters.resourceId) query.resourceId = filters.resourceId;
      
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
        if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
      }

      const skip = (page - 1) * limit;
      
      const logs = await AuditLog.find(query)
        .populate('adminId', 'firstName lastName email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);
        
      const total = await AuditLog.countDocuments(query);
      
      return {
        success: true,
        data: {
          logs,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch audit logs',
        error: error.message,
      };
    }
  }

  // Get resource-specific audit trail
  async getResourceAuditTrail(resource, resourceId) {
    try {
      const logs = await AuditLog.find({ resource, resourceId })
        .populate('adminId', 'firstName lastName email')
        .sort({ timestamp: -1 });
        
      return {
        success: true,
        data: logs,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch audit trail',
        error: error.message,
      };
    }
  }
}

module.exports = new AdminAuditService();
