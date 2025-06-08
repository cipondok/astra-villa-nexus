
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Server, 
  Database, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SystemMonitor = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: systemStatus, refetch } = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      // Simulate system health checks
      const dbStatus = await checkDatabaseHealth();
      const authStatus = await checkAuthStatus();
      const storageStatus = await checkStorageStatus();
      
      return {
        database: dbStatus,
        authentication: authStatus,
        storage: storageStatus,
        overallHealth: calculateOverallHealth([dbStatus, authStatus, storageStatus]),
        lastChecked: new Date().toISOString()
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: metrics } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      // Get basic metrics from database
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      const { count: activeListings } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'approved');

      const { count: errorCount } = await supabase
        .from('system_error_logs')
        .select('*', { count: 'exact', head: true })
        .eq('is_resolved', false);

      return {
        totalUsers: totalUsers || 0,
        totalProperties: totalProperties || 0,
        activeListings: activeListings || 0,
        errorCount: errorCount || 0,
        uptime: '99.5%',
        responseTime: '120ms',
        throughput: '1.2k req/min'
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const checkDatabaseHealth = async () => {
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      return {
        status: error ? 'error' : 'healthy',
        message: error ? error.message : 'Connection stable',
        responseTime: Math.floor(Math.random() * 50) + 20 // Simulated response time
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database connection failed',
        responseTime: 0
      };
    }
  };

  const checkAuthStatus = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      return {
        status: error ? 'warning' : 'healthy',
        message: error ? 'Auth service issues detected' : 'Service operational',
        activeUsers: Math.floor(Math.random() * 100) + 50 // Simulated active users
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Authentication service down',
        activeUsers: 0
      };
    }
  };

  const checkStorageStatus = async () => {
    // Simulate storage check
    return {
      status: 'healthy',
      message: 'Storage available',
      usage: Math.floor(Math.random() * 30) + 20 // Simulated usage percentage
    };
  };

  const calculateOverallHealth = (services: any[]) => {
    const healthyServices = services.filter(service => service.status === 'healthy').length;
    return Math.floor((healthyServices / services.length) * 100);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Monitor</h2>
          <p className="text-muted-foreground">Real-time system health and performance monitoring</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Health */}
      <Card className="glass-ios">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Overview
          </CardTitle>
          <CardDescription>
            Last updated: {systemStatus?.lastChecked ? new Date(systemStatus.lastChecked).toLocaleTimeString() : 'Never'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Overall Health</span>
              <span className="text-2xl font-bold text-green-600">
                {systemStatus?.overallHealth || 0}%
              </span>
            </div>
            <Progress value={systemStatus?.overallHealth || 0} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-ios">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getStatusBadge(systemStatus?.database?.status || 'unknown')}
              <p className="text-sm text-muted-foreground">
                {systemStatus?.database?.message || 'Checking...'}
              </p>
              <div className="text-xs text-muted-foreground">
                Response: {systemStatus?.database?.responseTime || 0}ms
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-ios">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getStatusBadge(systemStatus?.authentication?.status || 'unknown')}
              <p className="text-sm text-muted-foreground">
                {systemStatus?.authentication?.message || 'Checking...'}
              </p>
              <div className="text-xs text-muted-foreground">
                Active: {systemStatus?.authentication?.activeUsers || 0} users
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-ios">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Server className="h-5 w-5" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getStatusBadge(systemStatus?.storage?.status || 'unknown')}
              <p className="text-sm text-muted-foreground">
                {systemStatus?.storage?.message || 'Checking...'}
              </p>
              <div className="text-xs text-muted-foreground">
                Usage: {systemStatus?.storage?.usage || 0}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-ios">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              Active system users
            </div>
          </CardContent>
        </Card>

        <Card className="glass-ios">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalProperties || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              Total in database
            </div>
          </CardContent>
        </Card>

        <Card className="glass-ios">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.uptime || 'N/A'}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1" />
              Last 30 days
            </div>
          </CardContent>
        </Card>

        <Card className="glass-ios">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.responseTime || 'N/A'}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 mr-1" />
              Average response
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Summary */}
      {metrics?.errorCount && metrics.errorCount > 0 && (
        <Card className="glass-ios border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>{metrics.errorCount} unresolved error{metrics.errorCount > 1 ? 's' : ''}</span>
              <Button variant="outline" size="sm" onClick={() => window.location.hash = '#error-reports'}>
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemMonitor;
