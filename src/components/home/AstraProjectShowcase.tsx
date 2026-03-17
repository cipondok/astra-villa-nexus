import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain, TrendingUp, Shield, Building2, Users, Globe,
  BarChart3, Zap, Crown, Layers, Wrench, MapPin,
  ArrowRight, Sparkles, Target, Activity, Lock, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PLATFORM_PILLARS = [
  {
    icon: Brain,
    title: 'AI Intelligence Engine',
    description: 'Opportunity scoring, price predictions & investment recommendations powered by machine learning',
    stat: '94%',
    statLabel: 'AI Accuracy',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    route: '/recommendations',
  },
  {
    icon: BarChart3,
    title: 'Market Intelligence',
    description: 'Real-time price trends, heat maps, and demand analytics across 34 Indonesian provinces',
    stat: '34',
    statLabel: 'Provinces',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    route: '/analytics',
  },
  {
    icon: Shield,
    title: 'Verified Marketplace',
    description: 'Every listing verified, every agent validated — trusted transactions with full transparency',
    stat: '438K+',
    statLabel: 'Listings',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    route: '/properties',
  },
  {
    icon: Crown,
    title: 'Investor Club',
    description: 'Exclusive tiers with early access, off-market deals, and personalized portfolio consulting',
    stat: '4',
    statLabel: 'Tiers',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    route: '/investor-club',
  },
];

const ECOSYSTEM_FEATURES = [
  { icon: Target, label: 'Deal Finder', route: '/deal-finder' },
  { icon: TrendingUp, label: 'ROI Calculator', route: '/roi-calculator' },
  { icon: MapPin, label: 'Map Explorer', route: '/investment-map-explorer' },
  { icon: Wrench, label: 'Services', route: '/services' },
  { icon: Building2, label: 'New Projects', route: '/projects' },
  { icon: Activity, label: 'Portfolio', route: '/portfolio' },
  { icon: Globe, label: 'Market Data', route: '/market-intelligence' },
  { icon: Lock, label: 'Blockchain', route: '/blockchain-verification' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function AstraProjectShowcase() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4">
      {/* Section header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/15 bg-primary/5 mb-3">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-[0.15em]">About ASTRA Villa</span>
        </div>
        <h2 className="font-playfair text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
          Indonesia's Intelligent Property
          <span className="block text-primary">Investment Platform</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Combining AI-powered analytics, verified marketplace integrity, and premium investor tools
          to transform how you discover and invest in Indonesian real estate.
        </p>
      </div>

      {/* Platform pillars */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {PLATFORM_PILLARS.map((pillar) => {
          const PIcon = pillar.icon;
          return (
            <motion.div key={pillar.title} variants={itemVariants}>
              <Card
                className="border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group h-full"
                onClick={() => navigate(pillar.route)}
              >
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', pillar.bgColor)}>
                      <PIcon className={cn('h-5 w-5', pillar.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{pillar.title}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn('text-lg font-black', pillar.color)}>{pillar.stat}</span>
                        <span className="text-[10px] text-muted-foreground">{pillar.statLabel}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed flex-1">{pillar.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Ecosystem quick links */}
      <motion.div
        className="flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        {ECOSYSTEM_FEATURES.map((feat) => {
          const FIcon = feat.icon;
          return (
            <Button
              key={feat.label}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-[10px] sm:text-xs gap-1.5 border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all"
              onClick={() => navigate(feat.route)}
            >
              <FIcon className="h-3 w-3 text-muted-foreground" />
              {feat.label}
            </Button>
          );
        })}
      </motion.div>

      {/* Bottom stat bar */}
      <motion.div
        className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        {[
          { value: '17', label: 'Cities Covered', icon: MapPin },
          { value: '50+', label: 'AI Models Active', icon: Brain },
          { value: '200+', label: 'Verified Agents', icon: Users },
          { value: '24/7', label: 'Market Monitoring', icon: Activity },
        ].map((stat) => {
          const SIcon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/40">
              <SIcon className="h-4 w-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-black text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default memo(AstraProjectShowcase);
