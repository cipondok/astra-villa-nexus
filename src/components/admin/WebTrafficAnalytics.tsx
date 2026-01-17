
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Search, 
  Globe,
  MousePointer,
  Clock,
  Smartphone,
  Monitor,
  Tablet
} from "lucide-react";

const WebTrafficAnalytics = () => {
  const [timeRange, setTimeRange] = useState("7");

  // Fetch and aggregate web analytics data
  const { data: dailyStats, isLoading: dailyLoading } = useQuery({
    queryKey: ['web-analytics-aggregated', timeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('web_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Aggregate data by date
      const aggregated = (data || []).reduce((acc: any, record) => {
        const date = new Date(record.created_at).toISOString().split('T')[0];
        
        if (!acc[date]) {
          acc[date] = {
            date,
            total_visitors: 0,
            unique_visitors: new Set(),
            total_page_views: 0,
            total_searches: 0,
            new_users: new Set(),
            returning_users: new Set(),
          };
        }

        acc[date].total_visitors += 1;
        acc[date].total_page_views += 1;
        if (record.visitor_id) acc[date].unique_visitors.add(record.visitor_id);
        if (record.user_id) {
          // Simple heuristic: if we haven't seen this user before, they're new
          const isNewUser = !Object.values(acc).some((day: any) => 
            day.date < date && (day.new_users.has(record.user_id) || day.returning_users.has(record.user_id))
          );
          if (isNewUser) {
            acc[date].new_users.add(record.user_id);
          } else {
            acc[date].returning_users.add(record.user_id);
          }
        }

        return acc;
      }, {});

      // Convert to array and finalize counts
      return Object.values(aggregated).map((day: any) => ({
        date: day.date,
        total_visitors: day.total_visitors,
        unique_visitors: day.unique_visitors.size,
        total_page_views: day.total_page_views,
        total_searches: day.total_searches,
        new_users: day.new_users.size,
        returning_users: day.returning_users.size,
      }));
    },
  });

  // Fetch top search keywords from page paths
  const { data: topKeywords } = useQuery({
    queryKey: ['top-keywords', timeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('web_analytics')
        .select('page_path')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .ilike('page_path', '%search%');

      if (error) throw error;

      // Extract search terms from URLs (if they have query params)
      const searchTerms = (data || [])
        .map(item => {
          const url = new URL(`http://example.com${item.page_path}`);
          return url.searchParams.get('q') || url.searchParams.get('search');
        })
        .filter(Boolean);

      // Count occurrences
      const keywordCounts = searchTerms.reduce((acc: any, term) => {
        const query = (term || '').toLowerCase();
        if (query) acc[query] = (acc[query] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(keywordCounts)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10);
    },
  });

  // Fetch device analytics
  const { data: deviceStats } = useQuery({
    queryKey: ['device-analytics', timeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('web_analytics')
        .select('device_type')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const deviceCounts = data?.reduce((acc: any, item) => {
        const device = item.device_type || 'Unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {}) || {};

      return Object.entries(deviceCounts).map(([device, count]) => ({
        name: device,
        value: count as number
      }));
    },
  });

  // Fetch page analytics
  const { data: pageStats } = useQuery({
    queryKey: ['page-analytics', timeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('web_analytics')
        .select('page_path')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const pageCounts = data?.reduce((acc: any, item) => {
        const path = item.page_path || '/';
        acc[path] = (acc[path] || 0) + 1;
        return acc;
      }, {}) || {};

      return Object.entries(pageCounts)
        .map(([path, views]) => ({ path, views }))
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, 10);
    },
  });

  // Calculate totals
  const totalVisitors = dailyStats?.reduce((sum, day) => sum + (day.total_visitors || 0), 0) || 0;
  const uniqueVisitors = dailyStats?.reduce((sum, day) => sum + (day.unique_visitors || 0), 0) || 0;
  const totalPageViews = dailyStats?.reduce((sum, day) => sum + (day.total_page_views || 0), 0) || 0;
  const totalSearches = dailyStats?.reduce((sum, day) => sum + (day.total_searches || 0), 0) || 0;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (dailyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Web Traffic Analytics</h2>
            <p className="text-[10px] text-muted-foreground">Comprehensive website traffic and user behavior analytics</p>
          </div>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-28 h-7 text-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7" className="text-xs">Last 7 days</SelectItem>
            <SelectItem value="30" className="text-xs">Last 30 days</SelectItem>
            <SelectItem value="90" className="text-xs">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="p-2 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
              <Users className="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{totalVisitors.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">Total Visitors</div>
            </div>
          </div>
        </div>
        
        <div className="p-2 rounded-lg border bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
              <Globe className="h-3 w-3 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{uniqueVisitors.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">Unique Visitors</div>
            </div>
          </div>
        </div>
        
        <div className="p-2 rounded-lg border bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200/50 dark:border-yellow-800/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center">
              <Eye className="h-3 w-3 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{totalPageViews.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">Page Views</div>
            </div>
          </div>
        </div>
        
        <div className="p-2 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
              <Search className="h-3 w-3 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{totalSearches.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">Total Searches</div>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Trends Chart */}
      <Card className="border-blue-200/50 dark:border-blue-800/30">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-blue-600" />
            Traffic Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: '10px' }} />
              <Area 
                type="monotone" 
                dataKey="total_visitors" 
                stackId="1"
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
                name="Total Visitors"
              />
              <Area 
                type="monotone" 
                dataKey="unique_visitors" 
                stackId="2"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name="Unique Visitors"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Search Analytics and Device Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Top Search Keywords */}
        <Card className="border-purple-200/50 dark:border-purple-800/30">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Search className="h-3 w-3 text-purple-600" />
              Top Search Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-1.5">
              {topKeywords?.map((item: any, index) => (
                <div key={index} className="flex items-center justify-between p-1.5 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] h-4 px-1">
                      #{index + 1}
                    </Badge>
                    <span className="text-[10px] font-medium">{item.keyword}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">
                    {item.count} searches
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Analytics */}
        <Card className="border-cyan-200/50 dark:border-cyan-800/30">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Monitor className="h-3 w-3 text-cyan-600" />
              Device Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={deviceStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {deviceStats?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card className="border-green-200/50 dark:border-green-800/30">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <MousePointer className="h-3 w-3 text-green-600" />
            Most Visited Pages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pageStats} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis dataKey="path" type="category" width={80} tick={{ fontSize: 8 }} />
              <Tooltip contentStyle={{ fontSize: '10px' }} />
              <Bar dataKey="views" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Page Views vs Searches */}
      <Card className="border-indigo-200/50 dark:border-indigo-800/30">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <Eye className="h-3 w-3 text-indigo-600" />
            Page Views vs Searches
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="total_page_views" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Page Views"
              />
              <Line 
                type="monotone" 
                dataKey="total_searches" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Searches"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebTrafficAnalytics;
