import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowRight, Globe, Home, Sparkles, Bot, Shield, TrendingUp, Building2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';

interface Path {
  id: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  features: string[];
  flag: string;
  gradient: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  hoverBorder: string;
}

interface InvestorPathSelectorProps {
  variant?: 'default' | 'hero';
}

const InvestorPathSelector = ({ variant = 'default' }: InvestorPathSelectorProps) => {
  const navigate = useNavigate();
  const { t, tArray } = useTranslation();

  const isHero = variant === 'hero';

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const paths: Path[] = [
    {
      id: 'wni',
      path: '/investment?section=wni',
      icon: Home,
      title: t('investor.wniTitle'),
      description: t('investor.wniDesc'),
      features: tArray('investor.wniFeatures'),
      flag: '🇮🇩',
      gradient: 'from-destructive via-destructive/80 to-chart-3',
      accentColor: 'text-destructive',
      bgColor: 'bg-gradient-to-br from-destructive/30 to-chart-3/20',
      borderColor: 'border-destructive/30',
      hoverBorder: 'hover:border-destructive/60'
    },
    {
      id: 'wna',
      path: '/investment?section=wna',
      icon: Globe,
      title: t('investor.wnaTitle'),
      description: t('investor.wnaDesc'),
      features: tArray('investor.wnaFeatures'),
      flag: '🌍',
      gradient: 'from-chart-4 via-chart-4/80 to-accent',
      accentColor: 'text-chart-4',
      bgColor: 'bg-gradient-to-br from-chart-4/30 to-accent/20',
      borderColor: 'border-chart-4/30',
      hoverBorder: 'hover:border-chart-4/60'
    }
  ];

  const centralPath: Path = {
    id: 'all',
    path: '/investment',
    icon: Building2,
    title: t('investor.allOptions'),
    description: t('investor.allOptionsDesc'),
    features: tArray('investor.allOptionsFeatures'),
    flag: '🏛️',
    gradient: 'from-primary via-primary/80 to-accent',
    accentColor: 'text-primary dark:text-primary',
    bgColor: 'bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20',
    borderColor: 'border-primary/30 dark:border-primary/40',
    hoverBorder: 'hover:border-primary dark:hover:border-primary/70'
  };

  // Hero variant
  if (isHero) {
    return (
      <div className="rounded-xl">
        <div className="flex flex-col items-center gap-1.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-primary/80 to-accent shadow-lg">
                <Building2 className="h-4 w-4 text-background" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-r from-chart-1 to-chart-1/80 flex items-center justify-center">
                <Bot className="h-2 w-2 text-background" />
              </div>
            </div>
            <div className="text-left">
              <h2 className="text-xs md:text-sm font-bold text-foreground">
                {t('investor.headline')}
              </h2>
              <p className="text-[8px] md:text-[9px] text-muted-foreground">
                {t('investor.subtitle')}
              </p>
            </div>
          </div>
        </div>

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
                  "bg-card/70 dark:bg-muted/10 backdrop-blur-md",
                  "border-2", item.borderColor, item.hoverBorder,
                  "hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]",
                  "min-w-[110px] md:min-w-[140px]"
                )}
              >
                <div className={cn(
                  "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  `bg-gradient-to-br ${item.gradient} blur-xl -z-10`
                )} style={{ transform: 'scale(0.8)', opacity: 0.15 }} />

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

                <div className="text-center">
                  <h3 className="text-[10px] md:text-xs font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-[7px] md:text-[8px] text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-0.5">
                  {item.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-[6px] md:text-[7px] font-medium",
                        "bg-muted/50",
                        item.accentColor
                      )}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1 py-0.5 bg-gradient-to-r from-primary to-accent rounded-full text-[6px] text-background font-bold shadow-lg">
                  <Sparkles className="w-2 h-2" />
                  AI
                </div>
              </motion.button>
            );
          })}

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            onClick={() => handleCardClick(centralPath.path)}
            className={cn(
              "group relative flex flex-col items-center gap-2 px-3 md:px-4 py-2.5 md:py-3",
              "rounded-xl cursor-pointer transition-all duration-300",
              "bg-card/70 dark:bg-muted/10 backdrop-blur-md",
              "border-2", centralPath.borderColor, centralPath.hoverBorder,
              "hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]",
              "min-w-[110px] md:min-w-[140px]"
            )}
          >
            <div className={cn(
              "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              `bg-gradient-to-br ${centralPath.gradient} blur-xl -z-10`
            )} style={{ transform: 'scale(0.8)', opacity: 0.15 }} />

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

            <div className="text-center">
              <h3 className="text-[10px] md:text-xs font-bold text-foreground">
                {centralPath.title}
              </h3>
              <p className="text-[7px] md:text-[8px] text-muted-foreground mt-0.5">
                {centralPath.description}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-0.5">
              {centralPath.features.map((feature, idx) => (
                <span 
                  key={idx}
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[6px] md:text-[7px] font-medium",
                    "bg-muted/50",
                    centralPath.accentColor
                  )}
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1 py-0.5 bg-gradient-to-r from-primary to-accent rounded-full text-[6px] text-background font-bold shadow-lg">
              <Globe className="w-2 h-2" />
              Guide
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <section className="py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent shadow-xl">
                <Building2 className="h-5 w-5 md:h-6 md:w-6 text-background" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-chart-1 to-chart-1/80 flex items-center justify-center shadow-md">
                <Bot className="h-2.5 w-2.5 text-background" />
              </div>
            </div>
            <div className="text-left">
              <h2 className="text-sm md:text-base font-bold text-foreground flex items-center gap-1.5">
                {t('investor.headline')}
                <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
              </h2>
              <p className="text-[9px] md:text-[10px] text-muted-foreground">
                {t('investor.subtitle')}
              </p>
            </div>
          </div>
        </div>

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
                  "border border-border/50",
                  "bg-card/80 backdrop-blur-xl shadow-lg shadow-black/5",
                  "transition-all duration-300 hover:shadow-xl hover:shadow-primary/10",
                  "hover:border-border",
                  "p-3 sm:p-4 active:scale-[0.98]"
                )}
              >
                
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
                      <Shield className="h-3.5 w-3.5 text-chart-1" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-gold-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  
                  <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-primary to-accent rounded-full text-[7px] text-background font-bold shadow-lg">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-medium",
                        "border border-border/50",
                        item.accentColor
                      )}
                    >
                      ✓ {feature}
                    </span>
                  ))}
                </div>

                <div className={cn(
                  "flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold",
                  item.accentColor,
                  "group-hover:gap-2 transition-all"
                )}>
                  <Users className="h-3 w-3" />
                  {t('investor.explore')}
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
