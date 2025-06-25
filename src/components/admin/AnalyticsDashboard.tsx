
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Globe, 
  Users, 
  FileText, 
  Shield,
  Activity,
  AlertTriangle,
  DollarSign,
  Zap,
  Eye,
  Lock
} from "lucide-react";
import PerformanceAnalyticsDashboard from './PerformanceAnalyticsDashboard';
import WebTrafficAnalytics from './WebTrafficAnalytics';
import VendorPerformanceAnalytics from './VendorPerformanceAnalytics';
import SystemReports from './SystemReports';
import EnhancedAlertManagement from './EnhancedAlertManagement';
import BusinessIntelligenceDashboard from './BusinessIntelligenceDashboard';
import SecurityComplianceDashboard from './SecurityComplianceDashboard';
import AutomationFeaturesDashboard from './AutomationFeaturesDashboard';

const AnalyticsDashboard = () => {
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('business-intelligence');

  console.log('AnalyticsDashboard - Current analytics tab:', activeAnalyticsTab);

  const analyticsOverviewStats = [
    {
      title: "Revenue Growth",
      value: "$328K",
      change: "+23.5%",
      trend: "up",
      icon: DollarSign,
      color: "green"
    },
    {
      title: "Page Views",
      value: "127.4K",
      change: "+8.7%",
      trend: "up",
      icon: Eye,
      color: "blue"
    },
    {
      title: "Security Score",
      value: "96%",
      change: "+2.1%",
      trend: "up",
      icon: Shield,
      color: "emerald"
    },
    {
      title: "Automation Rate",
      value: "87%",
      change: "+15.3%",
      trend: "up",
      icon: Zap,
      color: "purple"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics & Business Intelligence Center
          </h2>
          <p className="text-muted-foreground">
            Comprehensive analytics, business intelligence, security monitoring, and automation
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Real-time Data
        </Badge>
      </div>

      {/* Enhanced Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsOverviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 dark:from-${stat.color}-900/20 dark:to-${stat.color}-800/20`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium text-${stat.color}-600 dark:text-${stat.color}-400`}>
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <Icon className={`h-8 w-8 text-${stat.color}-500`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Analytics Tabs */}
      <Tabs value={activeAnalyticsTab} onValueChange={setActiveAnalyticsTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-muted rounded-lg p-1">
          <TabsTrigger value="business-intelligence" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">BI</span>
          </TabsTrigger>
          <TabsTrigger value="security-compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Automation</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="web-traffic" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Traffic</span>
          </TabsTrigger>
          <TabsTrigger value="vendor-analytics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Vendors</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business-intelligence" className="space-y-4">
          <BusinessIntelligenceDashboard />
        </TabsContent>

        <TabsContent value="security-compliance" className="space-y-4">
          <SecurityComplianceDashboard />
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <AutomationFeaturesDashboard />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="web-traffic" className="space-y-4">
          <WebTrafficAnalytics />
        </TabsContent>

        <TabsContent value="vendor-analytics" className="space-y-4">
          <VendorPerformanceAnalytics />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <SystemReports />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <EnhancedAlertManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
