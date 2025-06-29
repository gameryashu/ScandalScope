import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'analysis' | 'roast';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const variants = {
  default: {
    icon: Loader2,
    className: 'text-purple-400',
  },
  analysis: {
    icon: Zap,
    className: 'text-blue-400',
  },
  roast: {
    icon: Flame,
    className: 'text-orange-400',
  },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  text,
}) => {
  const { icon: Icon, className: variantClass } = variants[variant];

  return (
    <div className={cn('flex items-center justify-center', className)} role="status" aria-live="polite">
      <div className="flex flex-col items-center space-y-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        >
          <Icon className={cn(sizeClasses[size], variantClass)} />
        </motion.div>
        
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-400"
          >
            {text}
          </motion.p>
        )}
      </div>
      <span className="sr-only">{text || 'Loading...'}</span>
    </div>
  );
};