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
  };

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-sm">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">System Reports</h1>
            <p className="text-[10px] text-muted-foreground">Generate and download comprehensive system reports</p>
          </div>
        </div>
      </div>

      <Tabs value={activeReport} onValueChange={setActiveReport} className="space-y-3">
        <TabsList className="h-7 p-0.5 bg-muted/20 border border-border/40 grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-[10px] h-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
          <TabsTrigger value="users" className="text-[10px] h-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Users</TabsTrigger>
          <TabsTrigger value="properties" className="text-[10px] h-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Properties</TabsTrigger>
          <TabsTrigger value="performance" className="text-[10px] h-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-[10px] font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-lg font-bold">{reportData.overview.totalUsers}</div>
                <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4 mt-1">
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                  +12% this month
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-[10px] font-medium text-muted-foreground">Active Properties</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-lg font-bold">{reportData.overview.activeProperties}</div>
                <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4 mt-1">
                  <Activity className="w-2.5 h-2.5 mr-0.5" />
                  Live listings
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-[10px] font-medium text-muted-foreground">System Uptime</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-lg font-bold text-primary">{reportData.overview.systemUptime}</div>
                <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4 mt-1">Excellent</Badge>
              </CardContent>
            </Card>
          </div>

          <Card className="border-l-4 border-l-primary">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="flex items-center gap-2 text-xs">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Quick Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
                <Button onClick={() => generateReport('daily')} variant="outline" size="sm" className="h-7 text-[10px]">
                  <Download className="w-3 h-3 mr-1" />
                  Daily Report
                </Button>
                <Button onClick={() => generateReport('weekly')} variant="outline" size="sm" className="h-7 text-[10px]">
                  <Download className="w-3 h-3 mr-1" />
                  Weekly Report
                </Button>
                <Button onClick={() => generateReport('monthly')} variant="outline" size="sm" className="h-7 text-[10px]">
                  <Download className="w-3 h-3 mr-1" />
                  Monthly Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-3">
          <Card className="border-l-4 border-l-accent">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="flex items-center gap-2 text-xs">
                <Users className="w-3.5 h-3.5 text-accent-foreground" />
                User Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">New Registrations (30 days)</p>
                  <p className="text-lg font-bold">156</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">Active Users (7 days)</p>
                  <p className="text-lg font-bold">892</p>
                </div>
              </div>
              <Button className="mt-3 h-7 text-[10px]" onClick={() => generateReport('users')}>
                <Download className="w-3 h-3 mr-1" />
                Download User Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-3">
          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs">Property Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">New Listings (This Month)</p>
                  <p className="text-lg font-bold">89</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">Successful Bookings</p>
                  <p className="text-lg font-bold">234</p>
                </div>
              </div>
              <Button className="mt-3 h-7 text-[10px]" onClick={() => generateReport('properties')}>
                <Download className="w-3 h-3 mr-1" />
                Download Property Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-3">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="flex items-center gap-2 text-xs">
                <Activity className="w-3.5 h-3.5 text-primary" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">Average Response Time</p>
                  <p className="text-lg font-bold text-primary">{reportData.performance.avgResponseTime}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">Memory Usage</p>
                  <p className="text-lg font-bold">{reportData.performance.memoryUsage}</p>
                </div>
              </div>
              <Button className="mt-3 h-7 text-[10px]" onClick={() => generateReport('performance')}>
                <Download className="w-3 h-3 mr-1" />
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
