const userService = require('./user.service');

class UserController {
  // Register new user
  async register(req, res) {
    try {
      const { firstName, lastName, email, password, phone } = req.body;

      // Validation
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, email, and password are required',
        });
      }

      const result = await userService.register({
        firstName,
        lastName,
        email,
        password,
        phone,
      });

      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'Email already registered') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message,
      });
    }
  }

  // Verify Email OTP
  async verifyEmailOTP(req, res) {
    try {
      const { userId, otp } = req.body;

      if (!userId || !otp) {
        return res.status(400).json({
          success: false,
          message: 'User ID and OTP are required',
        });
      }

      const result = await userService.verifyEmailOTP(userId, otp);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Verify Phone OTP
  async verifyPhoneOTP(req, res) {
    try {
      const { userId, otp } = req.body;

      if (!userId || !otp) {
        return res.status(400).json({
          success: false,
          message: 'User ID and OTP are required',
        });
      }

      const result = await userService.verifyPhoneOTP(userId, otp);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Resend Email OTP
  async resendEmailOTP(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const result = await userService.resendEmailOTP(userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Resend Phone OTP
  async resendPhoneOTP(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const result = await userService.resendPhoneOTP(userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      const result = await userService.login(email, password);

      res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('Invalid') || error.message.includes('blocked')) {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message,
      });
    }
  }

  // Forgot Password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const result = await userService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Reset Password
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token and new password are required',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }

      const result = await userService.resetPassword(token, newPassword);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const result = await userService.getProfile(req.userId);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: error.message,
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const updates = req.body;

      const result = await userService.updateProfile(req.userId, updates);

      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message,
      });
    }
  }

  // Add address
  async addAddress(req, res) {
    try {
      const addressData = req.body;

      // Validation
      const requiredFields = ['type', 'name', 'address', 'city', 'state', 'pincode', 'phone'];
      const missingFields = requiredFields.filter(field => !addressData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      const result = await userService.addAddress(req.userId, addressData);

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add address',
        error: error.message,
      });
    }
  }

  // Update address
  async updateAddress(req, res) {
    try {
      const { addressId } = req.params;
      const updates = req.body;

      const result = await userService.updateAddress(req.userId, addressId, updates);

      res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update address',
        error: error.message,
      });
    }
  }

  // Delete address
  async deleteAddress(req, res) {
    try {
      const { addressId } = req.params;

      const result = await userService.deleteAddress(req.userId, addressId);

      res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete address',
        error: error.message,
      });
    }
  }

  // Get all addresses
  async getAddresses(req, res) {
    try {
      const result = await userService.getAddresses(req.userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch addresses',
        error: error.message,
      });
    }
  }

  // Set default address
  async setDefaultAddress(req, res) {
    try {
      const { addressId } = req.params;

      const result = await userService.setDefaultAddress(req.userId, addressId);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to set default address',
        error: error.message,
      });
    }
  }

  // Add to wishlist
  async addToWishlist(req, res) {
    try {
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
      }

      const result = await userService.addToWishlist(req.userId, productId);

      res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('already in wishlist')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to add to wishlist',
        error: error.message,
      });
    }
  }

  // Remove from wishlist
  async removeFromWishlist(req, res) {
    try {
      const { productId } = req.params;

      const result = await userService.removeFromWishlist(req.userId, productId);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to remove from wishlist',
        error: error.message,
      });
    }
  }

  // Get wishlist
  async getWishlist(req, res) {
    try {
      const result = await userService.getWishlist(req.userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch wishlist',
        error: error.message,
      });
    }
  }

  // Google OAuth Callback Handler
  async googleCallback(req, res) {
    try {
      // User is already authenticated by passport
      const { user, token } = req.user;
      
      // Redirect to frontend with token
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:8080';
      res.redirect(`${frontendURL}/auth/google/success?token=${token}`);
    } catch (error) {
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:8080';
      res.redirect(`${frontendURL}/auth/google/error?message=${error.message}`);
    }
  }
}

module.exports = new UserController();
