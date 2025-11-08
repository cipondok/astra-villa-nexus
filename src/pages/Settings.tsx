import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { useTheme } from '@/components/ThemeProvider';
import { createCacheUtils } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
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
import { ArrowLeft, Trash2, User, Database, HardDrive, RefreshCw, Sun, Moon, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { clearCache: clearServiceWorkerCache, getCacheSize } = useServiceWorker();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [clearCacheType, setClearCacheType] = useState<'all' | 'sw' | 'query'>('all');
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
      let successMessage = '';
      
      if (clearCacheType === 'all' || clearCacheType === 'query') {
        // Clear React Query cache
        const cacheUtils = createCacheUtils(queryClient);
        cacheUtils.clearAll();
        successMessage = clearCacheType === 'query' ? 'React Query cache cleared successfully.' : '';
      }
      
      if (clearCacheType === 'all' || clearCacheType === 'sw') {
        // Clear Service Worker cache
        await clearServiceWorkerCache();
        successMessage = clearCacheType === 'sw' ? 'Service Worker cache cleared successfully.' : '';
      }
      
      if (clearCacheType === 'all') {
        successMessage = 'All caches have been cleared successfully.';
      }
      
      toast({
        title: "Cache Cleared",
        description: successMessage,
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

  const openClearCacheDialog = (type: 'all' | 'sw' | 'query') => {
    setClearCacheType(type);
    setShowClearCacheDialog(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="text-center max-w-md mx-auto professional-card">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3 gradient-text">Settings</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access your settings and preferences
          </p>
          <Button onClick={() => navigate('/auth')} size="lg" className="btn-primary">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">{/* Slim compact layout */}
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 -ml-2 hover:bg-primary/10 transition-colors"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-primary" />
            <span className="text-foreground">Back to Profile</span>
          </Button>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your preferences and cache</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Information Card */}
          <Card className="professional-card border-2 overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Account Information</CardTitle>
                  <CardDescription className="text-sm">Your profile details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</span>
                <p className="font-semibold text-foreground mt-1">{user.email}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</span>
                  <p className="font-semibold text-foreground mt-1">{profile?.full_name || 'Not set'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</span>
                  <p className="font-semibold text-foreground mt-1 capitalize">{profile?.role || 'User'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Preferences Card */}
          <Card className="professional-card border-2 overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">Appearance</CardTitle>
                  <CardDescription className="text-sm">Customize your theme preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/30 dark:border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 rotate-0' 
                        : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rotate-180'
                    }`}>
                      {theme === 'dark' ? (
                        <Moon className="h-6 w-6 text-blue-400 animate-scale-in" />
                      ) : (
                        <Sun className="h-6 w-6 text-yellow-600 animate-scale-in" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {theme === 'dark' 
                          ? 'Easy on the eyes in low light' 
                          : 'Bright and clear interface'
                        }
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => {
                      setTheme(checked ? 'dark' : 'light');
                      toast({
                        title: checked ? "Dark Mode Enabled" : "Light Mode Enabled",
                        description: checked 
                          ? "Interface switched to dark theme" 
                          : "Interface switched to light theme",
                      });
                    }}
                    className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-yellow-500"
                  />
                </div>
                
                {/* Theme Preview */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setTheme('light');
                      toast({
                        title: "Light Mode",
                        description: "Theme changed to light mode",
                      });
                    }}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                      theme === 'light'
                        ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg'
                        : 'border-border bg-card hover:border-yellow-300'
                    }`}
                  >
                    <Sun className={`h-6 w-6 mx-auto mb-2 ${
                      theme === 'light' ? 'text-yellow-600' : 'text-muted-foreground'
                    }`} />
                    <p className={`text-xs font-semibold ${
                      theme === 'light' ? 'text-yellow-700' : 'text-muted-foreground'
                    }`}>
                      Light
                    </p>
                  </button>
                  
                  <button
                    onClick={() => {
                      setTheme('dark');
                      toast({
                        title: "Dark Mode",
                        description: "Theme changed to dark mode",
                      });
                    }}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-gradient-to-br from-blue-950 to-purple-950 shadow-lg'
                        : 'border-border bg-card hover:border-blue-300'
                    }`}
                  >
                    <Moon className={`h-6 w-6 mx-auto mb-2 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-muted-foreground'
                    }`} />
                    <p className={`text-xs font-semibold ${
                      theme === 'dark' ? 'text-blue-300' : 'text-muted-foreground'
                    }`}>
                      Dark
                    </p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cache Management Card */}
          <Card className="professional-card border-2 overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <HardDrive className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Cache Management</CardTitle>
                    <CardDescription className="text-sm">
                      Clear app cache to free up space and resolve loading issues
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={loadCacheStats}
                  disabled={isLoadingCache}
                  className="rounded-lg hover:bg-primary/10 hover:border-primary/30 transition-all"
                >
                  <RefreshCw className={`h-4 w-4 text-primary ${isLoadingCache ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingCache ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary mb-4"></div>
                  <p className="text-muted-foreground font-medium">Loading cache statistics...</p>
                </div>
              ) : cacheStats ? (
                <>
                  {/* Service Worker Cache */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <HardDrive className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">Service Worker Cache</h3>
                          <p className="text-sm text-muted-foreground">
                            {cacheStats.swCacheMB.toFixed(2)} MB used of {cacheStats.swAvailableMB.toFixed(0)} MB available
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">
                          {cacheStats.swUsagePercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={cacheStats.swUsagePercent} className="h-3 bg-background" />
                  </div>

                  {/* React Query Cache */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Database className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">React Query Cache</h3>
                        <p className="text-sm text-muted-foreground">
                          {cacheStats.queryCacheCount} cached queries in memory
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border-2 border-primary/20 bg-card p-4 text-center hover:border-primary/40 transition-all">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {cacheStats.queryCacheCount}
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</div>
                      </div>
                      <div className="rounded-xl border-2 border-green-500/20 bg-card p-4 text-center hover:border-green-500/40 transition-all">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                          {cacheStats.queryCacheActive}
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active</div>
                      </div>
                      <div className="rounded-xl border-2 border-amber-500/20 bg-card p-4 text-center hover:border-amber-500/40 transition-all">
                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                          {cacheStats.queryCacheStale}
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stale</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 hover:bg-primary/5 hover:border-primary/30 transition-all"
                      onClick={() => openClearCacheDialog('sw')}
                    >
                      <HardDrive className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Clear Service Worker Cache</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 hover:bg-accent/5 hover:border-accent/30 transition-all"
                      onClick={() => openClearCacheDialog('query')}
                    >
                      <Database className="h-5 w-5 text-accent" />
                      <span className="font-semibold">Clear React Query Cache</span>
                    </Button>
                    
                    <Button
                      variant="destructive"
                      className="w-full justify-start gap-3 h-12 shadow-lg hover:shadow-xl transition-all"
                      onClick={() => openClearCacheDialog('all')}
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="font-semibold">Clear All Caches</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Database className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="text-muted-foreground font-medium">Failed to load cache statistics</p>
                  <Button 
                    onClick={loadCacheStats} 
                    variant="outline" 
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
        <AlertDialogContent className="sm:max-w-md border-2">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive via-primary to-destructive"></div>
          <AlertDialogHeader className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">
                {clearCacheType === 'all' && 'Clear All Caches?'}
                {clearCacheType === 'sw' && 'Clear Service Worker Cache?'}
                {clearCacheType === 'query' && 'Clear React Query Cache?'}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base leading-relaxed">
              {clearCacheType === 'all' && 
                'This will clear both Service Worker and React Query caches. The app will reload after clearing. This action cannot be undone.'
              }
              {clearCacheType === 'sw' && 
                'This will clear the Service Worker cache including offline assets and cached pages. The app will reload after clearing.'
              }
              {clearCacheType === 'query' && 
                'This will clear all React Query cached data. You may need to reload pages to fetch fresh data.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:space-x-2">
            <AlertDialogCancel 
              disabled={isClearing}
              className="hover:bg-muted"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCache}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cache
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
