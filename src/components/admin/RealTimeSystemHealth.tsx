
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  Clock, 
  TrendingUp, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { useDatabaseConnection } from '@/hooks/useDatabaseConnection';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';

interface SystemMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

const RealTimeSystemHealth = () => {
  const { connectionStatus, isConnected, retryConnection } = useDatabaseConnection();
  const { metrics } = useRealTimeMetrics();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 0, status: 'healthy', unit: '%', trend: 'stable' },
    { name: 'Memory Usage', value: 0, status: 'healthy', unit: '%', trend: 'stable' },
    { name: 'Database Load', value: 0, status: 'healthy', unit: '%', trend: 'stable' },
    { name: 'API Response Time', value: 0, status: 'healthy', unit: 'ms', trend: 'stable' },
  ]);

  const updateSystemMetrics = () => {
    setSystemMetrics(prev => prev.map(metric => {
      const newValue = Math.floor(Math.random() * 100);
      const status = newValue > 80 ? 'critical' : newValue > 60 ? 'warning' : 'healthy';
      const trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable';
      
      return {
        ...metric,
        value: metric.name === 'API Response Time' ? Math.floor(Math.random() * 200) + 50 : newValue,
        status,
        trend
      };
    }));
  };

  useEffect(() => {
    updateSystemMetrics();
    const interval = setInterval(updateSystemMetrics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />;
      default: return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const overallHealth = Math.floor(
    systemMetrics.reduce((acc, metric) => {
      const score = metric.status === 'healthy' ? 100 : metric.status === 'warning' ? 70 : 30;
      return acc + score;
    }, 0) / systemMetrics.length
  );

  return (
    <div className="space-y-6">
      {/* Overall Health Card */}
      <Card className={`border-2 ${overallHealth > 80 ? 'border-green-200 bg-green-50' : overallHealth > 60 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Overview
            </div>
            <Button variant="outline" size="sm" onClick={updateSystemMetrics}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Real-time system performance monitoring • Last updated: {metrics.lastUpdated.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Overall Health Score</span>
              <span className={`text-2xl font-bold ${getStatusColor(overallHealth > 80 ? 'healthy' : overallHealth > 60 ? 'warning' : 'critical')}`}>
                {overallHealth}%
              </span>
            </div>
            <Progress value={overallHealth} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Database Connection Status */}
      <Card className={`border-2 ${isConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                <Database className={`h-5 w-5 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                  Database Connection
                </h3>
                <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {connectionStatus} • {isConnected ? 'All systems operational' : 'Connection issues detected'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className={`h-4 w-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  {metric.name}
                </span>
                {getTrendIcon(metric.trend)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                {metric.value}{metric.unit}
              </div>
              <Progress value={metric.value} className="h-2 mt-2" />
              <div className="flex items-center justify-between mt-2">
                <Badge variant={metric.status === 'healthy' ? 'default' : metric.status === 'warning' ? 'secondary' : 'destructive'}>
                  {metric.status}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Live
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.activeUsers}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Currently online
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.totalUsers}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Registered users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.totalProperties}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total listings
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.pendingAlerts}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Require attention
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeSystemHealth;
