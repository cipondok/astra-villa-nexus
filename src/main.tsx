
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
  // Block react-remove-scroll from modifying body/html styles.
  // It uses BOTH el.style.prop = value AND el.style.setProperty(prop, value),
  // so we must intercept both paths.

  const blockedProps = new Set([
    'padding-right', 'paddingRight',
    'overflow', 'overflow-y', 'overflowY',
    'position',
    'top',
    'width',
    'margin-right', 'marginRight',
  ]);

  const patchStyleObject = (el: HTMLElement) => {
    const style = el.style;

    // 1. Override setProperty to block react-remove-scroll's setProperty calls
    const origSetProperty = style.setProperty.bind(style);
    style.setProperty = function(prop: string, value: string, priority?: string) {
      if (blockedProps.has(prop)) return; // no-op
      origSetProperty(prop, value, priority || '');
    };

    // 2. Override removeProperty for the same blocked props
    const origRemoveProperty = style.removeProperty.bind(style);
    style.removeProperty = function(prop: string) {
      if (blockedProps.has(prop)) return '';
      return origRemoveProperty(prop);
    };

    // 3. Override JS property setters (react-remove-scroll also uses these)
    const propsToFreeze = ['paddingRight', 'overflow', 'overflowY', 'position', 'top', 'width', 'marginRight'];
    for (const prop of propsToFreeze) {
      const currentVal = (style as any)[prop] || '';
      Object.defineProperty(style, prop, {
        get() { return currentVal; },
        set() { /* no-op */ },
        configurable: true,
      });
    }
  };

  patchStyleObject(document.body);
  patchStyleObject(document.documentElement);

  // Strip data-scroll-locked attribute reactively
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
