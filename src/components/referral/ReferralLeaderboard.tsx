import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Users, Star, Flame, Award, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ReferrerEntry {
  affiliate_id: string;
  user_id: string;
  rank: number;
  total_referrals: number;
  total_earnings: number;
  display_name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  badge_icon: React.ReactNode;
  badge_label: string;
  is_current_user: boolean;
}

const TIER_CONFIG = {
  bronze: { 
    min: 1, label: 'Bronze', 
    icon: <Award className="h-3.5 w-3.5" />,
    className: 'bg-chart-3/15 text-chart-3 border-chart-3/30'
  },
  silver: { 
    min: 5, label: 'Silver', 
    icon: <Medal className="h-3.5 w-3.5" />,
    className: 'bg-muted text-muted-foreground border-muted-foreground/30'
  },
  gold: { 
    min: 15, label: 'Gold', 
    icon: <Crown className="h-3.5 w-3.5" />,
    className: 'bg-gold-primary/15 text-gold-primary border-gold-primary/30'
  },
  platinum: { 
    min: 30, label: 'Platinum', 
    icon: <Star className="h-3.5 w-3.5" />,
    className: 'bg-chart-1/15 text-chart-1 border-chart-1/30'
  },
  diamond: { 
    min: 50, label: 'Diamond', 
    icon: <Flame className="h-3.5 w-3.5" />,
    className: 'bg-chart-4/15 text-chart-4 border-chart-4/30'
  },
};

const RANK_STYLES: Record<number, { bg: string; border: string; icon: React.ReactNode }> = {
  1: { bg: 'bg-gold-primary/10', border: 'border-gold-primary/30', icon: <Crown className="h-5 w-5 text-gold-primary" /> },
  2: { bg: 'bg-muted/30', border: 'border-muted-foreground/30', icon: <Medal className="h-5 w-5 text-muted-foreground" /> },
  3: { bg: 'bg-chart-3/10', border: 'border-chart-3/30', icon: <Medal className="h-5 w-5 text-chart-3" /> },
};

const ANONYMIZED_NAMES = [
  'Eagle', 'Phoenix', 'Falcon', 'Hawk', 'Panther',
  'Tiger', 'Wolf', 'Dragon', 'Lion', 'Bear',
  'Cobra', 'Viper', 'Jaguar', 'Raven', 'Fox',
];

function getTier(referrals: number): ReferrerEntry['tier'] {
  if (referrals >= 50) return 'diamond';
  if (referrals >= 30) return 'platinum';
  if (referrals >= 15) return 'gold';
  if (referrals >= 5) return 'silver';
  return 'bronze';
}

function anonymizeName(userId: string, index: number): string {
  // Deterministic anonymization based on user_id hash
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const name = ANONYMIZED_NAMES[hash % ANONYMIZED_NAMES.length];
  return `${name} #${(hash % 900 + 100)}`;
}

interface ReferralLeaderboardProps {
  limit?: number;
  className?: string;
}

const ReferralLeaderboard = ({ limit = 10, className }: ReferralLeaderboardProps) => {
  const { user } = useAuth();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['referral-leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliates')
        .select('id, user_id, total_referrals, total_earnings')
        .gt('total_referrals', 0)
        .order('total_referrals', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!data) return [];

      return data.map((aff, index): ReferrerEntry => {
        const isCurrentUser = aff.user_id === user?.id;
        const tier = getTier(aff.total_referrals || 0);
        const tierConfig = TIER_CONFIG[tier];

        return {
          affiliate_id: aff.id,
          user_id: aff.user_id,
          rank: index + 1,
          total_referrals: aff.total_referrals || 0,
          total_earnings: aff.total_earnings || 0,
          display_name: isCurrentUser ? 'You' : anonymizeName(aff.user_id, index),
          tier,
          badge_icon: tierConfig.icon,
          badge_label: tierConfig.label,
          is_current_user: isCurrentUser,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  const currentUserEntry = entries.find(e => e.is_current_user);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold-primary" />
            Top Referrers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold-primary" />
            Top Referrers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-center py-6 text-muted-foreground">
            <Share2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No referrers yet. Share and climb the ranks!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Trophy className="h-4 w-4 text-gold-primary" />
          Top Referrers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-1.5">
          {entries.map((entry, index) => {
            const rankStyle = RANK_STYLES[entry.rank];
            const tierConfig = TIER_CONFIG[entry.tier];

            return (
              <motion.div
                key={entry.affiliate_id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className={cn(
                  "flex items-center gap-2.5 p-2.5 rounded-lg border transition-all",
                  rankStyle?.bg || 'bg-background',
                  rankStyle?.border || 'border-border/50',
                  entry.is_current_user && 'ring-2 ring-primary/50'
                )}
              >
                {/* Rank */}
                <div className="w-7 flex items-center justify-center flex-shrink-0">
                  {rankStyle?.icon || (
                    <span className="text-xs font-bold text-muted-foreground">
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-8 w-8 border-2 border-background flex-shrink-0">
                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                    {entry.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Tier Badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "font-medium text-sm truncate",
                      entry.is_current_user && "text-primary"
                    )}>
                      {entry.display_name}
                    </span>
                    {entry.is_current_user && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0">You</Badge>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-[9px] px-1.5 py-0 gap-0.5 mt-0.5", tierConfig.className)}
                  >
                    {tierConfig.icon}
                    {tierConfig.label}
                  </Badge>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-sm">{entry.total_referrals}</div>
                  <div className="text-[10px] text-muted-foreground">Referrals</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Current user rank if not in top list */}
        {user && !currentUserEntry && (
          <div className="mt-3 pt-3 border-t border-dashed border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>Share properties to join the leaderboard!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralLeaderboard;
