/**
 * Core type definitions for ScandalScope application
 * Provides comprehensive type safety across the entire application
 */

// Risk level enumeration with strict typing
export type RiskLevel = 'SAFE' | 'MILD' | 'MODERATE' | 'HIGH' | 'EXTREME';

// Theme configuration
export type Theme = 'dark' | 'light' | 'auto';

// Analysis categories with detailed scoring
export interface AnalysisCategories {
  readonly toxicity: number;
  readonly identity_attack: number;
  readonly insult: number;
  readonly profanity: number;
  readonly threat: number;
  readonly sexually_explicit: number;
  readonly flirtation: number;
  readonly spam: number;
}

// Core analysis result interface
export interface AnalysisResult {
  readonly id: string;
  readonly text: string;
  readonly cancelScore: number;
  readonly riskLevel: RiskLevel;
  readonly roast: string;
  readonly apology: string;
  readonly timestamp: number;
  readonly categories: AnalysisCategories;
  readonly recommendations: readonly string[];
  readonly confidence: number;
  readonly processingTime: number;
  readonly version: string;
}

// User profile with comprehensive stats
export interface User {
  readonly id: string;
  readonly username: string;
  readonly avatar: string;
  readonly totalAnalyses: number;
  readonly averageScore: number;
  readonly badges: readonly string[];
  readonly streak: number;
  readonly joinDate: number;
  readonly lastActive: number;
  readonly preferences: UserPreferences;
  readonly stats: UserStats;
}

// User preferences for personalization
export interface UserPreferences {
  readonly roastIntensity: 'mild' | 'medium' | 'savage';
  readonly notifications: boolean;
  readonly publicProfile: boolean;
  readonly shareResults: boolean;
  readonly theme: Theme;
  readonly language: string;
}

// Detailed user statistics
export interface UserStats {
  readonly totalWords: number;
  readonly highestScore: number;
  readonly lowestScore: number;
  readonly favoriteCategories: readonly string[];
  readonly analysisFrequency: Record<string, number>;
  readonly achievements: readonly Achievement[];
}

// Achievement system
export interface Achievement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly unlockedAt: number;
  readonly rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Leaderboard entry with ranking
export interface LeaderboardEntry extends User {
  readonly rank: number;
  readonly scoreChange: number;
  readonly trending: boolean;
}

// API response wrapper for error handling
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp: number;
}

// Analysis request configuration
export interface AnalysisConfig {
  readonly includeRoast: boolean;
  readonly includeApology: boolean;
  readonly roastPersonality: 'sarcastic' | 'witty' | 'brutal' | 'friendly';
  readonly language: string;
  readonly customPrompts?: readonly string[];
}

// Performance metrics for monitoring
export interface PerformanceMetrics {
  readonly analysisTime: number;
  readonly apiLatency: number;
  readonly renderTime: number;
  readonly memoryUsage: number;
  readonly errorRate: number;
}

// Social sharing configuration
export interface ShareConfig {
  readonly platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'discord';
  readonly includeScore: boolean;
  readonly includeRoast: boolean;
  readonly customMessage?: string;
}

// Challenge system types
export interface Challenge {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly targetScore: number;
  readonly reward: string;
  readonly expiresAt: number;
  readonly participants: number;
  readonly difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

// Notification system
export interface Notification {
  readonly id: string;
  readonly type: 'achievement' | 'challenge' | 'social' | 'system';
  readonly title: string;
  readonly message: string;
  readonly timestamp: number;
  readonly read: boolean;
  readonly actionUrl?: string;
}

// Error types for better error handling
export type AppError = 
  | { type: 'NETWORK_ERROR'; message: string }
  | { type: 'VALIDATION_ERROR'; field: string; message: string }
  | { type: 'API_ERROR'; code: number; message: string }
  | { type: 'UNKNOWN_ERROR'; message: string };

// Component prop types
export interface BaseComponentProps {
  readonly className?: string;
  readonly children?: React.ReactNode;
}

// Animation configuration
export interface AnimationConfig {
  readonly duration: number;
  readonly easing: string;
  readonly delay?: number;
  readonly repeat?: boolean;
}