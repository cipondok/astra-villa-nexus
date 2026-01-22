import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ArrowRight, Globe, Home, Sparkles, Bot, Shield, TrendingUp } from 'lucide-react';
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
      wniTitle: "WNI Overseas",
      wniDesc: "Indonesian citizens abroad",
      wnaTitle: "Foreign Investor",
      wnaDesc: "International investors",
      explore: "Explore"
    },
    id: {
      headline: "Platform Investasi Global",
      wniTitle: "WNI Luar Negeri",
      wniDesc: "Warga Indonesia di luar negeri",
      wnaTitle: "Investor Asing",
      wnaDesc: "Investor internasional",
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
      flag: '🇮🇩',
      gradient: 'from-red-500 to-red-600',
      accentColor: 'text-red-500 dark:text-red-400',
      bgColor: 'bg-red-100/80 dark:bg-red-900/30'
    },
    {
      id: 'wna',
      path: '/investor/wna',
      icon: Globe,
      title: t.wnaTitle,
      description: t.wnaDesc,
      flag: '🌍',
      gradient: 'from-blue-500 to-blue-600',
      accentColor: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-blue-100/80 dark:bg-blue-900/30'
    }
  ];

  // Hero variant - ultra compact inline style
  if (isHero) {
    return (
      <div className="rounded-xl">
        {/* Section Header - Matches AI Tools & Features style */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 mb-2">
          <Bot className="h-3 w-3 text-primary drop-shadow-sm dark:text-yellow-400" />
          <h2 className="text-[10px] md:text-xs font-bold text-foreground drop-shadow-sm dark:text-white/90 dark:drop-shadow-md">
            {t.headline}
          </h2>
          <TrendingUp className="h-3 w-3 text-primary drop-shadow-sm dark:text-yellow-400" />
        </div>

        {/* Two Cards Side by Side */}
        <div className="flex items-center justify-center gap-2 md:gap-3">
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
                  "group relative flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5",
                  "rounded-lg cursor-pointer transition-all duration-300",
                  "bg-background/40 dark:bg-white/10 backdrop-blur-sm",
                  "border border-border/30 dark:border-white/20",
                  "hover:bg-background/60 dark:hover:bg-white/20",
                  "hover:border-primary/40 dark:hover:border-white/40",
                  "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                {/* Icon with Flag */}
                <div className="relative flex-shrink-0">
                  <div className={cn(
                    "flex items-center justify-center",
                    "w-8 h-8 md:w-10 md:h-10 rounded-lg",
                    item.bgColor
                  )}>
                    <IconComponent className={cn("w-4 h-4 md:w-5 md:h-5", item.accentColor)} strokeWidth={1.5} />
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-[10px] md:text-xs">{item.flag}</span>
                </div>

                {/* Text Content */}
                <div className="text-left min-w-0">
                  <h3 className="text-[9px] md:text-[11px] font-semibold text-foreground/90 dark:text-white/90 truncate">
                    {item.title}
                  </h3>
                  <p className="text-[7px] md:text-[9px] text-foreground/60 dark:text-white/60 truncate hidden sm:block">
                    {item.description}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 text-foreground/40 dark:text-white/40 group-hover:text-primary dark:group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />

                {/* AI Badge */}
                <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1 py-0.5 bg-gradient-to-r from-primary/90 to-accent/90 rounded text-[6px] text-white font-medium shadow-sm">
                  <Sparkles className="w-2 h-2" />
                  AI
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant - compact card style
  return (
    <section className="py-3 sm:py-4 px-2 sm:px-3">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <Bot className="h-3.5 w-3.5 text-primary" />
          <h2 className="text-xs sm:text-sm font-bold text-foreground">
            {t.headline}
          </h2>
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
                  "group relative overflow-hidden rounded-lg cursor-pointer",
                  "bg-card/50 dark:bg-white/5 backdrop-blur-sm",
                  "border-2 border-border/50 hover:border-primary/40",
                  "shadow-sm hover:shadow-md transition-all duration-300",
                  "p-2.5 sm:p-3 active:scale-[0.98]"
                )}
              >
                {/* AI Glow Effect */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Header Row */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={cn(
                    "flex items-center justify-center",
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-lg",
                    item.bgColor
                  )}>
                    <IconComponent className={cn("w-4 h-4 sm:w-4.5 sm:h-4.5", item.accentColor)} strokeWidth={1.5} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{item.flag}</span>
                    <Shield className="h-3 w-3 text-green-500" />
                  </div>
                  
                  {/* AI Badge */}
                  <div className="ml-auto flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-primary/80 to-accent/80 rounded text-[7px] text-white font-medium">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI Powered
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-[11px] sm:text-xs font-semibold text-foreground mb-0.5 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1 mb-2">
                  {item.description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                  {t.explore}
                  <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
