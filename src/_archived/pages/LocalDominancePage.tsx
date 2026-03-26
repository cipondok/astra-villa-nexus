import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  MapPin, Building2, Users, Megaphone, TrendingUp, Target,
  ChevronRight, CheckCircle2, ArrowRight, Sparkles, Shield,
  Crown, BarChart3, Star, Zap, Eye, Phone, Globe,
  Home, Lock, MessageSquare, FileText, Award, Activity,
  Flame, Map
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Data ─── */

const TARGET_CITY = {
  name: 'Bali',
  regions: ['Badung (Canggu, Seminyak, Kuta)', 'Gianyar (Ubud)', 'Denpasar', 'Tabanan', 'Karangasem'],
  why: 'Highest foreign investor concentration, premium property demand, tourism-driven rental yields, strong developer activity',
  marketSize: '~12,000 active listings',
  currentShare: '~12%',
  targetShare: '35%+',
  timeline: '9 months',
};

const DOMINATION_PILLARS = [
  {
    id: 'supply',
    title: 'Supply Liquidity',
    subtitle: 'Aggregate 35%+ of active listings through aggressive agent and owner onboarding',
    icon: Home,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    targetMetric: '4,200+ listings',
    strategies: [
      {
        title: 'Neighborhood-by-Neighborhood Listing Blitz',
        description: 'Prioritize investment hotspot neighborhoods — where demand density is highest',
        tactics: [
          'Tier 1 (Month 1-3): Canggu, Seminyak, Ubud — highest investor search volume',
          'Tier 2 (Month 4-6): Kuta, Denpasar, Sanur — secondary demand corridors',
          'Tier 3 (Month 7-9): Tabanan, Karangasem, Nusa Dua — emerging opportunity zones',
          'Target: 500 listings/month via agent onboarding + direct owner acquisition',
        ],
        milestone: '1,400 listings in Tier 1 neighborhoods by Month 3',
        route: '/properties',
      },
      {
        title: 'Top Agent Relationship Program',
        description: 'Identify and recruit the top 50 agents by listing volume in Bali',
        tactics: [
          'Agent acquisition pipeline: scrape competitor platforms for top-performing Bali agents',
          'Personal onboarding call + platform walkthrough for each target agent',
          'Commission incentive: 0% platform fee for first 3 months to reduce switching friction',
          'Agent leaderboard with monthly rewards — public recognition drives competitive adoption',
        ],
        milestone: '25 active agents contributing 10+ listings each by Month 6',
        route: '/agent-crm',
      },
      {
        title: 'Direct Owner Acquisition',
        description: 'Bypass agents for owner-listed properties — higher margins and exclusive inventory',
        tactics: [
          'WhatsApp group infiltration: join 20+ Bali property owner communities',
          'Free professional photography offer for first 100 owner-listed properties',
          'AI listing content generator as value-add — auto-generate marketing descriptions',
          'Referral bonus: IDR 500K for every owner who lists and gets their first inquiry',
        ],
        milestone: '800 direct-owner listings by Month 9',
        route: '/my-properties',
      },
    ],
  },
  {
    id: 'demand',
    title: 'Investor Demand Density',
    subtitle: 'Build concentrated buyer network that creates natural inquiry pressure on listings',
    icon: Users,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    targetMetric: '1,200+ active investors',
    strategies: [
      {
        title: 'Bali-Focused Social Media Campaigns',
        description: 'Targeted ads and organic content specifically about Bali property investment',
        tactics: [
          'Instagram/TikTok: "Bali Investment Insight" series — weekly AI-generated market data posts',
          'LinkedIn: "Why Bali" investment thesis articles targeting HNW professionals',
          'YouTube: property walkthrough videos with AI score overlay and ROI projections',
          'Facebook Groups: active participation in 15+ Bali expat and investor communities',
        ],
        milestone: '500 signups from social campaigns by Month 6',
        route: '/landing',
      },
      {
        title: 'Localized Investor Demo Sessions',
        description: 'Monthly in-person and virtual events exclusively about Bali opportunities',
        tactics: [
          'Monthly "Bali Investment Briefing" — 30-min live session with AI market insights',
          'Private 1-on-1 demos for HNW prospects identified through agent referrals',
          'Quarterly investor dinner events in Bali for high-value relationship building',
          'Post-demo follow-up sequence: personalized property picks within 24 hours',
        ],
        milestone: '100 demo attendees converting at 30%+ signup rate',
        route: '/hnw-investor-strategy',
      },
      {
        title: 'Investor Referral Engine',
        description: 'Leverage existing investors to attract their network — the viral coefficient',
        tactics: [
          'Referral program: IDR 1M credit for both referrer and referee on first inquiry',
          '"Share Your Watchlist" feature for collaborative property discovery',
          'Investor community channel for deal discussion and market insights sharing',
          'Target: 25% of new investors from referrals by Month 9',
        ],
        milestone: 'Viral coefficient >0.25 (every 4 investors bring 1 new)',
        route: '/investor-social',
      },
    ],
  },
  {
    id: 'developer',
    title: 'Developer Ecosystem Entry',
    subtitle: 'One flagship partnership creates credibility for all subsequent developer conversations',
    icon: Building2,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    targetMetric: '5 developer partners',
    strategies: [
      {
        title: 'Flagship Project Partnership',
        description: 'Secure one high-profile Bali developer project as the platform\'s showcase case study',
        tactics: [
          'Target: top 3 active developers in Canggu/Seminyak with upcoming project launches',
          'Offer: free Launch Radar placement + AI demand forecast report as partnership entry',
          'Exclusive: 48-hour pre-launch access for Diamond investors as differentiator',
          'Co-marketing: joint announcement across both developer and ASTRA Villa channels',
        ],
        milestone: '1 flagship project live with full unit inventory by Month 4',
        route: '/launch-radar',
      },
      {
        title: 'Developer Success Case Promotion',
        description: 'Turn the first partnership into a marketing asset that attracts subsequent developers',
        tactics: [
          'Case study: "How [Developer] sold 15 units in 30 days using ASTRA Villa intelligence"',
          'Developer testimonial video for landing page and pitch deck',
          'Demand forecast accuracy validation: "AI predicted 85% absorption — actual was 82%"',
          'Use case as proof point in all subsequent developer outreach conversations',
        ],
        milestone: 'Case study published + used to close 4 additional developer partnerships',
        route: '/developer-campaign',
      },
    ],
  },
  {
    id: 'brand',
    title: 'Local Brand Authority',
    subtitle: 'Become the recognized source of Bali property intelligence — not just listings',
    icon: Award,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    targetMetric: '#1 brand recall for "Bali property investment"',
    strategies: [
      {
        title: 'Localized Investment Intelligence',
        description: 'Weekly Bali-specific market intelligence that no competitor provides',
        tactics: [
          '"Bali Market Pulse" — weekly AI report: price trends by neighborhood, new project alerts',
          'Monthly "Top 10 Bali Investment Opportunities" with AI scoring and ROI projection',
          'Quarterly "Bali Property Market Report" — comprehensive data benchmark for the industry',
          'SEO-optimized city investment page at /invest/bali with live market data',
        ],
        milestone: '"Bali property investment" Google ranking: page 1 by Month 9',
        route: '/market-intelligence-feed',
      },
      {
        title: '"Top Opportunities in Bali" Campaign',
        description: 'Recurring curated content campaign that positions ASTRA as the discovery platform',
        tactics: [
          'Weekly email digest: "This Week\'s Elite Bali Deals" to all registered investors',
          'Social media carousel: top 3 AI-scored properties with opportunity breakdown',
          'Push notifications for price drops and new elite listings in watchlisted areas',
          'Featured placement of Bali properties in homepage AI Opportunity Zone',
        ],
        milestone: '40% open rate on Bali deal digest + 15% click-through to platform',
        route: '/recommendations',
      },
    ],
  },
];

const DOMINANCE_TIMELINE = [
  { month: 'M1-3', phase: 'Seed', targets: ['800 listings in Tier 1', '200 investors', '1 flagship developer', '4 weekly reports'], color: 'bg-chart-1/15' },
  { month: 'M4-6', phase: 'Grow', targets: ['2,000 listings total', '600 investors', '3 developer partners', 'Page 2 SEO ranking'], color: 'bg-primary/15' },
  { month: 'M7-9', phase: 'Dominate', targets: ['4,200 listings (35%)', '1,200 investors', '5 developers', 'Page 1 SEO + brand recall'], color: 'bg-chart-2/15' },
];

const COMPETITION_ADVANTAGE = [
  { us: 'AI opportunity scoring on every listing', them: 'No scoring — manual browsing only' },
  { us: 'Localized market intelligence reports', them: 'Generic national-level content' },
  { us: 'Investor DNA personalization', them: 'Same results for every user' },
  { us: 'Developer demand forecast tools', them: 'No developer-side intelligence' },
  { us: 'Pre-launch early access for investors', them: 'Public listing only after launch' },
];

/* ─── Component ─── */

export default function LocalDominancePage() {
  const [activeTab, setActiveTab] = useState('pillars');
  const [expandedPillar, setExpandedPillar] = useState('supply');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-chart-1" />
                </div>
                Local Market Dominance: {TARGET_CITY.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Concentrated supply-demand network density before geographic expansion
              </p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-1/20 text-chart-1">
              <Target className="h-3 w-3 mr-1.5" />
              {TARGET_CITY.targetShare} market share in {TARGET_CITY.timeline}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* City context card */}
        <Card className="border border-border bg-card mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Target City</p>
                <p className="text-sm font-bold text-foreground">{TARGET_CITY.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{TARGET_CITY.why}</p>
              </div>
              <div className="flex gap-4">
                {[
                  { label: 'Market Size', value: TARGET_CITY.marketSize },
                  { label: 'Current Share', value: TARGET_CITY.currentShare },
                  { label: 'Target Share', value: TARGET_CITY.targetShare },
                  { label: 'Timeline', value: TARGET_CITY.timeline },
                ].map((s, i) => (
                  <div key={i} className="text-center px-3 py-2 rounded-lg bg-muted/10 border border-border/20">
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                    <p className="text-xs font-black text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {TARGET_CITY.regions.map((r, i) => (
                <Badge key={i} variant="outline" className="text-[8px]">{r}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="pillars">Domination Pillars</TabsTrigger>
            <TabsTrigger value="timeline">9-Month Plan</TabsTrigger>
            <TabsTrigger value="advantage">Competitive Edge</TabsTrigger>
          </TabsList>

          {/* ═══ PILLARS TAB ═══ */}
          <TabsContent value="pillars" className="space-y-4">
            {DOMINATION_PILLARS.map((pillar) => {
              const PIcon = pillar.icon;
              const isExpanded = expandedPillar === pillar.id;
              return (
                <motion.div key={pillar.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card
                    className={cn('border bg-card transition-all cursor-pointer', isExpanded ? 'border-border shadow-sm' : 'border-border hover:border-border/80')}
                    onClick={() => setExpandedPillar(isExpanded ? '' : pillar.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', pillar.bgColor)}>
                          <PIcon className={cn('h-5 w-5', pillar.color)} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{pillar.title}</CardTitle>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{pillar.subtitle}</p>
                        </div>
                        <Badge className={cn('text-[9px] border-0', pillar.bgColor, pillar.color)}>{pillar.targetMetric}</Badge>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-3 mt-2">
                          {pillar.strategies.map((s, si) => (
                            <div key={si} className="border border-border/30 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-xs font-bold text-foreground">{s.title}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.description}</p>
                                </div>
                                {s.route && (
                                  <Badge variant="outline" className="text-[8px] text-primary border-primary/20 flex-shrink-0 ml-2">{s.route}</Badge>
                                )}
                              </div>
                              <div className="space-y-1 mb-2.5">
                                {s.tactics.map((t, ti) => (
                                  <div key={ti} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                                    <CheckCircle2 className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-muted-foreground">{t}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-chart-2/5 border border-chart-2/10">
                                <Target className="h-3 w-3 text-chart-2 flex-shrink-0" />
                                <p className="text-[10px] text-chart-2 font-medium">{s.milestone}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}

            {/* Dominance equation */}
            <Card className="border border-chart-1/10 bg-card">
              <CardContent className="p-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Dominance Formula</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['35% Listings', 'Top Agents', 'Active Investors', 'Developer Proof', 'Intelligence Brand'].map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Badge variant={i === 0 ? 'default' : 'outline'} className="text-[9px]">{s}</Badge>
                      {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground/30" />}
                    </div>
                  ))}
                  <span className="text-muted-foreground mx-1">=</span>
                  <Badge className="text-[9px] bg-chart-1 text-chart-1-foreground">Local Dominance</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ TIMELINE TAB ═══ */}
          <TabsContent value="timeline" className="space-y-3">
            {DOMINANCE_TIMELINE.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="border border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', t.color)}>
                          <span className="text-xs font-black text-foreground">{t.month}</span>
                        </div>
                        {i < DOMINANCE_TIMELINE.length - 1 && <div className="w-px h-6 bg-border/30" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-bold text-foreground">{t.phase}</p>
                          <Badge variant="outline" className="text-[9px]">{t.month}</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {t.targets.map((target, ti) => (
                            <div key={ti} className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                              <CheckCircle2 className="h-3 w-3 text-chart-2 flex-shrink-0" />
                              <span className="text-[10px] text-muted-foreground">{target}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Expansion Gate</p>
                    <p className="text-[11px] text-muted-foreground">
                      Do NOT expand to City 2 until Bali hits: 35% listing share + 1,200 active investors + 100 closed transactions + positive unit economics. Premature expansion dilutes focus and delays network effects.
                    </p>
                  </div>
                  <Badge className="bg-chart-2 text-chart-2-foreground text-xs flex-shrink-0">Gate Check</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ ADVANTAGE TAB ═══ */}
          <TabsContent value="advantage" className="space-y-4">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  ASTRA Villa vs. Competitors in Bali
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-1.5">
                {COMPETITION_ADVANTAGE.map((c, i) => (
                  <div key={i} className="flex items-stretch gap-2">
                    <div className="flex-1 p-2.5 rounded-lg bg-chart-2/5 border border-chart-2/10">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="h-3 w-3 text-chart-2" />
                        <span className="text-[9px] font-bold text-chart-2">ASTRA Villa</span>
                      </div>
                      <p className="text-[10px] text-foreground">{c.us}</p>
                    </div>
                    <div className="flex-1 p-2.5 rounded-lg bg-muted/10 border border-border/20">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-bold text-muted-foreground">Competitors</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{c.them}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-primary/15 bg-primary/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Flame className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Perception Goal</p>
                    <p className="text-[11px] text-muted-foreground">
                      When a serious property investor in Bali hears "I'm looking at a villa" — the response should be "Have you checked ASTRA Villa?" That's local dominance. It's built through supply density, intelligence quality, and relentless local presence — not advertising spend.
                    </p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-xs flex-shrink-0">#1 Recall</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
