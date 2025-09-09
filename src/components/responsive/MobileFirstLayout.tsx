import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileFirstLayoutProps {
  children: ReactNode;
  className?: string;
  containerType?: 'full' | 'contained' | 'narrow';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

/**
 * Mobile-First Layout Component
 * Provides consistent responsive layouts following mobile-first principles
 */
const MobileFirstLayout: React.FC<MobileFirstLayoutProps> = ({
  children,
  className = '',
  containerType = 'contained',
  padding = 'medium'
}) => {
  
  const containerClasses = {
    full: 'w-full max-w-none',
    contained: 'container-responsive',
    narrow: 'container-responsive max-w-4xl'
  };

  const paddingClasses = {
    none: '',
    small: 'p-4 md:p-6',
    medium: 'p-4 md:p-6 lg:p-8',
    large: 'p-6 md:p-8 lg:p-12'
  };

  return (
    <div className={cn(
      'min-h-screen w-full overflow-x-hidden',
      'bg-background text-foreground',
      className
    )}>
      <div className={cn(
        containerClasses[containerType],
        paddingClasses[padding],
        'mx-auto'
      )}>
        {children}
      </div>
    </div>
  );
};

export default MobileFirstLayout;