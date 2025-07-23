import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveWebLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveWebLayout = ({ children, className }: ResponsiveWebLayoutProps) => {
  
  const getResponsiveClasses = () => {
    return {
      container: "min-h-screen w-full m-0 p-0",
      padding: "",
      wrapper: "w-full",
      optimization: ""
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