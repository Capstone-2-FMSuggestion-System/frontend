import axios from 'axios';
import { API_URL } from '../config';

// Add request interceptor for logging
axios.interceptors.request.use(request => {
    return request;
});

// Add response interceptor for logging
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        return Promise.reject(error);
    }
);

const payosService = {
    // Create PayOS order
    createOrder: async (orderData) => {
        try {
            console.log('Creating PayOS order with data:', JSON.stringify(orderData, null, 2));

            // Format data for PayOS payment
            const formattedData = {
                user_id: orderData.user_id,
                total_amount: orderData.total_amount,
                payment_method: 'PAYOS',
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

            // Add authorization header
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('accessToken='))
                ?.split('=')[1];

            if (!token) {
                throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            }

            const response = await axios.post(`${API_URL}/api/payments/payos/create`, formattedData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('PayOS create order response:', response.data);
            return response.data;
        } catch (error) {
            console.error('PayOS create order error:', error);

            // Log chi tiết lỗi từ server
            if (error.response) {
                console.error('Server response error details:', error.response.data);
                console.error('Error status:', error.response.status);
                console.error('Error headers:', error.response.headers);
            }

            if (error.code === 'ERR_NETWORK') {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
            }
            if (error.response) {
                throw new Error(error.response.data?.detail || error.response.data?.message || `Lỗi server: ${error.response.status}`);
            } else if (error.request) {
                throw new Error('Không nhận được phản hồi từ server. Vui lòng thử lại sau.');
            } else {
                throw new Error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
            }
        }
    },

    // Check PayOS payment status
    checkStatus: async (orderCode) => {
        try {
            console.log('Checking PayOS status for order:', orderCode);
            const response = await axios.get(`${API_URL}/api/payments/payos/status/${orderCode}`);
            console.log('PayOS status response:', response.data);
            return response.data;
        } catch (error) {
            console.error('PayOS status check error:', error);
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

    // Handle PayOS callback
    handleCallback: async (callbackData) => {
        try {
            console.log('Handling PayOS callback with data:', callbackData);
            const response = await axios.post(`${API_URL}/api/payments/payos/callback`, callbackData);
            console.log('PayOS callback response:', response.data);
            return response.data;
        } catch (error) {
            console.error('PayOS callback error:', error);
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

    // Get payment methods
    getPaymentMethods: async () => {
        try {
            console.log('Getting payment methods');
            const response = await axios.get(`${API_URL}/api/payments/payment-methods`);
            console.log('Payment methods response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Payment methods error:', error);
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
    }
};

export default payosService;