// Mobile Performance Optimization Utilities

export const detectDeviceCapabilities = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
  const isLowEndDevice = navigator.hardwareConcurrency <= 2;
  const connection = (navigator as any).connection;
  const hasSlowConnection = connection?.effectiveType === 'slow-2g' || 
                           connection?.effectiveType === '2g';
  
  return {
    isMobile,
    isTablet,
    isLowEndDevice,
    hasSlowConnection,
    shouldOptimize: isMobile || isTablet || isLowEndDevice || hasSlowConnection
  };
};

export const optimizeImageLoading = () => {
  // Convert all images to use lazy loading and WebP format when possible
  const images = document.querySelectorAll('img:not([data-optimized])');
  
  images.forEach(img => {
    const imageElement = img as HTMLImageElement;
    
    // Add lazy loading
    imageElement.loading = 'lazy';
    
    // Add intersection observer for better control
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLImageElement;
            
            // Try to load WebP version if supported
            if (supportsWebP()) {
              const webpSrc = target.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
              target.src = webpSrc;
            }
            
            target.setAttribute('data-optimized', 'true');
            observer.unobserve(target);
          }
        });
      }, {
        rootMargin: '50px' // Start loading 50px before the image is visible
      });
      
      observer.observe(imageElement);
    }
  });
};

export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

export const enableHardwareAcceleration = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    * {
      -webkit-transform: translateZ(0);
      -moz-transform: translateZ(0);
      -ms-transform: translateZ(0);
      -o-transform: translateZ(0);
      transform: translateZ(0);
      
      -webkit-backface-visibility: hidden;
      -moz-backface-visibility: hidden;
      -ms-backface-visibility: hidden;
      backface-visibility: hidden;
      
      -webkit-perspective: 1000;
      -moz-perspective: 1000;
      -ms-perspective: 1000;
      perspective: 1000;
    }
    
    body {
      -webkit-overflow-scrolling: touch;
      overflow-scrolling: touch;
    }
  `;
  document.head.appendChild(style);
};

export const optimizeScrolling = () => {
  // Add smooth scrolling behavior optimized for mobile
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Enable momentum scrolling on iOS
  (document.body.style as any).webkitOverflowScrolling = 'touch';
  
  // Prevent rubber band effect
  document.body.style.overscrollBehavior = 'contain';
};

export const reduceAnimations = () => {
  const { shouldOptimize } = detectDeviceCapabilities();
  
  if (shouldOptimize) {
    const style = document.createElement('style');
    style.innerHTML = `
      *, *::before, *::after {
        animation-duration: 0.1s !important;
        animation-delay: 0s !important;
        transition-duration: 0.1s !important;
        transition-delay: 0s !important;
      }
      
      .fade-in, .slide-in, .scale-in {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
      
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

export const prefetchCriticalResources = () => {
  const criticalResources = [
    '/src/index.css',
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
  // Optimize touch events for better responsiveness
  document.body.style.touchAction = 'manipulation';
  
  // Add touch-friendly styles
  const style = document.createElement('style');
  style.innerHTML = `
    button, a, [role="button"] {
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    
    input, textarea, select {
      font-size: 16px; /* Prevent zoom on iOS */
    }
    
    @media (hover: none) and (pointer: coarse) {
      *:hover {
        transform: none !important;
      }
    }
  `;
  document.head.appendChild(style);
};

export const initMobilePerformanceOptimizations = () => {
  const { shouldOptimize } = detectDeviceCapabilities();
  
  if (shouldOptimize) {
    optimizeImageLoading();
    enableHardwareAcceleration();
    optimizeScrolling();
    reduceAnimations();
    prefetchCriticalResources();
    optimizeTouch();
    
    console.log('Mobile performance optimizations applied');
  }
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
  enableHardwareAcceleration,
  optimizeScrolling,
  reduceAnimations,
  prefetchCriticalResources,
  optimizeTouch,
  initMobilePerformanceOptimizations,
  debounce,
  cleanupUnusedResources
};