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
  color: 'text-blue-600 dark:text-blue-400',
  iconBg: 'bg-blue-100 dark:bg-blue-900/50'
}, {
  icon: Calculator,
  title: 'Construction Cost Calculator',
  description: 'Get construction cost estimate',
  color: 'text-cyan-600 dark:text-cyan-400',
  iconBg: 'bg-cyan-100 dark:bg-cyan-900/50'
}, {
  icon: Landmark,
  title: 'Home Loan Calculator',
  description: 'Find affordable loan packages',
  color: 'text-emerald-600 dark:text-emerald-400',
  iconBg: 'bg-emerald-100 dark:bg-emerald-900/50'
}, {
  icon: Map,
  title: 'Area Guides',
  description: 'Explore housing societies in Indonesia',
  color: 'text-pink-600 dark:text-pink-400',
  iconBg: 'bg-pink-100 dark:bg-pink-900/50'
}, {
  icon: MapPin,
  title: 'Plot Finder',
  description: 'Find plots in any housing society',
  color: 'text-teal-600 dark:text-teal-400',
  iconBg: 'bg-teal-100 dark:bg-teal-900/50'
}, {
  icon: TrendingUp,
  title: 'Property Index',
  description: 'Track changes in real estate prices',
  color: 'text-purple-600 dark:text-purple-400',
  iconBg: 'bg-purple-100 dark:bg-purple-900/50'
}, {
  icon: Ruler,
  title: 'Area Unit Converter',
  description: 'Convert any area unit instantly',
  color: 'text-amber-600 dark:text-amber-400',
  iconBg: 'bg-amber-100 dark:bg-amber-900/50'
}, {
  icon: BarChart3,
  title: 'Property Trends',
  description: 'Find popular areas to buy property',
  color: 'text-violet-600 dark:text-violet-400',
  iconBg: 'bg-violet-100 dark:bg-violet-900/50'
}];

const AstraVillaFeatures = () => {
  return (
    <div className="rounded-xl md:rounded-2xl p-1.5 sm:p-2 md:p-3">
      {/* Section Header - Compact */}
      <div className="mb-2 sm:mb-2.5 md:mb-3 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2">
        <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" />
        <h2 className="text-[9px] sm:text-xs md:text-sm font-bold text-foreground">
          AI Tools & Features
        </h2>
      </div>

      {/* Features Grid - 4 columns */}
      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} />
        ))}
      </div>
    </div>
  );
};

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, index }) => {
  const navigate = useNavigate();
  const IconComponent = feature.icon;
  
  const handleClick = () => {
    const routes: Record<string, string> = {
      'New Projects': '/new-projects',
      'Construction Cost Calculator': '/calculators/construction',
      'Home Loan Calculator': '/calculators/loan',
      'Area Guides': '/areas',
      'Plot Finder': '/search?property_type=land',
      'Property Index': '/analytics',
      'Area Unit Converter': '/calculators/area',
      'Property Trends': '/analytics'
    };
    const route = routes[feature.title];
    if (route) {
      navigate(route);
    }
  };

  return (
    <div onClick={handleClick} className="group cursor-pointer relative">
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-transparent dark:bg-white/5 border border-border/20 dark:border-white/10 p-2 sm:p-2.5 md:p-3 h-full flex flex-col items-center text-center transition-all duration-300 hover:border-primary/40 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/10">
        {/* Icon Container */}
        <div className="relative">
          <div className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center rounded-xl ${feature.iconBg} shadow-sm`}>
            <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${feature.color}`} strokeWidth={1.5} />
          </div>
          {/* AI Badge */}
          <div className="absolute -top-1 -right-1 w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 shadow-md border-2 border-background">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-1.5 sm:mt-2 text-[7px] sm:text-[9px] md:text-[11px] font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {feature.title}
        </h3>
      </div>
    </div>
  );
};

export default AstraVillaFeatures;