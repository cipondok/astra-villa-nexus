import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * Thumb Zone Layout Component
 * Optimizes content placement based on mobile ergonomics:
 * - Top zone: Display only (hard to reach)
 * - Middle zone: Scrollable content
 * - Bottom zone: Primary actions (easy thumb access)
 */

interface ThumbZoneLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode[];
  className?: string;
}

const ThumbZoneLayout: React.FC<ThumbZoneLayoutProps> = ({
  children,
  header,
  footer,
  primaryAction,
  secondaryActions,
  className,
}) => {
  return (
    <div className={cn(
      "flex flex-col min-h-[100dvh] w-full",
      "bg-background",
      className
    )}>
      {/* Top Zone - Display/Status Only */}
      {header && (
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border/30">
          {header}
        </header>
      )}

      {/* Middle Zone - Scrollable Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="pb-24">
          {children}
        </div>
      </main>

      {/* Bottom Zone - Primary Actions (Thumb Friendly) */}
      {(primaryAction || secondaryActions) && (
        <div 
          className="fixed bottom-16 left-0 right-0 z-40 p-4"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
        >
          {secondaryActions && secondaryActions.length > 0 && (
            <div className="flex gap-2 mb-3 justify-center">
              {secondaryActions.map((action, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {action}
                </motion.div>
              ))}
            </div>
          )}
          
          {primaryAction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              {primaryAction}
            </motion.div>
          )}
        </div>
      )}

      {/* Footer */}
      {footer}
    </div>
  );
};

export default ThumbZoneLayout;
