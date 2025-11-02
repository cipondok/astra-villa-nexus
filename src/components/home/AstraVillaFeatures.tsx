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

const features: Feature[] = [
  {
    icon: newProjectsIcon,
    title: 'New Projects',
    description: 'The best investment opportunities',
    color: 'from-blue-400 to-blue-600',
    bgGradient: 'bg-blue-50 dark:bg-blue-950/30'
  },
  {
    icon: constructionCalcIcon,
    title: 'Construction Cost Calculator',
    description: 'Get construction cost estimate',
    color: 'from-cyan-400 to-cyan-600',
    bgGradient: 'bg-cyan-50 dark:bg-cyan-950/30'
  },
  {
    icon: homeLoanIcon,
    title: 'Home Loan Calculator',
    description: 'Find affordable loan packages',
    color: 'from-emerald-400 to-emerald-600',
    bgGradient: 'bg-emerald-50 dark:bg-emerald-950/30'
  },
  {
    icon: areaGuidesIcon,
    title: 'Area Guides',
    description: 'Explore housing societies in Indonesia',
    color: 'from-pink-400 to-pink-600',
    bgGradient: 'bg-pink-50 dark:bg-pink-950/30'
  },
  {
    icon: plotFinderIcon,
    title: 'Plot Finder',
    description: 'Find plots in any housing society',
    color: 'from-teal-400 to-teal-600',
    bgGradient: 'bg-teal-50 dark:bg-teal-950/30'
  },
  {
    icon: propertyIndexIcon,
    title: 'Property Index',
    description: 'Track changes in real estate prices',
    color: 'from-purple-400 to-purple-600',
    bgGradient: 'bg-purple-50 dark:bg-purple-950/30'
  },
  {
    icon: areaConverterIcon,
    title: 'Area Unit Converter',
    description: 'Convert any area unit instantly',
    color: 'from-amber-400 to-amber-600',
    bgGradient: 'bg-amber-50 dark:bg-amber-950/30'
  },
  {
    icon: propertyTrendsIcon,
    title: 'Property Trends',
    description: 'Find popular areas to buy property',
    color: 'from-violet-400 to-violet-600',
    bgGradient: 'bg-violet-50 dark:bg-violet-950/30'
  }
];

const AstraVillaFeatures = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Section Header */}
      <div className="mb-3 md:mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 md:gap-2 mb-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 border border-blue-200/30 dark:border-blue-700/30">
          <Sparkles className="h-3.5 w-3.5 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            AI-Powered Tools & Features
          </h2>
        </div>
        <p className="text-[10px] md:text-sm text-muted-foreground mt-1 md:mt-2">
          Smart Property Solutions for Indonesia
        </p>
      </div>

      {/* Features Grid - 3 columns mobile/tablet, 4 on desktop */}
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
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
    // Route to different pages based on feature
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
    <div
      onClick={handleClick}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 p-2 md:p-4 lg:p-5 h-full flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/30">
        {/* Icon Container */}
        <div className="relative mb-2 md:mb-3 lg:mb-4">
          <div className={`relative w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl ${feature.bgGradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
            <img 
              src={feature.icon} 
              alt={feature.title}
              className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          {/* AI Badge */}
          <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 shadow-md">
            <Sparkles className="w-2 h-2 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 text-white" strokeWidth={2.5} />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-[10px] md:text-sm lg:text-base font-semibold text-foreground mb-1 md:mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2">
            {feature.title}
          </h3>
          <p className="text-[8px] md:text-xs text-muted-foreground line-clamp-2 hidden md:block">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AstraVillaFeatures;
