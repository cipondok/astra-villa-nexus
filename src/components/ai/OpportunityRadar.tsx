import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radar, TrendingUp, Flame, Eye, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface RadarSignal {
  id: string;
  label: string;
  type: 'hot' | 'rising' | 'watching';
  value: number;       // 0-100 intensity
  location: string;
  detail: string;
  route: string;
}

/**
 * OpportunityRadar — Animated radar widget showing live market signals.
 * Visualizes demand hotspots, price momentum, and watchlist alerts
 * as pulsing dots on a stylized radar sweep.
 */
export default function OpportunityRadar({ className }: { className?: string }) {
  const navigate = useNavigate();

  // Deterministic signals (would be API-driven in production)
  const signals: RadarSignal[] = useMemo(() => [
    { id: '1', label: 'Bali Demand Surge', type: 'hot', value: 92, location: 'Bali', detail: '+18% inquiry volume this week', route: '/location-intelligence?city=Bali' },
    { id: '2', label: 'Jakarta Price Momentum', type: 'rising', value: 78, location: 'Jakarta', detail: 'Avg price up 4.2% MoM', route: '/market-trends?city=Jakarta' },
    { id: '3', label: 'Lombok Early Signal', type: 'watching', value: 64, location: 'Lombok', detail: 'New listings +32% vs last month', route: '/location-intelligence?city=Lombok' },
    { id: '4', label: 'Bandung ROI Leader', type: 'rising', value: 85, location: 'Bandung', detail: '8.4% avg rental yield', route: '/deal-finder?city=Bandung' },
  ], []);

  const typeConfig = {
    hot: { icon: Flame, color: 'text-destructive', bg: 'bg-destructive/10', ring: 'ring-destructive/20', label: 'Hot' },
    rising: { icon: TrendingUp, color: 'text-chart-2', bg: 'bg-chart-2/10', ring: 'ring-chart-2/20', label: 'Rising' },
    watching: { icon: Eye, color: 'text-chart-4', bg: 'bg-chart-4/10', ring: 'ring-chart-4/20', label: 'Watching' },
  };

  return (
    <Card className={cn('border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden', className)}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Radar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Opportunity Radar</h3>
              <p className="text-[10px] text-muted-foreground">Live market signals</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-2 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-2" />
            </span>
            <span className="text-[10px] font-medium text-chart-2">Live</span>
          </div>
        </div>

        {/* Radar visual — stylized concentric rings with pulsing dots */}
        <div className="relative h-40 mx-4 mb-3 rounded-xl bg-muted/30 border border-border/30 overflow-hidden">
          {/* Concentric rings */}
          {[1, 2, 3].map(ring => (
            <div
              key={ring}
              className="absolute rounded-full border border-border/20"
              style={{
                width: `${ring * 30 + 10}%`,
                height: `${ring * 30 + 10}%`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* Sweep line */}
          <motion.div
            className="absolute top-1/2 left-1/2 h-[1px] origin-left"
            style={{ width: '45%' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          >
            <div className="h-full w-full bg-gradient-to-r from-primary/40 to-transparent" />
          </motion.div>

          {/* Signal dots */}
          {signals.map((signal, i) => {
            const config = typeConfig[signal.type];
            const angle = (i / signals.length) * Math.PI * 2 - Math.PI / 2;
            const radius = 25 + (100 - signal.value) * 0.15;
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;

            return (
              <motion.button
                key={signal.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                onClick={() => navigate(signal.route)}
                className="absolute group cursor-pointer"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                title={signal.label}
              >
                <span className={cn('relative flex h-4 w-4', signal.type === 'hot' && 'h-5 w-5')}>
                  <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-40', config.bg)} />
                  <span className={cn('relative inline-flex rounded-full h-full w-full items-center justify-center', config.bg, 'ring-1', config.ring)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', signal.type === 'hot' ? 'bg-destructive' : signal.type === 'rising' ? 'bg-chart-2' : 'bg-chart-4')} />
                  </span>
                </span>
              </motion.button>
            );
          })}

          {/* Center label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">You</span>
          </div>
        </div>

        {/* Signal list */}
        <div className="px-4 pb-4 space-y-2">
          {signals.map((signal) => {
            const config = typeConfig[signal.type];
            const Icon = config.icon;
            return (
              <button
                key={signal.id}
                onClick={() => navigate(signal.route)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors group text-left"
              >
                <div className={cn('shrink-0 h-7 w-7 rounded-md flex items-center justify-center', config.bg)}>
                  <Icon className={cn('h-3.5 w-3.5', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{signal.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{signal.detail}</p>
                </div>
                <ArrowRight className="shrink-0 h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
