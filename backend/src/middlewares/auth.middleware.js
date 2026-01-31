const jwt = require('jsonwebtoken');
const User = require('../modules/user/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'divyashree_secret_key_2025');

    // Check if user exists and is not blocked
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.',
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed.',
      error: error.message,
    });
  }
};

// Optional authentication - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // No token, continue without user
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'divyashree_secret_key_2025');

    // Check if user exists
    const user = await User.findById(decoded.userId).select('-password');

    if (user && !user.isBlocked) {
      // Attach user to request if found and not blocked
      req.user = user;
      req.userId = user._id;
    }

    next();
  } catch (error) {
    // Ignore token errors and continue without user
    next();
  }
};

module.exports = authMiddleware;
module.exports.required = authMiddleware;
module.exports.optional = optionalAuth;
