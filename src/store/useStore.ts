import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware/persist';
import type { 
  AnalysisResult, 
  User, 
  Theme, 
  LeaderboardEntry, 
  Notification,
  Challenge,
  PerformanceMetrics,
  AppError
} from '@/types';

/**
 * Enhanced Zustand store with comprehensive state management
 * Features: persistence, immer for immutability, subscriptions, type safety
 */

interface AppState {
  // Theme and UI state
  theme: Theme;
  sidebarOpen: boolean;
  
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Analysis state
  currentAnalysis: AnalysisResult | null;
  analysisHistory: AnalysisResult[];
  isAnalyzing: boolean;
  analysisQueue: string[];
  
  // Social features
  leaderboard: LeaderboardEntry[];
  challenges: Challenge[];
  notifications: Notification[];
  unreadCount: number;
  
  // UI feedback
  showConfetti: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  
  // Performance monitoring
  metrics: PerformanceMetrics;
  errors: AppError[];
  
  // Loading states
  loading: {
    leaderboard: boolean;
    challenges: boolean;
    profile: boolean;
  };
}

interface AppActions {
  // Theme actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  
  // User actions
  setUser: (user: User | null) => void;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => void;
  
  // Analysis actions
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  addToHistory: (analysis: AnalysisResult) => void;
  clearHistory: () => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  addToQueue: (text: string) => void;
  removeFromQueue: (text: string) => void;
  
  // Social actions
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  setChallenges: (challenges: Challenge[]) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // UI feedback actions
  setShowConfetti: (show: boolean) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  
  // Performance actions
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  addError: (error: AppError) => void;
  clearErrors: () => void;
  
  // Loading actions
  setLoading: (key: keyof AppState['loading'], value: boolean) => void;
  
  // Utility actions
  reset: () => void;
}

type Store = AppState & AppActions;

const initialState: AppState = {
  theme: 'dark',
  sidebarOpen: false,
  user: null,
  isAuthenticated: false,
  currentAnalysis: null,
  analysisHistory: [],
  isAnalyzing: false,
  analysisQueue: [],
  leaderboard: [],
  challenges: [],
  notifications: [],
  unreadCount: 0,
  showConfetti: false,
  toast: null,
  metrics: {
    analysisTime: 0,
    apiLatency: 0,
    renderTime: 0,
    memoryUsage: 0,
    errorRate: 0,
  },
  errors: [],
  loading: {
    leaderboard: false,
    challenges: false,
    profile: false,
  },
};

export const useStore = create<Store>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Theme actions
        setTheme: (theme) => {
          set((state) => {
            state.theme = theme;
          });
          
          // Apply theme to document
          const root = document.documentElement;
          if (theme === 'dark') {
            root.classList.add('dark');
          } else if (theme === 'light') {
            root.classList.remove('dark');
          } else {
            // Auto theme based on system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', prefersDark);
          }
        },

        toggleSidebar: () => {
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          });
        },

        // User actions
        setUser: (user) => {
          set((state) => {
            state.user = user;
            state.isAuthenticated = !!user;
          });
        },

        updateUserPreferences: (preferences) => {
          set((state) => {
            if (state.user) {
              state.user = {
                ...state.user,
                preferences: { ...state.user.preferences, ...preferences },
              };
            }
          });
        },

        // Analysis actions
        setCurrentAnalysis: (analysis) => {
          set((state) => {
            state.currentAnalysis = analysis;
          });
        },

        addToHistory: (analysis) => {
          set((state) => {
            // Add to beginning of array and limit to 100 items
            state.analysisHistory = [analysis, ...state.analysisHistory].slice(0, 100);
            
            // Update user stats if user exists
            if (state.user) {
              state.user = {
                ...state.user,
                totalAnalyses: state.user.totalAnalyses + 1,
                averageScore: Math.round(
                  (state.user.averageScore * state.user.totalAnalyses + analysis.cancelScore) /
                  (state.user.totalAnalyses + 1)
                ),
                lastActive: Date.now(),
              };
            }
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

        addToQueue: (text) => {
          set((state) => {
            if (!state.analysisQueue.includes(text)) {
              state.analysisQueue.push(text);
            }
          });
        },

        removeFromQueue: (text) => {
          set((state) => {
            state.analysisQueue = state.analysisQueue.filter(item => item !== text);
          });
        },

        // Social actions
        setLeaderboard: (leaderboard) => {
          set((state) => {
            state.leaderboard = leaderboard;
            state.loading.leaderboard = false;
          });
        },

        setChallenges: (challenges) => {
          set((state) => {
            state.challenges = challenges;
            state.loading.challenges = false;
          });
        },

        addNotification: (notification) => {
          set((state) => {
            const newNotification: Notification = {
              ...notification,
              id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
              read: false,
            };
            
            state.notifications = [newNotification, ...state.notifications].slice(0, 50);
            state.unreadCount = state.notifications.filter(n => !n.read).length;
          });
        },

        markNotificationRead: (id) => {
          set((state) => {
            const notification = state.notifications.find(n => n.id === id);
            if (notification) {
              notification.read = true;
              state.unreadCount = state.notifications.filter(n => !n.read).length;
            }
          });
        },

        clearNotifications: () => {
          set((state) => {
            state.notifications = [];
            state.unreadCount = 0;
          });
        },

        // UI feedback actions
        setShowConfetti: (show) => {
          set((state) => {
            state.showConfetti = show;
          });
        },

        showToast: (message, type) => {
          set((state) => {
            state.toast = { message, type };
          });
          
          // Auto-hide toast after 4 seconds
          setTimeout(() => {
            set((state) => {
              state.toast = null;
            });
          }, 4000);
        },

        hideToast: () => {
          set((state) => {
            state.toast = null;
          });
        },

        // Performance actions
        updateMetrics: (metrics) => {
          set((state) => {
            state.metrics = { ...state.metrics, ...metrics };
          });
        },

        addError: (error) => {
          set((state) => {
            state.errors = [error, ...state.errors].slice(0, 10);
          });
        },

        clearErrors: () => {
          set((state) => {
            state.errors = [];
          });
        },

        // Loading actions
        setLoading: (key, value) => {
          set((state) => {
            state.loading[key] = value;
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
          theme: state.theme,
          user: state.user,
          analysisHistory: state.analysisHistory.slice(0, 20), // Persist only recent history
          notifications: state.notifications.slice(0, 10), // Persist only recent notifications
        }),
        version: 2,
        migrate: (persistedState: any, version: number) => {
          // Handle migration from older versions
          if (version < 2) {
            return {
              ...initialState,
              ...persistedState,
              // Reset certain fields that might have breaking changes
              metrics: initialState.metrics,
              loading: initialState.loading,
            };
          }
          return persistedState;
        },
      }
    )
  )
);

// Selectors for optimized component subscriptions
export const useTheme = () => useStore((state) => state.theme);
export const useUser = () => useStore((state) => state.user);
export const useCurrentAnalysis = () => useStore((state) => state.currentAnalysis);
export const useAnalysisHistory = () => useStore((state) => state.analysisHistory);
export const useIsAnalyzing = () => useStore((state) => state.isAnalyzing);
export const useLeaderboard = () => useStore((state) => state.leaderboard);
export const useNotifications = () => useStore((state) => state.notifications);
export const useUnreadCount = () => useStore((state) => state.unreadCount);
export const useMetrics = () => useStore((state) => state.metrics);

// Subscribe to theme changes and apply to document
useStore.subscribe(
  (state) => state.theme,
  (theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }
);

// Performance monitoring
if (typeof window !== 'undefined') {
  // Monitor memory usage
  setInterval(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      useStore.getState().updateMetrics({
        memoryUsage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
      });
    }
  }, 30000); // Every 30 seconds
}