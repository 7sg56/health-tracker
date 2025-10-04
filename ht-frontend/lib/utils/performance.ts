/**
 * Performance Monitoring Utilities
 * Provides tools for monitoring and optimizing application performance
 */

// Performance metrics interface
interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

// Performance observer for monitoring
class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Monitor navigation timing
    if (PerformanceObserver.supportedEntryTypes?.includes('navigation')) {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    }

    // Monitor resource loading
    if (PerformanceObserver.supportedEntryTypes?.includes('resource')) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordResourceMetrics(entry as PerformanceResourceTiming);
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }

    // Monitor paint timing
    if (PerformanceObserver.supportedEntryTypes?.includes('paint')) {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordPaintMetrics(entry);
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    }

    // Monitor largest contentful paint
    if (PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordLCPMetrics(lastEntry);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }

    // Monitor first input delay
    if (PerformanceObserver.supportedEntryTypes?.includes('first-input')) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordFIDMetrics(entry);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    }

    // Monitor layout shifts
    if (PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordCLSMetrics(entry);
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      domParse: entry.domContentLoadedEventStart - entry.responseEnd,
      domReady: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      total: entry.loadEventEnd - entry.navigationStart,
    };

    this.recordMetric('navigation', performance.now(), performance.now(), metrics);
  }

  private recordResourceMetrics(entry: PerformanceResourceTiming) {
    if (entry.name.includes('/_next/') || entry.name.includes('/api/')) {
      const resourceType = this.getResourceType(entry.name);
      const size = entry.transferSize || entry.encodedBodySize || 0;
      
      this.recordMetric(`resource-${resourceType}`, entry.startTime, entry.responseEnd, {
        url: entry.name,
        size,
        cached: entry.transferSize === 0 && entry.encodedBodySize > 0,
      });
    }
  }

  private recordPaintMetrics(entry: PerformanceEntry) {
    this.recordMetric(`paint-${entry.name}`, 0, entry.startTime, {
      type: entry.name,
    });
  }

  private recordLCPMetrics(entry: PerformanceEntry) {
    this.recordMetric('lcp', 0, entry.startTime, {
      element: (entry as any).element?.tagName,
      size: (entry as any).size,
    });
  }

  private recordFIDMetrics(entry: PerformanceEntry) {
    this.recordMetric('fid', entry.startTime, entry.startTime + (entry as any).processingStart, {
      delay: (entry as any).processingStart,
    });
  }

  private recordCLSMetrics(entry: PerformanceEntry) {
    if (!(entry as any).hadRecentInput) {
      this.recordMetric('cls', entry.startTime, entry.startTime, {
        value: (entry as any).value,
        sources: (entry as any).sources?.map((source: any) => ({
          element: source.node?.tagName,
          previousRect: source.previousRect,
          currentRect: source.currentRect,
        })),
      });
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  // Public methods
  startTiming(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  endTiming(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) return null;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    this.reportMetric(metric);
    return duration;
  }

  recordMetric(name: string, startTime: number, endTime: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetrics = {
      name,
      startTime,
      endTime,
      duration: endTime - startTime,
      metadata,
    };

    this.metrics.set(name, metric);
    this.reportMetric(metric);
  }

  private reportMetric(metric: PerformanceMetrics): void {
    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true') {
      this.sendToAnalytics(metric);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}: ${metric.duration?.toFixed(2)}ms`, metric.metadata);
    }
  }

  private sendToAnalytics(metric: PerformanceMetrics): void {
    // Implementation for sending to analytics service
    // This could be Google Analytics, DataDog, New Relic, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.duration,
        custom_parameter: JSON.stringify(metric.metadata),
      });
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  getMetric(name: string): PerformanceMetrics | undefined {
    return this.metrics.get(name);
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

// Utility functions
export function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const monitor = getPerformanceMonitor();
  monitor.startTiming(name);
  
  return fn().finally(() => {
    monitor.endTiming(name);
  });
}

export function measureSync<T>(name: string, fn: () => T): T {
  const monitor = getPerformanceMonitor();
  monitor.startTiming(name);
  
  try {
    return fn();
  } finally {
    monitor.endTiming(name);
  }
}

// React hook for component performance
export function usePerformanceTracking(componentName: string) {
  const monitor = getPerformanceMonitor();
  
  React.useEffect(() => {
    monitor.startTiming(`component-${componentName}-mount`);
    
    return () => {
      monitor.endTiming(`component-${componentName}-mount`);
    };
  }, [componentName, monitor]);

  const trackAction = React.useCallback((actionName: string, fn: () => void) => {
    monitor.startTiming(`${componentName}-${actionName}`);
    fn();
    monitor.endTiming(`${componentName}-${actionName}`);
  }, [componentName, monitor]);

  return { trackAction };
}

// Web Vitals reporting
export function reportWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Report Core Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    const monitor = getPerformanceMonitor();

    getCLS((metric) => {
      monitor.recordMetric('web-vital-cls', 0, metric.value, {
        rating: metric.rating,
        entries: metric.entries,
      });
    });

    getFID((metric) => {
      monitor.recordMetric('web-vital-fid', 0, metric.value, {
        rating: metric.rating,
        entries: metric.entries,
      });
    });

    getFCP((metric) => {
      monitor.recordMetric('web-vital-fcp', 0, metric.value, {
        rating: metric.rating,
        entries: metric.entries,
      });
    });

    getLCP((metric) => {
      monitor.recordMetric('web-vital-lcp', 0, metric.value, {
        rating: metric.rating,
        entries: metric.entries,
      });
    });

    getTTFB((metric) => {
      monitor.recordMetric('web-vital-ttfb', 0, metric.value, {
        rating: metric.rating,
        entries: metric.entries,
      });
    });
  }).catch(error => {
    console.warn('Failed to load web-vitals:', error);
  });
}

// Bundle size tracking
export function trackBundleSize(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return;

  // Track initial bundle size
  const scripts = document.querySelectorAll('script[src*="_next/static"]');
  let totalSize = 0;

  scripts.forEach(script => {
    fetch(script.src, { method: 'HEAD' })
      .then(response => {
        const size = parseInt(response.headers.get('content-length') || '0');
        totalSize += size;
      })
      .catch(() => {
        // Ignore errors
      });
  });

  setTimeout(() => {
    getPerformanceMonitor().recordMetric('bundle-size', 0, totalSize, {
      scripts: scripts.length,
    });
  }, 1000);
}

import React from 'react';