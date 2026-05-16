import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Activity, Zap, Users, Store, DollarSign, Megaphone,
  TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Gauge, BarChart3, Target, Flame, Building, Clock,
  RefreshCw, ChevronRight, Radio, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Metric card ─────────────────────────────────────────────────────────
const MetricCard = ({ label, value, delta, deltaType, icon: Icon, accent = 'primary', pulse = false }: {
  label: string; value: string; delta?: string; deltaType?: 'up' | 'down' | 'neutral';
  icon: React.ElementType; accent?: string; pulse?: boolean;
}) => (
  <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-card p-4 transition-shadow hover:shadow-md">
    {pulse && <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
        {delta && (
          <span className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium",
            deltaType === 'up' ? 'text-green-600 dark:text-green-400' :
            deltaType === 'down' ? 'text-red-500' : 'text-muted-foreground'
          )}>
            {deltaType === 'up' ? <ArrowUpRight className="h-3 w-3" /> :
             deltaType === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
            {delta}
          </span>
        )}
      </div>
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  </div>
);

// ── Pipeline stage ──────────────────────────────────────────────────────
const PipelineStage = ({ label, count, pct, color }: {
  label: string; count: number; pct: number; color: string;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs">
      <span className="font-medium text-foreground">{label}</span>
      <span className="tabular-nums text-muted-foreground">{count}</span>
    </div>
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
    </div>
  </div>
);

// ── Alert row ───────────────────────────────────────────────────────────
const AlertRow = ({ message, severity, time }: {
  message: string; severity: 'critical' | 'warning' | 'info'; time: string;
}) => (
  <div className={cn(
    "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm",
    severity === 'critical' ? 'border-red-500/30 bg-red-500/5' :
    severity === 'warning' ? 'border-yellow-500/30 bg-yellow-500/5' :
    'border-blue-500/30 bg-blue-500/5'
  )}>
    <AlertTriangle className={cn(
      "h-4 w-4 mt-0.5 flex-shrink-0",
      severity === 'critical' ? 'text-red-500' :
      severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
    )} />
    <div className="flex-1 min-w-0">
      <p className="text-foreground">{message}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
    </div>
  </div>
);

// ── Main component ──────────────────────────────────────────────────────
const ExecutionCommandCenter = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch property stats
  const { data: propertyStats } = useQuery({
    queryKey: ['exec-cmd-properties', refreshKey],
    queryFn: async () => {
      const { count: total } = await supabase.from('properties').select('*', { count: 'exact', head: true });
      const { count: active } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'available');
      const { count: pending } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      return { total: total ?? 0, active: active ?? 0, pending: pending ?? 0 };
    },
    staleTime: 30_000,
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['exec-cmd-users', refreshKey],
    queryFn: async () => {
      const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      return { total: total ?? 0 };
    },
    staleTime: 30_000,
  });

  // Fetch vendor stats
  const { data: vendorStats } = useQuery({
    queryKey: ['exec-cmd-vendors', refreshKey],
    queryFn: async () => {
      const { count: total } = await (supabase as any).from('vendor_business_profiles').select('*', { count: 'exact', head: true });
      const { count: verified } = await (supabase as any).from('vendor_business_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified');
      return { total: total ?? 0, verified: verified ?? 0 };
    },
    staleTime: 30_000,
  });

  // Fetch deal pipeline via inquiries
  const { data: dealStats } = useQuery({
    queryKey: ['exec-cmd-deals', refreshKey],
    queryFn: async () => {
      const { data } = await supabase.from('inquiries').select('status, id');
      if (!data) return { stages: {} as Record<string, number>, total: 0 };
      const stages: Record<string, number> = {};
      data.forEach((d: { status: string | null; id: string }) => {
        const key = d.status ?? 'unknown';
        stages[key] = (stages[key] || 0) + 1;
      });
      return { stages, total: data.length };
    },
    staleTime: 30_000,
  });

  // Fetch recent worker runs
  const { data: workerRuns } = useQuery({
    queryKey: ['exec-cmd-workers', refreshKey],
    queryFn: async () => {
      const { data } = await supabase
        .from('intelligence_worker_runs')
        .select('worker_name, status, duration_ms, rows_affected, started_at')
        .order('started_at', { ascending: false })
        .limit(10);
      return data ?? [];
    },
    staleTime: 30_000,
  });

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    toast.success('Dashboard refreshed');
  };

  const handleTriggerFlywheel = async (worker: string) => {
    toast.loading(`Triggering ${worker}...`, { id: worker });
    try {
      const { data, error } = await supabase.functions.invoke('intelligence-cron', {
        body: { workers: [worker] },
      });
      if (error) throw error;
      toast.success(`${worker} completed`, { id: worker });
      setRefreshKey(k => k + 1);
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`, { id: worker });
    }
  };

  const pipelineStages = [
    { label: 'Inquiry', key: 'inquiry', color: 'bg-blue-500' },
    { label: 'Viewing', key: 'viewing', color: 'bg-indigo-500' },
    { label: 'Offer', key: 'offer', color: 'bg-amber-500' },
    { label: 'Negotiation', key: 'negotiation', color: 'bg-orange-500' },
    { label: 'Payment', key: 'payment_initiated', color: 'bg-emerald-500' },
    { label: 'Legal', key: 'legal_verification', color: 'bg-teal-500' },
    { label: 'Closed', key: 'closed', color: 'bg-green-600' },
  ];

  const liveAlerts = [
    { message: 'Midtrans payment gateway not configured — transactions blocked', severity: 'critical' as const, time: 'Ongoing' },
    { message: `${propertyStats?.pending ?? 0} listings pending review — approval queue building`, severity: 'warning' as const, time: 'Now' },
    { message: `${vendorStats?.total ?? 0} vendors onboarded — target: 100 for city launch`, severity: 'info' as const, time: 'Milestone tracker' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Radio className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Execution Command Center</h1>
            <p className="text-sm text-muted-foreground">Real-time operating cockpit — market ignition control</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Listings" value={String(propertyStats?.total ?? 0)} delta={`${propertyStats?.active ?? 0} active`} deltaType="up" icon={Building} pulse />
        <MetricCard label="Investors" value={String(userStats?.total ?? 0)} icon={Users} />
        <MetricCard label="Vendors" value={String(vendorStats?.total ?? 0)} delta={`${vendorStats?.verified ?? 0} verified`} deltaType="up" icon={Store} />
        <MetricCard label="Active Deals" value={String(dealStats?.total ?? 0)} icon={Target} />
        <MetricCard label="Deal Rate" value={dealStats?.total && propertyStats?.total ? `${((dealStats.total / Math.max(propertyStats.total, 1)) * 100).toFixed(1)}%` : '0%'} icon={Gauge} />
        <MetricCard label="Workers OK" value={`${workerRuns?.filter(w => w.status === 'success').length ?? 0}/${workerRuns?.length ?? 0}`} icon={ShieldCheck} pulse />
      </div>

      {/* Tabbed cockpit panels */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="pipeline" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" />Pipeline</TabsTrigger>
          <TabsTrigger value="liquidity" className="gap-1.5 text-xs"><Flame className="h-3.5 w-3.5" />Liquidity</TabsTrigger>
          <TabsTrigger value="vendor" className="gap-1.5 text-xs"><Store className="h-3.5 w-3.5" />Vendors</TabsTrigger>
          <TabsTrigger value="revenue" className="gap-1.5 text-xs"><DollarSign className="h-3.5 w-3.5" />Revenue</TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-1.5 text-xs"><Megaphone className="h-3.5 w-3.5" />Campaigns</TabsTrigger>
        </TabsList>

        {/* Pipeline */}
        <TabsContent value="pipeline">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Transaction Pipeline Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pipelineStages.map(stage => {
                  const count = dealStats?.stages[stage.key] ?? 0;
                  const pct = dealStats?.total ? (count / dealStats.total) * 100 : 0;
                  return <PipelineStage key={stage.key} label={stage.label} count={count} pct={pct} color={stage.color} />;
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Live Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {liveAlerts.map((alert, i) => (
                  <AlertRow key={i} {...alert} />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Liquidity */}
        <TabsContent value="liquidity">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Liquidity Engine Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Opportunity Scoring', worker: 'opportunity_scoring', desc: 'Recalculate all property scores' },
                  { label: 'Deal Alert Scanner', worker: 'deal_alerts', desc: 'Scan for deal threshold triggers' },
                  { label: 'Market Clusters', worker: 'market_clusters', desc: 'Aggregate geo-cluster heat' },
                  { label: 'Demand Heat Sync', worker: 'demand_heat_sync', desc: 'Sync demand heat signals' },
                  { label: 'Portfolio Snapshots', worker: 'portfolio_snapshots', desc: 'Compute portfolio state' },
                ].map(item => (
                  <div key={item.worker} className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleTriggerFlywheel(item.worker)} className="gap-1.5 flex-shrink-0">
                      <Zap className="h-3.5 w-3.5" />
                      Trigger
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Recent Worker Runs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(workerRuns ?? []).map((run, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          run.status === 'success' ? 'bg-green-500' : run.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                        )} />
                        <span className="font-medium text-foreground">{run.worker_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{run.rows_affected ?? 0} rows</span>
                        <span>{run.duration_ms ?? 0}ms</span>
                      </div>
                    </div>
                  ))}
                  {(!workerRuns || workerRuns.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent worker runs</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vendor */}
        <TabsContent value="vendor">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <MetricCard label="Total Vendors" value={String(vendorStats?.total ?? 0)} icon={Store} />
            <MetricCard label="Verified" value={String(vendorStats?.verified ?? 0)} delta={vendorStats?.total ? `${((vendorStats.verified / Math.max(vendorStats.total, 1)) * 100).toFixed(0)}%` : '0%'} deltaType="up" icon={ShieldCheck} />
            <MetricCard label="Unverified" value={String((vendorStats?.total ?? 0) - (vendorStats?.verified ?? 0))} deltaType="down" icon={AlertTriangle} />
            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Vendor Supply Pressure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Renovation', 'Legal', 'Interior', 'Construction'].map(cat => (
                    <div key={cat} className="rounded-lg border border-border/40 p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{cat}</p>
                      <p className="text-lg font-bold tabular-nums text-foreground">—</p>
                      <p className="text-xs text-muted-foreground">needs seeding</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard label="MRR" value="Rp 0" delta="Pre-launch" deltaType="neutral" icon={DollarSign} />
            <MetricCard label="Transaction Fees" value="Rp 0" delta="No closed deals yet" deltaType="neutral" icon={BarChart3} />
            <MetricCard label="Vendor SaaS" value="Rp 0" delta="Subscriptions pending" deltaType="neutral" icon={Store} />
            <MetricCard label="Take Rate" value="1.15%" delta="Target" deltaType="up" icon={TrendingUp} />
          </div>
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Revenue Flywheel Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                  <ChevronRight className="h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Subscription Plans</p>
                    <p className="text-xs text-muted-foreground">Edit investor & vendor pricing tiers</p>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                  <ChevronRight className="h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Commission Override</p>
                    <p className="text-xs text-muted-foreground">Adjust platform take-rate per deal type</p>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                  <ChevronRight className="h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Premium Slot Pricing</p>
                    <p className="text-xs text-muted-foreground">Configure featured listing & vendor slots</p>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                  <ChevronRight className="h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Upsell Automations</p>
                    <p className="text-xs text-muted-foreground">Trigger conditions for upgrade prompts</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns */}
        <TabsContent value="campaigns">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  Campaign Quick Launch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'City Launch — Bandung', desc: 'Full playbook: supply seeding + demand ads + vendor outreach', status: 'ready' },
                  { label: 'Investor Webinar Funnel', desc: 'Lead magnet → webinar → Pro plan conversion', status: 'draft' },
                  { label: 'Vendor Referral Program', desc: 'Commission incentive for vendor-to-vendor referrals', status: 'draft' },
                  { label: 'TikTok Property Tours', desc: 'Viral property video campaign — luxury listings', status: 'draft' },
                ].map(campaign => (
                  <div key={campaign.label} className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{campaign.label}</p>
                      <p className="text-xs text-muted-foreground">{campaign.desc}</p>
                    </div>
                    <Badge variant={campaign.status === 'ready' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                      {campaign.status === 'ready' ? 'Ready' : 'Draft'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Launch Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Listings seeded (50+ target)', pct: Math.min(((propertyStats?.total ?? 0) / 50) * 100, 100) },
                  { label: 'Vendors onboarded (100 target)', pct: Math.min(((vendorStats?.total ?? 0) / 100) * 100, 100) },
                  { label: 'Payment gateway configured', pct: 0 },
                  { label: 'First deal closed', pct: (dealStats?.stages['closed'] ?? 0) > 0 ? 100 : 0 },
                  { label: 'SMTP / email configured', pct: 0 },
                ].map(item => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">{item.label}</span>
                      <span className="tabular-nums text-muted-foreground">{item.pct.toFixed(0)}%</span>
                    </div>
                    <Progress value={item.pct} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutionCommandCenter;
