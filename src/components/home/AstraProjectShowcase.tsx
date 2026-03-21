import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Brain, TrendingUp, Shield, Building2, Users, Globe,
  BarChart3, Wrench, MapPin, ArrowRight, Sparkles,
  Target, Activity, Lock, Crown, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PLATFORM_PILLARS = [
  {
    icon: Brain, title: 'AI Intelligence Engine', subtitle: 'Machine Learning Powered',
    description: 'Opportunity scoring, price predictions & personalized recommendations.',
    stat: '94%', statLabel: 'AI Accuracy',
    color: 'text-primary', bgColor: 'bg-primary/8',
    borderColor: 'border-primary/10 hover:border-primary/25', route: '/recommendations',
  },
  {
    icon: BarChart3, title: 'Market Intelligence', subtitle: 'Real-Time Analytics',
    description: 'Live price trends, heat maps, and demand analytics across 34 provinces.',
    stat: '34', statLabel: 'Provinces',
    color: 'text-chart-2', bgColor: 'bg-chart-2/8',
    borderColor: 'border-chart-2/10 hover:border-chart-2/25', route: '/analytics',
  },
  {
    icon: Shield, title: 'Verified Marketplace', subtitle: 'Trust & Transparency',
    description: 'Every listing verified, every agent validated. Blockchain-backed integrity.',
    stat: '438K+', statLabel: 'Listings',
    color: 'text-chart-1', bgColor: 'bg-chart-1/8',
    borderColor: 'border-chart-1/10 hover:border-chart-1/25', route: '/properties',
  },
  {
    icon: Crown, title: 'Investor Club', subtitle: 'Exclusive Access',
    description: 'Tiered membership with early access, off-market deals & concierge.',
    stat: '4', statLabel: 'Tiers',
    color: 'text-chart-4', bgColor: 'bg-chart-4/8',
    borderColor: 'border-chart-4/10 hover:border-chart-4/25', route: '/investor-club',
  },
];

const ECOSYSTEM_FEATURES = [
  { icon: Target, label: 'Deal Finder', route: '/deal-finder', desc: 'AI undervalued properties' },
  { icon: TrendingUp, label: 'ROI Calculator', route: '/roi-calculator', desc: 'Projection modeling' },
  { icon: MapPin, label: 'Map Explorer', route: '/investment-map-explorer', desc: 'Geospatial intelligence' },
  { icon: Wrench, label: 'Services', route: '/services', desc: 'Renovation & legal' },
  { icon: Building2, label: 'New Projects', route: '/projects', desc: 'Pre-launch inventory' },
  { icon: Activity, label: 'Portfolio', route: '/portfolio', desc: 'Track holdings' },
  { icon: Globe, label: 'Market Data', route: '/market-intelligence', desc: 'Price indices' },
  { icon: Lock, label: 'Verification', route: '/blockchain-verification', desc: 'Blockchain docs' },
];

const STATS = [
  { value: '17', label: 'Cities Covered', icon: MapPin },
  { value: '50+', label: 'AI Models Active', icon: Brain },
  { value: '200+', label: 'Verified Agents', icon: Users },
  { value: '24/7', label: 'Market Monitoring', icon: Activity },
];

function AstraProjectShowcase() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4">
      {/* Header — compact */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/15 bg-primary/5 mb-2">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-[0.15em]">Platform Overview</span>
        </div>
        <h2 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight">
          Indonesia's Intelligent Property
          <span className="text-primary ml-1.5">Investment Platform</span>
        </h2>
        <p className="text-[11px] sm:text-xs text-muted-foreground max-w-lg mx-auto mt-1">
          AI-powered analytics, verified marketplace integrity, and premium investor tools — 
          transforming how you discover and invest in Indonesian real estate.
        </p>
      </div>

      {/* Pillars — 2x2 compact cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
        {PLATFORM_PILLARS.map((pillar) => {
          const PIcon = pillar.icon;
          return (
            <Card
              key={pillar.title}
              className={cn(
                'border bg-card transition-all duration-200 cursor-pointer group',
                'hover:shadow-md', pillar.borderColor
              )}
              onClick={() => navigate(pillar.route)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', pillar.bgColor)}>
                    <PIcon className={cn('h-4 w-4', pillar.color)} />
                  </div>
                  <div className="text-right">
                    <span className={cn('text-lg font-black leading-none', pillar.color)}>{pillar.stat}</span>
                    <p className="text-[9px] text-muted-foreground">{pillar.statLabel}</p>
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {pillar.title}
                </h3>
                <p className={cn('text-[9px] font-semibold uppercase tracking-wider', pillar.color)}>{pillar.subtitle}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 line-clamp-2">{pillar.description}</p>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ecosystem tools — inline compact */}
      <div className="mb-3">
        <h3 className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2">
          Ecosystem Tools
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {ECOSYSTEM_FEATURES.map((feat) => {
            const FIcon = feat.icon;
            return (
              <button
                key={feat.label}
                onClick={() => navigate(feat.route)}
                className="group flex flex-col items-center gap-1 p-2 rounded-lg border border-border/40 bg-card hover:border-primary/20 hover:bg-primary/5 transition-all text-center"
              >
                <div className="w-7 h-7 rounded-lg bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <FIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-[9px] font-semibold text-foreground leading-tight">{feat.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats bar — ultra compact */}
      <div className="grid grid-cols-4 gap-2">
        {STATS.map((stat) => {
          const SIcon = stat.icon;
          return (
            <div key={stat.label} className="relative overflow-hidden rounded-lg border border-border/40 bg-card p-2.5">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
              <div className="flex items-center gap-2">
                <SIcon className="h-3.5 w-3.5 text-primary/70 flex-shrink-0" />
                <div>
                  <p className="text-sm font-black text-foreground leading-none">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(AstraProjectShowcase);
