
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Globe, Image, Heart, TrendingUp, CheckCircle2, ArrowUpRight,
  Target, Zap, BarChart3, AlertTriangle, ShieldAlert, CalendarDays,
  Camera, Star, Trophy, Users, Eye, Clock, Share2
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// ── Section 1: 1,000 Daily Visitors ──────────────────────────────────────────
const trafficChannels = [
  {
    channel: 'Performance Marketing',
    share: '45% of traffic',
    tactics: [
      'Google Ads: "jual villa [district]", "properti investasi [city]" — long-tail geo keywords',
      'Facebook/Instagram: carousel ads with top 5 listings per district',
      'Retargeting: 7-day window for listing viewers who didn\'t inquire',
      'District landing pages: "/invest/canggu" with SEO + paid traffic combo',
      'Budget allocation: 60% Google Search, 25% Social, 15% Retargeting'
    ],
    metric: 'Target CPC: Rp 1,500–3,000 | CTR: 4%+'
  },
  {
    channel: 'Content & SEO',
    share: '30% of traffic',
    tactics: [
      'Daily Instagram/TikTok: 60s property tour with price + ROI overlay',
      'Weekly blog: "Best Investment Properties in [District] This Week"',
      'YouTube: "Property Market Update [City]" — 5min monthly video',
      'SEO pages for every district + property type combination',
      'Google My Business optimization with agent review collection'
    ],
    metric: 'Target: 300+ organic daily visitors by month 3'
  },
  {
    channel: 'Network & Referral',
    share: '15% of traffic',
    tactics: [
      'WhatsApp broadcast: weekly "Hot 5 Properties" to subscriber list',
      'Buyer referral: Rp 250K voucher for each friend who makes inquiry',
      'Mortgage broker partnership: shared landing page for pre-qualified buyers',
      'Expat relocation agent collaboration: property discovery for newcomers',
      'Social sharing buttons with tracking UTMs on every listing'
    ],
    metric: 'Target: 150+ daily referral visitors'
  },
  {
    channel: 'Viral & Community',
    share: '10% of traffic',
    tactics: [
      '"Price Guess" Instagram stories — engage followers with property pricing',
      'Before/after renovation content for investment properties',
      'District comparison infographics: Canggu vs Seminyak vs Ubud',
      'Collaboration with lifestyle/travel influencers for property features',
      'Community meetup post-event content — photos, insights shared'
    ],
    metric: 'Target: 100+ daily community-driven visitors'
  }
];

const trafficKPIs = [
  { label: 'Daily Unique Visitors', target: '1,000+', current: 25 },
  { label: 'Inquiry Rate', target: '3%+', current: 15 },
  { label: 'Repeat Visit Rate', target: '25%+', current: 20 },
  { label: 'Avg Session Duration', target: '3min+', current: 30 }
];

// ── Section 2: Listing Quality ───────────────────────────────────────────────
const qualityFrameworks = [
  {
    area: 'Photo Standards',
    icon: Camera,
    standards: [
      'Minimum 8 photos per listing — reject below 5',
      'Required order: Hero exterior → Living area → Bedrooms → Kitchen/Bath → Pool/Garden → View → Map',
      'Landscape orientation only — no dark, blurry, or cluttered shots',
      'Natural daylight preferred — shoot between 10 AM–3 PM',
      'Wide-angle lens recommended for interior shots (smartphone ultra-wide OK)',
      'No watermarks, agent logos, or text overlays on photos'
    ],
    impact: 'Listings with 8+ quality photos get 3.2x more inquiries'
  },
  {
    area: 'Description Framework',
    icon: Eye,
    standards: [
      'First line: KEY selling point ("Stunning ocean-view villa in prime Canggu")',
      'Bullet format: 5–8 highlights (bedrooms, pool, view, ROI, location)',
      'Include investment angle: "Current rental yield: 8–12% annually"',
      'Mention nearby amenities: beach (Xmin), restaurants, schools',
      'End with urgency: "High-demand area — schedule viewing today"',
      'Word count: 150–300 words — concise but complete'
    ],
    impact: 'Optimized descriptions increase inquiry rate by 45%'
  },
  {
    area: 'Conversion Boosters',
    icon: Zap,
    standards: [
      'Clear price display — no "contact for price" (kills 60% of interest)',
      'Price/sqm comparison badge: "12% below area average"',
      '"🔥 Hot Property" badge for listings with 10+ views/day',
      '"[X] people viewed this week" social proof counter',
      'Nearby POI map with distance markers',
      'Virtual tour link for premium listings'
    ],
    impact: 'Trust signals increase viewing requests by 55%'
  }
];

const qualityKPIs = [
  { label: 'Inquiries/Listing', target: '2+/week', current: 30 },
  { label: 'Time on Listing Page', target: '90s+', current: 40 },
  { label: 'Listings with 8+ Photos', target: '80%+', current: 25 },
  { label: 'High-Engagement Rate', target: '40%+', current: 20 }
];

// ── Section 3: Agent Loyalty ─────────────────────────────────────────────────
const loyaltyLayers = [
  {
    layer: 'Performance Recognition',
    icon: Trophy,
    strategies: [
      'Monthly "Top 10 Agents" leaderboard — visible on agent dashboard',
      'Quarterly "Astra Star Agent" award — featured in social media + email',
      'Success story spotlight: "[Agent] sold 5 properties via Astra this month"',
      'Performance badge system: Bronze (5 deals) → Silver (15) → Gold (30) → Platinum (50+)',
      'Annual "Agent of the Year" — trophy + premium listing package prize'
    ],
    metric: 'Target: 80% of agents aware of leaderboard'
  },
  {
    layer: 'Value Reinforcement',
    icon: Star,
    strategies: [
      'Weekly WhatsApp summary: "Your listings got [X] views, [Y] inquiries this week"',
      'Priority lead routing to agents with fastest response times',
      'Free premium visibility boost for agents listing 10+ properties',
      'Early access to high-intent buyer inquiries before general distribution',
      'Exclusive market data reports for active agents (monthly)'
    ],
    metric: 'Target: agents receiving 5+ inquiries/week feel platform value'
  },
  {
    layer: 'Churn Prevention',
    icon: Heart,
    strategies: [
      'Auto-detect inactivity: trigger re-engagement after 5 days no uploads',
      'Personal founder call for any agent with 10+ listings going inactive',
      'Exit survey: understand why agents reduce activity — fix top 3 reasons',
      'Win-back offer: 30-day free premium for returning inactive agents',
      '"Concierge upload" service — send photos on WhatsApp, we handle the rest'
    ],
    metric: 'Target: <8% monthly agent churn'
  }
];

const retentionKPIs = [
  { label: 'Agent Retention Rate', target: '92%+', current: 70 },
  { label: 'Listings/Agent', target: '8+', current: 35 },
  { label: 'Repeat Monetization', target: '40%+', current: 15 },
  { label: 'Agent NPS', target: '50+', current: 25 }
];

// ── Section 4: Daily Monitoring ──────────────────────────────────────────────
const dailyChecklist = [
  { item: 'Check total daily visitors vs 1,000 target', category: 'Traffic' },
  { item: 'Review ad campaign performance — pause <1% CTR ads', category: 'Traffic' },
  { item: 'Post daily social media content (property tour or insight)', category: 'Content' },
  { item: 'Audit 5 new listings for photo/description quality', category: 'Quality' },
  { item: 'Flag listings with <5 photos for agent follow-up', category: 'Quality' },
  { item: 'Check inquiry conversion rate by traffic source', category: 'Conversion' },
  { item: 'Review agent response times — call slow responders', category: 'Agents' },
  { item: 'Send performance summary to top 5 active agents', category: 'Agents' },
  { item: 'Monitor repeat visit rate and session duration trends', category: 'Engagement' },
  { item: 'Evening: note wins, blockers, tomorrow\'s priority', category: 'Execution' }
];

// ── Section 5: Growth Plateau Risks ──────────────────────────────────────────
const risks = [
  {
    signal: 'Daily visitors stuck below 500 for 2+ weeks',
    action: 'Diversify traffic sources — test YouTube shorts, TikTok property tours, offline QR campaigns',
    severity: 'Critical'
  },
  {
    signal: 'Inquiry rate drops below 2% despite traffic growth',
    action: 'Listing quality audit — improve photos, descriptions, and pricing clarity for bottom 50%',
    severity: 'Critical'
  },
  {
    signal: 'Top agents generating 70%+ of all inquiries',
    action: 'Concentration risk — actively recruit and nurture mid-tier agents with coaching and boosts',
    severity: 'High'
  },
  {
    signal: 'Agent churn exceeds 10% monthly',
    action: 'Emergency retention: personal calls, concierge upload service, free premium visibility',
    severity: 'High'
  },
  {
    signal: 'Social content engagement plateaus below 2%',
    action: 'Shift to video-first (Reels/TikTok), test price reveal hooks, add agent personality content',
    severity: 'Medium'
  }
];

const severityColor = (s: string) => {
  if (s === 'Critical') return 'bg-destructive/10 text-destructive border-destructive/20';
  if (s === 'High') return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
  return 'bg-primary/10 text-primary border-primary/20';
};

const categoryColor = (c: string) => {
  const map: Record<string, string> = {
    Traffic: 'bg-primary/10 text-primary',
    Content: 'bg-chart-2/10 text-chart-2',
    Quality: 'bg-chart-1/10 text-chart-1',
    Conversion: 'bg-chart-3/10 text-chart-3',
    Agents: 'bg-chart-4/10 text-chart-4',
    Engagement: 'bg-chart-5/10 text-chart-5',
    Execution: 'bg-muted-foreground/10 text-muted-foreground'
  };
  return map[c] || 'bg-muted/30 text-muted-foreground';
};

const ThousandVisitorsBlueprint = () => {
  const [activeTab, setActiveTab] = useState('traffic');

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-chart-1/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    1,000 Daily Visitors + Quality + Agent Loyalty
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Traffic engine • Listing presentation • Vendor retention systems
                  </p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                Traction Growth
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="traffic" className="text-xs">🚀 1K Visitors</TabsTrigger>
          <TabsTrigger value="quality" className="text-xs">📸 Listing Quality</TabsTrigger>
          <TabsTrigger value="loyalty" className="text-xs">❤️ Agent Loyalty</TabsTrigger>
          <TabsTrigger value="daily" className="text-xs">📋 Daily Check</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">⚠️ Plateau Risks</TabsTrigger>
        </TabsList>

        {/* ── Traffic Engine ───────────────────────────────────────────────── */}
        <TabsContent value="traffic" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trafficChannels.map((ch, i) => (
              <motion.div key={ch.channel} {...fadeIn} transition={{ delay: i * 0.05 }}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-foreground">{ch.channel}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">{ch.share}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1.5 mb-3">
                      {ch.tactics.map((t, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowUpRight className="h-3 w-3 text-chart-1 mt-0.5 flex-shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div className="p-2 rounded-md bg-primary/5 border border-primary/10">
                      <p className="text-[10px] text-primary font-medium">{ch.metric}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Traffic KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {trafficKPIs.map((kpi) => (
                  <div key={kpi.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-sm font-bold text-foreground mb-1">{kpi.target}</p>
                    <Progress value={kpi.current} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Listing Quality ──────────────────────────────────────────────── */}
        <TabsContent value="quality" className="space-y-4 mt-4">
          {qualityFrameworks.map((fw, i) => (
            <motion.div key={fw.area} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 hover:border-chart-1/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <fw.icon className="h-4 w-4 text-chart-1" />
                      {fw.area}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1.5 mb-3">
                    {fw.standards.map((s, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-chart-1 mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <div className="p-2 rounded-md bg-chart-1/5 border border-chart-1/10">
                    <p className="text-[10px] text-chart-1 font-medium">📈 {fw.impact}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Quality KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {qualityKPIs.map((kpi) => (
                  <div key={kpi.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-sm font-bold text-foreground mb-1">{kpi.target}</p>
                    <Progress value={kpi.current} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Agent Loyalty ────────────────────────────────────────────────── */}
        <TabsContent value="loyalty" className="space-y-4 mt-4">
          {loyaltyLayers.map((layer, i) => (
            <motion.div key={layer.layer} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <layer.icon className="h-4 w-4 text-primary" />
                    {layer.layer}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1.5 mb-3">
                    {layer.strategies.map((s, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3 text-chart-3 mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <div className="p-2 rounded-md bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-primary font-medium">{layer.metric}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Retention KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {retentionKPIs.map((kpi) => (
                  <div key={kpi.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-sm font-bold text-foreground mb-1">{kpi.target}</p>
                    <Progress value={kpi.current} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Daily Checklist ──────────────────────────────────────────────── */}
        <TabsContent value="daily" className="mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Daily Traffic & Engagement Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dailyChecklist.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{item.item}</span>
                    </div>
                    <Badge className={`text-[10px] ${categoryColor(item.category)}`}>{item.category}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Plateau Risks ────────────────────────────────────────────────── */}
        <TabsContent value="risks" className="space-y-3 mt-4">
          {risks.map((r, i) => (
            <motion.div key={r.signal} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-chart-3 flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">{r.signal}</span>
                    </div>
                    <Badge className={`text-[10px] border ${severityColor(r.severity)}`}>{r.severity}</Badge>
                  </div>
                  <div className="ml-6 p-2 rounded-md bg-chart-1/5 border border-chart-1/10">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-chart-1">Action:</strong> {r.action}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThousandVisitorsBlueprint;
