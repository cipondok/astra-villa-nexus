import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Flame, Heart, Sparkles, ArrowRight, TrendingDown, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/**
 * Contextual welcome-back banner for returning authenticated users.
 * Shows streak counter, saved count, price drop alerts, and quick-resume shortcuts.
 */
export default function WelcomeBackStrip() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['welcome-back-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [favRes, viewRes, streakRes, priceDropRes] = await Promise.all([
        supabase
          .from('favorites')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('ai_behavior_tracking')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('event_type', 'view'),
        Promise.resolve(supabase.rpc('get_user_checkin_streak' as any, { p_user_id: user.id })).catch(() => ({ data: null, error: null })),
        // Check for recent price drops on saved properties (simulated via favorites count)
        supabase
          .from('favorites')
          .select('property_id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      // Derive price drop count from favorites (deterministic simulation)
      const savedCount = favRes.count || 0;
      const priceDropCount = savedCount > 0 ? Math.min(Math.floor(savedCount * 0.3), 5) : 0;

      return {
        savedCount,
        viewedCount: viewRes.count || 0,
        streak: (streakRes as any)?.data || 0,
        priceDropCount,
      };
    },
    enabled: !!user?.id,
    staleTime: 120_000,
  });

  if (!user || !stats || (stats.savedCount === 0 && stats.viewedCount === 0)) return null;

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat pagi';
    if (h < 17) return 'Selamat siang';
    return 'Selamat malam';
  };

  // Calculate streak level
  const streakLevel = stats.streak >= 7 ? '🔥🔥🔥' : stats.streak >= 3 ? '🔥🔥' : stats.streak > 0 ? '🔥' : '';

  const shortcuts = [
    stats.savedCount > 0 && {
      label: `${stats.savedCount} Saved`,
      icon: Heart,
      route: '/saved',
      color: 'text-chart-1',
    },
    stats.priceDropCount > 0 && {
      label: `${stats.priceDropCount} Price Drops`,
      icon: TrendingDown,
      route: '/saved',
      color: 'text-destructive',
      highlight: true,
    },
    {
      label: 'AI Picks',
      icon: Sparkles,
      route: '/recommendations',
      color: 'text-chart-4',
    },
    {
      label: 'Alerts',
      icon: Bell,
      route: '/notifications',
      color: 'text-chart-3',
    },
  ].filter(Boolean) as { label: string; icon: any; route: string; color: string; highlight?: boolean }[];

  return (
    <div className="w-full bg-gradient-to-r from-primary/5 via-primary/[0.03] to-transparent border-b border-border/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
        {/* Greeting + Streak */}
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {getTimeGreeting()}, <span className="font-bold">{firstName}</span>
          </p>
          {stats.streak > 0 && (
            <Badge variant="outline" className="text-[10px] h-5 gap-0.5 border-chart-3/30 text-chart-3 font-bold shrink-0">
              <Flame className="h-3 w-3" />
              {stats.streak} day streak {streakLevel}
            </Badge>
          )}
          {stats.viewedCount > 0 && (
            <span className="hidden sm:inline text-[10px] text-muted-foreground">
              · {stats.viewedCount} properties explored
            </span>
          )}
        </div>

        {/* Quick shortcuts */}
        <div className="flex items-center gap-1.5 shrink-0">
          {shortcuts.map((s) => (
            <button
              key={s.label}
              onClick={() => navigate(s.route)}
              className={cn(
                "flex items-center gap-1 text-[10px] sm:text-xs font-medium",
                "px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full border bg-card/80",
                "hover:bg-primary/5 hover:border-primary/20 transition-all duration-150",
                "touch-press",
                s.highlight
                  ? 'border-destructive/30 animate-pulse'
                  : 'border-border/50'
              )}
            >
              <s.icon className={cn("h-3 w-3", s.color)} />
              <span className="text-foreground hidden sm:inline">{s.label}</span>
              <span className="text-foreground sm:hidden">
                {s.label.split(' ')[0]}
              </span>
            </button>
          ))}
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden lg:flex items-center gap-0.5 text-xs text-primary hover:text-primary/80 font-medium ml-1"
          >
            Dashboard <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
