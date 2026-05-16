import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  const { profile } = useAuth();
  const { balance, loadingBalance, performCheckin, isCheckingIn, checkinStatus } = useAstraToken();
  const { walletStats } = useAstraWalletStats();
  const navigate = useNavigate();

  const isVerified = profile?.verification_status === 'verified';

  const formatTokenAmount = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  return (
    <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-3 relative space-y-0">
        {/* Top Row: Icon + Balance + Action */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-gold-primary to-chart-3 flex items-center justify-center shadow-sm">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground leading-tight">ASTRA Wallet</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold leading-tight tracking-tight"
              >
                {loadingBalance ? '...' : formatTokenAmount(balance?.available_tokens || 0)}
                <span className="text-[10px] font-normal text-muted-foreground ml-1">tokens</span>
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isVerified && (
              <ShieldCheck className="h-3.5 w-3.5 text-chart-1" aria-label="Verified" />
            )}
            {walletStats.canClaimToday && !checkinStatus?.hasCheckedInToday ? (
              <Button 
                onClick={() => performCheckin()}
                disabled={isCheckingIn}
                size="sm"
                className="h-7 px-2.5 text-[10px] bg-gradient-to-r from-gold-primary to-chart-3 hover:from-gold-primary/90 hover:to-chart-3/90 shadow-sm"
              >
                {isCheckingIn ? (
                  <Sparkles className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Gift className="h-3 w-3 mr-1" />
                    Claim
                  </>
                )}
              </Button>
            ) : (
              <Badge variant="outline" className="h-6 text-[9px] border-chart-1/30 text-chart-1 bg-chart-1/5">
                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                Claimed
              </Badge>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30 my-2" />

        {/* Bottom Row: Stats + Streak + Link */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <Gift className="h-3 w-3 text-chart-4" aria-hidden="true" />
              <span className="font-medium">{formatTokenAmount(walletStats.todayRewards)}</span>
              <span className="text-muted-foreground">today</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-accent-foreground" aria-hidden="true" />
              <span className="font-medium">{formatTokenAmount(walletStats.weekRewards)}</span>
              <span className="text-muted-foreground">week</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-chart-1" aria-hidden="true" />
              <span className="font-medium">{formatTokenAmount(walletStats.totalRewards)}</span>
              <span className="text-muted-foreground">total</span>
            </div>
            {walletStats.currentStreak > 0 && (
              <div className="flex items-center gap-0.5 text-chart-3 ml-1">
                <Flame className="h-3 w-3" />
                <span className="font-bold">{walletStats.currentStreak}d</span>
              </div>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/astra-tokens')}
            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground shrink-0"
          >
            Wallet <ArrowRight className="h-3 w-3 ml-0.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AstraWalletCard;
