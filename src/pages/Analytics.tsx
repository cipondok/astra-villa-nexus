import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Activity,
  Calendar,
  Eye,
  MousePointer,
  Clock,
  Globe
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';
import AIToolsTabBar from '@/components/common/AIToolsTabBar';
import BackToHomeLink from '@/components/common/BackToHomeLink';

interface AnalyticsData {
  users: {
    total: number;
    new_today: number;
    growth_rate: number;
  };
  properties: {
    total: number;
    new_today: number;
    by_type: { type: string; count: number }[];
  };
  engagement: {
    page_views: number;
    unique_visitors: number;
    bounce_rate: number;
    avg_session_duration: number;
  };
}

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("7d");

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      // Fetch user stats
      const { data: usersData } = await supabase
        .from('profiles')
        .select('created_at');

      // Fetch property stats
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('created_at, property_type, status');

      // Calculate stats
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const totalUsers = usersData?.length || 0;
      const newUsersToday = usersData?.filter(u => new Date(u.created_at) >= todayStart).length || 0;
      
      const totalProperties = propertiesData?.length || 0;
      const newPropertiesToday = propertiesData?.filter(p => new Date(p.created_at) >= todayStart).length || 0;

      // Group properties by type
      const propertyByType = propertiesData?.reduce((acc, prop) => {
        acc[prop.property_type] = (acc[prop.property_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const propertyTypeData = Object.entries(propertyByType).map(([type, count]) => ({
        type,
        count
      }));

      return {
        users: {
          total: totalUsers,
          new_today: newUsersToday,
          growth_rate: totalUsers > 0 ? (newUsersToday / totalUsers) * 100 : 0
        },
        properties: {
          total: totalProperties,
          new_today: newPropertiesToday,
          by_type: propertyTypeData
        },
        engagement: {
          page_views: Math.floor(Math.random() * 10000) + 5000,
          unique_visitors: Math.floor(Math.random() * 3000) + 1500,
          bounce_rate: Math.floor(Math.random() * 30) + 25,
          avg_session_duration: Math.floor(Math.random() * 300) + 120
        }
      } as AnalyticsData;
    },
  });

  // Generate mock chart data
  const generateChartData = (days: number) => {
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return {
        date: format(date, 'MMM dd'),
        users: Math.floor(Math.random() * 50) + 20,
        properties: Math.floor(Math.random() * 10) + 5,
        pageViews: Math.floor(Math.random() * 500) + 200,
      };
    });
  };

  const chartData = generateChartData(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90);

  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
            </div>
            <p className="text-xl opacity-90">Comprehensive insights into your platform performance</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-11 md:pt-12">
      {/* Luxury Background - matches home page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-2 md:px-4 py-2 md:py-4">
        {/* Back Link & AI Tools Tab Bar */}
        <BackToHomeLink sectionId="ai-tools-section" alwaysShow />
        <AIToolsTabBar className="mb-3" />

        {/* Header - Slim, no background */}
        <div className="text-center mb-3 md:mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <h1 className="text-sm md:text-lg font-bold text-foreground">Analytics Dashboard</h1>
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground">Comprehensive insights into platform performance</p>
        </div>

        {/* Time Range Selector - Compact */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
          <h2 className="text-xs md:text-sm font-semibold text-foreground">Platform Overview</h2>
          <div className="flex gap-1.5">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              onClick={() => setTimeRange('7d')}
              size="sm"
              className="h-7 text-[10px] md:text-xs px-2 md:px-3"
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              onClick={() => setTimeRange('30d')}
              size="sm"
              className="h-7 text-[10px] md:text-xs px-2 md:px-3"
            >
              30 Days
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'outline'}
              onClick={() => setTimeRange('90d')}
              size="sm"
              className="h-7 text-[10px] md:text-xs px-2 md:px-3"
            >
              90 Days
            </Button>
          </div>
        </div>

        {/* KPI Cards - Glassmorphic Slim */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-4">
          <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
            <CardContent className="p-2 md:p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] md:text-xs font-medium text-muted-foreground">Total Users</p>
                  <div className="text-sm md:text-lg font-bold text-foreground">{analyticsData?.users.total}</div>
                  <div className="flex items-center text-[8px] md:text-[10px]">
                    <TrendingUp className="h-2.5 w-2.5 text-green-500 mr-0.5" />
                    <span className="text-green-500">+{analyticsData?.users.new_today} today</span>
                  </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
            <CardContent className="p-2 md:p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] md:text-xs font-medium text-muted-foreground">Total Properties</p>
                  <div className="text-sm md:text-lg font-bold text-foreground">{analyticsData?.properties.total}</div>
                  <div className="flex items-center text-[8px] md:text-[10px]">
                    <TrendingUp className="h-2.5 w-2.5 text-green-500 mr-0.5" />
                    <span className="text-green-500">+{analyticsData?.properties.new_today} today</span>
                  </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Building2 className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
            <CardContent className="p-2 md:p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] md:text-xs font-medium text-muted-foreground">Page Views</p>
                  <div className="text-sm md:text-lg font-bold text-foreground">{analyticsData?.engagement.page_views.toLocaleString()}</div>
                  <div className="flex items-center text-[8px] md:text-[10px]">
                    <Eye className="h-2.5 w-2.5 text-purple-500 mr-0.5" />
                    <span className="text-purple-500">This month</span>
                  </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Eye className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
            <CardContent className="p-2 md:p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] md:text-xs font-medium text-muted-foreground">Avg. Session</p>
                  <div className="text-sm md:text-lg font-bold text-foreground">{formatDuration(analyticsData?.engagement.avg_session_duration || 0)}</div>
                  <div className="flex items-center text-[8px] md:text-[10px]">
                    <Clock className="h-2.5 w-2.5 text-orange-500 mr-0.5" />
                    <span className="text-orange-500">Duration</span>
                  </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Slim Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-3 h-8">
            <TabsTrigger value="overview" className="text-[10px] md:text-xs h-7">Overview</TabsTrigger>
            <TabsTrigger value="users" className="text-[10px] md:text-xs h-7">Users</TabsTrigger>
            <TabsTrigger value="properties" className="text-[10px] md:text-xs h-7">Properties</TabsTrigger>
            <TabsTrigger value="engagement" className="text-[10px] md:text-xs h-7">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
                <CardHeader className="p-3">
                  <CardTitle className="text-xs md:text-sm">User Growth Trend</CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-3">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
                <CardHeader className="p-3">
                  <CardTitle className="text-xs md:text-sm">Property Listings</CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-3">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="properties" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-3">
            <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
              <CardHeader className="p-3">
                <CardTitle className="text-xs md:text-sm">User Registration Trend</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-3">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
                <CardHeader className="p-3">
                  <CardTitle className="text-xs md:text-sm">Property Listings Trend</CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-3">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="properties" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
                <CardHeader className="p-3">
                  <CardTitle className="text-xs md:text-sm">Properties by Type</CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-3">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.properties.by_type}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData?.properties.by_type.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-3">
            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3">
              <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
                <CardContent className="p-2 md:p-3 text-center">
                  <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-sm md:text-lg font-bold">{analyticsData?.engagement.unique_visitors.toLocaleString()}</div>
                  <div className="text-[9px] md:text-xs text-muted-foreground">Unique Visitors</div>
                </CardContent>
              </Card>
              
              <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
                <CardContent className="p-2 md:p-3 text-center">
                  <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <MousePointer className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-sm md:text-lg font-bold">{analyticsData?.engagement.bounce_rate}%</div>
                  <div className="text-[9px] md:text-xs text-muted-foreground">Bounce Rate</div>
                </CardContent>
              </Card>
              
              <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
                <CardContent className="p-2 md:p-3 text-center">
                  <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="text-sm md:text-lg font-bold">{formatDuration(analyticsData?.engagement.avg_session_duration || 0)}</div>
                  <div className="text-[9px] md:text-xs text-muted-foreground">Avg. Duration</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-transparent dark:bg-white/5 border-border/30 backdrop-blur-sm">
              <CardHeader className="p-3">
                <CardTitle className="text-xs md:text-sm">Page Views Trend</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-3">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="pageViews" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;