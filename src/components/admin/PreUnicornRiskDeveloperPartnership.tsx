import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Zap, Shield, Building2, CheckCircle, AlertTriangle, Copy, Eye,
  Target, TrendingUp, BarChart3, Globe, Lock, Landmark
} from "lucide-react";
import { toast } from "sonner";

const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };
const fade = { hidden: { opacity: 0, y: 12 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

/* ── SECTION 1: Pre-Unicorn Operating System ─────────────────────────── */
const osPhases = [
  {
    phase: "Phase 1 — Performance Governance Rhythm",
    period: "Ongoing Quarterly",
    color: "text-amber-400",
    tactics: [
      { t: "Quarterly Growth Milestone Tracking", d: "Define 4 annual milestones (revenue, deals, cities, agents). Board-grade reporting with variance analysis and root-cause drill-down." },
      { t: "Expansion Playbook Adherence Reviews", d: "Score each city launch against standardized 90-day playbook. Track time-to-first-deal, supply density at launch, and demand activation speed." },
      { t: "Monetization Depth Audits", d: "Quarterly review of subscription penetration, premium conversion, and data product adoption per city. Flag cities below 15% premium adoption." },
      { t: "Executive OKR Alignment", d: "Cascade company-level OKRs to regional leads. Weekly check-ins on 3 key results per leader. Monthly cross-functional alignment sessions." },
    ],
    kpis: ["Revenue variance < 10% from forecast", "Playbook adherence > 85%", "Premium adoption > 20% per city"],
  },
  {
    phase: "Phase 2 — Cross-Market Coordination Logic",
    period: "Continuous",
    color: "text-emerald-400",
    tactics: [
      { t: "National Liquidity Density Targets", d: "Set minimum thresholds per city: 500+ listings, 50+ active agents, 30+ deals/month. Rebalance resources to underperforming markets." },
      { t: "Synchronized Promotional Cycles", d: "Quarterly 'National Property Week' with unified branding. Monthly city-specific campaigns aligned with central calendar." },
      { t: "Centralized Intelligence Dashboard", d: "Real-time national command center: revenue by city, deal velocity heatmap, supply-demand balance scores, agent productivity rankings." },
      { t: "Cross-City Buyer Routing", d: "AI-powered buyer matching across cities. 'Based on your Jakarta search, explore these Surabaya opportunities.' Target 15%+ cross-city conversion." },
    ],
    kpis: ["All cities above minimum liquidity threshold", "Cross-city deals > 15%", "Dashboard adoption by all regional leads"],
  },
  {
    phase: "Phase 3 — Operational Discipline Reinforcement",
    period: "Continuous",
    color: "text-blue-400",
    tactics: [
      { t: "Workflow Automation Pipeline", d: "Automate: listing onboarding (OCR + AI enrichment), lead routing, viewing scheduling, offer coordination. Target 60%+ automation coverage." },
      { t: "KPI Transparency Culture", d: "Weekly company-wide metrics email. Monthly all-hands with performance deep-dives. Public dashboards accessible to all team members." },
      { t: "Expansion Pacing Discipline", d: "No new city launch without 80%+ liquidity maturity in existing markets. Stage-gate approval process with founder sign-off." },
      { t: "Talent & Org Scaling", d: "Hire regional GMs for each cluster. Build shared services (finance, legal, analytics). Maintain < 15:1 agent-to-support ratio." },
    ],
    kpis: ["Automation coverage > 60%", "Expansion pacing adherence 100%", "Employee productivity growth > 20% YoY"],
  },
];

/* ── SECTION 2: Global Expansion Risk Governance ─────────────────────── */
const riskFrameworks = [
  {
    framework: "Liquidity Fragmentation Prevention",
    icon: Globe,
    color: "text-emerald-400",
    tactics: [
      { t: "Sequential Market Entry Protocol", d: "Maximum 3 new city launches per quarter. Each must pass liquidity readiness assessment (demand signals, supply availability, competitive landscape)." },
      { t: "Anchor Supply Requirement", d: "Minimum 200 listings secured before public launch. Partner with 2+ established agencies per city. No launch without confirmed inventory pipeline." },
      { t: "Demand Signal Validation", d: "Run 30-day pre-launch demand test: targeted ads, landing page, inquiry collection. Minimum 500 unique visitors and 50 inquiries before full activation." },
      { t: "Market Exit Decision Framework", d: "If a city fails to reach 20 deals in first 6 months: pause marketing, reduce team, maintain minimal presence. Re-evaluate quarterly." },
    ],
  },
  {
    framework: "Financial Exposure Control",
    icon: Lock,
    color: "text-amber-400",
    tactics: [
      { t: "City-Level P&L Tracking", d: "Each city operates as a profit center. Track revenue, CAC, operating costs, and contribution margin monthly. Target positive contribution by month 9." },
      { t: "Capital Allocation Guardrails", d: "Maximum 20% of total capital allocated to expansion. 60% to proven markets, 20% to growth markets. Maintain 18+ months runway at all times." },
      { t: "Growth-Profitability Balance", d: "Monitor 'Rule of 40' score (revenue growth % + operating margin %). Target > 40%. If below 30% for 2 consecutive quarters, reduce expansion pace." },
      { t: "Currency & Regulatory Risk Buffer", d: "For international expansion: hedge currency exposure, maintain 6-month regulatory compliance buffer, partner with local legal advisors." },
    ],
  },
  {
    framework: "Market Volatility Monitoring",
    icon: BarChart3,
    color: "text-blue-400",
    tactics: [
      { t: "Demand Slowdown Detection", d: "Alert when inquiry velocity drops > 20% WoW in any city. Trigger diagnostic: seasonal effect, competitive action, or structural decline?" },
      { t: "Competitive Disruption Radar", d: "Monthly competitive intelligence scan. Track new entrants, pricing changes, feature launches. Escalate threats scoring > 7/10 impact." },
      { t: "Regulatory Change Monitoring", d: "Subscribe to regulatory updates in all active markets. Maintain relationships with industry associations. 30-day adaptation SLA for new regulations." },
      { t: "Contingency Liquidity Campaigns", d: "Pre-built campaign templates for demand shocks: flash promotions, agent incentive boosts, buyer urgency messaging. Deploy within 48 hours of trigger." },
    ],
  },
];

/* ── SECTION 3: Mega-Developer Partnership Engine ────────────────────── */
const devPillars = [
  {
    pillar: "Portfolio Integration Strategy",
    icon: Building2,
    color: "text-amber-400",
    tactics: [
      { t: "Enterprise Developer Onboarding", d: "Dedicated onboarding team for top 50 national developers. Bulk listing upload, brand-customized project pages, dedicated account manager." },
      { t: "Exclusive Launch Visibility", d: "Premium project launch packages: homepage takeover, push notifications to matched buyers, VIP preview events. Rp 100–500M per launch." },
      { t: "Inventory Analytics Dashboard", d: "Developer portal showing real-time demand signals per unit type, price sensitivity analysis, buyer demographic insights, and absorption forecasts." },
      { t: "Pipeline Integration API", d: "Direct API connection to developer CRM/ERP systems. Automatic inventory sync, real-time availability updates, and lead routing." },
    ],
    scripts: {
      id: `MEGA-DEVELOPER PARTNERSHIP PROPOSAL:

"Yth. [Nama Direktur Pengembang],

Astra PropTech mengelola grid likuiditas nasional dengan [X]+ listing aktif di [Y] kota, melayani [Z]+ buyer aktif per bulan.

Kami menawarkan Developer Enterprise Partnership:

🏗️ Dedicated Project Launch Package:
• Homepage takeover & push notifications ke buyer ter-match
• Real-time demand analytics per unit type
• VIP preview event coordination

📊 Inventory Intelligence Dashboard:
• Absorption forecast & price sensitivity analysis
• Buyer demographic insights real-time
• Competitive positioning benchmarks

💰 Performance-Based Pricing:
• Launch package: Rp 100–500M (termasuk guaranteed impressions)
• Success fee: 0.5% per transaksi via platform
• Annual partnership: custom pricing + priority support

Minggu ini kami punya [N] qualified buyers mencari properti di segmen Anda.

Jadwalkan presentasi 30 menit? 📞"`,
      en: `MEGA-DEVELOPER PARTNERSHIP PROPOSAL:

"Dear [Developer Director Name],

Astra PropTech operates a national liquidity grid with [X]+ active listings across [Y] cities, serving [Z]+ active buyers per month.

We offer Developer Enterprise Partnership:

🏗️ Dedicated Project Launch Package:
• Homepage takeover & push notifications to matched buyers
• Real-time demand analytics per unit type
• VIP preview event coordination

📊 Inventory Intelligence Dashboard:
• Absorption forecast & price sensitivity analysis
• Real-time buyer demographic insights
• Competitive positioning benchmarks

💰 Performance-Based Pricing:
• Launch package: Rp 100–500M (includes guaranteed impressions)
• Success fee: 0.5% per transaction via platform
• Annual partnership: custom pricing + priority support

This week we have [N] qualified buyers searching for properties in your segment.

Schedule a 30-minute presentation? 📞"`,
    },
  },
  {
    pillar: "Revenue & Visibility Co-Creation",
    icon: TrendingUp,
    color: "text-emerald-400",
    tactics: [
      { t: "Performance-Based Promotion Packages", d: "Pay-per-lead or pay-per-viewing models alongside fixed launch fees. Developers only pay for verified engagement. Target 3–5x ROI guarantee." },
      { t: "Project Launch Momentum Campaigns", d: "Coordinated 30-day launch blitz: SEO landing pages, social media, influencer partnerships, agent incentive programs. Full-funnel attribution tracking." },
      { t: "Bulk Buyer Discovery Programs", d: "Investor group presentations, corporate housing partnerships, and diaspora buyer outreach for large-scale projects. Minimum 50 qualified leads per campaign." },
      { t: "Seasonal Campaign Calendar", d: "Annual promotional calendar aligned with developer launch cycles. Q1: new year launches, Q2: mid-year promotions, Q3: investment season, Q4: year-end closing." },
    ],
    scripts: {
      id: `DEVELOPER CAMPAIGN PERFORMANCE REPORT:

"📊 Laporan Performa Kampanye — [Nama Proyek]

Periode: [Tanggal Mulai] — [Tanggal Akhir]

📈 Reach & Engagement:
• Total Impressions: [X]
• Unique Visitors: [Y]
• Inquiry Submissions: [Z]
• Viewing Requests: [N]

🎯 Conversion Funnel:
• Visitor → Inquiry: [A]%
• Inquiry → Viewing: [B]%
• Viewing → Offer: [C]%
• Estimated Pipeline Value: Rp [V]

💡 Insights:
• Top buyer segment: [Tipe]
• Peak engagement: [Hari/Jam]
• Most viewed unit type: [Tipe Unit]

📌 Rekomendasi: [Aksi selanjutnya]"`,
      en: `DEVELOPER CAMPAIGN PERFORMANCE REPORT:

"📊 Campaign Performance Report — [Project Name]

Period: [Start Date] — [End Date]

📈 Reach & Engagement:
• Total Impressions: [X]
• Unique Visitors: [Y]
• Inquiry Submissions: [Z]
• Viewing Requests: [N]

🎯 Conversion Funnel:
• Visitor → Inquiry: [A]%
• Inquiry → Viewing: [B]%
• Viewing → Offer: [C]%
• Estimated Pipeline Value: Rp [V]

💡 Insights:
• Top buyer segment: [Type]
• Peak engagement: [Day/Time]
• Most viewed unit type: [Unit Type]

📌 Recommendation: [Next action]"`,
    },
  },
  {
    pillar: "Long-Term Partnership Retention",
    icon: Landmark,
    color: "text-blue-400",
    tactics: [
      { t: "Quarterly Market Intelligence Briefings", d: "Exclusive developer-only reports: demand trends, pricing benchmarks, absorption rates, buyer sentiment analysis per city and segment." },
      { t: "Transaction Velocity Advantage Proof", d: "Published case studies: 'Developer X sold 40 units in 60 days via Astra — 2.5x faster than traditional channels.' Quantified ROI documentation." },
      { t: "Strategic Ecosystem Alignment", d: "Joint annual planning sessions with top 10 developers. Co-develop product roadmap features. Advisory board participation for enterprise partners." },
      { t: "Loyalty & Tier Program", d: "Bronze (1 project) → Silver (3 projects) → Gold (5+ projects) → Platinum (10+). Progressive benefits: lower fees, priority placement, co-marketing budgets." },
    ],
    scripts: {
      id: `DEVELOPER PARTNERSHIP TIER UPGRADE:

"Yth. [Nama Partner],

Selamat! Berdasarkan kolaborasi kita di [N] proyek, Anda memenuhi syarat upgrade ke tier [TIER]:

🔶 Benefit Tier [TIER]:
• Listing fee discount: [X]%
• Priority homepage placement: [Y] hari/bulan
• Dedicated account manager
• Co-marketing budget: Rp [Z]/tahun
• Quarterly exclusive market intelligence briefing
• Early access ke fitur platform baru

📊 Ringkasan Partnership:
• Total listings: [N]
• Total inquiries generated: [M]
• Estimated transaction value influenced: Rp [V]
• Average time-to-first-inquiry: [D] hari

Mari jadwalkan review partnership tahunan? 📞"`,
      en: `DEVELOPER PARTNERSHIP TIER UPGRADE:

"Dear [Partner Name],

Congratulations! Based on our collaboration across [N] projects, you qualify for [TIER] tier upgrade:

🔶 [TIER] Tier Benefits:
• Listing fee discount: [X]%
• Priority homepage placement: [Y] days/month
• Dedicated account manager
• Co-marketing budget: Rp [Z]/year
• Quarterly exclusive market intelligence briefing
• Early access to new platform features

📊 Partnership Summary:
• Total listings: [N]
• Total inquiries generated: [M]
• Estimated transaction value influenced: Rp [V]
• Average time-to-first-inquiry: [D] days

Let's schedule an annual partnership review? 📞"`,
    },
  },
];

/* ── SECTION 4: Annual Checklist ──────────────────────────────────────── */
const annualChecklist = [
  { category: "Operating System Health", items: [
    "Revenue forecast accuracy > 90% for 3+ consecutive quarters",
    "All cities above minimum liquidity density thresholds",
    "Automation coverage > 60% of marketplace workflows",
    "Recurring revenue ratio > 40% of total revenue",
    "Employee productivity growth > 20% YoY",
  ]},
  { category: "Risk Governance Discipline", items: [
    "No city launched without passing liquidity readiness assessment",
    "All cities achieving positive contribution margin by month 9",
    "Rule of 40 score maintained above 40% every quarter",
    "Competitive intelligence scan completed monthly",
    "Contingency campaign templates updated and ready for deployment",
  ]},
  { category: "Developer Ecosystem Strength", items: [
    "Top 20 national developers actively partnered",
    "Developer-sourced listings > 30% of total inventory",
    "Developer revenue contribution > 25% of total revenue",
    "4+ published developer success case studies",
    "Annual partnership planning completed with top 10 developers",
  ]},
  { category: "Scale Readiness Indicators", items: [
    "LTV:CAC ratio sustained > 5:1 across all markets",
    "Deal cycle duration < 14 days average nationally",
    "Agent network > 500 active nationally with < 10% monthly churn",
    "Cross-city transaction contribution > 15%",
    "Board-grade reporting and governance processes established",
  ]},
];

/* ── SECTION 5: Risks ─────────────────────────────────────────────────── */
const risks = [
  { risk: "Operational Complexity Overload", signal: "Decision latency increases > 50%. Regional leads escalating > 70% of decisions to central team.", mitigation: "Strengthen regional autonomy with clear decision boundaries. Implement tiered escalation protocols. Hire experienced COO to manage operational complexity." },
  { risk: "Liquidity Density Erosion", signal: "3+ cities drop below minimum thresholds for 2 consecutive months. Cross-city deals decline.", mitigation: "Pause expansion. Redeploy resources to underperforming markets. Run intensive 30-day re-activation campaigns. Consider market exit for persistently weak cities." },
  { risk: "Developer Dependency Concentration", signal: "Single developer contributing > 25% of listings or > 30% of revenue for 2+ quarters.", mitigation: "Accelerate mid-tier developer onboarding. Diversify supply sources (individual agents, FSBO). Negotiate balanced partnership terms preventing over-reliance." },
  { risk: "Talent Scaling Bottleneck", signal: "Key positions unfilled > 60 days. Employee NPS drops below 30. Top performer turnover > 15%.", mitigation: "Build employer brand. Competitive compensation benchmarking. Structured career development paths. Maintain 2-deep bench for all critical roles." },
  { risk: "Financial Discipline Drift", signal: "Burn rate exceeds plan by > 20% for 2 consecutive quarters. Runway drops below 15 months.", mitigation: "Immediate cost review and optimization. Pause discretionary spending. Accelerate revenue initiatives in proven markets. Prepare contingency fundraising strategy." },
];

/* ── MAIN ──────────────────────────────────────────────────────────────── */
const PreUnicornRiskDeveloperPartnership = () => {
  const [lang, setLang] = useState<"id" | "en">("id");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-7 w-7 text-primary" /> Pre-Unicorn OS + Risk Governance + Mega-Developer Partnerships
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Disciplined scaling blueprint — operational consistency, risk awareness & supply-side ecosystem dominance</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setLang(l => l === "id" ? "en" : "id")}>
          {lang === "id" ? "🇮🇩 Bahasa" : "🇬🇧 English"}
        </Button>
      </motion.div>

      <Tabs defaultValue="os" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="os"><Zap className="h-4 w-4 mr-1" />Pre-Unicorn OS</TabsTrigger>
          <TabsTrigger value="risk"><Shield className="h-4 w-4 mr-1" />Risk Governance</TabsTrigger>
          <TabsTrigger value="developer"><Building2 className="h-4 w-4 mr-1" />Mega-Developer</TabsTrigger>
          <TabsTrigger value="checklist"><CheckCircle className="h-4 w-4 mr-1" />Checklist</TabsTrigger>
          <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1" />Risks</TabsTrigger>
        </TabsList>

        {/* TAB 1: Pre-Unicorn OS */}
        <TabsContent value="os" className="space-y-4">
          {osPhases.map((p, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className={`h-5 w-5 ${p.color}`} /> {p.phase}
                    </CardTitle>
                    <Badge variant="outline">{p.period}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    {p.tactics.map((t, j) => (
                      <div key={j} className="bg-muted/40 rounded-lg p-3 border border-border/30">
                        <p className="font-semibold text-sm text-foreground">{t.t}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.d}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {p.kpis.map((k, j) => (
                      <Badge key={j} className="bg-primary/10 text-primary border-primary/20 text-xs">{k}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/60">
            <CardContent className="pt-6 space-y-3">
              <p className="font-semibold text-sm text-foreground">Pre-Unicorn Operating Maturity</p>
              {[
                { label: "Performance Governance Rhythm", pct: 33 },
                { label: "Cross-Market Coordination", pct: 67 },
                { label: "Operational Discipline", pct: 100 },
              ].map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>{m.label}</span><span>{m.pct}%</span></div>
                  <Progress value={m.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Risk Governance */}
        <TabsContent value="risk" className="space-y-4">
          {riskFrameworks.map((f, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <f.icon className={`h-5 w-5 ${f.color}`} /> {f.framework}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {f.tactics.map((t, j) => (
                      <div key={j} className="bg-muted/40 rounded-lg p-3 border border-border/30">
                        <p className="font-semibold text-sm text-foreground">{t.t}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.d}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/60 bg-primary/5">
            <CardContent className="pt-6">
              <p className="font-semibold text-sm text-foreground mb-2">Risk Governance KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Expansion success rate", target: "> 80%" },
                  { label: "Revenue volatility", target: "< 10% MoM" },
                  { label: "Liquidity density index", target: "> 85/100" },
                ].map((k, i) => (
                  <div key={i} className="bg-background rounded-lg p-3 border border-border/30 text-center">
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="text-sm font-bold text-primary mt-1">{k.target}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Mega-Developer */}
        <TabsContent value="developer" className="space-y-4">
          {devPillars.map((p, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <p.icon className={`h-5 w-5 ${p.color}`} /> {p.pillar}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {p.tactics.map((t, j) => (
                      <div key={j} className="bg-muted/40 rounded-lg p-3 border border-border/30">
                        <p className="font-semibold text-sm text-foreground">{t.t}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.d}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4 border border-border/30 relative">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">📋 Template</p>
                    <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {lang === "id" ? p.scripts.id : p.scripts.en}
                    </pre>
                    <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => copy(lang === "id" ? p.scripts.id : p.scripts.en)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/60 bg-primary/5">
            <CardContent className="pt-6">
              <p className="font-semibold text-sm text-foreground mb-2">Developer Partnership KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  { label: "Mega-dev partners", target: "20+" },
                  { label: "Dev-sourced listings", target: "> 30%" },
                  { label: "Dev revenue share", target: "> 25%" },
                  { label: "Repeat collaboration", target: "> 70%" },
                ].map((k, i) => (
                  <div key={i} className="bg-background rounded-lg p-3 border border-border/30 text-center">
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="text-sm font-bold text-primary mt-1">{k.target}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: Checklist */}
        <TabsContent value="checklist" className="space-y-4">
          {annualChecklist.map((c, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-base">{c.category}</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {c.items.map((item, j) => (
                      <label key={j} className="flex items-start gap-2 cursor-pointer group">
                        <input type="checkbox" className="mt-1 rounded border-border" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* TAB 5: Risks */}
        <TabsContent value="risks" className="space-y-4">
          {risks.map((r, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <p className="font-semibold text-sm text-foreground">{r.risk}</p>
                      <div className="bg-destructive/10 rounded-lg p-2 border border-destructive/20">
                        <p className="text-xs text-destructive"><Eye className="h-3 w-3 inline mr-1" />Signal: {r.signal}</p>
                      </div>
                      <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400"><Shield className="h-3 w-3 inline mr-1" />Mitigation: {r.mitigation}</p>
                      </div>
                    </div>
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

export default PreUnicornRiskDeveloperPartnership;
