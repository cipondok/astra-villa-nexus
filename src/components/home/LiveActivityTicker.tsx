import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Heart, Home, TrendingUp, Users, Zap, MapPin, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  icon: typeof Eye;
  text: string;
  accent?: boolean;
}

/**
 * Live Activity Ticker Strip
 * Scrolling horizontal strip showing real-time platform activity signals.
 * Creates perceived momentum and marketplace liveliness.
 */
export default function LiveActivityTicker({ className }: { className?: string }) {
  const [visibleIndex, setVisibleIndex] = useState(0);

  // Fetch real platform stats
  const { data: stats } = useQuery({
    queryKey: ['activity-ticker-stats'],
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

      const [
        { count: totalListings },
        { count: newToday },
        { count: weeklyViews },
        { data: recentProps },
        { data: cityData },
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active')
          .gte('created_at', todayStart),
        supabase.from('web_analytics').select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgo),
        supabase.from('properties').select('title, city, property_type').eq('status', 'active')
          .order('created_at', { ascending: false }).limit(5),
        supabase.from('properties').select('city').eq('status', 'active').not('city', 'is', null),
      ]);

      const uniqueCities = new Set((cityData || []).map(c => c.city)).size;

      return {
        totalListings: totalListings || 0,
        newToday: newToday || 0,
        weeklyViews: weeklyViews || 0,
        recentProps: recentProps || [],
        cities: uniqueCities,
      };
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  // Build activity feed items from real data
  const activities = useMemo<ActivityItem[]>(() => {
    if (!stats) return [];

    const items: ActivityItem[] = [
      {
        id: 'live',
        icon: Zap,
        text: `🔴 LIVE — ${stats.totalListings.toLocaleString()} properti dianalisis AI`,
        accent: true,
      },
      {
        id: 'new-today',
        icon: Home,
        text: `${stats.newToday} listing baru hari ini`,
      },
      {
        id: 'coverage',
        icon: MapPin,
        text: `Menjangkau ${stats.cities} kota di seluruh Indonesia`,
      },
      {
        id: 'views',
        icon: Eye,
        text: `${stats.weeklyViews.toLocaleString()} pencarian minggu ini`,
      },
      {
        id: 'ai-score',
        icon: BarChart3,
        text: 'AI Deal Score aktif — peringkat peluang terbaik',
        accent: true,
      },
      {
        id: 'investors',
        icon: Users,
        text: 'Investor sedang menjelajahi properti sekarang',
      },
    ];

    // Add recent listing activity
    stats.recentProps.forEach((prop, i) => {
      items.push({
        id: `recent-${i}`,
        icon: TrendingUp,
        text: `${prop.property_type || 'Properti'} baru di ${prop.city || 'Indonesia'} — baru ditambahkan`,
      });
    });

    return items;
  }, [stats]);

  // Auto-rotate visible item
  useEffect(() => {
    if (activities.length === 0) return;
    const timer = setInterval(() => {
      setVisibleIndex((prev) => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activities.length]);

  if (!stats || activities.length === 0) return null;

  const current = activities[visibleIndex];
  const Icon = current.icon;

  return (
    <div
      className={cn(
        'w-full overflow-hidden border-y border-border/40 bg-muted/30 backdrop-blur-sm',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-9 sm:h-10 gap-3">
          {/* Rotating single item on mobile, multiple on desktop */}
          <div className="flex-1 min-w-0 overflow-hidden relative h-full flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <Icon className={cn(
                  'h-3.5 w-3.5 flex-shrink-0',
                  current.accent ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className={cn(
                  'font-medium truncate',
                  current.accent ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {current.text}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div className="hidden sm:flex items-center gap-1">
            {activities.slice(0, 6).map((_, i) => (
              <button
                key={i}
                onClick={() => setVisibleIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === visibleIndex % 6
                    ? 'w-4 bg-primary'
                    : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                aria-label={`Activity ${i + 1}`}
              />
            ))}
          </div>

          {/* Live pulse indicator */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
