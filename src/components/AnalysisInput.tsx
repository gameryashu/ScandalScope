import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, AlertTriangle, Sparkles, Mic, MicOff, Upload } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RoastGenerator } from '@/components/RoastGenerator';
import { cn } from '@/utils/cn';
import { useStore } from '@/store/useStore';

export const AnalysisInput: React.FC = () => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showRoastGenerator, setShowRoastGenerator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { analyze } = useAnalysis();
  const { isAnalyzing } = useStore();
  
  const debouncedText = useDebounce(text, 300);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const isValid = text.trim().length >= 10;

  const handleAnalyze = async () => {
    if (!isValid || isAnalyzing) return;
    await analyze(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const handleFileUpload = (file: File) => {
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content.slice(0, 2000)); // Limit to 2000 chars
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const textFile = files.find(file => file.type === 'text/plain');
    
    if (textFile) {
      handleFileUpload(textFile);
    }
  };

  const exampleTexts = [
    "I think pineapple on pizza is actually pretty good",
    "Social media is ruining society and we should all delete our accounts",
    "I don't understand why people get so worked up about celebrity drama",
    "The weather has been really nice lately, perfect for outdoor activities",
    "Cryptocurrency is just digital gambling for tech bros",
    "I actually enjoyed the last season of Game of Thrones",
  ];

  const handleExampleClick = (example: string) => {
    setText(example);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <Card gradient className="relative overflow-hidden">
        {/* Header */}
        <div className="mb-6">
          <motion.h2 
            className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2 flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Zap className="h-8 w-8 text-purple-500 mr-3" />
            Cancel Risk Analyzer
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Enter your text below and discover your cancelability score. Get roasted, get real, get ready.
          </motion.p>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div 
            className={cn(
              "relative transition-all duration-300",
              dragActive && "ring-2 ring-purple-500 ring-opacity-50"
            )}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your controversial take, social media post, or any text you want analyzed..."
              className={cn(
                "w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none min-h-[120px] max-h-[300px]",
                isAnalyzing && "opacity-50 cursor-not-allowed"
              )}
              maxLength={2000}
              disabled={isAnalyzing}
            />
            
            {/* Character/Word Count */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-3 text-xs">
              <Badge variant={wordCount > 50 ? 'warning' : 'default'} size="sm">
                {wordCount} words
              </Badge>
              <Badge 
                variant={charCount > 1500 ? 'danger' : charCount > 1000 ? 'warning' : 'default'} 
                size="sm"
              >
                {charCount}/2000
              </Badge>
            </div>

            {/* Upload Overlay */}
            <AnimatePresence>
              {dragActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-purple-500/20 border-2 border-dashed border-purple-500 rounded-xl flex items-center justify-center"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-purple-400 font-medium">Drop text file here</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={!isValid || isAnalyzing}
              loading={isAnalyzing}
              className="flex-1"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Analyze Cancel Risk
                </>
              )}
            </Button>

            {/* Roast Generator Toggle */}
            <Button
              onClick={() => setShowRoastGenerator(!showRoastGenerator)}
              variant={showRoastGenerator ? "primary" : "secondary"}
              disabled={!isValid}
            >
              <Zap className="h-5 w-5 mr-2" />
              {showRoastGenerator ? 'Hide Roaster' : 'Get Roasted'}
            </Button>

            {/* File Upload Button */}
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload
            </Button>

            {/* Voice Input Button (Future Feature) */}
            <Button
              variant="ghost"
              onClick={() => setIsRecording(!isRecording)}
              disabled={isAnalyzing}
              className={cn(
                isRecording && "bg-red-500/20 text-red-400 border-red-500/30"
              )}
            >
              {isRecording ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Validation Message */}
          <AnimatePresence>
            {text.length > 0 && !isValid && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-2 text-yellow-400 text-sm"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Enter at least 10 characters for analysis</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Keyboard Shortcut Hint */}
          <motion.div 
            className="text-xs text-gray-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Press <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400">⌘ + Enter</kbd> to analyze
          </motion.div>
        </div>

        {/* Example Texts */}
        <div className="border-t border-gray-800 pt-6 mt-6">
          <motion.p 
            className="text-sm text-gray-400 mb-4 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Try these examples:
          </motion.p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exampleTexts.map((example, index) => (
              <motion.button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-left p-4 bg-gray-800/30 hover:bg-gray-700/50 rounded-lg text-sm text-gray-300 hover:text-white transition-all duration-300 border border-gray-800 hover:border-gray-600"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <span className="text-purple-400 text-xs font-medium mb-1 block">
                  EXAMPLE {index + 1}
                </span>
                "{example}"
              </motion.button>
            ))}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="hidden"
        />
      </Card>

      {/* Roast Generator */}
      <AnimatePresence>
        {showRoastGenerator && isValid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RoastGenerator text={text} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};