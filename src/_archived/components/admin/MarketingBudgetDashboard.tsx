
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign, TrendingUp, BarChart3, Target, Globe, Users,
  Video, Search, MapPin, Megaphone, AlertTriangle, CheckCircle,
  ArrowUpRight, ArrowDownRight, RefreshCw, Zap, PieChart
} from 'lucide-react';

// ─── Budget Data ───────────────────────────────────────────

interface BudgetCategory {
  name: string;
  icon: typeof DollarSign;
  color: string;
  allocation_pct: number;
  monthly_amounts: number[]; // 6 months in Rp millions
  description: string;
  line_items: { item: string; pct: number; note: string }[];
  kpis: string[];
}

const TOTAL_MONTHLY_BUDGET = [40, 50, 65, 80, 100, 120]; // Rp millions, scaling

const categories: BudgetCategory[] = [
  {
    name: 'SEO & Organic Content',
    icon: Search,
    color: 'text-green-500',
    allocation_pct: 35,
    monthly_amounts: [14, 17.5, 22.75, 28, 35, 42],
    description: 'Programmatic SEO page production, blog content, and location landing pages',
    line_items: [
      { item: 'SEO Location Page Production', pct: 40, note: 'Province → kelurahan pages at scale, writer costs + AI tools' },
      { item: 'Blog & Guide Content', pct: 20, note: 'Property buying guides, market reports, investor education' },
      { item: 'SEO Tools & Infrastructure', pct: 15, note: 'Ahrefs/SEMrush, indexing tools, sitemap automation' },
      { item: 'Technical SEO Optimization', pct: 15, note: 'Core Web Vitals, schema markup, internal linking' },
      { item: 'Link Building & PR', pct: 10, note: 'Guest posts, media outreach, directory listings' },
    ],
    kpis: [
      '2,000 → 10,000+ indexed pages by Month 6',
      'Organic traffic: 10K → 100K monthly visits',
      'Domain authority improvement: +15 points',
      'Keyword rankings: 500+ keywords in top 20',
    ],
  },
  {
    name: 'Social Media & Video Content',
    icon: Video,
    color: 'text-pink-500',
    allocation_pct: 25,
    monthly_amounts: [10, 12.5, 16.25, 20, 25, 30],
    description: 'Short-form property videos, social community building, and viral content strategy',
    line_items: [
      { item: 'Video Production (TikTok/Reels/Shorts)', pct: 45, note: '13+ videos/week — filming, editing, posting' },
      { item: 'Social Media Management', pct: 20, note: 'Community management, engagement, scheduling tools' },
      { item: 'Creator/Videographer Costs', pct: 25, note: 'Freelance videographers for property shoots' },
      { item: 'Equipment & Software', pct: 10, note: 'Cameras, lighting, editing software subscriptions' },
    ],
    kpis: [
      '3M → 30M monthly video views by Month 6',
      'Follower growth: 0 → 50K across platforms',
      'Engagement rate: > 3% average',
      'Video-driven property inquiries: 200+/month',
    ],
  },
  {
    name: 'Performance Marketing (Paid)',
    icon: Target,
    color: 'text-blue-500',
    allocation_pct: 15,
    monthly_amounts: [6, 7.5, 9.75, 12, 15, 18],
    description: 'Small-scale Google Search ads, social retargeting, and conversion experiments',
    line_items: [
      { item: 'Google Search Ads (High-Intent)', pct: 50, note: '"jual rumah [city]", "apartemen murah [area]" keywords' },
      { item: 'Social Retargeting (Meta/TikTok)', pct: 25, note: 'Retarget website visitors with property listings' },
      { item: 'Landing Page A/B Testing', pct: 15, note: 'Conversion optimization experiments' },
      { item: 'Attribution & Analytics Tools', pct: 10, note: 'UTM tracking, conversion pixel setup, GA4 events' },
    ],
    kpis: [
      'CAC < Rp 50K per qualified lead',
      'ROAS > 3x on search campaigns',
      'CTR > 4% on high-intent keywords',
      'Conversion rate > 5% on landing pages',
    ],
  },
  {
    name: 'Local City Activation',
    icon: MapPin,
    color: 'text-orange-500',
    allocation_pct: 15,
    monthly_amounts: [6, 7.5, 9.75, 12, 15, 18],
    description: 'On-ground agent meetups, developer events, and community engagement',
    line_items: [
      { item: 'Agent Meetup Events', pct: 35, note: 'Monthly agent gatherings in target cities — venue, catering, swag' },
      { item: 'Developer Partnership Promotions', pct: 25, note: 'Co-marketing with property developers, launch event support' },
      { item: 'Community Engagement', pct: 20, note: 'Local property fairs, university housing events' },
      { item: 'Branded Collateral', pct: 20, note: 'Business cards, banners, agent kits, flyers' },
    ],
    kpis: [
      '4+ agent meetups/month across cities',
      '30+ agents onboarded per event',
      '3+ developer partnerships/quarter',
      'Event-to-listing conversion > 40%',
    ],
  },
  {
    name: 'Brand & Influencer',
    icon: Megaphone,
    color: 'text-purple-500',
    allocation_pct: 10,
    monthly_amounts: [4, 5, 6.5, 8, 10, 12],
    description: 'Influencer collaborations, brand awareness campaigns, and thought leadership',
    line_items: [
      { item: 'Influencer Collaborations', pct: 50, note: 'Property/lifestyle influencers — micro (10K-100K) and mid-tier' },
      { item: 'Founder Personal Branding', pct: 20, note: 'LinkedIn content, speaking events, podcast appearances' },
      { item: 'Brand Design & Assets', pct: 15, note: 'Brand guidelines refresh, social templates, motion graphics' },
      { item: 'PR & Media Relations', pct: 15, note: 'Press releases, tech media features, startup ecosystem visibility' },
    ],
    kpis: [
      '5+ influencer campaigns/month',
      'Brand mention growth: +50% MoM',
      'Influencer-driven traffic: 10K+ visits/month',
      'Media features: 2+ per quarter',
    ],
  },
];

// ─── Reallocation Rules ────────────────────────────────────

const reallocationRules = [
  { trigger: 'CAC > Rp 75K for 2 consecutive weeks', action: 'Pause underperforming ad sets, shift 30% budget to SEO', severity: 'high' as const },
  { trigger: 'Organic traffic growth < 15% MoM', action: 'Double down on content production, increase link building spend', severity: 'medium' as const },
  { trigger: 'Video engagement drops below 2%', action: 'A/B test new formats, reallocate 20% to top-performing content types', severity: 'medium' as const },
  { trigger: 'Agent event conversion < 25%', action: 'Redesign event format, test webinar-first approach', severity: 'low' as const },
  { trigger: 'ROAS < 2x on any paid channel', action: 'Cut spend by 50%, redirect to organic channels', severity: 'high' as const },
  { trigger: 'Single channel exceeds 40% of total leads', action: 'Diversify — increase spend on 2nd and 3rd channels', severity: 'medium' as const },
];

// ─── Component ─────────────────────────────────────────────

const formatRp = (millions: number) => `Rp ${millions.toFixed(1)}M`;

const MarketingBudgetDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const monthLabels = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
  const totalBudget6Mo = TOTAL_MONTHLY_BUDGET.reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketing Budget Allocation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          6-month framework — Rp {totalBudget6Mo}M total budget, organic-first with paid experimentation
        </p>
      </div>

      {/* Top-Level Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total 6-Mo Budget', value: `Rp ${totalBudget6Mo}M`, icon: DollarSign, sub: `~Rp ${Math.round(totalBudget6Mo / 6)}M avg/mo` },
          { label: 'Organic Allocation', value: '60%', icon: Search, sub: 'SEO + Social' },
          { label: 'Paid Allocation', value: '15%', icon: Target, sub: 'Search + Retarget' },
          { label: 'Local Activation', value: '15%', icon: MapPin, sub: 'Events + Partners' },
          { label: 'Brand & Influence', value: '10%', icon: Megaphone, sub: 'Influencers + PR' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Budget Scaling */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Monthly Budget Scaling (Rp Millions)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {TOTAL_MONTHLY_BUDGET.map((amount, i) => (
              <button
                key={i}
                onClick={() => setSelectedMonth(i)}
                className={`rounded-lg p-3 text-center transition-all border ${
                  selectedMonth === i
                    ? 'border-primary bg-primary/10'
                    : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <p className="text-[10px] text-muted-foreground">{monthLabels[i]}</p>
                <p className="text-sm font-bold text-foreground">{formatRp(amount)}</p>
                {i > 0 && (
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-[10px] text-green-500">
                      +{Math.round(((amount - TOTAL_MONTHLY_BUDGET[i - 1]) / TOTAL_MONTHLY_BUDGET[i - 1]) * 100)}%
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Breakdown for selected month */}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-foreground">{monthLabels[selectedMonth]} Breakdown</p>
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <cat.icon className={`h-3.5 w-3.5 flex-shrink-0 ${cat.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] text-foreground truncate">{cat.name}</span>
                    <span className="text-[11px] font-medium text-foreground">{formatRp(cat.monthly_amounts[selectedMonth])}</span>
                  </div>
                  <Progress value={cat.allocation_pct} className="h-1" />
                </div>
                <span className="text-[10px] text-muted-foreground w-8 text-right">{cat.allocation_pct}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Deep Dives */}
      <Tabs defaultValue="seo" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {[
            { key: 'seo', label: 'SEO & Organic', icon: Search },
            { key: 'social', label: 'Social & Video', icon: Video },
            { key: 'paid', label: 'Paid Ads', icon: Target },
            { key: 'local', label: 'Local Activation', icon: MapPin },
            { key: 'brand', label: 'Brand & Influence', icon: Megaphone },
            { key: 'rules', label: 'Budget Rules', icon: RefreshCw },
          ].map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="text-xs gap-1.5 data-[state=active]:bg-background">
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat, idx) => {
          const tabKeys = ['seo', 'social', 'paid', 'local', 'brand'];
          return (
            <TabsContent key={tabKeys[idx]} value={tabKeys[idx]} className="mt-4 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <cat.icon className={`h-5 w-5 ${cat.color}`} />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{cat.description}</p>
                </div>
                <Badge variant="outline" className="ml-auto text-[10px]">{cat.allocation_pct}% of budget</Badge>
              </div>

              {/* 6-Month Spend Trajectory */}
              <Card className="bg-muted/20 border-border/30">
                <CardContent className="p-3">
                  <p className="text-[11px] font-medium text-foreground mb-2">6-Month Spend Trajectory</p>
                  <div className="flex items-end gap-1 h-16">
                    {cat.monthly_amounts.map((amt, i) => {
                      const maxAmt = Math.max(...cat.monthly_amounts);
                      const heightPct = (amt / maxAmt) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <span className="text-[9px] text-muted-foreground">{amt.toFixed(0)}M</span>
                          <div
                            className="w-full rounded-t bg-primary/60 transition-all"
                            style={{ height: `${heightPct}%`, minHeight: 4 }}
                          />
                          <span className="text-[9px] text-muted-foreground">M{i + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Total: {formatRp(cat.monthly_amounts.reduce((s, v) => s + v, 0))} over 6 months
                  </p>
                </CardContent>
              </Card>

              {/* Line Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cat.line_items.map((item) => (
                  <div key={item.item} className="border border-border/40 rounded-lg p-3 bg-card/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-foreground">{item.item}</span>
                      <Badge variant="outline" className="text-[10px]">{item.pct}%</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.note}</p>
                    <div className="mt-1.5">
                      <Progress value={item.pct} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>

              {/* KPIs */}
              <Card className="bg-muted/20 border-border/30">
                <CardContent className="p-3">
                  <p className="text-[11px] font-medium text-foreground mb-2 flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" /> Target KPIs
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {cat.kpis.map((kpi, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-[11px] text-muted-foreground">{kpi}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}

        {/* Budget Rules Tab */}
        <TabsContent value="rules" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">ROI Monitoring & Reallocation Rules</h3>
              <p className="text-[11px] text-muted-foreground">Automated budget governance — trigger-based reallocation logic</p>
            </div>
          </div>

          {/* Review Cadence */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="p-3">
              <p className="text-[11px] font-medium text-foreground mb-2">Review Cadence</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { freq: 'Weekly', scope: 'Paid ad performance, CAC, ROAS per channel', action: 'Pause or boost ad sets' },
                  { freq: 'Bi-Weekly', scope: 'Content output vs. traffic impact, social engagement trends', action: 'Adjust content mix' },
                  { freq: 'Monthly', scope: 'Full budget review — allocation % vs. ROI by channel', action: 'Rebalance allocations' },
                ].map((review) => (
                  <div key={review.freq} className="border border-border/40 rounded-lg p-2.5 bg-card/40">
                    <p className="text-[11px] font-semibold text-foreground">{review.freq}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{review.scope}</p>
                    <p className="text-[10px] text-primary mt-1">→ {review.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reallocation Triggers */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Reallocation Triggers</p>
            {reallocationRules.map((rule, i) => (
              <div key={i} className="border border-border/40 rounded-lg p-3 bg-card/40 flex items-start gap-3">
                <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                  rule.severity === 'high' ? 'text-destructive' :
                  rule.severity === 'medium' ? 'text-amber-500' : 'text-muted-foreground'
                }`} />
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-foreground">{rule.trigger}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">→ {rule.action}</p>
                </div>
                <Badge variant="outline" className={`text-[9px] ${
                  rule.severity === 'high' ? 'border-destructive/50 text-destructive' :
                  rule.severity === 'medium' ? 'border-amber-500/50 text-amber-500' : ''
                }`}>
                  {rule.severity}
                </Badge>
              </div>
            ))}
          </div>

          {/* Scaling Rules */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="p-3">
              <p className="text-[11px] font-medium text-foreground mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3" /> Budget Scaling Rules
              </p>
              <div className="space-y-1.5">
                {[
                  { rule: 'If organic traffic grows > 30% MoM → increase SEO budget by 20%', type: 'scale-up' },
                  { rule: 'If paid CAC is < Rp 30K → double paid budget from reserve', type: 'scale-up' },
                  { rule: 'If any channel delivers < 5% of total leads → cut to minimum viable', type: 'scale-down' },
                  { rule: 'If total spend < 80% of monthly budget → reinvest in top 2 channels', type: 'optimize' },
                  { rule: 'New city launch → allocate Rp 10M activation bonus for first 30 days', type: 'special' },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    {r.type === 'scale-up' ? <ArrowUpRight className="h-3 w-3 text-green-500 mt-0.5" /> :
                     r.type === 'scale-down' ? <ArrowDownRight className="h-3 w-3 text-destructive mt-0.5" /> :
                     <RefreshCw className="h-3 w-3 text-primary mt-0.5" />}
                    <span className="text-[11px] text-muted-foreground">{r.rule}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Organic vs Paid Split Philosophy */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <PieChart className="h-4 w-4 text-primary" />
            Organic-First Strategy Rationale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Why 60% Organic / 15% Paid</p>
              <ul className="space-y-1.5">
                {[
                  'SEO compounds — Month 6 traffic costs 80% less per visit than Month 1',
                  'Property search intent is 73% Google-first in Indonesia',
                  'Social video virality has zero marginal cost at scale',
                  'Agent referral loops create organic supply-side growth',
                  'Paid channels validate demand before scaling organic',
                ].map((item, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary">▸</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Paid as Validation Engine</p>
              <ul className="space-y-1.5">
                {[
                  'Test keywords before committing SEO resources',
                  'Validate city demand with Rp 2-3M test budgets',
                  'Retarget warm audiences from organic for conversion lift',
                  'Use paid data to inform content calendar priorities',
                  'Scale paid only when CAC < 2x organic acquisition cost',
                ].map((item, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <span className="text-green-500">▸</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingBudgetDashboard;
