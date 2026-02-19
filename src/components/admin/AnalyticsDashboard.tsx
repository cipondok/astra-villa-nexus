
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Globe, 
  Users, 
  DollarSign,
  Activity,
  Monitor,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnalyticsDashboard = () => {
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('overview');

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
    { name: 'Desktop', value: 52, count: 2341, colorClass: 'bg-primary' },
    { name: 'Mobile', value: 35, count: 1578, colorClass: 'bg-chart-2' },
    { name: 'Tablet', value: 13, count: 587, colorClass: 'bg-chart-3' }
  ];

  const topPages = [
    { page: '/dashboard', views: 15234, unique: 8765, time: '4:32', bounce: '23.4%' },
    { page: '/astra-token', views: 12987, unique: 7432, time: '6:21', bounce: '18.7%' },
    { page: '/transfers', views: 9876, unique: 5432, time: '3:45', bounce: '32.1%' }
  ];

  const userJourneyData = [
    { stage: 'Landing', users: 1000, percentage: 100 },
    { stage: 'Signup', users: 750, percentage: 75 },
    { stage: 'Verification', users: 650, percentage: 65 },
    { stage: 'First Action', users: 520, percentage: 52 }
  ];

  const analyticsOverviewStats = [
    { title: "Total Users", value: "12,547", change: "+18.5% from last month", icon: Users },
    { title: "Active Users", value: "8,234", change: "Currently online", icon: Activity },
    { title: "Revenue", value: "Rp 725jt", change: "+12.3% this week", icon: DollarSign },
    { title: "Conversion Rate", value: "15.8%", change: "+2.1% improvement", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/5 border-primary/30 text-primary">
            <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
            Live Data
          </Badge>
          <select className="bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm">
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
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                    <p className="text-xs text-primary">
                      {stat.change}
                    </p>
                  </div>
                  <Icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              User Activity Trends
            </CardTitle>
            <CardDescription>
              Daily user engagement over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="fill-muted-foreground" fontSize={12} />
                <YAxis className="fill-muted-foreground" fontSize={12} />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Device Distribution
            </CardTitle>
            <CardDescription>
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
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--chart-2))" />
                    <Cell fill="hsl(var(--chart-3))" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                {deviceData.map((device) => (
                  <div key={device.name} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${device.colorClass}`}></div>
                    <div>
                      <div className="text-foreground font-medium">{device.value}%</div>
                      <div className="text-muted-foreground text-sm">{device.name}</div>
                      <div className="text-muted-foreground text-xs">{device.count.toLocaleString()} users</div>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Top Performing Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground mb-3">
                <span>Page</span>
                <span>Views</span>
                <span>Time</span>
                <span>Bounce</span>
              </div>
              {topPages.map((page, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 py-3 border-t border-border first:border-t-0">
                  <span className="text-foreground font-medium text-sm">{page.page}</span>
                  <div className="text-muted-foreground text-sm">
                    <div>{page.views.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground/70">{page.unique.toLocaleString()} unique</div>
                  </div>
                  <span className="text-muted-foreground text-sm">{page.time}</span>
                  <span className="text-foreground font-bold text-sm">{page.bounce}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Journey */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              User Journey
            </CardTitle>
            <CardDescription>
              Conversion funnel analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userJourneyData.map((stage, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-medium">{stage.stage}</span>
                  <span className="text-foreground font-bold">{stage.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-muted-foreground mt-1">
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
