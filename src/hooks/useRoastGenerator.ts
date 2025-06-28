import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { 
  RoastConfig, 
  RoastResult, 
  RoastGenerationRequest,
  RoastGenerationResponse,
  RoastMode 
} from '@/types/roast';
import { 
  generateRoastPrompt, 
  generateVariationPrompt,
  validateRoastContent,
  generateRoastTags,
  ROAST_MODE_CONFIGS 
} from '@/utils/promptEngineering';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

/**
 * Custom hook for roast generation with caching and rate limiting
 */
export function useRoastGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRoast, setCurrentRoast] = useState<RoastResult | null>(null);
  const [generationHistory, setGenerationHistory] = useState<RoastResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const { showToast, addError } = useStore();
  const cacheRef = useRef(new Map<string, RoastResult>());
  const rateLimitRef = useRef(new Map<string, number>());

  /**
   * Generate a roast with the specified configuration
   */
  const generateRoast = useCallback(async (
    text: string,
    config: RoastConfig
  ): Promise<RoastResult | null> => {
    if (!text.trim()) {
      showToast('Please provide text to roast!', 'error');
      return null;
    }

    if (text.length < 10) {
      showToast('Text must be at least 10 characters long', 'error');
      return null;
    }

    if (text.length > 2000) {
      showToast('Text is too long (max 2000 characters)', 'error');
      return null;
    }

    // Check rate limiting
    const rateLimitKey = `${config.mode}_${Date.now() - (Date.now() % 60000)}`; // Per minute
    const currentCount = rateLimitRef.current.get(rateLimitKey) || 0;
    
    if (currentCount >= 10) { // 10 requests per minute per mode
      showToast('Rate limit exceeded. Please wait a moment.', 'error');
      return null;
    }

    // Check cache
    const cacheKey = `${text}_${config.mode}_${config.intensity}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setCurrentRoast(cached);
      return cached;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Get previous responses for variation
      const previousResponses = generationHistory
        .filter(r => r.mode === config.mode)
        .slice(-3)
        .map(r => r.content);

      const prompt = previousResponses.length > 0
        ? generateVariationPrompt(text, config.mode, previousResponses)
        : generateRoastPrompt(text, config.mode, config.intensity);

      const response = await callOpenAI(prompt, config);
      
      if (!response.success || !response.result) {
        throw new Error(response.error || 'Failed to generate roast');
      }

      const result = response.result;
      
      // Validate content
      const validation = validateRoastContent(result.content, config.mode);
      if (!validation.isValid) {
        throw new Error(`Generated content failed validation: ${validation.issues.join(', ')}`);
      }

      // Update result with validated content
      result.content = validation.sanitized;
      result.tags = generateRoastTags(result.content, config.mode);

      // Cache result
      cacheRef.current.set(cacheKey, result);
      
      // Update rate limiting
      rateLimitRef.current.set(rateLimitKey, currentCount + 1);

      // Update state
      setCurrentRoast(result);
      setGenerationHistory(prev => [result, ...prev.slice(0, 49)]); // Keep last 50

      showToast(`${ROAST_MODE_CONFIGS[config.mode].name} roast generated! 🔥`, 'success');
      
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate roast';
      setError(errorMessage);
      showToast(`Generation failed: ${errorMessage}`, 'error');
      
      addError({
        type: 'API_ERROR',
        code: 500,
        message: errorMessage,
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [showToast, addError, generationHistory]);

  /**
   * Generate multiple roasts with different modes
   */
  const generateMultipleRoasts = useCallback(async (
    text: string,
    modes: RoastMode[]
  ): Promise<RoastResult[]> => {
    const results: RoastResult[] = [];
    
    for (const mode of modes) {
      const config: RoastConfig = {
        mode,
        intensity: 5,
        includeEmojis: true,
        maxLength: 200
      };
      
      const result = await generateRoast(text, config);
      if (result) {
        results.push(result);
      }
      
      // Add delay between requests to avoid rate limiting
      if (modes.indexOf(mode) < modes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }, [generateRoast]);

  /**
   * Regenerate current roast with same settings
   */
  const regenerateRoast = useCallback(async (): Promise<RoastResult | null> => {
    if (!currentRoast) {
      showToast('No roast to regenerate', 'error');
      return null;
    }

    const config: RoastConfig = {
      mode: currentRoast.mode,
      intensity: 5, // Default intensity
      includeEmojis: true,
      maxLength: 200
    };

    return generateRoast(currentRoast.originalText, config);
  }, [currentRoast, generateRoast, showToast]);

  /**
   * Clear current roast and history
   */
  const clearRoasts = useCallback(() => {
    setCurrentRoast(null);
    setGenerationHistory([]);
    setError(null);
    cacheRef.current.clear();
  }, []);

  /**
   * Get roast statistics
   */
  const getStats = useCallback(() => {
    const modeStats = generationHistory.reduce((acc, roast) => {
      acc[roast.mode] = (acc[roast.mode] || 0) + 1;
      return acc;
    }, {} as Record<RoastMode, number>);

    return {
      totalGenerated: generationHistory.length,
      modeBreakdown: modeStats,
      averageConfidence: generationHistory.length > 0
        ? generationHistory.reduce((sum, r) => sum + r.confidence, 0) / generationHistory.length
        : 0,
      cacheSize: cacheRef.current.size
    };
  }, [generationHistory]);

  return {
    // State
    isGenerating,
    currentRoast,
    generationHistory,
    error,
    
    // Actions
    generateRoast,
    generateMultipleRoasts,
    regenerateRoast,
    clearRoasts,
    
    // Utils
    getStats
  };
}

/**
 * Call OpenAI API for roast generation
 */
async function callOpenAI(
  prompt: string,
  config: RoastConfig
): Promise<RoastGenerationResponse> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    // Return mock response for development
    return {
      success: true,
      result: {
        id: uuidv4(),
        content: generateMockRoast(config.mode),
        mode: config.mode,
        timestamp: Date.now(),
        originalText: 'Mock text',
        confidence: 0.85,
        tags: [config.mode, 'mock']
      }
    };
  }

  const modeConfig = ROAST_MODE_CONFIGS[config.mode];
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: modeConfig.systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: modeConfig.maxTokens,
        temperature: modeConfig.temperature,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content generated');
    }

    return {
      success: true,
      result: {
        id: uuidv4(),
        content,
        mode: config.mode,
        timestamp: Date.now(),
        originalText: prompt.split('Text to analyze: "')[1]?.split('"')[0] || '',
        confidence: 0.9,
        tags: generateRoastTags(content, config.mode)
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate mock roast for development
 */
function generateMockRoast(mode: RoastMode): string {
  const mockRoasts = {
    genz: [
      "bestie really thought this was the one 💀",
      "this ain't it chief, respectfully 😭",
      "the secondhand embarrassment is real rn 🤡"
    ],
    hr: [
      "We appreciate your input, though we'd recommend reviewing our communication guidelines.",
      "This message could benefit from a more professional tone and structure.",
      "Consider how this aligns with our company values and external perception."
    ],
    therapist: [
      "I hear your passion, and it's valid. Let's explore how to express this more constructively.",
      "Your feelings are important. How might we reframe this to help others understand your perspective?",
      "This seems to come from a strong place. What would compassionate communication look like here?"
    ],
    savage: [
      "The confidence to post this publicly is truly inspiring. Misguided, but inspiring.",
      "This take is so bad it makes pineapple on pizza look reasonable.",
      "Congratulations, you've achieved the impossible: universal disagreement."
    ],
    friendly: [
      "I love your enthusiasm! Maybe we can polish the delivery a bit? 😊",
      "Your heart's in the right place! Let's just refine the message ✨",
      "Great passion! Here's how we might make it even more impactful..."
    ]
  };

  const roasts = mockRoasts[mode];
  return roasts[Math.floor(Math.random() * roasts.length)];
}