import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Target, Users, MessageSquare, Send, TrendingUp, Zap, Building,
  Shield, Brain, ChevronRight, AlertTriangle, CheckCircle, Copy,
  Rocket, Flame, DollarSign, MapPin, Clock, Phone, Star,
  Trophy, BarChart3, Timer, Crosshair, Handshake
} from "lucide-react";
import { toast } from "sonner";

const anim = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

function cp(t: string) { navigator.clipboard.writeText(t); toast.success("Copied"); }

const CopyBlock = ({ text, label }: { text: string; label?: string }) => (
  <div className="relative">
    {label && <Badge variant="secondary" className="text-[10px] mb-2">{label}</Badge>}
    <pre className="text-xs bg-muted p-3 rounded-lg whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => cp(text)}>
      <Copy className="w-3 h-3" />
    </Button>
  </div>
);

// ═══════════════════════════════════════════════════════
// MILESTONE PHASES
// ═══════════════════════════════════════════════════════
const MILESTONES = [
  { deals: 10, label: "Proof Phase", desc: "Validate transaction flow works end-to-end", color: "text-primary" },
  { deals: 30, label: "Liquidity Momentum", desc: "Enough deals to show pattern + attract agents", color: "text-primary" },
  { deals: 60, label: "Market Authority", desc: "Credibility attracts organic supply + demand", color: "text-primary" },
  { deals: 100, label: "Self-Reinforcing", desc: "Flywheel active — growth compounds organically", color: "text-primary" },
];

// ═══════════════════════════════════════════════════════
// A — DEAL SOURCING STRATEGY
// ═══════════════════════════════════════════════════════
const SOURCING_TACTICS = [
  {
    tactic: "Motivated Seller Hunt",
    icon: Crosshair,
    daily: [
      "Scan OLX/Rumah123 for listings with 3+ price drops — owners are desperate",
      "Search 'BU' (Butuh Uang) keyword in property groups — urgent sellers",
      "Contact listings older than 90 days on competitor portals — offer faster route",
      "Check auction listings from banks (BTN, Mandiri) — distressed inventory",
    ],
    script: `Halo [Nama], saya lihat properti Anda sudah listing cukup lama. Kami punya platform baru dengan AI buyer-matching yang bisa percepat penjualan.

Saat ini ada [X] investor aktif yang mencari properti di area Anda.

Listing gratis, dan kami bantu pricing strategy berdasarkan data pasar.

Mau coba? Saya bisa bantu setup dalam 10 menit. 🏡`,
  },
  {
    tactic: "Fast-Converting Price Bands",
    icon: DollarSign,
    daily: [
      "Focus Rp 1-5B range — highest conversion probability for individual investors",
      "Secondary: Rp 500M-1B — volume play, rental yield buyers",
      "Luxury play: Rp 8-15B — fewer deals but larger commissions, target HNW",
      "Land plots Rp 200M-2B — fastest closing cycle, fewer complications",
    ],
    script: `[Nama], saya punya data menarik — properti di kisaran Rp [X]-[Y]B di area Anda itu paling cepat closing sekarang.

Average time-to-sale: [Z] hari.

Kalau properti Anda di range ini, ASTRA bisa prioritaskan ke investor pool kami.

Tertarik untuk discuss? Bisa call 15 menit?`,
  },
  {
    tactic: "Micro-Location Focus",
    icon: MapPin,
    daily: [
      "Week 1-2: Canggu + Seminyak (highest demand velocity)",
      "Week 3-4: Uluwatu + Ubud (premium segment)",
      "Month 2: Jakarta Selatan + BSD (volume market)",
      "Month 3: Expand to Lombok, Bandung, Surabaya based on signal data",
    ],
    script: `Hi [Nama], ASTRA sedang fokus membangun marketplace terkuat di [Area].

Kami sudah punya [X] listing dan [Y] investor aktif di zona ini.

Sebagai early partner, properti Anda akan mendapat priority placement + AI-powered marketing.

Mau join sebagai featured listing? Gratis untuk 30 hari pertama.`,
  },
];

// ═══════════════════════════════════════════════════════
// B — INVESTOR MATCHING
// ═══════════════════════════════════════════════════════
const MATCHING_SCRIPTS = [
  {
    scenario: "High-Intent Match Alert",
    icon: Zap,
    text: `🎯 *INVESTOR MATCH — ACTION REQUIRED*

[Investor Name] just showed HIGH INTENT on [Property]:
• Viewed 4 times in 2 days
• Saved to watchlist
• Opened ROI calculator
• Viewed escrow info page

AI Intent Score: 87/100

Recommended action: Send personalized deal brief within 2 hours.

---

Message to investor:

Hi [Investor], I noticed you've been researching [Property] closely. Smart choice — our AI rates it 84/100 for investment quality.

I have some insider data on this one:
• Comparable sales in the area: Rp [X]B average
• This listing: Rp [Y]B ([Z]% below)
• Projected 12-month appreciation: [A]%

Would a 10-min walkthrough of the numbers be helpful?

I can also arrange a virtual or in-person viewing this week.`,
  },
  {
    scenario: "Deal Alert Broadcast",
    icon: Flame,
    text: `🔥 *DEAL ALERT — 48 HOUR WINDOW*

New listing just dropped that matches your criteria:

📍 [Location]
🏠 [Type] — [Size]
💰 Rp [Price]B (AI estimate: Rp [Higher]B)
📊 Yield: [X]% projected
⚡ Liquidity score: [Y]/100

Why this is special:
• [Specific advantage — e.g., motivated seller, below construction cost]
• [Social proof — e.g., 3 investors already inquired]

⏰ First investor to schedule viewing gets priority.

Reply "VIEW" to book a walkthrough.
Reply "BRIEF" for the full investment package.`,
  },
  {
    scenario: "Quick Viewing Commitment Push",
    icon: Phone,
    text: `Hi [Name], quick update on [Property]:

Since yesterday:
• 2 new investors inquired
• 1 viewing scheduled for this weekend

The seller told me they'll review all offers next Monday.

I'd recommend viewing this week if you're serious. I can arrange:
• Tomorrow morning (9-11 AM)
• Saturday afternoon (2-4 PM)

Which works better? I'll block the slot for you.

(If you can't view in person, I can do a live video walkthrough — takes 15 min.)`,
  },
];

// ═══════════════════════════════════════════════════════
// C — NEGOTIATION ACCELERATION
// ═══════════════════════════════════════════════════════
const NEGOTIATION_PLAYS = [
  {
    stage: "Inquiry → Negotiation (Speed Push)",
    icon: Timer,
    psychology: "Reduce decision gap with data + urgency",
    script: `[Name], thanks for your inquiry on [Property]. Let me give you a quick reality check on this one:

📊 The data:
• Listed: Rp [X]B
• AI fair value: Rp [Y]B
• Days on market: [Z]
• Other active inquiries: [N]
• Seller motivation level: [High/Medium]

My honest assessment: this is a [strong/fair/aggressive] entry point.

Here's what I'd recommend:
1. Schedule a viewing within 48 hours
2. I'll prepare a comparative analysis for your negotiation
3. If you like it, we can submit an offer with escrow protection

No commitment until you see it. Want me to block a slot?`,
  },
  {
    stage: "Decision Hesitation Breaker",
    icon: AlertTriangle,
    psychology: "Loss aversion + social proof + anchoring",
    script: `[Name], I want to be transparent with you about [Property]:

The situation:
• 3 investors have viewed this week
• 1 has indicated they're preparing an offer
• The seller is likely to accept the first strong offer

I've seen properties like this close within [X] days in the current market.

I'm not trying to pressure you — but I'd hate for you to miss a good opportunity because of timing.

Can we do a quick 10-min call to discuss your concerns? If it's not right for you, I'll tell you honestly. But if it is, we should move.`,
  },
  {
    stage: "Scarcity + Exclusivity Frame",
    icon: Shield,
    psychology: "Exclusive access perception + competitive urgency",
    script: `[Name], I have a privileged update for you:

The owner of [Property] has agreed to consider pre-market offers before officially relisting at a higher price next week.

Current window: Rp [X]B
Expected new price: Rp [Y]B (+[Z]%)

This is a [48-hour/72-hour] window for existing contacts only.

If you submit an offer at or near asking price with escrow backing, you have a very strong position.

Shall I draft an offer framework for your review?`,
  },
  {
    stage: "Buyer-Seller Expectation Alignment",
    icon: Handshake,
    psychology: "Bridge the gap with rational framework",
    script: `[Name], I've been in discussion with both sides. Here's where we stand:

Seller's position: Rp [X]B (firm)
Your offer: Rp [Y]B
Gap: Rp [Z]M ([%])

My recommendation based on market data:
• Fair value range: Rp [A]B — [B]B
• Recent comparables support: Rp [C]B

Suggested landing zone: Rp [D]B

This gives you [E]% below fair value, and the seller gets a reasonable outcome.

I believe the seller will accept at Rp [D]B if we move quickly and show commitment through escrow deposit (refundable during due diligence).

Want me to present this?`,
  },
];

// ═══════════════════════════════════════════════════════
// D — CLOSING WORKFLOW
// ═══════════════════════════════════════════════════════
const CLOSING_STEPS = [
  { day: "Day 0", action: "Price Agreement", detail: "Confirm agreed price + terms in writing. Send formal offer summary via platform.", trigger: "\"Let me confirm the terms so we're both clear and protected.\"" },
  { day: "Day 0-1", action: "Escrow Initiation", detail: "Guide buyer through escrow deposit (1-2% or min Rp 2M). Emphasize refundable during DD.", trigger: "\"Your deposit is fully protected in our escrow system. It's refundable if any red flags emerge during verification.\"" },
  { day: "Day 1-3", action: "Document Collection", detail: "Request: certificate of ownership, tax records, building permit. Verify via platform checklist.", trigger: "\"I just need 3 documents to verify everything. Most sellers have these ready — takes 10 minutes.\"" },
  { day: "Day 3-7", action: "Due Diligence", detail: "AI-assisted property verification. Flag any anomalies. Share verification report with buyer.", trigger: "\"Great news — our verification came back clean. Here's the full report for your records.\"" },
  { day: "Day 7-10", action: "Final Negotiation", detail: "Address any DD findings. Adjust price if needed. Confirm final terms.", trigger: "\"Based on our verification, everything checks out. Are you ready to proceed to final terms?\"" },
  { day: "Day 10-14", action: "Final Payment + Transfer", detail: "Release escrow to seller. Initiate ownership transfer. Platform commission collected.", trigger: "\"Congratulations! The deal is closed. Here's your ownership transfer confirmation.\"" },
  { day: "Day 14+", action: "Post-Close Momentum", detail: "Request testimonial. Ask for referral. Publish deal as social proof. Update platform metrics.", trigger: "\"Would you mind sharing a quick testimonial? It helps other investors trust the process — and I'd love to find you your next opportunity.\"" },
];

// ═══════════════════════════════════════════════════════
// E — MOMENTUM PERCEPTION
// ═══════════════════════════════════════════════════════
const MOMENTUM_ACTIONS = [
  { action: "Deal Spotlight Post", schedule: "Every closed deal", template: "🎉 DEAL CLOSED — [Property Type] in [Location]\n\n• Listed for [X] days\n• Final price: Rp [Y]B\n• Investor ROI projection: [Z]%\n\nAnother successful transaction on ASTRA. Our AI-verified process delivered a smooth closing in [N] days.\n\n🔐 Escrow-protected. ✅ AI-verified. 🚀 Fast execution.\n\n#ASTRAVilla #DealClosed #PropertyInvestment" },
  { action: "Weekly Market Signal", schedule: "Every Monday", template: "📊 ASTRA Weekly Signal — [Date]\n\n• Active listings: [X]\n• Investor inquiries this week: [Y]\n• Deals in negotiation: [Z]\n• Average time to close: [N] days\n• Hottest zone: [Location]\n\nThe market is moving. Are you positioned?\n\n→ astra-villa.com" },
  { action: "Fastest-Selling Highlight", schedule: "Bi-weekly", template: "⚡ SPEED RECORD — [Property] sold in [X] days\n\nWhy it moved fast:\n• Priced at AI-verified fair value\n• High-demand micro-location\n• Seller offered flexible terms\n• 5 investors competed\n\nLesson: Well-priced properties in hot zones don't last.\n\nSee what's available now → astra-villa.com" },
  { action: "Investor Testimonial", schedule: "After every 5th deal", template: "\"I was skeptical about buying property through a platform. But ASTRA's AI analysis gave me confidence in the numbers, and the escrow system made me feel safe. Closed in [X] days.\"\n\n— [Investor Name], [Location]\n\nJoin [N]+ investors who trust ASTRA. → astra-villa.com" },
  { action: "Liquidity Proof Update", schedule: "Monthly", template: "📈 ASTRA Platform Growth — [Month]\n\n• Total deals closed: [X] (+[Y]% MoM)\n• Total transaction volume: Rp [Z]B\n• Average deal size: Rp [A]B\n• Investor satisfaction: [B]/5.0\n• Repeat investors: [C]%\n\nMarketplace liquidity is accelerating. 🚀" },
];

// ═══════════════════════════════════════════════════════
// F — KPI TARGETS
// ═══════════════════════════════════════════════════════
interface WeeklyTarget { metric: string; target: number; icon: React.ElementType; recovery: string }
const WEEKLY_TARGETS: WeeklyTarget[] = [
  { metric: "Deals Initiated (Inquiries)", target: 15, icon: MessageSquare, recovery: "Increase outreach volume by 50%. Send 3 deal alerts to existing investor base. Add 5 new listings from motivated sellers." },
  { metric: "Deals in Negotiation", target: 5, icon: Target, recovery: "Follow up every inquiry within 4 hours. Use urgency scripts on stalled leads. Offer virtual viewings to remove friction." },
  { metric: "Deals Closed", target: 2, icon: Trophy, recovery: "Identify 3 closest-to-close deals. Apply final commitment triggers. Offer escrow deposit incentives (reduced minimums). Personal call from founder." },
  { metric: "Investor Re-engagement", target: 8, icon: Users, recovery: "Send personalized 'new opportunity' to dormant leads. Share recent deal closes as proof. Offer exclusive early access to new listings." },
  { metric: "Listing Conversion Ratio", target: 20, icon: BarChart3, recovery: "Improve listing quality (better photos, AI descriptions). Adjust pricing on stale listings. Add virtual tour content." },
];

const First100DealsWarRoom: React.FC = () => {
  const [closedDeals, setClosedDeals] = useState(0);
  const currentMilestone = MILESTONES.find(m => closedDeals < m.deals) || MILESTONES[MILESTONES.length - 1];
  const overallProgress = Math.min(100, Math.round((closedDeals / 100) * 100));

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={stagger}>
      {/* Header */}
      <motion.div variants={anim} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" /> First 100 Deals War Room
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Battlefield execution plan to close 100 real estate deals</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Deals Closed</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => setClosedDeals(Math.max(0, closedDeals - 1))}>-</Button>
              <span className="text-2xl font-bold tabular-nums">{closedDeals}</span>
              <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => setClosedDeals(closedDeals + 1)}>+</Button>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Milestone Progress */}
      <motion.div variants={anim}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress to 100 Deals</span>
              <Badge>{overallProgress}%</Badge>
            </div>
            <Progress value={overallProgress} className="h-3 mb-4" />
            <div className="grid grid-cols-4 gap-2">
              {MILESTONES.map((m) => {
                const reached = closedDeals >= m.deals;
                return (
                  <div key={m.deals} className={`p-3 rounded-lg border text-center transition-all ${reached ? "bg-primary/10 border-primary/40" : "bg-card border-border"}`}>
                    <div className="text-lg font-bold">{m.deals}</div>
                    <div className="text-[10px] font-medium">{m.label}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{m.desc}</div>
                    {reached && <CheckCircle className="w-4 h-4 text-primary mx-auto mt-1" />}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 p-2 rounded bg-primary/5 border border-primary/20">
              <p className="text-xs"><span className="font-medium text-primary">Current Phase:</span> {currentMilestone.label} — {currentMilestone.desc}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="sourcing" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="sourcing" className="text-xs">🎯 Sourcing</TabsTrigger>
          <TabsTrigger value="matching" className="text-xs">⚡ Matching</TabsTrigger>
          <TabsTrigger value="negotiation" className="text-xs">🗣️ Negotiate</TabsTrigger>
          <TabsTrigger value="closing" className="text-xs">🔐 Closing</TabsTrigger>
          <TabsTrigger value="momentum" className="text-xs">📣 Momentum</TabsTrigger>
          <TabsTrigger value="kpis" className="text-xs">📊 KPIs</TabsTrigger>
        </TabsList>

        {/* Sourcing Tab */}
        <TabsContent value="sourcing" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {SOURCING_TACTICS.map((s) => (
              <motion.div key={s.tactic} variants={anim}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <s.icon className="w-4 h-4 text-primary" /> {s.tactic}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      {s.daily.map((d, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <ChevronRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                    <CopyBlock text={s.script} label="Outreach Script" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Matching Tab */}
        <TabsContent value="matching" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {MATCHING_SCRIPTS.map((m) => (
              <motion.div key={m.scenario} variants={anim}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <m.icon className="w-4 h-4 text-primary" /> {m.scenario}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CopyBlock text={m.text} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Negotiation Tab */}
        <TabsContent value="negotiation" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {NEGOTIATION_PLAYS.map((n) => (
              <motion.div key={n.stage} variants={anim}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <n.icon className="w-4 h-4 text-primary" /> {n.stage}
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground">Psychology: {n.psychology}</p>
                  </CardHeader>
                  <CardContent>
                    <CopyBlock text={n.script} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Closing Tab */}
        <TabsContent value="closing" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {CLOSING_STEPS.map((step, i) => (
              <motion.div key={i} variants={anim}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-20">
                        <Badge variant="outline" className="text-[10px] w-full justify-center">{step.day}</Badge>
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium">{step.action}</p>
                        <p className="text-xs text-muted-foreground">{step.detail}</p>
                        <div className="p-2 rounded bg-primary/5 border border-primary/20">
                          <p className="text-[10px] text-primary font-medium mb-0.5">Trigger Language</p>
                          <p className="text-xs italic">{step.trigger}</p>
                          <Button size="sm" variant="ghost" className="h-5 mt-1 text-[10px]" onClick={() => cp(step.trigger)}>
                            <Copy className="w-3 h-3 mr-1" /> Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Momentum Tab */}
        <TabsContent value="momentum" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {MOMENTUM_ACTIONS.map((m, i) => (
              <motion.div key={i} variants={anim}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{m.action}</CardTitle>
                      <Badge variant="secondary" className="text-[10px]">{m.schedule}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CopyBlock text={m.template} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            <motion.div variants={anim}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Weekly Performance Targets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {WEEKLY_TARGETS.map((t) => (
                    <div key={t.metric} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <t.icon className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium">{t.metric}</span>
                        </div>
                        <Badge>{t.target}{t.metric.includes("Ratio") ? "%" : ""}/week</Badge>
                      </div>
                      <div className="mt-2 p-2 rounded bg-destructive/5 border border-destructive/20">
                        <p className="text-[10px] text-destructive font-medium mb-0.5">🔄 Recovery Plan (if missed)</p>
                        <p className="text-[10px] text-muted-foreground">{t.recovery}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={anim}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Deal Velocity Formula</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { phase: "Deals 1-10", timeline: "Week 1-4", strategy: "Founder-led, hand-hold every deal, accept lower margins for velocity" },
                      { phase: "Deals 11-30", timeline: "Week 5-10", strategy: "Activate 3-5 agent partners, delegate viewings, focus on closing" },
                      { phase: "Deals 31-60", timeline: "Week 11-18", strategy: "Agent network drives supply + viewings, founder focuses on investor activation" },
                      { phase: "Deals 61-100", timeline: "Week 19-26", strategy: "Platform-driven matching, AI recommendations active, minimal founder intervention" },
                    ].map((p) => (
                      <div key={p.phase} className="flex items-start gap-3 p-2 rounded bg-muted">
                        <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">{p.phase}</Badge>
                        <div>
                          <p className="text-[10px] text-primary font-medium">{p.timeline}</p>
                          <p className="text-xs">{p.strategy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default First100DealsWarRoom;
