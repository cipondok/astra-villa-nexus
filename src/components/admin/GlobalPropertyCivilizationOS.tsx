import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, TrendingUp, Users, Zap, MapPin, ArrowUpRight, ArrowDownRight,
  Activity, Brain, Layers, BarChart3, Network, Shield, Cpu, Radio
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface CivilizationNode {
  id: string; name: string; x: number; y: number;
  marketHealth: number; liquidity: number; vendorStrength: number;
  automationPct: number; txnVolume: number; population: number;
  tier: 'sovereign' | 'institutional' | 'emerging' | 'frontier';
}

const NODES: CivilizationNode[] = [
  { id: 'bali', name: 'Bali', x: 56, y: 58, marketHealth: 92, liquidity: 94, vendorStrength: 88, automationPct: 72, txnVolume: 8400, population: 4.3, tier: 'sovereign' },
  { id: 'jkt', name: 'Jakarta', x: 42, y: 54, marketHealth: 85, liquidity: 78, vendorStrength: 82, automationPct: 65, txnVolume: 12800, population: 34.5, tier: 'institutional' },
  { id: 'dubai', name: 'Dubai', x: 28, y: 32, marketHealth: 82, liquidity: 82, vendorStrength: 78, automationPct: 58, txnVolume: 6200, population: 5.8, tier: 'institutional' },
  { id: 'sg', name: 'Singapore', x: 48, y: 50, marketHealth: 90, liquidity: 88, vendorStrength: 92, automationPct: 78, txnVolume: 5400, population: 5.9, tier: 'sovereign' },
  { id: 'bangkok', name: 'Bangkok', x: 44, y: 40, marketHealth: 68, liquidity: 62, vendorStrength: 58, automationPct: 42, txnVolume: 3200, population: 16.2, tier: 'emerging' },
  { id: 'kl', name: 'Kuala Lumpur', x: 46, y: 46, marketHealth: 72, liquidity: 65, vendorStrength: 68, automationPct: 48, txnVolume: 2800, population: 8.4, tier: 'emerging' },
  { id: 'lombok', name: 'Lombok', x: 58, y: 60, marketHealth: 52, liquidity: 35, vendorStrength: 42, automationPct: 28, txnVolume: 800, population: 3.4, tier: 'frontier' },
  { id: 'hcm', name: 'Ho Chi Minh', x: 50, y: 42, marketHealth: 62, liquidity: 55, vendorStrength: 52, automationPct: 35, txnVolume: 2100, population: 13.3, tier: 'emerging' },
  { id: 'tokyo', name: 'Tokyo', x: 72, y: 28, marketHealth: 78, liquidity: 72, vendorStrength: 65, automationPct: 32, txnVolume: 4200, population: 37.4, tier: 'institutional' },
  { id: 'sydney', name: 'Sydney', x: 74, y: 72, marketHealth: 75, liquidity: 68, vendorStrength: 62, automationPct: 28, txnVolume: 3500, population: 5.3, tier: 'emerging' },
  { id: 'london', name: 'London', x: 18, y: 22, marketHealth: 72, liquidity: 58, vendorStrength: 55, automationPct: 22, txnVolume: 2800, population: 14.8, tier: 'emerging' },
  { id: 'mumbai', name: 'Mumbai', x: 34, y: 38, marketHealth: 55, liquidity: 45, vendorStrength: 48, automationPct: 18, txnVolume: 1500, population: 21.0, tier: 'frontier' },
];

const SYNC_LINKS = [
  { from: 'sg', to: 'bali', strength: 0.9 }, { from: 'jkt', to: 'bali', strength: 0.85 },
  { from: 'sg', to: 'jkt', strength: 0.7 }, { from: 'dubai', to: 'bali', strength: 0.65 },
  { from: 'sg', to: 'kl', strength: 0.6 }, { from: 'bangkok', to: 'sg', strength: 0.5 },
  { from: 'tokyo', to: 'sg', strength: 0.45 }, { from: 'london', to: 'dubai', strength: 0.4 },
  { from: 'sydney', to: 'bali', strength: 0.5 }, { from: 'hcm', to: 'bangkok', strength: 0.35 },
  { from: 'mumbai', to: 'dubai', strength: 0.4 }, { from: 'jkt', to: 'lombok', strength: 0.55 },
];

const TIER_STYLE: Record<string, { bg: string; text: string }> = {
  sovereign: { bg: 'bg-primary/20', text: 'text-primary' },
  institutional: { bg: 'bg-chart-1/20', text: 'text-chart-1' },
  emerging: { bg: 'bg-chart-2/20', text: 'text-chart-2' },
  frontier: { bg: 'bg-chart-3/20', text: 'text-chart-3' },
};

const INTEL_LAYERS = ['Market Health', 'Liquidity', 'Vendor Strength', 'Automation'] as const;
type IntelLayer = typeof INTEL_LAYERS[number];

const GlobalPropertyCivilizationOS = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<IntelLayer>('Market Health');

  const selected = selectedNode ? NODES.find(n => n.id === selectedNode) : null;

  const getNodeValue = (n: CivilizationNode) => {
    switch (activeLayer) {
      case 'Market Health': return n.marketHealth;
      case 'Liquidity': return n.liquidity;
      case 'Vendor Strength': return n.vendorStrength;
      case 'Automation': return n.automationPct;
    }
  };

  const radarData = selected ? [
    { metric: 'Market Health', value: selected.marketHealth },
    { metric: 'Liquidity', value: selected.liquidity },
    { metric: 'Vendor Strength', value: selected.vendorStrength },
    { metric: 'Automation', value: selected.automationPct },
    { metric: 'Volume', value: Math.min(100, selected.txnVolume / 130) },
  ] : [];

  const totalTxn = NODES.reduce((s, n) => s + n.txnVolume, 0);
  const avgHealth = Math.round(NODES.reduce((s, n) => s + n.marketHealth, 0) / NODES.length);
  const avgAuto = Math.round(NODES.reduce((s, n) => s + n.automationPct, 0) / NODES.length);

  const projectionData = Array.from({ length: 20 }, (_, i) => ({
    year: `Y${i + 1}`,
    coordinated: 100 + i * 14 + Math.random() * 8,
    fragmented: 100 + i * 5 + Math.random() * 6,
    automation: 22 + i * 3.5 + Math.random() * 3,
  }));

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Global Property Civilization Operating System</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-primary border-primary/20">LIVE OS</Badge>
        </div>
        <div className="flex items-center gap-1">
          {INTEL_LAYERS.map(l => (
            <Button key={l} variant={activeLayer === l ? 'default' : 'outline'} size="sm" className="h-5 text-[6px] px-1.5" onClick={() => setActiveLayer(l)}>{l}</Button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'Connected Nodes', value: `${NODES.length}`, icon: Network, delta: '+3', up: true },
          { label: 'Total Transactions', value: `${(totalTxn / 1000).toFixed(1)}K`, icon: Activity, delta: '+18%', up: true },
          { label: 'Avg Market Health', value: `${avgHealth}/100`, icon: Shield, delta: '+4.2', up: true },
          { label: 'Automation Penetration', value: `${avgAuto}%`, icon: Cpu, delta: '+8%', up: true },
          { label: 'Sync Links Active', value: `${SYNC_LINKS.length}`, icon: Radio, delta: '+2', up: true },
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

      <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-3">
        {/* LEFT — Network Grid */}
        <div className="space-y-3">
          <Card className="border-border/20 overflow-hidden">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Layers className="h-3 w-3 text-primary" />Planetary Property Network — {activeLayer}
                <Badge variant="outline" className="text-[6px] h-3 ml-auto">click nodes to inspect</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative" style={{ minHeight: 340 }}>
              <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

              {/* Sync lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {SYNC_LINKS.map((link, i) => {
                  const from = NODES.find(n => n.id === link.from);
                  const to = NODES.find(n => n.id === link.to);
                  if (!from || !to) return null;
                  return (
                    <motion.line key={i}
                      x1={`${from.x}%`} y1={`${from.y}%`}
                      x2={`${to.x}%`} y2={`${to.y}%`}
                      stroke="hsl(var(--primary))"
                      strokeWidth={0.3 + link.strength * 0.6}
                      strokeDasharray="2 5"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.06 + link.strength * 0.08 }}
                      transition={{ delay: i * 0.06 }}
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              {NODES.map((node, i) => {
                const val = getNodeValue(node);
                const size = 6 + (val / 100) * 16;
                const isSelected = selectedNode === node.id;
                const style = TIER_STYLE[node.tier];
                return (
                  <motion.button key={node.id}
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setSelectedNode(isSelected ? null : node.id)}
                    className={cn("absolute flex flex-col items-center z-10 group", isSelected && "z-20")}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    <div className="relative">
                      <div className={cn("rounded-full border-2 transition-all", isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-foreground/20", style.bg)}
                        style={{ width: size, height: size }} />
                      {node.tier === 'sovereign' && (
                        <motion.div className={cn("absolute inset-0 rounded-full", style.bg)}
                          animate={{ scale: [1, 2.2, 1], opacity: [0.25, 0, 0.25] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          style={{ width: size, height: size }} />
                      )}
                    </div>
                    <span className={cn("text-[7px] font-medium mt-0.5 whitespace-nowrap", isSelected ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground")}>{node.name}</span>
                    <span className="text-[5px] tabular-nums text-muted-foreground">{val}/100</span>
                  </motion.button>
                );
              })}

              {/* Selected detail */}
              <AnimatePresence>
                {selected && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-2 left-2 right-2 p-3 rounded-lg border border-border/30 bg-background/90 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="text-xs font-semibold text-foreground">{selected.name}</span>
                      <Badge className={cn("text-[6px] h-3 px-1", TIER_STYLE[selected.tier].bg, TIER_STYLE[selected.tier].text)}>{selected.tier}</Badge>
                      <span className="text-[7px] text-muted-foreground ml-auto">{selected.population}M pop · {selected.txnVolume.toLocaleString()} txns</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { l: 'Market Health', v: selected.marketHealth },
                        { l: 'Liquidity', v: selected.liquidity },
                        { l: 'Vendor Strength', v: selected.vendorStrength },
                        { l: 'Automation', v: `${selected.automationPct}%` },
                      ].map(s => (
                        <div key={s.l} className="text-center">
                          <p className="text-[6px] text-muted-foreground">{s.l}</p>
                          <p className="text-[10px] font-bold text-foreground tabular-nums">{s.v}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Coordination Projection */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-chart-1" />Coordinated vs Fragmented Economy — 20-Year Projection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={projectionData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gCoord" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="year" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                  <Area type="monotone" dataKey="coordinated" stroke="hsl(var(--chart-1))" fill="url(#gCoord)" strokeWidth={2} name="ASTRA Coordinated" />
                  <Area type="monotone" dataKey="fragmented" stroke="hsl(var(--muted-foreground))" fill="none" strokeWidth={1} strokeDasharray="3 3" name="Fragmented Baseline" />
                  <Area type="monotone" dataKey="automation" stroke="hsl(var(--primary))" fill="none" strokeWidth={1.5} name="Automation %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-3">
          {selected && (
            <Card className="border-border/20">
              <CardHeader className="p-2.5 pb-1.5">
                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                  <Brain className="h-3 w-3 text-chart-2" />Intelligence Profile — {selected.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 pt-0">
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 6, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis tick={false} domain={[0, 100]} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Node Ranking */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-chart-1" />Civilization Node Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1">
              {[...NODES].sort((a, b) => {
                const sa = a.marketHealth * 0.3 + a.liquidity * 0.25 + a.vendorStrength * 0.2 + a.automationPct * 0.25;
                const sb = b.marketHealth * 0.3 + b.liquidity * 0.25 + b.vendorStrength * 0.2 + b.automationPct * 0.25;
                return sb - sa;
              }).map((n, i) => {
                const score = Math.round(n.marketHealth * 0.3 + n.liquidity * 0.25 + n.vendorStrength * 0.2 + n.automationPct * 0.25);
                const style = TIER_STYLE[n.tier];
                return (
                  <div key={n.id} className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-muted/5 rounded px-1" onClick={() => setSelectedNode(n.id)}>
                    <span className="text-[8px] font-bold text-primary tabular-nums w-4">#{i + 1}</span>
                    <span className="text-[9px] font-medium text-foreground flex-1 truncate">{n.name}</span>
                    <Badge className={cn("text-[5px] h-3 px-1", style.bg, style.text)}>{n.tier}</Badge>
                    <div className="w-12 h-1 rounded-full bg-muted/20 overflow-hidden">
                      <div className={cn("h-full rounded-full", score >= 75 ? "bg-chart-1" : score >= 55 ? "bg-chart-2" : "bg-chart-3")} style={{ width: `${score}%` }} />
                    </div>
                    <span className="text-[8px] tabular-nums text-foreground w-5 text-right">{score}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Cpu className="h-3 w-3 text-primary" />OS System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {[
                { label: 'Coordination Engine', status: 'operational', uptime: '99.8%' },
                { label: 'Liquidity Sync', status: 'operational', uptime: '99.5%' },
                { label: 'Pricing Intelligence', status: 'operational', uptime: '99.2%' },
                { label: 'Vendor Network', status: 'degraded', uptime: '97.1%' },
                { label: 'Cross-Border Protocol', status: 'operational', uptime: '98.8%' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={cn("h-1.5 w-1.5 rounded-full", s.status === 'operational' ? "bg-chart-1" : "bg-chart-3")} />
                  <span className="text-[8px] text-foreground flex-1">{s.label}</span>
                  <span className="text-[7px] tabular-nums text-muted-foreground">{s.uptime}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GlobalPropertyCivilizationOS;
