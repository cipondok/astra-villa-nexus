import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Building2, Users, MessageSquare, Wrench, TrendingUp, TrendingDown,
  Activity, RefreshCw, BarChart3, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { format, subDays } from 'date-fns';

const CHART_TOOLTIP = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  fontSize: 11,
  color: 'hsl(var(--popover-foreground))',
  boxShadow: '0 8px 32px hsl(var(--foreground) / 0.08)',
};

function useMarketplaceHealth() {
  return useQuery({
    queryKey: ['marketplace-health'],
    queryFn: async () => {
      const now = new Date();
      const d7 = subDays(now, 7).toISOString();
      const d14 = subDays(now, 14).toISOString();
      const d30 = subDays(now, 30).toISOString();

      const results = await Promise.allSettled([
        // New listings this week vs last week
        supabase.from('properties').select('id', { count: 'exact' }).gte('created_at', d7),
        supabase.from('properties').select('id', { count: 'exact' }).gte('created_at', d14).lt('created_at', d7),
        // New listings daily for chart (30 days)
        supabase.from('properties').select('created_at').gte('created_at', d30).order('created_at', { ascending: true }).limit(500),
        // Investor activity (investor_profiles active)
        supabase.from('investor_profiles').select('id', { count: 'exact' }),
        supabase.from('investor_profiles').select('id', { count: 'exact' }).gte('created_at', d7),
        // Inquiry counts
        supabase.from('inquiries').select('id, status', { count: 'exact' }).gte('created_at', d7),
        supabase.from('inquiries').select('id', { count: 'exact' }).gte('created_at', d7).eq('status', 'converted'),
        supabase.from('inquiries').select('id', { count: 'exact' }).gte('created_at', d14).lt('created_at', d7),
        // Inquiry daily for chart (30 days)
        supabase.from('inquiries').select('created_at').gte('created_at', d30).order('created_at', { ascending: true }).limit(500),
        // Service bookings
        supabase.from('property_service_bookings').select('id', { count: 'exact' }).gte('created_at', d7),
        supabase.from('property_service_bookings').select('id', { count: 'exact' }).gte('created_at', d14).lt('created_at', d7),
        // Service bookings daily (30 days)
        supabase.from('property_service_bookings').select('created_at').gte('created_at', d30).order('created_at', { ascending: true }).limit(200),
        // Vendor bookings
        supabase.from('vendor_bookings').select('id', { count: 'exact' }).gte('created_at', d7),
      ]);

      const safe = <T,>(r: PromiseSettledResult<{ data: T | null; count: number | null }>, fallback: T) => {
        if (r.status === 'fulfilled') return { data: r.value.data ?? fallback, count: r.value.count ?? 0 };
        return { data: fallback, count: 0 };
      };

      const listingsThisWeek = safe(results[0], []).count;
      const listingsLastWeek = safe(results[1], []).count;
      const listingsRaw = safe(results[2], []).data as any[];

      const totalInvestors = safe(results[3], []).count;
      const newInvestorsThisWeek = safe(results[4], []).count;

      const inquiriesThisWeek = safe(results[5], []).count;
      const convertedThisWeek = safe(results[6], []).count;
      const inquiriesLastWeek = safe(results[7], []).count;
      const inquiriesRaw = safe(results[8], []).data as any[];

      const serviceThisWeek = safe(results[9], []).count;
      const serviceLastWeek = safe(results[10], []).count;
      const serviceRaw = safe(results[11], []).data as any[];
      const vendorThisWeek = safe(results[12], []).count;

      // Build daily chart data (30 days)
      const buildDailyChart = (rows: any[]) => {
        const days: Record<string, number> = {};
        for (let i = 29; i >= 0; i--) {
          const d = format(subDays(now, i), 'MMM dd');
          days[d] = 0;
        }
        rows.forEach(r => {
          const d = format(new Date(r.created_at), 'MMM dd');
          if (days[d] !== undefined) days[d]++;
        });
        return Object.entries(days).map(([date, count]) => ({ date, count }));
      };

      const conversionRate = inquiriesThisWeek > 0
        ? Math.round((convertedThisWeek / inquiriesThisWeek) * 100)
        : 0;

      const listingsDelta = listingsLastWeek > 0
        ? Math.round(((listingsThisWeek - listingsLastWeek) / listingsLastWeek) * 100)
        : listingsThisWeek > 0 ? 100 : 0;

      const inquiriesDelta = inquiriesLastWeek > 0
        ? Math.round(((inquiriesThisWeek - inquiriesLastWeek) / inquiriesLastWeek) * 100)
        : inquiriesThisWeek > 0 ? 100 : 0;

      const serviceDelta = serviceLastWeek > 0
        ? Math.round(((serviceThisWeek - serviceLastWeek) / serviceLastWeek) * 100)
        : serviceThisWeek > 0 ? 100 : 0;

      return {
        listings: {
          thisWeek: listingsThisWeek,
          lastWeek: listingsLastWeek,
          delta: listingsDelta,
          chart: buildDailyChart(listingsRaw),
        },
        investors: {
          total: totalInvestors,
          newThisWeek: newInvestorsThisWeek,
        },
        inquiries: {
          thisWeek: inquiriesThisWeek,
          converted: convertedThisWeek,
          conversionRate,
          delta: inquiriesDelta,
          chart: buildDailyChart(inquiriesRaw),
        },
        services: {
          thisWeek: serviceThisWeek + vendorThisWeek,
          lastWeek: serviceLastWeek,
          delta: serviceDelta,
          chart: buildDailyChart(serviceRaw),
        },
      };
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

// ── Metric Card ──
function HealthMetricCard({ title, value, subLabel, delta, icon: Icon, color, chart, gradientId, chartColor }: {
  title: string;
  value: string;
  subLabel: string;
  delta: number;
  icon: React.ElementType;
  color: string;
  chart: { date: string; count: number }[];
  gradientId: string;
  chartColor: string;
}) {
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';
  const TrendIcon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus;
  const signalColor = delta > 5 ? 'text-chart-1' : delta < -5 ? 'text-destructive' : 'text-chart-3';
  const signalBg = delta > 5 ? 'bg-chart-1/10' : delta < -5 ? 'bg-destructive/10' : 'bg-chart-3/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="border-border/40 overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="px-4 pt-4 pb-2 flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className={cn('p-2 rounded-lg', color.replace('text-', 'bg-') + '/10')}>
                <Icon className={cn('h-4 w-4', color)} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <p className="text-2xl font-black text-foreground tabular-nums">{value}</p>
                  <Badge variant="outline" className={cn('text-[9px] gap-0.5 border-0', signalBg, signalColor)}>
                    <TrendIcon className="h-2.5 w-2.5" />
                    {delta > 0 ? '+' : ''}{delta}%
                  </Badge>
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">{subLabel}</p>
              </div>
            </div>
          </div>

          {/* Mini chart */}
          <div className="h-16 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={`hsl(var(--${chartColor}))`} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={`hsl(var(--${chartColor}))`} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={`hsl(var(--${chartColor}))`}
                  fill={`url(#${gradientId})`}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Signal Indicator ──
function SignalIndicator({ value, thresholds }: { value: number; thresholds: [number, number] }) {
  const color = value >= thresholds[1] ? 'bg-chart-1' : value >= thresholds[0] ? 'bg-chart-3' : 'bg-destructive';
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('w-2 h-2 rounded-full', color)} />
      <span className={cn(
        'text-[10px] font-mono font-bold',
        value >= thresholds[1] ? 'text-chart-1' : value >= thresholds[0] ? 'text-chart-3' : 'text-destructive'
      )}>
        {value >= thresholds[1] ? 'STABLE' : value >= thresholds[0] ? 'WARNING' : 'CRITICAL'}
      </span>
    </div>
  );
}

// ── Main Panel ──
const MarketplaceHealthPanel = () => {
  const { data, isLoading, refetch } = useMarketplaceHealth();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Overall health score (simple weighted)
  const healthScore = Math.min(100, Math.max(0,
    50
    + (data.listings.delta > 0 ? 15 : data.listings.delta > -10 ? 5 : -5)
    + (data.inquiries.conversionRate > 20 ? 15 : data.inquiries.conversionRate > 10 ? 8 : 0)
    + (data.investors.newThisWeek > 0 ? 10 : 0)
    + (data.services.thisWeek > 0 ? 10 : 0)
  ));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-chart-1 to-chart-1/70 shadow-lg shadow-chart-1/20">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Marketplace Health</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <SignalIndicator value={healthScore} thresholds={[40, 60]} />
              <span className="text-[10px] text-muted-foreground">
                Score: <span className="font-bold text-foreground">{healthScore}</span>/100
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs h-8">
          <RefreshCw className="h-3 w-3" /> Refresh
        </Button>
      </div>

      {/* Overall health bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Platform Health Index</span>
          <span className={cn(
            'text-xs font-mono font-bold',
            healthScore >= 60 ? 'text-chart-1' : healthScore >= 40 ? 'text-chart-3' : 'text-destructive'
          )}>
            {healthScore >= 60 ? 'HEALTHY' : healthScore >= 40 ? 'MODERATE' : 'AT RISK'}
          </span>
        </div>
        <Progress value={healthScore} className="h-2.5" />
      </div>

      {/* 4 Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <HealthMetricCard
          title="New Listings"
          value={data.listings.thisWeek.toString()}
          subLabel={`vs ${data.listings.lastWeek} last week`}
          delta={data.listings.delta}
          icon={Building2}
          color="text-primary"
          chart={data.listings.chart}
          gradientId="mh-listings"
          chartColor="primary"
        />
        <HealthMetricCard
          title="Investor Activity"
          value={data.investors.total.toString()}
          subLabel={`+${data.investors.newThisWeek} new this week`}
          delta={data.investors.newThisWeek > 0 ? Math.round((data.investors.newThisWeek / Math.max(data.investors.total, 1)) * 100) : 0}
          icon={Users}
          color="text-chart-2"
          chart={data.listings.chart} // reuse listings chart shape
          gradientId="mh-investors"
          chartColor="chart-2"
        />
        <HealthMetricCard
          title="Inquiry Conversion"
          value={`${data.inquiries.conversionRate}%`}
          subLabel={`${data.inquiries.converted}/${data.inquiries.thisWeek} inquiries converted`}
          delta={data.inquiries.delta}
          icon={MessageSquare}
          color="text-chart-3"
          chart={data.inquiries.chart}
          gradientId="mh-inquiries"
          chartColor="chart-3"
        />
        <HealthMetricCard
          title="Service Bookings"
          value={data.services.thisWeek.toString()}
          subLabel={`vs ${data.services.lastWeek} last week`}
          delta={data.services.delta}
          icon={Wrench}
          color="text-chart-4"
          chart={data.services.chart}
          gradientId="mh-services"
          chartColor="chart-4"
        />
      </div>

      {/* Detailed breakdown terminal */}
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-bold text-foreground">Detailed Signals</span>
          </div>
          <div className="bg-muted/20 rounded-lg p-3 font-mono text-[10px] space-y-2 border border-border/20">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">listing_velocity</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{(data.listings.thisWeek / 7).toFixed(1)}/day</span>
                <SignalIndicator value={data.listings.thisWeek} thresholds={[3, 7]} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">inquiry_volume</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{data.inquiries.thisWeek} this week</span>
                <SignalIndicator value={data.inquiries.thisWeek} thresholds={[5, 15]} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">conversion_rate</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{data.inquiries.conversionRate}%</span>
                <SignalIndicator value={data.inquiries.conversionRate} thresholds={[10, 25]} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">investor_growth</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">+{data.investors.newThisWeek} new</span>
                <SignalIndicator value={data.investors.newThisWeek} thresholds={[1, 5]} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">service_demand</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{data.services.thisWeek} bookings</span>
                <SignalIndicator value={data.services.thisWeek} thresholds={[2, 8]} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketplaceHealthPanel;
