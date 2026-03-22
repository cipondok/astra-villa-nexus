
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Timer, Users, BarChart3, ClipboardCheck, AlertTriangle, Copy, Check, Target, TrendingUp, Zap, Eye, Shield, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const anim = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

const CopyBlock = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="text-xs bg-muted/50 border border-border/40 rounded-lg p-3 whitespace-pre-wrap font-mono">{text}</pre>
      <Button size="sm" variant="ghost" className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); toast.success('Copied'); setTimeout(() => setCopied(false), 1500); }}>
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
};

const fastDealCycle = {
  delays: [
    { cause: 'Slow viewing scheduling (avg 4-7 days)', impact: 94, fix: 'Instant slot suggestion engine: agent pre-sets available windows; buyer picks in 1 tap' },
    { cause: 'Fragmented buyer-agent communication', impact: 88, fix: 'Centralized chat thread per inquiry with auto-reminders at 4hr, 12hr, 24hr intervals' },
    { cause: 'Unclear negotiation milestones', impact: 82, fix: 'Visual deal tracker: Inquiry → Viewing → Offer → Counter → Accept → Close with SLA per stage' },
    { cause: 'Long financing confirmation (2-4 weeks)', impact: 78, fix: 'Pre-qualify buyers at inquiry stage; partner bank fast-track pre-approval (48hr target)' },
  ],
  timeline: [
    { stage: 'Inquiry → Viewing', targetDays: '1–3', sla: 'Agent response <5min; viewing scheduled <48hrs', actions: ['Instant inquiry notification to agent', 'Auto-suggest 3 viewing slots', 'Pre-viewing brief sent 24hrs before'], bottleneck: 'Agent delay → escalate at 24hr' },
    { stage: 'Viewing → Offer', targetDays: '1–5', sla: 'Post-viewing follow-up <4hrs; offer facilitation <72hrs', actions: ['Same-day "How was the viewing?" follow-up', 'Share comparable pricing data', 'Provide guided offer submission form'], bottleneck: 'Buyer indecision → send urgency signal at Day 3' },
    { stage: 'Offer → Acceptance', targetDays: '2–7', sla: 'Seller response <48hrs; counter-offer within 24hrs', actions: ['Structured offer presentation to seller', 'Comparable market evidence package', '24hr/48hr seller nudge automation'], bottleneck: 'Seller silence → founder call at 72hr' },
    { stage: 'Acceptance → Close', targetDays: '14–30', sla: 'Legal docs initiated <48hrs; financing confirmed <14 days', actions: ['Document checklist auto-generated', 'Partner notary/lawyer fast-track', 'Weekly progress milestone updates'], bottleneck: 'Financing delay → bank escalation contact' },
  ],
  accelerationWorkflow: `⚡ DEAL SPEED TRACKER — [Property Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Current Stage: [Stage]
⏱️ Days in Deal: [X] / Target: [Y]
📊 Speed Score: [X]/100

STAGE TIMELINE:
✅ Inquiry received — Day 0
✅ Agent responded — Day 0 (4 min) ✓
✅ Viewing scheduled — Day 1 ✓
✅ Viewing completed — Day 2 ✓
🔄 Offer submitted — Day 4
⏳ Seller response — Waiting (SLA: 48hrs)
○ Acceptance — Pending
○ Legal/Finance — Pending
○ Closing — Pending

⚠️ ALERTS:
• Seller response due in [X] hours
• [Action needed if overdue]

🎯 PREDICTED CLOSE: Day [X] ([Date])`,
  interventionTriggers: [
    { trigger: 'Agent no-response >4 hours', action: 'Auto-reassign to backup agent + notify team lead', priority: 'Critical' },
    { trigger: 'Viewing not scheduled >48 hours', action: 'Platform team manually coordinates viewing', priority: 'High' },
    { trigger: 'No offer >5 days post-viewing', action: 'Send buyer decision support package + urgency signal', priority: 'Medium' },
    { trigger: 'Seller silence >48 hours on offer', action: 'Founder/team direct call to seller agent', priority: 'Critical' },
    { trigger: 'Financing unconfirmed >14 days', action: 'Escalate to partner bank relationship manager', priority: 'High' },
  ],
  kpis: [
    { metric: 'Avg Inquiry-to-Offer', target: '≤7 days', current: '18 days' },
    { metric: 'Avg Offer-to-Close', target: '≤21 days', current: '42 days' },
    { metric: 'Viewing Scheduling Speed', target: '≤48 hrs', current: '5 days' },
    { metric: 'Deal Cycle Reduction', target: '-50% vs baseline', current: 'Baseline' },
  ],
};

const competitionSignaling = {
  indicators: [
    { signal: 'Inquiry Count Badge', display: '"[X] orang tertarik properti ini"', rule: 'Show when ≥3 unique inquiries in 7 days', ethicCheck: 'Only count verified unique users; refresh daily' },
    { signal: 'Viewing Demand Indicator', display: '"[X] viewing dijadwalkan minggu ini"', rule: 'Show when ≥2 viewings scheduled', ethicCheck: 'Count confirmed bookings only; no inflated numbers' },
    { signal: 'Trending Badge', display: '"🔥 Trending di [District]"', rule: 'Top 10% most-viewed listings in area this week', ethicCheck: 'Based on verified view data; auto-remove when no longer qualifying' },
    { signal: 'Recently Viewed Counter', display: '"Dilihat [X] kali dalam 24 jam terakhir"', rule: 'Show when ≥10 unique views in 24hrs', ethicCheck: 'Unique sessions only; exclude bot traffic' },
    { signal: 'Similar Properties Sold', display: '"Properti serupa di area ini terjual dalam [X] hari"', rule: 'Based on actual platform transaction data', ethicCheck: 'Only use verified closed deals; show date range' },
  ],
  momentumMessages: [
    { scenario: 'High-demand listing', message: `🏠 Properti ini sangat diminati!

📊 Aktivitas minggu ini:
• [X] inquiry dari buyer serius
• [Y] viewing sudah dijadwalkan
• Properti serupa terjual dalam [Z] hari

💡 Tip: Jadwalkan viewing lebih awal untuk prioritas.

👉 Booking viewing: [link]`, tone: 'Informative urgency' },
    { scenario: 'Post-viewing no-offer', message: `Terima kasih sudah viewing [Property Name]! 🏠

📊 Update sejak viewing Anda:
• [X] buyer lain juga sudah viewing
• [Y] inquiry baru masuk minggu ini
• Harga di area ini naik [Z]% dalam 3 bulan

💭 Masih mempertimbangkan? 
Kami bisa bantu analisa apakah harga ini kompetitif.

👉 Submit offer: [link]
📞 Diskusi: [agent phone]`, tone: 'Supportive momentum' },
    { scenario: 'Listing with limited stock', message: `⚡ Hanya [X] properti tersisa di [District] 
dalam range Rp [Min]–[Max]

Demand tinggi + supply terbatas = 
window of opportunity yang sempit.

🏠 Rekomendasi untuk Anda:
1. [Property] — Rp [Price]
2. [Property] — Rp [Price]

👉 Viewing tersedia: [link]`, tone: 'Scarcity-driven' },
  ],
  trustSafeguards: [
    { principle: 'Data Accuracy', rule: 'All competition signals must use verified, real-time data only', violation: 'Inflating numbers → immediate badge removal + audit' },
    { principle: 'No Fabrication', rule: 'Never show fake inquiry counts, phantom buyers, or manufactured urgency', violation: 'Any fabrication → feature suspension + public correction' },
    { principle: 'Transparency', rule: 'Show methodology: "Based on [X] verified inquiries in last 7 days"', violation: 'Vague claims → requires clarification disclosure' },
    { principle: 'Calm Tone', rule: 'Frame as opportunity intelligence, not pressure tactics', violation: 'Aggressive language → copy revision required' },
    { principle: 'Opt-Out Respect', rule: 'Buyers can disable competition signals in settings', violation: 'Ignoring preference → immediate correction' },
  ],
  kpis: [
    { metric: 'Offer Submission Rate Increase', target: '+35% vs no-signal baseline' },
    { metric: 'Viewing Commitment Speed', target: '-40% decision time' },
    { metric: 'Buyer Trust Score', target: '≥4.5/5 on transparency survey' },
    { metric: 'Signal Accuracy Rate', target: '≥98% verified data' },
  ],
};

const liquidityScore = {
  formula: [
    { component: 'Inquiry Velocity', weight: 30, description: 'Number of inquiries per active listing in district (7-day rolling)', scoring: '0–2: Low | 2–5: Medium | 5+: High' },
    { component: 'Listing Density', weight: 20, description: 'Active listings per km² in district', scoring: '<5: Sparse | 5–15: Normal | 15+: Dense' },
    { component: 'Viewing Activity', weight: 25, description: 'Viewings scheduled/completed per week in district', scoring: '0–3: Cold | 3–10: Warm | 10+: Hot' },
    { component: 'Transaction Velocity', weight: 15, description: 'Deals closed in district in last 30 days', scoring: '0: Dormant | 1–3: Active | 3+: Liquid' },
    { component: 'Price Movement', weight: 10, description: 'Avg price change trend in last 90 days', scoring: 'Declining: Caution | Stable: Neutral | Rising: Momentum' },
  ],
  tiers: [
    { score: '85–100', label: '🔴 VERY HIGH LIQUIDITY', meaning: 'Extremely active market — properties moving fast, strong buyer competition', buyerGuidance: 'Act quickly; expect competitive offers; pre-prepare financing', vendorGuidance: 'Strong pricing position; consider premium listing for maximum visibility' },
    { score: '65–84', label: '🟠 HIGH LIQUIDITY', meaning: 'Active demand with good transaction velocity', buyerGuidance: 'Good opportunities available; moderate competition; view within 1 week', vendorGuidance: 'Competitive pricing will generate fast inquiry; boost listing visibility' },
    { score: '40–64', label: '🟡 MODERATE LIQUIDITY', meaning: 'Balanced market with steady but not urgent activity', buyerGuidance: 'Negotiate confidently; explore multiple options; take measured approach', vendorGuidance: 'Competitive pricing important; ensure listing quality stands out' },
    { score: '20–39', label: '🟢 EMERGING LIQUIDITY', meaning: 'Growing interest but not yet liquid — potential early-mover opportunity', buyerGuidance: 'Strong negotiation position; may find below-market deals', vendorGuidance: 'Pricing flexibility may be needed; focus on unique property advantages' },
    { score: '0–19', label: '⚪ LOW LIQUIDITY', meaning: 'Limited market activity — long holding periods likely', buyerGuidance: 'Significant negotiation leverage; verify long-term area fundamentals', vendorGuidance: 'Consider price adjustment; highlight development/infrastructure potential' },
  ],
  displayTemplate: `📊 LIQUIDITY SCORE — [District Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Overall Score: [X]/100 — [Tier Label]
📅 Updated: [Date]

COMPONENT BREAKDOWN:
▰▰▰▰▱ Inquiry Velocity: [X]/30
▰▰▰▱▱ Listing Density: [X]/20  
▰▰▰▰▰ Viewing Activity: [X]/25
▰▰▱▱▱ Transaction Velocity: [X]/15
▰▰▰▱▱ Price Movement: [X]/10

📈 TREND: [↑ Rising / → Stable / ↓ Cooling]
vs Last Month: [+/-X points]

🏠 FOR BUYERS:
[Tier-specific buyer guidance]

🏢 FOR AGENTS:
[Tier-specific vendor guidance]

🔗 Explore properties in [District]: [link]`,
  kpis: [
    { metric: 'Score Page Engagement', target: '≥5% of visitors interact' },
    { metric: 'Listings in High-Liquidity Zones', target: '+30% after score launch' },
    { metric: 'Buyer Cross-Zone Exploration', target: '≥25% explore 2+ zones' },
    { metric: 'Score Accuracy vs Outcomes', target: '≥80% correlation' },
  ],
};

const weeklyChecklist = [
  { category: 'Deal Speed', items: ['Review avg inquiry-to-offer cycle vs 7-day target', 'Identify top 5 stuck deals — intervene directly', 'Check agent response SLA compliance rates', 'Audit viewing scheduling speed (<48hr target)'] },
  { category: 'Competition Signals', items: ['Verify all active competition badges use real data', 'Review signal-to-offer conversion improvement', 'Check buyer trust survey scores on transparency', 'Audit any flagged signal accuracy complaints'] },
  { category: 'Liquidity Scores', items: ['Refresh district liquidity scores with latest data', 'Track listing uploads in high-score zones', 'Monitor buyer engagement with score displays', 'Compare score predictions vs actual transaction outcomes'] },
  { category: 'Pipeline Health', items: ['Count active deals by stage in pipeline', 'Calculate expected close dates for top deals', 'Review financing confirmation timelines', 'Identify deals at risk of falling through'] },
];

const risks = [
  { signal: 'Deal cycle lengthening despite optimization efforts', severity: 90, mitigation: 'Deep-dive root cause analysis per stage; increase founder intervention on top 10 deals; add dedicated deal coordinator role' },
  { signal: 'Buyers perceiving competition signals as manipulative', severity: 92, mitigation: 'Immediate transparency audit; add visible methodology disclosure; reduce signal frequency; survey buyer trust sentiment' },
  { signal: 'Liquidity scores misaligning with actual market behavior', severity: 84, mitigation: 'Backtest scoring formula against 90-day transaction history; adjust component weights; add confidence interval display' },
  { signal: 'Agent SLA non-compliance remaining above 40%', severity: 86, mitigation: 'Implement progressive lead reduction for non-compliant agents; auto-reassignment at SLA breach; coaching program' },
  { signal: 'Financing delays blocking >30% of accepted offers', severity: 82, mitigation: 'Deepen bank partner fast-track agreements; pre-qualify buyers earlier in funnel; offer alternative financing pathways' },
];

const FastDealCycleBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Timer className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Fast Deal Cycle + Buyer Competition Signal + Liquidity Score</h2>
          <p className="text-sm text-muted-foreground">Transaction speed, ethical urgency & intelligence-driven decision support</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="speed" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="speed"><Timer className="h-4 w-4 mr-1.5" />Deal Speed</TabsTrigger>
        <TabsTrigger value="signals"><Users className="h-4 w-4 mr-1.5" />Competition Signals</TabsTrigger>
        <TabsTrigger value="liquidity"><BarChart3 className="h-4 w-4 mr-1.5" />Liquidity Score</TabsTrigger>
        <TabsTrigger value="weekly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Weekly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* DEAL SPEED TAB */}
      <TabsContent value="speed" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Cycle Delay Causes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {fastDealCycle.delays.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{d.cause}</span><Badge variant="outline" className="text-[10px]">{d.impact}%</Badge></div>
                    <Progress value={d.impact} className="h-1.5" />
                    <p className="text-[11px] text-muted-foreground">→ {d.fix}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Speed KPIs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {fastDealCycle.kpis.map((k, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30">
                    <span className="text-xs font-medium text-foreground">{k.metric}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge>
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">→ {k.target}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-chart-3" />Standardized Deal Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {fastDealCycle.timeline.map((s, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{s.stage}</span>
                    <div className="flex gap-1.5">
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{s.targetDays} days</Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1">SLA: {s.sla}</p>
                  <ul className="space-y-0.5">
                    {s.actions.map((a, j) => (
                      <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5"><span className="text-primary">▸</span>{a}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-destructive mt-1">⚠️ {s.bottleneck}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Deal Speed Tracker Template</CardTitle></CardHeader>
            <CardContent><CopyBlock text={fastDealCycle.accelerationWorkflow} /></CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(5)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-destructive" />Intervention Triggers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {fastDealCycle.interventionTriggers.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div>
                    <span className="text-xs font-medium text-foreground">{t.trigger}</span>
                    <p className="text-[11px] text-muted-foreground">→ {t.action}</p>
                  </div>
                  <Badge variant={t.priority === 'Critical' ? 'destructive' : 'outline'} className="text-[10px]">{t.priority}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* COMPETITION SIGNALS TAB */}
      <TabsContent value="signals" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4 text-chart-3" />Activity Indicators</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {competitionSignaling.indicators.map((ind, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{ind.signal}</span>
                  </div>
                  <p className="text-[11px] text-primary mb-0.5">Display: {ind.display}</p>
                  <p className="text-[10px] text-muted-foreground">Rule: {ind.rule}</p>
                  <p className="text-[10px] text-chart-3">✓ Ethics: {ind.ethicCheck}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {competitionSignaling.momentumMessages.map((m, i) => (
          <motion.div key={i} {...anim(i + 2)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{m.scenario}</CardTitle>
                  <Badge variant="outline" className="text-[10px]">{m.tone}</Badge>
                </div>
              </CardHeader>
              <CardContent><CopyBlock text={m.message} /></CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div {...anim(5)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Trust Safeguards</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {competitionSignaling.trustSafeguards.map((s, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{s.principle}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">📏 {s.rule}</p>
                  <p className="text-[10px] text-destructive">⚠️ Violation: {s.violation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(6)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Signal KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {competitionSignaling.kpis.map((k, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* LIQUIDITY SCORE TAB */}
      <TabsContent value="liquidity" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-chart-3" />Score Formula Components</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {liquidityScore.formula.map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{f.component}</span><Badge variant="outline" className="text-[10px]">{f.weight}%</Badge></div>
                  <Progress value={f.weight * 3.3} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground">{f.description}</p>
                  <p className="text-[10px] text-primary">{f.scoring}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Liquidity Tiers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {liquidityScore.tiers.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{t.label}</span>
                    <Badge variant="outline" className="text-[10px]">{t.score}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1">{t.meaning}</p>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <div className="text-[10px] p-1.5 rounded bg-primary/5 border border-primary/10">
                      <span className="font-medium text-primary">Buyer:</span> <span className="text-muted-foreground">{t.buyerGuidance}</span>
                    </div>
                    <div className="text-[10px] p-1.5 rounded bg-chart-3/5 border border-chart-3/10">
                      <span className="font-medium text-chart-3">Vendor:</span> <span className="text-muted-foreground">{t.vendorGuidance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Liquidity Score Display Template</CardTitle></CardHeader>
            <CardContent><CopyBlock text={liquidityScore.displayTemplate} /></CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Liquidity Intelligence KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {liquidityScore.kpis.map((k, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* WEEKLY CHECK TAB */}
      <TabsContent value="weekly" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeklyChecklist.map((cat, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">{cat.category}</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {cat.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-4 w-4 rounded border border-border/60 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </TabsContent>

      {/* RISKS TAB */}
      <TabsContent value="risks" className="space-y-4">
        {risks.map((r, i) => (
          <motion.div key={i} {...anim(i + 1)}>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${r.severity >= 85 ? 'text-destructive' : 'text-chart-3'}`} />
                    <span className="text-sm font-medium text-foreground">{r.signal}</span>
                  </div>
                  <Badge variant={r.severity >= 85 ? 'destructive' : 'outline'} className="text-[10px]">{r.severity}%</Badge>
                </div>
                <Progress value={r.severity} className="h-1.5 mb-2" />
                <p className="text-xs text-muted-foreground">⚡ {r.mitigation}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </TabsContent>
    </Tabs>
  </div>
);

export default FastDealCycleBlueprint;
