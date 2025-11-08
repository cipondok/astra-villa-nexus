import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { createCacheUtils } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, User, Database, HardDrive, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { clearCache: clearServiceWorkerCache, getCacheSize } = useServiceWorker();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isLoadingCache, setIsLoadingCache] = useState(true);
  const [cacheStats, setCacheStats] = useState<{
    swCacheSize: number;
    swCacheMB: number;
    swAvailableMB: number;
    swUsagePercent: number;
    queryCacheCount: number;
    queryCacheActive: number;
    queryCacheStale: number;
  } | null>(null);

  const loadCacheStats = async () => {
    setIsLoadingCache(true);
    try {
      // Get Service Worker cache size
      const swSize = await getCacheSize();
      
      // Get React Query cache stats
      const cacheUtils = createCacheUtils(queryClient);
      const queryStats = cacheUtils.getCacheStats();
      
      setCacheStats({
        swCacheSize: swSize?.used || 0,
        swCacheMB: swSize?.usedMB || 0,
        swAvailableMB: swSize?.availableMB || 0,
        swUsagePercent: swSize ? ((swSize.used / swSize.available) * 100) : 0,
        queryCacheCount: queryStats.totalQueries,
        queryCacheActive: queryStats.activeCaches,
        queryCacheStale: queryStats.staleCaches,
      });
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    } finally {
      setIsLoadingCache(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCacheStats();
    }
  }, [user]);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      // Clear React Query cache
      const cacheUtils = createCacheUtils(queryClient);
      cacheUtils.clearAll();
      
      // Clear Service Worker cache
      await clearServiceWorkerCache();
      
      toast({
        title: "Cache Cleared",
        description: "All caches have been cleared successfully.",
      });
      
      setShowClearCacheDialog(false);
      
      // Reload cache stats after clearing
      setTimeout(() => loadCacheStats(), 1000);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast({
        title: "Error",
        description: "Failed to clear cache. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to access settings
          </p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/profile')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <p className="font-medium">{profile?.full_name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Role:</span>
                <p className="font-medium capitalize">{profile?.role || 'User'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cache Management</CardTitle>
                  <CardDescription>
                    Clear app cache to free up space and resolve loading issues
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={loadCacheStats}
                  disabled={isLoadingCache}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingCache ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingCache ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading cache statistics...
                </div>
              ) : cacheStats ? (
                <>
                  {/* Service Worker Cache */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-semibold">Service Worker Cache</h3>
                          <p className="text-sm text-muted-foreground">
                            {cacheStats.swCacheMB.toFixed(2)} MB used of {cacheStats.swAvailableMB.toFixed(0)} MB
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {cacheStats.swUsagePercent.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={cacheStats.swUsagePercent} className="h-2" />
                  </div>

                  {/* React Query Cache */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">React Query Cache</h3>
                        <p className="text-sm text-muted-foreground">
                          {cacheStats.queryCacheCount} cached queries
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-lg border bg-card p-3">
                        <div className="text-2xl font-bold text-primary">
                          {cacheStats.queryCacheCount}
                        </div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <div className="rounded-lg border bg-card p-3">
                        <div className="text-2xl font-bold text-green-600">
                          {cacheStats.queryCacheActive}
                        </div>
                        <div className="text-xs text-muted-foreground">Active</div>
                      </div>
                      <div className="rounded-lg border bg-card p-3">
                        <div className="text-2xl font-bold text-amber-600">
                          {cacheStats.queryCacheStale}
                        </div>
                        <div className="text-xs text-muted-foreground">Stale</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="destructive"
                      className="w-full justify-start gap-2"
                      onClick={() => setShowClearCacheDialog(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All Caches
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Failed to load cache statistics
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Caches?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear both Service Worker and React Query caches. The app will reload after clearing. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCache}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? "Clearing..." : "Clear Cache"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
