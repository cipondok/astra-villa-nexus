import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Home, Users, Building2, Shield, Briefcase, ArrowRight, Sparkles, MapPin, BadgeCheck, Plane, FileText, Calculator, Crown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

type InvestorType = 'wni' | 'wna' | null;

const InvestorPathSelector = () => {
  const [selectedPath, setSelectedPath] = useState<InvestorType>(null);
  const [isHovering, setIsHovering] = useState<InvestorType>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();

  const content = {
    en: {
      headline: "Secure Property. Smart Investment. Seamless Living in Indonesia.",
      subheadline: "ASTRA Villa opens exclusive property opportunities for Indonesian citizens overseas and foreign investors",
      selectPath: "Choose Your Investment Journey",
      wniTitle: "I am WNI Overseas",
      wniSubtitle: "Indonesian Citizens Working Abroad",
      wniDescription: "Smart Homecoming Investment Plan designed for Indonesians working overseas",
      wnaTitle: "I am Foreign Investor",
      wnaSubtitle: "International Property Investors",
      wnaDescription: "Legal pathways to invest in Indonesia's fastest-growing property market",
      exploreNow: "Explore Now",
      learnMore: "Learn More",
      vipExperience: "VIP End-to-End Experience",
      vipDescription: "Dedicated consultants, legal guarantee, fast-track processing & seamless move-in"
    },
    id: {
      headline: "Properti Aman. Investasi Cerdas. Hidup Nyaman di Indonesia.",
      subheadline: "ASTRA Villa membuka peluang properti eksklusif untuk WNI di luar negeri dan investor asing",
      selectPath: "Pilih Jalur Investasi Anda",
      wniTitle: "Saya WNI di Luar Negeri",
      wniSubtitle: "Warga Negara Indonesia yang Bekerja di Luar Negeri",
      wniDescription: "Rencana Investasi Pulang Cerdas untuk WNI yang bekerja di luar negeri",
      wnaTitle: "Saya Investor Asing",
      wnaSubtitle: "Investor Properti Internasional",
      wnaDescription: "Jalur legal untuk berinvestasi di pasar properti Indonesia yang berkembang pesat",
      exploreNow: "Jelajahi Sekarang",
      learnMore: "Pelajari Lebih Lanjut",
      vipExperience: "Pengalaman VIP End-to-End",
      vipDescription: "Konsultan khusus, jaminan legal, proses cepat & pengalaman pindah yang mulus"
    }
  };

  const t = content[language];

  const wniFeatures = [
    { icon: Home, text: language === 'en' ? "Buy property while working overseas" : "Beli properti saat bekerja di luar negeri" },
    { icon: BadgeCheck, text: language === 'en' ? "Exclusive WNI overseas discounts" : "Diskon eksklusif WNI luar negeri" },
    { icon: Calculator, text: language === 'en' ? "Flexible payment plans" : "Rencana pembayaran fleksibel" },
    { icon: Shield, text: language === 'en' ? "Guaranteed legal ownership" : "Kepemilikan legal terjamin" },
    { icon: Plane, text: language === 'en' ? "Your home ready when you return" : "Rumah Anda siap saat pulang" },
  ];

  const wnaFeatures = [
    { icon: Building2, text: language === 'en' ? "Invest legally in premium properties" : "Investasi legal di properti premium" },
    { icon: Globe, text: language === 'en' ? "Access smart-city developments" : "Akses pengembangan smart-city" },
    { icon: FileText, text: language === 'en' ? "Expert legal guidance" : "Panduan legal ahli" },
    { icon: Users, text: language === 'en' ? "Long-term residency pathways" : "Jalur residensi jangka panjang" },
    { icon: Briefcase, text: language === 'en' ? "Business & family support" : "Dukungan bisnis & keluarga" },
  ];

  const handlePathSelect = (path: InvestorType) => {
    setSelectedPath(path);
  };

  const handleExplore = (path: InvestorType) => {
    if (path === 'wni') {
      navigate('/investor/wni');
    } else if (path === 'wna') {
      navigate('/investor/wna');
    }
  };

  return (
    <section className="relative py-8 sm:py-12 md:py-16 overflow-hidden" id="investor-paths">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Main Headline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20">
            <Globe className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-primary">Global Investment Gateway</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent">
              {t.headline}
            </span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            {t.subheadline}
          </p>
        </motion.div>

        {/* Path Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10">
          {/* WNI Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onMouseEnter={() => setIsHovering('wni')}
            onMouseLeave={() => setIsHovering(null)}
            onClick={() => handlePathSelect('wni')}
            className={cn(
              "group relative cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden",
              "transition-all duration-500 ease-out",
              "bg-gradient-to-br from-background/80 via-background/60 to-primary/10",
              "backdrop-blur-xl border-2",
              selectedPath === 'wni' 
                ? "border-primary shadow-2xl shadow-primary/30 scale-[1.02]" 
                : "border-primary/20 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20",
              "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-accent/5 before:opacity-0 before:transition-opacity before:duration-500",
              isHovering === 'wni' && "before:opacity-100"
            )}
          >
            {/* Indonesia Flag Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-red-500 to-white" />
            
            <div className="p-4 sm:p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 sm:p-3 rounded-xl sm:rounded-2xl",
                    "bg-gradient-to-br from-primary/20 to-primary/10",
                    "border border-primary/30",
                    "transition-all duration-300",
                    selectedPath === 'wni' && "bg-primary/30"
                  )}>
                    <Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                      {t.wniTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t.wniSubtitle}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "p-1.5 rounded-full transition-all duration-300",
                  selectedPath === 'wni' ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                )}>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                {t.wniDescription}
              </p>

              {/* Features */}
              <div className="space-y-2 sm:space-y-3 mb-6">
                {wniFeatures.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <div className="p-1 rounded-lg bg-primary/10">
                      <feature.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-foreground/80">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExplore('wni');
                }}
                className={cn(
                  "w-full group/btn",
                  "bg-gradient-to-r from-primary to-primary/80",
                  "hover:from-primary/90 hover:to-primary",
                  "text-primary-foreground font-semibold",
                  "rounded-xl py-2.5 sm:py-3",
                  "transition-all duration-300",
                  "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                )}
              >
                <span>{t.exploreNow}</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </motion.div>

          {/* WNA Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onMouseEnter={() => setIsHovering('wna')}
            onMouseLeave={() => setIsHovering(null)}
            onClick={() => handlePathSelect('wna')}
            className={cn(
              "group relative cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden",
              "transition-all duration-500 ease-out",
              "bg-gradient-to-br from-background/80 via-background/60 to-accent/10",
              "backdrop-blur-xl border-2",
              selectedPath === 'wna' 
                ? "border-accent shadow-2xl shadow-accent/30 scale-[1.02]" 
                : "border-accent/20 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/20",
              "before:absolute before:inset-0 before:bg-gradient-to-br before:from-accent/5 before:via-transparent before:to-primary/5 before:opacity-0 before:transition-opacity before:duration-500",
              isHovering === 'wna' && "before:opacity-100"
            )}
          >
            {/* Global Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-accent to-purple-500" />
            
            <div className="p-4 sm:p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 sm:p-3 rounded-xl sm:rounded-2xl",
                    "bg-gradient-to-br from-accent/20 to-accent/10",
                    "border border-accent/30",
                    "transition-all duration-300",
                    selectedPath === 'wna' && "bg-accent/30"
                  )}>
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                      {t.wnaTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t.wnaSubtitle}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "p-1.5 rounded-full transition-all duration-300",
                  selectedPath === 'wna' ? "bg-accent text-accent-foreground" : "bg-accent/10 text-accent"
                )}>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                {t.wnaDescription}
              </p>

              {/* Features */}
              <div className="space-y-2 sm:space-y-3 mb-6">
                {wnaFeatures.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <div className="p-1 rounded-lg bg-accent/10">
                      <feature.icon className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <span className="text-foreground/80">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExplore('wna');
                }}
                className={cn(
                  "w-full group/btn",
                  "bg-gradient-to-r from-accent to-accent/80",
                  "hover:from-accent/90 hover:to-accent",
                  "text-accent-foreground font-semibold",
                  "rounded-xl py-2.5 sm:py-3",
                  "transition-all duration-300",
                  "shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30"
                )}
              >
                <span>{t.exploreNow}</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* VIP Experience Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={cn(
            "relative rounded-2xl sm:rounded-3xl overflow-hidden",
            "bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10",
            "backdrop-blur-xl border border-primary/20",
            "p-4 sm:p-6 md:p-8"
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl opacity-50" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="hidden sm:flex p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground flex items-center gap-2 justify-center md:justify-start">
                  <Crown className="h-5 w-5 sm:hidden text-primary" />
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  {t.vipExperience}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  {t.vipDescription}
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate('/vip-concierge')}
              variant="outline"
              className={cn(
                "shrink-0",
                "border-primary/50 text-primary",
                "hover:bg-primary hover:text-primary-foreground",
                "rounded-xl px-6 py-2.5",
                "transition-all duration-300"
              )}
            >
              {t.learnMore}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InvestorPathSelector;
