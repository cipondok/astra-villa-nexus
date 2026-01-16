import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAlert } from "@/contexts/AlertContext";
import { 
  MessageSquare, 
  Users, 
  Clock, 
  Activity, 
  TrendingUp, 
  AlertCircle,
  Eye,
  UserCheck,
  Ban
} from "lucide-react";
import LiveChatManager from "@/components/dashboard/LiveChatManager";
interface AdminChatSession {
  id: string;
  customer_user_id?: string | null;
  agent_user_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  status: string;
  priority: string;
  subject?: string | null;
  started_at: string;
  ended_at?: string | null;
  created_at: string;
}

interface AgentUser {
  id: string;
  email: string;
  full_name: string;
  availability_status?: string;
  last_seen_at?: string;
}

const LiveChatManagement = () => {
  const { showSuccess, showError } = useAlert();
  const [activeTab, setActiveTab] = useState("overview");
  const [showChatManager, setShowChatManager] = useState(false);

  // Fetch all chat sessions for admin oversight
  const { data: allSessions, isLoading: isLoadingSessions } = useQuery<AdminChatSession[]>({
    queryKey: ['admin-live-chat-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch customer service agents
  const { data: agents, isLoading: isLoadingAgents } = useQuery<AgentUser[]>({
    queryKey: ['customer-service-agents'],
    queryFn: async () => {
      // First get user IDs with customer_service role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'customer_service')
        .eq('is_active', true);

      if (roleError) throw roleError;
      
      const userIds = roleData?.map(r => r.user_id) || [];
      if (userIds.length === 0) return [];

      // Then get profiles for those users
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, availability_status, last_seen_at')
        .in('id', userIds)
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate stats
  const stats = {
    totalSessions: allSessions?.length || 0,
    waitingSessions: allSessions?.filter(s => s.status === 'waiting').length || 0,
    activeSessions: allSessions?.filter(s => s.status === 'active').length || 0,
    resolvedToday: allSessions?.filter(s => 
      s.status === 'resolved' && 
      new Date(s.ended_at || '').toDateString() === new Date().toDateString()
    ).length || 0,
    onlineAgents: agents?.filter(a => a.availability_status === 'online').length || 0,
    totalAgents: agents?.length || 0
  };
  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: "bg-red-500 text-white",
      high: "bg-orange-500 text-white",
      medium: "bg-blue-500 text-white",
      low: "bg-gray-500 text-white"
    };
    return (
      <Badge className={colors[priority as keyof typeof colors] || colors.medium}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      waiting: "bg-orange-100 text-orange-800",
      active: "bg-green-100 text-green-800",
      resolved: "bg-gray-100 text-gray-800"
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.waiting}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getAvailabilityBadge = (status?: string) => {
    const colors = {
      online: "bg-green-100 text-green-800",
      busy: "bg-yellow-100 text-yellow-800",
      offline: "bg-gray-100 text-gray-800"
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.offline}>
        {(status || 'offline').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-lg border border-green-200/50 dark:border-green-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold">Live Chat Administration</h2>
              <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 text-[9px] px-1.5 py-0 h-4">Live</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">Monitor and manage chat operations</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowChatManager(true)}
          size="sm"
          className="h-7 text-[10px]"
        >
          <Activity className="h-3 w-3 mr-1" />
          Chat Manager
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="p-2 rounded-lg border bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500/20 rounded flex items-center justify-center">
              <Clock className="h-3 w-3 text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{stats.waitingSessions}</div>
              <div className="text-[9px] text-muted-foreground">Waiting</div>
            </div>
          </div>
        </div>
        
        <div className="p-2 rounded-lg border bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
              <Activity className="h-3 w-3 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{stats.activeSessions}</div>
              <div className="text-[9px] text-muted-foreground">Active</div>
            </div>
          </div>
        </div>
        
        <div className="p-2 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
              <MessageSquare className="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{stats.totalSessions}</div>
              <div className="text-[9px] text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
        
        <div className="p-2 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
              <TrendingUp className="h-3 w-3 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{stats.resolvedToday}</div>
              <div className="text-[9px] text-muted-foreground">Resolved</div>
            </div>
          </div>
        </div>

        <div className="p-2 rounded-lg border bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-200/50 dark:border-cyan-800/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center">
              <UserCheck className="h-3 w-3 text-cyan-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{stats.onlineAgents}</div>
              <div className="text-[9px] text-muted-foreground">Online</div>
            </div>
          </div>
        </div>

        <div className="p-2 rounded-lg border bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-800/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-500/20 rounded flex items-center justify-center">
              <Users className="h-3 w-3 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{stats.totalAgents}</div>
              <div className="text-[9px] text-muted-foreground">Agents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 h-8 p-0.5 bg-muted/50">
          <TabsTrigger value="overview" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-400">
            <Activity className="h-3 w-3" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400">
            <MessageSquare className="h-3 w-3" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400">
            <Users className="h-3 w-3" />
            Agents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="border-orange-200/50 dark:border-orange-800/30">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500/20 rounded flex items-center justify-center">
                    <AlertCircle className="h-3 w-3 text-orange-600" />
                  </div>
                  <CardTitle className="text-xs">Recent Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {isLoadingSessions ? (
                    <div className="text-center py-3 text-[10px] text-muted-foreground">Loading...</div>
                  ) : (
                    allSessions?.slice(0, 5).map(session => (
                      <div key={session.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-[10px] font-medium">{session.customer_name}</p>
                          <p className="text-[9px] text-muted-foreground">
                            {new Date(session.started_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getPriorityBadge(session.priority)}
                          {getStatusBadge(session.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200/50 dark:border-purple-800/30">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                    <Users className="h-3 w-3 text-purple-600" />
                  </div>
                  <CardTitle className="text-xs">Agent Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {isLoadingAgents ? (
                    <div className="text-center py-3 text-[10px] text-muted-foreground">Loading...</div>
                  ) : (
                    agents?.slice(0, 5).map(agent => (
                      <div key={agent.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-[10px] font-medium">{agent.full_name || 'No Name'}</p>
                          <p className="text-[9px] text-muted-foreground">{agent.email}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getAvailabilityBadge(agent.availability_status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="mt-3">
          <Card className="border-blue-200/50 dark:border-blue-800/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                  <MessageSquare className="h-3 w-3 text-blue-600" />
                </div>
                <CardTitle className="text-xs">All Chat Sessions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {isLoadingSessions ? (
                <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSessions?.map(session => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{session.customer_name}</div>
                            <div className="text-sm text-muted-foreground">{session.customer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{session.subject || 'General Inquiry'}</TableCell>
                        <TableCell>{getPriorityBadge(session.priority)}</TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell>{new Date(session.started_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-3">
          <Card className="border-purple-200/50 dark:border-purple-800/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                  <Users className="h-3 w-3 text-purple-600" />
                </div>
                <CardTitle className="text-xs">Customer Service Agents</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {isLoadingAgents ? (
                <div className="text-center py-8 text-muted-foreground">Loading agents...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents?.map(agent => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{agent.full_name || 'No Name'}</div>
                            <div className="text-sm text-muted-foreground">{agent.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getAvailabilityBadge(agent.availability_status)}</TableCell>
                        <TableCell>
                          {agent.last_seen_at ? new Date(agent.last_seen_at).toLocaleString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live Chat Manager Modal */}
      <LiveChatManager 
        isOpen={showChatManager}
        onClose={() => setShowChatManager(false)}
      />
    </div>
  );
};

export default LiveChatManagement;
