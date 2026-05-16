import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crown, Shield, Target, TrendingUp, BarChart3, Users, Zap, Star,
  BookOpen, Newspaper, Mic, Video, Globe, Award, ChevronRight, ChevronDown,
  CheckCircle2, ArrowRight, Layers, FileText, LineChart, MapPin,
  Sparkles, Eye, Calendar, Building, Landmark, GraduationCap,
  MessageSquare, Radio, PenTool, Database, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Brand Positioning ──

const brandPositioning = {
  tagline: "Indonesia's AI-Powered Property Intelligence Platform",
  mission: "Democratize property investment through data intelligence — making every buyer, seller, and investor smarter with AI",
  differentiators: [
    { label: "AI-First Intelligence", desc: "Not just listings — predictive valuations, investment scores, market forecasts, and deal probability analysis", icon: Sparkles, traditional: "Static listing portals with basic search filters" },
    { label: "Data Authority", desc: "Monthly market intelligence reports cited by media, banks, and institutions as the reference source", icon: Database, traditional: "No original data or market analysis" },
    { label: "Investment Decision Engine", desc: "Every property comes with ROI projections, risk assessment, rental yield, and neighborhood trend analysis", icon: LineChart, traditional: "Price and photos only — no investment context" },
    { label: "Predictive Market Signals", desc: "AI detects emerging hotspots, price anomalies, and undervalued opportunities before the market catches on", icon: TrendingUp, traditional: "Backward-looking price history at best" },
  ],
  brandPersonality: [
    { trait: "Authoritative", desc: "Speak with data — every claim backed by AI analysis and market evidence" },
    { trait: "Accessible", desc: "Make complex investment concepts simple — education-first approach" },
    { trait: "Innovative", desc: "Showcase AI capabilities that no competitor can match — technology as brand identity" },
    { trait: "Trustworthy", desc: "Transparent methodology, published accuracy metrics, verifiable predictions" },
  ],
};

// ── Content Pillars ──

interface ContentPillar {
  key: string;
  title: string;
  emoji: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  description: string;
  contentTypes: { type: string; frequency: string; channel: string; purpose: string }[];
  sampleTopics: string[];
}

const contentPillars: ContentPillar[] = [
  {
    key: "investment", title: "Property Investment Intelligence", emoji: "📊", icon: BarChart3,
    color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    description: "Original data-driven insights on property investment opportunities, ROI analysis, and portfolio strategy",
    contentTypes: [
      { type: "Monthly Market Report", frequency: "Monthly", channel: "Website + Email + Media", purpose: "Establish data authority — the report media and analysts cite" },
      { type: "Investment Opportunity Alert", frequency: "Weekly", channel: "Email + WhatsApp + App", purpose: "Drive engagement with time-sensitive, AI-detected opportunities" },
      { type: "Portfolio Strategy Guide", frequency: "Quarterly", channel: "PDF + Webinar", purpose: "Deep-dive education for serious investors — lead magnet" },
      { type: "AI Deal Score Breakdowns", frequency: "3x/week", channel: "Social + Blog", purpose: "Showcase AI capability through real property analysis" },
    ],
    sampleTopics: [
      "\"Q2 2026 Indonesia Property Investment Outlook — AI Predictions\"",
      "\"Top 10 Undervalued Districts: AI Finds 30%+ Upside Potential\"",
      "\"Rental Yield Map: Where to Get 8%+ Returns in 2026\"",
      "\"Property Portfolio Rebalancing: When to Sell Your Jakarta Apartment\"",
    ],
  },
  {
    key: "trends", title: "Market Trend Forecasts", emoji: "📈", icon: TrendingUp,
    color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    description: "Forward-looking market analysis combining AI predictions with economic indicators and policy impact assessment",
    contentTypes: [
      { type: "Trend Forecast Article", frequency: "Bi-weekly", channel: "Blog + LinkedIn + Media", purpose: "Position as the forward-thinking market predictor" },
      { type: "Price Index Update", frequency: "Monthly", channel: "Website + PR", purpose: "Create citeable reference data — 'According to ASTRA Price Index...'" },
      { type: "Policy Impact Analysis", frequency: "As needed", channel: "Blog + Media Pitch", purpose: "Rapid response to government policy = media quotes and authority" },
      { type: "Emerging Hotspot Reports", frequency: "Monthly", channel: "Email + Social", purpose: "Demonstrate predictive accuracy — 'We called this 6 months ago'" },
    ],
    sampleTopics: [
      "\"Nusantara Capital Effect: Property Price Forecast for East Kalimantan 2026-2030\"",
      "\"Interest Rate Cut Impact: Which Property Segments Win Most?\"",
      "\"Infrastructure Pipeline Map: 5 Areas Where New Toll Roads Will Boost Values\"",
      "\"Market Cycle Analysis: Are We at Peak, Plateau, or Pre-Growth?\"",
    ],
  },
  {
    key: "education", title: "Educational Buyer Guides", emoji: "📚", icon: BookOpen,
    color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30",
    description: "Comprehensive educational content demystifying property buying, selling, and investing for all experience levels",
    contentTypes: [
      { type: "Beginner Guide Series", frequency: "Weekly", channel: "Blog + YouTube + Social", purpose: "Capture top-of-funnel traffic — first-time buyer education" },
      { type: "Video Explainers", frequency: "2x/week", channel: "YouTube + TikTok + Reels", purpose: "Visual education drives engagement and brand recall" },
      { type: "Interactive Calculators", frequency: "Ongoing", channel: "Website tools", purpose: "Utility tools that drive repeat visits and lead capture" },
      { type: "Expert Q&A Sessions", frequency: "Monthly", channel: "Instagram Live + YouTube", purpose: "Build community and human connection with brand" },
    ],
    sampleTopics: [
      "\"Complete Guide: Buying Your First Property in Indonesia (2026 Edition)\"",
      "\"SHM vs SHGB vs Strata Title — Which Certificate Do You Need?\"",
      "\"Property Tax Calculator: Exactly What You'll Pay in Every Province\"",
      "\"7 Red Flags to Watch When Viewing a Property — Agent Secrets Revealed\"",
    ],
  },
  {
    key: "regional", title: "Data-Driven Regional Insights", emoji: "🗺️", icon: MapPin,
    color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30",
    description: "Hyper-local market intelligence for every major city and district — the definitive local property data source",
    contentTypes: [
      { type: "City Market Profile", frequency: "Monthly per city", channel: "SEO pages + Blog", purpose: "Own local search intent — 'property market [city]' rankings" },
      { type: "District Deep Dive", frequency: "Bi-weekly", channel: "Blog + Social", purpose: "Micro-level analysis that no competitor provides" },
      { type: "Neighborhood Comparison", frequency: "Weekly", channel: "Social + Blog", purpose: "Highly shareable content that drives local engagement" },
      { type: "Regional Price Heatmap", frequency: "Monthly", channel: "Interactive tool", purpose: "Visual tool that media and analysts embed and reference" },
    ],
    sampleTopics: [
      "\"Jakarta Selatan Property Report: Kemang vs Pondok Indah vs Cipete\"",
      "\"Bali Investment Map: Seminyak Saturated? AI Finds the Next Canggu\"",
      "\"Surabaya Rising: Why East Java's Capital Is the Best Value Play in 2026\"",
      "\"Bandung Highland Market: Villa Investment Returns by Sub-District\"",
    ],
  },
];

// ── Visibility Channels ──

interface VisibilityChannel {
  channel: string;
  icon: React.ElementType;
  color: string;
  tactics: { tactic: string; frequency: string; target: string; kpi: string }[];
}

const visibilityChannels: VisibilityChannel[] = [
  {
    channel: "Media Article Contributions", icon: Newspaper, color: "text-chart-1",
    tactics: [
      { tactic: "Monthly op-ed in Kompas/Bisnis Indonesia on property market trends", frequency: "Monthly", target: "National business readers", kpi: "12 published articles/year" },
      { tactic: "Data-driven press releases with AI market insights for journalist pickup", frequency: "Bi-weekly", target: "Property journalists", kpi: "50 media mentions/quarter" },
      { tactic: "Exclusive data sharing with top 10 property journalists (they cite us as source)", frequency: "Ongoing", target: "Key opinion leaders", kpi: "Platform named as source 30x/quarter" },
      { tactic: "Rapid response commentary on breaking property news/policy changes", frequency: "As needed", target: "News audiences", kpi: "< 4 hour response time" },
    ],
  },
  {
    channel: "Podcast & YouTube Expert Interviews", icon: Mic, color: "text-primary",
    tactics: [
      { tactic: "Launch 'ASTRA Property Intelligence' podcast — weekly episodes with industry leaders", frequency: "Weekly", target: "Investors, agents, enthusiasts", kpi: "5K downloads/episode by Month 6" },
      { tactic: "Guest appearances on top Indonesia business/finance podcasts (Finansialku, DuitPintar)", frequency: "2x/month", target: "Finance-savvy audience", kpi: "10 guest appearances/quarter" },
      { tactic: "YouTube interview series: 'AI Meets Real Estate' — featuring developers, agents, investors", frequency: "Bi-weekly", target: "YouTube discovery audience", kpi: "50K views/episode" },
      { tactic: "Twitter/X Spaces on trending property topics with live audience Q&A", frequency: "Monthly", target: "Tech-savvy property enthusiasts", kpi: "200 live listeners/session" },
    ],
  },
  {
    channel: "Webinar & Seminar Hosting", icon: GraduationCap, color: "text-chart-3",
    tactics: [
      { tactic: "Monthly webinar: 'Property Market Intelligence Briefing' — AI insights + expert panel", frequency: "Monthly", target: "Investors + agents", kpi: "500 registrants/session" },
      { tactic: "Quarterly in-person seminar in Tier 1 cities (Jakarta, Surabaya, Bali)", frequency: "Quarterly", target: "HNW investors + developers", kpi: "200 attendees/event" },
      { tactic: "Annual 'Indonesia Property Intelligence Summit' — flagship industry event", frequency: "Annual", target: "Industry-wide", kpi: "1,000 attendees, 50 speakers" },
      { tactic: "University guest lectures on PropTech and AI in real estate (UI, ITB, UGM)", frequency: "Quarterly", target: "Students + academics", kpi: "4 university partnerships" },
    ],
  },
];

// ── Trust Signals ──

interface TrustSignal {
  signal: string;
  emoji: string;
  icon: React.ElementType;
  color: string;
  implementation: string;
  proofPoints: string[];
  timeline: string;
}

const trustSignals: TrustSignal[] = [
  {
    signal: "Monthly Market Intelligence Reports", emoji: "📊", icon: FileText, color: "text-chart-1",
    implementation: "Publish comprehensive monthly report with AI-generated insights, price indices, and forecasts — free executive summary, premium full report",
    proofPoints: [
      "Consistent publishing cadence builds anticipation and habit (subscribers wait for it)",
      "Media citations create virtuous cycle: report → coverage → credibility → more citations",
      "Historical archive becomes reference library — 'According to ASTRA's March 2026 report...'",
      "Methodology transparency page shows exactly how AI generates each insight",
    ],
    timeline: "Launch Month 1, build archive over 12 months",
  },
  {
    signal: "AI Prediction Accuracy Scorecard", emoji: "🎯", icon: Target, color: "text-primary",
    implementation: "Public dashboard showing AI prediction accuracy: price forecasts vs. actual outcomes, hotspot predictions vs. market movement, deal scores vs. transaction prices",
    proofPoints: [
      "Published accuracy metrics (e.g., '94.2% price prediction accuracy within ±5%')",
      "Monthly 'Prediction Review' comparing what AI said vs. what happened",
      "'We called it' showcase: predictions made 6-12 months ago that proved correct",
      "Comparison with traditional appraisal accuracy (AI outperforms by 2-3x)",
    ],
    timeline: "Baseline at Month 3, meaningful track record by Month 6",
  },
  {
    signal: "Success Case Studies", emoji: "🏆", icon: Award, color: "text-chart-3",
    implementation: "Detailed case studies of investors/buyers who used AI signals to make profitable decisions — video + written format, verifiable outcomes",
    proofPoints: [
      "'Pak Budi found a 12% ROI villa in Bali using AI Deal Score — here's the full story'",
      "Before/after portfolio performance comparison with and without AI signals",
      "Agent testimonials: 'I closed 3x more deals using AI lead scoring'",
      "Developer case study: 'AI pricing recommendations sold out our project 40% faster'",
    ],
    timeline: "First 3 cases by Month 2, 12 cases by Month 6",
  },
  {
    signal: "Industry Recognition & Awards", emoji: "🏅", icon: Crown, color: "text-chart-4",
    implementation: "Actively pursue and showcase industry awards, certifications, and formal recognitions — PropTech awards, innovation prizes, media accolades",
    proofPoints: [
      "Apply to PropTech Indonesia Awards, ASEAN Smart City Awards, Indonesia Digital Economy Awards",
      "Seek AREBI/REI endorsement or collaboration acknowledgment",
      "Academic paper co-authored with university on AI property valuation methodology",
      "International recognition: apply to global PropTech awards (MIPIM, PropTech Summit)",
    ],
    timeline: "First applications Month 3, first awards Month 6-9",
  },
];

// ── Brand Moat Vision ──

const brandMoatVision = [
  {
    phase: "Year 1 — Establish Authority", period: "Month 1-12", color: "text-chart-4", bg: "bg-chart-4/10",
    goals: [
      "Publish 12 monthly market intelligence reports — build archive and citation habit",
      "Achieve 100 media mentions — become known name in property journalism",
      "Launch AI Prediction Accuracy Scorecard — prove the technology works",
      "Host 12 webinars + 1 annual summit — build community around brand",
      "Produce 24 case studies — verifiable success stories across investor types",
    ],
    outcome: "Recognized as innovative data source — journalists begin citing us by name",
  },
  {
    phase: "Year 2 — Become Reference Standard", period: "Month 13-24", color: "text-primary", bg: "bg-primary/10",
    goals: [
      "ASTRA Price Index adopted by 3+ banks for property valuation benchmarking",
      "Quarterly market report co-published with government agency (BPS/ATR/BPN)",
      "University research partnerships — 3 academic papers using our data",
      "Launch annual 'State of Indonesia Property' reference report (200+ pages)",
      "International media citations (Bloomberg, Reuters, CNBC covering Indonesia property)",
    ],
    outcome: "Industry default reference — 'According to ASTRA data' becomes standard phrase",
  },
  {
    phase: "Year 3+ — National Institution", period: "Month 25+", color: "text-chart-1", bg: "bg-chart-1/10",
    goals: [
      "Government consultation: invited to provide data input for housing policy decisions",
      "Banking standard: 3+ major banks use ASTRA AI for mortgage risk assessment",
      "Academic curriculum: PropTech/AI real estate module using our platform as case study",
      "International expansion: ASTRA methodology licensed to property platforms in SEA markets",
      "Industry governance: seat at REI/AREBI advisory board, contributing to industry standards",
    ],
    outcome: "National institution status — indispensable infrastructure for Indonesia's property ecosystem",
  },
];

// ── 90-Day Execution Roadmap ──

interface RoadmapWeek {
  week: number;
  phase: string;
  phaseColor: string;
  focus: string;
  actions: { action: string; owner: string; priority: "critical" | "high" | "medium" }[];
  milestone: string;
}

const executionRoadmap: RoadmapWeek[] = [
  { week: 1, phase: "Foundation", phaseColor: "text-chart-4", focus: "Brand Identity & Messaging",
    actions: [
      { action: "Finalize brand positioning statement, tagline, and visual identity guidelines", owner: "Brand", priority: "critical" },
      { action: "Create spokesperson media kit with headshots, bios, and expertise summaries", owner: "PR", priority: "high" },
      { action: "Draft first monthly market intelligence report structure and data pipeline", owner: "Research", priority: "critical" },
      { action: "Set up editorial calendar for all 4 content pillars across channels", owner: "Content", priority: "high" },
    ],
    milestone: "Brand identity finalized, report template ready",
  },
  { week: 2, phase: "Foundation", phaseColor: "text-chart-4", focus: "Content Engine Activation",
    actions: [
      { action: "Publish first 3 investment intelligence articles on blog", owner: "Content", priority: "critical" },
      { action: "Create LinkedIn company page + begin daily thought leadership posting", owner: "Social", priority: "high" },
      { action: "Reach out to 10 property journalists with exclusive data preview", owner: "PR", priority: "high" },
      { action: "Record first podcast episode — 'Introducing AI Property Intelligence'", owner: "Content", priority: "medium" },
    ],
    milestone: "Content publishing cadence established",
  },
  { week: 3, phase: "Foundation", phaseColor: "text-chart-4", focus: "First Report Launch",
    actions: [
      { action: "Publish 'Indonesia Property Intelligence Report — March 2026'", owner: "Research", priority: "critical" },
      { action: "PR campaign: press release + journalist briefing + social media blitz", owner: "PR", priority: "critical" },
      { action: "Launch AI Prediction Accuracy Scorecard page on website", owner: "Product", priority: "high" },
      { action: "Begin outreach for first 3 success case study interviews", owner: "Content", priority: "medium" },
    ],
    milestone: "First market report published, 20+ media pickups",
  },
  { week: 4, phase: "Foundation", phaseColor: "text-chart-4", focus: "Community Building",
    actions: [
      { action: "Host first monthly webinar — 'Q2 2026 Property Market Outlook'", owner: "Events", priority: "critical" },
      { action: "Launch investor WhatsApp community with weekly AI insights", owner: "Community", priority: "high" },
      { action: "Publish first 2 educational buyer guides (SEO-optimized)", owner: "Content", priority: "high" },
      { action: "First guest podcast appearance on finance/business show", owner: "PR", priority: "medium" },
    ],
    milestone: "500 webinar registrants, community active",
  },
  { week: 6, phase: "Growth", phaseColor: "text-primary", focus: "Media Authority Push",
    actions: [
      { action: "Publish second monthly report — track citations and build momentum", owner: "Research", priority: "critical" },
      { action: "Secure first op-ed placement in Kompas/Bisnis Indonesia", owner: "PR", priority: "critical" },
      { action: "Launch YouTube interview series — first 2 episodes", owner: "Content", priority: "high" },
      { action: "Publish first 3 case studies with verified ROI outcomes", owner: "Content", priority: "high" },
    ],
    milestone: "First op-ed published, 50 media mentions cumulative",
  },
  { week: 8, phase: "Growth", phaseColor: "text-primary", focus: "Institutional Credibility",
    actions: [
      { action: "Initiate partnership discussion with BPS for data collaboration", owner: "Partnerships", priority: "high" },
      { action: "Apply to first 3 industry awards (PropTech, innovation, digital economy)", owner: "PR", priority: "high" },
      { action: "Host second quarterly in-person seminar (Jakarta)", owner: "Events", priority: "high" },
      { action: "Launch ASTRA Price Index as standalone public reference tool", owner: "Product", priority: "critical" },
    ],
    milestone: "ASTRA Price Index live, 3 award applications submitted",
  },
  { week: 10, phase: "Scale", phaseColor: "text-chart-1", focus: "Reference Standard Positioning",
    actions: [
      { action: "Third monthly report — establish consistent publication rhythm", owner: "Research", priority: "critical" },
      { action: "Pitch ASTRA Price Index to 3 banks for valuation benchmarking", owner: "Partnerships", priority: "critical" },
      { action: "First university guest lecture (UI or ITB)", owner: "PR", priority: "medium" },
      { action: "6 published case studies with trackable investor outcomes", owner: "Content", priority: "high" },
    ],
    milestone: "Bank interest in Price Index, university relationship established",
  },
  { week: 12, phase: "Scale", phaseColor: "text-chart-1", focus: "90-Day Authority Review",
    actions: [
      { action: "Compile brand authority metrics: media mentions, citations, report downloads, audience growth", owner: "Brand", priority: "critical" },
      { action: "AI Prediction Accuracy Scorecard — first 3-month review and public publish", owner: "Product", priority: "critical" },
      { action: "Plan Q3 brand strategy based on which pillars drove most authority", owner: "Strategy", priority: "high" },
      { action: "Announce annual 'Indonesia Property Intelligence Summit' for Q4", owner: "Events", priority: "high" },
    ],
    milestone: "100 media mentions, 10K report downloads, brand authority baseline established",
  },
];

const priorityConfig = {
  critical: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  high: { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30" },
  medium: { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30" },
};

// ── Components ──

function BrandPositioningSection() {
  return (
    <div className="space-y-3">
      <Card className="rounded-2xl border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <div className="text-center space-y-1">
            <p className="text-lg font-bold text-foreground">{brandPositioning.tagline}</p>
            <p className="text-[10px] text-muted-foreground max-w-xl mx-auto">{brandPositioning.mission}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/30 bg-card/80">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <Zap className="h-4 w-4 text-chart-1" /> Competitive Differentiators
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {brandPositioning.differentiators.map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.label} className="grid grid-cols-[1fr_auto_1fr] gap-3 p-2.5 rounded-xl border border-border/20 bg-muted/5 items-center">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className="h-3 w-3 text-chart-1" />
                    <span className="text-[10px] font-bold text-chart-1">{d.label}</span>
                  </div>
                  <p className="text-[9px] text-foreground">{d.desc}</p>
                </div>
                <Badge variant="outline" className="text-[7px] h-4 px-1.5 text-muted-foreground">vs</Badge>
                <div>
                  <span className="text-[9px] text-muted-foreground italic">{d.traditional}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/30 bg-card/80">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" /> Brand Personality
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {brandPositioning.brandPersonality.map((p) => (
              <div key={p.trait} className="p-2 rounded-xl border border-border/20 bg-muted/5">
                <span className="text-[10px] font-bold text-foreground block">{p.trait}</span>
                <p className="text-[8px] text-muted-foreground mt-0.5">{p.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ContentPillarCard({ pillar }: { pillar: ContentPillar }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = pillar.icon;
  return (
    <Card className="rounded-2xl border-border/30 bg-card/80 overflow-hidden">
      <div className={cn("h-1", pillar.bg.replace("/10", "/30"))} />
      <CardHeader className="p-3 pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] font-bold flex items-center gap-2">
            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", pillar.bg)}>
              <Icon className={cn("h-3 w-3", pillar.color)} />
            </div>
            {pillar.emoji} {pillar.title}
          </CardTitle>
          {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </div>
        <p className="text-[9px] text-muted-foreground mt-1">{pillar.description}</p>
      </CardHeader>
      {expanded && (
        <CardContent className="p-3 pt-0 space-y-2.5 border-t border-border/20">
          <div className="space-y-1.5">
            {pillar.contentTypes.map((ct, i) => (
              <div key={i} className="p-2 rounded-lg border border-border/10 bg-muted/5 grid grid-cols-[1fr_80px_120px] gap-2 items-start">
                <div>
                  <span className="text-[9px] font-semibold text-foreground">{ct.type}</span>
                  <p className="text-[8px] text-muted-foreground">{ct.purpose}</p>
                </div>
                <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-muted-foreground justify-self-center">{ct.frequency}</Badge>
                <Badge variant="outline" className={cn("text-[7px] h-3.5 px-1 justify-self-end", pillar.color, pillar.bg, pillar.border)}>{ct.channel}</Badge>
              </div>
            ))}
          </div>
          <div>
            <span className="text-[8px] text-muted-foreground uppercase tracking-wide block mb-1">Sample Topics</span>
            <div className="space-y-1">
              {pillar.sampleTopics.map((topic, i) => (
                <div key={i} className="flex items-start gap-1.5 p-1.5 rounded-lg bg-muted/5 border border-border/10">
                  <PenTool className="h-2.5 w-2.5 text-chart-4 shrink-0 mt-0.5" />
                  <span className="text-[8px] text-foreground italic">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function VisibilitySection() {
  return (
    <div className="space-y-3">
      {visibilityChannels.map((ch) => {
        const Icon = ch.icon;
        return (
          <Card key={ch.channel} className="rounded-2xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                <Icon className={cn("h-4 w-4", ch.color)} />{ch.channel}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1.5">
              {ch.tactics.map((t, i) => (
                <div key={i} className="p-2 rounded-lg border border-border/10 bg-muted/5">
                  <span className="text-[9px] text-foreground">{t.tactic}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-muted-foreground">{t.frequency}</Badge>
                    <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-muted-foreground">{t.target}</Badge>
                    <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-chart-1 bg-chart-1/5 border-chart-1/20">{t.kpi}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function TrustSignalsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {trustSignals.map((ts) => {
        const Icon = ts.icon;
        return (
          <Card key={ts.signal} className="rounded-2xl border-border/30 bg-card/80">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[11px] font-bold flex items-center gap-2">
                <Icon className={cn("h-4 w-4", ts.color)} />{ts.emoji} {ts.signal}
              </CardTitle>
              <p className="text-[9px] text-muted-foreground">{ts.implementation}</p>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1.5">
              {ts.proofPoints.map((p, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-2.5 w-2.5 text-chart-1 shrink-0 mt-0.5" />
                  <span className="text-[8px] text-muted-foreground">{p}</span>
                </div>
              ))}
              <Badge variant="outline" className="text-[7px] h-3.5 px-1.5 text-primary bg-primary/5 border-primary/20 mt-1">
                {ts.timeline}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function BrandMoatSection() {
  return (
    <div className="space-y-3">
      {brandMoatVision.map((phase) => (
        <Card key={phase.phase} className="rounded-2xl border-border/30 bg-card/80">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className={cn("text-[11px] font-bold", phase.color)}>{phase.phase}</CardTitle>
              <Badge variant="outline" className={cn("text-[8px] h-4 px-2", phase.color, phase.bg)}>{phase.period}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {phase.goals.map((g, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className={cn("h-3 w-3 shrink-0 mt-0.5", phase.color)} />
                <span className="text-[9px] text-foreground">{g}</span>
              </div>
            ))}
            <div className={cn("p-2 rounded-lg border", phase.bg, phase.color.replace("text-", "border-") + "/20")}>
              <span className="text-[8px] font-bold block">🎯 Outcome</span>
              <p className="text-[9px] text-foreground">{phase.outcome}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ExecutionRoadmapSection() {
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const filtered = phaseFilter === "all" ? executionRoadmap : executionRoadmap.filter((w) => w.phase === phaseFilter);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "Foundation", "Growth", "Scale"].map((p) => (
          <Badge key={p} variant="outline"
            className={cn("text-[9px] h-5 px-2 cursor-pointer", phaseFilter === p ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground")}
            onClick={() => setPhaseFilter(p)}>
            {p === "all" ? `All (${executionRoadmap.length} weeks)` : p}
          </Badge>
        ))}
      </div>
      {filtered.map((week) => (
        <Card key={week.week} className="rounded-xl border-border/30 bg-card/80">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[9px] h-5 px-2 font-bold text-foreground">Week {week.week}</Badge>
              <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5", week.phaseColor)}>{week.phase}</Badge>
              <span className="text-[10px] font-semibold text-foreground">{week.focus}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mb-2">
              {week.actions.map((a, i) => {
                const pc = priorityConfig[a.priority];
                return (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg border border-border/10 bg-muted/5">
                    <CheckCircle2 className={cn("h-2.5 w-2.5 shrink-0 mt-1", pc.color)} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-foreground">{a.action}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground">{a.owner}</Badge>
                        <Badge variant="outline" className={cn("text-[6px] h-3 px-1", pc.color, pc.bg, pc.border)}>{a.priority}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Badge variant="outline" className="text-[7px] h-3.5 px-1.5 text-chart-1 bg-chart-1/5 border-chart-1/20">
              🎯 {week.milestone}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Main Dashboard ──

const BrandAuthorityDashboard = React.memo(function BrandAuthorityDashboard() {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-primary/40 via-chart-1/30 to-chart-3/20" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Brand Authority Strategy
              </CardTitle>
              <CardDescription className="text-[11px]">
                National thought leadership positioning — content pillars, visibility channels, trust signals, and long-term brand moat
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-primary bg-primary/10 border-primary/30">
              👑 Authority Playbook
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {contentPillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.key} className={cn("p-2 rounded-xl border", p.bg, p.border)}>
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("h-3 w-3", p.color)} />
                    <span className="text-[8px] font-bold text-foreground">{p.emoji} {p.title.split(" ").slice(0, 2).join(" ")}</span>
                  </div>
                  <span className={cn("text-[9px] font-bold block mt-0.5", p.color)}>{p.contentTypes.length} content types</span>
                  <span className="text-[7px] text-muted-foreground">{p.sampleTopics.length} sample topics</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="positioning" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="positioning" className="text-[10px] h-6 px-2">Positioning</TabsTrigger>
          <TabsTrigger value="pillars" className="text-[10px] h-6 px-2">Content Pillars</TabsTrigger>
          <TabsTrigger value="visibility" className="text-[10px] h-6 px-2">Visibility</TabsTrigger>
          <TabsTrigger value="trust" className="text-[10px] h-6 px-2">Trust Signals</TabsTrigger>
          <TabsTrigger value="moat" className="text-[10px] h-6 px-2">Brand Moat</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-[10px] h-6 px-2">Execution</TabsTrigger>
        </TabsList>

        <TabsContent value="positioning" className="mt-3"><BrandPositioningSection /></TabsContent>
        <TabsContent value="pillars" className="mt-3 space-y-2">
          {contentPillars.map((p) => <ContentPillarCard key={p.key} pillar={p} />)}
        </TabsContent>
        <TabsContent value="visibility" className="mt-3"><VisibilitySection /></TabsContent>
        <TabsContent value="trust" className="mt-3"><TrustSignalsSection /></TabsContent>
        <TabsContent value="moat" className="mt-3"><BrandMoatSection /></TabsContent>
        <TabsContent value="roadmap" className="mt-3"><ExecutionRoadmapSection /></TabsContent>
      </Tabs>
    </div>
  );
});

export default BrandAuthorityDashboard;
