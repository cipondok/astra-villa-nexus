import { useEffect, useRef } from 'react';

/**
 * Locks body scroll without causing layout shift.
 * Uses position:fixed technique to maintain scrollbar visibility.
 */
export const useScrollLock = (lock: boolean) => {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (lock) {
      // Save current scroll position
      scrollYRef.current = window.scrollY;
      
      // Use position:fixed to lock scroll while keeping scrollbar visible
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'visible';
    } else {
      // Restore scroll position
      const scrollY = scrollYRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    }
    return () => {
      const scrollY = scrollYRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [lock]);
};
