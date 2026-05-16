
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Building2, TrendingUp, Megaphone, CheckCircle2, ArrowUpRight,
  Target, Clock, Image, MapPin, MessageSquare, Users, Star,
  Zap, AlertTriangle, ShieldAlert, BarChart3, CalendarDays
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// ── Section 1: First 500 Listings ────────────────────────────────────────────
const supplyPhases = [
  {
    phase: 'Phase 1: Foundation (Listings 1–100)',
    timeline: 'Week 1–3',
    actions: [
      'Contact 10 agents/day — target top 3 high-demand districts',
      'Offer full manual upload service: "Send photos on WhatsApp, we handle everything"',
      'Import verified listings from partner agencies (bulk CSV/spreadsheet)',
      'Set minimum standard: 5+ photos, accurate pricing, complete description',
      'Focus on Rp 500M–3B range — highest buyer demand segment'
    ],
    target: '5–7 listings/day'
  },
  {
    phase: 'Phase 2: Density Building (Listings 100–300)',
    timeline: 'Week 4–7',
    actions: [
      'Expand to 5 target districts — maintain 20+ listings per district',
      'Launch "Multi-Listing Bonus": agents with 10+ get free premium visibility',
      'Weekly quality audit: flag low-photo or stale-price listings for refresh',
      'Pricing guidance tool: share comparable data so agents price competitively',
      'Activate referral program: agents earn priority placement for recruiting peers'
    ],
    target: '8–12 listings/day'
  },
  {
    phase: 'Phase 3: Acceleration (Listings 300–500)',
    timeline: 'Week 8–12',
    actions: [
      'Approach small brokerage offices — offer team onboarding sessions',
      'Partner with 2–3 developers for project inventory integration',
      'Automate listing refresh reminders (every 14 days)',
      'Launch "Verified Listing" badge for agents who meet quality criteria',
      'Ensure balanced coverage: villa, apartment, land, commercial across districts'
    ],
    target: '12–15 listings/day'
  }
];

const listingKPIs = [
  { label: 'Listings Added/Day', target: '10+', current: 35 },
  { label: 'Active Vendor Rate', target: '70%+', current: 50 },
  { label: 'Listings with Inquiries', target: '40%+', current: 25 },
  { label: 'Avg Photos/Listing', target: '8+', current: 45 }
];

// ── Section 2: Inquiry Conversion ────────────────────────────────────────────
const conversionLayers = [
  {
    layer: 'Response Speed',
    icon: Clock,
    strategies: [
      'Instant WhatsApp notification to agent on every inquiry',
      'Auto-reply to buyer: "Agent will respond within 30 minutes"',
      'Founder personally calls agent if no response in 1 hour',
      'Performance badge: "⚡ Fast Responder" for <15min average agents',
      'Weekly report: agents ranked by response speed (peer pressure)'
    ],
    metric: 'Target: 80% responses within 30 minutes'
  },
  {
    layer: 'Viewing Funnel',
    icon: CalendarDays,
    strategies: [
      'One-click viewing request: buyer picks date, agent confirms',
      'Automated reminder 24h + 2h before scheduled viewing',
      'Post-viewing follow-up: "How was it? Ready to make an offer?"',
      'If no viewing in 3 days after inquiry, suggest alternative listings',
      '"[X] people also viewing this property" social proof nudge'
    ],
    metric: 'Target: 35% inquiry-to-viewing conversion'
  },
  {
    layer: 'Trust & Decision Support',
    icon: Star,
    strategies: [
      'Verified listing badge — agent confirmed price, availability, photos',
      'Show comparable properties: "Similar villas in area: Rp 1.2B–1.8B"',
      'Highlight agent track record: "[X] deals closed, [Y] avg response time"',
      'Investment yield estimate on relevant properties',
      'Platform guarantee messaging: "Verified agents, real listings"'
    ],
    metric: 'Target: 25% viewing-to-offer intent'
  }
];

const conversionKPIs = [
  { label: 'Inquiry→Viewing', target: '35%', current: 20 },
  { label: 'Viewing→Offer Intent', target: '25%', current: 15 },
  { label: 'Avg Response Time', target: '<30min', current: 40 },
  { label: 'Repeat Buyer Rate', target: '20%+', current: 10 }
];

// ── Section 3: Local Brand Authority ─────────────────────────────────────────
const prChannels = [
  {
    channel: 'Social Media Content Engine',
    cadence: '5x/week',
    tactics: [
      'Monday: "Top 5 Properties This Week" carousel post',
      'Tuesday: Market insight — "Average villa price in [district] is..."',
      'Wednesday: Agent spotlight — "[Agent] closed 3 deals this month via Astra"',
      'Thursday: Hot listing video tour (60s Reels/TikTok)',
      'Friday: Weekend open house or new listing announcement'
    ]
  },
  {
    channel: 'Community Authority Building',
    cadence: 'Monthly',
    tactics: [
      'Host "Property Investment Meetup" — 15-20 attendees, informal networking',
      'Partner with 1 trusted developer for co-branded property showcase event',
      'Create "Astra District Report" — free PDF with price trends, demand data',
      'Sponsor or participate in local business networking events',
      'Guest speaker at university or expat community property workshops'
    ]
  },
  {
    channel: 'Digital Presence & SEO',
    cadence: 'Ongoing',
    tactics: [
      'District landing pages: "/invest/canggu", "/invest/seminyak" etc.',
      'Blog: "Complete Guide to Buying Property in [District] 2026"',
      'Google My Business listing with reviews from satisfied agents',
      'Targeted Google Ads on "[district] property for sale" keywords',
      'Build backlinks via guest posts on local property blogs'
    ]
  },
  {
    channel: 'Media & PR Outreach',
    cadence: 'Bi-weekly',
    tactics: [
      'Press release: "Astra reaches [X] listings — fastest growing platform in [city]"',
      'Pitch to local English-language publications (Coconuts, The Bali Sun)',
      'LinkedIn articles: founder thought leadership on property market trends',
      'Partner with property YouTubers for listing feature collaborations',
      'Submit to PropTech / startup award programs for credibility'
    ]
  }
];

const authorityKPIs = [
  { label: 'Brand Search Volume', target: '+50%/month' },
  { label: 'Repeat Visitors', target: '30%+' },
  { label: 'Inbound Agent Inquiries', target: '5+/week' },
  { label: 'Social Engagement Rate', target: '4%+' }
];

// ── Section 4: Weekly Monitoring ─────────────────────────────────────────────
const weeklyChecklist = [
  { item: 'Total active listings count vs target (500)', category: 'Supply' },
  { item: 'New listings added this week', category: 'Supply' },
  { item: 'Stale listings (no update >30 days) flagged for refresh', category: 'Supply' },
  { item: 'Inquiry volume and inquiry-per-listing ratio', category: 'Demand' },
  { item: 'Average agent response time this week', category: 'Conversion' },
  { item: 'Viewings scheduled and completed', category: 'Conversion' },
  { item: 'Social media engagement and reach metrics', category: 'Brand' },
  { item: 'New organic visitor growth (Google Analytics)', category: 'Brand' },
  { item: 'Vendor churn: agents who stopped listing', category: 'Risk' },
  { item: 'Listing quality audit: % meeting photo/description standards', category: 'Quality' }
];

// ── Section 5: Bottleneck Indicators ─────────────────────────────────────────
const bottlenecks = [
  {
    signal: 'Listings growth <5/day for 3+ consecutive days',
    action: 'Emergency agent outreach blitz — double daily contact target, offer concierge upload',
    severity: 'Critical'
  },
  {
    signal: 'Inquiry-to-viewing rate drops below 20%',
    action: 'Audit agent response times — personally call worst responders, enable auto-reassignment',
    severity: 'Critical'
  },
  {
    signal: '>30% of listings have zero inquiries after 14 days',
    action: 'Review pricing competitiveness, improve photos, boost visibility for underperforming listings',
    severity: 'High'
  },
  {
    signal: 'Social content engagement below 2%',
    action: 'Test new content formats — video tours, price reveals, behind-the-scenes. Engage in comments.',
    severity: 'Medium'
  },
  {
    signal: 'Vendor churn >10% monthly',
    action: 'Survey departing agents, improve onboarding experience, increase visible inquiry delivery',
    severity: 'High'
  }
];

const severityColor = (s: string) => {
  if (s === 'Critical') return 'bg-destructive/10 text-destructive border-destructive/20';
  if (s === 'High') return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
  return 'bg-primary/10 text-primary border-primary/20';
};

const categoryColor = (c: string) => {
  const map: Record<string, string> = {
    Supply: 'bg-chart-1/10 text-chart-1',
    Demand: 'bg-primary/10 text-primary',
    Conversion: 'bg-chart-3/10 text-chart-3',
    Brand: 'bg-chart-2/10 text-chart-2',
    Risk: 'bg-destructive/10 text-destructive',
    Quality: 'bg-chart-4/10 text-chart-4'
  };
  return map[c] || 'bg-muted/30 text-muted-foreground';
};

const First500ListingsBlueprint = () => {
  const [activeTab, setActiveTab] = useState('listings');

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn}>
        <Card className="border-chart-1/20 bg-gradient-to-r from-chart-1/5 via-background to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-chart-1/10 border border-chart-1/20">
                  <Building2 className="h-6 w-6 text-chart-1" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    First 500 Listings + Conversion + Brand Authority
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Supply growth • Inquiry conversion • Local market credibility
                  </p>
                </div>
              </div>
              <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-xs">
                Traction Engine
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="listings" className="text-xs">🏠 500 Listings</TabsTrigger>
          <TabsTrigger value="conversion" className="text-xs">🔄 Conversion</TabsTrigger>
          <TabsTrigger value="brand" className="text-xs">📢 Brand PR</TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs">📋 Weekly Check</TabsTrigger>
          <TabsTrigger value="bottlenecks" className="text-xs">⚠️ Bottlenecks</TabsTrigger>
        </TabsList>

        {/* ── 500 Listings ────────────────────────────────────────────────── */}
        <TabsContent value="listings" className="space-y-4 mt-4">
          {supplyPhases.map((phase, i) => (
            <motion.div key={phase.phase} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 hover:border-chart-1/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-chart-1" />
                      {phase.phase}
                    </CardTitle>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[10px]">{phase.timeline}</Badge>
                      <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-[10px]">{phase.target}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1.5">
                    {phase.actions.map((a, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ArrowUpRight className="h-3 w-3 text-chart-1 mt-0.5 flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Supply Growth KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {listingKPIs.map((kpi) => (
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

        {/* ── Conversion ──────────────────────────────────────────────────── */}
        <TabsContent value="conversion" className="space-y-4 mt-4">
          {conversionLayers.map((layer, i) => (
            <motion.div key={layer.layer} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <layer.icon className="h-4 w-4 text-primary" />
                      {layer.layer}
                    </CardTitle>
                  </div>
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
                    <p className="text-[10px] text-muted-foreground">
                      <strong className="text-primary">{layer.metric}</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Conversion KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {conversionKPIs.map((kpi) => (
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

        {/* ── Brand PR ────────────────────────────────────────────────────── */}
        <TabsContent value="brand" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prChannels.map((ch, i) => (
              <motion.div key={ch.channel} {...fadeIn} transition={{ delay: i * 0.05 }}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-foreground">{ch.channel}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">{ch.cadence}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1.5">
                      {ch.tactics.map((t, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Megaphone className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Brand Authority KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {authorityKPIs.map((kpi) => (
                  <div key={kpi.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-sm font-bold text-foreground">{kpi.target}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Weekly Checklist ─────────────────────────────────────────────── */}
        <TabsContent value="weekly" className="mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Weekly Traction Monitoring Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weeklyChecklist.map((item, i) => (
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

        {/* ── Bottlenecks ──────────────────────────────────────────────────── */}
        <TabsContent value="bottlenecks" className="space-y-3 mt-4">
          {bottlenecks.map((b, i) => (
            <motion.div key={b.signal} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-chart-3 flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">{b.signal}</span>
                    </div>
                    <Badge className={`text-[10px] border ${severityColor(b.severity)}`}>{b.severity}</Badge>
                  </div>
                  <div className="ml-6 p-2 rounded-md bg-chart-1/5 border border-chart-1/10">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-chart-1">Action:</strong> {b.action}
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

export default First500ListingsBlueprint;
