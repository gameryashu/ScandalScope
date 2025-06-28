/**
 * Type definitions for the roast generation system
 */

export type RoastMode = 'genz' | 'hr' | 'therapist' | 'savage' | 'friendly';

export interface RoastConfig {
  mode: RoastMode;
  intensity: number; // 1-10 scale
  includeEmojis: boolean;
  maxLength: number;
  customPrompt?: string;
}

export interface RoastResult {
  id: string;
  content: string;
  mode: RoastMode;
  timestamp: number;
  originalText: string;
  confidence: number;
  tags: string[];
  shareableUrl?: string;
}

export interface RoastModeConfig {
  name: string;
  description: string;
  icon: string;
  color: string;
  systemPrompt: string;
  examples: string[];
  intensity: number;
  maxTokens: number;
  temperature: number;
}

export interface RoastGenerationRequest {
  text: string;
  config: RoastConfig;
  userId?: string;
}

export interface RoastGenerationResponse {
  success: boolean;
  result?: RoastResult;
  error?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}