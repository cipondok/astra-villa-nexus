import { useState, useEffect } from 'react';

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'idle'>('idle');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let ticking = false;
    let idleTimeout: NodeJS.Timeout;

    const updateScrollDirection = () => {
      const currentScrollY = window.pageYOffset;
      
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 100);
      setIsAtTop(currentScrollY < 100);

      if (Math.abs(currentScrollY - lastScrollY) < 5) {
        ticking = false;
        return;
      }

      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      setScrollDirection(direction);
      setLastScrollY(currentScrollY);
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

  return { scrollDirection, isScrolled, scrollY, isAtTop };
};
