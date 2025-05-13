// src/services/api.js
import axios from 'axios';
import Cookies from 'js-cookie';
import { TOKEN_STORAGE } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để xử lý request
api.interceptors.request.use(
  (config) => {
    // Lấy token từ Cookies thay vì từ localStorage
    const token = Cookies.get(TOKEN_STORAGE.ACCESS_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Thêm log để debug khi gọi API admin
      if (config.url.includes('/api/admin/')) {
        console.log('Admin API call with token:', `${token.substring(0, 10)}...`);
      }
    } else {
      // Log khi không có token
      if (config.url.includes('/api/admin/')) {
        console.log('Admin API call WITHOUT token!');
      }
    }

    // Log request params khi gọi API lấy sản phẩm
    if (config.url.includes('/api/e-commerce/products')) {
      console.log('API Request URL:', config.url);
      console.log('API Request Params:', config.params);
    }

    // Log request khi gọi API cart
    if (config.url.includes('/api/users/cart')) {
      console.log('Cart API Request URL:', config.url);
      console.log('Cart API Request Data:', config.data);
      console.log('Cart API Request Headers:', config.headers);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => {
    // Log chi tiết dữ liệu trả về nếu là API sản phẩm
    if (response.config.url.includes('/api/e-commerce/products')) {
      console.log('===== API RESPONSE DATA =====');
      console.log('API URL:', response.config.url);

      // Log số lượng kết quả hoặc chi tiết một sản phẩm
      if (Array.isArray(response.data)) {
        console.log('API Response Data Length:', response.data.length);
        if (response.data.length > 0) {
          console.log('First product sample:', JSON.stringify(response.data[0]));
        }
      } else if (response.data.products && Array.isArray(response.data.products)) {
        console.log('API Response Products Length:', response.data.products.length);
        if (response.data.products.length > 0) {
          console.log('First product sample:', JSON.stringify(response.data.products[0]));
        }
      } else {
        console.log('API Response Data:', JSON.stringify(response.data));
      }
      console.log('===== END API RESPONSE =====');
    }

    // Log response khi gọi API cart
    if (response.config.url.includes('/api/users/cart')) {
      console.log('===== CART API RESPONSE =====');
      console.log('Cart API URL:', response.config.url);
      console.log('Cart API Response:', JSON.stringify(response.data));
      console.log('===== END CART API RESPONSE =====');
    }
    return response;
  },
  (error) => {
    // Xử lý lỗi response
    if (error.response) {
      // Xử lý lỗi 401 (Unauthorized) - đăng xuất người dùng
      if (error.response.status === 401) {
        // Xóa token khỏi cả localStorage và cookie để đảm bảo đồng bộ
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Xóa token khỏi cookies
        Cookies.remove(TOKEN_STORAGE.ACCESS_TOKEN, { path: '/' });
        Cookies.remove(TOKEN_STORAGE.REFRESH_TOKEN, { path: '/' });
        Cookies.remove(TOKEN_STORAGE.TOKEN_EXPIRY, { path: '/' });

        console.log('Unauthorized error: Removed tokens from both localStorage and cookies');

        // Redirect to login page if needed
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
