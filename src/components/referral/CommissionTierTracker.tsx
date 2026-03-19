import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Award, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface CommissionTier {
  tier: string;
  minReferrals: number;
  rate: number;
  bonus: number;
}

interface Props {
  currentTier: CommissionTier;
  nextTier: CommissionTier | null;
  allTiers: CommissionTier[];
  convertedCount: number;
}

const tierColors: Record<string, string> = {
  Bronze: 'bg-amber-700/20 text-amber-600 border-amber-700/30',
  Silver: 'bg-slate-300/20 text-slate-500 border-slate-400/30',
  Gold: 'bg-yellow-400/20 text-yellow-600 border-yellow-500/30',
  Platinum: 'bg-sky-300/20 text-sky-500 border-sky-400/30',
  Diamond: 'bg-violet-400/20 text-violet-500 border-violet-500/30',
};

const CommissionTierTracker = ({ currentTier, nextTier, allTiers, convertedCount }: Props) => {
  const progressToNext = nextTier
    ? Math.min(100, Math.round(((convertedCount - currentTier.minReferrals) / (nextTier.minReferrals - currentTier.minReferrals)) * 100))
    : 100;

  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          Commission Tier
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">
        {/* Current tier highlight */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <Badge className={`${tierColors[currentTier.tier] || ''} text-xs`}>
                {currentTier.tier}
              </Badge>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(currentTier.rate * 100)}% commission rate
              </p>
            </div>
          </div>
          {nextTier && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowRight className="h-3 w-3" />
              <Badge variant="outline" className="text-[10px]">
                {nextTier.tier} at {nextTier.minReferrals}
              </Badge>
            </div>
          )}
        </motion.div>

        {/* Progress to next tier */}
        {nextTier && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{convertedCount} conversions</span>
              <span>{nextTier.minReferrals} needed</span>
            </div>
            <Progress value={progressToNext} className="h-1.5" />
          </div>
        )}

        {/* All tiers */}
        <div className="grid gap-1.5">
          {allTiers.map((t) => {
            const isActive = t.tier === currentTier.tier;
            const isLocked = convertedCount < t.minReferrals;
            return (
              <div
                key={t.tier}
                className={`flex items-center justify-between p-2 rounded-md text-xs border transition-colors ${
                  isActive
                    ? 'bg-primary/10 border-primary/20'
                    : isLocked
                    ? 'bg-muted/30 border-border/30 opacity-60'
                    : 'bg-muted/50 border-border/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${tierColors[t.tier] || ''}`}>
                    {t.tier}
                  </Badge>
                  <span className="text-muted-foreground">{t.minReferrals}+ referrals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{(t.rate * 100)}%</span>
                  {t.bonus > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      +IDR {(t.bonus / 1000).toFixed(0)}K bonus
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommissionTierTracker;
