# ScandalScope Testing Guide

## Overview

This document outlines the comprehensive testing strategy for ScandalScope, including unit tests, integration tests, and end-to-end testing approaches.

## Testing Stack

- **Unit Testing**: Vitest + React Testing Library
- **Integration Testing**: Vitest + MSW (Mock Service Worker)
- **E2E Testing**: Playwright
- **Performance Testing**: Lighthouse CI
- **Accessibility Testing**: axe-core

## Test Structure

```
src/
├── __tests__/
│   ├── components/
│   ├── services/
│   ├── utils/
│   └── setup.ts
├── components/
│   └── __tests__/
└── services/
    └── __tests__/
```

## Unit Testing

### Component Testing

```typescript
// src/components/__tests__/AnalysisInput.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalysisInput } from '@/components/AnalysisInput';

// Mock dependencies
vi.mock('@/hooks/useAnalysis', () => ({
  useAnalysis: () => ({
    analyze: vi.fn().mockResolvedValue({}),
  }),
}));

describe('AnalysisInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input form correctly', () => {
    render(<AnalysisInput />);
    
    expect(screen.getByText('Cancel Risk Analyzer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type your controversial take/)).toBeInTheDocument();
    expect(screen.getByText('Analyze Cancel Risk')).toBeInTheDocument();
  });

  it('validates input length', async () => {
    const user = userEvent.setup();
    render(<AnalysisInput />);
    
    const textarea = screen.getByPlaceholderText(/Type your controversial take/);
    const analyzeButton = screen.getByText('Analyze Cancel Risk');
    
    await user.type(textarea, 'Hi');
    
    expect(analyzeButton).toBeDisabled();
    expect(screen.getByText('Enter at least 10 characters for analysis')).toBeInTheDocument();
  });

  it('enables analyze button for valid text', async () => {
    const user = userEvent.setup();
    render(<AnalysisInput />);
    
    const textarea = screen.getByPlaceholderText(/Type your controversial take/);
    const analyzeButton = screen.getByText('Analyze Cancel Risk');
    
    await user.type(textarea, 'This is a longer test message');
    
    expect(analyzeButton).not.toBeDisabled();
  });
});
```

### Service Testing

```typescript
// src/services/__tests__/AnalysisService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalysisService } from '@/services/analysis/AnalysisService';

describe('AnalysisService', () => {
  let analysisService: AnalysisService;

  beforeEach(() => {
    analysisService = new AnalysisService();
  });

  describe('analyzeText', () => {
    it('should analyze text and return valid result', async () => {
      const text = 'This is a test message for analysis';
      
      const result = await analysisService.analyzeText(text);
      
      expect(result).toBeDefined();
      expect(result.cancelScore).toBeGreaterThanOrEqual(0);
      expect(result.cancelScore).toBeLessThanOrEqual(100);
      expect(result.riskLevel).toMatch(/^(SAFE|MILD|MODERATE|HIGH|EXTREME)$/);
    });

    it('should validate input text', async () => {
      await expect(analysisService.analyzeText('')).rejects.toThrow('Invalid input');
      await expect(analysisService.analyzeText('hi')).rejects.toThrow('at least 3 characters');
    });
  });
});
```

### Utility Testing

```typescript
// src/utils/__tests__/analysis.test.ts
import { describe, it, expect } from 'vitest';
import { getRiskColor, getRiskBgColor, getRiskGradient } from '@/utils/analysis';

describe('Analysis Utils', () => {
  describe('getRiskColor', () => {
    it('should return correct colors for each risk level', () => {
      expect(getRiskColor('SAFE')).toBe('text-emerald-400');
      expect(getRiskColor('EXTREME')).toBe('text-red-600');
    });
  });

  describe('getRiskBgColor', () => {
    it('should return correct background colors', () => {
      expect(getRiskBgColor('SAFE')).toBe('bg-emerald-500/20');
      expect(getRiskBgColor('EXTREME')).toBe('bg-red-600/20');
    });
  });
});
```

## Integration Testing

### API Integration

```typescript
// src/__tests__/integration/AnalysisFlow.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { analyzeText } from '@/utils/analysis';

const server = setupServer(
  rest.post('https://api.openai.com/v1/chat/completions', (req, res, ctx) => {
    return res(
      ctx.json({
        choices: [
          {
            message: {
              content: 'This is a test roast response'
            }
          }
        ]
      })
    );
  }),
  
  rest.post('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze', (req, res, ctx) => {
    return res(
      ctx.json({
        attributeScores: {
          TOXICITY: { summaryScore: { value: 0.3 } },
          INSULT: { summaryScore: { value: 0.2 } },
          PROFANITY: { summaryScore: { value: 0.1 } }
        }
      })
    );
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('Analysis Integration', () => {
  it('should complete full analysis flow', async () => {
    const result = await analyzeText('This is a test message');
    
    expect(result).toBeDefined();
    expect(result.cancelScore).toBeGreaterThanOrEqual(0);
    expect(result.roast).toBeTruthy();
    expect(result.categories).toBeDefined();
  });
});
```

## End-to-End Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

```typescript
// e2e/analysis.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Analysis Flow', () => {
  test('should analyze text and display results', async ({ page }) => {
    await page.goto('/');
    
    // Fill in text
    await page.fill('[placeholder*="controversial take"]', 'This is a test message for analysis');
    
    // Click analyze button
    await page.click('text=Analyze Cancel Risk');
    
    // Wait for results
    await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible();
    
    // Check score is displayed
    await expect(page.locator('[data-testid="cancel-score"]')).toBeVisible();
    
    // Check roast is displayed
    await expect(page.locator('[data-testid="roast-content"]')).toBeVisible();
  });

  test('should validate input requirements', async ({ page }) => {
    await page.goto('/');
    
    // Try with short text
    await page.fill('[placeholder*="controversial take"]', 'Hi');
    
    // Button should be disabled
    await expect(page.locator('text=Analyze Cancel Risk')).toBeDisabled();
    
    // Error message should be visible
    await expect(page.locator('text=Enter at least 10 characters')).toBeVisible();
  });
});

test.describe('Mobile Experience', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.goto('/');
    
    // Check mobile layout
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible();
    
    // Test touch interactions
    await page.tap('[placeholder*="controversial take"]');
    await page.fill('[placeholder*="controversial take"]', 'Mobile test message');
    
    await page.tap('text=Analyze Cancel Risk');
    
    // Results should be mobile-friendly
    await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible();
  });
});
```

## Performance Testing

### Lighthouse CI

```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173'],
      startServerCommand: 'npm run preview',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Performance Tests

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for main content
    await page.waitForSelector('[data-testid="analysis-input"]');
    
    const loadTime = Date.now() - startTime;
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large text input efficiently', async ({ page }) => {
    await page.goto('/');
    
    const largeText = 'A'.repeat(2000);
    
    const startTime = Date.now();
    await page.fill('[placeholder*="controversial take"]', largeText);
    const inputTime = Date.now() - startTime;
    
    // Input should be responsive
    expect(inputTime).toBeLessThan(1000);
  });
});
```

## Accessibility Testing

### Automated A11y Tests

```typescript
// src/__tests__/accessibility.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AnalysisInput } from '@/components/AnalysisInput';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<AnalysisInput />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual A11y Testing

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator('[placeholder*="controversial take"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('text=Analyze Cancel Risk')).toBeFocused();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA labels
    await expect(page.locator('[aria-label]')).toHaveCount(3); // Adjust based on actual count
    
    // Check for proper headings
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should work with screen readers', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper semantic markup
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for descriptive text
    await expect(page.locator('[aria-describedby]')).toHaveCount(1); // Adjust based on actual count
  });
});
```

## Test Data Management

### Test Fixtures

```typescript
// src/__tests__/fixtures/analysisResults.ts
export const mockAnalysisResult = {
  id: 'test-analysis-1',
  text: 'Test content',
  cancelScore: 42,
  riskLevel: 'MODERATE' as const,
  roast: 'Test roast content',
  apology: 'Test apology content',
  timestamp: Date.now(),
  categories: {
    toxicity: 30,
    identity_attack: 20,
    insult: 25,
    profanity: 15,
    threat: 10,
    sexually_explicit: 5,
    flirtation: 8,
    spam: 12,
  },
  recommendations: ['Test recommendation'],
  confidence: 0.85,
  processingTime: 1200,
  version: '2.0.0',
};
```

### Test Utilities

```typescript
// src/__tests__/utils/testUtils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

## CI/CD Integration

### GitHub Actions Test Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Run Lighthouse CI
        run: npm run lighthouse:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lighthouse:ci": "lhci autorun"
  }
}
```

## Coverage Requirements

- **Overall Coverage**: 80%+
- **Critical Paths**: 100%
- **Components**: 85%+
- **Services**: 90%+
- **Utilities**: 95%+

## Best Practices

1. **Test Naming**: Use descriptive test names that explain the expected behavior
2. **Test Structure**: Follow Arrange-Act-Assert pattern
3. **Mocking**: Mock external dependencies and focus on unit behavior
4. **Data**: Use realistic test data that represents actual usage
5. **Accessibility**: Include accessibility testing in all component tests
6. **Performance**: Test performance-critical paths
7. **Error Handling**: Test error scenarios and edge cases

This comprehensive testing strategy ensures ScandalScope maintains high quality and reliability across all features and user interactions.