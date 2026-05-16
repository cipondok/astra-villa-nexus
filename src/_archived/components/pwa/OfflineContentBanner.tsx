import { WifiOff, RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineContentBannerProps {
  /** When this data was last fetched (ISO string or Date) */
  lastUpdated?: string | Date | null;
  className?: string;
}

/**
 * Inline banner shown above cached content when offline,
 * indicating stale data age to prevent trust erosion.
 */
export default function OfflineContentBanner({ lastUpdated, className }: OfflineContentBannerProps) {
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  if (!isOffline) return null;

  const getTimeAgo = () => {
    if (!lastUpdated) return 'recently';
    const diff = Date.now() - new Date(lastUpdated).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
      "bg-chart-3/10 border border-chart-3/20 text-chart-3",
      className
    )}>
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span className="font-medium">Viewing cached data</span>
      <span className="flex items-center gap-1 ml-auto text-muted-foreground">
        <Clock className="h-3 w-3" />
        Updated {getTimeAgo()}
      </span>
    </div>
  );
}
