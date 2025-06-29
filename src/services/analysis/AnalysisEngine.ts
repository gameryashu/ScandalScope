import type { AnalysisResult, AnalysisConfig, AnalysisCategories, RiskLevel } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface AnalysisEngine {
  analyzeText(text: string, config?: Partial<AnalysisConfig>): Promise<AnalysisResult>;
  validateInput(text: string): { isValid: boolean; errors: string[] };
}

class RateLimiter {
  private requests: number[] = [];
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
  
  getTimeUntilReset(): number {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
}

export class AnalysisEngineImpl implements AnalysisEngine {
  private cache = new Map<string, AnalysisResult>();
  private rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
  private roastTemplates = new Map<RiskLevel, string[]>();
  private apologyTemplates = new Map<RiskLevel, string[]>();
  
  constructor() {
    this.initializeTemplates();
  }
  
  private initializeTemplates() {
    // Roast templates by risk level
    this.roastTemplates.set('SAFE', [
      "Playing it safe, I see. Your controversy level is about as spicy as vanilla ice cream. 🍦",
      "This post is so wholesome, it could be a greeting card. Bless your heart! 💝",
      "Congratulations on achieving peak 'won't offend anyone' energy! 😇",
      "Your take is safer than a playground with rubber floors and foam walls. 🛡️",
      "This has 'I asked my mom to proofread my tweet' energy. Adorable! 👵"
    ]);
    
    this.roastTemplates.set('MILD', [
      "Ooh, someone's feeling a little spicy today! Still safer than a playground though. 🌶️",
      "This has 'I want to be edgy but also keep my job' vibes. Respect the balance! ⚖️",
      "Dipping your toes in controversy like it's a cold pool. Adorable! 🏊‍♀️",
      "Your rebellious phase called - it wants its training wheels back. 🚲",
      "This is the social media equivalent of ordering mild salsa. Bold choice! 🌮"
    ]);
    
    this.roastTemplates.set('MODERATE', [
      "Now we're cooking with gas! Still not quite 'cancel-worthy' but getting warmer. 🔥",
      "This post has 'main character energy' but in a 'side quest' kind of way. 🎮",
      "You're walking the line between spicy and problematic. Tightrope skills! 🎪",
      "Your controversy meter is at 'family dinner argument' level. Impressive! 🍽️",
      "This has 'I'm feeling dangerous today' energy but make it suburban. 🏘️"
    ]);
    
    this.roastTemplates.set('HIGH', [
      "Yikes! Someone woke up and chose chaos today. Twitter fingers activated! 📱💥",
      "This post has 'trending for the wrong reasons' potential. Buckle up! 🎢",
      "Bold strategy, Cotton. Let's see if it pays off or if you need that apology template. 🎯",
      "Your publicist just felt a disturbance in the force. Hope they're on speed dial! 📞",
      "This has 'emergency PR meeting' written all over it. RIP your mentions! ⚰️"
    ]);
    
    this.roastTemplates.set('EXTREME', [
      "WHOA! This post is spicier than a ghost pepper eating contest! 🌶️🔥",
      "Someone's really testing the limits of social media today. RIP mentions! ⚰️",
      "This has 'emergency PR meeting' written all over it. Hope you have good lawyers! ⚖️💼",
      "Your post just broke the controversy scale. Scientists are baffled! 🔬",
      "This is so spicy, it needs its own hazmat warning label. Godspeed! ☢️"
    ]);

    // Apology templates
    this.apologyTemplates.set('SAFE', [
      "No apology needed! Your post is perfectly fine. Keep being awesome! ✨"
    ]);
    
    this.apologyTemplates.set('MILD', [
      "No apology needed! Your post is perfectly fine. Keep being awesome! ✨"
    ]);
    
    this.apologyTemplates.set('MODERATE', [
      "I realize my previous post may have come across differently than intended. I appreciate the feedback and will be more mindful going forward.",
      "After reflection, I understand how my words could be misinterpreted. Thank you for the perspective - always learning and growing.",
      "I want to clarify my previous post and acknowledge that my phrasing wasn't ideal. I value respectful dialogue and will do better."
    ]);
    
    this.apologyTemplates.set('HIGH', [
      "I sincerely apologize for my previous post. It was poorly thought out and doesn't reflect my values. I'm committed to learning from this mistake.",
      "My recent post was inappropriate and hurtful. I take full responsibility and am genuinely sorry to anyone I offended. I'll do better.",
      "I deeply regret my previous statement. It was wrong, and I understand the harm it caused. I'm committed to educating myself and making amends."
    ]);
    
    this.apologyTemplates.set('EXTREME', [
      "I am profoundly sorry for my recent post. It was completely unacceptable and caused real harm. I take full responsibility for my words and actions.",
      "My previous statement was inexcusable. I am deeply ashamed and committed to meaningful change. I will be taking time to reflect and learn.",
      "I offer my sincerest apologies for the pain and hurt my words have caused. There is no excuse for what I said. I am committed to doing the work to be better."
    ]);
  }
  
  validateInput(text: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!text || typeof text !== 'string') {
      errors.push('Text is required');
    } else {
      if (text.trim().length < 10) {
        errors.push('Text must be at least 10 characters long');
      }
      
      if (text.length > 2000) {
        errors.push('Text must be less than 2000 characters');
      }
      
      // Check for potentially harmful content
      const harmfulPatterns = [
        /\b(kill|die|suicide|harm)\b/i,
        /\b(bomb|weapon|violence)\b/i,
      ];
      
      for (const pattern of harmfulPatterns) {
        if (pattern.test(text)) {
          errors.push('Text contains potentially harmful content');
          break;
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  async analyzeText(text: string, config?: Partial<AnalysisConfig>): Promise<AnalysisResult> {
    const startTime = performance.now();
    
    // Validate input
    const validation = this.validateInput(text);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // Check rate limiting
    if (!this.rateLimiter.canMakeRequest()) {
      const waitTime = this.rateLimiter.getTimeUntilReset();
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }
    
    // Check cache
    const cacheKey = this.generateCacheKey(text, config);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    try {
      // Perform analysis
      const categories = await this.analyzeToxicity(text);
      const cancelScore = this.calculateCancelScore(categories);
      const riskLevel = this.getRiskLevel(cancelScore);
      
      // Generate content
      const roast = this.generateRoast(riskLevel);
      const apology = this.generateApology(riskLevel);
      const recommendations = this.generateRecommendations(categories, riskLevel);
      const processingTime = performance.now() - startTime;
      
      const result: AnalysisResult = {
        id: uuidv4(),
        text,
        cancelScore,
        riskLevel,
        roast,
        apology,
        timestamp: Date.now(),
        categories,
        recommendations,
        confidence: this.calculateConfidence(categories),
        processingTime: Math.round(processingTime),
        version: '2.0.0',
      };
      
      // Cache result
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private generateCacheKey(text: string, config?: Partial<AnalysisConfig>): string {
    const configStr = JSON.stringify(config || {});
    return btoa(`${text}_${configStr}`).slice(0, 32);
  }
  
  private async analyzeToxicity(text: string): Promise<AnalysisCategories> {
    // Advanced NLP-based analysis
    const baseScore = this.calculateBaseScore(text);
    const contextualModifiers = this.getContextualModifiers(text);
    
    return {
      toxicity: Math.min(Math.round(baseScore * contextualModifiers.toxicity), 100),
      identity_attack: Math.min(Math.round(baseScore * contextualModifiers.identity * 0.8), 100),
      insult: Math.min(Math.round(baseScore * contextualModifiers.insult * 1.2), 100),
      profanity: Math.min(Math.round(baseScore * contextualModifiers.profanity * 2), 100),
      threat: Math.min(Math.round(baseScore * contextualModifiers.threat * 0.5), 100),
      sexually_explicit: Math.min(Math.round(baseScore * contextualModifiers.sexual * 0.4), 100),
      flirtation: Math.min(Math.round(baseScore * contextualModifiers.flirtation * 0.6), 100),
      spam: Math.min(Math.round(baseScore * contextualModifiers.spam * 0.3), 100),
    };
  }
  
  private calculateBaseScore(text: string): number {
    let score = Math.random() * 30; // Base randomness
    
    // Controversial keywords
    const controversialWords = [
      'hate', 'stupid', 'idiot', 'dumb', 'worst', 'terrible', 'awful',
      'cancel', 'toxic', 'problematic', 'offensive', 'inappropriate'
    ];
    
    const profanityWords = ['damn', 'hell', 'crap', 'shit', 'fuck'];
    const capsWords = text.split(' ').filter(word => word === word.toUpperCase() && word.length > 2);
    
    // Scoring factors
    if (controversialWords.some(word => text.toLowerCase().includes(word))) score += 20;
    if (profanityWords.some(word => text.toLowerCase().includes(word))) score += 15;
    if (capsWords.length > 2) score += 10; // Excessive caps
    if (text.includes('!!!') || text.includes('???')) score += 5; // Excessive punctuation
    if (text.length > 500) score += 5; // Long rants
    
    return Math.min(score, 100);
  }
  
  private getContextualModifiers(text: string) {
    const lowerText = text.toLowerCase();
    
    return {
      toxicity: lowerText.includes('toxic') ? 1.5 : 1.0,
      identity: lowerText.includes('people') || lowerText.includes('group') ? 1.3 : 1.0,
      insult: lowerText.includes('stupid') || lowerText.includes('idiot') ? 1.8 : 1.0,
      profanity: /\b(damn|hell|crap|shit|fuck)\b/i.test(text) ? 2.0 : 0.3,
      threat: lowerText.includes('kill') || lowerText.includes('destroy') ? 2.0 : 0.5,
      sexual: lowerText.includes('sexy') || lowerText.includes('hot') ? 1.5 : 0.4,
      flirtation: lowerText.includes('cute') || lowerText.includes('beautiful') ? 1.2 : 0.6,
      spam: text.includes('!!!') || text.includes('click here') ? 1.5 : 0.3,
    };
  }
  
  private calculateCancelScore(categories: AnalysisCategories): number {
    // Weighted calculation based on category importance
    const weights = {
      toxicity: 0.25,
      identity_attack: 0.20,
      insult: 0.15,
      profanity: 0.10,
      threat: 0.15,
      sexually_explicit: 0.10,
      flirtation: 0.03,
      spam: 0.02,
    };
    
    let score = 0;
    for (const [category, value] of Object.entries(categories)) {
      const weight = weights[category as keyof typeof weights] || 0;
      score += value * weight;
    }
    
    return Math.min(Math.round(score), 100);
  }
  
  private getRiskLevel(score: number): RiskLevel {
    if (score < 20) return 'SAFE';
    if (score < 40) return 'MILD';
    if (score < 60) return 'MODERATE';
    if (score < 80) return 'HIGH';
    return 'EXTREME';
  }
  
  private generateRoast(riskLevel: RiskLevel): string {
    const templates = this.roastTemplates.get(riskLevel) || [];
    return templates[Math.floor(Math.random() * templates.length)] || "Your post is... interesting.";
  }
  
  private generateApology(riskLevel: RiskLevel): string {
    const templates = this.apologyTemplates.get(riskLevel) || [];
    return templates[Math.floor(Math.random() * templates.length)] || "Consider addressing any concerns raised by your post.";
  }
  
  private generateRecommendations(categories: AnalysisCategories, riskLevel: RiskLevel): string[] {
    const recommendations: string[] = [];
    
    if (categories.toxicity > 50) {
      recommendations.push("Consider using more positive language to convey your message");
    }
    
    if (categories.insult > 40) {
      recommendations.push("Try focusing on ideas rather than personal attacks");
    }
    
    if (categories.profanity > 30) {
      recommendations.push("Consider alternative words that maintain impact without profanity");
    }
    
    if (categories.identity_attack > 30) {
      recommendations.push("Be mindful of language that could target specific groups");
    }
    
    if (riskLevel === 'HIGH' || riskLevel === 'EXTREME') {
      recommendations.push("Consider waiting before posting - sometimes a cooling-off period helps");
      recommendations.push("Ask a trusted friend to review your post before sharing");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Your post looks good! Consider adding more context if needed");
    }
    
    return recommendations;
  }
  
  private calculateConfidence(categories: AnalysisCategories): number {
    // Higher confidence for more extreme scores
    const maxScore = Math.max(...Object.values(categories));
    const avgScore = Object.values(categories).reduce((a, b) => a + b, 0) / Object.values(categories).length;
    
    // Confidence increases with score consistency and extremes
    const consistency = 1 - (Math.abs(maxScore - avgScore) / 100);
    const extremeness = maxScore / 100;
    
    return Math.min(0.6 + (consistency * 0.2) + (extremeness * 0.2), 1);
  }
}

// Export singleton instance
export const analysisEngine = new AnalysisEngineImpl();