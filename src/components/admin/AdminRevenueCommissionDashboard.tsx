import { useAdminRevenue, type AdminRevenueStats } from '@/hooks/useAdminRevenue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, Building2,
  Users, FileText, Percent, BarChart3, CheckCircle2, Clock, AlertTriangle,
} from 'lucide-react';

function formatIDR(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(2)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(1)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

function GrowthBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return <Badge variant="secondary" className="text-[9px]">New</Badge>;
  const pct = ((current - previous) / previous * 100).toFixed(1);
  const isUp = current >= previous;
  return (
    <Badge variant="outline" className={cn('text-[9px]', isUp ? 'text-emerald-500 border-emerald-500/30' : 'text-destructive border-destructive/30')}>
      {isUp ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
      {isUp ? '+' : ''}{pct}%
    </Badge>
  );
}

export default function AdminRevenueCommissionDashboard() {
  const { data: stats, isLoading } = useAdminRevenue();

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Revenue & Commissions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const completionRate = stats.total_transactions > 0
    ? Math.round((stats.completed_transactions / stats.total_transactions) * 100)
    : 0;

  const mortgageApprovalRate = stats.mortgage_applications > 0
    ? Math.round((stats.mortgage_approved / stats.mortgage_applications) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Revenue & Commissions</h2>
        </div>
        <GrowthBadge current={stats.monthly_revenue} previous={stats.prev_monthly_revenue} />
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Revenue', value: formatIDR(stats.total_revenue), icon: DollarSign, color: 'text-primary', sub: `This month: ${formatIDR(stats.monthly_revenue)}` },
          { label: 'Total Commissions', value: formatIDR(stats.total_commissions), icon: Percent, color: 'text-chart-4', sub: `Pending: ${formatIDR(stats.pending_commissions)}` },
          { label: 'Transactions', value: String(stats.total_transactions), icon: CreditCard, color: 'text-chart-2', sub: `${completionRate}% completed` },
          { label: 'Active Affiliates', value: String(stats.active_affiliates), icon: Users, color: 'text-chart-3', sub: `Earnings: ${formatIDR(stats.total_affiliate_earnings)}` },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <kpi.icon className={cn('h-4 w-4 mb-2', kpi.color)} />
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
              <p className="text-[9px] text-muted-foreground/70 mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Cards */}
      <div className="grid md:grid-cols-3 gap-3">
        {/* Transaction Breakdown */}
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-chart-2" /> Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Completed', value: stats.completed_transactions, icon: CheckCircle2, color: 'text-emerald-500' },
              { label: 'Pending', value: stats.pending_transactions, icon: Clock, color: 'text-amber-500' },
              { label: 'Completion Rate', value: `${completionRate}%`, icon: BarChart3, color: 'text-primary' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/20">
                <div className="flex items-center gap-2">
                  <row.icon className={cn('h-3.5 w-3.5', row.color)} />
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                </div>
                <span className="text-xs font-bold text-foreground">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Commission Breakdown */}
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Percent className="h-4 w-4 text-chart-4" /> Commissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Total Earned', value: formatIDR(stats.total_commissions), color: 'text-foreground' },
              { label: 'Paid Out', value: formatIDR(stats.paid_commissions), color: 'text-emerald-500' },
              { label: 'Pending Payout', value: formatIDR(stats.pending_commissions), color: 'text-amber-500' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/20">
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <span className={cn('text-xs font-bold', row.color)}>{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mortgage Pipeline */}
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Mortgage Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Total Applications', value: stats.mortgage_applications, icon: FileText, color: 'text-foreground' },
              { label: 'Approved', value: stats.mortgage_approved, icon: CheckCircle2, color: 'text-emerald-500' },
              { label: 'Pending Review', value: stats.mortgage_pending, icon: Clock, color: 'text-amber-500' },
              { label: 'Approval Rate', value: `${mortgageApprovalRate}%`, icon: BarChart3, color: 'text-primary' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/20">
                <div className="flex items-center gap-2">
                  <row.icon className={cn('h-3.5 w-3.5', row.color)} />
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                </div>
                <span className={cn('text-xs font-bold', row.color)}>{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
