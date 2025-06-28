export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  totalAnalyses: number;
  averageScore: number;
  badges: string[];
  streak: number;
  joinDate: number;
  lastActive: number;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  roastIntensity: 'mild' | 'medium' | 'savage';
  notifications: boolean;
  publicProfile: boolean;
  shareResults: boolean;
  theme: 'dark' | 'light' | 'auto';
  language: string;
}

export interface UserStats {
  totalWords: number;
  highestScore: number;
  lowestScore: number;
  favoriteCategories: string[];
  analysisFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  acceptTerms?: boolean;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}