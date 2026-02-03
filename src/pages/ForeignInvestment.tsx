import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, FileText, Shield, DollarSign, Home, Key, AlertCircle, CheckCircle2, XCircle, Globe, Briefcase, Headphones, MessageSquare, BookOpen, ListChecks, ArrowLeft, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ForeignInvestmentContactDialog } from "@/components/ForeignInvestmentContactDialog";
import { EligibilityChecker } from "@/components/EligibilityChecker";
import { ForeignInvestmentSteps } from "@/components/ForeignInvestmentSteps";
import { ForeignInvestmentFAQ } from "@/components/ForeignInvestmentFAQ";
import { ForeignInvestmentChat } from "@/components/ForeignInvestmentChat";
import { UserInvestmentDashboard } from "@/components/foreign-investment/UserInvestmentDashboard";

const ForeignInvestment = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const text = {
    en: {
      title: "Foreign Investment Guide",
      subtitle: "Your complete guide to investing in Indonesian property",
      badge: "Your Journey Starts Here",
      signIn: "Sign In to Get Started",
      noticeTitle: "We're Here to Help!",
      noticeDesc: "This guide provides general information to get you started. For personalized advice, we recommend consulting with our qualified legal advisors who specialize in foreign property investment.",
      overview: "Overview",
      steps: "Steps",
      eligibility: "Eligibility",
      askAi: "Ask AI",
      faq: "FAQ",
      ownership: "Ownership",
      documents: "Documents",
      rules: "Rules",
      contact: "Contact",
      investOpp: "Investment Opportunities",
      investOppDesc: "Discover what you can invest in and the exciting opportunities waiting for you",
      canInvest: "You CAN Invest In",
      restrictions: "Investment Restrictions",
      startingPoints: "Investment Starting Points",
      houses: "Houses",
      apartments: "Apartments",
      touristAreas: "Tourist Areas",
      minInvestment: "Minimum investment required",
      mostPopular: "Most Popular",
      regionalRules: "Regional Rules",
      needHelp: "Need Specialized Assistance?",
      needHelpDesc: "Our foreign investment specialists are ready to assist you with fluent English and in-depth knowledge of regulations",
      englishConsult: "English Consultation",
      englishConsultDesc: "Fluent English communication for foreign investors",
      regExperts: "Regulation Experts",
      regExpertsDesc: "In-depth knowledge of Indonesian laws and regulations",
      fullSupport: "Full Support",
      fullSupportDesc: "Support from start to finish of your investment process",
      contactSpecialist: "Contact Our Specialists",
      serviceAvailable: "Foreign investment service available 24/7"
    },
    id: {
      title: "Panduan Investasi Asing",
      subtitle: "Panduan lengkap untuk berinvestasi di properti Indonesia",
      badge: "Perjalanan Anda Dimulai di Sini",
      signIn: "Masuk untuk Memulai",
      noticeTitle: "Kami Siap Membantu!",
      noticeDesc: "Panduan ini memberikan informasi umum untuk memulai. Untuk saran yang dipersonalisasi, kami merekomendasikan konsultasi dengan penasihat hukum kami yang khusus menangani investasi properti asing.",
      overview: "Ringkasan",
      steps: "Langkah",
      eligibility: "Kelayakan",
      askAi: "Tanya AI",
      faq: "FAQ",
      ownership: "Kepemilikan",
      documents: "Dokumen",
      rules: "Aturan",
      contact: "Kontak",
      investOpp: "Peluang Investasi",
      investOppDesc: "Temukan apa yang dapat Anda investasikan dan peluang menarik yang menanti",
      canInvest: "Anda DAPAT Berinvestasi Di",
      restrictions: "Pembatasan Investasi",
      startingPoints: "Titik Awal Investasi",
      houses: "Rumah",
      apartments: "Apartemen",
      touristAreas: "Area Wisata",
      minInvestment: "Investasi minimum yang diperlukan",
      mostPopular: "Paling Populer",
      regionalRules: "Aturan Regional",
      needHelp: "Butuh Bantuan Khusus?",
      needHelpDesc: "Tim spesialis investasi asing kami siap membantu Anda dengan bahasa Inggris yang lancar dan pemahaman mendalam tentang regulasi",
      englishConsult: "Konsultasi Bahasa Inggris",
      englishConsultDesc: "Komunikasi lancar dalam bahasa Inggris untuk investor asing",
      regExperts: "Ahli Regulasi",
      regExpertsDesc: "Pemahaman mendalam tentang hukum dan regulasi Indonesia",
      fullSupport: "Dukungan Penuh",
      fullSupportDesc: "Pendampingan dari awal hingga selesai proses investasi",
      contactSpecialist: "Hubungi Spesialis Kami",
      serviceAvailable: "Layanan khusus investasi asing tersedia 24/7"
    }
  };

  const t = text[language];
  
  // If user is logged in, show the dashboard
  if (user) {
    return <UserInvestmentDashboard />;
  }
  
  // If not logged in, show the public information page
  return (
    <div className="min-h-screen bg-background">
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
              <span className="hidden sm:inline">{t.title}</span>
              <span className="sm:hidden">Investment</span>
            </h1>
          </div>
          <Button 
            onClick={() => navigate('/auth')}
            size="sm"
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {t.signIn}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 md:py-8 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <Badge className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-primary/10 text-primary border-primary/20">
            <Globe className="h-3.5 w-3.5 inline mr-1.5" />
            {t.badge}
          </Badge>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Notice Alert */}
        <Alert className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-sm sm:text-base font-semibold text-foreground">{t.noticeTitle}</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
            {t.noticeDesc}
          </AlertDescription>
        </Alert>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full space-y-6">
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1 bg-muted/50 p-1.5 rounded-xl border border-border h-auto">
            <TabsTrigger value="overview" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Globe className="h-4 w-4" />
              <span>{t.overview}</span>
            </TabsTrigger>
            <TabsTrigger value="steps" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ListChecks className="h-4 w-4" />
              <span>{t.steps}</span>
            </TabsTrigger>
            <TabsTrigger value="eligibility" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>{t.eligibility}</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{t.askAi}</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{t.faq}</span>
            </TabsTrigger>
            <TabsTrigger value="ownership" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden lg:flex">
              <Key className="h-4 w-4" />
              <span>{t.ownership}</span>
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden lg:flex">
              <FileText className="h-4 w-4" />
              <span>{t.documents}</span>
            </TabsTrigger>
            <TabsTrigger value="restrictions" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden lg:flex">
              <Shield className="h-4 w-4" />
              <span>{t.rules}</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex-col sm:flex-row gap-1 py-2 px-2 rounded-lg text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden lg:flex">
              <Headphones className="h-4 w-4" />
              <span>{t.contact}</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl text-foreground">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  {t.investOpp}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">{t.investOppDesc}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Can Invest */}
                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-5 w-5" />
                        ✅ {t.canInvest}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 text-xs sm:text-sm">
                          <Home className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Apartments & Condos</strong> - Strata Title (SHMRS)</span>
                        </li>
                        <li className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 text-xs sm:text-sm">
                          <Key className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Houses</strong> - Hak Pakai (30 years, renewable)</span>
                        </li>
                        <li className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 text-xs sm:text-sm">
                          <Building2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Villas</strong> - Tourist destinations like Bali</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Restrictions */}
                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-destructive">
                        <XCircle className="h-5 w-5" />
                        ❌ {t.restrictions}
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

                {/* Investment Starting Points */}
                <div className="pt-4">
                  <h3 className="font-semibold text-base sm:text-lg mb-4 flex items-center gap-2 text-foreground">
                    <DollarSign className="h-5 w-5 text-primary" />
                    {t.startingPoints}
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Card className="border-border bg-card hover:shadow-md transition-shadow">
                      <CardHeader className="p-4">
                        <Home className="h-7 w-7 text-primary mb-2" />
                        <CardTitle className="text-sm">{t.houses}</CardTitle>
                        <CardDescription className="text-xs">Hak Pakai Title</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-2">
                        <p className="text-xl sm:text-2xl font-bold text-primary">IDR 5B</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{t.minInvestment}</p>
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">30 Years Renewable</Badge>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-card hover:shadow-md transition-shadow">
                      <CardHeader className="p-4">
                        <Building2 className="h-7 w-7 text-primary mb-2" />
                        <CardTitle className="text-sm">{t.apartments}</CardTitle>
                        <CardDescription className="text-xs">Strata Title (SHMRS)</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-2">
                        <p className="text-xl sm:text-2xl font-bold text-primary">IDR 3B</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{t.minInvestment}</p>
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">{t.mostPopular}</Badge>
                      </CardContent>
                    </Card>
                    <Card className="border-border bg-card hover:shadow-md transition-shadow">
                      <CardHeader className="p-4">
                        <Globe className="h-7 w-7 text-primary mb-2" />
                        <CardTitle className="text-sm">{t.touristAreas}</CardTitle>
                        <CardDescription className="text-xs">Special Zones</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-2">
                        <p className="text-xl sm:text-2xl font-bold text-primary">Varies</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Check local regulations</p>
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">{t.regionalRules}</Badge>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links to WNI/WNA */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card 
                className="border-border bg-card cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
                onClick={() => navigate('/investor/wni')}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      WNI Investment
                    </h3>
                    <p className="text-xs text-muted-foreground">Indonesian Citizen Property Guide</p>
                  </div>
                  <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
              <Card 
                className="border-border bg-card cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
                onClick={() => navigate('/investor/wna')}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      WNA Investment
                    </h3>
                    <p className="text-xs text-muted-foreground">Foreign National Property Guide</p>
                  </div>
                  <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Process Steps Tab */}
          <TabsContent value="steps" className="space-y-6">
            <ForeignInvestmentSteps />
          </TabsContent>

          {/* Eligibility Checker Tab */}
          <TabsContent value="eligibility" className="space-y-6">
            <EligibilityChecker />
          </TabsContent>

          {/* AI Chat Assistant Tab */}
          <TabsContent value="chat" className="space-y-6">
            <ForeignInvestmentChat />
          </TabsContent>

          {/* FAQ & Knowledge Base Tab */}
          <TabsContent value="faq" className="space-y-6">
            <ForeignInvestmentFAQ />
          </TabsContent>

          {/* Ownership Types Tab */}
          <TabsContent value="ownership" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Hak Pakai */}
              <Card className="border-border bg-card">
                <CardHeader className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">Hak Pakai 🏡</CardTitle>
                      <CardDescription className="text-xs">Perfect for foreign individuals</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-xs sm:text-sm">
                    <p className="font-semibold mb-1">⏱️ Duration:</p>
                    <p className="text-muted-foreground">30 years → 20 years → 30 years (up to 80 years total!)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-xs sm:text-sm">
                    <p className="font-semibold mb-2">📋 Requirements:</p>
                    <ul className="space-y-1.5 text-muted-foreground">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Valid passport</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> KITAS/KITAP permit</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> NPWP tax ID</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Meet minimum value</li>
                    </ul>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-xs">⭐ Most Popular Choice</Badge>
                </CardContent>
              </Card>

              {/* Strata Title */}
              <Card className="border-border bg-card">
                <CardHeader className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">SHMRS/Strata 🏢</CardTitle>
                      <CardDescription className="text-xs">For apartments & condos</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-xs sm:text-sm">
                    <p className="font-semibold mb-1">⏱️ Duration:</p>
                    <p className="text-muted-foreground">Perpetual ownership (as long as building stands)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-xs sm:text-sm">
                    <p className="font-semibold mb-2">📋 Requirements:</p>
                    <ul className="space-y-1.5 text-muted-foreground">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Valid passport</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> KITAS/KITAP</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> NPWP</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Min. IDR 3 billion</li>
                    </ul>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-xs">🏙️ Urban Living</Badge>
                </CardContent>
              </Card>

              {/* PT PMA */}
              <Card className="border-border bg-card">
                <CardHeader className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">PT PMA 🏢</CardTitle>
                      <CardDescription className="text-xs">Company ownership</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-xs sm:text-sm">
                    <p className="font-semibold mb-1">⏱️ Duration:</p>
                    <p className="text-muted-foreground">Hak Guna Bangunan - 30 years renewable</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-xs sm:text-sm">
                    <p className="font-semibold mb-2">📋 Requirements:</p>
                    <ul className="space-y-1.5 text-muted-foreground">
                      <li className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-primary" /> PT PMA company</li>
                      <li className="flex items-center gap-2"><DollarSign className="h-3.5 w-3.5 text-primary" /> Capital requirements</li>
                      <li className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-primary" /> Business license</li>
                      <li className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-primary" /> Commercial use</li>
                    </ul>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-xs">💼 Business Investors</Badge>
                </CardContent>
              </Card>

              {/* Nominee Warning */}
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <Shield className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg text-destructive">Nominee ⚠️</CardTitle>
                      <CardDescription className="text-xs">Not recommended!</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-sm font-bold">⛔ High Risk Warning</AlertTitle>
                    <AlertDescription className="text-xs">
                      Legally questionable with serious risks. Our experts strongly advise against this approach.
                    </AlertDescription>
                  </Alert>
                  <div className="p-3 rounded-lg bg-destructive/10 text-xs sm:text-sm">
                    <p className="font-semibold mb-2 text-destructive">⚠️ Major Risks:</p>
                    <ul className="space-y-1.5">
                      <li className="flex items-center gap-2"><XCircle className="h-3.5 w-3.5 text-destructive" /> No legal protection</li>
                      <li className="flex items-center gap-2"><XCircle className="h-3.5 w-3.5 text-destructive" /> Property seizure risk</li>
                      <li className="flex items-center gap-2"><XCircle className="h-3.5 w-3.5 text-destructive" /> Nominee disputes</li>
                      <li className="flex items-center gap-2"><XCircle className="h-3.5 w-3.5 text-destructive" /> Illegal complications</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Documents Checklist 📋</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">Everything you need to prepare for a smooth investment process</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Personal Documents */}
                  <Card className="border-border bg-muted/30">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        👤 Personal Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ul className="space-y-2">
                        {["Valid Passport 🛂", "KITAS or KITAP 🏠", "NPWP 📊", "Proof of Address 📍", "Marriage Certificate 💑"].map((doc, i) => (
                          <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-background/50 text-xs sm:text-sm">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Financial Documents */}
                  <Card className="border-border bg-muted/30">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        💰 Financial Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ul className="space-y-2">
                        {["Proof of Funds 💵", "Source of Funds 📝", "Employment Letter 💼", "Tax Returns 📑"].map((doc, i) => (
                          <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-background/50 text-xs sm:text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restrictions Tab */}
          <TabsContent value="restrictions" className="space-y-6">
            <Alert className="border-primary/20 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary text-sm">Professional Assistance Recommended</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
                Due to the complexity of Indonesian property law and potential language barriers, it is strongly recommended to engage licensed professionals.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <Card className="border-border bg-card p-6 text-center">
              <Headphones className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">{t.needHelp}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.needHelpDesc}</p>
              <Button 
                onClick={() => setContactDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Headphones className="h-4 w-4 mr-2" />
                {t.contactSpecialist}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Specialist Section */}
        <Card className="border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                {t.needHelp}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t.needHelpDesc}
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <Globe className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-sm mb-1">{t.englishConsult}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{t.englishConsultDesc}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-sm mb-1">{t.regExperts}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{t.regExpertsDesc}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-card border border-border">
                <Briefcase className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-sm mb-1">{t.fullSupport}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{t.fullSupportDesc}</p>
              </div>
            </div>

            <div className="text-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setContactDialogOpen(true)}
              >
                <Headphones className="h-5 w-5 mr-2" />
                {t.contactSpecialist}
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                {t.serviceAvailable}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ForeignInvestmentContactDialog 
        open={contactDialogOpen} 
        onOpenChange={setContactDialogOpen} 
      />
    </div>
  );
};

export default ForeignInvestment;
