import { useEffect, useState } from 'react';
import { useConnectionSpeed } from '@/hooks/useConnectionSpeed';
import { WifiOff, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataSaverToggle } from '@/components/DataSaverToggle';

interface NetworkStatusIndicatorProps {
  className?: string;
  onStatusChange?: (isOnline: boolean) => void;
}

export const NetworkStatusIndicator = ({ className, onStatusChange }: NetworkStatusIndicatorProps) => {
  const { speed, isSlowConnection, downloadSpeed } = useConnectionSpeed();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const shouldShow = speed === 'offline' || (isSlowConnection && speed === 'slow');
    setShowBanner(shouldShow);
    
    if (speed === 'slow' && isSlowConnection) {
      const timer = setTimeout(() => setDismissed(true), 6000);
      return () => clearTimeout(timer);
    } else {
      setDismissed(false);
    }
    
    if (onStatusChange) {
      onStatusChange(speed !== 'offline');
    }
  }, [speed, isSlowConnection, onStatusChange]);

  if (speed === 'offline') {
    // show offline
  } else if (!showBanner || dismissed || speed === 'fast') {
    return null;
  }

  return (
    <div className={cn(
      "fixed top-12 left-1/2 -translate-x-1/2 z-40 w-auto max-w-sm animate-in slide-in-from-top duration-300",
      className
    )}>
      {speed === 'offline' ? (
        <Alert variant="destructive" className="rounded-xl border shadow-lg backdrop-blur-sm bg-destructive/90">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-3">
            <span className="font-medium text-sm">You're offline</span>
          </AlertDescription>
        </Alert>
      ) : speed === 'slow' && isSlowConnection ? (
        <Alert className="rounded-xl border shadow-lg backdrop-blur-sm bg-card/90 border-chart-3/30">
          <AlertTriangle className="h-3.5 w-3.5 text-chart-3" />
          <AlertDescription className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-foreground text-xs">
              <span>Slow connection</span>
              {downloadSpeed && (
                <span className="opacity-60">{downloadSpeed.toFixed(1)} Mbps</span>
              )}
              <button onClick={() => setDismissed(true)} className="ml-auto p-0.5 hover:bg-muted rounded">
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            <DataSaverToggle compact />
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
};
