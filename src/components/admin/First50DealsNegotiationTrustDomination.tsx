import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Target, Rocket, MessageSquare, Shield, CheckCircle, AlertTriangle,
  TrendingUp, Clock, Users, Copy, Zap, Star, Heart, Eye
} from "lucide-react";
import { toast } from "sonner";

const copy = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

const fade = { hidden: { opacity: 0, y: 12 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }) };

/* ── SECTION 1: 50 Deals Scale Engine ─────────────────────────────────── */
const phases = [
  {
    phase: "Phase 1 — Pipeline Concentration (Deals 1–15)",
    weeks: "Week 1–4",
    color: "text-amber-400",
    tactics: [
      { t: "Hot 10 Listing Focus", d: "Identify top 10 listings by inquiry volume. Route 80% of agent effort here." },
      { t: "Daily Negotiation Tracker", d: "Track every active negotiation in a simple spreadsheet — status updated by 6PM daily." },
      { t: "Same-Week Viewing Clusters", d: "Schedule 3+ viewings per listing per week to create urgency." },
      { t: "Seller Response SLA", d: "Push sellers to respond to offers within 24 hours — no exceptions." },
    ],
    kpis: ["3+ deals/week", "Viewing-to-offer > 25%", "Negotiation cycle < 10 days"],
  },
  {
    phase: "Phase 2 — Conversion Momentum (Deals 16–35)",
    weeks: "Week 5–8",
    color: "text-emerald-400",
    tactics: [
      { t: "Offer Encouragement Blitz", d: "After every 2nd viewing, proactively suggest soft-offer conversation." },
      { t: "Competing Interest Signals", d: "Share real viewing count data with hesitant buyers to accelerate decisions." },
      { t: "Price Alignment Coaching", d: "Help sellers adjust expectations using comparable deal data." },
      { t: "Agent Closing Scorecard", d: "Rank agents by viewing-to-deal conversion. Share weekly." },
    ],
    kpis: ["5+ deals/week", "Offer submission rate +40%", "Average deal cycle < 8 days"],
  },
  {
    phase: "Phase 3 — Closing Consistency (Deals 36–50)",
    weeks: "Week 9–12",
    color: "text-blue-400",
    tactics: [
      { t: "Deal Progress Checklist", d: "Standardized 7-step checklist from viewing → offer → agreement → close." },
      { t: "Stalled Deal Intervention", d: "Any deal inactive 48+ hours gets founder/manager direct intervention." },
      { t: "Celebration & Proof Loop", d: "Every closed deal = public success story shared across channels." },
      { t: "Pipeline Depth Monitor", d: "Maintain 3x pipeline ratio: 150 active prospects for 50 closures." },
    ],
    kpis: ["50 cumulative deals", "Weekly closure consistency", "Pipeline-to-close ratio ≥ 3:1"],
  },
];

/* ── SECTION 2: Negotiation Confidence Scripts ────────────────────────── */
const scripts = [
  {
    title: "Value Alignment — WhatsApp Follow-Up",
    icon: MessageSquare,
    tone: "Advisory, confident",
    template: `Halo [Nama Buyer] 👋

Terima kasih sudah viewing properti di [Lokasi] kemarin.

Berdasarkan kriteria Anda — [budget/lokasi/tipe] — properti ini memang sangat cocok karena:
✅ [Keunggulan 1: lokasi strategis / harga kompetitif]
✅ [Keunggulan 2: potensi investasi / fasilitas lengkap]

Saat ini sudah ada [X] pihak lain yang juga tertarik. Kalau Anda serius, saya sarankan kita diskusikan range penawaran yang realistis minggu ini.

Kapan waktu yang nyaman untuk bicara 10 menit? 🙏`,
    en: `Hi [Buyer Name] 👋

Thanks for viewing the property at [Location] yesterday.

Based on your criteria — [budget/location/type] — this property is a strong match because:
✅ [Advantage 1: strategic location / competitive price]
✅ [Advantage 2: investment potential / full amenities]

Currently [X] other parties have shown serious interest. If you're committed, I suggest we discuss a realistic offer range this week.

When's a good time for a 10-minute call? 🙏`,
  },
  {
    title: "Risk Reduction — Phone Negotiation Guide",
    icon: Shield,
    tone: "Calm, reassuring",
    template: `SCRIPT TELEPON NEGOSIASI:

1. "Saya paham ini keputusan besar. Mari kita bahas step-by-step."
2. "Range negosiasi yang realistis untuk properti ini: [X] - [Y]."
3. "Proses selanjutnya sangat sederhana: [jelaskan 3 langkah]."
4. "Tidak ada tekanan — tapi perlu saya sampaikan bahwa window kesempatan ini terbatas."
5. "Bagaimana kalau kita target keputusan dalam [X hari] agar posisi Anda tetap kuat?"`,
    en: `PHONE NEGOTIATION SCRIPT:

1. "I understand this is a big decision. Let's walk through it step by step."
2. "The realistic negotiation range for this property is [X] - [Y]."
3. "Next steps are straightforward: [explain 3 steps]."
4. "No pressure — but I should let you know this opportunity window is limited."
5. "How about we aim for a decision within [X days] to keep your position strong?"`,
  },
  {
    title: "Commitment Acceleration — Offer Encouragement",
    icon: Zap,
    tone: "Urgent, opportunity-focused",
    template: `PESAN DORONGAN PENAWARAN:

"[Nama], berdasarkan data kami:
• Properti sejenis di area ini terjual dalam [X] hari rata-rata
• Sudah ada [Y] viewing terjadwal minggu ini
• Harga pasar menunjukkan tren [naik/stabil]

Saya sarankan submit penawaran awal di range [A-B] dalam 48 jam ke depan. Ini memberi Anda posisi negosiasi terkuat.

Mau saya bantu draft penawarannya sekarang?"`,
    en: `OFFER ENCOURAGEMENT MESSAGE:

"[Name], based on our data:
• Similar properties in this area sell within [X] days on average
• [Y] viewings are already scheduled this week
• Market pricing shows [upward/stable] trend

I recommend submitting an initial offer in the [A-B] range within the next 48 hours. This gives you the strongest negotiation position.

Shall I help draft the offer now?"`,
  },
];

/* ── SECTION 3: Local Trust Domination ────────────────────────────────── */
const trustPillars = [
  {
    pillar: "Transaction Proof Signaling",
    icon: CheckCircle,
    color: "text-emerald-400",
    actions: [
      "Post 'Deal Closed' stories after every successful transaction (anonymized if needed)",
      "Share weekly 'Active Viewings This Week' counter on social channels",
      "Create simple case studies: 'Buyer found dream home in 14 days via Astra'",
      "Display real-time activity feed showing inquiry and viewing momentum",
    ],
  },
  {
    pillar: "Community Awareness Activation",
    icon: Users,
    color: "text-blue-400",
    actions: [
      "Join and actively contribute to 5+ local property WhatsApp/Telegram groups",
      "Publish weekly 'District Opportunity Report' — top 3 deals in target area",
      "Partner with local property influencers for viewing livestreams",
      "Run 'Most Active Property Area' campaign highlighting deal velocity",
    ],
  },
  {
    pillar: "Vendor Confidence Reinforcement",
    icon: Star,
    color: "text-amber-400",
    actions: [
      "Send monthly 'Your Listing Performance Report' to every active agent",
      "Show inquiry volume advantage: 'Your listing received 12 inquiries this week'",
      "Offer referral bonus: agents who bring 3+ new listings get premium visibility",
      "Share platform growth metrics transparently with vendor community",
    ],
  },
];

/* ── SECTION 4: Weekly Checklist ──────────────────────────────────────── */
const weeklyChecklist = [
  { category: "Deal Pipeline", items: [
    "Review all active negotiations — flag any stalled > 48 hours",
    "Count offers submitted this week vs target",
    "Identify top 5 highest-probability deals for focused push",
    "Track viewing-to-offer conversion ratio",
  ]},
  { category: "Buyer Engagement", items: [
    "Follow up every post-viewing buyer within 4 hours",
    "Send negotiation confidence scripts to hesitant buyers",
    "Schedule next-week viewing clusters for hot listings",
    "Measure buyer response speed to follow-up messages",
  ]},
  { category: "Trust & Reputation", items: [
    "Publish at least 2 deal success signals (social/groups)",
    "Post district opportunity insights in local communities",
    "Send vendor performance reports to active agents",
    "Track inbound listing requests growth trend",
  ]},
  { category: "Revenue & Growth", items: [
    "Review weekly deal count vs milestone target",
    "Push premium listing upgrades on high-engagement inventory",
    "Measure cost per deal acquisition",
    "Plan next week's priority actions based on pipeline data",
  ]},
];

/* ── SECTION 5: Risk Indicators ───────────────────────────────────────── */
const risks = [
  { risk: "Viewing-But-No-Offer Syndrome", signal: "High viewing count but < 15% convert to offers", mitigation: "Deploy post-viewing confidence scripts immediately. Introduce soft-offer concept. Address price alignment early." },
  { risk: "Agent Engagement Drop", signal: "Agent response times > 2 hours, listing uploads stall", mitigation: "Launch weekly performance scorecards. Introduce visibility rewards for active agents. Personal outreach to top contributors." },
  { risk: "Negotiation Paralysis", signal: "Deals stuck in negotiation > 7 days without movement", mitigation: "Founder direct intervention. Set 48-hour response deadlines. Provide comparable deal data to both parties." },
  { risk: "Trust Deficit Stagnation", signal: "Inbound listing requests flat, buyer referrals near zero", mitigation: "Intensify transaction proof signaling. Publish more success stories. Engage deeper in local community channels." },
  { risk: "Pipeline Thinning", signal: "Active prospect count drops below 3x target deal volume", mitigation: "Increase buyer acquisition campaigns. Reactivate cold leads with fresh opportunity alerts. Expand to adjacent micro-districts." },
];

/* ── MAIN COMPONENT ───────────────────────────────────────────────────── */
const First50DealsNegotiationTrustDomination = () => {
  const [lang, setLang] = useState<"id" | "en">("id");

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-7 w-7 text-primary" /> First 50 Deals + Negotiation Confidence + Trust Domination
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Traction-to-scale execution blueprint — deal velocity, buyer psychology & local credibility</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setLang(l => l === "id" ? "en" : "id")}>
          {lang === "id" ? "🇮🇩 Bahasa" : "🇬🇧 English"}
        </Button>
      </motion.div>

      <Tabs defaultValue="deals" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="deals"><Rocket className="h-4 w-4 mr-1" />50 Deals</TabsTrigger>
          <TabsTrigger value="negotiation"><MessageSquare className="h-4 w-4 mr-1" />Negotiation</TabsTrigger>
          <TabsTrigger value="trust"><Heart className="h-4 w-4 mr-1" />Trust</TabsTrigger>
          <TabsTrigger value="checklist"><CheckCircle className="h-4 w-4 mr-1" />Checklist</TabsTrigger>
          <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1" />Risks</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: 50 Deals ─────────────────────────────────────────── */}
        <TabsContent value="deals" className="space-y-4">
          {phases.map((p, i) => (
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

          {/* Progress visualization */}
          <Card className="border-border/60">
            <CardContent className="pt-6 space-y-3">
              <p className="font-semibold text-sm text-foreground">Deal Milestone Tracker</p>
              {[
                { label: "Deals 1–15 (Pipeline Concentration)", pct: 30 },
                { label: "Deals 16–35 (Conversion Momentum)", pct: 70 },
                { label: "Deals 36–50 (Closing Consistency)", pct: 100 },
              ].map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{m.label}</span><span>{m.pct}%</span>
                  </div>
                  <Progress value={m.pct} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: Negotiation Scripts ───────────────────────────────── */}
        <TabsContent value="negotiation" className="space-y-4">
          {scripts.map((s, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <s.icon className="h-5 w-5 text-primary" /> {s.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Tone: {s.tone}</p>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/40 rounded-lg p-4 border border-border/30 relative">
                    <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {lang === "id" ? s.template : s.en}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copy(lang === "id" ? s.template : s.en)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <Card className="border-border/60 bg-primary/5">
            <CardContent className="pt-6">
              <p className="font-semibold text-sm text-foreground mb-2">Negotiation KPI Targets</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Offer submission rate", target: "+40% improvement" },
                  { label: "Post-viewing follow-up", target: "< 4 hours" },
                  { label: "Guided negotiation closure", target: "> 60% contribution" },
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

        {/* ── TAB 3: Trust Domination ─────────────────────────────────── */}
        <TabsContent value="trust" className="space-y-4">
          {trustPillars.map((p, i) => (
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
              <p className="font-semibold text-sm text-foreground mb-2">Trust Domination KPIs</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Inbound listing requests", target: "+30% monthly growth" },
                  { label: "Buyer referral rate", target: "> 15% of new buyers" },
                  { label: "Brand recognition", target: "Top-of-mind in district" },
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

        {/* ── TAB 4: Weekly Checklist ─────────────────────────────────── */}
        <TabsContent value="checklist" className="space-y-4">
          {weeklyChecklist.map((c, i) => (
            <motion.div key={i} custom={i} variants={fade} initial="hidden" animate="visible">
              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{c.category}</CardTitle>
                </CardHeader>
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

        {/* ── TAB 5: Risk Indicators ──────────────────────────────────── */}
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

export default First50DealsNegotiationTrustDomination;
