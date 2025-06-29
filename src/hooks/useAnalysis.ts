import { useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { analysisEngine } from '@/services/analysis/AnalysisEngine';
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
    isAnalyzing,
  } = useStore();

  const analyze = useCallback(
    async (text: string, config?: Partial<AnalysisConfig>) => {
      if (!text.trim()) {
        toast.error('Please enter some text to analyze!');
        return null;
      }

      if (text.length < 10) {
        toast.error('Please enter at least 10 characters for a meaningful analysis.');
        return null;
      }

      if (text.length > 2000) {
        toast.error('Text is too long. Please keep it under 2000 characters.');
        return null;
      }

      setIsAnalyzing(true);

      try {
        const result = await analysisEngine.analyzeText(text, config);
        
        setCurrentAnalysis(result);
        addToHistory(result);

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        toast.error(`Analysis failed: ${errorMessage}`);
        
        console.error('Analysis error:', error);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setCurrentAnalysis, addToHistory, setIsAnalyzing]
  );

  return {
    analyze,
    isAnalyzing,
  };
}