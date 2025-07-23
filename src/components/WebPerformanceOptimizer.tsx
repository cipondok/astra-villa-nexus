import React, { useEffect, useCallback } from 'react';
import { initWebPerformanceOptimizations } from '@/utils/webPerformance';

interface WebPerformanceOptimizerProps {
  children: React.ReactNode;
}

const WebPerformanceOptimizer: React.FC<WebPerformanceOptimizerProps> = ({ children }) => {

  const optimizeForWeb = useCallback(() => {
    // Enable hardware acceleration for all devices
    document.body.style.transform = 'translateZ(0)';
    
    // Optimize font rendering
    (document.body.style as any).webkitFontSmoothing = 'antialiased';
    (document.body.style as any).mozOsxFontSmoothing = 'grayscale';
    
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Optimize viewport for all devices
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    }
  }, []);

  const optimizeImages = useCallback(() => {
    // Optimize all images for faster loading
    const images = document.querySelectorAll('img:not([data-optimized])');
    images.forEach(img => {
      const imageElement = img as HTMLImageElement;
      
      // Add lazy loading
      imageElement.loading = 'lazy';
      
      // Add decoding optimization
      imageElement.decoding = 'async';
      
      // Mark as optimized
      imageElement.setAttribute('data-optimized', 'true');
    });
  }, []);

  const prefetchResources = useCallback(() => {
    // Prefetch critical resources
    const criticalResources = [
      '/src/index.css',
      '/src/styles/responsive-optimizations.css'
    ];
    
    criticalResources.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  const optimizeAnimations = useCallback(() => {
    // Respect user preferences for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      const style = document.createElement('style');
      style.innerHTML = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const optimizeTouch = useCallback(() => {
    // Optimize touch for all devices
    const style = document.createElement('style');
    style.innerHTML = `
      button, a, [role="button"] {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      
      input, textarea, select {
        font-size: 16px;
      }
      
      /* Smooth scrolling for all devices */
      html {
        scroll-behavior: smooth;
      }
      
      body {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const debounceScrollEvents = useCallback(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Initialize all web performance optimizations
    initWebPerformanceOptimizations();
    
    // Set up additional optimizations
    optimizeForWeb();
    optimizeImages();
    prefetchResources();
    optimizeAnimations();
    optimizeTouch();
    const cleanupScroll = debounceScrollEvents();
    
    return cleanupScroll;
  }, []);

  return <>{children}</>;
};

export default WebPerformanceOptimizer;