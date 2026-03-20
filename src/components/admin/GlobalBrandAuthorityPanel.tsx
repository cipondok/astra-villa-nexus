import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award, Globe, Megaphone, Shield, TrendingUp, Users,
  BookOpen, Mic, Handshake, BarChart3, CheckCircle,
  Calendar, Target, Newspaper, Building2, FileText,
  Star, Eye, Zap, ArrowRight, Clock
} from "lucide-react";

const BRAND_PILLARS = [
  {
    title: "Intelligence Authority",
    icon: BarChart3,
    description: "Position as the definitive source for real estate liquidity data and predictive pricing intelligence across Southeast Asia.",
    metrics: [
      { label: "Liquidity Reports Published", value: "Monthly", status: "active" },
      { label: "City Dashboards Live", value: "12 Cities", status: "target" },
      { label: "Data Points Tracked", value: "2.4M+", status: "active" },
    ],
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
  },
  {
    title: "Transaction Trust",
    icon: Shield,
    description: "Build unshakable credibility through transparent methodology, verified statistics, and documented deal acceleration outcomes.",
    metrics: [
      { label: "Avg Deal Closure Speed", value: "40% Faster", status: "active" },
      { label: "Verified Transactions", value: "Rp 2.1T+ GMV", status: "active" },
      { label: "Accuracy Rate", value: "94.7%", status: "target" },
    ],
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    title: "Ecosystem Leadership",
    icon: Globe,
    description: "Establish category ownership through strategic partnerships, media presence, and industry-shaping thought leadership.",
    metrics: [
      { label: "Developer Partners", value: "85+", status: "target" },
      { label: "Institutional Integrations", value: "12 Banks", status: "target" },
      { label: "Conference Presence", value: "6/year", status: "planned" },
    ],
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  },
];

const CONTENT_ROADMAP = [
  {
    quarter: "Q1 2026",
    phase: "Foundation",
    items: [
      { title: "Monthly Liquidity Index Report", type: "Report", icon: FileText, status: "live" },
      { title: "City Market Intelligence Dashboard", type: "Product", icon: BarChart3, status: "live" },
      { title: "Founder LinkedIn Thought Leadership", type: "Social", icon: Mic, status: "live" },
      { title: "Case Study: 40% Faster Deal Closure", type: "Content", icon: BookOpen, status: "in-progress" },
    ],
  },
  {
    quarter: "Q2 2026",
    phase: "Amplification",
    items: [
      { title: "Developer Association Partnership", type: "Partnership", icon: Handshake, status: "planned" },
      { title: "Investor Education Webinar Series", type: "Event", icon: Users, status: "planned" },
      { title: "Media Feature: Bloomberg Property", type: "PR", icon: Newspaper, status: "planned" },
      { title: "API Intelligence Licensing Pilot", type: "Revenue", icon: Zap, status: "planned" },
    ],
  },
  {
    quarter: "Q3 2026",
    phase: "Dominance",
    items: [
      { title: "Regional Property Summit Sponsor", type: "Event", icon: Award, status: "planned" },
      { title: "Bank Integration Data Feed", type: "Partnership", icon: Building2, status: "planned" },
      { title: "Annual Market Outlook Publication", type: "Report", icon: FileText, status: "planned" },
      { title: "Verified Transaction Transparency Portal", type: "Product", icon: Eye, status: "planned" },
    ],
  },
  {
    quarter: "Q4 2026",
    phase: "Category Ownership",
    items: [
      { title: "ASTRA Liquidity Index™ Trademark", type: "Brand", icon: Star, status: "planned" },
      { title: "Cross-border Investor Intelligence", type: "Product", icon: Globe, status: "planned" },
      { title: "Keynote: PropTech Innovation Summit", type: "Event", icon: Mic, status: "planned" },
      { title: "Government Data Partnership MOU", type: "Partnership", icon: Shield, status: "planned" },
    ],
  },
];

const CREDIBILITY_MILESTONES = [
  { month: "Month 1-3", milestone: "Publish first 3 Liquidity Index reports with transparent methodology", progress: 65, phase: "Trust Seed" },
  { month: "Month 4-6", milestone: "Secure 3 developer association partnerships and first media feature", progress: 30, phase: "Authority Build" },
  { month: "Month 7-9", milestone: "Launch verified transaction statistics portal and API licensing pilot", progress: 10, phase: "Proof Scale" },
  { month: "Month 10-12", milestone: "Achieve category recognition as Indonesia's #1 property intelligence platform", progress: 5, phase: "Category Own" },
];

const MESSAGING_ARCHITECTURE = {
  positioning: "The AI-powered operating system accelerating property liquidity",
  tagline: "Intelligence that moves markets",
  pillars: [
    { anchor: "Speed", message: "Close deals 40% faster with predictive intelligence", audience: "Investors & Agents" },
    { anchor: "Accuracy", message: "94.7% prediction accuracy across 12 Indonesian cities", audience: "Institutional Partners" },
    { anchor: "Transparency", message: "Open methodology, verified data, auditable outcomes", audience: "Regulators & Media" },
    { anchor: "Scale", message: "2.4M+ data points powering Rp 2.1T+ in transactions", audience: "Enterprise & Developers" },
  ],
};

const statusColors: Record<string, string> = {
  live: "bg-emerald-500",
  "in-progress": "bg-amber-500",
  planned: "bg-muted-foreground/30",
  active: "text-emerald-600",
  target: "text-blue-600",
};

const statusLabels: Record<string, string> = {
  live: "Live",
  "in-progress": "In Progress",
  planned: "Planned",
};

export default function GlobalBrandAuthorityPanel() {
  const [activeTab, setActiveTab] = useState("pillars");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Global Brand Authority Strategy</h2>
            <p className="text-sm text-muted-foreground">Market trust, thought leadership & category ownership roadmap</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Active Strategy
        </Badge>
      </div>

      {/* Brand Positioning Statement */}
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Brand Positioning</p>
              <p className="text-lg font-semibold">{MESSAGING_ARCHITECTURE.positioning}</p>
              <p className="text-sm text-muted-foreground italic">"{MESSAGING_ARCHITECTURE.tagline}"</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
                {MESSAGING_ARCHITECTURE.pillars.map((p) => (
                  <div key={p.anchor} className="rounded-lg border p-2.5 space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">{p.anchor}</p>
                    <p className="text-xs leading-snug">{p.message}</p>
                    <p className="text-[10px] text-muted-foreground">{p.audience}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="pillars" className="text-xs">Brand Pillars</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs">Content Roadmap</TabsTrigger>
          <TabsTrigger value="milestones" className="text-xs">Credibility Timeline</TabsTrigger>
          <TabsTrigger value="integration" className="text-xs">Product Integration</TabsTrigger>
        </TabsList>

        {/* Brand Pillars */}
        <TabsContent value="pillars" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {BRAND_PILLARS.map((pillar) => (
              <Card key={pillar.title}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${pillar.color}`}>
                      <pillar.icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-semibold">{pillar.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">{pillar.description}</p>
                  <Separator />
                  <div className="space-y-2">
                    {pillar.metrics.map((m) => (
                      <div key={m.label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className={`font-semibold ${statusColors[m.status] || ""}`}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Content Roadmap */}
        <TabsContent value="roadmap" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONTENT_ROADMAP.map((q) => (
              <Card key={q.quarter}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{q.quarter}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">{q.phase}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {q.items.map((item) => (
                    <div key={item.title} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusColors[item.status]}`} />
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.title}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 flex-shrink-0">{item.type}</Badge>
                      <span className="text-[9px] text-muted-foreground flex-shrink-0">{statusLabels[item.status]}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Live</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> In Progress</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground/30" /> Planned</span>
          </div>
        </TabsContent>

        {/* Credibility Milestones */}
        <TabsContent value="milestones" className="space-y-4 mt-4">
          <div className="space-y-3">
            {CREDIBILITY_MILESTONES.map((m, i) => (
              <Card key={m.month}>
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1 w-20 flex-shrink-0">
                    <Badge variant={i === 0 ? "default" : "outline"} className="text-[10px] w-full justify-center">{m.phase}</Badge>
                    <span className="text-[10px] text-muted-foreground">{m.month}</span>
                  </div>
                  {i < CREDIBILITY_MILESTONES.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0 hidden lg:block" />
                  )}
                  <div className="flex-1 space-y-2">
                    <p className="text-xs font-medium">{m.milestone}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={m.progress} className="h-1.5 flex-1" />
                      <span className="text-[10px] font-medium text-muted-foreground w-8 text-right">{m.progress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Product Integration */}
        <TabsContent value="integration" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Liquidity Index Widget",
                description: "Embed real-time liquidity scores on every property listing page, building user familiarity with ASTRA's proprietary scoring methodology.",
                icon: BarChart3,
                status: "Implemented",
              },
              {
                title: "Transparent Methodology Page",
                description: "Public-facing documentation explaining how scores are calculated, building institutional trust and regulatory credibility.",
                icon: BookOpen,
                status: "In Development",
              },
              {
                title: "Deal Velocity Proof Banner",
                description: "Display verified transaction speed statistics (e.g., '40% faster closings') prominently across investor-facing surfaces.",
                icon: TrendingUp,
                status: "Planned",
              },
              {
                title: "Success Story Carousel",
                description: "Rotating case studies of successful deals powered by ASTRA intelligence, featuring real anonymized transaction data.",
                icon: Star,
                status: "Planned",
              },
              {
                title: "Market Intelligence API Portal",
                description: "Self-service API documentation and licensing portal for institutional partners seeking data integration.",
                icon: Globe,
                status: "Planned",
              },
              {
                title: "Investor Trust Dashboard",
                description: "Personalized dashboard showing prediction accuracy history and portfolio performance vs. ASTRA recommendations.",
                icon: Shield,
                status: "In Development",
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-4 pb-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <Badge
                        variant={item.status === "Implemented" ? "default" : "outline"}
                        className="text-[9px] h-4"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
