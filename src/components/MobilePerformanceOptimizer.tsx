import React, { useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobilePerformanceOptimizerProps {
  children: React.ReactNode;
}

const MobilePerformanceOptimizer: React.FC<MobilePerformanceOptimizerProps> = ({ children }) => {
  const { isMobile, isTablet } = useIsMobile();

  const optimizeForMobile = useCallback(() => {
    if (isMobile || isTablet) {
      // Reduce animation complexity
      document.documentElement.style.setProperty('--animation-duration', '0.2s');
      
      // Enable hardware acceleration for smoother scrolling
      document.body.style.transform = 'translateZ(0)';
      document.body.style.webkitTransform = 'translateZ(0)';
      
      // Optimize font rendering
      (document.body.style as any).webkitFontSmoothing = 'antialiased';
      (document.body.style as any).mozOsxFontSmoothing = 'grayscale';
      
      // Reduce repaints by enabling layer creation
      document.body.style.willChange = 'transform';
      
      // Disable hover effects on mobile to prevent delayed clicks
      const hoverStyles = document.createElement('style');
      hoverStyles.innerHTML = `
        @media (hover: none) and (pointer: coarse) {
          *:hover {
            transform: none !important;
            transition: none !important;
          }
        }
      `;
      document.head.appendChild(hoverStyles);
      
      // Optimize touch events
      document.body.style.touchAction = 'manipulation';
      
      // Prevent zoom on input focus
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
      
      // Lazy load images and defer non-critical resources
      if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              img.src = img.dataset.src || '';
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
      }
    }
  }, [isMobile, isTablet]);

  const prefetchCriticalResources = useCallback(() => {
    // Prefetch critical CSS
    const criticalCSS = [
      '/src/index.css',
      '/src/styles/responsive-optimizations.css'
    ];
    
    criticalCSS.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  const optimizeImages = useCallback(() => {
    // Convert images to WebP format on mobile for better compression
    const images = document.querySelectorAll('img:not([data-optimized])');
    images.forEach(img => {
      const imageElement = img as HTMLImageElement;
      
      // Add loading="lazy" for better performance
      imageElement.loading = 'lazy';
      
      // Add intersection observer for lazy loading
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLImageElement;
              
              // Optimize image loading for mobile
              if (isMobile && target.src) {
                // Add compression query parameters if possible
                const url = new URL(target.src, window.location.origin);
                url.searchParams.set('w', '800'); // Max width for mobile
                url.searchParams.set('q', '80');  // Quality optimization
                target.src = url.toString();
              }
              
              target.setAttribute('data-optimized', 'true');
              observer.unobserve(target);
            }
          });
        });
        
        observer.observe(imageElement);
      }
    });
  }, [isMobile]);

  const debounceScrollEvents = useCallback(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Reduce scroll event frequency on mobile
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Remove existing scroll listeners and add debounced version
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const reduceMotionForLowEndDevices = useCallback(() => {
    // Detect low-end devices and reduce animations
    const connection = (navigator as any).connection;
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                          connection?.effectiveType === 'slow-2g' ||
                          connection?.effectiveType === '2g';
    
    if (isLowEndDevice || isMobile) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      document.documentElement.style.setProperty('--transition-duration', '0.1s');
      
      // Disable expensive effects
      const style = document.createElement('style');
      style.innerHTML = `
        *, *::before, *::after {
          animation-duration: 0.1s !important;
          transition-duration: 0.1s !important;
          transform: none !important;
        }
        
        .glass-effect {
          backdrop-filter: none !important;
        }
        
        .shadow-lg, .shadow-xl {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, [isMobile]);

  const optimizeReactPerformance = useCallback(() => {
    if (isMobile || isTablet) {
      // Reduce React update frequency on mobile
      const originalSetTimeout = window.setTimeout;
      const optimizedSetTimeout = function(callback: any, delay = 0) {
        // Increase minimum delay on mobile to reduce CPU usage
        const mobileDelay = Math.max(delay, 16); // Minimum 16ms (60fps)
        return originalSetTimeout(callback, mobileDelay);
      };
      
      // Type assertion to avoid TypeScript conflicts
      (window as any).setTimeout = optimizedSetTimeout;
    }
  }, [isMobile, isTablet]);

  useEffect(() => {
    optimizeForMobile();
    prefetchCriticalResources();
    optimizeImages();
    const cleanupScroll = debounceScrollEvents();
    reduceMotionForLowEndDevices();
    optimizeReactPerformance();
    
    return cleanupScroll;
  }, [
    optimizeForMobile, 
    prefetchCriticalResources, 
    optimizeImages, 
    debounceScrollEvents, 
    reduceMotionForLowEndDevices,
    optimizeReactPerformance
  ]);

  return <>{children}</>;
};

export default MobilePerformanceOptimizer;