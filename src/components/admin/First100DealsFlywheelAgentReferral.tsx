import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  RotateCw, Users, Share2, CheckCircle, AlertTriangle, Shield,
  TrendingUp, Target, Copy, Zap, Eye, Star, UserPlus, MessageSquare
} from "lucide-react";
import { toast } from "sonner";

const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };
const fade = { hidden: { opacity: 0, y: 12 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

/* ── SECTION 1: 100 Deals Flywheel ────────────────────────────────────── */
const flywheelPhases = [
  {
    phase: "Phase 1 — Ignition (Deals 1–25)",
    weeks: "Month 1–2",
    color: "text-amber-400",
    tactics: [
      { t: "Transaction Signal Broadcasting", d: "Every closed deal → social proof post within 24hrs. 'Another deal closed via Astra in [District]!'" },
      { t: "Dense Viewing Clusters", d: "Schedule 5+ viewings per hot listing per week. Create FOMO through visible demand activity." },
      { t: "Daily Negotiation War Board", d: "Track every deal in negotiation stage. Founder reviews pipeline daily at 6PM." },
      { t: "Quick-Win Listing Focus", d: "Prioritize competitively priced listings with strong inquiry signals for fastest closures." },
    ],
    kpis: ["5–7 deals/month", "Inquiry-to-viewing > 30%", "Deal cycle < 14 days"],
  },
  {
    phase: "Phase 2 — Acceleration (Deals 26–60)",
    weeks: "Month 3–4",
    color: "text-emerald-400",
    tactics: [
      { t: "Flywheel Momentum Loop", d: "Closed deals → success stories → new buyer trust → more inquiries → more viewings → more deals." },
      { t: "Agent Performance Leaderboard", d: "Weekly ranking by viewing-to-deal conversion. Top agents get priority lead routing." },
      { t: "Offer Acceleration Protocol", d: "After 2nd viewing, proactively initiate soft-offer conversation. Target 48hr offer window." },
      { t: "District Expansion Trigger", d: "When a district hits 10+ closed deals, expand to adjacent areas with proven playbook." },
    ],
    kpis: ["10–15 deals/month", "Viewing-to-offer > 25%", "Agent contribution spread across 5+ agents"],
  },
  {
    phase: "Phase 3 — Consistency Engine (Deals 61–100)",
    weeks: "Month 5–6",
    color: "text-blue-400",
    tactics: [
      { t: "Closing System Standardization", d: "7-step deal checklist automated. Every deal follows identical process from offer to close." },
      { t: "Stalled Deal Intervention SLA", d: "Any negotiation inactive > 48hrs gets escalated to senior agent or founder." },
      { t: "Pipeline Depth Guarantee", d: "Maintain 3:1 pipeline ratio — 300 active prospects feeding into 100 closures." },
      { t: "Milestone Celebration Campaign", d: "At Deal #50 and #100, run major visibility campaign reinforcing market leadership." },
    ],
    kpis: ["15–20 deals/month", "Pipeline ratio ≥ 3:1", "Closure consistency ≥ 80% of target"],
  },
];

/* ── SECTION 2: Agent Network Expansion ───────────────────────────────── */
const agentStrategies = [
  {
    pillar: "Targeted Agent Acquisition",
    icon: UserPlus,
    color: "text-emerald-400",
    tactics: [
      { t: "High-Demand District Mapping", d: "Identify top 5 districts by inquiry volume. Approach every active agent in these zones." },
      { t: "Inquiry Advantage Pitch", d: "'Your listings on Astra received 3x more inquiries than average. Here's the data.'" },
      { t: "Bulk Upload Support", d: "Offer dedicated onboarding call + bulk CSV upload assistance for first 48 hours." },
      { t: "Portfolio Demo Session", d: "Show agents real-time analytics of similar listings' performance on platform." },
    ],
    script_id: `AGENT ACQUISITION WHATSAPP:

"Halo [Nama Agent] 👋

Saya dari Astra PropTech. Area [District] sedang sangat aktif di platform kami:
📊 [X] inquiry serius minggu ini
👀 [Y] viewing terjadwal
💰 [Z] deal closed bulan ini

Listing Anda sangat cocok untuk demand yang ada. Kami bisa bantu upload portfolio Anda dalam 30 menit.

Mau saya tunjukkan datanya? 🙏"`,
    script_en: `AGENT ACQUISITION WHATSAPP:

"Hi [Agent Name] 👋

I'm from Astra PropTech. The [District] area is very active on our platform:
📊 [X] serious inquiries this week
👀 [Y] viewings scheduled
💰 [Z] deals closed this month

Your listings are a great fit for existing demand. We can help upload your portfolio in 30 minutes.

Would you like to see the data? 🙏"`,
  },
  {
    pillar: "Participation Motivation",
    icon: Star,
    color: "text-amber-400",
    tactics: [
      { t: "Performance Analytics Dashboard", d: "Weekly email showing each agent's listing views, inquiries, and conversion rates." },
      { t: "Priority Lead Routing", d: "Top-performing agents get first access to high-intent buyer leads." },
      { t: "Agent Referral Bonus", d: "Agents who bring 3 new agents → 30 days premium visibility for all their listings." },
      { t: "Speed Closure Recognition", d: "Fastest deal closer each month gets featured profile and social media spotlight." },
    ],
    script_id: `PERFORMANCE UPDATE MESSAGE:

"[Nama Agent], update performa Anda minggu ini:
📈 Listing views: [X] (+[Y]% vs minggu lalu)
📩 Inquiry masuk: [Z]
🏠 Viewing terjadwal: [N]

Anda masuk Top [Rank] agent di area [District]. Terus pertahankan momentum! 💪"`,
    script_en: `PERFORMANCE UPDATE MESSAGE:

"[Agent Name], your performance update this week:
📈 Listing views: [X] (+[Y]% vs last week)
📩 Inquiries received: [Z]
🏠 Viewings scheduled: [N]

You're ranked Top [Rank] agent in [District]. Keep the momentum going! 💪"`,
  },
  {
    pillar: "Retention & Productivity",
    icon: RotateCw,
    color: "text-blue-400",
    tactics: [
      { t: "Monthly Agent Check-In", d: "Personal call/message to every active agent reviewing their performance and gathering feedback." },
      { t: "Listing Quality Coaching", d: "Share top-performing listing examples. Help agents improve photos, descriptions, pricing." },
      { t: "Cross-District Expansion", d: "Encourage successful agents to list properties in adjacent high-demand areas." },
      { t: "Inactive Agent Reactivation", d: "Agents with no uploads in 14+ days get personalized opportunity alert." },
    ],
    script_id: `REACTIVATION MESSAGE:

"[Nama Agent], kami notice listing Anda belum di-update. Area [District] sedang booming:
🔥 [X] buyer aktif mencari properti seperti portfolio Anda
⏰ Window kesempatan ini terbatas

Upload 1 listing baru hari ini dan langsung dapat boost visibility 7 hari gratis. Deal? 🤝"`,
    script_en: `REACTIVATION MESSAGE:

"[Agent Name], we noticed your listings haven't been updated. [District] area is booming:
🔥 [X] active buyers looking for properties like yours
⏰ This opportunity window is limited

Upload 1 new listing today and get a free 7-day visibility boost. Deal? 🤝"`,
  },
];

/* ── SECTION 3: Buyer Referral Momentum ───────────────────────────────── */
const referralTactics = [
  {
    pillar: "Referral Opportunity Framing",
    icon: Share2,
    color: "text-emerald-400",
    actions: [
      "After every closed deal, ask: 'Do you know anyone else looking for property?'",
      "Create shareable 'Top 5 Deals This Week' content for buyer social forwarding",
      "Position referral as helping friends access exclusive opportunities first",
      "Send curated investment opportunity lists to past successful buyers",
    ],
  },
  {
    pillar: "Incentive & Recognition",
    icon: Zap,
    color: "text-amber-400",
    actions: [
      "Refer-a-buyer reward: priority viewing access + dedicated agent support",
      "Highlight referral-driven success stories in community channels",
      "Create 'Astra Inner Circle' status for buyers who refer 3+ serious leads",
      "Small thank-you gesture (e-voucher / premium content access) for successful referrals",
    ],
  },
  {
    pillar: "Trust-Based Growth Communication",
    icon: MessageSquare,
    color: "text-blue-400",
    actions: [
      "Weekly 'Market Pulse' update shared with all past buyers showing activity momentum",
      "Showcase 'X deals closed this month' counter on platform and social channels",
      "Publish district-specific opportunity reports buyers want to share with network",
      "Position Astra as the fastest channel to discover and close property deals",
    ],
  },
];

/* ── SECTION 4: Monthly Checklist ─────────────────────────────────────── */
const monthlyChecklist = [
  { category: "Deal Flywheel Health", items: [
    "Review monthly deal count vs growth curve target",
    "Analyze inquiry-to-offer conversion ratio trend",
    "Identify top 10 highest-probability pipeline deals",
    "Measure average deal cycle duration — target reduction",
    "Count success story publications this month",
  ]},
  { category: "Agent Ecosystem Growth", items: [
    "Track net new active agents onboarded",
    "Review listings contribution per agent trend",
    "Send performance analytics to all active agents",
    "Identify and reactivate dormant agents (14+ days inactive)",
    "Measure agent referral program participation",
  ]},
  { category: "Buyer Referral Pipeline", items: [
    "Calculate percentage of inquiries from referral sources",
    "Track repeat buyer engagement rate",
    "Review organic traffic growth contribution",
    "Send referral encouragement to recent successful buyers",
    "Measure sharing rate of curated opportunity content",
  ]},
  { category: "Growth Signals & Revenue", items: [
    "Compare viewing density across districts — identify expansion opportunities",
    "Review premium listing upgrade conversion rate",
    "Track revenue per closed deal trend",
    "Plan next month's priority districts and campaigns",
    "Assess overall flywheel momentum — accelerating or decelerating?",
  ]},
];

/* ── SECTION 5: Risk Indicators ───────────────────────────────────────── */
const risks = [
  { risk: "Flywheel Stall", signal: "Deal count growth flattens for 2+ consecutive weeks", mitigation: "Re-concentrate effort on top-5 highest-probability deals. Launch urgency campaign. Increase viewing density." },
  { risk: "Agent Ecosystem Thinning", signal: "Net new agent growth < 2/month, or >30% dormancy rate", mitigation: "Launch targeted acquisition in high-demand districts. Improve onboarding experience. Activate referral bonuses." },
  { risk: "Referral Loop Failure", signal: "Referral-sourced inquiries < 5% of total pipeline", mitigation: "Systematize post-deal referral ask. Improve shareable content quality. Introduce structured incentive program." },
  { risk: "Single-Agent Dependency", signal: ">40% of deals coming from 1–2 agents", mitigation: "Diversify agent acquisition across districts. Coach mid-tier agents toward higher conversion. Reduce concentration risk." },
  { risk: "Pipeline Depth Erosion", signal: "Active prospect count drops below 2.5x monthly deal target", mitigation: "Increase buyer acquisition campaigns. Reactivate cold leads with fresh opportunity alerts. Expand district coverage." },
];

/* ── MAIN COMPONENT ───────────────────────────────────────────────────── */
const First100DealsFlywheelAgentReferral = () => {
  const [lang, setLang] = useState<"id" | "en">("id");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <RotateCw className="h-7 w-7 text-primary" /> First 100 Deals Flywheel + Agent Expansion + Buyer Referral
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Self-reinforcing growth engine — deal momentum, agent ecosystem & organic demand loops</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setLang(l => l === "id" ? "en" : "id")}>
          {lang === "id" ? "🇮🇩 Bahasa" : "🇬🇧 English"}
        </Button>
      </motion.div>

      <Tabs defaultValue="flywheel" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="flywheel"><RotateCw className="h-4 w-4 mr-1" />Flywheel</TabsTrigger>
          <TabsTrigger value="agents"><Users className="h-4 w-4 mr-1" />Agents</TabsTrigger>
          <TabsTrigger value="referral"><Share2 className="h-4 w-4 mr-1" />Referral</TabsTrigger>
          <TabsTrigger value="checklist"><CheckCircle className="h-4 w-4 mr-1" />Checklist</TabsTrigger>
          <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1" />Risks</TabsTrigger>
        </TabsList>

        {/* TAB 1: Flywheel */}
        <TabsContent value="flywheel" className="space-y-4">
          {flywheelPhases.map((p, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className={`h-5 w-5 ${p.color}`} /> {p.phase}
                    </CardTitle>
                    <Badge variant="outline">{p.weeks}</Badge>
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

          {/* Flywheel visualization */}
          <Card className="border-border/60 bg-primary/5">
            <CardContent className="pt-6">
              <p className="font-semibold text-sm text-foreground mb-3">🔄 Flywheel Loop</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {["Deals Close → Social Proof", "Social Proof → Buyer Trust", "Buyer Trust → More Inquiries", "More Inquiries → More Deals"].map((s, i) => (
                  <div key={i} className="bg-background rounded-lg p-3 border border-border/30">
                    <p className="text-xs font-medium text-foreground">{s}</p>
                    <TrendingUp className="h-4 w-4 text-primary mx-auto mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="pt-6 space-y-3">
              <p className="font-semibold text-sm text-foreground">Deal Milestone Tracker</p>
              {[
                { label: "Ignition (1–25 deals)", pct: 25 },
                { label: "Acceleration (26–60 deals)", pct: 60 },
                { label: "Consistency Engine (61–100 deals)", pct: 100 },
              ].map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>{m.label}</span><span>{m.pct}%</span></div>
                  <Progress value={m.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Agent Network */}
        <TabsContent value="agents" className="space-y-4">
          {agentStrategies.map((s, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <s.icon className={`h-5 w-5 ${s.color}`} /> {s.pillar}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {s.tactics.map((t, j) => (
                      <div key={j} className="bg-muted/40 rounded-lg p-3 border border-border/30">
                        <p className="font-semibold text-sm text-foreground">{t.t}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.d}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4 border border-border/30 relative">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">📋 Script Template</p>
                    <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {lang === "id" ? s.script_id : s.script_en}
                    </pre>
                    <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => copy(lang === "id" ? s.script_id : s.script_en)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <Card className="border-border/60 bg-primary/5">
            <CardContent className="pt-6">
              <p className="font-semibold text-sm text-foreground mb-2">Agent Network KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Active agent growth", target: "+5 agents/month" },
                  { label: "Listings per agent", target: "≥ 3 active listings" },
                  { label: "Agent retention", target: "> 80% monthly" },
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

        {/* TAB 3: Buyer Referral */}
        <TabsContent value="referral" className="space-y-4">
          {referralTactics.map((p, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <p.icon className={`h-5 w-5 ${p.color}`} /> {p.pillar}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {p.actions.map((a, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">{a}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <Card className="border-border/60 bg-primary/5">
            <CardContent className="pt-6">
              <p className="font-semibold text-sm text-foreground mb-2">Referral Momentum KPIs</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Referral-sourced inquiries", target: "> 15% of pipeline" },
                  { label: "Repeat buyer engagement", target: "> 20% return rate" },
                  { label: "Organic traffic growth", target: "+25% monthly" },
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
          {monthlyChecklist.map((c, i) => (
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

export default First100DealsFlywheelAgentReferral;
