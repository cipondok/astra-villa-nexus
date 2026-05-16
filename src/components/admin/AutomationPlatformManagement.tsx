import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Users, Building2, MessageCircle, FileText, Handshake,
  Bot, Settings, Play, Pause, RefreshCw, Plus, Clock,
  TrendingUp, CheckCircle2, AlertCircle, Activity, BarChart3,
  Webhook, Brain, Shield, Timer, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AutomationStats {
  usersOnboarded: number;
  listingsProcessed: number;
  messagesHandled: number;
  reportsGenerated: number;
  partnerActions: number;
}

const AutomationPlatformManagement: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock real-time stats
  const todayStats: AutomationStats = {
    usersOnboarded: 1247,
    listingsProcessed: 823,
    messagesHandled: 12456,
    reportsGenerated: 156,
    partnerActions: 89
  };

  const automationModules = [
    {
      id: 'onboarding',
      name: 'User Onboarding',
      icon: Users,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
      target: '1,000+/day',
      current: todayStats.usersOnboarded,
      status: 'active',
      successRate: 94.5,
      avgTime: '3.2 min'
    },
    {
      id: 'listings',
      name: 'Listing Processing',
      icon: Building2,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
      target: '5,000+/week',
      current: todayStats.listingsProcessed,
      status: 'active',
      successRate: 97.2,
      avgTime: '45 sec'
    },
    {
      id: 'messaging',
      name: 'Message Handling',
      icon: MessageCircle,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
      target: '10,000+/day',
      current: todayStats.messagesHandled,
      status: 'active',
      successRate: 99.1,
      avgTime: '2.1 sec'
    },
    {
      id: 'reports',
      name: 'Report Generation',
      icon: FileText,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
      target: '100+/day',
      current: todayStats.reportsGenerated,
      status: 'active',
      successRate: 100,
      avgTime: '12 sec'
    },
    {
      id: 'partners',
      name: 'Partner Management',
      icon: Handshake,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      target: '500+ active',
      current: todayStats.partnerActions,
      status: 'active',
      successRate: 98.5,
      avgTime: '5 sec'
    }
  ];

  const bots = [
    { id: '1', name: 'OnboardingBot', type: 'onboarding', status: 'active', interactions: 4521, satisfaction: 4.7 },
    { id: '2', name: 'SupportBot', type: 'support', status: 'active', interactions: 8934, satisfaction: 4.5 },
    { id: '3', name: 'SalesBot', type: 'sales', status: 'active', interactions: 2341, satisfaction: 4.8 },
    { id: '4', name: 'ModerationBot', type: 'moderation', status: 'active', interactions: 15672, satisfaction: 4.6 },
    { id: '5', name: 'ReportBot', type: 'reporting', status: 'active', interactions: 892, satisfaction: 4.9 }
  ];

  const zapierWorkflows = [
    { id: '1', name: 'New User Welcome Sequence', trigger: 'user_signup', status: 'active', executions: 1247 },
    { id: '2', name: 'Listing Approval Notification', trigger: 'listing_approved', status: 'active', executions: 823 },
    { id: '3', name: 'Partner Commission Alert', trigger: 'commission_earned', status: 'active', executions: 156 },
    { id: '4', name: 'Daily Report Distribution', trigger: 'scheduled', status: 'active', executions: 7 },
    { id: '5', name: 'High-Value Lead Alert', trigger: 'lead_qualified', status: 'active', executions: 342 }
  ];

  const taskQueue = [
    { id: '1', type: 'onboarding', status: 'processing', items: 45, started: '2 min ago' },
    { id: '2', type: 'listing_review', status: 'pending', items: 128, started: 'Queued' },
    { id: '3', type: 'message_response', status: 'processing', items: 234, started: '30 sec ago' },
    { id: '4', type: 'report_generation', status: 'completed', items: 12, started: 'Done' }
  ];

  const triggerZapierWebhook = async (workflowId: string) => {
    setIsProcessing(true);
    try {
      // Simulate Zapier webhook call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Webhook Triggered",
        description: "The Zapier workflow has been triggered successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger webhook",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Automation Platform
          </h1>
          <p className="text-muted-foreground">
            High-volume automation for onboarding, listings, messaging & reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Activity className="h-4 w-4" />
            View Logs
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {automationModules.map((module, idx) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className={cn("absolute inset-0 opacity-5", module.bgColor)} />
              <CardContent className="pt-4 relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("p-1.5 rounded-lg", module.bgColor)}>
                    <module.icon className={cn("h-4 w-4", module.color)} />
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {module.status}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{formatNumber(module.current)}</div>
                <div className="text-xs text-muted-foreground">{module.name}</div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Target: {module.target}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="bots">AI Bots</TabsTrigger>
          <TabsTrigger value="zapier">Zapier</TabsTrigger>
          <TabsTrigger value="queue">Task Queue</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Module Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Automation Performance</CardTitle>
                <CardDescription>Real-time success rates and processing times</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {automationModules.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <module.icon className={cn("h-4 w-4", module.color)} />
                        <span>{module.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{module.avgTime}</span>
                        <span className="font-medium">{module.successRate}%</span>
                      </div>
                    </div>
                    <Progress value={module.successRate} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common automation controls</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Play className="h-5 w-5 text-chart-1" />
                  <span>Run All Pending</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Pause className="h-5 w-5 text-chart-3" />
                  <span>Pause Queue</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <span>Retry Failed</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <BarChart3 className="h-5 w-5 text-chart-4" />
                  <span>Generate Report</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-chart-1/10 text-center">
                  <CheckCircle2 className="h-8 w-8 text-chart-1 mx-auto mb-2" />
                  <div className="text-lg font-semibold">99.9%</div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                </div>
                <div className="p-4 rounded-xl bg-primary/10 text-center">
                  <Timer className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-lg font-semibold">45ms</div>
                  <div className="text-xs text-muted-foreground">Avg Latency</div>
                </div>
                <div className="p-4 rounded-xl bg-chart-4/10 text-center">
                  <Activity className="h-8 w-8 text-chart-4 mx-auto mb-2" />
                  <div className="text-lg font-semibold">24.5K</div>
                  <div className="text-xs text-muted-foreground">Tasks Today</div>
                </div>
                <div className="p-4 rounded-xl bg-chart-3/10 text-center">
                  <AlertCircle className="h-8 w-8 text-chart-3 mx-auto mb-2" />
                  <div className="text-lg font-semibold">3</div>
                  <div className="text-xs text-muted-foreground">Pending Issues</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {automationModules.map((module, idx) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl", module.bgColor)}>
                          <module.icon className={cn("h-5 w-5", module.color)} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{module.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">Target: {module.target}</p>
                        </div>
                      </div>
                      <Switch checked={module.status === 'active'} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <div className="font-semibold">{module.successRate}%</div>
                        <div className="text-[10px] text-muted-foreground">Success Rate</div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <div className="font-semibold">{module.avgTime}</div>
                        <div className="text-[10px] text-muted-foreground">Avg Time</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Settings className="h-3.5 w-3.5" />
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* AI Bots Tab */}
        <TabsContent value="bots" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Custom AI Bots
                </CardTitle>
                <CardDescription>Automated assistants for various tasks</CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Bot
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bot Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Interactions</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bots.map((bot) => (
                    <TableRow key={bot.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        {bot.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{bot.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{bot.status}</Badge>
                      </TableCell>
                      <TableCell>{formatNumber(bot.interactions)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-chart-3">★</span>
                          {bot.satisfaction}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Activity className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zapier Tab */}
        <TabsContent value="zapier" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Zapier Workflows
                </CardTitle>
                <CardDescription>Connected Zapier automations</CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Connect Zap
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Executions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zapierWorkflows.map((workflow) => (
                    <TableRow key={workflow.id}>
                      <TableCell className="font-medium">{workflow.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{workflow.trigger}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{workflow.status}</Badge>
                      </TableCell>
                      <TableCell>{formatNumber(workflow.executions)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => triggerZapierWebhook(workflow.id)}
                            disabled={isProcessing}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Webhook Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Add Zapier Webhook</CardTitle>
              <CardDescription>Connect your Zapier automation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input placeholder="https://hooks.zapier.com/hooks/catch/..." />
              </div>
              <div className="space-y-2">
                <Label>Trigger Event</Label>
                <Input placeholder="e.g., user_signup, listing_created" />
              </div>
              <Button className="gap-2">
                <Webhook className="h-4 w-4" />
                Add Webhook
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Queue Tab */}
        <TabsContent value="queue" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Task Queue</CardTitle>
                <CardDescription>Real-time processing status</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pause All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taskQueue.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-lg",
                        task.status === 'processing' && "bg-primary/10",
                        task.status === 'pending' && "bg-chart-3/10",
                        task.status === 'completed' && "bg-chart-1/10"
                      )}>
                        {task.status === 'processing' && <RefreshCw className="h-5 w-5 text-primary animate-spin" />}
                        {task.status === 'pending' && <Clock className="h-5 w-5 text-chart-3" />}
                        {task.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-chart-1" />}
                      </div>
                      <div>
                        <div className="font-medium capitalize">{task.type.replace('_', ' ')}</div>
                        <div className="text-sm text-muted-foreground">{task.items} items • {task.started}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        task.status === 'processing' ? 'default' :
                        task.status === 'pending' ? 'secondary' : 'outline'
                      }>
                        {task.status}
                      </Badge>
                      {task.status !== 'completed' && (
                        <Button variant="ghost" size="sm">
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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

export default AutomationPlatformManagement;
