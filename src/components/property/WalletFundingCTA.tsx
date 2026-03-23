import { memo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Price from '@/components/ui/Price';

interface WalletFundingCTAProps {
  propertyPrice: number;
  onAuthRequired?: () => void;
}

const WalletFundingCTA = memo(({ propertyPrice, onAuthRequired }: WalletFundingCTAProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const minDeposit = Math.max(2_000_000, Math.round(propertyPrice * 0.01)); // 1% or Rp 2M minimum

  const handleFunding = () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }
    navigate('/wallet');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.3 }}
      className="rounded-xl border border-gold-primary/20 bg-gradient-to-r from-gold-primary/[0.04] to-card overflow-hidden"
    >
      <div className="p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gold-primary/10">
            <Wallet className="h-3.5 w-3.5 text-gold-primary" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Ready to Invest?</h3>
            <p className="text-[9px] text-muted-foreground">Fund your wallet to reserve this property</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/30">
          <Shield className="h-3 w-3 text-emerald-500 flex-shrink-0" />
          <p className="text-[10px] text-muted-foreground">
            Start with <span className="font-bold text-foreground"><Price amount={minDeposit} short /></span> reservation deposit
          </p>
        </div>

        <Button
          onClick={handleFunding}
          className="w-full h-8 text-[10px] font-semibold bg-gradient-to-r from-gold-primary to-gold-primary/80 text-background gap-1.5 active:scale-95 transition-transform"
        >
          <Wallet className="h-3 w-3" />
          Fund Wallet & Reserve
          <ArrowRight className="h-3 w-3" />
        </Button>

        <p className="text-[8px] text-muted-foreground text-center italic">
          Funds secured via regulated payment partners and protected by escrow workflow.
        </p>
      </div>
    </motion.div>
  );
});

WalletFundingCTA.displayName = 'WalletFundingCTA';
export default WalletFundingCTA;
