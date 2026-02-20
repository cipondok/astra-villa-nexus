import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  Scale,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatIDR } from '@/utils/currency';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalCommissions: number;
  pendingPayouts: number;
  completedPayouts: number;
  activeSubscriptions: number;
  openDisputes: number;
  revenueGrowth: number;
}

interface Transaction {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  payment_method: string;
  customer_email: string;
  created_at: string;
}

interface PayoutRequest {
  id: string;
  payout_reference: string;
  vendor_id: string;
  amount: number;
  net_amount: number;
  status: string;
  bank_name: string;
  account_number: string;
  created_at: string;
}

interface Dispute {
  id: string;
  dispute_reference: string;
  transaction_id: string;
  dispute_type: string;
  amount: number;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-chart-1',
  pending: 'bg-chart-3',
  processing: 'bg-chart-2',
  failed: 'bg-destructive',
  cancelled: 'bg-muted-foreground',
  open: 'bg-chart-3',
  under_review: 'bg-chart-2',
  resolved_buyer_favor: 'bg-chart-1',
  resolved_seller_favor: 'bg-chart-1',
  closed: 'bg-muted-foreground'
};

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const FinancialDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalCommissions: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    activeSubscriptions: 0,
    openDisputes: 0,
    revenueGrowth: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch transactions
      const { data: txns } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setTransactions((txns || []) as Transaction[]);

      // Calculate total revenue
      const totalRevenue = txns?.filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Calculate monthly revenue
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const monthlyRevenue = txns?.filter(t => 
        t.status === 'completed' && 
        new Date(t.created_at) >= startOfMonth
      ).reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Fetch commissions
      const { data: commissions } = await supabase
        .from('transaction_commissions')
        .select('*');

      const totalCommissions = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;

      // Fetch payouts
      const { data: payoutData } = await supabase
        .from('vendor_payouts')
        .select('*')
        .order('created_at', { ascending: false });

      setPayouts((payoutData || []) as PayoutRequest[]);

      const pendingPayouts = payoutData?.filter(p => p.status === 'pending' || p.status === 'processing')
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const completedPayouts = payoutData?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Fetch subscriptions
      const { count: activeSubscriptions } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch disputes
      const { data: disputeData } = await supabase
        .from('payment_disputes')
        .select('*')
        .order('created_at', { ascending: false });

      setDisputes((disputeData || []) as Dispute[]);

      const openDisputes = disputeData?.filter(d => d.status === 'open' || d.status === 'under_review').length || 0;

      // Generate revenue chart data (last 7 days)
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayRevenue = txns?.filter(t => 
          t.status === 'completed' && 
          t.created_at.startsWith(dateStr)
        ).reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        chartData.push({
          date: format(date, 'MMM dd'),
          revenue: dayRevenue
        });
      }
      setRevenueData(chartData);

      setMetrics({
        totalRevenue,
        monthlyRevenue,
        totalCommissions,
        pendingPayouts,
        completedPayouts,
        activeSubscriptions: activeSubscriptions || 0,
        openDisputes,
        revenueGrowth: 12.5 // Placeholder
      });

    } catch (_error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    try {
      await supabase
        .from('vendor_payouts')
        .update({ 
          status: 'processing',
          processed_at: new Date().toISOString()
        })
        .eq('id', payoutId);
      
      fetchDashboardData();
    } catch (_error) {}
  };

  const handleResolveDispute = async (disputeId: string, resolution: string) => {
    try {
      await supabase
        .from('payment_disputes')
        .update({ 
          status: resolution,
          resolved_at: new Date().toISOString()
        })
        .eq('id', disputeId);
      
      fetchDashboardData();
    } catch (_error) {}
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">Revenue, payouts, and financial overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(metrics.totalRevenue)}</div>
            <div className="flex items-center text-xs text-chart-1 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{metrics.revenueGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(metrics.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platform Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(metrics.totalCommissions)}</div>
            <p className="text-xs text-muted-foreground mt-1">3-5% per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">Paid users</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip 
                    formatter={(value: number) => [formatIDR(value), 'Revenue']}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--background)', 
                      border: '1px solid var(--border)' 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-chart-3/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-chart-3" />
                  <span className="font-medium">Pending Payouts</span>
                </div>
                <span className="font-bold">{formatIDR(metrics.pendingPayouts)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-chart-1/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-chart-1" />
                  <span className="font-medium">Completed Payouts</span>
                </div>
                <span className="font-bold">{formatIDR(metrics.completedPayouts)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <span className="font-medium">Open Disputes</span>
                </div>
                <span className="font-bold">{metrics.openDisputes}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Transactions, Payouts, Disputes */}
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions" className="gap-2">
            <Receipt className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2">
            <Wallet className="h-4 w-4" />
            Payouts
            {metrics.pendingPayouts > 0 && (
              <Badge variant="destructive" className="ml-1">{payouts.filter(p => p.status === 'pending').length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="disputes" className="gap-2">
            <Scale className="h-4 w-4" />
            Disputes
            {metrics.openDisputes > 0 && (
              <Badge variant="destructive" className="ml-1">{metrics.openDisputes}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search..." 
                      className="pl-9 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions
                    .filter(t => 
                      (statusFilter === 'all' || t.status === statusFilter) &&
                      (searchTerm === '' || t.order_id.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .slice(0, 20)
                    .map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-sm">{tx.order_id}</TableCell>
                        <TableCell>{tx.customer_email || '-'}</TableCell>
                        <TableCell className="font-medium">{formatIDR(tx.amount)}</TableCell>
                        <TableCell className="capitalize">{tx.payment_method?.replace('_', ' ') || '-'}</TableCell>
                        <TableCell>
                          <Badge className={`${STATUS_COLORS[tx.status]} text-white`}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(tx.created_at), 'MMM dd, HH:mm')}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.slice(0, 20).map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-mono text-sm">{payout.payout_reference}</TableCell>
                      <TableCell>{payout.vendor_id.substring(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{formatIDR(payout.net_amount)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{payout.bank_name}</p>
                          <p className="text-muted-foreground">{payout.account_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_COLORS[payout.status]} text-white`}>
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(payout.created_at), 'MMM dd, HH:mm')}</TableCell>
                      <TableCell>
                        {payout.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApprovePayout(payout.id)}
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Dispute Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell className="font-mono text-sm">{dispute.dispute_reference}</TableCell>
                      <TableCell className="font-mono text-sm">{dispute.transaction_id}</TableCell>
                      <TableCell className="capitalize">{dispute.dispute_type.replace('_', ' ')}</TableCell>
                      <TableCell className="font-medium">{formatIDR(dispute.amount)}</TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_COLORS[dispute.status]} text-white`}>
                          {dispute.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(dispute.created_at), 'MMM dd, HH:mm')}</TableCell>
                      <TableCell>
                        {(dispute.status === 'open' || dispute.status === 'under_review') && (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleResolveDispute(dispute.id, 'resolved_buyer_favor')}
                            >
                              Buyer
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleResolveDispute(dispute.id, 'resolved_seller_favor')}
                            >
                              Seller
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
