import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity, Globe, FileText, Megaphone, ShieldCheck, TrendingUp,
  BarChart3, Users, Zap, CheckCircle, Calendar, ArrowUpRight,
  BookOpen, Mic, Radio, DollarSign, Eye
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar
} from "recharts";

/* ── data ───────────────────────────────────────────────── */

const trustMetrics = [
  { axis: "Methodology Transparency", value: 82 },
  { axis: "Prediction Accuracy", value: 94 },
  { axis: "Data Freshness", value: 91 },
  { axis: "Coverage Breadth", value: 68 },
  { axis: "Citation Frequency", value: 45 },
  { axis: "Institutional Adoption", value: 37 },
];

const authorityTimeline = [
  { month: "M1", citations: 2, partnerships: 0, apiCalls: 0 },
  { month: "M3", citations: 8, partnerships: 1, apiCalls: 120 },
  { month: "M6", citations: 24, partnerships: 3, apiCalls: 1400 },
  { month: "M9", citations: 52, partnerships: 5, apiCalls: 5800 },
  { month: "M12", citations: 110, partnerships: 8, apiCalls: 18000 },
  { month: "M18", citations: 280, partnerships: 14, apiCalls: 62000 },
  { month: "M24", citations: 500, partnerships: 22, apiCalls: 150000 },
];

const dataProducts = [
  {
    name: "Monthly Liquidity Report",
    icon: FileText,
    audience: "Media, Investors, Developers",
    format: "PDF + Interactive Dashboard",
    frequency: "Monthly",
    monetization: "Freemium — summary free, full report $299/mo",
    status: "building" as const,
  },
  {
    name: "City Heatmap Dashboard",
    icon: Globe,
    audience: "Investors, Analysts, Developers",
    format: "Interactive Web + Embeddable Widget",
    frequency: "Real-time",
    monetization: "Free tier (3 cities) / Pro ($149/mo all cities)",
    status: "building" as const,
  },
  {
    name: "Media Insights Summary",
    icon: Megaphone,
    audience: "Journalists, Property Editors",
    format: "Press-ready PDF + Data Visuals",
    frequency: "Bi-weekly",
    monetization: "Free — brand authority play",
    status: "planned" as const,
  },
  {
    name: "Investor Intelligence Brief",
    icon: BarChart3,
    audience: "Institutional Investors, Family Offices",
    format: "Terminal Feed + Email Digest",
    frequency: "Weekly",
    monetization: "$499/mo institutional subscription",
    status: "planned" as const,
  },
  {
    name: "API Data Licensing",
    icon: Zap,
    audience: "Fintechs, Banks, Research Firms",
    format: "RESTful API + Webhook Feeds",
    frequency: "Real-time",
    monetization: "$2,000-10,000/mo tiered licensing",
    status: "planned" as const,
  },
];

const contentRoadmap = [
  { phase: "Foundation (M1-3)", items: ["Publish methodology whitepaper", "Launch free monthly summary report", "Create ASTRA Liquidity Index landing page", "Seed 5 media partnerships"], status: "active" },
  { phase: "Authority (M4-6)", items: ["First conference keynote presentation", "Launch city heatmap public dashboard", "Publish 3 accuracy case studies", "Begin investor newsletter"], status: "upcoming" },
  { phase: "Monetization (M7-12)", items: ["Launch API licensing pilot program", "Premium institutional intelligence brief", "Webinar series with industry leaders", "Partnership with 3 property research firms"], status: "upcoming" },
  { phase: "Dominance (M13-24)", items: ["Index cited in government policy reports", "Annual flagship industry report", "ASTRA Index as benchmark standard", "White-label data partnerships"], status: "future" },
];

const revenuePathways = [
  { pathway: "Institutional Subscriptions", year1: 180, year2: 720, year3: 2400 },
  { pathway: "API Licensing", year1: 96, year2: 480, year3: 1800 },
  { pathway: "Premium Reports", year1: 36, year2: 144, year3: 360 },
  { pathway: "Embedded Analytics", year1: 0, year2: 120, year3: 600 },
  { pathway: "White-label Data", year1: 0, year2: 60, year3: 480 },
];

const credibilityMilestones = [
  { milestone: "Methodology whitepaper published", target: "Month 1", progress: 45, critical: true },
  { milestone: "First media citation of ASTRA Index", target: "Month 2", progress: 20, critical: true },
  { milestone: "3 accuracy case studies validated", target: "Month 4", progress: 10, critical: false },
  { milestone: "Research firm partnership signed", target: "Month 5", progress: 5, critical: true },
  { milestone: "Conference keynote delivered", target: "Month 6", progress: 0, critical: false },
  { milestone: "100+ API licensing calls/day", target: "Month 9", progress: 0, critical: false },
  { milestone: "Index cited in industry report", target: "Month 12", progress: 0, critical: true },
  { milestone: "Government/policy document reference", target: "Month 18", progress: 0, critical: true },
];

/* ── component ──────────────────────────────────────────── */

const LiquidityIndexBrandingPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Property Liquidity Index — Public Branding Strategy
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Transform proprietary analytics into market authority
          </p>
        </div>
        <Badge variant="outline" className="text-xs gap-1 self-start">
          <Eye className="h-3 w-3" /> Brand Authority Building
        </Badge>
      </div>

      {/* Index positioning card */}
      <Card className="border-border/60 bg-primary/5">
        <CardContent className="p-5">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold">ASTRA LIQUIDITY INDEX™</h3>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              The definitive measure of how quickly properties transact in Southeast Asian markets.
              A benchmark for market health, a decision tool for investors, and a transparency
              standard for the industry.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              {[
                { label: "Transaction Speed", icon: TrendingUp },
                { label: "Market Health", icon: Activity },
                { label: "Decision Intelligence", icon: BarChart3 },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-1.5 text-xs text-primary">
                  <p.icon className="h-3.5 w-3.5" />
                  <span className="font-medium">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="products" className="text-xs">Data Products</TabsTrigger>
          <TabsTrigger value="authority" className="text-xs">Authority Strategy</TabsTrigger>
          <TabsTrigger value="trust" className="text-xs">Trust Signals</TabsTrigger>
          <TabsTrigger value="monetization" className="text-xs">Monetization</TabsTrigger>
          <TabsTrigger value="milestones" className="text-xs">Milestones</TabsTrigger>
        </TabsList>

        {/* ── Data Products ────────────────────────── */}
        <TabsContent value="products" className="space-y-3">
          {dataProducts.map((p) => (
            <Card key={p.name} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
                    <p.icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{p.name}</h4>
                      <Badge variant={p.status === "building" ? "default" : "secondary"} className="text-[9px] uppercase">
                        {p.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {[
                        { label: "Audience", value: p.audience },
                        { label: "Format", value: p.format },
                        { label: "Frequency", value: p.frequency },
                        { label: "Revenue Model", value: p.monetization },
                      ].map((f) => (
                        <div key={f.label}>
                          <span className="text-[10px] text-muted-foreground">{f.label}</span>
                          <p className="text-xs">{f.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Authority Strategy ────────────────────── */}
        <TabsContent value="authority" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Authority Growth Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={authorityTimeline}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="citations" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/.15)" name="Media Citations" />
                  <Area type="monotone" dataKey="partnerships" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/.12)" name="Partnerships" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {contentRoadmap.map((phase) => (
              <Card key={phase.phase} className="border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">{phase.phase}</h4>
                    <Badge variant={phase.status === "active" ? "default" : "secondary"} className="text-[9px] uppercase">
                      {phase.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {phase.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <ArrowUpRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Distribution channels */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Content Distribution Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: BookOpen, channel: "Blog & Whitepaper", freq: "Weekly" },
                  { icon: Megaphone, channel: "Press & Media", freq: "Bi-weekly" },
                  { icon: Mic, channel: "Conferences & Webinars", freq: "Monthly" },
                  { icon: Radio, channel: "Newsletter & Social", freq: "2x/week" },
                ].map((c) => (
                  <div key={c.channel} className="rounded-md bg-muted/50 px-3 py-2.5 text-center">
                    <c.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-xs font-medium">{c.channel}</p>
                    <p className="text-[10px] text-muted-foreground">{c.freq}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Trust Signals ─────────────────────────── */}
        <TabsContent value="trust" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Trust & Credibility Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={trustMetrics} outerRadius="75%">
                    <PolarGrid className="stroke-border/40" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Trust Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/.2)" />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Trust Building Framework</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    title: "Transparent Methodology",
                    description: "Publish scoring formula, data sources, and weighting rationale. Open peer review invitations.",
                    strength: 82,
                  },
                  {
                    title: "Historical Accuracy Validation",
                    description: "Backtest index against 3 years of transaction data. Publish accuracy rate with confidence intervals.",
                    strength: 94,
                  },
                  {
                    title: "Predictive Performance Metrics",
                    description: "Track prediction-to-outcome variance monthly. Public dashboard showing rolling 90-day accuracy.",
                    strength: 91,
                  },
                  {
                    title: "Third-Party Verification",
                    description: "Engage independent property research firm to audit methodology and validate data integrity.",
                    strength: 45,
                  },
                ].map((t) => (
                  <div key={t.title} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{t.title}</span>
                      <span className="text-[10px] tabular-nums font-semibold">{t.strength}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{t.description}</p>
                    <Progress value={t.strength} className="h-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Monetization ──────────────────────────── */}
        <TabsContent value="monetization" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Revenue Pathway Projections ($K/year)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenuePathways}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="pathway" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} unit="K" />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="year1" fill="hsl(var(--chart-2))" name="Year 1" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="year2" fill="hsl(var(--primary))" name="Year 2" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="year3" fill="hsl(var(--chart-4))" name="Year 3" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Year 1 Data Revenue", value: "$312K", sub: "Foundation phase" },
              { label: "Year 2 Data Revenue", value: "$1.52M", sub: "Scaling phase" },
              { label: "Year 3 Data Revenue", value: "$5.64M", sub: "Dominance phase" },
            ].map((k) => (
              <Card key={k.label} className="border-border/60">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold tabular-nums">{k.value}</p>
                  <p className="text-[10px] text-muted-foreground">{k.label}</p>
                  <p className="text-[9px] text-muted-foreground/70">{k.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Milestones ────────────────────────────── */}
        <TabsContent value="milestones" className="space-y-2">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Credibility Milestone Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {credibilityMilestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3 rounded-md border border-border/40 bg-muted/20 px-3 py-2.5">
                  {m.progress >= 100 ? (
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium">{m.milestone}</p>
                      {m.critical && <Badge variant="outline" className="text-[8px] px-1">Critical</Badge>}
                    </div>
                    <Progress value={m.progress} className="h-1 mt-1" />
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-muted-foreground">{m.target}</span>
                    <p className="text-[10px] tabular-nums font-medium">{m.progress}%</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiquidityIndexBrandingPanel;
