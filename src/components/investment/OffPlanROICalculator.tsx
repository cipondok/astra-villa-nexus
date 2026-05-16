import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calculator, TrendingUp, PiggyBank, Clock } from 'lucide-react';
import Price from '@/components/ui/Price';
import { cn } from '@/lib/utils';

interface OffPlanROICalculatorProps {
  defaultPurchasePrice?: number;
  defaultCompletionValue?: number;
  className?: string;
}

export default function OffPlanROICalculator({ defaultPurchasePrice = 2_000_000_000, defaultCompletionValue = 2_600_000_000, className }: OffPlanROICalculatorProps) {
  const [purchasePrice, setPurchasePrice] = useState(defaultPurchasePrice);
  const [completionValue, setCompletionValue] = useState(defaultCompletionValue);
  const [rentalYield, setRentalYield] = useState(7.5);
  const [holdingYears, setHoldingYears] = useState(3);

  const metrics = useMemo(() => {
    const capitalGain = completionValue - purchasePrice;
    const capitalGainPct = (capitalGain / purchasePrice) * 100;
    const annualizedROI = Math.pow(1 + capitalGainPct / 100, 1 / Math.max(holdingYears, 1)) - 1;
    const monthlyRental = Math.round(completionValue * (rentalYield / 100) / 12);
    const breakEvenMonths = monthlyRental > 0 ? Math.ceil(purchasePrice / monthlyRental) : 0;
    const breakEvenYears = (breakEvenMonths / 12).toFixed(1);
    const totalReturn = capitalGain + (monthlyRental * 12 * holdingYears);

    return { capitalGain, capitalGainPct, annualizedROI: annualizedROI * 100, monthlyRental, breakEvenYears, totalReturn };
  }, [purchasePrice, completionValue, rentalYield, holdingYears]);

  return (
    <Card className={cn('border-border/50 bg-card', className)}>
      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
      <CardHeader className="p-3 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calculator className="h-4 w-4 text-primary" />
          Off-Plan ROI Calculator
          <Badge className="text-[8px] bg-primary/10 text-primary border-primary/20 ml-auto">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">
        {/* Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-muted-foreground font-medium">Purchase Price (IDR)</label>
            <Input
              type="number"
              value={purchasePrice}
              onChange={e => setPurchasePrice(Number(e.target.value))}
              className="h-8 text-xs mt-1"
            />
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground font-medium">Est. Completion Value</label>
            <Input
              type="number"
              value={completionValue}
              onChange={e => setCompletionValue(Number(e.target.value))}
              className="h-8 text-xs mt-1"
            />
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground font-medium">Rental Yield (%)</label>
            <Input
              type="number"
              step="0.1"
              value={rentalYield}
              onChange={e => setRentalYield(Number(e.target.value))}
              className="h-8 text-xs mt-1"
            />
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground font-medium">Holding Period (years)</label>
            <Input
              type="number"
              value={holdingYears}
              onChange={e => setHoldingYears(Number(e.target.value))}
              className="h-8 text-xs mt-1"
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-[9px] text-muted-foreground">Capital Gain</span>
            </div>
            <p className="text-sm font-black text-primary">+{metrics.capitalGainPct.toFixed(1)}%</p>
            <p className="text-[9px] text-muted-foreground"><Price amount={metrics.capitalGain} short /></p>
          </div>
          <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-[9px] text-muted-foreground">Annualized ROI</span>
            </div>
            <p className="text-sm font-black text-primary">{metrics.annualizedROI.toFixed(1)}%</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-1 mb-0.5">
              <PiggyBank className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">Monthly Rent</span>
            </div>
            <p className="text-xs font-bold text-foreground"><Price amount={metrics.monthlyRental} short /></p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-1 mb-0.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">Break Even</span>
            </div>
            <p className="text-xs font-bold text-foreground">{metrics.breakEvenYears} yrs</p>
          </div>
        </div>

        {/* Total return */}
        <div className="p-2.5 rounded-lg bg-gradient-to-r from-primary/[0.06] to-transparent border border-primary/10">
          <p className="text-[9px] text-muted-foreground mb-0.5">Total Projected Return ({holdingYears}yr)</p>
          <p className="text-sm font-black text-foreground"><Price amount={metrics.totalReturn} short /></p>
        </div>

        <p className="text-[8px] text-muted-foreground text-center italic">
          Estimates only. Actual returns may vary. Not financial advice.
        </p>
      </CardContent>
    </Card>
  );
}
