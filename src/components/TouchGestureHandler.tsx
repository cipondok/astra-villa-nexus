import React from 'react';
import { useTouchGestures } from '@/hooks/useTouchGestures';

interface TouchGestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchZoom?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  className?: string;
}

const TouchGestureHandler = ({ 
  children, 
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchZoom,
  onTap,
  onDoubleTap,
  onLongPress,
  className = ""
}: TouchGestureHandlerProps) => {
  const gestureRef = useTouchGestures({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinchZoom,
    onTap,
    onDoubleTap,
    onLongPress
  });

  return (
    <div 
      ref={gestureRef as any}
      className={`touch-manipulation ${className}`}
      style={{ touchAction: 'pan-x pan-y' }}
    >
      {children}
    </div>
  );
};

export default TouchGestureHandler;