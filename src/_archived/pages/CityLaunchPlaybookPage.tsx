import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search, Handshake, Megaphone, Rocket, Star, TrendingUp,
  ChevronRight, ArrowUpRight, MapPin, Layers
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

interface Step {
  id: number;
  tag: string;
  goal: string;
  icon: React.ElementType;
  accentClass: string;
  badgeClass: string;
  actions: string[];
  signal: string;
}

const STEPS: Step[] = [
  {
    id: 1, tag: 'STEP 1', goal: 'Intelligence Preparation',
    icon: Search, accentClass: 'border-l-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20',
    actions: ['Identify 3 high-liquidity districts', 'Map vendor category gaps', 'Preload 30 premium listings', 'Preload 40 vendor profiles'],
    signal: 'Data-first entry — never launch blind',
  },
  {
    id: 2, tag: 'STEP 2', goal: 'Supply Activation',
    icon: Handshake, accentClass: 'border-l-chart-2', badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    actions: ['Direct WhatsApp outreach to vendors', 'Offer early dominance territory slots', 'Onboard legal + mortgage partners'],
    signal: 'Supply credibility before demand arrives',
  },
  {
    id: 3, tag: 'STEP 3', goal: 'Demand Activation',
    icon: Megaphone, accentClass: 'border-l-chart-4', badgeClass: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    actions: ['Launch 10 viral property videos', 'Run Meta lead ads targeting investors', 'Publish "AI Top Investment Areas" report'],
    signal: 'Investor attention creates vendor value',
  },
  {
    id: 4, tag: 'STEP 4', goal: 'Transaction Kickstart',
    icon: Rocket, accentClass: 'border-l-chart-5', badgeClass: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    actions: ['Personally manage first 20 deals', 'Concierge investor support', 'Create urgency narrative: "hotspot demand rising"'],
    signal: 'First transactions prove the marketplace works',
  },
  {
    id: 5, tag: 'STEP 5', goal: 'Social Proof Explosion',
    icon: Star, accentClass: 'border-l-accent', badgeClass: 'bg-accent/10 text-accent-foreground border-accent/20',
    actions: ['Record vendor & investor testimonials', 'Publish deal success dashboards', 'Show live marketplace liquidity metrics'],
    signal: 'Proof compounds trust → accelerates adoption',
  },
  {
    id: 6, tag: 'STEP 6', goal: 'Scale Trigger',
    icon: TrendingUp, accentClass: 'border-l-foreground', badgeClass: 'bg-foreground/10 text-foreground border-foreground/20',
    actions: ['Open second district expansion', 'Introduce vendor paid upgrades', 'Launch investor pro subscription push'],
    signal: 'City becomes liquidity hub → repeat blueprint',
  },
];

const metrics = [
  { label: 'Steps', value: '6', sub: 'Sequential' },
  { label: 'Listings seed', value: '30+', sub: 'Premium supply' },
  { label: 'Vendors seed', value: '40+', sub: 'Category coverage' },
  { label: 'End state', value: 'Hub', sub: 'Liquidity lock' },
];

export default function CityLaunchPlaybookPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-6xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Expansion</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">City Launch Playbook</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-2xl">
            Six-step repeatable blueprint to transform any target city into a self-sustaining liquidity hub — from intelligence prep to scale trigger.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-6xl py-6 space-y-6">
        {/* Metrics */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <motion.div key={m.label} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</span>
                  <div className="text-xl font-bold font-mono text-foreground">{m.value}</div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3 text-primary" />{m.sub}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Steps */}
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border hidden md:block" />
          <div className="space-y-5">
            {STEPS.map((step, idx) => (
              <motion.div key={step.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="relative md:pl-12">
                <div className="absolute left-3 top-6 h-3 w-3 rounded-full border-2 border-background bg-primary hidden md:block" />
                <motion.div variants={fadeSlide}>
                  <Card className={`border-border/50 border-l-4 ${step.accentClass}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                          <step.icon className="h-4.5 w-4.5 text-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant="outline" className={`text-[9px] font-mono ${step.badgeClass}`}>{step.tag}</Badge>
                          </div>
                          <CardTitle className="text-base">{step.goal}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-2">
                        {step.actions.map((a, i) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/20">
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                            <span className="text-xs text-foreground">{a}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/70">Signal</span>
                        <p className="text-xs text-foreground mt-0.5">{step.signal}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                {idx < STEPS.length - 1 && (
                  <motion.div variants={fadeSlide} className="flex justify-center py-1 md:hidden"><div className="h-4 w-px bg-border" /></motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Doctrine */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeSlide}>
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Launch Doctrine</span>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { p: 'Intelligence before action', d: 'Map districts, gaps, and demand signals before committing resources to a new city.' },
                  { p: 'Supply before demand', d: 'Credible vendor and listing supply must exist before investor marketing begins.' },
                  { p: 'Proof before scale', d: 'First transactions and testimonials unlock paid upgrades and district expansion.' },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs font-semibold text-foreground mb-1">{item.p}</p>
                    <p className="text-[11px] text-muted-foreground">{item.d}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
