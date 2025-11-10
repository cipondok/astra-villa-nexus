import { useEffect, useState } from 'react';
import { useConnectionSpeed } from '@/hooks/useConnectionSpeed';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NetworkStatusIndicatorProps {
  className?: string;
  onStatusChange?: (isOnline: boolean) => void;
}

export const NetworkStatusIndicator = ({ className, onStatusChange }: NetworkStatusIndicatorProps) => {
  const { speed, isSlowConnection, downloadSpeed } = useConnectionSpeed();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner when offline or slow connection
    setShowBanner(speed === 'offline' || (isSlowConnection && speed === 'slow'));
    
    // Notify parent about online status
    if (onStatusChange) {
      onStatusChange(speed !== 'offline');
    }
  }, [speed, isSlowConnection, onStatusChange]);

  if (!showBanner && speed === 'fast') {
    return null;
  }

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300", className)}>
      {speed === 'offline' ? (
        <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="font-medium">You're offline. Search is unavailable.</span>
            <span className="text-xs opacity-80">Waiting for connection...</span>
          </AlertDescription>
        </Alert>
      ) : speed === 'slow' && isSlowConnection ? (
        <Alert className="rounded-none border-x-0 border-t-0 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="flex items-center justify-between text-amber-900 dark:text-amber-100">
            <span className="font-medium">Slow connection detected</span>
            {downloadSpeed && (
              <span className="text-xs opacity-80">{downloadSpeed.toFixed(1)} Mbps</span>
            )}
          </AlertDescription>
        </Alert>
      ) : speed === 'checking' ? (
        <Alert className="rounded-none border-x-0 border-t-0 bg-muted">
          <Wifi className="h-4 w-4 animate-pulse" />
          <AlertDescription>
            <span className="text-sm">Checking connection...</span>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
};
