
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

// Register Service Worker for PWA - robust update handling
if ('serviceWorker' in navigator) {
  const recoverFromStaleCacheOnce = async () => {
    const key = '__sw_recovery_attempted__';
    if (sessionStorage.getItem(key) === '1') return;
    sessionStorage.setItem(key, '1');

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));

      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(n => caches.delete(n)));
      }
    } finally {
      window.location.reload();
    }
  };

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

      if (process.env.NODE_ENV === 'development') {
        console.log('SW registered: ', registration);
      }
    } catch (registrationError) {
      if (process.env.NODE_ENV === 'development') {
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
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

root.render(<App />);
