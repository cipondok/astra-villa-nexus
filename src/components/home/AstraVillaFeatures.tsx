import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  Calculator, 
  Home, 
  MapPin, 
  Map, 
  TrendingUp, 
  Maximize2, 
  BarChart3 
} from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgGradient: string;
}

const features: Feature[] = [
  {
    icon: Building2,
    title: 'New Projects',
    description: 'The best investment opportunities',
    color: 'from-blue-400 to-blue-600',
    bgGradient: 'bg-blue-50 dark:bg-blue-950/30'
  },
  {
    icon: Calculator,
    title: 'Construction Cost Calculator',
    description: 'Get construction cost estimate',
    color: 'from-cyan-400 to-cyan-600',
    bgGradient: 'bg-cyan-50 dark:bg-cyan-950/30'
  },
  {
    icon: Home,
    title: 'Home Loan Calculator',
    description: 'Find affordable loan packages',
    color: 'from-emerald-400 to-emerald-600',
    bgGradient: 'bg-emerald-50 dark:bg-emerald-950/30'
  },
  {
    icon: MapPin,
    title: 'Area Guides',
    description: 'Explore housing societies in Indonesia',
    color: 'from-pink-400 to-pink-600',
    bgGradient: 'bg-pink-50 dark:bg-pink-950/30'
  },
  {
    icon: Map,
    title: 'Plot Finder',
    description: 'Find plots in any housing society',
    color: 'from-teal-400 to-teal-600',
    bgGradient: 'bg-teal-50 dark:bg-teal-950/30'
  },
  {
    icon: BarChart3,
    title: 'Property Index',
    description: 'Track changes in real estate prices',
    color: 'from-purple-400 to-purple-600',
    bgGradient: 'bg-purple-50 dark:bg-purple-950/30'
  },
  {
    icon: Maximize2,
    title: 'Area Unit Converter',
    description: 'Convert any area unit instantly',
    color: 'from-amber-400 to-amber-600',
    bgGradient: 'bg-amber-50 dark:bg-amber-950/30'
  },
  {
    icon: TrendingUp,
    title: 'Property Trends',
    description: 'Find popular areas to buy property',
    color: 'from-violet-400 to-violet-600',
    bgGradient: 'bg-violet-50 dark:bg-violet-950/30'
  }
];

const AstraVillaFeatures = () => {
  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-blue-600 to-purple-600 dark:from-blue-400 dark:via-blue-300 dark:to-purple-400 bg-clip-text text-transparent">
            Explore More on ASTRA Villa
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Indonesia's premier 3D property platform with cutting-edge tools
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
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
  const Icon = feature.icon;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer',
        'bg-white dark:bg-gray-900',
        'border border-gray-200 dark:border-gray-800',
        'shadow-sm hover:shadow-2xl',
        'hover:-translate-y-2 hover:scale-[1.02]',
        'animate-fade-in'
      )}
      style={{
        animationDelay: `${index * 0.1}s`
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
      <div className="relative p-6 md:p-8 h-full flex flex-col">
        {/* Icon Container */}
        <div className={cn(
          'w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-4 md:mb-6',
          'transition-all duration-500 group-hover:scale-110 group-hover:rotate-3',
          feature.bgGradient
        )}>
          <Icon className={cn(
            'w-8 h-8 md:w-10 md:h-10 transition-all duration-500',
            `bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`
          )} 
            strokeWidth={1.5}
          />
        </div>

        {/* Title */}
        <h3 className={cn(
          'text-lg md:text-xl font-bold mb-2 md:mb-3',
          'text-gray-900 dark:text-white',
          'group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:text-transparent',
          `group-hover:${feature.color}`,
          'transition-all duration-500'
        )}>
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">
          {feature.description}
        </p>

        {/* Hover Arrow Indicator */}
        <div className="mt-4 flex items-center text-sm font-medium text-gray-500 dark:text-gray-500 group-hover:text-primary transition-colors duration-300">
          <span className="mr-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            Learn more
          </span>
          <svg 
            className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" 
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
        'absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-10 transition-opacity duration-500',
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
