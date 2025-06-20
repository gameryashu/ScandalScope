import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Zap, AlertTriangle, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { analyzeText } from '../utils/analysis';
import toast from 'react-hot-toast';

export const AnalysisInput: React.FC = () => {
  const [text, setText] = useState('');
  const { setCurrentAnalysis, addToHistory, isAnalyzing, setIsAnalyzing } = useStore();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze!');
      return;
    }

    if (text.length < 10) {
      toast.error('Please enter at least 10 characters for a meaningful analysis.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await analyzeText(text);
      setCurrentAnalysis(result);
      addToHistory(result);
      
      // Show appropriate toast based on risk level
      if (result.riskLevel === 'EXTREME') {
        toast.error('🔥 EXTREME RISK DETECTED!');
      } else if (result.riskLevel === 'HIGH') {
        toast.error('⚠️ High cancel risk!');
      } else if (result.riskLevel === 'SAFE') {
        toast.success('✅ You\'re safe!');
      } else {
        toast('📊 Analysis complete!');
      }
      
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exampleTexts = [
    "I think pineapple on pizza is actually pretty good",
    "Social media is ruining society and we should all delete our accounts",
    "I don't understand why people get so worked up about celebrity drama",
    "The weather has been really nice lately, perfect for outdoor activities",
  ];

  const handleExampleClick = (example: string) => {
    setText(example);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <Zap className="h-6 w-6 text-primary-500 mr-2" />
            Cancel Risk Analyzer
          </h2>
          <p className="text-secondary-300">
            Enter your text below and discover your cancelability score. Get roasted, get real, get ready.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your controversial take, social media post, or any text you want analyzed..."
              className="input-field min-h-[120px] resize-none pr-16"
              maxLength={2000}
              disabled={isAnalyzing}
            />
            <div className="absolute bottom-3 right-3 text-xs text-secondary-400">
              {text.length}/2000
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !text.trim()}
              className={`btn-primary flex-1 flex items-center justify-center space-x-2 ${
                isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={!isAnalyzing ? { scale: 1.02 } : {}}
              whileTap={!isAnalyzing ? { scale: 0.98 } : {}}
            >
              {isAnalyzing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Analyze Cancel Risk</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Example texts */}
          <div className="border-t border-secondary-700 pt-4">
            <p className="text-sm text-secondary-400 mb-3 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Try these examples:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {exampleTexts.map((example, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-left p-3 bg-secondary-700/30 hover:bg-secondary-700/50 rounded-lg text-sm text-secondary-300 hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  "{example}"
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};