import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const reviewAPI = {
  // Get reviews for a product
  getProductReviews: async (productId, params = {}) => {
    try {
      const response = await api.get(`/reviews/products/${productId}/reviews`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch reviews',
      };
    }
  },

  // Get review statistics for a product
  getReviewStats: async (productId) => {
    try {
      const response = await api.get(`/reviews/products/${productId}/reviews/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch review stats',
      };
    }
  },

  // Create a new review
  createReview: async (productId, reviewData) => {
    try {
      const response = await api.post(`/reviews/products/${productId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create review',
      };
    }
  },

  // Get user's reviews
  getUserReviews: async () => {
    try {
      const response = await api.get('/reviews/my-reviews');
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user reviews',
      };
    }
  },

  // Update a review
  updateReview: async (reviewId, updateData) => {
    try {
      const response = await api.put(`/reviews/reviews/${reviewId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update review',
      };
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete review',
      };
    }
  },

  // Mark review as helpful
  markHelpful: async (reviewId) => {
    try {
      const response = await api.post(`/reviews/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark review as helpful',
      };
    }
  },
};
