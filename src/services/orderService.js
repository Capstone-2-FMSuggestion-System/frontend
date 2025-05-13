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

      // Format data for COD payment
      const formattedData = {
        user_id: orderData.user_id,
        total_amount: orderData.total_amount,
        payment_method: orderData.payment_method,
        items: orderData.items,
        cart_items: orderData.cart_items,
        status: 'pending',
        recipient_name: orderData.recipient_name,
        recipient_phone: orderData.recipient_phone,
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_province: orderData.shipping_province,
        shipping_postal_code: orderData.shipping_postal_code,
        notes: orderData.notes || ''
      };

      // Use the correct endpoint
      const endpoint = `${API_URL}/api/payments/cod/create`;

      // Add authorization header
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      console.log('Sending request to endpoint:', endpoint);
      console.log('Request data:', formattedData);
      console.log('Authorization token:', token);

      const response = await axios.post(endpoint, formattedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
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

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      console.log('Getting order by ID:', orderId);

      // Lấy token từ cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      // Sử dụng API endpoint e-commerce
      const response = await axios.get(`${API_URL}/api/e-commerce/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Raw API Response:', JSON.stringify(response.data, null, 2));
      console.log('recipient_name:', response.data.recipient_name);
      console.log('recipient_phone:', response.data.recipient_phone);
      console.log('shipping_address:', response.data.shipping_address);
      console.log('shipping_city:', response.data.shipping_city);
      console.log('shipping_province:', response.data.shipping_province);
      console.log('shipping_postal_code:', response.data.shipping_postal_code);

      // Xử lý dữ liệu trả về
      const orderData = response.data;
      if (!orderData) {
        throw new Error('Không tìm thấy thông tin đơn hàng');
      }

      // Log dữ liệu địa chỉ giao hàng
      console.log('Shipping address data:', {
        raw: orderData.shipping_address,
        customer: orderData.customer,
        delivery: orderData.delivery_info
      });

      // Xử lý địa chỉ giao hàng
      const shippingAddress = {
        name: orderData.recipient_name || 'Chưa cập nhật',
        phone: orderData.recipient_phone || 'Chưa cập nhật',
        address: orderData.shipping_address || 'Chưa cập nhật',
        city: orderData.shipping_city || 'Chưa cập nhật',
        province: orderData.shipping_province || 'Chưa cập nhật',
        postalCode: orderData.shipping_postal_code || 'Chưa cập nhật'
      };

      console.log('Processed shipping address:', shippingAddress);

      // Chuyển đổi dữ liệu sang định dạng mong muốn
      const processedOrder = {
        id: orderData.order_id || orderData.id,
        orderNumber: orderData.order_number || orderData.order_id || orderData.id,
        createdAt: orderData.created_at || orderData.createdAt,
        status: orderData.status?.toLowerCase() || 'pending',
        paymentMethod: orderData.payment_method || orderData.paymentMethod,
        subtotal: orderData.subtotal || orderData.total_amount || 0,
        shippingFee: orderData.shipping_fee || orderData.shippingFee || 0,
        discount: orderData.discount || 0,
        total: orderData.total || orderData.total_amount || 0,
        items: Array.isArray(orderData.items) ? orderData.items.map(item => ({
          id: item.id || item.product_id,
          product_id: item.product_id,
          product: {
            id: item.product?.id || item.product_id,
            name: item.product?.name || item.product_name || 'Sản phẩm',
            image: item.product?.image || item.product_image || '/images/placeholder.png',
            price: item.product?.price || item.price || 0
          },
          quantity: item.quantity || 1,
          price: item.price || 0,
          total: item.total || (item.price * item.quantity) || 0
        })) : [],
        shippingAddress,
        estimatedDelivery: orderData.estimated_delivery || orderData.estimatedDelivery
      };

      console.log('Final processed order data:', processedOrder);
      return processedOrder;
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
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      console.log('Token found:', !!token);

      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      const response = await axios.get(`${API_URL}/api/e-commerce/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Raw API Response:', JSON.stringify(response.data, null, 2));

      let ordersData = response.data;
      if (response.data && response.data.data) {
        ordersData = response.data.data;
      }

      if (!Array.isArray(ordersData)) {
        console.error('Invalid orders data structure:', ordersData);
        return [];
      }

      const processedOrders = ordersData.map(order => {
        console.log('Processing order:', JSON.stringify(order, null, 2));
        console.log('Order has items field:', order.hasOwnProperty('items'));
        const items = order.items || [];
        console.log('Order items:', JSON.stringify(items, null, 2));

        const shippingAddress = {
          name: order.recipient_name || 'Chưa cập nhật',
          phone: order.recipient_phone || 'Chưa cập nhật',
          address: order.shipping_address || 'Chưa cập nhật',
          city: order.shipping_city || 'Chưa cập nhật',
          province: order.shipping_province || 'Chưa cập nhật',
          postalCode: order.shipping_postal_code || 'Chưa cập nhật'
        };

        return {
          id: order.order_id,
          orderId: order.order_id,
          createdAt: order.created_at,
          status: order.status,
          totalAmount: order.total_amount,
          paymentMethod: order.payment_method,
          items: items.map(item => ({
            id: item.order_item_id || item.id || item.product_id,
            product_id: item.product_id,
            product_name: `#${item.product_id}`,
            product_image: '/images/placeholder.png',
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            unit: ''
          })),
          customer: order.customer || {},
          shippingAddress
        };
      });

      console.log('Processed orders:', JSON.stringify(processedOrders, null, 2));
      return processedOrders;
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
      // Lấy token từ cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      const response = await axios.put(
        `${API_URL}/api/e-commerce/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
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
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      const response = await axios.put(
        `${API_URL}/api/e-commerce/orders/${orderId}`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
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