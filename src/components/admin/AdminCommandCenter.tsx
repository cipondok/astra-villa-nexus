import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Activity, TrendingUp, TrendingDown, DollarSign, Users, Building2, Store,
  Zap, Globe, Shield, Cpu, Database, Wifi, AlertTriangle, ChevronDown,
  Rocket, Target, BarChart3, ArrowUpRight, ArrowDownRight, Eye, Heart,
  Clock, Bell, Send, Play, Pause, RefreshCw, MapPin, Flame, Crown,
  Gauge, Server, Signal, Radio, Layers, Sparkles, PieChart, Settings,
  Sliders, Route, ShieldCheck, Workflow, ArrowRightLeft, CircleDollarSign,
  Megaphone, TrendingDown as TrendDown, Plug, Boxes, ChevronRight
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// ── Hooks ────────────────────────────────────────────────────────
function useAdminCommandData() {
  const systemHealth = useQuery({
    queryKey: ['admin-cmd-health'],
    queryFn: async () => {
      const start = performance.now();
      const [errors, aiRunning, aiPending, totalProps, totalUsers] = await Promise.all([
        supabase.from('error_logs').select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 3600000).toISOString()),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'running'),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      return {
        latencyMs: Math.round(performance.now() - start),
        errors: errors.count || 0,
        aiRunning: aiRunning.count || 0,
        aiPending: aiPending.count || 0,
        totalProps: totalProps.count || 0,
        totalUsers: totalUsers.count || 0,
      };
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const recentErrors = useQuery({
    queryKey: ['admin-cmd-errors'],
    queryFn: async () => {
      const { data } = await supabase.from('error_logs')
        .select('id, error_type, message, created_at')
        .order('created_at', { ascending: false })
        .limit(8);
      return data || [];
    },
    refetchInterval: 30_000,
  });

  return { systemHealth, recentErrors };
}

// ── Micro Components ─────────────────────────────────────────────
const SignalDot = ({ status }: { status: 'ok' | 'warn' | 'critical' }) => (
  <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${
    status === 'ok' ? 'bg-chart-1 shadow-[0_0_6px_hsl(var(--chart-1)/0.6)]' :
    status === 'warn' ? 'bg-chart-3 shadow-[0_0_6px_hsl(var(--chart-3)/0.6)]' :
    'bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.6)] animate-pulse'
  }`} />
);

const SectionHeader = ({ icon: Icon, title, badge, color = 'text-primary' }: {
  icon: React.ElementType; title: string; badge?: string; color?: string;
}) => (
  <div className="flex items-center gap-2 mb-3">
    <div className={`p-2 rounded-xl bg-primary/10`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <h2 className="text-sm font-black uppercase tracking-wider text-foreground">{title}</h2>
    {badge && <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-primary/30 text-primary ml-auto">{badge}</Badge>}
  </div>
);

const ConfirmedAction = ({ label, icon: Icon, variant = 'default', description, onConfirm }: {
  label: string; icon: React.ElementType; variant?: 'default' | 'urgent' | 'premium';
  description: string; onConfirm: () => void;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        variant="outline" size="sm"
        className={`h-8 text-[10px] font-semibold gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] ${
          variant === 'urgent' ? 'border-destructive/30 text-destructive hover:bg-destructive/10' :
          variant === 'premium' ? 'border-primary/30 text-primary hover:bg-primary/10' :
          'hover:bg-accent/60'
        }`}
      >
        <Icon className="h-3 w-3" />
        {label}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          Confirm: {label}
        </AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Execute</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const MetricBox = ({ label, value, sub, status }: {
  label: string; value: string | number; sub?: string; status?: 'ok' | 'warn' | 'critical';
}) => (
  <div className="p-2.5 rounded-xl bg-card/60 border border-border/40 hover:border-primary/20 transition-all">
    <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
    <div className="flex items-center gap-1.5">
      <p className="text-lg font-black tabular-nums text-foreground leading-none">{value}</p>
      {status && <SignalDot status={status} />}
    </div>
    {sub && <p className="text-[9px] text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const ToggleControl = ({ label, icon: Icon, defaultOn = false }: {
  label: string; icon: React.ElementType; defaultOn?: boolean;
}) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/30">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold text-foreground">{label}</span>
      </div>
      <Switch checked={on} onCheckedChange={(v) => { setOn(v); toast.success(`${label}: ${v ? 'ON' : 'OFF'}`); }} className="scale-75" />
    </div>
  );
};

const SliderControl = ({ label, icon: Icon, defaultVal = 50, min = 0, max = 100, unit = '%' }: {
  label: string; icon: React.ElementType; defaultVal?: number; min?: number; max?: number; unit?: string;
}) => {
  const [val, setVal] = useState([defaultVal]);
  return (
    <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-semibold text-foreground">{label}</span>
        </div>
        <span className="text-[10px] font-black tabular-nums text-primary">{val[0]}{unit}</span>
      </div>
      <Slider value={val} onValueChange={setVal} min={min} max={max} step={1} className="h-1" />
    </div>
  );
};

// ── PANEL COMPONENTS ─────────────────────────────────────────────

const LiquidityControlPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionHeader icon={Activity} title="Liquidity Control Panel" badge="Core Engine" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox label="Supply/Demand Ratio" value="1.7x" status="ok" sub="Balanced" />
        <MetricBox label="Avg Days to Close" value="28d" status="warn" sub="Target: 21d" />
        <MetricBox label="Active Listings" value="2,847" sub="+124 this week" />
        <MetricBox label="Liquidity Index" value="74" status="ok" sub="Healthy" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SliderControl icon={Gauge} label="Liquidity Score Threshold" defaultVal={65} unit="pts" />
        <SliderControl icon={Target} label="Supply Gap Alert Level" defaultVal={30} unit="%" />
      </div>

      <div className="space-y-1.5">
        <ToggleControl icon={Zap} label="Auto Liquidity Flywheel" defaultOn />
        <ToggleControl icon={Flame} label="Premium Listing Scarcity Mode" />
        <ToggleControl icon={Rocket} label="Boost Campaign Auto-Activation" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ConfirmedAction icon={RefreshCw} label="Trigger Flywheel Cycle" variant="premium"
          description="This will trigger a full liquidity flywheel recalculation across all districts, generating new alerts and supply targets."
          onConfirm={() => toast.success('Flywheel cycle triggered')} />
        <ConfirmedAction icon={Crown} label="Allocate Premium Visibility" variant="premium"
          description="Redistribute premium visibility slots based on current demand signals."
          onConfirm={() => toast.success('Premium slots redistributed')} />
        <ConfirmedAction icon={Megaphone} label="Launch Boost Campaign"
          description="Activate listing boost campaign across high-demand districts."
          onConfirm={() => toast.success('Boost campaign launched')} />
      </div>
    </CardContent>
  </Card>
);

const RevenueEngineControl = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionHeader icon={CircleDollarSign} title="Revenue Engine Control" badge="Monetization" color="text-chart-1" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox label="Revenue Today" value="$4.2K" status="ok" sub="+18% vs avg" />
        <MetricBox label="Boost Revenue" value="$1.8K" sub="42% of total" />
        <MetricBox label="Subscriptions" value="$1.1K" sub="Vendor + Investor" />
        <MetricBox label="Unlock Revenue" value="$890" sub="234 unlocks" />
      </div>

      {/* Revenue by City */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Revenue by City</p>
        <div className="space-y-1.5">
          {[
            { city: 'Jakarta', rev: '$1,840', pct: 44 },
            { city: 'Bali', rev: '$1,120', pct: 27 },
            { city: 'Bandung', rev: '$580', pct: 14 },
            { city: 'Surabaya', rev: '$420', pct: 10 },
            { city: 'Others', rev: '$240', pct: 5 },
          ].map(c => (
            <div key={c.city} className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-foreground w-16">{c.city}</span>
              <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                <motion.div className="h-full rounded-full bg-chart-1" initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 0.5 }} />
              </div>
              <span className="text-[10px] font-bold tabular-nums text-foreground w-12 text-right">{c.rev}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SliderControl icon={DollarSign} label="Boost Tier Multiplier" defaultVal={15} min={5} max={50} unit="x" />
        <SliderControl icon={Store} label="Vendor Sub. Discount" defaultVal={0} unit="%" />
        <SliderControl icon={Users} label="Investor Unlock Price" defaultVal={25} min={5} max={100} unit="K IDR" />
        <SliderControl icon={Megaphone} label="Campaign Discount Cap" defaultVal={20} unit="%" />
      </div>

      <div className="space-y-1.5">
        <ToggleControl icon={Zap} label="Revenue Surge Mode" />
        <ToggleControl icon={Bell} label="Urgency Pricing Active" />
        <ToggleControl icon={Sparkles} label="AI Dynamic Pricing" defaultOn />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ConfirmedAction icon={DollarSign} label="Override Boost Pricing" variant="urgent"
          description="Override all boost pricing tiers with current slider configuration."
          onConfirm={() => toast.success('Boost pricing updated')} />
        <ConfirmedAction icon={Megaphone} label="Activate Revenue Surge"
          description="Enable revenue surge mode - increases monetization signals platform-wide."
          onConfirm={() => toast.success('Revenue surge activated')} />
      </div>
    </CardContent>
  </Card>
);

const GrowthOrchestratorPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionHeader icon={Rocket} title="Growth Orchestrator Panel" badge="Acquisition" color="text-chart-2" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox label="CAC" value="$12.40" status="ok" sub="Target: <$15" />
        <MetricBox label="MoM Growth" value="+23%" sub="Users & listings" />
        <MetricBox label="Campaign Active" value="3" sub="2 geo, 1 webinar" />
        <MetricBox label="Conversion Rate" value="4.2%" status="ok" sub="Funnel avg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SliderControl icon={Target} label="CAC Ceiling" defaultVal={15} min={5} max={50} unit="$" />
        <SliderControl icon={Users} label="Geo-Target Radius" defaultVal={25} min={5} max={100} unit="km" />
      </div>

      <div className="space-y-1.5">
        <ToggleControl icon={Globe} label="Geo-Target Acquisition Funnels" defaultOn />
        <ToggleControl icon={Megaphone} label="Urgency Banner Logic" />
        <ToggleControl icon={Users} label="Investor Webinar Funnel" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ConfirmedAction icon={Rocket} label="Trigger Campaign Sequence" variant="premium"
          description="Launch the next queued growth campaign sequence across all configured channels."
          onConfirm={() => toast.success('Campaign sequence triggered')} />
        <ConfirmedAction icon={Globe} label="Activate Geo Funnels"
          description="Enable geo-targeted acquisition funnels in high-demand districts."
          onConfirm={() => toast.success('Geo funnels activated')} />
        <ConfirmedAction icon={Send} label="Launch Webinar Funnel"
          description="Trigger investor webinar invitation funnel for qualified prospects."
          onConfirm={() => toast.success('Webinar funnel launched')} />
      </div>
    </CardContent>
  </Card>
);

const DealRoutingPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionHeader icon={Route} title="Deal Routing Intelligence" badge="AI Router" color="text-chart-3" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox label="Routed Today" value="47" status="ok" sub="Auto: 38, Manual: 9" />
        <MetricBox label="Avg Confidence" value="87%" status="ok" sub="AI score" />
        <MetricBox label="Fairness Index" value="0.92" sub="Target: >0.85" />
        <MetricBox label="Reassignments" value="3" status="warn" sub="Manual overrides" />
      </div>

      {/* Routing Weight Config */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Vendor Routing Weights</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <SliderControl icon={BarChart3} label="Rating Weight" defaultVal={30} unit="%" />
          <SliderControl icon={Target} label="Completion Rate" defaultVal={25} unit="%" />
          <SliderControl icon={Clock} label="Response Speed" defaultVal={20} unit="%" />
          <SliderControl icon={DollarSign} label="Price Weight" defaultVal={10} unit="%" />
          <SliderControl icon={MapPin} label="Proximity" defaultVal={10} unit="%" />
          <SliderControl icon={Boxes} label="Capacity" defaultVal={5} unit="%" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SliderControl icon={ShieldCheck} label="AI Confidence Threshold" defaultVal={75} unit="%" />
        <SliderControl icon={ArrowRightLeft} label="Fairness Balance Factor" defaultVal={85} unit="%" />
      </div>

      <div className="space-y-1.5">
        <ToggleControl icon={Workflow} label="Auto-Distribution Active" defaultOn />
        <ToggleControl icon={ShieldCheck} label="AI Confidence Gate" defaultOn />
        <ToggleControl icon={ArrowRightLeft} label="Fairness Balancing" defaultOn />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ConfirmedAction icon={RefreshCw} label="Redistribute Lead Queue" variant="urgent"
          description="Rebalance the entire lead distribution queue based on current vendor performance scores."
          onConfirm={() => toast.success('Lead queue redistributed')} />
        <ConfirmedAction icon={Route} label="Recalculate Routing Weights"
          description="Recalculate all routing weights and rerank vendor priority lists."
          onConfirm={() => toast.success('Routing weights recalculated')} />
      </div>
    </CardContent>
  </Card>
);

const DemandAlertPanel = () => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionHeader icon={Signal} title="Demand & Alert Intelligence" badge="Live Signals" color="text-destructive" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox label="Demand Spikes" value="4" status="warn" sub="Active alerts" />
        <MetricBox label="Supply Gaps" value="7" status="critical" sub="Districts affected" />
        <MetricBox label="Price Resistance" value="2" status="warn" sub="Segments flagged" />
        <MetricBox label="Opportunities" value="5" status="ok" sub="High liquidity windows" />
      </div>

      {/* Live Alert Stream */}
      <ScrollArea className="max-h-[200px]">
        <div className="space-y-1.5">
          {[
            { msg: 'Demand spike — South Jakarta villa segment (+42% inquiries in 2h)', severity: 'critical' as const, time: '2m ago' },
            { msg: 'Supply gap widening — Ubud premium listings below threshold', severity: 'critical' as const, time: '8m ago' },
            { msg: 'Pricing resistance — Bandung apartments showing stall at Rp 800M', severity: 'warn' as const, time: '15m ago' },
            { msg: 'Liquidity window — Surabaya commercial zone high conversion probability', severity: 'ok' as const, time: '22m ago' },
            { msg: 'Investor activity surge — 18 high-intent sessions in Jakarta CBD', severity: 'ok' as const, time: '31m ago' },
            { msg: 'Vendor SLA risk — 4 agents below 2h response threshold', severity: 'warn' as const, time: '45m ago' },
          ].map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-2 p-2 rounded-lg border ${
                a.severity === 'critical' ? 'bg-destructive/5 border-destructive/20' :
                a.severity === 'warn' ? 'bg-chart-3/5 border-chart-3/20' : 'bg-chart-1/5 border-chart-1/20'
              }`}>
              <SignalDot status={a.severity} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-foreground font-medium leading-tight">{a.msg}</p>
                <p className="text-[9px] text-muted-foreground">{a.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Investor Activity Funnel */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Investor Activity Funnel</p>
        <div className="space-y-1">
          {[
            { stage: 'Browsing', count: 342, pct: '100%' },
            { stage: 'Viewed Details', count: 189, pct: '55%' },
            { stage: 'Unlocked', count: 67, pct: '19%' },
            { stage: 'Inquired', count: 34, pct: '10%' },
            { stage: 'Closed Deal', count: 8, pct: '2.3%' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[9px] font-medium text-foreground w-20 truncate">{s.stage}</span>
              <div className="flex-1 h-3 rounded bg-muted/30 overflow-hidden">
                <motion.div className="h-full rounded bg-primary/60" initial={{ width: 0 }} animate={{ width: s.pct }} transition={{ delay: i * 0.1, duration: 0.5 }} />
              </div>
              <span className="text-[9px] font-bold tabular-nums text-foreground w-8 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const SystemPerformancePanel = ({ health, errors }: { health: any; errors: any[] }) => (
  <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
    <CardHeader className="p-3 pb-2 border-b border-border/30">
      <SectionHeader icon={Gauge} title="System Performance Monitor" badge="Infrastructure" color="text-chart-2" />
    </CardHeader>
    <CardContent className="p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricBox label="DB Response" value={`${health?.latencyMs || 0}ms`}
          status={health && health.latencyMs < 500 ? 'ok' : health && health.latencyMs < 2000 ? 'warn' : 'critical'} />
        <MetricBox label="Errors (1h)" value={health?.errors || 0}
          status={!health?.errors ? 'ok' : health.errors < 5 ? 'warn' : 'critical'} />
        <MetricBox label="AI Jobs Running" value={health?.aiRunning || 0} status="ok" />
        <MetricBox label="AI Queue" value={health?.aiPending || 0}
          status={health && health.aiPending > 20 ? 'warn' : 'ok'} />
      </div>

      {/* Health Gauges */}
      <div className="space-y-2">
        {[
          { label: 'Edge Function Latency', val: health?.latencyMs || 0, max: 2000, icon: Cpu },
          { label: 'DB Query Load', val: Math.min((health?.totalProps || 0) / 100, 100), max: 100, icon: Database },
          { label: 'AI Scoring Queue', val: (health?.aiPending || 0) + (health?.aiRunning || 0), max: 50, icon: Sparkles },
        ].map(g => {
          const pct = Math.min((g.val / g.max) * 100, 100);
          const status = pct < 50 ? 'ok' : pct < 80 ? 'warn' : 'critical';
          const Icon = g.icon;
          return (
            <div key={g.label}>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-semibold text-foreground">{g.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black tabular-nums text-foreground">{g.val}</span>
                  <SignalDot status={status as any} />
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${status === 'ok' ? 'bg-chart-1' : status === 'warn' ? 'bg-chart-3' : 'bg-destructive'}`}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Stream */}
      {errors.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Recent Errors</p>
          <ScrollArea className="max-h-[120px]">
            <div className="space-y-1">
              {errors.map((e: any, i: number) => (
                <div key={i} className="flex items-start gap-2 p-1.5 rounded-lg bg-destructive/5 border border-destructive/15">
                  <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-medium text-foreground truncate">{e.message || e.error_type}</p>
                    <p className="text-[8px] text-muted-foreground">{new Date(e.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <MetricBox label="Total Users" value={(health?.totalUsers || 0).toLocaleString()} />
        <MetricBox label="Total Listings" value={(health?.totalProps || 0).toLocaleString()} />
        <MetricBox label="Uptime" value="99.9%" status="ok" />
      </div>
    </CardContent>
  </Card>
);

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════
const AdminCommandCenter: React.FC = () => {
  const { systemHealth, recentErrors } = useAdminCommandData();
  const health = systemHealth.data;
  const errors = recentErrors.data || [];
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const navItems = [
    { key: 'liquidity', label: 'Liquidity', icon: Activity },
    { key: 'revenue', label: 'Revenue', icon: CircleDollarSign },
    { key: 'growth', label: 'Growth', icon: Rocket },
    { key: 'routing', label: 'Deal Routing', icon: Route },
    { key: 'demand', label: 'Demand Intel', icon: Signal },
    { key: 'system', label: 'System', icon: Gauge },
  ];

  const scrollToPanel = (key: string) => {
    const el = document.getElementById(`panel-${key}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActivePanel(key);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ═══ COMMAND STRIP ═══ */}
      <div className="sticky top-12 z-20 -mx-2 md:-mx-3 lg:-mx-4 px-2 md:px-3 lg:px-4 py-2 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Settings className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-sm font-black tracking-tight text-foreground">ADMIN COMMAND CENTER</h1>
          <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-chart-1/30 text-chart-1 animate-pulse">● LIVE</Badge>
          <div className="ml-auto flex items-center gap-2">
            <MetricBox label="DB" value={`${health?.latencyMs || 0}ms`} status={health && health.latencyMs < 500 ? 'ok' : 'warn'} />
            <MetricBox label="Errors" value={health?.errors || 0} status={!health?.errors ? 'ok' : 'critical'} />
            <MetricBox label="AI Queue" value={(health?.aiRunning || 0) + (health?.aiPending || 0)} status="ok" />
          </div>
        </div>

        {/* Quick Nav */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {navItems.map(n => {
            const Icon = n.icon;
            return (
              <button key={n.key} onClick={() => scrollToPanel(n.key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${
                  activePanel === n.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}>
                <Icon className="h-3 w-3" />
                {n.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ PANELS ═══ */}
      <div id="panel-liquidity"><LiquidityControlPanel /></div>
      <div id="panel-revenue"><RevenueEngineControl /></div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-6" id="panel-growth"><GrowthOrchestratorPanel /></div>
        <div className="col-span-12 lg:col-span-6" id="panel-routing"><DealRoutingPanel /></div>
      </div>
      <div id="panel-demand"><DemandAlertPanel /></div>
      <div id="panel-system"><SystemPerformancePanel health={health} errors={errors} /></div>
    </div>
  );
};

export default AdminCommandCenter;
