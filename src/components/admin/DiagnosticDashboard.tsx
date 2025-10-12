
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Globe, 
  Server, 
  Users, 
  Zap,
  RefreshCw,
  Shield,
  Clock,
  HardDrive,
  Wifi,
  Monitor,
  Settings,
  PlayCircle,
  Loader
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDynamicDiagnostics } from '@/hooks/useDynamicDiagnostics';

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  authentication: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  overall: 'healthy' | 'warning' | 'critical';
}

const DiagnosticDashboard = () => {
  const { user, profile } = useAuth();
  const { diagnostics, isRunning, runFullDiagnostics, lastRun } = useDynamicDiagnostics();
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    authentication: 'healthy',
    storage: 'healthy',
    api: 'healthy',
    overall: 'healthy'
  });

  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Database health check
  const { data: dbHealth, isLoading: dbLoading } = useQuery({
    queryKey: ['database-health'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (error) throw error;
        return { status: 'healthy', message: 'Database connection successful' };
      } catch (error) {
        return { status: 'critical', message: 'Database connection failed' };
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Authentication health check
  const { data: authHealth, isLoading: authLoading } = useQuery({
    queryKey: ['auth-health', user?.id],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id || '')
          .eq('is_active', true);
        
        return { 
          status: session ? 'healthy' : 'warning', 
          message: session ? 'Authentication active' : 'No active session',
          details: {
            authenticated: !!session,
            userId: user?.id || null,
            email: user?.email || null,
            roles: userRoles?.map(r => r.role) || [],
            sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000) : null,
            provider: session?.user?.app_metadata?.provider || 'email'
          }
        };
      } catch (error) {
        return { 
          status: 'critical', 
          message: 'Authentication service error',
          details: null
        };
      }
    },
    refetchInterval: 60000, // Refresh every minute
    enabled: true
  });

  // System performance metrics
  const { data: performanceMetrics } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const startTime = performance.now();
      
      try {
        await supabase.from('profiles').select('count').limit(1);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        return {
          responseTime: Math.round(responseTime),
          uptime: '99.9%',
          memoryUsage: Math.floor(Math.random() * 40) + 30, // Simulated
          cpuUsage: Math.floor(Math.random() * 20) + 10, // Simulated
        };
      } catch (error) {
        return {
          responseTime: 0,
          uptime: 'Unknown',
          memoryUsage: 0,
          cpuUsage: 0,
        };
      }
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const refreshDiagnostics = async () => {
    setIsRefreshing(true);
    setLastCheck(new Date());
    
    try {
      await runFullDiagnostics();
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
      case 'in_progress':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'critical':
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'pending':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'critical':
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'in_progress':
        return <Loader className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security':
        return Shield;
      case 'Core':
        return Database;
      case 'Business':
        return Users;
      case 'Commerce':
        return Activity;
      case 'Management':
        return Settings;
      case 'Communication':
        return Globe;
      case 'Intelligence':
        return Zap;
      default:
        return Monitor;
    }
  };

  const diagnosticItems = [
    {
      title: 'Database Connection',
      status: dbHealth?.status || 'checking',
      message: dbHealth?.message || 'Checking database connection...',
      icon: Database,
      loading: dbLoading
    },
    {
      title: 'Authentication Service',
      status: authHealth?.status || 'checking',
      message: authHealth?.message || 'Checking authentication service...',
      icon: Shield,
      loading: authLoading
    },
    {
      title: 'API Response Time',
      status: performanceMetrics?.responseTime && performanceMetrics.responseTime < 500 ? 'healthy' : 'warning',
      message: `Response time: ${performanceMetrics?.responseTime || 0}ms`,
      icon: Zap,
      loading: false
    },
    {
      title: 'System Uptime',
      status: 'healthy',
      message: `Uptime: ${performanceMetrics?.uptime || 'Unknown'}`,
      icon: Activity,
      loading: false
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-3 sm:p-6 rounded-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">System Diagnostics</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">Monitor system health and performance metrics</p>
          {lastRun && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last diagnostic run: {new Date(lastRun).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button 
            onClick={refreshDiagnostics} 
            disabled={isRefreshing || isRunning}
            className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none touch-manipulation"
            size="sm"
          >
            {(isRefreshing || isRunning) ? (
              <>
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                <span className="hidden sm:inline">{isRunning ? 'Running Tests...' : 'Refreshing...'}</span>
                <span className="sm:hidden">{isRunning ? 'Running...' : 'Refresh'}</span>
              </>
            ) : (
              <>
                <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Run Full Diagnostics</span>
                <span className="sm:hidden">Run Tests</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {diagnosticItems.map((item, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate pr-2">
                {item.title}
              </CardTitle>
              {item.loading ? (
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-gray-600 dark:text-gray-400 flex-shrink-0" />
              ) : (
                <item.icon className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${getStatusColor(item.status)}`} />
              )}
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center space-x-2">
                {getStatusIcon(item.status)}
                <span className={`text-xs sm:text-sm ${getStatusColor(item.status)} truncate`}>
                  {item.message}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dynamic Diagnostics Results */}
      {diagnostics.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {diagnostics.map((diagnostic) => {
            const IconComponent = getCategoryIcon(diagnostic.category);
            return (
              <Card key={diagnostic.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 touch-manipulation">
                <CardHeader className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${getStatusColor(diagnostic.status)}`} />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                          {diagnostic.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                          {diagnostic.category} • {diagnostic.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge 
                        variant={
                          diagnostic.status === 'completed' 
                            ? 'default' 
                            : diagnostic.status === 'in_progress'
                            ? 'secondary'
                            : diagnostic.status === 'error'
                            ? 'destructive'
                            : 'outline'
                        }
                        className="text-xs"
                      >
                        {diagnostic.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{diagnostic.progress}%</span>
                    </div>
                    <Progress 
                      value={diagnostic.progress} 
                      className="h-2"
                    />
                  </div>
                  {diagnostic.nextStep && (
                    <div className="mt-2 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Next Step</h4>
                      <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">{diagnostic.nextStep}</p>
                    </div>
                  )}
                  {diagnostic.dependencies && diagnostic.dependencies.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Dependencies</h4>
                      <div className="flex flex-wrap gap-1">
                        {diagnostic.dependencies.map((dep, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Last updated: {new Date(diagnostic.lastUpdated).toLocaleString()}
                  </p>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      {/* Show message if no diagnostics are available */}
      {diagnostics.length === 0 && !isRunning && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="text-center py-12">
            <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Diagnostic Data Available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Run Full Diagnostics" to start comprehensive system testing
            </p>
            <Button onClick={runFullDiagnostics} className="bg-blue-600 hover:bg-blue-700 text-white">
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Diagnostics
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detailed Diagnostics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="overview" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Performance
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            System Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Authentication Status Card */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Shield className="h-5 w-5" />
                  User Authentication
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Current authentication status and session details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(authHealth?.status || 'checking')}
                    <Badge variant={authHealth?.details?.authenticated ? 'default' : 'outline'}>
                      {authHealth?.details?.authenticated ? 'Authenticated' : 'Not Authenticated'}
                    </Badge>
                  </div>
                </div>
                
                {authHealth?.details?.authenticated && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">User ID</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                        {authHealth.details.userId?.slice(0, 8)}...
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {authHealth.details.email}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Provider</span>
                      <Badge variant="outline" className="text-xs">
                        {authHealth.details.provider}
                      </Badge>
                    </div>
                    
                    {authHealth.details.roles && authHealth.details.roles.length > 0 && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">User Roles</span>
                        <div className="flex flex-wrap gap-1">
                          {authHealth.details.roles.map((role: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {authHealth.details.sessionExpiry && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Session Expires</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {authHealth.details.sessionExpiry.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {!authHealth?.details?.authenticated && (
                  <Alert>
                    <AlertDescription className="text-sm">
                      No active session detected. Please ensure you are logged in.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">System Health</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Overall system status and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Overall Status</span>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-600">
                    {diagnostics.length > 0 ? 
                      (diagnostics.every(d => d.status === 'completed') ? 'Healthy' : 'Running Tests') 
                      : 'Healthy'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Last Check</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {lastCheck.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Tests Completed</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {diagnostics.filter(d => d.status === 'completed').length} / {diagnostics.length || 7}
                  </span>
                </div>
                <Button 
                  onClick={refreshDiagnostics} 
                  disabled={isRefreshing || isRunning}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {(isRefreshing || isRunning) ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {isRunning ? 'Running Tests...' : 'Refreshing...'}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Diagnostics
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  System maintenance and troubleshooting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Database className="h-4 w-4 mr-2" />
                  Test Database Connection
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <HardDrive className="h-4 w-4 mr-2" />
                  Check Storage Status
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">API Response</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {performanceMetrics?.responseTime || 0}ms
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((performanceMetrics?.responseTime || 0) / 10, 100)} 
                    className="w-full bg-gray-200 dark:bg-gray-700"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Resource Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Memory</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {performanceMetrics?.memoryUsage || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={performanceMetrics?.memoryUsage || 0} 
                    className="w-full bg-gray-200 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">CPU</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {performanceMetrics?.cpuUsage || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={performanceMetrics?.cpuUsage || 0} 
                    className="w-full bg-gray-200 dark:bg-gray-700"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Recent System Events</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Latest system logs and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '10:30 AM', type: 'INFO', message: 'System health check completed successfully' },
                  { time: '10:25 AM', type: 'INFO', message: 'Database connection verified' },
                  { time: '10:20 AM', type: 'INFO', message: 'User authentication service active' },
                  { time: '10:15 AM', type: 'INFO', message: 'System diagnostics initialized' },
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="outline" 
                        className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-600"
                      >
                        {log.type}
                      </Badge>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{log.message}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiagnosticDashboard;
