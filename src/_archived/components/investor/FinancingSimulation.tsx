import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign, Percent, Calendar, TrendingUp, Calculator,
  Building2, ArrowDown, ArrowUp, Minus,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

interface FinancingSimulationProps {
  propertyPrice: number;
  investmentHorizon?: number;
}

interface MonthlyBreakdown {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  equity: number;
  cashFlow: number;
}

const BANKS = [
  { value: 'bca', label: 'BCA', rate: 3.95 },
  { value: 'mandiri', label: 'Mandiri', rate: 4.25 },
  { value: 'btn', label: 'BTN', rate: 4.47 },
  { value: 'bri', label: 'BRI', rate: 4.15 },
  { value: 'custom', label: 'Custom', rate: 5.0 },
];

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const formatShortIDR = (v: number) => {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return formatIDR(v);
};

export default function FinancingSimulation({ propertyPrice, investmentHorizon = 10 }: FinancingSimulationProps) {
  const [downPaymentPct, setDownPaymentPct] = useState(30);
  const [selectedBank, setSelectedBank] = useState('bca');
  const [interestRate, setInterestRate] = useState(3.95);
  const [tenorYears, setTenorYears] = useState(15);
  const [monthlyRentalIncome, setMonthlyRentalIncome] = useState(0);

  const bankRate = BANKS.find(b => b.value === selectedBank)?.rate;

  const handleBankChange = (value: string) => {
    setSelectedBank(value);
    const bank = BANKS.find(b => b.value === value);
    if (bank && value !== 'custom') {
      setInterestRate(bank.rate);
    }
  };

  const simulation = useMemo(() => {
    const downPayment = propertyPrice * (downPaymentPct / 100);
    const loanAmount = propertyPrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = tenorYears * 12;

    // Monthly payment (annuity formula)
    const monthlyPayment = monthlyRate > 0
      ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : loanAmount / totalMonths;

    // Yearly projections for chart
    const yearlyData: { year: number; equity: number; debt: number; cashFlow: number; propertyValue: number }[] = [];
    let balance = loanAmount;
    let totalInterestPaid = 0;
    const appreciationRate = 0.05; // 5% annual appreciation

    for (let year = 0; year <= Math.min(tenorYears, investmentHorizon); year++) {
      const propertyValue = propertyPrice * Math.pow(1 + appreciationRate, year);
      const equity = propertyValue - balance;
      const annualRent = monthlyRentalIncome * 12;
      const annualPayment = monthlyPayment * 12;
      const netCashFlow = annualRent - annualPayment;

      yearlyData.push({
        year,
        equity: Math.round(equity),
        debt: Math.round(balance),
        cashFlow: Math.round(netCashFlow),
        propertyValue: Math.round(propertyValue),
      });

      // Update balance for next year
      for (let m = 0; m < 12; m++) {
        if (balance <= 0) break;
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        totalInterestPaid += interestPayment;
        balance = Math.max(0, balance - principalPayment);
      }
    }

    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - loanAmount;
    const monthlyCashFlow = monthlyRentalIncome - monthlyPayment;

    return {
      downPayment,
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      monthlyCashFlow,
      yearlyData,
      dscr: monthlyRentalIncome > 0 ? monthlyRentalIncome / monthlyPayment : 0,
    };
  }, [propertyPrice, downPaymentPct, interestRate, tenorYears, monthlyRentalIncome, investmentHorizon]);

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" /> KPR Financing Simulation
        </CardTitle>
        <CardDescription className="text-xs">
          Simulate mortgage payments, cash flow, and equity growth
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Property Price (readonly) */}
        <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Property Price
          </span>
          <span className="font-bold text-foreground">{formatIDR(propertyPrice)}</span>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Down Payment */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Down Payment ({downPaymentPct}%)</Label>
            <Slider
              value={[downPaymentPct]}
              min={10}
              max={80}
              step={5}
              onValueChange={([v]) => setDownPaymentPct(v)}
            />
            <p className="text-[10px] text-muted-foreground">{formatShortIDR(simulation.downPayment)}</p>
          </div>

          {/* Bank */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Bank</Label>
            <Select value={selectedBank} onValueChange={handleBankChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BANKS.map(b => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label} ({b.rate}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Interest Rate (%)</Label>
            <Input
              type="number"
              step="0.05"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="h-8 text-xs"
            />
          </div>

          {/* Tenor */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Tenor (years)</Label>
            <div className="flex gap-1">
              {[10, 15, 20, 25, 30].map(y => (
                <button
                  key={y}
                  onClick={() => setTenorYears(y)}
                  className={`flex-1 h-8 text-xs rounded border transition-all ${
                    tenorYears === y
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:border-primary/40'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Rental Income */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Expected Monthly Rental Income (optional)</Label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="number"
              placeholder="e.g. 15000000"
              value={monthlyRentalIncome || ''}
              onChange={(e) => setMonthlyRentalIncome(Number(e.target.value))}
              className="h-8 text-xs pl-8"
            />
          </div>
        </div>

        <Separator />

        {/* Results Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ResultBox label="Monthly Payment" value={formatShortIDR(simulation.monthlyPayment)} icon={Calendar} />
          <ResultBox label="Loan Amount" value={formatShortIDR(simulation.loanAmount)} icon={DollarSign} />
          <ResultBox label="Total Interest" value={formatShortIDR(simulation.totalInterest)} icon={Percent} negative />
          <ResultBox
            label="Monthly Cash Flow"
            value={formatShortIDR(Math.abs(simulation.monthlyCashFlow))}
            icon={simulation.monthlyCashFlow >= 0 ? ArrowUp : ArrowDown}
            positive={simulation.monthlyCashFlow >= 0}
            negative={simulation.monthlyCashFlow < 0}
          />
        </div>

        {/* DSCR */}
        {monthlyRentalIncome > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Debt Service Coverage Ratio:</span>
            <Badge variant={simulation.dscr >= 1.2 ? 'default' : simulation.dscr >= 1.0 ? 'secondary' : 'destructive'}>
              {simulation.dscr.toFixed(2)}x
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {simulation.dscr >= 1.2 ? '✅ Healthy' : simulation.dscr >= 1.0 ? '⚠️ Marginal' : '❌ Negative'}
            </span>
          </div>
        )}

        {/* Equity vs Debt Chart */}
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={simulation.yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => `${(v / 1e9).toFixed(0)}B`}
                width={45}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatIDR(value), name]}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Area type="monotone" dataKey="equity" name="Equity" fill="hsl(140, 60%, 45%)" fillOpacity={0.3} stroke="hsl(140, 60%, 45%)" strokeWidth={2} />
              <Area type="monotone" dataKey="debt" name="Remaining Debt" fill="hsl(0, 60%, 55%)" fillOpacity={0.15} stroke="hsl(0, 60%, 55%)" strokeWidth={2} />
              <Area type="monotone" dataKey="propertyValue" name="Property Value" fill="hsl(45, 80%, 50%)" fillOpacity={0.1} stroke="hsl(45, 80%, 50%)" strokeWidth={1.5} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultBox({ label, value, icon: Icon, positive, negative }: {
  label: string; value: string; icon: any; positive?: boolean; negative?: boolean;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-2.5">
      <div className="flex items-center gap-1 mb-1">
        <Icon className={`h-3 w-3 ${positive ? 'text-emerald-400' : negative ? 'text-red-400' : 'text-muted-foreground'}`} />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <p className={`text-sm font-bold ${positive ? 'text-emerald-400' : negative ? 'text-red-400' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}
