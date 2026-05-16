import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign, Crown, Users, Building, TrendingUp, BarChart3, Target,
  Zap, Star, Shield, Eye, Bell, LineChart, ChevronRight, ChevronDown,
  CheckCircle2, ArrowRight, Layers, FileText, MapPin, Sparkles,
  Gift, Lock, Landmark, Globe, Database, Award, Package, Rocket,
  CreditCard, Receipt, Percent, Timer, Gem,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Revenue Stream Definitions ──

interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  targetUser: string;
  conversionTarget: string;
}

interface RevenueStream {
  key: string;
  title: string;
  emoji: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  description: string;
  phase: string;
  estRevenue: string;
  pricingTiers: PricingTier[];
  implementationSteps: string[];
  riskMitigation: string;
}

const revenueStreams: RevenueStream[] = [
  {
    key: "listing", title: "Listing Promotion Monetization", emoji: "🏠", icon: Eye,
    color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30",
    description: "Tiered listing visibility packages — from basic free listings to AI-optimized premium spotlight placements",
    phase: "Phase 1 (Day 30+)", estRevenue: "Rp 200M/mo by Month 6",
    pricingTiers: [
      {
        name: "Free Listing", price: "Rp 0", period: "per listing",
        features: ["Basic listing with 5 photos", "Standard search inclusion", "Basic analytics (views only)", "30-day listing duration"],
        targetUser: "Individual owners, small agents", conversionTarget: "100% of new listings (acquisition driver)",
      },
      {
        name: "Featured Listing", price: "Rp 250K", period: "per listing/month",
        features: ["Priority search ranking (+50 boost)", "'Featured' badge on listing card", "15 photos + video support", "Detailed analytics (views, saves, inquiries)", "60-day listing duration"],
        targetUser: "Active agents, serious sellers", conversionTarget: "20% of total listings",
      },
      {
        name: "AI Visibility Boost", price: "Rp 500K", period: "per listing/month",
        features: ["AI-optimized title and description", "Smart keyword injection for SEO", "Dynamic pricing recommendation", "Buyer intent matching (pushed to matched buyers)", "Top-of-search placement in target area", "Real-time performance optimization"],
        targetUser: "Professional agents, developers", conversionTarget: "10% of total listings",
      },
      {
        name: "Premium Project Spotlight", price: "Rp 5M", period: "per project/month",
        features: ["Homepage carousel placement", "Dedicated project landing page", "AI investment analysis for each unit", "Lead capture form with auto-routing", "Social media promotion package", "Monthly performance report", "Co-branded content creation"],
        targetUser: "Property developers", conversionTarget: "Top 20 developer projects",
      },
    ],
    implementationSteps: [
      "Build listing upgrade flow: one-click upgrade from listing management page",
      "Implement search ranking algorithm with boost multipliers for paid tiers",
      "Create AI content optimization pipeline (title/description rewrite engine)",
      "Build self-serve checkout with Midtrans integration for listing packages",
      "Deploy analytics dashboard showing ROI of listing promotion (views/inquiry uplift)",
    ],
    riskMitigation: "Free tier must remain compelling to maintain listing volume — paid tiers add visibility, not gate basic functionality",
  },
  {
    key: "agent", title: "Agent Subscription Model", emoji: "🤝", icon: Users,
    color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    description: "Monthly subscription tiers for agents — AI deal signals, priority leads, CRM tools, and performance analytics",
    phase: "Phase 1 (Day 45+)", estRevenue: "Rp 300M/mo by Month 6",
    pricingTiers: [
      {
        name: "Agent Basic", price: "Rp 0", period: "forever free",
        features: ["Up to 10 active listings", "Basic inquiry notifications", "Public agent profile", "Standard search visibility"],
        targetUser: "New or part-time agents", conversionTarget: "70% of registered agents",
      },
      {
        name: "Agent Pro", price: "Rp 1.5M", period: "per month",
        features: ["Unlimited listings", "AI Deal Score on all inquiries", "Priority lead distribution (first 30 min exclusive)", "Advanced CRM with pipeline tracking", "Performance analytics dashboard", "Verified Agent badge", "Automated follow-up sequences"],
        targetUser: "Full-time agents, small brokerages", conversionTarget: "25% of active agents",
      },
      {
        name: "Agency Enterprise", price: "Rp 8M", period: "per month (up to 10 agents)",
        features: ["Everything in Pro for entire team", "Team performance leaderboard", "Centralized lead management", "Custom branded agent pages", "API access for listing sync", "Dedicated account manager", "Quarterly business review with AI insights", "Territory exclusivity (optional add-on)"],
        targetUser: "Brokerage firms, agency networks", conversionTarget: "Top 50 agencies nationwide",
      },
    ],
    implementationSteps: [
      "Build agent subscription management page with tier comparison",
      "Implement lead distribution algorithm: Pro agents get 30-min exclusive window",
      "Deploy agent CRM module with pipeline stages and automated follow-ups",
      "Create performance analytics dashboard (response rate, conversion, revenue)",
      "Build team management for Enterprise tier (invite, roles, shared inbox)",
    ],
    riskMitigation: "Free tier must still deliver value (basic inquiries) — Pro/Enterprise add speed advantage and intelligence, not gate access to leads",
  },
  {
    key: "investor", title: "Investor Premium Intelligence", emoji: "📊", icon: LineChart,
    color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30",
    description: "Subscription intelligence service for property investors — AI signals, forecasts, portfolio tools, and early access to deals",
    phase: "Phase 2 (Day 60+)", estRevenue: "Rp 150M/mo by Month 6",
    pricingTiers: [
      {
        name: "Investor Free", price: "Rp 0", period: "forever free",
        features: ["Basic property search", "3 AI investment scores per month", "General market overview", "Limited price history (1 year)"],
        targetUser: "Casual property browsers", conversionTarget: "80% of registered investors",
      },
      {
        name: "Investor Pro", price: "Rp 500K", period: "per month",
        features: ["Unlimited AI investment scores", "Deal rating (Strong Buy → Overpriced)", "Fair market value estimates", "5-year price forecasts", "Rental yield projections", "National market forecast reports", "Weekly AI opportunity alerts", "Portfolio tracker (up to 10 properties)"],
        targetUser: "Active individual investors", conversionTarget: "15% of registered investors",
      },
      {
        name: "Investor Diamond", price: "Rp 2M", period: "per month",
        features: ["Everything in Pro", "Early access to off-market deals (24hr exclusive)", "Institutional-grade market analytics", "Portfolio optimization AI recommendations", "Custom AI alerts by area/price/type", "Monthly 1-on-1 with investment advisor", "API access for data export", "Multi-city comparison intelligence"],
        targetUser: "HNW investors, family offices", conversionTarget: "Top 200 investors by engagement",
      },
    ],
    implementationSteps: [
      "Gate premium AI features behind subscription check (useSubscriptionType hook)",
      "Build intelligent paywall: show partial insight → 'Unlock Full Analysis' CTA",
      "Deploy portfolio tracking dashboard with performance metrics",
      "Create deal alert system with personalized criteria matching",
      "Implement early-access deal routing: Diamond users get 24hr exclusive window",
    ],
    riskMitigation: "Free tier shows enough value to hook users — premium reveals deeper intelligence that justifies the cost through better investment decisions",
  },
  {
    key: "transaction", title: "Transaction-Based Revenue", emoji: "💰", icon: Receipt,
    color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30",
    description: "Performance-based revenue from successful transactions, mortgage referrals, and value-added services",
    phase: "Phase 2 (Day 75+)", estRevenue: "Rp 500M/mo by Month 9",
    pricingTiers: [
      {
        name: "Success Fee", price: "1-2%", period: "of transaction value",
        features: ["Charged only on completed transactions facilitated through platform", "Applied when buyer inquiry → viewing → offer → closing tracked end-to-end", "Split model: 0.5% from buyer side, 0.5-1.5% from agent/seller side", "Waived for first 3 transactions per agent (incentivize adoption)"],
        targetUser: "All platform-facilitated transactions", conversionTarget: "30% of platform inquiries → transactions",
      },
      {
        name: "Mortgage Referral", price: "Rp 500K-2M", period: "per approved mortgage",
        features: ["Commission from partner banks for qualified mortgage referrals", "Pre-approval flow integrated on property pages", "Bank comparison tool drives high-intent leads", "Tiered commission: Rp 500K (standard) → Rp 2M (premium properties)"],
        targetUser: "Buyers needing financing (60% of transactions)", conversionTarget: "1,000 mortgage referrals/month by Month 9",
      },
      {
        name: "Value-Added Services", price: "Varies", period: "per service",
        features: ["Property inspection booking (Rp 500K commission)", "Legal document verification (Rp 300K commission)", "Moving services marketplace (10% commission)", "Home insurance referral (Rp 200K commission)", "Interior design consultation (15% commission)"],
        targetUser: "Post-transaction buyers", conversionTarget: "20% attach rate on completed transactions",
      },
    ],
    implementationSteps: [
      "Build transaction tracking pipeline: inquiry → viewing → offer → closing → commission",
      "Integrate Midtrans for automated commission collection at transaction close",
      "Deploy mortgage pre-approval widget with bank partner API integrations",
      "Create value-added services marketplace with partner onboarding",
      "Build commission dashboard for transparency: agents see exactly how fees work",
    ],
    riskMitigation: "Success fees must remain competitive vs. traditional brokers — platform value (AI insights, qualified leads) justifies the fee",
  },
  {
    key: "ecosystem", title: "Ecosystem Monetization", emoji: "🌐", icon: Globe,
    color: "text-foreground", bg: "bg-foreground/5", border: "border-foreground/20",
    description: "Long-term B2B revenue streams — data licensing, developer marketing, and institutional analytics services",
    phase: "Phase 3 (Month 6+)", estRevenue: "Rp 1B/mo by Month 12",
    pricingTiers: [
      {
        name: "Data Intelligence Licensing", price: "Rp 50-200M", period: "per quarter",
        features: ["Anonymized market data feeds (price trends, demand signals, inventory levels)", "API access to AI-generated market indices", "Custom data reports for specific segments/locations", "White-label intelligence for bank/developer internal use"],
        targetUser: "Banks, consulting firms, government agencies", conversionTarget: "10 enterprise data clients",
      },
      {
        name: "Developer Marketing Suite", price: "Rp 20-100M", period: "per project launch",
        features: ["Complete digital marketing package for new project launches", "AI-generated buyer persona targeting", "Co-branded landing pages with lead capture", "Social media campaign management", "Performance reporting with attribution"],
        targetUser: "Property developers launching new projects", conversionTarget: "20 developer marketing contracts/year",
      },
      {
        name: "Institutional Analytics Service", price: "Rp 100-500M", period: "per year",
        features: ["Custom AI model training on client-specific data", "Quarterly strategic advisory briefings", "Real-time market monitoring dashboards", "Investment portfolio risk assessment", "Regulatory compliance analytics (for banks)"],
        targetUser: "REITs, pension funds, insurance companies", conversionTarget: "5 institutional clients by Year 2",
      },
    ],
    implementationSteps: [
      "Build data API with rate limiting, authentication, and usage metering",
      "Create enterprise sales process: discovery → proposal → POC → contract",
      "Develop white-label analytics dashboard that clients can embed",
      "Establish data governance framework for anonymization and compliance",
      "Hire enterprise sales team (2 people) for B2B relationship management",
    ],
    riskMitigation: "Start with warm leads (existing bank/developer partners) — prove value through free pilot before paid contract",
  },
];

// ── Revenue Projections ──

interface RevenueProjection {
  period: string;
  color: string;
  streams: { name: string; amount: string; pct: number }[];
  total: string;
  milestone: string;
}

const revenueProjections: RevenueProjection[] = [
  {
    period: "Month 3", color: "text-chart-4",
    streams: [
      { name: "Listing Promotion", amount: "Rp 50M", pct: 40 },
      { name: "Agent Subscriptions", amount: "Rp 45M", pct: 36 },
      { name: "Investor Premium", amount: "Rp 15M", pct: 12 },
      { name: "Transaction Fees", amount: "Rp 10M", pct: 8 },
      { name: "Ecosystem B2B", amount: "Rp 5M", pct: 4 },
    ],
    total: "Rp 125M/mo", milestone: "First revenue milestone — validating willingness to pay",
  },
  {
    period: "Month 6", color: "text-primary",
    streams: [
      { name: "Listing Promotion", amount: "Rp 200M", pct: 28 },
      { name: "Agent Subscriptions", amount: "Rp 300M", pct: 41 },
      { name: "Investor Premium", amount: "Rp 150M", pct: 21 },
      { name: "Transaction Fees", amount: "Rp 50M", pct: 7 },
      { name: "Ecosystem B2B", amount: "Rp 25M", pct: 3 },
    ],
    total: "Rp 725M/mo", milestone: "Subscription revenue dominant — recurring revenue base established",
  },
  {
    period: "Month 12", color: "text-chart-1",
    streams: [
      { name: "Listing Promotion", amount: "Rp 400M", pct: 17 },
      { name: "Agent Subscriptions", amount: "Rp 600M", pct: 26 },
      { name: "Investor Premium", amount: "Rp 350M", pct: 15 },
      { name: "Transaction Fees", amount: "Rp 500M", pct: 22 },
      { name: "Ecosystem B2B", amount: "Rp 450M", pct: 20 },
    ],
    total: "Rp 2.3B/mo", milestone: "Diversified revenue — no single stream exceeds 30% (healthy mix)",
  },
];

// ── Phased Rollout Plan ──

interface RolloutPhase {
  phase: string;
  period: string;
  color: string;
  bg: string;
  principle: string;
  launches: { stream: string; action: string; priority: "critical" | "high" | "medium" }[];
  guardrails: string[];
  successMetric: string;
}

const rolloutPhases: RolloutPhase[] = [
  {
    phase: "Phase 1 — Foundation Revenue", period: "Day 30-60", color: "text-chart-4", bg: "bg-chart-4/10",
    principle: "Introduce monetization gently — free remains powerful, paid adds speed and intelligence advantages",
    launches: [
      { stream: "Listing", action: "Launch Featured Listing (Rp 250K) with one-click upgrade", priority: "critical" },
      { stream: "Listing", action: "Deploy AI Visibility Boost (Rp 500K) with before/after performance preview", priority: "high" },
      { stream: "Agent", action: "Launch Agent Pro subscription (Rp 1.5M/mo) with 14-day free trial", priority: "critical" },
      { stream: "Agent", action: "Implement priority lead distribution for Pro agents", priority: "high" },
      { stream: "Payments", action: "Integrate Midtrans checkout for self-serve subscription purchases", priority: "critical" },
    ],
    guardrails: [
      "Free listing quality must NOT degrade — paid adds visibility, not basic functionality",
      "Monitor listing volume weekly — if new listings drop >10%, reassess pricing",
      "Agent free tier must still receive leads (just not priority-routed)",
    ],
    successMetric: "Rp 125M MRR, 20% paid listing rate, 25% agent Pro conversion",
  },
  {
    phase: "Phase 2 — Intelligence Monetization", period: "Day 60-90", color: "text-primary", bg: "bg-primary/10",
    principle: "Gate deeper intelligence, not access — users see enough value to want more",
    launches: [
      { stream: "Investor", action: "Launch Investor Pro (Rp 500K/mo) with intelligent paywall on AI insights", priority: "critical" },
      { stream: "Investor", action: "Deploy Investor Diamond (Rp 2M/mo) with early deal access and advisor calls", priority: "high" },
      { stream: "Listing", action: "Launch Premium Project Spotlight (Rp 5M/mo) for developers", priority: "high" },
      { stream: "Transaction", action: "Begin tracking end-to-end transactions for success fee model", priority: "high" },
      { stream: "Transaction", action: "Launch mortgage pre-approval referral flow with 3 bank partners", priority: "critical" },
    ],
    guardrails: [
      "Paywall must show partial value first (score visible, full analysis gated)",
      "Diamond early-access window (24hr) must not starve Pro users of good deals",
      "Transaction tracking must be transparent — agents see exactly what's tracked",
    ],
    successMetric: "Rp 725M MRR, 15% investor Pro conversion, 1,000 mortgage referrals/month",
  },
  {
    phase: "Phase 3 — Ecosystem Revenue", period: "Month 4-12", color: "text-chart-1", bg: "bg-chart-1/10",
    principle: "B2B revenue creates moat — enterprise contracts are sticky, high-value, and compound over time",
    launches: [
      { stream: "Agent", action: "Launch Agency Enterprise tier (Rp 8M/mo) with team management", priority: "critical" },
      { stream: "Ecosystem", action: "First data licensing pilot with partner bank", priority: "critical" },
      { stream: "Ecosystem", action: "Launch Developer Marketing Suite (Rp 20-100M/project)", priority: "high" },
      { stream: "Transaction", action: "Activate success fee model (1-2%) on tracked transactions", priority: "high" },
      { stream: "Ecosystem", action: "Pitch institutional analytics to REITs and pension funds", priority: "medium" },
      { stream: "Transaction", action: "Deploy value-added services marketplace (inspection, legal, moving)", priority: "medium" },
    ],
    guardrails: [
      "Enterprise contracts require dedicated account management — hire before selling",
      "Data licensing must be anonymized and privacy-compliant from day one",
      "Success fees must be competitive with traditional broker rates to gain acceptance",
    ],
    successMetric: "Rp 2.3B MRR, 10 enterprise clients, positive unit economics on all streams",
  },
];

const priorityConfig = {
  critical: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  high: { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30" },
  medium: { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30" },
};

// ── Components ──

function RevenueStreamCard({ stream }: { stream: RevenueStream }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = stream.icon;

  return (
    <Card className="rounded-2xl border-border/30 bg-card/80 overflow-hidden">
      <div className={cn("h-1", stream.bg.replace("/10", "/30"))} />
      <CardHeader className="p-3 pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] font-bold flex items-center gap-2">
            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", stream.bg)}>
              <Icon className={cn("h-3 w-3", stream.color)} />
            </div>
            {stream.emoji} {stream.title}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-muted-foreground">{stream.phase}</Badge>
            <Badge variant="outline" className={cn("text-[7px] h-3.5 px-1", stream.color, stream.bg, stream.border)}>{stream.estRevenue}</Badge>
            {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground mt-1">{stream.description}</p>
      </CardHeader>

      {expanded && (
        <CardContent className="p-3 pt-0 space-y-3 border-t border-border/20">
          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {stream.pricingTiers.map((tier, i) => (
              <div key={i} className={cn("p-2.5 rounded-xl border",
                i === stream.pricingTiers.length - 1 ? `${stream.bg} ${stream.border}` : "border-border/20 bg-muted/5")}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-foreground">{tier.name}</span>
                  <div className="text-right">
                    <span className={cn("text-[11px] font-bold", i > 0 ? stream.color : "text-foreground")}>{tier.price}</span>
                    <span className="text-[7px] text-muted-foreground block">{tier.period}</span>
                  </div>
                </div>
                <div className="space-y-0.5 mb-1.5">
                  {tier.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-1">
                      <CheckCircle2 className="h-2 w-2 text-chart-1 shrink-0 mt-0.5" />
                      <span className="text-[8px] text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground">{tier.targetUser}</Badge>
                  <Badge variant="outline" className="text-[6px] h-3 px-1 text-chart-1 bg-chart-1/5 border-chart-1/20">{tier.conversionTarget}</Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Implementation */}
          <div>
            <span className="text-[8px] text-muted-foreground uppercase tracking-wide block mb-1">Implementation Steps</span>
            <div className="space-y-1">
              {stream.implementationSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-[8px] text-primary font-bold shrink-0">{i + 1}.</span>
                  <span className="text-[8px] text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk */}
          <div className="p-2 rounded-lg bg-chart-4/5 border border-chart-4/20">
            <span className="text-[7px] text-chart-4 font-bold block">⚠️ Risk Mitigation</span>
            <p className="text-[8px] text-muted-foreground">{stream.riskMitigation}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function RevenueProjectionsSection() {
  return (
    <div className="space-y-3">
      {revenueProjections.map((proj) => (
        <Card key={proj.period} className="rounded-2xl border-border/30 bg-card/80">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className={cn("text-[11px] font-bold", proj.color)}>{proj.period}</CardTitle>
              <Badge variant="outline" className={cn("text-sm h-6 px-3 font-bold", proj.color)}>{proj.total}</Badge>
            </div>
            <p className="text-[9px] text-muted-foreground">{proj.milestone}</p>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-1.5">
            {proj.streams.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="text-[9px] text-foreground w-32 shrink-0">{s.name}</span>
                <div className="flex-1 h-4 rounded-full bg-muted/10 overflow-hidden relative">
                  <div className={cn("h-full rounded-full flex items-center px-2",
                    s.pct >= 30 ? "bg-chart-1/20" : s.pct >= 20 ? "bg-primary/20" : "bg-chart-4/15")}
                    style={{ width: `${Math.max(s.pct * 2.5, 15)}%` }}>
                    <span className="text-[8px] font-bold text-foreground whitespace-nowrap">{s.amount}</span>
                  </div>
                </div>
                <span className="text-[8px] text-muted-foreground w-8 text-right shrink-0">{s.pct}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RolloutPlanSection() {
  return (
    <div className="space-y-3">
      {rolloutPhases.map((phase) => (
        <Card key={phase.phase} className="rounded-2xl border-border/30 bg-card/80 overflow-hidden">
          <div className={cn("h-1", phase.bg.replace("/10", "/30"))} />
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className={cn("text-[11px] font-bold", phase.color)}>{phase.phase}</CardTitle>
              <Badge variant="outline" className={cn("text-[8px] h-4 px-2", phase.color, phase.bg)}>{phase.period}</Badge>
            </div>
            <p className="text-[9px] text-muted-foreground italic">{phase.principle}</p>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2.5">
            <div className="space-y-1.5">
              {phase.launches.map((l, i) => {
                const pc = priorityConfig[l.priority];
                return (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg border border-border/10 bg-muted/5">
                    <Rocket className={cn("h-2.5 w-2.5 shrink-0 mt-1", pc.color)} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-foreground">{l.action}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[6px] h-3 px-1 text-muted-foreground">{l.stream}</Badge>
                        <Badge variant="outline" className={cn("text-[6px] h-3 px-1", pc.color, pc.bg, pc.border)}>{l.priority}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <span className="text-[8px] text-muted-foreground uppercase tracking-wide block mb-1">Guardrails</span>
              {phase.guardrails.map((g, i) => (
                <div key={i} className="flex items-start gap-1.5 mb-0.5">
                  <Shield className="h-2.5 w-2.5 text-chart-3 shrink-0 mt-0.5" />
                  <span className="text-[8px] text-muted-foreground">{g}</span>
                </div>
              ))}
            </div>

            <Badge variant="outline" className="text-[8px] h-4 px-2 text-chart-1 bg-chart-1/5 border-chart-1/20">
              🎯 Success: {phase.successMetric}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UnitEconomicsSection() {
  const metrics = [
    { label: "Blended CAC", value: "Rp 85K", desc: "Average cost to acquire a paying user across all streams", trend: "↓ decreasing as organic grows" },
    { label: "Blended LTV", value: "Rp 4.2M", desc: "24-month lifetime value weighted across all subscription tiers", trend: "↑ increasing with retention" },
    { label: "LTV:CAC Ratio", value: "49:1", desc: "Healthy ratio indicating sustainable unit economics", trend: "Target: maintain > 10:1" },
    { label: "Payback Period", value: "< 30 days", desc: "Time to recoup acquisition cost from first payment", trend: "Enabled by monthly billing" },
    { label: "Gross Margin", value: "82%", desc: "Revenue minus direct costs (AI compute, payment processing)", trend: "Scale improves with volume" },
    { label: "Net Revenue Retention", value: "115%", desc: "Revenue from existing customers grows through upsells and tier upgrades", trend: "Target: > 110% (expansion revenue)" },
  ];

  return (
    <Card className="rounded-2xl border-border/30 bg-card/80">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-chart-1" /> Unit Economics Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="p-2.5 rounded-xl border border-border/20 bg-muted/5">
              <span className="text-[8px] text-muted-foreground block">{m.label}</span>
              <span className="text-sm font-bold text-foreground">{m.value}</span>
              <span className="text-[8px] text-muted-foreground block mt-0.5">{m.desc}</span>
              <span className="text-[7px] text-chart-1 block mt-0.5">{m.trend}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ──

const MonetizationStrategyDashboard = React.memo(function MonetizationStrategyDashboard() {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-chart-1/40 via-chart-3/30 to-chart-4/20" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-chart-1" />
                Monetization Strategy
              </CardTitle>
              <CardDescription className="text-[11px]">
                Phased revenue rollout — listings, agent subs, investor intelligence, transactions, and B2B ecosystem
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm h-7 px-3 font-bold text-chart-1 bg-chart-1/10 border-chart-1/30">
              💰 Rp 2.3B/mo target
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {revenueStreams.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.key} className={cn("p-2 rounded-xl border", s.bg, s.border)}>
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("h-3 w-3", s.color)} />
                    <span className="text-[8px] font-bold text-foreground">{s.emoji} {s.title.split(" ").slice(0, 2).join(" ")}</span>
                  </div>
                  <span className={cn("text-[9px] font-bold block mt-0.5", s.color)}>{s.estRevenue}</span>
                  <span className="text-[7px] text-muted-foreground">{s.pricingTiers.length} tiers</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="streams" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="streams" className="text-[10px] h-6 px-3">Revenue Streams</TabsTrigger>
          <TabsTrigger value="rollout" className="text-[10px] h-6 px-3">Phased Rollout</TabsTrigger>
          <TabsTrigger value="projections" className="text-[10px] h-6 px-3">Revenue Projections</TabsTrigger>
          <TabsTrigger value="economics" className="text-[10px] h-6 px-3">Unit Economics</TabsTrigger>
        </TabsList>

        <TabsContent value="streams" className="mt-3 space-y-2">
          {revenueStreams.map((s) => <RevenueStreamCard key={s.key} stream={s} />)}
        </TabsContent>

        <TabsContent value="rollout" className="mt-3">
          <RolloutPlanSection />
        </TabsContent>

        <TabsContent value="projections" className="mt-3">
          <RevenueProjectionsSection />
        </TabsContent>

        <TabsContent value="economics" className="mt-3 space-y-3">
          <UnitEconomicsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default MonetizationStrategyDashboard;
