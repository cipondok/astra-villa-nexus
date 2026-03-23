import { ArrowUpDown, TrendingUp, Clock, DollarSign, Shield, Activity, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSecondaryMarketMetrics, useExitListings, useLiquidityTransfers } from '@/hooks/useSecondaryMarket';

const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export default function SecondaryMarketDashboard() {
  const { data: metrics = [] } = useSecondaryMarketMetrics();
  const { data: listings = [] } = useExitListings(false);
  const { data: transfers = [] } = useLiquidityTransfers();

  const latestMetric = metrics[0] as any;
  const activeListings = listings.filter((l: any) => l.listing_status === 'active');
  const completedTransfers = transfers.filter((t: any) => t.escrow_status === 'completed');
  const pendingTransfers = transfers.filter((t: any) => t.escrow_status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Secondary Market Command
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Liquidity exchange volume, exit metrics, and transfer analytics</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" /> Live
        </Badge>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-xl font-bold">{formatIDR(latestMetric?.total_secondary_volume_idr ?? 0)}</p>
            <p className="text-[10px] text-muted-foreground">Total Volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ArrowUpDown className="h-5 w-5 mx-auto mb-2 text-chart-1" />
            <p className="text-xl font-bold">{activeListings.length}</p>
            <p className="text-[10px] text-muted-foreground">Active Listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-2 text-chart-4" />
            <p className="text-xl font-bold">{latestMetric?.avg_exit_time_days?.toFixed(0) ?? '—'}</p>
            <p className="text-[10px] text-muted-foreground">Avg Exit Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-chart-3" />
            <p className="text-xl font-bold">{latestMetric?.repeat_secondary_investors ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Repeat Investors</p>
          </CardContent>
        </Card>
      </div>

      {/* Transfer Pipeline */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Transfer Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-chart-4/5 border border-chart-4/20 text-center">
              <p className="text-lg font-bold text-chart-4">{pendingTransfers.length}</p>
              <p className="text-[10px] text-muted-foreground">Pending Escrow</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <p className="text-lg font-bold text-primary">{transfers.filter((t: any) => t.escrow_status === 'locked').length}</p>
              <p className="text-[10px] text-muted-foreground">In Escrow</p>
            </div>
            <div className="p-3 rounded-lg bg-chart-1/5 border border-chart-1/20 text-center">
              <p className="text-lg font-bold text-chart-1">{completedTransfers.length}</p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transfers */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Recent Transfers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {transfers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No transfers recorded yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transfers.slice(0, 10).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div>
                    <p className="text-xs font-semibold">{formatIDR(t.transfer_amount_idr)}</p>
                    <p className="text-[10px] text-muted-foreground">{t.ownership_percentage}% position</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={`text-[9px] ${
                      t.escrow_status === 'completed' ? 'text-chart-1 border-chart-1/30' :
                      t.escrow_status === 'locked' ? 'text-primary border-primary/30' :
                      'text-chart-4 border-chart-4/30'
                    }`}>
                      {t.escrow_status}
                    </Badge>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      Fee: {formatIDR(t.platform_fee_idr || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Trends */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-chart-1" />
            <p className="text-lg font-bold">
              {latestMetric?.avg_premium_rate_pct ? `+${latestMetric.avg_premium_rate_pct.toFixed(1)}%` : '—'}
            </p>
            <p className="text-[10px] text-muted-foreground">Avg Premium Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-chart-4" />
            <p className="text-lg font-bold">{formatIDR(latestMetric?.total_platform_fees_idr ?? 0)}</p>
            <p className="text-[10px] text-muted-foreground">Platform Fees Earned</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
