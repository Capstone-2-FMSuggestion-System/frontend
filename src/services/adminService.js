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
   * @returns {Promise<Object>} - Danh sách sản phẩm và tổng số lượng
   */
  getProducts: async (skip = 0, limit = 10, categoryId = null, search = null, stockStatus = null) => {
    try {
      // Build query params
      let params = new URLSearchParams();
      params.append('skip', skip);
      params.append('limit', limit);

      if (categoryId) params.append('category_id', categoryId);
      if (search) params.append('search', search);
      if (stockStatus) params.append('stock_status', stockStatus);

      const response = await api.get(`/api/admin/manage/products?${params.toString()}`);
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
      // Thử lấy thông tin chi tiết sản phẩm qua API admin
      try {
        console.log(`Đang lấy thông tin sản phẩm ID ${productId} từ API admin`);
        const response = await api.get(`/api/admin/manage/products/${productId}`);

        // Đảm bảo dữ liệu hình ảnh đúng định dạng
        const productData = response.data;
        if (productData.images) {
          console.log(`Sản phẩm ID ${productId} có ${productData.images.length} hình ảnh`);
          // Chắc chắn rằng mỗi hình ảnh có các thuộc tính cần thiết
          productData.images = productData.images.map(img => {
            if (typeof img === 'string') {
              return { image_url: img, is_primary: true, image_id: 'img_' + Date.now() };
            }
            return img;
          });
        }

        return productData;
      } catch (adminError) {
        console.warn(`Admin API không trả về dữ liệu sản phẩm ID ${productId}, thử dùng API public`, adminError);

        // Nếu API admin không hoạt động (ví dụ: vấn đề xác thực), thử dùng API public
        try {
          const response = await api.get(`/api/e-commerce/products/${productId}`);

          // Đảm bảo dữ liệu hình ảnh đúng định dạng
          const productData = response.data;
          if (productData.images) {
            console.log(`Sản phẩm ID ${productId} có ${productData.images.length} hình ảnh (API public)`);
            // Chắc chắn rằng mỗi hình ảnh có các thuộc tính cần thiết
            productData.images = productData.images.map(img => {
              if (typeof img === 'string') {
                return { image_url: img, is_primary: true, image_id: 'img_' + Date.now() };
              }
              return img;
            });
          }

          return productData;
        } catch (publicError) {
          console.error(`Cả API admin và public đều không lấy được sản phẩm ID ${productId}`, publicError);

          // Nếu tất cả các API đều thất bại, tạo dữ liệu mẫu
          console.warn(`Generating mock data for product ID ${productId}`);
          return {
            product_id: parseInt(productId),
            name: `Sản phẩm mẫu #${productId}`,
            description: 'Mô tả sản phẩm mẫu',
            price: 150000,
            original_price: 180000,
            unit: 'kg',
            stock_quantity: 50,
            is_featured: false,
            category_id: 1,
            category_name: 'Danh mục mẫu',
            created_at: new Date().toISOString(),
            images: [
              { image_id: 'mock_img_1', image_url: 'https://via.placeholder.com/300', is_primary: true }
            ]
          };
        }
      }
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin sản phẩm ID ${productId}:`, error);
      throw new Error(error.response?.data?.detail || 'Không thể lấy thông tin sản phẩm');
    }
  },

  /**
   * Thêm sản phẩm mới (với xử lý upload ảnh ở backend)
   * @param {Object} productData - Dữ liệu sản phẩm và file ảnh
   * @returns {Promise<Object>} - Thông tin sản phẩm đã tạo
   */
  addProduct: async (productData) => {
    try {
      // Tạo FormData để gửi cả dữ liệu và file ảnh
      const formData = new FormData();

      // Thêm dữ liệu sản phẩm vào FormData
      Object.keys(productData).forEach(key => {
        if (key === 'image' && productData[key] instanceof File) {
          // Nếu là file ảnh, thêm vào form data với key 'file'
          formData.append('file', productData[key]);
        } else if (key !== 'image' || (key === 'image' && typeof productData[key] === 'string')) {
          // Các trường khác hoặc trường image là URL (string)
          formData.append(key, productData[key]);
        }
      });

      const response = await api.post('/api/admin/manage/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm:', error);
      throw new Error(error.response?.data?.detail || 'Không thể thêm sản phẩm');
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
      // Kiểm tra và chuyển đổi dữ liệu
      const formData = new FormData();

      // Thêm các trường vào formData với kiểm tra kiểu dữ liệu
      Object.keys(productData).forEach(key => {
        const value = productData[key];
        if (value !== null && value !== undefined) {
          // Xử lý các trường đặc biệt
          if (key === 'price' || key === 'original_price') {
            formData.append(key, parseFloat(value));
          } else if (key === 'stock_quantity') {
            formData.append(key, parseInt(value, 10));
          } else if (key === 'is_featured') {
            formData.append(key, value ? 'true' : 'false');
          } else if (key === 'image' && value instanceof File) {
            formData.append('file', value);
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await api.put(`/api/admin/manage/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!response.data) {
        throw new Error('Không nhận được dữ liệu phản hồi');
      }

      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật sản phẩm ID ${productId}:`, error);

      // Xử lý lỗi chi tiết hơn
      if (error.response) {
        const errorMessage = error.response.data?.detail ||
          error.response.data?.message ||
          'Không thể cập nhật sản phẩm';
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Không thể kết nối đến máy chủ');
      } else {
        throw new Error('Có lỗi xảy ra khi xử lý yêu cầu');
      }
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
      throw new Error(error.response?.data?.detail || 'Không thể xóa sản phẩm');
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
      throw new Error(error.response?.data?.detail || 'Không thể thêm ảnh cho sản phẩm');
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
      console.error(`Lỗi khi xóa ảnh ID ${imageId} của sản phẩm ID ${productId}:`, error);
      throw new Error(error.response?.data?.detail || 'Không thể xóa ảnh sản phẩm');
    }
  },

  /**
   * Lấy danh sách danh mục sản phẩm với phân trang
   * @param {number} skip - Số bản ghi bỏ qua (mặc định: 0)
   * @param {number} limit - Số bản ghi tối đa (mặc định: 10)
   * @param {boolean} subcategories_only - Chỉ lấy các danh mục con (parent_id != null)
   * @returns {Promise<Object>} - Danh sách danh mục và thông tin phân trang
   */
  getCategories: async (skip = 0, limit = 10, subcategories_only = true) => {
    try {
      try {
        const response = await api.get('/api/admin/manage/categories', {
          params: {
            skip,
            limit,
            subcategories_only
          }
        });

        console.log('Danh mục từ API:', response.data);

        // Lấy các danh mục từ dữ liệu API
        const categories = response.data.categories || [];

        // Trả về dữ liệu đã định dạng
        return {
          items: categories,
          total: response.data.total,
          skip,
          limit
        };
      } catch (apiError) {
        if (apiError.response?.status === 404) {
          console.warn('Categories API endpoint not found, generating mock data for development');

          // Return mock data for development with parent_id != null
          const mockCategories = [
            { category_id: 1, name: 'Rau củ', description: 'Các loại rau củ tươi ngon', level: 2, parent_id: 10, parent_name: 'Thực phẩm' },
            { category_id: 2, name: 'Trái cây', description: 'Các loại trái cây tươi ngon', level: 2, parent_id: 10, parent_name: 'Thực phẩm' },
            { category_id: 3, name: 'Thịt tươi', description: 'Các loại thịt tươi ngon', level: 2, parent_id: 11, parent_name: 'Đồ tươi sống' },
            { category_id: 4, name: 'Hải sản tươi', description: 'Các loại hải sản tươi ngon', level: 2, parent_id: 11, parent_name: 'Đồ tươi sống' },
            { category_id: 5, name: 'Thực phẩm đông lạnh', description: 'Các loại thực phẩm đông lạnh', level: 2, parent_id: 12, parent_name: 'Đông lạnh' }
          ];

          return {
            items: mockCategories,
            total: mockCategories.length,
            skip,
            limit
          };
        }
        throw apiError;
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục:', error);
      throw new Error(error.response?.data?.detail || 'Không thể lấy danh sách danh mục');
    }
  }
};

export default adminService;