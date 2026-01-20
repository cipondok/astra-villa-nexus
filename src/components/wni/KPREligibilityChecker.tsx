import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Percent,
  Clock,
  Banknote,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCountryByCode } from './EligibleCountriesSelector';

interface KPREligibilityCheckerProps {
  selectedCountry: string | null;
  className?: string;
}

interface EligibilityResult {
  eligible: boolean;
  score: number;
  maxLoanAmount: number;
  maxTenure: number;
  estimatedMonthlyPayment: number;
  dti: number;
  issues: string[];
  recommendations: string[];
}

export const KPREligibilityChecker: React.FC<KPREligibilityCheckerProps> = ({
  selectedCountry,
  className
}) => {
  const { language } = useLanguage();
  
  // Form state
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [currency, setCurrency] = useState<'USD' | 'SGD' | 'AED' | 'MYR' | 'IDR'>('USD');
  const [monthsEmployed, setMonthsEmployed] = useState<number>(12);
  const [existingDebt, setExistingDebt] = useState<number>(0);
  const [propertyPrice, setPropertyPrice] = useState<number>(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [hasWorkPermit, setHasWorkPermit] = useState<'yes' | 'no' | 'pending'>('yes');
  const [creditHistory, setCreditHistory] = useState<'clean' | 'minor' | 'issues'>('clean');
  const [age, setAge] = useState<number>(35);
  const [showResult, setShowResult] = useState(false);

  // Currency conversion rates to IDR (approximate)
  const exchangeRates: Record<string, number> = {
    USD: 15500,
    SGD: 11500,
    AED: 4220,
    MYR: 3480,
    IDR: 1
  };

  const copy = {
    en: {
      title: "KPR Eligibility Checker",
      subtitle: "Check your mortgage eligibility based on Indonesian banking regulations",
      income: "Monthly Gross Income",
      currency: "Currency",
      employment: "Months in Current Job",
      debt: "Existing Monthly Debt Payments",
      propertyPrice: "Target Property Price (IDR)",
      downPayment: "Down Payment",
      workPermit: "Work Permit Status",
      workPermitOptions: {
        yes: "Valid work permit",
        no: "No work permit",
        pending: "Application pending"
      },
      creditHistory: "Credit History (SLIK/BI Checking)",
      creditOptions: {
        clean: "Clean record (Collectability 1)",
        minor: "Minor issues (Collectability 2)",
        issues: "Significant issues (Collectability 3+)"
      },
      age: "Your Age",
      checkEligibility: "Check Eligibility",
      reset: "Reset Form",
      result: {
        eligible: "Congratulations! You are likely eligible",
        notEligible: "Some requirements need attention",
        score: "Eligibility Score",
        maxLoan: "Maximum Loan Amount",
        maxTenure: "Maximum Tenure",
        monthlyPayment: "Est. Monthly Payment",
        dti: "Debt-to-Income Ratio",
        issues: "Issues to Address",
        recommendations: "Recommendations",
        proceed: "Proceed to Application"
      },
      validation: {
        lowIncome: "Income may be insufficient for this property price",
        highDTI: "Debt-to-income ratio exceeds 40% limit",
        shortEmployment: "Minimum 6 months employment required",
        noWorkPermit: "Valid work permit is required",
        creditIssues: "Credit issues may affect approval",
        lowDP: "Consider higher down payment for better rates",
        ageLimit: "Loan tenure limited by retirement age (55-65)"
      }
    },
    id: {
      title: "Cek Kelayakan KPR",
      subtitle: "Periksa kelayakan KPR Anda berdasarkan regulasi perbankan Indonesia",
      income: "Penghasilan Kotor Bulanan",
      currency: "Mata Uang",
      employment: "Bulan di Pekerjaan Saat Ini",
      debt: "Cicilan Hutang Bulanan yang Ada",
      propertyPrice: "Harga Properti Target (IDR)",
      downPayment: "Uang Muka",
      workPermit: "Status Izin Kerja",
      workPermitOptions: {
        yes: "Izin kerja berlaku",
        no: "Tidak ada izin kerja",
        pending: "Pengajuan sedang diproses"
      },
      creditHistory: "Riwayat Kredit (SLIK/BI Checking)",
      creditOptions: {
        clean: "Riwayat bersih (Kolektibilitas 1)",
        minor: "Masalah kecil (Kolektibilitas 2)",
        issues: "Masalah signifikan (Kolektibilitas 3+)"
      },
      age: "Usia Anda",
      checkEligibility: "Cek Kelayakan",
      reset: "Reset Form",
      result: {
        eligible: "Selamat! Anda kemungkinan memenuhi syarat",
        notEligible: "Beberapa persyaratan perlu diperhatikan",
        score: "Skor Kelayakan",
        maxLoan: "Maksimum Pinjaman",
        maxTenure: "Maksimum Tenor",
        monthlyPayment: "Est. Cicilan Bulanan",
        dti: "Rasio Hutang terhadap Pendapatan",
        issues: "Masalah yang Harus Ditangani",
        recommendations: "Rekomendasi",
        proceed: "Lanjut ke Pengajuan"
      },
      validation: {
        lowIncome: "Penghasilan mungkin tidak cukup untuk harga properti ini",
        highDTI: "Rasio hutang-pendapatan melebihi batas 40%",
        shortEmployment: "Minimal 6 bulan masa kerja diperlukan",
        noWorkPermit: "Izin kerja yang berlaku diperlukan",
        creditIssues: "Masalah kredit dapat mempengaruhi persetujuan",
        lowDP: "Pertimbangkan uang muka lebih tinggi untuk rate lebih baik",
        ageLimit: "Tenor pinjaman dibatasi oleh usia pensiun (55-65)"
      }
    }
  };

  const t = copy[language];

  const calculateEligibility = (): EligibilityResult => {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Convert income to IDR
    const incomeInIDR = monthlyIncome * exchangeRates[currency];
    const existingDebtInIDR = existingDebt * exchangeRates[currency];
    
    // Calculate loan amount
    const loanAmount = propertyPrice * (1 - downPaymentPercent / 100);
    
    // Standard Indonesian KPR rate ~8-10%
    const interestRate = 0.085; 
    const monthlyRate = interestRate / 12;
    
    // Calculate max tenure based on age (retirement at 55-65)
    const maxRetirementAge = 65;
    const maxTenure = Math.min(30, maxRetirementAge - age);
    
    // Calculate monthly payment
    const numberOfPayments = maxTenure * 12;
    const monthlyPayment = numberOfPayments > 0 
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      : 0;
    
    // Calculate DTI (Debt-to-Income)
    const totalDebt = monthlyPayment + existingDebtInIDR;
    const dti = incomeInIDR > 0 ? (totalDebt / incomeInIDR) * 100 : 100;

    // Validation checks
    // 1. DTI Check (max 40% in Indonesia)
    if (dti > 40) {
      issues.push(t.validation.highDTI);
      score -= 30;
    }

    // 2. Employment duration
    if (monthsEmployed < 6) {
      issues.push(t.validation.shortEmployment);
      score -= 20;
    }

    // 3. Work permit
    if (hasWorkPermit === 'no') {
      issues.push(t.validation.noWorkPermit);
      score -= 40;
    } else if (hasWorkPermit === 'pending') {
      score -= 10;
    }

    // 4. Credit history
    if (creditHistory === 'issues') {
      issues.push(t.validation.creditIssues);
      score -= 40;
    } else if (creditHistory === 'minor') {
      score -= 15;
    }

    // 5. Down payment check
    if (downPaymentPercent < 20) {
      recommendations.push(t.validation.lowDP);
      score -= 10;
    }

    // 6. Age limit
    if (maxTenure < 15) {
      recommendations.push(t.validation.ageLimit);
    }

    // 7. Income sufficiency (rough check: monthly payment should be < 30% of income)
    if (monthlyPayment > incomeInIDR * 0.3) {
      issues.push(t.validation.lowIncome);
      score -= 20;
    }

    // Calculate max loan based on income (max 40% DTI)
    const maxMonthlyPaymentAllowed = (incomeInIDR * 0.4) - existingDebtInIDR;
    const maxLoanAmount = maxMonthlyPaymentAllowed > 0
      ? (maxMonthlyPaymentAllowed * (Math.pow(1 + monthlyRate, numberOfPayments) - 1)) /
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))
      : 0;

    return {
      eligible: score >= 60 && issues.length === 0,
      score: Math.max(0, Math.min(100, score)),
      maxLoanAmount: Math.max(0, maxLoanAmount),
      maxTenure,
      estimatedMonthlyPayment: monthlyPayment,
      dti,
      issues,
      recommendations
    };
  };

  const result = useMemo(() => {
    if (showResult) {
      return calculateEligibility();
    }
    return null;
  }, [showResult, monthlyIncome, currency, monthsEmployed, existingDebt, propertyPrice, downPaymentPercent, hasWorkPermit, creditHistory, age]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleReset = () => {
    setMonthlyIncome(0);
    setMonthsEmployed(12);
    setExistingDebt(0);
    setPropertyPrice(0);
    setDownPaymentPercent(20);
    setHasWorkPermit('yes');
    setCreditHistory('clean');
    setAge(35);
    setShowResult(false);
  };

  const countryInfo = selectedCountry ? getCountryByCode(selectedCountry) : null;

  return (
    <Card className={cn("border border-primary/10 bg-transparent dark:bg-white/5 backdrop-blur-xl shadow-sm", className)}>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center">
            <Calculator className="h-4 w-4 text-green-600" />
          </div>
          {t.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{t.subtitle}</p>
        {countryInfo && (
          <Badge className="w-fit mt-2 text-xs gap-1 bg-blue-500/10 text-blue-600 border-blue-500/20">
            {countryInfo.flag} {language === 'id' ? countryInfo.nameId : countryInfo.name}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Income */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                <div className="col-span-3 space-y-1">
                  <Label className="text-[10px] sm:text-xs">{t.income}</Label>
                  <Input
                    type="number"
                    value={monthlyIncome || ''}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    placeholder="5000"
                    className="text-xs sm:text-sm h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] sm:text-xs">{t.currency}</Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as typeof currency)}
                    className="w-full h-8 px-1.5 text-xs sm:text-sm border border-input bg-background rounded-md"
                  >
                    <option value="USD">USD</option>
                    <option value="SGD">SGD</option>
                    <option value="AED">AED</option>
                    <option value="MYR">MYR</option>
                    <option value="IDR">IDR</option>
                  </select>
                </div>
              </div>

              {/* Employment Duration */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] sm:text-xs flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {t.employment}
                  </Label>
                  <Badge variant="secondary" className="text-[9px] sm:text-xs px-1.5">{monthsEmployed} mo</Badge>
                </div>
                <Slider
                  value={[monthsEmployed]}
                  onValueChange={(v) => setMonthsEmployed(v[0])}
                  min={1}
                  max={60}
                  step={1}
                  className="py-1"
                />
              </div>

              {/* Existing Debt */}
              <div className="space-y-1">
                <Label className="text-[10px] sm:text-xs flex items-center gap-1">
                  <Banknote className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {t.debt} ({currency})
                </Label>
                <Input
                  type="number"
                  value={existingDebt || ''}
                  onChange={(e) => setExistingDebt(Number(e.target.value))}
                  placeholder="0"
                  className="text-xs sm:text-sm h-8"
                />
              </div>

              {/* Property Price */}
              <div className="space-y-1">
                <Label className="text-[10px] sm:text-xs">{t.propertyPrice}</Label>
                <Input
                  type="number"
                  value={propertyPrice || ''}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  placeholder="2000000000"
                  className="text-xs sm:text-sm h-8"
                />
              </div>

              {/* Down Payment */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] sm:text-xs flex items-center gap-1">
                    <Percent className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {t.downPayment}
                  </Label>
                  <Badge variant="secondary" className="text-[9px] sm:text-xs px-1.5">{downPaymentPercent}%</Badge>
                </div>
                <Slider
                  value={[downPaymentPercent]}
                  onValueChange={(v) => setDownPaymentPercent(v[0])}
                  min={10}
                  max={50}
                  step={5}
                  className="py-1"
                />
              </div>

              {/* Work Permit */}
              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs">{t.workPermit}</Label>
                <RadioGroup value={hasWorkPermit} onValueChange={(v) => setHasWorkPermit(v as typeof hasWorkPermit)}>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['yes', 'no', 'pending'] as const).map((option) => (
                      <label
                        key={option}
                        className={cn(
                          "flex items-center justify-center px-2 py-1.5 rounded-lg border cursor-pointer transition-all text-[9px] sm:text-[10px] text-center active:scale-95",
                          hasWorkPermit === option 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <RadioGroupItem value={option} className="sr-only" />
                        {t.workPermitOptions[option]}
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Credit History */}
              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs">{t.creditHistory}</Label>
                <RadioGroup value={creditHistory} onValueChange={(v) => setCreditHistory(v as typeof creditHistory)}>
                  <div className="space-y-1.5">
                    {(['clean', 'minor', 'issues'] as const).map((option) => (
                      <label
                        key={option}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer transition-all text-[9px] sm:text-[10px] active:scale-[0.98]",
                          creditHistory === option 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <RadioGroupItem value={option} className="sr-only" />
                        {option === 'clean' && <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500 flex-shrink-0" />}
                        {option === 'minor' && <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-500 flex-shrink-0" />}
                        {option === 'issues' && <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500 flex-shrink-0" />}
                        <span className="truncate">{t.creditOptions[option]}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] sm:text-xs">{t.age}</Label>
                  <Badge variant="secondary" className="text-[9px] sm:text-xs px-1.5">{age} yr</Badge>
                </div>
                <Slider
                  value={[age]}
                  onValueChange={(v) => setAge(v[0])}
                  min={21}
                  max={60}
                  step={1}
                  className="py-1"
                />
              </div>

              <Button 
                onClick={() => setShowResult(true)}
                className="w-full gap-1.5 h-8 text-[10px] sm:text-xs"
                disabled={monthlyIncome === 0 || propertyPrice === 0}
              >
                {t.checkEligibility}
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </motion.div>
          ) : result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Score Display */}
              <div className={cn(
                "p-4 rounded-xl border text-center",
                result.eligible 
                  ? "bg-green-500/10 border-green-500/30" 
                  : "bg-amber-500/10 border-amber-500/30"
              )}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {result.eligible ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  )}
                  <h3 className={cn(
                    "text-sm font-semibold",
                    result.eligible ? "text-green-600" : "text-amber-600"
                  )}>
                    {result.eligible ? t.result.eligible : t.result.notEligible}
                  </h3>
                </div>
                
                <div className="mb-2">
                  <span className="text-3xl font-bold text-foreground">{result.score}</span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
                <Progress value={result.score} className="h-2" />
                <p className="text-[10px] text-muted-foreground mt-1">{t.result.score}</p>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="text-[10px] text-muted-foreground">{t.result.maxLoan}</p>
                  <p className="text-sm font-semibold">{formatCurrency(result.maxLoanAmount)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="text-[10px] text-muted-foreground">{t.result.maxTenure}</p>
                  <p className="text-sm font-semibold">{result.maxTenure} years</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <p className="text-[10px] text-muted-foreground">{t.result.monthlyPayment}</p>
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(result.estimatedMonthlyPayment)}</p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl",
                  result.dti > 40 ? "bg-red-500/10" : "bg-blue-500/10"
                )}>
                  <p className="text-[10px] text-muted-foreground">{t.result.dti}</p>
                  <p className={cn(
                    "text-sm font-semibold",
                    result.dti > 40 ? "text-red-600" : "text-blue-600"
                  )}>{result.dti.toFixed(1)}%</p>
                </div>
              </div>

              {/* Issues */}
              {result.issues.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs font-medium text-red-600 mb-2">{t.result.issues}</p>
                  <ul className="space-y-1">
                    {result.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[10px] text-muted-foreground">
                        <XCircle className="h-3 w-3 text-red-500 flex-shrink-0 mt-0.5" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-xs font-medium text-blue-600 mb-2">{t.result.recommendations}</p>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[10px] text-muted-foreground">
                        <TrendingUp className="h-3 w-3 text-blue-500 flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {t.reset}
                </Button>
                {result.eligible && (
                  <Button className="flex-1 gap-2">
                    {t.result.proceed}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default KPREligibilityChecker;
