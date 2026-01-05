import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, FileCode, Package, AlertTriangle, CheckCircle,
  TrendingUp, Eye, Shield, Layers, Activity, Zap,
  Users, Lock, Code, Gauge, Box, RefreshCw,
  Building2, UserCheck, Bell, Rocket, Clock, Target,
  CheckCircle2, CircleDashed, Play, Pause, MapPin,
  Server, Globe, CreditCard, MessageSquare, Settings,
  BarChart3, ShieldCheck, Smartphone, Mail, CalendarDays, Star
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, BarChart, Bar, AreaChart, Area
} from 'recharts';
import { useProjectAnalytics } from '@/hooks/useProjectAnalytics';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModuleStatus {
  name: string;
  icon: any;
  progress: number;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  tasks: { name: string; done: boolean }[];
}

const ProjectMapVisualization = () => {
  const [selectedView, setSelectedView] = useState('roadmap');
  const { data: analytics, isLoading, refetch, isFetching } = useProjectAnalytics();
  const [lastAutoUpdate, setLastAutoUpdate] = useState<Date>(new Date());
  
  // Real-time subscriptions for auto-updates
  useEffect(() => {
    const channels = [
      supabase.channel('project-map-bookings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'property_bookings' }, () => {
          refetch();
          setLastAutoUpdate(new Date());
          toast.success('Booking data updated', { duration: 2000 });
        })
        .subscribe(),
      supabase.channel('project-map-reviews')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'property_reviews' }, () => {
          refetch();
          setLastAutoUpdate(new Date());
          toast.success('Review data updated', { duration: 2000 });
        })
        .subscribe(),
      supabase.channel('project-map-properties')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
          refetch();
          setLastAutoUpdate(new Date());
        })
        .subscribe(),
      supabase.channel('project-map-profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          refetch();
          setLastAutoUpdate(new Date());
        })
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [refetch]);
  
  // Project modules with actual progress - UPDATED with new features
  const projectModules: ModuleStatus[] = [
    {
      name: 'Authentication & Security',
      icon: ShieldCheck,
      progress: 100,
      status: 'completed',
      priority: 'critical',
      tasks: [
        { name: 'Email/password auth', done: true },
        { name: 'Session management', done: true },
        { name: 'RLS policies', done: true },
        { name: 'Password reset flow', done: true }
      ]
    },
    {
      name: 'User Management',
      icon: Users,
      progress: 100,
      status: 'completed',
      priority: 'critical',
      tasks: [
        { name: 'User registration', done: true },
        { name: 'Profile management', done: true },
        { name: 'Role-based access', done: true },
        { name: 'KYC verification', done: true },
        { name: 'User levels system', done: true }
      ]
    },
    {
      name: 'Property System',
      icon: Building2,
      progress: 95,
      status: 'completed',
      priority: 'critical',
      tasks: [
        { name: 'Property listings', done: true },
        { name: 'Search & filters', done: true },
        { name: 'Property details', done: true },
        { name: 'Image gallery', done: true },
        { name: 'Property reviews', done: true },
        { name: '3D views integration', done: false }
      ]
    },
    {
      name: 'Booking System',
      icon: CalendarDays,
      progress: 100,
      status: 'completed',
      priority: 'critical',
      tasks: [
        { name: 'Property booking requests', done: true },
        { name: 'Booking management', done: true },
        { name: 'Admin booking controls', done: true },
        { name: 'Booking notifications', done: true },
        { name: 'Booking calendar', done: true }
      ]
    },
    {
      name: 'Review & Rating System',
      icon: Star,
      progress: 100,
      status: 'completed',
      priority: 'high',
      tasks: [
        { name: 'Property reviews', done: true },
        { name: 'Star ratings', done: true },
        { name: 'Review voting', done: true },
        { name: 'Review moderation', done: true },
        { name: 'Vendor reviews', done: true }
      ]
    },
    {
      name: 'Vendor Platform',
      icon: Server,
      progress: 92,
      status: 'completed',
      priority: 'high',
      tasks: [
        { name: 'Vendor registration', done: true },
        { name: 'Service management', done: true },
        { name: 'Booking system', done: true },
        { name: 'Reviews & ratings', done: true },
        { name: 'Analytics dashboard', done: false }
      ]
    },
    {
      name: 'Payment Integration',
      icon: CreditCard,
      progress: 70,
      status: 'in-progress',
      priority: 'critical',
      tasks: [
        { name: 'Payment gateway setup', done: true },
        { name: 'Transaction processing', done: true },
        { name: 'Refund handling', done: false },
        { name: 'Invoice generation', done: false },
        { name: 'Payment history', done: true }
      ]
    },
    {
      name: 'Admin Dashboard',
      icon: Settings,
      progress: 98,
      status: 'completed',
      priority: 'high',
      tasks: [
        { name: 'Overview dashboard', done: true },
        { name: 'User management', done: true },
        { name: 'Content management', done: true },
        { name: 'Booking management', done: true },
        { name: 'Analytics views', done: true },
        { name: 'System settings', done: true }
      ]
    },
    {
      name: 'Email Notifications',
      icon: Mail,
      progress: 100,
      status: 'completed',
      priority: 'high',
      tasks: [
        { name: 'Email templates', done: true },
        { name: 'Booking notifications', done: true },
        { name: 'Review notifications', done: true },
        { name: 'Welcome emails', done: true },
        { name: 'Email logs', done: true }
      ]
    },
    {
      name: 'AI Features',
      icon: MessageSquare,
      progress: 85,
      status: 'in-progress',
      priority: 'medium',
      tasks: [
        { name: 'AI chatbot', done: true },
        { name: 'Property recommendations', done: true },
        { name: 'Smart search', done: true },
        { name: 'Voice commands', done: false }
      ]
    },
    {
      name: 'Communication',
      icon: Bell,
      progress: 90,
      status: 'completed',
      priority: 'high',
      tasks: [
        { name: 'Email notifications', done: true },
        { name: 'In-app notifications', done: true },
        { name: 'Live chat', done: true },
        { name: 'SMS integration', done: false }
      ]
    },
    {
      name: 'Mobile Optimization',
      icon: Smartphone,
      progress: 90,
      status: 'completed',
      priority: 'high',
      tasks: [
        { name: 'Responsive design', done: true },
        { name: 'Touch gestures', done: true },
        { name: 'PWA support', done: true },
        { name: 'Offline mode', done: false }
      ]
    },
    {
      name: 'Analytics & Reporting',
      icon: BarChart3,
      progress: 88,
      status: 'in-progress',
      priority: 'medium',
      tasks: [
        { name: 'Traffic analytics', done: true },
        { name: 'User behavior', done: true },
        { name: 'Property insights', done: true },
        { name: 'Export reports', done: false }
      ]
    }
  ];

  // Development phases
  const developmentPhases = [
    { phase: 'Foundation', progress: 100, status: 'completed', weeks: '1-4' },
    { phase: 'Core Features', progress: 100, status: 'completed', weeks: '5-12' },
    { phase: 'Advanced Features', progress: 85, status: 'in-progress', weeks: '13-20' },
    { phase: 'Testing & QA', progress: 60, status: 'in-progress', weeks: '21-24' },
    { phase: 'Launch Prep', progress: 40, status: 'pending', weeks: '25-26' },
    { phase: 'Post-Launch', progress: 0, status: 'pending', weeks: '27+' }
  ];

  // Pre-launch checklist
  const launchChecklist = [
    { category: 'Security', items: [
      { name: 'All RLS policies verified', done: true },
      { name: 'API rate limiting', done: true },
      { name: 'SQL injection prevention', done: true },
      { name: 'XSS protection', done: true },
      { name: 'HTTPS enforced', done: true }
    ]},
    { category: 'Performance', items: [
      { name: 'Image optimization', done: true },
      { name: 'Code splitting', done: true },
      { name: 'Lazy loading', done: true },
      { name: 'CDN configured', done: false },
      { name: 'Caching strategy', done: false }
    ]},
    { category: 'Testing', items: [
      { name: 'Unit tests', done: false },
      { name: 'E2E tests', done: false },
      { name: 'Cross-browser testing', done: false },
      { name: 'Mobile testing', done: true },
      { name: 'Load testing', done: false }
    ]},
    { category: 'Operations', items: [
      { name: 'Error monitoring', done: true },
      { name: 'Backup strategy', done: true },
      { name: 'Domain configured', done: false },
      { name: 'SSL certificate', done: true },
      { name: 'Analytics setup', done: true }
    ]}
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">Loading project map...</p>
        </div>
      </div>
    );
  }

  const realtimeStats = analytics?.realtimeStats || { totalUsers: 0, totalProperties: 0, pendingUpgrades: 0, activeAlerts: 0, recentActivity: 0, totalVendors: 0 };
  const projectStats = analytics?.statistics || { healthScore: 85, securityScore: 90, databaseTables: 0 };
  const overallProgress = Math.round(projectModules.reduce((sum, m) => sum + m.progress, 0) / projectModules.length);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
      case 'in-progress': return <Play className="h-3.5 w-3.5 text-blue-500" />;
      case 'pending': return <CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'blocked': return <Pause className="h-3.5 w-3.5 text-red-500" />;
      default: return <CircleDashed className="h-3.5 w-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'pending': return 'bg-muted/50 text-muted-foreground border-border';
      case 'blocked': return 'bg-red-500/10 text-red-600 border-red-500/30';
      default: return 'bg-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-600';
      case 'high': return 'bg-orange-500/10 text-orange-600';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600';
      case 'low': return 'bg-green-500/10 text-green-600';
      default: return 'bg-muted';
    }
  };

  // Charts data
  const moduleProgressData = projectModules.map(m => ({
    name: m.name.split(' ')[0],
    progress: m.progress,
    fill: m.status === 'completed' ? 'hsl(var(--chart-1))' : m.status === 'in-progress' ? 'hsl(var(--chart-2))' : 'hsl(var(--muted))'
  }));

  const phaseData = developmentPhases.map(p => ({
    name: p.phase.split(' ')[0],
    progress: p.progress,
    fill: p.status === 'completed' ? 'hsl(142, 76%, 36%)' : p.status === 'in-progress' ? 'hsl(217, 91%, 60%)' : 'hsl(var(--muted))'
  }));

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-lg border border-border/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Project Roadmap & Status
                </h1>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Development progress • Updated {formatDistanceToNow(lastAutoUpdate, { addSuffix: true })}
                <Badge variant="outline" className="ml-2 text-[8px] h-4 px-1 bg-green-500/10 text-green-600 border-green-500/30">
                  <span className="animate-pulse mr-1">●</span> Live
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching} className="h-5 px-1.5 ml-1">
                  <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
                </Button>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[9px] text-muted-foreground">Overall Progress</div>
                <div className="text-2xl font-bold text-primary">{overallProgress}%</div>
              </div>
              <div className="h-12 w-12 rounded-full border-4 border-primary/30 flex items-center justify-center">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { icon: CheckCircle2, label: 'Completed', value: projectModules.filter(m => m.status === 'completed').length, color: 'text-green-500' },
              { icon: Play, label: 'In Progress', value: projectModules.filter(m => m.status === 'in-progress').length, color: 'text-blue-500' },
              { icon: Target, label: 'Modules', value: projectModules.length, color: 'text-purple-500' },
              { icon: Users, label: 'Users', value: realtimeStats.totalUsers, color: 'text-orange-500' },
              { icon: Building2, label: 'Properties', value: realtimeStats.totalProperties, color: 'text-primary' },
              { icon: Shield, label: 'Security', value: `${projectStats.securityScore}%`, color: 'text-green-500' }
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
        <TabsList className="grid w-full grid-cols-4 h-8">
          {[
            { value: 'roadmap', icon: MapPin, label: 'Roadmap' },
            { value: 'modules', icon: Layers, label: 'Modules' },
            { value: 'checklist', icon: CheckCircle, label: 'Checklist' },
            { value: 'analytics', icon: BarChart3, label: 'Analytics' }
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs py-1.5">
              <tab.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Development Phases */}
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Development Phases</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {developmentPhases.map((phase, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-24 flex items-center gap-1.5">
                      {getStatusIcon(phase.status)}
                      <span className="text-xs font-medium truncate">{phase.phase}</span>
                    </div>
                    <div className="flex-1">
                      <Progress value={phase.progress} className="h-2" />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-[10px] text-muted-foreground">Week {phase.weeks}</span>
                    </div>
                    <Badge className={`text-[9px] h-4 px-1.5 ${getStatusColor(phase.status)}`}>
                      {phase.progress}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Phase Progress Chart */}
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm">Phase Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={phaseData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={60} />
                  <Tooltip contentStyle={{ fontSize: '10px', padding: '4px 8px' }} />
                  <Bar dataKey="progress" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Next Actions */}
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                <CardTitle className="text-sm">Priority Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid gap-2 md:grid-cols-2">
                {[
                  { task: 'Complete payment refund handling', priority: 'critical', module: 'Payments' },
                  { task: 'Configure CDN for production', priority: 'high', module: 'Performance' },
                  { task: 'Set up E2E testing suite', priority: 'high', module: 'Testing' },
                  { task: 'Configure custom domain', priority: 'medium', module: 'Operations' }
                ].map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-md border border-border/30 hover:bg-muted/20 transition-colors">
                    <CircleDashed className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{action.task}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge className={`text-[8px] h-3.5 px-1 ${getPriorityColor(action.priority)}`}>
                          {action.priority}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">{action.module}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <ScrollArea className="h-[500px]">
            <div className="grid gap-2">
              {projectModules.map((module, idx) => (
                <Card key={idx} className="border-border/30 hover:shadow-sm transition-all">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${getStatusColor(module.status)}`}>
                          <module.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{module.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {getStatusIcon(module.status)}
                            <span className="text-[10px] text-muted-foreground capitalize">{module.status.replace('-', ' ')}</span>
                            <Badge className={`text-[8px] h-3.5 px-1 ml-1 ${getPriorityColor(module.priority)}`}>
                              {module.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{module.progress}%</div>
                        <div className="text-[9px] text-muted-foreground">
                          {module.tasks.filter(t => t.done).length}/{module.tasks.length} tasks
                        </div>
                      </div>
                    </div>
                    
                    <Progress value={module.progress} className="h-1.5 mb-2" />
                    
                    <div className="grid grid-cols-2 gap-1">
                      {module.tasks.map((task, tidx) => (
                        <div key={tidx} className="flex items-center gap-1.5 text-[10px]">
                          {task.done ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                          ) : (
                            <CircleDashed className="h-3 w-3 text-muted-foreground shrink-0" />
                          )}
                          <span className={task.done ? 'text-muted-foreground line-through' : ''}>{task.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-3 md:grid-cols-2">
            {launchChecklist.map((category, idx) => {
              const completedCount = category.items.filter(i => i.done).length;
              const progress = Math.round((completedCount / category.items.length) * 100);
              
              return (
                <Card key={idx} className="border-border/30">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{category.category}</CardTitle>
                      <Badge className={progress === 100 ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}>
                        {completedCount}/{category.items.length}
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-1 mt-1" />
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-1">
                      {category.items.map((item, iidx) => (
                        <div key={iidx} className="flex items-center gap-2 text-xs">
                          {item.done ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          ) : (
                            <CircleDashed className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                          <span className={item.done ? 'text-muted-foreground' : ''}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Launch Readiness Score */}
          <Card className="border-border/30 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Launch Readiness</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {launchChecklist.reduce((sum, c) => sum + c.items.filter(i => i.done).length, 0)} of{' '}
                    {launchChecklist.reduce((sum, c) => sum + c.items.length, 0)} items completed
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-primary">
                    {Math.round((launchChecklist.reduce((sum, c) => sum + c.items.filter(i => i.done).length, 0) / 
                      launchChecklist.reduce((sum, c) => sum + c.items.length, 0)) * 100)}%
                  </div>
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-3 md:grid-cols-2">
            {/* Module Progress Chart */}
            <Card className="border-border/30">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm">Module Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={moduleProgressData}>
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-45} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ fontSize: '10px', padding: '4px 8px' }} />
                    <Bar dataKey="progress" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="border-border/30">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: projectModules.filter(m => m.status === 'completed').length, fill: 'hsl(142, 76%, 36%)' },
                        { name: 'In Progress', value: projectModules.filter(m => m.status === 'in-progress').length, fill: 'hsl(217, 91%, 60%)' },
                        { name: 'Pending', value: projectModules.filter(m => m.status === 'pending').length, fill: 'hsl(var(--muted))' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px', padding: '4px 8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {[
                    { label: 'Completed', color: 'bg-green-500' },
                    { label: 'In Progress', color: 'bg-blue-500' },
                    { label: 'Pending', color: 'bg-muted' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${item.color}`} />
                      <span className="text-[9px] text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Database Stats */}
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Database Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: 'Tables', value: projectStats.databaseTables, icon: Database },
                  { label: 'Users', value: realtimeStats.totalUsers, icon: Users },
                  { label: 'Properties', value: realtimeStats.totalProperties, icon: Building2 },
                  { label: 'Vendors', value: realtimeStats.totalVendors, icon: Server }
                ].map((stat, idx) => (
                  <div key={idx} className="p-2 rounded-md bg-muted/30 border border-border/30 text-center">
                    <stat.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-[9px] text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectMapVisualization;
