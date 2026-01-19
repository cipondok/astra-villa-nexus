import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ArrowRight, Globe, Home, Shield, Star, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const InvestorPathSelector = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isMobile, isTablet } = useIsMobile();

  const copy = {
    en: {
      headline: "Secure Property. Smart Investment. Seamless Living in Indonesia.",
      subheadline: "ASTRA Villa opens exclusive property opportunities for Indonesian citizens (WNI) overseas and foreign investors (WNA)",
      wniTitle: "I am WNI Overseas",
      wniSubtitle: "Indonesian Citizen Working Abroad",
      wniDescription: "Smart Homecoming Investment Plan designed for Indonesians working overseas",
      wniFeatures: ["Buy property while working abroad", "Exclusive WNI overseas discounts", "100% legal ownership guarantee"],
      wnaTitle: "I am Foreign Investor (WNA)",
      wnaSubtitle: "International Property Investor",
      wnaDescription: "Invest legally in premium Indonesian property with full expert guidance",
      wnaFeatures: ["Legal investment structures", "Smart-city developments", "Residency pathway support"],
      learnMore: "Explore Options"
    },
    id: {
      headline: "Properti Aman. Investasi Cerdas. Hidup Lancar di Indonesia.",
      subheadline: "ASTRA Villa membuka peluang properti eksklusif untuk WNI di luar negeri dan investor asing (WNA)",
      wniTitle: "Saya WNI di Luar Negeri",
      wniSubtitle: "Warga Negara Indonesia Bekerja di Luar Negeri",
      wniDescription: "Rencana Investasi Pulang Kampung Cerdas untuk WNI yang bekerja di luar negeri",
      wniFeatures: ["Beli properti sambil kerja di luar negeri", "Diskon eksklusif WNI luar negeri", "Jaminan kepemilikan legal 100%"],
      wnaTitle: "Saya Investor Asing (WNA)",
      wnaSubtitle: "Investor Properti Internasional",
      wnaDescription: "Investasi legal di properti premium Indonesia dengan bimbingan ahli penuh",
      wnaFeatures: ["Struktur investasi legal", "Pengembangan kota pintar", "Dukungan jalur residensi"],
      learnMore: "Jelajahi Opsi"
    }
  };

  const t = copy[language];

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
    })
  };

  return (
    <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 bg-primary/10 border border-primary/20 rounded-full">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs font-medium text-primary">Global Investment Platform</span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3 leading-tight">
            {t.headline}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            {t.subheadline}
          </p>
        </motion.div>

        {/* Investor Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {/* WNI Card */}
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
            onClick={() => handleCardClick('/investor/wni')}
            className={cn(
              "group relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer",
              "bg-gradient-to-br from-background/90 via-background/80 to-primary/10",
              "border border-primary/30 hover:border-primary/50",
              "backdrop-blur-xl shadow-lg hover:shadow-xl hover:shadow-primary/20",
              "transition-all duration-500 ease-out",
              "p-4 sm:p-5 md:p-6"
            )}
          >
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
            
            {/* Flag indicator */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md">
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🇮🇩</span>
                <Shield className="h-3.5 w-3.5 text-green-500" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {t.wniTitle}
            </h3>
            <p className="text-[10px] sm:text-xs text-primary font-medium mb-2">
              {t.wniSubtitle}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              {t.wniDescription}
            </p>

            {/* Features */}
            <ul className="space-y-1.5 sm:space-y-2 mb-4">
              {t.wniFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[10px] sm:text-xs text-foreground/80">
                  <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
              {t.learnMore}
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </motion.div>

          {/* WNA Card */}
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
            onClick={() => handleCardClick('/investor/wna')}
            className={cn(
              "group relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer",
              "bg-gradient-to-br from-background/90 via-background/80 to-accent/10",
              "border border-accent/30 hover:border-accent/50",
              "backdrop-blur-xl shadow-lg hover:shadow-xl hover:shadow-accent/20",
              "transition-all duration-500 ease-out",
              "p-4 sm:p-5 md:p-6"
            )}
          >
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
            
            {/* Icon indicator */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-accent to-accent/80 text-white shadow-md">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg">🌍</span>
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-1 group-hover:text-accent transition-colors">
              {t.wnaTitle}
            </h3>
            <p className="text-[10px] sm:text-xs text-accent font-medium mb-2">
              {t.wnaSubtitle}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              {t.wnaDescription}
            </p>

            {/* Features */}
            <ul className="space-y-1.5 sm:space-y-2 mb-4">
              {t.wnaFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[10px] sm:text-xs text-foreground/80">
                  <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-accent group-hover:translate-x-1 transition-transform">
              {t.learnMore}
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InvestorPathSelector;
