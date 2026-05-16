import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { useQueryClient } from '@tanstack/react-query';
import { createCacheUtils } from '@/lib/queryClient';
import { 
  Zap, 
  HardDrive, 
  Wifi, 
  RefreshCw, 
  Trash2, 
  Download,
  Activity,
  Clock,
  Globe
} from 'lucide-react';

const PerformanceMonitor = () => {
  const queryClient = useQueryClient();
  const cacheUtils = createCacheUtils(queryClient);
  
  const {
    isSupported,
    isRegistered,
    isOnline,
    updateAvailable,
    clearCache,
    getCacheSize,
    requestPersistentStorage,
    updateApp,
  } = useServiceWorker();

  const [cacheSize, setCacheSize] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    const size = await getCacheSize();
    setCacheSize(size);

    const stats = cacheUtils.getCacheStats();
    setCacheStats(stats);

    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      setPerformanceMetrics({
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        totalLoadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      });
    }
  };

  const handleClearAllCaches = async () => {
    await clearCache();
    cacheUtils.clearAll();
    await loadPerformanceData();
  };

  const getPerformanceScore = () => {
    if (!performanceMetrics) return 0;
    const { firstContentfulPaint, totalLoadTime } = performanceMetrics;
    let score = 100;
    if (firstContentfulPaint > 3000) score -= 30;
    else if (firstContentfulPaint > 1800) score -= 15;
    if (totalLoadTime > 5000) score -= 30;
    else if (totalLoadTime > 3000) score -= 15;
    return Math.max(score, 0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-primary';
    if (score >= 70) return 'text-secondary-foreground';
    return 'text-destructive';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-secondary text-secondary-foreground shadow-sm">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Performance Monitor</h1>
              <p className="text-[10px] text-muted-foreground">Monitor app performance, cache usage, and optimizations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {updateAvailable && (
              <Button onClick={updateApp} size="sm" className="h-7 text-[10px]">
                <Download className="h-3 w-3 mr-1" />
                Update
              </Button>
            )}
            <Button onClick={loadPerformanceData} variant="outline" size="sm" className="h-7 text-[10px]">
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Performance Score */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <Zap className="h-3 w-3 text-primary" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold">
              <span className={getScoreColor(getPerformanceScore())}>
                {getPerformanceScore()}
              </span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
            <div className="flex-1">
              <Progress value={getPerformanceScore()} className="h-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Card className="border border-border/40">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-primary" />
              <span className="text-[9px] text-muted-foreground">First Paint</span>
            </div>
            <div className="text-sm font-bold mt-1">
              {performanceMetrics ? `${Math.round(performanceMetrics.firstPaint)}ms` : '--'}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-[9px] text-muted-foreground">Contentful Paint</span>
            </div>
            <div className="text-sm font-bold mt-1">
              {performanceMetrics ? `${Math.round(performanceMetrics.firstContentfulPaint)}ms` : '--'}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-primary" />
              <span className="text-[9px] text-muted-foreground">DOM Ready</span>
            </div>
            <div className="text-sm font-bold mt-1">
              {performanceMetrics ? `${performanceMetrics.domContentLoaded}ms` : '--'}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-[9px] text-muted-foreground">Total Load</span>
            </div>
            <div className="text-sm font-bold mt-1">
              {performanceMetrics ? `${Math.round(performanceMetrics.totalLoadTime / 1000)}s` : '--'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Worker & Cache */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="border-l-4 border-l-accent">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-xs">
              <Wifi className="h-3.5 w-3.5" />
              Service Worker
            </CardTitle>
            <CardDescription className="text-[10px]">Offline capabilities</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[9px]">Support:</span>
                <Badge variant={isSupported ? "default" : "destructive"} className="text-[8px] px-1 py-0 h-4">
                  {isSupported ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px]">Active:</span>
                <Badge variant={isRegistered ? "default" : "destructive"} className="text-[8px] px-1 py-0 h-4">
                  {isRegistered ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px]">Online:</span>
                <Badge variant={isOnline ? "default" : "destructive"} className="text-[8px] px-1 py-0 h-4">
                  {isOnline ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-xs">
              <HardDrive className="h-3.5 w-3.5" />
              Storage
            </CardTitle>
            <CardDescription className="text-[10px]">Cache usage</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {cacheSize ? (
              <>
                <div className="flex justify-between items-center text-[10px]">
                  <span>Used:</span>
                  <span className="font-mono">{formatBytes(cacheSize.used)}</span>
                </div>
                <Progress value={(cacheSize.used / cacheSize.available) * 100} className="h-1" />
                <div className="flex gap-2">
                  <Button onClick={requestPersistentStorage} variant="outline" size="sm" className="flex-1 h-6 text-[9px]">
                    Persist
                  </Button>
                  <Button onClick={handleClearAllCaches} variant="outline" size="sm" className="flex-1 h-6 text-[9px]">
                    <Trash2 className="h-2.5 w-2.5 mr-1" />
                    Clear
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-[10px] text-muted-foreground">Not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Query Cache */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-xs">
            <Activity className="h-3.5 w-3.5" />
            Query Cache Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {cacheStats && (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-lg font-bold">{cacheStats.totalQueries}</div>
                <div className="text-[8px] text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold">{cacheStats.activeCaches}</div>
                <div className="text-[8px] text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-lg font-bold">{cacheStats.staleCaches}</div>
                <div className="text-[8px] text-muted-foreground">Stale</div>
              </div>
              <div>
                <div className="text-lg font-bold text-destructive">{cacheStats.errorCaches}</div>
                <div className="text-[8px] text-muted-foreground">Errors</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;
