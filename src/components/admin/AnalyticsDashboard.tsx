
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  RefreshCw,
  Calendar
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
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('overview');

  console.log('AnalyticsDashboard - Current analytics tab:', activeAnalyticsTab);

  const analyticsOverviewStats = [
    {
      title: "Total Revenue",
      value: "$2.4M",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/10 border-green-500/20"
    },
    {
      title: "Active Users",
      value: "8,234",
      change: "+18.7%",
      trend: "up",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/20"
    },
    {
      title: "Page Views",
      value: "124.5K",
      change: "+8.3%",
      trend: "up",
      icon: Eye,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 border-purple-500/20"
    },
    {
      title: "System Health",
      value: "98.5%",
      change: "+2.1%",
      trend: "up",
      icon: Shield,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10 border-cyan-500/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics & Insights
          </h2>
          <p className="text-purple-300">
            Comprehensive system analytics and business intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-slate-800/50 border-green-500/30 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Live Data
          </Badge>
          <Button variant="outline" className="bg-slate-800/50 border-purple-500/20 text-white hover:bg-slate-700/50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsOverviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`bg-slate-800/50 backdrop-blur-sm border ${stat.bgColor}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${stat.color}`}>
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-green-400">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Simplified Analytics Tabs */}
      <Tabs value={activeAnalyticsTab} onValueChange={setActiveAnalyticsTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-slate-800/50 rounded-2xl p-2 border border-purple-500/20">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-400 hover:text-white"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-400 hover:text-white"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger 
            value="traffic" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-400 hover:text-white"
          >
            <Globe className="h-4 w-4 mr-2" />
            Traffic
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-400 hover:text-white"
          >
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-400 hover:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger 
            value="alerts" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-400 hover:text-white"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
          <TabsContent value="overview" className="space-y-4 mt-0">
            <BusinessIntelligenceDashboard />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 mt-0">
            <PerformanceAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="traffic" className="space-y-4 mt-0">
            <WebTrafficAnalytics />
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-0">
            <SecurityComplianceDashboard />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4 mt-0">
            <SystemReports />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4 mt-0">
            <EnhancedAlertManagement />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
