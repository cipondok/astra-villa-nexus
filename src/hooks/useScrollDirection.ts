import { useState, useEffect } from 'react';

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'idle'>('idle');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    let idleTimeout: NodeJS.Timeout;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      
      setIsScrolled(scrollY > 100);

      if (Math.abs(scrollY - lastScrollY) < 5) {
        ticking = false;
        return;
      }

      const direction = scrollY > lastScrollY ? 'down' : 'up';
      setScrollDirection(direction);
      setLastScrollY(scrollY);
      ticking = false;

      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        setScrollDirection('idle');
      }, 150);
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(idleTimeout);
    };
  }, [lastScrollY]);

  return { scrollDirection, isScrolled };
};
