import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Globe, Brain, Network, Sparkles, TrendingUp, DollarSign, Home, Users, Landmark, Shield, Zap } from 'lucide-react';

const PHASES = [
  { title: 'Fragmented Transaction Systems', subtitle: 'Centuries of opaque, disconnected property markets — $280T locked behind friction', icon: Globe, year: '2024' },
  { title: 'Intelligence-Driven Coordination', subtitle: 'Data networks connecting vendors, investors, and assets across borders in real-time', icon: Brain, year: '2026' },
  { title: 'Autonomous Transaction Ecosystems', subtitle: 'Self-optimizing marketplaces with AI pricing, liquidity matching, and settlement acceleration', icon: Network, year: '2032' },
  { title: 'Stabilized Global Liquidity Networks', subtitle: 'Cross-border property economies coordinated through predictive intelligence infrastructure', icon: TrendingUp, year: '2045' },
  { title: 'Generational Legacy', subtitle: 'ASTRA contributing to intelligent economic opportunity access across generations', icon: Sparkles, year: '2124' },
];

const MILESTONES = [
  { year: '2024', label: 'Platform Genesis', metrics: '12K properties · 8 markets' },
  { year: '2026', label: 'Regional Intelligence', metrics: '120K properties · 25 markets' },
  { year: '2030', label: 'Continental Scale', metrics: '1.2M properties · 80 markets' },
  { year: '2040', label: 'Global Infrastructure', metrics: '15M properties · 200+ markets' },
  { year: '2050', label: 'Economic Coordination', metrics: '50M+ properties · planetary' },
  { year: '2075', label: 'Civilizational Integration', metrics: 'Autonomous property economies' },
  { year: '2124', label: 'Century Legacy', metrics: 'Generational wealth infrastructure' },
];

const IMPACT = [
  { icon: Home, label: 'Properties Coordinated', phases: ['12K', '120K', '1.2M', '15M', '50M+'] },
  { icon: Users, label: 'Families Empowered', phases: ['8K', '95K', '1M', '12M', '100M+'] },
  { icon: DollarSign, label: 'Capital Facilitated', phases: ['$2B', '$25B', '$180B', '$2T', '$15T+'] },
  { icon: Globe, label: 'Markets Connected', phases: ['8', '25', '80', '200', '500+'] },
  { icon: Landmark, label: 'Institutional Partners', phases: ['24', '250', '2K', '15K', '50K+'] },
  { icon: Shield, label: 'Transaction Transparency', phases: ['72%', '85%', '94%', '98%', '99.5%'] },
];

const Founder100YearLegacy = () => {
  const [phase, setPhase] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => setPhase(p => (p < 4 ? p + 1 : 0)), 14000);
    return () => clearInterval(t);
  }, [autoPlay]);

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Founder 100-Year Strategic Legacy</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-primary border-primary/20">CINEMATIC</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-5 text-[7px] px-2" onClick={() => setAutoPlay(!autoPlay)}>
            {autoPlay ? 'Pause' : 'Auto-Play'}
          </Button>
          <div className="flex items-center gap-1">
            {PHASES.map((_, i) => (
              <button key={i} onClick={() => { setPhase(i); setAutoPlay(false); }} className={cn("h-1.5 rounded-full transition-all", phase === i ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30")} />
            ))}
          </div>
        </div>
      </div>

      {/* Phase Header */}
      <Card className="border-border/20">
        <CardContent className="p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {React.createElement(PHASES[phase].icon, { className: "h-3.5 w-3.5 text-primary" })}
            <div>
              <p className="text-[8px] text-primary uppercase tracking-wider">Phase {phase + 1} / 5 — {PHASES[phase].year}</p>
              <p className="text-xs font-semibold text-foreground">{PHASES[phase].title}</p>
              <p className="text-[8px] text-muted-foreground">{PHASES[phase].subtitle}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-5 text-[8px] px-2" disabled={phase === 0} onClick={() => { setPhase(s => s - 1); setAutoPlay(false); }}>Prev</Button>
            <Button variant="ghost" size="sm" className="h-5 text-[8px] px-2 gap-0.5" onClick={() => { setPhase(s => s < 4 ? s + 1 : 0); setAutoPlay(false); }}>
              {phase < 4 ? 'Next' : 'Restart'}<ChevronRight className="h-2.5 w-2.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="border-border/20 overflow-hidden">
        <CardContent className="p-0 relative" style={{ minHeight: 360 }}>
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div key="p0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="text-center relative" style={{ width: '80%', height: '80%' }}>
                  {Array.from({ length: 25 }).map((_, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.2, x: [(Math.random()-0.5)*6, (Math.random()-0.5)*6] }}
                      transition={{ delay: i * 0.04, duration: 5, repeat: Infinity, repeatType: 'reverse' }}
                      className="absolute rounded-full bg-destructive/20 border border-destructive/10"
                      style={{ left: `${8 + Math.random() * 84}%`, top: `${8 + Math.random() * 84}%`, width: 2 + Math.random() * 5, height: 2 + Math.random() * 5 }} />
                  ))}
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 0.6, y: 0 }} transition={{ delay: 0.5 }} className="text-3xl font-bold text-foreground/15 tabular-nums absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>$280T</motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }} className="text-[9px] text-muted-foreground absolute" style={{ left: '50%', top: '62%', transform: 'translateX(-50%)' }}>Global real estate — centuries of fragmented transactions</motion.p>
                </div>
              </motion.div>
            )}

            {phase === 1 && (
              <motion.div key="p1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="relative" style={{ width: '70%', height: '70%' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                    className="absolute flex flex-col items-center" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
                    <div className="relative h-8 w-8 rounded-full bg-primary/30 border-2 border-primary">
                      <motion.div className="absolute inset-0 rounded-full bg-primary/15" animate={{ scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
                    </div>
                    <span className="text-[8px] font-semibold text-primary mt-1">ASTRA INTELLIGENCE</span>
                  </motion.div>
                  {[{ l: 'Vendors', x: 15, y: 20 }, { l: 'Investors', x: 85, y: 20 }, { l: 'Properties', x: 15, y: 80 }, { l: 'Markets', x: 85, y: 80 }].map((n, i) => (
                    <React.Fragment key={n.l}>
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <motion.line x1="50%" y1="50%" x2={`${n.x}%`} y2={`${n.y}%`} stroke="hsl(var(--primary))" strokeWidth="0.8" strokeDasharray="3 5"
                          initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 0.5 + i * 0.15 }} />
                      </svg>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + i * 0.12 }}
                        className="absolute flex flex-col items-center" style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%,-50%)' }}>
                        <div className="h-4 w-4 rounded-full bg-chart-1/25 border border-chart-1/30" />
                        <span className="text-[7px] text-muted-foreground mt-0.5">{n.l}</span>
                      </motion.div>
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 2 && (
              <motion.div key="p2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-6 max-w-md">
                  {['Discovery', 'Pricing', 'Matching', 'Settlement', 'Ownership', 'Growth'].map((stage, i) => (
                    <motion.div key={stage} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.15 }}
                      className="flex flex-col items-center gap-1">
                      <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Zap className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-[7px] font-medium text-foreground">{stage}</span>
                      <span className="text-[6px] text-chart-1">Autonomous</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 3 && (
              <motion.div key="p3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-lg space-y-2 px-4">
                  {IMPACT.map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.12 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/20 bg-card/30">
                      <m.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-[9px] text-foreground flex-1">{m.label}</span>
                      <span className="text-[7px] text-muted-foreground tabular-nums">{m.phases[0]}</span>
                      <span className="text-[6px] text-muted-foreground">→</span>
                      <span className="text-[8px] text-chart-2 tabular-nums">{m.phases[2]}</span>
                      <span className="text-[6px] text-muted-foreground">→</span>
                      <span className="text-[9px] font-semibold text-chart-1 tabular-nums">{m.phases[4]}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 4 && (
              <motion.div key="p4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-lg px-4">
                  <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                    ASTRA contributing to intelligent economic opportunity access across generations.
                  </motion.p>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="flex items-center justify-between mt-8 px-2 gap-1">
                    {MILESTONES.map(m => (
                      <div key={m.year} className="text-center flex-1">
                        <p className="text-xs font-bold text-primary tabular-nums">{m.year}</p>
                        <p className="text-[6px] text-foreground mt-0.5">{m.label}</p>
                        <p className="text-[5px] text-muted-foreground">{m.metrics}</p>
                      </div>
                    ))}
                  </motion.div>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="text-[8px] text-muted-foreground mt-8">
                    Building enduring economic systems — one century at a time.
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

export default Founder100YearLegacy;
