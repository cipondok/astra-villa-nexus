import { Shield, Wallet, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface EscrowCommitmentCTAProps {
  suggestedDeposit: number;
  walletBalance?: number;
  propertyPrice?: number;
  probability?: number;
  dealId?: string;
  onInitiateEscrow?: () => void;
  className?: string;
}

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

const EscrowCommitmentCTA = ({
  suggestedDeposit,
  walletBalance = 0,
  propertyPrice = 0,
  probability = 0,
  onInitiateEscrow,
  className,
}: EscrowCommitmentCTAProps) => {
  const navigate = useNavigate();
  const hasSufficientBalance = walletBalance >= suggestedDeposit;
  const depositPercentage = propertyPrice > 0 ? ((suggestedDeposit / propertyPrice) * 100).toFixed(1) : '1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn('border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5', className)}>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Secure Property via Escrow</h3>
            </div>
            {probability > 0 && (
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                <TrendingUp className="h-3 w-3 mr-1" />
                {probability}% match
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Escrow allows you to reserve the property while completing due diligence. 
            Your deposit ({depositPercentage}%) is fully protected.
          </p>

          {/* Deposit amount */}
          <div className="bg-muted/50 rounded-lg p-3 border border-border/50 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Reservation Deposit</span>
              <span className="font-semibold text-foreground">{formatIDR(suggestedDeposit)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Your Wallet Balance</span>
              <span className={cn('font-medium', hasSufficientBalance ? 'text-chart-1' : 'text-destructive')}>
                {formatIDR(walletBalance)}
              </span>
            </div>
            {walletBalance > 0 && (
              <Progress value={Math.min(100, (walletBalance / suggestedDeposit) * 100)} className="h-1.5" />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {hasSufficientBalance ? (
              <Button
                onClick={onInitiateEscrow}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                size="sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Secure via Escrow
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/onboarding/investor')}
                  variant="default"
                  className="flex-1"
                  size="sm"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Fund Wallet
                </Button>
                <Button
                  onClick={onInitiateEscrow}
                  variant="outline"
                  className="flex-1 border-primary/30"
                  size="sm"
                  disabled
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Secure via Escrow
                </Button>
              </>
            )}
          </div>

          {/* Trust microcopy */}
          <p className="text-[10px] text-muted-foreground text-center">
            Funds remain protected until transaction conditions are satisfied. Full refund if verification fails.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EscrowCommitmentCTA;
