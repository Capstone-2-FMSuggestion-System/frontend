// src/services/orderService.js
import axios from 'axios';
import { API_URL } from '../config';

// Add request interceptor for logging
axios.interceptors.request.use(request => {
  // console.log('Starting Request:', request);
  return request;
});

// Add response interceptor for logging
axios.interceptors.response.use(
  response => {
    //  console.log('Response:', response);
    return response;
  },
  error => {
    //   console.error('Response Error:', error);
    return Promise.reject(error);
  }
);

const orderService = {
  // Create order
  createOrder: async (orderData) => {
    try {
      console.log('Creating order with data:', orderData);
      let endpoint = `${API_URL}/orders`;

      // Format data according to backend schema
      const formattedData = {
        user_id: orderData.user_id,
        total_amount: orderData.total,
        payment_method: orderData.paymentMethod,
        status: 'pending',
        items: orderData.orderItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: {
          address: orderData.shippingAddress.address,
          city: orderData.shippingAddress.city,
          zip_code: orderData.shippingAddress.zipCode
        },
        customer: {
          name: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
          email: orderData.customer.email,
          phone: orderData.customer.phone
        },
        notes: orderData.notes || ''
      };

      console.log('Formatted order data:', formattedData);

      // If payment method is COD, use the COD endpoint
      if (orderData.paymentMethod === 'cod') {
        endpoint = `${API_URL}/payments/cod/create`;
      }

      console.log('Sending request to endpoint:', endpoint);
      const response = await axios.post(endpoint, formattedData);
      console.log('Create order response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create order error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
      }
      if (error.response) {
        throw new Error(error.response.data?.message || `Lỗi server: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('Không nhận được phản hồi từ server. Vui lòng thử lại sau.');
      } else {
        throw new Error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
      }
    }
  },

  // Create ZaloPay order
  createZaloPayOrder: async (orderData) => {
    try {
      const response = await axios.post(`${API_URL}/orders/zalopay`, orderData);
      return response.data;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
      }
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng ZaloPay. Vui lòng thử lại sau.');
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      console.log('Getting order by ID:', orderId);
      const response = await axios.get(`${API_URL}/orders/${orderId}`);
      console.log('Get order response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get order error:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
      }
      if (error.response) {
        throw new Error(error.response.data?.message || `Lỗi server: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('Không nhận được phản hồi từ server. Vui lòng thử lại sau.');
      } else {
        throw new Error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
      }
    }
  },

  // Get user orders
  getUserOrders: async () => {
    try {
      // Lấy token từ cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      console.log('Token found:', !!token);

      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      // Sửa lại endpoint
      const response = await axios.get(`${API_URL}/e-commerce/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));

      // Log chi tiết đơn hàng đầu tiên để xem cấu trúc
      if (response.data && response.data.length > 0) {
        const firstOrder = response.data[0];
        console.log('First order details:', {
          id: firstOrder.id,
          order_id: firstOrder.order_id,
          orderId: firstOrder.orderId,
          created_at: firstOrder.created_at,
          createdAt: firstOrder.createdAt,
          status: firstOrder.status,
          total_amount: firstOrder.total_amount,
          totalAmount: firstOrder.totalAmount,
          payment_method: firstOrder.payment_method,
          paymentMethod: firstOrder.paymentMethod,
          items: firstOrder.items,
          raw: firstOrder
        });
      }

      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.error('Invalid response structure:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error in getUserOrders:', error);
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      console.log('Cancelling order:', orderId);
      const response = await axios.put(`${API_URL}/orders/${orderId}/cancel`);
      console.log('Cancel order response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Cancel order error:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
      }
      if (error.response) {
        throw new Error(error.response.data?.message || `Lỗi server: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('Không nhận được phản hồi từ server. Vui lòng thử lại sau.');
      } else {
        throw new Error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
      }
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      console.log('Updating order status:', { orderId, status });
      const response = await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
      console.log('Update order status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update order status error:', error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
      }
      if (error.response) {
        throw new Error(error.response.data?.message || `Lỗi server: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('Không nhận được phản hồi từ server. Vui lòng thử lại sau.');
      } else {
        throw new Error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
      }
    }
  },

  // Track an order
  trackOrder: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/${id}/track`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to track order');
    }
  }
};

export default orderService;