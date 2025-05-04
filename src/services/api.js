// src/services/api.js
import axios from 'axios';
import Cookies from 'js-cookie';
import { TOKEN_STORAGE } from './authService';
import jwtDecode from 'jwt-decode';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Ensure cookies are sent with requests
});

// Interceptor để xử lý request
api.interceptors.request.use(
  (config) => {
    // Lấy token từ Cookies thay vì từ localStorage
    const token = Cookies.get(TOKEN_STORAGE.ACCESS_TOKEN);
    console.log('Current cookies:', document.cookie);
    console.log('Token from cookie:', token ? 'Present' : 'Missing');

    if (token) {
      // Validate token before using it
      try {
        const decodedToken = jwtDecode(token);
        const isExpired = decodedToken.exp * 1000 < Date.now();

        if (isExpired) {
          console.warn('Token is expired, attempting to refresh...');
          // You might want to trigger a token refresh here
        } else {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Token added to request headers:', {
            token: `${token.substring(0, 10)}...`,
            headers: config.headers
          });
        }
      } catch (error) {
        console.error('Error validating token:', error);
      }

      // Thêm log để debug khi gọi API admin
      if (config.url.includes('/api/admin/')) {
        console.log('Admin API call with token:', `${token.substring(0, 10)}...`);
        console.log('Full request config:', {
          url: config.url,
          method: config.method,
          headers: config.headers,
          params: config.params,
          baseURL: config.baseURL,
          withCredentials: config.withCredentials
        });
      }
    } else {
      // Log khi không có token
      if (config.url.includes('/api/admin/')) {
        console.log('Admin API call WITHOUT token!');
        console.log('Full request config:', {
          url: config.url,
          method: config.method,
          headers: config.headers,
          params: config.params,
          baseURL: config.baseURL,
          withCredentials: config.withCredentials
        });
      }
    }

    // Log request params khi gọi API lấy sản phẩm
    if (config.url.includes('/api/e-commerce/products')) {
      console.log('API Request URL:', config.url);
      console.log('API Request Params:', config.params);
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
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
    return response;
  },
  async (error) => {
    // Xử lý lỗi response
    if (error.response) {
      // Xử lý lỗi 401 (Unauthorized)
      if (error.response.status === 401) {
        console.log('Received 401 Unauthorized error');
        console.log('Error details:', {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers,
          response: error.response.data
        });

        // Try to refresh the token if we have a refresh token
        const refreshToken = Cookies.get(TOKEN_STORAGE.REFRESH_TOKEN);
        if (refreshToken) {
          try {
            console.log('Attempting to refresh token...');
            const response = await api.post('/api/auth/refresh-token', { refreshToken });
            if (response.data && response.data.accessToken) {
              console.log('Token refreshed successfully');
              // Store the new token
              Cookies.set(TOKEN_STORAGE.ACCESS_TOKEN, response.data.accessToken, { path: '/' });
              // Retry the original request
              const originalRequest = error.config;
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }

        // If refresh failed or no refresh token, clear everything
        console.log('Clearing authentication data...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Cookies.remove(TOKEN_STORAGE.ACCESS_TOKEN, { path: '/' });
        Cookies.remove(TOKEN_STORAGE.REFRESH_TOKEN, { path: '/' });
        Cookies.remove(TOKEN_STORAGE.TOKEN_EXPIRY, { path: '/' });

        // Redirect to login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;