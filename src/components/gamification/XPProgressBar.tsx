import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGamification } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';

interface XPProgressBarProps {
  variant?: 'compact' | 'full';
  showTitle?: boolean;
  className?: string;
}

const XPProgressBar = ({ 
  variant = 'compact', 
  showTitle = true,
  className 
}: XPProgressBarProps) => {
  const { stats, getProgressToNextLevel, getUserTitle, statsLoading } = useGamification();

  if (statsLoading || !stats) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-lg h-12", className)} />
    );
  }

  const progress = getProgressToNextLevel();
  const title = getUserTitle();
  const isMaxLevel = stats.current_level >= 10;

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge variant="secondary" className="text-xs font-bold bg-primary/10 text-primary">
          Lv.{stats.current_level}
        </Badge>
        <div className="flex-1 min-w-[60px]">
          <Progress value={progress.percentage} className="h-1.5" />
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          {stats.total_xp} XP
        </span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border/50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-lg font-black text-primary-foreground">
              {stats.current_level}
            </span>
          </div>
          <div>
            {showTitle && (
              <div className="text-sm font-semibold">{title}</div>
            )}
            <div className="text-xs text-muted-foreground">
              {stats.total_xp.toLocaleString()} XP Total
            </div>
          </div>
        </div>
        
        {stats.current_streak > 0 && (
          <Badge className="bg-orange-500/10 text-orange-600 border-orange-200">
            🔥 {stats.current_streak} day streak
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Level {stats.current_level}
          </span>
          {!isMaxLevel && (
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {progress.current}/{progress.required} to Level {stats.current_level + 1}
            </span>
          )}
        </div>
        
        <div className="relative">
          <Progress 
            value={progress.percentage} 
            className="h-2.5"
          />
          {progress.percentage > 80 && !isMaxLevel && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-1 -top-1"
            >
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </motion.div>
          )}
        </div>
        
        {isMaxLevel && (
          <div className="text-center text-xs text-primary font-medium flex items-center justify-center gap-1 mt-1">
            <Sparkles className="h-3 w-3" />
            Maximum Level Reached!
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default XPProgressBar;
