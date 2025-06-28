import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoastGenerator } from '@/hooks/useRoastGenerator';
import type { RoastConfig } from '@/types/roast';

// Mock dependencies
vi.mock('@/store/useStore', () => ({
  useStore: () => ({
    showToast: vi.fn(),
    addError: vi.fn(),
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock UUID
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-123',
}));

describe('useRoastGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch for OpenAI API
    global.fetch = vi.fn();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useRoastGenerator());
    
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.currentRoast).toBe(null);
    expect(result.current.generationHistory).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('validates input text', async () => {
    const { result } = renderHook(() => useRoastGenerator());
    
    const config: RoastConfig = {
      mode: 'genz',
      intensity: 5,
      includeEmojis: true,
      maxLength: 200
    };
    
    // Test empty text
    await act(async () => {
      const roastResult = await result.current.generateRoast('', config);
      expect(roastResult).toBe(null);
    });
    
    // Test short text
    await act(async () => {
      const roastResult = await result.current.generateRoast('hi', config);
      expect(roastResult).toBe(null);
    });
  });

  it('generates roast successfully', async () => {
    // Mock successful API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'This is a test roast response'
            }
          }
        ]
      })
    });
    
    const { result } = renderHook(() => useRoastGenerator());
    
    const config: RoastConfig = {
      mode: 'genz',
      intensity: 5,
      includeEmojis: true,
      maxLength: 200
    };
    
    await act(async () => {
      const roastResult = await result.current.generateRoast('Test text for roasting', config);
      
      expect(roastResult).toBeDefined();
      expect(roastResult?.content).toBe('This is a test roast response');
      expect(roastResult?.mode).toBe('genz');
    });
    
    expect(result.current.currentRoast).toBeDefined();
    expect(result.current.generationHistory).toHaveLength(1);
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));
    
    const { result } = renderHook(() => useRoastGenerator());
    
    const config: RoastConfig = {
      mode: 'genz',
      intensity: 5,
      includeEmojis: true,
      maxLength: 200
    };
    
    await act(async () => {
      const roastResult = await result.current.generateRoast('Test text', config);
      expect(roastResult).toBe(null);
    });
    
    expect(result.current.error).toBeDefined();
  });

  it('implements rate limiting', async () => {
    const { result } = renderHook(() => useRoastGenerator());
    
    const config: RoastConfig = {
      mode: 'genz',
      intensity: 5,
      includeEmojis: true,
      maxLength: 200
    };
    
    // Generate multiple roasts quickly
    const promises = Array.from({ length: 12 }, () =>
      result.current.generateRoast('Test text', config)
    );
    
    await act(async () => {
      await Promise.all(promises);
    });
    
    // Should have rate limited some requests
    expect(result.current.generationHistory.length).toBeLessThan(12);
  });

  it('provides generation statistics', () => {
    const { result } = renderHook(() => useRoastGenerator());
    
    const stats = result.current.getStats();
    
    expect(stats).toHaveProperty('totalGenerated');
    expect(stats).toHaveProperty('modeBreakdown');
    expect(stats).toHaveProperty('averageConfidence');
    expect(stats).toHaveProperty('cacheSize');
  });

  it('clears roasts and history', () => {
    const { result } = renderHook(() => useRoastGenerator());
    
    act(() => {
      result.current.clearRoasts();
    });
    
    expect(result.current.currentRoast).toBe(null);
    expect(result.current.generationHistory).toEqual([]);
    expect(result.current.error).toBe(null);
  });
});