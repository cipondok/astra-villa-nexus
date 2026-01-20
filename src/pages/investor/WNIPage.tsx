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
    <div className="min-h-screen bg-background">
      {/* Sticky Back Header */}
      <div className="sticky top-10 md:top-11 lg:top-12 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-6xl mx-auto px-3 py-2 sm:px-4 sm:py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1.5 text-xs sm:text-sm h-8">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.back}
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-red-500/5 pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-3 py-8 sm:px-4 sm:py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-red-500/10 border border-red-500/20 rounded-full">
              <span className="text-lg">🇮🇩</span>
              <span className="text-[10px] sm:text-xs font-semibold text-red-600 dark:text-red-400">{t.badge}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">{t.title}</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="px-3 py-6 sm:px-4 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {t.benefits.map((benefit, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={cn("relative overflow-hidden rounded-xl p-4 sm:p-5", "bg-background/80 backdrop-blur-xl", "border border-border/40 hover:border-primary/40", "shadow-sm hover:shadow-lg hover:shadow-primary/10", "transition-all duration-300")}>
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-primary/20 border border-red-500/30 mb-3">
                  <benefit.icon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">{benefit.title}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-sm sm:text-base md:text-lg font-medium text-primary mt-8 sm:mt-10">
            ✨ {t.tagline}
          </motion.p>
        </div>
      </section>

      {/* KPR System Section */}
      <section className="px-3 py-6 sm:px-4 sm:py-8 md:py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">{t.kprSystemTitle}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.kprSystemSubtitle}</p>
          </div>

          <Tabs defaultValue="countries" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1 mb-6">
              <TabsTrigger value="countries" className="flex-1 min-w-[120px] text-[10px] sm:text-xs">{t.tabs.countries}</TabsTrigger>
              <TabsTrigger value="eligibility" className="flex-1 min-w-[120px] text-[10px] sm:text-xs">{t.tabs.eligibility}</TabsTrigger>
              <TabsTrigger value="requirements" className="flex-1 min-w-[120px] text-[10px] sm:text-xs">{t.tabs.requirements}</TabsTrigger>
              <TabsTrigger value="credit" className="flex-1 min-w-[120px] text-[10px] sm:text-xs">{t.tabs.credit}</TabsTrigger>
              <TabsTrigger value="payment" className="flex-1 min-w-[120px] text-[10px] sm:text-xs">{t.tabs.payment}</TabsTrigger>
            </TabsList>

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
      </section>

      {/* VIP Section */}
      <section className="px-3 py-6 sm:px-4 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className={cn("rounded-2xl p-5 sm:p-6 md:p-8", "bg-background/80 backdrop-blur-xl", "border border-primary/30 shadow-xl shadow-primary/10")}>
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground">{t.vipTitle}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {t.vipFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-foreground/80">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-3 py-8 sm:px-4 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">{t.ctaTitle}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6">{t.ctaSubtitle}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" onClick={() => navigate('/contact')} className="gap-2 w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
                <Phone className="h-4 w-4" />
                {t.ctaButton}
              </Button>
              <Button size="lg" variant="outline" onClick={openChat} className="gap-2 w-full sm:w-auto border-primary/50 hover:bg-primary/10">
                <MessageSquare className="h-4 w-4" />
                {t.ctaChat}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Tagline */}
      <section className="px-3 py-6 sm:px-4 sm:py-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm sm:text-base md:text-lg font-semibold text-foreground">ASTRA Villa is your trusted gateway to Indonesia.</p>
          <p className="text-xs sm:text-sm text-primary mt-1">Invest Smart. Live Secure. Grow with Indonesia.</p>
        </div>
      </section>
    </div>
  );
};

export default WNIPage;
