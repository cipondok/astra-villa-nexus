import React, { useState } from "react";
import {
  ClipboardCheck, Cpu, BarChart3, AlertTriangle, CheckCircle, XCircle,
  AlertCircle, TrendingUp, Shield, Users, DollarSign, Zap, Target,
  Calendar, Activity, Database, Globe, ChevronDown, ChevronUp, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — FOUNDER EXECUTION CONTROL
   ═══════════════════════════════════════════════ */

const dailyActions = [
  { category: "Supply Acquisition", priority: "P0", actions: [
    { task: "Contact 5 new agents/developers via WhatsApp with listing invitation", impact: "HIGH", time: "45 min" },
    { task: "Follow up with 3 pending vendor registrations from yesterday", impact: "HIGH", time: "20 min" },
    { task: "Review and approve queued property submissions for quality", impact: "MEDIUM", time: "30 min" },
  ]},
  { category: "Demand Activation", priority: "P0", actions: [
    { task: "Share 2 featured listings on investor communities/social media", impact: "HIGH", time: "20 min" },
    { task: "Send personalized deal alert to top 10 active investors", impact: "HIGH", time: "30 min" },
    { task: "Review inquiry-to-viewing conversion — follow up on stalled leads", impact: "MEDIUM", time: "25 min" },
  ]},
  { category: "Monetization", priority: "P1", actions: [
    { task: "Identify 3 vendors for premium listing upsell conversation", impact: "HIGH", time: "20 min" },
    { task: "Check subscription renewal pipeline — pre-empt churn risks", impact: "MEDIUM", time: "15 min" },
    { task: "Review boost campaign ROI from last 48 hours", impact: "LOW", time: "10 min" },
  ]},
  { category: "Product & System", priority: "P1", actions: [
    { task: "Check AI scoring accuracy dashboard for drift alerts", impact: "MEDIUM", time: "10 min" },
    { task: "Review edge function error logs for failed automations", impact: "MEDIUM", time: "15 min" },
    { task: "Monitor page load performance and Lighthouse score", impact: "LOW", time: "10 min" },
  ]},
];

const weeklyTargets = [
  { week: "Week 1-2", targets: [
    { metric: "New Listings", target: "+15/week", current: "TBD", status: "tracking" },
    { metric: "Vendor Onboarding", target: "5 new agents", current: "TBD", status: "tracking" },
    { metric: "Daily Inquiries", target: ">10/day", current: "TBD", status: "tracking" },
    { metric: "Revenue", target: "First paid listing or subscription", current: "TBD", status: "at-risk" },
  ]},
  { week: "Week 3-4", targets: [
    { metric: "Active Listings", target: "100+ live", current: "TBD", status: "tracking" },
    { metric: "Inquiry-to-Viewing", target: ">15% conversion", current: "TBD", status: "tracking" },
    { metric: "Vendor Retention", target: ">85% active", current: "TBD", status: "tracking" },
    { metric: "MRR", target: "Rp 2M+", current: "TBD", status: "at-risk" },
  ]},
];

const executionRisks = [
  { risk: "Zero live listings from real agents", severity: "CRITICAL", signal: "All listings are seed/sample data", action: "Pause all feature work. Dedicate 100% of next 72h to agent onboarding calls.", indicator: 95 },
  { risk: "No real inquiry activity", severity: "CRITICAL", signal: "Inquiries only from test accounts or team members", action: "Launch targeted social media campaigns to property investor groups. Set up Google Ads for 'beli properti [city]'.", indicator: 90 },
  { risk: "Vendor disengagement after signup", severity: "HIGH", signal: "Agents register but never list a property", action: "Implement Day-1 and Day-3 onboarding follow-up sequence. Offer white-glove listing upload assistance.", indicator: 75 },
  { risk: "Monetization resistance", severity: "HIGH", signal: "Vendors refuse paid features citing no proven ROI", action: "Offer 30-day free premium trial with ROI tracking. Show comparable platform pricing benchmarks.", indicator: 70 },
  { risk: "Traffic quality deterioration", severity: "MEDIUM", signal: "High bounce rate (>70%), low session duration (<30s)", action: "Audit landing pages. Ensure property cards show price, location, and photos above fold.", indicator: 55 },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — TECHNICAL AUDIT
   ═══════════════════════════════════════════════ */

type AuditStatus = "operational" | "partial" | "missing";
const statusIcon = (s: AuditStatus) => s === "operational" ? <CheckCircle className="h-3.5 w-3.5 text-chart-2" /> : s === "partial" ? <AlertCircle className="h-3.5 w-3.5 text-chart-4" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />;
const statusLabel = (s: AuditStatus) => s === "operational" ? "Operational" : s === "partial" ? "Partial" : "Missing";

const techAudit = [
  { domain: "Database Schema", items: [
    { name: "Core tables (properties, profiles, user_roles)", status: "operational" as AuditStatus, note: "450+ tables. Schema is comprehensive." },
    { name: "RLS policies on all public tables", status: "partial" as AuditStatus, note: "Most tables have RLS. Audit needed for newer tables added in strategy modules." },
    { name: "Real property data (not seed/sample)", status: "missing" as AuditStatus, note: "CRITICAL: Platform runs on sample data. Real agent listings required for launch." },
    { name: "Database indexes for high-query tables", status: "operational" as AuditStatus, note: "Composite indexes on spatial, AI, and search columns implemented." },
  ]},
  { domain: "Edge Functions & APIs", items: [
    { name: "Email queue processor", status: "operational" as AuditStatus, note: "Running every 60s. Healthy — 0 failures in recent logs." },
    { name: "AI job worker pipeline", status: "operational" as AuditStatus, note: "Processes up to 10 tasks/cycle. Watchdog resets stalled jobs." },
    { name: "Deal orchestration service", status: "operational" as AuditStatus, note: "7-stage state machine with commission calculation." },
    { name: "Payment gateway integration (Midtrans)", status: "missing" as AuditStatus, note: "CRITICAL: No payment processing. Cannot collect revenue without this." },
    { name: "SMTP email delivery", status: "missing" as AuditStatus, note: "Email queue runs but no SMTP configured. Transactional emails won't send." },
  ]},
  { domain: "AI & Scoring Engines", items: [
    { name: "Opportunity scoring (6-weight model)", status: "operational" as AuditStatus, note: "ROI 30%, Heat 20%, Undervalue 20%, Velocity 15%, Yield 10%, Luxury 5%." },
    { name: "Liquidity scoring engine", status: "operational" as AuditStatus, note: "8-variable model with inactivity decay. Client-side deterministic." },
    { name: "Price prediction (AI FMV)", status: "operational" as AuditStatus, note: "Edge function using Gemini Flash. Self-learning via outcome comparison." },
    { name: "Model accuracy validation", status: "partial" as AuditStatus, note: "MAE/R² tracking exists but insufficient real transaction data to validate." },
  ]},
  { domain: "Frontend & UX", items: [
    { name: "Role-based dashboard routing", status: "operational" as AuditStatus, note: "Agent, Owner, Investor, Vendor dashboards with ProtectedRoute gating." },
    { name: "Property search and discovery", status: "operational" as AuditStatus, note: "Multi-filter search with map integration. Mapbox GL rendering." },
    { name: "Mobile responsiveness", status: "partial" as AuditStatus, note: "Core pages responsive. Some admin modules need viewport optimization." },
    { name: "Core Web Vitals (LCP <2.5s)", status: "partial" as AuditStatus, note: "Heavy bundle from 3D/map libraries. Lazy loading implemented but needs audit." },
  ]},
  { domain: "Security & Auth", items: [
    { name: "Authentication (Supabase Auth)", status: "operational" as AuditStatus, note: "30m timeout, fingerprinting, leaked password protection." },
    { name: "RBAC with user_roles table", status: "operational" as AuditStatus, note: "12-role hierarchy with has_permission() function." },
    { name: "API key encryption (Vault)", status: "operational" as AuditStatus, note: "pgp_sym_encrypt via Supabase Vault. enc: prefix standard." },
    { name: "Rate limiting on public endpoints", status: "missing" as AuditStatus, note: "No rate limiting on public API routes. Abuse risk for scraping." },
  ]},
];

const launchReadinessItems = techAudit.flatMap(d => d.items);
const operationalCount = launchReadinessItems.filter(i => i.status === "operational").length;
const partialCount = launchReadinessItems.filter(i => i.status === "partial").length;
const missingCount = launchReadinessItems.filter(i => i.status === "missing").length;
const techScore = Math.round((operationalCount * 100 + partialCount * 50) / launchReadinessItems.length);

/* ═══════════════════════════════════════════════
   SECTION 3 — INVESTOR DUE-DILIGENCE
   ═══════════════════════════════════════════════ */

const ddCategories = [
  {
    category: "Marketplace Traction",
    score: 35,
    findings: [
      { item: "Live listing volume", status: "weak" as const, detail: "Platform has extensive schema but relies on sample data. Real agent-sourced inventory is the #1 gap." },
      { item: "Inquiry conversion funnel", status: "not-proven" as const, detail: "Conversion tracking is built but no real user flow data exists to validate funnel assumptions." },
      { item: "Vendor ecosystem", status: "weak" as const, detail: "Onboarding flows exist. Zero confirmed recurring vendor relationships from market." },
      { item: "Repeat engagement signals", status: "not-proven" as const, detail: "Behavioral tracking implemented (14 event types) but no real cohort data to demonstrate retention." },
    ],
  },
  {
    category: "Revenue Model",
    score: 30,
    findings: [
      { item: "Monetization diversity", status: "strong" as const, detail: "5-layer revenue architecture designed: transactions, vendor subs, investor SaaS, data APIs, capital markets." },
      { item: "Pricing validation", status: "not-proven" as const, detail: "Tiered pricing defined (Rp 299K-50M) but no real willingness-to-pay validation from market." },
      { item: "Payment infrastructure", status: "weak" as const, detail: "No payment gateway integrated. Cannot actually collect revenue." },
      { item: "Unit economics clarity", status: "not-proven" as const, detail: "CAC/LTV models built conceptually but no real acquisition cost data to validate." },
    ],
  },
  {
    category: "Competitive Defensibility",
    score: 65,
    findings: [
      { item: "Technical moat depth", status: "strong" as const, detail: "450+ tables, 30+ AI engines, comprehensive scoring models. Significant replication barrier." },
      { item: "Data intelligence advantage", status: "moderate" as const, detail: "Architecture is built for compounding data. Advantage activates only when real transaction data flows." },
      { item: "Network effects", status: "not-proven" as const, detail: "Flywheel architecture designed. Cross-side elasticity unvalidated without real supply/demand interaction." },
      { item: "Brand authority", status: "weak" as const, detail: "No external brand recognition, PR coverage, or industry positioning established yet." },
    ],
  },
  {
    category: "Operational Maturity",
    score: 55,
    findings: [
      { item: "Leadership control systems", status: "strong" as const, detail: "Extensive admin dashboards, KPI tracking, and execution frameworks built. Demonstrates operational thinking." },
      { item: "Growth repeatability", status: "moderate" as const, detail: "City launch playbook documented. Not yet tested in a single real market." },
      { item: "Technical infrastructure", status: "strong" as const, detail: "Supabase + Edge Functions + React architecture is solid and scalable. Cron scheduling operational." },
      { item: "Team execution capability", status: "not-proven" as const, detail: "Solo founder. Investors will question execution bandwidth for simultaneous product + sales + ops." },
    ],
  },
];

const overallDDScore = Math.round(ddCategories.reduce((s, c) => s + c.score, 0) / ddCategories.length);

const investorConcerns = [
  { concern: "No real traction data — platform is pre-revenue, pre-user", severity: "CRITICAL", response: "Acknowledge stage honestly. Frame as 'infrastructure-first' approach with launch-ready platform. Show 60-day plan to first real transactions." },
  { concern: "Solo founder execution risk", severity: "HIGH", response: "Demonstrate operational leverage through automation (30+ AI engines, cron workers). Show that platform reduces manual workload by 80% vs. traditional marketplace ops." },
  { concern: "Indonesia market risk and regulatory complexity", severity: "MEDIUM", response: "Position as advantage: $300B+ market with no dominant digital intelligence player. Regulatory fragmentation creates barrier for international competitors." },
  { concern: "Overbuilt product before market validation", severity: "HIGH", response: "Reframe: infrastructure investment enables faster iteration once market contact begins. Compare to Stripe building payment infrastructure before mass adoption." },
];

const valuationAngles = [
  { angle: "Intelligence Infrastructure Play", strength: 90, narrative: "Not a listing portal — a real estate operating system with 30+ autonomous AI engines and 450+ data tables. Infrastructure companies command 15-25x ARR multiples." },
  { angle: "Southeast Asia Market Timing", strength: 80, narrative: "$3T real estate market digitizing with no dominant PropTech intelligence player. First-mover advantage in a winner-take-most category." },
  { angle: "Technical Moat Depth", strength: 85, narrative: "2+ year replication gap. Self-learning models that improve with every transaction create compounding competitive advantage." },
  { angle: "5-Layer Revenue Architecture", strength: 75, narrative: "Diversified monetization from Day 1 — not dependent on a single revenue stream. Expanding TAM as ecosystem layers activate." },
];

/* ═══════════════════════════════════════════════
   60-DAY SURVIVAL ROADMAP
   ═══════════════════════════════════════════════ */

const survivalRoadmap = [
  { phase: "Days 1-7: Critical Infrastructure", tasks: ["Configure Midtrans payment gateway", "Set up SMTP for transactional emails", "Onboard first 3 real estate agents via personal outreach", "Upload first 10 real property listings with verified data"], gate: "≥10 real listings live + payment working" },
  { phase: "Days 8-14: First Real Users", tasks: ["Launch targeted ads to property investor communities", "Activate WhatsApp-based inquiry flow", "Send first batch of AI deal alerts to registered users", "Implement Day-1 vendor onboarding follow-up sequence"], gate: "≥5 real inquiries + ≥5 active vendors" },
  { phase: "Days 15-30: Conversion Proof", tasks: ["Achieve first real inquiry-to-viewing conversion", "Secure first paid listing boost or vendor subscription", "Collect first investor NPS/feedback", "Document unit economics from first transactions"], gate: "First revenue transaction + validated conversion funnel" },
  { phase: "Days 31-45: Traction Acceleration", tasks: ["Scale to 50+ real listings across 2+ districts", "Achieve consistent >10 inquiries/day", "Onboard 10+ active vendors", "Launch premium tier trial for top vendors"], gate: "Consistent daily traction metrics + MRR >Rp 2M" },
  { phase: "Days 46-60: Fundraise Readiness", tasks: ["Compile 60-day traction report with real metrics", "Build investor data room with validated unit economics", "Create pitch deck with live dashboard screenshots", "Begin warm introductions to target investors"], gate: "Pitch-ready with real data + ≥3 investor meetings scheduled" },
];

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

const RealityExecutionAudit: React.FC = () => {
  const [checkedDaily, setCheckedDaily] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Reality Execution Audit"
        description="Founder execution control, technical architecture audit, investor due-diligence simulation & 60-day survival roadmap"
        icon={ClipboardCheck}
        badge={{ text: "⚡ Reality Check", variant: "outline" }}
      />

      {/* Score strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border"><CardContent className="p-3 text-center">
          <Cpu className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className={cn("text-xl font-bold", techScore >= 70 ? "text-chart-2" : "text-chart-4")}>{techScore}%</p>
          <p className="text-[10px] text-muted-foreground">Tech Readiness</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <BarChart3 className="h-4 w-4 mx-auto mb-1 text-chart-4" />
          <p className={cn("text-xl font-bold", overallDDScore >= 50 ? "text-chart-4" : "text-destructive")}>{overallDDScore}%</p>
          <p className="text-[10px] text-muted-foreground">Investor Readiness</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-destructive">{missingCount}</p>
          <p className="text-[10px] text-muted-foreground">Critical Gaps</p>
        </CardContent></Card>
        <Card className="border-border"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{operationalCount}</p>
          <p className="text-[10px] text-muted-foreground">Systems Operational</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="execution" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="execution" className="text-xs">Daily Execution</TabsTrigger>
          <TabsTrigger value="tech-audit" className="text-xs">Tech Audit</TabsTrigger>
          <TabsTrigger value="due-diligence" className="text-xs">Due Diligence</TabsTrigger>
          <TabsTrigger value="concerns" className="text-xs">Investor View</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs">60-Day Plan</TabsTrigger>
        </TabsList>

        {/* ── SECTION 1: DAILY EXECUTION ── */}
        <TabsContent value="execution" className="mt-4 space-y-4">
          {dailyActions.map((cat, ci) => (
            <Card key={ci} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge variant={cat.priority === "P0" ? "destructive" : "default"} className="text-[9px]">{cat.priority}</Badge>
                  {cat.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {cat.actions.map((a, ai) => {
                  const key = `${ci}-${ai}`;
                  return (
                    <div key={ai} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                      <Checkbox checked={!!checkedDaily[key]} onCheckedChange={() => setCheckedDaily(p => ({ ...p, [key]: !p[key] }))} className="mt-0.5" />
                      <div className="flex-1">
                        <p className={cn("text-xs text-foreground", checkedDaily[key] && "line-through opacity-50")}>{a.task}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={a.impact === "HIGH" ? "default" : "secondary"} className="text-[8px]">{a.impact}</Badge>
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {a.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}

          {/* Execution Risks */}
          <Card className="border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Execution Risk Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {executionRisks.map((r, i) => (
                <div key={i} className={cn("rounded-lg border p-3 space-y-1.5", r.severity === "CRITICAL" ? "border-destructive/30 bg-destructive/5" : "border-border/40")}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">{r.risk}</p>
                    <Badge variant={r.severity === "CRITICAL" ? "destructive" : "default"} className="text-[8px]">{r.severity}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Signal: {r.signal}</p>
                  <p className="text-[10px] text-chart-2">↳ {r.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SECTION 2: TECH AUDIT ── */}
        <TabsContent value="tech-audit" className="mt-4 space-y-4">
          {techAudit.map((domain, di) => (
            <Card key={di} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{domain.domain}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {domain.items.map((item, ii) => (
                  <div key={ii} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    {statusIcon(item.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-foreground">{item.name}</p>
                        <Badge variant={item.status === "operational" ? "default" : item.status === "partial" ? "secondary" : "destructive"} className="text-[8px]">{statusLabel(item.status)}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.note}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── SECTION 3: DUE DILIGENCE ── */}
        <TabsContent value="due-diligence" className="mt-4 space-y-4">
          {ddCategories.map((cat, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{cat.category}</CardTitle>
                  <div className="text-right">
                    <p className={cn("text-lg font-bold", cat.score >= 60 ? "text-chart-2" : cat.score >= 40 ? "text-chart-4" : "text-destructive")}>{cat.score}%</p>
                    <p className="text-[8px] text-muted-foreground">Readiness</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {cat.findings.map((f, j) => (
                  <div key={j} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    {f.status === "strong" ? <CheckCircle className="h-3.5 w-3.5 text-chart-2 shrink-0 mt-0.5" />
                      : f.status === "moderate" ? <AlertCircle className="h-3.5 w-3.5 text-chart-4 shrink-0 mt-0.5" />
                      : f.status === "weak" ? <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                      : <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-foreground">{f.item}</p>
                        <Badge variant={f.status === "strong" ? "default" : f.status === "moderate" ? "secondary" : "destructive"} className="text-[8px] capitalize">{f.status.replace("-", " ")}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{f.detail}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── INVESTOR VIEW ── */}
        <TabsContent value="concerns" className="mt-4 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Top Investor Concerns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {investorConcerns.map((c, i) => (
                <div key={i} className="rounded-lg border border-border/40 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={c.severity === "CRITICAL" ? "destructive" : c.severity === "HIGH" ? "default" : "secondary"} className="text-[8px]">{c.severity}</Badge>
                    <p className="text-xs font-semibold text-foreground">{c.concern}</p>
                  </div>
                  <div className="pl-2 border-l-2 border-chart-2/40">
                    <p className="text-[11px] text-foreground">{c.response}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-chart-2" /> Strongest Valuation Angles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {valuationAngles.map((v, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">{v.angle}</p>
                    <div className="flex items-center gap-1.5">
                      <Progress value={v.strength} className="h-1.5 w-12" />
                      <span className="text-xs font-bold text-chart-2">{v.strength}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{v.narrative}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 60-DAY ROADMAP ── */}
        <TabsContent value="roadmap" className="mt-4 space-y-3">
          {survivalRoadmap.map((phase, i) => (
            <Card key={i} className={cn("border-border", i === 0 && "border-primary/30 bg-primary/5")}>
              <CardContent className="p-4 space-y-3">
                <h4 className={cn("text-sm font-bold", i === 0 ? "text-primary" : "text-foreground")}>{phase.phase}</h4>
                <div className="space-y-1.5">
                  {phase.tasks.map((t, j) => (
                    <div key={j} className="flex items-start gap-2 text-[11px] text-foreground">
                      <span className="text-primary mt-0.5">→</span> {t}
                    </div>
                  ))}
                </div>
                <div className="p-2 rounded-lg bg-chart-2/5 border border-chart-2/20">
                  <p className="text-[10px] font-semibold text-chart-2">GATE: {phase.gate}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealityExecutionAudit;
