import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Share2, 
  Download, 
  Heart, 
  MessageSquare, 
  BarChart3,
  Clock,
  Tag,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import type { RoastResult } from '@/types/roast';
import { ROAST_MODE_CONFIGS } from '@/utils/promptEngineering';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface ResultCardProps {
  result: RoastResult;
  onRegenerate?: () => void;
  onShare?: () => void;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onRegenerate,
  onShare,
  className,
  showActions = true,
  compact = false
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 50) + 10);
  const [isExpanded, setIsExpanded] = useState(!compact);

  const modeConfig = ROAST_MODE_CONFIGS[result.mode];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.content);
    toast.success('Roast copied to clipboard!');
  };

  const handleShare = async () => {
    const shareText = `Got roasted by ScandalScope! 🔥\n\n"${result.content}"\n\nMode: ${modeConfig.name}\nTry it yourself: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ScandalScope Roast',
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
        await navigator.clipboard.writeText(shareText);
        toast.success('Share text copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Share text copied to clipboard!');
    }
    
    if (onShare) onShare();
  };

  const handleDownload = () => {
    const data = {
      content: result.content,
      mode: result.mode,
      timestamp: result.timestamp,
      originalText: result.originalText,
      confidence: result.confidence,
      tags: result.tags
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scandalscope-roast-${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Roast downloaded!');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <Card className={cn(
      "relative overflow-hidden",
      `bg-gradient-to-br ${modeConfig.color}/10`,
      `border-l-4 border-l-gradient-to-b ${modeConfig.color}`,
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
            `bg-gradient-to-r ${modeConfig.color}`
          )}>
            {modeConfig.icon}
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {modeConfig.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        
        {!compact && (
          <div className="flex items-center space-x-2">
            <Badge variant="info" size="sm">
              {Math.round(result.confidence * 100)}% confidence
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <motion.div
          className="text-gray-200 leading-relaxed text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          "{result.content}"
        </motion.div>
      </div>

      {/* Original Text (Expandable) */}
      {!compact && (
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'} original text
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
              >
                <div className="text-sm text-gray-300">
                  "{result.originalText}"
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Tags */}
      {result.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="default"
                size="sm"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={handleLike}
              className={cn(
                "flex items-center space-x-1 text-sm transition-colors",
                isLiked ? "text-red-400" : "text-gray-400 hover:text-red-400"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={cn(
                "h-4 w-4",
                isLiked && "fill-current"
              )} />
              <span>{likes}</span>
            </motion.button>
            
            <button className="flex items-center space-x-1 text-sm text-gray-400 hover:text-gray-300 transition-colors">
              <MessageSquare className="h-4 w-4" />
              <span>{Math.floor(Math.random() * 20) + 5}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-sm text-gray-400 hover:text-gray-300 transition-colors">
              <BarChart3 className="h-4 w-4" />
              <span>Stats</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            {onRegenerate && (
              <Button
                onClick={onRegenerate}
                variant="ghost"
                size="sm"
                className="px-3"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            
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
            
            <Button
              onClick={handleDownload}
              variant="ghost"
              size="sm"
              className="px-3"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};