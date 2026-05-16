import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Gavel, Timer, ChevronRight, Flame, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const db = supabase as any;

function useCountdown(endTime: string) {
  const calc = useCallback(() => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true, total: 0 };
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      expired: false,
      total: diff,
    };
  }, [endTime]);
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, [calc]);
  return t;
}

function MiniCountdown({ endTime }: { endTime: string }) {
  const t = useCountdown(endTime);
  if (t.expired) return <span className="text-[9px] text-muted-foreground">Ended</span>;
  const isUrgent = t.total < 3600000;
  return (
    <span className={cn('text-[10px] font-mono font-bold', isUrgent ? 'text-destructive animate-pulse' : 'text-foreground')}>
      {String(t.h).padStart(2, '0')}:{String(t.m).padStart(2, '0')}:{String(t.s).padStart(2, '0')}
    </span>
  );
}

const formatShort = (v: number) =>
  v >= 1e12 ? `${(v / 1e12).toFixed(1)}T` : v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K`;

export default function FlashDealUrgencyStrip() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);

  const { data } = useQuery({
    queryKey: ['urgency-discovery'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('auction-flash-deals', {
        body: { mode: 'discovery' },
      });
      if (error) throw error;
      return data as {
        flash_deals: any[];
        auctions: any[];
        total_active: number;
      };
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const items = [
    ...(data?.flash_deals || []).map((d: any) => ({ ...d, _type: 'flash' as const })),
    ...(data?.auctions || []).map((a: any) => ({ ...a, _type: 'auction' as const })),
  ];

  // Auto-rotate
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => setCurrentIdx(prev => (prev + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[currentIdx % items.length];

  return (
    <Card className="border-border/50 bg-gradient-to-r from-destructive/5 via-card to-primary/5 overflow-hidden">
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-destructive/10">
              <Bell className="h-3.5 w-3.5 text-destructive" />
            </div>
            <span className="text-xs font-semibold text-foreground">Urgency Deals</span>
            <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-[9px] animate-pulse">
              {items.length} LIVE
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-[10px] h-6 gap-0.5" onClick={() => navigate('/flash-deals')}>
            View All <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        {/* Rotating item */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.id || currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 cursor-pointer hover:bg-accent/20 rounded-lg p-1.5 -m-1.5 transition-colors"
            onClick={() => navigate('/flash-deals')}
          >
            {/* Type indicator */}
            <div className={cn(
              'p-2 rounded-lg flex-shrink-0',
              current._type === 'flash' ? 'bg-destructive/10' : 'bg-primary/10'
            )}>
              {current._type === 'flash'
                ? <Zap className="h-4 w-4 text-destructive" />
                : <Gavel className="h-4 w-4 text-primary" />
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {current._type === 'flash'
                  ? current.property?.title || 'Flash Deal'
                  : current.title || current.property?.title || 'Live Auction'
                }
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {current._type === 'flash' ? (
                  <>
                    <Badge className="bg-destructive/10 text-destructive text-[9px] border-0">
                      -{current.discount_pct}%
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatShort(current.flash_price)}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-through">
                      {formatShort(current.original_price)}
                    </span>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="text-[9px] gap-0.5 border-chart-1/30 text-chart-1">
                      <Flame className="h-2.5 w-2.5" /> {current.bid_count || current.total_bids || 0} bids
                    </Badge>
                    <span className="text-[10px] font-bold text-primary">
                      {formatShort(current.current_bid || current.starting_price)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Timer */}
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Timer className="h-3 w-3 text-muted-foreground" />
                <MiniCountdown endTime={current.end_time} />
              </div>
              <span className="text-[8px] text-muted-foreground">{current.property?.city}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-1 mt-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={cn(
                  'h-1 rounded-full transition-all',
                  i === currentIdx % items.length
                    ? 'w-4 bg-primary'
                    : 'w-1.5 bg-muted-foreground/30'
                )}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
