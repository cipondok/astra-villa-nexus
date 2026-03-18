import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Target, Flame, Lock, CheckCircle2,
  TrendingUp, Bookmark, Brain, Users, Share2, BarChart3, Bell,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useGamification,
  INVESTOR_XP_ACTIONS,
  INVESTOR_TIER_REWARDS,
  LEVEL_THRESHOLDS,
} from '@/hooks/useGamification';
import { cn } from '@/lib/utils';

const TIER_ICONS: Record<number, typeof Trophy> = {
  1: Target, 2: Bookmark, 3: Star, 4: Brain, 5: BarChart3,
  6: TrendingUp, 7: Flame, 8: Trophy, 9: Star, 10: Trophy,
};

const TIER_COLORS: Record<number, { ring: string; bg: string; text: string }> = {
  1: { ring: 'ring-muted-foreground/30', bg: 'bg-muted/50', text: 'text-muted-foreground' },
  2: { ring: 'ring-muted-foreground/30', bg: 'bg-muted/50', text: 'text-muted-foreground' },
  3: { ring: 'ring-chart-3/40', bg: 'bg-chart-3/10', text: 'text-chart-3' },
  4: { ring: 'ring-chart-3/40', bg: 'bg-chart-3/10', text: 'text-chart-3' },
  5: { ring: 'ring-muted-foreground/50', bg: 'bg-muted-foreground/10', text: 'text-muted-foreground' },
  6: { ring: 'ring-primary/40', bg: 'bg-primary/10', text: 'text-primary' },
  7: { ring: 'ring-primary/50', bg: 'bg-primary/15', text: 'text-primary' },
  8: { ring: 'ring-chart-4/50', bg: 'bg-chart-4/10', text: 'text-chart-4' },
  9: { ring: 'ring-accent/50', bg: 'bg-accent/10', text: 'text-accent' },
  10: { ring: 'ring-accent/60', bg: 'bg-accent/15', text: 'text-accent' },
};

const ACTION_ICONS: Record<string, typeof Trophy> = {
  save_opportunity: Bookmark,
  complete_roi_simulation: BarChart3,
  read_market_insight: Brain,
  complete_learning_action: Brain,
  referral_sent: Users,
  referral_converted: Users,
  watchlist_review: Star,
  property_inquiry: Target,
  ai_recommendation_explored: TrendingUp,
  price_alert_set: Bell,
  portfolio_analysis: BarChart3,
  social_share: Share2,
};

interface Props {
  variant?: 'full' | 'compact';
  className?: string;
}

export default function InvestorEngagementPanel({ variant = 'full', className }: Props) {
  const { stats, getProgressToNextLevel, getUserTitle, xpHistory } = useGamification();
  const progress = getProgressToNextLevel();
  const title = getUserTitle();
  const currentLevel = stats?.current_level || 1;
  const totalXP = stats?.total_xp || 0;

  if (variant === 'compact') {
    return (
      <Card className={cn('border-primary/20', className)}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center ring-2', TIER_COLORS[currentLevel]?.ring, TIER_COLORS[currentLevel]?.bg)}>
                {(() => { const Icon = TIER_ICONS[currentLevel] || Target; return <Icon className={cn('h-4 w-4', TIER_COLORS[currentLevel]?.text)} />; })()}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-[10px] text-muted-foreground">Level {currentLevel} • {totalXP.toLocaleString()} XP</p>
              </div>
            </div>
            {stats?.current_streak && stats.current_streak > 0 && (
              <Badge variant="outline" className="text-[10px] gap-1 border-chart-3/30 text-chart-3">
                🔥 {stats.current_streak}d
              </Badge>
            )}
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Level {currentLevel}</span>
              <span>{progress.current}/{progress.required} XP</span>
            </div>
            <Progress value={progress.percentage} className="h-1.5" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <div className={cn('space-y-4', className)}>
      {/* Hero Level Card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden border-primary/20">
          <div className="bg-gradient-to-r from-primary/[0.08] via-accent/[0.04] to-primary/[0.08] p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center ring-2 shadow-lg',
                  TIER_COLORS[currentLevel]?.ring,
                  TIER_COLORS[currentLevel]?.bg,
                )}>
                  {(() => { const Icon = TIER_ICONS[currentLevel] || Target; return <Icon className={cn('h-6 w-6', TIER_COLORS[currentLevel]?.text)} />; })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{title}</h2>
                  <p className="text-sm text-muted-foreground">Level {currentLevel} Investor</p>
                  {stats?.current_streak && stats.current_streak > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm">🔥</span>
                      <span className="text-xs font-medium text-chart-3">{stats.current_streak} day streak</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-primary">{totalXP.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total XP</div>
              </div>
            </div>

            {/* Progress to next level */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progress to Level {Math.min(currentLevel + 1, 10)}</span>
                <span>{progress.percentage.toFixed(0)}%</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
              <p className="text-[10px] text-muted-foreground mt-1">
                {progress.required - progress.current} XP to next level
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* XP Point Sources */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(INVESTOR_XP_ACTIONS).map(([key, action]) => {
              const Icon = ACTION_ICONS[key] || Star;
              return (
                <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50">
                  <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="text-[11px] text-foreground truncate">{action.label}</span>
                  <Badge variant="outline" className="ml-auto text-[9px] flex-shrink-0">+{action.xp}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tier Roadmap */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Investor Tier Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(INVESTOR_TIER_REWARDS).map(([levelStr, tier]) => {
              const level = Number(levelStr);
              const isUnlocked = currentLevel >= level;
              const isCurrent = currentLevel === level;
              const tierColor = TIER_COLORS[level];
              const Icon = TIER_ICONS[level] || Target;
              const threshold = LEVEL_THRESHOLDS[level - 1] || 0;

              return (
                <motion.div
                  key={level}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: level * 0.04 }}
                  className={cn(
                    'p-3 rounded-lg border transition-colors',
                    isCurrent
                      ? 'border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20'
                      : isUnlocked
                        ? 'border-border/50 bg-muted/20'
                        : 'border-border/30 bg-muted/10 opacity-60',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', tierColor?.bg)}>
                      {isUnlocked
                        ? <Icon className={cn('h-4 w-4', tierColor?.text)} />
                        : <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{tier.unlockLabel}</span>
                        {isCurrent && (
                          <Badge variant="default" className="text-[9px] h-4">Current</Badge>
                        )}
                        {isUnlocked && !isCurrent && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-chart-1 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Level {level} • {threshold.toLocaleString()} XP required
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tier.benefits.map(b => (
                          <Badge key={b} variant="outline" className="text-[9px] font-normal">{b}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent XP Activity */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1.5">
              {xpHistory && xpHistory.length > 0 ? xpHistory.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-2 rounded bg-muted/20"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground capitalize truncate">
                      {tx.action_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={cn('text-[10px]', tx.xp_amount > 0 ? 'bg-chart-1/10 text-chart-1' : 'bg-destructive/10 text-destructive')}>
                    {tx.xp_amount > 0 ? '+' : ''}{tx.xp_amount} XP
                  </Badge>
                </motion.div>
              )) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Start exploring to earn XP!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
