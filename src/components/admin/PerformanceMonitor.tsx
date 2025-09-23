import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Zap, Cpu, HardDrive, Clock, AlertTriangle, CheckCircle, XCircle, Activity } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";

interface PerformanceMonitorProps {
  metrics: any;
  onRefresh: () => void;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export function PerformanceMonitor({ metrics, onRefresh }: PerformanceMonitorProps) {
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('hour');
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(() => {
      if (isMonitoring) {
        loadPerformanceData();
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange, isMonitoring]);

  const loadPerformanceData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('performance-monitor', {
        body: {
          timeRange,
          includeHistory: true,
          includeAlerts: true
        }
      });

      if (error) throw error;
      
      setSystemMetrics(data?.currentMetrics || mockSystemMetrics);
      setPerformanceHistory(data?.history || mockPerformanceHistory);
      setAlerts(data?.alerts || mockAlerts);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      // Use mock data as fallback
      setSystemMetrics(mockSystemMetrics);
      setPerformanceHistory(mockPerformanceHistory);
      setAlerts(mockAlerts);
    }
  };

  // Mock data for demonstration
  const mockSystemMetrics: SystemMetrics = {
    cpu: 45,
    memory: 62,
    responseTime: 285,
    throughput: 156,
    errorRate: 2.3,
    uptime: 99.8
  };

  const mockPerformanceHistory = [
    { time: '00:00', cpu: 35, memory: 58, responseTime: 245, throughput: 120 },
    { time: '00:30', cpu: 42, memory: 61, responseTime: 285, throughput: 145 },
    { time: '01:00', cpu: 38, memory: 59, responseTime: 265, throughput: 132 },
    { time: '01:30', cpu: 45, memory: 62, responseTime: 285, throughput: 156 },
    { time: '02:00', cpu: 52, memory: 65, responseTime: 320, throughput: 178 },
    { time: '02:30', cpu: 48, memory: 63, responseTime: 295, throughput: 165 }
  ];

  const mockAlerts: AlertItem[] = [
    {
      id: '1',
      type: 'warning',
      title: 'High CPU Usage',
      message: 'CPU usage has exceeded 80% for the last 5 minutes',
      timestamp: new Date(Date.now() - 300000),
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Cache Optimization',
      message: 'Search cache hit rate improved to 92%',
      timestamp: new Date(Date.now() - 1800000),
      resolved: true
    },
    {
      id: '3',
      type: 'critical',
      title: '3D Model Loading Issue',
      message: 'Average 3D model load time increased by 40%',
      timestamp: new Date(Date.now() - 3600000),
      resolved: false
    }
  ];

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-500';
    if (value <= thresholds.warning) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-muted-foreground">
            Real-time system performance and algorithm metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isMonitoring ? "default" : "secondary"}>
            {isMonitoring ? 'Live' : 'Paused'}
          </Badge>
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Last Hour</SelectItem>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setIsMonitoring(!isMonitoring)}
            size="sm"
          >
            {isMonitoring ? 'Pause' : 'Resume'}
          </Button>
          <Button onClick={onRefresh} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(systemMetrics?.cpu || 0, { good: 50, warning: 80 })}`}>
              {systemMetrics?.cpu}%
            </div>
            <Progress 
              value={systemMetrics?.cpu || 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <Memory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(systemMetrics?.memory || 0, { good: 60, warning: 80 })}`}>
              {systemMetrics?.memory}%
            </div>
            <Progress 
              value={systemMetrics?.memory || 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(systemMetrics?.responseTime || 0, { good: 200, warning: 500 })}`}>
              {systemMetrics?.responseTime}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Avg response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {systemMetrics?.throughput}
            </div>
            <p className="text-xs text-muted-foreground">
              Requests per minute
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(systemMetrics?.errorRate || 0, { good: 1, warning: 5 })}`}>
              {systemMetrics?.errorRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Error percentage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {systemMetrics?.uptime}%
            </div>
            <p className="text-xs text-muted-foreground">
              System uptime
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Real-time system metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                <Line yAxisId="left" type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                <Line yAxisId="right" type="monotone" dataKey="responseTime" stroke="#ffc658" name="Response Time (ms)" />
                <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#ff7300" name="Throughput" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Algorithm Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Algorithm Performance</CardTitle>
            <CardDescription>Individual algorithm metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AlgorithmMetric
                name="Search Algorithm"
                responseTime={metrics?.searchAlgorithm?.avgResponseTime || 0}
                successRate={metrics?.searchAlgorithm?.successRate || 0}
                status="healthy"
              />
              <AlgorithmMetric
                name="Recommendation Engine"
                responseTime={450}
                successRate={metrics?.recommendationEngine?.userSatisfaction * 100 || 0}
                status="warning"
              />
              <AlgorithmMetric
                name="Behavior Analytics"
                responseTime={120}
                successRate={95}
                status="healthy"
              />
              <AlgorithmMetric
                name="3D Optimization"
                responseTime={850}
                successRate={metrics?.modelOptimization?.avgFPS > 30 ? 85 : 65}
                status={metrics?.modelOptimization?.avgFPS > 30 ? "healthy" : "critical"}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
            <CardDescription>Recent performance alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  <p>No active alerts</p>
                  <p className="text-sm">All systems running normally</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage Details */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Usage Details</CardTitle>
          <CardDescription>Detailed breakdown of system resource consumption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ResourceUsageItem
              title="Database Connections"
              current={45}
              max={100}
              unit="connections"
            />
            <ResourceUsageItem
              title="Cache Hit Rate"
              current={92}
              max={100}
              unit="%"
            />
            <ResourceUsageItem
              title="Active Sessions"
              current={234}
              max={500}
              unit="sessions"
            />
            <ResourceUsageItem
              title="Queue Length"
              current={12}
              max={50}
              unit="items"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AlgorithmMetricProps {
  name: string;
  responseTime: number;
  successRate: number;
  status: 'healthy' | 'warning' | 'critical';
}

function AlgorithmMetric({ name, responseTime, successRate, status }: AlgorithmMetricProps) {
  const statusColors = {
    healthy: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600'
  };

  const statusIcons = {
    healthy: <CheckCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    critical: <XCircle className="h-4 w-4" />
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <div className="flex items-center gap-3">
        <div className={statusColors[status]}>
          {statusIcons[status]}
        </div>
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-muted-foreground">
            {responseTime}ms • {successRate.toFixed(1)}% success
          </div>
        </div>
      </div>
      <Badge variant={status === 'healthy' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}>
        {status}
      </Badge>
    </div>
  );
}

interface AlertCardProps {
  alert: AlertItem;
}

function AlertCard({ alert }: AlertCardProps) {
  const alertColors = {
    critical: 'border-red-500 bg-red-50',
    warning: 'border-yellow-500 bg-yellow-50',
    info: 'border-blue-500 bg-blue-50'
  };

  const alertIcons = {
    critical: <XCircle className="h-4 w-4 text-red-600" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
    info: <CheckCircle className="h-4 w-4 text-blue-600" />
  };

  return (
    <div className={`p-3 rounded border ${alertColors[alert.type]} ${alert.resolved ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        {alertIcons[alert.type]}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{alert.title}</span>
            {alert.resolved && (
              <Badge variant="outline" className="text-xs">Resolved</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {alert.timestamp.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ResourceUsageItemProps {
  title: string;
  current: number;
  max: number;
  unit: string;
}

function ResourceUsageItem({ title, current, max, unit }: ResourceUsageItemProps) {
  const percentage = (current / max) * 100;
  
  return (
    <div className="p-4 border rounded">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">{title}</h4>
        <span className="text-sm text-muted-foreground">
          {current}/{max} {unit}
        </span>
      </div>
      <Progress value={percentage} className="mb-2" />
      <div className="text-xs text-muted-foreground">
        {percentage.toFixed(1)}% utilized
      </div>
    </div>
  );
}