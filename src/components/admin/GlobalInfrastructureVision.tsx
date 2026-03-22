import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronRight, Globe, Zap, Brain, TrendingUp, Activity, Shield, DollarSign, Network } from 'lucide-react';

/* ─── Phase definitions ─── */
const PHASES = [
  { title: 'Fragmented Global Markets', subtitle: 'Current state — disconnected, opaque, inefficient' },
  { title: 'ASTRA Intelligence Grid', subtitle: 'Connecting ecosystems through data coordination' },
  { title: 'Autonomous Transaction Flows', subtitle: 'Self-organizing deal networks across continents' },
  { title: 'Predictive Optimization', subtitle: 'Pricing and liquidity intelligence stabilizing markets' },
  { title: 'Economic Infrastructure', subtitle: 'ASTRA enabling intelligent real estate economies worldwide' },
];

const FRAGMENTED_NODES = Array.from({ length: 16 }, (_, i) => ({
  x: 10 + Math.random() * 80,
  y: 15 + Math.random() * 70,
  size: 4 + Math.random() * 6,
}));

const CONNECTED_HUBS = [
  { name: 'SEA Hub', x: 35, y: 42, size: 14 },
  { name: 'ME Hub', x: 50, y: 28, size: 10 },
  { name: 'EU Hub', x: 45, y: 16, size: 10 },
  { name: 'ANZ Hub', x: 58, y: 68, size: 8 },
  { name: 'ASTRA Core', x: 42, y: 38, size: 18 },
];

const FLOW_PATHS = [
  { from: { x: 42, y: 38 }, to: { x: 35, y: 42 } },
  { from: { x: 42, y: 38 }, to: { x: 50, y: 28 } },
  { from: { x: 42, y: 38 }, to: { x: 45, y: 16 } },
  { from: { x: 42, y: 38 }, to: { x: 58, y: 68 } },
  { from: { x: 35, y: 42 }, to: { x: 50, y: 28 } },
  { from: { x: 50, y: 28 }, to: { x: 45, y: 16 } },
];

const MARKET_STATS = [
  { label: 'Markets Connected', value: '24+' },
  { label: 'GMV Coordinated', value: 'Rp 12.8T' },
  { label: 'AI Predictions', value: '142K+' },
  { label: 'Economies Stabilized', value: '8' },
];

interface Props {
  embedded?: boolean; // inline mode for registry
}

const GlobalInfrastructureVision = ({ embedded = true }: Props) => {
  const [phase, setPhase] = useState(0);

  // Auto-advance when not embedded full-screen
  useEffect(() => {
    if (!embedded) return;
    const timer = setInterval(() => setPhase(p => (p < 4 ? p + 1 : 0)), 8000);
    return () => clearInterval(timer);
  }, [embedded]);

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Global Infrastructure Vision</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-primary border-primary/20">VISIONARY</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          {PHASES.map((_, i) => (
            <button
              key={i}
              onClick={() => setPhase(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                phase === i ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Phase label */}
      <Card className="border-border/20">
        <CardContent className="p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-primary uppercase tracking-wider">Phase {phase + 1} of 5</p>
            <p className="text-xs font-semibold text-foreground">{PHASES[phase].title}</p>
            <p className="text-[8px] text-muted-foreground">{PHASES[phase].subtitle}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-5 text-[8px] px-2" disabled={phase === 0} onClick={() => setPhase(p => p - 1)}>Prev</Button>
            <Button variant="ghost" size="sm" className="h-5 text-[8px] px-2 gap-0.5" onClick={() => setPhase(p => p < 4 ? p + 1 : 0)}>
              {phase < 4 ? 'Next' : 'Restart'}<ChevronRight className="h-2.5 w-2.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Canvas */}
      <Card className="border-border/20 overflow-hidden">
        <CardContent className="p-0 relative" style={{ minHeight: 380 }}>
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          <AnimatePresence mode="wait">
            {/* Phase 0: Fragmented */}
            {phase === 0 && (
              <motion.div key="p0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0">
                {FRAGMENTED_NODES.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4, x: [0, (Math.random() - 0.5) * 6, 0], y: [0, (Math.random() - 0.5) * 6, 0] }}
                    transition={{ delay: i * 0.05, duration: 4, repeat: Infinity }}
                    className="absolute rounded-full bg-destructive/30 border border-destructive/15"
                    style={{ left: `${n.x}%`, top: `${n.y}%`, width: n.size, height: n.size }}
                  />
                ))}
                <div className="absolute bottom-6 left-0 right-0 text-center">
                  <p className="text-[9px] text-muted-foreground">$280T global real estate — disconnected, opaque, inefficient</p>
                </div>
              </motion.div>
            )}

            {/* Phase 1: Intelligence Grid */}
            {phase === 1 && (
              <motion.div key="p1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0">
                <svg className="absolute inset-0 w-full h-full">
                  {FLOW_PATHS.map((path, i) => (
                    <motion.line
                      key={i}
                      x1={`${path.from.x}%`} y1={`${path.from.y}%`}
                      x2={`${path.to.x}%`} y2={`${path.to.y}%`}
                      stroke="hsl(var(--primary))"
                      strokeWidth="1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                    />
                  ))}
                </svg>
                {CONNECTED_HUBS.map((hub, i) => (
                  <motion.div
                    key={hub.name}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.15, type: 'spring' }}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
                  >
                    <div className={cn("rounded-full border-2", hub.name === 'ASTRA Core' ? "bg-primary/30 border-primary" : "bg-chart-1/20 border-chart-1/30")} style={{ width: hub.size, height: hub.size }}>
                      {hub.name === 'ASTRA Core' && (
                        <motion.div className="absolute inset-0 rounded-full bg-primary/20" animate={{ scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
                      )}
                    </div>
                    <span className="text-[6px] text-foreground font-medium mt-0.5">{hub.name}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Phase 2: Autonomous Flows */}
            {phase === 2 && (
              <motion.div key="p2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-sm space-y-2">
                  {[
                    { label: 'Cross-border deal routing', value: '4,200 deals/mo', icon: Globe },
                    { label: 'Automated price optimization', value: '12,847 listings', icon: Zap },
                    { label: 'Predictive lead matching', value: '87% accuracy', icon: Brain },
                    { label: 'Capital flow coordination', value: 'Rp 2.4T directed', icon: DollarSign },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.25 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/20 bg-card/30"
                    >
                      <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-[9px] text-foreground flex-1">{item.label}</span>
                      <span className="text-[9px] font-semibold text-chart-1 tabular-nums">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Phase 3: Predictive Optimization */}
            {phase === 3 && (
              <motion.div key="p3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
                    <Shield className="h-10 w-10 text-primary mx-auto mb-4 opacity-60" />
                  </motion.div>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-lg font-bold text-foreground">
                    Market Stabilization Active
                  </motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-[10px] text-muted-foreground mt-2">
                    Predictive pricing intelligence and liquidity optimization reducing market volatility by 34% across connected economies.
                  </motion.p>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="flex items-center justify-center gap-4 mt-6">
                    {[
                      { label: 'Volatility Reduction', value: '-34%' },
                      { label: 'Price Accuracy', value: '94%' },
                      { label: 'Liquidity Depth', value: '+2.8x' },
                    ].map(m => (
                      <div key={m.label} className="text-center">
                        <p className="text-lg font-bold text-primary tabular-nums">{m.value}</p>
                        <p className="text-[7px] text-muted-foreground uppercase">{m.label}</p>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Phase 4: Final Vision */}
            {phase === 4 && (
              <motion.div key="p4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-lg">
                  <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                    ASTRA enabling intelligent real estate economies worldwide.
                  </motion.p>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="flex items-center justify-center gap-5 mt-6">
                    {MARKET_STATS.map(m => (
                      <div key={m.label} className="text-center">
                        <p className="text-lg font-bold text-primary tabular-nums">{m.value}</p>
                        <p className="text-[7px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
                      </div>
                    ))}
                  </motion.div>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="text-[8px] text-muted-foreground mt-6">
                    Foundational infrastructure for the future of property economies.
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalInfrastructureVision;
