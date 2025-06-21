import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = true,
  gradient = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2 } : undefined}
      className={cn(
        'rounded-2xl border border-gray-800/50 p-6 transition-all duration-300',
        gradient
          ? 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl'
          : 'bg-gray-900/50 backdrop-blur-sm',
        hover && 'hover:border-gray-700/50 hover:shadow-xl hover:shadow-purple-500/10',
        className
      )}
    >
      {children}
    </motion.div>
  );
};