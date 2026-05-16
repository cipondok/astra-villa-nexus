import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFirst500Investors } from '@/hooks/useFirst500Investors';
import {
  Users, Target, TrendingUp, Zap, Megaphone, ArrowDown,
  Gift, BarChart3, Clock, CheckCircle2, Circle, Loader2,
  DollarSign, Eye, MessageSquare, Share2, Shield,
} from 'lucide-react';

const fmt = (n: number) =>
  n >= 1_000_000 ? `Rp ${(n / 1_000_000).toFixed(0)}M` :
  n >= 1_000 ? `Rp ${(n / 1_000).toFixed(0)}K` :
  `Rp ${n.toLocaleString()}`;

const anim = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const statusIcon = (s: string) =>
  s === 'completed' ? <CheckCircle2 className="w-4 h-4 text-primary" /> :
  s === 'in_progress' ? <Loader2 className="w-4 h-4 text-accent-foreground animate-spin" /> :
  <Circle className="w-4 h-4 text-muted-foreground/40" />;

const phaseIcon = (p: string) => {
  const map: Record<string, React.ReactNode> = {
    Awareness: <Eye className="w-3.5 h-3.5" />,
    Activation: <Zap className="w-3.5 h-3.5" />,
    Conversion: <Target className="w-3.5 h-3.5" />,
    Retention: <BarChart3 className="w-3.5 h-3.5" />,
    Referral: <Share2 className="w-3.5 h-3.5" />,
  };
  return map[p] || <MessageSquare className="w-3.5 h-3.5" />;
};

export default function First500InvestorsPage() {
  const { data, isLoading } = useFirst500Investors();

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading investor intelligence…</div>
      </div>
    );
  }

  const { funnel, channels, activationKPIs, campaigns, milestones, retentionMetrics } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              First 500 Active Investors
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Acquisition · Activation · Conversion · Retention</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{data.totalInvestors}<span className="text-sm text-muted-foreground font-normal"> / 500</span></p>
              <p className="text-[10px] text-muted-foreground">{data.activeInvestors} active</p>
            </div>
            <div className="w-28">
              <Progress value={data.progressPct} className="h-2.5" />
              <p className="text-[10px] text-muted-foreground text-center mt-0.5">{data.progressPct}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Milestone Roadmap */}
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Scaling Roadmap to 500
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2">
                {milestones.map((m, i) => (
                  <motion.div key={m.milestone} variants={anim} className="flex-1">
                    <div className={`rounded-lg border p-3 h-full ${m.status === 'in_progress' ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {statusIcon(m.status)}
                        <span className="text-lg font-bold text-foreground">{m.milestone}</span>
                      </div>
                      <p className="text-xs font-medium text-foreground">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{m.unlocks}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Week {m.targetWeek}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="funnel" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="funnel" className="text-xs">Acquisition Funnel</TabsTrigger>
            <TabsTrigger value="activation" className="text-xs">Activation KPIs</TabsTrigger>
            <TabsTrigger value="campaigns" className="text-xs">Campaigns</TabsTrigger>
            <TabsTrigger value="retention" className="text-xs">Retention</TabsTrigger>
          </TabsList>

          {/* ── Funnel ── */}
          <TabsContent value="funnel" className="space-y-4">
            {/* Funnel visualization */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Investor Acquisition Funnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {funnel.map((s, i) => {
                  const widthPct = Math.max(20, Math.round((s.count / funnel[0].count) * 100));
                  return (
                    <motion.div key={s.stage} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-20 text-right shrink-0">{s.stage}</span>
                        <div className="flex-1 relative">
                          <div className="h-9 rounded bg-muted/30 w-full" />
                          <div
                            className="h-9 rounded bg-primary/20 border border-primary/30 absolute top-0 left-0 flex items-center px-3 transition-all"
                            style={{ width: `${widthPct}%` }}
                          >
                            <span className="text-xs font-bold text-foreground">{s.count.toLocaleString()}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground w-16 shrink-0">
                          {i > 0 && <><ArrowDown className="w-3 h-3 inline mr-0.5" />{s.conversionFromPrev}%</>}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Channel Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {['Channel', 'Leads', 'Activated', 'Conv. Rate', 'CAC'].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {channels.map((ch) => (
                        <tr key={ch.channel} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-foreground">{ch.channel}</td>
                          <td className="px-4 py-2.5 text-foreground">{ch.leads.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-foreground">{ch.activated.toLocaleString()}</td>
                          <td className="px-4 py-2.5">
                            <span className={ch.conversionRate >= 25 ? 'text-primary' : ch.conversionRate >= 15 ? 'text-yellow-400' : 'text-destructive'}>
                              {ch.conversionRate}%
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-foreground">{fmt(ch.cac)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Activation KPIs ── */}
          <TabsContent value="activation" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activationKPIs.map((kpi) => {
                const pct = kpi.unit === 'days'
                  ? Math.min(100, Math.round((kpi.target / kpi.current) * 100))
                  : Math.min(100, Math.round((kpi.current / kpi.target) * 100));
                const good = pct >= 70;
                return (
                  <Card key={kpi.label} className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{kpi.label}</span>
                        <Badge variant={good ? 'default' : 'outline'} className="text-[10px]">
                          {kpi.current}{kpi.unit === '%' || kpi.unit === 'avg' ? kpi.unit : ` ${kpi.unit}`}
                        </Badge>
                      </div>
                      <Progress value={pct} className="h-2" />
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">Current</span>
                        <span className="text-[10px] text-muted-foreground">Target: {kpi.target}{kpi.unit === '%' || kpi.unit === 'avg' ? kpi.unit : ` ${kpi.unit}`}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Campaigns ── */}
          <TabsContent value="campaigns" className="space-y-3">
            {campaigns.map((c, i) => (
              <motion.div key={c.phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {phaseIcon(c.phase)}
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[10px] mr-2">{c.phase}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{c.channel}</Badge>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{c.headline}</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.hook}</p>
                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      <Megaphone className="w-3 h-3" />
                      CTA: {c.cta}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ── Retention ── */}
          <TabsContent value="retention" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Weekly Active Rate', value: `${retentionMetrics.weeklyActiveRate}%`, icon: TrendingUp },
                { label: 'Avg Deals Watched', value: retentionMetrics.avgDealsWatched, icon: Eye },
                { label: 'Referral Rate', value: `${retentionMetrics.referralRate}%`, icon: Gift },
                { label: 'Avg Portfolio Size', value: `${retentionMetrics.avgPortfolioSize} props`, icon: BarChart3 },
                { label: 'Churn Risk', value: `${retentionMetrics.churnRisk}%`, icon: Clock },
              ].map((m) => (
                <Card key={m.label} className="border-border bg-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <m.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Referral Loop */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" />
                  Referral & Retention Loop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { trigger: 'First deal closed', reward: '30 days Pro intelligence free', status: 'active' },
                    { trigger: 'Referral signs up + activates', reward: 'Both get 30 days Pro access', status: 'active' },
                    { trigger: '3 deals completed', reward: 'Priority access to off-market listings', status: 'planned' },
                    { trigger: 'Portfolio value > Rp 10B', reward: 'Dedicated relationship manager', status: 'planned' },
                    { trigger: 'Quarterly portfolio report viewed', reward: 'Early access to new intelligence features', status: 'active' },
                  ].map((r, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-border last:border-0">
                      <span className="text-xs font-medium text-foreground min-w-[200px]">{r.trigger}</span>
                      <span className="text-xs text-muted-foreground flex-1">{r.reward}</span>
                      <Badge variant={r.status === 'active' ? 'default' : 'outline'} className="text-[10px] w-fit">{r.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
