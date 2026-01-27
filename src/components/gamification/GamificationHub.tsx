import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Gift, TrendingUp, Award, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import XPProgressBar from './XPProgressBar';
import BadgeDisplay from './BadgeDisplay';
import Leaderboard from './Leaderboard';
import AchievementShare from './AchievementShare';

import { useGamification, Achievement } from '@/hooks/useGamification';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface GamificationHubProps {
  variant?: 'full' | 'compact' | 'widget';
  className?: string;
}

const GamificationHub = ({ variant = 'full', className }: GamificationHubProps) => {
  const { user, profile } = useAuth();
  const { stats, achievements, xpHistory, userBadges, allBadges } = useGamification();
  const [shareAchievement, setShareAchievement] = useState<Achievement | null>(null);

  const earnedBadgeCount = userBadges?.length || 0;
  const totalBadgeCount = allBadges?.length || 0;

  if (variant === 'widget') {
    return (
      <Card className={cn("border-primary/20", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold text-sm">Your Progress</span>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {earnedBadgeCount}/{totalBadgeCount} badges
            </Badge>
          </div>
          <XPProgressBar variant="compact" />
          <div className="mt-3">
            <BadgeDisplay variant="inline" maxDisplay={4} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Gamification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <XPProgressBar variant="full" />
          
          <div>
            <div className="text-sm font-medium mb-2 flex items-center gap-1">
              <Award className="h-3.5 w-3.5" /> Recent Badges
            </div>
            <BadgeDisplay variant="inline" maxDisplay={6} showLocked />
          </div>

          {stats?.current_streak && stats.current_streak > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-medium">{stats.current_streak} day streak!</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <div className={cn("space-y-6", className)}>
      {/* Hero Stats */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Your Achievements
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Track your progress and earn rewards
              </p>
            </div>
            
            {stats && (
              <div className="text-right">
                <div className="text-3xl font-black text-primary">{stats.total_xp.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total XP</div>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <XPProgressBar variant="full" />
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="badges" className="text-xs">
            <Award className="h-3.5 w-3.5 mr-1" /> Badges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-xs">
            <Trophy className="h-3.5 w-3.5 mr-1" /> Rankings
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            <TrendingUp className="h-3.5 w-3.5 mr-1" /> Activity
          </TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs">
            <Star className="h-3.5 w-3.5 mr-1" /> Milestones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Your Badges</CardTitle>
                <Badge variant="secondary">{earnedBadgeCount}/{totalBadgeCount}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <BadgeDisplay variant="grid" showLocked />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Leaderboard showTabs limit={10} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">XP Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {xpHistory?.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div>
                        <div className="font-medium text-sm capitalize">
                          {tx.action_type.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.description || 'XP earned'}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={cn(
                          "font-bold",
                          tx.xp_amount > 0 
                            ? "bg-green-500/10 text-green-600" 
                            : "bg-red-500/10 text-red-600"
                        )}>
                          {tx.xp_amount > 0 ? '+' : ''}{tx.xp_amount} XP
                        </Badge>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {(!xpHistory || xpHistory.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No activity yet. Start earning XP!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {achievements?.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-border/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                        {achievement.achievement_type === 'badge_earned' ? '🏆' :
                         achievement.achievement_type === 'level_up' ? '⬆️' : '🌟'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm capitalize">
                          {achievement.achievement_type.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {achievement.share_text?.slice(0, 50)}...
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShareAchievement(achievement)}
                        className="h-8 w-8 p-0"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}

                  {(!achievements || achievements.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Gift className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Complete actions to earn achievements!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      {shareAchievement && (
        <AchievementShare
          achievement={shareAchievement}
          isOpen={!!shareAchievement}
          onClose={() => setShareAchievement(null)}
        />
      )}
    </div>
  );
};

export default GamificationHub;
