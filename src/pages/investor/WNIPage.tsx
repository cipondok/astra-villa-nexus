import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsAdmin } from '@/hooks/useUserRoles';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Home, 
  Shield, 
  CheckCircle, 
  CreditCard, 
  FileCheck, 
  FileText,
  Clock, 
  Award,
  Phone,
  MessageSquare,
  UserCircle,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import InvestorAuthSection from '@/components/auth/InvestorAuthSection';

// WNI KPR System Components
import EligibleCountriesSelector from '@/components/wni/EligibleCountriesSelector';
import KPRRequirementsChecklist from '@/components/wni/KPRRequirementsChecklist';
import KPREligibilityChecker from '@/components/wni/KPREligibilityChecker';
import SLIKCreditChecker from '@/components/wni/SLIKCreditChecker';
import KPRPaymentMethods from '@/components/wni/KPRPaymentMethods';

const WNIPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAdmin } = useIsAdmin();
  const { isAuthenticated } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const copy = {
    en: {
      back: "Back",
      badge: "WNI Overseas Program",
      title: "A Smart Homecoming Investment Plan",
      subtitle: "Designed for Indonesians working abroad who want to invest, build, and secure their future in Indonesia with confidence",
      
      benefits: [
        { icon: Home, title: "Buy While Abroad", desc: "Purchase houses or apartments in Indonesia while working overseas" },
        { icon: Award, title: "Exclusive Discounts", desc: "Special WNI overseas discounts and priority pricing" },
        { icon: CreditCard, title: "KPR Facility", desc: "Access Indonesian mortgage (KPR) from overseas" },
        { icon: Shield, title: "Legal Guarantee", desc: "Guaranteed legal ownership under Indonesian law" },
        { icon: Clock, title: "Ready On Return", desc: "Your home is ready and secured when you return" },
        { icon: FileCheck, title: "100% Transparent", desc: "Secure, transparent, and professionally managed process" }
      ],

      tagline: "ASTRA Villa ensures your return home is smooth, proud, and worry-free.",
      
      kprSystemTitle: "KPR System for WNI Overseas",
      kprSystemSubtitle: "Complete mortgage eligibility, requirements, and payment system",
      
      tabs: {
        countries: "Eligible Countries",
        eligibility: "Check Eligibility",
        requirements: "Requirements",
        credit: "Credit Check (SLIK)",
        payment: "Payment Methods"
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

      ctaTitle: "Open Your Own House Door With Confidence",
      ctaSubtitle: "Start your homecoming investment journey today",
      ctaButton: "Contact Our Team",
      ctaChat: "Chat With AI Assistant"
    },
    id: {
      back: "Kembali",
      badge: "Program WNI Luar Negeri",
      title: "Rencana Investasi Pulang Kampung yang Cerdas",
      subtitle: "Dirancang untuk WNI yang bekerja di luar negeri yang ingin investasi, membangun, dan mengamankan masa depan di Indonesia dengan percaya diri",
      
      benefits: [
        { icon: Home, title: "Beli Saat di Luar Negeri", desc: "Beli rumah atau apartemen di Indonesia saat bekerja di luar negeri" },
        { icon: Award, title: "Diskon Eksklusif", desc: "Diskon khusus WNI luar negeri dan harga prioritas" },
        { icon: CreditCard, title: "Fasilitas KPR", desc: "Akses KPR Indonesia dari luar negeri" },
        { icon: Shield, title: "Jaminan Legal", desc: "Kepemilikan legal dijamin oleh hukum Indonesia" },
        { icon: Clock, title: "Siap Saat Pulang", desc: "Rumah Anda siap dan aman saat Anda kembali" },
        { icon: FileCheck, title: "100% Transparan", desc: "Proses aman, transparan, dan dikelola profesional" }
      ],

      tagline: "ASTRA Villa memastikan kepulangan Anda lancar, bangga, dan tanpa khawatir.",
      
      kprSystemTitle: "Sistem KPR untuk WNI di Luar Negeri",
      kprSystemSubtitle: "Kelayakan KPR lengkap, persyaratan, dan sistem pembayaran",
      
      tabs: {
        countries: "Negara Eligible",
        eligibility: "Cek Kelayakan",
        requirements: "Persyaratan",
        credit: "Cek Kredit (SLIK)",
        payment: "Metode Pembayaran"
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

      ctaTitle: "Buka Pintu Rumah Anda Sendiri dengan Percaya Diri",
      ctaSubtitle: "Mulai perjalanan investasi pulang kampung Anda hari ini",
      ctaButton: "Hubungi Tim Kami",
      ctaChat: "Chat dengan Asisten AI"
    }
  };

  const t = copy[language];

  const openChat = () => {
    const event = new CustomEvent('openAIChat');
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Sticky Back Header - Slim */}
      <div className="sticky top-10 md:top-11 lg:top-12 z-40 bg-background/80 backdrop-blur-2xl border-b border-border/20">
        <div className="max-w-6xl mx-auto px-3 py-1.5">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1.5 text-[10px] h-7 px-2 hover:bg-primary/10 active:scale-95">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.back}
          </Button>
        </div>
      </div>

      {/* Hero Section - Compact */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute top-10 right-10 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-red-500/10 to-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-3 py-4 sm:py-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2.5 bg-gradient-to-r from-red-500/10 to-primary/10 border border-red-500/20 rounded-full backdrop-blur-xl">
              <span className="text-sm">🇮🇩</span>
              <span className="text-[9px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">{t.badge}</span>
            </div>
            <h1 className="text-sm sm:text-lg md:text-xl font-bold text-foreground mb-1.5 px-2">{t.title}</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed px-2">{t.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Auth Section - Prominent Position (Same as WNA) */}
      <section className="px-4 py-4 sm:py-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
            <InvestorAuthSection investorType="wni" />
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid - Marketplace Style Icons */}
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
                    "hover:border-primary/40 active:scale-95",
                    "transition-all duration-200 group flex flex-col items-center text-center"
                  )}
                >
                  {/* Icon Container - Marketplace Style */}
                  <div className={cn(
                    "flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-lg mb-1.5 shadow-sm",
                    colorSet.bg
                  )}>
                    <benefit.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", colorSet.text)} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[8px] sm:text-[10px] font-semibold text-foreground mb-0.5 leading-tight line-clamp-2 group-hover:text-primary transition-colors">{benefit.title}</h3>
                  <p className="text-[7px] sm:text-[8px] text-muted-foreground leading-snug line-clamp-2 hidden sm:block">{benefit.desc}</p>
                </motion.div>
              );
            })}
          </div>
          <motion.p 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }} 
            className="text-center text-[9px] sm:text-xs font-medium text-primary mt-3 sm:mt-4"
          >
            ✨ {t.tagline}
          </motion.p>
        </div>
      </section>

      {/* KPR System Section - Light Mode Enhanced */}
      <section className="px-3 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto">
          <div className={cn(
            "rounded-lg p-2.5 sm:p-4",
            "bg-white/80 dark:bg-white/5",
            "border border-border/30 dark:border-primary/10",
            "backdrop-blur-xl shadow-sm"
          )}>
            <div className="text-center mb-2.5 sm:mb-3">
              <h2 className="text-xs sm:text-base font-bold text-foreground mb-0.5">{t.kprSystemTitle}</h2>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">{t.kprSystemSubtitle}</p>
            </div>

            <Tabs defaultValue="countries" className="w-full">
              <div className="overflow-x-auto -mx-2.5 px-2.5 pb-1 scrollbar-hide">
                <TabsList className="inline-flex w-max h-auto gap-0.5 bg-muted/50 backdrop-blur-xl p-0.5 mb-2.5 rounded-md whitespace-nowrap border border-border/20">
                  <TabsTrigger value="countries" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded active:scale-95 flex items-center gap-1">
                    <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {t.tabs.countries}
                  </TabsTrigger>
                  <TabsTrigger value="eligibility" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded active:scale-95 flex items-center gap-1">
                    <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {t.tabs.eligibility}
                  </TabsTrigger>
                  <TabsTrigger value="requirements" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded active:scale-95 flex items-center gap-1">
                    <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {t.tabs.requirements}
                  </TabsTrigger>
                  {isAdmin && (
                    <TabsTrigger value="credit" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded active:scale-95 flex items-center gap-1">
                      <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {t.tabs.credit}
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="payment" className="min-w-fit text-[8px] sm:text-[10px] py-1 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded active:scale-95 flex items-center gap-1">
                    <CreditCard className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {t.tabs.payment}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="countries" className="mt-0">
                <EligibleCountriesSelector selectedCountry={selectedCountry} onSelect={setSelectedCountry} />
              </TabsContent>
              <TabsContent value="eligibility" className="mt-0">
                <KPREligibilityChecker selectedCountry={selectedCountry} />
              </TabsContent>
              <TabsContent value="requirements" className="mt-0">
                <KPRRequirementsChecklist />
              </TabsContent>
              {isAdmin && (
                <TabsContent value="credit" className="mt-0">
                  <SLIKCreditChecker />
                </TabsContent>
              )}
              <TabsContent value="payment" className="mt-0">
                <KPRPaymentMethods />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* VIP Section - Compact Glassmorphic */}
      <section className="px-3 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className={cn(
              "rounded-lg p-2.5 sm:p-4",
              "bg-gradient-to-br from-primary/5 via-transparent to-accent/5",
              "backdrop-blur-xl",
              "border border-primary/20 shadow-sm"
            )}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-lg",
                "bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20",
                "border border-primary/30"
              )}>
                <Award className="h-3 w-3 text-primary" />
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

      {/* CTA Section */}
      <section className="px-4 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xs sm:text-base font-bold text-foreground mb-1">{t.ctaTitle}</h2>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mb-2.5 sm:mb-4">{t.ctaSubtitle}</p>
            <div className="flex flex-row items-center justify-center gap-2">
              <Button 
                size="sm" 
                onClick={() => navigate('/contact')} 
                className="gap-1 h-7 sm:h-8 text-[9px] sm:text-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md active:scale-95"
              >
                <Phone className="h-3 w-3" />
                {t.ctaButton}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={openChat} 
                className="gap-1 h-7 sm:h-8 text-[9px] sm:text-xs border-primary/30 hover:bg-primary/10 active:scale-95"
              >
                <MessageSquare className="h-3 w-3" />
                {t.ctaChat}
              </Button>
            </div>
            {isAuthenticated && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => navigate('/dashboard')} 
                className="mt-2 gap-1 h-7 text-[9px] sm:text-xs text-primary hover:text-primary/80"
              >
                <UserCircle className="h-3 w-3" />
                Go to Dashboard
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer Tagline - Slim */}
      <section className="px-3 py-2.5 sm:py-4 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border-t border-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[9px] sm:text-xs font-semibold text-foreground">ASTRA Villa is your trusted gateway to Indonesia.</p>
          <p className="text-[8px] sm:text-[10px] text-primary mt-0.5">Invest Smart. Live Secure. Grow with Indonesia.</p>
        </div>
      </section>
    </div>
  );
};

export default WNIPage;
