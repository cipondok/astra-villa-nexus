import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Calculator, TrendingUp, DollarSign, Home, Calendar,
  PiggyBank, BarChart3, ArrowUpRight, Percent, Building2,
  Save, Trash2, Copy, Sparkles, Shield, Clock, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════
   FORMATTING HELPERS
   ═══════════════════════════════════════════ */

const formatIDR = (value: number) => {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}M`;
  return `Rp ${value.toLocaleString('id-ID')}`;
};

const formatFullIDR = (value: number) =>
  `Rp ${value.toLocaleString('id-ID')}`;

/* ═══════════════════════════════════════════
   CALCULATION ENGINE (client-side, zero-latency)
   ═══════════════════════════════════════════ */

interface Inputs {
  purchasePrice: number;
  monthlyRental: number;
  annualAppreciation: number;
  holdingYears: number;
  isFinanced: boolean;
  downPaymentPct: number;
  interestRate: number;
  loanTermYears: number;
}

interface Results {
  totalRentalIncome: number;
  resaleValue: number;
  resaleProfit: number;
  totalROI: number;
  annualROI: number;
  grossYield: number;
  cashInvested: number;
  totalReturn: number;
  yearlyBreakdown: { year: number; rentalCumulative: number; propertyValue: number; equity: number }[];
}

function calculate(i: Inputs): Results {
  const cashInvested = i.isFinanced
    ? i.purchasePrice * (i.downPaymentPct / 100)
    : i.purchasePrice;

  const loanAmount = i.isFinanced ? i.purchasePrice - cashInvested : 0;

  // Monthly mortgage payment (fixed rate)
  let monthlyMortgage = 0;
  if (i.isFinanced && loanAmount > 0) {
    const r = i.interestRate / 100 / 12;
    const n = i.loanTermYears * 12;
    monthlyMortgage = r > 0 ? loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;
  }

  const totalMortgagePaid = monthlyMortgage * Math.min(i.holdingYears, i.loanTermYears) * 12;
  const netMonthlyIncome = i.monthlyRental - monthlyMortgage;
  const totalRentalIncome = i.monthlyRental * i.holdingYears * 12;
  const totalNetRental = netMonthlyIncome * i.holdingYears * 12;

  const resaleValue = i.purchasePrice * Math.pow(1 + i.annualAppreciation / 100, i.holdingYears);
  const resaleProfit = resaleValue - i.purchasePrice;

  // Remaining loan balance at sale
  let remainingLoan = loanAmount;
  if (i.isFinanced && loanAmount > 0) {
    const r = i.interestRate / 100 / 12;
    const n = i.loanTermYears * 12;
    const monthsPaid = Math.min(i.holdingYears, i.loanTermYears) * 12;
    if (r > 0) {
      remainingLoan = loanAmount * (Math.pow(1 + r, n) - Math.pow(1 + r, monthsPaid)) / (Math.pow(1 + r, n) - 1);
    } else {
      remainingLoan = loanAmount - (loanAmount / n) * monthsPaid;
    }
    remainingLoan = Math.max(0, remainingLoan);
  }

  const saleProceeds = resaleValue - remainingLoan;
  const totalReturn = saleProceeds + totalNetRental - cashInvested;
  const totalROI = cashInvested > 0 ? (totalReturn / cashInvested) * 100 : 0;
  const annualROI = i.holdingYears > 0 ? (Math.pow(1 + totalROI / 100, 1 / i.holdingYears) - 1) * 100 : 0;
  const grossYield = i.purchasePrice > 0 ? (i.monthlyRental * 12 / i.purchasePrice) * 100 : 0;

  const yearlyBreakdown = Array.from({ length: i.holdingYears }, (_, y) => {
    const year = y + 1;
    const rentalCumulative = i.monthlyRental * year * 12;
    const propertyValue = i.purchasePrice * Math.pow(1 + i.annualAppreciation / 100, year);
    const equity = propertyValue - (y < i.loanTermYears ? remainingLoan : 0);
    return { year, rentalCumulative, propertyValue, equity };
  });

  return { totalRentalIncome, resaleValue, resaleProfit, totalROI, annualROI, grossYield, cashInvested, totalReturn, yearlyBreakdown };
}

/* ═══════════════════════════════════════════
   SAVED SCENARIO
   ═══════════════════════════════════════════ */

interface SavedScenario {
  id: string;
  name: string;
  inputs: Inputs;
  results: Results;
}

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

const DEFAULTS: Inputs = {
  purchasePrice: 2_000_000_000,
  monthlyRental: 15_000_000,
  annualAppreciation: 8,
  holdingYears: 5,
  isFinanced: false,
  downPaymentPct: 30,
  interestRate: 9,
  loanTermYears: 15,
};

export default function ROICalculatorPage() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);

  const update = useCallback(<K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const results = useMemo(() => calculate(inputs), [inputs]);

  const saveScenario = () => {
    const scenario: SavedScenario = {
      id: Date.now().toString(),
      name: `Scenario ${scenarios.length + 1}`,
      inputs: { ...inputs },
      results,
    };
    setScenarios(prev => [...prev, scenario]);
    toast.success('Scenario saved for comparison');
  };

  const removeScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
  };

  const loadScenario = (s: SavedScenario) => {
    setInputs(s.inputs);
    toast.info(`Loaded: ${s.name}`);
  };

  const maxBarValue = Math.max(
    results.totalRentalIncome,
    results.resaleProfit,
    results.cashInvested,
    1
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                ROI Calculator
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Estimate property investment returns with instant projections</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={saveScenario}>
              <Save className="h-3.5 w-3.5" /> Save Scenario
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ═══ LEFT: INPUTS ═══ */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" /> Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Purchase Price */}
                <SliderField
                  label="Purchase Price"
                  value={inputs.purchasePrice}
                  min={200_000_000}
                  max={20_000_000_000}
                  step={100_000_000}
                  format={formatIDR}
                  icon={Building2}
                  onChange={v => update('purchasePrice', v)}
                />

                {/* Monthly Rental */}
                <SliderField
                  label="Expected Monthly Rental"
                  value={inputs.monthlyRental}
                  min={1_000_000}
                  max={200_000_000}
                  step={500_000}
                  format={formatIDR}
                  icon={PiggyBank}
                  onChange={v => update('monthlyRental', v)}
                />

                {/* Annual Appreciation */}
                <SliderField
                  label="Annual Appreciation"
                  value={inputs.annualAppreciation}
                  min={0}
                  max={25}
                  step={0.5}
                  format={v => `${v}%`}
                  icon={TrendingUp}
                  onChange={v => update('annualAppreciation', v)}
                />

                {/* Holding Period */}
                <SliderField
                  label="Holding Period"
                  value={inputs.holdingYears}
                  min={1}
                  max={30}
                  step={1}
                  format={v => `${v} year${v > 1 ? 's' : ''}`}
                  icon={Calendar}
                  onChange={v => update('holdingYears', v)}
                />
              </CardContent>
            </Card>

            {/* Financing Toggle */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-chart-2" /> Financing
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="financing-toggle" className="text-[10px] text-muted-foreground">
                      {inputs.isFinanced ? 'Mortgage' : 'Cash'}
                    </Label>
                    <Switch
                      id="financing-toggle"
                      checked={inputs.isFinanced}
                      onCheckedChange={v => update('isFinanced', v)}
                    />
                  </div>
                </div>
              </CardHeader>
              <AnimatePresence>
                {inputs.isFinanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-0 space-y-5">
                      <SliderField
                        label="Down Payment"
                        value={inputs.downPaymentPct}
                        min={10}
                        max={90}
                        step={5}
                        format={v => `${v}% (${formatIDR(inputs.purchasePrice * v / 100)})`}
                        icon={Shield}
                        onChange={v => update('downPaymentPct', v)}
                      />
                      <SliderField
                        label="Interest Rate"
                        value={inputs.interestRate}
                        min={3}
                        max={18}
                        step={0.25}
                        format={v => `${v}%`}
                        icon={Percent}
                        onChange={v => update('interestRate', v)}
                      />
                      <SliderField
                        label="Loan Term"
                        value={inputs.loanTermYears}
                        min={5}
                        max={30}
                        step={1}
                        format={v => `${v} years`}
                        icon={Clock}
                        onChange={v => update('loanTermYears', v)}
                      />
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* ═══ RIGHT: RESULTS ═══ */}
          <div className="lg:col-span-3 space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <KPICard label="Total ROI" value={`${results.totalROI.toFixed(1)}%`} icon={ArrowUpRight} color="text-chart-2" bgColor="bg-chart-2/10" />
              <KPICard label="Annual ROI" value={`${results.annualROI.toFixed(1)}%`} icon={TrendingUp} color="text-primary" bgColor="bg-primary/10" />
              <KPICard label="Gross Yield" value={`${results.grossYield.toFixed(1)}%`} icon={Percent} color="text-chart-4" bgColor="bg-chart-4/10" />
              <KPICard label="Cash Invested" value={formatIDR(results.cashInvested)} icon={DollarSign} color="text-chart-1" bgColor="bg-chart-1/10" />
            </div>

            {/* Breakdown */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Return Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BreakdownBar label="Cumulative Rental Income" value={results.totalRentalIncome} max={maxBarValue} color="bg-chart-2" />
                <BreakdownBar label="Capital Appreciation" value={results.resaleProfit} max={maxBarValue} color="bg-primary" />
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">Resale Value at Year {inputs.holdingYears}</p>
                  <p className="text-sm font-black text-foreground">{formatIDR(results.resaleValue)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">Total Net Return</p>
                  <p className={cn('text-sm font-black', results.totalReturn >= 0 ? 'text-chart-2' : 'text-destructive')}>
                    {results.totalReturn >= 0 ? '+' : ''}{formatIDR(results.totalReturn)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Year-by-year */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-chart-4" /> Year-by-Year Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-3 font-bold text-muted-foreground">Year</th>
                        <th className="text-right py-2 px-3 font-bold text-muted-foreground">Property Value</th>
                        <th className="text-right py-2 px-3 font-bold text-muted-foreground">Cumulative Rental</th>
                        <th className="text-right py-2 pl-3 font-bold text-muted-foreground">Appreciation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.yearlyBreakdown.map((row) => (
                        <motion.tr
                          key={row.year}
                          className="border-b border-border/30"
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: row.year * 0.03 }}
                        >
                          <td className="py-1.5 pr-3 font-bold text-foreground">Y{row.year}</td>
                          <td className="py-1.5 px-3 text-right text-foreground">{formatIDR(row.propertyValue)}</td>
                          <td className="py-1.5 px-3 text-right text-chart-2">{formatIDR(row.rentalCumulative)}</td>
                          <td className="py-1.5 pl-3 text-right text-primary">
                            +{((row.propertyValue / inputs.purchasePrice - 1) * 100).toFixed(1)}%
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Saved Scenarios */}
            {scenarios.length > 0 && (
              <Card className="border border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Copy className="h-4 w-4 text-chart-1" /> Saved Scenarios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {scenarios.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 border border-border/30"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-foreground">{s.name}</p>
                        <p className="text-[9px] text-muted-foreground">
                          {formatIDR(s.inputs.purchasePrice)} · {s.inputs.holdingYears}yr · {s.inputs.isFinanced ? 'Financed' : 'Cash'}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn('text-[8px]', s.results.totalROI >= 0 ? 'text-chart-2 border-chart-2/20' : 'text-destructive border-destructive/20')}>
                        {s.results.totalROI.toFixed(1)}% ROI
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => loadScenario(s)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => removeScenario(s.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

function SliderField({
  label, value, min, max, step, format, icon: Icon, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; icon: typeof Home; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-muted-foreground" />
          <Label className="text-[10px] text-muted-foreground">{label}</Label>
        </div>
        <motion.span
          key={value}
          initial={{ scale: 1.1, color: 'hsl(var(--primary))' }}
          animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
          transition={{ duration: 0.2 }}
          className="text-xs font-bold"
        >
          {format(value)}
        </motion.span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="cursor-pointer"
      />
    </div>
  );
}

function KPICard({
  label, value, icon: Icon, color, bgColor,
}: {
  label: string; value: string; icon: typeof Home; color: string; bgColor: string;
}) {
  return (
    <motion.div layout>
      <Card className="border border-border bg-card">
        <CardContent className="p-3">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', bgColor)}>
            <Icon className={cn('h-4 w-4', color)} />
          </div>
          <motion.p
            key={value}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-base font-black text-foreground"
          >
            {value}
          </motion.p>
          <p className="text-[9px] text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BreakdownBar({
  label, value, max, color,
}: {
  label: string; value: number; max: number; color: string;
}) {
  const pct = max > 0 ? Math.max((value / max) * 100, 2) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-bold text-foreground">{formatIDR(value)}</p>
      </div>
      <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
