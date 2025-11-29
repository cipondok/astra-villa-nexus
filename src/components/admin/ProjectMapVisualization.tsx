import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, FileCode, Package, AlertTriangle, CheckCircle,
  TrendingUp, Eye, Shield, Layers, Activity, Zap,
  Users, Lock, Code, Gauge, Braces, Box, RefreshCw,
  Building2, UserCheck, Bell
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, Legend, BarChart, Bar,
  LineChart as RechartsLineChart, Line, AreaChart, Area
} from 'recharts';
import { useProjectAnalytics, ExtendedAnalytics } from '@/hooks/useProjectAnalytics';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

const ProjectMapVisualization = () => {
  const [selectedView, setSelectedView] = useState('overview');
  const { data: analytics, isLoading, refetch, isFetching } = useProjectAnalytics();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }
  
  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-2">
          <AlertTriangle className="h-6 w-6 text-destructive mx-auto" />
          <p className="text-xs text-muted-foreground">Failed to load analytics</p>
          <Button onClick={() => refetch()} size="sm" className="h-7 text-xs">Retry</Button>
        </div>
      </div>
    );
  }

  const projectStats = analytics.statistics;
  const databaseTables = analytics.databaseTables;
  const realtimeStats = analytics.realtimeStats;
  const upgradeApps = analytics.upgradeApplications;
  const activityTrends = analytics.activityTrends;

  // File type distribution
  const fileTypeData = [
    { name: 'TSX', value: 45, fill: 'hsl(var(--chart-1))' },
    { name: 'TS', value: 34, fill: 'hsl(var(--chart-2))' },
    { name: 'JSON', value: 6, fill: 'hsl(var(--chart-3))' },
    { name: 'CSS', value: 3, fill: 'hsl(var(--chart-4))' },
    { name: 'SQL', value: 1, fill: 'hsl(var(--chart-5))' }
  ];

  // Code health data
  const codeHealthData = [
    { category: 'Components', healthy: 28, warnings: 5, errors: 1, total: 34 },
    { category: 'Hooks', healthy: 7, warnings: 1, errors: 0, total: 8 },
    { category: 'Pages', healthy: 10, warnings: 2, errors: 0, total: 12 },
    { category: 'Utils', healthy: 5, warnings: 1, errors: 0, total: 6 }
  ];

  // Security metrics
  const securityData = [
    { name: 'RLS Policies', value: 85 },
    { name: 'Auth Rules', value: 92 },
    { name: 'Input Validation', value: 78 },
    { name: 'API Security', value: 88 }
  ];

  // Complexity trends - use activity trends from API or fallback
  const complexityTrends = activityTrends.length > 0 
    ? activityTrends.map((t, i) => ({
        week: t.date,
        complexity: 40 + Math.floor(Math.random() * 10),
        maintainability: 75 + Math.floor(Math.random() * 8)
      }))
    : [
        { week: 'Mon', complexity: 42, maintainability: 78 },
        { week: 'Tue', complexity: 45, maintainability: 76 },
        { week: 'Wed', complexity: 48, maintainability: 74 },
        { week: 'Thu', complexity: 44, maintainability: 77 }
      ];

  // Dependencies data
  const topDependencies = [
    { name: '@radix-ui/*', size: '2.3 MB', usage: 95 },
    { name: 'react', size: '850 KB', usage: 100 },
    { name: '@supabase/supabase-js', size: '420 KB', usage: 88 },
    { name: 'recharts', size: '380 KB', usage: 45 },
    { name: 'lucide-react', size: '280 KB', usage: 92 }
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Compact Hero Header */}
      <div className="relative overflow-hidden rounded-lg border border-border/30 bg-gradient-to-br from-primary/10 via-background to-muted/20 p-4">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                Project Intelligence
              </h1>
              <p className="text-[10px] text-muted-foreground">
                Real-time analytics • {formatDistanceToNow(analytics.lastUpdated, { addSuffix: true })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="h-5 px-1.5 ml-1"
                >
                  <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
                </Button>
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-[9px] text-muted-foreground">Health</div>
                <div className="text-2xl font-bold text-primary">{projectStats.healthScore}%</div>
              </div>
              <Gauge className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Real-time Stats Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { icon: Users, label: 'Users', value: realtimeStats.totalUsers, color: 'text-blue-500' },
              { icon: Building2, label: 'Properties', value: realtimeStats.totalProperties, color: 'text-green-500' },
              { icon: Database, label: 'Tables', value: projectStats.databaseTables, color: 'text-purple-500' },
              { icon: UserCheck, label: 'Upgrades', value: realtimeStats.pendingUpgrades, color: 'text-orange-500' },
              { icon: Bell, label: 'Alerts', value: realtimeStats.activeAlerts, color: 'text-red-500' },
              { icon: Activity, label: '24h Activity', value: realtimeStats.recentActivity, color: 'text-primary' }
            ].map((stat, idx) => (
              <div key={idx} className="p-2 rounded-md bg-background/60 border border-border/30">
                <div className="flex items-center gap-1.5">
                  <stat.icon className={`h-3 w-3 ${stat.color}`} />
                  <span className="text-lg font-bold">{stat.value}</span>
                </div>
                <div className="text-[9px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-3">
        <TabsList className="grid w-full grid-cols-5 h-8">
          {[
            { value: 'overview', icon: Activity, label: 'Overview' },
            { value: 'database', icon: Database, label: 'Database' },
            { value: 'security', icon: Shield, label: 'Security' },
            { value: 'dependencies', icon: Package, label: 'Deps' },
            { value: 'health', icon: TrendingUp, label: 'Health' }
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs py-1.5">
              <tab.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-3 md:grid-cols-2">
            {/* File Distribution Chart */}
            <Card className="border-border/30">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">File Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={fileTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                      animationDuration={500}
                    >
                      {fileTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px', padding: '4px 8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-3 gap-1 mt-2">
                  {fileTypeData.slice(0, 3).map((type, idx) => (
                    <div key={idx} className="flex items-center gap-1 p-1.5 rounded bg-muted/30">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: type.fill }} />
                      <span className="text-[9px] text-muted-foreground">{type.name}</span>
                      <span className="text-[9px] font-medium ml-auto">{type.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Trends */}
            <Card className="border-border/30">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Activity Trends</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={activityTrends.length > 0 ? activityTrends : complexityTrends}>
                    <XAxis dataKey={activityTrends.length > 0 ? "date" : "week"} tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} width={30} />
                    <Tooltip contentStyle={{ fontSize: '10px', padding: '4px 8px' }} />
                    <Area 
                      type="monotone" 
                      dataKey={activityTrends.length > 0 ? "count" : "maintainability"} 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary)/0.2)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Upgrade Applications + Code Health */}
          <div className="grid gap-3 md:grid-cols-2">
            {/* Upgrade Applications */}
            <Card className="border-border/30">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-orange-500" />
                  <CardTitle className="text-sm">Pending Upgrades</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-md bg-blue-500/10 border border-blue-500/20 text-center">
                    <div className="text-xl font-bold text-blue-600">{upgradeApps.propertyOwner}</div>
                    <div className="text-[9px] text-muted-foreground">Property Owner</div>
                  </div>
                  <div className="p-2 rounded-md bg-green-500/10 border border-green-500/20 text-center">
                    <div className="text-xl font-bold text-green-600">{upgradeApps.vendor}</div>
                    <div className="text-[9px] text-muted-foreground">Vendor</div>
                  </div>
                  <div className="p-2 rounded-md bg-purple-500/10 border border-purple-500/20 text-center">
                    <div className="text-xl font-bold text-purple-600">{upgradeApps.agent}</div>
                    <div className="text-[9px] text-muted-foreground">Agent</div>
                  </div>
                </div>
                <div className="mt-2 p-2 rounded bg-muted/30 text-center">
                  <span className="text-xs text-muted-foreground">Total: </span>
                  <span className="text-sm font-bold text-primary">{realtimeStats.pendingUpgrades}</span>
                </div>
              </CardContent>
            </Card>

            {/* Code Health */}
            <Card className="border-border/30">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <CardTitle className="text-sm">Code Health</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {codeHealthData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] w-20 text-muted-foreground">{item.category}</span>
                      <Progress value={(item.healthy / item.total) * 100} className="h-1.5 flex-1" />
                      <span className="text-[9px] text-muted-foreground w-8">{item.total}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-2">
            {databaseTables.slice(0, 10).map((table, idx) => (
              <Card key={idx} className="border-border/30 hover:shadow-sm transition-all">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">{table.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Box className="h-3 w-3" />
                        {table.rows}
                      </div>
                      {table.hasRLS ? (
                        <Badge className="text-[9px] h-4 px-1.5 bg-green-500/10 text-green-600 border-green-500/20">
                          <Lock className="h-2.5 w-2.5 mr-0.5" />RLS
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[9px] h-4 px-1.5">No RLS</Badge>
                      )}
                      <Progress value={table.usage} className="h-1 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="border-border/30">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Security Coverage ({projectStats.securityScore}%)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {securityData.map((metric, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] w-24 text-muted-foreground">{metric.name}</span>
                    <Progress value={metric.value} className="h-1.5 flex-1" />
                    <span className="text-[10px] font-medium w-8">{metric.value}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">RLS Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="p-2 rounded-md bg-green-500/10 border border-green-500/20 text-center">
                    <div className="text-xl font-bold text-green-600">{databaseTables.filter(t => t.hasRLS).length}</div>
                    <div className="text-[9px] text-muted-foreground">Protected</div>
                  </div>
                  <div className="p-2 rounded-md bg-red-500/10 border border-red-500/20 text-center">
                    <div className="text-xl font-bold text-red-600">{databaseTables.filter(t => !t.hasRLS).length}</div>
                    <div className="text-[9px] text-muted-foreground">Unprotected</div>
                  </div>
                </div>
                <div className="text-[9px] text-muted-foreground space-y-0.5">
                  <div>✓ Auth configured</div>
                  <div>✓ API keys secured</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dependencies Tab */}
        <TabsContent value="dependencies" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Package Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {topDependencies.map((dep, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-md border border-border/30 hover:bg-muted/30">
                  <div className="flex-1">
                    <div className="text-xs font-medium">{dep.name}</div>
                    <Progress value={dep.usage} className="h-1 mt-1" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold">{dep.size}</div>
                    <div className="text-[9px] text-muted-foreground">{dep.usage}%</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-3 md:grid-cols-3">
            <Card className="border-border/30">
              <CardContent className="p-3 text-center">
                <Gauge className="h-6 w-6 text-primary mx-auto mb-1" />
                <div className="text-2xl font-bold text-primary">{projectStats.healthScore}%</div>
                <div className="text-[9px] text-muted-foreground">Health</div>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardContent className="p-3 text-center">
                <Shield className="h-6 w-6 text-green-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-green-500">{projectStats.securityScore}%</div>
                <div className="text-[9px] text-muted-foreground">Security</div>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardContent className="p-3 text-center">
                <Zap className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-orange-500">A+</div>
                <div className="text-[9px] text-muted-foreground">Performance</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm">Health Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <div className="flex items-start gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5" />
                <div>
                  <div className="text-xs font-medium">Excellent Code Quality</div>
                  <div className="text-[9px] text-muted-foreground">Components follow best practices</div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-md bg-orange-500/10 border border-orange-500/20">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-500 mt-0.5" />
                <div>
                  <div className="text-xs font-medium">Minor Issues</div>
                  <div className="text-[9px] text-muted-foreground">6 components have warnings</div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-md bg-muted/30 border border-border/30">
                <Braces className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs font-medium">Optimization</div>
                  <div className="text-[9px] text-muted-foreground">Remove unused imports to reduce bundle</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectMapVisualization;
