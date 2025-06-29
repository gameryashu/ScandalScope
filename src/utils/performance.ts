/**
 * Performance monitoring and optimization utilities
 */

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  apiLatency: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  measurePageLoad(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.metrics.loadTime = navigation.loadEventEnd - navigation.navigationStart;
      this.metrics.renderTime = navigation.domContentLoadedEventEnd - navigation.responseEnd;
      
      // Report to analytics
      this.reportMetrics();
    }
  }
  
  measureComponentRender(componentName: string, renderFn: () => void): void {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    
    console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
  }
  
  measureApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    const start = performance.now();
    
    return apiCall().finally(() => {
      const end = performance.now();
      this.metrics.apiLatency = end - start;
    });
  }
  
  measureMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
  }
  
  private reportMetrics(): void {
    // Report to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metrics', {
        load_time: this.metrics.loadTime,
        render_time: this.metrics.renderTime,
        memory_usage: this.metrics.memoryUsage,
        api_latency: this.metrics.apiLatency,
      });
    }
  }
  
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

export function initializePerformanceMonitoring(): void {
  // Measure initial page load
  if (document.readyState === 'complete') {
    performanceMonitor.measurePageLoad();
  } else {
    window.addEventListener('load', () => {
      performanceMonitor.measurePageLoad();
    });
  }
  
  // Monitor memory usage periodically
  setInterval(() => {
    performanceMonitor.measureMemoryUsage();
  }, 30000);
  
  // Web Vitals monitoring
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      function sendToAnalytics({ name, delta, value, id }: any) {
        if (window.gtag) {
          window.gtag('event', name, {
            event_category: 'Web Vitals',
            event_label: id,
            value: Math.round(name === 'CLS' ? delta * 1000 : delta),
            non_interaction: true,
          });
        }
      }

      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    });
  }
}

// HOC for measuring component performance
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceWrappedComponent(props: P) {
    React.useEffect(() => {
      performanceMonitor.measureComponentRender(componentName, () => {
        // Component render measurement
      });
    });
    
    return React.createElement(Component, props);
  };
}

// Hook for measuring async operations
export function usePerformanceTracking() {
  const trackOperation = React.useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    
    try {
      const result = await operation();
      const end = performance.now();
      
      console.log(`${operationName} completed in ${(end - start).toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${operationName} failed after ${(end - start).toFixed(2)}ms`, error);
      throw error;
    }
  }, []);
  
  return { trackOperation };
}