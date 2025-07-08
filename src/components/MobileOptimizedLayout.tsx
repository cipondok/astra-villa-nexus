import React from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MobileOptimizedLayout = ({ children, className }: MobileOptimizedLayoutProps) => {
  return (
    <div className={cn(
      // Mobile-first responsive container
      "min-h-screen w-full overflow-x-hidden",
      // Touch-friendly padding and spacing
      "px-2 sm:px-4 md:px-6 lg:px-8",
      "py-2 sm:py-4",
      // Prevent zoom on double tap
      "touch-manipulation",
      // Safe area padding for mobile devices
      "safe-area-inset",
      // Optimize for mobile scrolling
      "overflow-y-auto scroll-smooth",
      className
    )}>
      {/* Mobile-optimized content wrapper */}
      <div className="w-full max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};

export default MobileOptimizedLayout;