/**
 * Accessibility utilities for ScandalScope
 * Provides ARIA labels, keyboard navigation, and screen reader support
 */

export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  role?: string;
  tabIndex?: number;
}

/**
 * Generate ARIA attributes for interactive elements
 */
export function getAriaAttributes(
  type: 'button' | 'input' | 'dialog' | 'menu' | 'alert',
  options: {
    label?: string;
    describedBy?: string;
    expanded?: boolean;
    disabled?: boolean;
    required?: boolean;
  } = {}
): AriaAttributes {
  const { label, describedBy, expanded, disabled, required } = options;

  const baseAttributes: AriaAttributes = {};

  if (label) {
    baseAttributes['aria-label'] = label;
  }

  if (describedBy) {
    baseAttributes['aria-describedby'] = describedBy;
  }

  switch (type) {
    case 'button':
      if (expanded !== undefined) {
        baseAttributes['aria-expanded'] = expanded;
      }
      if (disabled) {
        baseAttributes['aria-disabled'] = true;
        baseAttributes.tabIndex = -1;
      }
      break;

    case 'input':
      if (required) {
        baseAttributes['aria-required'] = true;
      }
      if (disabled) {
        baseAttributes['aria-disabled'] = true;
      }
      break;

    case 'dialog':
      baseAttributes.role = 'dialog';
      baseAttributes['aria-modal'] = true;
      break;

    case 'menu':
      baseAttributes.role = 'menu';
      break;

    case 'alert':
      baseAttributes.role = 'alert';
      baseAttributes['aria-live'] = 'assertive';
      baseAttributes['aria-atomic'] = true;
      break;
  }

  return baseAttributes;
}

/**
 * Keyboard navigation utilities
 */
export class KeyboardNavigation {
  private static focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  static trapFocus(container: HTMLElement, event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }

  static handleArrowNavigation(
    container: HTMLElement,
    event: KeyboardEvent,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ) {
    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

    if (![nextKey, prevKey, 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();

    const focusableElements = this.getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    let nextIndex: number;

    switch (event.key) {
      case nextKey:
        nextIndex = (currentIndex + 1) % focusableElements.length;
        break;
      case prevKey:
        nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = focusableElements.length - 1;
        break;
      default:
        return;
    }

    focusableElements[nextIndex]?.focus();
  }
}

/**
 * Screen reader announcements
 */
export class ScreenReader {
  private static liveRegion: HTMLElement | null = null;

  static init() {
    if (this.liveRegion) return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    this.liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;

    document.body.appendChild(this.liveRegion);
  }

  static announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.liveRegion) this.init();

    this.liveRegion!.setAttribute('aria-live', priority);
    this.liveRegion!.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
}

/**
 * Color contrast utilities
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd use a proper color library
  const getLuminance = (color: string): number => {
    // This is a simplified version - use a proper color library in production
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function meetsWCAGStandard(
  color1: string,
  color2: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(color1, color2);
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  
  return size === 'large' ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  static saveFocus() {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      this.focusStack.push(activeElement);
    }
  }

  static restoreFocus() {
    const element = this.focusStack.pop();
    if (element && element.focus) {
      element.focus();
    }
  }

  static setFocusToFirstElement(container: HTMLElement) {
    const focusableElements = KeyboardNavigation.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
}

// Initialize screen reader on module load
if (typeof window !== 'undefined') {
  ScreenReader.init();
}