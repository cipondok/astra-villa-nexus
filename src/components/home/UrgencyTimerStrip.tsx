import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame } from 'lucide-react';

/**
 * Urgency timer strip — shows a countdown to the next "deal refresh" cycle.
 * Creates FOMO without being deceptive (resets daily at 6 AM local).
 */
export default function UrgencyTimerStrip() {
  const [timeLeft, setTimeLeft] = useState('');

  const targetTime = useMemo(() => {
    const now = new Date();
    const target = new Date(now);
    target.setHours(6, 0, 0, 0);
    if (now >= target) target.setDate(target.getDate() + 1);
    return target.getTime();
  }, []);

  useEffect(() => {
    const tick = () => {
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setTimeLeft('Refreshing...');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <div className="flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-destructive/5 via-destructive/10 to-destructive/5 border-y border-destructive/10">
      <Flame className="h-3.5 w-3.5 text-destructive animate-pulse" />
      <span className="text-[11px] sm:text-xs font-medium text-foreground">
        Today's AI deals refresh in
      </span>
      <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 text-destructive border-destructive/30 bg-destructive/5 tabular-nums font-bold">
        <Clock className="h-3 w-3" />
        {timeLeft}
      </Badge>
      <span className="text-[10px] text-muted-foreground hidden sm:inline">
        • New undervalued properties daily
      </span>
    </div>
  );
}
