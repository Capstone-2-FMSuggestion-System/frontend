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
  withCredentials: true
});

// Interceptor để xử lý request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_STORAGE.ACCESS_TOKEN);

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const isExpired = decodedToken.exp * 1000 < Date.now();

        if (!isExpired) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error validating token:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = Cookies.get(TOKEN_STORAGE.REFRESH_TOKEN);

      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh-token', { refreshToken });
          if (response.data?.accessToken) {
            Cookies.set(TOKEN_STORAGE.ACCESS_TOKEN, response.data.accessToken, { path: '/' });
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      // Clear auth data and redirect to login
      Cookies.remove(TOKEN_STORAGE.ACCESS_TOKEN, { path: '/' });
      Cookies.remove(TOKEN_STORAGE.REFRESH_TOKEN, { path: '/' });
      Cookies.remove(TOKEN_STORAGE.TOKEN_EXPIRY, { path: '/' });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;