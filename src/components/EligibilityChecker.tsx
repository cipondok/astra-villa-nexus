import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EligibilityResult {
  overallScore: number;
  kprEligible: boolean;
  investmentEligible: boolean;
  recommendedOwnership: string[];
  requirements: string[];
  suggestions: string[];
}

export const EligibilityChecker = () => {
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  
  const [formData, setFormData] = useState({
    // Personal Info
    nationality: "",
    hasKitas: "",
    kitasYears: "",
    hasNpwp: "",
    
    // Financial Info
    monthlyIncome: "",
    employmentStatus: "",
    employmentYears: "",
    savings: "",
    
    // Investment Goals
    propertyType: "",
    investmentAmount: "",
    paymentMethod: "",
    
    // Documents
    hasPassport: true,
    hasTaxReturns: "",
    hasBankStatements: "",
    hasEmploymentLetter: "",
  });

  const calculateEligibility = (): EligibilityResult => {
    let score = 0;
    const requirements: string[] = [];
    const suggestions: string[] = [];
    const recommendedOwnership: string[] = [];

    // Check residence status (max 25 points)
    if (formData.hasKitas === "yes") {
      score += 15;
      if (parseInt(formData.kitasYears) >= 2) {
        score += 10;
      } else if (parseInt(formData.kitasYears) >= 1) {
        score += 5;
      } else {
        suggestions.push(language === "id" 
          ? "Memiliki KITAS minimal 1 tahun meningkatkan peluang approval"
          : "Having KITAS for at least 1 year improves approval chances");
      }
    } else {
      requirements.push(language === "id" 
        ? "KITAS/KITAP diperlukan untuk kepemilikan properti"
        : "KITAS/KITAP required for property ownership");
    }

    // Check NPWP (10 points)
    if (formData.hasNpwp === "yes") {
      score += 10;
    } else {
      requirements.push(language === "id" 
        ? "NPWP (Nomor Pokok Wajib Pajak) wajib dimiliki"
        : "NPWP (Tax ID) is mandatory");
    }

    // Check income (max 20 points)
    const income = parseFloat(formData.monthlyIncome);
    if (income >= 100000000) { // 100 million IDR
      score += 20;
    } else if (income >= 50000000) { // 50 million IDR
      score += 15;
    } else if (income >= 30000000) { // 30 million IDR
      score += 10;
    } else if (income > 0) {
      score += 5;
      suggestions.push(language === "id" 
        ? "Pendapatan minimal IDR 30 juta/bulan disarankan untuk KPR"
        : "Minimum income of IDR 30 million/month recommended for mortgage");
    }

    // Check employment stability (15 points)
    if (formData.employmentStatus === "permanent") {
      score += 10;
      if (parseInt(formData.employmentYears) >= 2) {
        score += 5;
      }
    } else if (formData.employmentStatus === "contract") {
      score += 5;
    }

    // Check savings/investment amount (max 20 points)
    const savings = parseFloat(formData.savings);
    const investmentAmount = parseFloat(formData.investmentAmount);
    
    if (investmentAmount >= 5000000000) { // 5 billion for house
      score += 15;
      recommendedOwnership.push("Hak Pakai (House)");
    } else if (investmentAmount >= 3000000000) { // 3 billion for apartment
      score += 15;
      recommendedOwnership.push("SHMRS (Apartment/Condo)");
    } else if (investmentAmount >= 1000000000) { // 1 billion
      score += 10;
      suggestions.push(language === "id"
        ? "Minimal investasi IDR 3 miliar untuk apartemen atau IDR 5 miliar untuk rumah"
        : "Minimum investment IDR 3 billion for apartments or IDR 5 billion for houses");
    }

    // Check down payment capability
    if (savings >= investmentAmount * 0.5) {
      score += 5;
    } else if (savings >= investmentAmount * 0.3) {
      score += 3;
    } else {
      suggestions.push(language === "id"
        ? "Down payment minimal 40-50% dari nilai properti untuk KPR foreigner"
        : "Minimum down payment of 40-50% of property value for foreigner mortgage");
    }

    // Check documentation (10 points)
    let docScore = 0;
    if (formData.hasTaxReturns === "yes") docScore += 3;
    if (formData.hasBankStatements === "yes") docScore += 4;
    if (formData.hasEmploymentLetter === "yes") docScore += 3;
    score += docScore;

    if (docScore < 7) {
      requirements.push(language === "id"
        ? "Kelengkapan dokumen keuangan diperlukan"
        : "Complete financial documentation required");
    }

    // Determine eligibility
    const kprEligible = score >= 70 && formData.hasKitas === "yes" && income >= 30000000;
    const investmentEligible = score >= 50 && formData.hasKitas === "yes";

    // Add ownership recommendations
    if (investmentAmount >= 5000000000 && formData.hasKitas === "yes") {
      recommendedOwnership.push("Hak Pakai (Right to Use)");
    }
    if (investmentAmount >= 3000000000) {
      recommendedOwnership.push("SHMRS (Strata Title)");
    }
    if (income >= 50000000) {
      recommendedOwnership.push("PT PMA (Company Structure)");
    }

    return {
      overallScore: Math.min(score, 100),
      kprEligible,
      investmentEligible,
      recommendedOwnership: recommendedOwnership.length > 0 ? recommendedOwnership : ["Please increase investment amount"],
      requirements,
      suggestions,
    };
  };

  const handleSubmit = () => {
    const eligibility = calculateEligibility();
    setResult(eligibility);
  };

  const resetChecker = () => {
    setStep(1);
    setResult(null);
    setFormData({
      nationality: "",
      hasKitas: "",
      kitasYears: "",
      hasNpwp: "",
      monthlyIncome: "",
      employmentStatus: "",
      employmentYears: "",
      savings: "",
      propertyType: "",
      investmentAmount: "",
      paymentMethod: "",
      hasPassport: true,
      hasTaxReturns: "",
      hasBankStatements: "",
      hasEmploymentLetter: "",
    });
  };

  if (result) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            {language === "id" ? "Hasil Pemeriksaan Kelayakan" : "Eligibility Check Results"}
          </CardTitle>
          <CardDescription>
            {language === "id" 
              ? "Berikut adalah evaluasi kelayakan Anda untuk investasi properti"
              : "Here is your property investment eligibility evaluation"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {language === "id" ? "Skor Kelayakan" : "Eligibility Score"}
              </span>
              <span className="text-2xl font-bold text-primary">{result.overallScore}/100</span>
            </div>
            <Progress value={result.overallScore} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {result.overallScore >= 80 && (language === "id" ? "Kelayakan Sangat Baik" : "Excellent Eligibility")}
              {result.overallScore >= 60 && result.overallScore < 80 && (language === "id" ? "Kelayakan Baik" : "Good Eligibility")}
              {result.overallScore >= 40 && result.overallScore < 60 && (language === "id" ? "Kelayakan Sedang" : "Moderate Eligibility")}
              {result.overallScore < 40 && (language === "id" ? "Kelayakan Rendah" : "Low Eligibility")}
            </p>
          </div>

          {/* KPR Eligibility */}
          <Alert className={result.kprEligible ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"}>
            {result.kprEligible ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
            <AlertTitle>
              {language === "id" ? "Kelayakan KPR (Mortgage)" : "Mortgage (KPR) Eligibility"}
            </AlertTitle>
            <AlertDescription>
              {result.kprEligible 
                ? (language === "id" 
                  ? "✓ Anda memenuhi syarat untuk mengajukan KPR dengan bank tertentu yang melayani foreigner" 
                  : "✓ You qualify for mortgage applications with certain banks that serve foreigners")
                : (language === "id"
                  ? "✗ Saat ini belum memenuhi syarat minimum untuk KPR foreigner"
                  : "✗ Currently do not meet minimum requirements for foreigner mortgage")}
            </AlertDescription>
          </Alert>

          {/* Investment Eligibility */}
          <Alert className={result.investmentEligible ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-orange-500 bg-orange-50 dark:bg-orange-950"}>
            {result.investmentEligible ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-orange-600" />}
            <AlertTitle>
              {language === "id" ? "Kelayakan Investasi Tunai" : "Cash Investment Eligibility"}
            </AlertTitle>
            <AlertDescription>
              {result.investmentEligible 
                ? (language === "id"
                  ? "✓ Anda memenuhi syarat untuk investasi properti dengan pembayaran tunai"
                  : "✓ You qualify for property investment with cash payment")
                : (language === "id"
                  ? "⚠ Perlu perbaikan dokumen atau status izin tinggal"
                  : "⚠ Need to improve documentation or residence permit status")}
            </AlertDescription>
          </Alert>

          {/* Recommended Ownership Types */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {language === "id" ? "Jenis Kepemilikan yang Disarankan" : "Recommended Ownership Types"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.recommendedOwnership.map((type, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Requirements */}
          {result.requirements.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-red-600 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                {language === "id" ? "Persyaratan yang Harus Dipenuhi" : "Required to Meet"}
              </h3>
              <ul className="space-y-2">
                {result.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-red-600 mt-1">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-orange-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {language === "id" ? "Saran untuk Meningkatkan Kelayakan" : "Suggestions to Improve Eligibility"}
              </h3>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={resetChecker} variant="outline" className="flex-1">
              {language === "id" ? "Cek Ulang" : "Check Again"}
            </Button>
            <Button className="flex-1">
              {language === "id" ? "Hubungi Konsultan" : "Contact Consultant"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {language === "id" ? "Pemeriksaan Kelayakan Investasi" : "Investment Eligibility Check"}
        </CardTitle>
        <CardDescription>
          {language === "id"
            ? "Isi informasi di bawah untuk memeriksa kelayakan Anda untuk KPR dan investasi properti"
            : "Fill in the information below to check your eligibility for mortgage and property investment"}
        </CardDescription>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded ${s <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {language === "id" ? "Informasi Pribadi" : "Personal Information"}
            </h3>
            
            <div className="space-y-2">
              <Label>{language === "id" ? "Kewarganegaraan" : "Nationality"}</Label>
              <Input
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder={language === "id" ? "Contoh: USA, UK, Australia" : "e.g., USA, UK, Australia"}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === "id" ? "Apakah Anda memiliki KITAS/KITAP?" : "Do you have KITAS/KITAP?"}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.hasKitas}
                onChange={(e) => setFormData({ ...formData, hasKitas: e.target.value })}
              >
                <option value="">{language === "id" ? "Pilih..." : "Select..."}</option>
                <option value="yes">{language === "id" ? "Ya" : "Yes"}</option>
                <option value="no">{language === "id" ? "Tidak" : "No"}</option>
              </select>
            </div>

            {formData.hasKitas === "yes" && (
              <div className="space-y-2">
                <Label>{language === "id" ? "Berapa lama Anda memiliki KITAS? (tahun)" : "How long have you had KITAS? (years)"}</Label>
                <Input
                  type="number"
                  value={formData.kitasYears}
                  onChange={(e) => setFormData({ ...formData, kitasYears: e.target.value })}
                  placeholder="0"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>{language === "id" ? "Apakah Anda memiliki NPWP?" : "Do you have NPWP (Tax ID)?"}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.hasNpwp}
                onChange={(e) => setFormData({ ...formData, hasNpwp: e.target.value })}
              >
                <option value="">{language === "id" ? "Pilih..." : "Select..."}</option>
                <option value="yes">{language === "id" ? "Ya" : "Yes"}</option>
                <option value="no">{language === "id" ? "Tidak" : "No"}</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Financial Information */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {language === "id" ? "Informasi Keuangan" : "Financial Information"}
            </h3>

            <div className="space-y-2">
              <Label>{language === "id" ? "Pendapatan Bulanan (IDR)" : "Monthly Income (IDR)"}</Label>
              <Input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                placeholder="50000000"
              />
              <p className="text-xs text-muted-foreground">
                {language === "id" ? "Minimal IDR 30 juta/bulan untuk KPR" : "Minimum IDR 30 million/month for mortgage"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{language === "id" ? "Status Pekerjaan" : "Employment Status"}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
              >
                <option value="">{language === "id" ? "Pilih..." : "Select..."}</option>
                <option value="permanent">{language === "id" ? "Karyawan Tetap" : "Permanent Employee"}</option>
                <option value="contract">{language === "id" ? "Karyawan Kontrak" : "Contract Employee"}</option>
                <option value="business">{language === "id" ? "Pemilik Bisnis" : "Business Owner"}</option>
                <option value="freelance">{language === "id" ? "Freelancer" : "Freelancer"}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>{language === "id" ? "Lama Bekerja (tahun)" : "Years of Employment"}</Label>
              <Input
                type="number"
                value={formData.employmentYears}
                onChange={(e) => setFormData({ ...formData, employmentYears: e.target.value })}
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label>{language === "id" ? "Total Tabungan/Dana Tersedia (IDR)" : "Total Savings/Available Funds (IDR)"}</Label>
              <Input
                type="number"
                value={formData.savings}
                onChange={(e) => setFormData({ ...formData, savings: e.target.value })}
                placeholder="2000000000"
              />
            </div>
          </div>
        )}

        {/* Step 3: Investment Goals */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {language === "id" ? "Tujuan Investasi" : "Investment Goals"}
            </h3>

            <div className="space-y-2">
              <Label>{language === "id" ? "Tipe Properti yang Diminati" : "Property Type of Interest"}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
              >
                <option value="">{language === "id" ? "Pilih..." : "Select..."}</option>
                <option value="apartment">{language === "id" ? "Apartemen/Kondominium" : "Apartment/Condominium"}</option>
                <option value="house">{language === "id" ? "Rumah" : "House"}</option>
                <option value="villa">{language === "id" ? "Villa" : "Villa"}</option>
                <option value="land">{language === "id" ? "Tanah" : "Land"}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>{language === "id" ? "Nilai Investasi yang Direncanakan (IDR)" : "Planned Investment Amount (IDR)"}</Label>
              <Input
                type="number"
                value={formData.investmentAmount}
                onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                placeholder="3000000000"
              />
              <p className="text-xs text-muted-foreground">
                {language === "id" 
                  ? "Minimal IDR 3 miliar untuk apartemen, IDR 5 miliar untuk rumah"
                  : "Minimum IDR 3 billion for apartments, IDR 5 billion for houses"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{language === "id" ? "Metode Pembayaran yang Diinginkan" : "Preferred Payment Method"}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="">{language === "id" ? "Pilih..." : "Select..."}</option>
                <option value="cash">{language === "id" ? "Tunai Penuh" : "Full Cash"}</option>
                <option value="mortgage">{language === "id" ? "KPR (Mortgage)" : "Mortgage (KPR)"}</option>
                <option value="installment">{language === "id" ? "Cicilan Developer" : "Developer Installment"}</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Documents */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {language === "id" ? "Kelengkapan Dokumen" : "Document Availability"}
            </h3>

            <div className="space-y-2">
              <Label>{language === "id" ? "Apakah Anda memiliki Laporan Pajak 2 tahun terakhir?" : "Do you have Tax Returns for the last 2 years?"}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.hasTaxReturns}
                onChange={(e) => setFormData({ ...formData, hasTaxReturns: e.target.value })}
              >
                <option value="">{language === "id" ? "Pilih..." : "Select..."}</option>
                <option value="yes">{language === "id" ? "Ya" : "Yes"}</option>
                <option value="no">{language === "id" ? "Tidak" : "No"}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>{language === "id" ? "Apakah Anda memiliki Rekening Koran 6 bulan?" : "Do you have Bank Statements for 6 months?"}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.hasBankStatements}
                onChange={(e) => setFormData({ ...formData, hasBankStatements: e.target.value })}
              >
                <option value="">{language === "id" ? "Pilih..." : "Select..."}</option>
                <option value="yes">{language === "id" ? "Ya" : "Yes"}</option>
                <option value="no">{language === "id" ? "Tidak" : "No"}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>{language === "id" ? "Apakah Anda memiliki Surat Keterangan Kerja?" : "Do you have Employment Letter?"}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.hasEmploymentLetter}
                onChange={(e) => setFormData({ ...formData, hasEmploymentLetter: e.target.value })}
              >
                <option value="">{language === "id" ? "Pilih..." : "Select..."}</option>
                <option value="yes">{language === "id" ? "Ya" : "Yes"}</option>
                <option value="no">{language === "id" ? "Tidak" : "No"}</option>
              </select>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              {language === "id" ? "Kembali" : "Back"}
            </Button>
          )}
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} className="flex-1">
              {language === "id" ? "Lanjut" : "Next"}
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-1">
              {language === "id" ? "Lihat Hasil" : "View Results"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
