import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Target,
  Timer
} from "lucide-react";

const CSPerformanceMonitor = () => {
  // Fetch real-time CS metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['cs-performance-metrics'],
    queryFn: async () => {
      // Get tickets data
      const { data: tickets } = await supabase
        .from('customer_complaints')
        .select('*');
      
      // Get inquiries data
      const { data: inquiries } = await supabase
        .from('inquiries')
        .select('*');
        
      // Get CS agents
      const { data: agents } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer_service');

      // Get live chat sessions
      const { data: chatSessions } = await supabase
        .from('live_chat_sessions')
        .select('*');

      // Calculate metrics
      const today = new Date().toDateString();
      const totalTickets = tickets?.length || 0;
      const openTickets = tickets?.filter(t => t.status === 'open').length || 0;
      const resolvedToday = tickets?.filter(t => 
        t.status === 'resolved' && 
        new Date(t.resolved_at || '').toDateString() === today
      ).length || 0;
      
      const pendingInquiries = inquiries?.filter(i => i.status === 'new' || i.status === 'pending').length || 0;
      const totalAgents = agents?.length || 0;
      
      const activeChatSessions = chatSessions?.filter(s => s.status === 'active').length || 0;
      const waitingChatSessions = chatSessions?.filter(s => s.status === 'waiting').length || 0;
      
      // Calculate SLA metrics (example calculations)
      const avgResponseTime = 2.5; // hours
      const firstResponseSLA = 85; // percentage
      const resolutionSLA = 92; // percentage
      const customerSatisfaction = 4.6; // out of 5
      
      return {
        totalTickets,
        openTickets,
        resolvedToday,
        pendingInquiries,
        totalAgents,
        activeChatSessions,
        waitingChatSessions,
        avgResponseTime,
        firstResponseSLA,
        resolutionSLA,
        customerSatisfaction,
        workload: Math.round((openTickets / Math.max(totalAgents, 1)) * 10) / 10
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getSLAColor = (percentage: number) => {
    if (percentage >= 95) return "text-green-600";
    if (percentage >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  const getWorkloadColor = (workload: number) => {
    if (workload <= 5) return "text-green-600";
    if (workload <= 10) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading performance metrics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Performance Monitor
          </CardTitle>
          <CardDescription>
            Live customer service performance metrics and KPIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Real-time Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Tickets</p>
                    <p className="text-2xl font-bold text-orange-600">{metrics?.openTickets}</p>
                    <p className="text-xs text-muted-foreground">of {metrics?.totalTickets} total</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved Today</p>
                    <p className="text-2xl font-bold text-green-600">{metrics?.resolvedToday}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      +12% vs yesterday
                    </div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Chats</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics?.activeChatSessions}</p>
                    <p className="text-xs text-muted-foreground">{metrics?.waitingChatSessions} waiting</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                    <p className="text-2xl font-bold text-purple-600">{metrics?.avgResponseTime}h</p>
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <TrendingDown className="h-3 w-3" />
                      -5% improvement
                    </div>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SLA Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  SLA Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">First Response SLA</span>
                    <span className={`text-sm font-bold ${getSLAColor(metrics?.firstResponseSLA || 0)}`}>
                      {metrics?.firstResponseSLA}%
                    </span>
                  </div>
                  <Progress value={metrics?.firstResponseSLA} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Target: 90% within 4 hours</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Resolution SLA</span>
                    <span className={`text-sm font-bold ${getSLAColor(metrics?.resolutionSLA || 0)}`}>
                      {metrics?.resolutionSLA}%
                    </span>
                  </div>
                  <Progress value={metrics?.resolutionSLA} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Target: 95% within 24 hours</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm font-bold text-green-600">
                      {metrics?.customerSatisfaction}/5.0
                    </span>
                  </div>
                  <Progress value={(metrics?.customerSatisfaction || 0) * 20} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Based on 147 reviews this month</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Agents</span>
                  <Badge className="bg-green-500 text-white">
                    {metrics?.totalAgents} online
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Workload per Agent</span>
                  <span className={`text-sm font-bold ${getWorkloadColor(metrics?.workload || 0)}`}>
                    {metrics?.workload} tickets/agent
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Workload Distribution</span>
                    <span className={getWorkloadColor(metrics?.workload || 0)}>
                      {metrics?.workload <= 5 ? 'Optimal' : 
                       metrics?.workload <= 10 ? 'High' : 'Critical'}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((metrics?.workload || 0) * 10, 100)} 
                    className="h-2"
                  />
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Live Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New live chat session started</p>
                    <p className="text-xs text-muted-foreground">Customer: sarah@example.com • 2 minutes ago</p>
                  </div>
                  <Badge variant="outline">Live Chat</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Ticket #1247 resolved</p>
                    <p className="text-xs text-muted-foreground">Agent: John Smith • 5 minutes ago</p>
                  </div>
                  <Badge variant="outline">Resolved</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">High priority ticket assigned</p>
                    <p className="text-xs text-muted-foreground">Ticket #1248 • Agent: Maria Garcia • 8 minutes ago</p>
                  </div>
                  <Badge variant="outline">Assignment</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Automation rule triggered</p>
                    <p className="text-xs text-muted-foreground">Rule: "Auto-assign billing tickets" • 12 minutes ago</p>
                  </div>
                  <Badge variant="outline">Automation</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSPerformanceMonitor;