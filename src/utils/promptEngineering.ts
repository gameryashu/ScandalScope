import type { RoastMode, RoastModeConfig } from '@/types/roast';

/**
 * Advanced prompt engineering for different roast modes
 * Each mode has carefully crafted prompts for unique personality
 */

export const ROAST_MODE_CONFIGS: Record<RoastMode, RoastModeConfig> = {
  genz: {
    name: 'Gen Z Mode',
    description: 'Casual, meme-based responses with internet slang',
    icon: '🔥',
    color: 'from-pink-500 to-purple-600',
    systemPrompt: `You are a witty Gen Z roaster who speaks in internet slang and memes. 
    Use casual language, abbreviations, and popular internet references. 
    Be playful but not mean-spirited. Include relevant emojis and trending phrases.
    Keep responses under 200 characters and make them shareable.`,
    examples: [
      "bestie really said that and thought it was it 💀",
      "this ain't it chief, respectfully 😭",
      "the audacity is sending me fr fr 🤡"
    ],
    intensity: 6,
    maxTokens: 80,
    temperature: 0.9
  },
  
  hr: {
    name: 'HR Mode',
    description: 'Professional, constructive feedback in corporate speak',
    icon: '💼',
    color: 'from-blue-500 to-indigo-600',
    systemPrompt: `You are a professional HR representative providing constructive feedback.
    Use corporate language, be diplomatic but direct. Focus on improvement opportunities
    and professional development. Maintain a respectful tone while addressing concerns.
    Structure feedback professionally with actionable suggestions.`,
    examples: [
      "We appreciate your perspective, though we'd recommend considering alternative phrasing for broader audience appeal.",
      "This communication style may benefit from refinement to align with professional standards.",
      "Consider reviewing our communication guidelines to enhance message effectiveness."
    ],
    intensity: 3,
    maxTokens: 120,
    temperature: 0.4
  },
  
  therapist: {
    name: 'Therapist Mode',
    description: 'Supportive, understanding feedback with growth mindset',
    icon: '🧠',
    color: 'from-green-500 to-teal-600',
    systemPrompt: `You are a compassionate therapist providing gentle, supportive feedback.
    Use empathetic language, validate feelings while offering growth opportunities.
    Focus on self-reflection, emotional intelligence, and positive reframing.
    Be nurturing but honest, helping the person see different perspectives.`,
    examples: [
      "I hear your frustration, and it's valid. Let's explore how we might express these feelings more constructively.",
      "Your emotions are important. Consider how reframing this message might help others understand your perspective better.",
      "This seems to come from a place of strong feelings. What would it look like to communicate this with compassion?"
    ],
    intensity: 2,
    maxTokens: 150,
    temperature: 0.6
  },
  
  savage: {
    name: 'Savage Mode',
    description: 'Brutally honest, no-holds-barred roasting',
    icon: '💀',
    color: 'from-red-500 to-orange-600',
    systemPrompt: `You are a savage roaster who delivers brutally honest feedback.
    Be direct, witty, and cutting without being genuinely harmful or offensive.
    Use clever wordplay, sharp observations, and devastating one-liners.
    Make it sting but keep it clever and quotable.`,
    examples: [
      "The confidence to post this publicly is truly inspiring. Misguided, but inspiring.",
      "This take is so bad it makes pineapple on pizza look like a reasonable opinion.",
      "Congratulations, you've achieved the impossible: making everyone agree on something - that this ain't it."
    ],
    intensity: 9,
    maxTokens: 100,
    temperature: 0.8
  },
  
  friendly: {
    name: 'Friendly Mode',
    description: 'Gentle, supportive feedback with humor',
    icon: '😊',
    color: 'from-yellow-500 to-orange-500',
    systemPrompt: `You are a friendly, supportive person giving gentle feedback with humor.
    Be kind, encouraging, and use light humor to make points. Focus on the positive
    while gently suggesting improvements. Make the person feel heard and supported
    while helping them see room for growth.`,
    examples: [
      "I love your passion! Maybe we can channel that energy into something even more impactful? 😊",
      "Your heart's in the right place! Let's just polish the delivery a bit ✨",
      "I appreciate you sharing your thoughts! Here's how we might make them even stronger..."
    ],
    intensity: 4,
    maxTokens: 120,
    temperature: 0.7
  }
};

/**
 * Generate dynamic prompt based on mode and context
 */
export function generateRoastPrompt(
  text: string,
  mode: RoastMode,
  intensity: number = 5,
  customContext?: string
): string {
  const config = ROAST_MODE_CONFIGS[mode];
  const intensityModifier = getIntensityModifier(intensity);
  
  return `${config.systemPrompt}

${intensityModifier}

Text to analyze: "${text}"

${customContext ? `Additional context: ${customContext}` : ''}

Generate a ${mode} style response that:
1. Matches the personality and tone described above
2. Is appropriate for the intensity level (${intensity}/10)
3. Stays under ${config.maxTokens * 2} characters
4. Is memorable and shareable
5. Provides value while being entertaining

Response:`;
}

/**
 * Get intensity modifier for prompts
 */
function getIntensityModifier(intensity: number): string {
  if (intensity <= 2) {
    return "Be very gentle and supportive. Focus on encouragement.";
  } else if (intensity <= 4) {
    return "Be mild and constructive. Use light humor if appropriate.";
  } else if (intensity <= 6) {
    return "Be moderately direct. Balance honesty with tact.";
  } else if (intensity <= 8) {
    return "Be quite direct and witty. Don't hold back much.";
  } else {
    return "Be brutally honest and savage. Pull no punches (while staying appropriate).";
  }
}

/**
 * Generate unique response variations to prevent repetition
 */
export function generateVariationPrompt(
  originalText: string,
  mode: RoastMode,
  previousResponses: string[]
): string {
  const config = ROAST_MODE_CONFIGS[mode];
  
  return `${config.systemPrompt}

Original text: "${originalText}"

Previous responses to avoid repeating:
${previousResponses.map((resp, i) => `${i + 1}. "${resp}"`).join('\n')}

Generate a completely different ${mode} style response that:
1. Takes a different angle or approach than the previous responses
2. Uses different vocabulary and phrasing
3. Maintains the same quality and personality
4. Is fresh and original

Response:`;
}

/**
 * Validate and sanitize roast content
 */
export function validateRoastContent(content: string, mode: RoastMode): {
  isValid: boolean;
  issues: string[];
  sanitized: string;
} {
  const issues: string[] = [];
  let sanitized = content.trim();
  
  // Check length
  const maxLength = ROAST_MODE_CONFIGS[mode].maxTokens * 2;
  if (sanitized.length > maxLength) {
    issues.push(`Content too long (${sanitized.length}/${maxLength} chars)`);
    sanitized = sanitized.substring(0, maxLength - 3) + '...';
  }
  
  // Check for inappropriate content
  const inappropriatePatterns = [
    /\b(kill|die|suicide|harm)\b/i,
    /\b(racist|sexist|homophobic)\b/i,
    /\b(doxx|dox|address|phone)\b/i
  ];
  
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(sanitized)) {
      issues.push('Contains potentially harmful content');
      break;
    }
  }
  
  // Ensure it's not empty
  if (!sanitized || sanitized.length < 10) {
    issues.push('Content too short or empty');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    sanitized
  };
}

/**
 * Generate tags for roast categorization
 */
export function generateRoastTags(content: string, mode: RoastMode): string[] {
  const tags: string[] = [mode];
  
  // Sentiment analysis
  if (/\b(love|great|awesome|amazing)\b/i.test(content)) {
    tags.push('positive');
  } else if (/\b(terrible|awful|bad|worst)\b/i.test(content)) {
    tags.push('critical');
  }
  
  // Content type - Fixed emoji detection regex
  if (/\p{Emoji}/u.test(content)) {
    tags.push('emoji');
  }
  
  if (/\b(lol|lmao|fr|ngl|tbh)\b/i.test(content)) {
    tags.push('slang');
  }
  
  if (/\b(professional|corporate|workplace)\b/i.test(content)) {
    tags.push('professional');
  }
  
  return tags;
}