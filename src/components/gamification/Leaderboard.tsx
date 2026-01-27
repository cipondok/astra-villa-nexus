import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, MessageSquare, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaderboard, LeaderboardCategory } from '@/hooks/useLeaderboard';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  defaultCategory?: LeaderboardCategory;
  showTabs?: boolean;
  limit?: number;
  className?: string;
}

const CATEGORY_CONFIG: Record<LeaderboardCategory, { label: string; icon: React.ReactNode; scoreLabel: string }> = {
  top_xp: { label: 'Top XP', icon: <Star className="h-4 w-4" />, scoreLabel: 'XP' },
  top_agents: { label: 'Top Agents', icon: <Crown className="h-4 w-4" />, scoreLabel: 'Inquiries' },
  rising_stars: { label: 'Rising Stars', icon: <TrendingUp className="h-4 w-4" />, scoreLabel: 'XP' },
  most_helpful: { label: 'Most Helpful', icon: <MessageSquare className="h-4 w-4" />, scoreLabel: 'Reviews' },
  engagement_kings: { label: 'Engagement', icon: <Zap className="h-4 w-4" />, scoreLabel: 'XP' }
};

const RANK_STYLES = {
  1: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: <Crown className="h-4 w-4 text-yellow-500" /> },
  2: { bg: 'bg-slate-300/10', border: 'border-slate-400/30', icon: <Medal className="h-4 w-4 text-slate-400" /> },
  3: { bg: 'bg-amber-600/10', border: 'border-amber-600/30', icon: <Medal className="h-4 w-4 text-amber-600" /> }
};

const Leaderboard = ({
  defaultCategory = 'top_xp',
  showTabs = true,
  limit = 10,
  className
}: LeaderboardProps) => {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>(defaultCategory);
  const { leaderboard, isLoading, currentUserRank } = useLeaderboard(activeCategory, limit);
  const { user } = useAuth();

  const config = CATEGORY_CONFIG[activeCategory];

  const renderLeaderboardContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      );
    }

    if (leaderboard.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No rankings yet. Be the first!</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {leaderboard.map((entry, index) => {
          const isCurrentUser = entry.user_id === user?.id;
          const rankStyle = RANK_STYLES[entry.rank as keyof typeof RANK_STYLES];

          return (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                rankStyle?.bg || 'bg-background',
                rankStyle?.border || 'border-border/50',
                isCurrentUser && 'ring-2 ring-primary/50'
              )}
            >
              {/* Rank */}
              <div className="w-8 flex items-center justify-center">
                {rankStyle?.icon || (
                  <span className="text-sm font-bold text-muted-foreground">
                    #{entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <Avatar className="h-9 w-9 border-2 border-background">
                <AvatarImage src={entry.avatar_url || undefined} />
                <AvatarFallback className="text-xs font-semibold bg-primary/10">
                  {entry.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Name & Level */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium text-sm truncate",
                    isCurrentUser && "text-primary"
                  )}>
                    {entry.full_name}
                  </span>
                  {isCurrentUser && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0">You</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Lv.{entry.level}</span>
                  {entry.badge_count > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Trophy className="h-3 w-3" /> {entry.badge_count}
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="font-bold text-sm">{entry.score.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">{config.scoreLabel}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  if (!showTabs) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderLeaderboardContent()}
          
          {currentUserRank && currentUserRank > limit && (
            <div className="mt-3 pt-3 border-t border-dashed">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Your rank:</span>
                <Badge variant="secondary">#{currentUserRank}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Leaderboards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as LeaderboardCategory)}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="top_xp" className="text-xs">
              <Star className="h-3 w-3 mr-1" /> Top XP
            </TabsTrigger>
            <TabsTrigger value="top_agents" className="text-xs">
              <Crown className="h-3 w-3 mr-1" /> Agents
            </TabsTrigger>
            <TabsTrigger value="most_helpful" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" /> Helpful
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="mt-0">
            {renderLeaderboardContent()}
          </TabsContent>
        </Tabs>

        {currentUserRank && currentUserRank > limit && (
          <div className="mt-3 pt-3 border-t border-dashed">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Your rank:</span>
              <Badge variant="secondary">#{currentUserRank}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
