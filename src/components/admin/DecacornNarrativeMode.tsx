import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, Globe, Zap, Brain, TrendingUp, Activity } from 'lucide-react';

interface Props {
  isActive: boolean;
  onClose: () => void;
}

/* ─── Network Node ─── */
const NetworkNode = ({ x, y, size, delay, label, type }: {
  x: number; y: number; size: number; delay: number; label?: string; type: 'vendor' | 'client' | 'asset' | 'city';
}) => {
  const colors: Record<string, string> = {
    vendor: 'bg-chart-1',
    client: 'bg-chart-2',
    asset: 'bg-chart-3',
    city: 'bg-primary',
  };
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="absolute flex flex-col items-center"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className={cn("rounded-full", colors[type])} style={{ width: size, height: size }}>
        <motion.div
          className={cn("absolute inset-0 rounded-full", colors[type])}
          animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: delay * 2 }}
        />
      </div>
      {label && <span className="text-[7px] text-muted-foreground mt-0.5 whitespace-nowrap">{label}</span>}
    </motion.div>
  );
};

/* ─── Connection Line ─── */
const ConnectionLine = ({ from, to, delay }: { from: { x: number; y: number }; to: { x: number; y: number }; delay: number }) => (
  <motion.svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.15 }}
    transition={{ delay, duration: 0.8 }}
  >
    <line x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`} stroke="hsl(var(--primary))" strokeWidth="1" />
  </motion.svg>
);

/* ─── Scene Wrapper ─── */
const Scene = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6 }}
    className="flex flex-col items-center justify-center h-full px-8"
  >
    <motion.p
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-[9px] text-primary uppercase tracking-[0.3em] mb-8"
    >
      {title}
    </motion.p>
    {children}
  </motion.div>
);

const DecacornNarrativeMode = ({ isActive, onClose }: Props) => {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    if (!isActive) { setScene(0); return; }
    const timer = setInterval(() => {
      setScene(prev => (prev < 4 ? prev + 1 : prev));
    }, 7000);
    return () => clearInterval(timer);
  }, [isActive]);

  if (!isActive) return null;

  const FRAGMENTED_NODES = [
    { x: 12, y: 25 }, { x: 35, y: 15 }, { x: 58, y: 40 }, { x: 78, y: 20 },
    { x: 22, y: 60 }, { x: 45, y: 70 }, { x: 68, y: 55 }, { x: 85, y: 65 },
    { x: 15, y: 80 }, { x: 50, y: 85 }, { x: 72, y: 80 }, { x: 30, y: 45 },
  ];

  const CONNECTED_NODES = [
    { x: 50, y: 45, type: 'city' as const, label: 'ASTRA Core', size: 16 },
    { x: 25, y: 25, type: 'vendor' as const, label: 'Vendors', size: 10 },
    { x: 75, y: 25, type: 'client' as const, label: 'Investors', size: 10 },
    { x: 25, y: 65, type: 'asset' as const, label: 'Properties', size: 10 },
    { x: 75, y: 65, type: 'vendor' as const, label: 'Agents', size: 10 },
    { x: 15, y: 45, type: 'client' as const, label: 'Buyers', size: 8 },
    { x: 85, y: 45, type: 'asset' as const, label: 'Markets', size: 8 },
  ];

  const CITY_NODES = [
    { name: 'Bali', x: 30, y: 35, delay: 0.5 },
    { name: 'Jakarta', x: 25, y: 45, delay: 1.0 },
    { name: 'Surabaya', x: 35, y: 50, delay: 1.5 },
    { name: 'Lombok', x: 32, y: 38, delay: 2.0 },
    { name: 'Dubai', x: 45, y: 30, delay: 2.5 },
    { name: 'Bangkok', x: 55, y: 40, delay: 3.0 },
    { name: 'Singapore', x: 50, y: 50, delay: 3.5 },
    { name: 'Kuala Lumpur', x: 48, y: 45, delay: 4.0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-xl flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/10">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-semibold text-foreground tracking-wider">ASTRA — CATEGORY LEADERSHIP</span>
        </div>
        <div className="flex items-center gap-3">
          {[0, 1, 2, 3, 4].map(s => (
            <button
              key={s}
              onClick={() => setScene(s)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                scene === s ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
          <Button variant="ghost" size="sm" className="h-6 text-[9px] ml-4" onClick={onClose}>
            <X className="h-3 w-3 mr-1" />Exit
          </Button>
        </div>
      </div>

      {/* Scene content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {scene === 0 && (
            <Scene key="s0" title="The Problem — Fragmented Global Property Transactions">
              <div className="relative w-full max-w-xl h-64">
                {FRAGMENTED_NODES.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4, x: [0, (Math.random() - 0.5) * 8, 0], y: [0, (Math.random() - 0.5) * 8, 0] }}
                    transition={{ delay: i * 0.1, duration: 4, repeat: Infinity }}
                    className="absolute h-3 w-3 rounded-full bg-destructive/40 border border-destructive/20"
                    style={{ left: `${n.x}%`, top: `${n.y}%` }}
                  />
                ))}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-muted-foreground"
                >
                  $280T global real estate — disconnected, opaque, inefficient
                </motion.p>
              </div>
            </Scene>
          )}

          {scene === 1 && (
            <Scene key="s1" title="ASTRA Intelligence Layer — Connecting the Network">
              <div className="relative w-full max-w-xl h-64">
                {/* Connection lines */}
                {CONNECTED_NODES.slice(1).map((n, i) => (
                  <ConnectionLine key={i} from={{ x: 50, y: 45 }} to={{ x: n.x, y: n.y }} delay={0.3 + i * 0.2} />
                ))}
                {/* Nodes */}
                {CONNECTED_NODES.map((n, i) => (
                  <NetworkNode key={i} x={n.x} y={n.y} size={n.size} delay={0.2 + i * 0.15} label={n.label} type={n.type} />
                ))}
              </div>
            </Scene>
          )}

          {scene === 2 && (
            <Scene key="s2" title="Autonomous Marketplace Activation">
              <div className="max-w-md mx-auto space-y-3">
                {[
                  { label: 'AI Price Optimization', count: '12,847 listings', icon: Zap },
                  { label: 'Automated Lead Routing', count: '8,920 investors', icon: TrendingUp },
                  { label: 'Deal Flow Intelligence', count: '3,241 transactions', icon: Activity },
                  { label: 'Predictive Market Scoring', count: '24 markets', icon: Brain },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.3, duration: 0.5 }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border/20 bg-card/30"
                  >
                    <item.icon className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-[10px] font-medium text-foreground">{item.label}</p>
                    </div>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + i * 0.3 }}
                      className="text-[10px] font-semibold text-chart-1 tabular-nums"
                    >
                      {item.count}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </Scene>
          )}

          {scene === 3 && (
            <Scene key="s3" title="Predictive Expansion Engine">
              <div className="relative w-full max-w-xl h-64">
                {CITY_NODES.map((city, i) => (
                  <motion.div
                    key={city.name}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: city.delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${city.x}%`, top: `${city.y}%` }}
                  >
                    <div className="h-3 w-3 rounded-full bg-primary">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary"
                        animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: city.delay }}
                      />
                    </div>
                    <span className="text-[7px] text-foreground font-medium mt-0.5">{city.name}</span>
                  </motion.div>
                ))}
              </div>
            </Scene>
          )}

          {scene === 4 && (
            <Scene key="s4" title="Economic Infrastructure Status">
              <div className="text-center max-w-lg mx-auto">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-2xl md:text-3xl font-bold text-foreground leading-tight"
                >
                  ASTRA powers intelligent real estate transactions at planetary scale.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="flex items-center justify-center gap-6 mt-8"
                >
                  {[
                    { label: 'Markets', value: '24+' },
                    { label: 'GMV Processed', value: 'Rp 4.2T' },
                    { label: 'AI Predictions', value: '47K+' },
                  ].map((m, i) => (
                    <div key={i} className="text-center">
                      <p className="text-xl font-bold text-primary tabular-nums">{m.value}</p>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
                    </div>
                  ))}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  className="text-[9px] text-muted-foreground mt-8"
                >
                  Defining a new global category in property intelligence infrastructure.
                </motion.p>
              </div>
            </Scene>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-center gap-3 py-4 border-t border-border/10">
        <Button variant="ghost" size="sm" className="h-7 text-[10px]" disabled={scene === 0} onClick={() => setScene(s => s - 1)}>
          Previous
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => scene < 4 ? setScene(s => s + 1) : onClose()}>
          {scene < 4 ? 'Next' : 'Exit'} <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
};

export default DecacornNarrativeMode;
