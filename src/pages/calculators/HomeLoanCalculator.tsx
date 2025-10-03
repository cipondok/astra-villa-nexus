import React, { useState } from 'react';
import { Home, Calculator, TrendingUp, DollarSign, Globe, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EligibilityCheck {
  eligible: boolean;
  issues: string[];
  warnings: string[];
}

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

  // Indonesian banking regulations (OJK - Otoritas Jasa Keuangan)
  const regulations = {
    maxLTV: {
      indonesian: {
        primary: 0.9,      // 90% for first home
        secondary: 0.8,    // 80% for second home
        investment: 0.7    // 70% for investment property
      },
      foreign: {
        primary: 0.7,      // 70% for foreigners (requires KITAS/KITAP)
        secondary: 0,      // Not allowed
        investment: 0      // Not allowed without special permits
      }
    },
    maxDSR: 0.35,          // 35% Debt Service Ratio (max monthly payment / income)
    minDownPayment: {
      indonesian: 0.10,    // 10% minimum
      foreign: 0.30        // 30% minimum for foreigners
    },
    maxLoanTerm: 25,       // 25 years maximum
    minIncome: 5000000,    // Rp 5 juta minimum monthly income
    typicalRates: {
      fixed: { min: 6.5, max: 9.5 },
      floating: { min: 7.5, max: 11.5 }
    }
  };

  const checkEligibility = (): EligibilityCheck => {
    const issues: string[] = [];
    const warnings: string[] = [];
    const income = parseFloat(monthlyIncome);
    const loan = parseFloat(loanAmount);
    const value = parseFloat(propertyValue);
    const term = parseInt(loanTerm);

    // Check minimum income (OJK requirement)
    if (income < regulations.minIncome) {
      issues.push(language === 'id' 
        ? `Pendapatan minimum Rp ${regulations.minIncome.toLocaleString('id-ID')} diperlukan`
        : `Minimum income of Rp ${regulations.minIncome.toLocaleString('id-ID')} required`);
    }

    // Check LTV ratio (OJK regulation)
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

    // Check DSR (Debt Service Ratio)
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

    // Check loan term
    if (term > regulations.maxLoanTerm) {
      issues.push(language === 'id'
        ? `Jangka waktu maksimum ${regulations.maxLoanTerm} tahun menurut peraturan BI`
        : `Maximum loan term is ${regulations.maxLoanTerm} years per BI regulations`);
    }

    // Foreign applicant specific checks
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

    return {
      eligible: issues.length === 0,
      issues,
      warnings
    };
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
      
      // Check eligibility after calculation
      setEligibility(checkEligibility());
    }
  };

  const getDefaultInterestRate = () => {
    // Set typical rates based on property type
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

  const translations = {
    id: {
      title: 'Kalkulator Kredit Pemilikan Rumah (KPR)',
      subtitle: 'Sesuai peraturan OJK & Bank Indonesia',
      calculate: 'Hitung Cicilan',
      applicantType: 'Jenis Pemohon',
      indonesian: 'Warga Negara Indonesia (WNI)',
      foreign: 'Warga Negara Asing (WNA)',
      propertyType: 'Tipe Properti',
      primary: 'Rumah Pertama',
      secondary: 'Rumah Kedua',
      investment: 'Properti Investasi',
      monthlyIncome: 'Pendapatan Bulanan',
      propertyValue: 'Nilai Properti',
      loanAmount: 'Jumlah Pinjaman',
      interestRate: 'Suku Bunga (% per tahun)',
      loanTerm: 'Jangka Waktu (tahun)',
      hasKitas: 'Memiliki KITAS/KITAP',
      monthlyPayment: 'Cicilan Bulanan',
      totalPayment: 'Total Pembayaran',
      totalInterest: 'Total Bunga',
      downPayment: 'Uang Muka',
      ltv: 'Loan to Value (LTV)',
      dsr: 'Debt Service Ratio',
      eligibility: 'Kelayakan Pinjaman',
      eligible: 'Memenuhi Syarat',
      notEligible: 'Tidak Memenuhi Syarat',
      issues: 'Masalah',
      warnings: 'Peringatan'
    },
    en: {
      title: 'Home Loan Calculator (KPR)',
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
      interestRate: 'Interest Rate (% per year)',
      loanTerm: 'Loan Term (years)',
      hasKitas: 'Has KITAS/KITAP',
      monthlyPayment: 'Monthly Payment',
      totalPayment: 'Total Payment',
      totalInterest: 'Total Interest',
      downPayment: 'Down Payment',
      ltv: 'Loan to Value (LTV)',
      dsr: 'Debt Service Ratio',
      eligibility: 'Loan Eligibility',
      eligible: 'Eligible',
      notEligible: 'Not Eligible',
      issues: 'Issues',
      warnings: 'Warnings'
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Modern Header with Language Toggle */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                <Home className="w-6 h-6 text-primary" />
                <Calculator className="w-5 h-5 text-primary/70" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{t.title}</h1>
                <p className="text-xs text-muted-foreground hidden md:block">{t.subtitle}</p>
              </div>
            </div>
            
            {/* Language Toggle */}
            <Tabs value={language} onValueChange={(v: any) => setLanguage(v)} className="w-auto">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="id" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Bahasa
                </TabsTrigger>
                <TabsTrigger value="en" className="gap-2">
                  <Globe className="w-4 h-4" />
                  English
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">

      <Card>
        <CardHeader>
          <CardTitle>{language === 'id' ? 'Detail Pinjaman' : 'Loan Details'}</CardTitle>
          <CardDescription>
            {language === 'id' 
              ? 'Masukkan informasi Anda untuk menghitung cicilan'
              : 'Enter your information to calculate payments'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Applicant Type */}
          <div className="space-y-3 pb-4 border-b">
            <Label className="text-base">{t.applicantType}</Label>
            <RadioGroup value={applicantType} onValueChange={(v: any) => {
              setApplicantType(v);
              setPropertyType('primary'); // Reset property type when changing applicant type
            }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="indonesian" id="wni" />
                <Label htmlFor="wni" className="font-normal cursor-pointer">
                  {t.indonesian}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="foreign" id="wna" />
                <Label htmlFor="wna" className="font-normal cursor-pointer">
                  {t.foreign}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Foreign applicant KITAS requirement */}
          {applicantType === 'foreign' && (
            <div className="space-y-3 pb-4 border-b">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="kitas"
                  checked={hasKitas}
                  onChange={(e) => setHasKitas(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="kitas" className="font-normal cursor-pointer">
                  {t.hasKitas}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'id'
                  ? 'Wajib memiliki KITAS/KITAP sesuai UU No. 5/1960 (UUPA)'
                  : 'Required under Law No. 5/1960 (UUPA)'}
              </p>
            </div>
          )}

          {/* Property Type */}
          <div className="space-y-2">
            <Label htmlFor="propertyType">{t.propertyType}</Label>
            <Select 
              value={propertyType} 
              onValueChange={(v: any) => setPropertyType(v)}
              disabled={applicantType === 'foreign' && propertyType !== 'primary'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">
                  {t.primary} (LTV {(regulations.maxLTV[applicantType].primary * 100).toFixed(0)}%)
                </SelectItem>
                {applicantType === 'indonesian' && (
                  <>
                    <SelectItem value="secondary">
                      {t.secondary} (LTV {(regulations.maxLTV.indonesian.secondary * 100).toFixed(0)}%)
                    </SelectItem>
                    <SelectItem value="investment">
                      {t.investment} (LTV {(regulations.maxLTV.indonesian.investment * 100).toFixed(0)}%)
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="monthlyIncome" className="text-base font-semibold">
                  {t.monthlyIncome}
                </Label>
                <span className="text-sm font-mono bg-primary/10 px-3 py-1 rounded-full">
                  {monthlyIncome ? formatCurrency(parseFloat(monthlyIncome)) : 'Rp 0'}
                </span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[parseFloat(monthlyIncome) || 5000000]}
                  onValueChange={(v) => setMonthlyIncome(v[0].toString())}
                  min={5000000}
                  max={100000000}
                  step={1000000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Rp 5jt</span>
                  <span>Rp 100jt</span>
                </div>
              </div>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="atau masukkan manual"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="propertyValue" className="text-base font-semibold">
                  {t.propertyValue}
                </Label>
                <span className="text-sm font-mono bg-primary/10 px-3 py-1 rounded-full">
                  {propertyValue ? formatCurrency(parseFloat(propertyValue)) : 'Rp 0'}
                </span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[parseFloat(propertyValue) || 500000000]}
                  onValueChange={(v) => {
                    const value = v[0].toString();
                    setPropertyValue(value);
                    // Auto-calculate max loan based on LTV
                    const maxLoan = parseFloat(value) * regulations.maxLTV[applicantType][propertyType];
                    if (maxLoan > 0) {
                      setLoanAmount(maxLoan.toFixed(0));
                    }
                  }}
                  min={100000000}
                  max={10000000000}
                  step={50000000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Rp 100jt</span>
                  <span>Rp 10M</span>
                </div>
              </div>
              <Input
                id="propertyValue"
                type="number"
                placeholder="atau masukkan manual"
                value={propertyValue}
                onChange={(e) => {
                  setPropertyValue(e.target.value);
                  const maxLoan = parseFloat(e.target.value) * regulations.maxLTV[applicantType][propertyType];
                  if (maxLoan > 0 && !loanAmount) {
                    setLoanAmount(maxLoan.toFixed(0));
                  }
                }}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="loanAmount" className="text-base font-semibold">
                {t.loanAmount}
              </Label>
              <span className="text-sm font-mono bg-primary/10 px-3 py-1 rounded-full">
                {loanAmount ? formatCurrency(parseFloat(loanAmount)) : 'Rp 0'}
              </span>
            </div>
            <div className="space-y-2">
              <Slider
                value={[parseFloat(loanAmount) || 0]}
                onValueChange={(v) => setLoanAmount(v[0].toString())}
                min={50000000}
                max={parseFloat(propertyValue) || 5000000000}
                step={10000000}
                className="w-full"
                disabled={!propertyValue}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Rp 50jt</span>
                <span>{propertyValue ? formatCurrency(parseFloat(propertyValue)) : 'Rp 5M'}</span>
              </div>
            </div>
            <Input
              id="loanAmount"
              type="number"
              placeholder="atau masukkan manual"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="mt-2"
            />
            {propertyValue && loanAmount && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">LTV Ratio:</span>
                  <span className="font-semibold">
                    {((parseFloat(loanAmount) / parseFloat(propertyValue)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ 
                      width: `${Math.min(((parseFloat(loanAmount) / parseFloat(propertyValue)) * 100), 100)}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'id' ? 'Maksimum' : 'Maximum'}: {(regulations.maxLTV[applicantType][propertyType] * 100).toFixed(0)}%
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="interestRate" className="text-base font-semibold">
                  {t.interestRate}
                </Label>
                <span className="text-sm font-mono bg-primary/10 px-3 py-1 rounded-full">
                  {interestRate || getDefaultInterestRate()}%
                </span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[parseFloat(interestRate) || parseFloat(getDefaultInterestRate())]}
                  onValueChange={(v) => setInterestRate(v[0].toString())}
                  min={regulations.typicalRates.fixed.min}
                  max={regulations.typicalRates.floating.max}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{regulations.typicalRates.fixed.min}%</span>
                  <span>{regulations.typicalRates.floating.max}%</span>
                </div>
              </div>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                placeholder={getDefaultInterestRate()}
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="loanTerm" className="text-base font-semibold">
                  {t.loanTerm}
                </Label>
                <span className="text-sm font-mono bg-primary/10 px-3 py-1 rounded-full">
                  {loanTerm} {language === 'id' ? 'tahun' : 'years'}
                </span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[parseInt(loanTerm)]}
                  onValueChange={(v) => setLoanTerm(v[0].toString())}
                  min={5}
                  max={regulations.maxLoanTerm}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 {language === 'id' ? 'tahun' : 'yrs'}</span>
                  <span>{regulations.maxLoanTerm} {language === 'id' ? 'tahun' : 'yrs'}</span>
                </div>
              </div>
              <Input
                id="loanTerm"
                type="number"
                placeholder="e.g., 15"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                max={regulations.maxLoanTerm}
                className="mt-2"
              />
            </div>
          </div>

          <Button 
            onClick={calculateLoan} 
            className="w-full" 
            size="lg"
            disabled={!loanAmount || !propertyValue || !interestRate || !monthlyIncome}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {t.calculate}
          </Button>

          {/* Eligibility Check */}
          {eligibility && (
            <Alert variant={eligibility.eligible ? "default" : "destructive"} className="mt-4">
              <div className="flex items-start gap-2">
                {eligibility.eligible ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">
                    {eligibility.eligible ? t.eligible : t.notEligible}
                  </h4>
                  
                  {eligibility.issues.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold mb-1">{t.issues}:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {eligibility.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {eligibility.warnings.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {t.warnings}:
                      </p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {eligibility.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          )}

          {monthlyPayment && (
            <div className="space-y-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">{t.monthlyPayment}</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(monthlyPayment)}</p>
                    {monthlyIncome && (
                      <p className="text-xs text-muted-foreground mt-2">
                        DSR: {((monthlyPayment / parseFloat(monthlyIncome)) * 100).toFixed(1)}% 
                        {' '}({language === 'id' ? 'Maks 35%' : 'Max 35%'})
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <DollarSign className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mb-1">{t.downPayment}</p>
                      <p className="text-sm font-bold">
                        {propertyValue && loanAmount 
                          ? formatCurrency(parseFloat(propertyValue) - parseFloat(loanAmount))
                          : '-'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mb-1">{t.ltv}</p>
                      <p className="text-sm font-bold">
                        {propertyValue && loanAmount
                          ? `${((parseFloat(loanAmount) / parseFloat(propertyValue)) * 100).toFixed(1)}%`
                          : '-'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <DollarSign className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mb-1">{t.totalPayment}</p>
                      <p className="text-sm font-bold">{formatCurrency(totalPayment!)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mb-1">{t.totalInterest}</p>
                      <p className="text-sm font-bold">{formatCurrency(totalInterest!)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-4 border-t space-y-3">
            <div>
              <p className="font-semibold mb-2">
                {language === 'id' ? 'Peraturan yang Berlaku:' : 'Applicable Regulations:'}
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  {language === 'id'
                    ? 'OJK (Otoritas Jasa Keuangan) - Peraturan LTV dan DSR'
                    : 'OJK (Financial Services Authority) - LTV and DSR Regulations'}
                </li>
                <li>
                  {language === 'id'
                    ? 'Bank Indonesia - Ketentuan suku bunga dan jangka waktu'
                    : 'Bank Indonesia - Interest rate and loan term provisions'}
                </li>
                <li>
                  {language === 'id'
                    ? 'UU No. 5/1960 (UUPA) - Kepemilikan properti untuk WNA'
                    : 'Law No. 5/1960 (UUPA) - Property ownership for foreigners'}
                </li>
                <li>
                  {language === 'id'
                    ? 'PP No. 103/2015 - Hak Pakai untuk WNA (maks 30 tahun)'
                    : 'Government Regulation No. 103/2015 - Usage Rights for foreigners (max 30 years)'}
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">
                {language === 'id' ? 'Catatan Penting:' : 'Important Notes:'}
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  {language === 'id'
                    ? 'Perhitungan ini hanya estimasi dan bukan penawaran pinjaman resmi'
                    : 'This calculation is an estimate only and does not constitute an official loan offer'}
                </li>
                <li>
                  {language === 'id'
                    ? 'Suku bunga aktual dapat bervariasi tergantung bank dan skor kredit'
                    : 'Actual interest rates may vary based on bank and credit score'}
                </li>
                <li>
                  {language === 'id'
                    ? 'Biaya tambahan: provisi, administrasi, appraisal, notaris, BPHTB, asuransi'
                    : 'Additional costs: provision, admin fees, appraisal, notary, BPHTB, insurance'}
                </li>
                {applicantType === 'foreign' && (
                  <li className="font-semibold text-amber-600">
                    {language === 'id'
                      ? 'WNA wajib memiliki KITAS/KITAP dan properti harus Hak Pakai (bukan Hak Milik)'
                      : 'Foreigners must have KITAS/KITAP and property must be under Hak Pakai (not Hak Milik)'}
                  </li>
                )}
                <li>
                  {language === 'id'
                    ? 'Konsultasikan dengan bank atau konsultan keuangan untuk informasi lengkap'
                    : 'Consult with a bank or financial advisor for complete information'}
                </li>
              </ul>
            </div>

            {applicantType === 'foreign' && (
              <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                <p className="font-semibold mb-2 text-amber-900 dark:text-amber-100">
                  {language === 'id' ? 'Informasi Khusus WNA:' : 'Foreign Investor Information:'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-amber-900 dark:text-amber-100">
                  <li>
                    {language === 'id'
                      ? 'Hak Pakai berlaku 30 tahun (dapat diperpanjang 20 tahun, lalu 30 tahun)'
                      : 'Hak Pakai valid for 30 years (renewable for 20 years, then 30 years)'}
                  </li>
                  <li>
                    {language === 'id'
                      ? 'Lokasi properti: Tidak boleh di zona pertahanan/keamanan'
                      : 'Property location: Not allowed in defense/security zones'}
                  </li>
                  <li>
                    {language === 'id'
                      ? 'Dokumen: KITAS/KITAP, passport, NPWP, surat keterangan kerja/usaha'
                      : 'Documents: KITAS/KITAP, passport, tax ID (NPWP), employment/business certificate'}
                  </li>
                  <li>
                    {language === 'id'
                      ? 'Down payment minimum 30% dari nilai properti'
                      : 'Minimum down payment of 30% of property value'}
                  </li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default HomeLoanCalculator;
