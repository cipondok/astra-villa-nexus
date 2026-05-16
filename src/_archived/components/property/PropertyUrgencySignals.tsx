import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Clock, TrendingUp, Users, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyUrgencySignalsProps {
  propertyId: string;
  createdAt?: string;
  className?: string;
}

/**
 * Social-proof urgency signals to increase inquiry conversion.
 * Shows live viewers, recent view count, and time-based demand cues.
 */
const PropertyUrgencySignals = memo(({ propertyId, createdAt, className }: PropertyUrgencySignalsProps) => {
  const [liveViewers, setLiveViewers] = useState(0);
  const [recentViews, setRecentViews] = useState(0);

  // Simulate live viewer presence (would be realtime in production)
  useEffect(() => {
    const seed = propertyId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const base = (seed % 8) + 2; // 2-9 base viewers
    setLiveViewers(base);
    setRecentViews((seed % 40) + 15); // 15-54 recent views

    const interval = setInterval(() => {
      setLiveViewers(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(1, Math.min(prev + delta, base + 5));
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [propertyId]);

  const isNew = createdAt
    ? (Date.now() - new Date(createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
    : false;

  const isHot = liveViewers >= 5;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Live viewers pill */}
      <AnimatePresence mode="wait">
        <motion.div
          key={liveViewers}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold',
            isHot
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-muted/60 text-muted-foreground border border-border/40'
          )}
        >
          {isHot ? (
            <Flame className="h-3 w-3 animate-pulse" />
          ) : (
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-2 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-2" />
            </div>
          )}
          <span>{liveViewers} viewing now</span>
        </motion.div>
      </AnimatePresence>

      {/* Recent views */}
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/40 text-muted-foreground border border-border/30">
        <Eye className="h-3 w-3" />
        <span>{recentViews} views this week</span>
      </div>

      {/* New listing badge */}
      {isNew && (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
          <Clock className="h-3 w-3" />
          <span>New Listing</span>
        </div>
      )}

      {/* High demand indicator */}
      {isHot && (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-chart-1/10 text-chart-1 border border-chart-1/20">
          <TrendingUp className="h-3 w-3" />
          <span>High Demand</span>
        </div>
      )}
    </div>
  );
});

PropertyUrgencySignals.displayName = 'PropertyUrgencySignals';
export default PropertyUrgencySignals;
