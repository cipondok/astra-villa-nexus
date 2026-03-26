import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Zap, Crown, Layers, Wrench,
  BarChart3, ChevronRight, CheckCircle2, Target, ArrowRight,
  Clock, Sparkles, Lock, PieChart, Users, Building2,
  Percent, Star, Briefcase, Shield, Gift, Activity,
  Repeat, Bell, Award, Package, Scale, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Revenue Levers ─── */

const REVENUE_LEVERS = [
  {
    id: 'transaction',
    title: 'Transaction Optimization',
    subtitle: 'Accelerate deal velocity and increase per-transaction revenue',
    icon: Zap,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    revenueImpact: 'IDR 42B / yr',
    strategies: [
      {
        title: 'Competitive Offer Engagement',
        description: 'Enable multiple buyers to submit competing offers on the same property, creating natural price discovery and urgency',
        tactics: [
          'Multi-offer visibility system showing "X offers received" on listings',
          'Seller dashboard ranking offers by price, terms, and buyer qualification score',
          'AI Pricing Advisor nudges buyers toward competitive pricing based on comparable data',
        ],
        metrics: { kpi: 'Avg. Offer-to-Ask Ratio', current: '91%', target: '95%' },
        route: '/my-offers',
        status: 'live',
      },
      {
        title: 'Urgency Signals for Faster Closure',
        description: 'Surface real-time demand signals that create authentic urgency without manipulation',
        tactics: [
          'DemandHeatBadge (Hot/Trending/Popular) drives 2.3x faster inquiry-to-offer conversion',
          'LiveActivityTicker showing real-time platform stats creates FOMO effect',
          'Price Prediction alerts ("likely to increase 8% in 60 days") motivate action',
        ],
        metrics: { kpi: 'Avg. Days to Close', current: '34 days', target: '25 days' },
        route: '/flash-deals',
        status: 'live',
      },
      {
        title: 'Agent Performance Incentives',
        description: 'Reward agents who close deals faster with visibility boosts and commission bonuses',
        tactics: [
          'Agent Leaderboard with monthly rewards for top closers (badge + featured placement)',
          'Speed-to-close bonus: agents closing within 21 days earn 0.25% commission uplift',
          'CRM pipeline analytics help agents identify and prioritize high-conversion leads',
        ],
        metrics: { kpi: 'Agent Close Rate', current: '12%', target: '18%' },
        route: '/agent-crm',
        status: 'live',
      },
    ],
  },
  {
    id: 'premium',
    title: 'Premium Feature Monetization',
    subtitle: 'Convert intelligence depth into recurring subscription revenue',
    icon: Crown,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    revenueImpact: 'IDR 28B / yr',
    strategies: [
      {
        title: 'Investor Analytics Subscription',
        description: 'Tiered access to AI-powered analytics: portfolio tracking, ROI projection, market cycle detection',
        tactics: [
          'Free tier: basic property scoring + 5 AI requests/month',
          'Gold (IDR 499K/mo): full analytics + 50 AI requests + 5-year ROI projections',
          'Diamond (IDR 1.99M/mo): institutional dashboard + unlimited AI + private deals + exit timing',
        ],
        metrics: { kpi: 'Paid Conversion Rate', current: '4.2%', target: '8%' },
        route: '/membership',
        status: 'live',
      },
      {
        title: 'Featured Listing Packages',
        description: 'Paid visibility boosts for property owners and agents wanting premium placement',
        tactics: [
          'Featured badge + top-of-feed placement for 7/14/30 day packages',
          'Spotlight listing with enhanced media gallery and AI-generated description',
          'Performance analytics showing views, saves, and inquiry uplift from promotion',
        ],
        metrics: { kpi: 'Listing Promotion ARPU', current: 'IDR 850K', target: 'IDR 1.5M' },
        route: '/my-properties',
        status: 'live',
      },
      {
        title: 'Developer Launch Premium Placement',
        description: 'Premium packages for developers launching new projects on the platform',
        tactics: [
          'Launch Radar featured slot with countdown timer and pre-registration capture',
          'AI-generated demand forecast report for developer decision-making',
          'Exclusive 48-hour early access notification to Diamond investor segment',
        ],
        metrics: { kpi: 'Developer Package Rev', current: 'IDR 2.1B', target: 'IDR 5B' },
        route: '/launch-radar',
        status: 'live',
      },
    ],
  },
  {
    id: 'marketplace',
    title: 'Service Marketplace Expansion',
    subtitle: 'Capture post-transaction revenue through property services ecosystem',
    icon: Wrench,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    revenueImpact: 'IDR 18B / yr',
    strategies: [
      {
        title: 'Renovation & Repair Margins',
        description: 'Platform commission on renovation and repair bookings matched to property owners',
        tactics: [
          '10-category vendor marketplace with verified service providers',
          '8-12% platform commission on completed service bookings',
          'AI-recommended services based on property age, type, and condition assessment',
        ],
        metrics: { kpi: 'Service GMV', current: 'IDR 3.2B', target: 'IDR 12B' },
        route: '/services-marketplace',
        status: 'live',
      },
      {
        title: 'Legal Documentation Fees',
        description: 'Facilitation fees for legal services: title verification, AJB/PPJB processing, tax consultation',
        tactics: [
          'Integrated legal services workflow with document submission and tracking',
          'Fixed-fee packages for common legal needs (SHM processing, AJB preparation)',
          'Premium rush processing for time-sensitive transactions at 1.5x standard fee',
        ],
        metrics: { kpi: 'Legal Service Rev', current: 'IDR 1.8B', target: 'IDR 4B' },
        route: '/legal-services',
        status: 'live',
      },
      {
        title: 'Property Management Partnerships',
        description: 'Revenue share from property management services for investor-owned rental properties',
        tactics: [
          'Tenant placement service with 1-month rent commission',
          'Ongoing management referral: 5% of management fee as platform cut',
          'Integration with Ownership Lifecycle module for PBB and maintenance tracking',
        ],
        metrics: { kpi: 'Mgmt Partner Rev', current: 'IDR 0.4B', target: 'IDR 2B' },
        route: '/ownership-lifecycle',
        status: 'planned',
      },
    ],
  },
  {
    id: 'retention',
    title: 'Investor Retention Revenue',
    subtitle: 'Lock in long-term value through exclusive access and ongoing intelligence',
    icon: Repeat,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    revenueImpact: 'IDR 15B / yr',
    strategies: [
      {
        title: 'Early Opportunity Access Tiers',
        description: 'Paid early access to elite deals, pre-launch projects, and off-market properties',
        tactics: [
          'Diamond members get 48-hour early access to new listings scoring ≥85',
          'Off-market deal flow exclusively for Platinum+ subscribers',
          'Pre-launch developer pricing locked 72 hours before public release',
        ],
        metrics: { kpi: 'Tier Retention Rate', current: '71%', target: '85%' },
        route: '/recommendations',
        status: 'live',
      },
      {
        title: 'Portfolio Performance Subscription',
        description: 'Ongoing portfolio intelligence: performance tracking, rebalancing signals, exit timing alerts',
        tactics: [
          'Monthly portfolio health report with appreciation tracking and yield analysis',
          'AI-driven rebalancing recommendations based on market cycle position',
          'Exit timing signals: "optimal sell window" alerts based on price prediction engine',
        ],
        metrics: { kpi: 'Portfolio Sub ARPU', current: 'IDR 380K', target: 'IDR 750K' },
        route: '/portfolio-command-center',
        status: 'live',
      },
    ],
  },
];

const REVENUE_MIX = [
  { stream: 'Transaction Commissions', pct: 38, amount: 'IDR 42B', color: 'bg-chart-1/20' },
  { stream: 'Premium Subscriptions', pct: 26, amount: 'IDR 28B', color: 'bg-primary/20' },
  { stream: 'Service Marketplace', pct: 17, amount: 'IDR 18B', color: 'bg-chart-4/20' },
  { stream: 'Investor Retention', pct: 14, amount: 'IDR 15B', color: 'bg-chart-5/20' },
  { stream: 'Developer Partnerships', pct: 5, amount: 'IDR 5.5B', color: 'bg-chart-2/20' },
];

const ARPU_PROGRESSION = [
  { period: 'Month 1-3', arpu: 'IDR 45K', drivers: 'Free trial conversions, basic listings' },
  { period: 'Month 4-6', arpu: 'IDR 120K', drivers: 'Subscription upgrades, first service bookings' },
  { period: 'Month 7-12', arpu: 'IDR 285K', drivers: 'Portfolio tools, featured listings, legal services' },
  { period: 'Year 2', arpu: 'IDR 520K', drivers: 'Diamond tier, developer packages, management referrals' },
  { period: 'Year 3', arpu: 'IDR 890K', drivers: 'Institutional APIs, cross-sell maturity, high-value retention' },
];

/* ─── Component ─── */

export default function RevenueOptimizationPage() {
  const [activeTab, setActiveTab] = useState('levers');
  const [expandedLever, setExpandedLever] = useState('transaction');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-chart-1" />
                </div>
                Revenue Optimization Framework
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Diversified monetization engine beyond listing commission dependency
              </p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-1/20 text-chart-1">
              <Target className="h-3 w-3 mr-1.5" />
              IDR 108.5B Target ARR
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="levers">Revenue Levers</TabsTrigger>
            <TabsTrigger value="mix">Revenue Mix</TabsTrigger>
            <TabsTrigger value="arpu">ARPU Growth</TabsTrigger>
          </TabsList>

          {/* ═══ LEVERS TAB ═══ */}
          <TabsContent value="levers" className="space-y-4">
            {REVENUE_LEVERS.map((lever) => {
              const LIcon = lever.icon;
              const isExpanded = expandedLever === lever.id;
              return (
                <motion.div
                  key={lever.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Card
                    className={cn(
                      'border bg-card transition-all cursor-pointer',
                      isExpanded ? 'border-border shadow-sm' : 'border-border hover:border-border/80'
                    )}
                    onClick={() => setExpandedLever(isExpanded ? '' : lever.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', lever.bgColor)}>
                          <LIcon className={cn('h-5 w-5', lever.color)} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{lever.title}</CardTitle>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{lever.subtitle}</p>
                        </div>
                        <Badge className={cn('text-[9px]', lever.bgColor, lever.color, 'border-0')}>{lever.revenueImpact}</Badge>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-3 mt-2">
                          {lever.strategies.map((s, si) => (
                            <div key={si} className="border border-border/30 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-foreground">{s.title}</p>
                                    <Badge variant="outline" className={cn(
                                      'text-[7px] px-1.5 py-0 h-3.5',
                                      s.status === 'live' ? 'text-chart-2 border-chart-2/30' : 'text-chart-4 border-chart-4/30'
                                    )}>
                                      {s.status}
                                    </Badge>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.description}</p>
                                </div>
                                <Badge variant="outline" className="text-[8px] text-primary border-primary/20 flex-shrink-0 ml-2">
                                  {s.route}
                                </Badge>
                              </div>

                              {/* Tactics */}
                              <div className="space-y-1 mb-2.5">
                                {s.tactics.map((t, ti) => (
                                  <div key={ti} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                                    <CheckCircle2 className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-muted-foreground">{t}</p>
                                  </div>
                                ))}
                              </div>

                              {/* KPI */}
                              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                                <BarChart3 className="h-3 w-3 text-primary flex-shrink-0" />
                                <div className="flex items-center gap-4 text-[10px]">
                                  <span className="text-primary font-medium">{s.metrics.kpi}</span>
                                  <span className="text-muted-foreground">Current: <strong className="text-foreground">{s.metrics.current}</strong></span>
                                  <span className="text-muted-foreground">Target: <strong className="text-chart-2">{s.metrics.target}</strong></span>
                                </div>
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
          </TabsContent>

          {/* ═══ REVENUE MIX TAB ═══ */}
          <TabsContent value="mix" className="space-y-4">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  Target Revenue Mix (Year 3)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                {REVENUE_MIX.map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-40 flex-shrink-0">
                      <p className="text-[11px] font-medium text-foreground">{r.stream}</p>
                      <p className="text-[9px] text-muted-foreground">{r.amount}</p>
                    </div>
                    <div className="flex-1 h-7 bg-muted/15 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={cn('h-full rounded-lg', r.color)}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-[10px] font-bold text-foreground">{r.pct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Diversification target */}
            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Scale className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Diversification Goal</p>
                    <p className="text-[11px] text-muted-foreground">
                      Reduce transaction commission dependency from 65% (current) to 38% of total revenue by Year 3. Non-commission streams (subscriptions + services + retention) should exceed 60% to create recession-resilient recurring revenue base.
                    </p>
                  </div>
                  <Badge className="bg-chart-2 text-chart-2-foreground text-xs flex-shrink-0">62% recurring</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Revenue per segment */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Revenue per User Segment
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { segment: 'Free Users', arpu: 'IDR 0', ltv: 'IDR 0 (conversion funnel)', pct: '72%', color: 'border-border bg-muted/5' },
                    { segment: 'Gold / Platinum', arpu: 'IDR 620K/mo', ltv: 'IDR 8.9M (14mo avg)', pct: '22%', color: 'border-chart-4/30 bg-chart-4/5' },
                    { segment: 'Diamond / VIP', arpu: 'IDR 2.4M/mo', ltv: 'IDR 52M (22mo avg)', pct: '6%', color: 'border-chart-5/30 bg-chart-5/5' },
                  ].map((s, i) => (
                    <div key={i} className={cn('rounded-lg border p-3', s.color)}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-bold text-foreground">{s.segment}</p>
                        <Badge variant="outline" className="text-[8px]">{s.pct} of users</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">ARPU: <strong className="text-foreground">{s.arpu}</strong></p>
                      <p className="text-[10px] text-muted-foreground">LTV: <strong className="text-foreground">{s.ltv}</strong></p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ ARPU TAB ═══ */}
          <TabsContent value="arpu" className="space-y-4">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  ARPU Growth Trajectory
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                {ARPU_PROGRESSION.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center',
                        i <= 1 ? 'bg-chart-2/10' : i <= 3 ? 'bg-primary/10' : 'bg-chart-5/10'
                      )}>
                        <span className="text-[9px] font-bold text-foreground">{i + 1}</span>
                      </div>
                      {i < ARPU_PROGRESSION.length - 1 && <div className="w-px h-4 bg-border/30" />}
                    </div>
                    <div className="flex-1 p-3 rounded-lg border border-border/30 bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-[9px] font-bold">{a.period}</Badge>
                        <span className="text-sm font-black text-foreground">{a.arpu}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{a.drivers}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Monetization flywheel */}
            <Card className="border border-primary/10 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Monetization Flywheel
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    'Quality Listings',
                    'Investor Trust',
                    'Transaction Volume',
                    'Revenue Growth',
                    'Better AI & Tools',
                    'Premium Value',
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Badge variant={i === 0 ? 'default' : 'outline'} className="text-[9px]">{step}</Badge>
                      {i < 5 && <ArrowRight className="h-3 w-3 text-muted-foreground/30" />}
                    </div>
                  ))}
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <Badge className="text-[9px] bg-primary text-primary-foreground">↻ Repeat</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  Each revenue stream reinforces the next: transaction data improves AI accuracy → better AI attracts premium subscribers → subscriber activity generates service marketplace demand → successful outcomes drive referrals → more listings → repeat.
                </p>
              </CardContent>
            </Card>

            {/* Key levers summary */}
            <Card className="border border-chart-1/15 bg-chart-1/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-chart-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">ARPU Acceleration Levers</p>
                    <p className="text-[11px] text-muted-foreground">
                      Top 3 ARPU drivers: (1) Gold→Diamond upgrade path via Portfolio Command Center lock-in, (2) Service marketplace cross-sell at point of transaction close, (3) Developer launch packages bundled with investor early-access notifications.
                    </p>
                  </div>
                  <Badge className="bg-chart-1 text-chart-1-foreground text-xs flex-shrink-0">20x ARPU</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
