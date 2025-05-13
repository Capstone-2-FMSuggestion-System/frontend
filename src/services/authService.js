// src/services/authService.js
import api from './api';
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { API_URL } from '../config';

// Cấu hình axios mặc định
axios.defaults.withCredentials = true;

// EmailJS Configuration
const EMAILJS_CONFIG = {
  PUBLIC_KEY: '4htwbn8aneB46zmje',
  SERVICE_ID: 'service_u7ozvqm',  // Verify this ID in your EmailJS dashboard
  TEMPLATE_ID: 'template_cz37etl', // Verify this ID in your EmailJS dashboard
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

// Token storage keys
export const TOKEN_STORAGE = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_EXPIRY: 'tokenExpiry'
};

// Token utility functions
const tokenUtils = {
  // Store tokens securely with expiration in cookies
  storeTokens: (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const expiryTime = decodedToken.exp * 1000; // Convert to milliseconds

      // Tính toán thời gian hết hạn cho cookie (30 ngày)
      // Sử dụng thời gian dài hơn cho cookie so với thời gian hết hạn của token
      // để đảm bảo phiên đăng nhập được duy trì khi refresh trang
      const cookieExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 ngày

      // Lưu token vào cookie với thời gian hết hạn dài hơn
      Cookies.set(TOKEN_STORAGE.ACCESS_TOKEN, token, { expires: cookieExpiry, path: '/' });
      Cookies.set(TOKEN_STORAGE.TOKEN_EXPIRY, expiryTime.toString(), { expires: cookieExpiry, path: '/' });

      console.log('Token stored in cookies with extended expiry time');
      return true;
    } catch (error) {
      console.error('Failed to store token:', error);
      return false;
    }
  },

  // Get stored tokens from cookies
  getTokens: () => {
    return {
      accessToken: Cookies.get(TOKEN_STORAGE.ACCESS_TOKEN),
      refreshToken: Cookies.get(TOKEN_STORAGE.REFRESH_TOKEN),
      tokenExpiry: Cookies.get(TOKEN_STORAGE.TOKEN_EXPIRY)
    };
  },

  // Clear all stored tokens from cookies
  clearTokens: () => {
    // Xóa token khỏi cookie
    Cookies.remove(TOKEN_STORAGE.ACCESS_TOKEN, { path: '/' });
    Cookies.remove(TOKEN_STORAGE.REFRESH_TOKEN, { path: '/' });
    Cookies.remove(TOKEN_STORAGE.TOKEN_EXPIRY, { path: '/' });
    console.log('Tokens cleared from cookies');
  },

  // Check if token is expired
  isTokenExpired: (expiryTime) => {
    if (!expiryTime) return true;

    const currentTime = Date.now();
    const expiry = parseInt(expiryTime, 10);

    return currentTime >= expiry;
  },

  // Check if token is about to expire (within 5 minutes)
  isTokenExpiringSoon: (expiryTime) => {
    if (!expiryTime) return true;

    const currentTime = Date.now();
    const expiry = parseInt(expiryTime, 10);
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

    return currentTime >= (expiry - fiveMinutes);
  },

  // Validate token format and structure
  validateToken: (token) => {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return !!decoded.exp; // Check if expiration exists
    } catch (error) {
      console.error('Invalid token format:', error);
      return false;
    }
  },

  // Decode token to extract user information
  decodeToken: (token) => {
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
};

const authService = {
  // Login with username/email and password
  login: async (username_or_email, password) => {
    try {
      console.log('Attempting login for user:', username_or_email);
      const response = await api.post('/api/auth/login', { username_or_email, password });

      console.log('Login response:', response.data);
      const { token, token_type, user_id, role } = response.data;

      if (!token || !token_type) {
        console.error('Missing tokens in login response');
        throw new Error('Authentication failed: Missing tokens');
      }

      // Lưu token vào cookie
      const tokenStored = tokenUtils.storeTokens(token);
      if (!tokenStored) {
        console.error('Failed to store token in cookie');
        throw new Error('Authentication failed: Could not store token');
      }
      console.log('Token stored successfully');

      // Lấy thông tin user đầy đủ
      const userData = {
        id: user_id,
        role: role,
        username: username_or_email
      };

      // Gọi API /api/auth/me bất đồng bộ để cập nhật thông tin người dùng trong cache server
      authService.fetchUserInfoAsync().catch(error => {
        console.error('Background user info fetch failed:', error.message);
      });

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      // Truyền thêm thông tin response để component login có thể kiểm tra status code và hiển thị thông báo phù hợp
      const errorObj = new Error(error.response?.data?.detail || 'Đăng nhập thất bại');
      errorObj.response = error.response;
      throw errorObj;
    }
  },

  // Register new user
  register: async (username, name, email, phone, password) => {
    try {
      const response = await api.post('/api/auth/register', {
        username,
        email,
        full_name: name,
        password
      });

      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Đăng ký thất bại');
    }
  },

  // Logout
  logout: async () => {
    try {
      console.log('Performing logout');

      try {
        // Gọi API logout để xóa cache phía server
        await api.post('/api/auth/logout');
        console.log('Server-side logout completed');
      } catch (error) {
        // Không cần xử lý lỗi API ở đây, vẫn tiếp tục logout ở client
        console.error('Server-side logout failed:', error.message);
      }

      // Xóa token ngay lập tức 
      tokenUtils.clearTokens();

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Đã xóa token rồi nên không cần throw error
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      console.log('Attempting to get current user');
      // Get tokens using tokenUtils
      const { accessToken, tokenExpiry } = tokenUtils.getTokens();

      if (!accessToken) {
        console.log('No access token found, user is not authenticated');
        return null;
      }

      // Check if token is valid
      if (!tokenUtils.validateToken(accessToken)) {
        console.error('Invalid access token format, but keeping token');
        // Không xóa token khi không hợp lệ, chỉ trả về null
        // Giữ token để người dùng có thể thử lại sau khi refresh trang
        return null;
      }

      // Check if token is expired using tokenUtils
      if (tokenUtils.isTokenExpired(tokenExpiry)) {
        console.log('Access token is expired, attempting to refresh');
        // Token is expired, try to refresh
        try {
          const refreshed = await authService.refreshToken();
          if (!refreshed) {
            console.error('Token refresh failed');
            // Không xóa token ngay lập tức khi refresh thất bại
            // Người dùng có thể vẫn muốn giữ phiên đăng nhập
            return null;
          }
          console.log('Token refreshed successfully');
        } catch (error) {
          // Refresh failed, but don't clear storage immediately
          console.error('Token refresh error:', error.message);
          return null;
        }
      } else if (tokenUtils.isTokenExpiringSoon(tokenExpiry)) {
        // If token is about to expire, refresh in background
        console.log('Token is expiring soon, refreshing in background');
        authService.refreshToken().catch(error => {
          console.error('Background token refresh failed:', error.message);
        });
      }

      // Get user profile with the (potentially refreshed) token
      console.log('Fetching user profile from API');
      const response = await api.get('/api/auth/me');

      // Validate user data
      if (!response.data || typeof response.data !== 'object') {
        console.error('Invalid user data received:', response.data);
        return null;
      }

      console.log('Current user fetched successfully');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Fetch user info asynchronously without waiting for response
  fetchUserInfoAsync: async () => {
    try {
      console.log('Fetching user info in background');
      const response = await api.get('/api/auth/me');
      console.log('Background user info fetch completed');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user info in background:', {
        message: error.message,
        status: error.response?.status
      });
      return null;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      console.log('Attempting to refresh access token');
      // Get tokens using tokenUtils
      const { refreshToken } = tokenUtils.getTokens();

      if (!refreshToken) {
        console.error('Refresh token not found in storage');
        return false;
      }

      const response = await api.post('/api/auth/refresh-token', { refreshToken });

      // Log the response structure for debugging
      console.log('Refresh token API response structure:', JSON.stringify(response.data, null, 2));

      // Validate response
      if (!response.data || !response.data.accessToken) {
        console.error('Invalid refresh token response:', response.data);
        return false;
      }

      const { accessToken } = response.data;

      // Validate the new access token
      if (!tokenUtils.validateToken(accessToken)) {
        console.error('Invalid access token received from refresh');
        return false;
      }

      // Store the new access token while keeping the same refresh token
      const tokensStored = tokenUtils.storeTokens(accessToken, refreshToken);
      if (!tokensStored) {
        console.error('Failed to store refreshed access token');
        return false;
      }

      console.log('Token refresh successful');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', {
        message: error.message,
        responseStatus: error.response?.status,
        responseData: error.response?.data
      });
      return false;
    }
  },

  // Login with Google
  loginWithGoogle: async () => {
    try {
      console.log('Attempting Google login');
      // In a real app, this would likely open a popup window for OAuth
      // For now, we'll just simulate with an API call
      const response = await api.post('/api/auth/google');

      // Log the response structure for debugging
      console.log('Google login API response structure:', JSON.stringify(response.data, null, 2));

      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        console.error('Invalid response format from Google login:', response.data);
        throw new Error('Invalid response format from server');
      }

      const { accessToken, refreshToken, user } = response.data;

      // Validate tokens
      if (!accessToken || !refreshToken) {
        console.error('Missing tokens in Google login response:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });
        throw new Error('Authentication failed: Missing tokens in response');
      }

      // Validate user object
      if (!user || typeof user !== 'object') {
        console.error('Missing or invalid user object in Google login response:', user);
        throw new Error('Authentication failed: Invalid user data');
      }

      // Use tokenUtils to store tokens securely with expiration
      const tokensStored = tokenUtils.storeTokens(accessToken, refreshToken);
      if (!tokensStored) {
        console.error('Failed to store Google authentication tokens');
        throw new Error('Authentication failed: Could not store tokens');
      }

      console.log('Google login successful for user:', user.username || user.email || 'Unknown');
      return user;
    } catch (error) {
      console.error('Google login error:', {
        message: error.message,
        responseStatus: error.response?.status,
        responseData: error.response?.data
      });
      throw new Error(error.response?.data?.message || 'Đăng nhập Google thất bại');
    }
  },

  // Login with Facebook
  loginWithFacebook: async () => {
    try {
      console.log('Attempting Facebook login');
      // Similar to Google login
      const response = await api.post('/api/auth/facebook');

      // Log the response structure for debugging
      console.log('Facebook login API response structure:', JSON.stringify(response.data, null, 2));

      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        console.error('Invalid response format from Facebook login:', response.data);
        throw new Error('Invalid response format from server');
      }

      const { accessToken, refreshToken, user } = response.data;

      // Validate tokens
      if (!accessToken || !refreshToken) {
        console.error('Missing tokens in Facebook login response:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });
        throw new Error('Authentication failed: Missing tokens in response');
      }

      // Validate user object
      if (!user || typeof user !== 'object') {
        console.error('Missing or invalid user object in Facebook login response:', user);
        throw new Error('Authentication failed: Invalid user data');
      }

      // Use tokenUtils to store tokens securely with expiration
      const tokensStored = tokenUtils.storeTokens(accessToken, refreshToken);
      if (!tokensStored) {
        console.error('Failed to store Facebook authentication tokens');
        throw new Error('Authentication failed: Could not store tokens');
      }

      console.log('Facebook login successful for user:', user.username || user.email || 'Unknown');
      return user;
    } catch (error) {
      console.error('Facebook login error:', {
        message: error.message,
        responseStatus: error.response?.status,
        responseData: error.response?.data
      });
      throw new Error(error.response?.data?.message || 'Đăng nhập Facebook thất bại');
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    console.warn('DEPRECATED: authService.updateProfile() đã được di chuyển sang userService.updateProfile()');
    try {
      const response = await api.put('/api/users/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    }
  },

  // Upload avatar
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

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Thay đổi mật khẩu thất bại');
    }
  },

  // Request password reset (forgot password)
  forgotPassword: async (email) => {
    try {
      console.log('Starting password reset process for email:', email);

      // Validate email format
      if (!email || !email.includes('@')) {
        throw new Error('Email không hợp lệ');
      }

      // First check if email exists in database
      try {
        console.log('Checking if email exists in database...');
        const checkResponse = await axios.post(`${API_URL}/check-email`, { email });

        if (!checkResponse.data.exists) {
          console.log('Email not found in database');
          // Return success even if email doesn't exist (security best practice)
          return {
            message: 'Nếu email của bạn đã đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu'
          };
        }
      } catch (error) {
        console.error('Error checking email:', error);
        // Continue with reset process even if check fails
      }

      // Get the reset token from backend
      console.log('Calling backend forgot-password endpoint...');
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
        reset_url_base: window.location.origin
      });

      console.log('Backend response:', response.data);

      if (!response.data.reset_url) {
        console.error('No reset URL in response');
        throw new Error('Không thể tạo liên kết đặt lại mật khẩu');
      }

      // Validate EmailJS configuration
      if (!EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.TEMPLATE_ID) {
        console.error('Missing EmailJS configuration');
        throw new Error('Cấu hình email không hợp lệ');
      }

      // Prepare template parameters - match exactly with template variables
      const templateParams = {
        message: 'Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu của bạn:',
        reset_link: response.data.reset_url,
        to_email: email // This is required by EmailJS for the recipient
      };

      // Send email using EmailJS
      console.log('Sending email using EmailJS...');
      try {
        console.log('Sending email with params:', templateParams);

        // Log the exact configuration being used
        console.log('EmailJS Configuration:', {
          serviceId: EMAILJS_CONFIG.SERVICE_ID,
          templateId: EMAILJS_CONFIG.TEMPLATE_ID,
          publicKey: EMAILJS_CONFIG.PUBLIC_KEY
        });

        const emailResponse = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          templateParams,
          EMAILJS_CONFIG.PUBLIC_KEY
        );

        console.log('EmailJS response:', emailResponse);

        if (emailResponse.status !== 200) {
          throw new Error('Email sending failed with status: ' + emailResponse.status);
        }

        // Return success message
        return {
          message: 'Nếu email của bạn đã đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu'
        };
      } catch (emailError) {
        console.error('EmailJS error:', emailError);
        // Check for specific EmailJS errors
        if (emailError.text && emailError.text.includes('recipients address is empty')) {
          console.error('EmailJS template configuration:', {
            serviceId: EMAILJS_CONFIG.SERVICE_ID,
            templateId: EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams: templateParams
          });
          throw new Error('Lỗi cấu hình email: Vui lòng kiểm tra lại template EmailJS');
        } else if (emailError.text && emailError.text.includes('service ID not found')) {
          throw new Error('Lỗi cấu hình email: Service ID không hợp lệ');
        } else if (emailError.text && emailError.text.includes('template ID not found')) {
          throw new Error('Lỗi cấu hình email: Template ID không hợp lệ');
        } else {
          throw new Error('Không thể gửi email đặt lại mật khẩu: ' + (emailError.text || emailError.message));
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error; // Throw the original error with more specific message
    }
  },

  // Reset password with token
  resetPassword: async (resetToken, newPassword) => {
    try {
      console.log('Resetting password with token:', resetToken);

      const response = await axios.post(`${API_URL}/reset-password`, {
        reset_token: resetToken,
        new_password: newPassword
      });

      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Đặt lại mật khẩu thất bại');
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      await api.post('/api/auth/verify-email', { token });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Xác minh email thất bại');
    }
  },

  // Get user cart from server
  getUserCart: async () => {
    try {
      console.log('Fetching user cart from server');
      const response = await api.get('/api/users/cart');

      if (response.data) {
        // Đảm bảo cấu trúc dữ liệu giỏ hàng nhất quán
        let items = [];

        if (Array.isArray(response.data)) {
          // Nếu response.data là mảng, đó là danh sách các sản phẩm
          items = response.data;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          // Nếu response.data có thuộc tính items là mảng
          items = response.data.items;
        } else if (typeof response.data === 'object') {
          // Nếu response.data là object nhưng không có thuộc tính items
          // Chuyển đổi thành mảng nếu cần
          items = Object.values(response.data).filter(item =>
            item && typeof item === 'object' && item.product_id
          );
        }

        // Tính tổng tiền nếu chưa có
        let totalAmount = response.data.totalAmount || 0;
        if (!totalAmount && items.length > 0) {
          totalAmount = items.reduce((total, item) => {
            const price = item.product?.price || 0;
            const quantity = item.quantity || 0;
            return total + (price * quantity);
          }, 0);
        }

        const cartData = {
          items: items,
          totalAmount: totalAmount
        };

        console.log('User cart fetched successfully:', cartData);
        return cartData;
      }

      return { items: [], totalAmount: 0 };
    } catch (error) {
      console.error('Failed to fetch user cart:', error);
      return { items: [], totalAmount: 0 };
    }
  },

  // Sync cart with server
  syncCart: async (cartItems) => {
    try {
      console.log('Syncing cart with server:', cartItems);

      // Nếu không có sản phẩm nào trong giỏ hàng, không cần đồng bộ
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        console.log('Cart is empty or invalid, skipping sync');
        return;
      }

      // Đồng bộ từng sản phẩm một
      for (const item of cartItems) {
        if (!item.product_id || !item.quantity) {
          console.log('Skipping invalid cart item:', item);
          continue;
        }

        try {
          console.log('Syncing cart item:', item);
          const response = await api.post('/api/users/cart', {
            product_id: item.product_id,
            quantity: item.quantity
          });
          console.log('Sync response for item:', response.data);
        } catch (error) {
          console.error('Error syncing cart item:', error.response?.data || error.message);
          // Tiếp tục với item tiếp theo nếu có lỗi
          continue;
        }
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
      throw error;
    }
  },

  resetPassword: async (resetToken, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        reset_token: resetToken,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Đặt lại mật khẩu thất bại');
    }
  }
};

// Export tokenUtils để có thể sử dụng trong các component khác
authService.tokenUtils = tokenUtils;

export default authService;
