import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Loader2, RefreshCw, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { RoastConfig, RoastMode } from '@/types/roast';
import { useRoastGenerator } from '@/hooks/useRoastGenerator';
import { ROAST_MODE_CONFIGS } from '@/utils/promptEngineering';
import toast from 'react-hot-toast';

interface RoastButtonProps {
  text: string;
  selectedMode: RoastMode;
  intensity: number;
  disabled?: boolean;
  className?: string;
  onRoastGenerated?: (roast: any) => void;
}

export const RoastButton: React.FC<RoastButtonProps> = ({
  text,
  selectedMode,
  intensity,
  disabled = false,
  className,
  onRoastGenerated
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { generateRoast, regenerateRoast, isGenerating, currentRoast } = useRoastGenerator();

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;

    const config: RoastConfig = {
      mode: selectedMode,
      intensity,
      includeEmojis: true,
      maxLength: 200
    };

    const result = await generateRoast(text, config);
    if (result && onRoastGenerated) {
      onRoastGenerated(result);
    }
  };

  const handleRegenerate = async () => {
    const result = await regenerateRoast();
    if (result && onRoastGenerated) {
      onRoastGenerated(result);
    }
  };

  const handleShare = async () => {
    if (!currentRoast) return;

    const shareText = `Got roasted by ScandalScope! 🔥\n\n"${currentRoast.content}"\n\nTry it yourself: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ScandalScope Roast',
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        toast.success('Roast copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Roast copied to clipboard!');
    }
  };

  const handleCopy = async () => {
    if (!currentRoast) return;
    
    await navigator.clipboard.writeText(currentRoast.content);
    toast.success('Roast copied!');
  };

  const modeConfig = ROAST_MODE_CONFIGS[selectedMode];
  const isDisabled = disabled || !text.trim() || text.length < 10;

  return (
    <div className="space-y-4">
      {/* Main Generate Button */}
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: isDisabled ? 1 : 1.02 }}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      >
        <Button
          onClick={handleGenerate}
          disabled={isDisabled || isGenerating}
          loading={isGenerating}
          size="lg"
          className={cn(
            'w-full relative overflow-hidden',
            `bg-gradient-to-r ${modeConfig.color}`,
            'hover:shadow-lg hover:shadow-purple-500/25',
            'transition-all duration-300',
            className
          )}
        >
          {/* Animated background effect */}
          <motion.div
            className="absolute inset-0 bg-white/10"
            initial={{ x: '-100%' }}
            animate={{ x: isHovered ? '100%' : '-100%' }}
            transition={{ duration: 0.6 }}
          />
          
          <div className="relative flex items-center justify-center space-x-2">
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Flame className="h-5 w-5" />
            )}
            <span className="font-semibold">
              {isGenerating 
                ? `Generating ${modeConfig.name}...` 
                : `Generate ${modeConfig.name} Roast ${modeConfig.icon}`
              }
            </span>
          </div>
        </Button>
      </motion.div>

      {/* Action Buttons */}
      {currentRoast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          <Button
            onClick={handleRegenerate}
            disabled={isGenerating}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              isGenerating && "animate-spin"
            )} />
            Regenerate
          </Button>
          
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            className="px-3"
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleShare}
            variant="ghost"
            size="sm"
            className="px-3"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Intensity Indicator */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Intensity: {intensity}/10</span>
        <div className="flex space-x-1">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i < intensity 
                  ? `bg-gradient-to-r ${modeConfig.color}` 
                  : "bg-gray-700"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};