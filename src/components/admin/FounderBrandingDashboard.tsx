import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, CheckCircle2, ArrowRight, ChevronRight, ChevronDown, Target,
  TrendingUp, BookOpen, Globe, Rocket, Layers, Timer, Star, Zap,
  Crown, Shield, Mic, Video, FileText, Linkedin, MessageCircle,
  Podcast, Calendar, Award, Eye, Sparkles, PenTool, BarChart3,
  Heart, Flag, Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Brand Positioning ──

const brandIdentity = {
  tagline: "Where Property Intelligence Meets AI Innovation",
  positioning: "The founder who bridges deep property market expertise with cutting-edge AI — making institutional-grade investment intelligence accessible to every Indonesian property buyer and investor.",
  archetypes: [
    { archetype: "The Visionary Builder", description: "Documents the journey of building national property infrastructure — transparent, data-driven, ambitious", color: "text-primary" },
    { archetype: "The Market Intelligence Expert", description: "Shares proprietary market insights that no one else has — data from the platform, AI predictions, trend analysis", color: "text-chart-1" },
    { archetype: "The Accessible Innovator", description: "Explains complex AI and property concepts in simple, actionable language — democratizing knowledge", color: "text-chart-3" },
  ],
  differentiators: [
    "Only founder combining live platform data + AI predictions + property market depth",
    "Not theoretical — shares real metrics, real predictions, real outcomes from a production platform",
    "Indonesian market focus with global AI methodology — locally relevant, globally credible",
    "Builder-storyteller: shows the process, not just the results",
  ],
};

// ── Content Pillars ──

interface ContentPillar {
  pillar: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  frequency: string;
  description: string;
  topics: { title: string; format: string; hook: string }[];
  kpi: string;
}

const contentPillars: ContentPillar[] = [
  {
    pillar: "Property Investment Intelligence", icon: BarChart3, color: "text-chart-1", bg: "bg-chart-1/10",
    frequency: "2x/week", description: "Data-backed investment insights from the platform — what the AI sees, what the market says, where the opportunities are",
    topics: [
      { title: "Monthly City Investment Ranking", format: "LinkedIn carousel + YouTube", hook: "Our AI analyzed 15,000 properties — here's which cities are undervalued right now" },
      { title: "AI vs Reality: Prediction Accuracy Report", format: "LinkedIn article + Thread", hook: "6 months ago our AI predicted Bandung prices would rise 12%. Here's what actually happened..." },
      { title: "Hidden Gem Property Opportunities", format: "Instagram Reels + TikTok", hook: "This Rp 800M property in [city] has a 9.2% rental yield — and nobody's talking about it" },
      { title: "Developer Project Deep-Dives", format: "YouTube long-form", hook: "I analyzed every new development in BSD City — here's what's actually worth buying" },
    ],
    kpi: "50K+ impressions per post, 5% engagement rate",
  },
  {
    pillar: "Market Trend Analysis", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10",
    frequency: "1x/week", description: "Macro and micro market analysis — making sense of the property market for investors, agents, and the media",
    topics: [
      { title: "National Property Market Monthly Brief", format: "LinkedIn article + PDF report", hook: "March 2026 Indonesia Property Market: 3 trends every investor must know" },
      { title: "IKN Nusantara Effect: Real Data", format: "YouTube explainer + LinkedIn", hook: "We tracked 2,000 transactions near IKN — here's what's actually happening to prices" },
      { title: "Interest Rate Impact Analysis", format: "LinkedIn post + Twitter thread", hook: "BI just cut rates again. Our AI model shows which cities benefit most — and it's not Jakarta" },
      { title: "Infrastructure → Property Value Correlation", format: "LinkedIn carousel", hook: "Every time a new toll road opens, nearby property prices move by X%. Here's the data." },
    ],
    kpi: "10K+ article views, 3 media pickups/month",
  },
  {
    pillar: "Startup Building Journey", icon: Rocket, color: "text-chart-3", bg: "bg-chart-3/10",
    frequency: "1x/week", description: "Transparent documentation of building a national PropTech platform — wins, losses, metrics, lessons",
    topics: [
      { title: "Monthly Growth Metrics Update", format: "LinkedIn post", hook: "Month 6 update: 15K listings, 600 agents, Rp 2.3B MRR — here's what worked and what didn't" },
      { title: "Fundraising Journey Documentation", format: "LinkedIn article", hook: "We raised our seed round in 6 weeks. Here's exactly how we pitched, who we talked to, and what worked." },
      { title: "Engineering Decisions Explained", format: "LinkedIn + Dev community", hook: "Why we chose Supabase over Firebase — and how it handles 50K queries/day for our AI engine" },
      { title: "Hiring & Team Building Stories", format: "LinkedIn post", hook: "We hired our Head of AI from Gojek. Here's how we convinced a Big Tech engineer to join a 10-person startup." },
    ],
    kpi: "20K+ post views, 500+ profile visits/week",
  },
  {
    pillar: "Future of AI in Real Estate", icon: Sparkles, color: "text-chart-4", bg: "bg-chart-4/10",
    frequency: "2x/month", description: "Thought leadership on where AI and property intersect — positioning as the expert voice on PropTech innovation",
    topics: [
      { title: "AI Will Replace Property Agents? My Honest Take", format: "YouTube + LinkedIn article", hook: "As someone building AI for property, here's why agents become MORE valuable, not less" },
      { title: "What Property Data Reveals About Indonesia's Economy", format: "LinkedIn long-form", hook: "Property transactions are a leading indicator of economic health. Here's what our data shows." },
      { title: "The Bloomberg Terminal for Property", format: "YouTube vision piece", hook: "We're building what Bloomberg built for finance — but for property. Here's the 10-year vision." },
      { title: "Fractional Property: When and How", format: "LinkedIn article", hook: "Fractional ownership will unlock property for millions. Here's the regulatory and technical roadmap." },
    ],
    kpi: "Viral potential: 100K+ views on best pieces, keynote invitations",
  },
];

// ── Channel Strategy ──

interface ChannelStrategy {
  channel: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  frequency: string;
  targetAudience: string;
  contentTypes: string[];
  growthTargets: { metric: string; month3: string; month6: string; month12: string }[];
  bestPractices: string[];
}

const channelStrategies: ChannelStrategy[] = [
  {
    channel: "LinkedIn", icon: Linkedin, color: "text-primary", bg: "bg-primary/10",
    frequency: "5x/week", targetAudience: "Investors, VCs, property professionals, media",
    contentTypes: ["Long-form articles (1x/week)", "Carousels with data insights (2x/week)", "Short posts with platform metrics (2x/week)", "Comment engagement on industry posts (daily)"],
    growthTargets: [
      { metric: "Followers", month3: "5,000", month6: "15,000", month12: "50,000" },
      { metric: "Post Impressions", month3: "50K/week", month6: "200K/week", month12: "500K/week" },
      { metric: "Profile Views", month3: "500/week", month6: "2,000/week", month12: "5,000/week" },
    ],
    bestPractices: ["Post between 7-8 AM WIB (peak Indonesian LinkedIn)", "First line = hook — question or surprising data point", "End every post with engagement prompt (question or CTA)", "Reply to every comment within 2 hours — algorithm boost + relationship building"],
  },
  {
    channel: "YouTube", icon: Video, color: "text-destructive", bg: "bg-destructive/10",
    frequency: "2x/week", targetAudience: "Property investors, aspiring buyers, startup enthusiasts",
    contentTypes: ["Market analysis deep-dives (10-15 min)", "Property investment explainers (5-8 min)", "Startup journey vlogs (8-12 min)", "Shorts: quick data insights (< 60 sec)"],
    growthTargets: [
      { metric: "Subscribers", month3: "2,000", month6: "10,000", month12: "50,000" },
      { metric: "Monthly Views", month3: "20K", month6: "100K", month12: "500K" },
      { metric: "Watch Time", month3: "1K hrs", month6: "5K hrs", month12: "25K hrs" },
    ],
    bestPractices: ["Thumbnail: face + data visual + bold text — 8%+ CTR target", "First 30 seconds = hook with surprising insight or question", "Mention platform data naturally — don't hard sell", "Consistent upload schedule: Tuesday & Thursday 6 PM WIB"],
  },
  {
    channel: "Podcast Appearances", icon: Podcast, color: "text-chart-4", bg: "bg-chart-4/10",
    frequency: "2-3x/month", targetAudience: "Startup founders, investors, property enthusiasts",
    contentTypes: ["Startup/VC podcasts (building journey angle)", "Property investment podcasts (market intelligence angle)", "Tech podcasts (AI in real estate angle)", "Business media interviews (market data angle)"],
    growthTargets: [
      { metric: "Appearances", month3: "6", month6: "15", month12: "30+" },
      { metric: "Reach", month3: "50K listeners", month6: "200K listeners", month12: "500K listeners" },
      { metric: "Inbound Leads", month3: "5/month", month6: "15/month", month12: "30/month" },
    ],
    bestPractices: ["Prepare 3 'signature stories' with memorable data points", "Always bring unique data insights — be the guest hosts remember", "End with a specific CTA: follow on LinkedIn or download a free report", "Repurpose clips for LinkedIn/YouTube Shorts (3-5 clips per episode)"],
  },
  {
    channel: "Speaking & Webinars", icon: Mic, color: "text-chart-1", bg: "bg-chart-1/10",
    frequency: "1-2x/month", targetAudience: "Industry professionals, institutional investors, media",
    contentTypes: ["Monthly platform webinar (community engagement)", "Industry conference talks (AREBI, REI events)", "University guest lectures (ITB, UI, UGM)", "Media briefings with market data"],
    growthTargets: [
      { metric: "Events", month3: "3", month6: "8", month12: "20+" },
      { metric: "Total Audience", month3: "500", month6: "3,000", month12: "10,000" },
      { metric: "Media Mentions", month3: "2", month6: "8", month12: "20+" },
    ],
    bestPractices: ["Always lead with proprietary data — make every talk unique", "Record every talk for YouTube/LinkedIn repurposing", "Offer exclusive data to event organizers as speaker incentive", "Build a signature keynote: 'The State of Indonesian Property Intelligence'"],
  },
];

// ── Trust Storytelling ──

const trustStories = [
  {
    category: "Platform Data Reveals", icon: BarChart3, color: "text-chart-1",
    stories: [
      "Share monthly AI prediction accuracy: 'Our model predicted Surabaya Q1 prices within 3.8% — here's the methodology'",
      "Publish surprising data discoveries: 'We found that properties near new MRT stations appreciate 23% faster than the city average'",
      "Show real user outcomes: 'An investor using our AI alerts bought in Balikpapan in January — property value up 18% in 6 months'",
    ],
  },
  {
    category: "Growth Milestones", icon: Flag, color: "text-chart-3",
    stories: [
      "Celebrate every milestone publicly: '1,000th listing', '100th agent', 'First Rp 100M revenue month'",
      "Share behind-the-scenes of failures: 'We launched in Makassar and got 0 agents in Week 1 — here's what we changed'",
      "Document the fundraising journey: pitch decks, investor meetings, rejections, and the final close",
    ],
  },
  {
    category: "AI Prediction Outcomes", icon: Sparkles, color: "text-chart-4",
    stories: [
      "Monthly 'AI vs Reality' scorecard — publicly track every major prediction and outcome",
      "Case studies: 'Our AI flagged this property as undervalued at Rp 2B. It sold 3 months later for Rp 2.4B'",
      "Market cycle predictions: 'In January we said Jakarta South would cool down — here's the Q2 data confirming it'",
    ],
  },
  {
    category: "Vision & Philosophy", icon: Crown, color: "text-primary",
    stories: [
      "Explain the 'why' regularly: 'I started this because my family overpaid for a property by 20% — no one should experience that'",
      "Share the long-term vision: 'We're building the Bloomberg Terminal for Indonesian property — here's what that means'",
      "Connect platform features to human impact: 'This AI feature saves the average buyer 40 hours of research'",
    ],
  },
];

// ── Long-term Authority Roadmap ──

const authorityRoadmap = [
  {
    phase: "Foundation (Month 1-3)", color: "text-primary", bg: "bg-primary/10",
    goals: ["Establish consistent LinkedIn presence (5x/week)", "Launch YouTube channel with first 20 videos", "Secure 5 podcast appearances", "Build media contact list (50+ journalists)", "Publish first ASTRA Market Intelligence report"],
    milestones: ["5K LinkedIn followers", "2K YouTube subscribers", "First media mention", "First speaking invitation"],
  },
  {
    phase: "Growth (Month 4-6)", color: "text-chart-1", bg: "bg-chart-1/10",
    goals: ["Achieve LinkedIn viral post (100K+ impressions)", "Guest on 2 national media outlets (CNBC Indonesia, Kompas)", "Host first industry webinar with 500+ attendees", "Establish monthly column in a property publication", "Begin university lecture circuit"],
    milestones: ["15K LinkedIn followers", "10K YouTube subscribers", "Recognized by 3+ industry peers", "First keynote invitation"],
  },
  {
    phase: "Authority (Month 7-12)", color: "text-chart-3", bg: "bg-chart-3/10",
    goals: ["Become go-to media source for property market commentary", "ASTRA Price Index cited in national publications", "Keynote at 2+ major industry events", "Published op-ed in top-tier business media", "Advisor/mentor role in startup ecosystem"],
    milestones: ["50K LinkedIn followers", "50K YouTube subscribers", "Monthly media appearances", "Industry award nomination"],
  },
  {
    phase: "National Voice (Year 2+)", color: "text-chart-4", bg: "bg-chart-4/10",
    goals: ["Regular TV/media panel appearances on property & economic topics", "Published book or long-form research report on Indonesian property", "Government/policy advisory role on housing/PropTech", "International conference speaker (regional PropTech events)", "Recognized top 10 PropTech founder in Southeast Asia"],
    milestones: ["100K+ combined social following", "National brand recognition", "Institutional partnerships", "Board/advisory positions"],
  },
];

// ── Subcomponents ──

function PillarCard({ pillar }: { pillar: ContentPillar }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = pillar.icon;
  return (
    <Card className="rounded-xl border-border/30 bg-card/80 overflow-hidden">
      <div className={cn("h-1", pillar.bg.replace("/10", "/30"))} />
      <CardHeader className="p-3 pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] font-bold flex items-center gap-2">
            <Icon className={cn("h-4 w-4", pillar.color)} />
            {pillar.pillar}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-muted-foreground"><Timer className="h-2 w-2 mr-0.5" />{pillar.frequency}</Badge>
            {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
        <CardDescription className="text-[9px] ml-6">{pillar.description}</CardDescription>
      </CardHeader>
      {expanded && (
        <CardContent className="p-3 pt-0 space-y-1.5">
          {pillar.topics.map((t, i) => (
            <div key={i} className="p-2 rounded-lg border border-border/10 bg-muted/5">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] font-bold text-foreground">{t.title}</span>
                <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground">{t.format}</Badge>
              </div>
              <p className="text-[8px] text-muted-foreground italic">"{t.hook}"</p>
            </div>
          ))}
          <div className="p-1.5 rounded-lg bg-chart-1/5 border border-chart-1/20">
            <span className="text-[7px] text-chart-1 font-bold">📊 KPI: {pillar.kpi}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function ChannelCard({ channel }: { channel: ChannelStrategy }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = channel.icon;
  return (
    <Card className="rounded-xl border-border/30 bg-card/80 overflow-hidden">
      <CardHeader className="p-3 pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] font-bold flex items-center gap-2">
            <Icon className={cn("h-4 w-4", channel.color)} />
            {channel.channel}
            <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-muted-foreground">{channel.frequency}</Badge>
          </CardTitle>
          {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </div>
        <CardDescription className="text-[9px] ml-6">Target: {channel.targetAudience}</CardDescription>
      </CardHeader>
      {expanded && (
        <CardContent className="p-3 pt-0 space-y-2">
          <div className="space-y-1">
            <span className="text-[8px] font-bold text-foreground">Content Types</span>
            {channel.contentTypes.map((ct, i) => (
              <div key={i} className="flex items-start gap-1"><CheckCircle2 className={cn("h-2.5 w-2.5 shrink-0 mt-0.5", channel.color)} /><span className="text-[8px] text-muted-foreground">{ct}</span></div>
            ))}
          </div>
          <div>
            <span className="text-[8px] font-bold text-foreground block mb-1">Growth Targets</span>
            <div className="space-y-1">
              {channel.growthTargets.map((gt) => (
                <div key={gt.metric} className="grid grid-cols-4 gap-1">
                  <span className="text-[7px] text-muted-foreground">{gt.metric}</span>
                  {[gt.month3, gt.month6, gt.month12].map((v, i) => (
                    <div key={i} className="p-0.5 rounded text-center border border-border/10 bg-muted/5">
                      <span className="text-[6px] text-muted-foreground block">{["Mo 3", "Mo 6", "Mo 12"][i]}</span>
                      <span className={cn("text-[8px] font-bold", channel.color)}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[8px] font-bold text-foreground block mb-1">Best Practices</span>
            {channel.bestPractices.map((bp, i) => (
              <div key={i} className="flex items-start gap-1"><Star className="h-2 w-2 text-chart-1 shrink-0 mt-0.5" /><span className="text-[7px] text-muted-foreground">{bp}</span></div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ── Main Dashboard ──

const FounderBrandingDashboard = React.memo(function FounderBrandingDashboard() {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-chart-4/40 via-primary/30 to-chart-1/20" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Founder Personal Branding Strategy
              </CardTitle>
              <CardDescription className="text-[11px]">
                Position CEO as national PropTech thought leader — content authority, media visibility, and trust building roadmap
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-chart-4 bg-chart-4/10 border-chart-4/30">
              👤 Personal Brand
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          {/* Brand Identity */}
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 mb-3">
            <p className="text-[10px] font-bold text-primary mb-1">🎯 {brandIdentity.tagline}</p>
            <p className="text-[9px] text-muted-foreground">{brandIdentity.positioning}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            {brandIdentity.archetypes.map((a) => (
              <div key={a.archetype} className="p-2 rounded-lg border border-border/20 bg-muted/5">
                <span className={cn("text-[9px] font-bold block", a.color)}>{a.archetype}</span>
                <span className="text-[7px] text-muted-foreground">{a.description}</span>
              </div>
            ))}
          </div>
          <div className="space-y-0.5">
            {brandIdentity.differentiators.map((d, i) => (
              <div key={i} className="flex items-start gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-primary shrink-0 mt-0.5" /><span className="text-[8px] text-muted-foreground">{d}</span></div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pillars" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="pillars" className="text-[10px] h-6 px-3">Content Pillars</TabsTrigger>
          <TabsTrigger value="channels" className="text-[10px] h-6 px-3">Channels</TabsTrigger>
          <TabsTrigger value="trust" className="text-[10px] h-6 px-3">Trust Stories</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-[10px] h-6 px-3">Authority Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="pillars" className="mt-3 space-y-2">
          {contentPillars.map((p) => <PillarCard key={p.pillar} pillar={p} />)}
        </TabsContent>

        <TabsContent value="channels" className="mt-3 space-y-2">
          {channelStrategies.map((c) => <ChannelCard key={c.channel} channel={c} />)}
        </TabsContent>

        <TabsContent value="trust" className="mt-3 space-y-2">
          {trustStories.map((ts) => {
            const Icon = ts.icon;
            return (
              <Card key={ts.category} className="rounded-xl border-border/30 bg-card/80">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", ts.color)} /> {ts.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-1">
                  {ts.stories.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5 p-1.5 rounded-lg border border-border/10 bg-muted/5">
                      <CheckCircle2 className={cn("h-2.5 w-2.5 shrink-0 mt-0.5", ts.color)} />
                      <span className="text-[8px] text-muted-foreground">{s}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="roadmap" className="mt-3 space-y-2">
          {authorityRoadmap.map((phase) => (
            <Card key={phase.phase} className="rounded-xl border-border/30 bg-card/80 overflow-hidden">
              <div className={cn("h-1", phase.bg.replace("/10", "/30"))} />
              <CardHeader className="p-3 pb-2">
                <CardTitle className={cn("text-[11px] font-bold", phase.color)}>{phase.phase}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div className="space-y-1">
                  <span className="text-[8px] font-bold text-foreground">Goals</span>
                  {phase.goals.map((g, i) => (
                    <div key={i} className="flex items-start gap-1"><CheckCircle2 className={cn("h-2 w-2 shrink-0 mt-0.5", phase.color)} /><span className="text-[7px] text-muted-foreground">{g}</span></div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {phase.milestones.map((m) => (
                    <Badge key={m} variant="outline" className={cn("text-[7px] h-4 px-1.5", phase.color)}><Trophy className="h-2 w-2 mr-0.5" />{m}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default FounderBrandingDashboard;
