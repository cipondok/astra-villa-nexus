import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

// Import custom web icons
import newProjectsIcon from '@/assets/icons/new-projects-icon.png';
import constructionCalcIcon from '@/assets/icons/construction-calc-icon.png';
import homeLoanIcon from '@/assets/icons/home-loan-icon.png';
import areaGuidesIcon from '@/assets/icons/area-guides-icon.png';
import plotFinderIcon from '@/assets/icons/plot-finder-icon.png';
import propertyIndexIcon from '@/assets/icons/property-index-icon.png';
import areaConverterIcon from '@/assets/icons/area-converter-icon.png';
import propertyTrendsIcon from '@/assets/icons/property-trends-icon.png';
interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
  bgGradient: string;
}
const features: Feature[] = [{
  icon: newProjectsIcon,
  title: 'New Projects',
  description: 'The best investment opportunities',
  color: 'from-blue-400 to-blue-600',
  bgGradient: 'bg-blue-50 dark:bg-blue-950/30'
}, {
  icon: constructionCalcIcon,
  title: 'Construction Cost Calculator',
  description: 'Get construction cost estimate',
  color: 'from-cyan-400 to-cyan-600',
  bgGradient: 'bg-cyan-50 dark:bg-cyan-950/30'
}, {
  icon: homeLoanIcon,
  title: 'Home Loan Calculator',
  description: 'Find affordable loan packages',
  color: 'from-emerald-400 to-emerald-600',
  bgGradient: 'bg-emerald-50 dark:bg-emerald-950/30'
}, {
  icon: areaGuidesIcon,
  title: 'Area Guides',
  description: 'Explore housing societies in Indonesia',
  color: 'from-pink-400 to-pink-600',
  bgGradient: 'bg-pink-50 dark:bg-pink-950/30'
}, {
  icon: plotFinderIcon,
  title: 'Plot Finder',
  description: 'Find plots in any housing society',
  color: 'from-teal-400 to-teal-600',
  bgGradient: 'bg-teal-50 dark:bg-teal-950/30'
}, {
  icon: propertyIndexIcon,
  title: 'Property Index',
  description: 'Track changes in real estate prices',
  color: 'from-purple-400 to-purple-600',
  bgGradient: 'bg-purple-50 dark:bg-purple-950/30'
}, {
  icon: areaConverterIcon,
  title: 'Area Unit Converter',
  description: 'Convert any area unit instantly',
  color: 'from-amber-400 to-amber-600',
  bgGradient: 'bg-amber-50 dark:bg-amber-950/30'
}, {
  icon: propertyTrendsIcon,
  title: 'Property Trends',
  description: 'Find popular areas to buy property',
  color: 'from-violet-400 to-violet-600',
  bgGradient: 'bg-violet-50 dark:bg-violet-950/30'
}];
const AstraVillaFeatures = () => {
  return (
    <div className="rounded-xl md:rounded-2xl p-1.5 sm:p-2 md:p-3">
      {/* Section Header - Compact */}
      <div className="mb-1 sm:mb-1.5 md:mb-2 flex items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5">
        <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 text-primary" />
        <h2 className="text-[7px] sm:text-[10px] md:text-xs font-semibold text-foreground">
          AI Tools & Features
        </h2>
      </div>

      {/* Features Grid - 4 columns */}
      <div className="grid grid-cols-4 gap-1 md:gap-1.5">
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
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/15 dark:to-primary/10 border border-primary/20 dark:border-primary/30 p-2 sm:p-2 md:p-2.5 h-full flex flex-col items-center text-center transition-all duration-300 hover:from-primary/10 hover:via-primary/15 hover:to-primary/10 dark:hover:from-primary/15 dark:hover:via-primary/20 dark:hover:to-primary/15 hover:scale-[1.03] hover:shadow-md hover:shadow-primary/10">
        {/* Icon Container - Clean white background */}
        <div className="relative">
          <div className="relative w-12 h-12 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl bg-white dark:bg-white shadow-sm border border-primary/10">
            <img
              src={feature.icon}
              alt={feature.title}
              className="w-8 h-8 sm:w-7 sm:h-7 md:w-8 md:h-8 object-contain"
              style={{ imageRendering: 'crisp-edges' }}
              loading="eager"
            />
          </div>
          {/* AI Badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 shadow-sm border-2 border-white dark:border-white">
            <Sparkles className="w-2.5 h-2.5 sm:w-2 sm:h-2 md:w-2 md:h-2 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title - Hidden on mobile, visible on tablet+ */}
        <h3 className="hidden sm:block mt-1 text-[8px] md:text-[10px] font-semibold text-primary/80 dark:text-primary leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {feature.title}
        </h3>
      </div>
      
      {/* Mobile Tooltip - Shows on hover/touch */}
      <div className="sm:hidden absolute left-1/2 -translate-x-1/2 -bottom-8 z-50 opacity-0 group-hover:opacity-100 group-active:opacity-100 pointer-events-none transition-opacity duration-200">
        <div className="bg-primary text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg">
          {feature.title}
        </div>
      </div>
    </div>
  );
};

export default AstraVillaFeatures;