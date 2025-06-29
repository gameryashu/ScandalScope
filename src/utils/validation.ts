/**
 * Input validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
  errors: string[];
}

export function validateInput(text: string): ValidationResult {
  const errors: string[] = [];
  
  if (!text || typeof text !== 'string') {
    return {
      isValid: false,
      message: 'Please enter some text to analyze',
      errors: ['Text is required']
    };
  }
  
  const trimmedText = text.trim();
  
  if (trimmedText.length < 10) {
    return {
      isValid: false,
      message: 'Enter at least 10 characters for analysis',
      errors: ['Text too short']
    };
  }
  
  if (trimmedText.length > 2000) {
    return {
      isValid: false,
      message: 'Text must be less than 2000 characters',
      errors: ['Text too long']
    };
  }
  
  // Check for potentially harmful content
  const harmfulPatterns = [
    /\b(kill|die|suicide|harm)\s+(yourself|myself|themselves)/i,
    /\b(bomb|weapon|violence)\s+(threat|plan)/i,
  ];
  
  for (const pattern of harmfulPatterns) {
    if (pattern.test(trimmedText)) {
      return {
        isValid: false,
        message: 'Text contains potentially harmful content',
        errors: ['Harmful content detected']
      };
    }
  }
  
  return {
    isValid: true,
    message: 'Text is ready for analysis',
    errors: []
  };
}

export function sanitizeInput(text: string): string {
  // Remove potentially dangerous characters
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}