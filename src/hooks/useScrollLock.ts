import { useEffect, useRef } from 'react';

export const useScrollLock = (lock: boolean) => {
  const scrollbarWidthRef = useRef(0);

  useEffect(() => {
    if (lock) {
      // Calculate scrollbar width to prevent layout shift
      scrollbarWidthRef.current = window.innerWidth - document.documentElement.clientWidth;

      // Prevent scroll without changing position (no page jump)
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      // Compensate for scrollbar disappearance to prevent layout shift
      if (scrollbarWidthRef.current > 0) {
        document.body.style.paddingRight = `${scrollbarWidthRef.current}px`;
      }
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [lock]);
};
