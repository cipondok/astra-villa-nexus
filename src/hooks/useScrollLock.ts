import { useEffect, useRef } from 'react';

export const useScrollLock = (lock: boolean) => {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!lock) {
      const scrollY = scrollYRef.current;
      document.documentElement.style.overflow = '';
      window.scrollTo(0, scrollY);
      return;
    }

    scrollYRef.current = window.scrollY;
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [lock]);
};
