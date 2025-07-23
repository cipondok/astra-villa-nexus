import React from 'react';
import { cn } from '@/lib/utils';
import ResponsiveWebLayout from './ResponsiveWebLayout';
import WebPerformanceOptimizer from './WebPerformanceOptimizer';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MobileOptimizedLayout = ({ children, className }: MobileOptimizedLayoutProps) => {
  return (
    <WebPerformanceOptimizer>
      <ResponsiveWebLayout className={className}>
        {children}
      </ResponsiveWebLayout>
    </WebPerformanceOptimizer>
  );
};

export default MobileOptimizedLayout;