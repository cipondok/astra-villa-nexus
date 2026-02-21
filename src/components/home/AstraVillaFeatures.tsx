import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Building2, Calculator, Landmark, Map, MapPin, TrendingUp, Ruler, BarChart3, LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  { icon: Building2, title: 'New Projects', description: 'The best investment opportunities' },
  { icon: Calculator, title: 'Construction Cost Calculator', description: 'Get construction cost estimate' },
  { icon: Landmark, title: 'Home Loan Calculator', description: 'Find affordable loan packages' },
  { icon: Map, title: 'Area Guides', description: 'Explore housing societies in Indonesia' },
  { icon: MapPin, title: 'Plot Finder', description: 'Find plots in any housing society' },
  { icon: TrendingUp, title: 'Property Index', description: 'Track changes in real estate prices' },
  { icon: Ruler, title: 'Area Unit Converter', description: 'Convert any area unit instantly' },
  { icon: BarChart3, title: 'Property Trends', description: 'Find popular areas to buy property' },
];

interface AstraVillaFeaturesProps {
  variant?: 'default' | 'hero';
}

const AstraVillaFeatures: React.FC<AstraVillaFeaturesProps> = ({ variant = 'default' }) => {
  const isHero = variant === 'hero';

  return (
    <div className={`rounded-xl md:rounded-2xl ${isHero ? 'p-0' : 'p-1.5 sm:p-2 md:p-3'}`}>
      {/* Section Header */}
      <div className={`flex items-center justify-center gap-2 ${isHero ? 'mb-2.5' : 'mb-2.5 sm:mb-3 md:mb-4'}`}>
        <div className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent to-gold-primary/30" />
        <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold-primary" />
        <h2 className={`font-bold uppercase tracking-widest ${
          isHero
            ? 'text-[10px] md:text-xs text-primary-foreground/80'
            : 'text-[9px] sm:text-xs md:text-sm text-primary-foreground/80'
        }`}>
          AI Tools & Features
        </h2>
        <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold-primary" />
        <div className="h-px w-6 sm:w-10 bg-gradient-to-l from-transparent to-gold-primary/30" />
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 md:gap-2.5">
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
    if (route) navigate(route);
  };

  return (
    <div onClick={handleClick} className="group cursor-pointer">
      <div className={`relative overflow-hidden rounded-xl h-full flex flex-col items-center text-center transition-all duration-300 active:scale-95 md:hover:scale-[1.04] md:hover:shadow-lg md:hover:shadow-primary/10 ${
        isHero
          ? 'border border-primary-foreground/10 hover:border-gold-primary/30 p-2.5 md:p-3 bg-primary-foreground/5 backdrop-blur-md'
          : 'border border-primary-foreground/10 hover:border-gold-primary/30 p-2.5 md:p-3 bg-primary-foreground/5 backdrop-blur-md'
      }`}>
        {/* Icon */}
        <div className="relative mb-1">
          <div className={`relative flex items-center justify-center rounded-xl bg-primary-foreground/8 ${
            isHero
              ? 'w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12'
              : 'w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14'
          }`}>
            <IconComponent className={`text-primary-foreground/80 group-hover:text-gold-primary transition-colors duration-300 ${
              isHero
                ? 'w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6'
                : 'w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7'
            }`} strokeWidth={1.5} />
          </div>
          {/* AI Badge */}
          <div className={`absolute -top-0.5 -right-0.5 rounded-full flex items-center justify-center bg-gradient-to-br from-gold-primary to-gold-primary/70 shadow-sm border-2 border-background ${
            isHero ? 'w-3.5 h-3.5 md:w-4 md:h-4' : 'w-4 h-4 md:w-5 md:h-5'
          }`}>
            <Sparkles className={`text-background ${isHero ? 'w-2 h-2' : 'w-2 h-2 md:w-2.5 md:h-2.5'}`} strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <h3 className={`leading-tight line-clamp-2 transition-colors duration-200 hidden md:block ${
          isHero
            ? 'mt-0.5 text-[8px] lg:text-[9px] font-medium text-primary-foreground/60 group-hover:text-gold-primary'
            : 'mt-1 text-[9px] lg:text-[11px] font-semibold text-primary-foreground/60 group-hover:text-gold-primary'
        }`}>
          {feature.title}
        </h3>
      </div>
    </div>
  );
};

export default AstraVillaFeatures;