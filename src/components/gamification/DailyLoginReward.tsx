import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Flame, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/contexts/AuthContext';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import confetti from 'canvas-confetti';

interface DailyLoginRewardProps {
  autoShow?: boolean;
}

const DailyLoginReward = ({ autoShow = true }: DailyLoginRewardProps) => {
  const { user } = useAuth();
  const { stats, claimDailyLogin } = useGamification();
  const [isOpen, setIsOpen] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimResult, setClaimResult] = useState<any>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  // Helper to check if last login was within 24 hours
  const hasClaimedWithin24Hours = (lastLoginDate: string | null) => {
    if (!lastLoginDate) return false;
    
    // Parse the date and check if it's within the last 24 hours
    const lastLogin = new Date(lastLoginDate);
    const now = new Date();
    const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceLastLogin < 24;
  };

  // Check if should show on mount
  useEffect(() => {
    if (!autoShow || !user?.id || !stats) return;

    // Check using localStorage for session persistence + 24hr check
    const claimKey = `daily_login_claimed_${user.id}`;
    const lastClaimTime = localStorage.getItem(claimKey);
    
    // Check if claimed within last 24 hours (using localStorage as backup)
    if (lastClaimTime) {
      const hoursSinceClaim = (Date.now() - parseInt(lastClaimTime)) / (1000 * 60 * 60);
      if (hoursSinceClaim < 24) {
        setAlreadyClaimed(true);
        return;
      }
    }

    // Also check database last_login_date
    if (hasClaimedWithin24Hours(stats.last_login_date)) {
      setAlreadyClaimed(true);
      return;
    }

    // Not claimed in 24 hours, show popup after delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [autoShow, user?.id, stats]);

  const handleClaim = async () => {
    if (!user?.id) return;
    
    try {
      const result = await claimDailyLogin.mutateAsync();
      
      // Check if already claimed (backend returned already_claimed)
      if (result?.already_claimed) {
        setAlreadyClaimed(true);
        setIsOpen(false);
        return;
      }
      
      // Successfully claimed - store in localStorage with timestamp
      const claimKey = `daily_login_claimed_${user.id}`;
      localStorage.setItem(claimKey, Date.now().toString());
      
      setClaimResult(result);
      setClaimed(true);
      
      // Confetti effect
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB']
      });
    } catch (error) {
      console.error('Failed to claim daily login:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setClaimed(false);
    setClaimResult(null);
  };

  // Streak milestones
  const getStreakMilestone = (streak: number) => {
    if (streak >= 30) return { days: 30, bonus: 100, next: null };
    if (streak >= 7) return { days: 7, bonus: 25, next: 30 };
    return { days: 0, bonus: 0, next: 7 };
  };

  const currentStreak = stats?.current_streak || 0;
  const milestone = getStreakMilestone(currentStreak);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background" autoClose={false}>
        <VisuallyHidden>
          <DialogTitle>Daily Login Reward</DialogTitle>
          <DialogDescription>Claim your daily XP bonus for logging in</DialogDescription>
        </VisuallyHidden>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <AnimatePresence mode="wait">
          {!claimed ? (
            <motion.div
              key="claim"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-6 text-center"
            >
              {/* Gift Icon */}
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [-3, 3, -3]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg"
              >
                <Gift className="h-10 w-10 text-white" />
              </motion.div>

              <h3 className="text-xl font-bold mb-1">Daily Login Reward!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Claim your daily XP bonus
              </p>

              {/* Current Streak */}
              {currentStreak > 0 && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge className="bg-orange-500/10 text-orange-600 px-3 py-1">
                    <Flame className="h-3 w-3 mr-1" />
                    {currentStreak} Day Streak!
                  </Badge>
                </div>
              )}

              {/* Reward Preview */}
              <div className="bg-primary/5 rounded-xl p-4 mb-4">
                <div className="text-3xl font-black text-primary mb-1">+5 XP</div>
                <div className="text-xs text-muted-foreground">Base Daily Reward</div>
                
                {milestone.next && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="text-xs text-muted-foreground">
                      🎯 {milestone.next - currentStreak} more days for +{milestone.next === 7 ? 25 : 100} XP bonus!
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleClaim}
                disabled={claimDailyLogin.isPending}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                {claimDailyLogin.isPending ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin" /> Claiming...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Claim Reward
                  </span>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="claimed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 text-center"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg"
              >
                <Check className="h-10 w-10 text-white" />
              </motion.div>

              <h3 className="text-xl font-bold mb-1">Reward Claimed!</h3>
              
              {/* XP Earned */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-primary/10 rounded-xl p-4 my-4"
              >
                <div className="text-4xl font-black text-primary mb-1">
                  +{claimResult?.xp_earned || 5} XP
                </div>
                {claimResult?.streak_bonus > 0 && (
                  <Badge className="bg-orange-500/10 text-orange-600">
                    <Flame className="h-3 w-3 mr-1" />
                    Includes {claimResult.streak_bonus} XP streak bonus!
                  </Badge>
                )}
              </motion.div>

              {/* Streak Info */}
              <div className="text-sm text-muted-foreground mb-4">
                <Flame className="h-4 w-4 inline mr-1 text-orange-500" />
                Current streak: <strong>{claimResult?.current_streak || currentStreak} days</strong>
              </div>

              <Button onClick={handleClose} variant="outline" className="w-full">
                Continue
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default DailyLoginReward;
