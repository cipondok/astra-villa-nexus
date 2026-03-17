import { useState, useMemo } from 'react';
import { useMyMortgageApplications, useMortgageBanks, useSubmitMortgageApplication, type SubmitMortgageInput } from '@/hooks/useMortgageIntegration';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Building2, Calculator, FileText, Clock, CheckCircle2, XCircle,
  TrendingUp, DollarSign, Percent, CalendarDays, Briefcase, AlertTriangle,
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

export default function MortgageFinancingPage() {
  const { user, profile } = useAuth();
  const { data: applications = [], isLoading: appsLoading } = useMyMortgageApplications();
  const { data: banks = [] } = useMortgageBanks();
  const submitApp = useSubmitMortgageApplication();
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState('calculator');

  // Calculator state
  const [calc, setCalc] = useState({
    property_price: 2_000_000_000,
    dp_percent: 20,
    interest_rate: 8.5,
    loan_term: 20,
  });

  const loanAmount = calc.property_price * (1 - calc.dp_percent / 100);
  const monthlyRate = calc.interest_rate / 100 / 12;
  const totalMonths = calc.loan_term * 12;
  const monthlyPayment = monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    : loanAmount / totalMonths;
  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - loanAmount;

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
      down_payment: calc.property_price * calc.dp_percent / 100,
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
          <div className="grid md:grid-cols-2 gap-4">
            {/* Input Panel */}
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Mortgage Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Property Price (Rp)</label>
                  <Input type="number" value={calc.property_price} onChange={e => setCalc(c => ({ ...c, property_price: Number(e.target.value) }))} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Down Payment (%)</label>
                  <Input type="number" min={10} max={90} value={calc.dp_percent} onChange={e => setCalc(c => ({ ...c, dp_percent: Number(e.target.value) }))} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Interest Rate (% p.a.)</label>
                  <Input type="number" step={0.1} min={1} max={25} value={calc.interest_rate} onChange={e => setCalc(c => ({ ...c, interest_rate: Number(e.target.value) }))} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Loan Term (years)</label>
                  <Select value={String(calc.loan_term)} onValueChange={v => setCalc(c => ({ ...c, loan_term: Number(v) }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 25, 30].map(y => (
                        <SelectItem key={y} value={String(y)}>{y} years</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <div className="space-y-3">
              <Card className="bg-card/80 backdrop-blur border-primary/20">
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <p className="text-xs text-muted-foreground">Monthly Payment</p>
                    <p className="text-3xl font-bold text-primary">{formatIDR(Math.round(monthlyPayment))}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                      <p className="text-muted-foreground">Loan Amount</p>
                      <p className="font-semibold text-foreground">{formatIDR(loanAmount)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                      <p className="text-muted-foreground">Down Payment</p>
                      <p className="font-semibold text-foreground">{formatIDR(calc.property_price * calc.dp_percent / 100)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                      <p className="text-muted-foreground">Total Payment</p>
                      <p className="font-semibold text-foreground">{formatIDR(Math.round(totalPayment))}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/20 border border-border/30">
                      <p className="text-muted-foreground">Total Interest</p>
                      <p className="font-semibold text-destructive">{formatIDR(Math.round(totalInterest))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DTI Indicator */}
              <Card className={cn(
                "bg-card/80 backdrop-blur border",
                dti <= 30 ? 'border-emerald-500/30' : dti <= 50 ? 'border-amber-500/30' : 'border-destructive/30'
              )}>
                <CardContent className="p-3 flex items-center gap-3">
                  {dti <= 30 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
                   dti <= 50 ? <AlertTriangle className="h-5 w-5 text-amber-500" /> :
                   <XCircle className="h-5 w-5 text-destructive" />}
                  <div>
                    <p className="text-xs font-medium text-foreground">DTI Ratio: {dti.toFixed(1)}%</p>
                    <p className="text-[10px] text-muted-foreground">
                      {dti <= 30 ? 'Excellent — high approval likelihood' : dti <= 50 ? 'Moderate — conditional approval possible' : 'High — may require higher DP or co-borrower'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full" onClick={() => setShowForm(true)}>
                Apply for Mortgage
              </Button>
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
    </div>
  );
}
