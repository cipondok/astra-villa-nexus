import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  Crown, Diamond, Star, Shield, Lock, Eye, Bell, Users,
  TrendingUp, MessageSquare, Headphones, BarChart3, Building2,
  Zap, ArrowRight, CheckCircle2, Sparkles, Clock, Target,
  DollarSign, Award, Gem, Globe, ChevronRight, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════
   TIER DATA
   ═══════════════════════════════════════════ */

interface TierFeature {
  feature: string;
  free: string | boolean;
  gold: string | boolean;
  platinum: string | boolean;
  diamond: string | boolean;
}

const COMPARISON: TierFeature[] = [
  { feature: 'AI Opportunity Alerts', free: '3/month', gold: 'Unlimited', platinum: 'Unlimited + Priority', diamond: '24h Early Access' },
  { feature: 'ROI Projections', free: '3-year', gold: '5-year', platinum: '10-year + Monte Carlo', diamond: '10-year + Custom Scenarios' },
  { feature: 'Property Comparison', free: '2 properties', gold: '5 properties', platinum: '10 properties', diamond: 'Unlimited' },
  { feature: 'Market Intelligence Feed', free: 'Weekly digest', gold: 'Daily updates', platinum: 'Real-time + Trends', diamond: 'Real-time + Predictive' },
  { feature: 'Developer Launch Access', free: false, gold: 'General release', platinum: '48h early access', diamond: 'Private pre-launch briefing' },
  { feature: 'Off-Market Deals', free: false, gold: false, platinum: 'Curated monthly', diamond: 'Full access + First right' },
  { feature: 'Investor Discussion Group', free: false, gold: false, platinum: 'Read-only', diamond: 'Full access + Host events' },
  { feature: 'Portfolio Analytics', free: 'Basic overview', gold: 'Performance tracking', platinum: 'Institutional-grade', diamond: 'Institutional + Custom reports' },
  { feature: 'Negotiation Assistant', free: false, gold: 'AI-powered', platinum: 'AI + Market comps', diamond: 'AI + Dedicated advisor' },
  { feature: 'Support', free: 'Community', gold: 'Email (48h)', platinum: 'Priority (12h)', diamond: 'Dedicated concierge (2h)' },
  { feature: 'Investment Consultations', free: false, gold: false, platinum: '1/quarter', diamond: 'Monthly + On-demand' },
];

interface TierConfig {
  name: string;
  label: string;
  price: string;
  period: string;
  icon: typeof Star;
  color: string;
  bgColor: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  tagline: string;
  idealFor: string;
  highlights: string[];
}

const TIERS: TierConfig[] = [
  {
    name: 'free',
    label: 'Explorer',
    price: 'Free',
    period: '',
    icon: Eye,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/20',
    borderColor: 'border-border',
    gradientFrom: 'from-muted/10',
    gradientTo: 'to-muted/5',
    tagline: 'Discover the platform',
    idealFor: 'Casual browsers and first-time visitors',
    highlights: ['Browse all listings', 'Basic AI scoring', '3 opportunity alerts/month'],
  },
  {
    name: 'gold',
    label: 'Insider',
    price: 'Rp 499K',
    period: '/month',
    icon: Star,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    gradientFrom: 'from-amber-500/10',
    gradientTo: 'to-amber-600/5',
    tagline: 'Invest with confidence',
    idealFor: 'Active investors making 1-2 acquisitions per year',
    highlights: ['Unlimited AI alerts', '5-year ROI projections', 'Negotiation Assistant', 'Email support'],
  },
  {
    name: 'platinum',
    label: 'Strategist',
    price: 'Rp 1.49M',
    period: '/month',
    icon: Shield,
    color: 'text-sky-400',
    bgColor: 'bg-sky-400/10',
    borderColor: 'border-sky-400/20',
    gradientFrom: 'from-sky-400/10',
    gradientTo: 'to-sky-500/5',
    tagline: 'Outsmart the market',
    idealFor: 'Serious investors building multi-property portfolios',
    highlights: ['48h early developer access', 'Institutional analytics', 'Off-market deals monthly', 'Quarterly consultations'],
  },
  {
    name: 'diamond',
    label: 'Inner Circle',
    price: 'Rp 4.99M',
    period: '/month',
    icon: Diamond,
    color: 'text-violet-400',
    bgColor: 'bg-violet-400/10',
    borderColor: 'border-violet-400/20',
    gradientFrom: 'from-violet-400/10',
    gradientTo: 'to-violet-500/5',
    tagline: 'First access. Private deals. Dedicated support.',
    idealFor: 'HNW investors and fund managers seeking institutional-grade intelligence',
    highlights: ['24h early opportunity alerts', 'Private pre-launch briefings', 'Off-market first right', 'Dedicated concierge'],
  },
];

/* ═══════════════════════════════════════════
   EXCLUSIVE CLUB PILLARS
   ═══════════════════════════════════════════ */

const CLUB_PILLARS = [
  {
    title: 'Exclusive Access',
    subtitle: 'See opportunities before the broader market',
    icon: Lock,
    color: 'text-violet-400',
    bgColor: 'bg-violet-400/10',
    features: [
      { name: 'Pre-Launch Developer Briefings', detail: 'Private presentations from developers 2-4 weeks before public release. Includes project financials, absorption forecasts, and first-pick unit selection.' },
      { name: 'Invitation-Only Deal Alerts', detail: 'Properties that never hit the public marketplace — off-market opportunities from distressed sellers, portfolio liquidations, and developer closeout units.' },
      { name: 'Deep Analytics Access', detail: 'Institutional-grade dashboards with geographic diversification analysis, absorption risk indicators, and Monte Carlo ROI simulations.' },
    ],
  },
  {
    title: 'Networking Value',
    subtitle: 'Intelligence multiplied through community',
    icon: Users,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    features: [
      { name: 'Private Investor Circle', detail: 'Curated discussion group limited to Diamond members. Share deal insights, co-invest on projects, and access collective market intelligence.' },
      { name: 'Curated Deal Newsletters', detail: 'Weekly handpicked opportunities with founder commentary — not automated, but personally selected based on market conditions and member profiles.' },
      { name: 'Quarterly Investor Roundtable', detail: 'Virtual meetup with platform founders, top-performing agents, and fellow investors. Market outlook presentations + Q&A.' },
    ],
  },
  {
    title: 'Service Privileges',
    subtitle: 'White-glove treatment for high-value decisions',
    icon: Headphones,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    features: [
      { name: 'Dedicated Concierge', detail: '2-hour response SLA. Named account manager who knows your portfolio, preferences, and investment goals. Not a ticket — a relationship.' },
      { name: 'Investment Consultations', detail: 'Monthly 1-on-1 sessions with market analysts. Portfolio review, opportunity assessment, and strategic guidance tailored to your goals.' },
      { name: 'Legal & Due Diligence Fast Track', detail: 'Priority access to verified legal consultants for SHM/AJB processing, tax advisory, and contract review with discounted rates.' },
    ],
  },
];

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function InvestorClubPage() {
  const [activeTab, setActiveTab] = useState('tiers');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-400/10 flex items-center justify-center">
                  <Diamond className="h-5 w-5 text-violet-400" />
                </div>
                Investor Membership Club
              </h1>
              <p className="text-sm text-muted-foreground mt-1 italic">
                "Designed for investors seeking intelligent property opportunities before the broader market."
              </p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-violet-400/20 text-violet-400">
              <Crown className="h-3 w-3 mr-1.5" />4 tiers
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="tiers">Membership Tiers</TabsTrigger>
            <TabsTrigger value="club">Inner Circle</TabsTrigger>
            <TabsTrigger value="comparison">Feature Matrix</TabsTrigger>
          </TabsList>

          {/* ═══ TIERS ═══ */}
          <TabsContent value="tiers">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TIERS.map((tier, i) => {
                const TIcon = tier.icon;
                const isDiamond = tier.name === 'diamond';
                return (
                  <motion.div key={tier.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className={cn(
                      'border h-full flex flex-col transition-all',
                      isDiamond ? 'border-violet-400/30 shadow-lg shadow-violet-400/5' : tier.borderColor,
                      'bg-card'
                    )}>
                      {isDiamond && (
                        <div className="px-4 pt-3">
                          <Badge className="bg-violet-400/15 text-violet-400 border-violet-400/20 text-[7px]" variant="outline">
                            <Sparkles className="h-2 w-2 mr-0.5" /> Most Exclusive
                          </Badge>
                        </div>
                      )}
                      <CardHeader className={cn('pb-3', isDiamond && 'pt-2')}>
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3', tier.bgColor)}>
                          <TIcon className={cn('h-6 w-6', tier.color)} />
                        </div>
                        <CardTitle className="text-base">{tier.label}</CardTitle>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-foreground">{tier.price}</span>
                          {tier.period && <span className="text-[10px] text-muted-foreground">{tier.period}</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">{tier.tagline}</p>
                      </CardHeader>
                      <CardContent className="pt-0 flex-1 flex flex-col">
                        <p className="text-[9px] text-muted-foreground mb-3">
                          <span className="font-bold">Ideal for:</span> {tier.idealFor}
                        </p>
                        <div className="space-y-1.5 flex-1">
                          {tier.highlights.map((h, j) => (
                            <div key={j} className="flex items-start gap-1.5">
                              <CheckCircle2 className={cn('h-3 w-3 flex-shrink-0 mt-0.5', tier.color)} />
                              <p className="text-[10px] text-foreground">{h}</p>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant={isDiamond ? 'default' : 'outline'}
                          size="sm"
                          className={cn('w-full mt-4 text-[10px]', isDiamond && 'bg-violet-500 hover:bg-violet-600 text-white')}
                        >
                          {tier.name === 'free' ? 'Get Started' : isDiamond ? 'Apply for Membership' : 'Subscribe'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <Card className="border border-primary/15 bg-primary/3 mt-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Pricing Philosophy</p>
                    <p className="text-[11px] text-muted-foreground">
                      Each tier is priced relative to the value of a single property insight it unlocks. Diamond at Rp 4.99M/month is less than 0.01% of a typical Rp 5B property transaction — one good deal more than pays for a lifetime of membership. The question isn't "can I afford it?" — it's "can I afford to miss the next Elite opportunity?"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ INNER CIRCLE ═══ */}
          <TabsContent value="club" className="space-y-4">
            {/* Positioning Banner */}
            <Card className="border border-violet-400/20 bg-gradient-to-br from-violet-400/5 to-primary/5">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-400/10 flex items-center justify-center flex-shrink-0">
                    <Gem className="h-6 w-6 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-foreground">The Inner Circle</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      A membership designed around one principle: the most valuable investment advantage is information asymmetry. 
                      Inner Circle members don't compete with the market — they move before it.
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      {[
                        { icon: Clock, label: '24h early alerts' },
                        { icon: Lock, label: 'Off-market first right' },
                        { icon: Headphones, label: '2h concierge SLA' },
                      ].map((item, i) => {
                        const IIcon = item.icon;
                        return (
                          <div key={i} className="flex items-center gap-1.5">
                            <IIcon className="h-3 w-3 text-violet-400" />
                            <span className="text-[9px] font-bold text-foreground">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Club Pillars */}
            {CLUB_PILLARS.map((pillar, i) => {
              const PIcon = pillar.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="border border-border bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', pillar.bgColor)}>
                          <PIcon className={cn('h-5 w-5', pillar.color)} />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{pillar.title}</CardTitle>
                          <p className="text-[10px] text-muted-foreground">{pillar.subtitle}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {pillar.features.map((f, j) => (
                        <div key={j} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className={cn('h-3 w-3', pillar.color)} />
                            <p className="text-xs font-bold text-foreground">{f.name}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{f.detail}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Heart className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Exclusivity Principle</p>
                    <p className="text-[11px] text-muted-foreground">
                      The Inner Circle is application-based, not just subscription-based. Members are vetted for genuine investment intent — 
                      this protects the community's signal quality and ensures every member contributes to (not dilutes) the collective intelligence.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ COMPARISON ═══ */}
          <TabsContent value="comparison">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Feature Comparison Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-bold text-muted-foreground min-w-[140px]">Feature</th>
                        <th className="text-center py-2 px-2 font-bold text-muted-foreground">Explorer</th>
                        <th className="text-center py-2 px-2 font-bold text-amber-500">Insider</th>
                        <th className="text-center py-2 px-2 font-bold text-sky-400">Strategist</th>
                        <th className="text-center py-2 px-2 font-bold text-violet-400">Inner Circle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON.map((row, i) => (
                        <tr key={i} className="border-b border-border/30">
                          <td className="py-2 pr-4 font-medium text-foreground">{row.feature}</td>
                          {(['free', 'gold', 'platinum', 'diamond'] as const).map((tier) => {
                            const val = row[tier];
                            return (
                              <td key={tier} className="py-2 px-2 text-center">
                                {val === true ? (
                                  <CheckCircle2 className="h-3 w-3 text-chart-2 mx-auto" />
                                ) : val === false ? (
                                  <span className="text-muted-foreground/30">—</span>
                                ) : (
                                  <span className="text-foreground">{val}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
