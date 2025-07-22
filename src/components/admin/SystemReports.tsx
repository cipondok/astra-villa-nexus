import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Activity, Users, AlertTriangle, TrendingUp } from 'lucide-react';

const SystemReports = () => {
  const [activeReport, setActiveReport] = useState('overview');

  const reportData = {
    overview: {
      totalUsers: 1247,
      activeProperties: 589,
      totalTransactions: 3456,
      systemUptime: '99.8%',
      errorRate: '0.2%'
    },
    performance: {
      avgResponseTime: '120ms',
      dbConnections: 45,
      memoryUsage: '68%',
      cpuUsage: '24%'
    }
  };

  const generateReport = (type: string) => {
    console.log(`Generating ${type} report...`);
    // Here you would implement actual report generation
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">System Reports</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Generate and download comprehensive system reports
        </p>
      </div>

      <Tabs value={activeReport} onValueChange={setActiveReport} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
          <TabsTrigger value="properties" className="text-xs sm:text-sm">Properties</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{reportData.overview.totalUsers}</div>
                <Badge variant="secondary" className="mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% this month
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{reportData.overview.activeProperties}</div>
                <Badge variant="secondary" className="mt-1">
                  <Activity className="w-3 h-3 mr-1" />
                  Live listings
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">{reportData.overview.systemUptime}</div>
                <Badge variant="outline" className="mt-1 text-green-600">
                  Excellent
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Quick Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Button 
                  onClick={() => generateReport('daily')} 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Daily Report
                </Button>
                <Button 
                  onClick={() => generateReport('weekly')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Weekly Report
                </Button>
                <Button 
                  onClick={() => generateReport('monthly')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Monthly Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">New Registrations (Last 30 days)</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Active Users (Last 7 days)</p>
                  <p className="text-2xl font-bold">892</p>
                </div>
              </div>
              <Button className="mt-4 w-full sm:w-auto" onClick={() => generateReport('users')}>
                <Download className="w-4 h-4 mr-2" />
                Download User Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">New Listings (This Month)</p>
                  <p className="text-2xl font-bold">89</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Successful Bookings</p>
                  <p className="text-2xl font-bold">234</p>
                </div>
              </div>
              <Button className="mt-4 w-full sm:w-auto" onClick={() => generateReport('properties')}>
                <Download className="w-4 h-4 mr-2" />
                Download Property Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Average Response Time</p>
                  <p className="text-2xl font-bold text-green-600">{reportData.performance.avgResponseTime}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Memory Usage</p>
                  <p className="text-2xl font-bold">{reportData.performance.memoryUsage}</p>
                </div>
              </div>
              <Button className="mt-4 w-full sm:w-auto" onClick={() => generateReport('performance')}>
                <Download className="w-4 h-4 mr-2" />
                Download Performance Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemReports;