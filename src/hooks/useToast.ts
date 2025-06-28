import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((
    type: ToastData['type'],
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = uuidv4();
    const toast: ToastData = {
      id,
      type,
      title,
      message,
      duration,
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    return addToast('success', title, message);
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    return addToast('error', title, message);
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    return addToast('warning', title, message);
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    return addToast('info', title, message);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}