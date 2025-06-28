import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'rectangular',
  animation = 'pulse',
  lines = 1
}) => {
  const baseClasses = 'bg-gray-700 rounded';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full';
      case 'circular':
        return 'rounded-full aspect-square';
      case 'rectangular':
      default:
        return 'h-4 w-full';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[wave_1.5s_ease-in-out_infinite]';
      case 'pulse':
        return 'animate-pulse';
      case 'none':
      default:
        return '';
    }
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }, (_, index) => (
          <motion.div
            key={index}
            className={cn(
              baseClasses,
              getVariantClasses(),
              getAnimationClasses(),
              index === lines - 1 && 'w-3/4' // Last line is shorter
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        baseClasses,
        getVariantClasses(),
        getAnimationClasses(),
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    />
  );
};

// Specific skeleton components for common use cases
export const AnalysisResultSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Score meter skeleton */}
    <div className="text-center">
      <LoadingSkeleton variant="circular" className="w-48 h-48 mx-auto mb-4" />
      <LoadingSkeleton variant="text" className="w-32 mx-auto" />
    </div>

    {/* Roast section skeleton */}
    <div className="space-y-4">
      <LoadingSkeleton variant="text" className="w-24" />
      <LoadingSkeleton variant="text" lines={3} />
    </div>

    {/* Categories skeleton */}
    <div className="space-y-4">
      <LoadingSkeleton variant="text" className="w-32" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-2">
            <LoadingSkeleton variant="text" className="w-20" />
            <LoadingSkeleton variant="rectangular" className="h-2" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const LeaderboardSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }, (_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4">
        <LoadingSkeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="w-32" />
          <LoadingSkeleton variant="text" className="w-48" />
        </div>
        <LoadingSkeleton variant="text" className="w-16" />
      </div>
    ))}
  </div>
);

export const HistorySkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index} className="p-4 border border-gray-700 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <LoadingSkeleton variant="text" className="w-24" />
          <LoadingSkeleton variant="text" className="w-16" />
        </div>
        <LoadingSkeleton variant="text" lines={2} />
        <LoadingSkeleton variant="text" className="w-3/4" />
      </div>
    ))}
  </div>
);