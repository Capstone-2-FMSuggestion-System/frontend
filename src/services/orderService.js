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
        notes: orderData.notes || '',
        discount_amount: orderData.discount_amount || 0,
        coupon_code: orderData.coupon_code || null
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

  // Create PayOS order for online payment
  createPayosOrder: async (orderData) => {
    try {
      console.log('Creating PayOS order with data:', orderData);

      // Format data for PayOS payment
      const formattedData = {
        user_id: orderData.user_id,
        total_amount: orderData.total_amount,
        payment_method: 'payos',
        items: orderData.items,
        cart_items: orderData.cart_items || [],
        status: 'pending',
        recipient_name: orderData.recipient_name,
        recipient_phone: orderData.recipient_phone,
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_province: orderData.shipping_province || '',
        shipping_postal_code: orderData.shipping_postal_code,
        notes: orderData.notes || '',
        discount_amount: orderData.discount_amount || 0,
        coupon_code: orderData.coupon_code || null
      };

      // Use PayOS payment endpoint
      const endpoint = `${API_URL}/api/payments/payos/create`;

      // Add authorization header
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      console.log('Sending PayOS request to endpoint:', endpoint);
      console.log('PayOS request data:', formattedData);

      const response = await axios.post(endpoint, formattedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Create PayOS order response:', response.data);
      return response.data;
    } catch (error) {
      console.error('PayOS create order error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data, 
        status: error.response?.status
      });

      if (error.response) {
        console.error('Server response error details:', error.response.data);
      }

      if (error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
      }
      if (error.response) {
        throw new Error(error.response.data?.detail || error.response.data?.message || `Lỗi server: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('Không nhận được phản hồi từ server. Vui lòng thử lại sau.');
      } else {
        throw new Error('Có lỗi xảy ra khi gửi yêu cầu thanh toán. Vui lòng thử lại sau.');
      }
    }
  },
  
  // Apply coupon code to an existing order
  applyCouponToOrder: async (orderId, couponCode) => {
    try {
      console.log(`Applying coupon ${couponCode} to order ${orderId}`);

      // Add authorization header
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      // Use coupon endpoint
      const endpoint = `${API_URL}/api/e-commerce/orders/${orderId}/apply-coupon`;
      
      const response = await axios.post(
        endpoint,
        { coupon_code: couponCode },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Apply coupon response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Apply coupon error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng.');
      }
      if (error.response) {
        throw new Error(error.response.data?.detail || error.response.data?.message || `Lỗi server: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('Không nhận được phản hồi từ server.');
      } else {
        throw new Error('Có lỗi xảy ra khi áp dụng mã giảm giá.');
      }
    }
  },

  // Get cart summary with optional coupon code
  getCartSummary: async (couponCode = null) => {
    try {
      // Add authorization header
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      // Build endpoint with optional coupon parameter
      let endpoint = `${API_URL}/api/e-commerce/cart/summary`;
      if (couponCode) {
        endpoint += `?coupon_code=${encodeURIComponent(couponCode)}`;
      }
      
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Cart summary response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get cart summary error:', error);
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng.');
      }
      if (error.response) {
        throw new Error(error.response.data?.detail || error.response.data?.message || `Lỗi server: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('Không nhận được phản hồi từ server.');
      } else {
        throw new Error('Có lỗi xảy ra khi tính tổng giỏ hàng.');
      }
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      // console.log('Getting order by ID:', orderId);

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

      // console.log('Raw API Response:', JSON.stringify(response.data, null, 2));
      // console.log('recipient_name:', response.data.recipient_name);
      // console.log('recipient_phone:', response.data.recipient_phone);
      // console.log('shipping_address:', response.data.shipping_address);
      // console.log('shipping_city:', response.data.shipping_city);
      // console.log('shipping_province:', response.data.shipping_province);
      // console.log('shipping_postal_code:', response.data.shipping_postal_code);

      // Xử lý dữ liệu trả về
      const orderData = response.data;
      if (!orderData) {
        throw new Error('Không tìm thấy thông tin đơn hàng');
      }

      // Log dữ liệu địa chỉ giao hàng
      // console.log('Shipping address data:', {
      //   raw: orderData.shipping_address,
      //   customer: orderData.customer,
      //   delivery: orderData.delivery_info
      // });

      // Xử lý địa chỉ giao hàng
      const shippingAddress = {
        name: orderData.recipient_name || 'Chưa cập nhật',
        phone: orderData.recipient_phone || 'Chưa cập nhật',
        address: orderData.shipping_address || 'Chưa cập nhật',
        city: orderData.shipping_city || 'Chưa cập nhật',
        province: orderData.shipping_province || 'Chưa cập nhật',
        postalCode: orderData.shipping_postal_code || 'Chưa cập nhật'
      };

      // console.log('Processed shipping address:', shippingAddress);

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
        items: Array.isArray(orderData.items) ? orderData.items.map(item => {
          // Lấy thông tin sản phẩm và hình ảnh
          const productInfo = item.product || {};
          
          // Đảm bảo rằng images được truyền đúng cách
          const images = Array.isArray(productInfo.images) ? productInfo.images : [];
          
          return {
            id: item.id || item.product_id,
            product_id: item.product_id,
            product: {
              id: productInfo.id || item.product_id,
              name: productInfo.name || item.product_name || 'Sản phẩm',
              price: productInfo.price || item.price || 0,
              images: images // Thêm images vào product
            },
            quantity: item.quantity || 1,
            price: item.price || 0,
            total: item.total || (item.price * item.quantity) || 0
          };
        }) : [],
        shippingAddress,
        estimatedDelivery: orderData.estimated_delivery || orderData.estimatedDelivery
      };

      // console.log('Final processed order data:', processedOrder);
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

      // console.log('Token found:', !!token);

      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      const response = await axios.get(`${API_URL}/api/e-commerce/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // console.log('Raw API Response:', JSON.stringify(response.data, null, 2));

      let ordersData = response.data;
      if (response.data && response.data.data) {
        ordersData = response.data.data;
      }

      if (!Array.isArray(ordersData)) {
        console.error('Invalid orders data structure:', ordersData);
        return [];
      }

      const processedOrders = ordersData.map(order => {
        // console.log('Processing order:', JSON.stringify(order, null, 2));
        // console.log('Order has items field:', order.hasOwnProperty('items'));
        const items = order.items || [];
        // console.log('Order items:', JSON.stringify(items, null, 2));

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
          items: items.map(item => {
            const productInfo = item.product || {};
            // Đảm bảo rằng images được truyền đúng cách
            const images = Array.isArray(productInfo.images) ? productInfo.images : [];
            
            return {
              id: item.order_item_id || item.id || item.product_id,
              product_id: item.product_id,
              product_name: productInfo.name || `#${item.product_id}`,
              product: {
                id: productInfo.id || item.product_id,
                name: productInfo.name || `#${item.product_id}`,
                images: images
              },
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              unit: productInfo.unit || ''
            };
          }),
          customer: order.customer || {},
          shippingAddress
        };
      });

      // console.log('Processed orders:', JSON.stringify(processedOrders, null, 2));
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