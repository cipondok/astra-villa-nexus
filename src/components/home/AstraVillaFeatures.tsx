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
    <div className="relative bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-2xl p-3 md:p-4 overflow-hidden">
      {/* Section Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
            AI-Powered Tools & Features
          </h2>
        </div>
        <p className="text-xs text-muted-foreground pl-9">
          Smart Property Solutions for Indonesia
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-3">
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
      className="cursor-pointer group"
    >
      <div className="relative overflow-hidden rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 flex h-[100px]">
        {/* Icon - Left Side */}
        <div className="relative w-[90px] flex-shrink-0 flex items-center justify-center">
          <div className="relative w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-background to-accent/10 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <img 
              src={feature.icon} 
              alt={feature.title}
              className="w-8 h-8 object-contain"
            />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5 dark:to-white/5" />
        </div>
        
        {/* Content - Right Side */}
        <div className="flex-1 p-2.5 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {feature.title}
          </h3>
          <p className="text-[10px] text-muted-foreground line-clamp-2">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AstraVillaFeatures;
