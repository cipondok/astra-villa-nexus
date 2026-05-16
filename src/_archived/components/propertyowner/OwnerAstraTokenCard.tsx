import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  Calendar, 
  CheckCircle, 
  Flame, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Loader2,
  ChevronDown,
  Gift
} from 'lucide-react';
import { useAstraToken } from '@/hooks/useAstraToken';
import { useAstraWalletStats } from '@/hooks/useAstraWalletStats';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const OwnerAstraTokenCard: React.FC = () => {
  const {
    balance,
    checkinStatus,
    loadingBalance,
    performCheckin,
    isCheckingIn,
    formatTokenAmount,
    user
  } = useAstraToken();

  const { walletStats } = useAstraWalletStats();
  const [expanded, setExpanded] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const streak = checkinStatus?.currentStreak || 0;
  const hasCheckedIn = checkinStatus?.hasCheckedInToday || false;

  // After successful check-in, show celebration briefly
  useEffect(() => {
    if (justCheckedIn && hasCheckedIn) {
      const timer = setTimeout(() => setJustCheckedIn(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [justCheckedIn, hasCheckedIn]);

  const handleCheckin = () => {
    setJustCheckedIn(true);
    performCheckin();
  };

  if (!user) return null;

  const getMultiplier = () => {
    if (streak >= 30) return '3x';
    if (streak >= 14) return '2x';
    if (streak >= 7) return '1.5x';
    return '1x';
  };

  const getStreakProgress = () => {
    if (streak >= 30) return 100;
    if (streak >= 14) return ((streak - 14) / 16) * 100;
    if (streak >= 7) return ((streak - 7) / 7) * 100;
    return (streak / 7) * 100;
  };

  const getNextMilestone = () => {
    if (streak >= 30) return 'Max bonus!';
    if (streak >= 14) return `${30 - streak}d → 3x`;
    if (streak >= 7) return `${14 - streak}d → 2x`;
    return `${7 - streak}d → 1.5x`;
  };

  return (
    <Card 
      className="overflow-hidden bg-gradient-to-r from-chart-3/8 via-background to-chart-1/5 border-chart-3/20 transition-all duration-300"
    >
      {/* Collapsed Bar — always visible */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
        onClick={() => setExpanded(prev => !prev)}
      >
        {/* Icon */}
        <div className="h-6 w-6 rounded-md bg-chart-3/15 flex items-center justify-center shrink-0">
          <Coins className="h-3.5 w-3.5 text-chart-3" />
        </div>

        {/* Balance */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-foreground truncate">
            {loadingBalance ? '—' : formatTokenAmount(balance?.available_tokens || 0)}
          </span>
          <span className="text-[9px] text-muted-foreground">ASTRA</span>
        </div>

        {/* Streak pill */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Flame className="h-3 w-3 text-destructive" />
          <span className="text-[10px] font-medium text-foreground">{streak}d</span>
        </div>

        {/* Check-in area */}
        <div className="ml-auto flex items-center gap-1.5">
          {hasCheckedIn ? (
            <motion.div
              initial={justCheckedIn ? { scale: 0.5, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-0.5"
            >
              <CheckCircle className="h-3.5 w-3.5 text-chart-1" />
              {justCheckedIn && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-medium text-chart-1"
                >
                  +{formatTokenAmount(checkinStatus?.todayCheckin?.tokens_earned || 10)}
                </motion.span>
              )}
            </motion.div>
          ) : (
            <Button
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleCheckin(); }}
              disabled={isCheckingIn}
              className="h-6 text-[10px] px-2 rounded-full bg-gradient-to-r from-chart-1 to-chart-1/80 hover:from-chart-1/90 hover:to-chart-1/70 gap-1"
            >
              {isCheckingIn ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Calendar className="h-3 w-3" />
                  Check In
                </>
              )}
            </Button>
          )}

          {/* Expand arrow */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </motion.div>
        </div>
      </div>

      {/* Check-in celebration animation */}
      <AnimatePresence>
        {justCheckedIn && hasCheckedIn && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2">
              <motion.div 
                className="bg-chart-1/10 rounded-lg px-3 py-2 flex items-center gap-2"
                initial={{ scale: 0.95 }}
                animate={{ scale: [0.95, 1.02, 1] }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Gift className="h-4 w-4 text-chart-1" />
                </motion.div>
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-chart-1">
                    Daily Check-in Berhasil! 🎉
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    +{formatTokenAmount(checkinStatus?.todayCheckin?.tokens_earned || 10)} ASTRA • Streak {streak} hari
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2.5">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                <div className="bg-chart-3/10 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-muted-foreground leading-tight">Saldo</p>
                  <p className="text-sm font-bold text-chart-3 leading-tight mt-0.5">
                    {formatTokenAmount(balance?.available_tokens || 0)}
                  </p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-muted-foreground leading-tight">Lifetime</p>
                  <p className="text-xs font-bold text-foreground leading-tight mt-0.5">
                    {formatTokenAmount(balance?.lifetime_earned || 0)}
                  </p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-muted-foreground leading-tight">Hari ini</p>
                  <p className="text-xs font-bold text-chart-1 leading-tight mt-0.5">
                    +{formatTokenAmount(walletStats.todayRewards)}
                  </p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-muted-foreground leading-tight">Minggu</p>
                  <p className="text-xs font-bold text-primary leading-tight mt-0.5">
                    +{formatTokenAmount(walletStats.weekRewards)}
                  </p>
                </div>
              </div>

              {/* Streak Progress */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-destructive" />
                    <span className="text-[10px] font-medium">{streak}d streak</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-chart-3/30">
                      <Sparkles className="h-2 w-2 mr-0.5" />{getMultiplier()}
                    </Badge>
                  </div>
                  <span className="text-[9px] text-muted-foreground">{getNextMilestone()}</span>
                </div>
                <Progress value={getStreakProgress()} className="h-1" />
              </div>

              {/* Bottom row: hint + hub link */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-1 bg-chart-3/5 rounded-md px-2 py-1">
                  <TrendingUp className="h-3 w-3 text-chart-3 shrink-0" />
                  <p className="text-[9px] text-muted-foreground leading-tight">
                    Listing aktif & transaksi otomatis hasilkan bonus token
                  </p>
                </div>
                <Link to="/astra-tokens">
                  <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-chart-3/10 transition-colors gap-0.5 shrink-0">
                    Hub <ArrowRight className="h-2.5 w-2.5" />
                  </Badge>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default OwnerAstraTokenCard;
