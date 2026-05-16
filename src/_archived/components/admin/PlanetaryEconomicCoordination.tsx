import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, TrendingUp, Activity, Zap, ArrowUpRight, ArrowDownRight,
  DollarSign, BarChart3, Brain, Radio, AlertTriangle, CheckCircle,
  ArrowRight, Clock, Target, Shield, Waves
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, BarChart, Bar
} from 'recharts';

/* ─── Liquidity Sync Data ─── */
interface MarketNode {
  id: string; name: string; x: number; y: number;
  liquidity: number; capitalFlow: number; imbalance: number;
  status: 'surplus' | 'balanced' | 'deficit';
}

const MARKETS: MarketNode[] = [
  { id: 'bali', name: 'Bali', x: 34, y: 48, liquidity: 94, capitalFlow: 12.8, imbalance: 0.08, status: 'surplus' },
  { id: 'jkt', name: 'Jakarta', x: 26, y: 52, liquidity: 82, capitalFlow: 8.4, imbalance: 0.15, status: 'balanced' },
  { id: 'dubai', name: 'Dubai', x: 52, y: 30, liquidity: 78, capitalFlow: 14.2, imbalance: 0.22, status: 'surplus' },
  { id: 'bangkok', name: 'Bangkok', x: 40, y: 38, liquidity: 65, capitalFlow: 3.8, imbalance: 0.35, status: 'deficit' },
  { id: 'sg', name: 'Singapore', x: 38, y: 54, liquidity: 88, capitalFlow: 6.2, imbalance: 0.12, status: 'balanced' },
  { id: 'sydney', name: 'Sydney', x: 64, y: 70, liquidity: 72, capitalFlow: 4.5, imbalance: 0.28, status: 'deficit' },
  { id: 'london', name: 'London', x: 46, y: 16, liquidity: 68, capitalFlow: 2.8, imbalance: 0.32, status: 'deficit' },
  { id: 'makassar', name: 'Makassar', x: 30, y: 58, liquidity: 42, capitalFlow: 1.2, imbalance: 0.55, status: 'deficit' },
];

const FLOW_LINKS = [
  { from: 'sg', to: 'bali', strength: 0.9 },
  { from: 'dubai', to: 'bali', strength: 0.75 },
  { from: 'jkt', to: 'bali', strength: 0.85 },
  { from: 'dubai', to: 'jkt', strength: 0.5 },
  { from: 'london', to: 'dubai', strength: 0.6 },
  { from: 'bangkok', to: 'sg', strength: 0.4 },
  { from: 'sydney', to: 'bali', strength: 0.55 },
  { from: 'sg', to: 'jkt', strength: 0.65 },
];

/* ─── Economic Signal Timeline ─── */
interface EconomicSignal {
  time: string; type: 'demand' | 'investment' | 'regulatory' | 'migration';
  title: string; impact: 'positive' | 'negative' | 'neutral';
  magnitude: number; region: string;
}

const SIGNALS: EconomicSignal[] = [
  { time: '2h ago', type: 'demand', title: 'Luxury villa demand surge detected — Canggu cluster', impact: 'positive', magnitude: 8.5, region: 'Bali' },
  { time: '4h ago', type: 'investment', title: 'Cross-border capital wave from Singapore to Jakarta commercial', impact: 'positive', magnitude: 7.2, region: 'Jakarta' },
  { time: '6h ago', type: 'regulatory', title: 'New foreign ownership corridor approved — Lombok SEZ', impact: 'positive', magnitude: 9.1, region: 'Lombok' },
  { time: '8h ago', type: 'migration', title: 'Buyer interest shifting from Seminyak to Pererenan district', impact: 'neutral', magnitude: 5.4, region: 'Bali' },
  { time: '12h ago', type: 'demand', title: 'Transaction velocity decline in Bangkok luxury segment', impact: 'negative', magnitude: 6.8, region: 'Bangkok' },
  { time: '1d ago', type: 'investment', title: 'Institutional fund allocation increase — Indonesia REIT sector', impact: 'positive', magnitude: 8.0, region: 'Indonesia' },
  { time: '1d ago', type: 'migration', title: 'Remote worker demand expanding to Ubud residential', impact: 'positive', magnitude: 6.2, region: 'Bali' },
  { time: '2d ago', type: 'regulatory', title: 'Tax incentive extension for developer partnerships', impact: 'positive', magnitude: 7.5, region: 'Indonesia' },
];

/* ─── Stability Index ─── */
const STABILITY_DATA = Array.from({ length: 24 }, (_, i) => ({
  month: `M${i + 1}`,
  baseline: 45 + Math.random() * 15,
  aiOptimized: 55 + i * 1.2 + Math.random() * 8,
  volatility: Math.max(5, 35 - i * 1.1 + Math.random() * 6),
}));

/* ─── Coordination Actions ─── */
interface CoordinationAction {
  id: string; priority: 'critical' | 'high' | 'medium';
  action: string; region: string; impact: string;
  type: 'commission' | 'incentive' | 'pricing' | 'supply';
}

const ACTIONS: CoordinationAction[] = [
  { id: '1', priority: 'critical', action: 'Activate vendor incentive program in undersupplied Makassar cluster', region: 'Makassar', impact: '+45 listings projected', type: 'incentive' },
  { id: '2', priority: 'high', action: 'Adjust commission model in high-demand Canggu zone', region: 'Bali', impact: '+Rp 840M quarterly revenue', type: 'commission' },
  { id: '3', priority: 'high', action: 'Deploy dynamic pricing for Bangkok luxury oversupply', region: 'Bangkok', impact: '-18% inventory days', type: 'pricing' },
  { id: '4', priority: 'medium', action: 'Increase developer onboarding velocity — Jakarta south corridor', region: 'Jakarta', impact: '+120 units pipeline', type: 'supply' },
  { id: '5', priority: 'medium', action: 'Launch cross-border buyer campaign — Singapore to Lombok', region: 'Lombok', impact: '+28% inquiry conversion', type: 'incentive' },
  { id: '6', priority: 'critical', action: 'Rebalance capital allocation from oversupplied Sydney to deficit Bangkok', region: 'Global', impact: '+12% portfolio efficiency', type: 'pricing' },
];

const SIGNAL_ICONS = { demand: TrendingUp, investment: DollarSign, regulatory: Shield, migration: Waves };
const SIGNAL_COLORS = { demand: 'text-chart-1', investment: 'text-chart-2', regulatory: 'text-chart-3', migration: 'text-primary' };
const IMPACT_COLORS = { positive: 'text-chart-1', negative: 'text-destructive', neutral: 'text-muted-foreground' };
const PRIORITY_STYLES = {
  critical: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' },
  high: { bg: 'bg-chart-3/10', text: 'text-chart-3', border: 'border-chart-3/20' },
  medium: { bg: 'bg-chart-2/10', text: 'text-chart-2', border: 'border-chart-2/20' },
};

const STATUS_COLORS = { surplus: 'bg-chart-1', balanced: 'bg-chart-2', deficit: 'bg-destructive' };

const PlanetaryEconomicCoordination = () => {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [signalFilter, setSignalFilter] = useState<string>('all');
  const [actionView, setActionView] = useState<'list' | 'executed'>('list');

  const selected = selectedMarket ? MARKETS.find(m => m.id === selectedMarket) : null;
  const filteredSignals = signalFilter === 'all' ? SIGNALS : SIGNALS.filter(s => s.type === signalFilter);

  const globalSyncIndex = Math.round(MARKETS.reduce((s, m) => s + m.liquidity, 0) / MARKETS.length);
  const totalCapitalFlow = MARKETS.reduce((s, m) => s + m.capitalFlow, 0);
  const imbalanceZones = MARKETS.filter(m => m.imbalance > 0.3).length;

  return (
    <div className="space-y-3 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Planetary Economic Coordination</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">LIVE</Badge>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
          <span>Sync: <strong className="text-foreground">{globalSyncIndex}/100</strong></span>
          <span>Capital: <strong className="text-foreground">${totalCapitalFlow.toFixed(1)}B</strong></span>
          <span>Imbalances: <strong className="text-destructive">{imbalanceZones}</strong></span>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'Global Sync Index', value: `${globalSyncIndex}/100`, icon: Radio, delta: '+3.2', up: true },
          { label: 'Capital Flow', value: `$${totalCapitalFlow.toFixed(1)}B`, icon: DollarSign, delta: '+8.4%', up: true },
          { label: 'Active Markets', value: `${MARKETS.length}`, icon: Globe, delta: '+2', up: true },
          { label: 'Imbalance Zones', value: `${imbalanceZones}`, icon: AlertTriangle, delta: '-1', up: false },
          { label: 'AI Interventions', value: '24/hr', icon: Brain, delta: '+12%', up: true },
        ].map(kpi => (
          <Card key={kpi.label} className="border-border/20">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <kpi.icon className="h-2.5 w-2.5 text-muted-foreground" />
                <p className="text-[7px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              </div>
              <div className="flex items-end gap-1.5">
                <p className="text-lg font-bold text-foreground tabular-nums leading-tight">{kpi.value}</p>
                <span className={cn("text-[7px] tabular-nums flex items-center gap-0.5 mb-0.5", kpi.up ? "text-chart-1" : "text-destructive")}>
                  {kpi.up ? <ArrowUpRight className="h-2 w-2" /> : <ArrowDownRight className="h-2 w-2" />}{kpi.delta}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-3">
        {/* LEFT — Map + Stability */}
        <div className="space-y-3">
          {/* Liquidity Synchronization Map */}
          <Card className="border-border/20 overflow-hidden">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Waves className="h-3 w-3 text-primary" />Global Liquidity Synchronization Map
                <Badge variant="outline" className="text-[6px] h-3 ml-auto">click nodes to inspect</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative" style={{ minHeight: 320 }}>
              <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

              {/* Flow connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {FLOW_LINKS.map((link, i) => {
                  const from = MARKETS.find(m => m.id === link.from);
                  const to = MARKETS.find(m => m.id === link.to);
                  if (!from || !to) return null;
                  return (
                    <motion.line
                      key={i}
                      x1={`${from.x}%`} y1={`${from.y}%`}
                      x2={`${to.x}%`} y2={`${to.y}%`}
                      stroke="hsl(var(--primary))"
                      strokeWidth={0.5 + link.strength}
                      strokeDasharray="3 5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.08 + link.strength * 0.12 }}
                      transition={{ delay: i * 0.1 }}
                    />
                  );
                })}
              </svg>

              {/* Market nodes */}
              {MARKETS.map((market, i) => {
                const size = 8 + (market.liquidity / 100) * 18;
                const isSelected = selectedMarket === market.id;
                return (
                  <motion.button
                    key={market.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setSelectedMarket(isSelected ? null : market.id)}
                    className={cn("absolute flex flex-col items-center z-10 group", isSelected && "z-20")}
                    style={{ left: `${market.x}%`, top: `${market.y}%` }}
                  >
                    <div className="relative">
                      <div
                        className={cn(
                          "rounded-full border-2 transition-all",
                          isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-foreground/20",
                          STATUS_COLORS[market.status], "bg-opacity-30"
                        )}
                        style={{ width: size, height: size }}
                      />
                      {market.imbalance > 0.3 && (
                        <motion.div
                          className="absolute inset-0 rounded-full border border-destructive/40"
                          animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          style={{ width: size, height: size }}
                        />
                      )}
                    </div>
                    <span className={cn("text-[7px] font-medium mt-0.5 whitespace-nowrap", isSelected ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground")}>{market.name}</span>
                  </motion.button>
                );
              })}

              {/* Selected detail overlay */}
              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-2 left-2 right-2 p-3 rounded-lg border border-border/30 bg-background/90 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("h-2 w-2 rounded-full", STATUS_COLORS[selected.status])} />
                      <span className="text-xs font-semibold text-foreground">{selected.name}</span>
                      <Badge variant="outline" className="text-[6px] h-3 capitalize">{selected.status}</Badge>
                      <span className="text-[7px] text-muted-foreground ml-auto">Imbalance: {(selected.imbalance * 100).toFixed(0)}%</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Liquidity Score', value: `${selected.liquidity}/100` },
                        { label: 'Capital Flow', value: `$${selected.capitalFlow}B` },
                        { label: 'Supply/Demand Gap', value: `${(selected.imbalance * 100).toFixed(0)}%` },
                        { label: 'AI Sync Status', value: selected.imbalance < 0.2 ? 'Aligned' : 'Adjusting' },
                      ].map(s => (
                        <div key={s.label} className="text-center">
                          <p className="text-[6px] text-muted-foreground">{s.label}</p>
                          <p className="text-[10px] font-bold text-foreground tabular-nums">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Stability Index Chart */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-chart-2" />Market Stability Index — AI Pricing Optimization Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={STABILITY_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gOptimized" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                  <Area type="monotone" dataKey="baseline" stroke="hsl(var(--muted-foreground))" fill="url(#gBaseline)" strokeWidth={1} strokeDasharray="3 3" name="Baseline" />
                  <Area type="monotone" dataKey="aiOptimized" stroke="hsl(var(--primary))" fill="url(#gOptimized)" strokeWidth={2} name="AI-Optimized" />
                  <Line type="monotone" dataKey="volatility" stroke="hsl(var(--destructive))" strokeWidth={1} dot={false} name="Volatility" strokeDasharray="2 2" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-5 mt-1">
                {[
                  { label: 'Baseline', color: 'bg-muted-foreground', dashed: true },
                  { label: 'AI-Optimized', color: 'bg-primary', dashed: false },
                  { label: 'Volatility', color: 'bg-destructive', dashed: true },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1">
                    <span className={cn("h-1.5 w-3 rounded-sm", l.color, l.dashed && "opacity-50")} />
                    <span className="text-[7px] text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Signals + Actions */}
        <div className="space-y-3">
          {/* Economic Signal Timeline */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Activity className="h-3 w-3 text-chart-3" />Economic Signal Timeline
              </CardTitle>
              <div className="flex items-center gap-1 mt-1">
                {['all', 'demand', 'investment', 'regulatory', 'migration'].map(f => (
                  <Button key={f} variant={signalFilter === f ? 'default' : 'outline'} size="sm" className="h-4 text-[6px] px-1.5 capitalize" onClick={() => setSignalFilter(f)}>{f}</Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1" style={{ maxHeight: 260, overflowY: 'auto' }}>
              {filteredSignals.map((signal, i) => {
                const Icon = SIGNAL_ICONS[signal.type];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 py-1.5 border-b border-border/10 last:border-0"
                  >
                    <Icon className={cn("h-3 w-3 mt-0.5 shrink-0", SIGNAL_COLORS[signal.type])} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-medium text-foreground leading-tight">{signal.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[5px] h-3 px-1">{signal.region}</Badge>
                        <span className={cn("text-[6px]", IMPACT_COLORS[signal.impact])}>
                          {signal.impact === 'positive' ? '↑' : signal.impact === 'negative' ? '↓' : '→'} {signal.magnitude.toFixed(1)}
                        </span>
                        <span className="text-[6px] text-muted-foreground ml-auto">{signal.time}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Coordination Action Feed */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Zap className="h-3 w-3 text-primary" />Coordination Actions
                <Badge variant="outline" className="text-[6px] h-3 ml-auto">{ACTIONS.length} pending</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5" style={{ maxHeight: 280, overflowY: 'auto' }}>
              {ACTIONS.map((action, i) => {
                const style = PRIORITY_STYLES[action.priority];
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={cn("px-2.5 py-2 rounded-lg border", style.border, style.bg)}
                  >
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className={cn("text-[5px] h-3 px-1 shrink-0 uppercase", style.text, style.border)}>{action.priority}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-medium text-foreground leading-tight">{action.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[5px] h-3 px-1">{action.region}</Badge>
                          <span className="text-[6px] text-chart-1 tabular-nums">{action.impact}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-5 text-[6px] px-1.5 shrink-0" onClick={() => {}}>
                        <CheckCircle className="h-2.5 w-2.5 mr-0.5" />Execute
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanetaryEconomicCoordination;
