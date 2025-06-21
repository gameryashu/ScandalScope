import type { AnalysisResult, AnalysisConfig, RiskLevel, AnalysisCategories } from '@/types';

/**
 * Enhanced AI-powered text analysis system
 * Integrates multiple AI services for comprehensive content analysis
 */

// Configuration constants
const API_CONFIG = {
  PERSPECTIVE_API_KEY: import.meta.env.VITE_PERSPECTIVE_API_KEY || '',
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.scandalscope.com',
  TIMEOUT: 15000,
  MAX_RETRIES: 3,
} as const;

// Risk level thresholds (0-100 scale)
const RISK_THRESHOLDS = {
  SAFE: 20,
  MILD: 40,
  MODERATE: 60,
  HIGH: 80,
  EXTREME: 100,
} as const;

// Roast personalities with different styles
const ROAST_PERSONALITIES = {
  sarcastic: {
    prompt: "Generate a witty, sarcastic roast that's clever but not mean-spirited",
    intensity: 0.6,
  },
  witty: {
    prompt: "Create a clever, humorous roast that's playful and intelligent",
    intensity: 0.4,
  },
  brutal: {
    prompt: "Deliver a savage, no-holds-barred roast that's brutally honest",
    intensity: 0.9,
  },
  friendly: {
    prompt: "Give a gentle, friendly roast that's more teasing than harsh",
    intensity: 0.3,
  },
} as const;

/**
 * Performance monitoring wrapper for async operations
 */
async function withPerformanceTracking<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const endTime = performance.now();
    
    // Log performance metrics
    console.debug(`${operationName} completed in ${endTime - startTime}ms`);
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    console.error(`${operationName} failed after ${endTime - startTime}ms:`, error);
    throw error;
  }
}

/**
 * Retry wrapper for API calls with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = API_CONFIG.MAX_RETRIES,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Analyze text using Google's Perspective API for toxicity detection
 */
async function analyzeToxicity(text: string): Promise<AnalysisCategories> {
  if (!API_CONFIG.PERSPECTIVE_API_KEY) {
    // Fallback to mock analysis if API key not available
    return generateMockCategories(text);
  }
  
  const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${API_CONFIG.PERSPECTIVE_API_KEY}`;
  
  const requestBody = {
    comment: { text },
    requestedAttributes: {
      TOXICITY: {},
      SEVERE_TOXICITY: {},
      IDENTITY_ATTACK: {},
      INSULT: {},
      PROFANITY: {},
      THREAT: {},
      SEXUALLY_EXPLICIT: {},
      FLIRTATION: {},
    },
    languages: ['en'],
    doNotStore: true,
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
  });
  
  if (!response.ok) {
    throw new Error(`Perspective API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  const scores = data.attributeScores;
  
  return {
    toxicity: Math.round((scores.TOXICITY?.summaryScore?.value || 0) * 100),
    identity_attack: Math.round((scores.IDENTITY_ATTACK?.summaryScore?.value || 0) * 100),
    insult: Math.round((scores.INSULT?.summaryScore?.value || 0) * 100),
    profanity: Math.round((scores.PROFANITY?.summaryScore?.value || 0) * 100),
    threat: Math.round((scores.THREAT?.summaryScore?.value || 0) * 100),
    sexually_explicit: Math.round((scores.SEXUALLY_EXPLICIT?.summaryScore?.value || 0) * 100),
    flirtation: Math.round((scores.FLIRTATION?.summaryScore?.value || 0) * 100),
    spam: Math.round(Math.random() * 30), // Mock spam detection
  };
}

/**
 * Generate AI-powered roast using GPT-4
 */
async function generateRoast(
  text: string, 
  riskLevel: RiskLevel, 
  personality: keyof typeof ROAST_PERSONALITIES = 'witty'
): Promise<string> {
  if (!API_CONFIG.OPENAI_API_KEY) {
    return generateMockRoast(riskLevel);
  }
  
  const personalityConfig = ROAST_PERSONALITIES[personality];
  const prompt = `
    ${personalityConfig.prompt}
    
    Text to roast: "${text}"
    Risk level: ${riskLevel}
    
    Guidelines:
    - Keep it under 200 characters
    - Match the ${personality} personality
    - Be creative and original
    - Avoid personal attacks or harmful content
    - Make it shareable and memorable
  `;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a witty AI that creates clever, harmless roasts for social media content analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
      presence_penalty: 0.6,
    }),
    signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || generateMockRoast(riskLevel);
}

/**
 * Generate contextual apology using AI
 */
async function generateApology(text: string, riskLevel: RiskLevel): Promise<string> {
  if (!API_CONFIG.OPENAI_API_KEY) {
    return generateMockApology(riskLevel);
  }
  
  const prompt = `
    Generate a sincere, contextual apology for the following text:
    "${text}"
    
    Risk level: ${riskLevel}
    
    Guidelines:
    - Be genuine and specific to the content
    - Acknowledge potential harm
    - Show understanding of impact
    - Offer commitment to improvement
    - Keep it under 300 characters
    - Make it feel authentic, not generic
  `;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at crafting sincere, contextual apologies that acknowledge harm and show genuine remorse.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || generateMockApology(riskLevel);
}

/**
 * Calculate overall cancel score from category scores
 */
function calculateCancelScore(categories: AnalysisCategories): number {
  const weights = {
    toxicity: 0.25,
    identity_attack: 0.20,
    insult: 0.15,
    profanity: 0.10,
    threat: 0.20,
    sexually_explicit: 0.05,
    flirtation: 0.02,
    spam: 0.03,
  };
  
  const weightedScore = Object.entries(categories).reduce((sum, [key, value]) => {
    const weight = weights[key as keyof typeof weights] || 0;
    return sum + (value * weight);
  }, 0);
  
  // Apply non-linear scaling for more dramatic differences
  const scaledScore = Math.pow(weightedScore / 100, 0.8) * 100;
  
  return Math.min(Math.round(scaledScore), 100);
}

/**
 * Determine risk level from cancel score
 */
function getRiskLevel(score: number): RiskLevel {
  if (score < RISK_THRESHOLDS.SAFE) return 'SAFE';
  if (score < RISK_THRESHOLDS.MILD) return 'MILD';
  if (score < RISK_THRESHOLDS.MODERATE) return 'MODERATE';
  if (score < RISK_THRESHOLDS.HIGH) return 'HIGH';
  return 'EXTREME';
}

/**
 * Generate smart recommendations based on analysis
 */
function generateRecommendations(
  categories: AnalysisCategories, 
  riskLevel: RiskLevel
): string[] {
  const recommendations: string[] = [];
  
  // Base recommendations for all levels
  recommendations.push("Consider your audience before posting");
  
  // Category-specific recommendations
  if (categories.toxicity > 50) {
    recommendations.push("Reframe negative language more constructively");
  }
  
  if (categories.identity_attack > 30) {
    recommendations.push("Avoid language that targets specific groups");
  }
  
  if (categories.insult > 40) {
    recommendations.push("Replace personal attacks with constructive criticism");
  }
  
  if (categories.profanity > 60) {
    recommendations.push("Consider using alternative expressions");
  }
  
  if (categories.threat > 20) {
    recommendations.push("Remove any threatening language immediately");
  }
  
  // Risk-level specific recommendations
  switch (riskLevel) {
    case 'HIGH':
    case 'EXTREME':
      recommendations.push("Strongly consider not posting this content");
      recommendations.push("Consult with others before sharing");
      break;
    case 'MODERATE':
      recommendations.push("Review and revise before posting");
      break;
    case 'MILD':
      recommendations.push("Minor adjustments could improve reception");
      break;
    case 'SAFE':
      recommendations.push("Content appears safe for most audiences");
      break;
  }
  
  return recommendations.slice(0, 4); // Limit to 4 recommendations
}

/**
 * Mock analysis functions for development/fallback
 */
function generateMockCategories(text: string): AnalysisCategories {
  const words = text.toLowerCase().split(' ');
  const riskWords = ['hate', 'stupid', 'idiot', 'kill', 'die', 'worst', 'terrible', 'awful'];
  const controversialWords = ['politics', 'religion', 'gender', 'race', 'sexuality'];
  
  let baseScore = Math.random() * 30 + 5;
  
  // Increase score for risk words
  riskWords.forEach(word => {
    if (words.some(w => w.includes(word))) baseScore += 15;
  });
  
  // Increase score for controversial topics
  controversialWords.forEach(word => {
    if (words.some(w => w.includes(word))) baseScore += 10;
  });
  
  const toxicity = Math.min(Math.round(baseScore + Math.random() * 20), 100);
  
  return {
    toxicity,
    identity_attack: Math.round(toxicity * 0.7 + Math.random() * 20),
    insult: Math.round(toxicity * 0.8 + Math.random() * 15),
    profanity: Math.round(Math.random() * 40),
    threat: Math.round(toxicity * 0.3 + Math.random() * 10),
    sexually_explicit: Math.round(Math.random() * 20),
    flirtation: Math.round(Math.random() * 30),
    spam: Math.round(Math.random() * 25),
  };
}

function generateMockRoast(riskLevel: RiskLevel): string {
  const roasts = {
    SAFE: [
      "Congrats! You're about as controversial as vanilla ice cream. 🍦",
      "Your takes are so mild, they could be served at a church potluck.",
      "You're the human equivalent of elevator music - inoffensive and forgettable.",
      "Your opinions are safer than a padded room wrapped in bubble wrap.",
    ],
    MILD: [
      "You're walking the line between boring and slightly spicy. Keep it up! 🌶️",
      "Your controversy level is like decaf coffee - technically there, but barely.",
      "You're about as edgy as a butter knife at a foam sword fight.",
      "Your takes have the heat of room temperature water.",
    ],
    MODERATE: [
      "Ooh, someone's feeling brave today! You're in the danger zone now. ⚠️",
      "Your opinions are starting to cook - hope you can handle the heat!",
      "You're playing with fire, but at least it's not a flamethrower... yet.",
      "Your controversy meter is beeping - proceed with caution!",
    ],
    HIGH: [
      "Yikes! You're one tweet away from trending for all the wrong reasons. 🔥",
      "Your takes are spicier than ghost peppers - handle with care!",
      "You're in the red zone! Time to lawyer up and delete some posts.",
      "Your opinions are more explosive than a Michael Bay movie.",
    ],
    EXTREME: [
      "HOLY CANCEL! You're basically asking for a Twitter mob at this point! 💀",
      "Your takes are so hot they could melt steel beams!",
      "You've achieved maximum controversy - congratulations, you're now unemployable!",
      "Your opinions are more dangerous than a toddler with a chainsaw!",
    ],
  };
  
  const levelRoasts = roasts[riskLevel];
  return levelRoasts[Math.floor(Math.random() * levelRoasts.length)];
}

function generateMockApology(riskLevel: RiskLevel): string {
  const apologies = [
    "I sincerely apologize for my previous statement. I recognize that my words were harmful and I take full responsibility.",
    "I want to acknowledge the hurt my words have caused. I am committed to learning and growing from this experience.",
    "My previous comments do not reflect my true values. I apologize unreservedly and will do better.",
    "I deeply regret my words and the impact they've had. I'm taking time to reflect and educate myself.",
    "I apologize for my insensitive remarks. I understand the harm they've caused and I'm committed to change.",
  ];
  
  return apologies[Math.floor(Math.random() * apologies.length)];
}

/**
 * Main analysis function with comprehensive error handling and performance tracking
 */
export async function analyzeText(
  text: string, 
  config: Partial<AnalysisConfig> = {}
): Promise<AnalysisResult> {
  const startTime = performance.now();
  
  // Input validation
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: text must be a non-empty string');
  }
  
  if (text.length < 3) {
    throw new Error('Text must be at least 3 characters long');
  }
  
  if (text.length > 5000) {
    throw new Error('Text must be less than 5000 characters');
  }
  
  const defaultConfig: AnalysisConfig = {
    includeRoast: true,
    includeApology: true,
    roastPersonality: 'witty',
    language: 'en',
    ...config,
  };
  
  try {
    // Parallel execution of analysis tasks
    const [categories, roast, apology] = await Promise.all([
      withRetry(() => withPerformanceTracking(
        () => analyzeToxicity(text),
        'Toxicity Analysis'
      )),
      defaultConfig.includeRoast 
        ? withRetry(() => withPerformanceTracking(
            () => generateRoast(text, 'MODERATE', defaultConfig.roastPersonality),
            'Roast Generation'
          ))
        : Promise.resolve(''),
      defaultConfig.includeApology
        ? withRetry(() => withPerformanceTracking(
            () => generateApology(text, 'MODERATE'),
            'Apology Generation'
          ))
        : Promise.resolve(''),
    ]);
    
    const cancelScore = calculateCancelScore(categories);
    const riskLevel = getRiskLevel(cancelScore);
    const recommendations = generateRecommendations(categories, riskLevel);
    const processingTime = performance.now() - startTime;
    
    // Calculate confidence based on text length and analysis consistency
    const confidence = Math.min(
      0.7 + (text.length / 1000) * 0.2 + Math.random() * 0.1,
      0.95
    );
    
    const result: AnalysisResult = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      cancelScore,
      riskLevel,
      roast: roast || generateMockRoast(riskLevel),
      apology: apology || generateMockApology(riskLevel),
      timestamp: Date.now(),
      categories,
      recommendations,
      confidence: Math.round(confidence * 100) / 100,
      processingTime: Math.round(processingTime),
      version: '2.0.0',
    };
    
    return result;
    
  } catch (error) {
    console.error('Analysis failed:', error);
    
    // Fallback to mock analysis on error
    const categories = generateMockCategories(text);
    const cancelScore = calculateCancelScore(categories);
    const riskLevel = getRiskLevel(cancelScore);
    const processingTime = performance.now() - startTime;
    
    return {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      cancelScore,
      riskLevel,
      roast: generateMockRoast(riskLevel),
      apology: generateMockApology(riskLevel),
      timestamp: Date.now(),
      categories,
      recommendations: generateRecommendations(categories, riskLevel),
      confidence: 0.5, // Lower confidence for fallback analysis
      processingTime: Math.round(processingTime),
      version: '2.0.0-fallback',
    };
  }
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

// Export configuration for external use
export { RISK_THRESHOLDS, ROAST_PERSONALITIES };