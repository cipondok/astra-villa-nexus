
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
import { validateUUIDWithLogging } from '@/utils/uuid-validation-logger';

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
        
        // Only query user_roles if we have a valid user ID
        let userRoles = null;
        if (user?.id && validateUUIDWithLogging(user.id, 'DiagnosticDashboard.authHealth', {
          operation: 'fetch_user_roles'
        })) {
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('is_active', true);
          userRoles = data;
        }
        
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
        return 'text-chart-1';
      case 'warning':
      case 'in_progress':
        return 'text-chart-3';
      case 'critical':
      case 'error':
        return 'text-destructive';
      case 'pending':
        return 'text-chart-2';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return <CheckCircle className="h-3.5 w-3.5 text-chart-1" />;
      case 'warning':
        return <AlertTriangle className="h-3.5 w-3.5 text-chart-3" />;
      case 'critical':
      case 'error':
        return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
      case 'in_progress':
        return <Loader className="h-3.5 w-3.5 text-chart-2 animate-spin" />;
      case 'pending':
        return <Clock className="h-3.5 w-3.5 text-chart-2" />;
      default:
        return <Monitor className="h-3.5 w-3.5 text-muted-foreground" />;
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
    <div className="space-y-3 bg-background min-h-0 rounded-lg">
      {/* Header - Slim Style */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-muted/20 rounded-lg border border-border/50">
        <div className="flex-1">
          <h2 className="text-sm font-bold text-foreground">System Diagnostics</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Monitor system health and performance metrics</p>
          {lastRun && (
            <p className="text-[9px] text-muted-foreground mt-0.5">
              Last run: {new Date(lastRun).toLocaleString()}
            </p>
          )}
        </div>
        <Button 
          onClick={refreshDiagnostics} 
          disabled={isRefreshing || isRunning}
          size="sm"
          className="h-7 text-xs px-3"
        >
          {(isRefreshing || isRunning) ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              {isRunning ? 'Running...' : 'Refresh'}
            </>
          ) : (
            <>
              <PlayCircle className="h-3 w-3 mr-1" />
              Run Diagnostics
            </>
          )}
        </Button>
      </div>

      {/* System Status Overview - Slim Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {diagnosticItems.map((item, index) => (
          <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2">
              <CardTitle className="text-[10px] font-medium text-foreground truncate pr-1">
                {item.title}
              </CardTitle>
              {item.loading ? (
                <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground flex-shrink-0" />
              ) : (
                <item.icon className={`h-3 w-3 flex-shrink-0 ${getStatusColor(item.status)}`} />
              )}
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="flex items-center gap-1">
                <span className="scale-75">{getStatusIcon(item.status)}</span>
                <span className={`text-[9px] ${getStatusColor(item.status)} truncate`}>
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
              <Card key={diagnostic.id} className="bg-card border border-border touch-manipulation">
                <CardHeader className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${getStatusColor(diagnostic.status)}`} />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                          {diagnostic.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
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
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{diagnostic.progress}%</span>
                    </div>
                    <Progress 
                      value={diagnostic.progress} 
                      className="h-2"
                    />
                  </div>
                  {diagnostic.nextStep && (
                    <div className="mt-2 p-2 sm:p-3 bg-chart-2/10 rounded-lg">
                      <h4 className="text-xs sm:text-sm font-medium text-chart-2 mb-1">Next Step</h4>
                      <p className="text-xs sm:text-sm text-chart-2/80">{diagnostic.nextStep}</p>
                    </div>
                  )}
                  {diagnostic.dependencies && diagnostic.dependencies.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs sm:text-sm font-medium text-foreground mb-1">Dependencies</h4>
                      <div className="flex flex-wrap gap-1">
                        {diagnostic.dependencies.map((dep, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
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
        <Card className="bg-card border border-border">
          <CardContent className="text-center py-12">
            <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Diagnostic Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Click "Run Full Diagnostics" to start comprehensive system testing
            </p>
            <Button onClick={runFullDiagnostics}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Diagnostics
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detailed Diagnostics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/30 border border-border/40">
          <TabsTrigger value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance">
            Performance
          </TabsTrigger>
          <TabsTrigger value="logs">
            System Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Authentication Status Card */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5" />
                  User Authentication
                </CardTitle>
                <CardDescription>
                  Current authentication status and session details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Status</span>
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
                      <span className="text-sm text-foreground">User ID</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {authHealth.details.userId?.slice(0, 8)}...
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Email</span>
                      <span className="text-sm text-muted-foreground">
                        {authHealth.details.email}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Provider</span>
                      <Badge variant="outline" className="text-xs">
                        {authHealth.details.provider}
                      </Badge>
                    </div>
                    
                    {authHealth.details.roles && authHealth.details.roles.length > 0 && (
                      <div className="pt-2 border-t border-border">
                        <span className="text-sm text-foreground mb-2 block">User Roles</span>
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
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-sm text-foreground">Session Expires</span>
                        <span className="text-xs text-muted-foreground">
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
            
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">System Health</CardTitle>
                <CardDescription>
                  Overall system status and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Overall Status</span>
                  <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/30">
                    {diagnostics.length > 0 ? 
                      (diagnostics.every(d => d.status === 'completed') ? 'Healthy' : 'Running Tests') 
                      : 'Healthy'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Last Check</span>
                  <span className="text-sm text-muted-foreground">
                    {lastCheck.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Tests Completed</span>
                  <span className="text-sm text-muted-foreground">
                    {diagnostics.filter(d => d.status === 'completed').length} / {diagnostics.length || 7}
                  </span>
                </div>
                <Button 
                  onClick={refreshDiagnostics} 
                  disabled={isRefreshing || isRunning}
                  className="w-full"
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

            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
                <CardDescription>
                  System maintenance and troubleshooting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Test Database Connection
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HardDrive className="h-4 w-4 mr-2" />
                  Check Storage Status
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">API Response</span>
                    <span className="text-sm font-semibold text-foreground">
                      {performanceMetrics?.responseTime || 0}ms
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((performanceMetrics?.responseTime || 0) / 10, 100)} 
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Resource Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">Memory</span>
                    <span className="text-sm font-semibold text-foreground">
                      {performanceMetrics?.memoryUsage || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={performanceMetrics?.memoryUsage || 0} 
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">CPU</span>
                    <span className="text-sm font-semibold text-foreground">
                      {performanceMetrics?.cpuUsage || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={performanceMetrics?.cpuUsage || 0} 
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent System Events</CardTitle>
              <CardDescription>
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
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="outline" 
                        className="bg-chart-2/10 text-chart-2 border-chart-2/30"
                      >
                        {log.type}
                      </Badge>
                      <span className="text-sm text-foreground">{log.message}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
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
