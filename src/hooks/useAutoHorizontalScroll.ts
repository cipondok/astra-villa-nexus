import { RefObject, useEffect } from 'react';

interface AutoScrollOptions {
  speed?: number; // pixels per tick
  intervalMs?: number; // interval duration
  direction?: 'ltr' | 'rtl'; // visual movement
  pauseOnHover?: boolean;
  loopMode?: 'stop' | 'loop' | 'seamless'; // stop at end, jump to start, or seamless
}

// Auto-scrolls a horizontal container with configurable loop behavior
export default function useAutoHorizontalScroll(
  ref: RefObject<HTMLElement>,
  { speed = 1, intervalMs = 25, direction = 'rtl', pauseOnHover = true, loopMode = 'loop' }: AutoScrollOptions = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let paused = false;
    let rafId: number | null = null;
    let last = performance.now();
    let initialized = false;

    // Handlers kept as references so we can remove them on cleanup
    const onMouseEnter = () => (paused = true);
    const onMouseLeave = () => (paused = false);
    const onTouchStart = () => (paused = true);
    const onTouchEnd = () => (paused = false);

    const tickRaf = (now: number) => {
      if (!el) return;
      const dt = Math.min(64, now - last); // cap delta to avoid huge jumps
      last = now;

      const scrollable = el.scrollWidth > el.clientWidth;
      
      // Initialize scroll position to 1/3 for seamless looping (content is tripled)
      if (!initialized && scrollable && loopMode === 'seamless') {
        const oneThird = Math.floor(el.scrollWidth / 3);
        el.scrollLeft = oneThird;
        initialized = true;
      }

      if (!paused && scrollable && speed > 0) {
        // Convert provided speed (px per interval) into px per frame using intervalMs as baseline
        const baseline = intervalMs ?? 16.7; // safeguard
        const px = Math.max(0.5, speed) * (dt / baseline);
        const currentScroll = el.scrollLeft;
        const newScroll = currentScroll + (direction === 'rtl' ? px : -px);

        const maxScroll = el.scrollWidth - el.clientWidth;
        const seamless = loopMode === 'seamless';
        // For tripled content, loop width is 1/3 of total
        const loopWidth = seamless ? Math.floor(el.scrollWidth / 3) : 0;

        if (direction === 'rtl') {
          if (seamless && loopWidth > 0) {
            // Seamless loop: reset when reaching 2/3 point
            if (newScroll >= loopWidth * 2) {
              el.scrollLeft = loopWidth;
            } else {
              el.scrollLeft = newScroll;
            }
          } else if (loopMode === 'stop') {
            if (newScroll >= maxScroll) {
              el.scrollLeft = maxScroll;
              paused = true;
            } else {
              el.scrollLeft = newScroll;
            }
          } else {
            if (newScroll >= maxScroll) {
              el.scrollLeft = 0;
            } else {
              el.scrollLeft = newScroll;
            }
          }
        } else {
          if (seamless && loopWidth > 0) {
            // Seamless loop for LTR: reset when reaching 1/3 point going left
            if (newScroll <= loopWidth) {
              el.scrollLeft = loopWidth * 2;
            } else {
              el.scrollLeft = newScroll;
            }
          } else if (loopMode === 'stop') {
            if (newScroll <= 0) {
              el.scrollLeft = 0;
              paused = true;
            } else {
              el.scrollLeft = newScroll;
            }
          } else {
            if (newScroll <= 0) {
              el.scrollLeft = maxScroll;
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
  }, [ref, speed, intervalMs, direction, pauseOnHover, loopMode]);
}
