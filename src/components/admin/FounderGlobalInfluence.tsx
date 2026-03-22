import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Globe, Zap, Brain, Shield, Network, Sparkles, TrendingUp, DollarSign, Users } from 'lucide-react';

const SCENES = [
  { title: 'Fragmented Markets', subtitle: 'Disconnected regional transaction networks — $280T in isolated silos', icon: Globe },
  { title: 'Intelligence Layer Emergence', subtitle: 'ASTRA connecting vendors, investors, and assets through data coordination', icon: Brain },
  { title: 'Coordinated Economic Activity', subtitle: 'Transaction flows synchronize across continents in real-time', icon: Network },
  { title: 'Strategic Influence', subtitle: 'Cities adopt data-driven pricing and liquidity optimization models', icon: TrendingUp },
  { title: 'Legacy Statement', subtitle: 'ASTRA enabling coordinated real estate economies worldwide', icon: Sparkles },
];

const NODES = Array.from({ length: 22 }, (_, i) => ({
  x: 8 + Math.random() * 84,
  y: 8 + Math.random() * 84,
  s: 2 + Math.random() * 5,
}));

const COORD_CITIES = [
  { name: 'Bali', x: 34, y: 48, score: 94 },
  { name: 'Jakarta', x: 26, y: 55, score: 82 },
  { name: 'Dubai', x: 52, y: 28, score: 78 },
  { name: 'Singapore', x: 38, y: 54, score: 88 },
  { name: 'Bangkok', x: 42, y: 36, score: 65 },
  { name: 'Sydney', x: 64, y: 72, score: 72 },
  { name: 'London', x: 44, y: 14, score: 58 },
  { name: 'Makassar', x: 30, y: 62, score: 42 },
];

const INFRA_ITEMS = [
  { icon: Globe, label: 'Cross-border transaction routing', val: '24+ markets' },
  { icon: Brain, label: 'Autonomous pricing intelligence', val: '94% accuracy' },
  { icon: Shield, label: 'Regulatory compliance engine', val: '12 jurisdictions' },
  { icon: Zap, label: 'Real-time settlement orchestration', val: '<48h average' },
  { icon: Network, label: 'Ecosystem coordination layer', val: '613 vendors' },
  { icon: DollarSign, label: 'Capital allocation intelligence', val: '$54B influenced' },
];

const FounderGlobalInfluence = () => {
  const [scene, setScene] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => setScene(p => (p < 4 ? p + 1 : 0)), 10000);
    return () => clearInterval(t);
  }, [autoPlay]);

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Founder Global Influence Narrative</h2>
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

      {/* Scene indicator */}
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
        <CardContent className="p-0 relative" style={{ minHeight: 420 }}>
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

          <AnimatePresence mode="wait">
            {/* Scene 0: Fragmented Markets */}
            {scene === 0 && (
              <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                {NODES.map((n, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.35, x: [(Math.random()-0.5)*6, (Math.random()-0.5)*6], y: [(Math.random()-0.5)*6, (Math.random()-0.5)*6] }}
                    transition={{ delay: i * 0.04, duration: 6, repeat: Infinity, repeatType: 'reverse' }}
                    className="absolute rounded-full bg-destructive/30 border border-destructive/15"
                    style={{ left: `${n.x}%`, top: `${n.y}%`, width: n.s, height: n.s }}
                  />
                ))}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 0.8, y: 0 }} transition={{ delay: 0.5 }} className="text-2xl font-bold text-foreground/20 tabular-nums">$280T</motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1 }} className="text-[9px] text-muted-foreground mt-1">Global real estate — fragmented across 195 nations</motion.p>
                </div>
              </motion.div>
            )}

            {/* Scene 1: Intelligence Layer */}
            {scene === 1 && (
              <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="relative" style={{ width: '80%', height: '80%' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                    className="absolute flex flex-col items-center" style={{ left: '50%', top: '45%', transform: 'translate(-50%,-50%)' }}>
                    <div className="relative h-6 w-6 rounded-full bg-primary/30 border-2 border-primary">
                      <motion.div className="absolute inset-0 rounded-full bg-primary/20" animate={{ scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
                    </div>
                    <span className="text-[8px] font-semibold text-primary mt-1">ASTRA CORE</span>
                  </motion.div>
                  {[
                    { label: 'Vendors', x: 18, y: 22 }, { label: 'Investors', x: 82, y: 22 },
                    { label: 'Properties', x: 15, y: 68 }, { label: 'Markets', x: 85, y: 68 },
                    { label: 'Agents', x: 50, y: 12 }, { label: 'Buyers', x: 50, y: 85 },
                  ].map((spoke, i) => (
                    <React.Fragment key={spoke.label}>
                      <motion.svg className="absolute inset-0 w-full h-full pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.5 + i * 0.12 }}>
                        <line x1="50%" y1="45%" x2={`${spoke.x}%`} y2={`${spoke.y}%`} stroke="hsl(var(--primary))" strokeWidth="1" />
                      </motion.svg>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + i * 0.12 }}
                        className="absolute flex flex-col items-center" style={{ left: `${spoke.x}%`, top: `${spoke.y}%`, transform: 'translate(-50%,-50%)' }}>
                        <div className="h-3 w-3 rounded-full bg-chart-1/30 border border-chart-1/40" />
                        <span className="text-[6px] text-muted-foreground mt-0.5">{spoke.label}</span>
                      </motion.div>
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Scene 2: Coordinated Activity */}
            {scene === 2 && (
              <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                {COORD_CITIES.map((city, ci) => (
                  <React.Fragment key={city.name}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: ci * 0.2 }}
                      className="absolute flex flex-col items-center" style={{ left: `${city.x}%`, top: `${city.y}%` }}>
                      <div className="rounded-full bg-primary/25 border-2 border-primary" style={{ width: 6 + city.score / 12, height: 6 + city.score / 12 }}>
                        <motion.div className="absolute inset-0 rounded-full bg-primary/15"
                          animate={{ scale: [1, 2, 1], opacity: [0.2, 0, 0.2] }}
                          transition={{ duration: 3, repeat: Infinity, delay: ci * 0.4 }}
                          style={{ width: 6 + city.score / 12, height: 6 + city.score / 12 }}
                        />
                      </div>
                      <span className="text-[6px] font-medium text-foreground mt-0.5">{city.name}</span>
                    </motion.div>
                  </React.Fragment>
                ))}
                {/* Inter-city flows */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {COORD_CITIES.slice(0, -1).map((c, i) => (
                    <motion.line key={i}
                      x1={`${c.x}%`} y1={`${c.y}%`}
                      x2={`${COORD_CITIES[(i + 1) % COORD_CITIES.length].x}%`}
                      y2={`${COORD_CITIES[(i + 1) % COORD_CITIES.length].y}%`}
                      stroke="hsl(var(--chart-1))" strokeWidth="0.5" strokeDasharray="3 5"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                      transition={{ delay: 1 + i * 0.15 }}
                    />
                  ))}
                </svg>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="absolute bottom-6 left-0 right-0 text-center">
                  <p className="text-[9px] text-muted-foreground">Transaction flows synchronizing across {COORD_CITIES.length} markets</p>
                </motion.div>
              </motion.div>
            )}

            {/* Scene 3: Strategic Influence */}
            {scene === 3 && (
              <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-md space-y-2">
                  {INFRA_ITEMS.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.18 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/20 bg-card/30">
                      <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-[9px] text-foreground flex-1">{item.label}</span>
                      <span className="text-[9px] font-semibold text-chart-1 tabular-nums">{item.val}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Scene 4: Legacy Statement */}
            {scene === 4 && (
              <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-lg px-4">
                  <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                    ASTRA enabling coordinated real estate economies worldwide.
                  </motion.p>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="flex items-center justify-center gap-8 mt-8">
                    {[
                      { label: 'Markets Coordinated', value: '24+' },
                      { label: 'Capital Influenced', value: '$54B' },
                      { label: 'Efficiency Gain', value: '+34%' },
                    ].map(m => (
                      <div key={m.label} className="text-center">
                        <p className="text-xl font-bold text-primary tabular-nums">{m.value}</p>
                        <p className="text-[7px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
                      </div>
                    ))}
                  </motion.div>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="text-[8px] text-muted-foreground mt-8">
                    Architect of systemic market evolution — building generational infrastructure.
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

export default FounderGlobalInfluence;
