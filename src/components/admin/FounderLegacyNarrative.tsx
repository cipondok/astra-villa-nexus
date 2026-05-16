import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Globe, Zap, Brain, Shield, Network, Sparkles } from 'lucide-react';

const SCENES = [
  { title: 'Fragmented Ecosystem', subtitle: 'Global property markets — disconnected, opaque, inaccessible' },
  { title: 'Intelligence Emergence', subtitle: 'ASTRA connecting stakeholders through data coordination' },
  { title: 'Regional Clusters Form', subtitle: 'Autonomous marketplaces creating economic micro-systems' },
  { title: 'Transaction Infrastructure', subtitle: 'Platform becomes foundational coordination layer' },
  { title: 'Generational Legacy', subtitle: 'ASTRA enabling intelligent property economies for future generations' },
];

const FRAGMENTED = Array.from({ length: 18 }, (_, i) => ({ x: 8 + Math.random() * 84, y: 10 + Math.random() * 80, s: 3 + Math.random() * 5 }));

const CLUSTERS = [
  { name: 'SEA Cluster', x: 35, y: 42, size: 16, nodes: [{ dx: -8, dy: -5 }, { dx: 6, dy: -8 }, { dx: -5, dy: 8 }, { dx: 8, dy: 5 }] },
  { name: 'ME Cluster', x: 52, y: 28, size: 12, nodes: [{ dx: -6, dy: -4 }, { dx: 5, dy: 4 }, { dx: -4, dy: 6 }] },
  { name: 'EU Cluster', x: 45, y: 14, size: 10, nodes: [{ dx: -5, dy: -3 }, { dx: 4, dy: 5 }] },
];

const FounderLegacyNarrative = () => {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setScene(p => (p < 4 ? p + 1 : 0)), 9000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Founder Legacy Narrative</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-primary border-primary/20">VISION</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          {SCENES.map((_, i) => (
            <button key={i} onClick={() => setScene(i)} className={cn("h-1.5 rounded-full transition-all", scene === i ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30")} />
          ))}
        </div>
      </div>

      {/* Scene label */}
      <Card className="border-border/20">
        <CardContent className="p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[8px] text-primary uppercase tracking-wider">Scene {scene + 1} / 5</p>
            <p className="text-xs font-semibold text-foreground">{SCENES[scene].title}</p>
            <p className="text-[8px] text-muted-foreground">{SCENES[scene].subtitle}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-5 text-[8px] px-2" disabled={scene === 0} onClick={() => setScene(s => s - 1)}>Prev</Button>
            <Button variant="ghost" size="sm" className="h-5 text-[8px] px-2 gap-0.5" onClick={() => setScene(s => s < 4 ? s + 1 : 0)}>
              {scene < 4 ? 'Next' : 'Restart'}<ChevronRight className="h-2.5 w-2.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="border-border/20 overflow-hidden">
        <CardContent className="p-0 relative" style={{ minHeight: 400 }}>
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          <AnimatePresence mode="wait">
            {scene === 0 && (
              <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                {FRAGMENTED.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.35, x: [0, (Math.random() - 0.5) * 8, 0], y: [0, (Math.random() - 0.5) * 8, 0] }}
                    transition={{ delay: i * 0.04, duration: 5, repeat: Infinity }}
                    className="absolute rounded-full bg-destructive/30 border border-destructive/15"
                    style={{ left: `${n.x}%`, top: `${n.y}%`, width: n.s, height: n.s }}
                  />
                ))}
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <p className="text-[9px] text-muted-foreground">$280T global real estate — fragmented across 195 nations</p>
                </div>
              </motion.div>
            )}

            {scene === 1 && (
              <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full max-w-md h-64">
                  {/* Center hub */}
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="absolute flex flex-col items-center" style={{ left: '50%', top: '45%', transform: 'translate(-50%,-50%)' }}>
                    <div className="h-5 w-5 rounded-full bg-primary/30 border-2 border-primary">
                      <motion.div className="absolute inset-0 rounded-full bg-primary/20" animate={{ scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
                    </div>
                    <span className="text-[7px] font-semibold text-primary mt-1">ASTRA</span>
                  </motion.div>
                  {/* Spokes */}
                  {[
                    { label: 'Vendors', x: 20, y: 25 }, { label: 'Investors', x: 80, y: 25 },
                    { label: 'Properties', x: 20, y: 70 }, { label: 'Markets', x: 80, y: 70 },
                    { label: 'Agents', x: 50, y: 15 }, { label: 'Buyers', x: 50, y: 82 },
                  ].map((spoke, i) => (
                    <React.Fragment key={spoke.label}>
                      <motion.svg className="absolute inset-0 w-full h-full pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 0.5 + i * 0.1 }}>
                        <line x1="50%" y1="45%" x2={`${spoke.x}%`} y2={`${spoke.y}%`} stroke="hsl(var(--primary))" strokeWidth="1" />
                      </motion.svg>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + i * 0.12 }} className="absolute flex flex-col items-center" style={{ left: `${spoke.x}%`, top: `${spoke.y}%`, transform: 'translate(-50%,-50%)' }}>
                        <div className="h-2.5 w-2.5 rounded-full bg-chart-1/30 border border-chart-1/40" />
                        <span className="text-[6px] text-muted-foreground mt-0.5">{spoke.label}</span>
                      </motion.div>
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            )}

            {scene === 2 && (
              <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                {CLUSTERS.map((cluster, ci) => (
                  <React.Fragment key={cluster.name}>
                    {/* Cluster center */}
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: ci * 0.4 }} className="absolute flex flex-col items-center" style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }}>
                      <div className="rounded-full bg-primary/25 border-2 border-primary" style={{ width: cluster.size, height: cluster.size }}>
                        <motion.div className="absolute inset-0 rounded-full bg-primary/15" animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: ci * 0.5 }} />
                      </div>
                      <span className="text-[6px] font-medium text-foreground mt-0.5">{cluster.name}</span>
                    </motion.div>
                    {/* Satellite nodes */}
                    {cluster.nodes.map((n, ni) => (
                      <React.Fragment key={ni}>
                        <motion.svg className="absolute inset-0 w-full h-full pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ delay: ci * 0.4 + 0.3 + ni * 0.1 }}>
                          <line x1={`${cluster.x}%`} y1={`${cluster.y}%`} x2={`${cluster.x + n.dx}%`} y2={`${cluster.y + n.dy}%`} stroke="hsl(var(--chart-1))" strokeWidth="0.5" />
                        </motion.svg>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: ci * 0.4 + 0.4 + ni * 0.1 }} className="absolute h-2 w-2 rounded-full bg-chart-1/25 border border-chart-1/20" style={{ left: `${cluster.x + n.dx}%`, top: `${cluster.y + n.dy}%` }} />
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
                {/* Inter-cluster connections */}
                <motion.svg className="absolute inset-0 w-full h-full pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} transition={{ delay: 1.5 }}>
                  {CLUSTERS.slice(0, -1).map((c, i) => (
                    <line key={i} x1={`${c.x}%`} y1={`${c.y}%`} x2={`${CLUSTERS[i + 1].x}%`} y2={`${CLUSTERS[i + 1].y}%`} stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="4 4" />
                  ))}
                </motion.svg>
              </motion.div>
            )}

            {scene === 3 && (
              <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-sm space-y-2.5">
                  {[
                    { icon: Globe, label: 'Cross-border transaction routing', val: '24+ markets' },
                    { icon: Brain, label: 'Autonomous pricing intelligence', val: '94% accuracy' },
                    { icon: Shield, label: 'Regulatory compliance engine', val: '12 jurisdictions' },
                    { icon: Zap, label: 'Real-time settlement orchestration', val: '<48h average' },
                    { icon: Network, label: 'Ecosystem coordination layer', val: '613 vendors' },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.2 }} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/20 bg-card/30">
                      <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-[9px] text-foreground flex-1">{item.label}</span>
                      <span className="text-[9px] font-semibold text-chart-1 tabular-nums">{item.val}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {scene === 4 && (
              <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-lg px-4">
                  <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                    ASTRA enabling intelligent property economies for future generations.
                  </motion.p>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="flex items-center justify-center gap-6 mt-8">
                    {[
                      { label: 'Generations Served', value: '3+' },
                      { label: 'Economies Connected', value: '24+' },
                      { label: 'Capital Coordinated', value: 'Rp 12.8T' },
                    ].map(m => (
                      <div key={m.label} className="text-center">
                        <p className="text-xl font-bold text-primary tabular-nums">{m.value}</p>
                        <p className="text-[7px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
                      </div>
                    ))}
                  </motion.div>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="text-[8px] text-muted-foreground mt-8">
                    Building generational infrastructure — one intelligent transaction at a time.
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

export default FounderLegacyNarrative;
