import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Play, X, ChevronRight, Globe, Activity, Brain,
  TrendingUp, Users, Building2, ArrowRightLeft, Zap
} from 'lucide-react';

/* ──────────────────────────────────────────
   Scene data
   ────────────────────────────────────────── */
interface KPICounter {
  label: string;
  value: number;
  suffix: string;
  icon: React.ElementType;
}

const kpiCounters: KPICounter[] = [
  { label: 'Properties Listed', value: 12847, suffix: '+', icon: Building2 },
  { label: 'Transactions Closed', value: 3241, suffix: '', icon: ArrowRightLeft },
  { label: 'Active Investors', value: 8920, suffix: '+', icon: Users },
  { label: 'AI Optimizations', value: 47200, suffix: '', icon: Brain },
  { label: 'Cities Covered', value: 24, suffix: '', icon: Globe },
  { label: 'Revenue Processed', value: 2.4, suffix: 'T', icon: TrendingUp },
];

const liveTicker = [
  'Villa sold in Canggu, Bali — Rp 4.2B',
  'New vendor onboarded — Jakarta Realty Group',
  'AI optimized pricing for 23 listings in Seminyak',
  'Investor portfolio updated — Ubud cluster',
  'Demand spike detected — Nusa Dua premium segment',
  'Transaction closed — Lombok beachfront, Rp 1.8B',
  'Vendor verified — Surabaya Metro Homes',
  'Market intelligence update — 14 new districts mapped',
  'Bulk listing import — 47 properties from Bali Coastal',
  'AI fraud scan complete — 0 anomalies detected',
];

const expansionNodes = [
  { name: 'Bali', x: 52, y: 55, active: true, delay: 0 },
  { name: 'Jakarta', x: 35, y: 48, active: true, delay: 0.3 },
  { name: 'Surabaya', x: 48, y: 52, active: true, delay: 0.6 },
  { name: 'Lombok', x: 56, y: 56, active: true, delay: 0.9 },
  { name: 'Yogyakarta', x: 42, y: 53, active: false, delay: 1.2 },
  { name: 'Bandung', x: 38, y: 50, active: false, delay: 1.5 },
  { name: 'Medan', x: 22, y: 32, active: false, delay: 1.8 },
  { name: 'Makassar', x: 55, y: 58, active: false, delay: 2.1 },
];

/* ──────────────────────────────────────────
   Animated Counter
   ────────────────────────────────────────── */
const AnimCounter = ({ target, duration = 2000 }: { target: number; duration?: number }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCurrent(target * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  if (target >= 1000) return <>{Math.round(current).toLocaleString()}</>;
  if (target < 10) return <>{current.toFixed(1)}</>;
  return <>{Math.round(current)}</>;
};

/* ──────────────────────────────────────────
   Investor Demo Mode
   ────────────────────────────────────────── */
interface InvestorDemoModeProps {
  isActive: boolean;
  onClose: () => void;
}

export const InvestorDemoMode = ({ isActive, onClose }: InvestorDemoModeProps) => {
  const [scene, setScene] = useState(0);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Auto-advance scenes
  useEffect(() => {
    if (!isActive) { setScene(0); return; }
    const timer = setInterval(() => {
      setScene(prev => (prev < 3 ? prev + 1 : prev));
    }, 6000);
    return () => clearInterval(timer);
  }, [isActive]);

  // Ticker rotation
  useEffect(() => {
    if (!isActive || scene !== 1) return;
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % liveTicker.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [isActive, scene]);

  const goScene = useCallback((s: number) => setScene(s), []);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-background/95 backdrop-blur-sm flex flex-col"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border/10">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-chart-1 animate-pulse" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Investor Presentation Mode</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Scene dots */}
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3].map(s => (
                  <button
                    key={s}
                    onClick={() => goScene(s)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      scene === s ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Scene ${s + 1}`}
                  />
                ))}
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center" aria-label="Exit demo">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Scene content */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {scene === 0 && (
                <Scene key="s0" title="Platform Intelligence">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    {kpiCounters.map((kpi, i) => (
                      <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="text-center"
                      >
                        <kpi.icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                        <div className="text-3xl md:text-4xl font-bold text-foreground tabular-nums tracking-tight">
                          <AnimCounter target={kpi.value} />
                          <span className="text-primary">{kpi.suffix}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{kpi.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </Scene>
              )}

              {scene === 1 && (
                <Scene key="s1" title="Live Activity">
                  <div className="max-w-lg mx-auto space-y-3">
                    <AnimatePresence mode="popLayout">
                      {liveTicker.slice(tickerIndex, tickerIndex + 5).map((item, i) => (
                        <motion.div
                          key={`${tickerIndex}-${i}`}
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1 - i * 0.15, x: 0 }}
                          exit={{ opacity: 0, x: -40 }}
                          transition={{ duration: 0.4, delay: i * 0.05 }}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border/20 bg-card/50"
                        >
                          <Activity className={cn("h-3 w-3 shrink-0", i === 0 ? 'text-chart-1' : 'text-muted-foreground')} />
                          <span className={cn("text-xs", i === 0 ? 'text-foreground font-medium' : 'text-muted-foreground')}>{item}</span>
                          {i === 0 && <span className="text-[8px] text-chart-1 ml-auto">LIVE</span>}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </Scene>
              )}

              {scene === 2 && (
                <Scene key="s2" title="Expansion Network">
                  <div className="relative w-full max-w-2xl mx-auto aspect-[16/9] rounded-xl border border-border/20 bg-card/30 overflow-hidden">
                    {/* Grid background */}
                    <div className="absolute inset-0 opacity-5"
                      style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />
                    {/* Nodes */}
                    {expansionNodes.map((node) => (
                      <motion.div
                        key={node.name}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: node.delay, duration: 0.5 }}
                        className="absolute flex flex-col items-center"
                        style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%,-50%)' }}
                      >
                        <div className={cn(
                          "h-3 w-3 rounded-full border-2",
                          node.active ? "bg-chart-1 border-chart-1/30" : "bg-muted-foreground/30 border-muted-foreground/10"
                        )}>
                          {node.active && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-chart-1/30"
                              animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
                              transition={{ duration: 3, repeat: Infinity, delay: node.delay }}
                            />
                          )}
                        </div>
                        <span className={cn("text-[8px] mt-1 font-medium", node.active ? 'text-foreground' : 'text-muted-foreground/50')}>{node.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </Scene>
              )}

              {scene === 3 && (
                <Scene key="s3" title="Intelligence Network">
                  <div className="max-w-xl mx-auto">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Vendors', value: '847', sub: 'Active partners', icon: Users },
                        { label: 'Buyers', value: '8,920', sub: 'Qualified investors', icon: TrendingUp },
                        { label: 'Assets', value: '12,847', sub: 'Tracked properties', icon: Building2 },
                        { label: 'Transactions', value: '3,241', sub: 'Closed deals', icon: ArrowRightLeft },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                          className="relative p-5 rounded-xl border border-border/20 bg-card/40 text-center"
                        >
                          <item.icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                          <div className="text-2xl font-bold text-foreground tabular-nums">{item.value}</div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">{item.label}</div>
                          <div className="text-[8px] text-muted-foreground mt-0.5">{item.sub}</div>
                          {/* Connection lines (visual only) */}
                          {i < 3 && (
                            <motion.div
                              className="absolute -right-4 top-1/2 w-4 h-px bg-border/30"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ delay: 0.5 + i * 0.2 }}
                              style={{ display: i % 2 === 0 ? 'block' : 'none' }}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                    {/* Central connection node */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.4 }}
                      className="mx-auto -mt-4 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
                    >
                      <Zap className="h-4 w-4 text-primary" />
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      className="text-center text-[10px] text-muted-foreground mt-2"
                    >
                      AI-orchestrated real estate intelligence infrastructure
                    </motion.p>
                  </div>
                </Scene>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-center gap-3 py-4 border-t border-border/10">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px]"
              disabled={scene === 0}
              onClick={() => setScene(s => Math.max(0, s - 1))}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] gap-1"
              onClick={() => scene < 3 ? setScene(s => s + 1) : onClose()}
            >
              {scene < 3 ? 'Next' : 'Exit'} <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* Scene wrapper */
const Scene = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="w-full px-8"
  >
    <h2 className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-8">{title}</h2>
    {children}
  </motion.div>
);

/* ──────────────────────────────────────────
   Trigger Button (for header integration)
   ────────────────────────────────────────── */
export const InvestorDemoTrigger = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClick}
    className="h-7 text-[9px] gap-1 border-primary/20 text-primary hover:bg-primary/5"
  >
    <Play className="h-2.5 w-2.5" />
    Investor Mode
  </Button>
);

export default InvestorDemoMode;
