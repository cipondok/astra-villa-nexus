import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Database, Shield, TrendingUp, Brain, Eye, Target, Lock,
  BarChart3, Users, Building2, Zap, ArrowRight, CheckCircle2,
  Sparkles, Clock, Star, Globe, DollarSign, Activity,
  ChevronRight, AlertTriangle, Layers, Cpu, FileText,
  Handshake, Award, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════
   DATA ASSET LAYERS
   ═══════════════════════════════════════════ */

interface DataAsset {
  name: string;
  description: string;
  sources: string[];
  uniqueness: string;
  timeToReplicate: string;
}

interface AssetLayer {
  layer: string;
  title: string;
  subtitle: string;
  icon: typeof Database;
  color: string;
  bgColor: string;
  assets: DataAsset[];
  moatStrength: 'Critical' | 'Strong' | 'Growing';
}

const ASSET_LAYERS: AssetLayer[] = [
  {
    layer: 'Behavior',
    title: 'Marketplace Behavior Signals',
    subtitle: 'What investors do reveals more than what they say',
    icon: Activity,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    moatStrength: 'Strong',
    assets: [
      {
        name: 'Investor Watchlist Trends',
        description: 'Aggregated save/unsave patterns across property types, locations, and price bands — revealing demand shifts before they appear in transaction data.',
        sources: ['user_interactions (save events)', 'property_saves table', 'watchlist activity logs'],
        uniqueness: 'No public dataset captures pre-purchase intent signals at this granularity. This is pure first-party behavioral data.',
        timeToReplicate: '18-24 months of active marketplace operation',
      },
      {
        name: 'Offer Negotiation Patterns',
        description: 'Initial offer vs counter-offer sequences, time-to-agreement, and price elasticity by property type and location — mapping how Indonesian property deals actually negotiate.',
        sources: ['founder_deal_pipeline', 'conversation metadata', 'agent_crm_leads stage transitions'],
        uniqueness: 'Indonesian property negotiation data is virtually non-existent in structured form. This becomes the authoritative dataset.',
        timeToReplicate: '24-36 months — requires transaction volume + agent trust',
      },
      {
        name: 'Inquiry Heat Concentration',
        description: 'Geographic and temporal density of property inquiries — identifying micro-market demand spikes 2-4 weeks before they manifest as price movements.',
        sources: ['conversations table', 'user_interactions (contact events)', 'market_clusters aggregation'],
        uniqueness: 'Real-time demand signal that traditional property portals don\'t track at micro-market level.',
        timeToReplicate: '12-18 months with sufficient listing density',
      },
    ],
  },
  {
    layer: 'Transaction',
    title: 'Transaction Outcome Intelligence',
    subtitle: 'The rarest data in real estate: what actually happened after the deal',
    icon: DollarSign,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    moatStrength: 'Critical',
    assets: [
      {
        name: 'Deal Pricing Intelligence',
        description: 'Final transaction price vs initial listing price, mapped across property types, locations, and market conditions — the "real price" database that doesn\'t exist publicly.',
        sources: ['founder_deal_pipeline (completed deals)', 'property price history', 'agent-reported closing data'],
        uniqueness: 'Indonesian property transactions are notoriously opaque. A structured database of actual vs listed prices is a category-defining asset.',
        timeToReplicate: '36+ months — requires trust, volume, and agent network depth',
      },
      {
        name: 'Time-to-Sell Analytics',
        description: 'Days-on-market by property type, price band, location, and listing quality score — revealing absorption speed patterns that predict market liquidity.',
        sources: ['properties table (created_at → status change)', 'listing_performance_analytics', 'agent_crm_leads lifecycle'],
        uniqueness: 'Combines listing quality metrics with actual sale velocity — no Indonesian competitor tracks both.',
        timeToReplicate: '12-24 months of marketplace operation',
      },
      {
        name: 'Post-Purchase Rental Performance',
        description: 'Actual rental yields achieved by investors who purchased through the platform — the ultimate feedback loop for AI prediction accuracy.',
        sources: ['Investor self-reported data', 'property management integrations', 'annual performance surveys'],
        uniqueness: 'Closes the prediction-to-reality loop. Rental yield predictions become provably accurate over time.',
        timeToReplicate: '24-48 months — requires investor relationship depth + portfolio tracking adoption',
      },
    ],
  },
  {
    layer: 'Intelligence',
    title: 'AI Model Evolution',
    subtitle: 'Each prediction that proves correct makes the next one more accurate',
    icon: Brain,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    moatStrength: 'Critical',
    assets: [
      {
        name: 'Scoring Accuracy Feedback Loop',
        description: 'Continuous comparison of AI Opportunity Scores against actual investment outcomes — enabling self-learning weight calibration that improves with every transaction.',
        sources: ['ai_learning_feedback table', 'learning-engine Edge Function (6h cycle)', 'intelligence_worker_runs monitoring'],
        uniqueness: 'The model improves autonomously. A competitor starting today would need years of outcome data to achieve equivalent accuracy.',
        timeToReplicate: '36+ months — model accuracy is a function of cumulative outcome data',
      },
      {
        name: 'Predictive Demand Clustering',
        description: 'AI-generated micro-market zones that identify emerging investment hotspots before traditional indicators — refined by actual investor behavior validation.',
        sources: ['market_clusters engine', 'compute_market_heat_clusters RPC', 'user behavior validation signals'],
        uniqueness: 'Clusters are shaped by real investor behavior, not just property listing data. Behavioral validation makes clusters increasingly predictive.',
        timeToReplicate: '24-36 months — requires behavioral data density + geographic coverage',
      },
      {
        name: 'Price Prediction Calibration',
        description: 'Historical accuracy tracking of AI price forecasts (3m/6m/12m) — building a provable track record that becomes the platform\'s most powerful trust signal.',
        sources: ['ai_price_predictions historical vs actual', 'compute_price_predictions RPC', 'quarterly accuracy reports'],
        uniqueness: 'Published prediction accuracy is a defensible credibility asset. "Our 12-month predictions were 94% accurate" is unchallengeable by competitors without data.',
        timeToReplicate: '12-36 months per prediction horizon validated',
      },
    ],
  },
];

/* ═══════════════════════════════════════════
   STRATEGIC UTILIZATION
   ═══════════════════════════════════════════ */

const UTILIZATION = [
  {
    title: 'Publish Unique Market Reports',
    icon: FileText,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    actions: [
      'Quarterly "Indonesian Property Intelligence Report" — free executive summary, full report for Premium members',
      'City-specific investment guides with actual yield data (anonymized) from platform transactions',
      'Annual "AI Prediction Accuracy Report" — publishing track record builds institutional credibility',
      'Developer-specific market briefs for partnership pitches — "Here\'s what our data shows about demand in your project area"',
    ],
    outcome: 'Media citations + investor trust + SEO authority',
  },
  {
    title: 'Strengthen Investor Trust',
    icon: Shield,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    actions: [
      'Display prediction accuracy metrics on property cards: "Our price forecasts are 94% accurate"',
      'Show historical watchlist-to-price correlation: "Properties saved by 50+ investors appreciated 2.3x faster"',
      'Publish anonymized case studies: "Investors who followed AI-scored deals achieved 14% avg ROI"',
      'Offer data-backed guarantees: "If our Opportunity Score >85 property doesn\'t appreciate in 12 months, get 6 months free Premium"',
    ],
    outcome: 'Conversion rate improvement + retention + premium tier adoption',
  },
  {
    title: 'Enhance Developer Partnerships',
    icon: Building2,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    actions: [
      'Provide developers with demand intelligence for their target areas before they break ground',
      'Offer pricing optimization: "Our data suggests optimal launch price for this unit type is Rp X"',
      'Share absorption speed predictions: "Based on comparable launches, expect 70% sold within 6 months"',
      'Charge premium for pre-launch demand validation reports — new revenue stream from data assets',
    ],
    outcome: 'Higher partnership value + new B2B revenue stream + exclusive listing supply',
  },
];

/* ═══════════════════════════════════════════
   TIMELINE
   ═══════════════════════════════════════════ */

const TIMELINE = [
  { phase: 'Months 1-6', label: 'Foundation', color: 'text-chart-4', items: ['Instrument all user interactions with structured event tracking', 'Begin watchlist trend aggregation', 'Launch inquiry heat concentration monitoring', 'Establish data governance and anonymization protocols'] },
  { phase: 'Months 7-12', label: 'Accumulation', color: 'text-primary', items: ['Collect first cohort of deal pricing intelligence (target: 50+ completed transactions)', 'Validate initial AI prediction accuracy against real outcomes', 'Publish first "Market Signals" report based on behavioral data', 'Begin time-to-sell analytics across primary cities'] },
  { phase: 'Months 13-24', label: 'Differentiation', color: 'text-chart-2', items: ['Achieve statistical significance on prediction accuracy (500+ data points)', 'Launch quarterly intelligence reports with unique data-backed insights', 'Build developer demand validation service using accumulated signals', 'First post-purchase rental performance data collection'] },
  { phase: 'Months 25-36', label: 'Moat Fortification', color: 'text-chart-1', items: ['Publish annual AI Accuracy Report establishing industry benchmark', 'Negotiation pattern database becomes authoritative Indonesian reference', 'Self-learning model demonstrates measurably superior accuracy vs launch baseline', 'Data assets valued as independent IP in fundraising conversations'] },
];

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function DataMoatPage() {
  const [activeTab, setActiveTab] = useState('assets');
  const [expandedLayer, setExpandedLayer] = useState('Behavior');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                Proprietary Data Moat
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Long-term intelligence advantage through accumulated investment behavior data</p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-primary/20 text-primary">
              <Lock className="h-3 w-3 mr-1.5" />3 asset layers · 9 datasets
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="assets">Data Assets</TabsTrigger>
            <TabsTrigger value="utilization">Strategic Use</TabsTrigger>
            <TabsTrigger value="timeline">Build Timeline</TabsTrigger>
          </TabsList>

          {/* ═══ ASSETS ═══ */}
          <TabsContent value="assets" className="space-y-3">
            {ASSET_LAYERS.map((layer) => {
              const LIcon = layer.icon;
              const isExpanded = expandedLayer === layer.layer;
              return (
                <motion.div key={layer.layer} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card
                    className={cn('border bg-card cursor-pointer transition-all', isExpanded ? 'border-border shadow-sm' : 'border-border/60 hover:border-border')}
                    onClick={() => setExpandedLayer(isExpanded ? '' : layer.layer)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', layer.bgColor)}>
                          <LIcon className={cn('h-5 w-5', layer.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{layer.title}</CardTitle>
                            <Badge
                              variant="outline"
                              className={cn('text-[7px]',
                                layer.moatStrength === 'Critical' ? 'text-chart-2 border-chart-2/20' :
                                layer.moatStrength === 'Strong' ? 'text-primary border-primary/20' :
                                'text-chart-4 border-chart-4/20'
                              )}
                            >
                              <Shield className="h-2 w-2 mr-0.5" />{layer.moatStrength} moat
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{layer.subtitle}</p>
                        </div>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0 space-y-3" onClick={(e) => e.stopPropagation()}>
                        {layer.assets.map((asset, i) => (
                          <div key={i} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Layers className={cn('h-3.5 w-3.5', layer.color)} />
                              <p className="text-xs font-bold text-foreground">{asset.name}</p>
                            </div>
                            <p className="text-[10px] text-foreground mb-2">{asset.description}</p>

                            {/* Sources */}
                            <div className="p-2 rounded bg-muted/10 border border-border/20 mb-2">
                              <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Data Sources</p>
                              <div className="flex flex-wrap gap-1">
                                {asset.sources.map((s, j) => (
                                  <Badge key={j} variant="outline" className="text-[7px] font-mono">{s}</Badge>
                                ))}
                              </div>
                            </div>

                            {/* Uniqueness */}
                            <div className="p-2 rounded bg-chart-2/5 border border-chart-2/10 mb-2">
                              <div className="flex items-start gap-1.5">
                                <Star className="h-3 w-3 text-chart-2 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[8px] font-bold text-chart-2 uppercase">Why It's Defensible</p>
                                  <p className="text-[10px] text-foreground">{asset.uniqueness}</p>
                                </div>
                              </div>
                            </div>

                            {/* Time to replicate */}
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <p className="text-[9px] text-muted-foreground">
                                <span className="font-bold">Time for competitor to replicate:</span> {asset.timeToReplicate}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}

            <Card className="border border-primary/15 bg-primary/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Moat Principle</p>
                    <p className="text-[11px] text-muted-foreground">
                      Technology can be copied. Features can be replicated. But 36 months of accumulated investor behavior data, validated prediction accuracy, and structured transaction intelligence cannot be fast-tracked. The data moat gets deeper with every user interaction and every completed transaction — that's the compounding advantage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ UTILIZATION ═══ */}
          <TabsContent value="utilization" className="space-y-4">
            {UTILIZATION.map((item, i) => {
              const UIcon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="border border-border bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.bgColor)}>
                          <UIcon className={cn('h-5 w-5', item.color)} />
                        </div>
                        <CardTitle className="text-sm">{item.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-1.5">
                      {item.actions.map((action, j) => (
                        <div key={j} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                          <ArrowRight className={cn('h-3 w-3 flex-shrink-0 mt-0.5', item.color)} />
                          <p className="text-[10px] text-foreground">{action}</p>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 pt-1">
                        <Target className="h-3 w-3 text-chart-2" />
                        <p className="text-[9px] font-bold text-chart-2">{item.outcome}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ TIMELINE ═══ */}
          <TabsContent value="timeline" className="space-y-3">
            {TIMELINE.map((phase, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn('text-[8px] w-24 justify-center', phase.color)}>{phase.phase}</Badge>
                      <CardTitle className="text-sm">{phase.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-1.5">
                    {phase.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                        <CheckCircle2 className={cn('h-3 w-3 flex-shrink-0 mt-0.5', phase.color)} />
                        <p className="text-[10px] text-foreground">{item}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Fundraising Implication</p>
                    <p className="text-[11px] text-muted-foreground">
                      By Month 24, ASTRA Villa's proprietary data assets should be independently valuable — structurally similar to how Bloomberg Terminal's data moat underpins its entire business model. In Series A+ conversations, position the data layer as the primary defensibility argument: "Our AI isn't just better — it's trained on data no one else has."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
