import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAstraToken } from '@/hooks/useAstraToken';
import { useAstraWalletStats } from '@/hooks/useAstraWalletStats';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
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
  ShieldCheck,
  X,
  Send,
  History
} from 'lucide-react';

interface AstraWalletPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AstraWalletPopup: React.FC<AstraWalletPopupProps> = ({ open, onOpenChange }) => {
  const { profile } = useAuth();
  const { balance, loadingBalance, performCheckin, isCheckingIn, checkinStatus } = useAstraToken();
  const { walletStats } = useAstraWalletStats();
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
      
      const wasCheckedIn = walletStats.lastCheckin === dateStr || 
        (isToday && checkinStatus?.hasCheckedInToday);
      
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

  const handleViewFullWallet = () => {
    onOpenChange(false);
    navigate('/astra-tokens');
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-gradient-to-br from-background via-background to-gold-primary/5 border-gold-primary/20" autoClose={false}>
        <VisuallyHidden>
          <DialogTitle>ASTRA Wallet</DialogTitle>
          <DialogDescription>View your ASTRA token balance, claim daily rewards, and manage wallet actions.</DialogDescription>
        </VisuallyHidden>
        <div className="relative bg-gradient-to-r from-gold-primary via-chart-5 to-gold-primary p-4 text-primary-foreground">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          <div className="relative flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ASTRA Wallet</h2>
              <p className="text-primary-foreground/80 text-xs">Your token balance & rewards</p>
            </div>
            {isVerified && (
              <Badge className="absolute top-0 right-0 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 text-[10px]">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Main Balance */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-4 bg-gradient-to-br from-gold-primary/10 to-gold-primary/5 rounded-xl border border-gold-primary/20"
          >
            <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
            <div className="flex items-center justify-center gap-2">
              <Coins className="h-6 w-6 text-gold-primary" />
              <span className="text-3xl font-bold bg-gradient-to-r from-gold-primary to-gold-primary/70 bg-clip-text text-transparent">
                {loadingBalance ? '...' : formatTokenAmount(balance?.available_tokens || 0)}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">ASTRA Tokens</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Gift className="h-4 w-4 mx-auto text-chart-4 mb-1" />
              <p className="text-sm font-semibold">{formatTokenAmount(walletStats.todayRewards)}</p>
              <p className="text-[10px] text-muted-foreground">Today</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-4 w-4 mx-auto text-chart-5 mb-1" />
              <p className="text-sm font-semibold">{formatTokenAmount(walletStats.weekRewards)}</p>
              <p className="text-[10px] text-muted-foreground">This Week</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <TrendingUp className="h-4 w-4 mx-auto text-chart-1 mb-1" />
              <p className="text-sm font-semibold">{formatTokenAmount(walletStats.totalRewards)}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
          </div>

          {/* Weekly Check-in Tracker */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Weekly Check-ins</span>
              {walletStats.currentStreak > 0 && (
                <div className="flex items-center gap-1 text-chart-3">
                  <Flame className="h-4 w-4" />
                  <span className="text-xs font-bold">{walletStats.currentStreak} day streak</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {weeklyData.map((dayData) => (
                <div 
                  key={dayData.day}
                  className={`text-center p-1.5 rounded-lg transition-all ${
                    dayData.isToday 
                      ? 'bg-gold-primary/20 ring-2 ring-gold-primary/50' 
                      : dayData.wasCheckedIn 
                        ? 'bg-chart-1/20' 
                        : dayData.isPast 
                          ? 'bg-destructive/10' 
                          : 'bg-background/50'
                  }`}
                >
                  <p className={`text-[10px] font-medium ${
                    dayData.isToday 
                      ? 'text-gold-primary' 
                      : dayData.wasCheckedIn 
                        ? 'text-chart-1' 
                        : dayData.isPast 
                          ? 'text-destructive' 
                          : 'text-muted-foreground'
                  }`}>
                    {dayData.day}
                  </p>
                  <div className="h-5 flex items-center justify-center">
                    {dayData.wasCheckedIn ? (
                      <CheckCircle2 className="h-4 w-4 text-chart-1" />
                    ) : dayData.isPast ? (
                      <span className="text-[9px] text-destructive">-{dayData.missedReward}</span>
                    ) : dayData.isToday ? (
                      <Sparkles className="h-4 w-4 text-gold-primary" />
                    ) : (
                      <span className="text-[9px] text-muted-foreground">+10</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Check-in Button */}
          {walletStats.canClaimToday && !checkinStatus?.hasCheckedInToday ? (
            <Button 
              onClick={() => performCheckin()}
              disabled={isCheckingIn}
              className="w-full bg-gradient-to-r from-gold-primary to-gold-primary/80 hover:from-gold-primary/90 hover:to-gold-primary/70"
            >
              {isCheckingIn ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Claim Daily Reward (+10 ASTRA)
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 text-chart-1 bg-chart-1/10 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Daily reward claimed!</span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewFullWallet}
              className="text-xs"
            >
              <History className="h-3.5 w-3.5 mr-1.5" />
              Transaction History
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewFullWallet}
              disabled={!canTransfer}
              className="text-xs"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Transfer Tokens
            </Button>
          </div>

          {/* Transfer Eligibility Info */}
          <div className="text-center pt-2 border-t border-border/50">
            {isVerified ? (
              canTransfer ? (
                <p className="text-xs text-chart-1">
                  <ShieldCheck className="h-3 w-3 inline mr-1" />
                  You can transfer tokens to other users
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Need 1,000+ tokens to enable transfers
                </p>
              )
            ) : (
              <p className="text-xs text-chart-3">
                Verify your account to enable transfers
              </p>
            )}
          </div>

          {/* View Full Wallet Link */}
          <Button 
            variant="ghost" 
            onClick={handleViewFullWallet}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            View Full ASTRA Hub
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AstraWalletPopup;
