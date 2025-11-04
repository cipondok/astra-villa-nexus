import { useState, useEffect } from 'react';

export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Check for manual override in localStorage
    const savedOverride = localStorage.getItem('dev-reduced-motion-override');
    if (savedOverride !== null) {
      setManualOverride(savedOverride === 'true');
    }
    
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

  // Manual override takes precedence
  const effectiveValue = manualOverride !== null ? manualOverride : prefersReducedMotion;

  const toggleOverride = () => {
    const newValue = !effectiveValue;
    setManualOverride(newValue);
    localStorage.setItem('dev-reduced-motion-override', String(newValue));
    console.log(`🔧 Dev Override: Reduced motion manually set to ${newValue ? 'ON' : 'OFF'}`);
  };

  const clearOverride = () => {
    setManualOverride(null);
    localStorage.removeItem('dev-reduced-motion-override');
    console.log('🔧 Dev Override: Cleared - using system preference');
  };

  return { 
    prefersReducedMotion: effectiveValue, 
    toggleOverride, 
    clearOverride,
    isOverridden: manualOverride !== null 
  };
};
