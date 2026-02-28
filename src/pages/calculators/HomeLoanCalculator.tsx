import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calculator, TrendingUp, DollarSign, Globe, AlertCircle, CheckCircle, XCircle, Sparkles, Shield, Landmark, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import AIToolsTabBar from '@/components/common/AIToolsTabBar';
import BackToHomeLink from '@/components/common/BackToHomeLink';
import { getCurrencyFormatterShort } from "@/stores/currencyStore";

interface EligibilityCheck {
  eligible: boolean;
  issues: string[];
  warnings: string[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const HomeLoanCalculator = () => {
  const [language, setLanguage] = useState<'en' | 'id'>('id');
  const [applicantType, setApplicantType] = useState<'indonesian' | 'foreign'>('indonesian');
  const [propertyType, setPropertyType] = useState<'primary' | 'secondary' | 'investment'>('primary');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [propertyValue, setPropertyValue] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [loanTerm, setLoanTerm] = useState<string>('15');
  const [hasKitas, setHasKitas] = useState<boolean>(false);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityCheck | null>(null);

  const regulations = {
    maxLTV: {
      indonesian: { primary: 0.9, secondary: 0.8, investment: 0.7 },
      foreign: { primary: 0.7, secondary: 0, investment: 0 }
    },
    maxDSR: 0.35,
    minDownPayment: { indonesian: 0.10, foreign: 0.30 },
    maxLoanTerm: 25,
    minIncome: 5000000,
    typicalRates: { fixed: { min: 6.5, max: 9.5 }, floating: { min: 7.5, max: 11.5 } }
  };

  const checkEligibility = (): EligibilityCheck => {
    const issues: string[] = [];
    const warnings: string[] = [];
    const income = parseFloat(monthlyIncome);
    const loan = parseFloat(loanAmount);
    const value = parseFloat(propertyValue);
    const term = parseInt(loanTerm);

    if (income < regulations.minIncome) {
      issues.push(language === 'id' 
        ? `Pendapatan minimum Rp ${regulations.minIncome.toLocaleString('id-ID')} diperlukan`
        : `Minimum income of Rp ${regulations.minIncome.toLocaleString('id-ID')} required`);
    }

    const ltv = loan / value;
    const maxLTV = regulations.maxLTV[applicantType][propertyType];
    
    if (maxLTV === 0) {
      issues.push(language === 'id'
        ? 'Tipe properti ini tidak diizinkan untuk pemohon asing menurut peraturan OJK'
        : 'This property type is not allowed for foreign applicants under OJK regulations');
    } else if (ltv > maxLTV) {
      issues.push(language === 'id'
        ? `LTV maksimum ${(maxLTV * 100).toFixed(0)}% terlampaui. Down payment minimum: ${formatCurrency(value * (1 - maxLTV))}`
        : `Maximum LTV of ${(maxLTV * 100).toFixed(0)}% exceeded. Minimum down payment: ${formatCurrency(value * (1 - maxLTV))}`);
    }

    if (monthlyPayment && income) {
      const dsr = monthlyPayment / income;
      if (dsr > regulations.maxDSR) {
        issues.push(language === 'id'
          ? `Rasio cicilan terhadap pendapatan (${(dsr * 100).toFixed(1)}%) melebihi batas maksimum 35% menurut OJK`
          : `Debt service ratio (${(dsr * 100).toFixed(1)}%) exceeds maximum 35% per OJK regulations`);
      } else if (dsr > 0.30) {
        warnings.push(language === 'id'
          ? `Rasio cicilan ${(dsr * 100).toFixed(1)}% mendekati batas maksimum`
          : `Debt ratio of ${(dsr * 100).toFixed(1)}% is approaching the limit`);
      }
    }

    if (term > regulations.maxLoanTerm) {
      issues.push(language === 'id'
        ? `Jangka waktu maksimum ${regulations.maxLoanTerm} tahun menurut peraturan BI`
        : `Maximum loan term is ${regulations.maxLoanTerm} years per BI regulations`);
    }

    if (applicantType === 'foreign') {
      if (!hasKitas) {
        issues.push(language === 'id'
          ? 'KITAS/KITAP diperlukan untuk pemohon asing (UU No. 5/1960 - UUPA)'
          : 'KITAS/KITAP required for foreign applicants (Law No. 5/1960 - UUPA)');
      }
      warnings.push(language === 'id'
        ? 'Properti harus atas nama Hak Pakai (bukan Hak Milik) untuk WNA'
        : 'Property must be under Hak Pakai (not Hak Milik) rights for foreigners');
      warnings.push(language === 'id'
        ? 'Hak Pakai berlaku maksimum 30 tahun (dapat diperpanjang)'
        : 'Hak Pakai valid for maximum 30 years (renewable)');
    }

    return { eligible: issues.length === 0, issues, warnings };
  };

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12;
    const months = parseInt(loanTerm) * 12;

    if (principal && rate && months) {
      const x = Math.pow(1 + rate, months);
      const monthly = (principal * x * rate) / (x - 1);
      const total = monthly * months;
      const interest = total - principal;

      setMonthlyPayment(monthly);
      setTotalPayment(total);
      setTotalInterest(interest);
      setEligibility(checkEligibility());
    }
  };

  const getDefaultInterestRate = () => {
    if (propertyType === 'primary') return '7.5';
    if (propertyType === 'secondary') return '8.5';
    return '9.5';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatShort = (value: number) => {
    return getCurrencyFormatterShort()(value);
  };

  // Chart data
  const pieData = useMemo(() => {
    if (!totalPayment || !totalInterest || !loanAmount) return [];
    return [
      { name: language === 'id' ? 'Pokok' : 'Principal', value: parseFloat(loanAmount), fill: 'hsl(var(--gold-primary))' },
      { name: language === 'id' ? 'Bunga' : 'Interest', value: totalInterest, fill: 'hsl(var(--muted-foreground) / 0.3)' },
    ];
  }, [totalPayment, totalInterest, loanAmount, language]);

  const dsrData = useMemo(() => {
    if (!monthlyPayment || !monthlyIncome) return [];
    const income = parseFloat(monthlyIncome);
    const dsr = (monthlyPayment / income) * 100;
    return [
      { name: 'KPR', value: dsr, fill: dsr > 35 ? 'hsl(var(--destructive))' : 'hsl(var(--gold-primary))' },
      { name: language === 'id' ? 'Sisa' : 'Remaining', value: 100 - dsr, fill: 'hsl(var(--muted) / 0.5)' },
    ];
  }, [monthlyPayment, monthlyIncome, language]);

  const translations = {
    id: {
      title: 'Kalkulator KPR',
      subtitle: 'Sesuai peraturan OJK & Bank Indonesia',
      calculate: 'Hitung Cicilan',
      applicantType: 'Jenis Pemohon',
      indonesian: 'WNI (Warga Negara Indonesia)',
      foreign: 'WNA (Warga Negara Asing)',
      propertyType: 'Tipe Properti',
      primary: 'Rumah Pertama',
      secondary: 'Rumah Kedua',
      investment: 'Properti Investasi',
      monthlyIncome: 'Pendapatan Bulanan',
      propertyValue: 'Nilai Properti',
      loanAmount: 'Jumlah Pinjaman',
      interestRate: 'Suku Bunga (% / tahun)',
      loanTerm: 'Jangka Waktu (tahun)',
      hasKitas: 'Memiliki KITAS/KITAP',
      monthlyPayment: 'Cicilan Bulanan',
      totalPayment: 'Total Pembayaran',
      totalInterest: 'Total Bunga',
      downPayment: 'Uang Muka',
      ltv: 'LTV Ratio',
      dsr: 'DSR',
      eligibility: 'Kelayakan Pinjaman',
      eligible: 'Memenuhi Syarat',
      notEligible: 'Tidak Memenuhi Syarat',
      issues: 'Masalah',
      warnings: 'Peringatan',
    },
    en: {
      title: 'KPR Calculator',
      subtitle: 'Compliant with OJK & Bank Indonesia regulations',
      calculate: 'Calculate Payment',
      applicantType: 'Applicant Type',
      indonesian: 'Indonesian Citizen (WNI)',
      foreign: 'Foreign Citizen (WNA)',
      propertyType: 'Property Type',
      primary: 'First Home',
      secondary: 'Second Home',
      investment: 'Investment Property',
      monthlyIncome: 'Monthly Income',
      propertyValue: 'Property Value',
      loanAmount: 'Loan Amount',
      interestRate: 'Interest Rate (% / year)',
      loanTerm: 'Loan Term (years)',
      hasKitas: 'Has KITAS/KITAP',
      monthlyPayment: 'Monthly Payment',
      totalPayment: 'Total Payment',
      totalInterest: 'Total Interest',
      downPayment: 'Down Payment',
      ltv: 'LTV Ratio',
      dsr: 'DSR',
      eligibility: 'Loan Eligibility',
      eligible: 'Eligible',
      notEligible: 'Not Eligible',
      issues: 'Issues',
      warnings: 'Warnings',
    },
  };

  const t = translations[language] || translations.en;
  const inputClass = "border-border/60 focus:border-gold-primary/40 focus:ring-gold-primary/20";

  return (
    <div className="min-h-screen bg-background pt-11 md:pt-12">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-primary/[0.03] via-transparent to-gold-primary/[0.02]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-gold-primary/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-gold-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-2 md:px-4 py-2 md:py-4 max-w-5xl">
        <BackToHomeLink sectionId="ai-tools-section" alwaysShow />
        <AIToolsTabBar className="mb-3" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 md:mb-6"
        >
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-primary/10 border border-gold-primary/20 text-gold-primary text-xs font-semibold mb-2">
              <Landmark className="h-3.5 w-3.5" />
              OJK & BI Compliant
            </div>
            <h1 className="text-lg md:text-2xl font-bold text-foreground">{t.title}</h1>
            <p className="text-[10px] md:text-xs text-muted-foreground">{t.subtitle}</p>
          </div>
          
          <Tabs value={language} onValueChange={(v: any) => setLanguage(v)} className="w-auto">
            <TabsList className="grid w-[100px] md:w-[140px] grid-cols-2 h-7">
              <TabsTrigger value="id" className="gap-0.5 text-[10px] md:text-xs h-6">
                <Globe className="w-2.5 h-2.5" /><span>ID</span>
              </TabsTrigger>
              <TabsTrigger value="en" className="gap-0.5 text-[10px] md:text-xs h-6">
                <Globe className="w-2.5 h-2.5" /><span>EN</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-4 md:gap-6">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Card className="border-gold-primary/15 shadow-lg shadow-gold-primary/5 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-primary via-gold-primary/80 to-gold-primary/40" />
              <CardHeader className="p-3 md:p-4">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <div className="p-1.5 rounded-lg bg-gold-primary/10">
                    <Calculator className="h-4 w-4 text-gold-primary" />
                  </div>
                  {language === 'id' ? 'Detail Pinjaman' : 'Loan Details'}
                </CardTitle>
                <CardDescription className="text-[10px] md:text-xs">
                  {language === 'id' ? 'Masukkan informasi untuk menghitung cicilan' : 'Enter information to calculate payments'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 md:p-4 space-y-4">
                {/* Applicant Type */}
                <div className="space-y-2 pb-3 border-b border-border/40">
                  <Label className="text-sm font-semibold">{t.applicantType}</Label>
                  <RadioGroup value={applicantType} onValueChange={(v: any) => { setApplicantType(v); setPropertyType('primary'); }}>
                    <div className="grid grid-cols-2 gap-2">
                      {(['indonesian', 'foreign'] as const).map(type => (
                        <label
                          key={type}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            applicantType === type
                              ? 'border-gold-primary/40 bg-gold-primary/5 shadow-sm'
                              : 'border-border/40 hover:border-gold-primary/20'
                          }`}
                        >
                          <RadioGroupItem value={type} id={type} />
                          <span className="text-xs font-medium">{t[type]}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* KITAS for foreign */}
                <AnimatePresence>
                  {applicantType === 'foreign' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pb-3 border-b border-border/40"
                    >
                      <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gold-primary/20 bg-gold-primary/5 cursor-pointer">
                        <input type="checkbox" checked={hasKitas} onChange={e => setHasKitas(e.target.checked)} className="rounded accent-[hsl(var(--gold-primary))]" />
                        <span className="text-xs font-medium">{t.hasKitas}</span>
                      </label>
                      <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">
                        {language === 'id' ? 'Wajib sesuai UU No. 5/1960 (UUPA)' : 'Required under Law No. 5/1960 (UUPA)'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Property Type */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">{t.propertyType}</Label>
                  <Select value={propertyType} onValueChange={(v: any) => setPropertyType(v)}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">{t.primary} (LTV {(regulations.maxLTV[applicantType].primary * 100).toFixed(0)}%)</SelectItem>
                      {applicantType === 'indonesian' && (
                        <>
                          <SelectItem value="secondary">{t.secondary} (LTV {(regulations.maxLTV.indonesian.secondary * 100).toFixed(0)}%)</SelectItem>
                          <SelectItem value="investment">{t.investment} (LTV {(regulations.maxLTV.indonesian.investment * 100).toFixed(0)}%)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sliders */}
                <SliderField
                  label={t.monthlyIncome}
                  value={monthlyIncome}
                  onChange={setMonthlyIncome}
                  min={5000000} max={100000000} step={1000000}
                  minLabel={formatShort(5_000_000)} maxLabel={formatShort(100_000_000)}
                  format={(v) => formatShort(parseFloat(v) || 0)}
                  inputClass={inputClass}
                />

                <SliderField
                  label={t.propertyValue}
                  value={propertyValue}
                  onChange={(v) => {
                    setPropertyValue(v);
                    const maxLoan = parseFloat(v) * regulations.maxLTV[applicantType][propertyType];
                    if (maxLoan > 0) setLoanAmount(maxLoan.toFixed(0));
                  }}
                  min={100000000} max={10000000000} step={50000000}
                  minLabel={formatShort(100_000_000)} maxLabel={formatShort(10_000_000_000)}
                  format={(v) => formatShort(parseFloat(v) || 0)}
                  inputClass={inputClass}
                />

                <SliderField
                  label={t.loanAmount}
                  value={loanAmount}
                  onChange={setLoanAmount}
                  min={50000000} max={parseFloat(propertyValue) || 5000000000} step={10000000}
                  minLabel={formatShort(50_000_000)} maxLabel={propertyValue ? formatShort(parseFloat(propertyValue)) : formatShort(5_000_000_000)}
                  format={(v) => formatShort(parseFloat(v) || 0)}
                  disabled={!propertyValue}
                  inputClass={inputClass}
                />

                {/* LTV indicator */}
                {propertyValue && loanAmount && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-muted/30 rounded-xl border border-border/30">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground font-medium">LTV Ratio</span>
                      <span className="font-bold text-foreground">
                        {((parseFloat(loanAmount) / parseFloat(propertyValue)) * 100).toFixed(1)}%
                        <span className="text-muted-foreground font-normal ml-1">
                          (max {(regulations.maxLTV[applicantType][propertyType] * 100).toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((parseFloat(loanAmount) / parseFloat(propertyValue)) * 100), 100)}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-gold-primary to-gold-primary/70 rounded-full"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <SliderField
                    label={t.interestRate}
                    value={interestRate}
                    onChange={setInterestRate}
                    min={regulations.typicalRates.fixed.min} max={regulations.typicalRates.floating.max} step={0.1}
                    minLabel={`${regulations.typicalRates.fixed.min}%`} maxLabel={`${regulations.typicalRates.floating.max}%`}
                    format={(v) => `${v}%`}
                    defaultValue={getDefaultInterestRate()}
                    inputClass={inputClass}
                    inputStep="0.1"
                  />
                  <SliderField
                    label={t.loanTerm}
                    value={loanTerm}
                    onChange={setLoanTerm}
                    min={5} max={regulations.maxLoanTerm} step={1}
                    minLabel={`5 ${language === 'id' ? 'thn' : 'yrs'}`}
                    maxLabel={`${regulations.maxLoanTerm} ${language === 'id' ? 'thn' : 'yrs'}`}
                    format={(v) => `${v} ${language === 'id' ? 'tahun' : 'years'}`}
                    inputClass={inputClass}
                  />
                </div>

                <Button
                  onClick={calculateLoan}
                  className="w-full h-11 text-sm font-bold gap-2 bg-gradient-to-r from-gold-primary to-gold-primary/80 hover:from-gold-primary/90 hover:to-gold-primary/70 text-background shadow-lg shadow-gold-primary/20 transition-all"
                  disabled={!loanAmount || !propertyValue || !interestRate || !monthlyIncome}
                >
                  <Zap className="h-4 w-4" />
                  {t.calculate}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            <AnimatePresence mode="wait">
              {!monthlyPayment ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[300px] text-center"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-primary/10 to-gold-primary/5 border border-gold-primary/15 flex items-center justify-center mb-4"
                  >
                    <Calculator className="h-10 w-10 text-gold-primary/50" />
                  </motion.div>
                  <h3 className="text-base font-bold text-foreground mb-1">
                    {language === 'id' ? 'Siap Menghitung' : 'Ready to Calculate'}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    {language === 'id' ? 'Isi detail pinjaman lalu klik "Hitung Cicilan"' : 'Fill in loan details and click "Calculate"'}
                  </p>
                  <div className="flex items-center gap-3 mt-4 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Shield className="h-2.5 w-2.5 text-gold-primary" /> OJK</span>
                    <span className="flex items-center gap-1"><Landmark className="h-2.5 w-2.5 text-gold-primary" /> BI</span>
                    <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5 text-gold-primary" /> Instan</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {/* Monthly Payment Hero */}
                  <motion.div variants={fadeUp}>
                    <Card className="border-gold-primary/20 shadow-xl shadow-gold-primary/5 overflow-hidden">
                      <div className="relative bg-gradient-to-br from-gold-primary/5 via-card to-gold-primary/[0.03] p-5">
                        <div className="absolute -top-16 -right-16 w-32 h-32 bg-gold-primary/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10 text-center">
                          <p className="text-xs text-muted-foreground mb-1">{t.monthlyPayment}</p>
                          <motion.p
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
                            className="text-2xl md:text-3xl font-black bg-gradient-to-r from-gold-primary to-gold-primary/70 bg-clip-text text-transparent"
                          >
                            {formatCurrency(monthlyPayment)}
                          </motion.p>
                          {monthlyIncome && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/60 border border-border/30 text-[10px]">
                              <span className="text-muted-foreground">DSR:</span>
                              <span className={`font-bold ${((monthlyPayment / parseFloat(monthlyIncome)) * 100) > 35 ? 'text-destructive' : 'text-emerald-500'}`}>
                                {((monthlyPayment / parseFloat(monthlyIncome)) * 100).toFixed(1)}%
                              </span>
                              <span className="text-muted-foreground">(max 35%)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Payment Breakdown Pie */}
                  {pieData.length > 0 && (
                    <motion.div variants={fadeUp}>
                      <Card className="border-gold-primary/10">
                        <CardContent className="p-4">
                          <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                            <DollarSign className="h-3.5 w-3.5 text-gold-primary" />
                            {language === 'id' ? 'Rincian Pembayaran' : 'Payment Breakdown'}
                          </h4>
                          <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%" cy="50%"
                                  innerRadius="55%" outerRadius="80%"
                                  dataKey="value"
                                  strokeWidth={2}
                                  stroke="hsl(var(--background))"
                                >
                                  {pieData.map((entry, idx) => (
                                    <Cell key={idx} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatShort(value)} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex justify-center gap-4 text-[10px]">
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-gold-primary" />
                              {language === 'id' ? 'Pokok' : 'Principal'}: {formatShort(parseFloat(loanAmount))}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                              {language === 'id' ? 'Bunga' : 'Interest'}: {formatShort(totalInterest!)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Stats Grid */}
                  <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
                    <StatCard icon={DollarSign} label={t.downPayment} value={propertyValue && loanAmount ? formatShort(parseFloat(propertyValue) - parseFloat(loanAmount)) : '-'} />
                    <StatCard icon={TrendingUp} label={t.ltv} value={propertyValue && loanAmount ? `${((parseFloat(loanAmount) / parseFloat(propertyValue)) * 100).toFixed(1)}%` : '-'} />
                    <StatCard icon={DollarSign} label={t.totalPayment} value={totalPayment ? formatShort(totalPayment) : '-'} />
                    <StatCard icon={TrendingUp} label={t.totalInterest} value={totalInterest ? formatShort(totalInterest) : '-'} highlight />
                  </motion.div>

                  {/* Eligibility */}
                  {eligibility && (
                    <motion.div variants={fadeUp}>
                      <Card className={`border ${eligibility.eligible ? 'border-emerald-500/20' : 'border-destructive/20'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {eligibility.eligible ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                                <CheckCircle className="h-3 w-3 mr-1" /> {t.eligible}
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px]">
                                <XCircle className="h-3 w-3 mr-1" /> {t.notEligible}
                              </Badge>
                            )}
                          </div>
                          {eligibility.issues.length > 0 && (
                            <div className="space-y-1 mb-2">
                              {eligibility.issues.map((issue, i) => (
                                <p key={i} className="text-[10px] text-destructive flex items-start gap-1">
                                  <XCircle className="h-3 w-3 mt-0.5 shrink-0" /> {issue}
                                </p>
                              ))}
                            </div>
                          )}
                          {eligibility.warnings.length > 0 && (
                            <div className="space-y-1">
                              {eligibility.warnings.map((w, i) => (
                                <p key={i} className="text-[10px] text-gold-primary flex items-start gap-1">
                                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" /> {w}
                                </p>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Regulations Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6">
          <Card className="border-border/30 bg-muted/20">
            <CardContent className="p-3 md:p-4">
              <div className="grid md:grid-cols-2 gap-4 text-[10px] text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground text-xs mb-1.5">
                    {language === 'id' ? 'Peraturan yang Berlaku' : 'Applicable Regulations'}
                  </p>
                  <ul className="space-y-0.5 list-disc list-inside">
                    <li>OJK - {language === 'id' ? 'Peraturan LTV dan DSR' : 'LTV and DSR Regulations'}</li>
                    <li>Bank Indonesia - {language === 'id' ? 'Ketentuan suku bunga' : 'Interest rate provisions'}</li>
                    <li>UU No. 5/1960 (UUPA) - {language === 'id' ? 'Kepemilikan untuk WNA' : 'Foreign ownership'}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-xs mb-1.5">
                    {language === 'id' ? 'Catatan' : 'Notes'}
                  </p>
                  <ul className="space-y-0.5 list-disc list-inside">
                    <li>{language === 'id' ? 'Estimasi saja, bukan penawaran resmi' : 'Estimate only, not an official offer'}</li>
                    <li>{language === 'id' ? 'Biaya tambahan: provisi, notaris, BPHTB, asuransi' : 'Extra costs: provision, notary, BPHTB, insurance'}</li>
                  </ul>
                </div>
              </div>
              {applicantType === 'foreign' && (
                <div className="mt-3 p-2.5 rounded-lg bg-gold-primary/5 border border-gold-primary/15 text-[10px]">
                  <p className="font-semibold text-foreground mb-1">
                    {language === 'id' ? 'Info Khusus WNA' : 'Foreign Investor Info'}
                  </p>
                  <p className="text-muted-foreground">
                    {language === 'id'
                      ? 'Hak Pakai 30 tahun (dapat diperpanjang). DP minimum 30%. Dokumen: KITAS/KITAP, passport, NPWP.'
                      : 'Hak Pakai 30 years (renewable). Min 30% down payment. Docs: KITAS/KITAP, passport, NPWP.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

/* Reusable slider field */
const SliderField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  min: number; max: number; step: number;
  minLabel: string; maxLabel: string;
  format: (v: string) => string;
  disabled?: boolean;
  defaultValue?: string;
  inputClass: string;
  inputStep?: string;
}> = ({ label, value, onChange, min, max, step, minLabel, maxLabel, format, disabled, defaultValue, inputClass, inputStep }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <Label className="text-xs font-semibold">{label}</Label>
      <span className="text-[10px] font-mono bg-gold-primary/10 text-gold-primary px-2 py-0.5 rounded-full font-bold">
        {value ? format(value) : defaultValue ? format(defaultValue) : '-'}
      </span>
    </div>
    <Slider
      value={[parseFloat(value) || (defaultValue ? parseFloat(defaultValue) : min)]}
      onValueChange={(v) => onChange(v[0].toString())}
      min={min} max={max} step={step}
      className="w-full"
      disabled={disabled}
    />
    <div className="flex justify-between text-[9px] text-muted-foreground">
      <span>{minLabel}</span>
      <span>{maxLabel}</span>
    </div>
  </div>
);

/* Stat card */
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ icon: Icon, label, value, highlight }) => (
  <Card className={`border-border/40 ${highlight ? 'border-gold-primary/20' : ''}`}>
    <CardContent className="p-3 text-center">
      <Icon className="w-3.5 h-3.5 mx-auto mb-1 text-gold-primary" />
      <p className="text-[9px] text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-xs font-bold ${highlight ? 'text-gold-primary' : 'text-foreground'}`}>{value}</p>
    </CardContent>
  </Card>
);

export default HomeLoanCalculator;
