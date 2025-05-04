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
        // console.log('Response:', response);
        return response;
    },
    error => {
        // console.error('Response Error:', error);
        return Promise.reject(error);
    }
);

const zaloPayService = {
    // Create ZaloPay order
    createOrder: async (orderData) => {
        try {
            console.log('Creating ZaloPay order with data:', orderData);
            const response = await axios.post(`${API_URL}/payments/zalopay/create`, orderData);
            console.log('ZaloPay create order response:', response.data);
            return response.data;
        } catch (error) {
            console.error('ZaloPay create order error:', error);
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
            }
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                throw new Error(error.response.data?.message || `Lỗi server: ${error.response.status}`);
            } else if (error.request) {
                // The request was made but no response was received
                throw new Error('Không nhận được phản hồi từ server. Vui lòng thử lại sau.');
            } else {
                // Something happened in setting up the request that triggered an Error
                throw new Error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
            }
        }
    },

    // Check ZaloPay payment status
    checkStatus: async (appTransId) => {
        try {
            console.log('Checking ZaloPay status for:', appTransId);
            const response = await axios.get(`${API_URL}/payments/zalopay/status/${appTransId}`);
            console.log('ZaloPay status response:', response.data);
            return response.data;
        } catch (error) {
            console.error('ZaloPay status check error:', error);
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

    // Handle ZaloPay callback
    handleCallback: async (callbackData) => {
        try {
            console.log('Handling ZaloPay callback with data:', callbackData);
            const response = await axios.post(`${API_URL}/payments/zalopay/callback`, callbackData);
            console.log('ZaloPay callback response:', response.data);
            return response.data;
        } catch (error) {
            console.error('ZaloPay callback error:', error);
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

    // Get ZaloPay payment methods
    getPaymentMethods: async () => {
        try {
            console.log('Getting ZaloPay payment methods');
            const response = await axios.get(`${API_URL}/payments/zalopay/payment-methods`);
            console.log('ZaloPay payment methods response:', response.data);
            return response.data;
        } catch (error) {
            console.error('ZaloPay payment methods error:', error);
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

export default zaloPayService; 