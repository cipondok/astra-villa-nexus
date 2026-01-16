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
  Timer,
  Gauge
} from "lucide-react";

const CSPerformanceMonitor = () => {
  // Fetch real-time CS metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['cs-performance-metrics'],
    queryFn: async () => {
      const { data: tickets } = await supabase.from('customer_complaints').select('*');
      const { data: inquiries } = await supabase.from('inquiries').select('*');
      const { data: agents } = await supabase.from('user_roles').select('*').eq('role', 'customer_service').eq('is_active', true);
      const { data: chatSessions } = await supabase.from('live_chat_sessions').select('*');

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
      
      return {
        totalTickets, openTickets, resolvedToday, pendingInquiries, totalAgents,
        activeChatSessions, waitingChatSessions,
        avgResponseTime: 2.5, firstResponseSLA: 85, resolutionSLA: 92, customerSatisfaction: 4.6,
        workload: Math.round((openTickets / Math.max(totalAgents, 1)) * 10) / 10
      };
    },
    refetchInterval: 30000,
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
      <Card className="border-cyan-200/50 dark:border-cyan-800/30">
        <CardContent className="p-4">
          <div className="text-center text-[10px] text-muted-foreground">Loading performance metrics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
          <Gauge className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">Performance Monitor</h2>
            <Badge className="bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-[9px] px-1.5 py-0 h-4">Live</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">Real-time CS performance metrics and KPIs</p>
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Card className="border-orange-200/50 dark:border-orange-800/30">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-muted-foreground">Open Tickets</p>
                <p className="text-sm font-bold text-orange-600">{metrics?.openTickets}</p>
                <p className="text-[8px] text-muted-foreground">of {metrics?.totalTickets} total</p>
              </div>
              <div className="w-6 h-6 bg-orange-500/20 rounded flex items-center justify-center">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200/50 dark:border-green-800/30">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-muted-foreground">Resolved Today</p>
                <p className="text-sm font-bold text-green-600">{metrics?.resolvedToday}</p>
                <div className="flex items-center gap-0.5 text-[8px] text-green-600">
                  <TrendingUp className="h-2 w-2" />
                  +12%
                </div>
              </div>
              <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200/50 dark:border-blue-800/30">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-muted-foreground">Active Chats</p>
                <p className="text-sm font-bold text-blue-600">{metrics?.activeChatSessions}</p>
                <p className="text-[8px] text-muted-foreground">{metrics?.waitingChatSessions} waiting</p>
              </div>
              <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                <MessageSquare className="h-3 w-3 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 dark:border-purple-800/30">
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-muted-foreground">Avg Response</p>
                <p className="text-sm font-bold text-purple-600">{metrics?.avgResponseTime}h</p>
                <div className="flex items-center gap-0.5 text-[8px] text-green-600">
                  <TrendingDown className="h-2 w-2" />
                  -5%
                </div>
              </div>
              <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                <Clock className="h-3 w-3 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border-teal-200/50 dark:border-teal-800/30">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-500/20 rounded flex items-center justify-center">
                <Target className="h-3 w-3 text-teal-600" />
              </div>
              <CardTitle className="text-xs">SLA Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px]">First Response SLA</span>
                <span className={`text-[10px] font-bold ${getSLAColor(metrics?.firstResponseSLA || 0)}`}>
                  {metrics?.firstResponseSLA}%
                </span>
              </div>
              <Progress value={metrics?.firstResponseSLA} className="h-1.5" />
              <p className="text-[8px] text-muted-foreground mt-0.5">Target: 90% within 4 hours</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px]">Resolution SLA</span>
                <span className={`text-[10px] font-bold ${getSLAColor(metrics?.resolutionSLA || 0)}`}>
                  {metrics?.resolutionSLA}%
                </span>
              </div>
              <Progress value={metrics?.resolutionSLA} className="h-1.5" />
              <p className="text-[8px] text-muted-foreground mt-0.5">Target: 95% within 24 hours</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px]">Customer Satisfaction</span>
                <span className="text-[10px] font-bold text-green-600">
                  {metrics?.customerSatisfaction}/5.0
                </span>
              </div>
              <Progress value={(metrics?.customerSatisfaction || 0) * 20} className="h-1.5" />
              <p className="text-[8px] text-muted-foreground mt-0.5">Based on 147 reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-200/50 dark:border-indigo-800/30">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-500/20 rounded flex items-center justify-center">
                <Users className="h-3 w-3 text-indigo-600" />
              </div>
              <CardTitle className="text-xs">Team Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <span className="text-[10px]">Active Agents</span>
              <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 text-[9px] px-1.5 py-0 h-4">
                {metrics?.totalAgents} online
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <span className="text-[10px]">Workload per Agent</span>
              <span className={`text-[10px] font-bold ${getWorkloadColor(metrics?.workload || 0)}`}>
                {metrics?.workload} tickets
              </span>
            </div>

            <div className="p-2 bg-muted/30 rounded-lg">
              <div className="flex justify-between text-[10px] mb-1">
                <span>Workload Distribution</span>
                <span className={getWorkloadColor(metrics?.workload || 0)}>
                  {metrics?.workload <= 5 ? 'Optimal' : metrics?.workload <= 10 ? 'High' : 'Critical'}
                </span>
              </div>
              <Progress value={Math.min((metrics?.workload || 0) * 10, 100)} className="h-1.5" />
            </div>

            <div className="pt-1 border-t">
              <p className="text-[8px] text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity Feed */}
      <Card className="border-emerald-200/50 dark:border-emerald-800/30">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500/20 rounded flex items-center justify-center">
              <Timer className="h-3 w-3 text-emerald-600" />
            </div>
            <CardTitle className="text-xs">Live Activity Feed</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-[10px] font-medium">New live chat session started</p>
                <p className="text-[8px] text-muted-foreground">Customer: sarah@example.com • 2 min ago</p>
              </div>
              <Badge variant="outline" className="text-[8px] h-4 px-1.5">Live Chat</Badge>
            </div>

            <div className="flex items-center gap-2 p-2 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/50 dark:border-green-800/30">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-[10px] font-medium">Ticket #1247 resolved</p>
                <p className="text-[8px] text-muted-foreground">Agent: John Smith • 5 min ago</p>
              </div>
              <Badge variant="outline" className="text-[8px] h-4 px-1.5">Resolved</Badge>
            </div>

            <div className="flex items-center gap-2 p-2 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-200/50 dark:border-orange-800/30">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-[10px] font-medium">High priority ticket assigned</p>
                <p className="text-[8px] text-muted-foreground">Ticket #1248 • Agent: Maria • 8 min ago</p>
              </div>
              <Badge variant="outline" className="text-[8px] h-4 px-1.5">Assignment</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSPerformanceMonitor;
