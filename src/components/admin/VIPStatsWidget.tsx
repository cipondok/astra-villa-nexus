import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Gem, Sparkles, Star, Shield, Users, TrendingUp } from 'lucide-react';
import { getMembershipFromUserLevel, MEMBERSHIP_LEVELS } from '@/types/membership';
import { cn } from '@/lib/utils';

interface VIPStatsWidgetProps {
  onNavigate?: (section: string) => void;
}

export function VIPStatsWidget({ onNavigate }: VIPStatsWidgetProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['vip-stats-widget'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_level_id, user_levels(name)');

      if (error) throw error;

      const counts: Record<string, number> = {
        diamond: 0,
        platinum: 0,
        gold: 0,
        vip: 0,
        verified: 0,
        basic: 0
      };

      data?.forEach((profile) => {
        const levelName = Array.isArray(profile.user_levels)
          ? profile.user_levels[0]?.name
          : (profile.user_levels as { name: string } | null)?.name;
        const membership = getMembershipFromUserLevel(levelName || undefined);
        counts[membership] = (counts[membership] || 0) + 1;
      });

      // Count users without a level as basic
      const usersWithoutLevel = data?.filter(p => !p.user_level_id).length || 0;
      counts.basic += usersWithoutLevel;

      return {
        counts,
        total: data?.length || 0,
        totalVIP: counts.diamond + counts.platinum + counts.gold + counts.vip
      };
    },
    staleTime: 60000,
  });

  const tiers = [
    { key: 'diamond', icon: Gem, label: 'Diamond' },
    { key: 'platinum', icon: Sparkles, label: 'Platinum' },
    { key: 'gold', icon: Crown, label: 'Gold' },
    { key: 'vip', icon: Star, label: 'VIP' },
    { key: 'verified', icon: Shield, label: 'Verified' },
  ];

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Crown className="h-4 w-4" />
            VIP Membership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onNavigate?.('user-levels')}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            VIP Membership
          </span>
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            {stats?.totalVIP || 0} VIPs
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tiers.map(({ key, icon: Icon, label }) => {
            const count = stats?.counts[key] || 0;
            const config = MEMBERSHIP_LEVELS[key as keyof typeof MEMBERSHIP_LEVELS];
            
            if (count === 0) return null;

            return (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border",
                  config.bgColor,
                  config.borderColor
                )}
              >
                <Icon className={cn("h-3 w-3", config.color)} />
                <span className={config.color}>{count}</span>
              </div>
            );
          })}
          
          {/* Basic users */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border bg-muted/50 border-border">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{stats?.counts.basic || 0}</span>
          </div>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          {stats?.total || 0} total users
        </div>
      </CardContent>
    </Card>
  );
}

export default VIPStatsWidget;
