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
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, availability_status, last_seen_at')
        .eq('role', 'customer_service')
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
    <div className="space-y-6">
      {/* Admin Live Chat Header */}
      <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 border-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <MessageSquare className="h-8 w-8" />
                Live Chat Administration
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Monitor and manage customer support chat operations
              </p>
            </div>
            <Button 
              onClick={() => setShowChatManager(true)}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Open Chat Manager
            </Button>
          </div>

          {/* Admin Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.waitingSessions}</div>
                  <div className="text-muted-foreground text-sm">Waiting</div>
                </div>
              </div>
            </div>
            
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.activeSessions}</div>
                  <div className="text-muted-foreground text-sm">Active</div>
                </div>
              </div>
            </div>
            
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.totalSessions}</div>
                  <div className="text-muted-foreground text-sm">Total</div>
                </div>
              </div>
            </div>
            
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.resolvedToday}</div>
                  <div className="text-muted-foreground text-sm">Resolved Today</div>
                </div>
              </div>
            </div>

            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.onlineAgents}</div>
                  <div className="text-muted-foreground text-sm">Online Agents</div>
                </div>
              </div>
            </div>

            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.totalAgents}</div>
                  <div className="text-muted-foreground text-sm">Total Agents</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat Sessions
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Agents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoadingSessions ? (
                    <div className="text-center py-4 text-muted-foreground">Loading...</div>
                  ) : (
                    allSessions?.slice(0, 5).map(session => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                        <div>
                          <p className="font-medium">{session.customer_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.started_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(session.priority)}
                          {getStatusBadge(session.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Agent Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoadingAgents ? (
                    <div className="text-center py-4 text-muted-foreground">Loading...</div>
                  ) : (
                    agents?.slice(0, 5).map(agent => (
                      <div key={agent.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                        <div>
                          <p className="font-medium">{agent.full_name || 'No Name'}</p>
                          <p className="text-sm text-muted-foreground">{agent.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
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

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>All Chat Sessions</CardTitle>
            </CardHeader>
            <CardContent>
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

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Customer Service Agents</CardTitle>
            </CardHeader>
            <CardContent>
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
