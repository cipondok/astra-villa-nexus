import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'admin-reduced-motion';

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const toggle = useCallback(() => {
    setReducedMotion(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    return () => document.documentElement.classList.remove('reduce-motion');
  }, [reducedMotion]);

  return { reducedMotion, toggle };
}
