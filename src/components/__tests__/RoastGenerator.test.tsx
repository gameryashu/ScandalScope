import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoastGenerator } from '@/components/RoastGenerator';

// Mock the hooks
vi.mock('@/hooks/useRoastGenerator', () => ({
  useRoastGenerator: () => ({
    currentRoast: null,
    generationHistory: [],
    isGenerating: false,
    generateRoast: vi.fn().mockResolvedValue({
      id: 'test-roast-1',
      content: 'Test roast content',
      mode: 'genz',
      timestamp: Date.now(),
      originalText: 'Test text',
      confidence: 0.9,
      tags: ['genz', 'test']
    }),
    regenerateRoast: vi.fn(),
    getStats: () => ({
      totalGenerated: 0,
      modeBreakdown: {},
      averageConfidence: 0,
      cacheSize: 0
    })
  }),
}));

describe('RoastGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders roast generator interface', () => {
    render(<RoastGenerator text="Test text for roasting" />);
    
    expect(screen.getByText('AI Roast Generator')).toBeInTheDocument();
    expect(screen.getByText('Choose your roast style and let AI deliver the perfect burn')).toBeInTheDocument();
    expect(screen.getByText('Roast Mode')).toBeInTheDocument();
    expect(screen.getByText('Intensity Level:')).toBeInTheDocument();
  });

  it('allows mode selection', async () => {
    const user = userEvent.setup();
    render(<RoastGenerator text="Test text for roasting" />);
    
    // Click on mode selector to open dropdown
    const modeSelector = screen.getByRole('button', { name: /Gen Z Mode/ });
    await user.click(modeSelector);
    
    // Should show other modes
    expect(screen.getByText('HR Mode')).toBeInTheDocument();
    expect(screen.getByText('Therapist Mode')).toBeInTheDocument();
  });

  it('allows intensity adjustment', async () => {
    const user = userEvent.setup();
    render(<RoastGenerator text="Test text for roasting" />);
    
    const intensitySlider = screen.getByRole('slider');
    expect(intensitySlider).toHaveValue('5');
    
    await user.clear(intensitySlider);
    await user.type(intensitySlider, '8');
    
    expect(screen.getByText('Intensity Level: 8/10')).toBeInTheDocument();
  });

  it('disables generate button for invalid text', () => {
    render(<RoastGenerator text="" />);
    
    const generateButton = screen.getByRole('button', { name: /Generate Gen Z Mode Roast/ });
    expect(generateButton).toBeDisabled();
  });

  it('enables generate button for valid text', () => {
    render(<RoastGenerator text="This is a valid text for roasting" />);
    
    const generateButton = screen.getByRole('button', { name: /Generate Gen Z Mode Roast/ });
    expect(generateButton).not.toBeDisabled();
  });

  it('shows settings panel when settings button is clicked', async () => {
    const user = userEvent.setup();
    render(<RoastGenerator text="Test text" />);
    
    const settingsButton = screen.getByRole('button', { name: /Settings/ });
    await user.click(settingsButton);
    
    expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
    expect(screen.getByText('Response Length')).toBeInTheDocument();
  });

  it('shows history panel when history button is clicked', async () => {
    const user = userEvent.setup();
    render(<RoastGenerator text="Test text" />);
    
    const historyButton = screen.getByRole('button', { name: /History/ });
    await user.click(historyButton);
    
    // Should show history panel (even if empty)
    expect(screen.getByText('Recent Roasts')).toBeInTheDocument();
  });

  it('handles roast generation', async () => {
    const user = userEvent.setup();
    render(<RoastGenerator text="Test text for roasting" />);
    
    const generateButton = screen.getByRole('button', { name: /Generate Gen Z Mode Roast/ });
    await user.click(generateButton);
    
    // Should show loading state or result
    // Note: This would need to be adjusted based on actual implementation
  });
});