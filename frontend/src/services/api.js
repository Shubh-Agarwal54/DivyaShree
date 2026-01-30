// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('divyashree_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// User APIs
export const userAPI = {
  // Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Login user
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  // Verify Email OTP
  verifyEmailOTP: async (userId, otp) => {
    const response = await fetch(`${API_BASE_URL}/user/verify-email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, otp }),
    });
    return response.json();
  },

  // Verify Phone OTP
  verifyPhoneOTP: async (userId, otp) => {
    const response = await fetch(`${API_BASE_URL}/user/verify-phone-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, otp }),
    });
    return response.json();
  },

  // Resend Email OTP
  resendEmailOTP: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/user/resend-email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  },

  // Resend Phone OTP
  resendPhoneOTP: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/user/resend-phone-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/user/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },

  // Reset Password
  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/user/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    return response.json();
  },

  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Update user profile
  updateProfile: async (updates) => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return response.json();
  },
};

// Address APIs
export const addressAPI = {
  // Get all addresses
  getAddresses: async () => {
    const response = await fetch(`${API_BASE_URL}/user/addresses`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Add new address
  addAddress: async (addressData) => {
    const response = await fetch(`${API_BASE_URL}/user/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData),
    });
    return response.json();
  },

  // Update address
  updateAddress: async (addressId, updates) => {
    const response = await fetch(`${API_BASE_URL}/user/addresses/${addressId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Delete address
  deleteAddress: async (addressId) => {
    const response = await fetch(`${API_BASE_URL}/user/addresses/${addressId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Set default address
  setDefaultAddress: async (addressId) => {
    const response = await fetch(`${API_BASE_URL}/user/addresses/${addressId}/default`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Wishlist APIs
export const wishlistAPI = {
  // Get wishlist
  getWishlist: async () => {
    const response = await fetch(`${API_BASE_URL}/user/wishlist`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Add to wishlist
  addToWishlist: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/user/wishlist`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId }),
    });
    return response.json();
  },

  // Remove from wishlist
  removeFromWishlist: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/user/wishlist/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Cart APIs
export const cartAPI = {
  // Get cart
  getCart: async () => {
    const response = await fetch(`${API_BASE_URL}/user/cart`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Add to cart
  addToCart: async (productId, quantity = 1, size = null, color = null) => {
    const response = await fetch(`${API_BASE_URL}/user/cart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, quantity, size, color }),
    });
    return response.json();
  },

  // Update cart item
  updateCartItem: async (productId, quantity) => {
    const response = await fetch(`${API_BASE_URL}/user/cart/${productId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });
    return response.json();
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/user/cart/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Clear cart
  clearCart: async () => {
    const response = await fetch(`${API_BASE_URL}/user/cart`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Sync cart (merge localStorage with database)
  syncCart: async (cartItems) => {
    const response = await fetch(`${API_BASE_URL}/user/cart/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cartItems }),
    });
    return response.json();
  },
};

// Order APIs
export const orderAPI = {
  // Create order
  createOrder: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    return response.json();
  },

  // Get user orders
  getUserOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get order details
  getOrderById: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Track order
  trackOrder: async (orderNumber) => {
    const response = await fetch(`${API_BASE_URL}/orders/track/${orderNumber}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// Default export with all APIs
export default {
  ...userAPI,
  ...addressAPI,
  ...wishlistAPI,
  ...cartAPI,
  ...orderAPI,
};
