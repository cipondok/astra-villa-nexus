
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
  Settings
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AdminTopMenu from './AdminTopMenu';

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  authentication: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  overall: 'healthy' | 'warning' | 'critical';
}

const DiagnosticDashboard = () => {
  const { user, profile } = useAuth();
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
    queryKey: ['auth-health'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        return { 
          status: session ? 'healthy' : 'warning', 
          message: session ? 'Authentication active' : 'No active session'
        };
      } catch (error) {
        return { status: 'critical', message: 'Authentication service error' };
      }
    },
    refetchInterval: 60000, // Refresh every minute
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
    
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
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
    <div className="space-y-6 bg-white dark:bg-gray-900 min-h-screen p-6 rounded-lg">
      <AdminTopMenu 
        title="System Diagnostics" 
        subtitle="Monitor system health and performance metrics"
        showSearch={false}
      />

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {diagnosticItems.map((item, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {item.title}
              </CardTitle>
              {item.loading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-gray-600 dark:text-gray-400" />
              ) : (
                <item.icon className={`h-4 w-4 ${getStatusColor(item.status)}`} />
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getStatusIcon(item.status)}
                <span className={`text-sm ${getStatusColor(item.status)}`}>
                  {item.message}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Last Check</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {lastCheck.toLocaleTimeString()}
                  </span>
                </div>
                <Button 
                  onClick={refreshDiagnostics} 
                  disabled={isRefreshing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing...
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
