import { RefObject, useEffect } from 'react';

interface AutoScrollOptions {
  speed?: number; // pixels per tick
  intervalMs?: number; // interval duration
  direction?: 'ltr' | 'rtl'; // visual movement
  pauseOnHover?: boolean;
  seamless?: boolean; // enable seamless loop with duplicated content
}

// Auto-scrolls a horizontal container. Resets to start when reaching the end.
export default function useAutoHorizontalScroll(
  ref: RefObject<HTMLElement>,
  { speed = 1, intervalMs = 25, direction = 'rtl', pauseOnHover = true, seamless = false }: AutoScrollOptions = {}
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

      if (!paused && el.scrollWidth > el.clientWidth) {
        // Convert provided speed (px per interval) into px per frame using intervalMs as baseline
        const baseline = intervalMs ?? 16.7; // safeguard
        const px = Math.max(0.5, speed) * (dt / baseline);
        const currentScroll = el.scrollLeft;
        const newScroll = currentScroll + (direction === 'rtl' ? px : -px);

        const maxScroll = el.scrollWidth - el.clientWidth;
        const loopWidth = seamless ? Math.floor(el.scrollWidth / 2) : 0;

        if (direction === 'rtl') {
          if (seamless && loopWidth > 0) {
            // When crossing the loop boundary, keep the offset for seamless effect
            if (newScroll >= loopWidth) {
              el.scrollLeft = newScroll - loopWidth;
            } else {
              el.scrollLeft = newScroll;
            }
          } else {
            if (newScroll >= maxScroll) {
              el.scrollLeft = 0; // loop back to start (non-seamless)
            } else {
              el.scrollLeft = newScroll;
            }
          }
        } else {
          if (seamless && loopWidth > 0) {
            if (newScroll <= 0) {
              el.scrollLeft = loopWidth + newScroll; // preserve offset
            } else {
              el.scrollLeft = newScroll;
            }
          } else {
            if (newScroll <= 0) {
              el.scrollLeft = maxScroll; // jump to end (non-seamless)
            } else {
              el.scrollLeft = newScroll;
            }
          }
        }
      }

      rafId = window.requestAnimationFrame(tickRaf);
    };

    rafId = window.requestAnimationFrame(tickRaf);

    if (pauseOnHover) {
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchend', onTouchEnd);
    }

    // Observe size and content changes to ensure scrolling stays active when data loads
    const resizeObserver = new ResizeObserver(() => {
      // noop: the RAF loop checks dimensions every frame
    });
    resizeObserver.observe(el);

    const mutationObserver = new MutationObserver(() => {
      // noop: RAF loop handles scrolling; observer ensures we keep running after DOM updates
    });
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      if (pauseOnHover) {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.removeEventListener('touchstart', onTouchStart as any);
        el.removeEventListener('touchend', onTouchEnd);
      }
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [ref, speed, intervalMs, direction, pauseOnHover, seamless]);
}
