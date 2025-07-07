
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Star, 
  Users, 
  DollarSign,
  Calendar,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Activity,
  BarChart3
} from "lucide-react";

interface PerformanceMetrics {
  responseTime: number;
  customerSatisfaction: number;
  completionRate: number;
  bookingCount: number;
  revenue: number;
  performanceScore: number;
  ratingTrend: number;
}

interface PerformanceGoals {
  responseTimeTarget: number;
  satisfactionTarget: number;
  completionTarget: number;
  revenueTarget: number;
}

const VendorPerformanceDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [performanceGoals] = useState<PerformanceGoals>({
    responseTimeTarget: 60, // minutes
    satisfactionTarget: 4.5,
    completionTarget: 95,
    revenueTarget: 10000000 // IDR
  });

  // Fetch vendor performance data
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['vendor-performance', user?.id, selectedPeriod],
    queryFn: async () => {
      if (!user?.id) return null;

      const daysAgo = parseInt(selectedPeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('vendor_performance_analytics')
        .select('*')
        .eq('vendor_id', user.id)
        .gte('metric_date', startDate.toISOString().split('T')[0])
        .order('metric_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Calculate aggregated metrics
  const metrics: PerformanceMetrics = performanceData?.reduce((acc, curr) => {
    acc.responseTime += curr.response_time_avg || 0;
    acc.customerSatisfaction += curr.customer_satisfaction || 0;
    acc.completionRate += curr.completion_rate || 0;
    acc.bookingCount += curr.booking_count || 0;
    acc.revenue += curr.revenue_generated || 0;
    acc.performanceScore += curr.performance_score || 0;
    acc.ratingTrend += curr.rating_trend || 0;
    return acc;
  }, {
    responseTime: 0,
    customerSatisfaction: 0,
    completionRate: 0,
    bookingCount: 0,
    revenue: 0,
    performanceScore: 0,
    ratingTrend: 0
  }) || {
    responseTime: 0,
    customerSatisfaction: 0,
    completionRate: 0,
    bookingCount: 0,
    revenue: 0,
    performanceScore: 0,
    ratingTrend: 0
  };

  const dataPoints = performanceData?.length || 1;
  const avgMetrics = {
    responseTime: Math.round(metrics.responseTime / dataPoints),
    customerSatisfaction: Number((metrics.customerSatisfaction / dataPoints).toFixed(1)),
    completionRate: Number((metrics.completionRate / dataPoints).toFixed(1)),
    bookingCount: metrics.bookingCount,
    revenue: metrics.revenue,
    performanceScore: Math.round(metrics.performanceScore / dataPoints),
    ratingTrend: Number((metrics.ratingTrend / dataPoints).toFixed(1))
  };

  const getPerformanceColor = (score: number, target: number, isReverse = false) => {
    const ratio = isReverse ? target / score : score / target;
    if (ratio >= 1) return "text-green-600";
    if (ratio >= 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceIcon = (score: number, target: number, isReverse = false) => {
    const ratio = isReverse ? target / score : score / target;
    if (ratio >= 1) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (ratio >= 0.8) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="samsung-gradient border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                <BarChart3 className="h-6 w-6" />
                Performance Dashboard
              </h2>
              <p className="text-white/80">Real-time analytics and performance insights</p>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Performance Score Overview */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Performance Score</span>
            <Badge variant={avgMetrics.performanceScore >= 80 ? "default" : avgMetrics.performanceScore >= 60 ? "secondary" : "destructive"}>
              {avgMetrics.performanceScore}%
            </Badge>
          </CardTitle>
          <CardDescription>
            Your overall performance based on multiple metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={avgMetrics.performanceScore} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Poor (0-40%)</span>
            <span>Average (41-70%)</span>
            <span>Good (71-85%)</span>
            <span>Excellent (86-100%)</span>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Response Time
                </p>
                <p className={`text-2xl font-bold ${getPerformanceColor(avgMetrics.responseTime, performanceGoals.responseTimeTarget, true)}`}>
                  {avgMetrics.responseTime}m
                </p>
                <p className="text-xs text-muted-foreground">
                  Target: {performanceGoals.responseTimeTarget}m
                </p>
              </div>
              {getPerformanceIcon(avgMetrics.responseTime, performanceGoals.responseTimeTarget, true)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Satisfaction
                </p>
                <p className={`text-2xl font-bold ${getPerformanceColor(avgMetrics.customerSatisfaction, performanceGoals.satisfactionTarget)}`}>
                  {avgMetrics.customerSatisfaction}/5.0
                </p>
                <p className="text-xs text-muted-foreground">
                  Target: {performanceGoals.satisfactionTarget}/5.0
                </p>
              </div>
              {getPerformanceIcon(avgMetrics.customerSatisfaction, performanceGoals.satisfactionTarget)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Completion Rate
                </p>
                <p className={`text-2xl font-bold ${getPerformanceColor(avgMetrics.completionRate, performanceGoals.completionTarget)}`}>
                  {avgMetrics.completionRate}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Target: {performanceGoals.completionTarget}%
                </p>
              </div>
              {getPerformanceIcon(avgMetrics.completionRate, performanceGoals.completionTarget)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Revenue
                </p>
                <p className={`text-2xl font-bold ${getPerformanceColor(avgMetrics.revenue, performanceGoals.revenueTarget)}`}>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact',
                    maximumFractionDigits: 0
                  }).format(avgMetrics.revenue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Target: {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact'
                  }).format(performanceGoals.revenueTarget)}
                </p>
              </div>
              {getPerformanceIcon(avgMetrics.revenue, performanceGoals.revenueTarget)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="goals">Goal Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Daily Performance Trends</CardTitle>
              <CardDescription>Track your performance metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData?.slice(0, 10).map((day, index) => (
                  <div key={day.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {new Date(day.metric_date).toLocaleDateString('id-ID')}
                      </span>
                      <Badge variant={day.performance_score >= 80 ? "default" : "secondary"}>
                        Score: {day.performance_score}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Response: </span>
                        <span className="font-medium">{day.response_time_avg}m</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Satisfaction: </span>
                        <span className="font-medium">{day.customer_satisfaction}/5.0</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completion: </span>
                        <span className="font-medium">{day.completion_rate}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bookings: </span>
                        <span className="font-medium">{day.booking_count}</span>
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
              <CardDescription>Personalized recommendations to improve your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {avgMetrics.responseTime > performanceGoals.responseTimeTarget && (
                  <div className="p-4 border-l-4 border-l-orange-500 bg-orange-50">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-orange-900">Improve Response Time</h3>
                        <p className="text-sm text-orange-800">
                          Your average response time is {avgMetrics.responseTime} minutes. 
                          Consider setting up instant notifications to respond faster to booking requests.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {avgMetrics.customerSatisfaction < performanceGoals.satisfactionTarget && (
                  <div className="p-4 border-l-4 border-l-red-500 bg-red-50">
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-red-900">Boost Customer Satisfaction</h3>
                        <p className="text-sm text-red-800">
                          Your satisfaction rating is {avgMetrics.customerSatisfaction}/5.0. 
                          Focus on clear communication and exceeding customer expectations.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {avgMetrics.completionRate >= performanceGoals.completionTarget && (
                  <div className="p-4 border-l-4 border-l-green-500 bg-green-50">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-green-900">Excellent Completion Rate!</h3>
                        <p className="text-sm text-green-800">
                          Your {avgMetrics.completionRate}% completion rate is outstanding. 
                          This reliability will help you get more bookings.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Growth Opportunity</h3>
                      <p className="text-sm text-blue-800">
                        You've completed {avgMetrics.bookingCount} bookings this period. 
                        Consider expanding your service areas or adding new service types to increase revenue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Performance Goals</CardTitle>
              <CardDescription>Track your progress towards performance targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Response Time Goal</span>
                    <span className="text-sm text-muted-foreground">
                      {avgMetrics.responseTime}m / {performanceGoals.responseTimeTarget}m target
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (performanceGoals.responseTimeTarget / avgMetrics.responseTime) * 100)} 
                    className="h-2" 
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Customer Satisfaction Goal</span>
                    <span className="text-sm text-muted-foreground">
                      {avgMetrics.customerSatisfaction}/5.0 / {performanceGoals.satisfactionTarget}/5.0 target
                    </span>
                  </div>
                  <Progress 
                    value={(avgMetrics.customerSatisfaction / performanceGoals.satisfactionTarget) * 100} 
                    className="h-2" 
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Completion Rate Goal</span>
                    <span className="text-sm text-muted-foreground">
                      {avgMetrics.completionRate}% / {performanceGoals.completionTarget}% target
                    </span>
                  </div>
                  <Progress 
                    value={(avgMetrics.completionRate / performanceGoals.completionTarget) * 100} 
                    className="h-2" 
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Revenue Goal</span>
                    <span className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: 'compact' }).format(avgMetrics.revenue)} / 
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: 'compact' }).format(performanceGoals.revenueTarget)} target
                    </span>
                  </div>
                  <Progress 
                    value={(avgMetrics.revenue / performanceGoals.revenueTarget) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorPerformanceDashboard;
