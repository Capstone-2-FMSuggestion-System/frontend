// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { CartContext } from './CartContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing authentication state...');
        // Sử dụng tokenUtils.getTokens() để lấy token từ cookie
        const { accessToken, tokenExpiry } = authService.tokenUtils.getTokens();
        console.log('Token found in cookies:', !!accessToken);

        if (accessToken) {
          // Kiểm tra token có hợp lệ không
          if (!authService.tokenUtils.validateToken(accessToken)) {
            console.error('Invalid token format');
            // Không xóa token khi refresh trang, chỉ đánh dấu là không xác thực
            setLoading(false);
            return;
          }

          // Kiểm tra token có hết hạn không
          if (authService.tokenUtils.isTokenExpired(tokenExpiry)) {
            console.log('Token expired, attempting to refresh');
            // Thử refresh token thay vì xóa ngay lập tức
            try {
              const refreshed = await authService.refreshToken();
              if (!refreshed) {
                console.log('Token refresh failed, but keeping token for now');
              }
            } catch (error) {
              console.error('Token refresh error:', error);
            }
            setLoading(false);
            return;
          }

          // Lấy thông tin user từ API
          const user = await authService.getCurrentUser();
          if (user) {
            setCurrentUser(user);
            console.log('Restored user session:', user);

            // Tải giỏ hàng của người dùng từ server
            try {
              const userCart = await authService.getUserCart();
              if (userCart && userCart.items && userCart.items.length > 0) {
                // Lưu giỏ hàng của người dùng vào localStorage
                localStorage.setItem('cart', JSON.stringify(userCart));
                console.log('User cart loaded from server:', userCart);
              }
            } catch (cartError) {
              console.error('Failed to load user cart:', cartError);
            }
          } else {
            // Nếu không lấy được thông tin user, thử giải mã token để lấy thông tin cơ bản
            try {
              const decodedToken = authService.tokenUtils.decodeToken(accessToken);
              if (decodedToken && decodedToken.user_id) {
                // Tạo user object từ thông tin trong token
                const basicUser = {
                  id: decodedToken.user_id,
                  username: decodedToken.username || 'User',
                  role: decodedToken.role || 'user'
                };
                setCurrentUser(basicUser);
                console.log('Created basic user from token:', basicUser);
              } else {
                console.log('Could not extract user info from token');
              }
            } catch (error) {
              console.error('Failed to decode token:', error);
            }
          }
        } else {
          console.log('No token found, user is not authenticated');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Không xóa token khi có lỗi xảy ra, chỉ ghi log lỗi
        // Giữ token để người dùng có thể thử lại sau
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Thêm console.log để debug quá trình đăng nhập

  const login = async (username_or_email, password) => {
    setError(null);
    try {
      // Lưu giỏ hàng của khách trước khi đăng nhập
      const guestCart = JSON.parse(localStorage.getItem('cart') || '{"items": [], "totalAmount": 0}');

      // Đăng nhập ban đầu để lấy thông tin cơ bản
      const basicUser = await authService.login(username_or_email, password);

      // Cập nhật thông tin user cơ bản ngay lập tức để người dùng được chuyển hướng 
      setCurrentUser(basicUser);

      // Sau đó, lấy thêm thông tin chi tiết từ API /api/auth/me và cập nhật lại state
      // một cách bất đồng bộ để không làm chậm trải nghiệm người dùng
      setTimeout(async () => {
        try {
          const detailedUser = await authService.getCurrentUser();
          if (detailedUser) {
            console.log('Updating user with detailed info from /api/auth/me');
            setCurrentUser(detailedUser);

            // Tải giỏ hàng của người dùng từ server
            try {
              const userCart = await authService.getUserCart();

              // Nếu có giỏ hàng của user trên server
              if (userCart.items && userCart.items.length > 0) {
                // Sử dụng giỏ hàng của user
                localStorage.setItem('cart', JSON.stringify(userCart));
                console.log('Loaded user cart from server:', userCart);
              }
              // Nếu không có giỏ hàng của user trên server nhưng có giỏ hàng của khách
              else if (guestCart.items && guestCart.items.length > 0) {
                // Đồng bộ giỏ hàng của khách lên server
                await authService.syncCart(guestCart.items);
                console.log('Synced guest cart to user account:', guestCart);

                // Tải lại giỏ hàng từ server sau khi đồng bộ
                const updatedCart = await authService.getUserCart();
                localStorage.setItem('cart', JSON.stringify(updatedCart));
                console.log('Loaded updated cart from server:', updatedCart);
              } else {
                // Nếu không có giỏ hàng nào, tạo giỏ hàng mới trống
                localStorage.setItem('cart', JSON.stringify({ items: [], totalAmount: 0 }));
                console.log('Created new empty cart for user');
              }
            } catch (cartError) {
              console.error('Failed to load user cart:', cartError);
              // Nếu không thể tải giỏ hàng, tạo giỏ hàng mới
              localStorage.setItem('cart', JSON.stringify({ items: [], totalAmount: 0 }));
            }
          }
        } catch (error) {
          console.error('Failed to get detailed user info:', error);
        }
      }, 0);
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name, email, phone, password, username) => {
    setError(null);
    try {
      const user = await authService.register(username, name, email, phone, password);
      return user;
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Đăng xuất
      await authService.logout();
      setCurrentUser(null);

      // Xóa giỏ hàng khỏi localStorage và đặt lại thành trống
      localStorage.setItem('cart', JSON.stringify({
        items: [],
        totalAmount: 0,
        shippingFee: 0,
        tax: 0,
        discount: 0,
        notes: '',
        savedForLater: []
      }));
      console.log('User logged out, cart reset to empty');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const user = await authService.loginWithGoogle();
      setCurrentUser(user);
      return user;
    } catch (error) {
      setError(error.message || 'Google login failed');
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    try {
      const user = await authService.loginWithFacebook();
      setCurrentUser(user);
      return user;
    } catch (error) {
      setError(error.message || 'Facebook login failed');
      throw error;
    }
  };

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      setError(error.message || 'Profile update failed');
      throw error;
    }
  };

  const updateAvatar = async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('file', avatarFile);

      const result = await authService.updateAvatar(formData);
      if (result && result.avatar_url) {
        // Cập nhật thông tin user trong context để cập nhật UI toàn ứng dụng
        setCurrentUser(prevUser => ({
          ...prevUser,
          avatar_url: result.avatar_url
        }));
        return result;
      }
      return null;
    } catch (error) {
      setError(error.message || 'Avatar update failed');
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      setError(error.message || 'Password change failed');
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      setError(error.message || 'Password reset failed');
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    updateProfile,
    updateAvatar,
    changePassword,
    resetPassword,
    user: currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Thêm hook useAuth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
