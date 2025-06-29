import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, AlertTriangle, Sparkles, Upload, Mic, MicOff } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { validateInput } from '@/utils/validation';
import toast from 'react-hot-toast';

export const AnalysisInput: React.FC = () => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { analyze, isAnalyzing } = useAnalysis();
  
  const debouncedText = useDebounce(text, 300);
  const validation = validateInput(debouncedText);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  const handleAnalyze = useCallback(async () => {
    if (!validation.isValid || isAnalyzing) return;
    
    try {
      await analyze(text);
      toast.success('Analysis complete! 🎯');
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
      console.error('Analysis error:', error);
    }
  }, [text, validation.isValid, isAnalyzing, analyze]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAnalyze();
    }
  }, [handleAnalyze]);

  const handleFileUpload = useCallback((file: File) => {
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content.slice(0, 2000));
        toast.success('File uploaded successfully!');
      };
      reader.onerror = () => toast.error('Failed to read file');
      reader.readAsText(file);
    } else {
      toast.error('Please upload a text file (.txt)');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const textFile = files.find(file => file.type === 'text/plain');
    
    if (textFile) {
      handleFileUpload(textFile);
    } else {
      toast.error('Please drop a text file');
    }
  }, [handleFileUpload]);

  const handleVoiceToggle = useCallback(() => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info('Voice input coming soon! 🎤');
    }
  }, [isRecording]);

  const exampleTexts = [
    "I think pineapple on pizza is actually pretty good",
    "Social media is ruining society and we should all delete our accounts",
    "I don't understand why people get so worked up about celebrity drama",
    "The weather has been really nice lately, perfect for outdoor activities",
    "Cryptocurrency is just digital gambling for tech bros",
    "I actually enjoyed the last season of Game of Thrones",
  ];

  const handleExampleClick = useCallback((example: string) => {
    setText(example);
    textareaRef.current?.focus();
    toast.success('Example loaded!');
  }, []);

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
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-3 flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Zap className="h-10 w-10 text-purple-500 mr-4" />
            ScandalScope V2
          </motion.h1>
          <motion.p 
            className="text-gray-300 text-xl leading-relaxed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            AI-powered cancel risk analysis. Get roasted, get real, get ready for the internet's judgment.
          </motion.p>
        </div>

        {/* Input Area */}
        <div className="space-y-6">
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
                "w-full bg-gray-800/50 border border-gray-700 rounded-xl px-6 py-4 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none min-h-[140px] max-h-[300px] text-lg",
                isAnalyzing && "opacity-50 cursor-not-allowed"
              )}
              maxLength={2000}
              disabled={isAnalyzing}
              aria-label="Text to analyze"
              aria-describedby="char-count word-count validation-message"
            />
            
            {/* Character/Word Count */}
            <div className="absolute bottom-4 right-4 flex items-center space-x-3 text-sm">
              <Badge 
                variant={wordCount > 50 ? 'warning' : 'default'} 
                size="sm"
                id="word-count"
              >
                {wordCount} words
              </Badge>
              <Badge 
                variant={charCount > 1500 ? 'danger' : charCount > 1000 ? 'warning' : 'default'} 
                size="sm"
                id="char-count"
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

          {/* Validation Message */}
          <AnimatePresence>
            {!validation.isValid && text.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-2 text-yellow-400 text-sm bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3"
                role="alert"
                aria-live="polite"
                id="validation-message"
              >
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{validation.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleAnalyze}
              disabled={!validation.isValid || isAnalyzing}
              loading={isAnalyzing}
              className="flex-1 text-lg py-4"
              size="lg"
              aria-label={isAnalyzing ? 'Analyzing text' : 'Analyze cancel risk'}
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

            {/* Secondary Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                aria-label="Upload text file"
                className="px-4"
              >
                <Upload className="h-5 w-5" />
              </Button>

              <Button
                variant="secondary"
                onClick={handleVoiceToggle}
                disabled={isAnalyzing}
                className={cn(
                  "px-4",
                  isRecording && "bg-red-500/20 text-red-400 border-red-500/30"
                )}
                aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                aria-pressed={isRecording}
              >
                {isRecording ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Keyboard Shortcut Hint */}
          <motion.div 
            className="text-sm text-gray-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Press <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400 font-mono">⌘ + Enter</kbd> to analyze
          </motion.div>
        </div>

        {/* Example Texts */}
        <div className="border-t border-gray-800 pt-6 mt-8">
          <motion.p 
            className="text-sm text-gray-400 mb-4 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Try these examples:
          </motion.p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exampleTexts.map((example, index) => (
              <motion.button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-left p-4 bg-gray-800/30 hover:bg-gray-700/50 rounded-lg text-sm text-gray-300 hover:text-white transition-all duration-300 border border-gray-800 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                aria-label={`Load example: ${example}`}
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
          aria-label="Upload text file"
        />
      </Card>
    </motion.div>
  );
};