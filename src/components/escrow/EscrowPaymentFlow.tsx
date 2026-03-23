import { useState } from 'react';
import { Shield, CheckCircle2, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EscrowPaymentFlowProps {
  propertyTitle: string;
  propertyPrice: number;
  suggestedDeposit: number;
  walletBalance: number;
  onConfirm: (depositAmount: number) => void;
  onCancel: () => void;
  className?: string;
}

const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

const STEPS = ['Confirm Terms', 'Choose Deposit', 'Confirm Transaction'];

const EscrowPaymentFlow = ({
  propertyTitle,
  propertyPrice,
  suggestedDeposit,
  walletBalance,
  onConfirm,
  onCancel,
  className,
}: EscrowPaymentFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDeposit, setSelectedDeposit] = useState(suggestedDeposit.toString());

  const depositOptions = [
    { value: Math.max(2000000, Math.round(propertyPrice * 0.01)), label: '1% Deposit' },
    { value: Math.max(5000000, Math.round(propertyPrice * 0.02)), label: '2% Deposit' },
    { value: Math.max(10000000, Math.round(propertyPrice * 0.05)), label: '5% Deposit' },
  ];

  const chosenAmount = parseInt(selectedDeposit) || suggestedDeposit;
  const canProceed = walletBalance >= chosenAmount;

  return (
    <Card className={cn('border-primary/20', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Escrow Payment
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            Step {currentStep + 1}/{STEPS.length}
          </Badge>
        </div>
        {/* Progress bar */}
        <div className="flex gap-1 mt-2">
          {STEPS.map((step, i) => (
            <div key={step} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn(
                  'h-1.5 w-full rounded-full transition-colors',
                  i <= currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
              <span className={cn('text-[9px]', i <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground')}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3 border border-border/50 space-y-2">
                <p className="text-xs font-medium text-foreground">{propertyTitle}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Property Price</span>
                  <span className="font-semibold text-foreground">{formatIDR(propertyPrice)}</span>
                </div>
              </div>
              <ul className="space-y-2 text-[11px] text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-chart-1 mt-0.5 flex-shrink-0" />Funds held in secure escrow until verification complete</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-chart-1 mt-0.5 flex-shrink-0" />Full refund if property fails verification</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-chart-1 mt-0.5 flex-shrink-0" />Dispute resolution support included</li>
              </ul>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <RadioGroup value={selectedDeposit} onValueChange={setSelectedDeposit} className="space-y-2">
                {depositOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-3 rounded-lg border border-border/50 p-3 hover:border-primary/30 transition-colors">
                    <RadioGroupItem value={opt.value.toString()} id={`dep-${opt.value}`} />
                    <Label htmlFor={`dep-${opt.value}`} className="flex-1 cursor-pointer flex justify-between">
                      <span className="text-xs">{opt.label}</span>
                      <span className="text-xs font-semibold">{formatIDR(opt.value)}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
                <span>Wallet Balance</span>
                <span className={cn('font-medium', canProceed ? 'text-chart-1' : 'text-destructive')}>
                  {formatIDR(walletBalance)}
                </span>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 space-y-2">
                <p className="text-xs font-medium text-foreground">Transaction Summary</p>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Property</span><span className="font-medium text-foreground truncate ml-2 max-w-[200px]">{propertyTitle}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Escrow Deposit</span><span className="font-semibold text-primary">{formatIDR(chosenAmount)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Remaining Balance</span><span>{formatIDR(walletBalance - chosenAmount)}</span></div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                By confirming, you agree to the escrow terms. Funds are protected until conditions are met.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-2 pt-2">
          {currentStep > 0 ? (
            <Button variant="outline" size="sm" onClick={() => setCurrentStep((s) => s - 1)} className="flex-1">
              <ArrowLeft className="h-3 w-3 mr-1" /> Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={onCancel} className="flex-1">Cancel</Button>
          )}

          {currentStep < 2 ? (
            <Button size="sm" onClick={() => setCurrentStep((s) => s + 1)} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              Next <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onConfirm(chosenAmount)}
              disabled={!canProceed}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <CreditCard className="h-3 w-3 mr-1" />
              Confirm Escrow
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EscrowPaymentFlow;
