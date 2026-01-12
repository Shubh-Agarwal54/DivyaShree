const User = require('./user.model');
const jwt = require('jsonwebtoken');

class UserService {
  // Generate JWT Token
  generateToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'divyashree_secret_key_2025',
      { expiresIn: '7d' }
    );
  }

  // Register new user
  async register(userData) {
    try {
      const { firstName, lastName, email, password, phone } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        phone: phone || '',
      });

      await user.save();

      // Generate token
      const token = this.generateToken(user._id, user.role);

      return {
        success: true,
        message: 'Registration successful',
        data: {
          user: user.toJSON(),
          token,
        },
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

      // Verify password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
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

      // Filter only allowed fields
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

  // Add address
  async addAddress(userId, addressData) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // If this is the first address, make it default
      if (user.addresses.length === 0) {
        addressData.isDefault = true;
      }

      // If new address is set as default, unset others
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

  // Update address
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

      // If updating to default, unset others
      if (updates.isDefault) {
        user.addresses.forEach(addr => {
          if (addr._id.toString() !== addressId) {
            addr.isDefault = false;
          }
        });
      }

      // Update address fields
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

  // Delete address
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

      // If deleted address was default, make first remaining address default
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

  // Get all addresses
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

  // Set default address
  async setDefaultAddress(userId, addressId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Unset all default addresses
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

  // Add to wishlist
  async addToWishlist(userId, productId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Check if already in wishlist
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

  // Remove from wishlist
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

  // Get wishlist
  async getWishlist(userId) {
    try {
      const user = await User.findById(userId).populate('wishlist');

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: user.wishlist,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
