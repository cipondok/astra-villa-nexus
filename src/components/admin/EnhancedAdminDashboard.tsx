import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  Shield,
  Settings,
  Users,
  FileText,
  TrendingUp,
  Server,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Brain,
  RefreshCw,
  CreditCard,
  Key,
  Globe,
  Briefcase,
  Camera,
  MessageSquare
} from 'lucide-react';
import SystemSettings from './SystemSettings';
import UserManagement from './UserManagement';
import ApiSettings from './ApiSettings';
import PaymentSettings from './PaymentSettings';
import ProjectSettings from './ProjectSettings';
import IndonesianPaymentGateways from './IndonesianPaymentGateways';
import PropertyManagement from './PropertyManagement';
import VirtualTourSettings from './VirtualTourSettings';
import VendorManagement from './VendorManagement';
import CustomerSupport from './CustomerSupport';
import ASTRATokenSettings from './ASTRATokenSettings';

const EnhancedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data for demonstration
  const systemStats = {
    totalUsers: 1247,
    activeUsers: 89,
    totalErrors: 23,
    criticalErrors: 3,
    systemUptime: '99.9%',
    responseTime: '245ms',
    databaseHealth: 98,
    securityScore: 95
  };

  const alerts = [
    { id: 1, type: 'critical', message: 'Database connection timeout detected', time: '2 min ago' },
    { id: 2, type: 'warning', message: 'High memory usage on server 2', time: '15 min ago' },
    { id: 3, type: 'info', message: 'System backup completed successfully', time: '1 hour ago' }
  ];

  const recentErrors = [
    { id: 1, level: 'error', component: 'Authentication', message: 'Failed login attempt from suspicious IP', count: 5 },
    { id: 2, level: 'warning', component: 'Database', message: 'Slow query detected', count: 12 },
    { id: 3, level: 'info', component: 'System', message: 'Cache cleared successfully', count: 1 }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getErrorLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Enhanced Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Complete system monitoring and control center
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>

        {/* Critical Alerts */}
        {alerts.filter(alert => alert.type === 'critical').length > 0 && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {alerts.filter(alert => alert.type === 'critical').length} critical alerts require immediate attention
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
              <p className="text-blue-100 text-xs">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.databaseHealth}%</div>
              <p className="text-green-100 text-xs">All systems operational</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Active Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalErrors}</div>
              <p className="text-red-100 text-xs">{systemStats.criticalErrors} critical</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.securityScore}%</div>
              <p className="text-purple-100 text-xs">Excellent protection</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-12 lg:w-fit overflow-x-auto">
            <TabsTrigger value="overview" className="gap-2 whitespace-nowrap">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 whitespace-nowrap">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-2 whitespace-nowrap">
              <Globe className="h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="vendors" className="gap-2 whitespace-nowrap">
              <Briefcase className="h-4 w-4" />
              Vendors
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2 whitespace-nowrap">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="virtual-tours" className="gap-2 whitespace-nowrap">
              <Camera className="h-4 w-4" />
              3D Tours
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2 whitespace-nowrap">
              <MessageSquare className="h-4 w-4" />
              Support
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2 whitespace-nowrap">
              <Key className="h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2 whitespace-nowrap">
              <Server className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 whitespace-nowrap">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 whitespace-nowrap">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="errors" className="gap-2 whitespace-nowrap">
              <AlertTriangle className="h-4 w-4" />
              Errors
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Real-time Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Real-time Alerts
                  </CardTitle>
                  <CardDescription>System notifications and warnings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* System Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Performance
                  </CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Database Health</span>
                      <span>{systemStats.databaseHealth}%</span>
                    </div>
                    <Progress value={systemStats.databaseHealth} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Security Score</span>
                      <span>{systemStats.securityScore}%</span>
                    </div>
                    <Progress value={systemStats.securityScore} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-lg font-semibold">{systemStats.responseTime}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Response Time</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="text-lg font-semibold">{systemStats.systemUptime}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Uptime</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Errors Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent System Events
                </CardTitle>
                <CardDescription>Latest error reports and system logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentErrors.map((error) => (
                    <div key={error.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Badge className={getErrorLevelColor(error.level)}>{error.level}</Badge>
                        <div>
                          <p className="text-sm font-medium">{error.component}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{error.message}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{error.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          {/* Properties Management Tab */}
          <TabsContent value="properties" className="space-y-6">
            <PropertyManagement />
          </TabsContent>

          {/* Vendors Management Tab */}
          <TabsContent value="vendors" className="space-y-6">
            <VendorManagement />
          </TabsContent>

          {/* Indonesian Payment Gateways Tab */}
          <TabsContent value="payments" className="space-y-6">
            <IndonesianPaymentGateways />
          </TabsContent>

          {/* Virtual Tours Management Tab */}
          <TabsContent value="virtual-tours" className="space-y-6">
            <VirtualTourSettings />
          </TabsContent>

          {/* Customer Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <CustomerSupport />
          </TabsContent>

          {/* API Settings Tab */}
          <TabsContent value="api" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    ASTRA Token API
                  </CardTitle>
                  <CardDescription>Configure ASTRA token system API settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ASTRATokenSettings />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    General API Settings
                  </CardTitle>
                  <CardDescription>Manage other external API configurations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ApiSettings />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system" className="space-y-6">
            <SystemSettings />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Advanced Analytics Dashboard
                </CardTitle>
                <CardDescription>Comprehensive system and user analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Advanced analytics with user behavior tracking, performance metrics, and predictive insights
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Dashboard
                </CardTitle>
                <CardDescription>Security monitoring and threat detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Security Center</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Advanced security monitoring with threat detection and vulnerability scanning
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Error Reports Tab */}
          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Advanced Error Reporting System
                </CardTitle>
                <CardDescription>Comprehensive error tracking and management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Enhanced Error Reporting</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Real-time error tracking, categorization, and automated resolution suggestions
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 border rounded-lg">
                      <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h4 className="font-medium">Real-time Monitoring</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Live error detection</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Brain className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <h4 className="font-medium">Smart Analysis</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered insights</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <CheckCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <h4 className="font-medium">Auto Resolution</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automated fixes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;