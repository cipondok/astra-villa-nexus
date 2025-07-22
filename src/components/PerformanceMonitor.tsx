import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { cacheUtils } from '@/lib/queryClient';
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
    const interval = setInterval(loadPerformanceData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    // Get cache size
    const size = await getCacheSize();
    setCacheSize(size);

    // Get React Query cache stats
    const stats = cacheUtils.getCacheStats();
    setCacheStats(stats);

    // Get performance metrics
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
    
    // Simple scoring based on Core Web Vitals thresholds
    let score = 100;
    
    // FCP scoring (good: <1.8s, poor: >3s)
    if (firstContentfulPaint > 3000) score -= 30;
    else if (firstContentfulPaint > 1800) score -= 15;
    
    // Total load time scoring (good: <3s, poor: >5s)
    if (totalLoadTime > 5000) score -= 30;
    else if (totalLoadTime > 3000) score -= 15;
    
    return Math.max(score, 0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Performance Monitor</h2>
          <p className="text-gray-400">Monitor app performance, cache usage, and optimizations</p>
        </div>
        <div className="flex items-center gap-2">
          {updateAvailable && (
            <Button onClick={updateApp} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Update Available
            </Button>
          )}
          <Button onClick={loadPerformanceData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Score
          </CardTitle>
          <CardDescription>Overall application performance rating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">
              <span className={getScoreColor(getPerformanceScore())}>
                {getPerformanceScore()}
              </span>
              <span className="text-xl text-gray-500">/100</span>
            </div>
            <div className="flex-1">
              <Progress value={getPerformanceScore()} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              First Paint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics ? `${Math.round(performanceMetrics.firstPaint)}ms` : 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">Time to first pixel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Contentful Paint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics ? `${Math.round(performanceMetrics.firstContentfulPaint)}ms` : 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">Time to meaningful content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              DOM Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics ? `${performanceMetrics.domContentLoaded}ms` : 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">DOM content loaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Total Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics ? `${Math.round(performanceMetrics.totalLoadTime / 1000)}s` : 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">Complete page load</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Worker Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Service Worker Status
          </CardTitle>
          <CardDescription>Offline capabilities and caching status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Support:</span>
              <Badge variant={isSupported ? "default" : "destructive"}>
                {isSupported ? 'Supported' : 'Not Supported'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Registration:</span>
              <Badge variant={isRegistered ? "default" : "destructive"}>
                {isRegistered ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Connection:</span>
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Usage
            </CardTitle>
            <CardDescription>Browser storage and cache usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cacheSize && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Used Storage:</span>
                  <span className="font-mono">{formatBytes(cacheSize.used)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Available:</span>
                  <span className="font-mono">{formatBytes(cacheSize.available)}</span>
                </div>
                <Progress 
                  value={(cacheSize.used / cacheSize.available) * 100} 
                  className="h-2"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={requestPersistentStorage} 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    Request Persistent Storage
                  </Button>
                  <Button 
                    onClick={handleClearAllCaches} 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                </div>
              </>
            )}
            {!cacheSize && (
              <p className="text-sm text-gray-500">Storage information not available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Query Cache Stats
            </CardTitle>
            <CardDescription>React Query cache statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cacheStats && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{cacheStats.totalQueries}</div>
                    <div className="text-xs text-gray-500">Total Queries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{cacheStats.activeCaches}</div>
                    <div className="text-xs text-gray-500">Active Caches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{cacheStats.staleCaches}</div>
                    <div className="text-xs text-gray-500">Stale Caches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{cacheStats.errorCaches}</div>
                    <div className="text-xs text-gray-500">Error Caches</div>
                  </div>
                </div>
                <Button 
                  onClick={() => cacheUtils.clearAll()} 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  Clear Query Cache
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceMonitor;