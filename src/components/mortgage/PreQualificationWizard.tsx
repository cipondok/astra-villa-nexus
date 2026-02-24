import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User, Briefcase, DollarSign, CreditCard, Home,
  CheckCircle, AlertCircle, ChevronLeft, ChevronRight,
  Download, RotateCcw, FileText, Send, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generatePreQualificationPDF, type PreQualificationData } from '@/utils/preQualificationPdf';
import { useMortgageApplication } from '@/hooks/useMortgageApplication';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const STEPS = [
  { id: 'personal', title: 'Personal Info', icon: User, description: 'Tell us about yourself' },
  { id: 'employment', title: 'Employment', icon: Briefcase, description: 'Your work details' },
  { id: 'income', title: 'Income', icon: DollarSign, description: 'Monthly earnings' },
  { id: 'expenses', title: 'Expenses & Debt', icon: CreditCard, description: 'Existing obligations' },
  { id: 'property', title: 'Property', icon: Home, description: 'Desired property details' },
  { id: 'result', title: 'Result', icon: FileText, description: 'Your pre-qualification' },
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  employmentType: string;
  companyName: string;
  yearsEmployed: number;
  monthlyIncome: number;
  otherIncome: number;
  monthlyExpenses: number;
  existingDebt: number;
  propertyPrice: number;
  downPaymentPercent: number;
  loanTermYears: number;
  interestRate: number;
}

const initialForm: FormData = {
  fullName: '', email: '', phone: '',
  employmentType: '', companyName: '', yearsEmployed: 0,
  monthlyIncome: 0, otherIncome: 0,
  monthlyExpenses: 0, existingDebt: 0,
  propertyPrice: 1_000_000_000, downPaymentPercent: 20, loanTermYears: 20, interestRate: 7.5,
};

const PreQualificationWizard: React.FC<{ className?: string }> = ({ className }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const { submitApplication, isSubmitting } = useMortgageApplication();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof FormData, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const calculations = useMemo(() => {
    const dp = (form.propertyPrice * form.downPaymentPercent) / 100;
    const loan = form.propertyPrice - dp;
    const r = form.interestRate / 100 / 12;
    const n = form.loanTermYears * 12;
    const monthly = r > 0 ? (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;
    const totalPay = monthly * n;
    const totalInt = totalPay - loan;
    const totalIncome = form.monthlyIncome + form.otherIncome;
    const dti = totalIncome > 0 ? (monthly / totalIncome) * 100 : 0;
    const maxLoan30 = totalIncome > 0 ? (totalIncome * 0.3) : 0;
    const maxAffordable = r > 0
      ? (maxLoan30 * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n))
      : maxLoan30 * n;

    let status: 'qualified' | 'conditional' | 'not_qualified' = 'not_qualified';
    if (dti <= 30 && form.downPaymentPercent >= 15 && form.yearsEmployed >= 1) status = 'qualified';
    else if (dti <= 50 && form.downPaymentPercent >= 10) status = 'conditional';

    return { downPayment: dp, loanAmount: loan, monthlyPayment: monthly, totalPayment: totalPay, totalInterest: totalInt, dtiRatio: dti, maxAffordable, qualificationStatus: status };
  }, [form]);

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (step === 0) {
      if (!form.fullName.trim()) e.fullName = 'Required';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
      if (!form.phone.trim()) e.phone = 'Required';
    } else if (step === 1) {
      if (!form.employmentType) e.employmentType = 'Select employment type';
      if (!form.companyName.trim()) e.companyName = 'Required';
    } else if (step === 2) {
      if (form.monthlyIncome <= 0) e.monthlyIncome = 'Enter your income';
    } else if (step === 4) {
      if (form.propertyPrice <= 0) e.propertyPrice = 'Enter property price';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate() && step < STEPS.length - 1) setStep(s => s + 1); };
  const prev = () => { if (step > 0) setStep(s => s - 1); };

  const handleDownloadPDF = () => {
    const pdfData: PreQualificationData = { ...form, ...calculations };
    generatePreQualificationPDF(pdfData);
    toast.success('PDF downloaded successfully!');
  };

  const handleReset = () => { setStep(0); setForm(initialForm); setErrors({}); };

  const progress = ((step + 1) / STEPS.length) * 100;
  const StepIcon = STEPS[step].icon;
  const isResult = step === STEPS.length - 1;

  const inputField = (label: string, key: keyof FormData, opts?: { type?: string; prefix?: string; placeholder?: string }) => (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        {opts?.prefix && <span className="text-sm text-muted-foreground">{opts.prefix}</span>}
        <Input
          type={opts?.type || 'text'}
          value={form[key] || ''}
          onChange={e => update(key, opts?.type === 'number' ? Number(e.target.value) : e.target.value)}
          placeholder={opts?.placeholder}
          className={cn("font-mono", errors[key] && "border-destructive")}
        />
      </div>
      {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <StepIcon className="h-5 w-5 text-primary" />
                {STEPS[step].title}
              </CardTitle>
              <CardDescription className="mt-1">{STEPS[step].description}</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Step {step + 1} of {STEPS.length}
            </Badge>
          </div>
          <Progress value={progress} className="mt-4 h-1.5" />

          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={cn(
                    "flex flex-col items-center gap-1 text-[10px] transition-colors",
                    i <= step ? "text-primary" : "text-muted-foreground/40",
                    i < step && "cursor-pointer hover:text-primary/80"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center border transition-colors",
                    i < step ? "bg-primary border-primary text-primary-foreground" :
                    i === step ? "border-primary text-primary" : "border-muted text-muted-foreground/40"
                  )}>
                    {i < step ? <CheckCircle className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  </div>
                  <span className="hidden sm:block">{s.title}</span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="space-y-5 min-h-[280px]"
            >
              {/* Step 0: Personal */}
              {step === 0 && (
                <>
                  {inputField('Full Name', 'fullName', { placeholder: 'Your full legal name' })}
                  {inputField('Email Address', 'email', { type: 'email', placeholder: 'you@example.com' })}
                  {inputField('Phone Number', 'phone', { placeholder: '+62...' })}
                </>
              )}

              {/* Step 1: Employment */}
              {step === 1 && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Employment Type</Label>
                    <Select value={form.employmentType} onValueChange={v => update('employmentType', v)}>
                      <SelectTrigger className={errors.employmentType ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time Employee">Full-time Employee</SelectItem>
                        <SelectItem value="Contract Employee">Contract Employee</SelectItem>
                        <SelectItem value="Self-employed">Self-employed</SelectItem>
                        <SelectItem value="Business Owner">Business Owner</SelectItem>
                        <SelectItem value="Freelancer">Freelancer</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.employmentType && <p className="text-xs text-destructive">{errors.employmentType}</p>}
                  </div>
                  {inputField('Company / Business Name', 'companyName', { placeholder: 'Company name' })}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Years Employed</Label>
                      <Badge variant="secondary" className="text-xs">{form.yearsEmployed} years</Badge>
                    </div>
                    <Slider
                      value={[form.yearsEmployed]}
                      onValueChange={([v]) => update('yearsEmployed', v)}
                      min={0} max={40} step={1}
                    />
                  </div>
                </>
              )}

              {/* Step 2: Income */}
              {step === 2 && (
                <>
                  {inputField('Monthly Salary / Income', 'monthlyIncome', { type: 'number', prefix: 'Rp' })}
                  {inputField('Other Monthly Income', 'otherIncome', { type: 'number', prefix: 'Rp', placeholder: 'Side business, rental, etc.' })}
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Monthly Income</span>
                      <span className="font-semibold text-primary">{formatIDR(form.monthlyIncome + form.otherIncome)}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Expenses */}
              {step === 3 && (
                <>
                  {inputField('Monthly Living Expenses', 'monthlyExpenses', { type: 'number', prefix: 'Rp', placeholder: 'Rent, utilities, food...' })}
                  {inputField('Existing Debt Payments', 'existingDebt', { type: 'number', prefix: 'Rp', placeholder: 'Car loan, credit card...' })}
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Net Disposable Income</span>
                      <span className="font-semibold">
                        {formatIDR(form.monthlyIncome + form.otherIncome - form.monthlyExpenses - form.existingDebt)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Property */}
              {step === 4 && (
                <>
                  {inputField('Property Price', 'propertyPrice', { type: 'number', prefix: 'Rp' })}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Down Payment</Label>
                      <Badge variant="secondary">{form.downPaymentPercent}% — {formatIDR((form.propertyPrice * form.downPaymentPercent) / 100)}</Badge>
                    </div>
                    <Slider
                      value={[form.downPaymentPercent]}
                      onValueChange={([v]) => update('downPaymentPercent', v)}
                      min={5} max={50} step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Interest Rate</Label>
                      <Badge variant="secondary">{form.interestRate}% p.a.</Badge>
                    </div>
                    <Slider
                      value={[form.interestRate]}
                      onValueChange={([v]) => update('interestRate', v)}
                      min={5} max={15} step={0.5}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Loan Term</Label>
                      <Badge variant="secondary">{form.loanTermYears} years</Badge>
                    </div>
                    <Slider
                      value={[form.loanTermYears]}
                      onValueChange={([v]) => update('loanTermYears', v)}
                      min={5} max={30} step={1}
                    />
                  </div>
                </>
              )}

              {/* Step 5: Result */}
              {isResult && (
                <div className="space-y-5">
                  {/* Status */}
                  <div className={cn(
                    "p-5 rounded-xl border text-center",
                    calculations.qualificationStatus === 'qualified' && "bg-chart-1/10 border-chart-1/20",
                    calculations.qualificationStatus === 'conditional' && "bg-chart-3/10 border-chart-3/20",
                    calculations.qualificationStatus === 'not_qualified' && "bg-destructive/10 border-destructive/20",
                  )}>
                    {calculations.qualificationStatus === 'qualified' ? (
                      <CheckCircle className="h-10 w-10 mx-auto mb-2 text-chart-1" />
                    ) : calculations.qualificationStatus === 'conditional' ? (
                      <AlertCircle className="h-10 w-10 mx-auto mb-2 text-chart-3" />
                    ) : (
                      <AlertCircle className="h-10 w-10 mx-auto mb-2 text-destructive" />
                    )}
                    <h3 className="text-lg font-bold">
                      {calculations.qualificationStatus === 'qualified' && 'You Are Pre-Qualified! 🎉'}
                      {calculations.qualificationStatus === 'conditional' && 'Conditionally Qualified'}
                      {calculations.qualificationStatus === 'not_qualified' && 'Not Qualified Yet'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      DTI Ratio: {calculations.dtiRatio.toFixed(1)}%
                      {calculations.dtiRatio <= 30 ? ' (Excellent)' : calculations.dtiRatio <= 40 ? ' (Good)' : calculations.dtiRatio <= 50 ? ' (Moderate)' : ' (High Risk)'}
                    </p>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Monthly Payment', value: formatIDR(calculations.monthlyPayment) },
                      { label: 'Loan Amount', value: formatIDR(calculations.loanAmount) },
                      { label: 'Total Interest', value: formatIDR(calculations.totalInterest) },
                      { label: 'Max Affordable', value: formatIDR(calculations.maxAffordable) },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-xl bg-muted/40 border border-border/30">
                        <p className="text-[11px] text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-semibold mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleDownloadPDF} className="w-full h-12" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Download Pre-Qualification PDF
                  </Button>

                  {user ? (
                    submitted ? (
                      <div className="p-3 rounded-xl bg-chart-2/10 border border-chart-2/20 text-center">
                        <CheckCircle className="h-5 w-5 text-chart-2 mx-auto mb-1" />
                        <p className="text-sm font-medium">Application Submitted!</p>
                        <Button variant="link" size="sm" className="text-xs mt-1" onClick={() => navigate('/dashboard')}>
                          View in Dashboard →
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={async () => {
                          try {
                            await submitApplication({
                              full_name: form.fullName,
                              email: form.email,
                              phone: form.phone,
                              employment_type: form.employmentType,
                              company_name: form.companyName,
                              years_employed: form.yearsEmployed,
                              monthly_income: form.monthlyIncome,
                              other_income: form.otherIncome,
                              monthly_expenses: form.monthlyExpenses,
                              existing_debt: form.existingDebt,
                              property_price: form.propertyPrice,
                              down_payment: calculations.downPayment,
                              down_payment_percent: form.downPaymentPercent,
                              loan_amount: calculations.loanAmount,
                              loan_term_years: form.loanTermYears,
                              interest_rate: form.interestRate,
                              monthly_payment: calculations.monthlyPayment,
                              dti_ratio: calculations.dtiRatio,
                              qualification_status: calculations.qualificationStatus,
                            });
                            setSubmitted(true);
                          } catch (e) { /* handled by hook */ }
                        }}
                        variant="outline"
                        className="w-full h-12 border-primary/30 hover:bg-primary/5"
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Submit Pre-Approval Application
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/?auth=true')}
                    >
                      Sign in to Submit Application
                    </Button>
                  )}

                  <Button onClick={handleReset} variant="ghost" className="w-full text-muted-foreground">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {!isResult && (
            <div className="flex gap-3 mt-6 pt-4 border-t border-border/30">
              {step > 0 && (
                <Button variant="outline" onClick={prev} className="flex-1">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              )}
              <Button onClick={next} className="flex-1">
                {step === STEPS.length - 2 ? 'See Results' : 'Continue'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreQualificationWizard;
