import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types';

interface RiskMeterProps {
  score: number;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  animated = true,
  size = 'md',
  showLabel = true,
  className
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (animated && isRevealed) {
      const timer = setInterval(() => {
        setDisplayScore(prev => {
          if (prev >= score) {
            clearInterval(timer);
            return score;
          }
          return prev + 1;
        });
      }, 20);

      return () => clearInterval(timer);
    } else if (!animated) {
      setDisplayScore(score);
    }
  }, [score, animated, isRevealed]);

  const getRiskLevel = (score: number): RiskLevel => {
    if (score < 20) return 'SAFE';
    if (score < 40) return 'MILD';
    if (score < 60) return 'MODERATE';
    if (score < 80) return 'HIGH';
    return 'EXTREME';
  };

  const getRiskColor = (level: RiskLevel): string => {
    const colors = {
      SAFE: '#10B981',     // emerald-500
      MILD: '#F59E0B',     // amber-500
      MODERATE: '#F97316', // orange-500
      HIGH: '#EF4444',     // red-500
      EXTREME: '#DC2626',  // red-600
    };
    return colors[level];
  };

  const getRiskGradient = (level: RiskLevel): string => {
    const gradients = {
      SAFE: 'from-emerald-400 to-emerald-600',
      MILD: 'from-yellow-400 to-amber-600',
      MODERATE: 'from-orange-400 to-orange-600',
      HIGH: 'from-red-400 to-red-600',
      EXTREME: 'from-red-500 to-red-700',
    };
    return gradients[level];
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { container: 'w-32 h-32', text: 'text-2xl', label: 'text-xs' };
      case 'lg':
        return { container: 'w-64 h-64', text: 'text-6xl', label: 'text-base' };
      default:
        return { container: 'w-48 h-48', text: 'text-4xl', label: 'text-sm' };
    }
  };

  const riskLevel = getRiskLevel(displayScore);
  const riskColor = getRiskColor(riskLevel);
  const sizeClasses = getSizeClasses();
  
  // SVG circle calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className={cn('relative mx-auto', sizeClasses.container, className)}>
      <motion.div
        className="relative w-full h-full"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        onAnimationComplete={() => setIsRevealed(true)}
      >
        {/* SVG Meter */}
        <svg 
          className="w-full h-full transform -rotate-90" 
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={riskColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 8px ${riskColor}40)`,
            }}
          />
          
          {/* Glow effect for high risk */}
          {riskLevel === 'EXTREME' && (
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={riskColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              opacity="0.3"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </svg>

        {/* Score display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className={cn('font-bold', sizeClasses.text)}
              style={{ color: riskColor }}
              key={displayScore}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.1 }}
            >
              {displayScore}
            </motion.div>
            {showLabel && (
              <div className={cn('text-gray-400 mt-1', sizeClasses.label)}>
                Risk Score
              </div>
            )}
          </div>
        </div>

        {/* Risk level indicator */}
        <motion.div
          className={cn(
            'absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold',
            `bg-gradient-to-r ${getRiskGradient(riskLevel)} text-white`
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          {riskLevel}
        </motion.div>

        {/* Pulse effect for extreme risk */}
        {riskLevel === 'EXTREME' && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-red-500"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    </div>
  );
};