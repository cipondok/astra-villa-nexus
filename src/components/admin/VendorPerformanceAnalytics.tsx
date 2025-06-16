
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
  Activity
} from "lucide-react";

const VendorPerformanceAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [selectedVendor, setSelectedVendor] = useState("all");

  // Fetch performance analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['vendor-performance-analytics', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_performance_analytics')
        .select(`
          *,
          vendor_profiles:vendor_id (
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
          vendor_profiles:vendor_id (
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
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Vendor Performance Analytics
          </h2>
          <p className="text-muted-foreground">AI-powered performance insights and alerts</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(aggregatedMetrics?.totalRevenue || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{aggregatedMetrics?.totalBookings || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">
                  {Math.round((aggregatedMetrics?.avgResponseTime || 0) / (aggregatedMetrics?.count || 1))}m
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Satisfaction</p>
                <p className="text-2xl font-bold">
                  {((aggregatedMetrics?.avgSatisfaction || 0) / (aggregatedMetrics?.count || 1)).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="alerts">AI Alerts</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance Metrics</CardTitle>
              <CardDescription>Daily performance tracking with AI-generated scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.slice(0, 10).map((metric) => (
                  <div key={metric.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{metric.vendor_profiles?.full_name || 'Unknown Vendor'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(metric.metric_date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Performance Score</p>
                        <p className={`text-lg font-bold ${getPerformanceColor(metric.performance_score)}`}>
                          {metric.performance_score}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Response Time</p>
                        <p className="font-medium">{metric.response_time_avg}m</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Satisfaction</p>
                        <p className="font-medium">{metric.customer_satisfaction}/5.0</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completion Rate</p>
                        <p className="font-medium">{metric.completion_rate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Bookings</p>
                        <p className="font-medium">{metric.booking_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-medium">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
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
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Alerts</CardTitle>
              <CardDescription>Automated alerts for performance drops and opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts?.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.alert_type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{alert.vendor_profiles?.full_name || 'Unknown Vendor'}</h3>
                          <Badge className={getAlertSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.alert_message}</p>
                        {alert.ai_recommendation && (
                          <div className="p-2 bg-blue-50 rounded text-sm">
                            <strong>AI Recommendation:</strong> {alert.ai_recommendation}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
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
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Machine learning insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.filter(a => a.ai_insights && Object.keys(a.ai_insights).length > 0).map((metric) => (
                  <div key={metric.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{metric.vendor_profiles?.full_name || 'Unknown Vendor'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(metric.metric_date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <pre className="text-sm whitespace-pre-wrap">
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
