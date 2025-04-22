import api from './api';

export const getAllCategories = async () => {
  try {
    const response = await api.get('/api/e-commerce/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const response = await api.get(`/api/e-commerce/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error);
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
    const response = await api.get('/api/e-commerce/categories-tree', {
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
    const response = await api.get('/api/admin/manage/categories', {
      params: { skip, limit }
    });
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
    const response = await api.post('/api/admin/manage/categories', categoryData);
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