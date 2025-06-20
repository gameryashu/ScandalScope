import { AnalysisResult } from '../store/useStore';

// Mock AI analysis - in production, this would call actual APIs
export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  // Mock analysis logic
  const words = text.toLowerCase().split(' ');
  const riskWords = ['hate', 'stupid', 'idiot', 'kill', 'die', 'worst', 'terrible', 'awful', 'disgusting'];
  const controversialWords = ['politics', 'religion', 'gender', 'race', 'sexuality', 'abortion', 'vaccine'];
  
  let baseScore = Math.random() * 30 + 10; // Base 10-40
  
  // Increase score for risk words
  riskWords.forEach(word => {
    if (words.includes(word)) baseScore += 15;
  });
  
  // Increase score for controversial topics
  controversialWords.forEach(word => {
    if (words.includes(word)) baseScore += 10;
  });
  
  // Add randomness
  baseScore += Math.random() * 20;
  
  // Cap at 100
  const cancelScore = Math.min(Math.round(baseScore), 100);
  
  const getRiskLevel = (score: number): AnalysisResult['riskLevel'] => {
    if (score < 20) return 'SAFE';
    if (score < 40) return 'MILD';
    if (score < 60) return 'MODERATE';
    if (score < 80) return 'HIGH';
    return 'EXTREME';
  };
  
  const generateRoast = (score: number, riskLevel: string): string => {
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
    
    const levelRoasts = roasts[riskLevel as keyof typeof roasts];
    return levelRoasts[Math.floor(Math.random() * levelRoasts.length)];
  };
  
  const generateApology = (score: number): string => {
    const apologies = [
      "I sincerely apologize for my previous statement. I recognize that my words were harmful and I take full responsibility.",
      "I want to acknowledge the hurt my words have caused. I am committed to learning and growing from this experience.",
      "My previous comments do not reflect my true values. I apologize unreservedly and will do better.",
      "I deeply regret my words and the impact they've had. I'm taking time to reflect and educate myself.",
      "I apologize for my insensitive remarks. I understand the harm they've caused and I'm committed to change.",
    ];
    
    return apologies[Math.floor(Math.random() * apologies.length)];
  };
  
  const generateRecommendations = (score: number, riskLevel: string): string[] => {
    const baseRecs = [
      "Think before you post",
      "Consider your audience",
      "Avoid controversial topics",
      "Use inclusive language",
    ];
    
    if (score > 60) {
      baseRecs.push(
        "Delete this immediately",
        "Hire a PR team",
        "Consider a social media break",
        "Practice mindfulness"
      );
    }
    
    return baseRecs.slice(0, 3 + Math.floor(Math.random() * 2));
  };
  
  const riskLevel = getRiskLevel(cancelScore);
  
  return {
    id: Date.now().toString(),
    text,
    cancelScore,
    riskLevel,
    roast: generateRoast(cancelScore, riskLevel),
    apology: generateApology(cancelScore),
    timestamp: Date.now(),
    categories: {
      toxicity: Math.random() * 100,
      identity_attack: Math.random() * 100,
      insult: Math.random() * 100,
      profanity: Math.random() * 100,
      threat: Math.random() * 100,
      sexually_explicit: Math.random() * 100,
    },
    recommendations: generateRecommendations(cancelScore, riskLevel),
  };
};

export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'SAFE': return 'text-success-400';
    case 'MILD': return 'text-accent-400';
    case 'MODERATE': return 'text-warning-400';
    case 'HIGH': return 'text-primary-400';
    case 'EXTREME': return 'text-danger-400';
    default: return 'text-secondary-400';
  }
};

export const getRiskBgColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'SAFE': return 'bg-success-500/20';
    case 'MILD': return 'bg-accent-500/20';
    case 'MODERATE': return 'bg-warning-500/20';
    case 'HIGH': return 'bg-primary-500/20';
    case 'EXTREME': return 'bg-danger-500/20';
    default: return 'bg-secondary-500/20';
  }
};