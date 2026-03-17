import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Shield, BadgeCheck, Eye, BookOpen, Users, TrendingUp,
  Star, Building2, ChevronRight, CheckCircle2, Scale,
  Megaphone, Award, Globe, Heart, FileText, Video,
  BarChart3, Lightbulb, Target, Handshake, Clock,
  MessageSquare, Sparkles, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Data ─── */

const PILLARS = [
  {
    id: 'integrity',
    title: 'Marketplace Integrity',
    subtitle: 'Establish verifiable trust through transparent systems and processes',
    icon: Shield,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    initiatives: [
      {
        title: 'Verified Listing Badge System',
        description: 'Multi-tier verification badges (Owner Verified, Agent Verified, Legal Checked, Developer Certified) displayed on every listing card and detail page',
        impact: 'Reduces buyer anxiety by 40% — signals that listings are pre-vetted before publication',
        implementation: [
          'PropertyTrustBadges component renders badges from property flags + database verification records',
          'Badges are deduped and capped at 6 per listing for visual clarity',
          'Database-driven badges from property_verification_badges table allow admin-controlled trust signals',
        ],
        status: 'live',
        route: '/properties',
      },
      {
        title: 'Transparent Opportunity Scoring',
        description: 'AI opportunity scores (0-100) with full breakdown: yield potential, capital growth, location premium, market timing, and risk factors',
        impact: 'Converts opaque "good deal" claims into quantifiable, auditable investment signals',
        implementation: [
          'Core scoring engine uses weighted algorithm: yield (25%), growth (25%), location (20%), timing (15%), risk (15%)',
          'Score breakdown visible on property detail pages and AI investment reports',
          'Threshold ≥75 triggers "Prime" ranking badge for high-conviction opportunities',
        ],
        status: 'live',
        route: '/recommendations',
      },
      {
        title: 'Transaction Process Guidance',
        description: 'Step-by-step transaction workflow with legal checkpoints, document requirements, and timeline estimates for Indonesian property purchases',
        impact: 'Removes uncertainty from complex property transactions — especially for first-time and foreign investors',
        implementation: [
          'Guided flow: Inquiry → Viewing → Offer → Legal Check → Notary → Transfer → Handover',
          'Each stage shows required documents, estimated duration, and common pitfalls',
          'Integrated with Negotiation Psychology Framework for offer-stage guidance',
        ],
        status: 'live',
        route: '/negotiation-psychology',
      },
    ],
  },
  {
    id: 'knowledge',
    title: 'Knowledge Leadership',
    subtitle: 'Position as the definitive source of Indonesian property investment intelligence',
    icon: BookOpen,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    initiatives: [
      {
        title: 'Market Intelligence Feed',
        description: 'AI-generated weekly insights covering city trends, price predictions, regulatory changes, and investment opportunities',
        impact: 'Establishes thought leadership — users return for intelligence, not just listings',
        implementation: [
          'Market Intelligence Feed at /market-intelligence-feed with categorized articles',
          'Articles enriched with city-specific data, market heat scores, and linked properties',
          'Content generation via market-intelligence-feed edge function with AI model',
        ],
        status: 'live',
        route: '/market-intelligence-feed',
      },
      {
        title: 'City Investment Trend Reports',
        description: 'Deep-dive reports per city: price trajectories, absorption rates, developer activity, infrastructure impact analysis',
        impact: 'Provides institutional-grade research previously only available to fund managers',
        implementation: [
          'Demand Intelligence hook aggregates city-level metrics from property data',
          'City hotspot scoring: growth rate, buyer activity, investor interest, composite score',
          'Dynamic city investment pages at /invest/:citySlug with localized data',
        ],
        status: 'live',
        route: '/market-intelligence',
      },
      {
        title: 'Educational Investor Webinars',
        description: 'Monthly live sessions covering market cycles, legal frameworks (PMA, SHGB vs SHM), tax optimization, and portfolio strategy',
        impact: 'Builds community and positions ASTRA Villa team as accessible domain experts',
        implementation: [
          'Webinar landing page with registration, past session replays, and topic calendar',
          'Integration with email notification system for reminders and follow-up materials',
          'Content repurposed into Market Intelligence Feed articles for SEO value',
        ],
        status: 'planned',
        route: null,
      },
    ],
  },
  {
    id: 'social-proof',
    title: 'Social Proof Signals',
    subtitle: 'Let satisfied users and partners validate the platform\'s value proposition',
    icon: Users,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    initiatives: [
      {
        title: 'Transaction Success Stories',
        description: 'Curated case studies showing real investment outcomes: purchase price, current valuation, yield achieved, time to close',
        impact: 'Concrete proof that the platform delivers results — most powerful trust signal for HNW investors',
        implementation: [
          'Deal narrative system with anonymized transaction data and investor testimonials',
          'Metrics displayed: ROI achieved, days to close, AI score accuracy vs actual outcome',
          'Featured on landing page hero section and property detail pages',
        ],
        status: 'planned',
        route: '/landing',
      },
      {
        title: 'Developer & Agent Partnerships',
        description: 'Public showcase of verified developer partners, certified agents, and institutional relationships',
        impact: 'Association with established brands transfers their credibility to the platform',
        implementation: [
          'Developer partnership portfolio with project counts and exclusive listing badges',
          'Agent leaderboard with performance metrics, response rates, and review scores',
          'Partnership tier system: Standard, Preferred, Exclusive — visible on listings',
        ],
        status: 'live',
        route: '/launch-radar',
      },
      {
        title: 'User Testimonial Content',
        description: 'Video and text testimonials from investors, owners, and agents highlighting platform value',
        impact: 'Authentic user voices create emotional connection and reduce perceived risk',
        implementation: [
          'Testimonial collection integrated into post-transaction feedback flow',
          'Video testimonials from key investors for landing page and social media',
          'Review system with verified purchase badges for authenticity',
        ],
        status: 'planned',
        route: null,
      },
    ],
  },
];

const TRUST_TIMELINE = [
  { quarter: 'Q1 2026', phase: 'Foundation', items: ['Launch verification badge system', 'Deploy AI opportunity scoring', 'Publish first market intelligence reports'], status: 'complete' },
  { quarter: 'Q2 2026', phase: 'Credibility', items: ['Release city trend reports for 10 cities', 'Onboard 5 developer partners', 'Launch agent certification program'], status: 'active' },
  { quarter: 'Q3 2026', phase: 'Authority', items: ['Host first investor webinar series', 'Publish 50+ transaction success stories', 'Launch video testimonial campaign'], status: 'upcoming' },
  { quarter: 'Q4 2026', phase: 'Leadership', items: ['Annual Indonesia Property Intelligence Report', 'Industry conference speaking engagements', 'Media partnership for thought leadership'], status: 'upcoming' },
];

const TRUST_METRICS = [
  { metric: 'Verified Listings Rate', value: '94%', target: '98%', icon: BadgeCheck },
  { metric: 'AI Score Accuracy', value: '87%', target: '92%', icon: Target },
  { metric: 'Avg. Trust Score', value: '78/100', target: '85/100', icon: Shield },
  { metric: 'Return Visit Rate', value: '62%', target: '70%', icon: Heart },
  { metric: 'NPS Score', value: '+41', target: '+50', icon: Star },
  { metric: 'Partner Satisfaction', value: '4.3/5', target: '4.6/5', icon: Handshake },
];

/* ─── Component ─── */

export default function BrandTrustStrategyPage() {
  const [activeTab, setActiveTab] = useState('pillars');
  const [expandedPillar, setExpandedPillar] = useState('integrity');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-chart-2" />
                </div>
                Brand Trust Strategy
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Long-term positioning as the authoritative property investment intelligence platform
              </p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-2/20 text-chart-2">
              <Lock className="h-3 w-3 mr-1.5" />
              Strategic Playbook
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="pillars">Trust Pillars</TabsTrigger>
            <TabsTrigger value="timeline">Roadmap</TabsTrigger>
            <TabsTrigger value="metrics">Trust Metrics</TabsTrigger>
          </TabsList>

          {/* ═══ PILLARS TAB ═══ */}
          <TabsContent value="pillars" className="space-y-4">
            {PILLARS.map((pillar) => {
              const PIcon = pillar.icon;
              const isExpanded = expandedPillar === pillar.id;
              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Card
                    className={cn(
                      'border bg-card transition-all cursor-pointer',
                      isExpanded ? 'border-border shadow-sm' : 'border-border hover:border-border/80'
                    )}
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
                        <Badge variant="secondary" className="text-[9px]">{pillar.initiatives.length} initiatives</Badge>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-3 mt-2">
                          {pillar.initiatives.map((init, i) => (
                            <div key={i} className="border border-border/30 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-foreground">{init.title}</p>
                                    <Badge variant="outline" className={cn(
                                      'text-[7px] px-1.5 py-0 h-3.5',
                                      init.status === 'live' ? 'text-chart-2 border-chart-2/30' :
                                      init.status === 'planned' ? 'text-chart-4 border-chart-4/30' :
                                      'text-muted-foreground border-border'
                                    )}>
                                      {init.status}
                                    </Badge>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{init.description}</p>
                                </div>
                                {init.route && (
                                  <Badge variant="outline" className="text-[8px] text-primary border-primary/20 flex-shrink-0 ml-2">
                                    {init.route}
                                  </Badge>
                                )}
                              </div>

                              {/* Impact */}
                              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-chart-2/5 border border-chart-2/10 mb-2.5">
                                <TrendingUp className="h-3 w-3 text-chart-2 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-chart-2 font-medium">{init.impact}</p>
                              </div>

                              {/* Implementation */}
                              <div className="space-y-1">
                                {init.implementation.map((step, si) => (
                                  <div key={si} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                                    <CheckCircle2 className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-muted-foreground">{step}</p>
                                  </div>
                                ))}
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

            {/* Trust equation */}
            <Card className="border border-primary/10 bg-card">
              <CardContent className="p-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Trust Equation</p>
                <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-foreground">
                  <Badge variant="outline" className="text-[10px]">Verified Data</Badge>
                  <span className="text-muted-foreground">+</span>
                  <Badge variant="outline" className="text-[10px]">Expert Intelligence</Badge>
                  <span className="text-muted-foreground">+</span>
                  <Badge variant="outline" className="text-[10px]">Social Proof</Badge>
                  <span className="text-muted-foreground">=</span>
                  <Badge className="text-[10px] bg-chart-2 text-chart-2-foreground">Investment Confidence</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ TIMELINE TAB ═══ */}
          <TabsContent value="timeline" className="space-y-3">
            {TRUST_TIMELINE.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className={cn(
                  'border bg-card',
                  q.status === 'active' && 'border-primary/20'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center',
                          q.status === 'complete' ? 'bg-chart-2/10' :
                          q.status === 'active' ? 'bg-primary/10' : 'bg-muted/30'
                        )}>
                          {q.status === 'complete' ? (
                            <CheckCircle2 className="h-4 w-4 text-chart-2" />
                          ) : q.status === 'active' ? (
                            <Sparkles className="h-4 w-4 text-primary" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        {i < TRUST_TIMELINE.length - 1 && (
                          <div className="w-px h-8 bg-border/30" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="outline" className="text-[9px] font-bold">{q.quarter}</Badge>
                          <p className="text-xs font-bold text-foreground">{q.phase}</p>
                          <Badge variant="outline" className={cn(
                            'text-[7px] px-1.5 py-0 h-3.5',
                            q.status === 'complete' ? 'text-chart-2 border-chart-2/30' :
                            q.status === 'active' ? 'text-primary border-primary/30' :
                            'text-muted-foreground border-border'
                          )}>
                            {q.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {q.items.map((item, ii) => (
                            <div key={ii} className="flex items-center gap-2">
                              <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />
                              <span className="text-[11px] text-muted-foreground">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ═══ METRICS TAB ═══ */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {TRUST_METRICS.map((m, i) => {
                const MIcon = m.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="border border-border bg-card">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <p className="text-[10px] text-muted-foreground font-medium">{m.metric}</p>
                          <MIcon className="h-3.5 w-3.5 text-muted-foreground/30" />
                        </div>
                        <p className="text-lg font-black text-foreground mt-1">{m.value}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] text-muted-foreground">Target: {m.target}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust maturity model */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Trust Maturity Model
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-1.5">
                {[
                  { level: 'Level 1: Awareness', desc: 'Users know the platform exists and see professional presentation', pct: 100, color: 'bg-muted/20' },
                  { level: 'Level 2: Credibility', desc: 'Verified badges, AI scores, and market intelligence establish competence', pct: 78, color: 'bg-chart-4/15' },
                  { level: 'Level 3: Reliability', desc: 'Consistent accuracy of predictions and quality of listings builds dependability', pct: 55, color: 'bg-primary/15' },
                  { level: 'Level 4: Advocacy', desc: 'Satisfied users actively recommend and refer — organic growth engine', pct: 32, color: 'bg-chart-2/15' },
                  { level: 'Level 5: Authority', desc: 'Industry recognizes ASTRA Villa as the definitive source of property intelligence', pct: 15, color: 'bg-chart-5/15' },
                ].map((l, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-40 flex-shrink-0">
                      <p className="text-[11px] font-medium text-foreground">{l.level}</p>
                      <p className="text-[9px] text-muted-foreground leading-tight">{l.desc}</p>
                    </div>
                    <div className="flex-1 h-6 bg-muted/15 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(5, l.pct)}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={cn('h-full rounded-lg', l.color)}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-[10px] font-bold text-foreground">{l.pct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strategic outcome */}
            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Strategic Outcome</p>
                    <p className="text-[11px] text-muted-foreground">
                      When users trust ASTRA Villa enough to make Rp 1B+ investment decisions through the platform without external validation, the trust strategy has succeeded. Current trajectory targets Level 4 (Advocacy) by Q4 2026.
                    </p>
                  </div>
                  <Badge className="bg-chart-2 text-chart-2-foreground text-xs flex-shrink-0">L4 by Q4</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
