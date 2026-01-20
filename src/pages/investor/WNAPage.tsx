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
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import InvestorAuthSection from '@/components/auth/InvestorAuthSection';

// WNA Investment System Components
import WelcomingCountriesList from '@/components/wna/WelcomingCountriesList';
import WNAInvestmentFacilities from '@/components/wna/WNAInvestmentFacilities';
import WNAProcessProcedure from '@/components/wna/WNAProcessProcedure';
import WNARulesRegulations from '@/components/wna/WNARulesRegulations';
import WNAEligibilityChecker from '@/components/wna/WNAEligibilityChecker';
import WNAProcessingTime from '@/components/wna/WNAProcessingTime';

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
        facilities: "Facilities",
        process: "Process",
        regulations: "Regulations",
        eligibility: "Eligibility",
        timeline: "Timeline"
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
        facilities: "Fasilitas",
        process: "Proses",
        regulations: "Regulasi",
        eligibility: "Kelayakan",
        timeline: "Timeline"
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
        <div className="max-w-6xl mx-auto px-3 py-1.5">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1.5 text-[10px] h-7 px-2 hover:bg-accent/10 active:scale-95">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.back}
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-blue-500/5 pointer-events-none" />
        <div className="absolute top-10 right-10 w-32 h-32 sm:w-48 sm:h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-3 py-4 sm:py-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2.5 bg-gradient-to-r from-accent/10 to-blue-500/10 border border-accent/20 rounded-full backdrop-blur-xl">
              <span className="text-sm">🌍</span>
              <span className="text-[9px] font-semibold text-accent uppercase tracking-wide">{t.badge}</span>
            </div>
            <h1 className="text-sm sm:text-lg md:text-xl font-bold text-foreground mb-1.5 px-2">{t.title}</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed px-2">{t.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="px-3 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2">
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
                    "relative overflow-hidden rounded-lg p-2 sm:p-2.5",
                    "bg-white/70 dark:bg-white/5",
                    "border border-border/30 dark:border-white/10",
                    "hover:border-accent/40 active:scale-95",
                    "transition-all duration-200 group flex flex-col items-center text-center"
                  )}
                >
                  <div className={cn("flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-lg mb-1.5 shadow-sm", colorSet.bg)}>
                    <benefit.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", colorSet.text)} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[8px] sm:text-[10px] font-semibold text-foreground mb-0.5 leading-tight line-clamp-2 group-hover:text-accent transition-colors">{benefit.title}</h3>
                  <p className="text-[7px] sm:text-[8px] text-muted-foreground leading-snug line-clamp-2 hidden sm:block">{benefit.desc}</p>
                </motion.div>
              );
            })}
          </div>
          
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-4 p-2.5 rounded-lg bg-accent/5 border border-accent/20">
            <div className="flex items-start gap-2">
              <Shield className="h-3.5 w-3.5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-[9px] sm:text-xs text-muted-foreground">{t.disclaimer}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Investment System Section */}
      <section className="px-3 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto">
          <div className={cn(
            "rounded-lg p-2.5 sm:p-4",
            "bg-white/80 dark:bg-white/5",
            "border border-border/30 dark:border-accent/10",
            "backdrop-blur-xl shadow-sm"
          )}>
            <div className="text-center mb-2.5 sm:mb-3">
              <h2 className="text-xs sm:text-base font-bold text-foreground mb-0.5">{t.investmentSystemTitle}</h2>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">{t.investmentSystemSubtitle}</p>
            </div>

            <Tabs defaultValue="countries" className="w-full">
              <div className="overflow-x-auto -mx-2.5 px-2.5 pb-1 scrollbar-hide">
                <TabsList className="inline-flex w-max h-auto gap-0.5 bg-muted/50 backdrop-blur-xl p-0.5 mb-2.5 rounded-md whitespace-nowrap border border-border/20">
                  <TabsTrigger value="countries" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded active:scale-95">{t.tabs.countries}</TabsTrigger>
                  <TabsTrigger value="facilities" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded active:scale-95">{t.tabs.facilities}</TabsTrigger>
                  <TabsTrigger value="process" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded active:scale-95">{t.tabs.process}</TabsTrigger>
                  <TabsTrigger value="regulations" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded active:scale-95">{t.tabs.regulations}</TabsTrigger>
                  <TabsTrigger value="eligibility" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded active:scale-95">{t.tabs.eligibility}</TabsTrigger>
                  <TabsTrigger value="timeline" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded active:scale-95">{t.tabs.timeline}</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="countries" className="mt-0">
                <WelcomingCountriesList selectedCountry={selectedCountry} onSelect={setSelectedCountry} />
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
              <TabsContent value="eligibility" className="mt-0">
                <WNAEligibilityChecker />
              </TabsContent>
              <TabsContent value="timeline" className="mt-0">
                <WNAProcessingTime />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* VIP Section */}
      <section className="px-3 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className={cn(
              "rounded-lg p-2.5 sm:p-4",
              "bg-gradient-to-br from-accent/5 via-transparent to-blue-500/5",
              "backdrop-blur-xl",
              "border border-accent/20 shadow-sm"
            )}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div className={cn("flex items-center justify-center w-6 h-6 rounded-lg", "bg-gradient-to-br from-accent/20 via-blue-500/10 to-accent/20", "border border-accent/30")}>
                <Award className="h-3 w-3 text-accent" />
              </div>
              <h2 className="text-[10px] sm:text-sm font-bold text-foreground">{t.vipTitle}</h2>
            </div>
            <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
              {t.vipFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <CheckCircle className="h-2.5 w-2.5 text-green-500 flex-shrink-0" />
                  <span className="text-[8px] sm:text-[10px] text-foreground/80 truncate">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Auth & CTA Section */}
      <section className="px-3 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <InvestorAuthSection investorType="wna" />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-center lg:text-left">
              <h2 className="text-xs sm:text-base font-bold text-foreground mb-1">{t.ctaTitle}</h2>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mb-2.5 sm:mb-4">{t.ctaSubtitle}</p>
              <div className="flex flex-row items-center justify-center lg:justify-start gap-2">
                <Button size="sm" onClick={() => navigate('/contact')} className="gap-1 flex-1 sm:flex-initial h-7 sm:h-8 text-[9px] sm:text-xs bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-600 shadow-md active:scale-95">
                  <Phone className="h-3 w-3" />
                  {t.ctaButton}
                </Button>
                <Button size="sm" variant="outline" onClick={openChat} className="gap-1 flex-1 sm:flex-initial h-7 sm:h-8 text-[9px] sm:text-xs border-accent/30 hover:bg-accent/10 active:scale-95">
                  <MessageSquare className="h-3 w-3" />
                  {t.ctaChat}
                </Button>
              </div>
              {isAuthenticated && (
                <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard')} className="mt-2 gap-1 h-7 text-[9px] sm:text-xs text-accent hover:text-accent/80">
                  <UserCircle className="h-3 w-3" />
                  Go to Dashboard
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer Tagline */}
      <section className="px-3 py-2.5 sm:py-4 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 border-t border-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[9px] sm:text-xs font-semibold text-foreground">ASTRA Villa is your trusted gateway to Indonesia.</p>
          <p className="text-[8px] sm:text-[10px] text-accent mt-0.5">Invest Smart. Live Secure. Grow with Indonesia.</p>
        </div>
      </section>
    </div>
  );
};

export default WNAPage;
