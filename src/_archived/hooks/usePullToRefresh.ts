import { useState, useRef, useCallback } from 'react';
import React from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export const usePullToRefresh = ({ onRefresh, threshold = 80 }: UsePullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);

  const indicatorOpacity = Math.min(pullDistance / threshold, 1);
  const indicatorRotation = (pullDistance / threshold) * 360;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;

    const distance = e.touches[0].clientY - touchStartY.current;
    if (distance > 0) {
      const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
      setPullDistance(resistedDistance);
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, threshold]);

  const onTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);

      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      try {
        await onRefresh();
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          if ('vibrate' in navigator) {
            navigator.vibrate([30, 20, 30]);
          }
        }, 500);
      } catch (error) {
        console.error('Refresh failed:', error);
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, threshold, onRefresh]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    indicatorOpacity,
    indicatorRotation,
    threshold,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
};
