import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Calculator, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Globe,
  Briefcase,
  DollarSign,
  Home,
  FileCheck,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface FormData {
  nationality: string;
  visaType: string;
  investmentBudget: string;
  propertyType: string;
  hasValidPassport: string;
  purposeOfInvestment: string;
  hasProofOfFunds: string;
  age: string;
}

const WNAEligibilityChecker: React.FC = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    nationality: '',
    visaType: '',
    investmentBudget: '',
    propertyType: '',
    hasValidPassport: '',
    purposeOfInvestment: '',
    hasProofOfFunds: '',
    age: ''
  });
  const [showResults, setShowResults] = useState(false);

  const copy = {
    en: {
      title: "WNA Eligibility Checker",
      subtitle: "Check if you qualify for property investment in Indonesia",
      
      fields: {
        nationality: "Your Nationality",
        nationalityPlaceholder: "Select your nationality",
        visaType: "Visa/Stay Permit Type",
        visaTypePlaceholder: "Select visa type",
        investmentBudget: "Investment Budget (USD)",
        budgetPlaceholder: "e.g. 500000",
        propertyType: "Property Type Interest",
        propertyTypePlaceholder: "Select property type",
        hasValidPassport: "Valid Passport (min 18 months)",
        purposeOfInvestment: "Purpose of Investment",
        purposePlaceholder: "Select purpose",
        hasProofOfFunds: "Proof of Funds Available",
        age: "Your Age"
      },

      visaTypes: [
        { value: 'tourist', label: 'Tourist Visa (B211)' },
        { value: 'kitas', label: 'KITAS (Limited Stay)' },
        { value: 'kitap', label: 'KITAP (Permanent Stay)' },
        { value: 'investor', label: 'Investor Visa' },
        { value: 'retirement', label: 'Retirement Visa' },
        { value: 'secondhome', label: 'Second Home Visa' },
        { value: 'none', label: 'No Indonesian Visa Yet' }
      ],

      propertyTypes: [
        { value: 'house', label: 'House/Villa' },
        { value: 'apartment', label: 'Apartment/Condo' },
        { value: 'commercial', label: 'Commercial Property' },
        { value: 'land', label: 'Land Only' }
      ],

      purposes: [
        { value: 'residence', label: 'Personal Residence' },
        { value: 'investment', label: 'Investment/Rental' },
        { value: 'retirement', label: 'Retirement Home' },
        { value: 'business', label: 'Business Use' }
      ],

      yesNo: {
        yes: "Yes",
        no: "No"
      },

      calculate: "Check Eligibility",
      reset: "Reset",
      
      results: {
        title: "Eligibility Results",
        eligible: "You are likely eligible!",
        partiallyEligible: "Partially eligible with conditions",
        notEligible: "Additional steps required",
        score: "Eligibility Score",
        recommendations: "Recommendations",
        nextSteps: "Next Steps"
      }
    },
    id: {
      title: "Cek Kelayakan WNA",
      subtitle: "Periksa apakah Anda memenuhi syarat investasi properti di Indonesia",
      
      fields: {
        nationality: "Kewarganegaraan Anda",
        nationalityPlaceholder: "Pilih kewarganegaraan",
        visaType: "Jenis Visa/Izin Tinggal",
        visaTypePlaceholder: "Pilih jenis visa",
        investmentBudget: "Anggaran Investasi (USD)",
        budgetPlaceholder: "contoh: 500000",
        propertyType: "Jenis Properti yang Diminati",
        propertyTypePlaceholder: "Pilih jenis properti",
        hasValidPassport: "Paspor Valid (min 18 bulan)",
        purposeOfInvestment: "Tujuan Investasi",
        purposePlaceholder: "Pilih tujuan",
        hasProofOfFunds: "Bukti Dana Tersedia",
        age: "Usia Anda"
      },

      visaTypes: [
        { value: 'tourist', label: 'Visa Turis (B211)' },
        { value: 'kitas', label: 'KITAS (Tinggal Terbatas)' },
        { value: 'kitap', label: 'KITAP (Tinggal Tetap)' },
        { value: 'investor', label: 'Visa Investor' },
        { value: 'retirement', label: 'Visa Pensiun' },
        { value: 'secondhome', label: 'Visa Second Home' },
        { value: 'none', label: 'Belum Punya Visa Indonesia' }
      ],

      propertyTypes: [
        { value: 'house', label: 'Rumah/Villa' },
        { value: 'apartment', label: 'Apartemen/Kondominium' },
        { value: 'commercial', label: 'Properti Komersial' },
        { value: 'land', label: 'Tanah Saja' }
      ],

      purposes: [
        { value: 'residence', label: 'Tempat Tinggal Pribadi' },
        { value: 'investment', label: 'Investasi/Sewa' },
        { value: 'retirement', label: 'Rumah Pensiun' },
        { value: 'business', label: 'Penggunaan Bisnis' }
      ],

      yesNo: {
        yes: "Ya",
        no: "Tidak"
      },

      calculate: "Cek Kelayakan",
      reset: "Reset",
      
      results: {
        title: "Hasil Kelayakan",
        eligible: "Anda kemungkinan memenuhi syarat!",
        partiallyEligible: "Memenuhi syarat sebagian dengan ketentuan",
        notEligible: "Diperlukan langkah tambahan",
        score: "Skor Kelayakan",
        recommendations: "Rekomendasi",
        nextSteps: "Langkah Selanjutnya"
      }
    }
  };

  const t = copy[language];

  const nationalities = [
    'Singapore', 'Australia', 'Japan', 'China', 'USA', 'Malaysia', 'South Korea',
    'UK', 'Germany', 'Netherlands', 'Hong Kong', 'India', 'Taiwan', 'UAE',
    'France', 'Russia', 'Thailand', 'New Zealand', 'Other'
  ];

  const calculateEligibility = useMemo(() => {
    if (!showResults) return null;

    let score = 0;
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    // Passport check (15 points)
    if (formData.hasValidPassport === 'yes') {
      score += 15;
    } else {
      recommendations.push(language === 'en' 
        ? "Ensure passport validity of at least 18 months"
        : "Pastikan validitas paspor minimal 18 bulan");
    }

    // Visa type (25 points max)
    if (['kitas', 'kitap', 'investor', 'secondhome'].includes(formData.visaType)) {
      score += 25;
    } else if (formData.visaType === 'retirement') {
      score += 20;
    } else if (formData.visaType === 'tourist') {
      score += 10;
      recommendations.push(language === 'en'
        ? "Consider applying for Investor KITAS or Second Home Visa"
        : "Pertimbangkan mengajukan KITAS Investor atau Visa Second Home");
    } else {
      recommendations.push(language === 'en'
        ? "You will need to obtain appropriate visa/stay permit"
        : "Anda perlu mendapatkan visa/izin tinggal yang sesuai");
    }

    // Budget check (25 points max)
    const budget = parseInt(formData.investmentBudget) || 0;
    if (budget >= 500000) {
      score += 25;
    } else if (budget >= 300000) {
      score += 20;
    } else if (budget >= 100000) {
      score += 15;
      recommendations.push(language === 'en'
        ? "Consider apartment options which have lower minimum investment"
        : "Pertimbangkan opsi apartemen yang memiliki investasi minimum lebih rendah");
    } else {
      score += 5;
      recommendations.push(language === 'en'
        ? "Minimum investment thresholds may apply based on property type"
        : "Batas investasi minimum mungkin berlaku berdasarkan jenis properti");
    }

    // Property type (15 points max)
    if (formData.propertyType === 'apartment') {
      score += 15;
      nextSteps.push(language === 'en'
        ? "Apartments often have simpler ownership structures"
        : "Apartemen sering memiliki struktur kepemilikan yang lebih sederhana");
    } else if (formData.propertyType === 'house') {
      score += 12;
      nextSteps.push(language === 'en'
        ? "Houses require Hak Pakai or PT PMA structure"
        : "Rumah memerlukan struktur Hak Pakai atau PT PMA");
    } else if (formData.propertyType === 'land') {
      score += 5;
      recommendations.push(language === 'en'
        ? "Land-only purchases require PT PMA company structure"
        : "Pembelian tanah saja memerlukan struktur perusahaan PT PMA");
    } else {
      score += 10;
    }

    // Proof of funds (10 points)
    if (formData.hasProofOfFunds === 'yes') {
      score += 10;
    } else {
      recommendations.push(language === 'en'
        ? "Prepare bank statements or proof of funds documentation"
        : "Siapkan rekening koran atau dokumentasi bukti dana");
    }

    // Age check (10 points)
    const age = parseInt(formData.age) || 0;
    if (age >= 55 && formData.visaType === 'retirement') {
      score += 10;
      nextSteps.push(language === 'en'
        ? "You may qualify for retirement visa benefits"
        : "Anda mungkin memenuhi syarat untuk manfaat visa pensiun");
    } else if (age >= 21) {
      score += 10;
    } else if (age >= 18) {
      score += 5;
    }

    // Add standard next steps
    nextSteps.push(
      language === 'en' ? "Schedule free consultation with our team" : "Jadwalkan konsultasi gratis dengan tim kami",
      language === 'en' ? "Complete due diligence on preferred properties" : "Selesaikan due diligence pada properti pilihan",
      language === 'en' ? "Prepare required documentation" : "Siapkan dokumentasi yang diperlukan"
    );

    return { score, recommendations, nextSteps };
  }, [showResults, formData, language]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setShowResults(false);
  };

  const handleReset = () => {
    setFormData({
      nationality: '',
      visaType: '',
      investmentBudget: '',
      propertyType: '',
      hasValidPassport: '',
      purposeOfInvestment: '',
      hasProofOfFunds: '',
      age: ''
    });
    setShowResults(false);
  };

  const isFormComplete = Object.values(formData).every(v => v !== '');

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Calculator className="h-4 w-4 text-accent" />
          <h3 className="text-xs sm:text-sm font-bold text-foreground">{t.title}</h3>
        </div>
        <p className="text-[9px] sm:text-xs text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Form */}
        <div className="space-y-3">
          {/* Nationality */}
          <div className="space-y-1">
            <Label className="text-[9px] sm:text-xs flex items-center gap-1">
              <User className="h-3 w-3" />
              {t.fields.nationality}
            </Label>
            <Select value={formData.nationality} onValueChange={(v) => handleInputChange('nationality', v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t.fields.nationalityPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {nationalities.map(n => (
                  <SelectItem key={n} value={n} className="text-xs">{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visa Type */}
          <div className="space-y-1">
            <Label className="text-[9px] sm:text-xs flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {t.fields.visaType}
            </Label>
            <Select value={formData.visaType} onValueChange={(v) => handleInputChange('visaType', v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t.fields.visaTypePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {t.visaTypes.map(v => (
                  <SelectItem key={v.value} value={v.value} className="text-xs">{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div className="space-y-1">
            <Label className="text-[9px] sm:text-xs flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {t.fields.investmentBudget}
            </Label>
            <Input
              type="number"
              value={formData.investmentBudget}
              onChange={(e) => handleInputChange('investmentBudget', e.target.value)}
              placeholder={t.fields.budgetPlaceholder}
              className="h-8 text-xs"
            />
          </div>

          {/* Property Type */}
          <div className="space-y-1">
            <Label className="text-[9px] sm:text-xs flex items-center gap-1">
              <Home className="h-3 w-3" />
              {t.fields.propertyType}
            </Label>
            <Select value={formData.propertyType} onValueChange={(v) => handleInputChange('propertyType', v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t.fields.propertyTypePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {t.propertyTypes.map(p => (
                  <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purpose */}
          <div className="space-y-1">
            <Label className="text-[9px] sm:text-xs flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {t.fields.purposeOfInvestment}
            </Label>
            <Select value={formData.purposeOfInvestment} onValueChange={(v) => handleInputChange('purposeOfInvestment', v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t.fields.purposePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {t.purposes.map(p => (
                  <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age */}
          <div className="space-y-1">
            <Label className="text-[9px] sm:text-xs">{t.fields.age}</Label>
            <Input
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="e.g. 35"
              className="h-8 text-xs"
            />
          </div>

          {/* Valid Passport */}
          <div className="space-y-1">
            <Label className="text-[9px] sm:text-xs">{t.fields.hasValidPassport}</Label>
            <RadioGroup
              value={formData.hasValidPassport}
              onValueChange={(v) => handleInputChange('hasValidPassport', v)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="yes" id="passport-yes" />
                <Label htmlFor="passport-yes" className="text-[9px] cursor-pointer">{t.yesNo.yes}</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="no" id="passport-no" />
                <Label htmlFor="passport-no" className="text-[9px] cursor-pointer">{t.yesNo.no}</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Proof of Funds */}
          <div className="space-y-1">
            <Label className="text-[9px] sm:text-xs">{t.fields.hasProofOfFunds}</Label>
            <RadioGroup
              value={formData.hasProofOfFunds}
              onValueChange={(v) => handleInputChange('hasProofOfFunds', v)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="yes" id="funds-yes" />
                <Label htmlFor="funds-yes" className="text-[9px] cursor-pointer">{t.yesNo.yes}</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="no" id="funds-no" />
                <Label htmlFor="funds-no" className="text-[9px] cursor-pointer">{t.yesNo.no}</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setShowResults(true)}
              disabled={!isFormComplete}
              className="flex-1 h-8 text-xs gap-1.5"
            >
              <Sparkles className="h-3 w-3" />
              {t.calculate}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              {t.reset}
            </Button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {showResults && calculateEligibility && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                "p-3 rounded-lg",
                "bg-white/80 dark:bg-white/5",
                "border border-accent/30"
              )}
            >
              <h4 className="text-xs font-semibold text-foreground mb-3">{t.results.title}</h4>

              {/* Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] text-muted-foreground">{t.results.score}</span>
                  <Badge className={cn(
                    "text-[8px]",
                    calculateEligibility.score >= 80 && "bg-green-500",
                    calculateEligibility.score >= 50 && calculateEligibility.score < 80 && "bg-amber-500",
                    calculateEligibility.score < 50 && "bg-red-500"
                  )}>
                    {calculateEligibility.score}/100
                  </Badge>
                </div>
                <Progress value={calculateEligibility.score} className="h-2" />
                <p className={cn(
                  "text-xs font-medium mt-2 text-center",
                  calculateEligibility.score >= 80 && "text-green-600",
                  calculateEligibility.score >= 50 && calculateEligibility.score < 80 && "text-amber-600",
                  calculateEligibility.score < 50 && "text-red-600"
                )}>
                  {calculateEligibility.score >= 80 && t.results.eligible}
                  {calculateEligibility.score >= 50 && calculateEligibility.score < 80 && t.results.partiallyEligible}
                  {calculateEligibility.score < 50 && t.results.notEligible}
                </p>
              </div>

              {/* Recommendations */}
              {calculateEligibility.recommendations.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-[9px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    {t.results.recommendations}
                  </h5>
                  <div className="space-y-1">
                    {calculateEligibility.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-1.5 p-1.5 rounded bg-amber-50 dark:bg-amber-950/20">
                        <XCircle className="h-2.5 w-2.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[8px] text-amber-700 dark:text-amber-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div>
                <h5 className="text-[9px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <FileCheck className="h-3 w-3 text-green-500" />
                  {t.results.nextSteps}
                </h5>
                <div className="space-y-1">
                  {calculateEligibility.nextSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-1.5 p-1.5 rounded bg-green-50 dark:bg-green-950/20">
                      <CheckCircle className="h-2.5 w-2.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[8px] text-green-700 dark:text-green-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WNAEligibilityChecker;
