import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Additional utility functions for common class operations
 */
export function conditionalClass(condition: boolean, trueClass: string, falseClass?: string) {
  return condition ? trueClass : falseClass || '';
}

export function variantClass(variant: string, variants: Record<string, string>, defaultVariant = '') {
  return variants[variant] || defaultVariant;
}