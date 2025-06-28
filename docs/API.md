# ScandalScope API Documentation

## Overview

ScandalScope integrates with multiple AI services to provide comprehensive content analysis. This document outlines the API structure, endpoints, and integration patterns.

## Core APIs

### Analysis Service

#### `analyzeText(text: string, config?: AnalysisConfig): Promise<AnalysisResult>`

Analyzes text content for potential controversy and generates insights.

**Parameters:**
- `text`: The content to analyze (3-5000 characters)
- `config`: Optional configuration object

**Configuration Options:**
```typescript
interface AnalysisConfig {
  includeRoast: boolean;           // Generate roast content
  includeApology: boolean;         // Generate apology template
  roastPersonality: 'sarcastic' | 'witty' | 'brutal' | 'friendly';
  language: string;                // Content language (default: 'en')
}
```

**Response:**
```typescript
interface AnalysisResult {
  id: string;                      // Unique analysis identifier
  text: string;                    // Original text
  cancelScore: number;             // Risk score (0-100)
  riskLevel: RiskLevel;           // SAFE | MILD | MODERATE | HIGH | EXTREME
  roast: string;                  // Generated roast content
  apology: string;                // Generated apology template
  timestamp: number;              // Analysis timestamp
  categories: AnalysisCategories; // Detailed category scores
  recommendations: string[];      // Improvement suggestions
  confidence: number;             // Analysis confidence (0-1)
  processingTime: number;         // Processing time in ms
  version: string;                // API version
}
```

**Category Breakdown:**
```typescript
interface AnalysisCategories {
  toxicity: number;               // General toxicity (0-100)
  identity_attack: number;        // Identity-based attacks
  insult: number;                 // Personal insults
  profanity: number;             // Profane language
  threat: number;                // Threatening language
  sexually_explicit: number;     // Sexual content
  flirtation: number;            // Flirtatious content
  spam: number;                  // Spam-like content
}
```

## External API Integrations

### Google Perspective API

**Endpoint:** `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze`

**Purpose:** Toxicity and content analysis

**Request Format:**
```json
{
  "comment": { "text": "Content to analyze" },
  "requestedAttributes": {
    "TOXICITY": {},
    "IDENTITY_ATTACK": {},
    "INSULT": {},
    "PROFANITY": {},
    "THREAT": {},
    "SEXUALLY_EXPLICIT": {},
    "FLIRTATION": {}
  },
  "languages": ["en"],
  "doNotStore": true
}
```

**Response Processing:**
- Scores normalized to 0-100 scale
- Multiple attribute analysis
- Confidence scoring

### OpenAI GPT-4 API

**Endpoint:** `https://api.openai.com/v1/chat/completions`

**Purpose:** Content generation (roasts and apologies)

**Request Format:**
```json
{
  "model": "gpt-4-turbo-preview",
  "messages": [
    {
      "role": "system",
      "content": "System prompt for content generation"
    },
    {
      "role": "user",
      "content": "User prompt with context"
    }
  ],
  "max_tokens": 150,
  "temperature": 0.8
}
```

**Prompt Engineering:**

**Roast Generation:**
```
Generate a [personality] roast for: "[text]"
Risk level: [riskLevel]

Guidelines:
- Keep under 200 characters
- Match the [personality] tone
- Be creative and original
- Avoid harmful content
- Make it shareable
```

**Apology Generation:**
```
Generate a sincere apology for: "[text]"
Risk level: [riskLevel]

Guidelines:
- Be genuine and specific
- Acknowledge potential harm
- Show understanding of impact
- Offer commitment to improvement
- Keep under 300 characters
```

## Error Handling

### Error Types
```typescript
type APIError = 
  | { type: 'NETWORK_ERROR'; message: string }
  | { type: 'VALIDATION_ERROR'; field: string; message: string }
  | { type: 'API_ERROR'; code: number; message: string }
  | { type: 'RATE_LIMIT_ERROR'; retryAfter: number }
  | { type: 'UNKNOWN_ERROR'; message: string };
```

### Fallback Mechanisms

1. **API Unavailable**: Switch to mock providers
2. **Rate Limiting**: Exponential backoff retry
3. **Invalid Response**: Use cached or default content
4. **Network Issues**: Offline mode with limited functionality

### Retry Logic
```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Rate Limiting

### Perspective API
- **Limit**: 1000 requests per day (free tier)
- **Rate**: 1 request per second
- **Strategy**: Queue requests with delays

### OpenAI API
- **Limit**: Varies by plan
- **Rate**: 3 requests per minute (free tier)
- **Strategy**: Batch processing and caching

### Implementation
```typescript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  
  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.process();
    });
  }
  
  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const operation = this.queue.shift()!;
      await operation();
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
    
    this.processing = false;
  }
}
```

## Security

### API Key Management
- Environment variables for sensitive data
- No keys exposed in client bundle
- Rotation strategy for production

### Input Validation
```typescript
function validateInput(text: string): void {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: text must be a non-empty string');
  }
  
  if (text.length < 3) {
    throw new Error('Text must be at least 3 characters long');
  }
  
  if (text.length > 5000) {
    throw new Error('Text must be less than 5000 characters');
  }
}
```

### Content Filtering
- Automatic content moderation
- Harmful content detection
- Safe content generation

## Performance Optimization

### Caching Strategy
```typescript
class AnalysisCache {
  private cache = new Map<string, AnalysisResult>();
  private maxSize = 100;
  
  get(text: string): AnalysisResult | null {
    const key = this.generateKey(text);
    return this.cache.get(key) || null;
  }
  
  set(text: string, result: AnalysisResult): void {
    const key = this.generateKey(text);
    
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, result);
  }
  
  private generateKey(text: string): string {
    return btoa(text).slice(0, 32);
  }
}
```

### Parallel Processing
```typescript
const [categories, roast, apology] = await Promise.all([
  analyzeToxicity(text),
  generateRoast(text, riskLevel),
  generateApology(text, riskLevel)
]);
```

### Request Optimization
- Minimize payload size
- Compress requests
- Use HTTP/2 multiplexing

## Monitoring

### Metrics Collection
```typescript
interface APIMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
}
```

### Health Checks
```typescript
async function healthCheck(): Promise<boolean> {
  try {
    const testResult = await analyzeText("test", { includeRoast: false });
    return testResult.confidence > 0;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
```

## Development Tools

### Mock Providers
For development without API keys:

```typescript
class MockProvider {
  async analyzeToxicity(text: string): Promise<AnalysisCategories> {
    // Simulate realistic analysis
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.generateMockCategories(text);
  }
}
```

### Testing Utilities
```typescript
export function createMockAnalysisResult(overrides?: Partial<AnalysisResult>): AnalysisResult {
  return {
    id: 'test-analysis-1',
    text: 'Test content',
    cancelScore: 42,
    riskLevel: 'MODERATE',
    roast: 'Test roast',
    apology: 'Test apology',
    timestamp: Date.now(),
    categories: createMockCategories(),
    recommendations: ['Test recommendation'],
    confidence: 0.85,
    processingTime: 1200,
    version: '2.0.0',
    ...overrides
  };
}
```

This API documentation provides comprehensive guidance for integrating with and extending ScandalScope's analysis capabilities.