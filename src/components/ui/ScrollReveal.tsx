import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  /** Delay in ms before animation starts */
  delay?: number;
  /** Duration in ms */
  duration?: number;
  /** Distance in px to travel */
  distance?: number;
  /** Additional className */
  className?: string;
  /** IntersectionObserver rootMargin */
  rootMargin?: string;
  /** Whether to apply the animation (respects reduced motion automatically) */
  disabled?: boolean;
}

const getTransform = (direction: RevealDirection, distance: number): string => {
  switch (direction) {
    case 'up': return `translateY(${distance}px)`;
    case 'down': return `translateY(-${distance}px)`;
    case 'left': return `translateX(${distance}px)`;
    case 'right': return `translateX(-${distance}px)`;
    case 'none': return 'none';
  }
};

/**
 * Scroll-triggered reveal animation component.
 * Automatically respects prefers-reduced-motion.
 * Uses IntersectionObserver for performant viewport detection.
 */
const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 600,
  distance = 24,
  className,
  rootMargin = '0px 0px -60px 0px',
  disabled = false,
}) => {
  const [ref, isVisible] = useIntersectionObserver({
    rootMargin,
    freezeOnceVisible: true,
    threshold: 0.1,
  });

  const hiddenStyle: React.CSSProperties = {
    opacity: 0,
    transform: getTransform(direction, distance),
    transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    willChange: 'opacity, transform',
  };

  const visibleStyle: React.CSSProperties = {
    opacity: 1,
    transform: 'translateY(0) translateX(0)',
    transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
  };

  // If disabled, render children without animation wrapper styles
  if (disabled) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={cn('scroll-reveal', className)}
      style={isVisible ? visibleStyle : hiddenStyle}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
