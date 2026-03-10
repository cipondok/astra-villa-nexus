import { useEffect, useRef } from 'react';

export const useScrollLock = (lock: boolean) => {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (lock) {
      // Save current scroll position
      scrollYRef.current = window.scrollY;
      
      // Lock scroll without layout shift
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      // Prevent scrollbar disappearance from shifting layout
      document.documentElement.style.scrollbarGutter = 'stable';
      document.body.style.scrollbarGutter = 'stable';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.scrollbarGutter = '';
      document.body.style.scrollbarGutter = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.scrollbarGutter = '';
      document.body.style.scrollbarGutter = '';
    };
  }, [lock]);
};
