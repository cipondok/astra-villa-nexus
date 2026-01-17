
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Star, 
  Users, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Lightbulb
} from "lucide-react";

const VendorPerformanceAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7");

  // Fetch performance analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['vendor-performance-analytics', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_performance_analytics')
        .select(`
          *,
          vendor_profile:profiles!vendor_performance_analytics_vendor_id_fkey (
            full_name,
            email
          )
        `)
        .gte('metric_date', new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('metric_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch AI alerts
  const { data: alerts } = useQuery({
    queryKey: ['vendor-ai-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_ai_alerts')
        .select(`
          *,
          vendor_profile:profiles!vendor_ai_alerts_vendor_id_fkey (
            full_name,
            email
          )
        `)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getAlertSeverityColor = (severity: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800 border-blue-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      critical: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[severity as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getAlertIcon = (type: string) => {
    const icons = {
      performance_drop: <TrendingDown className="h-4 w-4" />,
      fraud_risk: <AlertTriangle className="h-4 w-4" />,
      opportunity: <TrendingUp className="h-4 w-4" />,
      maintenance: <Activity className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <AlertTriangle className="h-4 w-4" />;
  };

  // Calculate aggregated metrics
  const aggregatedMetrics = analytics?.reduce((acc, curr) => {
    acc.totalRevenue += curr.revenue_generated || 0;
    acc.totalBookings += curr.booking_count || 0;
    acc.avgResponseTime += curr.response_time_avg || 0;
    acc.avgSatisfaction += curr.customer_satisfaction || 0;
    acc.avgCompletion += curr.completion_rate || 0;
    acc.count += 1;
    return acc;
  }, {
    totalRevenue: 0,
    totalBookings: 0,
    avgResponseTime: 0,
    avgSatisfaction: 0,
    avgCompletion: 0,
    count: 0
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading performance analytics...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Professional Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent rounded-xl border border-emerald-200/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Vendor Performance Analytics
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                AI Insights
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">AI-powered performance insights and alerts</p>
          </div>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Revenue</p>
                <p className="text-lg font-bold text-green-700">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    notation: 'compact'
                  }).format(aggregatedMetrics?.totalRevenue || 0)}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Bookings</p>
                <p className="text-lg font-bold text-blue-700">{aggregatedMetrics?.totalBookings || 0}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Avg Response</p>
                <p className="text-lg font-bold text-orange-700">
                  {Math.round((aggregatedMetrics?.avgResponseTime || 0) / (aggregatedMetrics?.count || 1))}m
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Satisfaction</p>
                <p className="text-lg font-bold text-yellow-700">
                  {((aggregatedMetrics?.avgSatisfaction || 0) / (aggregatedMetrics?.count || 1)).toFixed(1)}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-3">
        <TabsList className="h-9 p-1 bg-muted/50">
          <TabsTrigger value="overview" className="text-xs h-7 px-3 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
            <TrendingUp className="h-3 w-3 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs h-7 px-3 data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Alerts ({alerts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs h-7 px-3 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
            <Lightbulb className="h-3 w-3 mr-1" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-transparent">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600" />
                Vendor Performance Metrics
              </CardTitle>
              <CardDescription className="text-xs">Daily performance tracking with AI-generated scores</CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-3">
                {analytics?.slice(0, 10).map((metric) => (
                  <div key={metric.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-sm">{metric.vendor_profile?.full_name || 'Unknown Vendor'}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(metric.metric_date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Performance</p>
                        <p className={`text-lg font-bold ${getPerformanceColor(metric.performance_score)}`}>
                          {metric.performance_score}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3 text-xs">
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <p className="text-muted-foreground">Response</p>
                        <p className="font-medium">{metric.response_time_avg}m</p>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <p className="text-muted-foreground">Rating</p>
                        <p className="font-medium">{metric.customer_satisfaction}/5</p>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <p className="text-muted-foreground">Complete</p>
                        <p className="font-medium">{metric.completion_rate}%</p>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <p className="text-muted-foreground">Bookings</p>
                        <p className="font-medium">{metric.booking_count}</p>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-medium">
                          {new Intl.NumberFormat('id-ID', {
                            notation: 'compact'
                          }).format(metric.revenue_generated)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-transparent">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                AI-Generated Alerts
              </CardTitle>
              <CardDescription className="text-xs">Automated alerts for performance drops and opportunities</CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-3">
                {alerts?.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getAlertIcon(alert.alert_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sm">{alert.vendor_profile?.full_name || 'Unknown Vendor'}</h3>
                          <Badge className={`text-[10px] ${getAlertSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{alert.alert_message}</p>
                        {alert.ai_recommendation && (
                          <div className="p-2 bg-blue-50 rounded text-xs">
                            <strong>AI:</strong> {alert.ai_recommendation}
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-2">
                          {new Date(alert.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-transparent">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-violet-600" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription className="text-xs">Machine learning insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-3">
                {analytics?.filter(a => a.ai_insights && Object.keys(a.ai_insights).length > 0).map((metric) => (
                  <div key={metric.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{metric.vendor_profile?.full_name || 'Unknown Vendor'}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(metric.metric_date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="p-2 bg-violet-50 rounded text-xs">
                      <pre className="whitespace-pre-wrap font-sans">
                        {JSON.stringify(metric.ai_insights, null, 2)}
                      </pre>
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

export default VendorPerformanceAnalytics;
