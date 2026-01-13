import api from './axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Product APIs (public - no auth required)
export const productAPI = {
  // Get all products
  getAllProducts: async (params = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products?${new URLSearchParams(params)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return { success: false, data: { products: [], pagination: {} } };
    }
  },

  // Get single product
  getProduct: async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return { success: false, data: null };
    }
  },

  // Get featured products
  getFeaturedProducts: async (type = 'bestseller', limit = 8) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/featured?type=${type}&limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      return { success: false, data: [] };
    }
  },

  // Get products by category
  getProductsByCategory: async (category, params = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/category/${category}?${new URLSearchParams(params)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch category products:', error);
      return { success: false, data: { products: [], pagination: {} } };
    }
  },

  // Get related products
  getRelatedProducts: async (productId, limit = 4) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/related?limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch related products:', error);
      return { success: false, data: [] };
    }
  },
};

export default productAPI;
