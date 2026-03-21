import React, { useState } from "react";
import {
  Swords, Zap, Globe, AlertTriangle, CheckCircle, Target,
  TrendingUp, DollarSign, Users, Calendar, Shield, Clock,
  ChevronRight, BarChart3, Flame, Crown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — 60-DAY DOMINATION PHASES
   ═══════════════════════════════════════════════ */

const phases = [
  {
    phase: "PHASE 1 — Liquidity Seeding",
    days: "Days 1–20",
    color: "text-chart-4",
    borderColor: "border-chart-4/30",
    bgColor: "bg-chart-4/5",
    objective: "Flood the marketplace with real supply to create credibility mass",
    actions: [
      { task: "Deploy WhatsApp blitz campaign to 100 agents in target city — personalized listing invitation", day: "D1-3", impact: "CRITICAL", kpi: "≥20 agent signups" },
      { task: "Offer free 60-day premium listing for first 50 vendors — zero friction onboarding", day: "D1-5", impact: "CRITICAL", kpi: "50 free premium activations" },
      { task: "Activate 'white-glove' listing upload service — team uploads on behalf of agents", day: "D3-7", impact: "HIGH", kpi: "≥30 verified listings live" },
      { task: "Map district-level supply gaps — target 3 districts with highest transaction volume", day: "D5-8", impact: "HIGH", kpi: "3 districts with ≥10 listings each" },
      { task: "Launch agent referral program — Rp 500K per referred agent who lists 3+ properties", day: "D7-10", impact: "HIGH", kpi: "≥5 referral-sourced agents" },
      { task: "Seed 'hot deal' intelligence feed with below-market and high-ROI listings", day: "D10-14", impact: "MEDIUM", kpi: "≥10 hot deals flagged by AI" },
      { task: "Partner with 2 local developers for exclusive new-launch inventory", day: "D12-18", impact: "HIGH", kpi: "2 developer partnerships signed" },
      { task: "Run credibility signaling campaign: 'Now Live: X Premium Properties in [City]'", day: "D14-20", impact: "MEDIUM", kpi: "≥500 social impressions" },
    ],
    dailyKPI: "Track: new listings/day, agent signups, district coverage, listing quality score",
    warningSignal: "⚠ If <30 listings by Day 10 → halt all feature work, triple agent outreach intensity",
  },
  {
    phase: "PHASE 2 — Demand Acceleration",
    days: "Days 21–40",
    color: "text-primary",
    borderColor: "border-primary/30",
    bgColor: "bg-primary/5",
    objective: "Drive real investor attention and generate measurable inquiry velocity",
    actions: [
      { task: "Launch Google Ads: 'investasi properti [city]' + 'beli villa [city]' — Rp 5M/week budget", day: "D21-25", impact: "CRITICAL", kpi: "≥200 clicks/week, <Rp 25K CPC" },
      { task: "Activate Instagram/TikTok property showcase reels — 3 posts/week with AI-scored hot deals", day: "D21-28", impact: "HIGH", kpi: "≥1000 views/reel, ≥50 profile visits" },
      { task: "Send AI deal alerts to registered investors — personalized by investment DNA", day: "D23-28", impact: "HIGH", kpi: "≥15% open rate, ≥5% click-through" },
      { task: "Create urgency messaging experiments: 'Only 3 investors viewing this deal'", day: "D25-30", impact: "MEDIUM", kpi: "A/B test: ≥20% uplift in inquiry rate" },
      { task: "Optimize conversion funnel: reduce inquiry form to 3 fields, add WhatsApp CTA", day: "D28-32", impact: "HIGH", kpi: "Inquiry conversion ≥12%" },
      { task: "Launch 'Investor Circle' exclusive content: weekly market intelligence email to top users", day: "D30-35", impact: "MEDIUM", kpi: "≥100 subscribers" },
      { task: "Deploy retargeting campaigns for visitors who viewed 3+ properties without inquiring", day: "D32-38", impact: "MEDIUM", kpi: "≥5% retarget conversion" },
      { task: "Host virtual property tour event — live walkthrough of 5 premium listings", day: "D35-40", impact: "HIGH", kpi: "≥30 attendees, ≥5 inquiries from event" },
    ],
    dailyKPI: "Track: daily inquiries, inquiry-to-viewing rate, traffic source mix, cost per inquiry",
    warningSignal: "⚠ If <5 real inquiries/day by Day 30 → reallocate budget to WhatsApp direct outreach to investor groups",
  },
  {
    phase: "PHASE 3 — Market Authority Lock",
    days: "Days 41–60",
    color: "text-chart-2",
    borderColor: "border-chart-2/30",
    bgColor: "bg-chart-2/5",
    objective: "Lock market position through monetization proof and competitive barriers",
    actions: [
      { task: "Activate paid premium listing slots — Rp 1.5M/month with performance guarantee", day: "D41-45", impact: "CRITICAL", kpi: "≥10 paid premium slots sold" },
      { task: "Launch vendor performance leaderboard — public ranking drives competition for visibility", day: "D43-48", impact: "HIGH", kpi: "≥20 vendors checking rankings weekly" },
      { task: "Negotiate 3 exclusive inventory deals — listings only available on platform", day: "D45-50", impact: "HIGH", kpi: "3 exclusive listing agreements" },
      { task: "Launch investor Pro subscription — Rp 499K/month for AI deal alerts + analytics", day: "D48-52", impact: "HIGH", kpi: "≥15 paid subscribers" },
      { task: "Secure first PR coverage in property/business media — founder interview placement", day: "D50-55", impact: "MEDIUM", kpi: "≥1 media mention" },
      { task: "Deploy 'market intelligence report' — free monthly PDF establishing thought leadership", day: "D52-57", impact: "MEDIUM", kpi: "≥200 downloads" },
      { task: "Achieve first verified transaction with commission captured on platform", day: "D55-60", impact: "CRITICAL", kpi: "≥1 closed deal with commission" },
      { task: "Compile 60-day traction report — real metrics for investor conversations", day: "D58-60", impact: "HIGH", kpi: "Data room ready with validated KPIs" },
    ],
    dailyKPI: "Track: MRR, paid conversion rate, exclusive inventory %, vendor retention, transaction pipeline",
    warningSignal: "⚠ If zero revenue by Day 50 → offer bundled 'Founding Vendor' package at 50% discount to force first payment",
  },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — REVENUE ENGINE ACTIVATION
   ═══════════════════════════════════════════════ */

const revenueStreams = [
  {
    stream: "Listing Boost Monetization",
    icon: Flame,
    timeline: "Day 15–60",
    tactics: [
      { tactic: "Anchor pricing: show 'Rp 2.5M' crossed out, offer launch price Rp 1.5M/month", psychology: "Anchoring bias — perceived 40% savings drives conversion" },
      { tactic: "Scarcity campaigns: 'Only 5 premium slots left in [district]' — refresh weekly", psychology: "Loss aversion — limited supply creates urgency" },
      { tactic: "Performance guarantee: 'Get ≥50 views in 7 days or next month free'", psychology: "Risk reversal — removes purchase hesitation" },
      { tactic: "Bundle: 3 months premium + AI analytics = 20% package discount", psychology: "Commitment escalation — longer contracts reduce churn" },
    ],
    milestones: [
      { day: "Day 20", target: "5 free trials activated" },
      { day: "Day 35", target: "10 paid conversions from trial" },
      { day: "Day 50", target: "Rp 15M listing boost MRR" },
      { day: "Day 60", target: "Rp 25M listing boost MRR" },
    ],
  },
  {
    stream: "Vendor Subscription Revenue",
    icon: Users,
    timeline: "Day 30–60",
    tactics: [
      { tactic: "3-tier packaging: Basic (free) → Growth (Rp 1.5M) → Dominance (Rp 5M)", psychology: "Compromise effect — middle tier appears most reasonable" },
      { tactic: "Auto-upgrade nudge: 'Your listing got 80 views — upgrade to capture 3x more leads'", psychology: "Progress motivation — show value already gained" },
      { tactic: "Churn prevention: 30-day pause option instead of cancel, discount offer at cancel flow", psychology: "Sunk cost + flexibility reduces permanent churn" },
      { tactic: "Annual pre-pay: 2 months free on yearly commitment — lock in early adopters", psychology: "Forward commitment — predictable revenue + retention" },
    ],
    milestones: [
      { day: "Day 35", target: "3 paid vendor subscriptions" },
      { day: "Day 45", target: "8 paid vendors, ≤10% churn" },
      { day: "Day 55", target: "Rp 12M vendor subscription MRR" },
      { day: "Day 60", target: "15 paid vendors, Rp 20M MRR" },
    ],
  },
  {
    stream: "Investor Monetization",
    icon: TrendingUp,
    timeline: "Day 40–60",
    tactics: [
      { tactic: "Freemium gate: 3 free deal unlocks/month → Pro for unlimited at Rp 499K", psychology: "Taste-then-pay — habit formation before monetization" },
      { tactic: "Intelligence exclusivity: 'AI-scored deals available 24h early for Pro members'", psychology: "Information asymmetry — time advantage drives urgency" },
      { tactic: "Urgency trigger: 'This deal has 8 investor views in last 2 hours — unlock now'", psychology: "Social proof + scarcity — fear of missing alpha" },
      { tactic: "Portfolio tracking as retention hook — free tool that increases switching cost", psychology: "Endowment effect — invested effort creates lock-in" },
    ],
    milestones: [
      { day: "Day 45", target: "20 free accounts actively using alerts" },
      { day: "Day 50", target: "5 paid Pro conversions" },
      { day: "Day 55", target: "Rp 3M investor subscription MRR" },
      { day: "Day 60", target: "10 Pro subscribers, Rp 5M MRR" },
    ],
  },
];

const revenueRamp = [
  { week: "Week 2", target: "Rp 0", note: "Free tier only — building supply" },
  { week: "Week 3", target: "Rp 2M", note: "First listing boost conversions from free trials" },
  { week: "Week 4", target: "Rp 5M", note: "Paid premium slots activating" },
  { week: "Week 5-6", target: "Rp 12M", note: "Vendor subscriptions launching" },
  { week: "Week 7-8", target: "Rp 25M", note: "Full 3-stream revenue engine live" },
  { week: "Week 8+", target: "Rp 50M", note: "Target: First commission from closed transaction" },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — EXPANSION WAR SIMULATION
   ═══════════════════════════════════════════════ */

const warScenarios = [
  {
    scenario: "A — Fast Sequential City Domination",
    icon: ChevronRight,
    description: "Dominate City 1 completely before launching City 2. Methodical, capital-efficient, lower risk.",
    timeline: "City 2 at Month 4, City 3 at Month 7",
    revenue: { best: "Rp 800M ARR by Month 12", realistic: "Rp 400M ARR by Month 12", downside: "Rp 150M ARR — slow ramp in City 2" },
    complexity: 40,
    benefits: [
      "Proven playbook before replication — each launch is faster",
      "Concentrated resources maximize liquidity density per city",
      "Brand authority compounds — 'dominant in [City 1]' becomes marketing asset",
      "Unit economics validated before scaling spend",
    ],
    risks: [
      "Competitors may capture City 2/3 while waiting",
      "Revenue growth appears slow to investors in early months",
      "Team may lose urgency without multi-front pressure",
    ],
    moatImpact: 85,
    mitigations: "Pre-seed City 2 with agent relationships during Month 2-3 to reduce launch delay. Use City 1 case studies for rapid City 2 vendor conversion.",
  },
  {
    scenario: "B — Aggressive Multi-City Blitz",
    icon: Zap,
    description: "Launch 3 cities simultaneously. Maximum market presence, maximum burn rate, maximum risk.",
    timeline: "Cities 1+2+3 simultaneously from Month 1",
    revenue: { best: "Rp 1.5B ARR by Month 12", realistic: "Rp 500M ARR by Month 12", downside: "Rp 80M ARR — thin liquidity across all 3" },
    complexity: 85,
    benefits: [
      "Maximum market awareness and PR impact",
      "Competitors cannot respond on 3 fronts simultaneously",
      "Investor narrative: 'already in 3 cities' signals scale ambition",
      "Cross-city data compounds intelligence advantage faster",
    ],
    risks: [
      "Operational overstretch — solo founder cannot manage 3 markets",
      "Thin liquidity in each city fails to trigger network effects",
      "Monetization diluted — free offers everywhere, delayed revenue",
      "Burn rate 3x higher — runway shrinks to <6 months",
    ],
    moatImpact: 55,
    mitigations: "Only viable with ≥Rp 5B funding. Hire city managers before launch. Accept lower liquidity density initially and focus on 1 district per city.",
  },
  {
    scenario: "C — Competitive Market Entry Defense",
    icon: Shield,
    description: "A well-funded competitor enters your primary city. Defend position while preparing counter-offensive.",
    timeline: "Triggered when competitor launches in your market",
    revenue: { best: "Maintain Rp 50M MRR — competitor fails to gain traction", realistic: "MRR dips 20% before stabilizing as competitor burns cash", downside: "Lose 40% vendor base to competitor's subsidized pricing" },
    complexity: 70,
    benefits: [
      "Defensive posture forces operational efficiency improvements",
      "Vendor loyalty tested and reinforced — stronger relationships emerge",
      "Intelligence differentiation becomes clearer competitive narrative",
      "Surviving competitive pressure validates business model for investors",
    ],
    risks: [
      "Vendor defection if competitor offers zero-fee periods",
      "Price war erodes margins and delays profitability",
      "Team morale drops during sustained competitive pressure",
      "Distraction from product innovation and expansion plans",
    ],
    moatImpact: 70,
    mitigations: "Pre-sign 12-month vendor contracts with loyalty bonuses. Emphasize AI intelligence features competitors cannot replicate in <6 months. Launch 'Founding Vendor' locked pricing for committed partners.",
  },
];

const topRisks = [
  { risk: "Zero real supply — all strategy is theoretical without live inventory from real agents", severity: "CRITICAL", mitigation: "Nothing else matters until ≥30 real listings are live. This is the single gate for everything.", priority: 1 },
  { risk: "No payment infrastructure — cannot capture revenue even when vendors want to pay", severity: "CRITICAL", mitigation: "Integrate Midtrans or manual bank transfer as Day 1 priority. Even manual invoicing works for first 10 customers.", priority: 2 },
  { risk: "Founder bandwidth collapse — simultaneous product, sales, and ops without team", severity: "HIGH", mitigation: "Block calendar: mornings = agent calls, afternoons = product, evenings = content. Hire first ops assistant by Day 30.", priority: 3 },
  { risk: "Premature scaling — launching ads before supply is sufficient creates poor first impression", severity: "HIGH", mitigation: "Do not spend on demand acquisition until ≥50 quality listings live. Quality threshold: verified photos, accurate pricing, responsive agent.", priority: 4 },
  { risk: "Monetization resistance — vendors in Indonesia expect free platforms initially", severity: "MEDIUM", mitigation: "Lead with free tier. Monetize only after demonstrating value (≥10 inquiries delivered). Use performance guarantee to reduce risk perception.", priority: 5 },
];

const founderChecklist = [
  { category: "Before Anything Else", items: ["Do I have ≥30 real listings from real agents?", "Can I actually process a payment today?", "Do I have a working WhatsApp inquiry flow?"] },
  { category: "Weekly Decision Check", items: ["Am I spending time on real traction or building more strategy dashboards?", "Did I talk to ≥5 agents and ≥5 investors this week?", "What is my actual MRR right now — not projected, actual?"] },
  { category: "Growth Signals", items: ["Are inquiries growing week-over-week?", "Are vendors listing without my manual help?", "Have investors returned to the platform more than once?"] },
  { category: "Danger Signals", items: ["Am I the only person creating listings?", "Has any vendor actually paid money?", "Is my burn rate sustainable for ≥6 more months?"] },
];

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

const SixtyDayDominationBlueprint: React.FC = () => {
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [checkedFounder, setCheckedFounder] = useState<Record<string, boolean>>({});

  const toggle = (key: string, setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>) =>
    setter(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="60-Day Market Domination"
        description="City domination execution plan, full revenue engine activation & competitive war-simulation scenarios"
        icon={Swords}
        badge={{ text: "🔥 War Plan", variant: "outline" }}
      />

      <Tabs defaultValue="domination" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="domination" className="text-xs">60-Day Plan</TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs">Revenue Engine</TabsTrigger>
          <TabsTrigger value="war-sim" className="text-xs">War Simulation</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">Top Risks</TabsTrigger>
          <TabsTrigger value="founder" className="text-xs">Founder Focus</TabsTrigger>
        </TabsList>

        {/* ── 60-DAY DOMINATION ── */}
        <TabsContent value="domination" className="mt-4 space-y-4">
          {phases.map((p, pi) => (
            <Card key={pi} className={cn("border-border", p.borderColor, p.bgColor)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className={cn("text-sm flex items-center gap-2", p.color)}>
                    <Target className="h-4 w-4" /> {p.phase}
                    <Badge variant="outline" className="text-[9px]">{p.days}</Badge>
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground italic">{p.objective}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {p.actions.map((a, ai) => {
                  const key = `p${pi}-${ai}`;
                  return (
                    <div key={ai} className="flex items-start gap-3 p-2.5 rounded-lg bg-card/60 border border-border/30">
                      <Checkbox checked={!!checkedActions[key]} onCheckedChange={() => toggle(key, setCheckedActions)} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs text-foreground", checkedActions[key] && "line-through opacity-50")}>{a.task}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant={a.impact === "CRITICAL" ? "destructive" : a.impact === "HIGH" ? "default" : "secondary"} className="text-[8px]">{a.impact}</Badge>
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" /> {a.day}</span>
                          <span className="text-[9px] text-chart-2">✓ {a.kpi}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-[9px] font-semibold text-muted-foreground">📊 DAILY KPI</p>
                    <p className="text-[10px] text-foreground">{p.dailyKPI}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-[9px] font-semibold text-destructive">WARNING SIGNAL</p>
                    <p className="text-[10px] text-foreground">{p.warningSignal}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── REVENUE ENGINE ── */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          {revenueStreams.map((rs, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <rs.icon className="h-4 w-4 text-primary" /> {rs.stream}
                  <Badge variant="outline" className="text-[9px]">{rs.timeline}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  {rs.tactics.map((t, j) => (
                    <div key={j} className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                      <p className="text-xs text-foreground">{t.tactic}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 italic">🧠 {t.psychology}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {rs.milestones.map((m, k) => (
                    <div key={k} className="p-2 rounded-lg bg-chart-2/5 border border-chart-2/20 text-center">
                      <p className="text-[9px] font-semibold text-chart-2">{m.day}</p>
                      <p className="text-[10px] text-foreground font-medium">{m.target}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Revenue Ramp */}
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-chart-2" /> Revenue Ramp Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {revenueRamp.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-border/30">
                  <Badge variant="outline" className="text-[9px] min-w-[60px] justify-center">{r.week}</Badge>
                  <p className="text-sm font-bold text-foreground min-w-[70px]">{r.target}</p>
                  <p className="text-[10px] text-muted-foreground">{r.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── WAR SIMULATION ── */}
        <TabsContent value="war-sim" className="mt-4 space-y-4">
          {warScenarios.map((ws, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ws.icon className="h-4 w-4 text-primary" /> {ws.scenario}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[8px] text-muted-foreground">Complexity</p>
                      <div className="flex items-center gap-1">
                        <Progress value={ws.complexity} className="h-1.5 w-12" />
                        <span className={cn("text-xs font-bold", ws.complexity > 70 ? "text-destructive" : "text-chart-4")}>{ws.complexity}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-muted-foreground">Moat Impact</p>
                      <span className={cn("text-xs font-bold", ws.moatImpact >= 70 ? "text-chart-2" : "text-chart-4")}>{ws.moatImpact}/100</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{ws.description}</p>
                <Badge variant="outline" className="text-[9px]">{ws.timeline}</Badge>

                <div className="grid grid-cols-3 gap-2">
                  {(["best", "realistic", "downside"] as const).map(k => (
                    <div key={k} className={cn("p-2 rounded-lg text-center border", k === "best" ? "bg-chart-2/5 border-chart-2/20" : k === "realistic" ? "bg-chart-4/5 border-chart-4/20" : "bg-destructive/5 border-destructive/20")}>
                      <p className="text-[8px] font-semibold uppercase text-muted-foreground">{k}</p>
                      <p className="text-[10px] font-medium text-foreground">{ws.revenue[k]}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-[9px] font-semibold text-chart-2">✅ Benefits</p>
                    {ws.benefits.map((b, j) => <p key={j} className="text-[10px] text-foreground">• {b}</p>)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-semibold text-destructive">⚠ Risks</p>
                    {ws.risks.map((r, j) => <p key={j} className="text-[10px] text-foreground">• {r}</p>)}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-[9px] font-semibold text-primary">MITIGATION</p>
                  <p className="text-[10px] text-foreground">{ws.mitigations}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── TOP RISKS ── */}
        <TabsContent value="risks" className="mt-4 space-y-2">
          {topRisks.map((r, i) => (
            <Card key={i} className={cn("border-border", r.severity === "CRITICAL" && "border-destructive/30 bg-destructive/5")}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-muted-foreground">#{r.priority}</span>
                    <p className="text-xs font-semibold text-foreground">{r.risk}</p>
                  </div>
                  <Badge variant={r.severity === "CRITICAL" ? "destructive" : r.severity === "HIGH" ? "default" : "secondary"} className="text-[8px]">{r.severity}</Badge>
                </div>
                <div className="pl-6 border-l-2 border-chart-2/30">
                  <p className="text-[11px] text-foreground">{r.mitigation}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── FOUNDER FOCUS ── */}
        <TabsContent value="founder" className="mt-4 space-y-3">
          {founderChecklist.map((cat, ci) => (
            <Card key={ci} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{cat.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {cat.items.map((item, ii) => {
                  const key = `f${ci}-${ii}`;
                  return (
                    <div key={ii} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-border/30">
                      <Checkbox checked={!!checkedFounder[key]} onCheckedChange={() => toggle(key, setCheckedFounder)} />
                      <p className={cn("text-xs text-foreground", checkedFounder[key] && "line-through opacity-50")}>{item}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SixtyDayDominationBlueprint;
