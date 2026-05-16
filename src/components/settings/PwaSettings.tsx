import { useState } from 'react';
import { useDataSaver } from '@/contexts/DataSaverContext';
import { useConnectionSpeed } from '@/hooks/useConnectionSpeed';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Zap,
  Wifi,
  WifiOff,
  HardDrive,
  Download,
  Trash2,
  RefreshCw,
  Image,
  Globe,
  Signal,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const PwaSettings = () => {
  const { isDataSaver, manualOverride, toggleDataSaver, connectionSpeed, imageQuality, maxImageWidth } = useDataSaver();
  const { speed, downloadSpeed, isSlowConnection } = useConnectionSpeed();
  const { isSupported, isRegistered, isOnline, clearCache, getCacheSize } = useServiceWorker();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{ usedMB: number; availableMB: number; percent: number } | null>(null);
  const [loadingCache, setLoadingCache] = useState(false);

  const loadCacheInfo = async () => {
    setLoadingCache(true);
    try {
      const size = await getCacheSize();
      if (size) {
        setCacheInfo({
          usedMB: size.usedMB,
          availableMB: size.availableMB,
          percent: (size.used / size.available) * 100,
        });
      }
    } catch {
      // ignore
    } finally {
      setLoadingCache(false);
    }
  };

  const handleClearOfflineCache = async () => {
    setIsClearing(true);
    try {
      await clearCache();
      toast({ title: 'Offline cache cleared', description: 'Cached pages and assets have been removed.' });
      setTimeout(loadCacheInfo, 500);
    } catch {
      toast({ title: 'Error', description: 'Failed to clear cache.', variant: 'destructive' });
    } finally {
      setIsClearing(false);
    }
  };

  const connectionLabel = {
    fast: 'Fast',
    slow: 'Slow',
    offline: 'Offline',
    checking: 'Checking…',
  }[speed];

  const connectionColor = {
    fast: 'text-chart-1',
    slow: 'text-chart-3',
    offline: 'text-destructive',
    checking: 'text-muted-foreground',
  }[speed];

  const ConnectionIcon = speed === 'offline' ? WifiOff : speed === 'slow' ? AlertTriangle : Wifi;

  const dataSaverLabel = manualOverride === null
    ? 'Auto (based on connection)'
    : manualOverride
      ? 'Manually enabled'
      : 'Manually disabled';

  return (
    <div className="space-y-3">
      {/* Connection Status */}
      <div>
        <h3 className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
          <Signal className="h-3.5 w-3.5 text-primary" />
          Connection Status
        </h3>
        <div className="p-2 rounded-lg bg-muted/30 border border-border/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ConnectionIcon className={`h-3.5 w-3.5 ${connectionColor}`} />
              <span className={`text-xs font-medium ${connectionColor}`}>{connectionLabel}</span>
            </div>
            {downloadSpeed != null && (
              <span className="text-[10px] text-muted-foreground">{downloadSpeed.toFixed(1)} Mbps</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <CheckCircle2 className="h-3 w-3 text-chart-1" />
            ) : (
              <WifiOff className="h-3 w-3 text-destructive" />
            )}
            <span className="text-[10px] text-muted-foreground">
              {isOnline ? 'Online' : 'Offline'} · PWA {isRegistered ? 'Active' : isSupported ? 'Registering' : 'Not supported'}
            </span>
          </div>
        </div>
      </div>

      {/* Data Saver Mode */}
      <div>
        <h3 className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-chart-3" />
          Data Saver Mode
        </h3>
        <div className="p-2 rounded-lg bg-muted/30 border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Enable Data Saver</p>
              <p className="text-[10px] text-muted-foreground">{dataSaverLabel}</p>
            </div>
            <Switch
              checked={isDataSaver}
              onCheckedChange={toggleDataSaver}
              aria-label="Toggle data saver mode"
              className="data-[state=checked]:bg-chart-3"
            />
          </div>

          {isDataSaver && (
            <div className="space-y-1 pt-1 border-t border-border/30">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Active optimizations</p>
              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-background border border-border/40">
                  <Image className="h-3 w-3 text-chart-3" />
                  <div>
                    <p className="text-[10px] font-medium">Images</p>
                    <p className="text-[9px] text-muted-foreground">{maxImageWidth}px · {imageQuality}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-background border border-border/40">
                  <Globe className="h-3 w-3 text-chart-3" />
                  <div>
                    <p className="text-[10px] font-medium">API Cache</p>
                    <p className="text-[9px] text-muted-foreground">Extended 30min</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Offline & Cache */}
      <div>
        <h3 className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
          <Download className="h-3.5 w-3.5 text-primary" />
          Offline & Cache
        </h3>
        <div className="p-2 rounded-lg bg-muted/30 border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Offline Mode</p>
              <p className="text-[10px] text-muted-foreground">Previously visited pages available offline</p>
            </div>
            <div className="flex items-center gap-1">
              {isRegistered ? (
                <span className="text-[10px] font-medium text-chart-1 bg-chart-1/10 px-1.5 py-0.5 rounded">Active</span>
              ) : (
                <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Off</span>
              )}
            </div>
          </div>

          {/* Cache size */}
          {cacheInfo ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-medium">Cached Data</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{cacheInfo.usedMB.toFixed(1)}MB / {cacheInfo.availableMB.toFixed(0)}MB</span>
              </div>
              <Progress value={cacheInfo.percent} className="h-1.5" />
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={loadCacheInfo}
              disabled={loadingCache}
              className="h-6 text-[10px] w-full"
            >
              {loadingCache ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <HardDrive className="h-3 w-3 mr-1" />
              )}
              Check Storage Usage
            </Button>
          )}

          {/* Clear cache */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearOfflineCache}
            disabled={isClearing || !isRegistered}
            className="h-7 text-[10px] w-full border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            {isClearing ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3 mr-1" />
            )}
            Clear Offline Cache
          </Button>
        </div>
      </div>
    </div>
  );
};
