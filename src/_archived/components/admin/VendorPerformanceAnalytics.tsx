
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
    if (score >= 80) return "text-chart-1";
    if (score >= 60) return "text-chart-3";
    return "text-destructive";
  };

  const getAlertSeverityColor = (severity: string) => {
    const colors = {
      low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
      medium: "bg-chart-3/10 text-chart-3 border-chart-3/20",
      high: "bg-chart-4/10 text-chart-4 border-chart-4/20",
      critical: "bg-destructive/10 text-destructive border-destructive/20"
    };
    return colors[severity as keyof typeof colors] || "bg-muted text-muted-foreground";
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
      <div className="flex items-center justify-between p-4 bg-chart-1/5 rounded-xl border border-chart-1/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-chart-1/10 rounded-lg">
            <BarChart3 className="h-5 w-5 text-chart-1" />
          </div>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Vendor Performance Analytics
              <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/30 text-[10px]">
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
        <Card className="border-chart-1/20 bg-chart-1/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Revenue</p>
                <p className="text-lg font-bold text-chart-1">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    notation: 'compact'
                  }).format(aggregatedMetrics?.totalRevenue || 0)}
                </p>
              </div>
              <div className="p-2 bg-chart-1/10 rounded-lg">
                <DollarSign className="h-4 w-4 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-chart-2/20 bg-chart-2/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Bookings</p>
                <p className="text-lg font-bold text-chart-2">{aggregatedMetrics?.totalBookings || 0}</p>
              </div>
              <div className="p-2 bg-chart-2/10 rounded-lg">
                <Users className="h-4 w-4 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-chart-3/20 bg-chart-3/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Avg Response</p>
                <p className="text-lg font-bold text-chart-3">
                  {Math.round((aggregatedMetrics?.avgResponseTime || 0) / (aggregatedMetrics?.count || 1))}m
                </p>
              </div>
              <div className="p-2 bg-chart-3/10 rounded-lg">
                <Clock className="h-4 w-4 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-chart-4/20 bg-chart-4/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Satisfaction</p>
                <p className="text-lg font-bold text-chart-4">
                  {((aggregatedMetrics?.avgSatisfaction || 0) / (aggregatedMetrics?.count || 1)).toFixed(1)}
                </p>
              </div>
              <div className="p-2 bg-chart-4/10 rounded-lg">
                <Star className="h-4 w-4 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-3">
        <TabsList className="h-9 p-1 bg-muted/50">
          <TabsTrigger value="overview" className="text-xs h-7 px-3 data-[state=active]:bg-chart-1/10 data-[state=active]:text-chart-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs h-7 px-3 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Alerts ({alerts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs h-7 px-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Lightbulb className="h-3 w-3 mr-1" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 bg-chart-1/5">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-chart-1" />
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
            <CardHeader className="pb-3 bg-destructive/5">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
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
                          <div className="p-2 bg-chart-2/10 rounded text-xs">
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
            <CardHeader className="pb-3 bg-primary/5">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
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
                    <div className="p-2 bg-primary/5 rounded text-xs">
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
