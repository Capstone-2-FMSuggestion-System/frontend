// src/context/CartContext.js
import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Initialize cart from localStorage if available
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : { items: [], totalAmount: 0 };
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      // Check if product already exists in cart
      const existingItemIndex = prevCart.items.findIndex(
        item => item.id === product.id
      );

      let newItems;

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        newItems = [...prevCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity
        };
        toast.success(`Đã cập nhật số lượng ${product.name} trong giỏ hàng!`);
      } else {
        // Add new item to cart
        newItems = [
          ...prevCart.items,
          {
            ...product,
            quantity
          }
        ];
        toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
      }

      // Calculate new total
      const totalAmount = newItems.reduce(
        (total, item) => total + (item.discountPrice || item.price) * item.quantity,
        0
      );

      return {
        items: newItems,
        totalAmount
      };
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const removedItem = prevCart.items.find(item => item.id === productId);
      const newItems = prevCart.items.filter(item => item.id !== productId);
      
      // Calculate new total
      const totalAmount = newItems.reduce(
        (total, item) => total + (item.discountPrice || item.price) * item.quantity,
        0
      );

      if (removedItem) {
        toast.info(`Đã xóa ${removedItem.name} khỏi giỏ hàng`);
      }

      return {
        items: newItems,
        totalAmount
      };
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;

    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      
      const updatedItem = newItems.find(item => item.id === productId);
      if (updatedItem) {
        toast.info(`Đã cập nhật số lượng ${updatedItem.name} thành ${quantity}`);
      }

      // Calculate new total
      const totalAmount = newItems.reduce(
        (total, item) => total + (item.discountPrice || item.price) * item.quantity,
        0
      );

      return {
        items: newItems,
        totalAmount
      };
    });
  };

  const clearCart = () => {
    setCart({ items: [], totalAmount: 0 });
    toast.info('Đã xóa toàn bộ giỏ hàng');
  };

  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
