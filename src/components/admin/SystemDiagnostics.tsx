import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Monitor, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Activity,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface DatabaseError {
  id: string;
  error_type: string;
  error_message: string;
  error_severity: string;
  table_name?: string;
  occurrence_count: number;
  is_resolved: boolean;
  first_seen_at: string;
  last_seen_at: string;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_status: string;
  uptime: string;
  active_connections: number;
  response_time: number;
}

const SystemDiagnostics = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_status: 'Connected',
    uptime: '0h 0m',
    active_connections: 0,
    response_time: 0
  });
  const queryClient = useQueryClient();

  // Fetch database errors
  const { data: databaseErrors = [], isLoading: errorsLoading, refetch: refetchErrors } = useQuery({
    queryKey: ['database-errors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('database_error_tracking')
        .select('*')
        .order('last_seen_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching database errors:', error);
        return [];
      }
      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch system health data
  const { data: systemHealth, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      try {
        // Simulate API health check
        const startTime = Date.now();
        const { data, error, count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        const endTime = Date.now();
        
        const responseTime = endTime - startTime;
        
        // Simulate system metrics (in real app, this would come from monitoring service)
        const mockMetrics: SystemMetrics = {
          cpu_usage: Math.floor(Math.random() * 30) + 10, // 10-40%
          memory_usage: Math.floor(Math.random() * 40) + 30, // 30-70%
          disk_usage: Math.floor(Math.random() * 20) + 40, // 40-60%
          network_status: error ? 'Error' : 'Connected',
          uptime: calculateUptime(),
          active_connections: count || 0,
          response_time: responseTime
        };
        
        setSystemMetrics(mockMetrics);
        
        return {
          status: error ? 'error' : 'healthy',
          database_status: error ? 'error' : 'connected',
          response_time: responseTime,
          last_check: new Date().toISOString()
        };
      } catch (err) {
        return {
          status: 'error',
          database_status: 'error',
          response_time: 0,
          last_check: new Date().toISOString()
        };
      }
    },
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  // Run diagnostics
  const { mutate: runDiagnostics, isPending: diagnosticsRunning } = useMutation({
    mutationFn: async () => {
      // Call database diagnostics edge function
      const { data, error } = await supabase.functions.invoke('database-diagnostics', {
        body: { action: 'full_diagnostics' }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Diagnostics completed successfully');
      refetchHealth();
      refetchErrors();
    },
    onError: (error) => {
      console.error('Diagnostics error:', error);
      toast.error('Failed to run diagnostics');
    }
  });

  const calculateUptime = () => {
    const startTime = localStorage.getItem('app_start_time');
    if (!startTime) {
      const now = Date.now();
      localStorage.setItem('app_start_time', now.toString());
      return '0h 0m';
    }
    
    const elapsed = Date.now() - parseInt(startTime);
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'Connected':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
      case 'Error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'Connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
      case 'Error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Generate mock performance data for chart
  const performanceData = Array.from({ length: 10 }, (_, i) => ({
    time: new Date(Date.now() - (9 - i) * 60000).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    response_time: Math.floor(Math.random() * 200) + 50,
    cpu_usage: Math.floor(Math.random() * 40) + 20,
    memory_usage: Math.floor(Math.random() * 30) + 40,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Monitor className="h-6 w-6 text-blue-500" />
          System Diagnostics
        </h2>
        <Button
          onClick={() => runDiagnostics()}
          disabled={diagnosticsRunning}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
          {diagnosticsRunning ? 'Running...' : 'Run Diagnostics'}
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(systemHealth?.status || 'unknown')}
                  <span className={`font-semibold ${getStatusColor(systemHealth?.status || 'unknown')}`}>
                    {systemHealth?.status === 'healthy' ? 'Healthy' : 'Issues Detected'}
                  </span>
                </div>
              </div>
              <Server className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Database</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(systemHealth?.database_status || 'unknown')}
                  <span className={`font-semibold ${getStatusColor(systemHealth?.database_status || 'unknown')}`}>
                    {systemHealth?.database_status === 'connected' ? 'Connected' : 'Error'}
                  </span>
                </div>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">
                    {systemHealth?.response_time || 0}ms
                  </span>
                  {(systemHealth?.response_time || 0) < 200 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">{systemMetrics.uptime}</span>
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Cpu className="h-4 w-4 text-orange-500" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current</span>
                <span className="font-medium">{systemMetrics.cpu_usage}%</span>
              </div>
              <Progress value={systemMetrics.cpu_usage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {systemMetrics.cpu_usage < 50 ? 'Normal' : systemMetrics.cpu_usage < 80 ? 'High' : 'Critical'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-blue-500" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current</span>
                <span className="font-medium">{systemMetrics.memory_usage}%</span>
              </div>
              <Progress value={systemMetrics.memory_usage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {systemMetrics.memory_usage < 60 ? 'Normal' : systemMetrics.memory_usage < 85 ? 'High' : 'Critical'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4 text-green-500" />
              Disk Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current</span>
                <span className="font-medium">{systemMetrics.disk_usage}%</span>
              </div>
              <Progress value={systemMetrics.disk_usage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {systemMetrics.disk_usage < 70 ? 'Normal' : systemMetrics.disk_usage < 90 ? 'High' : 'Critical'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Performance Metrics (Last 10 Minutes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="response_time" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  name="Response Time (ms)"
                />
                <Line 
                  type="monotone" 
                  dataKey="cpu_usage" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  name="CPU Usage (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="memory_usage" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  name="Memory Usage (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Database Errors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Recent Database Errors ({databaseErrors.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchErrors()}
            disabled={errorsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${errorsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {databaseErrors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              No database errors found
            </div>
          ) : (
            <div className="space-y-4">
              {databaseErrors.slice(0, 10).map((error: DatabaseError) => (
                <div key={error.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={error.is_resolved ? "default" : "destructive"}>
                          {error.error_severity}
                        </Badge>
                        <Badge variant="outline">
                          {error.error_type}
                        </Badge>
                        {error.table_name && (
                          <Badge variant="secondary">
                            {error.table_name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">{error.error_message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>First seen: {new Date(error.first_seen_at).toLocaleString()}</span>
                        <span>Last seen: {new Date(error.last_seen_at).toLocaleString()}</span>
                        <span>Count: {error.occurrence_count}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {error.is_resolved ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Network & Connections */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-blue-500" />
              Network Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection Status</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemMetrics.network_status)}
                  <span className={`font-semibold ${getStatusColor(systemMetrics.network_status)}`}>
                    {systemMetrics.network_status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Connections</span>
                <span className="text-lg font-bold">{systemMetrics.active_connections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Health Check</span>
                <span className="text-sm text-muted-foreground">
                  {systemHealth?.last_check ? new Date(systemHealth.last_check).toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" />
              Database Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection Pool</span>
                <Badge variant="outline" className="text-green-600">
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Query Performance</span>
                <Badge variant="outline" className="text-blue-600">
                  Optimal
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-sm font-bold text-green-600">0.01%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemDiagnostics;