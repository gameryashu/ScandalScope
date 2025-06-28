import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap, Flame } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'roast' | 'analysis';
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
  roast: {
    icon: Flame,
    className: 'text-orange-400',
  },
  analysis: {
    icon: Zap,
    className: 'text-blue-400',
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
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
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
    </div>
  );
};

export const LoadingOverlay: React.FC<{
  isVisible: boolean;
  text?: string;
  variant?: LoadingSpinnerProps['variant'];
}> = ({ isVisible, text, variant }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl"
    >
      <LoadingSpinner size="lg" variant={variant} text={text} />
    </motion.div>
  );
};