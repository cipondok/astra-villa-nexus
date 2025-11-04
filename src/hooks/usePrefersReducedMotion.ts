import { useState, useEffect } from 'react';

export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Log for developers
    if (mediaQuery.matches) {
      console.log('🎯 Accessibility: Reduced motion mode is ACTIVE - animations disabled');
    } else {
      console.log('✨ Accessibility: Full animations enabled');
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      
      // Log when preference changes
      if (e.matches) {
        console.log('🎯 Accessibility: User enabled reduced motion - switching to simplified animations');
      } else {
        console.log('✨ Accessibility: User disabled reduced motion - full animations restored');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};
