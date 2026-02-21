import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAstraToken } from '@/hooks/useAstraToken';
import { useAstraWalletStats } from '@/hooks/useAstraWalletStats';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Coins, 
  Gift, 
  TrendingUp, 
  Calendar,
  Flame,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface AstraWalletCardProps {
  compact?: boolean;
}

const AstraWalletCard: React.FC<AstraWalletCardProps> = ({ compact = false }) => {
  const { user, profile } = useAuth();
  const { balance, loadingBalance, performCheckin, isCheckingIn, checkinStatus } = useAstraToken();
  const { walletStats, isLoading } = useAstraWalletStats();
  const navigate = useNavigate();

  const isVerified = profile?.verification_status === 'verified';
  const canTransfer = isVerified && (balance?.available_tokens || 0) >= 1000;

  const formatTokenAmount = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  // Get weekly check-in data
  const getWeeklyCheckinData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayOffset + index);
      const dateStr = date.toISOString().split('T')[0];
      const isPast = date < new Date(today.toDateString());
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;
      
      // Check if this day was checked in (simplified - would need actual data)
      const wasCheckedIn = walletStats.lastCheckin === dateStr || 
        (isToday && checkinStatus?.hasCheckedInToday);
      
      // Base reward is 10 tokens, with streak bonus
      const baseReward = 10;
      const missedReward = isPast && !wasCheckedIn ? baseReward : 0;
      
      return {
        day,
        date: dateStr,
        isToday,
        isPast,
        isFuture,
        wasCheckedIn,
        missedReward
      };
    });
  };

  const weeklyData = getWeeklyCheckinData();

  if (compact) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 border-amber-500/20">
        <CardContent className="p-3 space-y-3">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ASTRA Balance</p>
                <p className="text-lg font-bold">{formatTokenAmount(balance?.available_tokens || 0)}</p>
              </div>
            </div>
            
            {/* Daily Check-in Button */}
            {!checkinStatus?.hasCheckedInToday && walletStats.canClaimToday ? (
              <Button 
                size="sm" 
                onClick={() => performCheckin()}
                disabled={isCheckingIn}
                className="h-8 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {isCheckingIn ? (
                  <Sparkles className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Gift className="h-3 w-3 mr-1" />
                    Check-in
                  </>
                )}
              </Button>
            ) : (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Done
              </Badge>
            )}
          </div>

          {/* Weekly Check-in Tracker */}
          <div className="bg-background/30 rounded-lg p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground font-medium">Weekly Check-ins</span>
              {walletStats.currentStreak > 0 && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="h-3 w-3" />
                  <span className="text-[10px] font-bold">{walletStats.currentStreak}</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weeklyData.map((dayData) => (
                <div 
                  key={dayData.day}
                  className={`text-center p-1 rounded transition-all ${
                    dayData.isToday 
                      ? 'bg-amber-500/20 ring-1 ring-amber-500/50' 
                      : dayData.wasCheckedIn 
                        ? 'bg-emerald-500/20' 
                        : dayData.isPast 
                          ? 'bg-destructive/10' 
                          : 'bg-muted/30'
                  }`}
                >
                  <p className={`text-[9px] font-medium ${
                    dayData.isToday 
                      ? 'text-amber-400' 
                      : dayData.wasCheckedIn 
                        ? 'text-emerald-400' 
                        : dayData.isPast 
                          ? 'text-destructive' 
                          : 'text-muted-foreground'
                  }`}>
                    {dayData.day}
                  </p>
                  <div className="h-4 flex items-center justify-center">
                    {dayData.wasCheckedIn ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    ) : dayData.isPast ? (
                      <span className="text-[8px] text-destructive">-{dayData.missedReward}</span>
                    ) : dayData.isToday ? (
                      <Sparkles className="h-3 w-3 text-amber-400" />
                    ) : (
                      <span className="text-[8px] text-muted-foreground">+10</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View Wallet Link */}
          <Button 
            variant="ghost"
            size="sm" 
            onClick={() => navigate('/astra-tokens')}
            className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            View Full Wallet <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-orange-500/5" />
      <CardContent className="p-3 space-y-2.5 relative">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Wallet className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold">ASTRA Wallet</span>
          </div>
          {isVerified && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] px-1.5 py-0">
              <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />
              Verified
            </Badge>
          )}
        </div>

        {/* Main Balance - Compact */}
        <div className="text-center py-2 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
          <p className="text-[9px] text-muted-foreground mb-0.5">Available Balance</p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-1.5"
          >
            <Coins className="h-4 w-4 text-amber-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {loadingBalance ? '...' : formatTokenAmount(balance?.available_tokens || 0)}
            </span>
          </motion.div>
        </div>

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="text-center p-1.5 bg-muted/50 rounded-md">
            <Gift className="h-3 w-3 mx-auto text-chart-4 mb-0.5" />
            <p className="text-[10px] font-semibold">{formatTokenAmount(walletStats.todayRewards)}</p>
            <p className="text-[8px] text-muted-foreground">Today</p>
          </div>
          <div className="text-center p-1.5 bg-muted/50 rounded-md">
            <Calendar className="h-3 w-3 mx-auto text-accent-foreground mb-0.5" />
            <p className="text-[10px] font-semibold">{formatTokenAmount(walletStats.weekRewards)}</p>
            <p className="text-[8px] text-muted-foreground">Week</p>
          </div>
          <div className="text-center p-1.5 bg-muted/50 rounded-md">
            <TrendingUp className="h-3 w-3 mx-auto text-emerald-500 mb-0.5" />
            <p className="text-[10px] font-semibold">{formatTokenAmount(walletStats.totalRewards)}</p>
            <p className="text-[8px] text-muted-foreground">Total</p>
          </div>
        </div>

        {/* Streak Info - Compact */}
        {walletStats.currentStreak > 0 && (
          <div className="flex items-center justify-center gap-1.5 py-1.5 bg-orange-500/10 rounded-md">
            <Flame className="h-3 w-3 text-orange-500" />
            <span className="text-[10px] font-medium">{walletStats.currentStreak} Day Streak!</span>
          </div>
        )}

        {/* Daily Check-in Button - Compact */}
        {walletStats.canClaimToday && !checkinStatus?.hasCheckedInToday ? (
          <Button 
            onClick={() => performCheckin()}
            disabled={isCheckingIn}
            size="sm"
            className="w-full h-8 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isCheckingIn ? (
              <>
                <Sparkles className="h-3 w-3 mr-1.5 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Gift className="h-3 w-3 mr-1.5" />
                Claim Daily Reward
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-1.5 py-1.5 text-emerald-600 bg-emerald-500/10 rounded-md">
            <CheckCircle2 className="h-3 w-3" />
            <span className="text-[10px] font-medium">Daily reward claimed!</span>
          </div>
        )}

        {/* Transfer Eligibility - Compact */}
        <div className="text-center pt-1.5 border-t border-border/50">
          {isVerified ? (
            canTransfer ? (
              <p className="text-[9px] text-emerald-600">
                <ShieldCheck className="h-2.5 w-2.5 inline mr-0.5" />
                You can transfer tokens
              </p>
            ) : (
              <p className="text-[9px] text-muted-foreground">
                Need 1,000+ tokens for transfers
              </p>
            )
          ) : (
            <p className="text-[9px] text-amber-600">
              Verify account to enable transfers
            </p>
          )}
        </div>

        {/* View Full Wallet - Compact */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/astra-tokens')}
          className="w-full h-7 text-[10px] text-muted-foreground hover:text-foreground"
        >
          View Full Wallet
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AstraWalletCard;
