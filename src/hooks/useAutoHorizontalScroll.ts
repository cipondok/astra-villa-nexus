import { RefObject, useEffect } from 'react';

interface AutoScrollOptions {
  speed?: number; // pixels per tick
  intervalMs?: number; // interval duration
  direction?: 'ltr' | 'rtl'; // visual movement
  pauseOnHover?: boolean;
}

// Auto-scrolls a horizontal container. Resets to start when reaching the end.
export default function useAutoHorizontalScroll(
  ref: RefObject<HTMLElement>,
  { speed = 1, intervalMs = 25, direction = 'rtl', pauseOnHover = true }: AutoScrollOptions = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let paused = false;
    let id: number | null = null;

    const tick = () => {
      if (!el || paused) return;
      const step = Math.max(1, speed);
      // Move visually from right to left by increasing scrollLeft
      el.scrollLeft += direction === 'rtl' ? step : -step;

      const reachedEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      const reachedStart = el.scrollLeft <= 0;

      if (direction === 'rtl' && reachedEnd) {
        el.scrollLeft = 0; // loop back
      }
      if (direction === 'ltr' && reachedStart) {
        el.scrollLeft = el.scrollWidth; // jump to end
      }
    };

    const start = () => {
      if (id) return;
      id = window.setInterval(tick, intervalMs);
    };

    const stop = () => {
      if (!id) return;
      window.clearInterval(id);
      id = null;
    };

    if (pauseOnHover) {
      el.addEventListener('mouseenter', () => (paused = true));
      el.addEventListener('mouseleave', () => (paused = false));
      el.addEventListener('touchstart', () => (paused = true), { passive: true });
      el.addEventListener('touchend', () => (paused = false));
    }

    start();
    return () => {
      stop();
    };
  }, [ref, speed, intervalMs, direction, pauseOnHover]);
}
