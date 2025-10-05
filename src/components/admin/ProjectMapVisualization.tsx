import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Database, FileCode, Package, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, Eye, Shield, Layers, Activity, FolderOpen, Zap,
  Users, Lock, Code, Gauge, LineChart, Braces, Box
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, Legend, RadialBarChart, RadialBar,
  LineChart as RechartsLineChart, Line, AreaChart, Area
} from 'recharts';

const ProjectMapVisualization = () => {
  const [selectedView, setSelectedView] = useState('overview');
  
  // Enhanced project statistics
  const projectStats = {
    totalFiles: 89,
    components: 34,
    pages: 12,
    hooks: 8,
    databaseTables: 40,
    linesOfCode: 12543,
    dependencies: 64,
    migrations: 127,
    healthScore: 87,
    securityScore: 92
  };

  // File type distribution using semantic colors
  const fileTypeData = [
    { name: 'TypeScript', value: 45, fill: 'hsl(var(--chart-1))' },
    { name: 'TSX', value: 34, fill: 'hsl(var(--chart-2))' },
    { name: 'JSON', value: 6, fill: 'hsl(var(--chart-3))' },
    { name: 'CSS', value: 3, fill: 'hsl(var(--chart-4))' },
    { name: 'SQL', value: 1, fill: 'hsl(var(--chart-5))' }
  ];

  // Code health with totals
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

  // Complexity trends
  const complexityTrends = [
    { week: 'W1', complexity: 42, maintainability: 78 },
    { week: 'W2', complexity: 45, maintainability: 76 },
    { week: 'W3', complexity: 48, maintainability: 74 },
    { week: 'W4', complexity: 44, maintainability: 77 }
  ];

  // Database tables
  const databaseTables = [
    { name: 'profiles', columns: 15, policies: 4, rows: 156, usage: 85, hasRLS: true },
    { name: 'properties', columns: 30, policies: 3, rows: 342, usage: 92, hasRLS: true },
    { name: 'vendor_business_profiles', columns: 40, policies: 4, rows: 89, usage: 78, hasRLS: true },
    { name: 'rental_bookings', columns: 20, policies: 3, rows: 523, usage: 95, hasRLS: true },
    { name: 'user_roles', columns: 5, policies: 2, rows: 12, usage: 45, hasRLS: true },
    { name: 'api_settings', columns: 9, policies: 2, rows: 3, usage: 25, hasRLS: true }
  ];

  // Dependencies data
  const topDependencies = [
    { name: '@radix-ui/*', size: '2.3 MB', usage: 95 },
    { name: 'react + react-dom', size: '850 KB', usage: 100 },
    { name: '@supabase/supabase-js', size: '420 KB', usage: 88 },
    { name: 'recharts', size: '380 KB', usage: 45 },
    { name: 'lucide-react', size: '280 KB', usage: 92 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stunning Hero Header */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Project Intelligence
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Comprehensive analysis of architecture, security, code quality, and database health
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right space-y-1">
                <div className="text-sm text-muted-foreground">Overall Health</div>
                <div className="text-5xl font-bold text-primary">{projectStats.healthScore}%</div>
              </div>
              <div className="relative">
                <Gauge className="h-16 w-16 text-primary animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileCode, label: 'Total Files', value: projectStats.totalFiles, color: 'from-primary/20 to-primary/5' },
              { icon: Database, label: 'DB Tables', value: projectStats.databaseTables, color: 'from-secondary/20 to-secondary/5' },
              { icon: Package, label: 'Dependencies', value: projectStats.dependencies, color: 'from-accent/20 to-accent/5' },
              { icon: Code, label: 'Lines of Code', value: `${(projectStats.linesOfCode / 1000).toFixed(1)}k`, color: 'from-primary/20 to-primary/5' }
            ].map((stat, idx) => (
              <Card key={idx} className={`border-border/50 bg-gradient-to-br ${stat.color} backdrop-blur-sm hover:scale-105 transition-transform duration-300`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background/80">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 p-1 h-auto">
          {[
            { value: 'overview', icon: Activity, label: 'Overview' },
            { value: 'database', icon: Database, label: 'Database' },
            { value: 'security', icon: Shield, label: 'Security' },
            { value: 'dependencies', icon: Package, label: 'Dependencies' },
            { value: 'health', icon: TrendingUp, label: 'Health' }
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2 py-3">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-2">
            {/* File Distribution Chart */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileCode className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>File Type Distribution</CardTitle>
                    <CardDescription>Code composition analysis</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={fileTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {fileTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {fileTypeData.map((type, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: type.fill }} />
                      <span className="text-sm text-muted-foreground flex-1">{type.name}</span>
                      <span className="text-sm font-medium">{type.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quality Trends */}
            <Card className="border-secondary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <CardTitle>Code Quality Trends</CardTitle>
                    <CardDescription>4-week analysis</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsLineChart data={complexityTrends}>
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="complexity" stroke="hsl(var(--destructive))" strokeWidth={3} />
                    <Line type="monotone" dataKey="maintainability" stroke="hsl(var(--primary))" strokeWidth={3} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Code Health */}
          <Card className="border-accent/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent/10">
                  <CheckCircle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle>Code Health Analysis</CardTitle>
                  <CardDescription>Status breakdown by category</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={codeHealthData} layout="vertical">
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="healthy" stackId="a" fill="hsl(var(--chart-1))" name="Healthy" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="warnings" stackId="a" fill="hsl(var(--chart-3))" name="Warnings" />
                  <Bar dataKey="errors" stackId="a" fill="hsl(var(--chart-5))" name="Errors" />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-4 gap-4">
                {codeHealthData.map((item, idx) => (
                  <div key={idx} className="space-y-3 p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.category}</span>
                      <Badge variant="outline">{item.total}</Badge>
                    </div>
                    <Progress value={(item.healthy / item.total) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {((item.healthy / item.total) * 100).toFixed(0)}% healthy
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-4">
            {databaseTables.map((table, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-all duration-300 border-primary/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
                        <Database className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{table.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Active database table</p>
                      </div>
                    </div>
                    {table.hasRLS ? (
                      <Badge className="bg-gradient-to-r from-primary to-secondary">
                        <Lock className="h-3 w-3 mr-1" />
                        RLS Protected
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        No RLS!
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Layers className="h-3 w-3" />
                        Columns
                      </div>
                      <div className="text-2xl font-bold text-primary">{table.columns}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        Policies
                      </div>
                      <div className="text-2xl font-bold text-secondary">{table.policies}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Box className="h-3 w-3" />
                        Rows
                      </div>
                      <div className="text-2xl font-bold text-accent">{table.rows}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        Usage
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-bold">{table.usage}%</div>
                        <Progress value={table.usage} className="h-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Security Coverage</CardTitle>
                    <CardDescription>Overall security score: {projectStats.securityScore}%</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityData.map((metric, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{metric.name}</span>
                      <span className="font-bold">{metric.value}%</span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>RLS Policy Status</CardTitle>
                    <CardDescription>Row-level security implementation</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="text-3xl font-bold text-primary mb-2">38</div>
                    <div className="text-sm text-muted-foreground">Tables Protected</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20">
                    <div className="text-3xl font-bold text-destructive mb-2">2</div>
                    <div className="text-sm text-muted-foreground">Need Attention</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Security Best Practices</span>
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>✓ All user tables have RLS enabled</li>
                    <li>✓ Authentication properly configured</li>
                    <li>✓ API keys secured in vault</li>
                    <li>⚠ 2 tables need policy review</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dependencies Tab */}
        <TabsContent value="dependencies" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-accent/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle>Package Analysis</CardTitle>
                  <CardDescription>Top dependencies by size and usage</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {topDependencies.map((dep, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-2">{dep.name}</div>
                    <Progress value={dep.usage} className="h-2" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{dep.size}</div>
                    <div className="text-xs text-muted-foreground">{dep.usage}% used</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
                    <Gauge className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-4xl font-bold text-primary">{projectStats.healthScore}%</CardTitle>
                  <CardDescription>Overall Health</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-secondary/20">
              <CardHeader>
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-secondary/10 mb-3">
                    <Shield className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle className="text-4xl font-bold text-secondary">{projectStats.securityScore}%</CardTitle>
                  <CardDescription>Security Score</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-accent/10 mb-3">
                    <Zap className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="text-4xl font-bold text-accent">A+</CardTitle>
                  <CardDescription>Performance Grade</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Health Summary</CardTitle>
              <CardDescription>Key insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Excellent Code Quality</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Most components follow best practices with good maintainability scores
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg status-warning">
                <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Minor Issues Detected</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    6 components have warnings that should be addressed
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                <Braces className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Optimization Opportunities</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Remove unused imports and dependencies to reduce bundle size
                  </div>
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
