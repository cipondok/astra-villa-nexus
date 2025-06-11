
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

  // Fetch daily analytics data
  const { data: dailyStats, isLoading: dailyLoading } = useQuery({
    queryKey: ['daily-analytics', timeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('daily_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch top search keywords
  const { data: topKeywords } = useQuery({
    queryKey: ['top-keywords', timeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('search_analytics')
        .select('search_query')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Count occurrences of each keyword
      const keywordCounts = data?.reduce((acc: any, item) => {
        const query = item.search_query.toLowerCase();
        acc[query] = (acc[query] || 0) + 1;
        return acc;
      }, {}) || {};

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Web Traffic Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive website traffic and user behavior analytics
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Visitors</p>
                    <p className="text-2xl font-bold">{totalVisitors.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unique Visitors</p>
                    <p className="text-2xl font-bold">{uniqueVisitors.toLocaleString()}</p>
                  </div>
                  <Globe className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                    <p className="text-2xl font-bold">{totalPageViews.toLocaleString()}</p>
                  </div>
                  <Eye className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Searches</p>
                    <p className="text-2xl font-bold">{totalSearches.toLocaleString()}</p>
                  </div>
                  <Search className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Search Keywords */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Top Search Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topKeywords?.map((item: any, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{item.keyword}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.count} searches
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Device Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={deviceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceStats?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Most Visited Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pageStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="path" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Page Views vs Searches */}
          <Card>
            <CardHeader>
              <CardTitle>Page Views vs Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
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
        </CardContent>
      </Card>
    </div>
  );
};

export default WebTrafficAnalytics;
