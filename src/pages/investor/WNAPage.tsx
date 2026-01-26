import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Globe, 
  Shield, 
  CheckCircle, 
  Building2, 
  Scale, 
  Briefcase, 
  Users, 
  Award,
  Phone,
  MessageSquare,
  TrendingUp,
  UserCircle,
  HelpCircle,
  MapPin,
  Gift,
  ListChecks,
  BookOpen,
  UserCheck,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import InvestorAuthSection from '@/components/auth/InvestorAuthSection';
import wnaHeroImage from '@/assets/wna-investment-hero.jpg';

// WNA Investment System Components
import WelcomingCountriesList from '@/components/wna/WelcomingCountriesList';
import WNAInvestmentFacilities from '@/components/wna/WNAInvestmentFacilities';
import WNAProcessProcedure from '@/components/wna/WNAProcessProcedure';
import WNARulesRegulations from '@/components/wna/WNARulesRegulations';
import WNAEligibilityChecker from '@/components/wna/WNAEligibilityChecker';
import WNAProcessingTime from '@/components/wna/WNAProcessingTime';
import WNAFaqHelp from '@/components/wna/WNAFaqHelp';
import WNAPropertyTypes from '@/components/wna/WNAPropertyTypes';
import WNACitizenshipInfo from '@/components/wna/WNACitizenshipInfo';

const WNAPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const copy = {
    en: {
      back: "Back",
      badge: "Foreign Investment Program",
      title: "Invest Legally in Premium Indonesian Property",
      subtitle: "Indonesia is one of the fastest-growing smart city and property markets in Southeast Asia. ASTRA Villa opens the door for international investors.",
      
      benefits: [
        { icon: Scale, title: "Legal Investment", desc: "Invest legally in premium houses and apartments with proper structures" },
        { icon: Building2, title: "Smart-City Access", desc: "Access top smart-city development projects across Indonesia" },
        { icon: Shield, title: "Expert Legal Guidance", desc: "Receive expert legal guidance for ownership structures (Hak Pakai, PT PMA)" },
        { icon: TrendingUp, title: "Residency Pathways", desc: "Explore long-term stay pathways and residency options" },
        { icon: Briefcase, title: "Business & Investment", desc: "Open businesses and invest with family support systems" },
        { icon: Users, title: "Fully Managed", desc: "Enjoy a trusted, fully managed investment process" }
      ],

      disclaimer: "All investments are handled strictly under Indonesian law, supported by our expert legal and development team.",
      
      investmentSystemTitle: "Complete Investment System for WNA",
      investmentSystemSubtitle: "Countries, facilities, procedures, regulations, and eligibility",
      
      tabs: {
        countries: "Countries",
        propertyTypes: "Property Types",
        facilities: "Facilities",
        process: "Process",
        regulations: "Regulations",
        citizenship: "Citizenship",
        eligibility: "Eligibility",
        timeline: "Timeline",
        faq: "FAQ & Help"
      },

      vipTitle: "VIP End-to-End Experience",
      vipFeatures: [
        "Dedicated expert consultants",
        "Legal & compliance guarantee",
        "Fast-track processing",
        "VIP airport pickup & relocation assistance",
        "Banking, tax, business, and residency support",
        "Seamless move-in experience"
      ],

      ctaTitle: "Start Your Indonesian Investment Journey",
      ctaSubtitle: "Connect with our international investment team today",
      ctaButton: "Contact Investment Team",
      ctaChat: "Chat With AI Assistant"
    },
    id: {
      back: "Kembali",
      badge: "Program Investasi Asing",
      title: "Investasi Legal di Properti Premium Indonesia",
      subtitle: "Indonesia adalah salah satu pasar properti dan kota pintar dengan pertumbuhan tercepat di Asia Tenggara. ASTRA Villa membuka pintu untuk investor internasional.",
      
      benefits: [
        { icon: Scale, title: "Investasi Legal", desc: "Investasi legal di rumah dan apartemen premium dengan struktur yang tepat" },
        { icon: Building2, title: "Akses Kota Pintar", desc: "Akses proyek pengembangan kota pintar terbaik di seluruh Indonesia" },
        { icon: Shield, title: "Bimbingan Legal Ahli", desc: "Terima bimbingan legal ahli untuk struktur kepemilikan (Hak Pakai, PT PMA)" },
        { icon: TrendingUp, title: "Jalur Residensi", desc: "Jelajahi jalur tinggal jangka panjang dan opsi residensi" },
        { icon: Briefcase, title: "Bisnis & Investasi", desc: "Buka bisnis dan investasi dengan dukungan sistem keluarga" },
        { icon: Users, title: "Dikelola Penuh", desc: "Nikmati proses investasi terpercaya dan dikelola sepenuhnya" }
      ],

      disclaimer: "Semua investasi ditangani secara ketat di bawah hukum Indonesia, didukung oleh tim legal dan pengembangan ahli kami.",
      
      investmentSystemTitle: "Sistem Investasi Lengkap untuk WNA",
      investmentSystemSubtitle: "Negara, fasilitas, prosedur, regulasi, dan kelayakan",
      
      tabs: {
        countries: "Negara",
        propertyTypes: "Jenis Properti",
        facilities: "Fasilitas",
        process: "Proses",
        regulations: "Regulasi",
        citizenship: "Kewarganegaraan",
        eligibility: "Kelayakan",
        timeline: "Timeline",
        faq: "FAQ & Bantuan"
      },

      vipTitle: "Pengalaman VIP End-to-End",
      vipFeatures: [
        "Konsultan ahli khusus",
        "Jaminan legal & kepatuhan",
        "Proses cepat",
        "Penjemputan VIP bandara & bantuan relokasi",
        "Dukungan perbankan, pajak, bisnis, dan residensi",
        "Pengalaman pindah yang mulus"
      ],

      ctaTitle: "Mulai Perjalanan Investasi Indonesia Anda",
      ctaSubtitle: "Hubungi tim investasi internasional kami hari ini",
      ctaButton: "Hubungi Tim Investasi",
      ctaChat: "Chat dengan Asisten AI"
    }
  };

  const t = copy[language];

  const openChat = () => {
    const event = new CustomEvent('openAIChat');
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Sticky Back Header */}
      <div className="sticky top-10 md:top-11 lg:top-12 z-40 bg-background/80 backdrop-blur-2xl border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1.5 text-xs h-8 px-3 hover:bg-accent/10 active:scale-95">
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Button>
        </div>
      </div>

      {/* Hero Section with Image */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={wnaHeroImage} 
            alt="Luxury Investment Property" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-3 bg-white/20 dark:bg-black/30 border border-white/30 rounded-full backdrop-blur-xl">
              <span className="text-base">🌍</span>
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{t.badge}</span>
            </div>
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-foreground mb-2 px-4 drop-shadow-sm">{t.title}</h1>
            <p className="text-sm sm:text-base text-foreground/80 max-w-2xl mx-auto leading-relaxed px-4">{t.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Auth Section - Prominent Position */}
      <section className="px-4 py-4 sm:py-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
            <InvestorAuthSection investorType="wna" />
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="px-4 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {t.benefits.map((benefit, idx) => {
              const iconColors = [
                { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400' },
                { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400' },
                { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400' },
                { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400' },
                { bg: 'bg-cyan-100 dark:bg-cyan-900/50', text: 'text-cyan-600 dark:text-cyan-400' },
                { bg: 'bg-rose-100 dark:bg-rose-900/50', text: 'text-rose-600 dark:text-rose-400' },
              ];
              const colorSet = iconColors[idx % iconColors.length];
              
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: idx * 0.03, duration: 0.3 }}
                  className={cn(
                    "relative overflow-hidden rounded-lg p-3 sm:p-4",
                    "bg-white/70 dark:bg-white/5",
                    "border-2 border-border/50 dark:border-white/10",
                    "hover:border-accent/40 active:scale-95",
                    "transition-all duration-200 group flex flex-col items-center text-center"
                  )}
                >
                  <div className={cn("flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl mb-2 shadow-sm", colorSet.bg)}>
                    <benefit.icon className={cn("w-6 h-6 sm:w-7 sm:h-7", colorSet.text)} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-1 leading-tight line-clamp-2 group-hover:text-accent transition-colors">{benefit.title}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug line-clamp-2">{benefit.desc}</p>
                </motion.div>
              );
            })}
          </div>
          
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-4 p-4 rounded-lg bg-accent/5 border-2 border-accent/30">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{t.disclaimer}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Investment System Section */}
      <section className="px-4 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className={cn(
            "rounded-xl p-4 sm:p-6",
            "bg-white/50 dark:bg-white/5",
            "border-2 border-border/50 dark:border-accent/20",
            "backdrop-blur-sm"
          )}>
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-sm sm:text-lg font-bold text-foreground mb-1">{t.investmentSystemTitle}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{t.investmentSystemSubtitle}</p>
            </div>

            <Tabs defaultValue="countries" className="w-full">
              <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
              <TabsList className="inline-flex w-max h-auto gap-1 bg-muted/60 backdrop-blur-xl p-1 mb-4 rounded-lg whitespace-nowrap border-2 border-border/30">
                  <TabsTrigger value="countries" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md active:scale-95 font-medium flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {t.tabs.countries}
                  </TabsTrigger>
                  <TabsTrigger value="propertyTypes" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md active:scale-95 font-medium flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {t.tabs.propertyTypes}
                  </TabsTrigger>
                  <TabsTrigger value="facilities" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md active:scale-95 font-medium flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5" />
                    {t.tabs.facilities}
                  </TabsTrigger>
                  <TabsTrigger value="process" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md active:scale-95 font-medium flex items-center gap-1.5">
                    <ListChecks className="h-3.5 w-3.5" />
                    {t.tabs.process}
                  </TabsTrigger>
                  <TabsTrigger value="regulations" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md active:scale-95 font-medium flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {t.tabs.regulations}
                  </TabsTrigger>
                  <TabsTrigger value="citizenship" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md active:scale-95 font-medium flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    {t.tabs.citizenship}
                  </TabsTrigger>
                  <TabsTrigger value="eligibility" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md active:scale-95 font-medium flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5" />
                    {t.tabs.eligibility}
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md active:scale-95 font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {t.tabs.timeline}
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="min-w-fit text-xs sm:text-sm py-2 px-3 sm:px-4 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md active:scale-95 font-medium flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5" />
                    {t.tabs.faq}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="countries" className="mt-0">
                <WelcomingCountriesList selectedCountry={selectedCountry} onSelect={setSelectedCountry} />
              </TabsContent>
              <TabsContent value="propertyTypes" className="mt-0">
                <WNAPropertyTypes />
              </TabsContent>
              <TabsContent value="facilities" className="mt-0">
                <WNAInvestmentFacilities />
              </TabsContent>
              <TabsContent value="process" className="mt-0">
                <WNAProcessProcedure />
              </TabsContent>
              <TabsContent value="regulations" className="mt-0">
                <WNARulesRegulations />
              </TabsContent>
              <TabsContent value="citizenship" className="mt-0">
                <WNACitizenshipInfo />
              </TabsContent>
              <TabsContent value="eligibility" className="mt-0">
                <WNAEligibilityChecker />
              </TabsContent>
              <TabsContent value="timeline" className="mt-0">
                <WNAProcessingTime />
              </TabsContent>
              <TabsContent value="faq" className="mt-0">
                <WNAFaqHelp />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* VIP Section */}
      <section className="px-4 py-4 sm:py-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className={cn(
              "rounded-xl p-4 sm:p-6",
              "bg-gradient-to-br from-accent/10 via-white/50 to-blue-500/10 dark:from-accent/10 dark:via-white/5 dark:to-blue-500/10",
              "backdrop-blur-xl",
              "border-2 border-accent/30 shadow-md"
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl", "bg-gradient-to-br from-accent/20 via-blue-500/10 to-accent/20", "border-2 border-accent/30")}>
                <Award className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">{t.vipTitle}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {t.vipFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-white/5 border border-border/30">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-sm sm:text-lg font-bold text-foreground mb-2">{t.ctaTitle}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">{t.ctaSubtitle}</p>
            <div className="flex flex-row items-center justify-center gap-3">
              <Button size="lg" onClick={() => navigate('/contact')} className="gap-2 h-10 sm:h-12 text-sm sm:text-base px-6 bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-600 shadow-lg active:scale-95">
                <Phone className="h-4 w-4" />
                {t.ctaButton}
              </Button>
              <Button size="lg" variant="outline" onClick={openChat} className="gap-2 h-10 sm:h-12 text-sm sm:text-base px-6 border-2 border-accent/40 hover:bg-accent/10 active:scale-95">
                <MessageSquare className="h-4 w-4" />
                {t.ctaChat}
              </Button>
            </div>
            {isAuthenticated && (
              <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard')} className="mt-4 gap-2 h-9 text-sm text-accent hover:text-accent/80">
                <UserCircle className="h-4 w-4" />
                Go to Dashboard
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer Tagline */}
      <section className="px-4 py-4 sm:py-6 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 border-t border-accent/20">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm sm:text-base font-semibold text-foreground">ASTRA Villa is your trusted gateway to Indonesia.</p>
          <p className="text-xs sm:text-sm text-accent mt-1">Invest Smart. Live Secure. Grow with Indonesia.</p>
        </div>
      </section>
    </div>
  );
};

export default WNAPage;
