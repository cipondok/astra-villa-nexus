import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Shield, Flame, BarChart3, Wallet, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Price from '@/components/ui/Price';
import { useInvestmentScoreV2 } from '@/hooks/useInvestmentScoreV2';
import { useNavigate } from 'react-router-dom';

interface InvestmentHeroSummaryProps {
  propertyId: string;
  price: number;
  city?: string | null;
  propertyType?: string;
  onEscrowClick?: () => void;
  onAnalysisClick?: () => void;
}

const CITY_RATES: Record<string, number> = {
  bali: 10, seminyak: 12, canggu: 14, ubud: 9, jakarta: 6,
  bandung: 8, surabaya: 7, yogyakarta: 9, lombok: 12, default: 7,
};

const TYPE_YIELDS: Record<string, number> = {
  villa: 8.5, apartment: 6.2, house: 5.5, townhouse: 5.8, land: 0, commercial: 7.5, default: 6,
};

const InvestmentHeroSummary = memo(({
  propertyId, price, city, propertyType, onEscrowClick, onAnalysisClick,
}: InvestmentHeroSummaryProps) => {
  const navigate = useNavigate();
  const { data: scoreData } = useInvestmentScoreV2(propertyId);

  const metrics = useMemo(() => {
    const cityKey = Object.keys(CITY_RATES).find(k => city?.toLowerCase().includes(k)) || 'default';
    const appreciation = CITY_RATES[cityKey];
    const typeKey = propertyType?.toLowerCase() || 'default';
    const rentalYield = TYPE_YIELDS[typeKey] || TYPE_YIELDS.default;
    const threeYearGrowthLow = Math.round(appreciation * 2.5);
    const threeYearGrowthHigh = Math.round(appreciation * 3.5);
    return { appreciation, rentalYield, threeYearGrowthLow, threeYearGrowthHigh };
  }, [city, propertyType]);

  const investmentScore = scoreData?.investment_score ?? null;
  const grade = scoreData?.grade ?? null;

  const demandLevel = useMemo(() => {
    if (!investmentScore) return { label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
    if (investmentScore >= 75) return { label: 'High', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (investmentScore >= 50) return { label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { label: 'Low', color: 'text-muted-foreground', bg: 'bg-muted/30 border-border/30' };
  }, [investmentScore]);

  const gradeColors: Record<string, string> = {
    'A+': 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    'A': 'bg-green-500/15 text-green-500 border-green-500/30',
    'B+': 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    'B': 'bg-sky-500/15 text-sky-500 border-sky-500/30',
    'C': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    'D': 'bg-destructive/15 text-destructive border-destructive/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.04] via-card to-accent/[0.03] p-3 sm:p-4"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
              Investment Summary
              <CheckCircle2 className="h-3 w-3 text-chart-1" />
            </h3>
            <p className="text-[9px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 text-gold-primary" />
              AI-powered analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {investmentScore !== null && (
            <div className="flex items-center gap-1">
              <span className={cn('text-lg font-black', investmentScore >= 75 ? 'text-emerald-500' : investmentScore >= 50 ? 'text-primary' : 'text-amber-500')}>
                {investmentScore}
              </span>
              <span className="text-[9px] text-muted-foreground">/100</span>
            </div>
          )}
          {grade && (
            <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 h-5', gradeColors[grade] || gradeColors['C'])}>
              {grade}
            </Badge>
          )}
        </div>
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-card border border-border/30">
          <TrendingUp className="h-3 w-3 text-emerald-500 mx-auto mb-0.5" />
          <p className="text-[9px] text-muted-foreground">Est. Rental Yield</p>
          <p className="text-sm font-black text-foreground">{metrics.rentalYield}%</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-card border border-border/30">
          <BarChart3 className="h-3 w-3 text-primary mx-auto mb-0.5" />
          <p className="text-[9px] text-muted-foreground">3Y Appreciation</p>
          <p className="text-sm font-black text-foreground">{metrics.threeYearGrowthLow}–{metrics.threeYearGrowthHigh}%</p>
        </div>
        <div className={cn('text-center p-2 rounded-lg border', demandLevel.bg)}>
          <Flame className={cn('h-3 w-3 mx-auto mb-0.5', demandLevel.color)} />
          <p className="text-[9px] text-muted-foreground">Demand</p>
          <p className={cn('text-sm font-black', demandLevel.color)}>{demandLevel.label}</p>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-[10px] font-semibold border-primary/30 text-primary hover:bg-primary/10 gap-1"
          onClick={onAnalysisClick || (() => navigate('/investment?section=analysis'))}
        >
          <BarChart3 className="h-3 w-3" />
          Investment Analysis
        </Button>
        <Button
          size="sm"
          className="h-8 text-[10px] font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground gap-1"
          onClick={onEscrowClick}
        >
          <Shield className="h-3 w-3" />
          Reserve via Escrow
        </Button>
      </div>
    </motion.div>
  );
});

InvestmentHeroSummary.displayName = 'InvestmentHeroSummary';
export default InvestmentHeroSummary;
