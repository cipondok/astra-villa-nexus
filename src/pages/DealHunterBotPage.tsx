import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Zap, TrendingUp, Eye, Star, Shield, Settings2, RefreshCw, Activity, Target, Flame, BarChart3, ArrowRight, Plus, GitCompare, Bell, ChevronDown, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDealHunterFeed, useDealHunterHero, useRunDealHunterScan, DEAL_CLASSIFICATIONS, DEAL_TIERS } from '@/hooks/useDealHunter';
import { useDealHunterNotifications, useDealHunterUnreadCount, useMarkDealNotificationRead, useDismissDealNotification, getUrgencyCountdown } from '@/hooks/useDealHunterNotifications';
import { usePriceDropDeals, usePriceDropStats, ALERT_TIER_CONFIG } from '@/hooks/usePriceDropAlerts';
import { useRunInvestorAlertsScan } from '@/hooks/useInvestorAlerts';
import { useWorkerStatus, useRunIntelligenceCron } from '@/hooks/useIntelligenceWorkers';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

type AlertPriority = 'elite' | 'strong' | 'monitor';

const PRIORITY_CONFIG: Record<AlertPriority, { label: string; color: string; bg: string; icon: typeof Flame }> = {
  elite: { label: 'Elite', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/40', icon: Flame },
  strong: { label: 'Strong', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/40', icon: TrendingUp },
  monitor: { label: 'Monitor', color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/40', icon: Eye },
};

function classifyPriority(score: number): AlertPriority {
  if (score >= 75) return 'elite';
  if (score >= 50) return 'strong';
  return 'monitor';
}

// ─── Bot Status Header ───────────────────────────────────────────────
function BotStatusStrip({ workerData }: { workerData: any[] }) {
  const dealWorker = workerData?.find((w: any) => w.worker_name === 'deal_alerts');
  const lastRun = dealWorker?.last_run_at ? format(new Date(dealWorker.last_run_at), 'HH:mm') : '—';
  const status = dealWorker?.last_status || 'idle';

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-card/60 border border-border/40 backdrop-blur-sm">
      <div className="relative">
        <Bot className="h-5 w-5 text-primary" />
        <span className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${status === 'success' ? 'bg-emerald-400' : status === 'running' ? 'bg-amber-400 animate-pulse' : 'bg-muted-foreground'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">Deal Hunter Bot</p>
        <p className="text-[10px] text-muted-foreground">Last scan {lastRun} · {status}</p>
      </div>
      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">AUTONOMOUS</Badge>
    </div>
  );
}

// ─── KPI Row ─────────────────────────────────────────────────────────
function KPIRow({ stats, unreadCount, feedCount }: { stats: any; unreadCount: number; feedCount: number }) {
  const kpis = [
    { label: 'Active Deals', value: feedCount, icon: Target, color: 'text-primary' },
    { label: 'Elite Deals', value: stats.elite, icon: Flame, color: 'text-amber-400' },
    { label: 'Opportunities', value: stats.opportunity, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Unread Alerts', value: unreadCount, icon: Bell, color: 'text-sky-400' },
    { label: 'Avg Drop', value: `${stats.avgDrop}%`, icon: BarChart3, color: 'text-rose-400' },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {kpis.map((k) => (
        <Card key={k.label} className="bg-card/40 border-border/30">
          <CardContent className="p-3 text-center">
            <k.icon className={`h-4 w-4 mx-auto mb-1 ${k.color}`} />
            <p className="text-lg font-bold text-foreground">{k.value}</p>
            <p className="text-[10px] text-muted-foreground">{k.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Deal Card ───────────────────────────────────────────────────────
function DealCard({ deal, onView, onWatchlist, onCompare }: { deal: any; onView: () => void; onWatchlist: () => void; onCompare: () => void }) {
  const priority = classifyPriority(deal.deal_opportunity_signal_score);
  const cfg = PRIORITY_CONFIG[priority];
  const cls = DEAL_CLASSIFICATIONS[deal.deal_classification as keyof typeof DEAL_CLASSIFICATIONS];
  const tier = DEAL_TIERS[deal.deal_tier as keyof typeof DEAL_TIERS];
  const PIcon = cfg.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-lg border p-4 ${cfg.bg} transition-all hover:scale-[1.01]`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <PIcon className={`h-4 w-4 ${cfg.color}`} />
            <Badge variant="outline" className={`text-[10px] ${cfg.color} border-current/30`}>{cfg.label}</Badge>
            {cls && <span className="text-xs">{cls.icon} {cls.label}</span>}
            {tier && <span className={`text-[10px] ${tier.color}`}>{tier.label}</span>}
          </div>
          <h4 className="font-semibold text-sm text-foreground truncate">{deal.property?.title || 'Property'}</h4>
          <p className="text-xs text-muted-foreground">{deal.property?.city} · {deal.property?.property_type}</p>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-foreground font-medium">Score: {deal.deal_opportunity_signal_score}</span>
            <span className="text-muted-foreground">Underval: {deal.undervaluation_percent?.toFixed(1)}%</span>
            <span className="text-muted-foreground">Urgency: {deal.urgency_score}</span>
          </div>
          {deal.signals?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {deal.signals.slice(0, 3).map((s: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0">{s}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-foreground">
            {deal.property?.price ? `Rp ${(deal.property.price / 1e9).toFixed(1)}M` : '—'}
          </p>
          {deal.estimated_fair_value > 0 && (
            <p className="text-[10px] text-emerald-400">Fair: Rp {(deal.estimated_fair_value / 1e9).toFixed(1)}M</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/20">
        <Button size="sm" variant="default" className="h-7 text-xs flex-1" onClick={onView}>
          <Eye className="h-3 w-3 mr-1" /> View
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={onWatchlist}>
          <Plus className="h-3 w-3 mr-1" /> Watchlist
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs flex-1" onClick={onCompare}>
          <GitCompare className="h-3 w-3 mr-1" /> Compare
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Notification Feed ───────────────────────────────────────────────
function NotificationFeed({ notifications, markRead, dismiss }: { notifications: any[]; markRead: (id: string) => void; dismiss: (id: string) => void }) {
  if (!notifications?.length) return <p className="text-sm text-muted-foreground text-center py-8">No alerts yet — bot is scanning…</p>;

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
      {notifications.map((n) => {
        const countdown = getUrgencyCountdown(n.expires_at);
        return (
          <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`rounded-lg border p-3 ${n.is_read ? 'bg-card/20 border-border/20' : 'bg-card/50 border-primary/20'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${n.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  {n.deal_score > 0 && <Badge variant="outline" className="text-[9px]">Score {n.deal_score}</Badge>}
                  {!countdown.isExpired && countdown.urgencyLevel !== 'normal' && (
                    <Badge variant="outline" className={`text-[9px] ${countdown.urgencyLevel === 'critical' ? 'text-rose-400 border-rose-400/30' : 'text-amber-400 border-amber-400/30'}`}>
                      {countdown.label}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {!n.is_read && <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => markRead(n.id)}>Read</Button>}
                <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-muted-foreground" onClick={() => dismiss(n.id)}>Dismiss</Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Admin Controls Panel ────────────────────────────────────────────
function AdminControls({ workerData }: { workerData: any[] }) {
  const [sensitivity, setSensitivity] = useState([65]);
  const [autoScan, setAutoScan] = useState(true);
  const [openAdmin, setOpenAdmin] = useState(false);
  const runCron = useRunIntelligenceCron();
  const runDealScan = useRunDealHunterScan();
  const runAlertsScan = useRunInvestorAlertsScan();

  const workers = [
    { key: 'deal_alerts', label: 'Deal Alerts Scanner', action: () => runCron.mutate({ workers: ['deal_alerts'] }) },
    { key: 'opportunity_scoring', label: 'Opportunity Scoring', action: () => runCron.mutate({ workers: ['opportunity_scoring'] }) },
    { key: 'market_clusters', label: 'Market Heat Clusters', action: () => runCron.mutate({ workers: ['market_clusters'] }) },
  ];

  return (
    <Collapsible open={openAdmin} onOpenChange={setOpenAdmin}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between h-9 text-xs border-border/40">
          <span className="flex items-center gap-2"><Settings2 className="h-3.5 w-3.5" /> Admin Controls</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openAdmin ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4">
        {/* Sensitivity */}
        <Card className="bg-card/40 border-border/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Detection Sensitivity</p>
              <span className="text-xs text-primary font-mono">{sensitivity[0]}</span>
            </div>
            <Slider min={30} max={95} step={5} value={sensitivity} onValueChange={setSensitivity} className="py-1" />
            <p className="text-[10px] text-muted-foreground">Lower = more deals detected, higher = stricter filtering</p>
          </CardContent>
        </Card>

        {/* Auto Scan Toggle */}
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-xs font-medium text-foreground">Autonomous Scanning</p>
            <p className="text-[10px] text-muted-foreground">Bot scans every 5 minutes</p>
          </div>
          <Switch checked={autoScan} onCheckedChange={setAutoScan} />
        </div>

        {/* Manual Triggers */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground px-1">Manual Triggers</p>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => runDealScan.mutate()} disabled={runDealScan.isPending}>
              <Zap className="h-3 w-3 mr-1" /> Full Deal Scan
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => runAlertsScan.mutate()} disabled={runAlertsScan.isPending}>
              <Bell className="h-3 w-3 mr-1" /> Alert Scan
            </Button>
            {workers.map((w) => (
              <Button key={w.key} size="sm" variant="ghost" className="h-8 text-xs" onClick={w.action} disabled={runCron.isPending}>
                <RefreshCw className="h-3 w-3 mr-1" /> {w.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Worker Health */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground px-1">Worker Health</p>
          {workerData?.map((w: any) => (
            <div key={w.worker_name} className="flex items-center justify-between px-2 py-1.5 rounded bg-muted/20">
              <span className="text-[10px] text-foreground font-mono">{w.worker_name}</span>
              <div className="flex items-center gap-2">
                <Badge variant={w.last_status === 'success' ? 'default' : 'destructive'} className="text-[9px] h-4">{w.last_status}</Badge>
                <span className="text-[10px] text-muted-foreground">{w.last_rows_affected}r · {w.last_duration_ms}ms</span>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Price Drop Deals Section ────────────────────────────────────────
function PriceDropSection() {
  const { data: deals, isLoading } = usePriceDropDeals({ limit: 10 });
  const navigate = useNavigate();

  if (isLoading) return <div className="text-xs text-muted-foreground text-center py-6">Loading price drops…</div>;

  return (
    <div className="space-y-2">
      {deals?.map((d) => {
        const tierCfg = ALERT_TIER_CONFIG[d.alert_tier];
        return (
          <div key={d.property_id} className={`rounded-lg border p-3 cursor-pointer transition-all hover:scale-[1.005] ${tierCfg.bg}`}
            onClick={() => navigate(`/property/${d.property_id}`)}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm">{tierCfg.emoji}</span>
                  <Badge variant="outline" className={`text-[9px] ${tierCfg.color}`}>{tierCfg.label}</Badge>
                </div>
                <p className="text-xs font-medium text-foreground">{d.property_title}</p>
                <p className="text-[10px] text-muted-foreground">{d.city}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-rose-400">-{d.drop_percentage.toFixed(1)}%</p>
                <p className="text-[10px] text-muted-foreground">Score {d.opportunity_score}</p>
              </div>
            </div>
          </div>
        );
      })}
      {(!deals || deals.length === 0) && <p className="text-xs text-muted-foreground text-center py-4">No price drops detected</p>}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function DealHunterBotPage() {
  const navigate = useNavigate();
  const [priorityFilter, setPriorityFilter] = useState<AlertPriority | 'all'>('all');

  const { data: feed = [], isLoading: feedLoading } = useDealHunterFeed(50);
  const { data: heroDeals = [] } = useDealHunterHero();
  const { data: notifications = [] } = useDealHunterNotifications(50);
  const { data: unreadCount = 0 } = useDealHunterUnreadCount();
  const { stats } = usePriceDropStats();
  const { data: workerData = [] } = useWorkerStatus();
  const markRead = useMarkDealNotificationRead();
  const dismiss = useDismissDealNotification();

  const filteredFeed = useMemo(() => {
    if (priorityFilter === 'all') return feed;
    return feed.filter((d: any) => classifyPriority(d.deal_opportunity_signal_score) === priorityFilter);
  }, [feed, priorityFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border/30 bg-gradient-to-br from-background via-card/50 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--gold-primary)/0.06),transparent_60%)]" />
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Deal Hunter Bot</h1>
              <p className="text-sm text-muted-foreground">Autonomous investment opportunity detection engine</p>
            </div>
          </div>

          {/* Bot Status + KPIs */}
          <div className="mt-6 space-y-4">
            <BotStatusStrip workerData={workerData} />
            <KPIRow stats={stats} unreadCount={unreadCount} feedCount={feed.length} />
          </div>

          {/* Hero Hot Deals Strip */}
          {heroDeals.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1"><Flame className="h-3 w-3" /> Hot Deals Now</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {heroDeals.map((d: any) => (
                  <div key={d.id} className="shrink-0 rounded-lg bg-amber-400/5 border border-amber-400/20 px-3 py-2 cursor-pointer hover:bg-amber-400/10 transition-colors"
                    onClick={() => navigate(`/property/${d.property_id}`)}>
                    <p className="text-xs font-medium text-foreground">{d.property?.title?.slice(0, 30)}</p>
                    <p className="text-[10px] text-amber-400">Urgency {d.urgency_score} · {d.deal_classification?.replace('_', ' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Deal Feed */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="deals" className="w-full">
              <div className="flex items-center justify-between mb-3">
                <TabsList className="h-8">
                  <TabsTrigger value="deals" className="text-xs h-7">Deal Feed</TabsTrigger>
                  <TabsTrigger value="price-drops" className="text-xs h-7">Price Drops</TabsTrigger>
                  <TabsTrigger value="alerts" className="text-xs h-7">
                    Alerts {unreadCount > 0 && <span className="ml-1 text-[9px] bg-primary text-primary-foreground rounded-full px-1.5">{unreadCount}</span>}
                  </TabsTrigger>
                </TabsList>

                {/* Priority Filter */}
                <div className="flex items-center gap-1">
                  {(['all', 'elite', 'strong', 'monitor'] as const).map((p) => (
                    <Button key={p} size="sm" variant={priorityFilter === p ? 'default' : 'ghost'}
                      className="h-6 text-[10px] px-2" onClick={() => setPriorityFilter(p)}>
                      {p === 'all' ? 'All' : PRIORITY_CONFIG[p].label}
                    </Button>
                  ))}
                </div>
              </div>

              <TabsContent value="deals" className="space-y-3 mt-0">
                {feedLoading ? (
                  <div className="text-sm text-muted-foreground text-center py-12">Scanning marketplace…</div>
                ) : filteredFeed.length > 0 ? (
                  <AnimatePresence>
                    {filteredFeed.map((deal: any) => (
                      <DealCard key={deal.id} deal={deal}
                        onView={() => navigate(`/property/${deal.property_id}`)}
                        onWatchlist={() => {}}
                        onCompare={() => navigate(`/property-comparison?ids=${deal.property_id}`)}
                      />
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-12">
                    <Bot className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-sm text-muted-foreground">No deals matching filter — bot is hunting…</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="price-drops" className="mt-0">
                <PriceDropSection />
              </TabsContent>

              <TabsContent value="alerts" className="mt-0">
                <NotificationFeed
                  notifications={notifications}
                  markRead={(id) => markRead.mutate(id)}
                  dismiss={(id) => dismiss.mutate(id)}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {/* Admin Controls */}
            <AdminControls workerData={workerData} />

            {/* Detection Summary */}
            <Card className="bg-card/40 border-border/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-primary" /> Detection Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="space-y-2">
                  {[
                    { label: 'Price Drop Detection', pct: stats.total > 0 ? Math.min((stats.elite + stats.opportunity) / stats.total * 100, 100) : 0, color: 'bg-rose-400' },
                    { label: 'Opportunity Score Coverage', pct: feed.length > 0 ? Math.min(feed.filter((d: any) => d.deal_opportunity_signal_score >= 50).length / feed.length * 100, 100) : 0, color: 'bg-emerald-400' },
                    { label: 'Market Heat Activation', pct: 72, color: 'bg-amber-400' },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="text-foreground font-mono">{m.pct.toFixed(0)}%</span>
                      </div>
                      <Progress value={m.pct} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Cities */}
            <Card className="bg-card/40 border-border/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Top Deal Cities
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-1.5">
                  {stats.topCities.map((c, i) => (
                    <div key={c.city} className="flex items-center justify-between py-1">
                      <span className="text-xs text-foreground">{i + 1}. {c.city}</span>
                      <Badge variant="outline" className="text-[9px]">{c.count} deals</Badge>
                    </div>
                  ))}
                  {stats.topCities.length === 0 && <p className="text-[10px] text-muted-foreground">No data yet</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
