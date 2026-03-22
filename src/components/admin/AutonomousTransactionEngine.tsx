import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowRight, Zap, TrendingUp, CheckCircle, Play, Brain,
  DollarSign, Clock, Activity, Radio, Globe, Settings2
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Pipeline ─── */
interface FlowStage {
  id: string;
  label: string;
  deals: number;
  aiIntervention: number;
  latencyReduction: number;
  revenueThroughput: number;
  color: string;
}

const STAGES: FlowStage[] = [
  { id: 'signal', label: 'Lead Signal Detection', deals: 2840, aiIntervention: 94, latencyReduction: 82, revenueThroughput: 18.4, color: 'chart-1' },
  { id: 'allocate', label: 'Vendor Allocation', deals: 1920, aiIntervention: 87, latencyReduction: 76, revenueThroughput: 14.2, color: 'chart-2' },
  { id: 'pricing', label: 'Dynamic Pricing', deals: 1640, aiIntervention: 92, latencyReduction: 88, revenueThroughput: 12.8, color: 'chart-3' },
  { id: 'negotiate', label: 'Negotiation Accel.', deals: 980, aiIntervention: 68, latencyReduction: 54, revenueThroughput: 8.4, color: 'chart-4' },
  { id: 'booking', label: 'Booking Confirmation', deals: 720, aiIntervention: 82, latencyReduction: 72, revenueThroughput: 6.2, color: 'chart-5' },
  { id: 'settle', label: 'Settlement Orchestration', deals: 640, aiIntervention: 78, latencyReduction: 68, revenueThroughput: 5.8, color: 'primary' },
];

const LIVE_EVENTS = [
  { region: 'Bali', type: 'Pricing optimized', detail: 'Villa Canggu — Rp 4.2B → Rp 3.9B', time: '2s ago' },
  { region: 'Jakarta', type: 'Lead matched', detail: 'Investor #4821 → Commercial unit', time: '5s ago' },
  { region: 'Bali', type: 'Deal closed', detail: 'Beachfront villa — Rp 8.7B settled', time: '12s ago' },
  { region: 'Lombok', type: 'Vendor allocated', detail: 'Agent K.Wira → 3 premium leads', time: '18s ago' },
  { region: 'Surabaya', type: 'Booking confirmed', detail: 'Apartment unit #127 — Rp 1.2B', time: '24s ago' },
  { region: 'Bali', type: 'Pricing optimized', detail: 'Penthouse Seminyak — adjusted +5%', time: '31s ago' },
  { region: 'Jakarta', type: 'Negotiation assist', detail: 'Counter-offer suggested Rp 3.4B', time: '38s ago' },
  { region: 'Bali', type: 'Lead matched', detail: 'Family buyer → Ubud compound', time: '45s ago' },
];

const BATCH_ACTIONS = [
  { label: 'Optimize 1,200 listings globally', desc: 'AI price recalibration across all active markets', icon: Zap, impact: '+Rp 4.2B projected unlock' },
  { label: 'Activate demand-response pricing', desc: 'Dynamic model for high-demand zones', icon: TrendingUp, impact: '+18% conversion rate' },
  { label: 'Auto-allocate idle vendor capacity', desc: '34 agents with available slots matched to hot leads', icon: Activity, impact: '+120 deals/week' },
  { label: 'Accelerate stalled negotiations', desc: '28 deals >72h with AI counter-offer generation', icon: Brain, impact: 'Unblock Rp 12.4B pipeline' },
];

const AutonomousTransactionEngine = () => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [tickerOffset, setTickerOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTickerOffset(p => (p + 1) % LIVE_EVENTS.length), 3000);
    return () => clearInterval(interval);
  }, []);

  const totalDeals = STAGES.reduce((s, st) => s + st.deals, 0);
  const totalRevenue = STAGES.reduce((s, st) => s + st.revenueThroughput, 0);
  const avgAI = Math.round(STAGES.reduce((s, st) => s + st.aiIntervention, 0) / STAGES.length);

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Autonomous Transaction Engine</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">LIVE</Badge>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
          <span>Pipeline: <strong className="text-foreground">{totalDeals.toLocaleString()}</strong> deals</span>
          <span>Revenue: <strong className="text-foreground">Rp {totalRevenue.toFixed(1)}B</strong></span>
          <span>AI: <strong className="text-foreground">{avgAI}%</strong></span>
        </div>
      </div>

      {/* Flow Pipeline */}
      <Card className="border-border/20">
        <CardContent className="p-3">
          <div className="flex items-center gap-1">
            {STAGES.map((stage, i) => {
              const isSelected = selectedStage === stage.id;
              return (
                <React.Fragment key={stage.id}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                    className={cn(
                      "flex-1 rounded-lg border transition-all p-2 text-left",
                      isSelected ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "border-border/20 bg-card/50 hover:border-border/40"
                    )}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className={cn("h-1.5 w-1.5 rounded-full", `bg-${stage.color}`)} />
                      <span className="text-[7px] font-medium text-foreground truncate">{stage.label}</span>
                    </div>
                    <p className="text-lg font-bold text-foreground tabular-nums leading-none">{stage.deals.toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[6px] text-muted-foreground">AI {stage.aiIntervention}%</span>
                      <span className="text-[6px] text-chart-1">-{stage.latencyReduction}% latency</span>
                    </div>
                    <div className="h-0.5 rounded-full bg-muted/20 mt-1 overflow-hidden">
                      <div className={cn("h-full rounded-full", `bg-${stage.color}`)} style={{ width: `${stage.aiIntervention}%` }} />
                    </div>
                  </motion.button>
                  {i < STAGES.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/20 shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>

          {selectedStage && (() => {
            const stage = STAGES.find(s => s.id === selectedStage)!;
            return (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 p-2 rounded-lg border border-primary/20 bg-primary/5">
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center"><p className="text-[6px] text-muted-foreground">Deal Volume</p><p className="text-[11px] font-bold text-foreground tabular-nums">{stage.deals.toLocaleString()}</p></div>
                  <div className="text-center"><p className="text-[6px] text-muted-foreground">AI Intervention</p><p className="text-[11px] font-bold text-foreground tabular-nums">{stage.aiIntervention}%</p></div>
                  <div className="text-center"><p className="text-[6px] text-muted-foreground">Latency Reduction</p><p className="text-[11px] font-bold text-chart-1 tabular-nums">-{stage.latencyReduction}%</p></div>
                  <div className="text-center"><p className="text-[6px] text-muted-foreground">Revenue</p><p className="text-[11px] font-bold text-foreground tabular-nums">Rp {stage.revenueThroughput}B</p></div>
                </div>
              </motion.div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Live Activity Ribbon */}
      <Card className="border-border/20 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/10">
            <span className="h-1.5 w-1.5 rounded-full bg-chart-1 animate-pulse" />
            <span className="text-[8px] font-medium text-foreground">Live Transaction Stream</span>
            <Badge variant="outline" className="text-[6px] h-3 ml-auto">{LIVE_EVENTS.length} events</Badge>
          </div>
          <div className="px-3 py-1 overflow-hidden" style={{ maxHeight: 120 }}>
            {LIVE_EVENTS.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: i < 5 ? 1 : 0.4, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 py-1"
              >
                <Badge variant="outline" className="text-[5px] h-3 px-1 w-14 justify-center shrink-0">{event.region}</Badge>
                <span className="text-[8px] font-medium text-foreground w-28 shrink-0">{event.type}</span>
                <span className="text-[7px] text-muted-foreground flex-1 truncate">{event.detail}</span>
                <span className="text-[6px] text-muted-foreground shrink-0">{event.time}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Batch Execution Controls */}
      <Card className="border-border/20">
        <CardHeader className="p-2.5 pb-1.5">
          <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
            <Settings2 className="h-3 w-3 text-primary" />Batch Execution Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-2">
          {BATCH_ACTIONS.map((action, i) => (
            <div key={i} className="flex items-start gap-2 px-2.5 py-2 rounded-lg border border-border/20 bg-card/50">
              <action.icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-medium text-foreground">{action.label}</p>
                <p className="text-[7px] text-muted-foreground mt-0.5">{action.desc}</p>
                <Badge variant="outline" className="text-[6px] h-3 mt-1 text-chart-1 border-chart-1/20">{action.impact}</Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-5 text-[7px] px-1.5 shrink-0" onClick={() => toast.success(`${action.label} — triggered`)}>
                <Play className="h-2 w-2 mr-0.5" />Execute
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutonomousTransactionEngine;
