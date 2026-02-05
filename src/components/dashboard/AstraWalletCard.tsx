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

  if (compact) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 border-amber-500/20">
        <CardContent className="p-3">
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
            <Button 
              size="sm" 
              onClick={() => navigate('/astra-tokens')}
              className="h-8 text-xs"
            >
              View Wallet <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-orange-500/5" />
      <CardHeader className="pb-2 relative">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold">ASTRA Wallet</span>
          </div>
          {isVerified && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {/* Main Balance */}
        <div className="text-center py-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
          <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <Coins className="h-6 w-6 text-amber-500" />
            <span className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {loadingBalance ? '...' : formatTokenAmount(balance?.available_tokens || 0)}
            </span>
          </motion.div>
          <p className="text-[10px] text-muted-foreground mt-1">ASTRA Tokens</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Gift className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-xs font-semibold">{formatTokenAmount(walletStats.todayRewards)}</p>
            <p className="text-[9px] text-muted-foreground">Today</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 mx-auto text-purple-500 mb-1" />
            <p className="text-xs font-semibold">{formatTokenAmount(walletStats.weekRewards)}</p>
            <p className="text-[9px] text-muted-foreground">This Week</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <TrendingUp className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
            <p className="text-xs font-semibold">{formatTokenAmount(walletStats.totalRewards)}</p>
            <p className="text-[9px] text-muted-foreground">Total Earned</p>
          </div>
        </div>

        {/* Streak Info */}
        {walletStats.currentStreak > 0 && (
          <div className="flex items-center justify-center gap-2 py-2 bg-orange-500/10 rounded-lg">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-medium">{walletStats.currentStreak} Day Streak!</span>
          </div>
        )}

        {/* Daily Check-in Button */}
        {walletStats.canClaimToday && !checkinStatus?.hasCheckedInToday && (
          <Button 
            onClick={() => performCheckin()}
            disabled={isCheckingIn}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isCheckingIn ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Claim Daily Reward
              </>
            )}
          </Button>
        )}

        {(checkinStatus?.hasCheckedInToday || !walletStats.canClaimToday) && (
          <div className="flex items-center justify-center gap-2 py-2 text-emerald-600 bg-emerald-500/10 rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">Daily reward claimed!</span>
          </div>
        )}

        {/* Transfer Eligibility */}
        <div className="text-center pt-2 border-t border-border/50">
          {isVerified ? (
            canTransfer ? (
              <p className="text-[10px] text-emerald-600">
                <ShieldCheck className="h-3 w-3 inline mr-1" />
                You can transfer tokens to other users
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                Need 1,000+ tokens to enable transfers
              </p>
            )
          ) : (
            <p className="text-[10px] text-amber-600">
              Verify your account to enable token transfers
            </p>
          )}
        </div>

        {/* View Full Wallet */}
        <Button 
          variant="outline" 
          onClick={() => navigate('/astra-tokens')}
          className="w-full"
        >
          View Full Wallet
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AstraWalletCard;
