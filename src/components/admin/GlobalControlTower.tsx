import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, TrendingUp, Users, Activity, AlertTriangle, Building2,
  Zap, Shield, MapPin, ArrowUpRight, Clock, ChevronRight, Target,
  DollarSign, BarChart3
} from 'lucide-react';

/* ─── Types ─── */
interface MarketCluster {
  id: string;
  name: string;
  country: string;
  gmv: number;
  vendors: number;
  txnVelocity: number;
  aiPenetration: number;
  status: 'dominant' | 'growing' | 'emerging' | 'exploring';
  riskLevel: 'low' | 'medium' | 'high';
  lat: number;
  lng: number;
}

const MARKETS: MarketCluster[] = [
  { id: 'bali', name: 'Bali', country: 'Indonesia', gmv: 847_000_000_000, vendors: 284, txnVelocity: 89, aiPenetration: 78, status: 'dominant', riskLevel: 'low', lat: -8.34, lng: 115.09 },
  { id: 'jakarta', name: 'Jakarta', country: 'Indonesia', gmv: 425_000_000_000, vendors: 156, txnVelocity: 72, aiPenetration: 65, status: 'growing', riskLevel: 'low', lat: -6.17, lng: 106.84 },
  { id: 'surabaya', name: 'Surabaya', country: 'Indonesia', gmv: 128_000_000_000, vendors: 67, txnVelocity: 48, aiPenetration: 42, status: 'emerging', riskLevel: 'medium', lat: -7.25, lng: 112.75 },
  { id: 'lombok', name: 'Lombok', country: 'Indonesia', gmv: 89_000_000_000, vendors: 43, txnVelocity: 35, aiPenetration: 38, status: 'emerging', riskLevel: 'medium', lat: -8.65, lng: 116.35 },
  { id: 'bandung', name: 'Bandung', country: 'Indonesia', gmv: 62_000_000_000, vendors: 35, txnVelocity: 30, aiPenetration: 28, status: 'exploring', riskLevel: 'low', lat: -6.91, lng: 107.61 },
  { id: 'yogya', name: 'Yogyakarta', country: 'Indonesia', gmv: 41_000_000_000, vendors: 28, txnVelocity: 25, aiPenetration: 22, status: 'exploring', riskLevel: 'low', lat: -7.79, lng: 110.36 },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  dominant: { bg: 'bg-chart-1/15', text: 'text-chart-1' },
  growing: { bg: 'bg-chart-2/15', text: 'text-chart-2' },
  emerging: { bg: 'bg-chart-3/15', text: 'text-chart-3' },
  exploring: { bg: 'bg-muted/15', text: 'text-muted-foreground' },
};

const formatCompact = (v: number) => {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${v.toLocaleString()}`;
};

const RISK_ALERTS = [
  { id: 1, level: 'high', message: 'Vendor verification backlog in Jakarta (12 pending)', time: '2m ago' },
  { id: 2, level: 'medium', message: 'Demand slowdown detected in Yogyakarta residential', time: '18m ago' },
  { id: 3, level: 'low', message: 'Commission payout threshold approaching for Q1', time: '1h ago' },
  { id: 4, level: 'medium', message: 'Listing quality score drop in Surabaya cluster', time: '2h ago' },
];

const EXPANSION_SIGNALS = [
  { city: 'Makassar', score: 72, signal: 'Demand velocity increasing 3x', trend: 'up' },
  { city: 'Medan', score: 58, signal: 'Anchor vendor partnership ready', trend: 'up' },
  { city: 'Semarang', score: 45, signal: 'Early inquiry signals detected', trend: 'stable' },
];

const WORKFLOW_TIMELINE = [
  { time: '09:14', action: 'AI optimized 132 listings across Bali cluster', type: 'ai' },
  { time: '09:08', action: 'Vendor onboarding spike detected in Jakarta (+8 today)', type: 'growth' },
  { time: '08:52', action: 'Demand surge in Bali luxury segment — 47 new inquiries', type: 'demand' },
  { time: '08:41', action: 'Auto-approved 5 verified vendors in Surabaya', type: 'ai' },
  { time: '08:30', action: 'Revenue milestone: Rp 1.2T GMV this quarter', type: 'revenue' },
  { time: '08:15', action: 'Market intelligence refresh completed — 6 markets updated', type: 'system' },
];

const TIMELINE_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  ai: { icon: Brain, color: 'text-primary' },
  growth: { icon: TrendingUp, color: 'text-chart-1' },
  demand: { icon: Activity, color: 'text-chart-2' },
  revenue: { icon: DollarSign, color: 'text-chart-3' },
  system: { icon: Shield, color: 'text-muted-foreground' },
};

import { Brain } from 'lucide-react';

const GlobalControlTower = () => {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  const totals = useMemo(() => ({
    gmv: MARKETS.reduce((s, m) => s + m.gmv, 0),
    markets: MARKETS.length,
    vendors: MARKETS.reduce((s, m) => s + m.vendors, 0),
    avgVelocity: Math.round(MARKETS.reduce((s, m) => s + m.txnVelocity, 0) / MARKETS.length),
    avgAI: Math.round(MARKETS.reduce((s, m) => s + m.aiPenetration, 0) / MARKETS.length),
  }), []);

  const filteredAlerts = selectedMarket
    ? RISK_ALERTS
    : RISK_ALERTS;

  return (
    <div className="space-y-3 p-1">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Global Control Tower</h2>
        <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">OPERATIONAL</Badge>
      </div>

      {/* Global Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'Global GMV', value: formatCompact(totals.gmv), icon: DollarSign },
          { label: 'Active Markets', value: totals.markets.toString(), icon: Globe },
          { label: 'Vendor Network', value: totals.vendors.toString(), icon: Users },
          { label: 'Txn Velocity', value: `${totals.avgVelocity}/100`, icon: Activity },
          { label: 'AI Penetration', value: `${totals.avgAI}%`, icon: Zap },
        ].map(kpi => (
          <Card key={kpi.label} className="border-border/20">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <kpi.icon className="h-2.5 w-2.5 text-muted-foreground" />
                <p className="text-[7px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums leading-tight">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Map + Intelligence Stack */}
      <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-3">
        {/* LEFT: Map */}
        <Card className="border-border/20 overflow-hidden">
          <CardContent className="p-0 relative" style={{ minHeight: 360 }}>
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="absolute inset-4">
              {MARKETS.map(m => {
                const size = 14 + (m.txnVelocity / 100) * 30;
                const style = STATUS_STYLES[m.status];
                const isSelected = selectedMarket === m.id;
                return (
                  <motion.button
                    key={m.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: Math.random() * 0.4, duration: 0.4 }}
                    onClick={() => setSelectedMarket(isSelected ? null : m.id)}
                    className={cn("absolute flex flex-col items-center z-10 group", isSelected && "z-20")}
                    style={{ left: `${((m.lng - 95) / 30) * 100}%`, top: `${((m.lat + 10) / 20) * 100}%` }}
                  >
                    <div className={cn(
                      "rounded-full border-2 transition-all duration-300 ring-2",
                      style.bg, `ring-${style.text.replace('text-', '')}/20`,
                      isSelected ? "ring-4 ring-primary/40 border-primary" : "border-transparent hover:border-foreground/20"
                    )} style={{ width: size, height: size }}>
                      {m.txnVelocity > 60 && (
                        <motion.div
                          className={cn("absolute inset-0 rounded-full", style.bg)}
                          animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <span className={cn(
                      "text-[7px] font-medium mt-0.5 whitespace-nowrap",
                      isSelected ? 'text-foreground' : 'text-muted-foreground opacity-60 group-hover:opacity-100'
                    )}>{m.name}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Selected market detail overlay */}
            <AnimatePresence>
              {selectedMarket && (() => {
                const m = MARKETS.find(x => x.id === selectedMarket)!;
                const style = STATUS_STYLES[m.status];
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-3 left-3 right-3 p-3 rounded-lg border border-border/30 bg-background/90 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="text-xs font-semibold text-foreground">{m.name}</span>
                      <Badge className={cn("text-[7px] h-3.5 px-1", style.bg, style.text)}>{m.status}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'GMV', value: formatCompact(m.gmv) },
                        { label: 'Vendors', value: m.vendors },
                        { label: 'Velocity', value: `${m.txnVelocity}/100` },
                        { label: 'AI %', value: `${m.aiPenetration}%` },
                      ].map(stat => (
                        <div key={stat.label} className="text-center">
                          <p className="text-[7px] text-muted-foreground">{stat.label}</p>
                          <p className="text-[11px] font-bold text-foreground tabular-nums">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* RIGHT: Intelligence Stack */}
        <div className="space-y-2">
          {/* Risk Alerts */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-destructive" />Risk Alerts
                <Badge variant="outline" className="text-[7px] h-3.5 ml-auto">{RISK_ALERTS.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {filteredAlerts.map(a => (
                <div key={a.id} className="flex items-start gap-2 py-1">
                  <span className={cn("mt-1 h-1.5 w-1.5 rounded-full shrink-0",
                    a.level === 'high' ? 'bg-destructive' : a.level === 'medium' ? 'bg-chart-3' : 'bg-chart-1'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-foreground leading-tight">{a.message}</p>
                    <p className="text-[7px] text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Expansion Signals */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Target className="h-3 w-3 text-chart-1" />Expansion Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {EXPANSION_SIGNALS.map(s => (
                <div key={s.city} className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-foreground w-16">{s.city}</span>
                  <div className="flex-1 h-1 rounded-full bg-muted/20 overflow-hidden">
                    <div className="h-full rounded-full bg-chart-1" style={{ width: `${s.score}%` }} />
                  </div>
                  <span className="text-[8px] tabular-nums text-foreground w-5 text-right">{s.score}</span>
                  {s.trend === 'up' && <ArrowUpRight className="h-2.5 w-2.5 text-chart-1" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Market Leaderboard */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-chart-2" />Performance Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1">
              {[...MARKETS].sort((a, b) => b.gmv - a.gmv).slice(0, 5).map((m, i) => {
                const style = STATUS_STYLES[m.status];
                return (
                  <div key={m.id} className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-muted/10 rounded px-1" onClick={() => setSelectedMarket(m.id)}>
                    <span className="text-[9px] font-bold text-primary tabular-nums w-4">#{i + 1}</span>
                    <span className="text-[9px] font-medium text-foreground flex-1">{m.name}</span>
                    <Badge className={cn("text-[6px] h-3 px-1", style.bg, style.text)}>{m.status}</Badge>
                    <span className="text-[8px] tabular-nums text-foreground">{formatCompact(m.gmv)}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom: Autonomous Workflow Timeline */}
      <Card className="border-border/20">
        <CardHeader className="p-2.5 pb-1.5">
          <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />Autonomous Workflow Timeline
            <Badge variant="outline" className="text-[7px] h-3.5 ml-1 text-chart-1 border-chart-1/20">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {WORKFLOW_TIMELINE.map((event, i) => {
              const config = TIMELINE_ICONS[event.type] || TIMELINE_ICONS.system;
              const Icon = config.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2 min-w-[220px] px-2.5 py-2 rounded-lg border border-border/20 bg-card/50 shrink-0"
                >
                  <Icon className={cn("h-3 w-3 mt-0.5 shrink-0", config.color)} />
                  <div className="min-w-0">
                    <p className="text-[9px] text-foreground leading-tight">{event.action}</p>
                    <p className="text-[7px] text-muted-foreground mt-0.5">{event.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalControlTower;
