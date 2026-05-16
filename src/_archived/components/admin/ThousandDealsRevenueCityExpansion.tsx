import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Crown, DollarSign, MapPin, CheckCircle, AlertTriangle, Shield,
  TrendingUp, Target, Copy, Eye, Zap, BarChart3, Layers, Rocket
} from "lucide-react";
import { toast } from "sonner";

const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };
const fade = { hidden: { opacity: 0, y: 12 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

/* ── SECTION 1: 1,000 Deals Domination ────────────────────────────────── */
const dominationPhases = [
  {
    phase: "Phase 1 — Foundation Scale (Deals 1–300)",
    period: "Month 1–9",
    color: "text-amber-400",
    tactics: [
      { t: "District-Level Closure Targets", d: "Set monthly deal targets per district. Top 5 districts each carry 15–20 deal/month quotas." },
      { t: "Hot-100 Pipeline Dashboard", d: "Rolling list of 100 highest-probability deals. Updated daily. Reviewed by founder every morning." },
      { t: "Agent Productivity Tiering", d: "Rank agents into A/B/C tiers by conversion rate. Route priority leads to A-tier agents first." },
      { t: "Viewing Density Protocol", d: "Minimum 10 viewings/week per hot listing. Cluster viewings to create visible demand pressure." },
    ],
    kpis: ["30–35 deals/month by M9", "Inquiry-to-offer > 30%", "Agent A-tier handling 40% of pipeline"],
  },
  {
    phase: "Phase 2 — Velocity Acceleration (Deals 301–700)",
    period: "Month 10–18",
    color: "text-emerald-400",
    tactics: [
      { t: "Negotiation Acceleration Engine", d: "AI-assisted comparable data delivery within 1 hour of offer. Reduce price discovery friction." },
      { t: "Repeat Buyer Activation", d: "Track all past buyers. Re-engage with curated investment opportunities every 90 days." },
      { t: "Multi-District Sprint Weeks", d: "Monthly 'Deal Sprint Week' — synchronized urgency campaigns across all active districts." },
      { t: "Closing Coordination Team", d: "Dedicated closing support role handling paperwork, scheduling, and follow-ups for deals in final stage." },
    ],
    kpis: ["50–60 deals/month by M18", "Deal cycle < 7 days", "Repeat buyer > 15% of closures"],
  },
  {
    phase: "Phase 3 — Domination Lock-In (Deals 701–1,000)",
    period: "Month 19–24",
    color: "text-blue-400",
    tactics: [
      { t: "Market Share Visibility", d: "Publish '1,000 Deals Closed' milestone across all channels. Position as undisputed regional leader." },
      { t: "Developer Portfolio Onboarding", d: "Onboard 3–5 major developers with project inventory. Institutional-grade supply depth." },
      { t: "Predictive Deal Scoring", d: "Score every active prospect by closure probability. Auto-prioritize agent effort allocation." },
      { t: "Cross-City Deal Routing", d: "Route serious buyers between cities based on preference matching. Maximize transaction opportunities." },
    ],
    kpis: ["70+ deals/month by M24", "Pipeline ratio ≥ 3.5:1", "Multi-city deal contribution > 30%"],
  },
];

/* ── SECTION 2: Revenue Predictability ────────────────────────────────── */
const revenuePillars = [
  {
    pillar: "Recurring Vendor Revenue Layer",
    icon: DollarSign,
    color: "text-emerald-400",
    tactics: [
      { t: "3-Tier Agent Subscription", d: "Basic (free, limited visibility) → Pro (premium placement + analytics) → Enterprise (dedicated support + priority leads)." },
      { t: "Performance Analytics Bundle", d: "Upsell real-time listing performance dashboards. Show views, inquiries, conversion data per listing." },
      { t: "Annual Commitment Incentive", d: "Agents committing to 12-month subscriptions get 20% discount + featured profile badge." },
      { t: "Auto-Renewal + Expansion Revenue", d: "Default to auto-renewal. Prompt upgrades when agent performance metrics improve." },
    ],
    scripts: {
      id: `SUBSCRIPTION UPSELL MESSAGE:

"Halo [Nama Agent] 👋

Listing Anda bulan ini mendapat [X] views dan [Y] inquiry — di atas rata-rata platform!

Dengan upgrade ke Astra Pro, Anda mendapatkan:
⭐ Posisi prioritas di hasil pencarian
📊 Dashboard analytics real-time
🎯 Lead routing prioritas

Harga spesial: Rp [Harga]/bulan (hemat 20% dengan komitmen tahunan).

Mau saya aktivasi trial 7 hari gratis? 🚀"`,
      en: `SUBSCRIPTION UPSELL MESSAGE:

"Hi [Agent Name] 👋

Your listings got [X] views and [Y] inquiries this month — above platform average!

With Astra Pro upgrade, you get:
⭐ Priority search placement
📊 Real-time analytics dashboard
🎯 Priority lead routing

Special price: Rp [Price]/month (save 20% with annual commitment).

Want me to activate a 7-day free trial? 🚀"`,
    },
  },
  {
    pillar: "Performance-Driven Monetization",
    icon: BarChart3,
    color: "text-amber-400",
    tactics: [
      { t: "District Revenue Attribution", d: "Track revenue contribution per district. Double down investment in top 20% revenue-generating zones." },
      { t: "High-Liquidity Zone Premium", d: "Dynamic pricing for premium visibility in hot districts. Higher demand = higher premium slot value." },
      { t: "Developer Campaign Packages", d: "Structured campaign bundles for new project launches. Fixed-fee visibility + lead generation packages." },
      { t: "Data Intelligence Products", d: "Sell district-level market reports and investment insights to institutional buyers and developers." },
    ],
    scripts: {
      id: `DEVELOPER CAMPAIGN PITCH:

"Yth. [Nama Developer],

Kami menawarkan paket peluncuran proyek eksklusif di Astra:

📍 Featured placement 30 hari
📊 Laporan performa mingguan
🎯 Targeted buyer matching
📱 Social media amplification

Proyek serupa di platform kami menghasilkan [X] inquiry serius dalam 30 hari pertama.

Jadwalkan demo 15 menit? 📞"`,
      en: `DEVELOPER CAMPAIGN PITCH:

"Dear [Developer Name],

We offer an exclusive project launch package on Astra:

📍 30-day featured placement
📊 Weekly performance reports
🎯 Targeted buyer matching
📱 Social media amplification

Similar projects on our platform generated [X] serious inquiries in the first 30 days.

Schedule a 15-minute demo? 📞"`,
    },
  },
  {
    pillar: "Financial Visibility & Forecasting",
    icon: TrendingUp,
    color: "text-blue-400",
    tactics: [
      { t: "Rolling 90-Day Revenue Forecast", d: "Project revenue based on pipeline probability, subscription renewals, and campaign calendar." },
      { t: "CAC vs LTV Dashboard", d: "Track customer acquisition cost by channel. Ensure LTV:CAC ratio > 5:1 across all segments." },
      { t: "Revenue Diversification Monitor", d: "No single revenue source > 40% of total. Balance commissions, subscriptions, campaigns, data products." },
      { t: "Monthly Revenue Sprint Targets", d: "Break annual targets into monthly sprints. Weekly check-ins on progress vs target." },
    ],
    scripts: {
      id: `MONTHLY REVENUE REVIEW TEMPLATE:

"📊 Revenue Review — [Bulan]

💰 Total Revenue: Rp [X]
📈 vs Target: [+/-Y]%
🔄 Recurring Revenue: [Z]% of total

Kontribusi per channel:
• Commissions: [A]%
• Subscriptions: [B]%
• Campaigns: [C]%
• Data Products: [D]%

Top 3 districts by revenue: [List]
Action items: [1-3 items]"`,
      en: `MONTHLY REVENUE REVIEW TEMPLATE:

"📊 Revenue Review — [Month]

💰 Total Revenue: Rp [X]
📈 vs Target: [+/-Y]%
🔄 Recurring Revenue: [Z]% of total

Channel contribution:
• Commissions: [A]%
• Subscriptions: [B]%
• Campaigns: [C]%
• Data Products: [D]%

Top 3 districts by revenue: [List]
Action items: [1-3 items]"`,
    },
  },
];

/* ── SECTION 3: Multi-City Expansion ──────────────────────────────────── */
const expansionSteps = [
  {
    step: "Step 1 — Readiness Assessment",
    icon: Target,
    color: "text-amber-400",
    items: [
      "Evaluate inquiry signals from target city — minimum 50+ organic searches/month",
      "Identify 3+ anchor agencies with 20+ ready listings each",
      "Confirm minimum marketing budget for 90-day launch campaign",
      "Assess competitive landscape — number of active competitors, market gaps",
      "Validate demand: run 2-week test campaign before committing resources",
    ],
  },
  {
    step: "Step 2 — Structured City Launch",
    icon: Rocket,
    color: "text-emerald-400",
    items: [
      "Concentrate supply in 1–2 highest-demand micro-districts first",
      "Onboard anchor agencies with bulk listing upload support",
      "Launch localized awareness campaign: 'Astra is now in [City]!'",
      "Run 'First 30 Days' deal sprint — target first closed deal within 4 weeks",
      "Deploy localized credibility content: success stories from other cities",
    ],
  },
  {
    step: "Step 3 — Cross-City Coordination",
    icon: Layers,
    color: "text-blue-400",
    items: [
      "Route buyers searching in saturated cities toward new market opportunities",
      "Publish cross-city comparison guides: pricing, demand, investment potential",
      "Synchronize promotional campaigns across cities for maximum impact",
      "Share agent best practices and playbooks between city teams",
      "Track and optimize revenue contribution per city toward breakeven",
    ],
  },
];

/* ── SECTION 4: Quarterly Checklist ───────────────────────────────────── */
const quarterlyChecklist = [
  { category: "Transaction Volume & Velocity", items: [
    "Review quarterly deal count vs growth trajectory (target: 70+/month by M24)",
    "Analyze offer-to-closure conversion rate trend across districts",
    "Measure average deal cycle duration — target consistent reduction",
    "Assess repeat buyer participation rate (target: > 15%)",
    "Evaluate agent productivity distribution across tiers",
  ]},
  { category: "Revenue Stability & Growth", items: [
    "Track recurring revenue ratio (target: > 35% of total)",
    "Review revenue per active listing improvement trend",
    "Validate 90-day revenue forecast accuracy (target: ±10%)",
    "Monitor CAC vs LTV ratio sustainability (target: > 5:1)",
    "Assess revenue diversification — no single source > 40%",
  ]},
  { category: "Multi-City Expansion Health", items: [
    "Measure time-to-first-deal in each new city (target: < 30 days)",
    "Track listings growth velocity per expansion market",
    "Review revenue contribution per city toward breakeven timeline",
    "Assess cross-city demand routing effectiveness",
    "Evaluate expansion ROI — revenue generated vs capital invested",
  ]},
  { category: "Ecosystem & Market Position", items: [
    "Track total active agent count and retention rate",
    "Measure brand search growth across cities",
    "Review inbound partnership and listing requests",
    "Assess competitive positioning — market share indicators",
    "Plan next quarter's expansion and revenue priorities",
  ]},
];

/* ── SECTION 5: Risk Indicators ───────────────────────────────────────── */
const risks = [
  { risk: "Over-Expansion Dilution", signal: "New city launches consuming capital without reaching first-deal milestone within 45 days", mitigation: "Pause expansion. Re-concentrate resources on cities with proven traction. Establish strict launch-gate criteria." },
  { risk: "Revenue Volatility", signal: "Monthly revenue swings > ±20% for 3+ consecutive months", mitigation: "Accelerate subscription adoption. Reduce dependence on one-time campaign revenue. Build recurring revenue to > 40%." },
  { risk: "Agent Productivity Collapse", signal: "A-tier agent count shrinks below 20% of total, or B/C-tier agents closing < 1 deal/quarter", mitigation: "Intensify agent coaching. Redistribute leads. Recruit new high-performers in underserving districts." },
  { risk: "Liquidity Fragmentation", signal: "Listings spread too thin — < 15 active listings per district in 40%+ of active zones", mitigation: "Consolidate supply in fewer districts. Run vendor acquisition blitzes in low-density areas. Merge underperforming zones." },
  { risk: "Deal Cycle Inflation", signal: "Average negotiation duration increasing > 10 days for 2+ consecutive months", mitigation: "Deploy negotiation acceleration scripts. Provide instant comparable data. Introduce structured offer deadlines." },
];

/* ── MAIN COMPONENT ───────────────────────────────────────────────────── */
const ThousandDealsRevenueCityExpansion = () => {
  const [lang, setLang] = useState<"id" | "en">("id");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Crown className="h-7 w-7 text-primary" /> 1,000 Deals Domination + Revenue Predictability + Multi-City Expansion
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Regional domination blueprint — volume leadership, monetization stability & geographic scaling</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setLang(l => l === "id" ? "en" : "id")}>
          {lang === "id" ? "🇮🇩 Bahasa" : "🇬🇧 English"}
        </Button>
      </motion.div>

      <Tabs defaultValue="deals" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="deals"><Crown className="h-4 w-4 mr-1" />1K Deals</TabsTrigger>
          <TabsTrigger value="revenue"><DollarSign className="h-4 w-4 mr-1" />Revenue</TabsTrigger>
          <TabsTrigger value="expansion"><MapPin className="h-4 w-4 mr-1" />Expansion</TabsTrigger>
          <TabsTrigger value="checklist"><CheckCircle className="h-4 w-4 mr-1" />Checklist</TabsTrigger>
          <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1" />Risks</TabsTrigger>
        </TabsList>

        {/* TAB 1: 1,000 Deals */}
        <TabsContent value="deals" className="space-y-4">
          {dominationPhases.map((p, i) => (
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
              <p className="font-semibold text-sm text-foreground">1,000 Deal Milestone Tracker</p>
              {[
                { label: "Foundation Scale (1–300)", pct: 30 },
                { label: "Velocity Acceleration (301–700)", pct: 70 },
                { label: "Domination Lock-In (701–1,000)", pct: 100 },
              ].map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>{m.label}</span><span>{m.pct}%</span></div>
                  <Progress value={m.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Revenue */}
        <TabsContent value="revenue" className="space-y-4">
          {revenuePillars.map((p, i) => (
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
                    <p className="text-xs font-semibold text-muted-foreground mb-2">📋 Script Template</p>
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
              <p className="font-semibold text-sm text-foreground mb-2">Revenue Predictability KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  { label: "Recurring revenue ratio", target: "> 35%" },
                  { label: "LTV:CAC ratio", target: "> 5:1" },
                  { label: "Forecast accuracy", target: "±10%" },
                  { label: "Revenue diversification", target: "No source > 40%" },
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

        {/* TAB 3: City Expansion */}
        <TabsContent value="expansion" className="space-y-4">
          {expansionSteps.map((s, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <s.icon className={`h-5 w-5 ${s.color}`} /> {s.step}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {s.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/60 bg-primary/5">
            <CardContent className="pt-6">
              <p className="font-semibold text-sm text-foreground mb-2">Expansion KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Time to first deal", target: "< 30 days" },
                  { label: "Listings velocity post-launch", target: "+50/month" },
                  { label: "City breakeven timeline", target: "< 9 months" },
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
          {quarterlyChecklist.map((c, i) => (
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

export default ThousandDealsRevenueCityExpansion;
