import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveWebLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveWebLayout = ({ children, className }: ResponsiveWebLayoutProps) => {
  
  const getResponsiveClasses = () => {
    return {
      container: "min-h-screen w-full",
      padding: "px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-12 lg:py-10 xl:px-16 xl:py-12",
      wrapper: "w-full max-w-7xl mx-auto",
      optimization: "scroll-smooth overflow-y-auto"
    };
  };

  const responsive = getResponsiveClasses();

  return (
    <div className={cn(
      // Responsive container
      responsive.container,
      // Progressive enhancement padding
      responsive.padding,
      // Smooth scrolling
      responsive.optimization,
      className
    )}>
      {/* Responsive content wrapper */}
      <div className={responsive.wrapper}>
        {children}
      </div>
    </div>
  );
};

export default ResponsiveWebLayout;