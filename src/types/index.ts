/**
 * Core type definitions for ScandalScope V2
 */

// Risk level enumeration
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

// Analysis request configuration
export interface AnalysisConfig {
  readonly includeRoast: boolean;
  readonly includeApology: boolean;
  readonly roastPersonality: 'sarcastic' | 'witty' | 'brutal' | 'friendly';
  readonly language: string;
}

// Performance metrics for monitoring
export interface PerformanceMetrics {
  readonly analysisTime: number;
  readonly apiLatency: number;
  readonly renderTime: number;
  readonly memoryUsage: number;
  readonly errorRate: number;
}