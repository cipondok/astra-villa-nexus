import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
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

  // Fetch KYC statistics
  const { data: kycStats, isLoading: statsLoading } = useQuery({
    queryKey: ['kyc-stats', timeRange],
    queryFn: async () => {
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      // Get basic KYC stats
      const { data: submissions, error } = await supabase
        .from('vendor_kyc_status')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const total = submissions?.length || 0;
      const pending = submissions?.filter(s => s.kyc_status === 'documents_submitted' || s.kyc_status === 'pending_review' || s.kyc_status === 'under_verification').length || 0;
      const approved = submissions?.filter(s => s.kyc_status === 'verified').length || 0;
      const rejected = submissions?.filter(s => s.kyc_status === 'rejected').length || 0;

      // Calculate average review time for completed reviews
      const completedReviews = submissions?.filter(s => 
        (s.kyc_status === 'verified' || s.kyc_status === 'rejected') && s.verified_at && s.created_at
      ) || [];
      
      const avgReviewTime = completedReviews.length > 0 
        ? completedReviews.reduce((sum, review) => {
            const reviewTime = new Date(review.verified_at!).getTime() - new Date(review.created_at).getTime();
            return sum + (reviewTime / (1000 * 60 * 60)); // Convert to hours
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

      // Group data by date
      const dateMap = new Map<string, { submissions: number; approvals: number; rejections: number }>();
      
      // Initialize dates
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd');
        dateMap.set(date, { submissions: 0, approvals: 0, rejections: 0 });
      }

      // Count submissions by date
      data?.forEach(item => {
        const submissionDate = format(new Date(item.created_at), 'yyyy-MM-dd');
        const existing = dateMap.get(submissionDate);
        if (existing) {
          existing.submissions++;
        }

        // Count approvals/rejections by review date
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

  // Fetch BPJS verification stats (secured)
  const { data: bpjsStats } = useQuery({
    queryKey: ['bpjs-stats', timeRange],
    queryFn: async () => {
      // BPJS analytics data access has been disabled for security
      // Direct table access is no longer allowed for sensitive healthcare data
      console.warn('BPJS analytics require enhanced security clearance');
      
      // Return default stats structure
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

      // Convert to CSV
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

      // Download CSV
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
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">KYC Analytics Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Monitor KYC submission trends and performance metrics</p>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full md:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportData} variant="outline" size="sm" className="w-full md:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kycStats?.total_submissions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kycStats?.pending_reviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kycStats?.completion_rate.toFixed(1)}%</div>
            <Progress value={kycStats?.completion_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kycStats?.avg_review_time.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Average processing time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Submissions Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Timeline</CardTitle>
            <CardDescription>Daily KYC submissions and review outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="submissions" stroke="#8884d8" name="Submissions" />
                <Line type="monotone" dataKey="approvals" stroke="#00C49F" name="Approvals" />
                <Line type="monotone" dataKey="rejections" stroke="#FF8042" name="Rejections" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Current verification status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* BPJS Verification Stats */}
      <Card>
        <CardHeader>
          <CardTitle>BPJS Verification Statistics</CardTitle>
          <CardDescription>Government verification API performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">BPJS Kesehatan</h4>
              <div className="flex items-center gap-4">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified: {bpjsStats?.kesehatan_verified || 0}
                </Badge>
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Failed: {bpjsStats?.kesehatan_rejected || 0}
                </Badge>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">BPJS Ketenagakerjaan</h4>
              <div className="flex items-center gap-4">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified: {bpjsStats?.ketenagakerjaan_verified || 0}
                </Badge>
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Failed: {bpjsStats?.ketenagakerjaan_rejected || 0}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCAnalyticsDashboard;