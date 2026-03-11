
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Performance monitoring
if (typeof window !== 'undefined' && 'performance' in window) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (perfData && process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', {
        'DNS': perfData.domainLookupEnd - perfData.domainLookupStart,
        'TCP': perfData.connectEnd - perfData.connectStart,
        'TTFB': perfData.responseStart - perfData.requestStart,
        'Download': perfData.responseEnd - perfData.responseStart,
        'DOM Processing': perfData.domComplete - perfData.domInteractive,
        'Total Load': perfData.loadEventEnd - perfData.fetchStart
      });
    }
  });
}

// Register Service Worker for PWA - production only (avoid stale chunk caches in dev/preview)
if ('serviceWorker' in navigator) {
  const isProduction = import.meta.env.PROD;

  const clearServiceWorkersAndCaches = async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((r) => r.unregister()));

    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
  };

  const recoverFromStaleCacheOnce = async () => {
    const key = '__sw_recovery_attempted__';
    if (sessionStorage.getItem(key) === '1') return;
    sessionStorage.setItem(key, '1');

    try {
      await clearServiceWorkersAndCaches();
    } finally {
      window.location.reload();
    }
  };

  // In dev/preview, never keep SW active: it can serve mismatched cached chunks
  if (!isProduction) {
    const cleanupKey = '__dev_sw_cleanup_done__';
    if (sessionStorage.getItem(cleanupKey) !== '1') {
      sessionStorage.setItem(cleanupKey, '1');
      clearServiceWorkersAndCaches().finally(() => {
        window.location.reload();
      });
    }
  } else {
    // Auto-recover when a chunk/module fails to load (common with stale SW cache)
    window.addEventListener('error', (event: any) => {
      const message = String(event?.message || '');
      if (message.includes('Importing a module script failed')) {
        recoverFromStaleCacheOnce();
      }
    });

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        await registration.update();

        // If an update is already waiting, activate it immediately
        if (registration.waiting && navigator.serviceWorker.controller) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              // Activate new SW ASAP to prevent mismatched chunks
              registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        // Reload when the new SW takes control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000);

        if (import.meta.env.DEV) {
          console.log('SW registered: ', registration);
        }
      } catch (registrationError) {
        if (import.meta.env.DEV) {
          console.log('SW registration failed: ', registrationError);
        }
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(registerSW);
    } else {
      setTimeout(registerSW, 100);
    }
  }
}

// Prevent react-remove-scroll from causing page jumps by making
// body/html style properties read-only for the props it touches.
const preventScrollLockJump = () => {
  // Freeze specific style properties on body and html so react-remove-scroll
  // cannot set them at all (no flash, no race condition).
  const freezeStyleProp = (el: HTMLElement, prop: string, value: string) => {
    const style = el.style;
    const descriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, prop) 
      || Object.getOwnPropertyDescriptor(style, prop);
    
    // Set the desired value first
    style.setProperty(
      prop.replace(/([A-Z])/g, '-$1').toLowerCase(),
      value,
      'important'
    );
    
    // Override the setter to be a no-op
    Object.defineProperty(style, prop, {
      get() { return descriptor?.get?.call(style) ?? value; },
      set() { /* no-op: block react-remove-scroll */ },
      configurable: true,
    });
  };

  // Block the exact properties react-remove-scroll modifies
  [document.body, document.documentElement].forEach(el => {
    freezeStyleProp(el, 'paddingRight', '0px');
    freezeStyleProp(el, 'overflow', '');
    freezeStyleProp(el, 'position', '');
    freezeStyleProp(el, 'top', '');
    freezeStyleProp(el, 'width', '');
  });

  // Also strip data-scroll-locked attribute reactively
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        const el = mutation.target as HTMLElement;
        if ((el === document.body || el === document.documentElement) 
            && el.hasAttribute('data-scroll-locked')) {
          el.removeAttribute('data-scroll-locked');
        }
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scroll-locked'] });
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-scroll-locked'] });
};

preventScrollLockJump();

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

root.render(<App />);
