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
    let rafId: number | null = null;
    let last = performance.now();

    // Handlers kept as references so we can remove them on cleanup
    const onMouseEnter = () => (paused = true);
    const onMouseLeave = () => (paused = false);
    const onTouchStart = () => (paused = true);
    const onTouchEnd = () => (paused = false);

    const tickRaf = (now: number) => {
      if (!el) return;
      const dt = Math.min(64, now - last); // cap delta to avoid huge jumps
      last = now;

      if (!paused) {
        // Convert provided speed (px per interval) into px per frame using intervalMs as baseline
        const baseline = intervalMs ?? 16.7; // safeguard
        const px = Math.max(0.5, speed) * (dt / baseline);
        el.scrollLeft += direction === 'rtl' ? px : -px;

        const reachedEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
        const reachedStart = el.scrollLeft <= 0;

        if (direction === 'rtl' && reachedEnd) {
          el.scrollLeft = 0; // loop back
        }
        if (direction === 'ltr' && reachedStart) {
          el.scrollLeft = el.scrollWidth; // jump to end
        }
      }

      rafId = window.requestAnimationFrame(tickRaf);
    };

    // Only start if there is something to scroll
    if (el.scrollWidth > el.clientWidth) {
      rafId = window.requestAnimationFrame(tickRaf);
    }

    if (pauseOnHover) {
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      if (pauseOnHover) {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.removeEventListener('touchstart', onTouchStart as any);
        el.removeEventListener('touchend', onTouchEnd);
      }
    };
  }, [ref, speed, intervalMs, direction, pauseOnHover]);
}
