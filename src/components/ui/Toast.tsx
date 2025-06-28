import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: {
    container: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    icon: 'text-emerald-400',
    progress: 'bg-emerald-500',
  },
  error: {
    container: 'bg-red-500/20 border-red-500/30 text-red-400',
    icon: 'text-red-400',
    progress: 'bg-red-500',
  },
  warning: {
    container: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    icon: 'text-yellow-400',
    progress: 'bg-yellow-500',
  },
  info: {
    container: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    icon: 'text-blue-400',
    progress: 'bg-blue-500',
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
  action,
}) => {
  const Icon = toastIcons[type];
  const styles = toastStyles[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ 
        opacity: 0, 
        x: 300, 
        scale: 0.5, 
        transition: { duration: 0.2 } 
      }}
      className={cn(
        'relative flex items-start space-x-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg max-w-sm overflow-hidden',
        styles.container
      )}
      layout
    >
      {/* Progress bar */}
      {duration > 0 && (
        <motion.div
          className={cn('absolute bottom-0 left-0 h-1 rounded-full', styles.progress)}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}

      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', styles.icon)} />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {message && (
          <p className="text-sm opacity-90 mt-1">{message}</p>
        )}
        
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-medium underline mt-2 hover:no-underline transition-all"
          >
            {action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC<{
  toasts: ToastProps[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}> = ({ 
  toasts, 
  onClose, 
  position = 'top-right' 
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div className={cn('fixed z-50 space-y-2', getPositionClasses())}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback((
    type: ToastProps['type'],
    title: string,
    options?: {
      message?: string;
      duration?: number;
      action?: ToastProps['action'];
    }
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastProps = {
      id,
      type,
      title,
      message: options?.message,
      duration: options?.duration,
      action: options?.action,
      onClose: removeToast,
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = React.useCallback((title: string, options?: Parameters<typeof addToast>[2]) => {
    return addToast('success', title, options);
  }, [addToast]);

  const error = React.useCallback((title: string, options?: Parameters<typeof addToast>[2]) => {
    return addToast('error', title, options);
  }, [addToast]);

  const warning = React.useCallback((title: string, options?: Parameters<typeof addToast>[2]) => {
    return addToast('warning', title, options);
  }, [addToast]);

  const info = React.useCallback((title: string, options?: Parameters<typeof addToast>[2]) => {
    return addToast('info', title, options);
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