import api from './api';

/**
 * Service để quản lý các API liên quan đến phần quản trị
 * Bao gồm các API dashboard đã được triển khai ở backend
 */
const adminService = {
  /**
   * Lấy thống kê tổng hợp (Total Order, Total Revenue, Total Customer, Total Product)
   * @param {boolean} bypassCache - Nếu true, sẽ bỏ qua cache bằng cách thêm timestamp
   * @returns {Promise<Object>} - Thống kê tổng hợp
   */
  getDashboardStats: async (bypassCache = false) => {
    try {
      const timestamp = bypassCache ? `?_t=${new Date().getTime()}` : '';
      const response = await api.get(`/api/admin/dashboard/stats${timestamp}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê dashboard:', error);
      throw new Error('Không thể lấy thống kê dashboard');
    }
  },

  /**
   * Lấy danh sách đơn hàng gần đây
   * @param {number} limit - Số lượng đơn hàng muốn lấy (mặc định: 10)
   * @param {boolean} bypassCache - Nếu true, sẽ bỏ qua cache bằng cách thêm timestamp
   * @returns {Promise<Object>} - Danh sách đơn hàng gần đây
   */
  getRecentOrders: async (limit = 10, bypassCache = false) => {
    try {
      const timestamp = bypassCache ? `&_t=${new Date().getTime()}` : '';
      const response = await api.get(`/api/admin/dashboard/recent-orders?limit=${limit}${timestamp}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng gần đây:', error);
      throw new Error('Không thể lấy đơn hàng gần đây');
    }
  },

  /**
   * Lấy thống kê doanh thu theo thời gian
   * @param {string} mode - Khoảng thời gian (daily, weekly, monthly, yearly)
   * @param {boolean} bypassCache - Nếu true, sẽ bỏ qua cache bằng cách thêm timestamp
   * @returns {Promise<Object>} - Thống kê doanh thu theo thời gian
   */
  getRevenueOverview: async (mode = 'monthly', bypassCache = false) => {
    try {
      const timestamp = bypassCache ? `&_t=${new Date().getTime()}` : '';
      const response = await api.get(`/api/admin/dashboard/revenue-overview?mode=${mode}${timestamp}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy tổng quan doanh thu:', error);
      throw new Error('Không thể lấy tổng quan doanh thu');
    }
  },

  /**
   * Lấy tất cả thống kê dashboard (stats, recent orders, revenue) trong một lần gọi
   * @param {number} orderLimit - Số lượng đơn hàng muốn lấy (mặc định: 10)
   * @param {string} revenueMode - Khoảng thời gian (daily, weekly, monthly, yearly)
   * @param {boolean} bypassCache - Nếu true, sẽ bỏ qua cache bằng cách thêm timestamp
   * @returns {Promise<Object>} - Tất cả thống kê dashboard
   */
  getAllDashboardData: async (orderLimit = 10, revenueMode = 'monthly', bypassCache = false) => {
    try {
      const [stats, recentOrders, revenueOverview] = await Promise.all([
        adminService.getDashboardStats(bypassCache),
        adminService.getRecentOrders(orderLimit, bypassCache),
        adminService.getRevenueOverview(revenueMode, bypassCache)
      ]);

      return {
        stats,
        recentOrders: recentOrders.orders,
        revenueOverview: revenueOverview.revenue_periods
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu dashboard:', error);
      throw new Error('Không thể lấy dữ liệu dashboard');
    }
  },

  /**
   * Lấy danh sách người dùng với phân trang
   * @param {number} skip - Số bản ghi bỏ qua (mặc định: 0)
   * @param {number} limit - Số bản ghi tối đa (mặc định: 10)
   * @returns {Promise<Object>} - Danh sách người dùng và thông tin phân trang
   */
  getUsers: async (skip = 0, limit = 10) => {
    try {
      const response = await api.get(`/api/admin/manage/users?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      throw new Error(error.response?.data?.detail || 'Không thể lấy danh sách người dùng');
    }
  },

  /**
   * Lấy thông tin chi tiết của một người dùng theo ID
   * @param {number} userId - ID của người dùng
   * @returns {Promise<Object>} - Thông tin chi tiết người dùng
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/admin/manage/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin người dùng ID ${userId}:`, error);
      throw new Error(error.response?.data?.detail || 'Không thể lấy thông tin người dùng');
    }
  },

  /**
   * Tìm kiếm người dùng theo các tiêu chí
   * @param {Object} searchParams - Các tiêu chí tìm kiếm (name, role, status)
   * @param {number} skip - Số bản ghi bỏ qua (mặc định: 0) 
   * @param {number} limit - Số bản ghi tối đa (mặc định: 10)
   * @returns {Promise<Object>} - Kết quả tìm kiếm và thông tin phân trang
   */
  searchUsers: async (searchParams, skip = 0, limit = 10) => {
    try {
      const response = await api.post(`/api/admin/manage/users/search?skip=${skip}&limit=${limit}`, searchParams);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm người dùng:', error);
      throw new Error(error.response?.data?.detail || 'Không thể tìm kiếm người dùng');
    }
  },

  /**
   * Thêm người dùng mới
   * @param {Object} userData - Thông tin người dùng mới
   * @returns {Promise<Object>} - Thông tin người dùng đã tạo
   */
  addUser: async (userData) => {
    try {
      const response = await api.post('/api/admin/manage/users', userData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm người dùng mới:', error);
      throw new Error(error.response?.data?.detail || 'Không thể thêm người dùng mới');
    }
  },

  /**
   * Cập nhật thông tin người dùng
   * @param {number} userId - ID của người dùng
   * @param {Object} userData - Thông tin cập nhật
   * @returns {Promise<Object>} - Thông tin người dùng đã cập nhật
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/api/admin/manage/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật người dùng ID ${userId}:`, error);
      throw new Error(error.response?.data?.detail || 'Không thể cập nhật thông tin người dùng');
    }
  },

  /**
   * Xóa người dùng
   * @param {number} userId - ID của người dùng
   * @returns {Promise<Object>} - Kết quả xóa người dùng
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/admin/manage/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa người dùng ID ${userId}:`, error);
      throw new Error(error.response?.data?.detail || 'Không thể xóa người dùng');
    }
  },

  /**
   * Lấy danh sách sản phẩm với phân trang và tìm kiếm
   * @param {number} skip - Số bản ghi bỏ qua (mặc định: 0)
   * @param {number} limit - Số bản ghi tối đa (mặc định: 10)
   * @param {number} categoryId - Lọc theo danh mục
   * @param {string} search - Từ khóa tìm kiếm
   * @param {string} stockStatus - Lọc theo trạng thái hàng (available/unavailable)
   * @param {Object} sort - Tham số sắp xếp {field, order}
   * @returns {Promise<Object>} - Danh sách sản phẩm và tổng số lượng
   */
  getProducts: async (skip = 0, limit = 10, categoryId = null, search = null, stockStatus = null, sort = null) => {
    try {
      // Build query params
      let params = new URLSearchParams();
      params.append('skip', skip);
      params.append('limit', limit);

      if (categoryId) params.append('category_id', categoryId);
      if (search) params.append('search', search);
      if (stockStatus) params.append('stock_status', stockStatus);

      // Add sorting parameters if provided
      if (sort) {
        // Map sort fields to API fields
        const sortFieldMap = {
          'created_at': 'created_at',
          'name': 'name',
          'price': 'price'
        };

        // Tìm vị trí của dấu gạch dưới cuối cùng để split field và order
        const lastUnderscoreIndex = sort.lastIndexOf('_');
        const field = sort.substring(0, lastUnderscoreIndex);
        const order = sort.substring(lastUnderscoreIndex + 1);

        const apiField = sortFieldMap[field] || field;

        console.log('Sorting parameters:', { field: apiField, order });
        params.append('sort_field', apiField);
        params.append('sort_order', order);
      }

      const url = `/api/admin/manage/products?${params.toString()}`;
      console.log('Request URL:', url);

      const response = await api.get(url);
      console.log('Response data:', response.data);

      // Log thêm thông tin về categoryId nếu có
      if (categoryId) {
        console.log('Filtering by category ID:', categoryId);
      }

      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết của sản phẩm theo ID
   * @param {number} productId - ID của sản phẩm
   * @returns {Promise<Object>} - Thông tin chi tiết sản phẩm
   */
  getProductById: async (productId) => {
    try {
      const response = await api.get(`/api/admin/manage/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin sản phẩm ID ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Thêm sản phẩm mới (với xử lý upload ảnh ở backend)
   * @param {Object} productData - Dữ liệu sản phẩm và file ảnh
   * @returns {Promise<Object>} - Thông tin sản phẩm đã tạo
   */
  addProduct: async (productData) => {
    try {
      // Log the FormData contents for debugging
      console.log('Sending FormData to server:');
      for (let pair of productData.entries()) {
        if (pair[0] === 'files') {
          console.log('File:', pair[1].name, 'Type:', pair[1].type);
        } else {
          console.log(pair[0] + ':', pair[1]);
        }
      }

      const response = await api.post('/api/admin/manage/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in addProduct:', error);
      if (error.response) {
        console.error('Server error response:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Cập nhật sản phẩm (với xử lý upload ảnh ở backend)
   * @param {number} productId - ID của sản phẩm cần cập nhật
   * @param {Object} productData - Dữ liệu sản phẩm và file ảnh
   * @returns {Promise<Object>} - Thông tin sản phẩm đã cập nhật
   */
  updateProduct: async (productId, productData) => {
    try {
      // Log the FormData contents for debugging
      console.log('Sending FormData to server for update:');
      for (let pair of productData.entries()) {
        if (pair[0] === 'files') {
          console.log('File:', pair[1].name, 'Type:', pair[1].type);
        } else {
          console.log(pair[0] + ':', pair[1]);
        }
      }

      const response = await api.put(`/api/admin/manage/products/${productId}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật sản phẩm ID ${productId}:`, error);
      if (error.response) {
        console.error('Server error response:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Xóa sản phẩm
   * @param {number} productId - ID của sản phẩm
   * @returns {Promise<Object>} - Kết quả xóa sản phẩm
   */
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/api/admin/manage/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa sản phẩm ID ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Thêm ảnh cho sản phẩm
   * @param {number} productId - ID của sản phẩm
   * @param {Object} imageData - Thông tin ảnh (image_url, is_primary, display_order)
   * @returns {Promise<Object>} - Thông tin ảnh đã thêm
   */
  addProductImage: async (productId, imageData) => {
    try {
      const response = await api.post(`/api/admin/manage/products/${productId}/images`, imageData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi thêm ảnh cho sản phẩm ID ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Xóa ảnh của sản phẩm
   * @param {number} productId - ID của sản phẩm
   * @param {number} imageId - ID của ảnh
   * @returns {Promise<Object>} - Kết quả xóa ảnh
   */
  deleteProductImage: async (productId, imageId) => {
    try {
      const response = await api.delete(`/api/admin/manage/products/${productId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa ảnh của sản phẩm ID ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách danh mục với phân trang
   * @param {number} skip - Số bản ghi bỏ qua (mặc định: 0)
   * @param {number} limit - Số bản ghi tối đa (mặc định: 100)
   * @returns {Promise<Object>} - Danh sách danh mục và thông tin phân trang
   */
  getCategories: async (skip = 0, limit = 100) => {
    try {
      console.log('Fetching categories...');
      const response = await api.get(`/api/admin/manage/categories?skip=${skip}&limit=${limit}`);
      console.log('Categories response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  }
};

export default adminService;