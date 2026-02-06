import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Flame, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/contexts/AuthContext';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { usePopupQueue } from '@/hooks/usePopupQueue';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';
import { getLocalDayKey, safeLocalStorage, safeSessionStorage, storageSupport } from '@/lib/safeStorage';

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
  const [shouldShow, setShouldShow] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Prevent re-showing in this session even after close
  const hasShownThisSessionRef = useRef(false);

  // Popup queue integration - medium priority with 4s stagger
  const popupQueue = usePopupQueue('daily-login-reward', 'medium', { delay: 4000 });

  const showPopup = useCallback(() => setIsOpen(true), []);
  const hidePopup = useCallback(() => setIsOpen(false), []);

  // Register with popup queue
  useEffect(() => {
    popupQueue.register(showPopup, hidePopup);
    return () => popupQueue.unregister();
  }, [showPopup, hidePopup]);

  // Notify queue when popup closes
  useEffect(() => {
    if (!isOpen && shouldShow) {
      popupQueue.notifyHidden();
    }
  }, [isOpen, shouldShow]);

  // Check if already claimed TODAY using database (LOCAL calendar day based)
  useEffect(() => {
    const checkClaimStatus = async () => {
      if (!autoShow || !user?.id) {
        setIsCheckingStatus(false);
        return;
      }

      // If storage is not persistent (private/restricted mode), fail-closed to prevent popup looping on refresh.
      if (!storageSupport.session && !storageSupport.local) {
        setAlreadyClaimed(true);
        setIsCheckingStatus(false);
        return;
      }

      const today = getLocalDayKey();
      const sessionKey = `daily_login_shown_${user.id}`;
      const dismissSessionKey = `daily_login_dismissed_${user.id}`;
      const dismissDateKey = `daily_login_dismissed_date_${user.id}`;

      const dismissedThisSession = safeSessionStorage.getItem(dismissSessionKey) === 'true';
      const dismissedToday = safeLocalStorage.getItem(dismissDateKey) === today;

      // If dismissed, never show again (session/day)
      if (dismissedThisSession || dismissedToday) {
        setAlreadyClaimed(true);
        setIsCheckingStatus(false);
        return;
      }

      // Check session flag FIRST - don't show popup again if already shown this session
      if (safeSessionStorage.getItem(sessionKey) === 'true' || hasShownThisSessionRef.current) {
        setAlreadyClaimed(true);
        setIsCheckingStatus(false);
        return;
      }

      try {
        // Check if user has a checkin record for TODAY in the database
        const { data: todayCheckin, error } = await supabase
          .from('astra_daily_checkins')
          .select('id, checkin_date')
          .eq('user_id', user.id)
          .eq('checkin_date', today)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking daily claim status:', error);
        }

        if (todayCheckin) {
          // Already claimed today - mark session and don't show popup
          safeSessionStorage.setItem(sessionKey, 'true');
          setAlreadyClaimed(true);
          setIsCheckingStatus(false);
          return;
        }

        // Also check localStorage with TODAY's date for faster UI response
        const claimKey = `daily_login_date_${user.id}`;
        const lastClaimDate = safeLocalStorage.getItem(claimKey);

        if (lastClaimDate === today) {
          safeSessionStorage.setItem(sessionKey, 'true');
          setAlreadyClaimed(true);
          setIsCheckingStatus(false);
          return;
        }

        // Not claimed today - show the popup (only once per session)
        hasShownThisSessionRef.current = true;
        safeSessionStorage.setItem(sessionKey, 'true');
        setShouldShow(true);
        setIsCheckingStatus(false);

        // Request to show via queue after delay
        setTimeout(() => {
          popupQueue.requestShow();
        }, 4000);
      } catch (error) {
        console.error('Error in daily claim check:', error);
        setIsCheckingStatus(false);
      }
    };

    checkClaimStatus();
  }, [autoShow, user?.id]);

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

      // Successfully claimed - store TODAY's DATE in localStorage (local calendar day)
      const today = getLocalDayKey();
      const claimKey = `daily_login_date_${user.id}`;
      safeLocalStorage.setItem(claimKey, today);

      setClaimResult(result);
      setClaimed(true);
      setAlreadyClaimed(true); // Prevent re-showing

      // Confetti effect
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB'],
      });
    } catch (error) {
      console.error('Failed to claim daily login:', error);
    }
  };

  const handleClose = () => {
    // If user closes without claiming, treat as dismissed for the rest of the session + day.
    if (user?.id) {
      const today = getLocalDayKey();
      safeSessionStorage.setItem(`daily_login_dismissed_${user.id}`, 'true');
      safeLocalStorage.setItem(`daily_login_dismissed_date_${user.id}`, today);
      safeSessionStorage.setItem(`daily_login_shown_${user.id}`, 'true');
    }

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
