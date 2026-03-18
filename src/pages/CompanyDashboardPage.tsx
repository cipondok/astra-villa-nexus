import { motion } from 'framer-motion';
import {
  Building2, Users, MessageSquare, FileText, DollarSign, TrendingUp,
  TrendingDown, Minus, Crown, UserPlus, Share2, Clock, Shield,
  Bell, Activity, ArrowUpRight, ArrowDownRight, Gauge, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useCompanyDashboard, pctDelta } from '@/hooks/useCompanyDashboard';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const CHART_TOOLTIP = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  fontSize: 11,
  color: 'hsl(var(--popover-foreground))',
  boxShadow: '0 8px 32px hsl(var(--foreground) / 0.08)',
};

function formatIDR(v: number): string {
  if (v >= 1_000_000_000) return `IDR ${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `IDR ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `IDR ${(v / 1_000).toFixed(0)}K`;
  return `IDR ${v.toLocaleString()}`;
}

export default function CompanyDashboardPage() {
  const { data, isLoading, refetch, dataUpdatedAt } = useCompanyDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />
          ))}
      </div>
    );
  }

  if (!data) return null;

  const { marketplace: mkt, revenue: rev, growth: grw, operations: ops } = data;

  return (
      <div className="min-h-screen bg-background p-4 md:p-6 max-w-[1400px] mx-auto space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Gauge className="h-5 w-5 text-chart-4" />
              Company Operating Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">
              Last updated: {dataUpdatedAt ? format(new Date(dataUpdatedAt), 'MMM d, HH:mm') : '—'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </motion.div>

        {/* ═══ Section 1: Marketplace Activity ═══ */}
        <Section title="Marketplace Activity" icon={Building2} color="text-primary" delay={0}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard
              label="Active Listings"
              value={mkt.active_listings.toLocaleString()}
              delta={0}
              icon={Building2}
            />
            <KPICard
              label="Daily Active Users"
              value={mkt.daily_active_users.toLocaleString()}
              delta={pctDelta(mkt.daily_active_users, mkt.dau_prev)}
              icon={Users}
            />
            <KPICard
              label="Inquiries (30d)"
              value={mkt.inquiries_30d.toLocaleString()}
              delta={pctDelta(mkt.inquiries_30d, mkt.inquiries_prev)}
              icon={MessageSquare}
            />
            <KPICard
              label="Offers (30d)"
              value={mkt.offers_30d.toLocaleString()}
              delta={pctDelta(mkt.offers_30d, mkt.offers_prev)}
              icon={FileText}
            />
          </div>
          {/* Inquiry Volume Trend */}
          <Card className="border-border/40 mt-3">
            <CardHeader className="pb-1 pt-2 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Inquiry & Offer Volume — 30d</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mkt.inquiry_trend}>
                    <defs>
                      <linearGradient id="inqFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => v.slice(5)} />
                    <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={CHART_TOOLTIP} />
                    <Area type="monotone" dataKey="value" name="Inquiries" stroke="hsl(var(--primary))" fill="url(#inqFill)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* ═══ Section 2: Revenue Performance ═══ */}
        <Section title="Revenue Performance" icon={DollarSign} color="text-chart-4" delay={0.08}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard
              label="Total Revenue (30d)"
              value={formatIDR(rev.total_revenue)}
              delta={pctDelta(rev.total_revenue, rev.total_prev)}
              icon={DollarSign}
              large
            />
            <KPICard
              label="Commission Revenue"
              value={formatIDR(rev.commission_revenue_30d)}
              delta={pctDelta(rev.commission_revenue_30d, rev.commission_revenue_prev)}
              icon={Activity}
            />
            <KPICard
              label="Developer Packages"
              value={formatIDR(rev.developer_package_revenue)}
              delta={pctDelta(rev.developer_package_revenue, rev.developer_package_prev)}
              icon={Crown}
            />
            <KPICard
              label="Subscription Revenue"
              value={formatIDR(rev.subscription_revenue)}
              delta={0}
              icon={DollarSign}
            />
          </div>

          {/* Revenue composition bar */}
          <Card className="border-border/40 mt-3">
            <CardContent className="px-4 py-3">
              <p className="text-[10px] font-medium text-muted-foreground mb-2">Revenue Composition</p>
              <div className="flex h-3 rounded-full overflow-hidden bg-muted/30">
                {rev.total_revenue > 0 && (
                  <>
                    <div className="bg-chart-4 transition-all" style={{ width: `${(rev.commission_revenue_30d / rev.total_revenue) * 100}%` }} />
                    <div className="bg-chart-2 transition-all" style={{ width: `${(rev.developer_package_revenue / rev.total_revenue) * 100}%` }} />
                    <div className="bg-primary transition-all" style={{ width: `${(rev.subscription_revenue / rev.total_revenue) * 100}%` }} />
                  </>
                )}
              </div>
              <div className="flex gap-4 mt-1.5">
                <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-chart-4" /> Commissions
                </span>
                <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-chart-2" /> Developer
                </span>
                <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Subscriptions
                </span>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* ═══ Section 3: Growth Signals ═══ */}
        <Section title="Growth Signals" icon={TrendingUp} color="text-chart-2" delay={0.14}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard
              label="Total Users"
              value={grw.total_users.toLocaleString()}
              delta={0}
              icon={Users}
              large
            />
            <KPICard
              label="New Users (30d)"
              value={grw.new_users_30d.toLocaleString()}
              delta={pctDelta(grw.new_users_30d, grw.new_users_prev)}
              icon={UserPlus}
            />
            <KPICard
              label="Referral Sign-ups"
              value={grw.referral_signups.toLocaleString()}
              delta={0}
              icon={Share2}
            />
            <KPICard
              label="Referral %"
              value={`${grw.referral_pct}%`}
              delta={0}
              icon={Share2}
            />
          </div>

          <Card className="border-border/40 mt-3">
            <CardHeader className="pb-1 pt-2 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground">User Acquisition Trend — 30d</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={grw.user_trend} barCategoryGap="15%">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => v.slice(5)} />
                    <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={CHART_TOOLTIP} />
                    <Bar dataKey="value" name="New Users" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* ═══ Section 4: Operational Health ═══ */}
        <Section title="Operational Health" icon={Shield} color="text-chart-5" delay={0.2}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard
              label="Avg Deal Cycle"
              value={`${ops.avg_deal_cycle_days}d`}
              delta={0}
              icon={Clock}
              status={ops.avg_deal_cycle_days <= 21 ? 'good' : ops.avg_deal_cycle_days <= 45 ? 'warn' : 'bad'}
            />
            <KPICard
              label="Deals Closed (30d)"
              value={ops.closed_deals_30d.toLocaleString()}
              delta={0}
              icon={FileText}
            />
            <KPICard
              label="Pending Alerts"
              value={ops.pending_alerts.toLocaleString()}
              delta={0}
              icon={Bell}
              status={ops.pending_alerts <= 5 ? 'good' : ops.pending_alerts <= 20 ? 'warn' : 'bad'}
            />
            <KPICard
              label="System Health"
              value={`${ops.system_health_score}%`}
              delta={0}
              icon={Activity}
              status={ops.system_health_score >= 95 ? 'good' : ops.system_health_score >= 85 ? 'warn' : 'bad'}
            />
          </div>

          {/* Health bars */}
          <Card className="border-border/40 mt-3">
            <CardContent className="px-4 py-3 space-y-3">
              <HealthBar label="Platform Uptime" value={ops.system_health_score} suffix="%" />
              <HealthBar label="Avg Agent Response" value={Math.max(0, 100 - ops.agent_response_hours * 2)} suffix={`${ops.agent_response_hours}h`} />
              <HealthBar label="Deal Pipeline Health" value={Math.min(100, ops.closed_deals_30d * 5)} suffix={`${ops.closed_deals_30d} deals`} />
            </CardContent>
          </Card>
        </Section>
    </div>
  );
}

/* ── Sub-components ── */

function Section({ title, icon: Icon, color, delay, children }: {
  title: string; icon: React.ElementType; color: string; delay: number; children: React.ReactNode;
}) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className={cn('h-4 w-4', color)} />
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function KPICard({ label, value, delta, icon: Icon, large, status }: {
  label: string; value: string; delta: number; icon: React.ElementType; large?: boolean;
  status?: 'good' | 'warn' | 'bad';
}) {
  const statusColors = { good: 'text-chart-2', warn: 'text-chart-4', bad: 'text-destructive' };
  const DirIcon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : null;

  return (
    <Card className="border-border/40 bg-card/50">
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon className="h-3 w-3 text-primary" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground truncate">{label}</span>
        </div>
        <p className={cn(
          'font-bold text-foreground',
          large ? 'text-xl' : 'text-lg',
          status ? statusColors[status] : ''
        )}>
          {value}
        </p>
        {delta !== 0 && (
          <div className="flex items-center gap-0.5 mt-0.5">
            {DirIcon && <DirIcon className={cn('h-3 w-3', delta > 0 ? 'text-chart-2' : 'text-destructive')} />}
            <span className={cn('text-[10px] font-medium', delta > 0 ? 'text-chart-2' : 'text-destructive')}>
              {delta > 0 ? '+' : ''}{delta}%
            </span>
            <span className="text-[9px] text-muted-foreground ml-0.5">vs prev</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HealthBar({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-foreground">{label}</span>
        <span className="text-[9px] text-muted-foreground">{suffix}</span>
      </div>
      <Progress value={clamped} className="h-1.5" />
    </div>
  );
}
