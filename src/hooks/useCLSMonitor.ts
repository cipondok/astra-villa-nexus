import { useEffect } from 'react';

export const useCLSMonitor = (enabled = true) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only count layout shifts without recent user input
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          clsEntries.push(entry);
          
          // Log significant shifts in development
          if (process.env.NODE_ENV === 'development' && (entry as any).value > 0.1) {
            console.warn('🚨 Layout Shift Detected:', {
              value: (entry as any).value,
              totalCLS: clsValue,
              sources: (entry as any).sources?.map((source: any) => ({
                node: source.node,
                previousRect: source.previousRect,
                currentRect: source.currentRect,
              })),
            });
          }
        }
      }
    });

    try {
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.error('CLS monitoring not supported:', e);
    }

    // Report final CLS on page unload
    const reportCLS = () => {
      if (clsValue > 0 && process.env.NODE_ENV === 'development') {
        console.log('📊 Final CLS Score:', clsValue.toFixed(3));
        if (clsValue > 0.1) {
          console.warn('⚠️ CLS exceeds recommended threshold of 0.1');
        } else {
          console.log('✅ CLS is within acceptable range');
        }
      }
    };

    window.addEventListener('pagehide', reportCLS);

    return () => {
      observer.disconnect();
      window.removeEventListener('pagehide', reportCLS);
    };
  }, [enabled]);
};
