import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Brain, TrendingUp, Shield, Building2, Users, Globe,
  BarChart3, Wrench, MapPin, ArrowRight, Sparkles,
  Target, Activity, Lock, Crown, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const PLATFORM_PILLARS = [
  {
    icon: Brain,
    title: 'AI Intelligence Engine',
    subtitle: 'Machine Learning Powered',
    description: 'Opportunity scoring, price predictions & personalized investment recommendations calibrated on real Indonesian transaction data.',
    stat: '94%',
    statLabel: 'AI Accuracy',
    color: 'text-primary',
    bgColor: 'bg-primary/8',
    borderColor: 'border-primary/10 hover:border-primary/25',
    glowColor: 'shadow-primary/5',
    route: '/recommendations',
  },
  {
    icon: BarChart3,
    title: 'Market Intelligence',
    subtitle: 'Real-Time Analytics',
    description: 'Live price trends, investment heat maps, and demand analytics across 34 provinces — updated continuously from marketplace activity.',
    stat: '34',
    statLabel: 'Provinces',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/8',
    borderColor: 'border-chart-2/10 hover:border-chart-2/25',
    glowColor: 'shadow-chart-2/5',
    route: '/analytics',
  },
  {
    icon: Shield,
    title: 'Verified Marketplace',
    subtitle: 'Trust & Transparency',
    description: 'Every listing verified, every agent validated. Full transaction transparency with blockchain-backed document integrity.',
    stat: '438K+',
    statLabel: 'Listings',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/8',
    borderColor: 'border-chart-1/10 hover:border-chart-1/25',
    glowColor: 'shadow-chart-1/5',
    route: '/properties',
  },
  {
    icon: Crown,
    title: 'Investor Club',
    subtitle: 'Exclusive Access',
    description: 'Tiered membership with early project access, off-market deals, and personalized concierge consulting for serious investors.',
    stat: '4',
    statLabel: 'Tiers',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/8',
    borderColor: 'border-chart-4/10 hover:border-chart-4/25',
    glowColor: 'shadow-chart-4/5',
    route: '/investor-club',
  },
];

const ECOSYSTEM_FEATURES = [
  { icon: Target, label: 'Deal Finder', route: '/deal-finder', desc: 'AI-detected undervalued properties' },
  { icon: TrendingUp, label: 'ROI Calculator', route: '/roi-calculator', desc: 'Projection & scenario modeling' },
  { icon: MapPin, label: 'Map Explorer', route: '/investment-map-explorer', desc: 'Geospatial heat intelligence' },
  { icon: Wrench, label: 'Services', route: '/services', desc: 'Renovation & legal marketplace' },
  { icon: Building2, label: 'New Projects', route: '/projects', desc: 'Pre-launch developer inventory' },
  { icon: Activity, label: 'Portfolio', route: '/portfolio', desc: 'Track & optimize holdings' },
  { icon: Globe, label: 'Market Data', route: '/market-intelligence', desc: 'National price indices' },
  { icon: Lock, label: 'Verification', route: '/blockchain-verification', desc: 'Blockchain document integrity' },
];

const STATS = [
  { value: '17', label: 'Cities Covered', icon: MapPin },
  { value: '50+', label: 'AI Models Active', icon: Brain },
  { value: '200+', label: 'Verified Agents', icon: Users },
  { value: '24/7', label: 'Market Monitoring', icon: Activity },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

function AstraProjectShowcase() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* ── Section header ── */}
      <div className="text-center mb-8 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/15 bg-primary/5 mb-4">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-[0.2em]">Platform Overview</span>
          </div>
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
            Indonesia's Intelligent Property
            <span className="block text-primary mt-1">Investment Platform</span>
          </h2>
          {/* Intelligence Line accent */}
          <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-primary/0 rounded-full mx-auto mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            AI-powered analytics, verified marketplace integrity, and premium investor tools — 
            transforming how you discover and invest in Indonesian real estate.
          </p>
        </motion.div>
      </div>

      {/* ── Platform pillars — editorial cards ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {PLATFORM_PILLARS.map((pillar) => {
          const PIcon = pillar.icon;
          return (
            <motion.div key={pillar.title} variants={itemVariants}>
              <Card
                className={cn(
                  'border bg-card transition-all duration-300 cursor-pointer group h-full',
                  'hover:shadow-lg',
                  pillar.borderColor
                )}
                onClick={() => navigate(pillar.route)}
              >
                <CardContent className="p-5 sm:p-6 flex flex-col h-full">
                  {/* Top row: icon + stat */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', pillar.bgColor)}>
                      <PIcon className={cn('h-6 w-6', pillar.color)} />
                    </div>
                    <div className="text-right">
                      <span className={cn('text-2xl font-black leading-none', pillar.color)}>{pillar.stat}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{pillar.statLabel}</p>
                    </div>
                  </div>

                  {/* Title + subtitle */}
                  <div className="mb-3">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                      {pillar.title}
                    </h3>
                    <p className={cn('text-[10px] font-semibold uppercase tracking-wider mt-0.5', pillar.color)}>
                      {pillar.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{pillar.description}</p>

                  {/* CTA */}
                  <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Ecosystem tools grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-10"
      >
        <h3 className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-5">
          Ecosystem Tools
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {ECOSYSTEM_FEATURES.map((feat) => {
            const FIcon = feat.icon;
            return (
              <button
                key={feat.label}
                onClick={() => navigate(feat.route)}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/20 hover:bg-primary/3 transition-all duration-200 text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <FIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{feat.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{feat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Stats bar ── */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {STATS.map((stat) => {
          const SIcon = stat.icon;
          return (
            <div key={stat.label} className="relative overflow-hidden rounded-xl border border-border/40 bg-card p-4">
              {/* Subtle gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
              <div className="flex items-center gap-3">
                <SIcon className="h-5 w-5 text-primary/70 flex-shrink-0" />
                <div>
                  <p className="text-lg font-black text-foreground leading-none">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default memo(AstraProjectShowcase);
