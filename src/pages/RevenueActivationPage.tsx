import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  DollarSign, Target, Zap, Building2, Wrench, TrendingUp,
  ChevronRight, CheckCircle2, ArrowRight, Clock, Sparkles,
  BarChart3, Users, Star, FileText, Shield, Award,
  CircleDollarSign, Handshake, Scale, Flag, Flame, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Data ─── */

const REVENUE_PATHS = [
  {
    id: 'transaction',
    title: 'Transaction Commission',
    subtitle: 'Close the first deal — the most powerful proof of marketplace viability',
    icon: CircleDollarSign,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    revenueTarget: 'IDR 30–75M (first deal)',
    timeline: 'Month 1–3',
    priority: 'P0 — Critical',
    actions: [
      {
        title: 'Identify 5 Highest-Probability Deal Candidates',
        description: 'Review current listings and inquiries — find properties with active buyer interest and motivated sellers',
        steps: [
          'Pull inquiry data: which listings have 3+ inquiries in the last 30 days?',
          'Cross-reference with AI opportunity score ≥75 for deal quality validation',
          'Contact both listing agent AND inquiring buyers to assess deal readiness',
          'Rank by close probability: price alignment, buyer financing status, seller urgency',
        ],
        outcome: '5 deals in active pipeline with assessed close probability',
        route: '/agent-crm',
      },
      {
        title: 'Hands-On Negotiation Facilitation',
        description: 'Don\'t wait for buyers and sellers to figure it out — actively guide the negotiation',
        steps: [
          'Use AI Pricing Advisor to establish fair market value anchor for both parties',
          'Apply Negotiation Psychology Framework: confidence anchoring + win-win positioning',
          'Facilitate offer structure: suggest flexible terms (payment schedule, handover timing)',
          'Provide transaction process guidance: legal checklist, timeline, document requirements',
        ],
        outcome: 'At least 1 deal moves to offer stage with platform-facilitated negotiation',
        route: '/negotiation-psychology',
      },
      {
        title: 'Close and Commission Collection',
        description: 'Ensure the platform captures its commission — establish the revenue collection process',
        steps: [
          'Standard commission: 1.5–2.5% of transaction value (split with listing agent)',
          'Platform commission agreement signed before deal facilitation begins',
          'Payment collection via Midtrans integration at closing or escrow release',
          'Document: transaction value, commission earned, days to close, parties involved',
        ],
        outcome: 'First commission collected — IDR 30–75M on a IDR 2–3B property',
        route: '/my-offers',
      },
    ],
  },
  {
    id: 'developer',
    title: 'Developer Promotion Revenue',
    subtitle: 'Monetize developer demand for visibility and intelligence — faster than waiting for transactions',
    icon: Building2,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    revenueTarget: 'IDR 15–50M (first package)',
    timeline: 'Month 2–4',
    priority: 'P1 — High',
    actions: [
      {
        title: 'Design Featured Project Placement Package',
        description: 'Create a clear, priced package that developers can say yes or no to immediately',
        steps: [
          'Launch Radar featured slot: 30-day premium placement with countdown timer — IDR 15M',
          'AI demand forecast report: area absorption prediction + pricing band analysis — IDR 10M',
          'Investor early access notification: 48-hour pre-launch alert to Diamond segment — IDR 8M',
          'Bundle all three as "Launch Intelligence Package" at IDR 25M (vs. IDR 33M à la carte)',
        ],
        outcome: 'Packaged pricing ready for developer pitch conversations',
        route: '/launch-radar',
      },
      {
        title: 'Sell First Package to Flagship Developer',
        description: 'Use the flagship partnership relationship to convert free pilot into paid engagement',
        steps: [
          'After free pilot period (Month 1–2), present performance data: views, inquiries, saves',
          'Propose paid continuation with enhanced features (featured slot + demand report)',
          'Offer introductory pricing: 50% discount on first paid package to reduce friction',
          'Alternative: if flagship developer declines, approach 2 additional developers with paid-first offer',
        ],
        outcome: 'First developer promotion package sold — IDR 12.5–25M revenue',
        route: '/developer-campaign',
      },
    ],
  },
  {
    id: 'services',
    title: 'Service Marketplace Pilot',
    subtitle: 'Test service commission model with one partner — validate before scaling',
    icon: Wrench,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    revenueTarget: 'IDR 2–8M (first booking)',
    timeline: 'Month 3–5',
    priority: 'P2 — Medium',
    actions: [
      {
        title: 'Onboard One Service Partner',
        description: 'Start with the highest-demand category: legal documentation OR renovation services',
        steps: [
          'Legal services: partner with one notaris/PPAT for SHM processing and AJB preparation',
          'OR Renovation: partner with one verified contractor for villa renovation quotes',
          'Agreement: 8–12% platform commission on completed bookings referred through ASTRA',
          'Partner profile live on Services Marketplace with portfolio, pricing, and reviews',
        ],
        outcome: '1 verified service partner live with commission agreement signed',
        route: '/services-marketplace',
      },
      {
        title: 'Generate First Service Booking',
        description: 'Proactively connect existing property owners/buyers with the service partner',
        steps: [
          'Identify: recent property buyers or owners who inquired about legal/renovation topics',
          'Warm introduction: "we partnered with [Partner] — they can help with your SHM processing"',
          'Track: booking submitted → service started → service completed → commission invoiced',
          'Document: service value, platform commission, customer satisfaction score',
        ],
        outcome: 'First service booking completed — IDR 2–8M commission on IDR 20–80M service value',
        route: '/legal-services',
      },
    ],
  },
];

const MILESTONE_TARGETS = [
  { milestone: 'First Transaction Commission', target: 'IDR 30–75M', timeline: 'Month 3', status: 'in-progress', icon: CircleDollarSign },
  { milestone: 'First Developer Package Sale', target: 'IDR 12.5–25M', timeline: 'Month 4', status: 'planned', icon: Building2 },
  { milestone: 'First Service Booking Commission', target: 'IDR 2–8M', timeline: 'Month 5', status: 'planned', icon: Wrench },
  { milestone: 'First Consistent Monthly Revenue', target: 'IDR 50M+/mo', timeline: 'Month 6', status: 'planned', icon: TrendingUp },
  { milestone: 'Revenue Case Study Published', target: '3 revenue streams proven', timeline: 'Month 7', status: 'planned', icon: FileText },
];

const INVESTOR_NARRATIVE_POINTS = [
  'Transaction commission validates core marketplace model — buyers and sellers willing to pay for intelligence-driven matching',
  'Developer promotion revenue proves B2B willingness-to-pay for demand intelligence — recurring and scalable',
  'Service marketplace commission demonstrates post-transaction revenue capture — extends LTV beyond single deal',
  'Three revenue streams active within 6 months shows diversification capability — not single-stream dependent',
  'Revenue per transaction increasing as AI accuracy improves — unit economics strengthen with scale',
];

/* ─── Component ─── */

export default function RevenueActivationPage() {
  const [activeTab, setActiveTab] = useState('paths');
  const [expandedPath, setExpandedPath] = useState('transaction');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-chart-2" />
                </div>
                Revenue Activation Roadmap
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Path to first meaningful monetization milestone
              </p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-2/20 text-chart-2">
              <Target className="h-3 w-3 mr-1.5" />
              IDR 50M+/mo by Month 6
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="paths">Revenue Paths</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="narrative">Investor Narrative</TabsTrigger>
          </TabsList>

          {/* ═══ PATHS TAB ═══ */}
          <TabsContent value="paths" className="space-y-4">
            {REVENUE_PATHS.map((path) => {
              const PIcon = path.icon;
              const isExpanded = expandedPath === path.id;
              return (
                <motion.div key={path.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card
                    className={cn('border bg-card transition-all cursor-pointer', isExpanded ? 'border-border shadow-sm' : 'border-border hover:border-border/80')}
                    onClick={() => setExpandedPath(isExpanded ? '' : path.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', path.bgColor)}>
                          <PIcon className={cn('h-5 w-5', path.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{path.title}</CardTitle>
                            <Badge variant="outline" className="text-[8px]">{path.timeline}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{path.subtitle}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge className={cn('text-[9px] border-0', path.bgColor, path.color)}>{path.revenueTarget}</Badge>
                          <p className="text-[8px] text-muted-foreground mt-0.5">{path.priority}</p>
                        </div>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-3 mt-2">
                          {path.actions.map((a, ai) => (
                            <div key={ai} className="border border-border/30 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5 font-bold">Step {ai + 1}</Badge>
                                    <p className="text-xs font-bold text-foreground">{a.title}</p>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.description}</p>
                                </div>
                                {a.route && (
                                  <Badge variant="outline" className="text-[8px] text-primary border-primary/20 flex-shrink-0 ml-2">{a.route}</Badge>
                                )}
                              </div>

                              <div className="space-y-1 mb-2.5">
                                {a.steps.map((s, si) => (
                                  <div key={si} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                                    <CheckCircle2 className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-muted-foreground">{s}</p>
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-chart-2/5 border border-chart-2/10">
                                <Target className="h-3 w-3 text-chart-2 flex-shrink-0" />
                                <p className="text-[10px] text-chart-2 font-medium">{a.outcome}</p>
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

            {/* Revenue flow */}
            <Card className="border border-chart-2/10 bg-card">
              <CardContent className="p-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Activation Sequence</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Close 1st Deal', 'Sell Dev Package', 'Book 1st Service', 'Hit IDR 50M/mo', 'Publish Case Study'].map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Badge variant={i === 0 ? 'default' : 'outline'} className="text-[9px]">{s}</Badge>
                      {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground/30" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ MILESTONES TAB ═══ */}
          <TabsContent value="milestones" className="space-y-3">
            {MILESTONE_TARGETS.map((m, i) => {
              const MIcon = m.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className={cn('border bg-card', m.status === 'in-progress' && 'border-chart-2/20')}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          m.status === 'in-progress' ? 'bg-chart-2/10' : 'bg-muted/20'
                        )}>
                          {m.status === 'in-progress' ? (
                            <Flame className="h-4 w-4 text-chart-2" />
                          ) : (
                            <MIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-foreground">{m.milestone}</p>
                            <Badge variant="outline" className={cn(
                              'text-[7px] px-1.5 py-0 h-3.5',
                              m.status === 'in-progress' ? 'text-chart-2 border-chart-2/30' : 'text-muted-foreground border-border'
                            )}>
                              {m.status}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Target: {m.timeline}</p>
                        </div>
                        <Badge className={cn('text-[9px] border-0', m.status === 'in-progress' ? 'bg-chart-2/10 text-chart-2' : 'bg-muted/20 text-muted-foreground')}>
                          {m.target}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            <Card className="border border-chart-1/15 bg-chart-1/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-chart-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Why First Revenue Matters</p>
                    <p className="text-[11px] text-muted-foreground">
                      The first IDR 1 earned is worth more than any feature built. It validates that someone will pay for this platform's value. Every subsequent fundraising conversation, team hire, and strategic decision becomes easier once revenue is real — not projected.
                    </p>
                  </div>
                  <Badge className="bg-chart-1 text-chart-1-foreground text-xs flex-shrink-0">IDR 1 first</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ NARRATIVE TAB ═══ */}
          <TabsContent value="narrative" className="space-y-4">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Revenue Case Study Framework
                </CardTitle>
                <p className="text-[10px] text-muted-foreground">Document each revenue milestone for investor pitch deck</p>
              </CardHeader>
              <CardContent className="pt-2 space-y-1.5">
                {INVESTOR_NARRATIVE_POINTS.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/10 border border-border/20"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-chart-2 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-foreground">{p}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Case study template */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4 text-chart-4" />
                  Case Study Template
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { section: 'The Problem', content: 'Indonesian property investors lack data-driven decision tools — manual research, opaque pricing, fragmented services' },
                    { section: 'Our Solution', content: 'AI-powered intelligence platform: scoring, prediction, facilitated transactions, integrated services' },
                    { section: 'Revenue Proof', content: '3 active revenue streams within 6 months — commission, B2B promotion, service marketplace' },
                    { section: 'Growth Signal', content: 'IDR 50M+/mo revenue, 35% Bali market share, 1,200 active investors, 5 developer partners' },
                  ].map((s, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/30 bg-card">
                      <p className="text-[10px] font-bold text-primary mb-1">{s.section}</p>
                      <p className="text-[10px] text-muted-foreground">{s.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Seed Round Readiness</p>
                    <p className="text-[11px] text-muted-foreground">
                      With 3 proven revenue streams and IDR 50M+/mo consistent income, the platform demonstrates business model viability. This transforms the fundraising conversation from "we think we can monetize" to "we are monetizing — we need capital to scale what's working."
                    </p>
                  </div>
                  <Badge className="bg-chart-2 text-chart-2-foreground text-xs flex-shrink-0">Seed Ready</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
