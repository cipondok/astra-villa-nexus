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
    <section className="relative py-4 sm:py-8 md:py-12 overflow-hidden" id="investor-paths">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-accent/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Main Headline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 sm:mb-8 md:mb-10"
        >
          <div className="inline-flex items-center gap-1.5 px-2 py-1 mb-2 sm:mb-4 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20">
            <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
            <span className="text-[10px] sm:text-xs font-medium text-primary">Global Investment Gateway</span>
          </div>
          
          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight mb-2 sm:mb-3 px-1">
            <span className="bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent">
              {t.headline}
            </span>
          </h2>
          
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            {t.subheadline}
          </p>
        </motion.div>

        {/* Path Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-8">
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
              "group relative cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden",
              "transition-all duration-500 ease-out",
              "bg-gradient-to-br from-background/80 via-background/60 to-primary/10",
              "backdrop-blur-xl border",
              selectedPath === 'wni' 
                ? "border-primary shadow-xl shadow-primary/20 scale-[1.01]" 
                : "border-primary/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
              "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-accent/5 before:opacity-0 before:transition-opacity before:duration-500",
              isHovering === 'wni' && "before:opacity-100"
            )}
          >
            {/* Indonesia Flag Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-500 to-white" />
            
            <div className="p-3 sm:p-4 md:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={cn(
                    "p-2 sm:p-2.5 rounded-lg sm:rounded-xl",
                    "bg-gradient-to-br from-primary/20 to-primary/10",
                    "border border-primary/30",
                    "transition-all duration-300",
                    selectedPath === 'wni' && "bg-primary/30"
                  )}>
                    <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                      {t.wniTitle}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {t.wniSubtitle}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "p-1 rounded-full transition-all duration-300",
                  selectedPath === 'wni' ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                )}>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
                {t.wniDescription}
              </p>

              {/* Features */}
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                {wniFeatures.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <div className="p-0.5 sm:p-1 rounded-md bg-primary/10">
                      <feature.icon className="h-3 w-3 text-primary" />
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
                size="sm"
                className={cn(
                  "w-full group/btn text-xs sm:text-sm",
                  "bg-gradient-to-r from-primary to-primary/80",
                  "hover:from-primary/90 hover:to-primary",
                  "text-primary-foreground font-semibold",
                  "rounded-lg py-2 sm:py-2.5",
                  "transition-all duration-300",
                  "shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25"
                )}
              >
                <span>{t.exploreNow}</span>
                <ArrowRight className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover/btn:translate-x-1" />
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
              "group relative cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden",
              "transition-all duration-500 ease-out",
              "bg-gradient-to-br from-background/80 via-background/60 to-accent/10",
              "backdrop-blur-xl border",
              selectedPath === 'wna' 
                ? "border-accent shadow-xl shadow-accent/20 scale-[1.01]" 
                : "border-accent/20 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10",
              "before:absolute before:inset-0 before:bg-gradient-to-br before:from-accent/5 before:via-transparent before:to-primary/5 before:opacity-0 before:transition-opacity before:duration-500",
              isHovering === 'wna' && "before:opacity-100"
            )}
          >
            {/* Global Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-accent to-purple-500" />
            
            <div className="p-3 sm:p-4 md:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={cn(
                    "p-2 sm:p-2.5 rounded-lg sm:rounded-xl",
                    "bg-gradient-to-br from-accent/20 to-accent/10",
                    "border border-accent/30",
                    "transition-all duration-300",
                    selectedPath === 'wna' && "bg-accent/30"
                  )}>
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                      {t.wnaTitle}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {t.wnaSubtitle}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "p-1 rounded-full transition-all duration-300",
                  selectedPath === 'wna' ? "bg-accent text-accent-foreground" : "bg-accent/10 text-accent"
                )}>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
                {t.wnaDescription}
              </p>

              {/* Features */}
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                {wnaFeatures.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <div className="p-0.5 sm:p-1 rounded-md bg-accent/10">
                      <feature.icon className="h-3 w-3 text-accent" />
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
                size="sm"
                className={cn(
                  "w-full group/btn text-xs sm:text-sm",
                  "bg-gradient-to-r from-accent to-accent/80",
                  "hover:from-accent/90 hover:to-accent",
                  "text-accent-foreground font-semibold",
                  "rounded-lg py-2 sm:py-2.5",
                  "transition-all duration-300",
                  "shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/25"
                )}
              >
                <span>{t.exploreNow}</span>
                <ArrowRight className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover/btn:translate-x-1" />
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
            "relative rounded-xl sm:rounded-2xl overflow-hidden",
            "bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10",
            "backdrop-blur-xl border border-primary/20",
            "p-3 sm:p-4 md:p-6"
          )}
        >
          <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-primary/10 rounded-full blur-2xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-20 sm:w-32 h-20 sm:h-32 bg-accent/10 rounded-full blur-2xl opacity-50" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 text-center sm:text-left">
              <div className="hidden sm:flex p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground flex items-center gap-1.5 justify-center sm:justify-start">
                  <Crown className="h-4 w-4 sm:hidden text-primary" />
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
                  {t.vipExperience}
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">
                  {t.vipDescription}
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate('/vip-concierge')}
              variant="outline"
              size="sm"
              className={cn(
                "shrink-0 text-xs sm:text-sm",
                "border-primary/50 text-primary",
                "hover:bg-primary hover:text-primary-foreground",
                "rounded-lg px-3 sm:px-4 py-1.5 sm:py-2",
                "transition-all duration-300"
              )}
            >
              {t.learnMore}
              <ArrowRight className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InvestorPathSelector;
