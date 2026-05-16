import { useState, useMemo } from 'react';
import { useMyMortgageApplications, useMortgageBanks, useSubmitMortgageApplication, type SubmitMortgageInput } from '@/hooks/useMortgageIntegration';
import { useMortgageCalculator } from '@/hooks/useMortgageCalculator';
import { evaluateMortgageEligibility } from '@/hooks/useMortgageEligibility';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Calculator, FileText, Clock, CheckCircle2, XCircle,
  TrendingUp, DollarSign, Percent, Briefcase, AlertTriangle,
  HelpCircle, LineChart, Target, Timer, Shield, ArrowRight,
  Landmark, FileCheck, Upload, BadgeCheck, ChevronRight, Sparkles,
  ClipboardList, Phone, Mail, User, GaugeCircle, CircleDollarSign,
  Star, Zap, CheckCircle, Circle, Info,
} from 'lucide-react';

function formatIDR(v: number) {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
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

const DOCUMENT_CHECKLIST = [
  { id: 'ktp', label: 'KTP (Identity Card)', category: 'Identity', required: true },
  { id: 'npwp', label: 'NPWP (Tax ID)', category: 'Tax', required: true },
  { id: 'slip_gaji', label: 'Salary Slip (3 months)', category: 'Income', required: true },
  { id: 'rek_koran', label: 'Bank Statements (3 months)', category: 'Income', required: true },
  { id: 'surat_kerja', label: 'Employment Letter', category: 'Employment', required: true },
  { id: 'kk', label: 'Kartu Keluarga', category: 'Identity', required: false },
  { id: 'surat_nikah', label: 'Marriage Certificate', category: 'Identity', required: false },
  { id: 'spt', label: 'SPT (Annual Tax Return)', category: 'Tax', required: false },
];

const ELIGIBILITY_COLORS = {
  'SANGAT LAYAK': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-600', icon: BadgeCheck, label: 'Highly Eligible' },
  'LAYAK': { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-600', icon: CheckCircle2, label: 'Eligible' },
  'MARGINAL': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-600', icon: AlertTriangle, label: 'Conditional' },
  'BELUM LAYAK': { bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive', icon: XCircle, label: 'Needs Improvement' },
};

// ─── Financing Insight Card ─────────────────────────────────────────
function FinancingInsightCard({
  monthlyPayment, loanAmount, downPaymentAmount, dpPercent, totalInterest,
  totalPayment, loanTerm, interestRate, eligibility, dti, propertyPrice,
  onCalcChange, calc,
}: {
  monthlyPayment: number; loanAmount: number; downPaymentAmount: number;
  dpPercent: number; totalInterest: number; totalPayment: number;
  loanTerm: number; interestRate: number; eligibility: ReturnType<typeof evaluateMortgageEligibility>;
  dti: number; propertyPrice: number;
  onCalcChange: (patch: Partial<typeof calc>) => void;
  calc: { property_price: number; dp_percent: number; interest_rate: number; loan_term: number };
}) {
  const eConfig = ELIGIBILITY_COLORS[eligibility.mortgage_eligibility];
  const EligIcon = eConfig.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="overflow-hidden border-border/50">
        {/* Hero Installment Banner */}
        <div className="bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CircleDollarSign className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Financing Insight</h2>
              </div>
              <p className="text-xs text-muted-foreground">Your estimated mortgage at a glance</p>
            </div>
            <Badge className={cn('text-[10px] gap-1', eConfig.bg, eConfig.text, eConfig.border)} variant="outline">
              <EligIcon className="h-3 w-3" />
              {eConfig.label}
            </Badge>
          </div>

          {/* Monthly Payment Hero */}
          <div className="text-center py-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Estimated Monthly Installment</p>
            <motion.p
              key={monthlyPayment}
              initial={{ scale: 0.95, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl sm:text-5xl font-extrabold text-primary tracking-tight"
            >
              {formatIDR(Math.round(monthlyPayment))}
            </motion.p>
            <p className="text-xs text-muted-foreground mt-1.5">
              for {loanTerm} years at {interestRate}% p.a.
            </p>
          </div>

          {/* Eligibility Score Ring */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-background/60 backdrop-blur border border-border/30">
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                  strokeDasharray={`${eligibility.composite_score}, 100`}
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${eligibility.composite_score}, 100` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-foreground">{eligibility.composite_score}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">DSR</span>
                <span className={cn('font-medium', eligibility.dsr_pct <= 35 ? 'text-emerald-600' : 'text-amber-600')}>
                  {eligibility.dsr_pct.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">DTI Ratio</span>
                <span className={cn('font-medium', dti <= 30 ? 'text-emerald-600' : dti <= 50 ? 'text-amber-600' : 'text-destructive')}>
                  {dti.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Down Payment</span>
                <span className="font-medium text-foreground">{dpPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Adjusters */}
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
              <p className="text-muted-foreground">Loan Amount</p>
              <p className="font-semibold text-foreground mt-0.5">{formatIDR(loanAmount)}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
              <p className="text-muted-foreground">Down Payment</p>
              <p className="font-semibold text-foreground mt-0.5">{formatIDR(downPaymentAmount)}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
              <p className="text-muted-foreground">Total Payment</p>
              <p className="font-semibold text-foreground mt-0.5">{formatIDR(Math.round(totalPayment))}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/20 text-center">
              <p className="text-muted-foreground">Total Interest</p>
              <p className="font-semibold text-destructive mt-0.5">{formatIDR(Math.round(totalInterest))}</p>
            </div>
          </div>

          <Separator />

          {/* Sliders */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Property Price</span>
                <span className="font-bold text-primary">{formatIDR(calc.property_price)}</span>
              </div>
              <Slider value={[calc.property_price]} onValueChange={([v]) => onCalcChange({ property_price: v })}
                min={300_000_000} max={15_000_000_000} step={50_000_000} />
              <div className="flex gap-1.5 flex-wrap">
                {PRICE_PRESETS.map(p => (
                  <Button key={p.value} size="sm"
                    variant={calc.property_price === p.value ? 'default' : 'outline'}
                    className="h-5 px-2 text-[9px]"
                    onClick={() => onCalcChange({ property_price: p.value })}
                  >{p.label}</Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">DP</span>
                  <span className="font-bold">{calc.dp_percent}%</span>
                </div>
                <Slider value={[calc.dp_percent]} onValueChange={([v]) => onCalcChange({ dp_percent: v })}
                  min={10} max={50} step={1} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-bold">{calc.interest_rate}%</span>
                </div>
                <Slider value={[calc.interest_rate]}
                  onValueChange={([v]) => onCalcChange({ interest_rate: Math.round(v * 10) / 10 })}
                  min={3} max={15} step={0.1} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Term</span>
                  <span className="font-bold">{calc.loan_term}yr</span>
                </div>
                <Slider value={[calc.loan_term]} onValueChange={([v]) => onCalcChange({ loan_term: v })}
                  min={5} max={30} step={5} />
              </div>
            </div>
          </div>

          {/* Affordable Range */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs">
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-0.5">Affordable Price Range</p>
              <p className="text-muted-foreground">{eligibility.affordable_price_range}</p>
              <p className="text-[10px] text-muted-foreground mt-1 italic">{eligibility.recommended_financing_action}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Partner Options Panel ──────────────────────────────────────────
function PartnerOptionsPanel({ banks, interestRate, loanAmount, loanTerm, onSelectBank }: {
  banks: { id: string; bank_name: string; logo_url: string | null; description: string | null;
    max_loan_term_years: number | null; min_down_payment_percent: number | null }[];
  interestRate: number; loanAmount: number; loanTerm: number;
  onSelectBank: (bankId: string) => void;
}) {
  // Simulate rate variations per bank
  const bankRates = useMemo(() => banks.map((bank, i) => {
    const rateOffset = [-0.5, 0, 0.3, -0.2, 0.15, 0.5][i % 6];
    const fixedRate = Math.max(3, interestRate + rateOffset);
    const floatingRate = fixedRate + 1.5;
    const r = fixedRate / 100 / 12;
    const n = loanTerm * 12;
    const emi = r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;
    return { ...bank, fixedRate: Math.round(fixedRate * 10) / 10, floatingRate: Math.round(floatingRate * 10) / 10, emi, isBest: i === 0 };
  }).sort((a, b) => a.fixedRate - b.fixedRate), [banks, interestRate, loanAmount, loanTerm]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Partner Lender Options
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">{banks.length} Partners</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Compare interest rates and terms from our banking partners</p>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {bankRates.length === 0 ? (
            <div className="py-10 text-center">
              <Landmark className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No partner banks available yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {bankRates.map((bank, idx) => (
                <motion.div
                  key={bank.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md',
                    idx === 0 ? 'border-primary/30 bg-primary/5' : 'border-border/40 bg-card/60 hover:bg-muted/30'
                  )}
                  onClick={() => onSelectBank(bank.id)}
                >
                  {/* Bank Logo */}
                  <div className="w-10 h-10 rounded-lg bg-background border border-border/30 flex items-center justify-center shrink-0 overflow-hidden">
                    {bank.logo_url ? (
                      <img src={bank.logo_url} alt={bank.bank_name} className="w-8 h-8 object-contain" />
                    ) : (
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Bank Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{bank.bank_name}</p>
                      {idx === 0 && (
                        <Badge className="text-[8px] h-4 bg-primary/10 text-primary border-primary/30" variant="outline">
                          <Star className="h-2.5 w-2.5 mr-0.5" /> Best Rate
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                      {bank.max_loan_term_years && <span>Up to {bank.max_loan_term_years}yr</span>}
                      {bank.min_down_payment_percent && <span>Min DP {bank.min_down_payment_percent}%</span>}
                    </div>
                  </div>

                  {/* Rates */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xs text-muted-foreground">Fixed</span>
                      <span className="text-sm font-bold text-foreground">{bank.fixedRate}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Float {bank.floatingRate}% · {formatIDR(Math.round(bank.emi))}/mo
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                </motion.div>
              ))}
            </div>
          )}

          {/* Rate Comparison Summary */}
          {bankRates.length > 1 && (
            <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Rate Comparison</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div>
                  <p className="text-muted-foreground">Lowest Fixed</p>
                  <p className="font-bold text-emerald-600">{bankRates[0]?.fixedRate}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Fixed</p>
                  <p className="font-bold text-foreground">
                    {(bankRates.reduce((s, b) => s + b.fixedRate, 0) / bankRates.length).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monthly Savings</p>
                  <p className="font-bold text-primary">
                    {bankRates.length > 1 ? formatIDR(Math.round(Math.abs(bankRates[bankRates.length - 1].emi - bankRates[0].emi))) : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Application Trigger & Document Checklist ───────────────────────
function ApplicationTriggerPanel({
  onApply, onInquiry, isLoading,
}: {
  onApply: () => void; onInquiry: () => void; isLoading?: boolean;
}) {
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());
  const requiredDocs = DOCUMENT_CHECKLIST.filter(d => d.required);
  const optionalDocs = DOCUMENT_CHECKLIST.filter(d => !d.required);
  const completedRequired = requiredDocs.filter(d => checkedDocs.has(d.id)).length;
  const readiness = Math.round((completedRequired / requiredDocs.length) * 100);

  const toggleDoc = (id: string) => {
    setCheckedDocs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Ready to Apply?
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Check your document readiness and start your mortgage application
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {/* Readiness Indicator */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GaugeCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Document Readiness</span>
              </div>
              <span className={cn(
                'text-sm font-bold',
                readiness >= 80 ? 'text-emerald-600' : readiness >= 50 ? 'text-amber-600' : 'text-muted-foreground'
              )}>
                {readiness}%
              </span>
            </div>
            <Progress value={readiness} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-2">
              {completedRequired}/{requiredDocs.length} required documents prepared
              {readiness === 100 && <span className="text-emerald-600 font-medium ml-1">• Ready to submit!</span>}
            </p>
          </div>

          {/* Document Checklist */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5 text-primary" />
              Required Documents
            </p>
            {requiredDocs.map(doc => (
              <button
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all text-xs',
                  checkedDocs.has(doc.id)
                    ? 'bg-emerald-500/5 border border-emerald-500/20'
                    : 'bg-muted/20 border border-border/30 hover:bg-muted/40'
                )}
              >
                {checkedDocs.has(doc.id) ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                )}
                <span className={cn('flex-1', checkedDocs.has(doc.id) ? 'text-foreground' : 'text-muted-foreground')}>
                  {doc.label}
                </span>
                <Badge variant="outline" className="text-[8px] h-4">{doc.category}</Badge>
              </button>
            ))}

            <p className="text-xs font-medium text-foreground flex items-center gap-1.5 mt-3 pt-2">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              Optional Documents
            </p>
            {optionalDocs.map(doc => (
              <button
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all text-xs',
                  checkedDocs.has(doc.id)
                    ? 'bg-emerald-500/5 border border-emerald-500/20'
                    : 'bg-muted/10 border border-border/20 hover:bg-muted/30'
                )}
              >
                {checkedDocs.has(doc.id) ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                )}
                <span className={cn('flex-1', checkedDocs.has(doc.id) ? 'text-foreground' : 'text-muted-foreground/70')}>
                  {doc.label}
                </span>
              </button>
            ))}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <Button className="w-full h-11 gap-2" size="lg" onClick={onApply} disabled={isLoading}>
              <Zap className="h-4 w-4" />
              Apply for Mortgage
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
            <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5" onClick={onInquiry}>
              <Phone className="h-4 w-4" />
              Request Financing Consultation
            </Button>
          </div>

          <p className="text-[9px] text-muted-foreground text-center">
            Our financing advisor will contact you within 24 hours after submission
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function MortgageFinancingPage() {
  const { user, profile } = useAuth();
  const { data: applications = [], isLoading: appsLoading } = useMyMortgageApplications();
  const { data: banks = [] } = useMortgageBanks();
  const { submitInquiry, isSubmitting: inquirySubmitting } = useMortgageCalculator();
  const submitApp = useSubmitMortgageApplication();
  const [showForm, setShowForm] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [tab, setTab] = useState('financing');

  const [calc, setCalc] = useState({
    property_price: 2_000_000_000,
    dp_percent: 20,
    interest_rate: 8.5,
    loan_term: 20,
  });

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone: '',
    employment_type: 'salaried',
    company_name: '',
    monthly_income: 25_000_000,
    bank_id: '',
  });

  const [inquiry, setInquiry] = useState({
    name: profile?.full_name || '',
    email: user?.email || '',
    phone: '',
    income_range: '10m_25m',
    employment_type: 'salaried',
    preferred_bank_id: '',
  });

  const loanAmount = calc.property_price * (1 - calc.dp_percent / 100);
  const monthlyRate = calc.interest_rate / 100 / 12;
  const totalMonths = calc.loan_term * 12;
  const monthlyPayment = monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    : loanAmount / totalMonths;
  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - loanAmount;
  const downPaymentAmount = calc.property_price * calc.dp_percent / 100;
  const dti = (monthlyPayment / form.monthly_income) * 100;

  const eligibility = useMemo(() => evaluateMortgageEligibility({
    income: form.monthly_income,
    debt: 0,
    price: calc.property_price,
    dp: downPaymentAmount,
    job_status: form.employment_type === 'salaried' ? 'permanent' :
      form.employment_type === 'business_owner' ? 'business_owner' :
      form.employment_type === 'self_employed' ? 'freelance' : 'contract',
  }), [form.monthly_income, calc.property_price, downPaymentAmount, form.employment_type]);

  const handleSubmit = () => {
    const input: SubmitMortgageInput = {
      full_name: form.full_name, email: form.email, phone: form.phone,
      employment_type: form.employment_type, company_name: form.company_name || undefined,
      monthly_income: form.monthly_income, property_price: calc.property_price,
      down_payment: downPaymentAmount, down_payment_percent: calc.dp_percent,
      loan_amount: loanAmount, interest_rate: calc.interest_rate,
      loan_term_years: calc.loan_term, monthly_payment: Math.round(monthlyPayment),
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
        full_name: inquiry.name, email: inquiry.email, phone: inquiry.phone,
        employment_type: inquiry.employment_type,
        loan_amount_requested: Math.round(loanAmount), loan_term_requested: calc.loan_term,
      });
      setShowInquiry(false);
    } catch {}
  };

  const INCOME_RANGES = [
    { label: '< Rp 10jt', value: 'under_10m' },
    { label: 'Rp 10-25jt', value: '10m_25m' },
    { label: 'Rp 25-50jt', value: '25m_50m' },
    { label: 'Rp 50jt+', value: 'above_50m' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Financing Assistance Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore mortgage options, compare lenders, and start your application
          </p>
        </div>
        {applications.length > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setTab('applications')}>
            <FileText className="h-4 w-4" />
            My Applications ({applications.length})
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="financing" className="text-xs gap-1.5">
            <CircleDollarSign className="h-3.5 w-3.5" /> Financing Explorer
          </TabsTrigger>
          <TabsTrigger value="partners" className="text-xs gap-1.5">
            <Landmark className="h-3.5 w-3.5" /> Partner Banks
          </TabsTrigger>
          <TabsTrigger value="applications" className="text-xs gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Applications
          </TabsTrigger>
        </TabsList>

        {/* ─── Financing Explorer Tab ─── */}
        <TabsContent value="financing" className="mt-5">
          <div className="grid lg:grid-cols-5 gap-5">
            {/* Left: Insight Card — 3 cols */}
            <div className="lg:col-span-3">
              <FinancingInsightCard
                monthlyPayment={monthlyPayment} loanAmount={loanAmount}
                downPaymentAmount={downPaymentAmount} dpPercent={calc.dp_percent}
                totalInterest={totalInterest} totalPayment={totalPayment}
                loanTerm={calc.loan_term} interestRate={calc.interest_rate}
                eligibility={eligibility} dti={dti} propertyPrice={calc.property_price}
                onCalcChange={patch => setCalc(c => ({ ...c, ...patch }))}
                calc={calc}
              />
            </div>

            {/* Right: Application Trigger — 2 cols */}
            <div className="lg:col-span-2">
              <ApplicationTriggerPanel
                onApply={() => setShowForm(true)}
                onInquiry={() => setShowInquiry(true)}
                isLoading={submitApp.isPending}
              />
            </div>
          </div>
        </TabsContent>

        {/* ─── Partner Banks Tab ─── */}
        <TabsContent value="partners" className="mt-5">
          <PartnerOptionsPanel
            banks={banks as any[]}
            interestRate={calc.interest_rate}
            loanAmount={loanAmount}
            loanTerm={calc.loan_term}
            onSelectBank={(id) => {
              setForm(f => ({ ...f, bank_id: id }));
              setShowForm(true);
            }}
          />
        </TabsContent>

        {/* ─── Applications Tab ─── */}
        <TabsContent value="applications" className="mt-5 space-y-3">
          {appsLoading ? (
            [1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          ) : applications.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-foreground">No mortgage applications yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start by exploring financing options</p>
                <Button size="sm" variant="outline" className="mt-4 gap-1.5" onClick={() => setTab('financing')}>
                  <Calculator className="h-3.5 w-3.5" /> Explore Financing
                </Button>
              </CardContent>
            </Card>
          ) : applications.map(app => {
            const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const Icon = sc.icon;
            return (
              <motion.div key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="border-border/50 hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-sm font-semibold text-foreground">{formatIDR(app.loan_amount)} Loan</p>
                          <Badge variant="outline" className={cn('text-[10px] gap-1', sc.color)}>
                            <Icon className="h-3 w-3" />{sc.label}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 text-xs">
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
                            <p className={cn('font-medium', (app.dti_ratio || 0) <= 30 ? 'text-emerald-600' : 'text-amber-600')}>
                              {app.dti_ratio?.toFixed(1)}%
                            </p>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-muted-foreground">Term</p>
                            <p className="font-medium text-foreground">{app.loan_term_years}yr</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-[9px] text-muted-foreground shrink-0">
                        {new Date(app.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* ─── Application Dialog ─── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Mortgage Application
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete the form below to submit your mortgage application
            </DialogDescription>
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
                <label className="text-xs font-medium">Preferred Bank</label>
                <Select value={form.bank_id} onValueChange={v => setForm(f => ({ ...f, bank_id: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Any bank" /></SelectTrigger>
                  <SelectContent>
                    {banks.map(b => <SelectItem key={b.id} value={b.id}>{b.bank_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Loan Amount</span><span className="font-medium text-foreground">{formatIDR(loanAmount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Monthly Payment</span><span className="font-medium text-primary">{formatIDR(Math.round(monthlyPayment))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">DTI Ratio</span><span className={cn('font-medium', dti <= 30 ? 'text-emerald-600' : 'text-amber-600')}>{dti.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Eligibility</span><span className={cn('font-medium', ELIGIBILITY_COLORS[eligibility.mortgage_eligibility].text)}>{ELIGIBILITY_COLORS[eligibility.mortgage_eligibility].label}</span></div>
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

      {/* ─── Financing Inquiry Dialog ─── */}
      <Dialog open={showInquiry} onOpenChange={setShowInquiry}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Financing Consultation
            </DialogTitle>
            <DialogDescription className="text-xs">
              Submit your details and our advisor will contact you within 24 hours
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
                  {INCOME_RANGES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {banks.length > 0 && (
              <div>
                <label className="text-xs font-medium">Preferred Bank</label>
                <Select value={inquiry.preferred_bank_id} onValueChange={v => setInquiry(f => ({ ...f, preferred_bank_id: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="No preference" /></SelectTrigger>
                  <SelectContent>
                    {banks.map(b => <SelectItem key={b.id} value={b.id}>{b.bank_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1">
              <p className="font-medium text-foreground text-[11px] mb-1">Your Simulation</p>
              <div className="flex justify-between"><span className="text-muted-foreground">Property Price</span><span>{formatIDR(calc.property_price)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Loan Needed</span><span>{formatIDR(loanAmount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Est. Monthly</span><span className="text-primary font-semibold">{formatIDR(Math.round(monthlyPayment))}</span></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInquiry(false)}>Cancel</Button>
            <Button onClick={handleInquirySubmit} disabled={inquirySubmitting || !inquiry.name || !inquiry.email || !inquiry.phone}>
              {inquirySubmitting ? 'Sending...' : 'Request Consultation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
