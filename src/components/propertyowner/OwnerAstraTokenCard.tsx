import React from 'react';
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
  Loader2
} from 'lucide-react';
import { useAstraToken } from '@/hooks/useAstraToken';
import { useAstraWalletStats } from '@/hooks/useAstraWalletStats';
import { Link } from 'react-router-dom';

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

  if (!user) return null;

  const streak = checkinStatus?.currentStreak || 0;
  const hasCheckedIn = checkinStatus?.hasCheckedInToday || false;

  // Streak milestone logic
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
    <Card className="p-3 sm:p-4 bg-gradient-to-br from-chart-3/8 via-background to-chart-1/5 border-chart-3/20">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-md bg-chart-3/15 flex items-center justify-center">
            <Coins className="h-3.5 w-3.5 text-chart-3" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-foreground">ASTRA Wallet</span>
        </div>
        <Link to="/astra-tokens">
          <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-chart-3/10 transition-colors gap-0.5">
            Hub <ArrowRight className="h-2.5 w-2.5" />
          </Badge>
        </Link>
      </div>

      {/* Balance + Stats Grid */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-2.5">
        {/* Main Balance */}
        <div className="bg-chart-3/10 rounded-lg p-2 sm:p-2.5 text-center col-span-1">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">Saldo</p>
          <p className="text-sm sm:text-base font-bold text-chart-3 leading-tight mt-0.5">
            {loadingBalance ? '—' : formatTokenAmount(balance?.available_tokens || 0)}
          </p>
        </div>
        {/* Lifetime */}
        <div className="bg-muted/40 rounded-lg p-2 sm:p-2.5 text-center">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">Lifetime</p>
          <p className="text-xs sm:text-sm font-bold text-foreground leading-tight mt-0.5">
            {formatTokenAmount(balance?.lifetime_earned || 0)}
          </p>
        </div>
        {/* Today Earned */}
        <div className="bg-muted/40 rounded-lg p-2 sm:p-2.5 text-center">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">Hari ini</p>
          <p className="text-xs sm:text-sm font-bold text-chart-1 leading-tight mt-0.5">
            +{formatTokenAmount(walletStats.todayRewards)}
          </p>
        </div>
        {/* Week Earned */}
        <div className="bg-muted/40 rounded-lg p-2 sm:p-2.5 text-center">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">Minggu ini</p>
          <p className="text-xs sm:text-sm font-bold text-primary leading-tight mt-0.5">
            +{formatTokenAmount(walletStats.weekRewards)}
          </p>
        </div>
      </div>

      {/* Check-in + Streak Row */}
      <div className="flex items-center gap-2">
        {/* Check-in Button or Done Badge */}
        {hasCheckedIn ? (
          <div className="flex items-center gap-1 bg-chart-1/10 rounded-md px-2 py-1.5 shrink-0">
            <CheckCircle className="h-3 w-3 text-chart-1" />
            <span className="text-[10px] sm:text-xs font-medium text-chart-1">Checked in</span>
            {checkinStatus?.todayCheckin && (
              <Badge variant="secondary" className="text-[9px] h-4 px-1">
                +{formatTokenAmount(checkinStatus.todayCheckin.tokens_earned)}
              </Badge>
            )}
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => performCheckin()}
            disabled={isCheckingIn}
            className="h-7 sm:h-8 text-[10px] sm:text-xs px-2.5 bg-gradient-to-r from-chart-1 to-chart-1/80 hover:from-chart-1/90 hover:to-chart-1/70 shrink-0"
          >
            {isCheckingIn ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Calendar className="h-3 w-3 mr-1" />
            )}
            Check In
          </Button>
        )}

        {/* Streak Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-destructive" />
              <span className="text-[10px] sm:text-xs font-medium text-foreground">{streak}d streak</span>
              <Badge variant="outline" className="text-[9px] h-4 px-1 border-chart-3/30">
                <Sparkles className="h-2 w-2 mr-0.5" />{getMultiplier()}
              </Badge>
            </div>
            <span className="text-[9px] text-muted-foreground">{getNextMilestone()}</span>
          </div>
          <Progress value={getStreakProgress()} className="h-1" />
        </div>
      </div>

      {/* Owner Reward Hint */}
      <div className="mt-2 flex items-center gap-1.5 bg-chart-3/5 rounded-md px-2 py-1.5">
        <TrendingUp className="h-3 w-3 text-chart-3 shrink-0" />
        <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">
          Listing aktif & transaksi properti otomatis menghasilkan bonus ASTRA token
        </p>
      </div>
    </Card>
  );
};

export default OwnerAstraTokenCard;
