import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target, TrendingUp, Network, DollarSign, Globe, Shield,
  CheckCircle, ArrowUpRight, Zap, Crown, BarChart3, Users,
  Building, Layers, Rocket, AlertTriangle
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

/* ── valuation milestone data ───────────────────────────── */

const valuationMilestones = [
  { stage: "Pre-Seed", valuation: 5, arr: 0, gmv: 0, status: "done" as const, label: "$5M" },
  { stage: "Seed", valuation: 25, arr: 0.5, gmv: 12, status: "done" as const, label: "$25M" },
  { stage: "Series A", valuation: 100, arr: 5, gmv: 120, status: "current" as const, label: "$100M" },
  { stage: "Series B", valuation: 350, arr: 25, gmv: 600, status: "upcoming" as const, label: "$350M" },
  { stage: "Series C", valuation: 700, arr: 80, gmv: 2400, status: "upcoming" as const, label: "$700M" },
  { stage: "Pre-IPO", valuation: 1000, arr: 150, gmv: 5000, status: "upcoming" as const, label: "$1B" },
];

const arrProjection = Array.from({ length: 20 }, (_, i) => ({
  quarter: `Q${(i % 4) + 1} '${25 + Math.floor(i / 4)}`,
  arr: +(0.3 * Math.pow(1.18, i)).toFixed(1),
  gmv: +(8 * Math.pow(1.22, i)).toFixed(0),
}));

const moatRadar = [
  { axis: "Proprietary Data", value: 88 },
  { axis: "Network Density", value: 72 },
  { axis: "Switching Cost", value: 81 },
  { axis: "Intelligence Accuracy", value: 85 },
  { axis: "Ecosystem Lock-in", value: 67 },
  { axis: "Brand Authority", value: 58 },
];

const revenueStreams = [
  { stream: "Investor Intelligence", current: 2.8, target: 45, pctOfTarget: 6.2 },
  { stream: "Vendor SaaS", current: 1.9, target: 35, pctOfTarget: 5.4 },
  { stream: "Premium Listings", current: 3.4, target: 30, pctOfTarget: 11.3 },
  { stream: "Transaction Commissions", current: 2.1, target: 25, pctOfTarget: 8.4 },
  { stream: "Data Licensing", current: 0.6, target: 15, pctOfTarget: 4.0 },
];

const competitorMap = [
  { name: "PropertyGuru", region: "SEA", model: "Listing Portal", moat: "Brand", threat: "medium" as const },
  { name: "99.co", region: "SG/ID", model: "Search Portal", moat: "UX", threat: "low" as const },
  { name: "Rumah123", region: "Indonesia", model: "Classifieds", moat: "Traffic", threat: "medium" as const },
  { name: "Zillow", region: "US", model: "iBuying + Data", moat: "Zestimate", threat: "low" as const },
  { name: "CoStar", region: "US/EU", model: "Data Terminal", moat: "Institutional Data", threat: "low" as const },
];

const objections = [
  {
    concern: "Indonesia real estate is too fragmented for a platform play",
    response: "Fragmentation is the opportunity — ASTRA's AI standardizes pricing intelligence across 38 provinces where no competitor has unified data coverage.",
    strength: 92,
  },
  {
    concern: "PropertyGuru already dominates SEA listings",
    response: "PropertyGuru is a listing portal. ASTRA is liquidity infrastructure — we accelerate transactions, not just display them. Different TAM, different moat.",
    strength: 88,
  },
  {
    concern: "Real estate transactions are inherently slow to scale",
    response: "Our vendor + financing integration compresses the deal cycle by 40%. Each cycle reduction compounds platform velocity non-linearly.",
    strength: 85,
  },
  {
    concern: "Data moats take years to build",
    response: "Every transaction on ASTRA generates 47 proprietary data signals. At current velocity, we'll have the largest behavioral dataset in Indonesian real estate within 18 months.",
    strength: 90,
  },
  {
    concern: "Unit economics in emerging markets are challenging",
    response: "Our blended LTV/CAC of 52x demonstrates capital efficiency. Vendor SaaS and data licensing are high-margin layers that improve with scale.",
    strength: 87,
  },
];

const slideHeadlines = [
  { slide: 1, headline: "The $340B Opportunity Nobody Can Execute", purpose: "Market size with urgency" },
  { slide: 2, headline: "Why Every Property Portal Will Become Obsolete", purpose: "Disruption thesis" },
  { slide: 3, headline: "Liquidity Infrastructure, Not Another Listing Site", purpose: "Positioning clarity" },
  { slide: 4, headline: "The Flywheel That Compounds While Competitors Sleep", purpose: "Network effects" },
  { slide: 5, headline: "47 Signals Per Transaction — Our Invisible Moat", purpose: "Data defensibility" },
  { slide: 6, headline: "5 Revenue Streams, One Platform Identity", purpose: "Monetization breadth" },
  { slide: 7, headline: "From Rp 11.7B to Rp 150B ARR — The Path", purpose: "Growth trajectory" },
  { slide: 8, headline: "38 Provinces, One Intelligence Layer", purpose: "Indonesia domination" },
  { slide: 9, headline: "Jakarta → Bali → Surabaya → Southeast Asia", purpose: "Expansion roadmap" },
  { slide: 10, headline: "The Team That Ships Faster Than Series-B Startups", purpose: "Execution proof" },
  { slide: 11, headline: "$1B Is Not the Ceiling — It's the Foundation", purpose: "Vision beyond unicorn" },
  { slide: 12, headline: "Join the Intelligence Layer of Real Estate Capital", purpose: "Call to action" },
];

/* ── component ──────────────────────────────────────────── */

const UnicornNarrativePanel: React.FC = () => {
  const [activeStage] = useState(2); // Series A = index 2

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            $1B Valuation Strategic Narrative
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Unicorn positioning framework & investor storytelling engine
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1"><Target className="h-3 w-3" /> Target: $1B</Badge>
          <Badge variant="outline" className="text-xs gap-1"><Rocket className="h-3 w-3" /> Series A Stage</Badge>
        </div>
      </div>

      {/* Valuation ladder */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Valuation Milestone Ladder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {valuationMilestones.map((m, i) => {
              const h = (m.valuation / 1000) * 100;
              return (
                <div key={m.stage} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold tabular-nums">{m.label}</span>
                  <div
                    className={`w-full rounded-t transition-all ${
                      m.status === "done"
                        ? "bg-primary/70"
                        : m.status === "current"
                        ? "bg-primary animate-pulse"
                        : "bg-muted-foreground/20"
                    }`}
                    style={{ height: `${Math.max(h, 8)}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground text-center leading-tight">{m.stage}</span>
                  {m.status === "current" && (
                    <Badge className="text-[8px] px-1 py-0">NOW</Badge>
                  )}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Current ARR Target", value: "$5M", sub: "Series A milestone" },
              { label: "GMV Required", value: "$120M", sub: "Annual transaction volume" },
              { label: "Valuation Multiple", value: "20x ARR", sub: "SaaS infrastructure comp" },
            ].map((k) => (
              <div key={k.label} className="rounded-md bg-muted/50 px-3 py-2 text-center">
                <p className="text-lg font-bold tabular-nums">{k.value}</p>
                <p className="text-[10px] text-muted-foreground">{k.label}</p>
                <p className="text-[9px] text-muted-foreground/70">{k.sub}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="narrative" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="narrative" className="text-xs">Story Pillars</TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs">Growth Metrics</TabsTrigger>
          <TabsTrigger value="moat" className="text-xs">Data Moat</TabsTrigger>
          <TabsTrigger value="objections" className="text-xs">Objection Defense</TabsTrigger>
          <TabsTrigger value="slides" className="text-xs">Slide Headlines</TabsTrigger>
        </TabsList>

        {/* ── Story Pillars ─────────────────────────── */}
        <TabsContent value="narrative" className="space-y-4">
          {[
            {
              icon: Target, title: "Market Transformation Thesis",
              tagline: "\"We don't list properties — we create liquidity.\"",
              points: [
                "Traditional portals are static billboards; ASTRA is a transaction acceleration engine",
                "Average deal cycle compressed from 127 days to 74 days through AI orchestration",
                "Pricing transparency eliminates information asymmetry that costs investors 8-15% per deal",
                "Vendor integration removes 60% of coordination friction in post-purchase workflows",
              ],
            },
            {
              icon: BarChart3, title: "Platform Scale Metrics",
              tagline: "\"Growth that compounds, not just grows.\"",
              points: [
                "Monthly active investors growing 23% MoM with 67% D30 retention",
                "Verified listing volume doubling every 4.2 months across 12 cities",
                "GMV tracking at Rp 85B/month with accelerating transaction velocity",
                "Vendor ecosystem at 340+ verified providers with 91% satisfaction rate",
              ],
            },
            {
              icon: Network, title: "Network Effect & Data Moat",
              tagline: "\"Every transaction makes the next one smarter.\"",
              points: [
                "Behavioral demand intelligence: 47 proprietary signals per user interaction",
                "Predictive pricing accuracy at 94.2% — 3x better than manual appraisals",
                "Cross-city capital flow mapping that no competitor can replicate",
                "Self-reinforcing flywheel: data → intelligence → deals → more data",
              ],
            },
            {
              icon: DollarSign, title: "Multi-Stream Revenue Model",
              tagline: "\"Five engines, one platform.\"",
              points: [
                "Investor Intelligence Terminal: Bloomberg-grade analytics for property capital",
                "Vendor SaaS: workflow automation that makes switching irrational",
                "Premium Positioning: demand-priced visibility slots with proven ROI",
                "Transaction Commission: 1.2-2.5% on deal value with embedded financing",
                "Data Licensing: institutional-grade market intelligence API",
              ],
            },
            {
              icon: Globe, title: "Regional Expansion Vision",
              tagline: "\"Indonesia first. Southeast Asia inevitable.\"",
              points: [
                "City-by-city domination playbook with proven unit economics per launch",
                "Replicable launch kit: 90-day ignition from zero to liquidity positive",
                "Cross-border capital gateway connecting SEA investors to regional opportunities",
                "Long-term positioning as Asia-Pacific real estate intelligence infrastructure",
              ],
            },
          ].map((pillar) => (
            <Card key={pillar.title} className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5 mt-0.5">
                    <pillar.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{pillar.title}</h3>
                    <p className="text-xs text-primary/80 italic mt-0.5">{pillar.tagline}</p>
                    <ul className="mt-3 space-y-1.5">
                      {pillar.points.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowUpRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Growth Metrics ────────────────────────── */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">ARR Trajectory to $150M</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={arrProjection}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 9 }} interval={3} />
                    <YAxis tick={{ fontSize: 10 }} unit="M" />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="arr" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/.15)" name="ARR ($M)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Revenue Stream Progress to $1B Target</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {revenueStreams.map((r) => (
                  <div key={r.stream} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{r.stream}</span>
                      <span className="text-muted-foreground tabular-nums">
                        ${r.current}M / ${r.target}M target
                      </span>
                    </div>
                    <Progress value={r.pctOfTarget} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">GMV Growth Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={arrProjection}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 9 }} interval={3} />
                  <YAxis tick={{ fontSize: 10 }} unit="M" />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="gmv" fill="hsl(var(--chart-2))" name="GMV ($M)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Data Moat ─────────────────────────────── */}
        <TabsContent value="moat" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Moat Strength Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={moatRadar} outerRadius="75%">
                    <PolarGrid className="stroke-border/40" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Moat Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/.2)" />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Competitive Landscape</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {competitorMap.map((c) => (
                  <div key={c.name} className="flex items-center gap-3 rounded-md border border-border/40 bg-muted/20 px-3 py-2">
                    <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{c.name}</span>
                        <Badge variant="outline" className="text-[9px]">{c.region}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{c.model} — Moat: {c.moat}</p>
                    </div>
                    <Badge
                      variant={c.threat === "medium" ? "secondary" : "outline"}
                      className="text-[9px]"
                    >
                      {c.threat} threat
                    </Badge>
                  </div>
                ))}
                <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 mt-2">
                  <p className="text-xs font-medium text-primary">ASTRA's Differentiation</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    No competitor combines AI liquidity intelligence + vendor ecosystem + investor terminal
                    in a single platform for emerging markets. This creates a category of one.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flywheel */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Network Effect Flywheel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "More Listings", "→", "More Investors", "→", "More Data", "→",
                  "Smarter Pricing", "→", "Faster Deals", "→", "More Inventory", "→", "Platform Dominance"
                ].map((step, i) => (
                  step === "→" ? (
                    <Zap key={i} className="h-4 w-4 text-primary self-center" />
                  ) : (
                    <div key={i} className="rounded-md bg-muted/60 border border-border/40 px-3 py-2">
                      <span className="text-xs font-medium">{step}</span>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Objection Defense ─────────────────────── */}
        <TabsContent value="objections" className="space-y-3">
          {objections.map((o, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-destructive/10 p-2 mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-destructive/80">"{o.concern}"</p>
                    <div className="mt-2 flex items-start gap-2">
                      <Shield className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">{o.response}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">Response Strength</span>
                      <Progress value={o.strength} className="h-1 flex-1 max-w-32" />
                      <span className="text-[10px] font-semibold tabular-nums">{o.strength}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Slide Headlines ──────────────────────── */}
        <TabsContent value="slides" className="space-y-2">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">12-Slide Pitch Deck Headlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {slideHeadlines.map((s) => (
                <div key={s.slide} className="flex items-center gap-3 rounded-md border border-border/40 bg-muted/20 px-3 py-2.5">
                  <div className="rounded bg-primary/10 w-7 h-7 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary tabular-nums">{s.slide}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{s.headline}</p>
                    <p className="text-[10px] text-muted-foreground">{s.purpose}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] shrink-0">Slide {s.slide}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnicornNarrativePanel;
