import React, { useState } from "react";
import { Rocket, Copy, Check, ChevronDown, ChevronUp, Target, DollarSign, TrendingUp, Shield, Zap, BarChart3, Users, Layers, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ───────── data ───────── */

interface Milestone {
  metric: string;
  current: string;
  target: string;
  progress: number;
  status: "achieved" | "on-track" | "at-risk" | "not-started";
}

interface FundingStage {
  id: string;
  title: string;
  raise: string;
  valuation: string;
  timeline: string;
  icon: React.ReactNode;
  narrative: string;
  milestones: { category: string; icon: React.ReactNode; items: Milestone[] }[];
  capitalAllocation: { area: string; pct: number; rationale: string }[];
  investorPositioning: string[];
  unlockThresholds: string[];
}

const statusConfig = {
  achieved: { color: "text-chart-3 bg-chart-3/10 border-chart-3/30", label: "Achieved" },
  "on-track": { color: "text-primary bg-primary/10 border-primary/30", label: "On Track" },
  "at-risk": { color: "text-chart-4 bg-chart-4/10 border-chart-4/30", label: "At Risk" },
  "not-started": { color: "text-muted-foreground bg-muted/10 border-border/30", label: "Pending" },
};

const stages: FundingStage[] = [
  {
    id: "seed",
    title: "Seed Round",
    raise: "$500K — $1.5M",
    valuation: "$4M — $8M Pre-Money",
    timeline: "Months 0-6",
    icon: <Zap className="h-5 w-5" />,
    narrative: "We've validated that property vendors and investors will pay for intelligence-driven marketplace access. Early organic traction proves product-market fit in a $120B annual transaction market. This round funds the team and infrastructure to dominate our launch city before expanding.",
    milestones: [
      {
        category: "Liquidity Density", icon: <Layers className="h-4 w-4" />,
        items: [
          { metric: "Active verified listings", current: "420", target: "500+", progress: 84, status: "on-track" },
          { metric: "Daily inquiry velocity", current: "127/day", target: "100+/day", progress: 100, status: "achieved" },
          { metric: "Investor-to-listing ratio", current: "7.2:1", target: "5:1+", progress: 100, status: "achieved" },
          { metric: "Districts with active listings", current: "18", target: "20+", progress: 90, status: "on-track" },
        ],
      },
      {
        category: "Revenue Velocity", icon: <DollarSign className="h-4 w-4" />,
        items: [
          { metric: "Monthly recurring revenue", current: "Rp 45M", target: "Rp 50M+", progress: 90, status: "on-track" },
          { metric: "Paying vendor ratio", current: "12%", target: "10%+", progress: 100, status: "achieved" },
          { metric: "Revenue growth rate MoM", current: "22%", target: "15%+", progress: 100, status: "achieved" },
          { metric: "Unit economics (LTV/CAC)", current: "4.2x", target: "3x+", progress: 100, status: "achieved" },
        ],
      },
      {
        category: "Network Effects", icon: <Users className="h-4 w-4" />,
        items: [
          { metric: "Organic traffic share", current: "68%", target: "50%+", progress: 100, status: "achieved" },
          { metric: "Vendor 90-day retention", current: "87%", target: "75%+", progress: 100, status: "achieved" },
          { metric: "Referral-driven signups", current: "15%", target: "10%+", progress: 100, status: "achieved" },
          { metric: "Cross-side engagement ratio", current: "3.4 actions/session", target: "3+", progress: 100, status: "achieved" },
        ],
      },
    ],
    capitalAllocation: [
      { area: "Engineering & Product", pct: 45, rationale: "Core platform, AI models, mobile experience — build for scale before scaling" },
      { area: "Growth & Marketing", pct: 25, rationale: "Demand acquisition, vendor outreach, content marketing in launch city" },
      { area: "Operations & Hiring", pct: 20, rationale: "Key hires: CTO, Head of Growth, 2 senior engineers" },
      { area: "Legal & Infrastructure", pct: 10, rationale: "Entity setup, compliance, cloud infrastructure scaling" },
    ],
    investorPositioning: [
      "Product-market fit validated with zero paid marketing — 87% vendor retention proves real value delivery",
      "Intelligence moat compounding daily — 2.4M+ proprietary data points with 84% prediction accuracy",
      "Capital-efficient growth: $0 marketing spend, 22% MoM revenue growth, 4.2x LTV/CAC",
      "First-mover in a $120B market with no intelligence layer — category is ours to define",
    ],
    unlockThresholds: [
      "500+ active listings with <38 avg days-on-market",
      "Rp 50M+ MRR with 15%+ MoM growth sustained 3 months",
      "75%+ vendor retention at 90 days",
      "3x+ LTV/CAC with contribution-positive unit economics",
    ],
  },
  {
    id: "pre-series-a",
    title: "Pre-Series A Bridge",
    raise: "$1.5M — $3M",
    valuation: "$12M — $20M Pre-Money",
    timeline: "Months 6-14",
    icon: <TrendingUp className="h-5 w-5" />,
    narrative: "We've proven the model works in one city. Now we're proving it replicates. Two new city launches with our 90-day playbook demonstrate operational scalability. Revenue is accelerating, vendors are upgrading to premium, and investors are becoming repeat buyers. This bridge funds expansion velocity.",
    milestones: [
      {
        category: "Liquidity Density", icon: <Layers className="h-4 w-4" />,
        items: [
          { metric: "Total active listings (multi-city)", current: "420", target: "2,000+", progress: 21, status: "not-started" },
          { metric: "Cities with active marketplace", current: "1", target: "3+", progress: 33, status: "on-track" },
          { metric: "Avg inquiry velocity per city", current: "127/day", target: "80+/day/city", progress: 100, status: "achieved" },
          { metric: "Cross-city investor activity", current: "0%", target: "15%+", progress: 0, status: "not-started" },
        ],
      },
      {
        category: "Revenue Velocity", icon: <DollarSign className="h-4 w-4" />,
        items: [
          { metric: "Monthly recurring revenue", current: "Rp 45M", target: "Rp 250M+", progress: 18, status: "not-started" },
          { metric: "Revenue per city at month 6", current: "Rp 45M", target: "Rp 80M+", progress: 56, status: "on-track" },
          { metric: "Subscription revenue share", current: "35%", target: "50%+", progress: 70, status: "at-risk" },
          { metric: "Annualized run-rate", current: "$35K", target: "$200K+", progress: 18, status: "not-started" },
        ],
      },
      {
        category: "Operational Maturity", icon: <Shield className="h-4 w-4" />,
        items: [
          { metric: "City launch playbook validated", current: "1x", target: "3x launches", progress: 33, status: "on-track" },
          { metric: "Time-to-liquidity per new city", current: "—", target: "<90 days", progress: 0, status: "not-started" },
          { metric: "Automated vendor onboarding rate", current: "40%", target: "70%+", progress: 57, status: "at-risk" },
          { metric: "Support ticket resolution time", current: "8hrs", target: "<4hrs", progress: 50, status: "at-risk" },
        ],
      },
    ],
    capitalAllocation: [
      { area: "City Expansion (2 cities)", pct: 35, rationale: "Rp 400M per city — supply activation, local marketing, vendor BD" },
      { area: "Engineering & AI", pct: 30, rationale: "Multi-city architecture, recommendation engine, mobile app v2" },
      { area: "Growth & Demand", pct: 20, rationale: "Investor acquisition campaigns, content scaling, SEO infrastructure" },
      { area: "Team & Operations", pct: 15, rationale: "City managers, customer success, data engineering hire" },
    ],
    investorPositioning: [
      "Expansion playbook validated — each city follows a proven 90-day sequence to liquidity",
      "Revenue diversifying: subscriptions growing from 35% to 50%+ of mix, reducing transaction dependency",
      "Multi-city data creates compounding intelligence advantage — models improve 2x faster with 3 cities",
      "Path to $200K ARR clear and capital-efficient — Rp 400M per city, break-even by month 9",
    ],
    unlockThresholds: [
      "3+ cities live with >500 listings each",
      "Rp 250M+ MRR with subscription share >50%",
      "City launch playbook replicated 3x with <90-day time-to-liquidity",
      "Cross-city investor activity >15%",
    ],
  },
  {
    id: "series-a",
    title: "Series A",
    raise: "$3M — $5M",
    valuation: "$25M — $40M Pre-Money",
    timeline: "Months 14-24",
    icon: <Target className="h-5 w-5" />,
    narrative: "We're the intelligence layer for Indonesian property investment. Five cities, $1M+ ARR, and the strongest data moat in Southeast Asian PropTech. This round funds national dominance — 10 cities in 12 months — and builds the institutional product suite that transforms us from marketplace to infrastructure.",
    milestones: [
      {
        category: "Liquidity Density", icon: <Layers className="h-4 w-4" />,
        items: [
          { metric: "Total active listings", current: "420", target: "8,000+", progress: 5, status: "not-started" },
          { metric: "Cities with active marketplace", current: "1", target: "5+", progress: 20, status: "not-started" },
          { metric: "National inquiry velocity", current: "127/day", target: "500+/day", progress: 25, status: "not-started" },
          { metric: "Absorption rate (national avg)", current: "6.2%", target: "8%+", progress: 78, status: "not-started" },
        ],
      },
      {
        category: "Revenue Velocity", icon: <DollarSign className="h-4 w-4" />,
        items: [
          { metric: "Annual recurring revenue", current: "$35K", target: "$1M+", progress: 4, status: "not-started" },
          { metric: "Monthly revenue growth", current: "22%", target: "15%+ sustained", progress: 100, status: "achieved" },
          { metric: "Revenue streams active", current: "3", target: "5+", progress: 60, status: "not-started" },
          { metric: "Gross margin", current: "72%", target: "75%+", progress: 96, status: "not-started" },
        ],
      },
      {
        category: "Brand & Defensibility", icon: <Shield className="h-4 w-4" />,
        items: [
          { metric: "Proprietary data points", current: "2.4M", target: "15M+", progress: 16, status: "not-started" },
          { metric: "AI prediction accuracy", current: "84%", target: "90%+", progress: 93, status: "not-started" },
          { metric: "Brand-driven organic traffic", current: "68%", target: "60%+", progress: 100, status: "achieved" },
          { metric: "Institutional inquiries received", current: "0", target: "5+", progress: 0, status: "not-started" },
        ],
      },
    ],
    capitalAllocation: [
      { area: "National Expansion (7 new cities)", pct: 40, rationale: "Rp 400M × 7 cities — rapid national footprint with proven playbook" },
      { area: "Product & Intelligence", pct: 25, rationale: "Institutional analytics suite, API platform, advanced AI models" },
      { area: "Growth & Brand", pct: 20, rationale: "National brand campaigns, PR positioning, investor community building" },
      { area: "Team Scaling", pct: 15, rationale: "VP Engineering, Head of Data, regional city managers, sales team" },
    ],
    investorPositioning: [
      "Category leader in Indonesian property intelligence — 5 cities, $1M+ ARR, 90%+ AI accuracy",
      "Network effects accelerating: each new city adds data that improves all cities — compounding moat",
      "Clear path to $10M ARR in 18 months via proven city-launch economics (Rp 400M in, break-even month 9)",
      "Platform transitioning from marketplace to infrastructure — institutional products unlock 3-5x multiple expansion",
    ],
    unlockThresholds: [
      "$1M+ ARR with 75%+ gross margins",
      "5+ cities live with national inquiry velocity >500/day",
      "15M+ proprietary data points with 90%+ prediction accuracy",
      "Institutional product revenue contributing >10% of mix",
    ],
  },
  {
    id: "growth",
    title: "Growth / Series B",
    raise: "$10M — $25M",
    valuation: "$80M — $200M Pre-Money",
    timeline: "Months 24-36",
    icon: <Rocket className="h-5 w-5" />,
    narrative: "We are the default intelligence infrastructure for property investment in Indonesia, expanding to Southeast Asia. $10M ARR, 14 cities, and the only platform where AI accuracy compounds with every transaction. This round funds international expansion and the data API platform that makes us indispensable to institutional capital.",
    milestones: [
      {
        category: "Liquidity Density", icon: <Layers className="h-4 w-4" />,
        items: [
          { metric: "Total active listings", current: "420", target: "25,000+", progress: 2, status: "not-started" },
          { metric: "Cities with active marketplace", current: "1", target: "14+ (3 countries)", progress: 7, status: "not-started" },
          { metric: "Monthly transactions facilitated", current: "12", target: "500+", progress: 2, status: "not-started" },
          { metric: "National market share (listings)", current: "<1%", target: "15%+", progress: 1, status: "not-started" },
        ],
      },
      {
        category: "Revenue Velocity", icon: <DollarSign className="h-4 w-4" />,
        items: [
          { metric: "Annual recurring revenue", current: "$35K", target: "$10M+", progress: 0, status: "not-started" },
          { metric: "Data API revenue", current: "$0", target: "$1M+ ARR", progress: 0, status: "not-started" },
          { metric: "Revenue per city efficiency", current: "Rp 45M", target: "Rp 150M+/city/month", progress: 30, status: "not-started" },
          { metric: "Net revenue retention", current: "—", target: "130%+", progress: 0, status: "not-started" },
        ],
      },
      {
        category: "Dominance Signals", icon: <Shield className="h-4 w-4" />,
        items: [
          { metric: "Proprietary data points", current: "2.4M", target: "100M+", progress: 2, status: "not-started" },
          { metric: "Institutional clients", current: "0", target: "20+", progress: 0, status: "not-started" },
          { metric: "International markets active", current: "0", target: "2+", progress: 0, status: "not-started" },
          { metric: "Competitor market share erosion", current: "—", target: "3+ competitors losing share", progress: 0, status: "not-started" },
        ],
      },
    ],
    capitalAllocation: [
      { area: "International Expansion", pct: 35, rationale: "Vietnam + Thailand market entry — localization, licensing, supply activation" },
      { area: "Data Platform & API", pct: 25, rationale: "Enterprise-grade API, institutional analytics suite, data licensing infrastructure" },
      { area: "National Deepening", pct: 20, rationale: "Increase penetration in top 5 Indonesian cities — district-level dominance" },
      { area: "Team & Infrastructure", pct: 20, rationale: "International leadership, compliance teams, enterprise sales, data centers" },
    ],
    investorPositioning: [
      "Category-defining platform: 14 cities, $10M ARR, 130% NRR — this is infrastructure, not a marketplace",
      "Data moat is now unassailable: 100M+ proprietary data points, 93%+ prediction accuracy, 20+ institutional clients",
      "International expansion de-risked by proven playbook — same model, new geographies, compounding data advantage",
      "Clear path to $100M ARR and IPO readiness within 24-36 months — last private round before public markets",
    ],
    unlockThresholds: [
      "$10M+ ARR with 130%+ net revenue retention",
      "14+ cities across 3+ countries",
      "20+ institutional clients with data API revenue >$1M ARR",
      "National market share >15% in Indonesia",
    ],
  },
];

/* ───────── component ───────── */

const FundraisingMilestoneRoadmap: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>("seed");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => copy(text, id)}>
      {copiedId === id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Fundraising Milestone Roadmap"
        description="Structured funding-stage milestones — Seed through Series B with KPI thresholds, capital allocation & investor positioning per round"
        icon={Rocket}
        badge={{ text: "🚀 Fundraising", variant: "outline" }}
      />

      {/* Stage Timeline Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((s, i) => {
          const isActive = s.id === "seed";
          return (
            <Card
              key={s.id}
              className={cn("cursor-pointer transition-all border-border", isActive ? "ring-1 ring-primary/40 shadow-sm" : "hover:shadow-sm")}
              onClick={() => setExpanded(s.id)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {s.icon}
                  <span className="text-xs font-semibold text-foreground">{s.title}</span>
                </div>
                <p className="text-lg font-bold text-primary">{s.raise}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{s.valuation}</span>
                  <Badge variant="outline" className="text-[9px]"><Clock className="h-2.5 w-2.5 mr-0.5" />{s.timeline}</Badge>
                </div>
                {i < stages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground mx-auto mt-1 hidden md:block" />}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stage Detail Cards */}
      {stages.map(stage => (
        <Card key={stage.id} className="border-border overflow-hidden">
          <CardHeader className="cursor-pointer select-none" onClick={() => setExpanded(prev => prev === stage.id ? null : stage.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[6px] bg-primary/10 flex items-center justify-center">{stage.icon}</div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    {stage.title}
                    <Badge variant="outline" className="text-[10px]">{stage.raise}</Badge>
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stage.valuation} · {stage.timeline}</p>
                </div>
              </div>
              {expanded === stage.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardHeader>

          {expanded === stage.id && (
            <CardContent className="pt-0 space-y-4">
              {/* Narrative */}
              <div className="bg-muted/30 rounded-[6px] p-3 group">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Investor Narrative</p>
                <p className="text-sm text-foreground leading-relaxed">{stage.narrative}</p>
                <div className="flex justify-end mt-1">
                  <CopyBtn text={stage.narrative} id={`${stage.id}-narrative`} />
                </div>
              </div>

              <Tabs defaultValue="milestones" className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="milestones" className="text-[11px]">Milestones</TabsTrigger>
                  <TabsTrigger value="capital" className="text-[11px]">Capital Plan</TabsTrigger>
                  <TabsTrigger value="positioning" className="text-[11px]">Positioning</TabsTrigger>
                  <TabsTrigger value="unlock" className="text-[11px]">Unlock Gates</TabsTrigger>
                </TabsList>

                <TabsContent value="milestones" className="space-y-4 mt-3">
                  {stage.milestones.map((cat, ci) => (
                    <div key={ci} className="space-y-2">
                      <h6 className="text-xs font-semibold text-foreground flex items-center gap-1.5">{cat.icon} {cat.category}</h6>
                      {cat.items.map((m, mi) => {
                        const st = statusConfig[m.status];
                        return (
                          <div key={mi} className="flex items-center gap-3 bg-muted/30 rounded-[6px] p-2.5">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-foreground">{m.metric}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">{m.current}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-xs font-bold text-foreground shrink-0">{m.target}</span>
                            <Progress value={m.progress} className="h-1.5 w-14 shrink-0" />
                            <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5 shrink-0", st.color)}>{st.label}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="capital" className="space-y-2 mt-3">
                  {stage.capitalAllocation.map((ca, i) => (
                    <div key={i} className="rounded-[6px] border border-border p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{ca.area}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={ca.pct} className="h-1.5 w-16" />
                          <span className="text-sm font-bold text-primary">{ca.pct}%</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{ca.rationale}</p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="positioning" className="space-y-1.5 mt-3">
                  {stage.investorPositioning.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 bg-muted/30 rounded-[6px] p-2.5 group">
                      <TrendingUp className="h-3.5 w-3.5 text-chart-3 mt-0.5 shrink-0" />
                      <p className="text-xs text-foreground flex-1">{p}</p>
                      <CopyBtn text={p} id={`${stage.id}-pos-${i}`} />
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="unlock" className="space-y-1.5 mt-3">
                  <p className="text-[10px] text-muted-foreground mb-2">All thresholds must be met to unlock the next funding stage:</p>
                  {stage.unlockThresholds.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-[6px] border border-primary/20 bg-primary/5 p-2.5">
                      <Target className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs font-medium text-foreground">{t}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default FundraisingMilestoneRoadmap;
