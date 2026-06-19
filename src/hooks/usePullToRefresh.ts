import { useEffect, useRef, useState, useCallback } from "react";

interface Options {
  /** Async callback fired when the gesture crosses the threshold. */
  onRefresh: () => void | Promise<void>;
  /** Pixels of pull required to trigger a refresh. Default 70. */
  threshold?: number;
  /** Maximum visual offset in px. Default threshold * 1.6. */
  maxPull?: number;
  /** Disable the gesture entirely (e.g. desktop). */
  disabled?: boolean;
}

interface State {
  pull: number;
  refreshing: boolean;
}

/**
 * Touch / pointer based pull-to-refresh.
 * Only activates when the target's scrollTop === 0 and the user drags down.
 * Respects prefers-reduced-motion (returns disabled state).
 */
export function usePullToRefresh<T extends HTMLElement = HTMLDivElement>(
  opts: Options
) {
  const { onRefresh, threshold = 70, maxPull, disabled } = opts;
  const cap = maxPull ?? threshold * 1.6;

  const ref = useRef<T | null>(null);
  const startY = useRef<number | null>(null);
  const active = useRef(false);
  const [state, setState] = useState<State>({ pull: 0, refreshing: false });

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const off = disabled || reducedMotion;

  const trigger = useCallback(async () => {
    setState({ pull: threshold, refreshing: true });
    try {
      await onRefresh();
    } finally {
      setState({ pull: 0, refreshing: false });
    }
  }, [onRefresh, threshold]);

  useEffect(() => {
    if (off) return;
    const el = ref.current;
    if (!el) return;

    const getScrollTop = () => {
      // when ref is body/document scroll, fallback to window
      if (el === document.body || el === document.documentElement) {
        return window.scrollY || document.documentElement.scrollTop;
      }
      return el.scrollTop;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (state.refreshing) return;
      if (getScrollTop() > 0) return;
      startY.current = e.touches[0].clientY;
      active.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!active.current || startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        setState((s) => (s.pull === 0 ? s : { ...s, pull: 0 }));
        return;
      }
      // resistance curve
      const eased = Math.min(cap, dy * 0.55);
      setState((s) => ({ ...s, pull: eased }));
    };

    const onTouchEnd = () => {
      if (!active.current) return;
      active.current = false;
      startY.current = null;
      setState((s) => {
        if (s.pull >= threshold && !s.refreshing) {
          // fire & forget — trigger() will reset
          void trigger();
          return { ...s, pull: threshold };
        }
        return { ...s, pull: 0 };
      });
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [off, cap, threshold, trigger, state.refreshing]);

  return { ref, pull: state.pull, refreshing: state.refreshing, threshold };
}
