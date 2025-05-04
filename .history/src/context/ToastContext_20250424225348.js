import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import Toast from '../components/common/Toast/Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = {
      id,
      type: toast.type || 'info',
      title: toast.title || 'Thông báo',
      message: toast.message || '',
      duration: toast.duration || 3000,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearToasts }}>
      {children}
      <Toast toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return {
    ...context,
    success: (toast) => context.addToast({ ...toast, type: 'success' }),
    error: (toast) => context.addToast({ ...toast, type: 'error' }),
    info: (toast) => context.addToast({ ...toast, type: 'info' }),
  };
};

export default ToastContext; 