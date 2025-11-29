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
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-7 mb-3 bg-muted/50 p-0.5">
            <TabsTrigger value="security" className="text-[10px] gap-0.5 px-0.5 py-1 data-[state=active]:bg-background h-6">
              <Shield className="h-3 w-3" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="text-[10px] gap-0.5 px-0.5 py-1 data-[state=active]:bg-background h-6">
              <Mail className="h-3 w-3" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-[10px] gap-0.5 px-0.5 py-1 data-[state=active]:bg-background h-6">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="text-[10px] gap-0.5 px-0.5 py-1 data-[state=active]:bg-background h-6">
              <Palette className="h-3 w-3" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-[10px] gap-0.5 px-0.5 py-1 data-[state=active]:bg-background h-6">
              <Activity className="h-3 w-3" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="cache" className="text-[10px] gap-0.5 px-0.5 py-1 data-[state=active]:bg-background h-6">
              <Database className="h-3 w-3" />
              <span className="hidden sm:inline">Cache</span>
            </TabsTrigger>
          </TabsList>

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
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/30 dark:border-purple-500/20">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500 flex-shrink-0 ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 rotate-0' 
                        : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rotate-180'
                    }`}>
                      {theme === 'dark' ? (
                        <Moon className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Sun className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-sm">
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {theme === 'dark' ? 'Easy on the eyes' : 'Bright interface'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => {
                      setTheme(checked ? 'dark' : 'light');
                      toast({
                        title: checked ? "Dark Mode" : "Light Mode",
                        description: checked ? "Dark theme enabled" : "Light theme enabled",
                      });
                    }}
                    className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-yellow-500 flex-shrink-0"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setTheme('light');
                      toast({ title: "Light Mode", description: "Theme changed to light mode" });
                    }}
                    className={`p-2.5 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                      theme === 'light'
                        ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg'
                        : 'border-border bg-card hover:border-yellow-300'
                    }`}
                  >
                    <Sun className={`h-4 w-4 mx-auto mb-1 ${theme === 'light' ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                    <p className={`text-xs font-semibold ${theme === 'light' ? 'text-yellow-700' : 'text-muted-foreground'}`}>Light</p>
                  </button>
                  
                  <button
                    onClick={() => {
                      setTheme('dark');
                      toast({ title: "Dark Mode", description: "Theme changed to dark mode" });
                    }}
                    className={`p-2.5 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-gradient-to-br from-blue-950 to-purple-950 shadow-lg'
                        : 'border-border bg-card hover:border-blue-300'
                    }`}
                  >
                    <Moon className={`h-4 w-4 mx-auto mb-1 ${theme === 'dark' ? 'text-blue-400' : 'text-muted-foreground'}`} />
                    <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-muted-foreground'}`}>Dark</p>
                  </button>
                </div>
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
            <Card className="professional-card border overflow-hidden p-2">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-accent via-primary to-accent"></div>
              <CardHeader className="pb-1 px-2 pt-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center">
                      <HardDrive className="h-2.5 w-2.5 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-xs">Cache Management</CardTitle>
                      <CardDescription className="text-[10px]">Storage & performance</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={loadCacheStats}
                    disabled={isLoadingCache}
                    className="h-6 w-6 rounded-lg hover:bg-primary/10 hover:border-primary/30 transition-all"
                  >
                    <RefreshCw className={`h-2.5 w-2.5 text-primary ${isLoadingCache ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-2 pb-1.5">
                {isLoadingCache ? (
                  <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-primary/20 border-t-primary mb-2"></div>
                    <p className="text-muted-foreground text-xs">Loading...</p>
                  </div>
                ) : cacheStats ? (
                  <>
                    {/* Service Worker Cache */}
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                            <HardDrive className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-xs">Service Worker</h3>
                            <p className="text-xs text-muted-foreground">
                              {cacheStats.swCacheMB.toFixed(1)} MB / {cacheStats.swAvailableMB.toFixed(0)} MB
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-primary">
                            {cacheStats.swUsagePercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    <Progress value={cacheStats.swUsagePercent} className="h-3 bg-background" />
                  </div>

                  {/* React Query Cache */}
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Database className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-xs">React Query</h3>
                        <p className="text-xs text-muted-foreground">
                          {cacheStats.queryCacheCount} queries
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="rounded-lg border border-primary/20 bg-card p-2 text-center">
                        <div className="text-lg font-bold text-primary">
                          {cacheStats.queryCacheCount}
                        </div>
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase">Total</div>
                      </div>
                      <div className="rounded-lg border border-green-500/20 bg-card p-2 text-center">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {cacheStats.queryCacheActive}
                        </div>
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase">Active</div>
                      </div>
                      <div className="rounded-lg border border-amber-500/20 bg-card p-2 text-center">
                        <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                          {cacheStats.queryCacheStale}
                        </div>
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase">Stale</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1 space-y-1.5">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-8 text-xs hover:bg-primary/5 hover:border-primary/30"
                      onClick={() => openClearCacheDialog('sw')}
                    >
                      <HardDrive className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold">Clear SW Cache</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-8 text-xs hover:bg-accent/5 hover:border-accent/30"
                      onClick={() => openClearCacheDialog('query')}
                    >
                      <Database className="h-3.5 w-3.5 text-accent" />
                      <span className="font-semibold">Clear Query Cache</span>
                    </Button>
                    
                    <Button
                      variant="destructive"
                      className="w-full justify-start gap-2 h-8 text-xs"
                      onClick={() => openClearCacheDialog('all')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="font-semibold">Clear All</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Database className="h-6 w-6 text-destructive" />
                  </div>
                  <p className="text-muted-foreground text-xs">Failed to load cache statistics</p>
                  <Button 
                    onClick={loadCacheStats} 
                    variant="outline" 
                    className="mt-2 h-7 text-xs"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </CardContent>
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
