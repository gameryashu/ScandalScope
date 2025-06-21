import { useCallback, useState } from 'react';
import { useStore } from '@/store/useStore';
import { analyzeText } from '@/utils/analysis';
import type { AnalysisConfig } from '@/types';
import toast from 'react-hot-toast';

/**
 * Custom hook for text analysis with enhanced error handling and state management
 */
export function useAnalysis() {
  const {
    setCurrentAnalysis,
    addToHistory,
    setIsAnalyzing,
    addError,
    updateMetrics,
    showToast,
  } = useStore();

  const [analysisQueue, setAnalysisQueue] = useState<string[]>([]);

  const analyze = useCallback(
    async (text: string, config?: Partial<AnalysisConfig>) => {
      if (!text.trim()) {
        showToast('Please enter some text to analyze!', 'error');
        return null;
      }

      if (text.length < 10) {
        showToast('Please enter at least 10 characters for a meaningful analysis.', 'error');
        return null;
      }

      if (text.length > 5000) {
        showToast('Text is too long. Please keep it under 5000 characters.', 'error');
        return null;
      }

      setIsAnalyzing(true);
      const startTime = performance.now();

      try {
        const result = await analyzeText(text, config);
        
        setCurrentAnalysis(result);
        addToHistory(result);

        // Update performance metrics
        const analysisTime = performance.now() - startTime;
        updateMetrics({ analysisTime });

        // Show appropriate toast based on risk level
        const toastMessages = {
          EXTREME: { message: '🔥 EXTREME RISK DETECTED!', type: 'error' as const },
          HIGH: { message: '⚠️ High cancel risk!', type: 'error' as const },
          MODERATE: { message: '📊 Moderate risk detected', type: 'info' as const },
          MILD: { message: '✨ Low risk content', type: 'info' as const },
          SAFE: { message: '✅ You\'re safe!', type: 'success' as const },
        };

        const toastConfig = toastMessages[result.riskLevel];
        showToast(toastConfig.message, toastConfig.type);

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        showToast(`Analysis failed: ${errorMessage}`, 'error');
        
        addError({
          type: 'API_ERROR',
          code: 500,
          message: errorMessage,
        });

        console.error('Analysis error:', error);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setCurrentAnalysis, addToHistory, setIsAnalyzing, addError, updateMetrics, showToast]
  );

  const analyzeMultiple = useCallback(
    async (texts: string[], config?: Partial<AnalysisConfig>) => {
      setAnalysisQueue(texts);
      const results = [];

      for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        setAnalysisQueue(prev => prev.slice(1));
        
        const result = await analyze(text, config);
        if (result) {
          results.push(result);
        }

        // Add delay between analyses to avoid rate limiting
        if (i < texts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setAnalysisQueue([]);
      return results;
    },
    [analyze]
  );

  return {
    analyze,
    analyzeMultiple,
    analysisQueue,
  };
}