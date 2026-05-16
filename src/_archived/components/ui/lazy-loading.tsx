import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Loading fallback components
export const ComponentSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-1/4" />
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-6 w-1/6" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/6" />
          <Skeleton className="h-6 w-1/8" />
        </div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

// Higher-order component for lazy loading with custom fallback
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  delay?: number;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({ 
  children, 
  fallback: Fallback = ComponentSkeleton,
  delay = 0 
}) => {
  const [showFallback, setShowFallback] = React.useState(delay > 0);

  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShowFallback(false), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (showFallback) {
    return <Fallback />;
  }

  return (
    <Suspense fallback={<Fallback />}>
      {children}
    </Suspense>
  );
};

// Lazy loading wrapper for routes
export const LazyRoute: React.FC<LazyLoadProps> = ({ children, fallback }) => (
  <LazyLoad fallback={fallback || ComponentSkeleton}>
    {children}
  </LazyLoad>
);