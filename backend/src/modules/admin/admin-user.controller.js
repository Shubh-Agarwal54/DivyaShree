const User = require('../user/user.model');
const Order = require('../order/order.model');
const adminAuditService = require('./admin-audit.service');

class AdminUserController {
  // Get all users with pagination, search, and filters
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        role = '',
        isBlocked = '',
        isVerified = '',
        sortBy = 'createdAt',
        order = 'desc',
      } = req.query;

      const query = {};

      // Search by name or email
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      // Filter by role
      if (role) query.role = role;

      // Filter by blocked status
      if (isBlocked !== '') query.isBlocked = isBlocked === 'true';

      // Filter by verification status
      if (isVerified === 'email') query.isEmailVerified = true;
      if (isVerified === 'phone') query.isPhoneVerified = true;
      if (isVerified === 'both') {
        query.isEmailVerified = true;
        query.isPhoneVerified = true;
      }

      const skip = (page - 1) * limit;
      const sortOrder = order === 'asc' ? 1 : -1;

      const users = await User.find(query)
        .select('-password -emailOTP -phoneOTP -resetPasswordToken')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      });
    }
  }

  // Get single user details
  async getUserDetails(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId)
        .select('-password -emailOTP -phoneOTP -resetPasswordToken')
        .populate('wishlist');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Get user's order count and total spent
      const orderStats = await Order.aggregate([
        { $match: { userId: user._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
          },
        },
      ]);

      const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 };

      res.status(200).json({
        success: true,
        data: {
          user,
          stats,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user details',
        error: error.message,
      });
    }
  }

  // Update user details
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Store old values for audit
      const oldValues = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      };

      // Prevent password updates through this endpoint
      delete updates.password;
      delete updates.emailOTP;
      delete updates.phoneOTP;

      Object.assign(user, updates);
      await user.save();

      // Log action
      await adminAuditService.logAction(
        req.userId,
        req.user.email,
        'USER_UPDATED',
        'users',
        userId,
        { before: oldValues, after: updates },
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message,
      });
    }
  }

  // Block/Unblock user
  async toggleBlockUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Prevent blocking admins
      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot block admin users',
        });
      }

      const oldStatus = user.isBlocked;
      user.isBlocked = !user.isBlocked;
      await user.save();

      // Log action
      await adminAuditService.logAction(
        req.userId,
        req.user.email,
        user.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
        'users',
        userId,
        { before: { isBlocked: oldStatus }, after: { isBlocked: user.isBlocked } },
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
        error: error.message,
      });
    }
  }

  // Manually verify user email/phone
  async verifyUser(req, res) {
    try {
      const { userId } = req.params;
      const { verificationType } = req.body; // 'email' or 'phone'

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (verificationType === 'email') {
        user.isEmailVerified = true;
        user.emailOTP = undefined;
      } else if (verificationType === 'phone') {
        user.isPhoneVerified = true;
        user.phoneOTP = undefined;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification type',
        });
      }

      await user.save();

      // Log action
      await adminAuditService.logAction(
        req.userId,
        req.user.email,
        'USER_UPDATED',
        'users',
        userId,
        { after: { [`is${verificationType === 'email' ? 'Email' : 'Phone'}Verified`]: true } },
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        message: `User ${verificationType} verified successfully`,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to verify user',
        error: error.message,
      });
    }
  }

  // Delete user (soft delete - block instead)
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Prevent deleting admins
      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete admin users',
        });
      }

      // Soft delete by blocking
      user.isBlocked = true;
      await user.save();

      // Log action
      await adminAuditService.logAction(
        req.userId,
        req.user.email,
        'USER_DELETED',
        'users',
        userId,
        { before: { isBlocked: false }, after: { isBlocked: true } },
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message,
      });
    }
  }

  // Get user's orders
  async getUserOrders(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (page - 1) * limit;

      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Order.countDocuments({ userId });

      res.status(200).json({
        success: true,
        data: {
          orders,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user orders',
        error: error.message,
      });
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isBlocked: false });
      const blockedUsers = await User.countDocuments({ isBlocked: true });
      const verifiedUsers = await User.countDocuments({
        isEmailVerified: true,
        isPhoneVerified: true,
      });
      const admins = await User.countDocuments({ role: 'admin' });

      // Users registered in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newUsers = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          blockedUsers,
          verifiedUsers,
          admins,
          newUsers,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics',
        error: error.message,
      });
    }
  }
}

module.exports = new AdminUserController();
