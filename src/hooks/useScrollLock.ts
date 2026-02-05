import { useEffect, useRef } from 'react';

export const useScrollLock = (lock: boolean) => {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!lock) {
      // Restore scroll position and cleanup
      const scrollY = scrollYRef.current;
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('scroll-locked');
      // Restore position (in case it drifted)
      window.scrollTo(0, scrollY);
      return;
    }

    // Store current scroll position
    scrollYRef.current = window.scrollY;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Apply to both html and body to ensure no scroll
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.classList.add('scroll-locked');

    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('scroll-locked');
    };
  }, [lock]);
};
