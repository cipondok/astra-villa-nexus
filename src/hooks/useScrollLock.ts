import { useEffect } from 'react';

export const useScrollLock = (lock: boolean) => {
  useEffect(() => {
    if (!lock) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('scroll-locked');
      return;
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.classList.add('scroll-locked');

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('scroll-locked');
    };
  }, [lock]);
};
