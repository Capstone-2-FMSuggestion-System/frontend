// src/services/productService.js
import api from './api';

const productService = {
  // Get all products
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },
  
  // Get a single product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },
  
  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await api.get(`/api/e-commerce/categories/${categoryId}/products`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products by category');
    }
  },
  
  // Search products
  searchProducts: async (query, params = {}) => {
    try {
      const response = await api.get('/products/search', { 
        params: { 
          query,
          ...params 
        } 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Search failed');
    }
  },
  
  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/api/e-commerce/products/featured');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch featured products');
    }
  },
  
  // Get product reviews
  getProductReviews: async (productId, params = {}) => {
    try {
      const response = await api.get(`/products/${productId}/reviews`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product reviews');
    }
  },
  
  // Add a product review
  addProductReview: async (productId, reviewData) => {
    try {
      const response = await api.post(`/products/${productId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add review');
    }
  },
  
  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/api/e-commerce/categories');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },
  
  // Get subcategories by parent category ID
  getSubcategories: async (categoryId) => {
    try {
      const response = await api.get(`/api/e-commerce/categories/${categoryId}/subcategories`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subcategories');
    }
  },
  
  // Get category tree structure
  getCategoryTree: async () => {
    try {
      const response = await api.get('/api/e-commerce/categories-tree');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category tree');
    }
  }
};

export default productService;
