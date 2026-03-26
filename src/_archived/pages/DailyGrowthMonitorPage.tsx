import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDailyGrowthMetrics, type DailyTrendPoint } from '@/hooks/useDailyGrowthMetrics';
import { motion } from 'framer-motion';
import {
  Building2, Users, Heart, MessageSquare, Scale, Send,
  CheckCircle2, Share2, Globe, Zap, TrendingUp, TrendingDown,
  Minus, Activity, Loader2, RefreshCw, BarChart3, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Sparkline Mini Chart ─── */

function Sparkline({ data, dataKey, color = 'text-primary', height = 28 }: {
  data: DailyTrendPoint[];
  dataKey: keyof DailyTrendPoint;
  color?: string;
  height?: number;
}) {
  if (!data || data.length < 2) return null;

  const values = data.map(d => Number(d[dataKey]) || 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 80;
  const step = w / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  // Resolve CSS color class to a usable stroke color
  const strokeColor = color.includes('primary') ? 'hsl(var(--primary))' :
    color.includes('chart-2') ? 'hsl(var(--chart-2))' :
    color.includes('chart-4') ? 'hsl(var(--chart-4))' :
    color.includes('chart-5') ? 'hsl(var(--chart-5))' :
    color.includes('destructive') ? 'hsl(var(--destructive))' :
    'hsl(var(--foreground))';

  return (
    <svg width={w} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      {values.length > 0 && (
        <circle
          cx={(values.length - 1) * step}
          cy={height - ((values[values.length - 1] - min) / range) * (height - 4) - 2}
          r="2"
          fill={strokeColor}
        />
      )}
    </svg>
  );
}

/* ─── Delta Badge ─── */

function DeltaBadge({ today, yesterday }: { today: number; yesterday: number }) {
  if (yesterday === 0 && today === 0) {
    return <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 text-muted-foreground border-border"><Minus className="h-2 w-2 mr-0.5" />—</Badge>;
  }
  const delta = yesterday > 0 ? Math.round(((today - yesterday) / yesterday) * 100) : (today > 0 ? 100 : 0);
  const isUp = delta > 0;
  const isFlat = delta === 0;

  return (
    <Badge variant="outline" className={cn(
      'text-[8px] px-1 py-0 h-3.5',
      isUp ? 'text-chart-2 border-chart-2/30' :
      isFlat ? 'text-muted-foreground border-border' :
      'text-destructive border-destructive/30'
    )}>
      {isUp ? <TrendingUp className="h-2 w-2 mr-0.5" /> :
       isFlat ? <Minus className="h-2 w-2 mr-0.5" /> :
       <TrendingDown className="h-2 w-2 mr-0.5" />}
      {isFlat ? '0%' : `${isUp ? '+' : ''}${delta}%`}
    </Badge>
  );
}

/* ─── KPI Card ─── */

interface KPICardProps {
  icon: typeof Building2;
  label: string;
  value: number | string;
  today?: number;
  yesterday?: number;
  sparkData?: DailyTrendPoint[];
  sparkKey?: keyof DailyTrendPoint;
  sparkColor?: string;
  iconColor?: string;
  iconBg?: string;
  suffix?: string;
}

function KPICard({ icon: Icon, label, value, today, yesterday, sparkData, sparkKey, sparkColor = 'text-primary', iconColor = 'text-primary', iconBg = 'bg-primary/10', suffix }: KPICardProps) {
  return (
    <Card className="border border-border bg-card hover:border-border/80 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', iconBg)}>
              <Icon className={cn('h-3 w-3', iconColor)} />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium leading-tight">{label}</span>
          </div>
          {today !== undefined && yesterday !== undefined && (
            <DeltaBadge today={today} yesterday={yesterday} />
          )}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-black text-foreground leading-none">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {suffix && <span className="text-xs font-medium text-muted-foreground ml-0.5">{suffix}</span>}
            </p>
          </div>
          {sparkData && sparkKey && (
            <Sparkline data={sparkData} dataKey={sparkKey} color={sparkColor} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main Dashboard ─── */

export default function DailyGrowthMonitorPage() {
  const { data: m, isLoading, refetch, dataUpdatedAt } = useDailyGrowthMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const metrics = m || {
    total_active_listings: 0, new_listings_today: 0, new_listings_yesterday: 0, developer_projects: 0,
    new_users_today: 0, new_users_yesterday: 0, watchlist_actions_today: 0, watchlist_actions_yesterday: 0,
    inquiries_today: 0, inquiries_yesterday: 0, active_negotiations: 0, offers_today: 0, offers_yesterday: 0,
    deals_closed_week: 0, referral_signups: 0, social_traffic_leads: 0, ai_alert_engagement: 0,
    daily_trend: [],
  };

  const trend = metrics.daily_trend || [];
  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="h-4.5 w-4.5 text-primary" />
                </div>
                Daily Growth Monitor
              </h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Real-time marketplace traction · Last updated {lastUpdate}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-[10px] text-primary hover:text-primary/80 transition-colors px-2.5 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* ═══ MARKETPLACE SUPPLY ═══ */}
        <section>
          <SectionHeader icon={Building2} title="Marketplace Supply" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2">
            <KPICard
              icon={Building2}
              label="Total Active Listings"
              value={metrics.total_active_listings}
              sparkData={trend}
              sparkKey="listings"
              sparkColor="text-primary"
            />
            <KPICard
              icon={TrendingUp}
              label="New Listings Today"
              value={metrics.new_listings_today}
              today={metrics.new_listings_today}
              yesterday={metrics.new_listings_yesterday}
              sparkData={trend}
              sparkKey="listings"
              sparkColor="text-chart-2"
              iconColor="text-chart-2"
              iconBg="bg-chart-2/10"
            />
            <KPICard
              icon={Target}
              label="Developer Projects"
              value={metrics.developer_projects}
              iconColor="text-chart-4"
              iconBg="bg-chart-4/10"
            />
            <KPICard
              icon={BarChart3}
              label="Listing Growth (7d)"
              value={trend.reduce((s, d) => s + d.listings, 0)}
              suffix="total"
              sparkData={trend}
              sparkKey="listings"
              sparkColor="text-primary"
            />
          </div>
        </section>

        {/* ═══ INVESTOR DEMAND ═══ */}
        <section>
          <SectionHeader icon={Users} title="Investor Demand" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2">
            <KPICard
              icon={Users}
              label="New Registrations Today"
              value={metrics.new_users_today}
              today={metrics.new_users_today}
              yesterday={metrics.new_users_yesterday}
              sparkData={trend}
              sparkKey="users"
              sparkColor="text-primary"
            />
            <KPICard
              icon={Heart}
              label="Watchlist Actions Today"
              value={metrics.watchlist_actions_today}
              today={metrics.watchlist_actions_today}
              yesterday={metrics.watchlist_actions_yesterday}
              iconColor="text-destructive"
              iconBg="bg-destructive/10"
            />
            <KPICard
              icon={MessageSquare}
              label="Inquiries Submitted"
              value={metrics.inquiries_today}
              today={metrics.inquiries_today}
              yesterday={metrics.inquiries_yesterday}
              sparkData={trend}
              sparkKey="inquiries"
              sparkColor="text-chart-4"
              iconColor="text-chart-4"
              iconBg="bg-chart-4/10"
            />
            <KPICard
              icon={BarChart3}
              label="Demand Growth (7d)"
              value={trend.reduce((s, d) => s + d.users, 0)}
              suffix="users"
              sparkData={trend}
              sparkKey="users"
              sparkColor="text-chart-2"
              iconColor="text-chart-2"
              iconBg="bg-chart-2/10"
            />
          </div>
        </section>

        {/* ═══ TRANSACTION PIPELINE ═══ */}
        <section>
          <SectionHeader icon={Scale} title="Transaction Pipeline" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2">
            <KPICard
              icon={Scale}
              label="Active Negotiations"
              value={metrics.active_negotiations}
              iconColor="text-chart-4"
              iconBg="bg-chart-4/10"
            />
            <KPICard
              icon={Send}
              label="Offers Submitted Today"
              value={metrics.offers_today}
              today={metrics.offers_today}
              yesterday={metrics.offers_yesterday}
              sparkData={trend}
              sparkKey="offers"
              sparkColor="text-primary"
            />
            <KPICard
              icon={CheckCircle2}
              label="Deals Closed This Week"
              value={metrics.deals_closed_week}
              iconColor="text-chart-2"
              iconBg="bg-chart-2/10"
            />
            <KPICard
              icon={BarChart3}
              label="Offer Volume (7d)"
              value={trend.reduce((s, d) => s + d.offers, 0)}
              suffix="offers"
              sparkData={trend}
              sparkKey="offers"
              sparkColor="text-chart-5"
              iconColor="text-chart-5"
              iconBg="bg-chart-5/10"
            />
          </div>
        </section>

        {/* ═══ GROWTH MOMENTUM ═══ */}
        <section>
          <SectionHeader icon={Zap} title="Growth Momentum" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2">
            <KPICard
              icon={Share2}
              label="Referral Signups Today"
              value={metrics.referral_signups}
              iconColor="text-chart-4"
              iconBg="bg-chart-4/10"
            />
            <KPICard
              icon={Globe}
              label="Social Traffic Leads"
              value={metrics.social_traffic_leads}
              iconColor="text-chart-2"
              iconBg="bg-chart-2/10"
            />
            <KPICard
              icon={Zap}
              label="AI Alert Engagement"
              value={metrics.ai_alert_engagement}
            />
          </div>
        </section>

        {/* ═══ 7-DAY TREND TABLE ═══ */}
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              7-Day Traction Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Listings</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Users</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Inquiries</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Offers</th>
                  </tr>
                </thead>
                <tbody>
                  {trend.map((d, i) => {
                    const isToday = i === trend.length - 1;
                    return (
                      <motion.tr
                        key={d.date}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className={cn(
                          'border-b border-border/30',
                          isToday && 'bg-primary/3'
                        )}
                      >
                        <td className="py-1.5 font-medium text-foreground">
                          {isToday ? 'Today' : new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-1.5 text-right text-foreground">{d.listings}</td>
                        <td className="py-1.5 text-right text-foreground">{d.users}</td>
                        <td className="py-1.5 text-right text-foreground">{d.inquiries}</td>
                        <td className="py-1.5 text-right text-foreground">{d.offers}</td>
                      </motion.tr>
                    );
                  })}
                  {/* Totals row */}
                  <tr className="font-bold border-t border-border">
                    <td className="py-2 text-foreground">Total (7d)</td>
                    <td className="py-2 text-right text-foreground">{trend.reduce((s, d) => s + d.listings, 0)}</td>
                    <td className="py-2 text-right text-foreground">{trend.reduce((s, d) => s + d.users, 0)}</td>
                    <td className="py-2 text-right text-foreground">{trend.reduce((s, d) => s + d.inquiries, 0)}</td>
                    <td className="py-2 text-right text-foreground">{trend.reduce((s, d) => s + d.offers, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─── Section Header ─── */

function SectionHeader({ icon: Icon, title }: { icon: typeof Building2; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
        <Icon className="h-2.5 w-2.5 text-primary" />
      </div>
      <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</h2>
    </div>
  );
}
