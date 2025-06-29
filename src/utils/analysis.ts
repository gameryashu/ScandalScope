import type { RiskLevel } from '@/types';

/**
 * Utility functions for analysis UI components
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

export function getRiskBadgeColor(riskLevel: RiskLevel): string {
  const colors = {
    SAFE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    MILD: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    MODERATE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
    EXTREME: 'bg-red-600/20 text-red-600 border-red-600/30',
  };
  return colors[riskLevel];
}