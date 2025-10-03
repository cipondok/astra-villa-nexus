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
  BarChart3,
  Sparkles,
  Globe
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
    <section className="w-full py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10 animate-fade-in relative">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Globe className="w-6 h-6 text-primary animate-pulse" />
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-blue-600 to-purple-600 dark:from-blue-400 dark:via-blue-300 dark:to-purple-400 bg-clip-text text-transparent">
            Explore More on ASTRA Villa
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            AI-Powered 3D Property Platform • Smart Tools for Indonesia
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
        'group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer',
        'bg-gradient-to-br from-background to-accent/5',
        'border border-border/50 dark:border-border',
        'shadow-sm hover:shadow-xl hover:border-primary/30',
        'hover:-translate-y-1 hover:scale-[1.01]',
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
      <div className="relative p-4 md:p-5 h-full flex flex-col">
        {/* Icon Container with AI Badge */}
        <div className="relative mb-3 md:mb-4">
          <div className={cn(
            'w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center',
            'transition-all duration-300 group-hover:scale-110',
            feature.bgGradient
          )}>
            <Icon className={cn(
              'w-6 h-6 md:w-7 md:h-7 transition-all duration-300',
              `bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`
            )} 
              strokeWidth={2}
            />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-500 animate-pulse" />
        </div>

        {/* Title */}
        <h3 className={cn(
          'text-base md:text-lg font-bold mb-2',
          'text-foreground',
          'group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:text-transparent',
          `group-hover:${feature.color}`,
          'transition-all duration-300'
        )}>
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed flex-grow">
          {feature.description}
        </p>

        {/* Hover Arrow Indicator */}
        <div className="mt-3 flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors duration-300">
          <span className="mr-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            Explore
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
