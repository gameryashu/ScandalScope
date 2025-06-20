import { create } from 'zustand';

export interface AnalysisResult {
  id: string;
  text: string;
  cancelScore: number;
  riskLevel: 'SAFE' | 'MILD' | 'MODERATE' | 'HIGH' | 'EXTREME';
  roast: string;
  apology: string;
  timestamp: number;
  categories: {
    toxicity: number;
    identity_attack: number;
    insult: number;
    profanity: number;
    threat: number;
    sexually_explicit: number;
  };
  recommendations: string[];
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  totalAnalyses: number;
  averageScore: number;
  badges: string[];
  streak: number;
}

interface AppState {
  // Theme
  theme: 'dark' | 'light' | 'auto';
  setTheme: (theme: 'dark' | 'light' | 'auto') => void;
  
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Analysis
  currentAnalysis: AnalysisResult | null;
  analysisHistory: AnalysisResult[];
  isAnalyzing: boolean;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  addToHistory: (analysis: AnalysisResult) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  
  // UI State
  showConfetti: boolean;
  setShowConfetti: (show: boolean) => void;
  
  // Leaderboard
  leaderboard: User[];
  setLeaderboard: (users: User[]) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Theme
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  
  // User
  user: null,
  setUser: (user) => set({ user }),
  
  // Analysis
  currentAnalysis: null,
  analysisHistory: [],
  isAnalyzing: false,
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  addToHistory: (analysis) => set((state) => ({ 
    analysisHistory: [analysis, ...state.analysisHistory].slice(0, 50) 
  })),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  
  // UI State
  showConfetti: false,
  setShowConfetti: (show) => set({ showConfetti: show }),
  
  // Leaderboard
  leaderboard: [],
  setLeaderboard: (users) => set({ leaderboard: users }),
}));