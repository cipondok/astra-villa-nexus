import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2, FileText, Shield, DollarSign, Home, Key, AlertCircle, CheckCircle2, XCircle, Globe, Briefcase,
  Headphones, MessageSquare, BookOpen, ListChecks, ArrowLeft, Users, Sparkles, ArrowRight, Bot, TrendingUp,
  MapPin, Gift, UserCheck, Clock, HelpCircle, Award, Phone, CheckCircle, CreditCard, FileCheck, Scale, UserCircle
} from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRoles";
import { useNavigate, Link } from "react-router-dom";
import { ForeignInvestmentContactDialog } from "@/components/ForeignInvestmentContactDialog";
import { EligibilityChecker } from "@/components/EligibilityChecker";
import { ForeignInvestmentSteps } from "@/components/ForeignInvestmentSteps";
import { ForeignInvestmentFAQ } from "@/components/ForeignInvestmentFAQ";
import { ForeignInvestmentChat } from "@/components/ForeignInvestmentChat";
import { UserInvestmentDashboard } from "@/components/foreign-investment/UserInvestmentDashboard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import PillToggleGroup from "@/components/ui/PillToggleGroup";
import InvestorAuthSection from "@/components/auth/InvestorAuthSection";

// WNA components
import WelcomingCountriesList from "@/components/wna/WelcomingCountriesList";
import WNAInvestmentFacilities from "@/components/wna/WNAInvestmentFacilities";
import WNAProcessProcedure from "@/components/wna/WNAProcessProcedure";
import WNARulesRegulations from "@/components/wna/WNARulesRegulations";
import WNAEligibilityChecker from "@/components/wna/WNAEligibilityChecker";
import WNAProcessingTime from "@/components/wna/WNAProcessingTime";
import WNAFaqHelp from "@/components/wna/WNAFaqHelp";
import WNAPropertyTypes from "@/components/wna/WNAPropertyTypes";
import WNACitizenshipInfo from "@/components/wna/WNACitizenshipInfo";
import WNAFamilyBenefits from "@/components/wna/WNAFamilyBenefits";

// WNI components
import EligibleCountriesSelector from "@/components/wni/EligibleCountriesSelector";
import KPRRequirementsChecklist from "@/components/wni/KPRRequirementsChecklist";
import KPREligibilityChecker from "@/components/wni/KPREligibilityChecker";
import SLIKCreditChecker from "@/components/wni/SLIKCreditChecker";
import KPRPaymentMethods from "@/components/wni/KPRPaymentMethods";

import wnaHeroImage from "@/assets/wna-investment-hero.jpg";

type ActiveSection = 'all' | 'wna' | 'wni' | 'dashboard';

const Investment = () => {
  const { language, t: translate } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedWnaCountry, setSelectedWnaCountry] = useState<string | null>(null);
  const [selectedWniCountry, setSelectedWniCountry] = useState<string | null>(null);

  const initialSection = (searchParams.get('section') as ActiveSection) || 'all';
  const [activeSection, setActiveSection] = useState<ActiveSection>(initialSection);

  // Sync section to URL
  useEffect(() => {
    if (activeSection === 'all') {
      searchParams.delete('section');
    } else {
      searchParams.set('section', activeSection);
    }
    setSearchParams(searchParams, { replace: true });
  }, [activeSection]);

  const openChat = () => {
    const event = new CustomEvent('openAIChat');
    window.dispatchEvent(event);
  };

  const sectionOptions = [
    { value: 'all', label: language === 'en' ? '🏛️ All Investment' : '🏛️ Semua Investasi' },
    { value: 'wna', label: '🌍 WNA (Foreign)' },
    { value: 'wni', label: '🇮🇩 WNI (Overseas)' },
    ...(user ? [{ value: 'dashboard', label: language === 'en' ? '📊 My Dashboard' : '📊 Dashboard Saya' }] : []),
  ];

  const t = {
    en: {
      title: "Investment Guide",
      subtitle: "Your complete guide to investing in Indonesian property — WNA, WNI, and everything in between",
      badge: "Your Journey Starts Here",
      signIn: "Sign In to Get Started",
      noticeTitle: "We're Here to Help!",
      noticeDesc: "This guide provides general information. For personalized advice, consult with our qualified legal advisors.",
      // All Investment tabs
      overview: "Overview", steps: "Steps", eligibility: "Eligibility", askAi: "Ask AI", faq: "FAQ",
      ownership: "Ownership", documents: "Documents", rules: "Rules", contact: "Contact",
      investOpp: "Investment Opportunities",
      investOppDesc: "Discover what you can invest in and the exciting opportunities waiting for you",
      canInvest: "You CAN Invest In", restrictions: "Investment Restrictions",
      startingPoints: "Investment Starting Points",
      houses: "Houses", apartments: "Apartments", touristAreas: "Tourist Areas",
      minInvestment: "Minimum investment required", mostPopular: "Most Popular", regionalRules: "Regional Rules",
      needHelp: "Need Specialized Assistance?",
      needHelpDesc: "Our foreign investment specialists are ready to assist you",
      englishConsult: "English Consultation", englishConsultDesc: "Fluent English communication for foreign investors",
      regExperts: "Regulation Experts", regExpertsDesc: "In-depth knowledge of Indonesian laws",
      fullSupport: "Full Support", fullSupportDesc: "Support from start to finish",
      contactSpecialist: "Contact Our Specialists",
      serviceAvailable: "Foreign investment service available 24/7",
      // WNA
      wnaBadge: "Foreign Investment Program",
      wnaTitle: "Invest Legally in Premium Indonesian Property",
      wnaSubtitle: "Indonesia is one of the fastest-growing property markets in Southeast Asia.",
      wnaSystemTitle: "Complete Investment System for WNA",
      wnaSystemSubtitle: "Countries, facilities, procedures, regulations, and eligibility",
      wnaBenefits: [
        { icon: Scale, title: "Legal Investment", desc: "Invest legally with proper structures" },
        { icon: Building2, title: "Smart-City Access", desc: "Access top development projects" },
        { icon: Shield, title: "Expert Legal Guidance", desc: "Hak Pakai, PT PMA guidance" },
        { icon: TrendingUp, title: "Residency Pathways", desc: "Long-term stay options" },
        { icon: Briefcase, title: "Business & Investment", desc: "Open businesses with family support" },
        { icon: Users, title: "Fully Managed", desc: "Trusted managed process" }
      ],
      wnaDisclaimer: "All investments handled strictly under Indonesian law.",
      wnaTabs: { countries: "Countries", propertyTypes: "Property Types", facilities: "Facilities", process: "Process", regulations: "Regulations", citizenship: "Citizenship", family: "Family Benefits", eligibility: "Eligibility", timeline: "Timeline", faq: "FAQ & Help" },
      // WNI
      wniBadge: "WNI Overseas Program",
      wniTitle: "A Smart Homecoming Investment Plan",
      wniSubtitle: "Designed for Indonesians abroad who want to invest and secure their future.",
      wniSystemTitle: "KPR System for WNI Overseas",
      wniSystemSubtitle: "Mortgage eligibility, requirements, and payment system",
      wniBenefits: [
        { icon: Home, title: "Buy While Abroad", desc: "Purchase while working overseas" },
        { icon: Award, title: "Exclusive Discounts", desc: "Special WNI overseas pricing" },
        { icon: CreditCard, title: "KPR Facility", desc: "Access KPR from overseas" },
        { icon: Shield, title: "Legal Guarantee", desc: "Legal ownership guaranteed" },
        { icon: Clock, title: "Ready On Return", desc: "Home ready when you return" },
        { icon: FileCheck, title: "100% Transparent", desc: "Secure managed process" }
      ],
      wniTagline: "ASTRA Villa ensures your return home is smooth and worry-free.",
      wniTabs: { countries: "Eligible Countries", eligibility: "Check Eligibility", requirements: "Requirements", credit: "Credit Check (SLIK)", payment: "Payment Methods" },
      // VIP
      vipTitle: "VIP End-to-End Experience",
      vipFeatures: ["Dedicated expert consultants", "Legal & compliance guarantee", "Fast-track processing", "VIP airport pickup & relocation", "Banking, tax, business support", "Seamless move-in experience"],
      ctaTitle: "Start Your Investment Journey",
      ctaSubtitle: "Connect with our investment team today",
      ctaButton: "Contact Investment Team",
      ctaChat: "Chat With AI Assistant"
    },
    id: {
      title: "Panduan Investasi Asing",
      subtitle: "Panduan lengkap investasi properti Indonesia — WNA, WNI, dan semua yang perlu Anda ketahui",
      badge: "Perjalanan Anda Dimulai di Sini",
      signIn: "Masuk untuk Memulai",
      noticeTitle: "Kami Siap Membantu!",
      noticeDesc: "Panduan ini memberikan informasi umum. Untuk saran personal, konsultasikan dengan penasihat hukum kami.",
      overview: "Ringkasan", steps: "Langkah", eligibility: "Kelayakan", askAi: "Tanya AI", faq: "FAQ",
      ownership: "Kepemilikan", documents: "Dokumen", rules: "Aturan", contact: "Kontak",
      investOpp: "Peluang Investasi",
      investOppDesc: "Temukan apa yang dapat Anda investasikan",
      canInvest: "Anda DAPAT Berinvestasi Di", restrictions: "Pembatasan Investasi",
      startingPoints: "Titik Awal Investasi",
      houses: "Rumah", apartments: "Apartemen", touristAreas: "Area Wisata",
      minInvestment: "Investasi minimum", mostPopular: "Paling Populer", regionalRules: "Aturan Regional",
      needHelp: "Butuh Bantuan Khusus?",
      needHelpDesc: "Spesialis investasi asing kami siap membantu Anda",
      englishConsult: "Konsultasi Bahasa Inggris", englishConsultDesc: "Komunikasi lancar dalam bahasa Inggris",
      regExperts: "Ahli Regulasi", regExpertsDesc: "Pemahaman mendalam tentang hukum Indonesia",
      fullSupport: "Dukungan Penuh", fullSupportDesc: "Pendampingan dari awal hingga selesai",
      contactSpecialist: "Hubungi Spesialis Kami",
      serviceAvailable: "Layanan investasi asing tersedia 24/7",
      wnaBadge: "Program Investasi Asing",
      wnaTitle: "Investasi Legal di Properti Premium Indonesia",
      wnaSubtitle: "Indonesia adalah salah satu pasar properti tercepat di Asia Tenggara.",
      wnaSystemTitle: "Sistem Investasi Lengkap untuk WNA",
      wnaSystemSubtitle: "Negara, fasilitas, prosedur, regulasi, dan kelayakan",
      wnaBenefits: [
        { icon: Scale, title: "Investasi Legal", desc: "Investasi legal dengan struktur tepat" },
        { icon: Building2, title: "Akses Kota Pintar", desc: "Akses proyek pengembangan terbaik" },
        { icon: Shield, title: "Bimbingan Legal", desc: "Bimbingan Hak Pakai, PT PMA" },
        { icon: TrendingUp, title: "Jalur Residensi", desc: "Opsi tinggal jangka panjang" },
        { icon: Briefcase, title: "Bisnis & Investasi", desc: "Buka bisnis dengan dukungan keluarga" },
        { icon: Users, title: "Dikelola Penuh", desc: "Proses investasi terpercaya" }
      ],
      wnaDisclaimer: "Semua investasi di bawah hukum Indonesia.",
      wnaTabs: { countries: "Negara", propertyTypes: "Jenis Properti", facilities: "Fasilitas", process: "Proses", regulations: "Regulasi", citizenship: "Kewarganegaraan", family: "Manfaat Keluarga", eligibility: "Kelayakan", timeline: "Timeline", faq: "FAQ & Bantuan" },
      wniBadge: "Program WNI Luar Negeri",
      wniTitle: "Rencana Investasi Pulang Kampung yang Cerdas",
      wniSubtitle: "Dirancang untuk WNI di luar negeri yang ingin investasi di Indonesia.",
      wniSystemTitle: "Sistem KPR untuk WNI di Luar Negeri",
      wniSystemSubtitle: "Kelayakan KPR, persyaratan, dan sistem pembayaran",
      wniBenefits: [
        { icon: Home, title: "Beli Saat di Luar Negeri", desc: "Beli rumah saat bekerja di luar" },
        { icon: Award, title: "Diskon Eksklusif", desc: "Harga prioritas WNI" },
        { icon: CreditCard, title: "Fasilitas KPR", desc: "Akses KPR dari luar negeri" },
        { icon: Shield, title: "Jaminan Legal", desc: "Kepemilikan legal dijamin" },
        { icon: Clock, title: "Siap Saat Pulang", desc: "Rumah siap saat kembali" },
        { icon: FileCheck, title: "100% Transparan", desc: "Proses aman dan profesional" }
      ],
      wniTagline: "ASTRA Villa memastikan kepulangan Anda lancar dan tanpa khawatir.",
      wniTabs: { countries: "Negara Eligible", eligibility: "Cek Kelayakan", requirements: "Persyaratan", credit: "Cek Kredit (SLIK)", payment: "Metode Pembayaran" },
      vipTitle: "Pengalaman VIP End-to-End",
      vipFeatures: ["Konsultan ahli khusus", "Jaminan legal & kepatuhan", "Proses cepat", "Penjemputan VIP bandara", "Dukungan perbankan & pajak", "Pengalaman pindah mulus"],
      ctaTitle: "Mulai Perjalanan Investasi Anda",
      ctaSubtitle: "Hubungi tim investasi kami hari ini",
      ctaButton: "Hubungi Tim Investasi",
      ctaChat: "Chat dengan Asisten AI"
    }
  };

  const copy = t[language] || t.en;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={translate('seo.investment.title')}
        description={translate('seo.investment.description')}
        keywords="investasi properti asing indonesia, WNA beli properti, WNI overseas, foreign property investment indonesia"
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
              <Globe className="h-5 w-5 text-primary" />
              <span className="hidden sm:inline">{copy.title}</span>
              <span className="sm:hidden">Investment</span>
            </h1>
          </div>
          {!user && (
            <Button
              onClick={() => navigate('/auth')}
              size="sm"
              className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {copy.signIn}
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 md:py-8 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-4">
          <Badge className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-primary/10 text-primary border-primary/20">
            <Globe className="h-3.5 w-3.5 inline mr-1.5" />
            {copy.badge}
          </Badge>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            {copy.subtitle}
          </p>
        </div>

        {/* Section Selector */}
        <div className="flex justify-center">
          <PillToggleGroup
            options={sectionOptions}
            value={activeSection}
            onChange={(val) => setActiveSection(val as ActiveSection)}
            className="justify-center"
          />
        </div>

        {/* Notice */}
        <Alert className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-sm sm:text-base font-semibold text-foreground">{copy.noticeTitle}</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm text-muted-foreground">{copy.noticeDesc}</AlertDescription>
        </Alert>

        {/* ===================== ALL INVESTMENT SECTION ===================== */}
        {activeSection === 'all' && (
          <AllInvestmentSection copy={copy} navigate={navigate} contactDialogOpen={contactDialogOpen} setContactDialogOpen={setContactDialogOpen} />
        )}

        {/* ===================== WNA SECTION ===================== */}
        {activeSection === 'wna' && (
          <WNASection copy={copy} selectedCountry={selectedWnaCountry} setSelectedCountry={setSelectedWnaCountry} navigate={navigate} openChat={openChat} isAuthenticated={isAuthenticated} />
        )}

        {/* ===================== WNI SECTION ===================== */}
        {activeSection === 'wni' && (
          <WNISection copy={copy} selectedCountry={selectedWniCountry} setSelectedCountry={setSelectedWniCountry} navigate={navigate} openChat={openChat} isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
        )}

        {/* ===================== DASHBOARD SECTION ===================== */}
        {activeSection === 'dashboard' && user && (
          <UserInvestmentDashboard />
        )}
      </div>

      <ForeignInvestmentContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
    </div>
  );
};

/* ============================== ALL INVESTMENT SUB-COMPONENT ============================== */
const AllInvestmentSection = ({ copy, navigate, contactDialogOpen, setContactDialogOpen }: any) => (
  <>
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <TabsList className="w-full grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1 bg-muted/50 p-1.5 rounded-xl border border-border h-auto">
        <TabsTrigger value="overview" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Globe className="h-4 w-4" /><span>{copy.overview}</span>
        </TabsTrigger>
        <TabsTrigger value="steps" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <ListChecks className="h-4 w-4" /><span>{copy.steps}</span>
        </TabsTrigger>
        <TabsTrigger value="eligibility" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <CheckCircle2 className="h-4 w-4" /><span>{copy.eligibility}</span>
        </TabsTrigger>
        <TabsTrigger value="chat" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <MessageSquare className="h-4 w-4" /><span>{copy.askAi}</span>
        </TabsTrigger>
        <TabsTrigger value="faq" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <BookOpen className="h-4 w-4" /><span>{copy.faq}</span>
        </TabsTrigger>
        <TabsTrigger value="ownership" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden lg:flex">
          <Key className="h-4 w-4" /><span>{copy.ownership}</span>
        </TabsTrigger>
        <TabsTrigger value="requirements" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden lg:flex">
          <FileText className="h-4 w-4" /><span>{copy.documents}</span>
        </TabsTrigger>
        <TabsTrigger value="restrictions" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden lg:flex">
          <Shield className="h-4 w-4" /><span>{copy.rules}</span>
        </TabsTrigger>
        <TabsTrigger value="contact" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden lg:flex">
          <Headphones className="h-4 w-4" /><span>{copy.contact}</span>
        </TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsContent value="overview" className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl text-foreground">
              <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
              {copy.investOpp}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">{copy.investOppDesc}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-chart-1/30 bg-chart-1/5">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-chart-1">
                    <CheckCircle2 className="h-5 w-5" /> ✅ {copy.canInvest}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 text-xs sm:text-sm">
                      <Home className="h-4 w-4 text-chart-1 mt-0.5 flex-shrink-0" />
                      <span><strong>Apartments & Condos</strong> - Strata Title (SHMRS)</span>
                    </li>
                    <li className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 text-xs sm:text-sm">
                      <Key className="h-4 w-4 text-chart-1 mt-0.5 flex-shrink-0" />
                      <span><strong>Houses</strong> - Hak Pakai (30 years, renewable)</span>
                    </li>
                    <li className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 text-xs sm:text-sm">
                      <Building2 className="h-4 w-4 text-chart-1 mt-0.5 flex-shrink-0" />
                      <span><strong>Villas</strong> - Tourist destinations like Bali</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" /> ❌ {copy.restrictions}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 text-xs sm:text-sm">
                      <Shield className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Freehold Land</strong> - Hak Milik not available directly</span>
                    </li>
                    <li className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 text-xs sm:text-sm">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Agricultural Land</strong> - Reserved for locals</span>
                    </li>
                    <li className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 text-xs sm:text-sm">
                      <FileText className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Government Property</strong> - Not for sale</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="pt-4">
              <h3 className="font-semibold text-base sm:text-lg mb-4 flex items-center gap-2 text-foreground">
                <DollarSign className="h-5 w-5 text-primary" /> {copy.startingPoints}
              </h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <Card className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="p-4"><Home className="h-7 w-7 text-primary mb-2" /><CardTitle className="text-sm">{copy.houses}</CardTitle><CardDescription className="text-xs">Hak Pakai Title</CardDescription></CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <p className="text-xl sm:text-2xl font-bold text-primary">IDR 5B</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{copy.minInvestment}</p>
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">30 Years Renewable</Badge>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="p-4"><Building2 className="h-7 w-7 text-primary mb-2" /><CardTitle className="text-sm">{copy.apartments}</CardTitle><CardDescription className="text-xs">Strata Title (SHMRS)</CardDescription></CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <p className="text-xl sm:text-2xl font-bold text-primary">IDR 3B</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{copy.minInvestment}</p>
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">{copy.mostPopular}</Badge>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="p-4"><Globe className="h-7 w-7 text-primary mb-2" /><CardTitle className="text-sm">{copy.touristAreas}</CardTitle><CardDescription className="text-xs">Special Zones</CardDescription></CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <p className="text-xl sm:text-2xl font-bold text-primary">Varies</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Check local regulations</p>
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">{copy.regionalRules}</Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="steps" className="space-y-6"><ForeignInvestmentSteps /></TabsContent>
      <TabsContent value="eligibility" className="space-y-6"><EligibilityChecker /></TabsContent>
      <TabsContent value="chat" className="space-y-6"><ForeignInvestmentChat /></TabsContent>
      <TabsContent value="faq" className="space-y-6"><ForeignInvestmentFAQ /></TabsContent>

      {/* Ownership */}
      <TabsContent value="ownership" className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border bg-card">
            <CardHeader className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Key className="h-5 w-5 text-primary" /></div>
                <div><CardTitle className="text-base sm:text-lg">Hak Pakai 🏡</CardTitle><CardDescription className="text-xs">Perfect for foreign individuals</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 text-xs sm:text-sm"><p className="font-semibold mb-1">⏱️ Duration:</p><p className="text-muted-foreground">30 years → 20 years → 30 years (up to 80 years!)</p></div>
              <Badge className="bg-primary text-primary-foreground text-xs">⭐ Most Popular Choice</Badge>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
                <div><CardTitle className="text-base sm:text-lg">SHMRS/Strata 🏢</CardTitle><CardDescription className="text-xs">For apartments & condos</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 text-xs sm:text-sm"><p className="font-semibold mb-1">⏱️ Duration:</p><p className="text-muted-foreground">Perpetual ownership</p></div>
              <Badge className="bg-primary text-primary-foreground text-xs">🏙️ Urban Living</Badge>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Briefcase className="h-5 w-5 text-primary" /></div>
                <div><CardTitle className="text-base sm:text-lg">PT PMA 🏢</CardTitle><CardDescription className="text-xs">Company ownership</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 text-xs sm:text-sm"><p className="font-semibold mb-1">⏱️ Duration:</p><p className="text-muted-foreground">Hak Guna Bangunan - 30 years renewable</p></div>
              <Badge className="bg-primary text-primary-foreground text-xs">💼 Business Investors</Badge>
            </CardContent>
          </Card>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10"><Shield className="h-5 w-5 text-destructive" /></div>
                <div><CardTitle className="text-base sm:text-lg text-destructive">Nominee ⚠️</CardTitle><CardDescription className="text-xs">Not recommended!</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-sm font-bold">⛔ High Risk Warning</AlertTitle>
                <AlertDescription className="text-xs">Legally questionable with serious risks.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Requirements */}
      <TabsContent value="requirements" className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
              <CardTitle className="text-lg sm:text-xl">Documents Checklist 📋</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border bg-muted/30">
                <CardHeader className="p-4"><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> 👤 Personal Documents</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0">
                  <ul className="space-y-2">
                    {["Valid Passport 🛂", "KITAS or KITAP 🏠", "NPWP 📊", "Proof of Address 📍", "Marriage Certificate 💑"].map((doc, i) => (
                      <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-background/50 text-xs sm:text-sm">
                        <CheckCircle2 className="h-4 w-4 text-chart-1 mt-0.5 flex-shrink-0" /><span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-border bg-muted/30">
                <CardHeader className="p-4"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> 💰 Financial Documents</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0">
                  <ul className="space-y-2">
                    {["Proof of Funds 💵", "Source of Funds 📝", "Employment Letter 💼", "Tax Returns 📑"].map((doc, i) => (
                      <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-background/50 text-xs sm:text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="restrictions" className="space-y-6">
        <Alert className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary text-sm">Professional Assistance Recommended</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
            Due to complexity of Indonesian property law, it is strongly recommended to engage licensed professionals.
          </AlertDescription>
        </Alert>
      </TabsContent>

      <TabsContent value="contact" className="space-y-6">
        <Card className="border-border bg-card p-6 text-center">
          <Headphones className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">{copy.needHelp}</h3>
          <p className="text-sm text-muted-foreground mb-4">{copy.needHelpDesc}</p>
          <Button onClick={() => setContactDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Headphones className="h-4 w-4 mr-2" /> {copy.contactSpecialist}
          </Button>
        </Card>
      </TabsContent>
    </Tabs>

    {/* Contact Specialist Footer */}
    <Card className="border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <CardContent className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">{copy.needHelp}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">{copy.needHelpDesc}</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-xl bg-card border border-border">
            <Globe className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold text-sm mb-1">{copy.englishConsult}</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{copy.englishConsultDesc}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border border-border">
            <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold text-sm mb-1">{copy.regExperts}</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{copy.regExpertsDesc}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border border-border">
            <Briefcase className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold text-sm mb-1">{copy.fullSupport}</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{copy.fullSupportDesc}</p>
          </div>
        </div>
        <div className="text-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setContactDialogOpen(true)}>
            <Headphones className="h-5 w-5 mr-2" /> {copy.contactSpecialist}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">{copy.serviceAvailable}</p>
        </div>
      </CardContent>
    </Card>
  </>
);

/* ============================== WNA SUB-COMPONENT ============================== */
const WNASection = ({ copy, selectedCountry, setSelectedCountry, navigate, openChat, isAuthenticated }: any) => (
  <div className="space-y-6">
    {/* Hero */}
    <section className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0">
        <img src={wnaHeroImage} alt="Luxury Investment Property" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-3 bg-background/20 border border-border/30 rounded-full backdrop-blur-xl">
            <span className="text-base">🌍</span>
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{copy.wnaBadge}</span>
          </div>
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-foreground mb-2 px-4">{copy.wnaTitle}</h2>
          <p className="text-sm sm:text-base text-foreground/80 max-w-2xl mx-auto">{copy.wnaSubtitle}</p>
        </motion.div>
      </div>
    </section>

    {/* Auth */}
    <div className="max-w-3xl mx-auto">
      <InvestorAuthSection investorType="wna" />
    </div>

    {/* Benefits */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {copy.wnaBenefits.map((benefit: any, idx: number) => {
        const iconColors = [
          { bg: 'bg-chart-4/10', text: 'text-chart-4' }, { bg: 'bg-chart-3/10', text: 'text-chart-3' },
          { bg: 'bg-chart-1/10', text: 'text-chart-1' }, { bg: 'bg-chart-5/10', text: 'text-chart-5' },
          { bg: 'bg-accent/10', text: 'text-accent' }, { bg: 'bg-destructive/10', text: 'text-destructive' },
        ];
        const colorSet = iconColors[idx % iconColors.length];
        return (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.03 }}
            className="relative overflow-hidden rounded-lg p-3 sm:p-4 bg-card/70 border-2 border-border/50 hover:border-accent/40 transition-all group flex flex-col items-center text-center">
            <div className={cn("flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl mb-2 shadow-sm", colorSet.bg)}>
              <benefit.icon className={cn("w-6 h-6 sm:w-7 sm:h-7", colorSet.text)} strokeWidth={1.5} />
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-1 leading-tight">{benefit.title}</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug">{benefit.desc}</p>
          </motion.div>
        );
      })}
    </div>

    <div className="p-4 rounded-lg bg-accent/5 border-2 border-accent/30">
      <div className="flex items-start gap-3"><Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" /><p className="text-sm text-foreground">{copy.wnaDisclaimer}</p></div>
    </div>

    {/* Investment System Tabs */}
    <div className={cn("rounded-xl p-4 sm:p-6 bg-card/50 border-2 border-border/50 backdrop-blur-sm")}>
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-sm sm:text-lg font-bold text-foreground mb-1">{copy.wnaSystemTitle}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">{copy.wnaSystemSubtitle}</p>
      </div>

      <Tabs defaultValue="countries" className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
          <TabsList className="inline-flex w-max h-auto gap-1 bg-muted/60 backdrop-blur-xl p-1 mb-4 rounded-lg whitespace-nowrap border-2 border-border/30">
            <TabsTrigger value="countries" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md font-medium flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{copy.wnaTabs.countries}</TabsTrigger>
            <TabsTrigger value="propertyTypes" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md font-medium flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{copy.wnaTabs.propertyTypes}</TabsTrigger>
            <TabsTrigger value="facilities" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md font-medium flex items-center gap-1.5"><Gift className="h-3.5 w-3.5" />{copy.wnaTabs.facilities}</TabsTrigger>
            <TabsTrigger value="process" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md font-medium flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" />{copy.wnaTabs.process}</TabsTrigger>
            <TabsTrigger value="regulations" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md font-medium flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{copy.wnaTabs.regulations}</TabsTrigger>
            <TabsTrigger value="citizenship" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md font-medium flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />{copy.wnaTabs.citizenship}</TabsTrigger>
            <TabsTrigger value="family" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md font-medium flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{copy.wnaTabs.family}</TabsTrigger>
            <TabsTrigger value="eligibility" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md font-medium flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5" />{copy.wnaTabs.eligibility}</TabsTrigger>
            <TabsTrigger value="timeline" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md font-medium flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{copy.wnaTabs.timeline}</TabsTrigger>
            <TabsTrigger value="faq" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md font-medium flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5" />{copy.wnaTabs.faq}</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="countries" className="mt-0"><WelcomingCountriesList selectedCountry={selectedCountry} onSelect={setSelectedCountry} /></TabsContent>
        <TabsContent value="propertyTypes" className="mt-0"><WNAPropertyTypes /></TabsContent>
        <TabsContent value="facilities" className="mt-0"><WNAInvestmentFacilities /></TabsContent>
        <TabsContent value="process" className="mt-0"><WNAProcessProcedure /></TabsContent>
        <TabsContent value="regulations" className="mt-0"><WNARulesRegulations /></TabsContent>
        <TabsContent value="citizenship" className="mt-0"><WNACitizenshipInfo /></TabsContent>
        <TabsContent value="family" className="mt-0"><WNAFamilyBenefits /></TabsContent>
        <TabsContent value="eligibility" className="mt-0"><WNAEligibilityChecker /></TabsContent>
        <TabsContent value="timeline" className="mt-0"><WNAProcessingTime /></TabsContent>
        <TabsContent value="faq" className="mt-0"><WNAFaqHelp /></TabsContent>
      </Tabs>
    </div>

    {/* VIP + CTA */}
    <VIPSection copy={copy} />
    <CTASection copy={copy} navigate={navigate} openChat={openChat} isAuthenticated={isAuthenticated} />
  </div>
);

/* ============================== WNI SUB-COMPONENT ============================== */
const WNISection = ({ copy, selectedCountry, setSelectedCountry, navigate, openChat, isAuthenticated, isAdmin }: any) => (
  <div className="space-y-6">
    {/* Hero */}
    <section className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-3 py-4 sm:py-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2.5 bg-gradient-to-r from-destructive/10 to-primary/10 border border-destructive/20 rounded-full backdrop-blur-xl">
            <span className="text-sm">🇮🇩</span>
            <span className="text-[9px] font-semibold text-destructive uppercase tracking-wide">{copy.wniBadge}</span>
          </div>
          <h2 className="text-sm sm:text-lg md:text-xl font-bold text-foreground mb-1.5 px-2">{copy.wniTitle}</h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground max-w-lg mx-auto">{copy.wniSubtitle}</p>
        </motion.div>
      </div>
    </section>

    {/* Auth */}
    <div className="max-w-3xl mx-auto">
      <InvestorAuthSection investorType="wni" />
    </div>

    {/* Benefits */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {copy.wniBenefits.map((benefit: any, idx: number) => {
        const iconColors = [
          { bg: 'bg-primary/10', text: 'text-primary' }, { bg: 'bg-chart-3/10', text: 'text-chart-3' },
          { bg: 'bg-chart-1/10', text: 'text-chart-1' }, { bg: 'bg-chart-5/10', text: 'text-chart-5' },
          { bg: 'bg-chart-4/10', text: 'text-chart-4' }, { bg: 'bg-destructive/10', text: 'text-destructive' },
        ];
        const colorSet = iconColors[idx % iconColors.length];
        return (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.03 }}
            className="relative overflow-hidden rounded-lg p-2 sm:p-2.5 bg-card/70 border border-border/30 hover:border-primary/40 transition-all group flex flex-col items-center text-center">
            <div className={cn("flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-lg mb-1.5 shadow-sm", colorSet.bg)}>
              <benefit.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", colorSet.text)} strokeWidth={1.5} />
            </div>
            <h3 className="text-[8px] sm:text-[10px] font-semibold text-foreground mb-0.5 leading-tight">{benefit.title}</h3>
            <p className="text-[7px] sm:text-[8px] text-muted-foreground leading-snug hidden sm:block">{benefit.desc}</p>
          </motion.div>
        );
      })}
    </div>
    <p className="text-center text-[9px] sm:text-xs font-medium text-primary">✨ {copy.wniTagline}</p>

    {/* KPR System Tabs */}
    <div className={cn("rounded-lg p-2.5 sm:p-4 bg-card/80 border border-border/30 backdrop-blur-xl shadow-sm")}>
      <div className="text-center mb-2.5 sm:mb-3">
        <h2 className="text-xs sm:text-base font-bold text-foreground mb-0.5">{copy.wniSystemTitle}</h2>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground">{copy.wniSystemSubtitle}</p>
      </div>

      <Tabs defaultValue="countries" className="w-full">
        <div className="overflow-x-auto -mx-2.5 px-2.5 pb-1 scrollbar-hide">
          <TabsList className="inline-flex w-max h-auto gap-0.5 bg-muted/50 backdrop-blur-xl p-0.5 mb-2.5 rounded-md whitespace-nowrap border border-border/20">
            <TabsTrigger value="countries" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded flex items-center gap-1"><Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{copy.wniTabs.countries}</TabsTrigger>
            <TabsTrigger value="eligibility" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded flex items-center gap-1"><CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{copy.wniTabs.eligibility}</TabsTrigger>
            <TabsTrigger value="requirements" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded flex items-center gap-1"><FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{copy.wniTabs.requirements}</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="credit" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded flex items-center gap-1"><Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{copy.wniTabs.credit}</TabsTrigger>
            )}
            <TabsTrigger value="payment" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded flex items-center gap-1"><CreditCard className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{copy.wniTabs.payment}</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="countries" className="mt-0"><EligibleCountriesSelector selectedCountry={selectedCountry} onSelect={setSelectedCountry} /></TabsContent>
        <TabsContent value="eligibility" className="mt-0"><KPREligibilityChecker selectedCountry={selectedCountry} /></TabsContent>
        <TabsContent value="requirements" className="mt-0"><KPRRequirementsChecklist /></TabsContent>
        {isAdmin && <TabsContent value="credit" className="mt-0"><SLIKCreditChecker /></TabsContent>}
        <TabsContent value="payment" className="mt-0"><KPRPaymentMethods /></TabsContent>
      </Tabs>
    </div>

    {/* VIP + CTA */}
    <VIPSection copy={copy} />
    <CTASection copy={copy} navigate={navigate} openChat={openChat} isAuthenticated={isAuthenticated} />
  </div>
);

/* ============================== SHARED COMPONENTS ============================== */
const VIPSection = ({ copy }: { copy: any }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    className={cn("rounded-xl p-4 sm:p-6 bg-gradient-to-br from-accent/10 via-background/50 to-chart-4/10 backdrop-blur-xl border-2 border-accent/30 shadow-md")}>
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/20 border-2 border-accent/30">
        <Award className="h-5 w-5 text-accent" />
      </div>
      <h2 className="text-sm sm:text-base font-bold text-foreground">{copy.vipTitle}</h2>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {copy.vipFeatures.map((feature: string, idx: number) => (
        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/30">
          <CheckCircle className="h-4 w-4 text-chart-1 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-foreground">{feature}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

const CTASection = ({ copy, navigate, openChat, isAuthenticated }: any) => (
  <div className="max-w-3xl mx-auto text-center py-4">
    <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <h2 className="text-sm sm:text-lg font-bold text-foreground mb-2">{copy.ctaTitle}</h2>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4">{copy.ctaSubtitle}</p>
      <div className="flex flex-row items-center justify-center gap-3 flex-wrap">
        <Button size="lg" onClick={() => navigate('/contact')} className="gap-2 h-10 sm:h-12 text-sm px-6 bg-gradient-to-r from-accent to-chart-4 hover:from-accent/90 hover:to-chart-4/90 shadow-lg">
          <Phone className="h-4 w-4" /> {copy.ctaButton}
        </Button>
        <Button size="lg" variant="outline" onClick={openChat} className="gap-2 h-10 sm:h-12 text-sm px-6 border-2 border-accent/40 hover:bg-accent/10">
          <MessageSquare className="h-4 w-4" /> {copy.ctaChat}
        </Button>
      </div>
      {isAuthenticated && (
        <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard')} className="mt-4 gap-2 h-9 text-sm text-accent hover:text-accent/80">
          <UserCircle className="h-4 w-4" /> Go to Dashboard
        </Button>
      )}
    </motion.div>
  </div>
);

export default Investment;
