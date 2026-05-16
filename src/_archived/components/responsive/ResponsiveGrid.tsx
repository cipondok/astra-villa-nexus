import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: 'small' | 'medium' | 'large';
  minItemWidth?: string;
}

/**
 * Responsive Grid Component
 * Uses CSS Grid with mobile-first breakpoints
 */
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'medium',
  minItemWidth = '280px'
}) => {
  
  const gapClasses = {
    small: 'gap-4',
    medium: 'gap-6',
    large: 'gap-8'
  };

  // Create responsive grid template columns
  const gridStyle = {
    '--mobile-columns': columns.mobile,
    '--tablet-columns': columns.tablet,
    '--desktop-columns': columns.desktop,
    '--min-item-width': minItemWidth
  } as React.CSSProperties;

  return (
    <div 
      className={cn(
        'grid w-full',
        // Mobile first (base)
        `grid-cols-${columns.mobile}`,
        // Tablet (601px+)
        `md:grid-cols-${columns.tablet}`,
        // Desktop (1025px+)
        `lg:grid-cols-${columns.desktop}`,
        gapClasses[gap],
        className
      )}
      style={gridStyle}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;