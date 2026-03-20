import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target, Users, TrendingUp, Zap, BarChart3, Clock, DollarSign,
  ArrowUpRight, RefreshCw, Layers, Shield
} from 'lucide-react';

const WEIGHTS = {
  budget: { label: 'Budget Match', pct: 20 },
  location: { label: 'Location Alignment', pct: 18 },
  rentalYield: { label: 'Yield & ROI Fit', pct: 12 },
  propertyType: { label: 'Property Type', pct: 10 },
  riskAlign: { label: 'Risk Alignment', pct: 10 },
  liquidity: { label: 'Liquidity Score', pct: 10 },
  dealScore: { label: 'Deal Score', pct: 8 },
  diversification: { label: 'Diversification Gap', pct: 7 },
  appreciation: { label: 'Appreciation Potential', pct: 5 },
};

const STRATEGY_COLORS: Record<string, string> = {
  'Yield Hunter': 'bg-emerald-100 text-emerald-700',
  'Flip Opportunity': 'bg-amber-100 text-amber-700',
  'Luxury Lifestyle': 'bg-purple-100 text-purple-700',
  'Growth Play': 'bg-blue-100 text-blue-700',
  'Balanced Hold': 'bg-muted text-muted-foreground',
};

function formatRp(n: number): string {
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)}M`;
  return `Rp ${n.toLocaleString()}`;
}

const InvestorDealMatchingPanel = () => {
  const [tab, setTab] = useState('algorithm');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6" /> Investor Deal Matching AI Engine
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Intelligent property-investor pairing using behavior, capital profile, and market signals
          </p>
        </div>
        <Badge variant="outline" className="text-xs">Edge Function: generate-investor-matches</Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="algorithm" className="text-xs">Algorithm Logic</TabsTrigger>
          <TabsTrigger value="dataflow" className="text-xs">Data Pipeline</TabsTrigger>
          <TabsTrigger value="outputs" className="text-xs">AI Outputs</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
          <TabsTrigger value="rollout" className="text-xs">Rollout Plan</TabsTrigger>
        </TabsList>

        {/* ALGORITHM */}
        <TabsContent value="algorithm" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Matching Algorithm — Weighted Scoring Model</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-sm mb-3">Signal Weight Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(WEIGHTS).map(([key, w]) => (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-36 text-xs font-medium">{w.label}</div>
                      <div className="flex-1"><Progress value={w.pct * 5} className="h-2" /></div>
                      <Badge variant="secondary" className="text-xs tabular-nums w-12 justify-center">{w.pct}%</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Investor Profile Inputs</h4>
                  <div className="space-y-1.5 text-sm">
                    {[
                      'Budget range (min–max)',
                      'Preferred cities / micro-locations',
                      'Rental yield target weight',
                      'Capital growth preference weight',
                      'Risk tolerance score (0–1)',
                      'Investment horizon (years)',
                      'Diversification gap score',
                      'Investor persona classification',
                    ].map(i => (
                      <div key={i} className="flex items-start gap-2">
                        <Users className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                        <span className="text-muted-foreground">{i}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Property Matching Variables</h4>
                  <div className="space-y-1.5 text-sm">
                    {[
                      'Liquidity score (from property_liquidity_scores)',
                      'Deal score (AI composite)',
                      'ROI projection percentage',
                      'Rental yield percentage',
                      'Investment risk level',
                      'Demand heat score',
                      'Price negotiation flexibility',
                      'Days on market',
                    ].map(i => (
                      <div key={i} className="flex items-start gap-2">
                        <BarChart3 className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                        <span className="text-muted-foreground">{i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Confidence Score Formula</h4>
                <code className="text-xs text-muted-foreground block leading-relaxed">
                  confidence = (budget_match × 0.20 + location_match × 0.18 + yield_fit × 0.12 + type_match × 0.10 + risk_align × 0.10 + liquidity × 0.10 + deal_score × 0.08 + diversification × 0.07 + appreciation × 0.05) × 100
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DATA PIPELINE */}
        <TabsContent value="dataflow" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Database Interaction Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { step: '1. Investor DNA Fetch', table: 'investor_dna', desc: 'Budget, risk, persona, preferred cities/types, horizon — computed by core-engine DNA mode' },
                { step: '2. Preferences Fallback', table: 'investor_preferences', desc: 'Manual preferences from onboarding form — used if DNA not yet computed' },
                { step: '3. Profile Merge', table: 'investor_profiles', desc: 'Nationality, eligibility, timeline — last resort for budget/location signals' },
                { step: '4. Property Universe', table: 'properties', desc: 'Active/available properties with price, yield, risk, deal_score, demand_heat — up to 500 evaluated' },
                { step: '5. Liquidity Overlay', table: 'property_liquidity_scores', desc: 'Per-property liquidity_score from recompute-liquidity engine' },
                { step: '6. Score & Rank', table: '— in-memory —', desc: 'Weighted confidence calculation, strategy tagging, offer range generation' },
                { step: '7. Return Top N', table: 'API response', desc: 'Top 5–10 matches with full signal breakdown returned to frontend hook' },
              ].map(s => (
                <div key={s.step} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium text-sm">{s.step}</span>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{s.table}</code>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">{s.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI OUTPUTS */}
        <TabsContent value="outputs" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">AI Output Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { output: 'Match Confidence Score', range: '0–100', desc: 'Weighted composite of all 9 signal dimensions', icon: Target },
                  { output: 'Top 5 Deal Recommendations', range: 'Ranked list', desc: 'Properties sorted by confidence with full metadata', icon: TrendingUp },
                  { output: 'Suggested Offer Price Range', range: 'Low–High Rp', desc: 'Based on demand heat → negotiation flexibility → 3-12% discount range', icon: DollarSign },
                  { output: 'Investment Strategy Tag', range: '5 types', desc: 'Yield Hunter / Flip / Luxury / Growth / Balanced — from persona + metrics', icon: Layers },
                  { output: 'Exit Timing Prediction', range: 'Months', desc: 'Optimal hold period adjusted by liquidity score and investment horizon', icon: Clock },
                  { output: 'Signal Breakdown', range: 'Per-dimension', desc: 'Individual 0–1 scores for budget, location, yield, risk, liquidity, etc.', icon: BarChart3 },
                ].map(o => (
                  <div key={o.output} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <o.icon className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <span className="font-medium text-sm">{o.output}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{o.range}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{o.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">Strategy Tag Distribution</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STRATEGY_COLORS).map(([tag, cls]) => (
                    <Badge key={tag} className={cls}>{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Notification Trigger Design</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { trigger: 'New High-Confidence Match', condition: 'confidence ≥ 85', action: 'Push curated deal alert to investor (in-app + optional WhatsApp)', icon: Target },
                { trigger: 'Price Drop on Matched Property', condition: 'Price decreases on a top-5 match', action: 'Re-run matching + send "Price dropped on your match" alert', icon: DollarSign },
                { trigger: 'Liquidity Spike', condition: 'Property liquidity_score jumps > 15pts', action: 'Urgency notification: "High demand — act fast"', icon: Zap },
                { trigger: 'Exit Timing Window', condition: 'Current hold ≈ optimal exit_timing_months', action: 'Resale advisory notification with estimated return', icon: Clock },
                { trigger: 'Portfolio Gap Detected', condition: 'Diversification score drops below 0.4', action: 'Suggest complementary property types/cities', icon: Shield },
                { trigger: 'Investor Inactivity', condition: 'No platform activity for 14+ days', action: 'Re-engagement with latest top matches summary', icon: RefreshCw },
              ].map(n => (
                <div key={n.trigger} className="p-3 border rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <n.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-sm">{n.trigger}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{n.condition}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">{n.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROLLOUT */}
        <TabsContent value="rollout" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Implementation Rollout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { phase: 'Phase 1 — Engine Core', week: 'Week 1', items: [
                    '✅ Edge function: generate-investor-matches (deployed)',
                    '✅ React hook: useInvestorMatches(userId) (created)',
                    '✅ Algorithm: 9-signal weighted scoring model',
                    '✅ Integration with investor_dna + property_liquidity_scores',
                  ]},
                  { phase: 'Phase 2 — Frontend Integration', week: 'Week 2', items: [
                    'Investor dashboard: "Your Top Matches" card',
                    'Property detail: "Match confidence for you" badge',
                    'Deal comparison view with signal breakdown',
                    'Admin: investor-property match audit panel',
                  ]},
                  { phase: 'Phase 3 — Notification Layer', week: 'Week 3', items: [
                    'In-app notification triggers on high-confidence matches',
                    'WhatsApp integration for curated deal alerts',
                    'Admin: manual deal priority override control',
                    'Investor leaderboard by capital readiness score',
                  ]},
                  { phase: 'Phase 4 — Learning Loop', week: 'Week 4', items: [
                    'Track match → inquiry → offer → close conversion',
                    'Adjust weights based on conversion feedback',
                    'A/B test weight configurations',
                    'Portfolio optimization suggestions engine',
                  ]},
                ].map((p, i) => (
                  <div key={p.phase} className="relative pl-8">
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    {i < 3 && <div className="absolute left-[11px] top-6 w-0.5 h-full bg-border" />}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">{p.phase}</span>
                        <Badge variant="outline" className="text-xs">{p.week}</Badge>
                      </div>
                      <ul className="space-y-1">
                        {p.items.map(item => (
                          <li key={item} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <ArrowUpRight className="h-3 w-3 mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestorDealMatchingPanel;
