import api from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const getFeaturedProducts = async () => {
  try {
    const response = await api.get(`/api/e-commerce/categories`, {
      params: {
        is_featured: true,
        limit: 6
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const response = await api.get(`/api/e-commerce/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/api/e-commerce/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    throw error;
  }
};

export const getSubcategories = async (categoryId) => {
  try {
    const response = await api.get(`/api/e-commerce/categories/${categoryId}/subcategories`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subcategories for ${categoryId}:`, error);
    throw error;
  }
};

export const getCategoriesTree = async (forceRefresh = false) => {
  try {
    const response = await api.get(`/api/e-commerce/categories-tree`, {
      params: { force_refresh: forceRefresh }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories tree:', error);
    throw error;
  }
};

// Admin Services
export const getAdminCategories = async (skip = 0, limit = 50) => {
  try {
    console.log('Fetching admin categories with params:', { skip, limit });
    const response = await api.get(`/api/admin/manage/categories`, {
      params: { skip, limit }
    });
    console.log('Admin categories response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    throw error;
  }
};

export const getAdminCategoryById = async (categoryId) => {
  try {
    const response = await api.get(`/api/admin/manage/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching admin category ${categoryId}:`, error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post(`/api/admin/manage/categories`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await api.put(`/api/admin/manage/categories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating category ${categoryId}:`, error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/api/admin/manage/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting category ${categoryId}:`, error);
    throw error;
  }
}; 