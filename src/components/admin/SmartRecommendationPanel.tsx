import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, Sparkles, Eye, Users, TrendingUp, Sliders, ArrowRight, CheckCircle, Zap } from 'lucide-react';

const algorithmWeights = [
  { signal: 'Investor DNA Match', weight: 30, description: 'Persona, risk tolerance & investment style alignment' },
  { signal: 'Behavioral Affinity', weight: 25, description: 'Views, saves, search patterns & session depth' },
  { signal: 'Opportunity Score', weight: 20, description: 'ROI projection, undervaluation & market heat' },
  { signal: 'Watchlist Correlation', weight: 15, description: 'Similarity to saved/tracked properties' },
  { signal: 'Base Attribute Match', weight: 10, description: 'Location, type, budget & amenity filters' },
];

const pipelineStages = [
  { stage: 'Signal Collection', icon: Eye, description: 'Capture 14 behavioral event types per session', signals: ['page_view', 'property_save', 'search_filter', 'map_interact', 'compare_add'] },
  { stage: 'Profile Enrichment', icon: Users, description: 'Build Investor DNA from accumulated behavior', signals: ['persona_classify', 'risk_score', 'budget_infer', 'intent_detect'] },
  { stage: 'Candidate Generation', icon: Target, description: 'Pre-filter 500→50 candidates via attribute match', signals: ['geo_filter', 'price_range', 'type_match', 'availability'] },
  { stage: 'AI Scoring & Ranking', icon: Brain, description: 'Apply weighted composite model to rank top 20', signals: ['dna_fit', 'opportunity_score', 'urgency_signal', 'yield_strength'] },
  { stage: 'Contextual Delivery', icon: Sparkles, description: 'Serve ranked feed with explanation tags', signals: ['reason_tag', 'urgency_badge', 'elite_flag', 'area_discovery'] },
];

const feedWidgets = [
  { name: 'Top Picks Feed', description: 'Personalized ranked listings with match score rings and reason tags', placement: 'Homepage + Dashboard', refresh: 'Every 4h + on interaction' },
  { name: 'Viewing Priority Queue', description: 'Time-sensitive listings requiring urgent action, sorted by deal window', placement: 'Investor Dashboard', refresh: 'Real-time push' },
  { name: 'Area Discovery Cards', description: 'Suggest new districts based on portfolio gaps and emerging heat zones', placement: 'Search results sidebar', refresh: 'Daily recalc' },
  { name: 'Similar Properties Strip', description: 'Horizontal carousel of related listings on property detail pages', placement: 'Property detail page', refresh: 'On page load' },
  { name: 'Deal Urgency Alerts', description: 'Push notifications for high-score properties with declining availability', placement: 'Mobile + In-app', refresh: 'Event-driven' },
];

const accuracyPhases = [
  { phase: 1, name: 'Rule-Based Baseline', duration: 'Month 1-2', progress: 100, accuracy: '45%', items: ['Attribute filtering', 'Basic scoring', 'Static weights'] },
  { phase: 2, name: 'Behavioral Learning', duration: 'Month 3-4', progress: 60, accuracy: '62%', items: ['Click-through training', 'Save signal weighting', 'Session depth scoring'] },
  { phase: 3, name: 'DNA Personalization', duration: 'Month 5-7', progress: 20, accuracy: '78%', items: ['Investor persona matching', 'Portfolio-aware ranking', 'Collaborative filtering'] },
  { phase: 4, name: 'Autonomous Tuning', duration: 'Month 8-12', progress: 0, accuracy: '85%+', items: ['Self-learning loops', 'A/B weight optimization', 'Drift detection'] },
];

const SmartRecommendationPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Recommendation CTR', value: '12.4%', icon: Target, accent: 'text-emerald-600' },
          { label: 'Personalization Depth', value: '78/100', icon: Brain, accent: 'text-primary' },
          { label: 'Daily Impressions', value: '284K', icon: Eye, accent: 'text-orange-600' },
          { label: 'Conversion Lift', value: '+34%', icon: TrendingUp, accent: 'text-purple-600' },
        ].map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <s.icon className={`h-5 w-5 ${s.accent}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="algorithm" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="algorithm" className="text-xs">Algorithm Flow</TabsTrigger>
          <TabsTrigger value="pipeline" className="text-xs">Data Pipeline</TabsTrigger>
          <TabsTrigger value="widgets" className="text-xs">Feed Widgets</TabsTrigger>
          <TabsTrigger value="phases" className="text-xs">Accuracy Roadmap</TabsTrigger>
        </TabsList>

        {/* Tab 1: Algorithm Weights */}
        <TabsContent value="algorithm" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Recommendation Weight Model</CardTitle>
                <Badge variant="outline" className="text-[10px] ml-auto">Configurable</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {algorithmWeights.map(w => (
                <div key={w.signal} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">{w.signal}</p>
                      <p className="text-[10px] text-muted-foreground">{w.description}</p>
                    </div>
                    <span className="text-sm font-bold text-primary">{w.weight}%</span>
                  </div>
                  <Progress value={w.weight} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-2">Scoring Formula</p>
              <div className="bg-muted/30 rounded-lg p-3 font-mono text-[11px] text-muted-foreground leading-relaxed">
                <p>Score = (DNA_Match × 0.30) + (Behavior × 0.25)</p>
                <p className="ml-12">+ (Opportunity × 0.20) + (Watchlist × 0.15)</p>
                <p className="ml-12">+ (BaseMatch × 0.10)</p>
                <p className="mt-2 text-foreground">Boosts: Elite Deal (+12), New Listing (+5)</p>
                <p className="text-foreground">Penalties: Ignored (-25), Stale >90d (-15)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Personalization Pipeline */}
        <TabsContent value="pipeline" className="space-y-3">
          {pipelineStages.map((s, i) => (
            <Card key={s.stage} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">Step {i + 1}</Badge>
                      <p className="font-medium text-sm">{s.stage}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{s.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.signals.map(sig => (
                        <Badge key={sig} className="bg-muted text-muted-foreground text-[10px] font-normal">{sig}</Badge>
                      ))}
                    </div>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab 3: Feed Widget Specs */}
        <TabsContent value="widgets" className="space-y-3">
          {feedWidgets.map(w => (
            <Card key={w.name} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-sm">{w.name}</p>
                  <Badge variant="outline" className="text-[10px]">{w.refresh}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{w.description}</p>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-muted-foreground">Placement:</span>
                  <span className="font-medium">{w.placement}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab 4: Accuracy Roadmap */}
        <TabsContent value="phases" className="space-y-3">
          {accuracyPhases.map(p => (
            <Card key={p.phase} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      p.progress === 100 ? 'bg-emerald-100 text-emerald-700' :
                      p.progress > 0 ? 'bg-amber-100 text-amber-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {p.phase}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{p.accuracy}</p>
                    <p className="text-[10px] text-muted-foreground">target accuracy</p>
                  </div>
                </div>
                <Progress value={p.progress} className="h-1.5 mb-2" />
                <div className="flex flex-wrap gap-1.5">
                  {p.items.map(t => (
                    <Badge key={t} variant="outline" className="text-[10px] font-normal">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartRecommendationPanel;
