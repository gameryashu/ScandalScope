import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AnalysisResult, Theme } from '@/types';

interface AppState {
  // Analysis state
  currentAnalysis: AnalysisResult | null;
  analysisHistory: AnalysisResult[];
  isAnalyzing: boolean;
  
  // UI state
  theme: Theme;
  showConfetti: boolean;
  
  // Performance metrics
  metrics: {
    analysisCount: number;
    averageProcessingTime: number;
    lastAnalysisTime: number;
  };
}

interface AppActions {
  // Analysis actions
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  addToHistory: (analysis: AnalysisResult) => void;
  clearHistory: () => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  
  // UI actions
  setTheme: (theme: Theme) => void;
  setShowConfetti: (show: boolean) => void;
  
  // Utility actions
  reset: () => void;
}

type Store = AppState & AppActions;

const initialState: AppState = {
  currentAnalysis: null,
  analysisHistory: [],
  isAnalyzing: false,
  theme: 'dark',
  showConfetti: false,
  metrics: {
    analysisCount: 0,
    averageProcessingTime: 0,
    lastAnalysisTime: 0,
  },
};

export const useStore = create<Store>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Analysis actions
      setCurrentAnalysis: (analysis) => {
        set((state) => {
          state.currentAnalysis = analysis;
        });
      },

      addToHistory: (analysis) => {
        set((state) => {
          // Add to beginning of array and limit to 50 items
          state.analysisHistory = [analysis, ...state.analysisHistory].slice(0, 50);
          
          // Update metrics
          state.metrics.analysisCount += 1;
          state.metrics.lastAnalysisTime = Date.now();
          
          // Calculate average processing time
          const totalTime = state.metrics.averageProcessingTime * (state.metrics.analysisCount - 1) + analysis.processingTime;
          state.metrics.averageProcessingTime = Math.round(totalTime / state.metrics.analysisCount);
        });
      },

      clearHistory: () => {
        set((state) => {
          state.analysisHistory = [];
        });
      },

      setIsAnalyzing: (isAnalyzing) => {
        set((state) => {
          state.isAnalyzing = isAnalyzing;
        });
      },

      // UI actions
      setTheme: (theme) => {
        set((state) => {
          state.theme = theme;
        });
      },

      setShowConfetti: (show) => {
        set((state) => {
          state.showConfetti = show;
        });
      },

      // Utility actions
      reset: () => {
        set(() => ({ ...initialState }));
      },
    })),
    {
      name: 'scandalscope-store',
      partialize: (state) => ({
        analysisHistory: state.analysisHistory.slice(0, 10), // Persist only recent history
        theme: state.theme,
        metrics: state.metrics,
      }),
      version: 1,
    }
  )
);

// Selectors for optimized component subscriptions
export const useCurrentAnalysis = () => useStore((state) => state.currentAnalysis);
export const useAnalysisHistory = () => useStore((state) => state.analysisHistory);
export const useIsAnalyzing = () => useStore((state) => state.isAnalyzing);
export const useTheme = () => useStore((state) => state.theme);
export const useMetrics = () => useStore((state) => state.metrics);