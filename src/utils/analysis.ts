import { AnalysisService } from '@/services/analysis/AnalysisService';
import type { AnalysisResult, AnalysisConfig, RiskLevel } from '@/types';

// Create singleton instance
const analysisService = new AnalysisService();

/**
 * Main analysis function - wrapper around AnalysisService
 */
export async function analyzeText(
  text: string, 
  config?: Partial<AnalysisConfig>
): Promise<AnalysisResult> {
  return analysisService.analyzeText(text, config);
}

/**
 * Utility functions for UI components
 */
export function getRiskColor(riskLevel: RiskLevel): string {
  const colors = {
    SAFE: 'text-emerald-400',
    MILD: 'text-yellow-400',
    MODERATE: 'text-orange-400',
    HIGH: 'text-red-400',
    EXTREME: 'text-red-600',
  };
  return colors[riskLevel];
}

export function getRiskBgColor(riskLevel: RiskLevel): string {
  const colors = {
    SAFE: 'bg-emerald-500/20',
    MILD: 'bg-yellow-500/20',
    MODERATE: 'bg-orange-500/20',
    HIGH: 'bg-red-500/20',
    EXTREME: 'bg-red-600/20',
  };
  return colors[riskLevel];
}

export function getRiskGradient(riskLevel: RiskLevel): string {
  const gradients = {
    SAFE: 'from-emerald-500/20 to-emerald-600/20',
    MILD: 'from-yellow-500/20 to-yellow-600/20',
    MODERATE: 'from-orange-500/20 to-orange-600/20',
    HIGH: 'from-red-500/20 to-red-600/20',
    EXTREME: 'from-red-600/20 to-red-700/20',
  };
  return gradients[riskLevel];
}