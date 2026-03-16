import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Flame, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Contextual welcome-back banner for returning authenticated users.
 * Shows streak, saved count, and quick-resume shortcuts.
 * Only renders for logged-in users who have prior activity.
 */
export default function WelcomeBackStrip() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['welcome-back-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [favRes, viewRes, streakRes] = await Promise.all([
        supabase
          .from('favorites')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('ai_behavior_tracking')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('event_type', 'view'),
        supabase.rpc('get_user_checkin_streak' as any, { p_user_id: user.id }).then(res => ({ data: res.data, error: res.error })).catch(() => ({ data: null, error: null })),
      ]);

      return {
        savedCount: favRes.count || 0,
        viewedCount: viewRes.count || 0,
        streak: (streakRes.data?.[0] as any)?.streak_count || 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 120_000,
  });

  if (!user || !stats || (stats.savedCount === 0 && stats.viewedCount === 0)) return null;

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const shortcuts = [
    stats.savedCount > 0 && {
      label: `${stats.savedCount} Saved`,
      icon: Heart,
      route: '/saved',
      color: 'text-chart-1',
    },
    {
      label: 'AI Picks',
      icon: Sparkles,
      route: '/recommendations',
      color: 'text-chart-4',
    },
  ].filter(Boolean) as { label: string; icon: any; route: string; color: string }[];

  return (
    <div className="w-full bg-gradient-to-r from-primary/5 via-primary/[0.03] to-transparent border-b border-border/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
        {/* Greeting */}
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {getTimeGreeting()}, <span className="font-bold">{firstName}</span>
          </p>
          {stats.streak > 0 && (
            <span className="flex items-center gap-0.5 text-xs font-bold text-chart-3 shrink-0">
              <Flame className="h-3.5 w-3.5" />
              {stats.streak}
            </span>
          )}
        </div>

        {/* Quick shortcuts */}
        <div className="flex items-center gap-2 shrink-0">
          {shortcuts.map((s) => (
            <button
              key={s.label}
              onClick={() => navigate(s.route)}
              className={cn(
                "flex items-center gap-1 text-[11px] sm:text-xs font-medium",
                "px-2.5 py-1.5 rounded-full border border-border/50 bg-card/80",
                "hover:bg-primary/5 hover:border-primary/20 transition-all duration-150",
                "touch-press"
              )}
            >
              <s.icon className={cn("h-3 w-3", s.color)} />
              <span className="text-foreground">{s.label}</span>
            </button>
          ))}
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden sm:flex items-center gap-0.5 text-xs text-primary hover:text-primary/80 font-medium ml-1"
          >
            Dashboard <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
