import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  items: T[];
  estimateSize?: number;
  overscan?: number;
  maxHeight?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

/**
 * Generic virtual list component. Only renders visible rows — ideal for
 * large datasets (1 000+ items) where rendering all DOM nodes causes lag.
 */
export function VirtualList<T>({
  items,
  estimateSize = 48,
  overscan = 5,
  maxHeight = 480,
  renderItem,
  className,
  emptyMessage = 'No items to display.',
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={className}
      style={{ height: Math.min(items.length * estimateSize, maxHeight), overflowY: 'auto' }}
    >
      <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
