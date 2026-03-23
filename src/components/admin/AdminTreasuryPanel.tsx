import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Price from '@/components/ui/Price';
import {
  Wallet, TrendingUp, Lock, ArrowUpRight, AlertTriangle,
  CheckCircle2, Clock, Loader2, BarChart3
} from 'lucide-react';

const AdminTreasuryPanel = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-treasury-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Parallel queries
      const [wallets, todayDeposits, pendingPayouts, failedToday, escrowLocked] = await Promise.all([
        supabase.from('wallet_accounts').select('available_balance, locked_balance'),
        supabase.from('wallet_transaction_ledger')
          .select('amount')
          .eq('transaction_type', 'deposit')
          .eq('status', 'confirmed')
          .gte('created_at', todayISO),
        supabase.from('payout_requests')
          .select('amount')
          .eq('status', 'pending'),
        supabase.from('wallet_transaction_ledger')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'failed')
          .gte('created_at', todayISO),
        supabase.from('wallet_accounts')
          .select('locked_balance'),
      ]);

      const totalAvailable = (wallets.data || []).reduce((s, w) => s + Number(w.available_balance), 0);
      const totalLocked = (escrowLocked.data || []).reduce((s, w) => s + Number(w.locked_balance), 0);
      const dailyDepositVol = (todayDeposits.data || []).reduce((s, d) => s + Number(d.amount), 0);
      const pendingPayoutVol = (pendingPayouts.data || []).reduce((s, p) => s + Number(p.amount), 0);

      return {
        totalAvailable,
        totalLocked,
        totalAUM: totalAvailable + totalLocked,
        dailyDepositVolume: dailyDepositVol,
        dailyDepositCount: todayDeposits.data?.length || 0,
        pendingPayouts: pendingPayouts.data?.length || 0,
        pendingPayoutVolume: pendingPayoutVol,
        failedToday: failedToday.count || 0,
      };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Platform AUM',
      value: stats?.totalAUM || 0,
      icon: BarChart3,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Available Balances',
      value: stats?.totalAvailable || 0,
      icon: Wallet,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Escrow Locked',
      value: stats?.totalLocked || 0,
      icon: Lock,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
    },
    {
      title: "Today's Deposits",
      value: stats?.dailyDepositVolume || 0,
      icon: TrendingUp,
      color: 'text-chart-1',
      bg: 'bg-chart-1/10',
      subtitle: `${stats?.dailyDepositCount || 0} transactions`,
    },
    {
      title: 'Pending Payouts',
      value: stats?.pendingPayoutVolume || 0,
      icon: ArrowUpRight,
      color: 'text-orange-600',
      bg: 'bg-orange-500/10',
      subtitle: `${stats?.pendingPayouts || 0} requests`,
    },
    {
      title: 'Failed Today',
      value: stats?.failedToday || 0,
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      isCount: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Treasury Command Center</h2>
        <p className="text-sm text-muted-foreground">Real-time financial operations monitoring</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="border-border">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
                {card.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {card.isCount ? card.value : <Price amount={card.value as number} />}
              </div>
              {card.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity indicator */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Wallet Engine: Active
            </Badge>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Escrow System: Active
            </Badge>
            <Badge variant="outline" className={
              stats?.failedToday && stats.failedToday > 5
                ? 'bg-destructive/10 text-destructive border-destructive/20'
                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            }>
              Payment Health: {stats?.failedToday && stats.failedToday > 5 ? 'Degraded' : 'Healthy'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTreasuryPanel;
