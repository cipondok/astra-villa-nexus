import React, { Suspense, ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LazyRenderProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Reserved height so layout doesn't shift when content appears */
  minHeight?: string | number;
  rootMargin?: string;
}

/**
 * Defers rendering children until they scroll near the viewport.
 * Eliminates off-screen DOM nodes from the initial render, improving FCP and DOM complexity.
 */
const LazyRender: React.FC<LazyRenderProps> = ({
  children,
  fallback,
  minHeight = '200px',
  rootMargin = '300px',
}) => {
  const [ref, isVisible] = useIntersectionObserver({ rootMargin });

  const style: React.CSSProperties = isVisible
    ? {}
    : { minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight };

  return (
    <div ref={ref} style={style}>
      {isVisible ? (
        <Suspense fallback={fallback ?? <div style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }} />}>
          {children}
        </Suspense>
      ) : (
        fallback ?? null
      )}
    </div>
  );
};

export default LazyRender;
