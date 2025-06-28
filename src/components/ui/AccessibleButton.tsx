import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getAriaAttributes } from '@/utils/accessibility';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  loadingText?: string;
}

const variants = {
  primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl focus:ring-purple-500',
  secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 focus:ring-gray-500',
  ghost: 'hover:bg-gray-800 text-gray-300 hover:text-white focus:ring-gray-500',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ariaLabel,
  ariaDescribedBy,
  loadingText,
  ...props
}) => {
  const isDisabled = disabled || loading;
  
  const ariaAttributes = getAriaAttributes('button', {
    label: ariaLabel,
    describedBy: ariaDescribedBy,
    disabled: isDisabled,
  });

  return (
    <motion.button
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isDisabled}
      {...ariaAttributes}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {loading && loadingText ? loadingText : children}
    </motion.button>
  );
};