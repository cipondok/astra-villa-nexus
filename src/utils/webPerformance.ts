// Web Performance Optimization Utilities

export const detectDeviceCapabilities = () => {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android/i.test(userAgent) && window.innerWidth >= 768;
  const isDesktop = !isMobile && !isTablet;
  const isLowEndDevice = navigator.hardwareConcurrency <= 2;
  const connection = (navigator as any).connection;
  const hasSlowConnection = connection?.effectiveType === 'slow-2g' || 
                           connection?.effectiveType === '2g' ||
                           connection?.effectiveType === '3g';
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLowEndDevice,
    hasSlowConnection,
    shouldOptimize: isLowEndDevice || hasSlowConnection
  };
};

export const optimizeImageLoading = () => {
  // Optimize all images for web performance
  const images = document.querySelectorAll('img:not([data-optimized])');
  
  images.forEach(img => {
    const imageElement = img as HTMLImageElement;
    
    // Add lazy loading
    imageElement.loading = 'lazy';
    
    // Add async decoding
    imageElement.decoding = 'async';
    
    // Add intersection observer for better control
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLImageElement;
            
            // Optimize image quality based on device
            const { shouldOptimize } = detectDeviceCapabilities();
            if (shouldOptimize && target.src) {
              // Add optimization parameters if possible
              const url = new URL(target.src, window.location.origin);
              url.searchParams.set('auto', 'format,compress');
              url.searchParams.set('q', '85');
              target.src = url.toString();
            }
            
            target.setAttribute('data-optimized', 'true');
            observer.unobserve(target);
          }
        });
      }, {
        rootMargin: '50px' // Start loading 50px before visible
      });
      
      observer.observe(imageElement);
    }
    
    imageElement.setAttribute('data-optimized', 'true');
  });
};

export const enableWebOptimizations = () => {
  // Enable hardware acceleration
  const style = document.createElement('style');
  style.innerHTML = `
    * {
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
    }
    
    body {
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }
    
    html {
      scroll-behavior: smooth;
    }
  `;
  document.head.appendChild(style);
};

export const optimizeScrolling = () => {
  // Add smooth scrolling behavior
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Enable momentum scrolling
  (document.body.style as any).webkitOverflowScrolling = 'touch';
  
  // Prevent overscroll
  document.body.style.overscrollBehavior = 'contain';
};

export const optimizeForReducedMotion = () => {
  // Respect user preferences for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    const style = document.createElement('style');
    style.innerHTML = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }
};

export const prefetchCriticalResources = () => {
  const criticalResources = [
    '/src/index.css',
    '/src/styles/responsive-web.css',
    '/src/styles/responsive-optimizations.css'
  ];
  
  criticalResources.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = 'style';
    document.head.appendChild(link);
  });
};

export const optimizeTouch = () => {
  // Optimize touch events for better web experience
  const style = document.createElement('style');
  style.innerHTML = `
    button, a, [role="button"], input, textarea, select {
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    
    input, textarea, select {
      font-size: 16px; /* Prevent zoom on focus */
    }
    
    /* Remove hover effects on touch devices */
    @media (hover: none) and (pointer: coarse) {
      *:hover {
        transform: none !important;
      }
    }
  `;
  document.head.appendChild(style);
};

export const optimizeFonts = () => {
  // Optimize font rendering
  (document.body.style as any).webkitFontSmoothing = 'antialiased';
  (document.body.style as any).mozOsxFontSmoothing = 'grayscale';
  
  // Enable font-display: swap for web fonts
  const style = document.createElement('style');
  style.innerHTML = `
    @font-face {
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
};

export const initWebPerformanceOptimizations = () => {
  const { shouldOptimize } = detectDeviceCapabilities();
  
  optimizeImageLoading();
  enableWebOptimizations();
  optimizeScrolling();
  optimizeForReducedMotion();
  prefetchCriticalResources();
  optimizeTouch();
  optimizeFonts();
  
  // Additional optimizations for low-end devices
  if (shouldOptimize) {
    // Reduce animation complexity
    document.documentElement.style.setProperty('--animation-duration', '0.2s');
    
    // Disable expensive effects
    const lowEndStyle = document.createElement('style');
    lowEndStyle.innerHTML = `
      .glass-effect {
        backdrop-filter: none !important;
        background: rgba(255, 255, 255, 0.95) !important;
      }
      
      .shadow-lg, .shadow-xl {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
      }
      
      * {
        will-change: auto !important;
      }
    `;
    document.head.appendChild(lowEndStyle);
  }
  
  console.log('Web performance optimizations applied');
};

// Debounce utility for scroll events
export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Memory management utilities
export const cleanupUnusedResources = () => {
  // Clean up blob URLs to prevent memory leaks
  const images = document.querySelectorAll('img[src^="blob:"]');
  images.forEach(img => {
    const imageElement = img as HTMLImageElement;
    if (!imageElement.offsetParent) {
      URL.revokeObjectURL(imageElement.src);
    }
  });
  
  // Force garbage collection if available
  if (window.gc) {
    window.gc();
  }
};

export default {
  detectDeviceCapabilities,
  optimizeImageLoading,
  enableWebOptimizations,
  optimizeScrolling,
  optimizeForReducedMotion,
  prefetchCriticalResources,
  optimizeTouch,
  optimizeFonts,
  initWebPerformanceOptimizations,
  debounce,
  cleanupUnusedResources
};