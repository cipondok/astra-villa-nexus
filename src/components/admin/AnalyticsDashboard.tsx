
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
  Eye,
  RefreshCw,
  Calendar,
  Smartphone,
  Monitor,
  Tablet
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnalyticsDashboard = () => {
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('overview');

  // Sample data for charts
  const userActivityData = [
    { date: 'Jan 15', users: 250 },
    { date: 'Jan 16', users: 280 },
    { date: 'Jan 17', users: 290 },
    { date: 'Jan 18', users: 320 },
    { date: 'Jan 19', users: 400 },
    { date: 'Jan 20', users: 450 },
    { date: 'Jan 21', users: 520 }
  ];

  const deviceData = [
    { name: 'Desktop', value: 52, count: 2341, color: '#3B82F6' },
    { name: 'Mobile', value: 35, count: 1578, color: '#8B5CF6' },
    { name: 'Tablet', value: 13, count: 587, color: '#F59E0B' }
  ];

  const topPages = [
    { page: '/dashboard', views: 15234, unique: 8765, time: '4:32', bounce: '23.4%' },
    { page: '/astra-token', views: 12987, unique: 7432, time: '6:21', bounce: '18.7%' },
    { page: '/transfers', views: 9876, unique: 5432, time: '3:45', bounce: '32.1%' }
  ];

  const userJourneyData = [
    { stage: 'Landing', users: 1000, percentage: 100, color: '#3B82F6' },
    { stage: 'Signup', users: 750, percentage: 75, color: '#3B82F6' },
    { stage: 'Verification', users: 650, percentage: 65, color: '#3B82F6' },
    { stage: 'First Action', users: 520, percentage: 52, color: '#3B82F6' }
  ];

  const analyticsOverviewStats = [
    {
      title: "Total Users",
      value: "12,547",
      change: "+18.5% from last month",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    },
    {
      title: "Active Users",
      value: "8,234",
      change: "Currently online",
      icon: Activity,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    },
    {
      title: "Revenue",
      value: "$45,789",
      change: "+12.3% this week",
      icon: DollarSign,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    },
    {
      title: "Conversion Rate",
      value: "15.8%",
      change: "+2.1% improvement",
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            Live Data
          </Badge>
          <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsOverviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`${stat.bgColor} backdrop-blur-sm border shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${stat.color} mb-2`}>
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {stat.change}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Trends */}
        <Card className="bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              User Activity Trends
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Daily user engagement over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-600" />
                <XAxis dataKey="date" stroke="#6B7280" className="dark:stroke-gray-400" fontSize={12} />
                <YAxis stroke="#6B7280" className="dark:stroke-gray-400" fontSize={12} />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card className="bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Monitor className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Device Distribution
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              User device preferences and engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                {deviceData.map((device) => (
                  <div key={device.name} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: device.color }}
                    ></div>
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">{device.value}%</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">{device.name}</div>
                      <div className="text-gray-500 dark:text-gray-500 text-xs">{device.count.toLocaleString()} users</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid with Consistent Table Styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Pages */}
        <Card className="bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Top Performing Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Table Header */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <span>Page</span>
                <span>Views</span>
                <span>Time</span>
                <span>Bounce</span>
              </div>
              
              {/* Table Rows */}
              {topPages.map((page, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 py-3 border-t border-gray-200 dark:border-gray-600 first:border-t-0">
                  <span className="text-gray-900 dark:text-white font-medium text-sm">{page.page}</span>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    <div>{page.views.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">{page.unique.toLocaleString()} unique</div>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{page.time}</span>
                  <span className="text-gray-900 dark:text-white font-bold text-sm">{page.bounce}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Journey */}
        <Card className="bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              User Journey
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Conversion funnel analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userJourneyData.map((stage, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900 dark:text-white font-medium">{stage.stage}</span>
                  <span className="text-gray-900 dark:text-white font-bold">{stage.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stage.percentage}%`,
                      backgroundColor: stage.color 
                    }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stage.users.toLocaleString()} users
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
