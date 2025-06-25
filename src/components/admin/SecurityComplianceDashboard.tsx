
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

const SecurityComplianceDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);

  // Mock security data
  const securityMetrics = {
    threatLevel: 'Low',
    activeThreats: 2,
    blockedAttempts: 147,
    lastScan: '2 hours ago',
    complianceScore: 96
  };

  const auditTrail = [
    { timestamp: '2024-06-25 14:30', user: 'admin@example.com', action: 'User Login', resource: 'Admin Dashboard', status: 'Success' },
    { timestamp: '2024-06-25 14:25', user: 'agent@example.com', action: 'Property Update', resource: 'Property #1234', status: 'Success' },
    { timestamp: '2024-06-25 14:20', user: 'vendor@example.com', action: 'Service Request', resource: 'Service #5678', status: 'Pending' },
    { timestamp: '2024-06-25 14:15', user: 'user@example.com', action: 'Profile Update', resource: 'User Profile', status: 'Success' }
  ];

  const threatData = [
    { date: '06-20', threats: 5, blocked: 4, resolved: 1 },
    { date: '06-21', threats: 8, blocked: 7, resolved: 1 },
    { date: '06-22', threats: 3, blocked: 3, resolved: 0 },
    { date: '06-23', threats: 12, blocked: 10, resolved: 2 },
    { date: '06-24', threats: 6, blocked: 5, resolved: 1 },
    { date: '06-25', threats: 4, blocked: 4, resolved: 0 }
  ];

  const complianceItems = [
    { category: 'GDPR Compliance', status: 'Compliant', score: 98, lastCheck: '1 day ago' },
    { category: 'Data Encryption', status: 'Compliant', score: 100, lastCheck: '2 hours ago' },
    { category: 'Access Controls', status: 'Warning', score: 85, lastCheck: '3 hours ago' },
    { category: 'Backup Verification', status: 'Compliant', score: 95, lastCheck: '6 hours ago' }
  ];

  const backupStatus = [
    { type: 'Database', lastBackup: '2024-06-25 03:00', status: 'Success', size: '2.4 GB' },
    { type: 'Files', lastBackup: '2024-06-25 03:15', status: 'Success', size: '890 MB' },
    { type: 'Configurations', lastBackup: '2024-06-25 03:30', status: 'Success', size: '12 MB' }
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security & Compliance Dashboard
          </h2>
          <p className="text-muted-foreground">
            Advanced security monitoring, audit trails, and compliance management
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
              <Shield className={`h-8 w-8 ${securityMetrics.threatLevel === 'Low' ? 'text-green-500' : 'text-red-500'}`} />
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
                <p className="text-xs text-muted-foreground">GDPR & Privacy</p>
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
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Threat Detection Timeline</CardTitle>
                <CardDescription>Security threats and blocked attempts over time</CardDescription>
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
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Complete Activity Logging
              </CardTitle>
              <CardDescription>Comprehensive audit trail of all system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditTrail.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{entry.action}</span>
                        <span className="text-sm text-muted-foreground">{entry.user}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{entry.resource}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                        <Badge variant={entry.status === 'Success' ? 'default' : 'secondary'}>
                          {entry.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Audit Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Dashboard</CardTitle>
                <CardDescription>GDPR, data protection, and regulatory compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceItems.map((item) => (
                    <div key={item.category} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h3 className="font-semibold">{item.category}</h3>
                        <p className="text-sm text-muted-foreground">Last checked: {item.lastCheck}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <span className="font-bold">{item.score}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Automated Backup Monitoring
              </CardTitle>
              <CardDescription>Backup status and recovery management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupStatus.map((backup) => (
                  <div key={backup.type} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{backup.type} Backup</h3>
                      <p className="text-sm text-muted-foreground">Size: {backup.size}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getStatusColor(backup.status)}>
                          {backup.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{backup.lastBackup}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Backup
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityComplianceDashboard;
