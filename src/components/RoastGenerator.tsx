import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Settings, History, TrendingUp, RefreshCw, Copy, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ModeSelector } from '@/components/ModeSelector';
import { ResultCard } from '@/components/ResultCard';
import { cn } from '@/lib/utils';
import type { RoastMode, RoastResult } from '@/types/roast';
import { useRoastGenerator } from '@/hooks/useRoastGenerator';
import toast from 'react-hot-toast';

interface RoastGeneratorProps {
  text: string;
  className?: string;
}

export const RoastGenerator: React.FC<RoastGeneratorProps> = ({
  text,
  className
}) => {
  const [selectedMode, setSelectedMode] = useState<RoastMode>('genz');
  const [intensity, setIntensity] = useState(5);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { 
    currentRoast, 
    generationHistory, 
    isGenerating,
    generateRoast,
    regenerateRoast,
    getStats 
  } = useRoastGenerator();

  const stats = getStats();

  const handleGenerateRoast = async () => {
    if (!text.trim() || text.length < 10) {
      toast.error('Please provide at least 10 characters of text to roast');
      return;
    }

    try {
      const config = {
        mode: selectedMode,
        intensity,
        includeEmojis: true,
        maxLength: 200
      };

      const result = await generateRoast(text, config);
      if (result) {
        toast.success('Roast generated! 🔥');
      }
    } catch (error) {
      toast.error('Failed to generate roast. Please try again.');
      console.error('Roast generation error:', error);
    }
  };

  const handleRegenerate = async () => {
    try {
      const result = await regenerateRoast();
      if (result) {
        toast.success('New roast generated! 🔥');
      }
    } catch (error) {
      toast.error('Failed to regenerate roast');
    }
  };

  const handleCopyRoast = async () => {
    if (!currentRoast) return;
    
    try {
      await navigator.clipboard.writeText(currentRoast.content);
      toast.success('Roast copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy roast');
    }
  };

  const handleShareRoast = async () => {
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
        await navigator.clipboard.writeText(shareText);
        toast.success('Share text copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Share text copied to clipboard!');
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold gradient-text mb-2 flex items-center justify-center">
          <Zap className="h-8 w-8 text-purple-500 mr-3" />
          AI Roast Generator
        </h2>
        <p className="text-gray-400 text-lg">
          Choose your roast style and let AI deliver the perfect burn
        </p>
      </motion.div>

      {/* Controls */}
      <Card className="space-y-6">
        {/* Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Roast Mode
          </label>
          <ModeSelector
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
            disabled={isGenerating}
          />
        </div>

        {/* Intensity Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Intensity Level: {intensity}/10
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              disabled={isGenerating}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              aria-label={`Roast intensity level: ${intensity} out of 10`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Gentle</span>
              <span>Moderate</span>
              <span>Savage</span>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateRoast}
          disabled={!text.trim() || text.length < 10 || isGenerating}
          loading={isGenerating}
          className="w-full"
          size="lg"
          aria-label={isGenerating ? 'Generating roast' : 'Generate roast'}
        >
          {isGenerating ? (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Generating {selectedMode} Roast...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Generate {selectedMode} Roast 🔥
            </>
          )}
        </Button>

        {/* Quick Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="ghost"
              size="sm"
              aria-label="Toggle settings"
              aria-expanded={showSettings}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="ghost"
              size="sm"
              aria-label={`Toggle history (${generationHistory.length} items)`}
              aria-expanded={showHistory}
            >
              <History className="h-4 w-4 mr-2" />
              History ({generationHistory.length})
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span>{stats.totalGenerated} generated</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Current Result */}
      <AnimatePresence>
        {currentRoast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Latest Roast</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleRegenerate}
                    variant="ghost"
                    size="sm"
                    disabled={isGenerating}
                    aria-label="Regenerate roast"
                  >
                    <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                  </Button>
                  <Button
                    onClick={handleCopyRoast}
                    variant="ghost"
                    size="sm"
                    aria-label="Copy roast"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleShareRoast}
                    variant="ghost"
                    size="sm"
                    aria-label="Share roast"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <p className="text-gray-200 leading-relaxed text-lg italic">
                  "{currentRoast.content}"
                </p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Mode: {currentRoast.mode}</span>
                <span>Confidence: {Math.round(currentRoast.confidence * 100)}%</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">
                Advanced Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Response Length
                  </label>
                  <select 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Response length setting"
                  >
                    <option value="short">Short (50-100 chars)</option>
                    <option value="medium" defaultSelected>Medium (100-200 chars)</option>
                    <option value="long">Long (200-300 chars)</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeEmojis"
                    defaultChecked
                    className="rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="includeEmojis" className="text-sm text-gray-300">
                    Include emojis
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowSarcasm"
                    defaultChecked
                    className="rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="allowSarcasm" className="text-sm text-gray-300">
                    Allow sarcasm
                  </label>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && generationHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">
                Recent Roasts
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {generationHistory.slice(0, 5).map((roast) => (
                  <div
                    key={roast.id}
                    className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
                  >
                    <p className="text-gray-200 text-sm italic mb-2">
                      "{roast.content}"
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Mode: {roast.mode}</span>
                      <span>{new Date(roast.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {generationHistory.length > 5 && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm">
                    View All ({generationHistory.length})
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};