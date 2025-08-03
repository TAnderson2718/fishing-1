import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ToastContainer } from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // 自动移除toast
    setTimeout(() => {
      removeToast(id);
    }, toast.duration + 300); // 额外300ms用于动画

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // ✅ 使用 useMemo 优化便捷方法，避免每次渲染都创建新对象
  const toast = useMemo(() => ({
    success: (message, options) => addToast(message, 'success', options),
    error: (message, options) => addToast(message, 'error', options),
    warning: (message, options) => addToast(message, 'warning', options),
    info: (message, options) => addToast(message, 'info', options),
  }), [addToast]);

  // ✅ 使用 useMemo 优化 context value，避免不必要的重新渲染
  const value = useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    toast
  }), [toasts, addToast, removeToast, removeAllToasts, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
