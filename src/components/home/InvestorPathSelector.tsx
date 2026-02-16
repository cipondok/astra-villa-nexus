import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ArrowRight, Globe, Home, Sparkles, Bot, Shield, TrendingUp, Building2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface InvestorPathSelectorProps {
  variant?: 'default' | 'hero';
}

const InvestorPathSelector = ({ variant = 'default' }: InvestorPathSelectorProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const isHero = variant === 'hero';

  const copy = {
    en: {
      headline: "Global Investment Platform",
      subtitle: "Choose your investment pathway",
      wniTitle: "WNI Overseas",
      wniDesc: "Indonesian citizens abroad",
      wniFeatures: ["KPR Support", "Tax Benefits"],
      wnaTitle: "Foreign Investor",
      wnaDesc: "International investors",
      wnaFeatures: ["Right to Use", "Legal Support"],
      explore: "Explore"
    },
    id: {
      headline: "Platform Investasi Global",
      subtitle: "Pilih jalur investasi Anda",
      wniTitle: "WNI Luar Negeri",
      wniDesc: "Warga Indonesia di luar negeri",
      wniFeatures: ["Dukungan KPR", "Manfaat Pajak"],
      wnaTitle: "Investor Asing",
      wnaDesc: "Investor internasional",
      wnaFeatures: ["Hak Pakai", "Dukungan Hukum"],
      explore: "Jelajahi"
    }
  };

  const t = copy[language];

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const paths = [
    {
      id: 'wni',
      path: '/investor/wni',
      icon: Home,
      title: t.wniTitle,
      description: t.wniDesc,
      features: t.wniFeatures,
      flag: '🇮🇩',
      gradient: 'from-red-500 via-red-600 to-orange-500',
      accentColor: 'text-red-500 dark:text-red-400',
      bgColor: 'bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/30',
      borderColor: 'border-red-200/60 dark:border-red-500/30',
      hoverBorder: 'hover:border-red-400 dark:hover:border-red-400/60'
    },
    {
      id: 'wna',
      path: '/investor/wna',
      icon: Globe,
      title: t.wnaTitle,
      description: t.wnaDesc,
      features: t.wnaFeatures,
      flag: '🌍',
      gradient: 'from-blue-500 via-blue-600 to-indigo-500',
      accentColor: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/30',
      borderColor: 'border-blue-200/60 dark:border-blue-500/30',
      hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-400/60'
    }
  ];

  // Add central "All Investment Options" card for navigation to /foreign-investment
  const centralPath = {
    id: 'all',
    path: '/foreign-investment',
    icon: Building2,
    title: language === 'en' ? 'All Investment Options' : 'Semua Opsi Investasi',
    description: language === 'en' ? 'Complete investment guide' : 'Panduan investasi lengkap',
    features: language === 'en' ? ['WNI & WNA', 'Full Guide'] : ['WNI & WNA', 'Panduan Lengkap'],
    flag: '🏛️',
    gradient: 'from-primary via-primary/80 to-accent',
    accentColor: 'text-primary dark:text-primary',
    bgColor: 'bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20',
    borderColor: 'border-primary/30 dark:border-primary/40',
    hoverBorder: 'hover:border-primary dark:hover:border-primary/70'
  };

  // Hero variant - ultra compact inline style
  if (isHero) {
    return (
      <div className="rounded-xl">
        {/* Section Header with Platform Logo */}
        <div className="flex flex-col items-center gap-1.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-primary/80 to-accent shadow-lg">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                <Bot className="h-2 w-2 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h2 className="text-xs md:text-sm font-bold text-foreground dark:text-white">
                {t.headline}
              </h2>
              <p className="text-[8px] md:text-[9px] text-muted-foreground dark:text-white/60">
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Modern Cards */}
        <div className="flex items-stretch justify-center gap-2 md:gap-3 flex-wrap">
          {paths.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                onClick={() => handleCardClick(item.path)}
                className={cn(
                  "group relative flex flex-col items-center gap-2 px-3 md:px-4 py-2.5 md:py-3",
                  "rounded-xl cursor-pointer transition-all duration-300",
                  "bg-white/70 dark:bg-white/10 backdrop-blur-md",
                  "border-2", item.borderColor, item.hoverBorder,
                  "hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]",
                  "min-w-[110px] md:min-w-[140px]"
                )}
              >
                {/* Glow Effect */}
                <div className={cn(
                  "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  `bg-gradient-to-br ${item.gradient} blur-xl -z-10`
                )} style={{ transform: 'scale(0.8)', opacity: 0.15 }} />

                {/* Icon with Flag */}
                <div className="relative">
                  <div className={cn(
                    "flex items-center justify-center",
                    "w-10 h-10 md:w-12 md:h-12 rounded-xl",
                    item.bgColor,
                    "shadow-sm group-hover:shadow-md transition-shadow"
                  )}>
                    <IconComponent className={cn("w-5 h-5 md:w-6 md:h-6", item.accentColor)} strokeWidth={1.5} />
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-sm md:text-base drop-shadow-sm">{item.flag}</span>
                </div>

                {/* Text Content */}
                <div className="text-center">
                  <h3 className="text-[10px] md:text-xs font-bold text-foreground dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-[7px] md:text-[8px] text-muted-foreground dark:text-white/60 mt-0.5">
                    {item.description}
                  </p>
                </div>

                {/* Features Pills */}
                <div className="flex flex-wrap justify-center gap-0.5">
                  {item.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-[6px] md:text-[7px] font-medium",
                        "bg-background/60 dark:bg-white/10",
                        item.accentColor
                      )}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* AI Badge */}
                <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1 py-0.5 bg-gradient-to-r from-primary to-accent rounded-full text-[6px] text-white font-bold shadow-lg">
                  <Sparkles className="w-2 h-2" />
                  AI
                </div>
              </motion.button>
            );
          })}

          {/* Central "All Options" Card */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            onClick={() => handleCardClick(centralPath.path)}
            className={cn(
              "group relative flex flex-col items-center gap-2 px-3 md:px-4 py-2.5 md:py-3",
              "rounded-xl cursor-pointer transition-all duration-300",
              "bg-white/70 dark:bg-white/10 backdrop-blur-md",
              "border-2", centralPath.borderColor, centralPath.hoverBorder,
              "hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]",
              "min-w-[110px] md:min-w-[140px]"
            )}
          >
            {/* Glow Effect */}
            <div className={cn(
              "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              `bg-gradient-to-br ${centralPath.gradient} blur-xl -z-10`
            )} style={{ transform: 'scale(0.8)', opacity: 0.15 }} />

            {/* Icon with Flag */}
            <div className="relative">
              <div className={cn(
                "flex items-center justify-center",
                "w-10 h-10 md:w-12 md:h-12 rounded-xl",
                centralPath.bgColor,
                "shadow-sm group-hover:shadow-md transition-shadow"
              )}>
                <Building2 className={cn("w-5 h-5 md:w-6 md:h-6", centralPath.accentColor)} strokeWidth={1.5} />
              </div>
              <span className="absolute -bottom-1 -right-1 text-sm md:text-base drop-shadow-sm">{centralPath.flag}</span>
            </div>

            {/* Text Content */}
            <div className="text-center">
              <h3 className="text-[10px] md:text-xs font-bold text-foreground dark:text-white">
                {centralPath.title}
              </h3>
              <p className="text-[7px] md:text-[8px] text-muted-foreground dark:text-white/60 mt-0.5">
                {centralPath.description}
              </p>
            </div>

            {/* Features Pills */}
            <div className="flex flex-wrap justify-center gap-0.5">
              {centralPath.features.map((feature, idx) => (
                <span 
                  key={idx}
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[6px] md:text-[7px] font-medium",
                    "bg-background/60 dark:bg-white/10",
                    centralPath.accentColor
                  )}
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Guide Badge */}
            <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1 py-0.5 bg-gradient-to-r from-primary to-accent rounded-full text-[6px] text-white font-bold shadow-lg">
              <Globe className="w-2 h-2" />
              Guide
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  // Default variant - modern card style
  return (
    <section className="py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section Header with Platform Logo */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent shadow-xl">
                <Building2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                <Bot className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h2 className="text-sm md:text-base font-bold text-foreground dark:text-white flex items-center gap-1.5">
                {t.headline}
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              </h2>
              <p className="text-[9px] md:text-[10px] text-muted-foreground dark:text-white/60">
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Modern Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {paths.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                onClick={() => handleCardClick(item.path)}
                className={cn(
                  "group relative overflow-hidden rounded-xl cursor-pointer",
                  "border border-white/20",
                  "bg-gradient-to-br from-white/10 via-white/5 to-transparent",
                  "backdrop-blur-xl shadow-lg shadow-black/5",
                  "transition-all duration-300 hover:shadow-xl hover:shadow-primary/10",
                  "hover:border-white/30 hover:from-white/15 hover:via-white/10",
                  "p-3 sm:p-4 active:scale-[0.98]",
                  "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-tr before:from-primary/10 before:via-transparent before:to-accent/10 before:opacity-60",
                  "after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-bl after:from-rose-500/5 after:via-transparent after:to-cyan-500/8 after:opacity-50"
                )}
              >
                
                {/* Header Row */}
                <div className="relative flex items-start gap-3 mb-3">
                  <div className={cn(
                    "flex items-center justify-center",
                    "w-12 h-12 sm:w-14 sm:h-14 rounded-xl",
                    "transition-all group-hover:scale-105"
                  )}>
                    <IconComponent className={cn("w-6 h-6 sm:w-7 sm:h-7", item.accentColor)} strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-lg">{item.flag}</span>
                      <Shield className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-foreground dark:text-white group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground dark:text-white/60">
                      {item.description}
                    </p>
                  </div>
                  
                  {/* AI Badge */}
                  <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-primary to-accent rounded-full text-[7px] text-white font-bold shadow-lg">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-medium",
                        "border border-border/30",
                        item.accentColor
                      )}
                    >
                      ✓ {feature}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className={cn(
                  "flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold",
                  item.accentColor,
                  "group-hover:gap-2 transition-all"
                )}>
                  <Users className="h-3 w-3" />
                  {t.explore}
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InvestorPathSelector;
