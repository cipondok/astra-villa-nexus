import { useEffect, useRef, useState } from 'react';

interface TouchGestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchZoom?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

interface TouchGestureOptions {
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  pinchThreshold?: number;
}

export const useTouchGestures = (
  handlers: TouchGestureHandlers,
  options: TouchGestureOptions = {}
) => {
  const {
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    pinchThreshold = 0.1
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [initialDistance, setInitialDistance] = useState<number>(0);

  const getDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    
    if (e.touches.length === 1) {
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      
      // Long press detection
      const timer = setTimeout(() => {
        handlers.onLongPress?.();
      }, longPressDelay);
      setLongPressTimer(timer);
    } else if (e.touches.length === 2) {
      // Pinch gesture start
      setInitialDistance(getDistance(e.touches));
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    // Cancel long press on movement
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (e.touches.length === 2 && initialDistance > 0) {
      // Pinch zoom detection
      const currentDistance = getDistance(e.touches);
      const scale = currentDistance / initialDistance;
      
      if (Math.abs(scale - 1) > pinchThreshold) {
        handlers.onPinchZoom?.(scale);
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (!touchStart || e.touches.length > 0) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Swipe detection
    if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }
    } else {
      // Tap detection
      const now = Date.now();
      if (now - lastTap < doubleTapDelay) {
        handlers.onDoubleTap?.();
      } else {
        handlers.onTap?.();
      }
      setLastTap(now);
    }

    setTouchStart(null);
    setInitialDistance(0);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, lastTap, longPressTimer, initialDistance]);

  return elementRef;
};