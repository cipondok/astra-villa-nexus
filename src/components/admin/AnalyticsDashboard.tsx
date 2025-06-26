
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
    { name: 'Desktop', value: 52, count: 2341, color: '#06b6d4' },
    { name: 'Mobile', value: 35, count: 1578, color: '#10b981' },
    { name: 'Tablet', value: 13, count: 587, color: '#f59e0b' }
  ];

  const topPages = [
    { page: '/dashboard', views: 15234, unique: 8765, time: '4:32', bounce: '23.4%' },
    { page: '/astra-token', views: 12987, unique: 7432, time: '6:21', bounce: '18.7%' },
    { page: '/transfers', views: 9876, unique: 5432, time: '3:45', bounce: '32.1%' }
  ];

  const userJourneyData = [
    { stage: 'Landing', users: 1000, percentage: 100, color: '#f59e0b' },
    { stage: 'Signup', users: 750, percentage: 75, color: '#f59e0b' },
    { stage: 'Verification', users: 650, percentage: 65, color: '#f59e0b' },
    { stage: 'First Action', users: 520, percentage: 52, color: '#f59e0b' }
  ];

  const analyticsOverviewStats = [
    {
      title: "Total Users",
      value: "12,547",
      change: "+18.5% from last month",
      icon: Users,
      color: "text-cyan-400",
      bgColor: "bg-slate-800/50 border-cyan-500/20"
    },
    {
      title: "Active Users",
      value: "8,234",
      change: "Currently online",
      icon: Activity,
      color: "text-green-400",
      bgColor: "bg-slate-800/50 border-green-500/20"
    },
    {
      title: "Revenue",
      value: "$45,789",
      change: "+12.3% this week",
      icon: DollarSign,
      color: "text-purple-400",
      bgColor: "bg-slate-800/50 border-purple-500/20"
    },
    {
      title: "Conversion Rate",
      value: "15.8%",
      change: "+2.1% improvement",
      icon: TrendingUp,
      color: "text-yellow-400",
      bgColor: "bg-slate-800/50 border-yellow-500/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics Dashboard
          </h2>
          <p className="text-purple-300">
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-slate-800/50 border-green-500/30 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Live Data
          </Badge>
          <select className="bg-slate-800/50 border border-purple-500/20 text-white rounded-lg px-3 py-2 text-sm">
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
            <Card key={stat.title} className={`${stat.bgColor} backdrop-blur-sm border`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${stat.color} mb-2`}>
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-xs text-green-400">
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
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              User Activity Trends
            </CardTitle>
            <CardDescription className="text-gray-400">
              Daily user engagement over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Monitor className="h-5 w-5 text-green-400" />
              Device Distribution
            </CardTitle>
            <CardDescription className="text-gray-400">
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
                      <div className="text-white font-medium">{device.value}%</div>
                      <div className="text-gray-400 text-sm">{device.name}</div>
                      <div className="text-gray-500 text-xs">{device.count.toLocaleString()} users</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Pages */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-400" />
              Top Performing Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPages.map((page, index) => (
              <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{page.page}</span>
                  <span className="text-white font-bold">{page.bounce}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span><Eye className="h-3 w-3 inline mr-1" />{page.views.toLocaleString()} views</span>
                  <span><Users className="h-3 w-3 inline mr-1" />{page.unique.toLocaleString()} unique</span>
                  <span><Calendar className="h-3 w-3 inline mr-1" />{page.time}</span>
                </div>
                <div className="text-right text-sm text-gray-500 mt-1">bounce rate</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* User Journey */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              User Journey
            </CardTitle>
            <CardDescription className="text-gray-400">
              Conversion funnel analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userJourneyData.map((stage, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{stage.stage}</span>
                  <span className="text-white font-bold">{stage.percentage}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stage.percentage}%`,
                      backgroundColor: stage.color 
                    }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-400 mt-1">
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
