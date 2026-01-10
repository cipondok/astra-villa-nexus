import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calculator, Percent, Calendar, Banknote, TrendingDown, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KPRCalculatorProps {
  propertyPrice: number;
  className?: string;
}

export const KPRCalculator: React.FC<KPRCalculatorProps> = ({ propertyPrice, className }) => {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(7.5);
  const [loanTerm, setLoanTerm] = useState(20);

  const calculations = useMemo(() => {
    const downPayment = (propertyPrice * downPaymentPercent) / 100;
    const loanAmount = propertyPrice - downPayment;
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    // Monthly payment formula: M = P[r(1+r)^n]/[(1+r)^n-1]
    let monthlyPayment = 0;
    if (monthlyInterestRate > 0) {
      monthlyPayment = 
        (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    } else {
      monthlyPayment = loanAmount / numberOfPayments;
    }

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    return {
      downPayment,
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      numberOfPayments,
    };
  }, [propertyPrice, downPaymentPercent, interestRate, loanTerm]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className={`border border-primary/10 bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Calculator className="h-4 w-4 text-primary" />
          </div>
          Simulasi KPR
          <Badge variant="outline" className="ml-auto text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
            Fitur Gratis
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5">
        {/* Property Price Display */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-xl border border-primary/15">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Harga Properti</span>
            <span className="text-sm sm:text-lg font-bold text-primary">{formatCurrency(propertyPrice)}</span>
          </div>
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
              Uang Muka (DP)
            </Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">{downPaymentPercent}%</Badge>
              <span className="text-xs sm:text-sm font-semibold">{formatCurrency(calculations.downPayment)}</span>
            </div>
          </div>
          <Slider
            value={[downPaymentPercent]}
            onValueChange={(value) => setDownPaymentPercent(value[0])}
            min={10}
            max={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>10%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Percent className="h-3.5 w-3.5 text-muted-foreground" />
              Suku Bunga (per tahun)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Rata-rata suku bunga KPR di Indonesia</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Badge variant="secondary" className="text-xs">{interestRate}%</Badge>
          </div>
          <Slider
            value={[interestRate]}
            onValueChange={(value) => setInterestRate(value[0])}
            min={5}
            max={15}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>5%</span>
            <span>15%</span>
          </div>
        </div>

        {/* Loan Term */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Jangka Waktu
            </Label>
            <Badge variant="secondary" className="text-xs">{loanTerm} tahun</Badge>
          </div>
          <Slider
            value={[loanTerm]}
            onValueChange={(value) => setLoanTerm(value[0])}
            min={5}
            max={30}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>5 tahun</span>
            <span>30 tahun</span>
          </div>
        </div>

        {/* Results */}
        <div className="pt-3 sm:pt-4 border-t border-border/50 space-y-3">
          {/* Monthly Payment - Highlighted */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 rounded-xl border border-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">Cicilan per Bulan</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(calculations.monthlyPayment)}</span>
            </div>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="p-2.5 sm:p-3 bg-muted/30 rounded-xl">
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Jumlah Pinjaman</div>
              <div className="text-xs sm:text-sm font-semibold">{formatCurrency(calculations.loanAmount)}</div>
            </div>
            <div className="p-2.5 sm:p-3 bg-muted/30 rounded-xl">
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Total Pembayaran</div>
              <div className="text-xs sm:text-sm font-semibold">{formatCurrency(calculations.totalPayment)}</div>
            </div>
            <div className="p-2.5 sm:p-3 bg-muted/30 rounded-xl">
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Total Bunga</div>
              <div className="text-xs sm:text-sm font-semibold text-orange-600">{formatCurrency(calculations.totalInterest)}</div>
            </div>
            <div className="p-2.5 sm:p-3 bg-muted/30 rounded-xl">
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Jumlah Cicilan</div>
              <div className="text-xs sm:text-sm font-semibold">{calculations.numberOfPayments}x</div>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            * Simulasi ini hanya perkiraan. Hubungi bank untuk informasi lebih lanjut.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPRCalculator;
