import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Home, 
  Shield, 
  CheckCircle, 
  CreditCard, 
  FileCheck, 
  Clock, 
  Award,
  Phone,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

// WNI KPR System Components
import EligibleCountriesSelector from '@/components/wni/EligibleCountriesSelector';
import KPRRequirementsChecklist from '@/components/wni/KPRRequirementsChecklist';
import KPREligibilityChecker from '@/components/wni/KPREligibilityChecker';
import SLIKCreditChecker from '@/components/wni/SLIKCreditChecker';
import KPRPaymentMethods from '@/components/wni/KPRPaymentMethods';

const WNIPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
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
      <div className="sticky top-10 md:top-11 lg:top-12 z-40 bg-background/60 backdrop-blur-2xl border-b border-primary/10">
        <div className="max-w-6xl mx-auto px-2 py-1.5 sm:px-3 sm:py-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1 text-[10px] sm:text-xs h-7 px-2 hover:bg-primary/10">
            <ArrowLeft className="h-3 w-3" />
            {t.back}
          </Button>
        </div>
      </div>

      {/* Hero Section - Compact */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute top-10 right-10 w-48 h-48 bg-gradient-to-br from-red-500/10 to-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-2 py-4 sm:px-3 sm:py-6 md:py-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 bg-gradient-to-r from-red-500/10 to-primary/10 border border-red-500/20 rounded-full backdrop-blur-xl">
              <span className="text-sm">🇮🇩</span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">{t.badge}</span>
            </div>
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1.5 sm:mb-2">{t.title}</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">{t.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid - Slim Transparent Cards */}
      <section className="px-2 py-3 sm:px-3 sm:py-4 md:py-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
            {t.benefits.map((benefit, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className={cn(
                  "relative overflow-hidden rounded-lg p-2.5 sm:p-3",
                  "bg-transparent dark:bg-white/5",
                  "border border-primary/10 hover:border-primary/30",
                  "hover:shadow-md hover:shadow-primary/10",
                  "transition-all duration-300 group"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg mb-2",
                  "bg-gradient-to-br from-red-500/15 via-primary/10 to-red-500/15",
                  "border border-red-500/20 group-hover:border-red-500/40",
                  "transition-all duration-300"
                )}>
                  <benefit.icon className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-[10px] sm:text-xs font-semibold text-foreground mb-0.5 leading-tight">{benefit.title}</h3>
                <p className="text-[8px] sm:text-[9px] text-muted-foreground leading-snug">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.p 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }} 
            className="text-center text-[10px] sm:text-xs font-medium text-primary mt-4 sm:mt-5"
          >
            ✨ {t.tagline}
          </motion.p>
        </div>
      </section>

      {/* KPR System Section - Glassmorphic */}
      <section className="px-2 py-4 sm:px-3 sm:py-5 md:py-6">
        <div className="max-w-6xl mx-auto">
          <div className={cn(
            "rounded-xl p-3 sm:p-4",
            "bg-transparent dark:bg-white/5",
            "border border-primary/10",
            "backdrop-blur-xl"
          )}>
            <div className="text-center mb-3 sm:mb-4">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-foreground mb-1">{t.kprSystemTitle}</h2>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">{t.kprSystemSubtitle}</p>
            </div>

            <Tabs defaultValue="countries" className="w-full">
              <div className="overflow-x-auto -mx-3 px-3 pb-1 scrollbar-hide">
                <TabsList className="inline-flex w-max sm:w-full h-auto gap-1 bg-muted/30 backdrop-blur-xl p-1 mb-3 rounded-lg whitespace-nowrap">
                  <TabsTrigger value="countries" className="min-w-fit text-[9px] sm:text-[10px] py-1.5 px-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">{t.tabs.countries}</TabsTrigger>
                  <TabsTrigger value="eligibility" className="min-w-fit text-[9px] sm:text-[10px] py-1.5 px-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">{t.tabs.eligibility}</TabsTrigger>
                  <TabsTrigger value="requirements" className="min-w-fit text-[9px] sm:text-[10px] py-1.5 px-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">{t.tabs.requirements}</TabsTrigger>
                  <TabsTrigger value="credit" className="min-w-fit text-[9px] sm:text-[10px] py-1.5 px-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">{t.tabs.credit}</TabsTrigger>
                  <TabsTrigger value="payment" className="min-w-fit text-[9px] sm:text-[10px] py-1.5 px-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">{t.tabs.payment}</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="countries">
                <EligibleCountriesSelector selectedCountry={selectedCountry} onSelect={setSelectedCountry} />
              </TabsContent>
              <TabsContent value="eligibility">
                <KPREligibilityChecker selectedCountry={selectedCountry} />
              </TabsContent>
              <TabsContent value="requirements">
                <KPRRequirementsChecklist />
              </TabsContent>
              <TabsContent value="credit">
                <SLIKCreditChecker />
              </TabsContent>
              <TabsContent value="payment">
                <KPRPaymentMethods />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* VIP Section - Compact Glassmorphic */}
      <section className="px-2 py-3 sm:px-3 sm:py-4 md:py-5">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className={cn(
              "rounded-xl p-3 sm:p-4",
              "bg-gradient-to-br from-primary/5 via-transparent to-accent/5",
              "backdrop-blur-xl",
              "border border-primary/20 shadow-lg shadow-primary/5"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={cn(
                "flex items-center justify-center w-7 h-7 rounded-lg",
                "bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20",
                "border border-primary/30"
              )}>
                <Award className="h-3.5 w-3.5 text-primary" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-foreground">{t.vipTitle}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
              {t.vipFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span className="text-[9px] sm:text-[10px] text-foreground/80">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Compact */}
      <section className="px-2 py-4 sm:px-3 sm:py-6 md:py-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-foreground mb-1">{t.ctaTitle}</h2>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mb-3 sm:mb-4">{t.ctaSubtitle}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <Button 
                size="sm" 
                onClick={() => navigate('/contact')} 
                className="gap-1.5 w-full sm:w-auto h-8 text-[10px] sm:text-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20"
              >
                <Phone className="h-3 w-3" />
                {t.ctaButton}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={openChat} 
                className="gap-1.5 w-full sm:w-auto h-8 text-[10px] sm:text-xs border-primary/30 hover:bg-primary/10 hover:border-primary/50"
              >
                <MessageSquare className="h-3 w-3" />
                {t.ctaChat}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Tagline - Slim */}
      <section className="px-2 py-3 sm:px-3 sm:py-4 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border-t border-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] sm:text-xs font-semibold text-foreground">ASTRA Villa is your trusted gateway to Indonesia.</p>
          <p className="text-[9px] sm:text-[10px] text-primary mt-0.5">Invest Smart. Live Secure. Grow with Indonesia.</p>
        </div>
      </section>
    </div>
  );
};

export default WNIPage;
