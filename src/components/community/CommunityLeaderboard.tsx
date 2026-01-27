import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import {
  Trophy,
  Medal,
  Star,
  Crown,
  Flame,
  TrendingUp,
  Award,
  MapPin,
  MessageCircle,
  FileText,
  Calendar,
  ThumbsUp
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  total_points: number;
  guides_count: number;
  answers_count: number;
  reviews_count: number;
  events_organized: number;
  helpful_votes_received: number;
  current_tier: string;
  streak_days: number;
  badges_earned: string[];
}

const tierConfig: Record<string, { label: string; icon: React.ElementType; color: string; minPoints: number }> = {
  newcomer: { label: 'Newcomer', icon: Star, color: 'text-slate-500', minPoints: 0 },
  contributor: { label: 'Contributor', icon: Medal, color: 'text-amber-600', minPoints: 100 },
  expert: { label: 'Expert', icon: Trophy, color: 'text-yellow-500', minPoints: 500 },
  champion: { label: 'Champion', icon: Crown, color: 'text-purple-500', minPoints: 1000 },
  legend: { label: 'Legend', icon: Flame, color: 'text-red-500', minPoints: 2500 },
};

const pointsConfig = {
  guide_created: { points: 50, label: 'Neighborhood Guide' },
  question_asked: { points: 5, label: 'Question Asked' },
  answer_given: { points: 10, label: 'Answer Given' },
  review_written: { points: 15, label: 'Review Written' },
  event_organized: { points: 30, label: 'Event Organized' },
  helpful_vote: { points: 2, label: 'Helpful Vote Received' },
};

interface CommunityLeaderboardProps {
  className?: string;
}

const CommunityLeaderboard: React.FC<CommunityLeaderboardProps> = ({ className }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('community_leaderboard')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLeaderboard((data || []).map(entry => ({
        ...entry,
        badges_earned: entry.badges_earned as string[] || []
      })));

      // Check current user's rank
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const rank = (data || []).findIndex(entry => entry.user_id === user.id);
        if (rank !== -1) setCurrentUserRank(rank + 1);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNextTier = (currentTier: string, points: number) => {
    const tiers = Object.entries(tierConfig);
    const currentIndex = tiers.findIndex(([key]) => key === currentTier);
    if (currentIndex < tiers.length - 1) {
      const nextTier = tiers[currentIndex + 1];
      const pointsNeeded = nextTier[1].minPoints - points;
      return { tier: nextTier[0], label: nextTier[1].label, pointsNeeded };
    }
    return null;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Community Leaderboard
        </h2>
        <p className="text-muted-foreground">
          Top contributors in the community
        </p>
      </div>

      {/* Points Guide */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="h-4 w-4" />
            How to Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(pointsConfig).map(([key, config]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground">{config.label}</span>
                <Badge variant="secondary">+{config.points}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tier Progress */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {Object.entries(tierConfig).map(([key, config], index) => {
              const Icon = config.icon;
              return (
                <div key={key} className="flex flex-col items-center text-center">
                  <Icon className={cn('h-6 w-6 mb-1', config.color)} />
                  <span className="text-xs font-medium">{config.label}</span>
                  <span className="text-[10px] text-muted-foreground">{config.minPoints}+ pts</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardContent className="p-4">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No contributors yet</h3>
              <p className="text-sm text-muted-foreground">
                Be the first to contribute to the community!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const tier = tierConfig[entry.current_tier] || tierConfig.newcomer;
                const TierIcon = tier.icon;
                const nextTier = getNextTier(entry.current_tier, entry.total_points);

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg transition-colors',
                      index < 3 && 'bg-gradient-to-r from-primary/5 to-transparent',
                      currentUserRank === index + 1 && 'ring-2 ring-primary'
                    )}
                  >
                    {/* Rank */}
                    <div className="w-10 flex justify-center shrink-0">
                      {getRankIcon(index + 1)}
                    </div>

                    {/* User */}
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>U{index + 1}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">User {index + 1}</span>
                        <Badge variant="outline" className={cn('text-xs', tier.color)}>
                          <TierIcon className="h-3 w-3 mr-1" />
                          {tier.label}
                        </Badge>
                        {entry.streak_days >= 7 && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">
                            <Flame className="h-3 w-3 mr-1" />
                            {entry.streak_days}d streak
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {entry.guides_count} guides
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {entry.answers_count} answers
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {entry.helpful_votes_received} helpful
                        </span>
                      </div>

                      {nextTier && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress to {nextTier.label}</span>
                            <span>{nextTier.pointsNeeded} pts needed</span>
                          </div>
                          <Progress 
                            value={((entry.total_points - tierConfig[entry.current_tier].minPoints) / 
                                   (tierConfig[nextTier.tier].minPoints - tierConfig[entry.current_tier].minPoints)) * 100} 
                            className="h-1" 
                          />
                        </div>
                      )}
                    </div>

                    {/* Points */}
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold text-primary">
                        {entry.total_points.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityLeaderboard;
