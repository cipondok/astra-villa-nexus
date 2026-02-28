import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, TrendingUp, MapPin, Home, DollarSign, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';

const BehaviorPatternBanner = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['user-behavior-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase.functions.invoke('smart-recommendation-engine', {
        body: { action: 'get_user_profile', userId: user.id }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading || !data?.profile?.hasEnoughData) return null;

  const profile = data.profile;
  const activity = data.activitySummary;

  // Build pattern chips from learned preferences
  const patterns: { icon: typeof MapPin; label: string; color: string }[] = [];

  if (profile.implicit.locationClusters.length > 0) {
    patterns.push({
      icon: MapPin,
      label: profile.implicit.locationClusters.slice(0, 2).join(', '),
      color: 'from-chart-1/20 to-chart-1/5 border-chart-1/30 text-chart-1',
    });
  }

  const topTypes = Object.entries(profile.implicit.dwellTimeByType)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 1)
    .map(([type]) => type);

  if (topTypes.length > 0) {
    patterns.push({
      icon: Home,
      label: topTypes[0].charAt(0).toUpperCase() + topTypes[0].slice(1),
      color: 'from-chart-4/20 to-chart-4/5 border-chart-4/30 text-chart-4',
    });
  }

  if (profile.implicit.viewedPriceRange.max !== Infinity && profile.implicit.viewedPriceRange.max > 0) {
    const maxB = profile.implicit.viewedPriceRange.max;
    const label = `< ${getCurrencyFormatterShort()(maxB)}`;
    patterns.push({
      icon: DollarSign,
      label,
      color: 'from-accent/20 to-accent/5 border-accent/30 text-accent',
    });
  }

  if (patterns.length === 0) return null;

  return (
    <div className="rounded-xl border border-accent/20 bg-gradient-to-r from-accent/5 via-background to-primary/5 p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
          <Brain className="h-3 w-3 text-primary-foreground" />
        </div>
        <span className="text-[10px] sm:text-xs font-semibold text-foreground">AI has learned your preferences</span>
        <div className="flex items-center gap-0.5 ml-auto">
          <TrendingUp className="h-3 w-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">{activity?.totalInteractions || 0} interactions analyzed</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {patterns.map((pattern, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] sm:text-[10px] font-medium bg-gradient-to-r backdrop-blur-sm",
              pattern.color
            )}
          >
            <pattern.icon className="h-2.5 w-2.5" />
            {pattern.label}
          </div>
        ))}
        <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-primary/20 text-[9px] sm:text-[10px] font-medium text-primary bg-gradient-to-r from-primary/10 to-primary/5">
          <Sparkles className="h-2.5 w-2.5" />
          Personalized for you
        </div>
      </div>
    </div>
  );
};

export default BehaviorPatternBanner;
