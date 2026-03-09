import React from 'react';
import { useAICommandCenter } from '@/hooks/useAICommandCenter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain, Building2, TrendingUp, Search, Activity, AlertTriangle,
  CheckCircle2, Clock, XCircle, BarChart3, Zap, RefreshCw,
  Server, Database, Timer, Eye, MapPin,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formatIDR = (v: number) => {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${v.toLocaleString()}`;
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const AICommandCenter = () => {
  const { data, isLoading, refetch } = useAICommandCenter();

  const handleRunSeoScan = async () => {
    toast.info('Starting SEO scan...');
    const { error } = await supabase.functions.invoke('core-engine', { body: { mode: 'seo_scan' } });
    if (error) toast.error('SEO scan failed');
    else { toast.success('SEO scan started'); refetch(); }
  };

  const handleRunAIOptimization = async () => {
    toast.info('Starting AI optimization...');
    const { error } = await supabase.functions.invoke('core-engine', { body: { mode: 'ai_optimization' } });
    if (error) toast.error('AI optimization failed');
    else { toast.success('AI optimization started'); refetch(); }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-4 p-2">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { overview, jobStatus, seo, roiForecasts, searchAnalytics, recentActions } = data;

  // ROI by location chart data
  const locationROI: Record<string, { total: number; count: number }> = {};
  roiForecasts.forEach((f: any) => {
    const loc = f.forecast_data?.city || 'Unknown';
    if (!locationROI[loc]) locationROI[loc] = { total: 0, count: 0 };
    locationROI[loc].total += f.expected_roi || 0;
    locationROI[loc].count += 1;
  });
  const topROILocations = Object.entries(locationROI)
    .map(([name, d]) => ({ name, roi: Math.round((d.total / d.count) * 10) / 10 }))
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 8);

  // Rental yield distribution
  const yieldBuckets = [
    { range: '0-3%', count: 0 },
    { range: '3-5%', count: 0 },
    { range: '5-7%', count: 0 },
    { range: '7-10%', count: 0 },
    { range: '10%+', count: 0 },
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
    { name: 'Running', value: jobStatus.running, color: 'hsl(var(--chart-1))' },
    { name: 'Pending', value: jobStatus.pending, color: 'hsl(var(--chart-2))' },
    { name: 'Completed', value: jobStatus.completed, color: 'hsl(var(--chart-3))' },
    { name: 'Failed', value: jobStatus.failed, color: 'hsl(var(--destructive))' },
  ].filter(d => d.value > 0);

  const systemHealthItems = [
    { name: 'Edge Functions', status: 'operational' as const, icon: Server },
    { name: 'Database Jobs', status: jobStatus.failed > 5 ? 'degraded' as const : 'operational' as const, icon: Database },
    { name: 'AI Scheduler', status: jobStatus.pending > 50 ? 'warning' as const : 'operational' as const, icon: Timer },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">AI Command Center</h2>
            <p className="text-xs text-muted-foreground">Monitor & manage all AI systems</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Properties', value: overview.totalProperties.toLocaleString(), icon: Building2, color: 'text-primary' },
          { label: 'Avg SEO Score', value: `${overview.avgSeoScore}`, icon: Search, color: 'text-chart-1' },
          { label: 'Avg Investment Score', value: `${overview.avgInvestmentScore}`, icon: TrendingUp, color: 'text-chart-2' },
          { label: 'Avg Property Value', value: formatIDR(overview.avgEstimatedValue), icon: BarChart3, color: 'text-chart-3' },
          { label: 'Avg Predicted ROI', value: `${overview.avgPredictedROI}%`, icon: Zap, color: 'text-chart-4' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                  <span className="text-[10px] text-muted-foreground truncate">{card.label}</span>
                </div>
                <p className="text-lg font-bold text-foreground">{card.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* System Status Bar */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">System Status:</span>
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-chart-1" />
              <span className="text-xs">{jobStatus.running} Running</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-chart-2" />
              <span className="text-xs">{jobStatus.pending} Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs">{jobStatus.failed} Failed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* SEO Automation Panel */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4 text-chart-1" /> SEO Automation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-[10px] text-muted-foreground">Weak Listings</p>
                <p className="text-lg font-bold text-destructive">{seo.weakListings}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-[10px] text-muted-foreground">Avg SEO Score</p>
                <p className="text-lg font-bold text-foreground">{seo.avgScore}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleRunSeoScan}>
                Run SEO Scan
              </Button>
              <Button size="sm" className="flex-1 text-xs" onClick={handleRunAIOptimization}>
                AI Optimize
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Job Monitor */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-chart-2" /> AI Job Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobPieData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={jobPieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" strokeWidth={0}>
                      {jobPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {jobPieData.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">No jobs recorded yet</p>
            )}
            {/* Running job progress bars */}
            {jobStatus.recentJobs.slice(0, 3).map((job: any) => (
              <div key={job.id} className="mt-2">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground truncate">{job.job_type}</span>
                  <span className="text-foreground font-medium">{job.progress || 0}%</span>
                </div>
                <Progress value={job.progress || 0} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Investment Analytics - Top ROI Locations */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-3" /> Top ROI Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topROILocations.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topROILocations} layout="vertical" margin={{ left: 60, right: 10, top: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={55} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'ROI']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="roi" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-10">No ROI forecast data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Rental Yield Distribution */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-chart-4" /> Rental Yield Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {yieldBuckets.some(b => b.count > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={yieldBuckets} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="count" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-10">No yield data yet</p>
            )}
          </CardContent>
        </Card>

        {/* AI Search Analytics */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> AI Search Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-[10px] text-muted-foreground">Total AI Searches</p>
              <p className="text-lg font-bold text-foreground">{searchAnalytics.totalSearches}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Top Queries</p>
              {searchAnalytics.topQueries.length > 0 ? (
                searchAnalytics.topQueries.slice(0, 6).map((q, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/20">
                    <span className="text-foreground truncate flex-1">{q.query}</span>
                    <Badge variant="secondary" className="text-[10px] ml-2">{q.count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No searches recorded</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Health Panel */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="h-4 w-4 text-chart-2" /> System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {systemHealthItems.map(item => (
              <div key={item.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{item.name}</span>
                </div>
                <Badge variant={item.status === 'operational' ? 'default' : 'destructive'} className="text-[10px]">
                  {item.status === 'operational' ? (
                    <><CheckCircle2 className="h-3 w-3 mr-1" /> Operational</>
                  ) : (
                    <><AlertTriangle className="h-3 w-3 mr-1" /> {item.status}</>
                  )}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent AI Actions Feed */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-chart-1" /> Recent AI Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            {recentActions.length > 0 ? (
              <div className="space-y-1.5">
                {recentActions.map((action: any) => (
                  <div key={action.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20 border border-border/20">
                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      action.level === 'error' ? 'bg-destructive' : action.level === 'warning' ? 'bg-chart-3' : 'bg-chart-1'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{action.message}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(action.created_at), 'MMM d, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-10">No recent AI actions</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICommandCenter;
