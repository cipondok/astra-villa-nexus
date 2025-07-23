import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MobileOptimizedLayout = ({ children, className }: MobileOptimizedLayoutProps) => {
  const { isMobile, isTablet, deviceInfo } = useIsMobile();
  
  // Determine layout classes based on device type
  const getResponsiveClasses = () => {
    if (isMobile) {
      return {
        container: "min-h-screen w-full overflow-x-hidden mobile-app-layout",
        padding: "px-3 py-3",
        wrapper: "w-full max-w-full mx-auto",
        touch: "touch-manipulation mobile-safe-area"
      };
    } else if (isTablet) {
      return {
        container: "min-h-screen w-full overflow-x-hidden tablet-app-layout",
        padding: "px-6 py-4",
        wrapper: "w-full max-w-6xl mx-auto",
        touch: "touch-manipulation tablet-safe-area"
      };
    } else {
      return {
        container: "min-h-screen w-full overflow-x-hidden",
        padding: "px-8 py-6 lg:px-12",
        wrapper: "w-full max-w-7xl mx-auto",
        touch: "scroll-smooth"
      };
    }
  };

  const responsive = getResponsiveClasses();

  return (
    <div className={cn(
      // Device-specific responsive container
      responsive.container,
      // Device-appropriate padding and spacing
      responsive.padding,
      // Touch and scroll optimizations
      responsive.touch,
      // Optimize for device scrolling
      "overflow-y-auto",
      className
    )}>
      {/* Device-optimized content wrapper */}
      <div className={responsive.wrapper}>
        {children}
      </div>
    </div>
  );
};

export default MobileOptimizedLayout;