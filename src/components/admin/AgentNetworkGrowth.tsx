import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, UserCheck, UserX, TrendingUp, ArrowUpRight, ArrowDownRight,
  Star, Award, MapPin, Phone, ClipboardCheck, Shield, Zap, BarChart3,
  Target, Activity, Eye, Handshake, Home, DollarSign, ChevronRight, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

// ── Mock Data ──

const GROWTH_TREND = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  total: 42 + i * 18 + Math.round(Math.random() * 12),
  active: 28 + i * 14 + Math.round(Math.random() * 8),
  new: 8 + Math.round(Math.random() * 12),
}));

const AGENTS = [
  { id: '1', name: 'Sarah Kusuma', avatar: null, listings: 48, inquiries: 312, viewings: 86, deals: 14, commission: 285000000, score: 96, trend: 'up' as const },
  { id: '2', name: 'Rizky Pratama', avatar: null, listings: 42, inquiries: 278, viewings: 72, deals: 12, commission: 248000000, score: 93, trend: 'up' as const },
  { id: '3', name: 'Ayu Dewi', avatar: null, listings: 38, inquiries: 245, viewings: 68, deals: 11, commission: 218000000, score: 91, trend: 'stable' as const },
  { id: '4', name: 'Budi Santoso', avatar: null, listings: 35, inquiries: 198, viewings: 54, deals: 9, commission: 185000000, score: 87, trend: 'up' as const },
  { id: '5', name: 'Maya Indah', avatar: null, listings: 32, inquiries: 186, viewings: 48, deals: 8, commission: 162000000, score: 84, trend: 'down' as const },
  { id: '6', name: 'Doni Wijaya', avatar: null, listings: 28, inquiries: 165, viewings: 42, deals: 7, commission: 142000000, score: 80, trend: 'stable' as const },
  { id: '7', name: 'Lina Putri', avatar: null, listings: 24, inquiries: 142, viewings: 38, deals: 6, commission: 118000000, score: 76, trend: 'up' as const },
  { id: '8', name: 'Ahmad Fauzi', avatar: null, listings: 22, inquiries: 128, viewings: 32, deals: 5, commission: 98000000, score: 72, trend: 'stable' as const },
  { id: '9', name: 'Siti Nurhaliza', avatar: null, listings: 18, inquiries: 95, viewings: 24, deals: 3, commission: 62000000, score: 65, trend: 'down' as const },
  { id: '10', name: 'Hendri Saputra', avatar: null, listings: 12, inquiries: 68, viewings: 18, deals: 2, commission: 38000000, score: 58, trend: 'down' as const },
];

const FUNNEL = [
  { stage: 'Registered', count: 284, pct: 100 },
  { stage: 'Verified', count: 218, pct: 76.8 },
  { stage: 'First Listing', count: 164, pct: 57.7 },
  { stage: 'First Viewing', count: 112, pct: 39.4 },
  { stage: 'First Deal', count: 68, pct: 23.9 },
];

const DISTRICTS = [
  { name: 'Seminyak', agents: 24, demand: 92, status: 'strong' },
  { name: 'Canggu', agents: 18, demand: 88, status: 'strong' },
  { name: 'Ubud', agents: 12, demand: 78, status: 'adequate' },
  { name: 'Kuta', agents: 8, demand: 82, status: 'shortage' },
  { name: 'Sanur', agents: 6, demand: 65, status: 'shortage' },
  { name: 'Jimbaran', agents: 4, demand: 72, status: 'critical' },
  { name: 'Uluwatu', agents: 3, demand: 68, status: 'critical' },
  { name: 'Nusa Dua', agents: 5, demand: 58, status: 'shortage' },
  { name: 'Denpasar', agents: 14, demand: 45, status: 'adequate' },
  { name: 'Tabanan', agents: 2, demand: 42, status: 'critical' },
];

const PIPELINE = [
  { stage: 'Leads Contacted', count: 142, icon: Phone, color: 'text-chart-2' },
  { stage: 'Interviews Scheduled', count: 48, icon: ClipboardCheck, color: 'text-primary' },
  { stage: 'Pending Verification', count: 22, icon: Shield, color: 'text-chart-3' },
  { stage: 'Ready to Activate', count: 12, icon: Zap, color: 'text-chart-1' },
];

const ENGAGEMENT_COMPONENTS = [
  { label: 'Activity Frequency', value: 78, weight: 0.3 },
  { label: 'Listings Freshness', value: 65, weight: 0.2 },
  { label: 'Response Speed', value: 82, weight: 0.3 },
  { label: 'Deal Participation', value: 58, weight: 0.2 },
];

// ── Component ──

const AgentNetworkGrowth = () => {
  const [leaderboardView, setLeaderboardView] = useState<'table' | 'cards'>('table');

  const totalAgents = 284;
  const activeThisWeek = 196;
  const newToday = 8;
  const inactiveAlerts = 32;

  const engagementScore = Math.round(
    ENGAGEMENT_COMPONENTS.reduce((s, c) => s + c.value * c.weight, 0)
  );

  const formatCurrency = (v: number) => {
    if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(0)}M`;
    return `Rp ${v.toLocaleString()}`;
  };

  const pieData = ENGAGEMENT_COMPONENTS.map(c => ({
    name: c.label,
    value: c.value * c.weight * 100,
  }));
  const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">Agent Network Growth</h2>
            <p className="text-[10px] text-muted-foreground">Command center to build and scale the agent ecosystem</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[8px] h-5 text-chart-1 border-chart-1/20 gap-1">
            <Activity className="h-2.5 w-2.5" />LIVE
          </Badge>
          <Button variant="default" size="sm" className="h-7 text-[10px] gap-1">
            <UserPlus className="h-3 w-3" />Recruit Agent
          </Button>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Agents', value: totalAgents.toLocaleString(), icon: Users, delta: '+24 this month', up: true, accent: 'text-primary' },
          { label: 'Active This Week', value: activeThisWeek.toLocaleString(), icon: UserCheck, delta: `${((activeThisWeek / totalAgents) * 100).toFixed(0)}% of total`, up: true, accent: 'text-chart-1' },
          { label: 'New Today', value: newToday.toString(), icon: UserPlus, delta: '+3 vs yesterday', up: true, accent: 'text-chart-2' },
          { label: 'Inactive Alerts', value: inactiveAlerts.toString(), icon: UserX, delta: '11.3% of total', up: false, accent: 'text-destructive' },
        ].map((kpi, i) => (
          <Card key={i} className="border-border/30 hover:border-border/50 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", kpi.up ? "bg-primary/10" : "bg-destructive/10")}>
                  <kpi.icon className={cn("h-4 w-4", kpi.accent)} />
                </div>
                <span className={cn("text-[8px] flex items-center gap-0.5 tabular-nums", kpi.up ? "text-chart-1" : "text-destructive")}>
                  {kpi.up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                  {kpi.delta}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground tabular-nums leading-tight">{kpi.value}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── GROWTH TREND ── */}
      <Card className="border-border/30">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
            Agent Network Growth Trend
            <Badge variant="outline" className="text-[7px] h-4 ml-auto">12 months</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={GROWTH_TREND} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#gTotal)" strokeWidth={2} name="Total Agents" />
              <Area type="monotone" dataKey="active" stroke="hsl(var(--chart-1))" fill="url(#gActive)" strokeWidth={2} name="Active Agents" />
              <Bar dataKey="new" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} opacity={0.5} name="New Agents" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-2">
            {[
              { label: 'Total Agents', color: 'bg-primary' },
              { label: 'Active Agents', color: 'bg-chart-1' },
              { label: 'New Agents', color: 'bg-chart-2' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-4 rounded-sm", l.color)} />
                <span className="text-[9px] text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── MAIN GRID: Leaderboard + Right Column ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1fr] gap-4">
        {/* LEFT — Leaderboard */}
        <Card className="border-border/30">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-chart-2" />
                Agent Performance Leaderboard
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant={leaderboardView === 'table' ? 'default' : 'outline'} size="sm" className="h-5 text-[8px] px-2" onClick={() => setLeaderboardView('table')}>Table</Button>
                <Button variant={leaderboardView === 'cards' ? 'default' : 'outline'} size="sm" className="h-5 text-[8px] px-2" onClick={() => setLeaderboardView('cards')}>Cards</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {leaderboardView === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/20">
                      {['#', 'Agent', 'Listings', 'Inquiries', 'Viewings', 'Deals', 'Commission', 'Score'].map(h => (
                        <th key={h} className="text-[8px] text-muted-foreground font-medium uppercase tracking-wider py-2 px-2 text-left first:text-center">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {AGENTS.map((agent, i) => {
                      const isTop5 = i < 5;
                      return (
                        <motion.tr key={agent.id}
                          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={cn(
                            "border-b border-border/10 hover:bg-muted/5 transition-colors",
                            isTop5 && "bg-primary/[0.02]"
                          )}
                        >
                          <td className="py-2 px-2 text-center">
                            {i < 3 ? (
                              <div className={cn("h-5 w-5 rounded-full flex items-center justify-center mx-auto text-[8px] font-bold",
                                i === 0 ? "bg-chart-2/20 text-chart-2" : i === 1 ? "bg-muted-foreground/20 text-muted-foreground" : "bg-chart-3/20 text-chart-3"
                              )}>
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                              </div>
                            ) : (
                              <span className="text-[9px] tabular-nums text-muted-foreground">{i + 1}</span>
                            )}
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-[8px] font-bold text-primary">{agent.name.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="text-[10px] font-medium text-foreground">{agent.name}</p>
                                {isTop5 && <Badge variant="outline" className="text-[5px] h-3 text-chart-1 border-chart-1/20">TOP 5</Badge>}
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-[10px] tabular-nums text-foreground">{agent.listings}</td>
                          <td className="py-2 px-2 text-[10px] tabular-nums text-foreground">{agent.inquiries}</td>
                          <td className="py-2 px-2 text-[10px] tabular-nums text-foreground">{agent.viewings}</td>
                          <td className="py-2 px-2">
                            <span className="text-[10px] font-semibold tabular-nums text-chart-1">{agent.deals}</span>
                          </td>
                          <td className="py-2 px-2 text-[10px] tabular-nums text-foreground">{formatCurrency(agent.commission)}</td>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-10 h-1.5 rounded-full bg-muted/20 overflow-hidden">
                                <div className={cn("h-full rounded-full", agent.score >= 85 ? "bg-chart-1" : agent.score >= 65 ? "bg-chart-2" : "bg-destructive")}
                                  style={{ width: `${agent.score}%` }} />
                              </div>
                              <span className="text-[9px] tabular-nums font-semibold text-foreground">{agent.score}</span>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {AGENTS.slice(0, 5).map((agent, i) => (
                  <motion.div key={agent.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
                    <Card className={cn("border-border/20 text-center", i === 0 && "ring-1 ring-chart-2/30")}>
                      <CardContent className="p-3">
                        <div className={cn("h-10 w-10 rounded-full mx-auto mb-2 flex items-center justify-center",
                          i === 0 ? "bg-chart-2/15 ring-2 ring-chart-2/30" : "bg-primary/10"
                        )}>
                          <span className={cn("text-sm font-bold", i === 0 ? "text-chart-2" : "text-primary")}>{agent.name.charAt(0)}</span>
                        </div>
                        {i < 3 && <span className="text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>}
                        <p className="text-[10px] font-semibold text-foreground mt-1">{agent.name}</p>
                        <p className="text-lg font-bold text-chart-1 tabular-nums">{agent.deals}</p>
                        <p className="text-[8px] text-muted-foreground">deals closed</p>
                        <p className="text-[9px] text-foreground tabular-nums mt-1">{formatCurrency(agent.commission)}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT Column */}
        <div className="space-y-4">
          {/* Activation Funnel */}
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-primary" />
                Agent Activation Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {FUNNEL.map((step, i) => {
                const widthPct = step.pct;
                const convRate = i > 0 ? ((step.count / FUNNEL[i - 1].count) * 100).toFixed(0) : '100';
                return (
                  <motion.div key={step.stage} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] text-foreground font-medium">{step.stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold tabular-nums text-foreground">{step.count}</span>
                        {i > 0 && (
                          <Badge variant="outline" className="text-[6px] h-3 px-1 text-chart-2">{convRate}% conv</Badge>
                        )}
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-muted/10 overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                        className={cn("h-full rounded-full",
                          i === 0 ? "bg-primary/60" : i === 1 ? "bg-primary/50" : i === 2 ? "bg-chart-1/50" : i === 3 ? "bg-chart-2/50" : "bg-chart-1"
                        )}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold tabular-nums text-foreground/70">
                        {step.pct.toFixed(1)}%
                      </span>
                    </div>
                    {i < FUNNEL.length - 1 && (
                      <div className="flex justify-center my-0.5">
                        <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/30 rotate-90" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Engagement Score */}
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-chart-1" />
                Network Engagement Score
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex items-center gap-4">
                {/* Gauge */}
                <div className="relative h-24 w-24 shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" strokeOpacity="0.15" />
                    <motion.circle cx="50" cy="50" r="38" fill="none"
                      stroke={engagementScore >= 75 ? "hsl(var(--chart-1))" : engagementScore >= 50 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"}
                      strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${(engagementScore / 100) * 239} 239`}
                      initial={{ strokeDasharray: "0 239" }}
                      animate={{ strokeDasharray: `${(engagementScore / 100) * 239} 239` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-foreground tabular-nums">{engagementScore}</span>
                    <span className="text-[7px] text-muted-foreground">/ 100</span>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="flex-1 space-y-1.5">
                  {ENGAGEMENT_COMPONENTS.map((c, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[8px] text-muted-foreground">{c.label}</span>
                        <span className="text-[8px] font-semibold tabular-nums text-foreground">{c.value}</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted/15 overflow-hidden">
                        <div className={cn("h-full rounded-full", c.value >= 75 ? "bg-chart-1" : c.value >= 50 ? "bg-chart-2" : "bg-destructive")}
                          style={{ width: `${c.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── BOTTOM GRID: District Map + Recruitment Pipeline ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* District Agent Density */}
        <Card className="border-border/30">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-chart-3" />
              Micro-District Agent Density
              <Badge variant="outline" className="text-[7px] h-4 ml-auto">Bali Region</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-1.5">
            {DISTRICTS.map((d, i) => {
              const statusStyle = d.status === 'strong' ? { bg: 'bg-chart-1/10', text: 'text-chart-1', border: 'border-chart-1/20' }
                : d.status === 'adequate' ? { bg: 'bg-chart-2/10', text: 'text-chart-2', border: 'border-chart-2/20' }
                : d.status === 'shortage' ? { bg: 'bg-chart-3/10', text: 'text-chart-3', border: 'border-chart-3/20' }
                : { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' };
              const ratio = d.agents / Math.max(1, d.demand / 10);
              return (
                <motion.div key={d.name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-lg border", statusStyle.border, statusStyle.bg)}>
                  <span className="text-[9px] font-medium text-foreground w-20 truncate">{d.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted/10 overflow-hidden">
                    <div className={cn("h-full rounded-full", d.status === 'strong' || d.status === 'adequate' ? "bg-chart-1" : "bg-destructive")}
                      style={{ width: `${Math.min(100, (d.agents / 25) * 100)}%` }} />
                  </div>
                  <span className="text-[8px] tabular-nums font-semibold text-foreground w-6 text-right">{d.agents}</span>
                  <span className="text-[7px] text-muted-foreground">agents</span>
                  <Badge variant="outline" className={cn("text-[5px] h-3 px-1 capitalize", statusStyle.text, statusStyle.border)}>
                    {d.status === 'critical' && <AlertTriangle className="h-2 w-2 mr-0.5" />}
                    {d.status}
                  </Badge>
                  <span className="text-[7px] tabular-nums text-muted-foreground">D:{d.demand}</span>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recruitment Pipeline */}
        <Card className="border-border/30">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <UserPlus className="h-3.5 w-3.5 text-primary" />
              Agent Recruitment Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {PIPELINE.map((p, i) => (
                <motion.div key={p.stage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="border-border/15">
                    <CardContent className="p-3 text-center">
                      <div className={cn("h-8 w-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center bg-card")}>
                        <p.icon className={cn("h-4 w-4", p.color)} />
                      </div>
                      <p className="text-xl font-bold text-foreground tabular-nums">{p.count}</p>
                      <p className="text-[8px] text-muted-foreground mt-0.5">{p.stage}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pipeline flow */}
            <div className="flex items-center gap-1 px-2">
              {PIPELINE.map((p, i) => (
                <React.Fragment key={p.stage}>
                  <div className="flex-1 text-center">
                    <div className={cn("h-6 rounded-md flex items-center justify-center", i === PIPELINE.length - 1 ? "bg-chart-1/15" : "bg-muted/10")}>
                      <span className="text-[7px] font-semibold tabular-nums text-foreground">{p.count}</span>
                    </div>
                    <p className="text-[6px] text-muted-foreground mt-0.5">{p.stage.split(' ')[0]}</p>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Conversion metrics */}
            <div className="mt-4 pt-3 border-t border-border/20 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-foreground tabular-nums">{((48 / 142) * 100).toFixed(0)}%</p>
                <p className="text-[7px] text-muted-foreground">Interview Rate</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground tabular-nums">{((22 / 48) * 100).toFixed(0)}%</p>
                <p className="text-[7px] text-muted-foreground">Verification Rate</p>
              </div>
              <div>
                <p className="text-lg font-bold text-chart-1 tabular-nums">{((12 / 142) * 100).toFixed(0)}%</p>
                <p className="text-[7px] text-muted-foreground">Activation Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentNetworkGrowth;
