import api from './api';

/**
 * Service để xử lý các hoạt động liên quan đến người dùng
 */
const userService = {
  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Promise<Object>} Thông tin người dùng
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw new Error(error.response?.data?.detail || 'Không thể lấy thông tin người dùng');
    }
  },

  /**
   * Cập nhật thông tin profile người dùng
   * @param {Object} userData - Dữ liệu người dùng cần cập nhật
   * @returns {Promise<Object>} Thông tin đã cập nhật
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/users/me', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Cập nhật hồ sơ thất bại');
    }
  },

  /**
   * Tải lên avatar người dùng
   * @param {FormData} formData - Form data chứa file avatar
   * @returns {Promise<Object>} Kết quả tải lên
   */
  updateAvatar: async (formData) => {
    try {
      const response = await api.post('/api/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Avatar upload error:', {
        message: error.message,
        responseStatus: error.response?.status,
        responseData: error.response?.data?.detail || error.response?.data
      });

      // Tạo thông báo lỗi chi tiết để frontend hiển thị
      const errorMessage = error.response?.data?.detail ||
        error.response?.data?.message ||
        'Cập nhật ảnh đại diện thất bại';

      throw new Error(errorMessage);
    }
  },

  /**
   * Lấy giỏ hàng của người dùng
   * @returns {Promise<Array>} Danh sách sản phẩm trong giỏ hàng
   */
  getCart: async () => {
    try {
      const response = await api.get('/api/users/cart');
      return response.data;
    } catch (error) {
      console.error('Failed to get cart:', error);
      return [];
    }
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {Object} cartItem - Thông tin sản phẩm thêm vào giỏ
   * @returns {Promise<Object>} Kết quả thêm
   */
  addToCart: async (cartItem) => {
    try {
      console.log('Sending cart item to API:', cartItem);
      const response = await api.post('/api/users/cart', cartItem);
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        // Trả về lỗi với thông tin chi tiết hơn
        const errorMessage = error.response.data.detail
          ? (Array.isArray(error.response.data.detail)
            ? error.response.data.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
            : error.response.data.detail)
          : 'Không thể thêm vào giỏ hàng';
        throw new Error(errorMessage);
      }
      throw new Error('Không thể thêm vào giỏ hàng');
    }
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   * @param {number} cartItemId - ID của item trong giỏ
   * @param {number} quantity - Số lượng mới
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updateCartItem: async (cartItemId, quantity) => {
    try {
      // Đảm bảo quantity là số và nằm trong khoảng hợp lệ
      const validQuantity = Math.max(1, Math.min(parseInt(quantity), 99));

      // Gửi quantity dưới dạng query parameter trong URL
      const response = await api.put(`/api/users/cart/${cartItemId}?quantity=${validQuantity}`);

      console.log('Cart update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        // Trả về thông báo lỗi chi tiết hơn
        const errorMessage = error.response.data.detail
          ? (Array.isArray(error.response.data.detail)
            ? error.response.data.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
            : error.response.data.detail)
          : 'Không thể cập nhật giỏ hàng';
        throw new Error(errorMessage);
      }
      throw new Error('Không thể cập nhật giỏ hàng');
    }
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param {number} cartItemId - ID của item trong giỏ
   * @returns {Promise<Object>} Kết quả xóa
   */
  removeFromCart: async (cartItemId) => {
    try {
      const response = await api.delete(`/api/users/cart/${cartItemId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Không thể xóa khỏi giỏ hàng');
    }
  }
};

export default userService; 