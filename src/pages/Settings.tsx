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
import { ArrowLeft, Trash2, User, Database, HardDrive, RefreshCw, Sun, Moon, Palette, Shield, Mail, Lock, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPreferences } from '@/components/settings/UserPreferences';
import { PasswordChange } from '@/components/settings/PasswordChange';
import { EmailChange } from '@/components/settings/EmailChange';
import { ActivityLog } from '@/components/settings/ActivityLog';
import { SecurityAlerts } from '@/components/settings/SecurityAlerts';
import { TwoFactorAuth } from '@/components/settings/TwoFactorAuth';
import { DeviceManagement } from '@/components/settings/DeviceManagement';

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
      <div className="max-w-4xl mx-auto px-2 py-2">
        {/* Compact Header */}
        <div className="sticky top-0 z-40 bg-gradient-to-r from-primary to-accent text-primary-foreground px-2 py-2 -mx-2 mb-2 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-primary-foreground hover:bg-white/20"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile?.full_name || 'User'}
                    className="w-7 h-7 rounded-lg object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
                <div>
                  <h1 className="text-sm font-bold">Settings</h1>
                  <p className="text-[9px] text-primary-foreground/80">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="security" className="w-full">
          <div className="overflow-x-auto -mx-2 px-2 pb-1">
            <TabsList className="inline-flex w-max min-w-full sm:flex sm:w-full h-9 sm:h-10 mb-3 bg-muted/60 dark:bg-muted/40 p-1 rounded-lg gap-0.5 border border-border/50">
              <TabsTrigger value="security" className="flex-shrink-0 flex-1 min-w-fit text-[10px] sm:text-xs gap-1 px-2 sm:px-3 py-1.5 text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all">
                <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex-shrink-0 flex-1 min-w-fit text-[10px] sm:text-xs gap-1 px-2 sm:px-3 py-1.5 text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all">
                <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex-shrink-0 flex-1 min-w-fit text-[10px] sm:text-xs gap-1 px-2 sm:px-3 py-1.5 text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all">
                <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Prefs</span>
              </TabsTrigger>
              <TabsTrigger value="theme" className="flex-shrink-0 flex-1 min-w-fit text-[10px] sm:text-xs gap-1 px-2 sm:px-3 py-1.5 text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all">
                <Palette className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Theme</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-shrink-0 flex-1 min-w-fit text-[10px] sm:text-xs gap-1 px-2 sm:px-3 py-1.5 text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all">
                <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="cache" className="flex-shrink-0 flex-1 min-w-fit text-[10px] sm:text-xs gap-1 px-2 sm:px-3 py-1.5 text-foreground/70 data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all">
                <Database className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Cache</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Security Alerts Tab */}
          <TabsContent value="security" className="space-y-2">
            <Card className="professional-card border p-2">
              <SecurityAlerts />
            </Card>
            <TwoFactorAuth />
            <DeviceManagement />
          </TabsContent>

          {/* Account Tab - Email & Password */}
          <TabsContent value="account" className="space-y-0">
            <Card className="professional-card border p-2">
              <div className="space-y-2">
                <EmailChange />
                <div className="border-t pt-2">
                  <PasswordChange />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-0">
            <Card className="professional-card border p-2">
              <UserPreferences />
            </Card>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-0">
            <Card className="professional-card border p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                    theme === 'dark' ? 'bg-blue-500/10' : 'bg-yellow-500/10'
                  }`}>
                    {theme === 'dark' ? <Moon className="h-3.5 w-3.5 text-blue-400" /> : <Sun className="h-3.5 w-3.5 text-yellow-500" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{theme === 'dark' ? 'Dark' : 'Light'} Mode</p>
                    <p className="text-[10px] text-muted-foreground">{theme === 'dark' ? 'Eye comfort' : 'Bright view'}</p>
                  </div>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? 'dark' : 'light');
                    toast({ title: checked ? "Dark Mode" : "Light Mode" });
                  }}
                  className="h-5 w-9 data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-yellow-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { setTheme('light'); toast({ title: "Light Mode" }); }}
                  className={`p-2 rounded-md border transition-all ${
                    theme === 'light' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : 'border-border bg-muted/30'
                  }`}
                >
                  <Sun className={`h-4 w-4 mx-auto ${theme === 'light' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                  <p className="text-[10px] font-medium mt-0.5">Light</p>
                </button>
                <button
                  onClick={() => { setTheme('dark'); toast({ title: "Dark Mode" }); }}
                  className={`p-2 rounded-md border transition-all ${
                    theme === 'dark' ? 'border-blue-500 bg-blue-950/20' : 'border-border bg-muted/30'
                  }`}
                >
                  <Moon className={`h-4 w-4 mx-auto ${theme === 'dark' ? 'text-blue-400' : 'text-muted-foreground'}`} />
                  <p className="text-[10px] font-medium mt-0.5">Dark</p>
                </button>
              </div>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-0">
            <Card className="professional-card border p-2">
              <ActivityLog />
            </Card>
          </TabsContent>

          {/* Cache Management Tab */}
          <TabsContent value="cache" className="space-y-0">
            <Card className="professional-card border p-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-semibold">Cache</span>
                </div>
                <Button variant="ghost" size="icon" onClick={loadCacheStats} disabled={isLoadingCache} className="h-5 w-5">
                  <RefreshCw className={`h-3 w-3 ${isLoadingCache ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {isLoadingCache ? (
                <div className="flex items-center justify-center py-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary"></div>
                  <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
                </div>
              ) : cacheStats ? (
                <div className="space-y-1.5">
                  {/* SW Cache */}
                  <div className="p-1.5 rounded-md bg-muted/30 border">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <HardDrive className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-medium">Service Worker</span>
                      </div>
                      <span className="text-[10px] font-bold text-primary">{cacheStats.swUsagePercent.toFixed(0)}%</span>
                    </div>
                    <Progress value={cacheStats.swUsagePercent} className="h-1.5" />
                    <p className="text-[9px] text-muted-foreground mt-0.5">{cacheStats.swCacheMB.toFixed(1)}MB / {cacheStats.swAvailableMB.toFixed(0)}MB</p>
                  </div>

                  {/* Query Cache */}
                  <div className="p-1.5 rounded-md bg-muted/30 border">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Database className="h-3 w-3 text-accent" />
                      <span className="text-[10px] font-medium">Query Cache</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div className="p-1 rounded bg-background border">
                        <p className="text-sm font-bold text-primary">{cacheStats.queryCacheCount}</p>
                        <p className="text-[8px] text-muted-foreground">Total</p>
                      </div>
                      <div className="p-1 rounded bg-background border">
                        <p className="text-sm font-bold text-green-500">{cacheStats.queryCacheActive}</p>
                        <p className="text-[8px] text-muted-foreground">Active</p>
                      </div>
                      <div className="p-1 rounded bg-background border">
                        <p className="text-sm font-bold text-amber-500">{cacheStats.queryCacheStale}</p>
                        <p className="text-[8px] text-muted-foreground">Stale</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-1">
                    <Button variant="outline" size="sm" onClick={() => openClearCacheDialog('sw')} className="h-6 text-[9px] px-1">
                      <HardDrive className="h-2.5 w-2.5 mr-0.5" />SW
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openClearCacheDialog('query')} className="h-6 text-[9px] px-1">
                      <Database className="h-2.5 w-2.5 mr-0.5" />Query
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => openClearCacheDialog('all')} className="h-6 text-[9px] px-1">
                      <Trash2 className="h-2.5 w-2.5 mr-0.5" />All
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-[10px] text-muted-foreground">Failed to load</p>
                  <Button onClick={loadCacheStats} variant="outline" size="sm" className="mt-1 h-5 text-[9px]">Retry</Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
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
