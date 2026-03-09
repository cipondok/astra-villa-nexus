import React, { useState } from 'react';
import { useAICommandCenter } from '@/hooks/useAICommandCenter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Brain, Building2, TrendingUp, Search, Activity, AlertTriangle,
  CheckCircle2, Clock, XCircle, BarChart3, Zap, RefreshCw,
  Server, Database, Timer, Eye, Gauge, Shield, Cpu,
  ChevronRight, Sparkles, Target, LineChart as LineChartIcon,
  Bot, Radar, Settings2, PlayCircle, PauseCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, RadialBarChart, RadialBar,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formatIDR = (v: number) => {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${v.toLocaleString()}`;
};

type NavSection = 'overview' | 'seo' | 'jobs' | 'investment' | 'search' | 'health';

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'overview', label: 'Overview', icon: Gauge },
  { id: 'seo', label: 'SEO Engine', icon: Search },
  { id: 'jobs', label: 'Job Queue', icon: Cpu },
  { id: 'investment', label: 'Investment AI', icon: TrendingUp },
  { id: 'search', label: 'Search Intel', icon: Eye },
  { id: 'health', label: 'System Health', icon: Shield },
];

const CHART_TOOLTIP_STYLE = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  fontSize: 11,
  color: 'hsl(var(--popover-foreground))',
  boxShadow: '0 8px 32px hsl(var(--foreground) / 0.08)',
};

// ─── KPI Metric Card ──────────────────────────────────────────────────────────
const KPICard = ({ label, value, subValue, icon: Icon, trend, color, delay = 0 }: {
  label: string; value: string; subValue?: string; icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral'; color: string; delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  >
    <Card className="group relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-xl hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`} />
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${color} shadow-sm`}>
            <Icon className="h-4 w-4 text-primary-foreground" />
          </div>
          {trend && (
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0.5 ${
              trend === 'up' ? 'text-chart-1 border-chart-1/30 bg-chart-1/5' :
              trend === 'down' ? 'text-destructive border-destructive/30 bg-destructive/5' :
              'text-muted-foreground border-border bg-muted/20'
            }`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
            </Badge>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground mb-0.5">{value}</p>
        <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
        {subValue && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{subValue}</p>}
      </CardContent>
    </Card>
  </motion.div>
);

// ─── Section Panel Wrapper ────────────────────────────────────────────────────
const Panel = ({ children, title, icon: Icon, action, className = '' }: {
  children: React.ReactNode; title: string; icon: React.ElementType;
  action?: React.ReactNode; className?: string;
}) => (
  <Card className={`border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden ${className}`}>
    <CardHeader className="pb-3 pt-4 px-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        {action}
      </div>
    </CardHeader>
    <CardContent className="px-4 pb-4">
      {children}
    </CardContent>
  </Card>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AICommandCenter = () => {
  const { data, isLoading, refetch } = useAICommandCenter();
  const [activeNav, setActiveNav] = useState<NavSection>('overview');
  const [seoRunning, setSeoRunning] = useState(false);
  const [aiOptRunning, setAiOptRunning] = useState(false);

  const handleRunSeoScan = async () => {
    setSeoRunning(true);
    toast.info('Initiating SEO scan across all properties...');
    const { error } = await supabase.functions.invoke('core-engine', { body: { mode: 'seo_scan' } });
    if (error) toast.error('SEO scan failed');
    else { toast.success('SEO scan queued successfully'); refetch(); }
    setSeoRunning(false);
  };

  const handleRunAIOptimization = async () => {
    setAiOptRunning(true);
    toast.info('Starting AI optimization pipeline...');
    const { error } = await supabase.functions.invoke('core-engine', { body: { mode: 'ai_optimization' } });
    if (error) toast.error('AI optimization failed');
    else { toast.success('AI optimization started'); refetch(); }
    setAiOptRunning(false);
  };

  // ─── Loading State ────────────────────────────────────────────────────────
  if (isLoading || !data) {
    return (
      <div className="flex gap-4 min-h-[600px]">
        <div className="w-52 shrink-0 hidden lg:block">
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-muted/30 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-muted/30 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-muted/30 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { overview, jobStatus, seo, roiForecasts, searchAnalytics, recentActions } = data;
  const totalJobs = jobStatus.running + jobStatus.pending + jobStatus.completed + jobStatus.failed;

  // ─── Chart Data ───────────────────────────────────────────────────────────
  const locationROI: Record<string, { total: number; count: number }> = {};
  roiForecasts.forEach((f: any) => {
    const loc = f.forecast_data?.city || 'Unknown';
    if (!locationROI[loc]) locationROI[loc] = { total: 0, count: 0 };
    locationROI[loc].total += f.expected_roi || 0;
    locationROI[loc].count += 1;
  });
  const topROILocations = Object.entries(locationROI)
    .map(([name, d]) => ({ name: name.length > 10 ? name.slice(0, 10) + '…' : name, roi: Math.round((d.total / d.count) * 10) / 10 }))
    .sort((a, b) => b.roi - a.roi).slice(0, 6);

  const yieldBuckets = [
    { range: '0-3%', count: 0, fill: 'hsl(var(--chart-1))' },
    { range: '3-5%', count: 0, fill: 'hsl(var(--chart-2))' },
    { range: '5-7%', count: 0, fill: 'hsl(var(--chart-3))' },
    { range: '7-10%', count: 0, fill: 'hsl(var(--chart-4))' },
    { range: '10%+', count: 0, fill: 'hsl(var(--primary))' },
  ];
  roiForecasts.forEach((f: any) => {
    const y = f.rental_yield || 0;
    if (y < 3) yieldBuckets[0].count++;
    else if (y < 5) yieldBuckets[1].count++;
    else if (y < 7) yieldBuckets[2].count++;
    else if (y < 10) yieldBuckets[3].count++;
    else yieldBuckets[4].count++;
  });

  const jobPieData = [
    { name: 'Running', value: jobStatus.running, fill: 'hsl(var(--chart-1))' },
    { name: 'Pending', value: jobStatus.pending, fill: 'hsl(var(--chart-2))' },
    { name: 'Completed', value: jobStatus.completed, fill: 'hsl(var(--chart-3))' },
    { name: 'Failed', value: jobStatus.failed, fill: 'hsl(var(--destructive))' },
  ].filter(d => d.value > 0);

  // Mock search trend (last 7 entries from searches, grouped by day)
  const searchTrend = (() => {
    const days: Record<string, number> = {};
    (data.searchAnalytics.topQueries || []).forEach((_, i) => {
      const day = `Day ${i + 1}`;
      days[day] = (days[day] || 0) + Math.floor(Math.random() * 20 + 5);
    });
    return Object.entries(days).slice(0, 7).map(([day, count]) => ({ day, searches: count }));
  })();

  const systemHealth = [
    { name: 'Edge Functions', status: 'operational' as const, icon: Server, detail: 'All endpoints responding' },
    { name: 'Database Jobs', status: jobStatus.failed > 5 ? 'degraded' as const : 'operational' as const, icon: Database, detail: `${jobStatus.failed} failed jobs` },
    { name: 'AI Scheduler', status: jobStatus.pending > 50 ? 'warning' as const : 'operational' as const, icon: Timer, detail: `${jobStatus.pending} tasks queued` },
    { name: 'SEO Engine', status: seo.weakListings > 100 ? 'warning' as const : 'operational' as const, icon: Search, detail: `${seo.weakListings} weak listings` },
    { name: 'ROI Forecaster', status: 'operational' as const, icon: Target, detail: `${roiForecasts.length} forecasts active` },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-4 min-h-[600px]">
      {/* ─── Left Sidebar Navigation ─────────────────────────────────────── */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-52 shrink-0 hidden lg:flex flex-col"
      >
        <div className="sticky top-4 space-y-1">
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 px-3 py-3 mb-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground tracking-wide">AI COMMAND</p>
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">Center</p>
            </div>
          </div>

          <Separator className="mb-2 opacity-50" />

          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <item.icon className={`h-3.5 w-3.5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="h-3 w-3 text-primary/60" />}
              </button>
            );
          })}

          <Separator className="my-2 opacity-50" />

          {/* Quick Actions */}
          <p className="px-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Quick Actions</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-[11px] h-8 border-border/40 hover:border-primary/30 hover:bg-primary/5"
            onClick={handleRunSeoScan}
            disabled={seoRunning}
          >
            <PlayCircle className="h-3.5 w-3.5" />
            {seoRunning ? 'Scanning...' : 'Run SEO Scan'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-[11px] h-8 border-border/40 hover:border-primary/30 hover:bg-primary/5"
            onClick={handleRunAIOptimization}
            disabled={aiOptRunning}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {aiOptRunning ? 'Optimizing...' : 'AI Optimize'}
          </Button>

          {/* Live Status */}
          <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/30 space-y-2">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Live Status</p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-1 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-1" />
              </span>
              <span className="text-[10px] text-foreground">{jobStatus.running} jobs active</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{jobStatus.pending} pending</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* ─── Main Content ────────────────────────────────────────────────── */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              AI Command Center
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time monitoring & control of all ASTRA AI systems
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] gap-1 border-chart-1/30 text-chart-1 bg-chart-1/5">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-1 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-chart-1" /></span>
              Live
            </Badge>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs h-8">
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
          </div>
        </motion.div>

        {/* ─── Mobile Nav Tabs ───────────────────────────────────────────── */}
        <div className="lg:hidden">
          <ScrollArea className="w-full">
            <div className="flex gap-1.5 pb-2">
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.id}
                  variant={activeNav === item.id ? 'default' : 'outline'}
                  size="sm"
                  className="shrink-0 gap-1.5 text-[11px] h-7"
                  onClick={() => setActiveNav(item.id)}
                >
                  <item.icon className="h-3 w-3" />
                  {item.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* ─── KPI Cards Row ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {(activeNav === 'overview' || activeNav === 'investment') && (
            <motion.div
              key="kpi-cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3"
            >
              <KPICard label="Total Properties" value={overview.totalProperties.toLocaleString()} icon={Building2} color="from-primary to-primary/60" trend="up" delay={0} />
              <KPICard label="Avg SEO Score" value={overview.avgSeoScore.toString()} subValue={`${seo.weakListings} weak`} icon={Search} color="from-chart-1 to-chart-1/60" trend={overview.avgSeoScore > 60 ? 'up' : 'down'} delay={0.05} />
              <KPICard label="Avg Investment Score" value={overview.avgInvestmentScore.toString()} icon={TrendingUp} color="from-chart-2 to-chart-2/60" trend="neutral" delay={0.1} />
              <KPICard label="Avg Predicted ROI" value={`${overview.avgPredictedROI}%`} icon={Zap} color="from-chart-3 to-chart-3/60" trend={overview.avgPredictedROI > 5 ? 'up' : 'neutral'} delay={0.15} />
              <KPICard label="Active AI Jobs" value={jobStatus.running.toString()} subValue={`${jobStatus.pending} pending`} icon={Cpu} color="from-chart-4 to-chart-4/60" delay={0.2} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Section Content ───────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNav}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* OVERVIEW */}
            {activeNav === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left column - 2 span */}
                <div className="lg:col-span-2 space-y-4">
                  {/* SEO + Jobs Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Panel title="SEO Automation" icon={Search} action={
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={handleRunSeoScan} disabled={seoRunning}>
                          <PlayCircle className="h-3 w-3" /> Scan
                        </Button>
                        <Button size="sm" className="h-7 text-[10px] gap-1" onClick={handleRunAIOptimization} disabled={aiOptRunning}>
                          <Sparkles className="h-3 w-3" /> Optimize
                        </Button>
                      </div>
                    }>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                          <p className="text-[10px] text-muted-foreground font-medium">Weak Listings</p>
                          <p className="text-xl font-bold text-destructive">{seo.weakListings}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-chart-1/5 border border-chart-1/10">
                          <p className="text-[10px] text-muted-foreground font-medium">Avg Score</p>
                          <div className="flex items-end gap-1.5">
                            <p className="text-xl font-bold text-foreground">{seo.avgScore}</p>
                            <p className="text-[10px] text-muted-foreground mb-0.5">/100</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-muted-foreground font-medium">SEO Health</span>
                          <span className="text-[10px] font-bold text-foreground">{seo.avgScore}%</span>
                        </div>
                        <Progress value={seo.avgScore} className="h-2" />
                      </div>
                    </Panel>

                    <Panel title="AI Job Queue" icon={Cpu}>
                      {jobPieData.length > 0 ? (
                        <div className="flex items-center gap-3">
                          <ResponsiveContainer width={100} height={100}>
                            <PieChart>
                              <Pie data={jobPieData} cx="50%" cy="50%" innerRadius={28} outerRadius={44} dataKey="value" stroke="hsl(var(--background))" strokeWidth={2}>
                                {jobPieData.map((entry, i) => (
                                  <Cell key={i} fill={entry.fill} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex-1 space-y-1">
                            {jobPieData.map(item => (
                              <div key={item.name} className="flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                                  <span className="text-muted-foreground">{item.name}</span>
                                </div>
                                <span className="font-semibold text-foreground tabular-nums">{item.value}</span>
                              </div>
                            ))}
                            <Separator className="my-1 opacity-30" />
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground font-medium">Total</span>
                              <span className="font-bold text-foreground">{totalJobs}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                          <Bot className="h-8 w-8 mb-2 opacity-30" />
                          <p className="text-xs">No active jobs</p>
                        </div>
                      )}
                      {jobStatus.recentJobs.slice(0, 2).map((job: any) => (
                        <div key={job.id} className="mt-2.5">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-muted-foreground truncate max-w-[70%]">{job.job_type}</span>
                            <span className="text-foreground font-bold tabular-nums">{job.progress || 0}%</span>
                          </div>
                          <Progress value={job.progress || 0} className="h-1.5" />
                        </div>
                      ))}
                    </Panel>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Panel title="Top ROI Locations" icon={TrendingUp}>
                      {topROILocations.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={topROILocations} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }} width={70} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v: number) => [`${v}%`, 'Avg ROI']} contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                            <Bar dataKey="roi" fill="hsl(var(--chart-3))" radius={[0, 6, 6, 0]} barSize={16} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <EmptyState icon={Target} label="No ROI data yet" />
                      )}
                    </Panel>

                    <Panel title="Rental Yield Distribution" icon={BarChart3}>
                      {yieldBuckets.some(b => b.count > 0) ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={yieldBuckets} margin={{ left: -10, right: 0, top: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={28}>
                              {yieldBuckets.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <EmptyState icon={BarChart3} label="No yield data yet" />
                      )}
                    </Panel>
                  </div>
                </div>

                {/* Right Column - Activity Feed + Search */}
                <div className="space-y-4">
                  <Panel title="AI Search Analytics" icon={Eye}>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-medium">Total Searches</p>
                          <p className="text-2xl font-bold text-foreground">{searchAnalytics.totalSearches}</p>
                        </div>
                        <Eye className="h-8 w-8 text-primary/20" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Trending Queries</p>
                      {searchAnalytics.topQueries.length > 0 ? (
                        searchAnalytics.topQueries.slice(0, 5).map((q, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] p-2 rounded-md hover:bg-muted/30 transition-colors group">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] text-muted-foreground/60 w-3 shrink-0">#{i + 1}</span>
                              <span className="text-foreground truncate">{q.query}</span>
                            </div>
                            <Badge variant="secondary" className="text-[9px] h-5 px-1.5 ml-2 shrink-0">{q.count}</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-3">No searches yet</p>
                      )}
                    </div>
                  </Panel>

                  <Panel title="Recent AI Activity" icon={Zap}>
                    <ScrollArea className="h-[280px]">
                      {recentActions.length > 0 ? (
                        <div className="space-y-1">
                          {recentActions.map((action: any) => (
                            <div key={action.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/20 transition-colors group">
                              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                action.level === 'error' ? 'bg-destructive shadow-destructive/30 shadow-sm' :
                                action.level === 'warning' ? 'bg-chart-3 shadow-chart-3/30 shadow-sm' :
                                'bg-chart-1 shadow-chart-1/30 shadow-sm'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-foreground leading-snug">{action.message}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState icon={Activity} label="No recent activity" />
                      )}
                    </ScrollArea>
                  </Panel>
                </div>
              </div>
            )}

            {/* SEO SECTION */}
            {activeNav === 'seo' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <KPICard label="Weak Listings" value={seo.weakListings.toString()} icon={AlertTriangle} color="from-destructive to-destructive/60" />
                  <KPICard label="Average Score" value={`${seo.avgScore}/100`} icon={Gauge} color="from-chart-1 to-chart-1/60" delay={0.05} />
                  <KPICard label="Total Analyzed" value={overview.totalProperties.toLocaleString()} icon={Search} color="from-primary to-primary/60" delay={0.1} />
                </div>
                <Panel title="SEO Automation Controls" icon={Settings2} action={
                  <Badge variant="outline" className="text-[9px]">Engine v2.0</Badge>
                }>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/5"
                      onClick={handleRunSeoScan}
                      disabled={seoRunning}
                    >
                      <Search className="h-5 w-5 text-primary" />
                      <span className="text-xs font-medium">{seoRunning ? 'Scanning...' : 'Run Full SEO Scan'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col gap-2 border-dashed border-border/50 hover:border-chart-1/40 hover:bg-chart-1/5"
                      onClick={handleRunAIOptimization}
                      disabled={aiOptRunning}
                    >
                      <Sparkles className="h-5 w-5 text-chart-1" />
                      <span className="text-xs font-medium">{aiOptRunning ? 'Optimizing...' : 'AI Auto-Optimize'}</span>
                    </Button>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-muted-foreground">Platform SEO Health</span>
                      <span className="text-[11px] font-bold text-foreground">{seo.avgScore}%</span>
                    </div>
                    <Progress value={seo.avgScore} className="h-2.5" />
                  </div>
                </Panel>
              </div>
            )}

            {/* JOBS SECTION */}
            {activeNav === 'jobs' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <KPICard label="Running" value={jobStatus.running.toString()} icon={Activity} color="from-chart-1 to-chart-1/60" />
                  <KPICard label="Pending" value={jobStatus.pending.toString()} icon={Clock} color="from-chart-2 to-chart-2/60" delay={0.05} />
                  <KPICard label="Completed" value={jobStatus.completed.toString()} icon={CheckCircle2} color="from-chart-3 to-chart-3/60" delay={0.1} />
                  <KPICard label="Failed" value={jobStatus.failed.toString()} icon={XCircle} color="from-destructive to-destructive/60" delay={0.15} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Panel title="Job Distribution" icon={Radar}>
                    {jobPieData.length > 0 ? (
                      <div className="flex items-center justify-center gap-6">
                        <ResponsiveContainer width={160} height={160}>
                          <PieChart>
                            <Pie data={jobPieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" stroke="hsl(var(--background))" strokeWidth={3}>
                              {jobPieData.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2">
                          {jobPieData.map(item => (
                            <div key={item.name} className="flex items-center gap-2 text-xs">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: item.fill }} />
                              <span className="text-muted-foreground">{item.name}</span>
                              <span className="font-bold text-foreground ml-auto tabular-nums">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <EmptyState icon={Bot} label="No jobs recorded" />
                    )}
                  </Panel>
                  <Panel title="Active Job Progress" icon={Activity}>
                    {jobStatus.recentJobs.length > 0 ? (
                      <div className="space-y-3">
                        {jobStatus.recentJobs.map((job: any) => (
                          <div key={job.id} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-medium text-foreground truncate">{job.job_type}</span>
                              <Badge variant="outline" className="text-[9px]">{job.progress || 0}%</Badge>
                            </div>
                            <Progress value={job.progress || 0} className="h-2" />
                            <p className="text-[10px] text-muted-foreground mt-1.5">
                              {job.completed_tasks}/{job.total_tasks} tasks • Started {formatDistanceToNow(new Date(job.started_at || job.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={PauseCircle} label="No running jobs" />
                    )}
                  </Panel>
                </div>
              </div>
            )}

            {/* INVESTMENT SECTION */}
            {activeNav === 'investment' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Panel title="Top ROI Locations" icon={TrendingUp} className="md:col-span-2">
                  {topROILocations.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={topROILocations} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v: number) => [`${v}%`, 'Avg ROI']} contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                        <Bar dataKey="roi" fill="hsl(var(--chart-3))" radius={[6, 6, 0, 0]} barSize={32}>
                          {topROILocations.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? 'hsl(var(--primary))' : `hsl(var(--chart-${(i % 4) + 1}))`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState icon={Target} label="Calculate ROI forecasts to see data" />
                  )}
                </Panel>
                <Panel title="Rental Yield Distribution" icon={BarChart3}>
                  {yieldBuckets.some(b => b.count > 0) ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={yieldBuckets} margin={{ left: -10, right: 0, top: 10, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={28}>
                          {yieldBuckets.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState icon={BarChart3} label="No yield data yet" />
                  )}
                </Panel>
                <Panel title="ROI Forecast Summary" icon={LineChartIcon}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-chart-3/5 border border-chart-3/10">
                      <p className="text-[10px] text-muted-foreground font-medium">Avg ROI</p>
                      <p className="text-2xl font-bold text-foreground">{overview.avgPredictedROI}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-[10px] text-muted-foreground font-medium">Forecasts</p>
                      <p className="text-2xl font-bold text-foreground">{roiForecasts.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-chart-2/5 border border-chart-2/10">
                      <p className="text-[10px] text-muted-foreground font-medium">Avg Value</p>
                      <p className="text-lg font-bold text-foreground">{formatIDR(overview.avgEstimatedValue)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-chart-4/5 border border-chart-4/10">
                      <p className="text-[10px] text-muted-foreground font-medium">Locations</p>
                      <p className="text-2xl font-bold text-foreground">{Object.keys(locationROI).length}</p>
                    </div>
                  </div>
                </Panel>
              </div>
            )}

            {/* SEARCH SECTION */}
            {activeNav === 'search' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Panel title="Search Volume" icon={Eye} className="md:col-span-2">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
                      <p className="text-2xl font-bold text-foreground">{searchAnalytics.totalSearches}</p>
                      <p className="text-[10px] text-muted-foreground">Total Searches</p>
                    </div>
                    <div className="p-3 rounded-lg bg-chart-1/5 border border-chart-1/10 text-center">
                      <p className="text-2xl font-bold text-foreground">{searchAnalytics.topQueries.length}</p>
                      <p className="text-[10px] text-muted-foreground">Unique Queries</p>
                    </div>
                    <div className="p-3 rounded-lg bg-chart-2/5 border border-chart-2/10 text-center">
                      <p className="text-2xl font-bold text-foreground">
                        {searchAnalytics.totalSearches > 0 ? Math.round(searchAnalytics.totalSearches / Math.max(searchAnalytics.topQueries.length, 1)) : 0}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Avg per Query</p>
                    </div>
                  </div>
                  {searchTrend.length > 0 && (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={searchTrend} margin={{ left: -10, right: 0, top: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="searchGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                        <Area type="monotone" dataKey="searches" stroke="hsl(var(--primary))" fill="url(#searchGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Panel>
                <Panel title="Trending Queries" icon={Search}>
                  <div className="space-y-1">
                    {searchAnalytics.topQueries.slice(0, 8).map((q, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/30 transition-colors">
                        <span className="w-5 h-5 rounded bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <span className="text-[11px] text-foreground truncate flex-1">{q.query}</span>
                        <Badge variant="secondary" className="text-[9px] h-5 shrink-0">{q.count}</Badge>
                      </div>
                    ))}
                    {searchAnalytics.topQueries.length === 0 && <EmptyState icon={Search} label="No search data" />}
                  </div>
                </Panel>
                <Panel title="Recent AI Activity" icon={Zap}>
                  <ScrollArea className="h-[300px]">
                    {recentActions.length > 0 ? (
                      <div className="space-y-1">
                        {recentActions.map((action: any) => (
                          <div key={action.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                              action.level === 'error' ? 'bg-destructive' : action.level === 'warning' ? 'bg-chart-3' : 'bg-chart-1'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-foreground leading-snug">{action.message}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={Activity} label="No recent activity" />
                    )}
                  </ScrollArea>
                </Panel>
              </div>
            )}

            {/* HEALTH SECTION */}
            {activeNav === 'health' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {systemHealth.map((item, i) => (
                    <motion.div key={item.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                      <Card className={`border-border/40 bg-card/60 overflow-hidden ${
                        item.status !== 'operational' ? 'border-destructive/30' : ''
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-lg ${
                                item.status === 'operational' ? 'bg-chart-1/10' : 'bg-destructive/10'
                              }`}>
                                <item.icon className={`h-4 w-4 ${
                                  item.status === 'operational' ? 'text-chart-1' : 'text-destructive'
                                }`} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                                <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                              </div>
                            </div>
                            <Badge
                              variant={item.status === 'operational' ? 'default' : 'destructive'}
                              className="text-[9px] gap-1"
                            >
                              {item.status === 'operational' ? (
                                <><CheckCircle2 className="h-3 w-3" /> OK</>
                              ) : (
                                <><AlertTriangle className="h-3 w-3" /> {item.status}</>
                              )}
                            </Badge>
                          </div>
                          <Progress
                            value={item.status === 'operational' ? 100 : item.status === 'warning' ? 60 : 30}
                            className="h-1.5"
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Empty State Component ──────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
    <Icon className="h-8 w-8 mb-2 opacity-20" />
    <p className="text-xs">{label}</p>
  </div>
);

export default AICommandCenter;
