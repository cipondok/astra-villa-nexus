
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

// Disable service worker caching for now to prevent stale homepage bundles
if ('serviceWorker' in navigator) {
  const cleanupKey = '__astra_sw_disabled_cleanup_v1__';

  const clearServiceWorkersAndCaches = async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    }
  };

  const cleanupOnce = async () => {
    if (localStorage.getItem(cleanupKey) === '1') return;

    try {
      await clearServiceWorkersAndCaches();
      localStorage.setItem(cleanupKey, '1');

      if (sessionStorage.getItem(cleanupKey) !== '1') {
        sessionStorage.setItem(cleanupKey, '1');
        window.location.reload();
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('SW cleanup failed: ', error);
      }
    }
  };

  cleanupOnce();

  window.addEventListener('error', (event: ErrorEvent) => {
    const message = String(event?.message || '');
    if (message.includes('Importing a module script failed')) {
      localStorage.removeItem(cleanupKey);
      cleanupOnce();
    }
  });
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
