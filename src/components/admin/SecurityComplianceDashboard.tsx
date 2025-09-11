import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Database,
  Eye,
  Lock,
  Activity,
  Clock,
  Download,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SecurityLog {
  id: string;
  user_id: string;
  event_type: string;
  ip_address: unknown;
  risk_score: number;
  is_flagged: boolean;
  created_at: string;
  metadata?: any;
}

interface ErrorLog {
  id: string;
  error_type: string;
  error_page: string;
  user_ip: unknown;
  user_agent: string;
  created_at: string;
}

interface AdminAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

const SecurityComplianceDashboard = () => {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [adminAlerts, setAdminAlerts] = useState<AdminAlert[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState({
    threatLevel: 'Low',
    activeThreats: 0,
    blockedAttempts: 0,
    lastScan: 'Never',
    complianceScore: 0,
    highRiskEvents: 0,
    totalEvents: 0
  });

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Calculate time range for last 24 hours
      const timeRange = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Fetch security logs
      const { data: logs, error: logsError } = await supabase
        .from('user_security_logs')
        .select('*')
        .gte('created_at', timeRange.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Fetch error logs
      const { data: errors, error: errorsError } = await supabase
        .from('error_logs')
        .select('*')
        .gte('created_at', timeRange.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (errorsError) throw errorsError;

      // Fetch admin alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertsError) throw alertsError;

      setSecurityLogs(logs || []);
      setErrorLogs(errors || []);
      setAdminAlerts(alerts || []);

      // Calculate security metrics
      const totalEvents = (logs?.length || 0) + (errors?.length || 0);
      const highRiskEvents = logs?.filter(log => log.risk_score > 70).length || 0;
      const blockedAttempts = logs?.filter(log => log.event_type.includes('blocked') || log.event_type.includes('failed')).length || 0;
      const criticalAlerts = alerts?.filter(alert => alert.priority === 'high' || alert.priority === 'urgent').length || 0;
      
      let threatLevel = 'Low';
      if (highRiskEvents > 10 || criticalAlerts > 5) {
        threatLevel = 'High';
      } else if (highRiskEvents > 5 || criticalAlerts > 2) {
        threatLevel = 'Medium';
      }

      const complianceScore = Math.max(100 - (highRiskEvents * 2) - (criticalAlerts * 5), 0);

      setSecurityMetrics({
        threatLevel,
        activeThreats: criticalAlerts,
        blockedAttempts,
        lastScan: 'Just now',
        complianceScore,
        highRiskEvents,
        totalEvents
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error loading security data",
        description: "Failed to fetch security monitoring data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSecurityData();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant':
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 80) return <Badge variant="destructive">High Risk</Badge>;
    if (riskScore >= 50) return <Badge variant="outline" className="border-orange-500 text-orange-500">Medium Risk</Badge>;
    return <Badge variant="outline" className="border-green-500 text-green-500">Low Risk</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  // Generate threat data for chart from real security logs
  const generateThreatData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLogs = securityLogs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date: format(date, 'MM-dd'),
        threats: dayLogs.length,
        blocked: dayLogs.filter(log => log.event_type.includes('blocked')).length,
        resolved: dayLogs.filter(log => log.event_type.includes('resolved')).length
      });
    }
    return days;
  };

  const threatData = generateThreatData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security & Compliance Dashboard
          </h2>
          <p className="text-muted-foreground">
            Real-time security monitoring, audit trails, and compliance management
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Security Alert */}
      {securityMetrics.activeThreats > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {securityMetrics.activeThreats} active security threats detected. Review the security monitoring tab for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Threat Level</p>
                <p className="text-2xl font-bold">{securityMetrics.threatLevel}</p>
                <p className="text-xs text-muted-foreground">{securityMetrics.activeThreats} active</p>
              </div>
              <Shield className={`h-8 w-8 ${securityMetrics.threatLevel === 'Low' ? 'text-green-500' : securityMetrics.threatLevel === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blocked Attempts</p>
                <p className="text-2xl font-bold">{securityMetrics.blockedAttempts}</p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
              <Lock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold">{securityMetrics.complianceScore}%</p>
                <p className="text-xs text-muted-foreground">Security Rating</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Security Scan</p>
                <p className="text-lg font-bold">{securityMetrics.lastScan}</p>
                <p className="text-xs text-muted-foreground">All systems</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring">Security Monitoring</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="alerts">Admin Alerts</TabsTrigger>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Threat Detection Timeline</CardTitle>
                <CardDescription>Security threats and blocked attempts over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={threatData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="threats" fill="#EF4444" name="Threats Detected" />
                    <Bar dataKey="blocked" fill="#10B981" name="Threats Blocked" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>High-risk security events from the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityLogs.slice(0, 10).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                        </TableCell>
                        <TableCell>{log.event_type}</TableCell>
                        <TableCell className="font-mono text-sm">{log.user_id}</TableCell>
                        <TableCell className="font-mono">{String(log.ip_address || 'N/A')}</TableCell>
                        <TableCell>{log.risk_score}</TableCell>
                        <TableCell>
                          {getRiskBadge(log.risk_score)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {securityLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No security events found for the last 24 hours.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Security Event Audit Trail
              </CardTitle>
              <CardDescription>Comprehensive audit trail of all security activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {securityLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{log.event_type}</span>
                        <span className="text-sm text-muted-foreground">User: {log.user_id}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Risk Score: {log.risk_score}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                        </span>
                        {getRiskBadge(log.risk_score)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {securityLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No audit trail data available.
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Audit Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Admin Alerts</CardTitle>
              <CardDescription>System-generated alerts requiring administrator attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{alert.title}</h3>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm:ss')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(alert.priority)}
                        {!alert.is_read && <Badge variant="outline">Unread</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {adminAlerts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No admin alerts at this time.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Error Logs
              </CardTitle>
              <CardDescription>Recent application errors and incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Error Type</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>User IP</TableHead>
                    <TableHead>User Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorLogs.map((error) => (
                    <TableRow key={error.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(error.created_at), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{error.error_type}</Badge>
                      </TableCell>
                      <TableCell>{error.error_page}</TableCell>
                      <TableCell className="font-mono">{String(error.user_ip || 'N/A')}</TableCell>
                      <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                        {error.user_agent}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {errorLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No error logs found for the last 24 hours.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityComplianceDashboard;