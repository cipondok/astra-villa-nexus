import React, { useState } from 'react';
import { useMortgageCalculator, calculateMortgage } from '@/hooks/useMortgageCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calculator, TrendingUp, Building2, ArrowRight, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import MortgageCalculator from './MortgageCalculator';

interface PropertyMortgageWidgetProps {
  propertyPrice: number;
  propertyId: string;
  className?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const PropertyMortgageWidget: React.FC<PropertyMortgageWidgetProps> = ({
  propertyPrice,
  propertyId,
  className
}) => {
  const { banks, rates, isLoading, compareAllBanks } = useMortgageCalculator();
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTermYears, setLoanTermYears] = useState(15);
  const [showFullCalculator, setShowFullCalculator] = useState(false);

  const downPayment = (propertyPrice * downPaymentPercent) / 100;
  const loanAmount = propertyPrice - downPayment;

  // Get best rate
  const comparisons = compareAllBanks(propertyPrice, downPayment, loanTermYears);
  const bestOption = comparisons[0];

  // Quick calculation with average rate
  const quickCalc = calculateMortgage({
    propertyPrice,
    downPayment,
    loanTermYears,
    interestRate: bestOption?.interest_rate || 7.0
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            KPR Estimator
          </CardTitle>
          {bestOption && (
            <Badge variant="secondary" className="text-xs">
              From {bestOption.interest_rate}% p.a.
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Property Price Display */}
        <div className="text-center pb-2">
          <p className="text-sm text-muted-foreground">Property Price</p>
          <p className="text-xl font-bold">{formatCurrency(propertyPrice)}</p>
        </div>

        <Separator />

        {/* Down Payment Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Down Payment</span>
            <span className="font-medium">{downPaymentPercent}%</span>
          </div>
          <Slider
            value={[downPaymentPercent]}
            onValueChange={([value]) => setDownPaymentPercent(value)}
            min={10}
            max={50}
            step={5}
            className="py-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(downPayment)}</span>
            <span>Loan: {formatCurrency(loanAmount)}</span>
          </div>
        </div>

        {/* Loan Term Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Loan Term</span>
            <span className="font-medium">{loanTermYears} years</span>
          </div>
          <Slider
            value={[loanTermYears]}
            onValueChange={([value]) => setLoanTermYears(value)}
            min={5}
            max={25}
            step={5}
            className="py-1"
          />
        </div>

        <Separator />

        {/* Quick Result */}
        <div className="bg-primary/10 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Payment</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(quickCalc.monthlyPayment)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Based on {bestOption?.interest_rate || 7}% interest rate
          </p>
        </div>

        {/* Best Bank Option */}
        {bestOption && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{bestOption.bank_name}</p>
                <p className="text-xs text-muted-foreground">{bestOption.rate_name}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              <Percent className="h-3 w-3 mr-1" />
              {bestOption.interest_rate}%
            </Badge>
          </div>
        )}

        {/* Compare Banks */}
        {comparisons.length > 1 && (
          <p className="text-xs text-center text-muted-foreground">
            Compare with {comparisons.length - 1} more banks
          </p>
        )}

        {/* Full Calculator Dialog */}
        <Dialog open={showFullCalculator} onOpenChange={setShowFullCalculator}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <TrendingUp className="h-4 w-4 mr-2" />
              Compare All Banks
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <MortgageCalculator 
              propertyPrice={propertyPrice} 
              propertyId={propertyId}
            />
          </DialogContent>
        </Dialog>

        <p className="text-[10px] text-muted-foreground text-center">
          *Estimates only. Actual rates may vary based on your profile.
        </p>
      </CardContent>
    </Card>
  );
};

export default PropertyMortgageWidget;
