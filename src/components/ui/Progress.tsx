import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
  animated?: boolean;
}

const colors = {
  primary: 'bg-gradient-to-r from-purple-500 to-pink-500',
  success: 'bg-gradient-to-r from-emerald-500 to-green-500',
  warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  danger: 'bg-gradient-to-r from-red-500 to-red-600',
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  color = 'primary',
  showValue = false,
  animated = true,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {showValue && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-300">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', colors[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 0.8 : 0,
            ease: 'easeOut',
          }}
        />
      </div>
    </div>
  );
};