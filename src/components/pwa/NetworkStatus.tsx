import React from 'react';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { usePWAEnhanced } from '@/hooks/usePWAEnhanced';
import { cn } from '@/lib/utils';

interface NetworkStatusProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * Network status indicator component
 * Shows online/offline status with sync queue info
 */
const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  className,
  showDetails = false 
}) => {
  const { isOnline, syncQueueLength } = usePWAEnhanced();

  return (
    <div 
      className={cn(
        "flex items-center gap-2 text-sm",
        className
      )}
    >
      {isOnline ? (
        <>
          <div className="flex items-center gap-1.5 text-chart-1">
            <Wifi className="h-4 w-4" />
            {showDetails && <span>Online</span>}
          </div>
          {syncQueueLength > 0 && (
            <div className="flex items-center gap-1 text-chart-3">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span className="text-xs">{syncQueueLength} syncing</span>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-1.5 text-destructive">
          <WifiOff className="h-4 w-4" />
          {showDetails && <span>Offline</span>}
          {syncQueueLength > 0 && (
            <span className="text-xs text-muted-foreground">
              ({syncQueueLength} pending)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Floating network status banner
 * Shows at top of screen when offline
 */
export const NetworkStatusBanner: React.FC = () => {
  const { isOnline, syncQueueLength } = usePWAEnhanced();

  if (isOnline && syncQueueLength === 0) return null;

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium transition-all",
        isOnline 
          ? "bg-chart-3 text-primary-foreground" 
          : "bg-destructive text-destructive-foreground"
      )}
    >
      {isOnline ? (
        <div className="flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Syncing {syncQueueLength} pending action(s)...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <CloudOff className="h-4 w-4" />
          <span>
            You're offline
            {syncQueueLength > 0 && ` • ${syncQueueLength} action(s) will sync when online`}
          </span>
        </div>
      )}
    </div>
  );
};

export default NetworkStatus;
