import { useCallback, useRef, useState } from "react";

interface Options {
  onRefresh: () => void | Promise<void>;
  threshold?: number;
  maxPull?: number;
  disabled?: boolean;
}

/**
 * Touch-based pull-to-refresh that exposes pointer/touch handlers
 * for the consumer to spread on a scroll container.
 *
 * Triggers when the user drags down from the very top of the page.
 * Respects prefers-reduced-motion (returns a no-op handler set).
 */
export function usePullToRefresh(opts: Options) {
  const { onRefresh, threshold = 70, maxPull, disabled } = opts;
  const cap = maxPull ?? threshold * 1.6;

  const ref = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const active = useRef(false);

  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const off = disabled || reducedMotion;

  const atTop = () =>
    (window.scrollY || document.documentElement.scrollTop || 0) <= 0;

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (off || isRefreshing) return;
      if (!atTop()) return;
      startY.current = e.touches[0].clientY;
      active.current = true;
    },
    [off, isRefreshing],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!active.current || startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        setPullDistance(0);
        setIsPulling(false);
        return;
      }
      const eased = Math.min(cap, dy * 0.55);
      setPullDistance(eased);
      setIsPulling(true);
    },
    [cap],
  );

  const finish = useCallback(async () => {
    if (!active.current) return;
    active.current = false;
    startY.current = null;
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const handlers = {
    onTouchStart,
    onTouchMove,
    onTouchEnd: finish,
    onTouchCancel: finish,
  };

  const indicatorOpacity = Math.min(1, pullDistance / threshold);
  const indicatorRotation = Math.min(360, (pullDistance / threshold) * 270);

  return {
    ref,
    handlers,
    pull: pullDistance,
    pullDistance,
    isPulling,
    isRefreshing,
    refreshing: isRefreshing,
    indicatorOpacity,
    indicatorRotation,
    threshold,
  };
}
