import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Trophy, Star, Zap, TrendingUp, Users, Clock, Target,
  ChevronRight, CheckCircle2, DollarSign, Eye, Shield,
  Award, Flame, BarChart3, MessageSquare, Crown, Medal,
  Sparkles, ArrowRight, Building2, Percent, Gift, Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

/* ─── Tier System ─── */

const AGENT_TIERS = [
  {
    tier: 'Bronze',
    icon: Shield,
    color: 'text-amber-700',
    bgColor: 'bg-amber-700/10',
    borderColor: 'border-amber-700/20',
    requirement: 'Default — all new agents',
    commission: '1.5%',
    perks: ['Standard listing placement', 'Basic inquiry routing', 'Platform analytics access'],
    listingsReq: '0+',
    responseReq: 'No minimum',
    closedReq: '0',
  },
  {
    tier: 'Silver',
    icon: Star,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/20',
    borderColor: 'border-border',
    requirement: '10+ listings, <12h avg response, 1+ closed deal',
    commission: '1.75%',
    perks: ['Priority search ranking (+15%)', 'Silver badge on profile', 'Monthly performance report', 'Early access to new inquiries'],
    listingsReq: '10+',
    responseReq: '<12h avg',
    closedReq: '1+',
  },
  {
    tier: 'Gold',
    icon: Crown,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    borderColor: 'border-chart-2/20',
    requirement: '30+ listings, <6h avg response, 5+ closed deals',
    commission: '2.0%',
    perks: ['Featured agent placement', 'Gold badge + verified mark', 'Priority lead routing', 'Free promoted listings (2/mo)', 'Dedicated account support'],
    listingsReq: '30+',
    responseReq: '<6h avg',
    closedReq: '5+',
  },
  {
    tier: 'Platinum',
    icon: Trophy,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    requirement: '75+ listings, <3h avg response, 15+ closed deals',
    commission: '2.5%',
    perks: ['Homepage featured agent slot', 'Platinum badge + trust seal', 'First-priority on all inquiries', 'Free promoted listings (5/mo)', 'Co-branded marketing materials', 'Exclusive developer project access', 'Quarterly bonus pool eligibility'],
    listingsReq: '75+',
    responseReq: '<3h avg',
    closedReq: '15+',
  },
];

/* ─── KPIs ─── */

const PERFORMANCE_KPIS = [
  {
    metric: 'Response Speed',
    weight: 35,
    icon: Clock,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    levels: [
      { label: 'Elite', value: '<1 hour', multiplier: '1.5x' },
      { label: 'Fast', value: '<6 hours', multiplier: '1.2x' },
      { label: 'Standard', value: '<24 hours', multiplier: '1.0x' },
      { label: 'Slow', value: '>24 hours', multiplier: '0.7x' },
    ],
    rationale: 'Fastest signal of agent quality. Buyers who wait >24h for a response are 4x more likely to abandon inquiry.',
  },
  {
    metric: 'Negotiation Success',
    weight: 30,
    icon: Target,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    levels: [
      { label: 'Closer', value: '>40% conversion', multiplier: '1.5x' },
      { label: 'Strong', value: '25–40%', multiplier: '1.2x' },
      { label: 'Average', value: '10–25%', multiplier: '1.0x' },
      { label: 'Low', value: '<10%', multiplier: '0.8x' },
    ],
    rationale: 'Measures actual deal-closing ability. High inquiry volume without conversions signals pricing or follow-up problems.',
  },
  {
    metric: 'Listing Engagement',
    weight: 20,
    icon: Eye,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    levels: [
      { label: 'Magnetic', value: '>500 views/listing', multiplier: '1.3x' },
      { label: 'Strong', value: '200–500', multiplier: '1.1x' },
      { label: 'Average', value: '50–200', multiplier: '1.0x' },
      { label: 'Low', value: '<50', multiplier: '0.9x' },
    ],
    rationale: 'Proxy for listing quality — better photos, descriptions, and pricing attract more engagement.',
  },
  {
    metric: 'Listing Volume',
    weight: 15,
    icon: Building2,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    levels: [
      { label: 'Portfolio', value: '50+ active', multiplier: '1.2x' },
      { label: 'Growing', value: '20–50', multiplier: '1.1x' },
      { label: 'Starter', value: '5–20', multiplier: '1.0x' },
      { label: 'Minimal', value: '<5', multiplier: '0.9x' },
    ],
    rationale: 'Supply density drives marketplace liquidity. More quality listings = more buyer options = more transactions.',
  },
];

/* ─── Bonus Structure ─── */

const BONUS_PROGRAMS = [
  {
    title: 'First Deal Bonus',
    description: 'Extra 0.5% commission on the first deal closed through the platform — rewards early adoption and commitment',
    value: '+0.5% on first deal',
    icon: Flag,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    condition: 'First completed transaction',
  },
  {
    title: 'Speed Closer Bonus',
    description: 'Monthly bonus for agents who close deals within 30 days of first inquiry — rewards efficiency',
    value: 'IDR 2.5M/deal',
    icon: Zap,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    condition: 'Deal closed < 30 days from inquiry',
  },
  {
    title: 'Listing Blitz Reward',
    description: 'Upload 10+ quality listings in a single month and receive free promoted placement for all of them',
    value: '10 free promotions',
    icon: Building2,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    condition: '10+ listings uploaded in calendar month',
  },
  {
    title: 'Quarterly MVP Pool',
    description: 'Top 3 agents by composite performance score share a quarterly bonus pool — creates sustained competitive motivation',
    value: 'IDR 15M pool / quarter',
    icon: Trophy,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    condition: 'Top 3 by Agent Performance Score',
  },
  {
    title: 'Referral Commission',
    description: 'Refer another agent who lists 5+ properties — earn 10% of their first deal commission',
    value: '10% referral share',
    icon: Users,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    condition: 'Referred agent lists 5+ properties',
  },
];

/* ─── Badges ─── */

const BADGES = [
  { name: 'Lightning Responder', condition: 'Avg response < 1 hour for 30 days', icon: Zap, color: 'text-chart-2' },
  { name: 'Deal Closer', condition: '5+ deals closed on platform', icon: Target, color: 'text-chart-1' },
  { name: 'Top Lister', condition: '50+ active listings', icon: Building2, color: 'text-chart-4' },
  { name: 'Client Favorite', condition: '4.8+ avg rating with 10+ reviews', icon: Star, color: 'text-chart-2' },
  { name: 'Platinum Partner', condition: 'Reached Platinum tier', icon: Crown, color: 'text-primary' },
  { name: 'Market Expert', condition: 'Highest engagement in a city for 3 months', icon: Award, color: 'text-chart-5' },
];

export default function AgentIncentivesPage() {
  const [activeTab, setActiveTab] = useState('tiers');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-chart-2" />
                </div>
                Agent Incentive Program
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Performance motivation and reward structure</p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-2/20 text-chart-2">
              <Flame className="h-3 w-3 mr-1.5" />
              Aligned Growth Engine
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="tiers">Agent Tiers</TabsTrigger>
            <TabsTrigger value="kpis">Performance KPIs</TabsTrigger>
            <TabsTrigger value="bonuses">Bonuses & Badges</TabsTrigger>
          </TabsList>

          {/* ═══ TIERS ═══ */}
          <TabsContent value="tiers" className="space-y-3">
            {/* Tier progression bar */}
            <Card className="border border-border bg-card">
              <CardContent className="p-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Tier Progression</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {AGENT_TIERS.map((t, i) => {
                    const TIcon = t.icon;
                    return (
                      <div key={t.tier} className="flex items-center gap-1.5">
                        <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full border', t.borderColor, t.bgColor)}>
                          <TIcon className={cn('h-3 w-3', t.color)} />
                          <span className={cn('text-[9px] font-bold', t.color)}>{t.tier}</span>
                          <Badge variant="outline" className="text-[7px] px-1 py-0 h-3 ml-0.5">{t.commission}</Badge>
                        </div>
                        {i < AGENT_TIERS.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/30" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {AGENT_TIERS.map((tier, i) => {
              const TIcon = tier.icon;
              return (
                <motion.div key={tier.tier} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className={cn('border bg-card', tier.borderColor)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', tier.bgColor)}>
                          <TIcon className={cn('h-6 w-6', tier.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-black text-foreground">{tier.tier}</p>
                            <Badge className={cn('text-[8px] border-0', tier.bgColor, tier.color)}>{tier.commission} commission</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-3">{tier.requirement}</p>

                          {/* Requirements */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {[
                              { label: 'Listings', value: tier.listingsReq },
                              { label: 'Response', value: tier.responseReq },
                              { label: 'Deals Closed', value: tier.closedReq },
                            ].map((r) => (
                              <div key={r.label} className="p-2 rounded-lg bg-muted/10 border border-border/20 text-center">
                                <p className="text-[8px] text-muted-foreground">{r.label}</p>
                                <p className="text-[10px] font-bold text-foreground">{r.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Perks */}
                          <div className="space-y-1">
                            {tier.perks.map((p, pi) => (
                              <div key={pi} className="flex items-start gap-2">
                                <CheckCircle2 className={cn('h-3 w-3 flex-shrink-0 mt-0.5', tier.color)} />
                                <p className="text-[10px] text-muted-foreground">{p}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Design Principle</p>
                    <p className="text-[11px] text-muted-foreground">
                      Each tier upgrade must feel achievable within 60–90 days of focused effort. If tiers feel impossible, agents disengage. If they feel automatic, they don't motivate. The sweet spot is "I can get there if I push."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ KPIs ═══ */}
          <TabsContent value="kpis" className="space-y-3">
            {/* Weight summary */}
            <Card className="border border-border bg-card">
              <CardContent className="p-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Agent Performance Score = Weighted Composite</p>
                <div className="space-y-2">
                  {PERFORMANCE_KPIS.map((kpi) => {
                    const KIcon = kpi.icon;
                    return (
                      <div key={kpi.metric} className="flex items-center gap-3">
                        <KIcon className={cn('h-3.5 w-3.5 flex-shrink-0', kpi.color)} />
                        <p className="text-[10px] font-bold text-foreground w-32 flex-shrink-0">{kpi.metric}</p>
                        <div className="flex-1">
                          <Progress value={kpi.weight} className="h-1.5" />
                        </div>
                        <p className={cn('text-[10px] font-bold w-8 text-right', kpi.color)}>{kpi.weight}%</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {PERFORMANCE_KPIS.map((kpi, i) => {
              const KIcon = kpi.icon;
              return (
                <motion.div key={kpi.metric} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="border border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', kpi.bgColor)}>
                          <KIcon className={cn('h-4 w-4', kpi.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-foreground">{kpi.metric}</p>
                            <Badge variant="outline" className="text-[7px]">{kpi.weight}% weight</Badge>
                          </div>
                          <p className="text-[9px] text-muted-foreground mt-0.5">{kpi.rationale}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {kpi.levels.map((l) => (
                          <div key={l.label} className={cn(
                            'p-2.5 rounded-lg border text-center',
                            l.label === 'Elite' || l.label === 'Closer' || l.label === 'Magnetic' || l.label === 'Portfolio'
                              ? cn(kpi.bgColor, 'border-current/10')
                              : 'bg-muted/10 border-border/20'
                          )}>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase">{l.label}</p>
                            <p className="text-[10px] font-bold text-foreground mt-0.5">{l.value}</p>
                            <Badge variant="outline" className={cn('text-[7px] mt-1', l.multiplier.startsWith('1.5') || l.multiplier.startsWith('1.3') ? kpi.color : 'text-muted-foreground')}>
                              {l.multiplier}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ BONUSES & BADGES ═══ */}
          <TabsContent value="bonuses" className="space-y-4">
            {/* Bonus Programs */}
            <div>
              <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                <Gift className="h-3.5 w-3.5 text-chart-1" /> Bonus Programs
              </p>
              <div className="space-y-2.5">
                {BONUS_PROGRAMS.map((b, i) => {
                  const BIcon = b.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="border border-border bg-card">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', b.bgColor)}>
                              <BIcon className={cn('h-4 w-4', b.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-xs font-bold text-foreground">{b.title}</p>
                                <Badge className={cn('text-[8px] border-0 ml-auto flex-shrink-0', b.bgColor, b.color)}>{b.value}</Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground mb-1.5">{b.description}</p>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-2.5 w-2.5 text-muted-foreground" />
                                <p className="text-[9px] text-muted-foreground italic">{b.condition}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Recognition Badges */}
            <div>
              <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                <Medal className="h-3.5 w-3.5 text-chart-4" /> Recognition Badges
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BADGES.map((b, i) => {
                  const BIcon = b.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                      <Card className="border border-border bg-card">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center flex-shrink-0">
                              <BIcon className={cn('h-4 w-4', b.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-foreground">{b.name}</p>
                              <p className="text-[9px] text-muted-foreground">{b.condition}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Leaderboard */}
            <Card className="border border-primary/15 bg-primary/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Monthly Leaderboard</p>
                    <p className="text-[11px] text-muted-foreground">
                      Published on the 1st of every month. Top 10 agents ranked by composite performance score. Top 3 share the quarterly bonus pool. All ranked agents receive a public "Top Agent" badge visible on their listings — social proof that drives buyer trust and listing inquiries.
                    </p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-xs flex-shrink-0">Live</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
