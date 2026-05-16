import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, TrendingUp, Users, Activity, Zap, MapPin, ArrowUpRight,
  Target, DollarSign, BarChart3, Brain, Layers, Eye, Network
} from 'lucide-react';

/* ─── Data ─── */
type ZoomLevel = 'continent' | 'country' | 'city' | 'district';

interface MarketNode {
  id: string;
  name: string;
  level: ZoomLevel;
  parent?: string;
  x: number; y: number;
  txnThroughput: number;
  vendorMaturity: number;
  aiStabilization: number;
  liquidityScore: number;
  yieldSustainability: number;
  capitalInflow: number;
  urbanExpansion: number;
  infraReadiness: number;
  status: 'dominant' | 'growing' | 'emerging' | 'frontier';
}

const NODES: MarketNode[] = [
  // Continents
  { id: 'sea', name: 'Southeast Asia', level: 'continent', x: 38, y: 40, txnThroughput: 4200, vendorMaturity: 78, aiStabilization: 72, liquidityScore: 84, yieldSustainability: 76, capitalInflow: 88, urbanExpansion: 82, infraReadiness: 71, status: 'dominant' },
  { id: 'me', name: 'Middle East', level: 'continent', x: 50, y: 26, txnThroughput: 1800, vendorMaturity: 45, aiStabilization: 38, liquidityScore: 72, yieldSustainability: 82, capitalInflow: 78, urbanExpansion: 68, infraReadiness: 55, status: 'emerging' },
  { id: 'eu', name: 'Europe', level: 'continent', x: 46, y: 14, txnThroughput: 920, vendorMaturity: 22, aiStabilization: 18, liquidityScore: 68, yieldSustainability: 72, capitalInflow: 62, urbanExpansion: 45, infraReadiness: 35, status: 'frontier' },
  { id: 'anz', name: 'ANZ', level: 'continent', x: 62, y: 68, txnThroughput: 580, vendorMaturity: 18, aiStabilization: 15, liquidityScore: 75, yieldSustainability: 78, capitalInflow: 55, urbanExpansion: 38, infraReadiness: 28, status: 'frontier' },
  // Countries under SEA
  { id: 'id', name: 'Indonesia', level: 'country', parent: 'sea', x: 32, y: 48, txnThroughput: 3200, vendorMaturity: 82, aiStabilization: 78, liquidityScore: 88, yieldSustainability: 74, capitalInflow: 92, urbanExpansion: 85, infraReadiness: 78, status: 'dominant' },
  { id: 'th', name: 'Thailand', level: 'country', parent: 'sea', x: 40, y: 35, txnThroughput: 620, vendorMaturity: 38, aiStabilization: 32, liquidityScore: 62, yieldSustainability: 68, capitalInflow: 58, urbanExpansion: 55, infraReadiness: 42, status: 'emerging' },
  { id: 'sg', name: 'Singapore', level: 'country', parent: 'sea', x: 38, y: 50, txnThroughput: 380, vendorMaturity: 28, aiStabilization: 22, liquidityScore: 82, yieldSustainability: 85, capitalInflow: 72, urbanExpansion: 42, infraReadiness: 35, status: 'emerging' },
  // Cities under Indonesia
  { id: 'bali', name: 'Bali', level: 'city', parent: 'id', x: 34, y: 44, txnThroughput: 1800, vendorMaturity: 92, aiStabilization: 85, liquidityScore: 94, yieldSustainability: 82, capitalInflow: 95, urbanExpansion: 88, infraReadiness: 85, status: 'dominant' },
  { id: 'jkt', name: 'Jakarta', level: 'city', parent: 'id', x: 26, y: 48, txnThroughput: 980, vendorMaturity: 75, aiStabilization: 68, liquidityScore: 82, yieldSustainability: 68, capitalInflow: 85, urbanExpansion: 92, infraReadiness: 72, status: 'growing' },
  { id: 'sby', name: 'Surabaya', level: 'city', parent: 'id', x: 30, y: 52, txnThroughput: 420, vendorMaturity: 55, aiStabilization: 48, liquidityScore: 62, yieldSustainability: 58, capitalInflow: 65, urbanExpansion: 72, infraReadiness: 55, status: 'emerging' },
  // Districts under Bali
  { id: 'seminyak', name: 'Seminyak', level: 'district', parent: 'bali', x: 30, y: 38, txnThroughput: 580, vendorMaturity: 95, aiStabilization: 92, liquidityScore: 96, yieldSustainability: 78, capitalInflow: 98, urbanExpansion: 72, infraReadiness: 90, status: 'dominant' },
  { id: 'canggu', name: 'Canggu', level: 'district', parent: 'bali', x: 28, y: 42, txnThroughput: 520, vendorMaturity: 88, aiStabilization: 82, liquidityScore: 92, yieldSustainability: 85, capitalInflow: 94, urbanExpansion: 88, infraReadiness: 82, status: 'dominant' },
  { id: 'ubud', name: 'Ubud', level: 'district', parent: 'bali', x: 36, y: 40, txnThroughput: 320, vendorMaturity: 72, aiStabilization: 65, liquidityScore: 78, yieldSustainability: 88, capitalInflow: 75, urbanExpansion: 62, infraReadiness: 68, status: 'growing' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  dominant: { bg: 'bg-chart-1/15', text: 'text-chart-1' },
  growing: { bg: 'bg-chart-2/15', text: 'text-chart-2' },
  emerging: { bg: 'bg-chart-3/15', text: 'text-chart-3' },
  frontier: { bg: 'bg-muted/15', text: 'text-muted-foreground' },
};

type OverlayType = 'infra' | 'urban' | 'capital' | 'yield';
const OVERLAYS: { key: OverlayType; label: string; field: keyof MarketNode; icon: React.ElementType }[] = [
  { key: 'infra', label: 'Infrastructure Readiness', field: 'infraReadiness', icon: Layers },
  { key: 'urban', label: 'Urban Expansion', field: 'urbanExpansion', icon: TrendingUp },
  { key: 'capital', label: 'Capital Inflow', field: 'capitalInflow', icon: DollarSign },
  { key: 'yield', label: 'Yield Sustainability', field: 'yieldSustainability', icon: Target },
];

const FLOW_CONNECTIONS = [
  { from: 'sea', to: 'me' }, { from: 'sea', to: 'anz' }, { from: 'me', to: 'eu' },
  { from: 'sea', to: 'eu' }, { from: 'me', to: 'anz' },
];

const CivilizationMarketGrid = () => {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('continent');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [parentFilter, setParentFilter] = useState<string | undefined>();
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>('capital');

  const visibleNodes = NODES.filter(n => {
    if (n.level !== zoomLevel) return false;
    if (parentFilter && n.parent !== parentFilter) return false;
    if (!parentFilter && n.parent) return false;
    return true;
  });

  const handleDrillDown = (nodeId: string) => {
    const node = NODES.find(n => n.id === nodeId);
    if (!node) return;
    const children = NODES.filter(n => n.parent === nodeId);
    if (children.length > 0) {
      const childLevel = children[0].level;
      setZoomLevel(childLevel);
      setParentFilter(nodeId);
      setSelectedNode(null);
    } else {
      setSelectedNode(nodeId);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel === 'district') { setZoomLevel('city'); setParentFilter('id'); }
    else if (zoomLevel === 'city') { setZoomLevel('country'); setParentFilter('sea'); }
    else if (zoomLevel === 'country') { setZoomLevel('continent'); setParentFilter(undefined); }
    setSelectedNode(null);
  };

  const selected = selectedNode ? NODES.find(n => n.id === selectedNode) : null;
  const overlayConfig = OVERLAYS.find(o => o.key === activeOverlay)!;

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Civilization-Scale Market Intelligence</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">LIVE</Badge>
        </div>
        <div className="flex items-center gap-1">
          {zoomLevel !== 'continent' && (
            <Button variant="outline" size="sm" className="h-5 text-[8px] px-2" onClick={handleZoomOut}>← Zoom Out</Button>
          )}
          <Badge variant="outline" className="text-[7px] h-4 capitalize">{zoomLevel} view</Badge>
        </div>
      </div>

      {/* Overlay toggles */}
      <div className="flex items-center gap-1.5">
        {OVERLAYS.map(o => (
          <Button
            key={o.key}
            variant={activeOverlay === o.key ? 'default' : 'outline'}
            size="sm"
            className="h-5 text-[7px] px-2 gap-1"
            onClick={() => setActiveOverlay(o.key)}
          >
            <o.icon className="h-2.5 w-2.5" />{o.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-3">
        {/* Map Canvas */}
        <Card className="border-border/20 overflow-hidden">
          <CardContent className="p-0 relative" style={{ minHeight: 380 }}>
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            {/* Flow connections (continent level) */}
            {zoomLevel === 'continent' && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {FLOW_CONNECTIONS.map((conn, i) => {
                  const from = NODES.find(n => n.id === conn.from);
                  const to = NODES.find(n => n.id === conn.to);
                  if (!from || !to) return null;
                  return (
                    <motion.line
                      key={i}
                      x1={`${from.x}%`} y1={`${from.y}%`}
                      x2={`${to.x}%`} y2={`${to.y}%`}
                      stroke="hsl(var(--primary))"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.15 }}
                      transition={{ delay: i * 0.15 }}
                    />
                  );
                })}
              </svg>
            )}

            {/* Market nodes */}
            {visibleNodes.map((node, i) => {
              const overlayVal = node[overlayConfig.field] as number;
              const size = 10 + (overlayVal / 100) * 22;
              const style = STATUS_STYLES[node.status];
              const isSelected = selectedNode === node.id;

              return (
                <motion.button
                  key={node.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  onClick={() => handleDrillDown(node.id)}
                  className={cn("absolute flex flex-col items-center z-10 group", isSelected && "z-20")}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div
                    className={cn(
                      "rounded-full border-2 transition-all duration-300",
                      isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-foreground/20",
                      style.bg
                    )}
                    style={{ width: size, height: size }}
                  >
                    {overlayVal > 70 && (
                      <motion.div
                        className={cn("absolute inset-0 rounded-full", style.bg)}
                        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <span className={cn(
                    "text-[7px] font-medium mt-0.5 whitespace-nowrap",
                    isSelected ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground"
                  )}>{node.name}</span>
                  <span className="text-[5px] tabular-nums text-muted-foreground">{overlayVal}/100</span>
                </motion.button>
              );
            })}

            {/* Selected node detail overlay */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-3 left-3 right-3 p-3 rounded-lg border border-border/30 bg-background/90 backdrop-blur-md"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-3 w-3 text-primary" />
                    <span className="text-xs font-semibold text-foreground">{selected.name}</span>
                    <Badge className={cn("text-[6px] h-3 px-1", STATUS_STYLES[selected.status].bg, STATUS_STYLES[selected.status].text)}>{selected.status}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Txn Throughput', value: `${selected.txnThroughput}/mo` },
                      { label: 'Vendor Maturity', value: `${selected.vendorMaturity}/100` },
                      { label: 'AI Stabilization', value: `${selected.aiStabilization}%` },
                      { label: 'Liquidity', value: `${selected.liquidityScore}/100` },
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

        {/* Right Intelligence Panel */}
        <div className="space-y-2">
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <BarChart3 className="h-3 w-3 text-chart-2" />{overlayConfig.label} Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1">
              {[...visibleNodes].sort((a, b) => (b[overlayConfig.field] as number) - (a[overlayConfig.field] as number)).map((node, i) => {
                const val = node[overlayConfig.field] as number;
                const style = STATUS_STYLES[node.status];
                return (
                  <div key={node.id} className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-muted/5 rounded px-1" onClick={() => setSelectedNode(node.id)}>
                    <span className="text-[8px] font-bold text-primary tabular-nums w-4">#{i + 1}</span>
                    <span className="text-[9px] font-medium text-foreground flex-1 truncate">{node.name}</span>
                    <div className="w-16 h-1 rounded-full bg-muted/20 overflow-hidden">
                      <div className={cn("h-full rounded-full", val >= 75 ? "bg-chart-1" : val >= 50 ? "bg-chart-2" : "bg-chart-3")} style={{ width: `${val}%` }} />
                    </div>
                    <span className="text-[8px] tabular-nums text-foreground w-6 text-right">{val}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Activity className="h-3 w-3 text-chart-3" />Demand Migration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {[
                { from: 'Jakarta', to: 'Bali', volume: '+340 inquiries', dir: 'up' },
                { from: 'Singapore', to: 'Lombok', volume: '+85 inquiries', dir: 'up' },
                { from: 'Bangkok', to: 'Bali', volume: '+62 inquiries', dir: 'up' },
              ].map((flow, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[8px] text-muted-foreground">{flow.from}</span>
                  <ArrowUpRight className="h-2.5 w-2.5 text-chart-1" />
                  <span className="text-[8px] font-medium text-foreground">{flow.to}</span>
                  <span className="text-[7px] text-chart-1 ml-auto tabular-nums">{flow.volume}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                <Brain className="h-3 w-3 text-primary" />AI Pricing Stability
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {visibleNodes.filter(n => n.aiStabilization > 40).slice(0, 4).map(node => (
                <div key={node.id} className="flex items-center gap-2">
                  <span className="text-[9px] text-foreground w-20 truncate">{node.name}</span>
                  <div className="flex-1 h-1 rounded-full bg-muted/20 overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${node.aiStabilization}%` }} />
                  </div>
                  <span className="text-[8px] tabular-nums text-foreground w-6 text-right">{node.aiStabilization}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CivilizationMarketGrid;
