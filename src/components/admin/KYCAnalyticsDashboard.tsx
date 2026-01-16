import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Clock, CheckCircle, XCircle, AlertTriangle, Download,
  BarChart3, PieChart as PieChartIcon, Activity, FileCheck, Shield, Eye, Filter
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface KYCStats {
  total_submissions: number;
  pending_reviews: number;
  approved_count: number;
  rejected_count: number;
  completion_rate: number;
  avg_review_time: number;
}

interface TimeSeriesData {
  date: string;
  submissions: number;
  approvals: number;
  rejections: number;
}

export const KYCAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = React.useState('30');
  const [filterType, setFilterType] = React.useState('all');
  const [activeTab, setActiveTab] = React.useState('overview');

  // Fetch KYC statistics
  const { data: kycStats, isLoading: statsLoading } = useQuery({
    queryKey: ['kyc-stats', timeRange],
    queryFn: async () => {
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      const { data: submissions, error } = await supabase
        .from('vendor_kyc_status')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const total = submissions?.length || 0;
      const pending = submissions?.filter(s => s.kyc_status === 'documents_submitted' || s.kyc_status === 'pending_review' || s.kyc_status === 'under_verification').length || 0;
      const approved = submissions?.filter(s => s.kyc_status === 'verified').length || 0;
      const rejected = submissions?.filter(s => s.kyc_status === 'rejected').length || 0;

      const completedReviews = submissions?.filter(s => 
        (s.kyc_status === 'verified' || s.kyc_status === 'rejected') && s.verified_at && s.created_at
      ) || [];
      
      const avgReviewTime = completedReviews.length > 0 
        ? completedReviews.reduce((sum, review) => {
            const reviewTime = new Date(review.verified_at!).getTime() - new Date(review.created_at).getTime();
            return sum + (reviewTime / (1000 * 60 * 60));
          }, 0) / completedReviews.length
        : 0;

      return {
        total_submissions: total,
        pending_reviews: pending,
        approved_count: approved,
        rejected_count: rejected,
        completion_rate: total > 0 ? ((approved + rejected) / total) * 100 : 0,
        avg_review_time: avgReviewTime
      } as KYCStats;
    }
  });

  // Fetch time series data for charts
  const { data: timeSeriesData, isLoading: chartLoading } = useQuery({
    queryKey: ['kyc-timeseries', timeRange],
    queryFn: async () => {
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      const { data, error } = await supabase
        .from('vendor_kyc_status')
        .select('created_at, kyc_status, verified_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const dateMap = new Map<string, { submissions: number; approvals: number; rejections: number }>();
      
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd');
        dateMap.set(date, { submissions: 0, approvals: 0, rejections: 0 });
      }

      data?.forEach(item => {
        const submissionDate = format(new Date(item.created_at), 'yyyy-MM-dd');
        const existing = dateMap.get(submissionDate);
        if (existing) {
          existing.submissions++;
        }

        if (item.verified_at && (item.kyc_status === 'verified' || item.kyc_status === 'rejected')) {
          const reviewDate = format(new Date(item.verified_at), 'yyyy-MM-dd');
          const reviewData = dateMap.get(reviewDate);
          if (reviewData) {
            if (item.kyc_status === 'verified') {
              reviewData.approvals++;
            } else if (item.kyc_status === 'rejected') {
              reviewData.rejections++;
            }
          }
        }
      });

      return Array.from(dateMap.entries()).map(([date, counts]) => ({
        date: format(new Date(date), 'MMM dd'),
        ...counts
      }));
    }
  });

  // Fetch status distribution data
  const { data: statusDistribution } = useQuery({
    queryKey: ['kyc-status-distribution', timeRange],
    queryFn: async () => {
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      const { data, error } = await supabase
        .from('vendor_kyc_status')
        .select('kyc_status')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const statusCounts = data?.reduce((acc, item) => {
        acc[item.kyc_status] = (acc[item.kyc_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return Object.entries(statusCounts).map(([status, count]) => ({
        name: status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1),
        value: count,
        color: status === 'verified' ? '#00C49F' : status === 'rejected' ? '#FF8042' : '#FFBB28'
      }));
    }
  });

  // Fetch BPJS verification stats
  const { data: bpjsStats } = useQuery({
    queryKey: ['bpjs-stats', timeRange],
    queryFn: async () => {
      console.warn('BPJS analytics require enhanced security clearance');
      return {
        kesehatan_verified: 0,
        kesehatan_pending: 0,
        kesehatan_rejected: 0,
        ketenagakerjaan_verified: 0,
        ketenagakerjaan_pending: 0,
        ketenagakerjaan_rejected: 0
      };
    }
  });

  const handleExportData = async () => {
    try {
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      const { data, error } = await supabase
        .from('vendor_kyc_status')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const csvContent = [
        ['Vendor ID', 'Status', 'Submitted', 'Reviewed', 'Compliance Score', 'Access Level', 'Notes'].join(','),
        ...(data || []).map(row => [
          row.vendor_id || '',
          row.kyc_status,
          format(new Date(row.created_at), 'yyyy-MM-dd'),
          row.verified_at ? format(new Date(row.verified_at), 'yyyy-MM-dd') : '',
          row.compliance_score || '',
          row.access_level || '',
          row.verification_notes || ''
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kyc-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (statsLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-teal-500/5 to-transparent border border-cyan-500/20 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">KYC Analytics Dashboard</h1>
                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-700 border-cyan-500/30 text-xs">
                  Live Data
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Monitor KYC submission trends and performance metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportData} variant="outline" size="sm" className="h-8 text-xs gap-1">
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards - Compact Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Users className="h-4 w-4 text-blue-500" />
              <Badge variant="outline" className="text-[10px] bg-blue-500/10 border-blue-500/30">Total</Badge>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold">{kycStats?.total_submissions || 0}</p>
              <p className="text-[10px] text-muted-foreground">Submissions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Clock className="h-4 w-4 text-amber-500" />
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30">Queue</Badge>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold">{kycStats?.pending_reviews || 0}</p>
              <p className="text-[10px] text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/30">Done</Badge>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold">{kycStats?.approved_count || 0}</p>
              <p className="text-[10px] text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <XCircle className="h-4 w-4 text-red-500" />
              <Badge variant="outline" className="text-[10px] bg-red-500/10 border-red-500/30">Failed</Badge>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold">{kycStats?.rejected_count || 0}</p>
              <p className="text-[10px] text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Activity className="h-4 w-4 text-purple-500" />
              <Badge variant="outline" className="text-[10px] bg-purple-500/10 border-purple-500/30">Rate</Badge>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold">{kycStats?.completion_rate.toFixed(0)}%</p>
              <p className="text-[10px] text-muted-foreground">Completion</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Clock className="h-4 w-4 text-cyan-500" />
              <Badge variant="outline" className="text-[10px] bg-cyan-500/10 border-cyan-500/30">Avg</Badge>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold">{kycStats?.avg_review_time.toFixed(1)}h</p>
              <p className="text-[10px] text-muted-foreground">Review Time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Analytics Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-9 p-1 bg-muted/50 w-full md:w-auto">
          <TabsTrigger 
            value="overview" 
            className="h-7 px-3 text-xs gap-1.5 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-700"
          >
            <BarChart3 className="h-3 w-3" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="trends" 
            className="h-7 px-3 text-xs gap-1.5 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-700"
          >
            <Activity className="h-3 w-3" />
            Trends
          </TabsTrigger>
          <TabsTrigger 
            value="distribution" 
            className="h-7 px-3 text-xs gap-1.5 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-700"
          >
            <PieChartIcon className="h-3 w-3" />
            Distribution
          </TabsTrigger>
          <TabsTrigger 
            value="bpjs" 
            className="h-7 px-3 text-xs gap-1.5 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-700"
          >
            <Shield className="h-3 w-3" />
            BPJS Stats
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card className="border-slate-200/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-500" />
                  <CardTitle className="text-sm">Submission Timeline</CardTitle>
                </div>
                <CardDescription className="text-xs">Daily KYC submissions and review outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorApprovals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="submissions" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSubmissions)" name="Submissions" />
                    <Area type="monotone" dataKey="approvals" stroke="#10b981" fillOpacity={1} fill="url(#colorApprovals)" name="Approvals" />
                    <Line type="monotone" dataKey="rejections" stroke="#ef4444" name="Rejections" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-slate-200/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-purple-500" />
                  <CardTitle className="text-sm">Status Distribution</CardTitle>
                </div>
                <CardDescription className="text-xs">Current verification status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="mt-4">
          <Card className="border-slate-200/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <CardTitle className="text-sm">Submission Trends</CardTitle>
              </div>
              <CardDescription className="text-xs">Historical trend analysis over {timeRange} days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="submissions" stroke="#3b82f6" name="Submissions" strokeWidth={2} />
                  <Line type="monotone" dataKey="approvals" stroke="#10b981" name="Approvals" strokeWidth={2} />
                  <Line type="monotone" dataKey="rejections" stroke="#ef4444" name="Rejections" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-slate-200/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-purple-500" />
                  <CardTitle className="text-sm">Pie Chart</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {statusDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-slate-200/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-cyan-500" />
                  <CardTitle className="text-sm">Bar Chart</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* BPJS Stats Tab */}
        <TabsContent value="bpjs" className="mt-4">
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <CardTitle className="text-sm">BPJS Verification Statistics</CardTitle>
              </div>
              <CardDescription className="text-xs">Government verification API performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/10 rounded">
                      <FileCheck className="h-3 w-3 text-blue-500" />
                    </div>
                    <h4 className="text-sm font-semibold">BPJS Kesehatan</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified: {bpjsStats?.kesehatan_verified || 0}
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs gap-1">
                      <Clock className="w-3 h-3" />
                      Pending: {bpjsStats?.kesehatan_pending || 0}
                    </Badge>
                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs gap-1">
                      <XCircle className="w-3 h-3" />
                      Failed: {bpjsStats?.kesehatan_rejected || 0}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/10 rounded">
                      <FileCheck className="h-3 w-3 text-purple-500" />
                    </div>
                    <h4 className="text-sm font-semibold">BPJS Ketenagakerjaan</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified: {bpjsStats?.ketenagakerjaan_verified || 0}
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs gap-1">
                      <Clock className="w-3 h-3" />
                      Pending: {bpjsStats?.ketenagakerjaan_pending || 0}
                    </Badge>
                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs gap-1">
                      <XCircle className="w-3 h-3" />
                      Failed: {bpjsStats?.ketenagakerjaan_rejected || 0}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KYCAnalyticsDashboard;
