import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Sparkles,
  Globe
} from 'lucide-react';

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
    <section className="w-full py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-400/10">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400 relative z-10" strokeWidth={2.5} />
              <div className="absolute inset-0 bg-blue-500/30 dark:bg-blue-400/30 rounded-full animate-pulse"></div>
            </div>
            <Sparkles className="w-6 h-6 text-amber-500 dark:text-amber-400 animate-pulse" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            AI-Powered Tools & Features
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Smart Property Solutions for Indonesia
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
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
      className={cn(
        'group relative overflow-hidden rounded-lg transition-all duration-300 cursor-pointer',
        'bg-gradient-to-br from-background to-accent/5',
        'border border-border/50 dark:border-border',
        'shadow-sm hover:shadow-lg hover:border-primary/30',
        'hover:-translate-y-1 hover:scale-[1.02]',
        'animate-fade-in'
      )}
      style={{
        animationDelay: `${index * 0.05}s`
      }}
    >
      {/* Gradient Overlay on Hover */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        'bg-gradient-to-br',
        feature.color
      )} 
        style={{ opacity: 0.05 }}
      />

      {/* Card Content */}
      <div className="relative p-3 md:p-4 h-full flex flex-col">
        {/* Icon Container with AI Badge */}
        <div className="relative mb-2 md:mb-3">
          <div className={cn(
            'w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center overflow-hidden',
            'transition-all duration-300 group-hover:scale-110',
            feature.bgGradient
          )}>
            <img 
              src={feature.icon} 
              alt={feature.title}
              className="w-6 h-6 md:w-7 md:h-7 object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <Sparkles className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 text-amber-500 animate-pulse" />
        </div>

        {/* Title */}
        <h3 className={cn(
          'text-sm md:text-base font-bold mb-1.5',
          'text-foreground',
          'group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:text-transparent',
          `group-hover:${feature.color}`,
          'transition-all duration-300'
        )}>
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed flex-grow line-clamp-2">
          {feature.description}
        </p>

        {/* Hover Arrow Indicator */}
        <div className="mt-2 flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors duration-300">
          <span className="mr-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            Open
          </span>
          <svg 
            className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Decorative Corner Element */}
      <div className={cn(
        'absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
        'bg-gradient-to-br',
        feature.color
      )}
        style={{
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
        }}
      />
    </div>
  );
};

export default AstraVillaFeatures;
