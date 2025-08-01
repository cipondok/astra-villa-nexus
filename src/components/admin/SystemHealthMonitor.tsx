import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Monitor, Cpu, HardDrive, Wifi, Database, 
  Activity, Clock, TrendingUp, TrendingDown,
  CheckCircle, AlertTriangle, XCircle, RefreshCw,
  Server, Zap, BarChart3
} from "lucide-react";
import { format } from "date-fns";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

const SystemHealthMonitor = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate system metrics - in real app, this would come from monitoring APIs
  const systemMetrics: SystemMetric[] = [
    { name: 'CPU Usage', value: 23, unit: '%', status: 'healthy', trend: 'stable', lastUpdated: new Date() },
    { name: 'Memory Usage', value: 67, unit: '%', status: 'warning', trend: 'up', lastUpdated: new Date() },
    { name: 'Disk Usage', value: 45, unit: '%', status: 'healthy', trend: 'stable', lastUpdated: new Date() },
    { name: 'Network I/O', value: 156, unit: 'MB/s', status: 'healthy', trend: 'down', lastUpdated: new Date() },
  ];

  const databaseMetrics = [
    { name: 'Active Connections', value: 156, max: 200, unit: 'connections' },
    { name: 'Query Response Time', value: 45, max: 100, unit: 'ms' },
    { name: 'Cache Hit Ratio', value: 94, max: 100, unit: '%' },
    { name: 'Slow Queries', value: 3, max: 10, unit: 'queries/min' },
  ];

  const serviceStatus = [
    { name: 'Web Server', status: 'healthy', uptime: '99.9%', lastCheck: new Date() },
    { name: 'Database', status: 'healthy', uptime: '99.8%', lastCheck: new Date() },
    { name: 'Redis Cache', status: 'healthy', uptime: '100%', lastCheck: new Date() },
    { name: 'File Storage', status: 'warning', uptime: '98.5%', lastCheck: new Date() },
    { name: 'Email Service', status: 'healthy', uptime: '99.7%', lastCheck: new Date() },
    { name: 'Background Jobs', status: 'healthy', uptime: '99.9%', lastCheck: new Date() },
  ];

  const { data: systemLogs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['system-logs'],
    queryFn: async () => {
      // Simulate system logs - in real app, this would query actual system logs
      return [
        { id: 1, level: 'info', message: 'System health check completed', timestamp: new Date(), component: 'health-monitor' },
        { id: 2, level: 'warning', message: 'Memory usage above 60%', timestamp: new Date(Date.now() - 300000), component: 'memory-monitor' },
        { id: 3, level: 'info', message: 'Database backup completed successfully', timestamp: new Date(Date.now() - 600000), component: 'backup-service' },
        { id: 4, level: 'error', message: 'Failed to connect to external API', timestamp: new Date(Date.now() - 900000), component: 'api-gateway' },
        { id: 5, level: 'info', message: 'Cache refresh completed', timestamp: new Date(Date.now() - 1200000), component: 'cache-service' },
      ];
    },
    refetchInterval: 30000,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Monitor className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchLogs();
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
            <Monitor className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">System Health Monitor</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time system performance and health metrics</p>
          </div>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {index === 0 && <Cpu className="h-5 w-5 text-blue-500" />}
                  {index === 1 && <HardDrive className="h-5 w-5 text-orange-500" />}
                  {index === 2 && <Database className="h-5 w-5 text-green-500" />}
                  {index === 3 && <Wifi className="h-5 w-5 text-purple-500" />}
                  <h3 className="font-medium text-sm">{metric.name}</h3>
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{metric.value}{metric.unit}</span>
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
                
                <Progress 
                  value={metric.value} 
                  className={`h-2 ${
                    metric.status === 'critical' ? 'bg-red-200' :
                    metric.status === 'warning' ? 'bg-yellow-200' : 'bg-green-200'
                  }`}
                />
                
                <p className="text-xs text-gray-500">
                  Updated {format(metric.lastUpdated, 'HH:mm:ss')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Service Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceStatus.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-gray-500">Uptime: {service.uptime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(service.lastCheck, 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Database Metrics */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {databaseMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className="text-sm text-gray-600">
                    {metric.value} {metric.unit}
                  </span>
                </div>
                <Progress 
                  value={(metric.value / metric.max) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Logs */}
      <Card className="flex-1 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent System Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-500">Loading system logs...</span>
            </div>
          ) : (
            systemLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    log.level === 'error' ? 'bg-red-500' :
                    log.level === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs ${getLogLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">{log.component}</span>
                    </div>
                    <p className="text-sm font-medium">{log.message}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {format(log.timestamp, 'HH:mm:ss')}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthMonitor;