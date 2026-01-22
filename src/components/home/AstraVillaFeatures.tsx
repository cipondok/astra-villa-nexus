import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Building2, Calculator, Landmark, Map, MapPin, TrendingUp, Ruler, BarChart3, LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  iconBg: string;
}

const features: Feature[] = [{
  icon: Building2,
  title: 'New Projects',
  description: 'The best investment opportunities',
  color: 'text-blue-700 dark:text-blue-400',
  iconBg: 'bg-blue-200/80 dark:bg-blue-900/50'
}, {
  icon: Calculator,
  title: 'Construction Cost Calculator',
  description: 'Get construction cost estimate',
  color: 'text-cyan-700 dark:text-cyan-400',
  iconBg: 'bg-cyan-200/80 dark:bg-cyan-900/50'
}, {
  icon: Landmark,
  title: 'Home Loan Calculator',
  description: 'Find affordable loan packages',
  color: 'text-emerald-700 dark:text-emerald-400',
  iconBg: 'bg-emerald-200/80 dark:bg-emerald-900/50'
}, {
  icon: Map,
  title: 'Area Guides',
  description: 'Explore housing societies in Indonesia',
  color: 'text-pink-700 dark:text-pink-400',
  iconBg: 'bg-pink-200/80 dark:bg-pink-900/50'
}, {
  icon: MapPin,
  title: 'Plot Finder',
  description: 'Find plots in any housing society',
  color: 'text-teal-700 dark:text-teal-400',
  iconBg: 'bg-teal-200/80 dark:bg-teal-900/50'
}, {
  icon: TrendingUp,
  title: 'Property Index',
  description: 'Track changes in real estate prices',
  color: 'text-purple-700 dark:text-purple-400',
  iconBg: 'bg-purple-200/80 dark:bg-purple-900/50'
}, {
  icon: Ruler,
  title: 'Area Unit Converter',
  description: 'Convert any area unit instantly',
  color: 'text-amber-700 dark:text-amber-400',
  iconBg: 'bg-amber-200/80 dark:bg-amber-900/50'
}, {
  icon: BarChart3,
  title: 'Property Trends',
  description: 'Find popular areas to buy property',
  color: 'text-violet-700 dark:text-violet-400',
  iconBg: 'bg-violet-200/80 dark:bg-violet-900/50'
}];

interface AstraVillaFeaturesProps {
  variant?: 'default' | 'hero';
}

const AstraVillaFeatures: React.FC<AstraVillaFeaturesProps> = ({ variant = 'default' }) => {
  const isHero = variant === 'hero';
  
  return (
    <div className={`rounded-xl md:rounded-2xl ${isHero ? 'p-0' : 'p-1.5 sm:p-2 md:p-3'}`}>
      {/* Section Header - Compact */}
      <div className={`flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 ${isHero ? 'mb-2' : 'mb-2 sm:mb-2.5 md:mb-3'}`}>
        <Sparkles className={`${isHero ? 'h-3 w-3 text-yellow-400' : 'h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary'}`} />
        <h2 className={`font-bold ${isHero ? 'text-[10px] md:text-xs text-white/90 drop-shadow-md' : 'text-[9px] sm:text-xs md:text-sm text-foreground'}`}>
          AI Tools & Features
        </h2>
        <Sparkles className={`${isHero ? 'h-3 w-3 text-yellow-400' : 'h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary'}`} />
      </div>

      {/* Features Grid - 8 columns on desktop for hero, 4 columns default */}
      <div className={`grid gap-1.5 md:gap-2 ${isHero ? 'grid-cols-4 lg:grid-cols-8' : 'grid-cols-4'}`}>
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} variant={variant} />
        ))}
      </div>
    </div>
  );
};

interface FeatureCardProps {
  feature: Feature;
  index: number;
  variant?: 'default' | 'hero';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, index, variant = 'default' }) => {
  const navigate = useNavigate();
  const IconComponent = feature.icon;
  const isHero = variant === 'hero';
  
  const handleClick = () => {
    const routes: Record<string, string> = {
      'New Projects': '/new-projects',
      'Construction Cost Calculator': '/calculators/construction',
      'Home Loan Calculator': '/calculators/loan',
      'Area Guides': '/areas',
      'Plot Finder': '/search?property_type=land',
      'Property Index': '/analytics?tab=overview',
      'Area Unit Converter': '/calculators/area',
      'Property Trends': '/analytics?tab=trends'
    };
    const route = routes[feature.title];
    if (route) {
      navigate(route);
    }
  };

  return (
    <div onClick={handleClick} className="group cursor-pointer relative">
      <div className={`relative overflow-hidden rounded-lg md:rounded-xl h-full flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.03] ${
        isHero 
          ? 'bg-white/10 dark:bg-white/5 border border-white/20 hover:border-white/40 hover:bg-white/20 backdrop-blur-sm p-1.5 md:p-2' 
          : 'bg-transparent dark:bg-white/5 border border-border/20 dark:border-white/10 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 p-2 sm:p-2.5 md:p-3'
      }`}>
        {/* Icon Container */}
        <div className="relative">
          <div className={`relative flex items-center justify-center rounded-lg shadow-sm ${
            isHero 
              ? 'w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white/20' 
              : `w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${feature.iconBg}`
          }`}>
            <IconComponent className={`${
              isHero 
                ? 'w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white' 
                : `w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${feature.color}`
            }`} strokeWidth={1.5} />
          </div>
          {/* AI Badge */}
          <div className={`absolute -top-0.5 -right-0.5 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 shadow-md border-2 border-background ${
            isHero ? 'w-3 h-3 md:w-4 md:h-4' : 'w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6'
          }`}>
            <Sparkles className={`text-primary-foreground ${isHero ? 'w-1.5 h-1.5 md:w-2 md:h-2' : 'w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5'}`} strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <h3 className={`leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200 ${
          isHero 
            ? 'mt-1 text-[6px] md:text-[8px] lg:text-[9px] font-medium text-white/90' 
            : 'mt-1.5 sm:mt-2 text-[7px] sm:text-[9px] md:text-[11px] font-semibold text-foreground'
        }`}>
          {feature.title}
        </h3>
      </div>
    </div>
  );
};

export default AstraVillaFeatures;