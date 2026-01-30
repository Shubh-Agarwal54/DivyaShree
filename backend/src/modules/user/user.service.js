const User = require('./user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail, sendOTPSMS, sendPasswordResetEmail } = require('../../services/notification.service');

class UserService {
  // Generate JWT Token
  generateToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'divyashree_secret_key_2025',
      { expiresIn: '7d' }
    );
  }

  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Register new user with OTP
  async register(userData) {
    try {
      const { firstName, lastName, email, password, phone } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Generate OTPs
      const emailOTP = this.generateOTP();
      const phoneOTP = phone ? this.generateOTP() : null;

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        phone: phone || '',
        emailOTP: {
          code: emailOTP,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
        phoneOTP: phone ? {
          code: phoneOTP,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        } : undefined,
      });

      await user.save();

      // Send OTPs
      await sendOTPEmail(email, emailOTP, firstName);
      if (phone && phoneOTP) {
        await sendOTPSMS(phone, phoneOTP);
      }

      return {
        success: true,
        message: 'Registration successful. Please verify your email and phone.',
        data: {
          userId: user._id,
          email: user.email,
          phone: user.phone,
          requiresEmailVerification: true,
          requiresPhoneVerification: !!phone,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify Email OTP
  async verifyEmailOTP(userId, otp) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.emailOTP || !user.emailOTP.code) {
        throw new Error('No OTP found. Please request a new one.');
      }

      if (user.emailOTP.expiresAt < new Date()) {
        throw new Error('OTP expired. Please request a new one.');
      }

      if (user.emailOTP.code !== otp) {
        throw new Error('Invalid OTP');
      }

      user.isEmailVerified = true;
      user.emailOTP = undefined;
      await user.save();

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify Phone OTP
  async verifyPhoneOTP(userId, otp) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.phoneOTP || !user.phoneOTP.code) {
        throw new Error('No OTP found. Please request a new one.');
      }

      if (user.phoneOTP.expiresAt < new Date()) {
        throw new Error('OTP expired. Please request a new one.');
      }

      if (user.phoneOTP.code !== otp) {
        throw new Error('Invalid OTP');
      }

      user.isPhoneVerified = true;
      user.phoneOTP = undefined;
      await user.save();

      // Generate token after full verification
      const token = this.generateToken(user._id, user.role);

      return {
        success: true,
        message: 'Phone verified successfully. Account fully activated.',
        data: {
          user: user.toJSON(),
          token,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Resend Email OTP
  async resendEmailOTP(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isEmailVerified) {
        throw new Error('Email already verified');
      }

      const emailOTP = this.generateOTP();
      user.emailOTP = {
        code: emailOTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      await user.save();
      await sendOTPEmail(user.email, emailOTP, user.firstName);

      return {
        success: true,
        message: 'OTP resent to email',
      };
    } catch (error) {
      throw error;
    }
  }

  // Resend Phone OTP
  async resendPhoneOTP(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isPhoneVerified) {
        throw new Error('Phone already verified');
      }

      if (!user.phone) {
        throw new Error('No phone number found');
      }

      const phoneOTP = this.generateOTP();
      user.phoneOTP = {
        code: phoneOTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      await user.save();
      await sendOTPSMS(user.phone, phoneOTP);

      return {
        success: true,
        message: 'OTP resent to phone',
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Find user with password field
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is blocked
      if (user.isBlocked) {
        throw new Error('Your account has been blocked. Please contact support.');
      }

      // For Google OAuth users
      if (user.googleId && !user.password) {
        throw new Error('Please sign in with Google');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        // Resend OTP
        const emailOTP = this.generateOTP();
        user.emailOTP = {
          code: emailOTP,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        };
        await user.save();
        await sendOTPEmail(user.email, emailOTP, user.firstName);

        return {
          success: false,
          requiresVerification: true,
          userId: user._id,
          message: 'Please verify your email. A new OTP has been sent.',
        };
      }

      // Generate token
      const token = this.generateToken(user._id, user.role);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Google OAuth Login/Register
  async googleAuth(profile) {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // Check if email already exists
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account
          user.googleId = profile.id;
          user.googleProfile = {
            displayName: profile.displayName,
            picture: profile.photos[0]?.value,
          };
          user.isEmailVerified = true; // Auto-verify email from Google
        } else {
          // Create new user
          user = new User({
            firstName: profile.name.givenName || profile.displayName.split(' ')[0] || 'User',
            lastName: profile.name.familyName || profile.displayName.split(' ').slice(1).join(' ') || '',
            email: profile.emails[0].value,
            googleId: profile.id,
            googleProfile: {
              displayName: profile.displayName,
              picture: profile.photos[0]?.value,
            },
            isEmailVerified: true,
          });
        }

        await user.save();
      }

      const token = this.generateToken(user._id, user.role);

      return {
        success: true,
        message: 'Google authentication successful',
        data: {
          user: user.toJSON(),
          token,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Forgot Password
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('No account found with that email');
      }

      if (user.googleId && !user.password) {
        throw new Error('This account uses Google Sign-In. Please sign in with Google.');
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await user.save();

      // Send reset email
      await sendPasswordResetEmail(user.email, resetToken, user.firstName);

      return {
        success: true,
        message: 'Password reset link sent to your email',
      };
    } catch (error) {
      throw error;
    }
  }

  // Reset Password
  async resetPassword(token, newPassword) {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      return {
        success: true,
        message: 'Password reset successful',
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user profile
  async getProfile(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: user.toJSON(),
      };
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      const allowedUpdates = ['firstName', 'lastName', 'phone'];
      const filteredUpdates = {};

      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        filteredUpdates,
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        data: user.toJSON(),
      };
    } catch (error) {
      throw error;
    }
  }

  // [Previous address and wishlist methods remain the same...]
  // Add address
  async addAddress(userId, addressData) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.addresses.length === 0) {
        addressData.isDefault = true;
      }

      if (addressData.isDefault) {
        user.addresses.forEach(addr => {
          addr.isDefault = false;
        });
      }

      user.addresses.push(addressData);
      await user.save();

      return {
        success: true,
        message: 'Address added successfully',
        data: user.addresses[user.addresses.length - 1],
      };
    } catch (error) {
      throw error;
    }
  }

  async updateAddress(userId, addressId, updates) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const address = user.addresses.id(addressId);

      if (!address) {
        throw new Error('Address not found');
      }

      if (updates.isDefault) {
        user.addresses.forEach(addr => {
          if (addr._id.toString() !== addressId) {
            addr.isDefault = false;
          }
        });
      }

      Object.keys(updates).forEach(key => {
        address[key] = updates[key];
      });

      await user.save();

      return {
        success: true,
        message: 'Address updated successfully',
        data: address,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteAddress(userId, addressId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const addressIndex = user.addresses.findIndex(
        addr => addr._id.toString() === addressId
      );

      if (addressIndex === -1) {
        throw new Error('Address not found');
      }

      const wasDefault = user.addresses[addressIndex].isDefault;
      user.addresses.splice(addressIndex, 1);

      if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }

      await user.save();

      return {
        success: true,
        message: 'Address deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async getAddresses(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: user.addresses,
      };
    } catch (error) {
      throw error;
    }
  }

  async setDefaultAddress(userId, addressId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      user.addresses.forEach(addr => {
        addr.isDefault = addr._id.toString() === addressId;
      });

      await user.save();

      return {
        success: true,
        message: 'Default address updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async addToWishlist(userId, productId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.wishlist.includes(productId)) {
        throw new Error('Product already in wishlist');
      }

      user.wishlist.push(productId);
      await user.save();

      return {
        success: true,
        message: 'Added to wishlist',
        data: user.wishlist,
      };
    } catch (error) {
      throw error;
    }
  }

  async removeFromWishlist(userId, productId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      user.wishlist = user.wishlist.filter(
        id => id.toString() !== productId
      );

      await user.save();

      return {
        success: true,
        message: 'Removed from wishlist',
        data: user.wishlist,
      };
    } catch (error) {
      throw error;
    }
  }

  async getWishlist(userId) {
    try {
      // Populate wishlist with full product details instead of just IDs
      const user = await User.findById(userId).populate({
        path: 'wishlist',
        select: '-__v',
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: user.wishlist || [],
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user's cart
  async getCart(userId) {
    try {
      const user = await User.findById(userId).populate({
        path: 'cart.product',
        select: '-__v',
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: user.cart || [],
      };
    } catch (error) {
      throw error;
    }
  }

  // Add item to cart
  async addToCart(userId, cartItem) {
    try {
      const { productId, quantity, size, color } = cartItem;
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if product already exists in cart
      const existingItemIndex = user.cart.findIndex(
        item => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity if product exists
        user.cart[existingItemIndex].quantity += quantity || 1;
        user.cart[existingItemIndex].size = size || user.cart[existingItemIndex].size;
        user.cart[existingItemIndex].color = color || user.cart[existingItemIndex].color;
      } else {
        // Add new item to cart
        user.cart.push({
          product: productId,
          quantity: quantity || 1,
          size,
          color,
        });
      }

      await user.save();

      // Return updated cart with populated products
      const updatedUser = await User.findById(userId).populate({
        path: 'cart.product',
        select: '-__v',
      });

      return {
        success: true,
        message: 'Item added to cart',
        data: updatedUser.cart,
      };
    } catch (error) {
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItem(userId, productId, quantity) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const itemIndex = user.cart.findIndex(
        item => item.product.toString() === productId
      );

      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        user.cart.splice(itemIndex, 1);
      } else {
        user.cart[itemIndex].quantity = quantity;
      }

      await user.save();

      const updatedUser = await User.findById(userId).populate({
        path: 'cart.product',
        select: '-__v',
      });

      return {
        success: true,
        message: 'Cart updated',
        data: updatedUser.cart,
      };
    } catch (error) {
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(userId, productId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.cart = user.cart.filter(
        item => item.product.toString() !== productId
      );

      await user.save();

      const updatedUser = await User.findById(userId).populate({
        path: 'cart.product',
        select: '-__v',
      });

      return {
        success: true,
        message: 'Item removed from cart',
        data: updatedUser.cart,
      };
    } catch (error) {
      throw error;
    }
  }

  // Clear entire cart
  async clearCart(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.cart = [];
      await user.save();

      return {
        success: true,
        message: 'Cart cleared',
        data: [],
      };
    } catch (error) {
      throw error;
    }
  }

  // Sync cart (merge localStorage cart with database cart)
  async syncCart(userId, localCartItems) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Merge local cart with database cart
      for (const localItem of localCartItems) {
        const existingItemIndex = user.cart.findIndex(
          item => item.product.toString() === localItem.productId
        );

        if (existingItemIndex > -1) {
          // Update quantity (keep the higher quantity)
          user.cart[existingItemIndex].quantity = Math.max(
            user.cart[existingItemIndex].quantity,
            localItem.quantity || 1
          );
        } else {
          // Add new item
          user.cart.push({
            product: localItem.productId,
            quantity: localItem.quantity || 1,
            size: localItem.size,
            color: localItem.color,
          });
        }
      }

      await user.save();

      const updatedUser = await User.findById(userId).populate({
        path: 'cart.product',
        select: '-__v',
      });

      return {
        success: true,
        message: 'Cart synced',
        data: updatedUser.cart,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
