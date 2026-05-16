import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Globe, Brain, Shield, Network, Sparkles, TrendingUp, DollarSign, Home, Users, Landmark } from 'lucide-react';

const SCENES = [
  { title: 'Fragmented Historic Markets', subtitle: 'Centuries of isolated, opaque property transactions — $280T locked in friction', icon: Globe },
  { title: 'Intelligence-Driven Networks', subtitle: 'Data coordination connecting vendors, investors, and assets across borders', icon: Brain },
  { title: 'Autonomous Marketplace Activation', subtitle: 'Efficient ownership exchange emerges through AI-coordinated liquidity', icon: Network },
  { title: 'Stable Data-Coordinated Economies', subtitle: 'Cities adopt pricing intelligence and transaction velocity optimization', icon: TrendingUp },
  { title: 'Intergenerational Legacy', subtitle: 'ASTRA enabling intelligent access to property opportunities for future generations', icon: Sparkles },
];

const TIMELINE_MARKERS = [
  { year: '2024', event: 'Platform Genesis', desc: 'First intelligent property marketplace' },
  { year: '2026', event: 'Regional Intelligence', desc: '8+ markets with AI coordination' },
  { year: '2030', event: 'Continental Scale', desc: '50+ cities, autonomous pricing' },
  { year: '2040', event: 'Global Infrastructure', desc: 'Economic coordination layer' },
  { year: '2050+', event: 'Generational Platform', desc: 'Enduring property intelligence' },
];

const IMPACT_METRICS = [
  { icon: Home, label: 'Properties Coordinated', now: '12,400+', future: '10M+' },
  { icon: Users, label: 'Families Served', now: '8,200+', future: '50M+' },
  { icon: DollarSign, label: 'Capital Facilitated', now: '$2.4B', future: '$500B+' },
  { icon: Globe, label: 'Markets Connected', now: '8', future: '120+' },
  { icon: Landmark, label: 'Institutional Partners', now: '24', future: '2,000+' },
  { icon: Shield, label: 'Transaction Transparency', now: '78%', future: '99%+' },
];

const FounderIntergenerational = () => {
  const [scene, setScene] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => setScene(p => (p < 4 ? p + 1 : 0)), 12000);
    return () => clearInterval(t);
  }, [autoPlay]);

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Founder Intergenerational Impact Narrative</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-primary border-primary/20">CINEMATIC</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-5 text-[7px] px-2" onClick={() => setAutoPlay(!autoPlay)}>
            {autoPlay ? 'Pause' : 'Auto-Play'}
          </Button>
          <div className="flex items-center gap-1">
            {SCENES.map((_, i) => (
              <button key={i} onClick={() => { setScene(i); setAutoPlay(false); }} className={cn("h-1.5 rounded-full transition-all", scene === i ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30")} />
            ))}
          </div>
        </div>
      </div>

      {/* Scene Header */}
      <Card className="border-border/20">
        <CardContent className="p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {React.createElement(SCENES[scene].icon, { className: "h-3.5 w-3.5 text-primary" })}
            <div>
              <p className="text-[8px] text-primary uppercase tracking-wider">Scene {scene + 1} / 5</p>
              <p className="text-xs font-semibold text-foreground">{SCENES[scene].title}</p>
              <p className="text-[8px] text-muted-foreground">{SCENES[scene].subtitle}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-5 text-[8px] px-2" disabled={scene === 0} onClick={() => { setScene(s => s - 1); setAutoPlay(false); }}>Prev</Button>
            <Button variant="ghost" size="sm" className="h-5 text-[8px] px-2 gap-0.5" onClick={() => { setScene(s => s < 4 ? s + 1 : 0); setAutoPlay(false); }}>
              {scene < 4 ? 'Next' : 'Restart'}<ChevronRight className="h-2.5 w-2.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="border-border/20 overflow-hidden">
        <CardContent className="p-0 relative" style={{ minHeight: 380 }}>
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

          <AnimatePresence mode="wait">
            {scene === 0 && (
              <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.25, x: [(Math.random()-0.5)*8, (Math.random()-0.5)*8] }}
                      transition={{ delay: i * 0.05, duration: 5, repeat: Infinity, repeatType: 'reverse' }}
                      className="absolute rounded-full bg-destructive/20 border border-destructive/10"
                      style={{ left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%`, width: 3 + Math.random() * 6, height: 3 + Math.random() * 6 }}
                    />
                  ))}
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 0.7, y: 0 }} transition={{ delay: 0.5 }} className="text-3xl font-bold text-foreground/15 tabular-nums">$280T</motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }} className="text-[9px] text-muted-foreground mt-2">Global real estate — centuries of fragmented, opaque transactions</motion.p>
                </div>
              </motion.div>
            )}

            {scene === 1 && (
              <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="relative" style={{ width: '70%', height: '70%' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                    className="absolute flex flex-col items-center" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
                    <div className="relative h-6 w-6 rounded-full bg-primary/30 border-2 border-primary">
                      <motion.div className="absolute inset-0 rounded-full bg-primary/15" animate={{ scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
                    </div>
                    <span className="text-[8px] font-semibold text-primary mt-1">ASTRA CORE</span>
                  </motion.div>
                  {[{ l: 'Vendors', x: 15, y: 20 }, { l: 'Investors', x: 85, y: 20 }, { l: 'Properties', x: 15, y: 80 }, { l: 'Buyers', x: 85, y: 80 }, { l: 'Markets', x: 50, y: 8 }].map((n, i) => (
                    <React.Fragment key={n.l}>
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <motion.line x1="50%" y1="50%" x2={`${n.x}%`} y2={`${n.y}%`} stroke="hsl(var(--primary))" strokeWidth="0.8" strokeDasharray="3 5"
                          initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 0.5 + i * 0.15 }} />
                      </svg>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + i * 0.12 }}
                        className="absolute flex flex-col items-center" style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%,-50%)' }}>
                        <div className="h-3 w-3 rounded-full bg-chart-1/25 border border-chart-1/30" />
                        <span className="text-[6px] text-muted-foreground mt-0.5">{n.l}</span>
                      </motion.div>
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            )}

            {scene === 2 && (
              <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-6 max-w-md">
                  {['Discovery', 'Matching', 'Pricing', 'Settlement', 'Ownership', 'Growth'].map((stage, i) => (
                    <motion.div key={stage} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.2 }}
                      className="flex flex-col items-center gap-1">
                      <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-primary tabular-nums">{i + 1}</span>
                      </div>
                      <span className="text-[7px] text-foreground">{stage}</span>
                      {i < 5 && <motion.div className="h-3 w-0.5 bg-primary/10" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.5 + i * 0.2 }} />}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {scene === 3 && (
              <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-lg space-y-2">
                  {IMPACT_METRICS.map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.15 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/20 bg-card/30">
                      <m.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-[9px] text-foreground flex-1">{m.label}</span>
                      <span className="text-[8px] text-muted-foreground tabular-nums">{m.now}</span>
                      <span className="text-[7px] text-muted-foreground">→</span>
                      <span className="text-[9px] font-semibold text-chart-1 tabular-nums">{m.future}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {scene === 4 && (
              <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-lg px-4">
                  <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                    ASTRA enabling intelligent access to property opportunities for future generations.
                  </motion.p>
                  {/* Timeline */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="flex items-center justify-between mt-8 px-4">
                    {TIMELINE_MARKERS.map((m, i) => (
                      <div key={m.year} className="text-center">
                        <p className="text-sm font-bold text-primary tabular-nums">{m.year}</p>
                        <p className="text-[7px] text-foreground mt-0.5">{m.event}</p>
                        <p className="text-[6px] text-muted-foreground">{m.desc}</p>
                      </div>
                    ))}
                  </motion.div>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="text-[8px] text-muted-foreground mt-8">
                    Building enduring economic systems — one generation at a time.
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

export default FounderIntergenerational;
