// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { CategoryProvider } from './context/CategoryContext';
import { ToastProvider } from './context/ToastContext';
import ChatWindow from './components/chat/ChatWindow/ChatWindow';
import ChatButton from './components/chat/ChatButton/ChatButton';
import ProductSelector from './components/chat/ProductSelector/ProductSelector';

// Layout Components
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Routes
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CategoryProducts from './pages/CategoryProducts';
import CategoryList from './pages/CategoryList';
import SearchResults from './pages/SearchResults';
import Cart from './pages/cart/Cart';
import Checkout from './pages/cart/Checkout';
import PaymentSuccess from './pages/cart/PaymentSuccess';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/user/Profile';
import Orders from './pages/user/Orders';
import OrderDetail from './pages/user/OrderDetail';
import Wishlist from './pages/user/Wishlist';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/UserList';
import AdminProducts from './pages/admin/ProductList';
import AdminOrders from './pages/admin/OrderList';
import AdminOrdersSimple from './pages/admin/OrderListSimple';
import AdminCategories from './pages/admin/CategoryList';
import NotFound from './pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <CartProvider>
                <CategoryProvider>
                  <ChatProvider>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/categories" element={<CategoryList />} />
                      <Route path="/categories/:id" element={<CategoryProducts />} />
                      <Route path="/categories/:id/:slug" element={<CategoryProducts />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/search" element={<SearchResults />} />
                      <Route path="/cart" element={<Cart />} />

                      {/* Auth Routes */}
                      <Route path="/login" element={
                        <AuthLayout>
                          <Login />
                        </AuthLayout>
                      } />
                      <Route path="/register" element={
                        <AuthLayout>
                          <Register />
                        </AuthLayout>
                      } />
                      <Route path="/forgot-password" element={
                        <AuthLayout>
                          <ForgotPassword />
                        </AuthLayout>
                      } />

                      {/* Protected User Routes */}
                      <Route path="/checkout" element={
                        <PrivateRoute>
                          <Checkout />
                        </PrivateRoute>
                      } />
                      <Route path="/payment-success" element={
                        <PrivateRoute>
                          <PaymentSuccess />
                        </PrivateRoute>
                      } />
                      <Route path="/profile" element={
                        <PrivateRoute>
                          <Profile />
                        </PrivateRoute>
                      } />
                      <Route path="/orders" element={
                        <PrivateRoute>
                          <Orders />
                        </PrivateRoute>
                      } />
                      <Route path="/orders/:id" element={
                        <PrivateRoute>
                          <OrderDetail />
                        </PrivateRoute>
                      } />
                      <Route path="/wishlist" element={
                        <PrivateRoute>
                          <Wishlist />
                        </PrivateRoute>
                      } />

                      {/* Admin Routes */}
                      <Route path="/admin" element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      } />
                      <Route path="/admin/users" element={
                        <AdminRoute>
                          <AdminUsers />
                        </AdminRoute>
                      } />
                      <Route path="/admin/products" element={
                        <AdminRoute>
                          <AdminProducts />
                        </AdminRoute>
                      } />
                      <Route path="/admin/orders" element={
                        <AdminRoute>
                          <AdminOrders />
                        </AdminRoute>
                      } />
                      <Route path="/admin/orders-simple" element={
                        <AdminRoute>
                          <AdminOrdersSimple />
                        </AdminRoute>
                      } />
                      <Route path="/admin/categories" element={
                        <AdminRoute>
                          <AdminCategories />
                        </AdminRoute>
                      } />

                      {/* 404 Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <ChatButton />
                    <ChatWindow />
                    <ProductSelector />
                  </ChatProvider>
                </CategoryProvider>
              </CartProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;