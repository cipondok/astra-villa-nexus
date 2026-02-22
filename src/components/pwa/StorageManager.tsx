import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HardDrive, Trash2, RefreshCw, Shield, Database } from 'lucide-react';
import { usePWAEnhanced } from '@/hooks/usePWAEnhanced';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StorageManagerProps {
  className?: string;
}

/**
 * Storage Manager Component
 * Displays cache usage and management options
 */
const StorageManager: React.FC<StorageManagerProps> = ({ className }) => {
  const { 
    cacheInfo, 
    clearCache, 
    cleanupCaches, 
    requestPersistentStorage,
    refreshCacheInfo 
  } = usePWAEnhanced();
  
  const [isPersistent, setIsPersistent] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Check if storage is persistent
    const checkPersistence = async () => {
      if ('storage' in navigator && 'persisted' in navigator.storage) {
        const persisted = await navigator.storage.persisted();
        setIsPersistent(persisted);
      }
    };
    checkPersistence();
  }, []);

  const handleClearCache = async () => {
    setIsClearing(true);
    await clearCache();
    await refreshCacheInfo();
    setIsClearing(false);
  };

  const handleCleanup = async () => {
    await cleanupCaches();
    await refreshCacheInfo();
  };

  const handleRequestPersistence = async () => {
    const result = await requestPersistentStorage();
    setIsPersistent(result);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <HardDrive className="h-5 w-5" />
          Storage Management
        </CardTitle>
        <CardDescription>
          Manage cached data for offline access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cache Usage</span>
            <span className="font-medium">
              {cacheInfo ? `${cacheInfo.usedMB} MB` : 'Loading...'}
            </span>
          </div>
          <Progress 
            value={cacheInfo?.percentUsed || 0} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {cacheInfo 
              ? `${formatBytes(cacheInfo.used)} of ${formatBytes(cacheInfo.quota)} used (${cacheInfo.percentUsed}%)`
              : 'Calculating storage usage...'
            }
          </p>
        </div>

        {/* Persistence Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${isPersistent ? 'bg-chart-1/10' : 'bg-chart-3/10'}`}>
               <Shield className={`h-4 w-4 ${isPersistent ? 'text-chart-1' : 'text-chart-3'}`} />
            </div>
            <div>
              <p className="font-medium text-sm">Persistent Storage</p>
              <p className="text-xs text-muted-foreground">
                {isPersistent 
                  ? 'Your data is protected' 
                  : 'Data may be cleared by the browser'
                }
              </p>
            </div>
          </div>
          {!isPersistent && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleRequestPersistence}
            >
              Enable
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="grid gap-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleCleanup}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clean Up Expired Cache
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                disabled={isClearing}
              >
                {isClearing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Clear All Cached Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Cache?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all cached properties, images, and offline data. 
                  You'll need to be online to load content again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearCache}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear Cache
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Cache Details */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Cache Information
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-muted/50">
              <p className="text-muted-foreground">Static Assets</p>
              <p className="font-medium">Core app files</p>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <p className="text-muted-foreground">Property Data</p>
              <p className="font-medium">Listings & details</p>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <p className="text-muted-foreground">Images</p>
              <p className="font-medium">Property photos</p>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <p className="text-muted-foreground">API Responses</p>
              <p className="font-medium">Search results</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageManager;
