import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  labels?: string[];
}

export const IntensitySlider: React.FC<IntensitySliderProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  disabled = false,
  className,
  labels = ['Gentle', 'Moderate', 'Savage'],
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'from-emerald-500 to-green-500';
    if (intensity <= 6) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Slider Track */}
      <div className="relative">
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full bg-gradient-to-r transition-all duration-300',
              getIntensityColor(value)
            )}
            style={{ width: `${percentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
          />
        </div>

        {/* Slider Thumb */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer',
            `bg-gradient-to-r ${getIntensityColor(value)}`,
            disabled && 'cursor-not-allowed opacity-50'
          )}
          style={{ left: `calc(${percentage}% - 12px)` }}
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
        />

        {/* Hidden Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-400">
        {labels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>

      {/* Value Indicators */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-1">
          {Array.from({ length: max }, (_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                i < value
                  ? `bg-gradient-to-r ${getIntensityColor(value)}`
                  : 'bg-gray-700'
              )}
            />
          ))}
        </div>
        
        <span className="text-sm font-medium text-white">
          {value}/{max}
        </span>
      </div>
    </div>
  );
};