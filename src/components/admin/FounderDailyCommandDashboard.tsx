import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, TrendingUp, TrendingDown, DollarSign, Users, Building2, Store,
  Zap, Globe, Shield, Cpu, Database, Wifi, AlertTriangle, ChevronDown,
  Rocket, Target, BarChart3, ArrowUpRight, ArrowDownRight, Eye, Heart,
  Clock, Bell, Send, Play, Pause, RefreshCw, MapPin, Flame, Crown,
  Gauge, Server, Signal, Radio, Layers, Sparkles, PieChart
} from 'lucide-react';
import { useRelativeTime } from '@/hooks/useRelativeTime';

// ── Data Hooks ───────────────────────────────────────────────────
function useFounderDashboardData() {
  const platformStats = useQuery({
    queryKey: ['founder-cmd-stats'],
    queryFn: async () => {
      const [users, props, vendors, views, orders] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('vendor_business_profiles').select('id', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('web_analytics').select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
        supabase.from('transactions').select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
      ]);
      return {
        totalUsers: users.count || 0,
        totalProperties: props.count || 0,
        totalVendors: vendors.count || 0,
        todayViews: views.count || 0,
        todayTransactions: orders.count || 0,
      };
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const recentActivity = useQuery({
    queryKey: ['founder-cmd-activity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_activity_logs')
        .select('id, action_type, created_at, metadata')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const systemHealth = useQuery({
    queryKey: ['founder-cmd-health'],
    queryFn: async () => {
      const start = performance.now();
      const { count: errCount } = await supabase.from('error_logs').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 3600000).toISOString());
      const { count: jobsRunning } = await supabase.from('ai_jobs').select('id', { count: 'exact', head: true })
        .eq('status', 'running');
      const { count: jobsPending } = await supabase.from('ai_jobs').select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
      const latency = Math.round(performance.now() - start);
      return { dbErrors: errCount || 0, jobsRunning: jobsRunning || 0, jobsPending: jobsPending || 0, latencyMs: latency };
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const vendorStats = useQuery({
    queryKey: ['founder-cmd-vendors'],
    queryFn: async () => {
      const today = new Date(); today.setHours(0,0,0,0);
      const { count: todayOnboarded } = await supabase.from('vendor_business_profiles').select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());
      const { count: pendingQuality } = await supabase.from('properties').select('id', { count: 'exact', head: true })
        .is('ai_quality_score', null);
      return { todayOnboarded: todayOnboarded || 0, pendingQuality: pendingQuality || 0 };
    },
    staleTime: 60_000,
  });

  return { platformStats, recentActivity, systemHealth, vendorStats };
}

// ── Micro Components ─────────────────────────────────────────────
const SignalDot = ({ status }: { status: 'ok' | 'warn' | 'critical' }) => (
  <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${
    status === 'ok' ? 'bg-chart-1 shadow-[0_0_6px_hsl(var(--chart-1)/0.6)]' :
    status === 'warn' ? 'bg-chart-3 shadow-[0_0_6px_hsl(var(--chart-3)/0.6)]' :
    'bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.6)] animate-pulse'
  }`} />
);

const TrendArrow = ({ value, suffix = '%' }: { value: number; suffix?: string }) => (
  <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums ${value >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
    {value >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
    {Math.abs(value).toFixed(1)}{suffix}
  </span>
);

const CommandMetric = ({ icon: Icon, label, value, trend, status, className = '' }: {
  icon: React.ElementType; label: string; value: string | number; trend?: number; status?: 'ok' | 'warn' | 'critical'; className?: string;
}) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/40 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group ${className}`}>
    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-lg font-black tabular-nums text-foreground leading-none">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {trend !== undefined && <TrendArrow value={trend} />}
        {status && <SignalDot status={status} />}
      </div>
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, variant = 'default', onClick }: {
  icon: React.ElementType; label: string; variant?: 'default' | 'urgent' | 'premium'; onClick?: () => void;
}) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClick}
    className={`h-8 text-[10px] font-semibold gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
      variant === 'urgent' ? 'border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50' :
      variant === 'premium' ? 'border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50' :
      'hover:bg-accent/60'
    }`}
  >
    <Icon className="h-3 w-3" />
    {label}
  </Button>
);

// ── Alert Card ───────────────────────────────────────────────────
const alertTypes = [
  { type: 'demand_spike', icon: Flame, label: 'Demand spike detected — low inventory in South Jakarta', priority: 'critical' as const },
  { type: 'pricing_resistance', icon: TrendingDown, label: 'Pricing resistance emerging in Bali villa segment', priority: 'warn' as const },
  { type: 'vendor_sla', icon: Clock, label: 'Vendor SLA risk — 3 agents below response threshold', priority: 'warn' as const },
  { type: 'liquidity_window', icon: Zap, label: 'High liquidity window — Bandung commercial district', priority: 'ok' as const },
  { type: 'investor_surge', icon: Crown, label: 'Investor activity surge — 12 high-intent sessions active', priority: 'ok' as const },
  { type: 'ai_scoring', icon: Sparkles, label: 'AI scoring batch completed — 847 properties updated', priority: 'ok' as const },
];

const AlertCard = ({ alert, index }: { alert: typeof alertTypes[0]; index: number }) => {
  const Icon = alert.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${
        alert.priority === 'critical' ? 'bg-destructive/5 border-destructive/20' :
        alert.priority === 'warn' ? 'bg-chart-3/5 border-chart-3/20' :
        'bg-chart-1/5 border-chart-1/20'
      }`}
    >
      <div className={`p-1.5 rounded-lg shrink-0 ${
        alert.priority === 'critical' ? 'bg-destructive/10' :
        alert.priority === 'warn' ? 'bg-chart-3/10' : 'bg-chart-1/10'
      }`}>
        <Icon className={`h-3.5 w-3.5 ${
          alert.priority === 'critical' ? 'text-destructive' :
          alert.priority === 'warn' ? 'text-chart-3' : 'text-chart-1'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground font-medium leading-tight">{alert.label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Just now</p>
      </div>
      <SignalDot status={alert.priority} />
    </motion.div>
  );
};

// ── Funnel Visualization ─────────────────────────────────────────
const funnelStages = [
  { label: 'Visitors', value: 12847, icon: Eye, width: '100%' },
  { label: 'Property Views', value: 4293, icon: Building2, width: '78%' },
  { label: 'Inquiries', value: 892, icon: Heart, width: '52%' },
  { label: 'Paid Unlock', value: 234, icon: DollarSign, width: '32%' },
  { label: 'Closed Deals', value: 47, icon: Target, width: '18%' },
];

const FunnelBar = ({ stage, index }: { stage: typeof funnelStages[0]; index: number }) => {
  const Icon = stage.icon;
  const convRate = index > 0 ? ((stage.value / funnelStages[index - 1].value) * 100).toFixed(1) : null;
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay: index * 0.12, duration: 0.4, ease: 'easeOut' }}
      className="origin-left"
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-semibold text-foreground">{stage.label}</span>
        <span className="text-[10px] font-black tabular-nums text-foreground ml-auto">{stage.value.toLocaleString()}</span>
        {convRate && <Badge variant="secondary" className="text-[8px] h-4 px-1">{convRate}%</Badge>}
      </div>
      <div className="h-6 rounded-lg bg-muted/40 overflow-hidden relative">
        <motion.div
          className="h-full rounded-lg bg-gradient-to-r from-primary/80 to-primary/40"
          initial={{ width: 0 }}
          animate={{ width: stage.width }}
          transition={{ delay: index * 0.12 + 0.2, duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
};

// ── City Liquidity Widget ────────────────────────────────────────
const cityLiquidity = [
  { city: 'Jakarta', index: 87, trend: 3.2 },
  { city: 'Bali', index: 92, trend: 5.1 },
  { city: 'Bandung', index: 64, trend: -1.8 },
  { city: 'Surabaya', index: 71, trend: 2.4 },
  { city: 'Yogyakarta', index: 58, trend: 1.2 },
];

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════
const FounderDailyCommandDashboard: React.FC = () => {
  const { platformStats, recentActivity, systemHealth, vendorStats } = useFounderDashboardData();
  const stats = platformStats.data;
  const health = systemHealth.data;
  const vendors = vendorStats.data;
  const [selectedCity, setSelectedCity] = useState('Jakarta');
  const [pulseCount, setPulseCount] = useState(0);

  // Simulated live pulse
  useEffect(() => {
    const interval = setInterval(() => setPulseCount(p => p + Math.floor(Math.random() * 3)), 5000);
    return () => clearInterval(interval);
  }, []);

  const statsUpdated = useRelativeTime(platformStats.dataUpdatedAt);
  const healthUpdated = useRelativeTime(systemHealth.dataUpdatedAt);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ═══ SECTION 1: GLOBAL COMMAND STRIP ═══ */}
      <div className="sticky top-12 z-20 -mx-2 md:-mx-3 lg:-mx-4 px-2 md:px-3 lg:px-4 py-2 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Radio className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-sm font-black tracking-tight text-foreground">FOUNDER COMMAND CENTER</h1>
          </div>
          <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-chart-1/30 text-chart-1 animate-pulse">● LIVE</Badge>
          {statsUpdated && <span className="text-[9px] text-muted-foreground ml-auto tabular-nums">↻ {statsUpdated}</span>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <CommandMetric icon={Globe} label="City Liquidity" value={`${cityLiquidity.find(c => c.city === selectedCity)?.index || 0}`} trend={cityLiquidity.find(c => c.city === selectedCity)?.trend} status="ok" />
          <CommandMetric icon={Users} label="Live Demand Pulse" value={stats?.todayViews || 0} trend={12.3} status="ok" />
          <CommandMetric icon={DollarSign} label="Revenue Today" value={`$${((stats?.todayTransactions || 0) * 450).toLocaleString()}`} trend={8.7} />
          <CommandMetric icon={Shield} label="System Health" value={`${health?.latencyMs || 0}ms`} status={health && health.latencyMs < 500 ? 'ok' : health && health.latencyMs < 2000 ? 'warn' : 'critical'} />
        </div>

        {/* City switcher */}
        <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-1">
          {cityLiquidity.map(c => (
            <button
              key={c.city}
              onClick={() => setSelectedCity(c.city)}
              className={`px-2 py-0.5 rounded-md text-[9px] font-semibold whitespace-nowrap transition-all ${
                selectedCity === c.city
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              {c.city} <span className="tabular-nums">{c.index}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ SECTION 2 & 3: MARKET DOMINATION + REVENUE FLYWHEEL ═══ */}
      <div className="grid grid-cols-12 gap-3">
        {/* Market Domination Panel */}
        <div className="col-span-12 lg:col-span-7 space-y-3">
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="p-3 pb-2 border-b border-border/30">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-foreground">
                <Target className="h-4 w-4 text-primary" />
                Market Domination Panel
                <Badge variant="secondary" className="text-[8px] h-4 ml-auto">5 cities</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              {/* Geo Demand Heatmap (simplified) */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Geo Demand Heatmap</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {cityLiquidity.map(c => (
                    <div
                      key={c.city}
                      className={`p-2 rounded-lg border text-center transition-all cursor-pointer hover:scale-105 ${
                        c.index >= 80 ? 'bg-chart-1/10 border-chart-1/30' :
                        c.index >= 60 ? 'bg-chart-3/10 border-chart-3/30' :
                        'bg-muted/30 border-border/30'
                      }`}
                      onClick={() => setSelectedCity(c.city)}
                    >
                      <p className="text-[10px] font-bold text-foreground">{c.city}</p>
                      <p className={`text-sm font-black tabular-nums ${c.index >= 80 ? 'text-chart-1' : c.index >= 60 ? 'text-chart-3' : 'text-muted-foreground'}`}>{c.index}</p>
                      <TrendArrow value={c.trend} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Supply Gap Alerts */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Supply Gap Alerts</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {[
                    { area: 'South Jakarta', gap: 'Villa inventory -34% vs demand', severity: 'critical' as const },
                    { area: 'Ubud, Bali', gap: 'Premium listings shortage — 8 investor requests pending', severity: 'warn' as const },
                    { area: 'Surabaya East', gap: 'Commercial space supply gap widening', severity: 'warn' as const },
                  ].map((alert, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-xs border ${
                      alert.severity === 'critical' ? 'bg-destructive/5 border-destructive/20' : 'bg-chart-3/5 border-chart-3/20'
                    }`}>
                      <SignalDot status={alert.severity} />
                      <span className="font-semibold text-foreground">{alert.area}</span>
                      <span className="text-muted-foreground text-[10px] flex-1 truncate">{alert.gap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Suggested Founder Actions */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">⚡ AI Suggested Actions</p>
                <div className="flex flex-wrap gap-1.5">
                  <ActionButton icon={Rocket} label="Activate vendor acquisition campaign" variant="premium" />
                  <ActionButton icon={Flame} label="Trigger premium listing scarcity" variant="urgent" />
                  <ActionButton icon={Send} label="Launch investor deal alert broadcast" variant="premium" />
                  <ActionButton icon={Zap} label="Enable AI deal prioritization" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Flywheel Monitor */}
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="p-3 pb-2 border-b border-border/30">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-foreground">
                <PieChart className="h-4 w-4 text-primary" />
                Revenue Flywheel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              {funnelStages.map((stage, i) => (
                <FunnelBar key={stage.label} stage={stage} index={i} />
              ))}

              <div className="h-px bg-border/30 my-2" />

              {/* Metrics strip */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Inquiry Conv.', value: '20.8%' },
                  { label: 'Unlock Rate', value: '26.2%' },
                  { label: 'Rev/Listing', value: '$127' },
                  { label: 'Daily Rev.', value: '$21.1K' },
                ].map(m => (
                  <div key={m.label} className="p-2 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-[9px] text-muted-foreground uppercase">{m.label}</p>
                    <p className="text-sm font-black tabular-nums text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Quick Toggle Controls */}
              <div className="flex flex-wrap gap-1.5">
                <ActionButton icon={DollarSign} label="Adjust boost pricing" />
                <ActionButton icon={Bell} label="Activate urgency banners" variant="urgent" />
                <ActionButton icon={Sparkles} label="AI deal prioritization" variant="premium" />
                <ActionButton icon={Rocket} label="Campaign surge mode" variant="urgent" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══ SECTION 4 & 5: VENDOR + INVESTOR ═══ */}
      <div className="grid grid-cols-12 gap-3">
        {/* Vendor Marketplace Engine */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm h-full">
            <CardHeader className="p-3 pb-2 border-b border-border/30">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-foreground">
                <Store className="h-4 w-4 text-chart-3" />
                Vendor Marketplace Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <CommandMetric icon={Store} label="Onboarded Today" value={vendors?.todayOnboarded || 0} trend={15} className="!p-2" />
                <CommandMetric icon={Layers} label="Pending Quality" value={vendors?.pendingQuality || 0} status={vendors && vendors.pendingQuality > 100 ? 'warn' : 'ok'} className="!p-2" />
              </div>

              {/* Vendor Performance Leaderboard */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Response Performance</p>
                {[
                  { name: 'PT Bali Property Co', score: 98, responseMin: 4 },
                  { name: 'Jakarta Realty Group', score: 92, responseMin: 8 },
                  { name: 'Surabaya Homes Ltd', score: 85, responseMin: 15 },
                ].map((v, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/20 last:border-0">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                      i === 0 ? 'bg-chart-1/15 text-chart-1' : 'bg-muted/40 text-muted-foreground'
                    }`}>{i + 1}</span>
                    <span className="text-xs text-foreground font-medium flex-1 truncate">{v.name}</span>
                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{v.responseMin}m avg</Badge>
                    <span className="text-xs font-bold tabular-nums text-chart-1">{v.score}%</span>
                  </div>
                ))}
              </div>

              {/* Inactivity Risks */}
              <div className="p-2 rounded-lg bg-chart-3/5 border border-chart-3/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="h-3 w-3 text-chart-3" />
                  <span className="text-[10px] font-semibold text-chart-3">2 vendors at inactivity risk</span>
                </div>
                <p className="text-[10px] text-muted-foreground">No listing updates for 14+ days</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <ActionButton icon={Crown} label="Allocate premium slots" variant="premium" />
                <ActionButton icon={Send} label="Send performance nudges" />
                <ActionButton icon={RefreshCw} label="Smart lead redistribution" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investor Intelligence Panel */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm h-full">
            <CardHeader className="p-3 pb-2 border-b border-border/30">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-foreground">
                <TrendingUp className="h-4 w-4 text-chart-2" />
                Investor Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <CommandMetric icon={Users} label="High-Intent Active" value={23} trend={18.5} className="!p-2" />
                <CommandMetric icon={DollarSign} label="Capital Demand" value="$4.2M" trend={7.3} className="!p-2" />
              </div>

              {/* Preferred Asset Categories */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Preferred Assets</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { cat: 'Villa', pct: 42 },
                    { cat: 'Commercial', pct: 28 },
                    { cat: 'Apartment', pct: 18 },
                  ].map(a => (
                    <div key={a.cat} className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
                      <p className="text-sm font-black tabular-nums text-foreground">{a.pct}%</p>
                      <p className="text-[9px] text-muted-foreground">{a.cat}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Clusters */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Investment Clusters</p>
                <div className="flex flex-wrap gap-1">
                  {['Bali South', 'Jakarta CBD', 'Bandung North', 'Ubud', 'Surabaya'].map(c => (
                    <Badge key={c} variant="outline" className="text-[9px] h-5 px-1.5 border-primary/20 text-foreground">{c}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <ActionButton icon={Send} label="Send curated deal batch" variant="premium" />
                <ActionButton icon={Zap} label="Private inventory release" variant="urgent" />
                <ActionButton icon={Bell} label="Exclusive notification campaign" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══ SECTION 6 & 7: ALERTS + PERFORMANCE ═══ */}
      <div className="grid grid-cols-12 gap-3">
        {/* Real-Time Execution Alert Stream */}
        <div className="col-span-12 lg:col-span-7">
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader className="p-3 pb-2 border-b border-border/30">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-foreground">
                <Signal className="h-4 w-4 text-destructive" />
                Real-Time Execution Alerts
                <Badge variant="destructive" className="text-[8px] h-4 px-1.5 ml-auto animate-pulse">{alertTypes.length} active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <ScrollArea className="max-h-[280px]">
                <div className="space-y-2">
                  <AnimatePresence>
                    {alertTypes.map((alert, i) => (
                      <AlertCard key={alert.type} alert={alert} index={i} />
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Performance & Scale Monitor */}
        <div className="col-span-12 lg:col-span-5">
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm h-full">
            <CardHeader className="p-3 pb-2 border-b border-border/30">
              <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-foreground">
                <Gauge className="h-4 w-4 text-chart-2" />
                System Diagnostics
                {healthUpdated && <span className="text-[9px] text-muted-foreground font-normal ml-auto">↻ {healthUpdated}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              {/* Health Gauges */}
              {[
                { label: 'DB Response', value: health?.latencyMs || 0, max: 2000, unit: 'ms', icon: Database, status: (health?.latencyMs || 0) < 500 ? 'ok' as const : 'warn' as const },
                { label: 'Error Rate (1h)', value: health?.dbErrors || 0, max: 50, unit: 'errs', icon: AlertTriangle, status: (health?.dbErrors || 0) === 0 ? 'ok' as const : 'warn' as const },
                { label: 'AI Jobs Running', value: health?.jobsRunning || 0, max: 20, unit: 'jobs', icon: Cpu, status: 'ok' as const },
                { label: 'AI Queue Pending', value: health?.jobsPending || 0, max: 50, unit: 'jobs', icon: Server, status: (health?.jobsPending || 0) > 20 ? 'warn' as const : 'ok' as const },
              ].map(gauge => {
                const Icon = gauge.icon;
                const pct = Math.min((gauge.value / gauge.max) * 100, 100);
                return (
                  <div key={gauge.label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-semibold text-foreground">{gauge.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black tabular-nums text-foreground">{gauge.value}{gauge.unit === 'ms' ? 'ms' : ''}</span>
                        <SignalDot status={gauge.status} />
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${gauge.status === 'ok' ? 'bg-chart-1' : gauge.status === 'warn' ? 'bg-chart-3' : 'bg-destructive'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="h-px bg-border/30" />

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="text-sm font-black tabular-nums text-foreground">{stats?.totalUsers.toLocaleString() || '0'}</p>
                  <p className="text-[8px] text-muted-foreground uppercase">Total Users</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="text-sm font-black tabular-nums text-foreground">{stats?.totalProperties.toLocaleString() || '0'}</p>
                  <p className="text-[8px] text-muted-foreground uppercase">Listings</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="text-sm font-black tabular-nums text-foreground">{stats?.totalVendors.toLocaleString() || '0'}</p>
                  <p className="text-[8px] text-muted-foreground uppercase">Vendors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FounderDailyCommandDashboard;
