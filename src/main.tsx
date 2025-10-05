
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

// Register Service Worker for PWA - Non-blocking with update check
if ('serviceWorker' in navigator) {
  const registerSW = () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('SW registered: ', registration);
        }
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      })
      .catch((registrationError) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('SW registration failed: ', registrationError);
        }
      });
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
