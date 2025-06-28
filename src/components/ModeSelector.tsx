import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { RoastMode } from '@/types/roast';
import { ROAST_MODE_CONFIGS } from '@/utils/promptEngineering';

interface ModeSelectorProps {
  selectedMode: RoastMode;
  onModeChange: (mode: RoastMode) => void;
  disabled?: boolean;
  className?: string;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredMode, setHoveredMode] = React.useState<RoastMode | null>(null);

  const selectedConfig = ROAST_MODE_CONFIGS[selectedMode];

  const handleModeSelect = (mode: RoastMode) => {
    onModeChange(mode);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Selected Mode Display */}
      <motion.button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full p-4 rounded-xl border border-gray-700 bg-gray-800/50",
          "flex items-center justify-between",
          "hover:border-gray-600 hover:bg-gray-800/70",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isOpen && "border-purple-500/50 bg-gray-800/70"
        )}
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
      >
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
            `bg-gradient-to-r ${selectedConfig.color}`
          )}>
            {selectedConfig.icon}
          </div>
          <div className="text-left">
            <div className="font-semibold text-white">
              {selectedConfig.name}
            </div>
            <div className="text-sm text-gray-400">
              {selectedConfig.description}
            </div>
          </div>
        </div>
        
        <ChevronDown className={cn(
          "h-5 w-5 text-gray-400 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-xl overflow-hidden">
              {Object.entries(ROAST_MODE_CONFIGS).map(([mode, config]) => (
                <motion.button
                  key={mode}
                  onClick={() => handleModeSelect(mode as RoastMode)}
                  onHoverStart={() => setHoveredMode(mode as RoastMode)}
                  onHoverEnd={() => setHoveredMode(null)}
                  className={cn(
                    "w-full p-4 flex items-center space-x-3",
                    "hover:bg-gray-700/50 transition-colors duration-200",
                    "border-b border-gray-700/50 last:border-b-0",
                    selectedMode === mode && "bg-gray-700/30"
                  )}
                  whileHover={{ x: 4 }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
                    `bg-gradient-to-r ${config.color}`
                  )}>
                    {config.icon}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white">
                      {config.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {config.description}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                      Intensity: {config.intensity}/10
                    </div>
                    {hoveredMode === mode && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-purple-400"
                      >
                        <Info className="h-4 w-4" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Examples */}
      <AnimatePresence>
        {hoveredMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
          >
            <h4 className="text-sm font-medium text-white mb-2">
              Example {ROAST_MODE_CONFIGS[hoveredMode].name} Responses:
            </h4>
            <div className="space-y-2">
              {ROAST_MODE_CONFIGS[hoveredMode].examples.map((example, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-300 italic p-2 bg-gray-900/30 rounded"
                >
                  "{example}"
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};