import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building, Users, Landmark, Newspaper, Globe, Handshake, Target,
  ChevronRight, ChevronDown, Crown, Star, Zap, ArrowRight, Shield,
  TrendingUp, BarChart3, Gift, FileText, Calendar, Megaphone,
  CheckCircle2, Circle, Clock, DollarSign, Home, Layers, MapPin,
  BookOpen, Sparkles, LineChart, Lock, Mail, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Partnership Category Definitions ──

interface PartnershipInitiative {
  name: string;
  description: string;
  valueProposition: string;
  executionSteps: string[];
  timeline: string;
  kpi: string;
  priority: "critical" | "high" | "medium";
}

interface PartnershipCategory {
  key: string;
  title: string;
  emoji: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  overview: string;
  targetPartners: string[];
  initiatives: PartnershipInitiative[];
  revenueModel: string;
}

const priorityConfig = {
  critical: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  high: { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30" },
  medium: { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30" },
};

const partnershipCategories: PartnershipCategory[] = [
  {
    key: "developer", title: "Developer Partnerships", emoji: "🏗️", icon: Building,
    color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    overview: "Onboard housing developers to list new projects, integrate bulk inventory, and co-market launches — creating exclusive supply advantage",
    targetPartners: ["Ciputra Group", "Sinar Mas Land", "Agung Podomoro", "Summarecon", "Pakuwon Jati", "Lippo Karawaci", "PP Properti", "Regional boutique developers"],
    initiatives: [
      {
        name: "New Project Onboarding Pipeline",
        description: "Structured intake for developers to list pre-launch and under-construction projects with AI-enhanced marketing",
        valueProposition: "Developers get AI-powered buyer matching, demand forecasting, and optimized pricing recommendations — 30% faster sales velocity",
        executionSteps: [
          "Create developer portal with project submission form (floor plans, pricing, timeline)",
          "AI auto-generates SEO-optimized listings, investment scores, and ROI projections for each unit type",
          "Assign dedicated partnership manager for top-tier developers (>500 units)",
          "Monthly performance dashboard showing views, inquiries, and conversion funnel",
        ],
        timeline: "Day 1-30", kpi: "10 developer projects onboarded", priority: "critical",
      },
      {
        name: "Bulk Listing Integration API",
        description: "Technical API for developers to sync entire project inventory automatically — real-time availability and pricing updates",
        valueProposition: "Zero manual work for developers — listings auto-update when units are sold, prices change, or new phases launch",
        executionSteps: [
          "Build REST API with authentication, rate limiting, and webhook notifications",
          "Provide developer SDK (JavaScript/Python) with documentation and sandbox environment",
          "Implement real-time sync: availability, pricing, floor plan changes, construction progress",
          "Add bulk upload CSV/Excel template for non-technical developers",
        ],
        timeline: "Day 15-45", kpi: "3 developers integrated via API", priority: "high",
      },
      {
        name: "Co-Marketing Launch Campaigns",
        description: "Joint marketing campaigns for new project launches — combining developer brand with platform AI insights",
        valueProposition: "Developers get access to our investor audience + AI-powered content; we get exclusive early listings and co-branded authority",
        executionSteps: [
          "Create co-branded landing page template for each project launch",
          "Joint social media campaign: developer provides visuals, we provide AI market context",
          "Exclusive 'AI Investment Analysis' report for each new project — shared with our investor base",
          "Co-host virtual launch events with live AI Q&A on investment potential",
        ],
        timeline: "Day 30-60", kpi: "5 co-marketed launches, 2,000 leads generated", priority: "high",
      },
    ],
    revenueModel: "Listing fee per unit (Rp 500K-2M) + Featured placement upsell (Rp 5M/project/month) + Lead generation commission (2-3%)",
  },
  {
    key: "agency", title: "Agency Network Partnerships", emoji: "🤝", icon: Users,
    color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    overview: "Build regional brokerage collaborations with exclusive listing visibility, shared lead conversion, and AI-powered agent tools",
    targetPartners: ["ERA Indonesia", "Ray White Indonesia", "Century 21", "LJ Hooker", "Independent brokerages (top 50 by city)", "PropNex", "Coldwell Banker"],
    initiatives: [
      {
        name: "Regional Brokerage Collaboration Program",
        description: "Tiered partnership program for agencies: Bronze (basic listing), Silver (priority visibility), Gold (exclusive features + leads)",
        valueProposition: "Agencies get qualified buyer leads, AI deal-closing tools, and premium brand visibility — reducing their marketing spend by 40%",
        executionSteps: [
          "Define 3-tier partnership structure with clear benefits and requirements per tier",
          "Bronze: free listings, basic analytics. Silver: priority search ranking, lead alerts. Gold: exclusive territories, dedicated support",
          "Onboard 10 agencies per Tier-1 city through direct outreach (agency principal meetings)",
          "Quarterly business review with each Gold partner — performance data, optimization recommendations",
        ],
        timeline: "Day 1-45", kpi: "30 agency partnerships (5 Gold, 10 Silver, 15 Bronze)", priority: "critical",
      },
      {
        name: "Exclusive Listing Visibility Incentives",
        description: "Reward agencies that provide exclusive listings with 3x visibility boost, featured placement, and priority lead routing",
        valueProposition: "Exclusive listings get 3x more views and 5x more qualified inquiries vs. non-exclusive — proven by platform data",
        executionSteps: [
          "Build 'Exclusive Listing' badge and premium card UI treatment (gold border, featured tag)",
          "Implement search ranking boost algorithm: exclusive listings score +30 in relevance",
          "Create agent dashboard showing exclusive vs. non-exclusive performance comparison",
          "Monthly 'Top Exclusive Agent' leaderboard with bonus lead allocation",
        ],
        timeline: "Day 15-45", kpi: "200 exclusive listings, 40% inquiry uplift", priority: "high",
      },
      {
        name: "Shared Lead Conversion System",
        description: "AI-powered lead scoring and routing system that matches buyer intent signals with the best-fit agent for each inquiry",
        valueProposition: "Agents receive pre-qualified, scored leads with buyer preference profiles — 60% higher conversion rate vs. cold inquiries",
        executionSteps: [
          "Build lead scoring model: budget match, location intent, urgency signals, engagement depth",
          "Implement smart routing: match leads to agents by specialty, location, response rate, and closing history",
          "Provide agents with lead dossier: buyer profile, properties viewed, AI match reasoning",
          "Track end-to-end conversion and attribute revenue to partnership — transparent commission split",
        ],
        timeline: "Day 30-60", kpi: "500 leads routed, 15% conversion rate", priority: "high",
      },
    ],
    revenueModel: "Monthly subscription (Silver: Rp 2M, Gold: Rp 5M) + Lead generation fee (Rp 100K/qualified lead) + Transaction commission share (1%)",
  },
  {
    key: "banking", title: "Banking & Mortgage Partnerships", emoji: "🏦", icon: Landmark,
    color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30",
    overview: "Integrate home loan pre-approval, optimize buyer financing funnels, and enhance platform trust through banking credibility",
    targetPartners: ["Bank BCA", "Bank Mandiri", "BNI", "BRI", "Bank CIMB Niaga", "Bank BTN", "Bank Permata", "OCBC NISP"],
    initiatives: [
      {
        name: "Home Loan Pre-Approval Integration",
        description: "Embed mortgage pre-approval widget on property pages — buyers check eligibility in 2 minutes without leaving the platform",
        valueProposition: "Banks get qualified mortgage leads at 50% lower CAC; buyers get instant financing clarity; platform increases conversion by 35%",
        executionSteps: [
          "Partner with 3 banks for API integration: income verification, credit scoring, eligibility check",
          "Build pre-approval widget: property price → down payment slider → monthly installment calculator → 'Check Eligibility' CTA",
          "Display bank offers comparison: interest rates, tenors, monthly payments side-by-side",
          "Track pre-approval to disbursement conversion — optimize funnel based on drop-off analysis",
        ],
        timeline: "Day 30-60", kpi: "3 bank integrations, 1,000 pre-approval checks/month", priority: "critical",
      },
      {
        name: "Buyer Financing Funnel Optimization",
        description: "AI-powered affordability matching: automatically show properties within buyer's financing capacity based on pre-approval data",
        valueProposition: "Buyers only see properties they can afford — reducing time-to-purchase by 45% and increasing satisfaction scores",
        executionSteps: [
          "Use pre-approval data to filter and rank search results by affordability",
          "Create 'Within Your Budget' personalized feed with AI recommendations",
          "Build mortgage comparison tool: 'Buy this property with Bank A vs. Bank B' scenario analysis",
          "Implement 'financing gap alert': 'You're Rp 200M short — here are 5 similar properties within budget'",
        ],
        timeline: "Day 45-75", kpi: "30% of buyers use financing filter, 20% conversion uplift", priority: "high",
      },
      {
        name: "Trust & Credibility Enhancement",
        description: "Co-branded trust signals: 'Verified by Bank BCA', 'BTN Mortgage Ready', 'Pre-Approved Property' badges on listings",
        valueProposition: "Bank endorsement badges increase buyer trust by 40% and reduce inquiry-to-visit drop-off by 25%",
        executionSteps: [
          "Design co-branded badge system: 'Mortgage Ready ✓', 'Bank Verified Price ✓', 'Pre-Approved ✓'",
          "Implement badge display on property cards and detail pages",
          "Create bank partner page showcasing all financing options with trust messaging",
          "Joint press releases and case studies highlighting successful buyer journeys",
        ],
        timeline: "Day 60-90", kpi: "500 badged listings, 40% trust score improvement", priority: "medium",
      },
    ],
    revenueModel: "Lead referral fee per mortgage application (Rp 500K-1M) + Co-marketing sponsorship (Rp 50M/quarter) + Data insights licensing",
  },
  {
    key: "media", title: "Media & Community Partnerships", emoji: "📰", icon: Newspaper,
    color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30",
    overview: "Collaborate with property media and communities to co-produce market intelligence, host events, and build authoritative brand positioning",
    targetPartners: ["Rumah.com", "99.co Indonesia", "Kompas Properti", "Bisnis Indonesia", "Property & Bank Magazine", "AREBI", "REI", "HousingEstate"],
    initiatives: [
      {
        name: "Joint Market Intelligence Reports",
        description: "Co-publish quarterly property market reports combining our AI data with media editorial reach — establishing thought leadership",
        valueProposition: "Media partners get exclusive AI-generated data and insights; we get editorial distribution to 500K+ property-interested readers",
        executionSteps: [
          "Produce 'Indonesia Property Market Intelligence Q2 2026' with AI-generated insights, price trends, hotspot rankings",
          "Co-brand with 2 media partners: they distribute via their channels, we provide the data engine",
          "Include downloadable city-level mini-reports as lead magnets on both platforms",
          "PR campaign around each report launch — target 20+ media pickups per quarter",
        ],
        timeline: "Day 15-45", kpi: "2 co-published reports, 10K downloads, 30 media mentions", priority: "high",
      },
      {
        name: "Educational Events & Webinars",
        description: "Monthly webinar series on property investment, market trends, and AI technology — co-hosted with industry associations",
        valueProposition: "Position platform as the AI-powered knowledge leader in Indonesian property — drive 500+ registrations per event",
        executionSteps: [
          "Plan 3-month webinar calendar: 'AI in Property Investment', 'Market Outlook 2026', 'First-Time Buyer Guide'",
          "Partner with REI/AREBI for co-hosting and speaker sourcing — leverage their member networks",
          "Build webinar registration flow with lead capture (name, email, investment budget, city interest)",
          "Post-event: send AI-personalized property recommendations based on webinar topic and attendee profile",
        ],
        timeline: "Day 30-60", kpi: "3 webinars hosted, 1,500 total registrants, 200 leads converted", priority: "high",
      },
      {
        name: "Brand Authority Positioning",
        description: "Systematic PR and content syndication strategy to establish platform as Indonesia's definitive AI property intelligence source",
        valueProposition: "Become the 'go-to' data source for property journalists and analysts — organic brand mentions drive 30% of new user acquisition",
        executionSteps: [
          "Create monthly 'AI Property Pulse' press release with 3 data-driven insights journalists can cite",
          "Build media kit with brand assets, data visualizations, and expert spokesperson profiles",
          "Offer exclusive data access to top 10 property journalists — they cite us as source in articles",
          "Sponsor 2 industry conferences (REI Expo, AREBI Summit) with speaking slots showcasing AI capabilities",
        ],
        timeline: "Day 45-90", kpi: "50 media mentions, 5 conference appearances, 30% brand recall improvement", priority: "medium",
      },
    ],
    revenueModel: "Sponsored content packages (Rp 30M/quarter) + Event sponsorship sales (Rp 20M/event) + Data licensing to media (Rp 10M/month)",
  },
  {
    key: "strategic", title: "Long-Term Strategic Alliances", emoji: "🌐", icon: Globe,
    color: "text-foreground", bg: "bg-foreground/5", border: "border-foreground/20",
    overview: "Build deep ecosystem integrations creating lasting competitive moats — data intelligence collaboration, premium subscriptions, and national expansion",
    targetPartners: ["Telkom Indonesia (digital infra)", "Gojek/Tokopedia (super-app integration)", "BPS (national statistics)", "ATR/BPN (land registry)", "PropTech associations (APSI)"],
    initiatives: [
      {
        name: "Data Intelligence Collaboration Network",
        description: "Create a property data consortium with government, banking, and telco partners — enriching AI models with transaction, demographic, and infrastructure data",
        valueProposition: "Access to exclusive datasets creates unbeatable AI accuracy — property valuations within 5% of actual sale price",
        executionSteps: [
          "MOU with BPS for anonymized demographic and economic data access at kecamatan level",
          "Partnership with ATR/BPN for land certificate verification API (reducing fraud risk)",
          "Telco partnership for anonymized mobility data to predict neighborhood demand trends",
          "Build unified data lake with privacy-compliant ingestion, transformation, and AI training pipelines",
        ],
        timeline: "Day 60-90+", kpi: "3 data partnerships signed, AI accuracy improvement +15%", priority: "high",
      },
      {
        name: "Premium Listing Subscription Ecosystem",
        description: "Multi-sided subscription platform: developers pay for premium placement, agents pay for leads, investors pay for intelligence — creating network effects",
        valueProposition: "Each subscription tier makes the platform more valuable for all other participants — self-reinforcing growth flywheel",
        executionSteps: [
          "Developer tier: Featured Project (Rp 10M/mo) — top placement, AI marketing, lead priority",
          "Agent tier: Pro Agent (Rp 3M/mo) — exclusive leads, CRM tools, performance analytics",
          "Investor tier: Premium Intelligence (Rp 500K/mo) — full AI analysis, deal alerts, portfolio tracking",
          "Build cross-tier incentives: more developers → more inventory → more buyers → more agents → more developers",
        ],
        timeline: "Day 45-90", kpi: "Rp 500M MRR from subscriptions by Day 90", priority: "critical",
      },
      {
        name: "Nationwide Expansion Roadmap",
        description: "Phased geographic expansion leveraging partnerships: use developer and agency networks to enter new cities with pre-built supply and demand",
        valueProposition: "Partnership-led expansion reduces new city launch cost by 70% and time-to-traction by 60% vs. organic entry",
        executionSteps: [
          "Phase 1 (Day 1-30): Jabodetabek + Bali — leverage existing developer and agency relationships",
          "Phase 2 (Day 31-60): Surabaya, Bandung, Semarang — agency network expansion + developer pipeline",
          "Phase 3 (Day 61-90): Medan, Makassar, Yogyakarta — community partnerships + media co-marketing",
          "Phase 4 (Day 91+): Balikpapan (Nusantara capital), Manado, Palembang — government partnership leverage",
        ],
        timeline: "Day 1-90+", kpi: "15 cities covered, 50 partnerships active, nationwide brand presence", priority: "critical",
      },
    ],
    revenueModel: "SaaS subscriptions (Rp 500M MRR target) + Data licensing (Rp 100M/quarter) + Transaction commission (1-3% of GMV)",
  },
];

// ── Timeline/Roadmap data ──

interface RoadmapPhase {
  phase: string;
  period: string;
  color: string;
  bg: string;
  milestones: { milestone: string; category: string; priority: "critical" | "high" | "medium" }[];
}

const roadmapPhases: RoadmapPhase[] = [
  {
    phase: "Phase 1 — Foundation", period: "Day 1-30", color: "text-chart-4", bg: "bg-chart-4/10",
    milestones: [
      { milestone: "Sign 10 developer project partnerships", category: "Developer", priority: "critical" },
      { milestone: "Onboard 30 agency partnerships (5 Gold tier)", category: "Agency", priority: "critical" },
      { milestone: "Launch developer portal and bulk listing API", category: "Developer", priority: "high" },
      { milestone: "Initiate banking partnership discussions (3 banks)", category: "Banking", priority: "high" },
      { milestone: "Publish first co-branded market report", category: "Media", priority: "high" },
      { milestone: "Define premium subscription tier structure", category: "Strategic", priority: "medium" },
    ],
  },
  {
    phase: "Phase 2 — Activation", period: "Day 31-60", color: "text-primary", bg: "bg-primary/10",
    milestones: [
      { milestone: "Integrate mortgage pre-approval with 3 banks", category: "Banking", priority: "critical" },
      { milestone: "Launch 5 co-marketed developer project campaigns", category: "Developer", priority: "critical" },
      { milestone: "Deploy shared lead conversion system for agencies", category: "Agency", priority: "high" },
      { milestone: "Host 3 educational webinars with 1,500 registrants", category: "Media", priority: "high" },
      { milestone: "Launch Pro Agent and Premium Investor subscriptions", category: "Strategic", priority: "high" },
      { milestone: "Expand to Surabaya, Bandung, Semarang via partnerships", category: "Strategic", priority: "high" },
    ],
  },
  {
    phase: "Phase 3 — Scale", period: "Day 61-90", color: "text-chart-1", bg: "bg-chart-1/10",
    milestones: [
      { milestone: "Achieve Rp 500M MRR from partnership subscriptions", category: "Strategic", priority: "critical" },
      { milestone: "Sign 3 data intelligence partnerships (BPS, telco, BPN)", category: "Strategic", priority: "critical" },
      { milestone: "500 bank-badged listings live on platform", category: "Banking", priority: "high" },
      { milestone: "50 media mentions and 5 conference appearances", category: "Media", priority: "high" },
      { milestone: "200 exclusive agency listings driving 40% inquiry uplift", category: "Agency", priority: "high" },
      { milestone: "15 cities covered with active partnership networks", category: "Strategic", priority: "critical" },
    ],
  },
];

// ── Component: Partnership Category Card ──

function CategoryCard({ category }: { category: PartnershipCategory }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = category.icon;

  return (
    <Card className="rounded-2xl border-border/30 bg-card/80 overflow-hidden">
      <div className={cn("h-1", category.bg.replace("/10", "/30"))} />
      <CardHeader className="p-4 pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", category.bg)}>
              <Icon className={cn("h-3.5 w-3.5", category.color)} />
            </div>
            {category.emoji} {category.title}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[8px] h-4 px-1.5 text-muted-foreground">
              {category.initiatives.length} initiatives
            </Badge>
            {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground mt-1">{category.overview}</p>
      </CardHeader>

      {expanded && (
        <CardContent className="p-4 pt-0 space-y-3 border-t border-border/20">
          {/* Target Partners */}
          <div>
            <span className="text-[8px] text-muted-foreground uppercase tracking-wide block mb-1">Target Partners</span>
            <div className="flex flex-wrap gap-1">
              {category.targetPartners.map((p) => (
                <Badge key={p} variant="outline" className="text-[7px] h-3.5 px-1.5 text-foreground">{p}</Badge>
              ))}
            </div>
          </div>

          {/* Initiatives */}
          {category.initiatives.map((init, i) => {
            const pc = priorityConfig[init.priority];
            return (
              <div key={i} className="rounded-xl border border-border/20 bg-muted/5 overflow-hidden">
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-foreground">{init.name}</span>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={cn("text-[7px] h-3.5 px-1", pc.color, pc.bg, pc.border)}>{init.priority}</Badge>
                      <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-muted-foreground">{init.timeline}</Badge>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground">{init.description}</p>

                  <div className="p-2 rounded-lg bg-chart-1/5 border border-chart-1/20">
                    <span className="text-[7px] text-chart-1 font-bold block">💡 Value Proposition</span>
                    <p className="text-[8px] text-foreground">{init.valueProposition}</p>
                  </div>

                  <div>
                    <span className="text-[7px] text-muted-foreground uppercase tracking-wide block mb-1">Execution Steps</span>
                    <div className="space-y-1">
                      {init.executionSteps.map((step, j) => (
                        <div key={j} className="flex items-start gap-1.5">
                          <span className="text-[8px] text-primary font-bold shrink-0">{j + 1}.</span>
                          <span className="text-[8px] text-muted-foreground">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[7px] h-3.5 px-1.5 text-chart-1 bg-chart-1/5 border-chart-1/20">
                    KPI: {init.kpi}
                  </Badge>
                </div>
              </div>
            );
          })}

          {/* Revenue Model */}
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-[8px] text-primary font-bold block mb-0.5">💰 Revenue Model</span>
            <p className="text-[9px] text-foreground">{category.revenueModel}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ── Component: Roadmap Timeline ──

function RoadmapTimeline() {
  return (
    <div className="space-y-3">
      {roadmapPhases.map((phase) => (
        <Card key={phase.phase} className="rounded-xl border-border/30 bg-card/80">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className={cn("text-[11px] font-bold", phase.color)}>{phase.phase}</CardTitle>
              <Badge variant="outline" className={cn("text-[8px] h-4 px-2", phase.color, phase.bg)}>{phase.period}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-1.5">
            {phase.milestones.map((m, i) => {
              const pc = priorityConfig[m.priority];
              return (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border/10 bg-muted/5">
                  <CheckCircle2 className={cn("h-3 w-3 shrink-0", pc.color)} />
                  <span className="text-[9px] text-foreground flex-1">{m.milestone}</span>
                  <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground">{m.category}</Badge>
                  <Badge variant="outline" className={cn("text-[6px] h-3 px-1", pc.color, pc.bg, pc.border)}>{m.priority}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Component: Partnership Scorecard ──

function PartnershipScorecard() {
  const targets = [
    { category: "Developer", day30: "10 projects", day60: "25 projects", day90: "50 projects", revenue: "Rp 150M", color: "text-chart-1" },
    { category: "Agency", day30: "30 agencies", day60: "60 agencies", day90: "100 agencies", revenue: "Rp 200M", color: "text-primary" },
    { category: "Banking", day30: "3 discussions", day60: "3 integrations", day90: "1,000 pre-approvals/mo", revenue: "Rp 100M", color: "text-chart-3" },
    { category: "Media", day30: "1 report", day60: "3 webinars", day90: "50 mentions", revenue: "Rp 50M", color: "text-chart-4" },
    { category: "Strategic", day30: "Tier design", day60: "Launch subs", day90: "Rp 500M MRR", revenue: "Rp 500M", color: "text-foreground" },
  ];

  return (
    <Card className="rounded-2xl border-border/30 bg-card/80">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <Target className="h-4 w-4 text-chart-1" />
          Partnership Growth Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-1">
          <div className="grid grid-cols-[100px_1fr_1fr_1fr_80px] gap-2 px-2 pb-1">
            <span className="text-[7px] text-muted-foreground font-bold">Category</span>
            <span className="text-[7px] text-muted-foreground font-bold">Day 30</span>
            <span className="text-[7px] text-muted-foreground font-bold">Day 60</span>
            <span className="text-[7px] text-muted-foreground font-bold">Day 90</span>
            <span className="text-[7px] text-muted-foreground font-bold text-right">Revenue Target</span>
          </div>
          {targets.map((t) => (
            <div key={t.category} className="grid grid-cols-[100px_1fr_1fr_1fr_80px] gap-2 p-2 rounded-lg border border-border/10 bg-muted/5 items-center">
              <span className={cn("text-[9px] font-bold", t.color)}>{t.category}</span>
              <span className="text-[8px] text-muted-foreground">{t.day30}</span>
              <span className="text-[8px] text-muted-foreground">{t.day60}</span>
              <span className="text-[8px] text-foreground font-semibold">{t.day90}</span>
              <span className={cn("text-[9px] font-bold text-right", t.color)}>{t.revenue}</span>
            </div>
          ))}
          <div className="grid grid-cols-[100px_1fr_1fr_1fr_80px] gap-2 p-2 rounded-lg bg-chart-1/5 border border-chart-1/20 items-center mt-1">
            <span className="text-[10px] font-bold text-chart-1">TOTAL</span>
            <span className="text-[8px] text-muted-foreground">—</span>
            <span className="text-[8px] text-muted-foreground">—</span>
            <span className="text-[9px] font-bold text-chart-1">Full ecosystem</span>
            <span className="text-[10px] font-bold text-chart-1 text-right">Rp 1B+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ──

const PartnershipExpansionDashboard = React.memo(function PartnershipExpansionDashboard() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-chart-1/40 via-primary/30 to-chart-3/20" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Handshake className="h-5 w-5 text-primary" />
                Partnership Expansion Strategy
              </CardTitle>
              <CardDescription className="text-[11px]">
                Strategic ecosystem partnerships — developers, agencies, banks, media, and long-term alliances
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-primary bg-primary/10 border-primary/30">
              🤝 5 Partnership Verticals
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {partnershipCategories.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.key} className={cn("p-2 rounded-xl border", c.bg, c.border)}>
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("h-3 w-3", c.color)} />
                    <span className="text-[8px] font-bold text-foreground">{c.emoji} {c.title.split(" ")[0]}</span>
                  </div>
                  <span className={cn("text-[9px] font-bold block mt-0.5", c.color)}>{c.initiatives.length} initiatives</span>
                  <span className="text-[7px] text-muted-foreground">{c.targetPartners.length} target partners</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="partnerships" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="partnerships" className="text-[10px] h-6 px-3">Partnership Plans</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-[10px] h-6 px-3">Execution Roadmap</TabsTrigger>
          <TabsTrigger value="scorecard" className="text-[10px] h-6 px-3">Growth Scorecard</TabsTrigger>
        </TabsList>

        <TabsContent value="partnerships" className="mt-3 space-y-2">
          {partnershipCategories.map((c) => <CategoryCard key={c.key} category={c} />)}
        </TabsContent>

        <TabsContent value="roadmap" className="mt-3">
          <RoadmapTimeline />
        </TabsContent>

        <TabsContent value="scorecard" className="mt-3 space-y-3">
          <PartnershipScorecard />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default PartnershipExpansionDashboard;
