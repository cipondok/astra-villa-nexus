import { useState } from 'react';
import { useMyMortgageApplications, useMortgageBanks, useSubmitMortgageApplication, type SubmitMortgageInput } from '@/hooks/useMortgageIntegration';
import { useMortgageCalculator } from '@/hooks/useMortgageCalculator';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Building2, Calculator, FileText, Clock, CheckCircle2, XCircle,
  TrendingUp, DollarSign, Percent, CalendarDays, Briefcase, AlertTriangle,
  HelpCircle, LineChart, Target, Timer,
} from 'lucide-react';

function formatIDR(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'text-amber-500', icon: Clock },
  submitted: { label: 'Submitted', color: 'text-blue-500', icon: FileText },
  under_review: { label: 'Under Review', color: 'text-purple-500', icon: Clock },
  approved: { label: 'Approved', color: 'text-emerald-500', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-destructive', icon: XCircle },
  disbursed: { label: 'Disbursed', color: 'text-chart-4', icon: DollarSign },
};

const PRICE_PRESETS = [
  { label: '500jt', value: 500_000_000 },
  { label: '1M', value: 1_000_000_000 },
  { label: '2M', value: 2_000_000_000 },
  { label: '5M', value: 5_000_000_000 },
  { label: '10M', value: 10_000_000_000 },
];

const INCOME_RANGES = [
  { label: '< Rp 10jt', value: 'under_10m' },
  { label: 'Rp 10-25jt', value: '10m_25m' },
  { label: 'Rp 25-50jt', value: '25m_50m' },
  { label: 'Rp 50jt+', value: 'above_50m' },
];

export default function MortgageFinancingPage() {
  const { user, profile } = useAuth();
  const { data: applications = [], isLoading: appsLoading } = useMyMortgageApplications();
  const { data: banks = [] } = useMortgageBanks();
  const { submitInquiry, isSubmitting: inquirySubmitting } = useMortgageCalculator();
  const submitApp = useSubmitMortgageApplication();
  const [showForm, setShowForm] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [tab, setTab] = useState('calculator');

  // Calculator state
  const [calc, setCalc] = useState({
    property_price: 2_000_000_000,
    dp_percent: 20,
    interest_rate: 8.5,
    loan_term: 20,
  });

  // Investor insight state
  const [rentalYield, setRentalYield] = useState(6);

  const loanAmount = calc.property_price * (1 - calc.dp_percent / 100);
  const monthlyRate = calc.interest_rate / 100 / 12;
  const totalMonths = calc.loan_term * 12;
  const monthlyPayment = monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    : loanAmount / totalMonths;
  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - loanAmount;
  const downPaymentAmount = calc.property_price * calc.dp_percent / 100;

  // Investor insight calculations
  const annualRent = calc.property_price * (rentalYield / 100);
  const annualMortgagePayment = monthlyPayment * 12;
  const netAnnualReturn = annualRent - annualMortgagePayment;
  const totalInvestment = downPaymentAmount;
  const projectedROI = totalInvestment > 0 ? (netAnnualReturn / totalInvestment) * 100 : 0;
  const breakEvenYears = netAnnualReturn > 0 ? Math.ceil(totalInvestment / netAnnualReturn) : Infinity;

  // Submission form state
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone: '',
    employment_type: 'salaried',
    company_name: '',
    monthly_income: 25_000_000,
    bank_id: '',
  });

  // Inquiry form state
  const [inquiry, setInquiry] = useState({
    name: profile?.full_name || '',
    email: user?.email || '',
    phone: '',
    income_range: '10m_25m',
    employment_type: 'salaried',
    preferred_bank_id: '',
  });

  const dti = ((monthlyPayment / form.monthly_income) * 100);

  const handleSubmit = () => {
    const input: SubmitMortgageInput = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      employment_type: form.employment_type,
      company_name: form.company_name || undefined,
      monthly_income: form.monthly_income,
      property_price: calc.property_price,
      down_payment: downPaymentAmount,
      down_payment_percent: calc.dp_percent,
      loan_amount: loanAmount,
      interest_rate: calc.interest_rate,
      loan_term_years: calc.loan_term,
      monthly_payment: Math.round(monthlyPayment),
      dti_ratio: Math.round(dti * 10) / 10,
      qualification_status: dti <= 30 ? 'qualified' : dti <= 50 ? 'conditional' : 'not_qualified',
      bank_id: form.bank_id || undefined,
    };
    submitApp.mutate(input, { onSuccess: () => setShowForm(false) });
  };

  const handleInquirySubmit = async () => {
    try {
      await submitInquiry({
        bank_id: inquiry.preferred_bank_id || banks[0]?.id || '',
        full_name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        employment_type: inquiry.employment_type,
        loan_amount_requested: Math.round(loanAmount),
        loan_term_requested: calc.loan_term,
      });
      setShowInquiry(false);
    } catch {}
  };

  // Affordability level
  const affordability = dti <= 30 ? 'comfortable' : dti <= 50 ? 'moderate' : 'stretched';
  const affordabilityConfig = {
    comfortable: { label: 'Comfortable', color: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500/30', pct: Math.min(100, (30 / dti) * 100) },
    moderate: { label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500/30', pct: Math.min(100, (40 / dti) * 100) },
    stretched: { label: 'Stretched', color: 'text-destructive', bg: 'bg-destructive', border: 'border-destructive/30', pct: Math.min(100, (50 / dti) * 100) },
  }[affordability];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Mortgage & Financing Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Calculate, compare, and apply for mortgage financing</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="calculator" className="text-xs gap-1"><Calculator className="h-3 w-3" /> Calculator</TabsTrigger>
          <TabsTrigger value="banks" className="text-xs gap-1"><Building2 className="h-3 w-3" /> Partner Banks</TabsTrigger>
          <TabsTrigger value="applications" className="text-xs gap-1"><FileText className="h-3 w-3" /> My Applications</TabsTrigger>
        </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="mt-4">
          <div className="grid lg:grid-cols-5 gap-4">
            {/* Input Panel — 2 cols */}
            <Card className="lg:col-span-2 bg-card/80 backdrop-blur border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  Mortgage Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Price Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Property Price</label>
                    <span className="text-sm font-bold text-primary">{formatIDR(calc.property_price)}</span>
                  </div>
                  <Slider
                    value={[calc.property_price]}
                    onValueChange={([v]) => setCalc(c => ({ ...c, property_price: v }))}
                    min={500_000_000}
                    max={10_000_000_000}
                    step={50_000_000}
                    className="w-full"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {PRICE_PRESETS.map(p => (
                      <Button
                        key={p.value}
                        size="sm"
                        variant={calc.property_price === p.value ? 'default' : 'outline'}
                        className="h-6 px-2 text-[10px]"
                        onClick={() => setCalc(c => ({ ...c, property_price: p.value }))}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Down Payment Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Down Payment</label>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground">{calc.dp_percent}%</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5">({formatIDR(downPaymentAmount)})</span>
                    </div>
                  </div>
                  <Slider
                    value={[calc.dp_percent]}
                    onValueChange={([v]) => setCalc(c => ({ ...c, dp_percent: v }))}
                    min={10}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>10%</span><span>30%</span><span>50%</span>
                  </div>
                </div>

                {/* Interest Rate Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Interest Rate (p.a.)</label>
                    <span className="text-sm font-bold text-foreground">{calc.interest_rate}%</span>
                  </div>
                  <Slider
                    value={[calc.interest_rate]}
                    onValueChange={([v]) => setCalc(c => ({ ...c, interest_rate: Math.round(v * 10) / 10 }))}
                    min={3}
                    max={15}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>3%</span><span>9%</span><span>15%</span>
                  </div>
                </div>

                {/* Loan Term Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Loan Term</label>
                    <span className="text-sm font-bold text-foreground">{calc.loan_term} years</span>
                  </div>
                  <Slider
                    value={[calc.loan_term]}
                    onValueChange={([v]) => setCalc(c => ({ ...c, loan_term: v }))}
                    min={5}
                    max={30}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>5yr</span><span>15yr</span><span>30yr</span>
                  </div>
                </div>

                {/* Monthly Income for DTI */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Monthly Income (for DTI)</label>
                  <Input
                    type="number"
                    value={form.monthly_income}
                    onChange={e => setForm(f => ({ ...f, monthly_income: Number(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Results Panel — 3 cols */}
            <div className="lg:col-span-3 space-y-3">
              {/* Monthly Payment Hero */}
              <Card className="bg-card/80 backdrop-blur border-primary/20">
                <CardContent className="p-5">
                  <div className="text-center mb-4">
                    <p className="text-xs text-muted-foreground">Monthly Payment</p>
                    <p className="text-4xl font-bold text-primary tracking-tight">{formatIDR(Math.round(monthlyPayment))}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">per month for {calc.loan_term} years</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30 text-center">
                      <p className="text-muted-foreground">Loan</p>
                      <p className="font-semibold text-foreground">{formatIDR(loanAmount)}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30 text-center">
                      <p className="text-muted-foreground">Down Payment</p>
                      <p className="font-semibold text-foreground">{formatIDR(downPaymentAmount)}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30 text-center">
                      <p className="text-muted-foreground">Total Payment</p>
                      <p className="font-semibold text-foreground">{formatIDR(Math.round(totalPayment))}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30 text-center">
                      <p className="text-muted-foreground">Total Interest</p>
                      <p className="font-semibold text-destructive">{formatIDR(Math.round(totalInterest))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Affordability Gauge */}
              <Card className={cn("bg-card/80 backdrop-blur border", affordabilityConfig.border)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className={cn("h-4 w-4", affordabilityConfig.color)} />
                      <span className="text-xs font-semibold text-foreground">Affordability</span>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px]", affordabilityConfig.color)}>
                      {affordabilityConfig.label}
                    </Badge>
                  </div>
                  {/* Gauge bar */}
                  <div className="w-full h-2.5 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", affordabilityConfig.bg)}
                      style={{ width: `${100 - Math.min(dti, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                    <span>DTI: {dti.toFixed(1)}%</span>
                    <span>{dti <= 30 ? 'High approval likelihood' : dti <= 50 ? 'Conditional approval' : 'May need higher DP'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Investor Insight Panel */}
              <Card className="bg-card/80 backdrop-blur border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-primary" />
                    Investor Insight
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rental Yield Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-medium text-muted-foreground">Assumed Rental Yield</label>
                      <span className="text-xs font-bold text-foreground">{rentalYield}% p.a.</span>
                    </div>
                    <Slider
                      value={[rentalYield]}
                      onValueChange={([v]) => setRentalYield(Math.round(v * 10) / 10)}
                      min={3}
                      max={12}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Projected ROI */}
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
                      <TrendingUp className={cn("h-4 w-4 mx-auto mb-1", projectedROI >= 0 ? 'text-emerald-500' : 'text-destructive')} />
                      <p className="text-[10px] text-muted-foreground">Net ROI</p>
                      <p className={cn("text-lg font-bold", projectedROI >= 0 ? 'text-emerald-500' : 'text-destructive')}>
                        {projectedROI.toFixed(1)}%
                      </p>
                      <p className="text-[9px] text-muted-foreground">per year on DP</p>
                    </div>

                    {/* Annual Net Return */}
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
                      <DollarSign className={cn("h-4 w-4 mx-auto mb-1", netAnnualReturn >= 0 ? 'text-emerald-500' : 'text-destructive')} />
                      <p className="text-[10px] text-muted-foreground">Net Return</p>
                      <p className={cn("text-sm font-bold", netAnnualReturn >= 0 ? 'text-emerald-500' : 'text-destructive')}>
                        {netAnnualReturn >= 0 ? '+' : ''}{formatIDR(Math.round(netAnnualReturn))}
                      </p>
                      <p className="text-[9px] text-muted-foreground">per year</p>
                    </div>

                    {/* Break-even */}
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
                      <Timer className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-[10px] text-muted-foreground">Break-even</p>
                      <p className="text-lg font-bold text-foreground">
                        {breakEvenYears === Infinity ? '—' : `${breakEvenYears}yr`}
                      </p>
                      <p className="text-[9px] text-muted-foreground">to recover DP</p>
                    </div>
                  </div>

                  {netAnnualReturn < 0 && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20 text-[10px] text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>Annual mortgage cost exceeds rental income. Consider increasing DP or finding higher-yield properties.</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button className="w-full" onClick={() => setShowForm(true)}>
                  <FileText className="h-4 w-4 mr-1.5" />
                  Apply for Mortgage
                </Button>
                <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/5" onClick={() => setShowInquiry(true)}>
                  <HelpCircle className="h-4 w-4 mr-1.5" />
                  Need Financing Help?
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Banks Tab */}
        <TabsContent value="banks" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {banks.length === 0 ? (
              <Card className="col-span-full bg-card/80 border-border/50">
                <CardContent className="py-12 text-center">
                  <Building2 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No partner banks configured yet</p>
                </CardContent>
              </Card>
            ) : banks.map(bank => (
              <Card key={bank.id} className="bg-card/80 backdrop-blur border-border/50 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {bank.logo_url ? (
                      <img src={bank.logo_url} alt={bank.bank_name} className="w-10 h-10 rounded-lg object-contain bg-background p-1 border border-border/30" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{bank.bank_name}</p>
                      <Badge variant="secondary" className="text-[9px]">Partner Bank</Badge>
                    </div>
                  </div>
                  {bank.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{bank.description}</p>}
                  <div className="space-y-1 text-xs">
                    {bank.max_loan_term_years && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Max Tenor</span><span className="text-foreground">{bank.max_loan_term_years} years</span></div>
                    )}
                    {bank.min_down_payment_percent && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Min DP</span><span className="text-foreground">{bank.min_down_payment_percent}%</span></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="mt-4 space-y-3">
          {appsLoading ? (
            [1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          ) : applications.length === 0 ? (
            <Card className="bg-card/80 border-border/50">
              <CardContent className="py-12 text-center">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No mortgage applications yet</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => { setTab('calculator'); }}>
                  Start with Calculator
                </Button>
              </CardContent>
            </Card>
          ) : applications.map(app => {
            const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const Icon = sc.icon;
            return (
              <Card key={app.id} className="bg-card/80 backdrop-blur border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-foreground">{formatIDR(app.loan_amount)} Loan</p>
                        <Badge variant="outline" className={cn('text-[10px]', sc.color)}>
                          <Icon className="h-3 w-3 mr-1" />{sc.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                        <div>
                          <p className="text-muted-foreground">Property</p>
                          <p className="font-medium text-foreground">{formatIDR(app.property_price)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Monthly</p>
                          <p className="font-medium text-foreground">{formatIDR(app.monthly_payment)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">DTI</p>
                          <p className={cn('font-medium', (app.dti_ratio || 0) <= 30 ? 'text-emerald-500' : 'text-amber-500')}>{app.dti_ratio?.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground shrink-0">
                      {new Date(app.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Application Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Apply for Mortgage</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Full Name *</label>
              <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Email *</label>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Phone *</label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" placeholder="08xx" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Employment Type</label>
              <Select value={form.employment_type} onValueChange={v => setForm(f => ({ ...f, employment_type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaried">Salaried Employee</SelectItem>
                  <SelectItem value="self_employed">Self-Employed</SelectItem>
                  <SelectItem value="business_owner">Business Owner</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Monthly Income (Rp)</label>
              <Input type="number" value={form.monthly_income} onChange={e => setForm(f => ({ ...f, monthly_income: Number(e.target.value) }))} className="mt-1" />
            </div>
            {banks.length > 0 && (
              <div>
                <label className="text-xs font-medium">Preferred Bank (optional)</label>
                <Select value={form.bank_id} onValueChange={v => setForm(f => ({ ...f, bank_id: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Any bank" /></SelectTrigger>
                  <SelectContent>
                    {banks.map(b => <SelectItem key={b.id} value={b.id}>{b.bank_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Summary */}
            <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Loan Amount</span><span className="font-medium text-foreground">{formatIDR(loanAmount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Monthly Payment</span><span className="font-medium text-foreground">{formatIDR(Math.round(monthlyPayment))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">DTI Ratio</span><span className={cn('font-medium', dti <= 30 ? 'text-emerald-500' : 'text-amber-500')}>{dti.toFixed(1)}%</span></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitApp.isPending || !form.full_name || !form.email}>
              {submitApp.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Financing Inquiry Dialog */}
      <Dialog open={showInquiry} onOpenChange={setShowInquiry}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Need Financing Help?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Submit your details and our financing advisor or partner bank will contact you within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Full Name *</label>
              <Input value={inquiry.name} onChange={e => setInquiry(f => ({ ...f, name: e.target.value }))} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Email *</label>
                <Input type="email" value={inquiry.email} onChange={e => setInquiry(f => ({ ...f, email: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Phone *</label>
                <Input value={inquiry.phone} onChange={e => setInquiry(f => ({ ...f, phone: e.target.value }))} className="mt-1" placeholder="08xx" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Income Range</label>
              <Select value={inquiry.income_range} onValueChange={v => setInquiry(f => ({ ...f, income_range: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INCOME_RANGES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Employment Type</label>
              <Select value={inquiry.employment_type} onValueChange={v => setInquiry(f => ({ ...f, employment_type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaried">Salaried Employee</SelectItem>
                  <SelectItem value="self_employed">Self-Employed</SelectItem>
                  <SelectItem value="business_owner">Business Owner</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {banks.length > 0 && (
              <div>
                <label className="text-xs font-medium">Preferred Bank (optional)</label>
                <Select value={inquiry.preferred_bank_id} onValueChange={v => setInquiry(f => ({ ...f, preferred_bank_id: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="No preference" /></SelectTrigger>
                  <SelectContent>
                    {banks.map(b => <SelectItem key={b.id} value={b.id}>{b.bank_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Loan summary context */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1">
              <p className="font-medium text-foreground text-[11px] mb-1">Your Simulation</p>
              <div className="flex justify-between"><span className="text-muted-foreground">Property Price</span><span className="text-foreground">{formatIDR(calc.property_price)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Loan Needed</span><span className="text-foreground">{formatIDR(loanAmount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Est. Monthly</span><span className="text-primary font-semibold">{formatIDR(Math.round(monthlyPayment))}</span></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInquiry(false)}>Cancel</Button>
            <Button onClick={handleInquirySubmit} disabled={inquirySubmitting || !inquiry.name || !inquiry.email || !inquiry.phone}>
              {inquirySubmitting ? 'Sending...' : 'Send Inquiry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
