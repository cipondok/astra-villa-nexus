import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, Clock, Users, MessageSquare } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const LiveChatAnalytics = () => {
  // Fetch chat analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['live-chat-analytics'],
    queryFn: async () => {
      // Get sessions for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: sessions, error } = await supabase
        .from('live_chat_sessions')
        .select('*')
        .gte('started_at', sevenDaysAgo.toISOString());
      
      if (error) throw error;
      
      // Process data for charts
      const dailyStats = sessions?.reduce((acc: any, session: any) => {
        const date = new Date(session.started_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, sessions: 0, resolved: 0, avgResponseTime: 0 };
        }
        acc[date].sessions += 1;
        if (session.status === 'resolved') {
          acc[date].resolved += 1;
        }
        return acc;
      }, {});
      
      const statusData = sessions?.reduce((acc: any, session: any) => {
        const status = session.status;
        const existing = acc.find((item: any) => item.name === status);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: status, value: 1 });
        }
        return acc;
      }, []);
      
      const priorityData = sessions?.reduce((acc: any, session: any) => {
        const priority = session.priority;
        const existing = acc.find((item: any) => item.name === priority);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: priority, value: 1 });
        }
        return acc;
      }, []);
      
      return {
        dailyStats: Object.values(dailyStats || {}),
        statusData: statusData || [],
        priorityData: priorityData || [],
        totalSessions: sessions?.length || 0,
        resolvedSessions: sessions?.filter((s: any) => s.status === 'resolved').length || 0,
        avgResolutionTime: 0, // Would need message data to calculate this
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading analytics...</div>
      </div>
    );
  }

  const resolutionRate = analyticsData?.totalSessions ? 
    ((analyticsData.resolvedSessions / analyticsData.totalSessions) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 mb-6">
            <TrendingUp className="h-8 w-8" />
            Live Chat Analytics
          </h1>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{analyticsData?.totalSessions}</div>
                  <div className="text-muted-foreground text-sm">Total Chats</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{resolutionRate}%</div>
                  <div className="text-muted-foreground text-sm">Resolution Rate</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">2.5m</div>
                  <div className="text-muted-foreground text-sm">Avg Response</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">4.8</div>
                  <div className="text-muted-foreground text-sm">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sessions Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Chat Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.dailyStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#3B82F6" />
                <Bar dataKey="resolved" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Chat Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.statusData || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {analyticsData?.statusData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.priorityData || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {analyticsData?.priorityData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Resolution Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.dailyStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveChatAnalytics;