import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_POSITIONS_KEY = 'app_scroll_positions';

export const useScrollRestore = (enabled = true) => {
  const location = useLocation();

  useEffect(() => {
    if (!enabled) return;

    const saveScrollPosition = () => {
      const positions = JSON.parse(sessionStorage.getItem(SCROLL_POSITIONS_KEY) || '{}');
      positions[location.pathname] = {
        x: window.scrollX,
        y: window.scrollY,
        timestamp: Date.now(),
      };
      // Keep only last 10 routes to prevent memory bloat
      const entries = Object.entries(positions);
      if (entries.length > 10) {
        const sorted = entries.sort((a: any, b: any) => b[1].timestamp - a[1].timestamp);
        const trimmed = Object.fromEntries(sorted.slice(0, 10));
        sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(trimmed));
      } else {
        sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
      }
    };

    const restoreScrollPosition = () => {
      const positions = JSON.parse(sessionStorage.getItem(SCROLL_POSITIONS_KEY) || '{}');
      const saved = positions[location.pathname];
      
      if (saved) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(saved.x, saved.y);
        });
      } else {
        // Default to top for new routes
        window.scrollTo(0, 0);
      }
    };

    // Restore on mount
    restoreScrollPosition();

    // Save on scroll (debounced)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(saveScrollPosition, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      saveScrollPosition(); // Save on unmount
    };
  }, [location.pathname, enabled]);
};
