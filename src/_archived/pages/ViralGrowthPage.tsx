import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Rocket, Share2, Gift, Users, TrendingUp, Bell, Eye,
  ArrowRight, CheckCircle2, Zap, Target, Heart, Crown,
  MessageSquare, BarChart3, Sparkles, RefreshCw, Link,
  Star, Shield, Megaphone, Building2, DollarSign, Brain,
  ChevronRight, AlertTriangle, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

interface LoopStage {
  stage: string;
  title: string;
  subtitle: string;
  icon: typeof Rocket;
  color: string;
  bgColor: string;
  mechanics: { name: string; detail: string; implementation: string }[];
  metric: string;
}

const LOOP_STAGES: LoopStage[] = [
  {
    stage: 'Trigger',
    title: 'Opportunity Discovery',
    subtitle: 'The viral loop starts when AI surfaces something worth sharing',
    icon: Brain,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    mechanics: [
      {
        name: 'Elite Opportunity Alert',
        detail: 'When a property scores ≥85 on the AI Opportunity Score, the system generates a "shareable insight card" — a visual snapshot showing score breakdown, yield estimate, and growth signal.',
        implementation: 'Triggered by opportunity_score threshold on property insert/update. Card rendered as OG-image-ready component with share URL.',
      },
      {
        name: 'Price Drop Signal',
        detail: 'Properties with ≥5% price reduction generate "Deal Alert" cards that quantify the savings vs fair market value — making the share feel like insider information.',
        implementation: 'Listens to price_drop_deals RPC output. Card shows original → new price, FMV comparison, and urgency badge.',
      },
      {
        name: 'Market Heat Flash',
        detail: 'When a micro-market zone transitions from "Stable" to "Growing" or "Hotspot", users in that zone receive a shareable heat map snapshot.',
        implementation: 'market_clusters table change detection. Generates city-specific heat map card with growth trajectory.',
      },
    ],
    metric: 'Share-worthy events per user per week (target: ≥2)',
  },
  {
    stage: 'Action',
    title: 'Frictionless Sharing',
    subtitle: 'Make sharing feel like giving a gift, not promoting a platform',
    icon: Share2,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    mechanics: [
      {
        name: 'Opportunity Snapshot Card',
        detail: 'One-tap shareable card with property image, AI score ring, key metrics (yield, appreciation, demand), and a branded but subtle ASTRA Villa footer. Recipient sees full data after sign-up.',
        implementation: 'Generate OG-image via Edge Function. Share URL: /opportunity/{id}?ref={user_code}. Preview shows card, full access requires auth.',
      },
      {
        name: 'WhatsApp / Telegram Deep Link',
        detail: 'Pre-formatted message with insight summary + link. "I found a property scoring 92/100 on ASTRA Villa — rental yield 8.2% in Canggu. Check it out →"',
        implementation: 'Share button generates platform-specific deep links with UTM tracking and referral code embedded.',
      },
      {
        name: 'Watchlist Collaboration Invite',
        detail: 'Users can invite peers to view their curated watchlist — "See what I\'m tracking" — creating social proof and FOMO.',
        implementation: 'Shared watchlist URL with read-only access. Viewer prompted to create account to save their own selections.',
      },
    ],
    metric: 'Share rate per opportunity view (target: ≥8%)',
  },
  {
    stage: 'Incentive',
    title: 'Reward Structure',
    subtitle: 'Align rewards with actions that create genuine platform value',
    icon: Gift,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    mechanics: [
      {
        name: 'Referral Signup Reward',
        detail: 'Referrer gets 1 month of Premium AI insights access when their referral creates an account AND completes first search (activation, not just signup).',
        implementation: 'Tracked via acquisition_referrals table. Reward unlocked on referee completing "first_search" activation milestone.',
      },
      {
        name: 'Priority Deal Access',
        detail: 'Active referrers (3+ qualified referrals) get 24-hour early access to Elite Opportunity alerts before general release.',
        implementation: 'Referrer tier check on deal alert dispatch. Elite referrers get time-delayed notification offset.',
      },
      {
        name: 'Agent Co-Referral Bonus',
        detail: 'Agents who refer investors that close deals earn a 0.5% commission bonus on top of standard rate — directly tying referral quality to revenue.',
        implementation: 'Commission calculation includes referral source check. Bonus applied at deal closing via affiliate_commissions table.',
      },
    ],
    metric: 'Referral-to-activation conversion rate (target: ≥25%)',
  },
  {
    stage: 'Network Effect',
    title: 'Social Reinforcement',
    subtitle: 'Turn individual discovery into collective intelligence',
    icon: Users,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    mechanics: [
      {
        name: 'Collaborative Watchlist',
        detail: 'Groups of investors can create shared watchlists — "Bali Investment Club" — where members add properties and see each other\'s notes. Activity in shared lists creates notification loops.',
        implementation: 'Shared watchlist table with member permissions. Activity feed shows "3 members are watching this property".',
      },
      {
        name: 'Growth Zone Discussions',
        detail: 'City-specific discussion threads where investors share local insights — "New airport announcement in Lombok, watch these areas." User-generated intelligence adds to AI signals.',
        implementation: 'Discussion threads linked to market_clusters zones. Top-voted insights surfaced in Market Intelligence Feed.',
      },
      {
        name: 'Social Proof Counters',
        detail: '"47 investors are watching this area" / "12 inquiries this week" — visible on property cards to create informed FOMO based on real platform activity.',
        implementation: 'Real-time counters from user_interactions aggregation. Displayed as DemandHeatBadge and LiveActivityTicker.',
      },
    ],
    metric: 'Multi-user engagement rate (target: ≥15% of active users in shared activities)',
  },
  {
    stage: 'Retention Loop',
    title: 'Re-Engagement Triggers',
    subtitle: 'Keep users returning with personalized, time-sensitive intelligence',
    icon: RefreshCw,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    mechanics: [
      {
        name: 'Recurring Price Drop Alerts',
        detail: 'Personalized notifications when properties matching user\'s search history or watchlist drop in price. Each alert includes AI context: "Price dropped 8% — now 12% below fair market value."',
        implementation: 'price_drop_deals matched against user_interactions search/save history. Push via smart notification system.',
      },
      {
        name: 'Portfolio Performance Updates',
        detail: 'Monthly digest showing watchlisted properties\' value changes — "Properties you\'re watching gained an average of 4.2% this month." Creates ownership feeling before purchase.',
        implementation: 'Scheduled Edge Function computes watchlist value changes. Delivered as in-app + email digest.',
      },
      {
        name: 'AI Prediction Accuracy Reports',
        detail: '"6 months ago, our AI predicted 12% growth for Canggu — actual: 11.3%." Builds trust in platform intelligence and motivates continued engagement.',
        implementation: 'Compare ai_price_predictions historical data against current market. Quarterly accuracy report generation.',
      },
    ],
    metric: 'D30 retention rate (target: ≥40%)',
  },
];

const FLYWHEEL_PRINCIPLE = {
  title: 'The Flywheel Logic',
  description: 'Each loop iteration makes the next one stronger: More users → More data → Better AI predictions → More share-worthy insights → More shares → More users. The competitive moat isn\'t the AI itself — it\'s the compounding data advantage that makes the AI increasingly accurate, which makes the platform increasingly indispensable.',
};

const ANTI_PATTERNS = [
  { bad: '"Share to unlock" gating', why: 'Feels coercive — users share spam links that damage brand trust', instead: 'Share because the content is genuinely useful, reward as a bonus' },
  { bad: 'Cash incentives for signups', why: 'Attracts low-quality users who churn after claiming reward', instead: 'Reward with platform value (Premium access, early alerts) that requires engagement' },
  { bad: 'Notification spam', why: 'Over-notifying causes users to disable alerts entirely', instead: 'Max 3 notifications/day, each must contain actionable intelligence' },
  { bad: 'Vanity metrics sharing', why: '"I joined ASTRA Villa" posts have zero value to the recipient', instead: 'Share specific insights: "This property scores 92/100 — here\'s why"' },
];

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function ViralGrowthPage() {
  const [activeTab, setActiveTab] = useState('loop');
  const [expandedStage, setExpandedStage] = useState('Trigger');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-chart-2" />
                </div>
                Viral Growth Engine
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Self-sustaining user acquisition driven by opportunity discovery</p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-2/20 text-chart-2">
              <Zap className="h-3 w-3 mr-1.5" />5 loop stages
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="loop">Growth Loop</TabsTrigger>
            <TabsTrigger value="flywheel">Flywheel</TabsTrigger>
            <TabsTrigger value="antipatterns">Anti-Patterns</TabsTrigger>
          </TabsList>

          {/* ═══ LOOP ═══ */}
          <TabsContent value="loop" className="space-y-3">
            {LOOP_STAGES.map((stage) => {
              const SIcon = stage.icon;
              const isExpanded = expandedStage === stage.stage;
              return (
                <motion.div key={stage.stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card
                    className={cn('border bg-card cursor-pointer transition-all', isExpanded ? 'border-border shadow-sm' : 'border-border/60 hover:border-border')}
                    onClick={() => setExpandedStage(isExpanded ? '' : stage.stage)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stage.bgColor)}>
                          <SIcon className={cn('h-5 w-5', stage.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[7px]">{stage.stage}</Badge>
                            <CardTitle className="text-sm">{stage.title}</CardTitle>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{stage.subtitle}</p>
                        </div>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0 space-y-3" onClick={(e) => e.stopPropagation()}>
                        {stage.mechanics.map((m, i) => (
                          <div key={i} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Zap className={cn('h-3 w-3', stage.color)} />
                              <p className="text-xs font-bold text-foreground">{m.name}</p>
                            </div>
                            <p className="text-[10px] text-foreground mb-2">{m.detail}</p>
                            <div className="p-2 rounded bg-muted/10 border border-border/20">
                              <p className="text-[9px] text-muted-foreground">
                                <span className="font-bold">Implementation:</span> {m.implementation}
                              </p>
                            </div>
                          </div>
                        ))}

                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                          <Target className="h-3 w-3 text-primary flex-shrink-0" />
                          <p className="text-[9px] text-foreground">
                            <span className="font-bold">Key Metric:</span> {stage.metric}
                          </p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ FLYWHEEL ═══ */}
          <TabsContent value="flywheel" className="space-y-4">
            <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-chart-2/5">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-foreground">{FLYWHEEL_PRINCIPLE.title}</p>
                    <p className="text-xs text-muted-foreground mt-2">{FLYWHEEL_PRINCIPLE.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual flow */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Compounding Loop Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { step: 'More Users', detail: 'Each referral adds a data-generating participant', icon: Users, color: 'text-chart-4' },
                    { step: 'More Data', detail: 'Search patterns, saves, inquiries enrich the intelligence layer', icon: BarChart3, color: 'text-primary' },
                    { step: 'Better AI Predictions', detail: 'More data → more accurate opportunity scores, price forecasts, yield estimates', icon: Brain, color: 'text-chart-2' },
                    { step: 'More Share-Worthy Insights', detail: 'Accurate predictions create "I need to tell someone about this" moments', icon: Star, color: 'text-chart-1' },
                    { step: 'More Shares', detail: 'Organic distribution of genuinely valuable intelligence', icon: Share2, color: 'text-chart-5' },
                  ].map((item, i) => {
                    const IIcon = item.icon;
                    return (
                      <div key={i}>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/10 border border-border/30">
                          <div className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center flex-shrink-0">
                            <IIcon className={cn('h-4 w-4', item.color)} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-foreground">{item.step}</p>
                            <p className="text-[9px] text-muted-foreground">{item.detail}</p>
                          </div>
                        </div>
                        {i < 4 && (
                          <div className="flex justify-center py-1">
                            <ArrowRight className="h-3 w-3 text-muted-foreground/30 rotate-90" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex justify-center py-1">
                    <Badge variant="outline" className="text-[8px] text-chart-2 border-chart-2/20">
                      <RefreshCw className="h-2.5 w-2.5 mr-1" /> Loop repeats — each cycle is stronger
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPI targets */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Growth KPI Targets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Viral Coefficient', target: '≥ 1.2', desc: 'Each user brings 1.2 new users', color: 'text-chart-2' },
                    { label: 'Share Rate', target: '≥ 8%', desc: 'Of opportunity views → shares', color: 'text-primary' },
                    { label: 'Referral Activation', target: '≥ 25%', desc: 'Signups that complete first search', color: 'text-chart-4' },
                    { label: 'D30 Retention', target: '≥ 40%', desc: 'Users active after 30 days', color: 'text-chart-1' },
                    { label: 'Time to Share', target: '< 7 days', desc: 'From signup to first share', color: 'text-chart-5' },
                    { label: 'Network Density', target: '≥ 15%', desc: 'Users in shared watchlists', color: 'text-chart-2' },
                  ].map((kpi, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/10 border border-border/30 text-center">
                      <p className={cn('text-lg font-black', kpi.color)}>{kpi.target}</p>
                      <p className="text-[9px] font-bold text-foreground">{kpi.label}</p>
                      <p className="text-[8px] text-muted-foreground">{kpi.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ ANTI-PATTERNS ═══ */}
          <TabsContent value="antipatterns" className="space-y-3">
            <Card className="border border-destructive/15 bg-destructive/3 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-destructive flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Growth Integrity Rules</p>
                    <p className="text-[11px] text-muted-foreground">
                      Viral growth that annoys users is negative growth. Every share mechanism must pass the test: "Would I appreciate receiving this from a friend?" If no — don't build it.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {ANTI_PATTERNS.map((ap, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-destructive">{ap.bad}</p>
                        <p className="text-[10px] text-muted-foreground">{ap.why}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-chart-2/5 border border-chart-2/10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-chart-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[8px] font-bold text-chart-2 uppercase">Instead</p>
                        <p className="text-[10px] text-foreground">{ap.instead}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
