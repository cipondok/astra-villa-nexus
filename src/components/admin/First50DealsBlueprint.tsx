import React, { useState } from "react";
import {
  Rocket, BarChart3, Users, Zap, Target, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, MessageSquare,
  Eye, Star, Shield, Activity, Trophy, Bell
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — FIRST 50 DEALS ACCELERATION
   ═══════════════════════════════════════════════ */

const accelerationPhases = [
  { phase: "Phase 1: Pipeline Building", range: "Deals 1–10", color: "text-chart-2", items: [
    { tactic: "High-Probability Listing Prioritization", detail: "Score every listing on 3 signals: inquiry volume (>3/week = HOT), price competitiveness (within 10% of area average = STRONG), and photo quality (5+ professional photos = READY). Only push listings scoring 2/3 or higher. The rest need optimization first." },
    { tactic: "Fast Communication Loop", detail: "When a buyer inquires on a HOT listing, the vendor must respond within 2 hours. If no response in 2h, platform sends reminder. No response in 4h, platform calls the vendor directly. Goal: zero buyer inquiry goes unanswered for >4 hours." },
    { tactic: "Manual Deal Facilitation", detail: "For Deals 1–10, founder personally facilitates. Join WhatsApp groups between buyer and vendor. Help schedule viewings. Resolve objections in real-time. Your job is to remove ALL friction — be the deal lubricant." },
  ]},
  { phase: "Phase 2: Velocity Building", range: "Deals 11–30", color: "text-primary", items: [
    { tactic: "Viewing Conversion Optimization", detail: "Simplify booking to 2-tap process: buyer selects time slot → vendor confirms or suggests alternative within 1 hour. Target: 60% of inquiries convert to scheduled viewings. Currently most marketplaces lose 70% of buyers between inquiry and viewing." },
    { tactic: "Urgency Messaging on Hot Listings", detail: "When a listing gets 5+ inquiries in a week, trigger: '🔥 Properti ini diminati [X] investor lain minggu ini. [Y] sudah jadwalkan viewing.' Real data, not fake scarcity. Genuine urgency converts 3x better." },
    { tactic: "Pricing Competitiveness Insights", detail: "Send vendors weekly: 'Properti serupa di area Anda terjual di Rp [X]. Listing Anda di Rp [Y]. Selisih [Z]%. Properti dengan harga kompetitif terjual 2x lebih cepat.' Help them price to sell, not price to dream." },
  ]},
  { phase: "Phase 3: Momentum Lock", range: "Deals 31–50", color: "text-chart-4", items: [
    { tactic: "Deal Momentum Management", detail: "Once an offer is submitted, the clock starts. Day 1: confirm receipt. Day 2: vendor must counter or accept. Day 4: if no response, call vendor directly. Day 7: if stalled, offer buyer alternative properties. Never let a deal die quietly." },
    { tactic: "Comparable Deal Highlighting", detail: "After every closed deal, broadcast to relevant vendors: 'Properti di [Area] baru saja terjual di Rp [X] melalui Astra dalam [Y] hari. Listing serupa Anda bisa mendapat hasil yang sama.' Social proof from YOUR platform's deals." },
    { tactic: "Fast Negotiation Cycles", detail: "Cap negotiation at 14 days max. Day 1-3: initial offer/counter. Day 4-7: final terms. Day 8-14: documentation. If either party goes silent >3 days, platform intervenes with a structured compromise proposal." },
  ]},
];

const dealMilestones = [
  { period: "Week 1–2", target: "2 deals", kpis: "Inquiry→viewing: 40% | Viewing→offer: 25%", focus: "Manual facilitation of every hot lead" },
  { period: "Week 3–4", target: "5 deals", kpis: "Inquiry→viewing: 50% | Viewing→offer: 30%", focus: "Process standardization, vendor response SLA" },
  { period: "Month 2", target: "15 deals", kpis: "Inquiry→viewing: 55% | Viewing→offer: 35%", focus: "Urgency messaging, pricing intelligence" },
  { period: "Month 3", target: "30 deals", kpis: "Inquiry→viewing: 60% | Viewing→offer: 40%", focus: "Deal velocity, negotiation acceleration" },
  { period: "Month 4", target: "50 deals", kpis: "Inquiry→viewing: 65% | Avg close: 21 days", focus: "Repeatable process, team delegation" },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — VENDOR PERFORMANCE
   ═══════════════════════════════════════════════ */

const vendorScoring = [
  { metric: "Response Time", weight: "30%", scoring: "< 1h = 100 | 1-4h = 80 | 4-12h = 50 | 12-24h = 25 | > 24h = 0", why: "Buyers who wait >4h are 60% less likely to schedule a viewing. Speed is the #1 differentiator." },
  { metric: "Inquiry Conversion", weight: "25%", scoring: "Viewing rate > 60% = 100 | 40-60% = 70 | 20-40% = 40 | < 20% = 10", why: "Are they actually turning interest into action? Low conversion = poor communication or unrealistic expectations." },
  { metric: "Listing Quality", weight: "25%", scoring: "5+ photos + full desc + accurate price = 100 | Missing 1 element = 60 | Missing 2+ = 20", why: "Quality listings get 4x more inquiries. Poor listings waste buyer traffic." },
  { metric: "Deal Contribution", weight: "20%", scoring: "3+ deals/quarter = 100 | 2 deals = 70 | 1 deal = 40 | 0 deals = 0", why: "Revenue contribution determines long-term vendor value to the platform." },
];

const vendorTiers = [
  { tier: "🏆 PLATINUM", range: "Score 85–100", benefits: "Top search placement, dedicated account manager, priority boost pricing, featured agent badge", count: "Top 5%" },
  { tier: "🥇 GOLD", range: "Score 70–84", benefits: "Enhanced visibility, monthly performance report, early access to new features", count: "Next 15%" },
  { tier: "🥈 SILVER", range: "Score 50–69", benefits: "Standard visibility, quarterly review, improvement coaching tips", count: "Next 30%" },
  { tier: "🥉 BRONZE", range: "Score < 50", benefits: "Reduced visibility, improvement warning, risk of de-listing if no improvement in 30 days", count: "Bottom 50%" },
];

const vendorScripts = [
  { type: "Top Performer Appreciation", icon: Trophy, script: `Selamat Pak/Bu [Nama]! 🎉

Bulan ini Anda masuk TOP 5 agen terbaik di Astra:
📊 Response time rata-rata: [X] menit
📈 [Y] viewing dari [Z] inquiry (conversion [%]%)
💰 [N] deal berhasil closing

Sebagai apresiasi, listing Anda akan mendapat:
✅ Badge "Top Agent" selama 30 hari
✅ Priority placement di search results
✅ Diskon 30% untuk Boost berikutnya

Terima kasih atas dedikasi Bapak/Ibu. Mari kita capai target lebih tinggi bulan depan! 🚀` },
  { type: "Improvement Guidance", icon: Target, script: `Hai Pak/Bu [Nama],

Saya mau share insight untuk meningkatkan performa listing Anda:

📊 Bulan ini: [X] inquiry → [Y] viewing (conversion [Z]%)
⏱ Response time rata-rata: [X] jam

Tips untuk improvement:
1. Respond inquiry dalam 2 jam pertama — buyer yang menunggu >4 jam biasanya sudah move on
2. Tambahkan 3-5 foto lagi untuk listing [Nama Properti] — listing dengan 8+ foto dapat 2x lebih banyak inquiry
3. Update harga [Properti] — saat ini [X]% di atas rata-rata area

Mau saya bantu optimasi listing Anda? Gratis, 15 menit saja. 🏠` },
  { type: "Inactive Reactivation", icon: Bell, script: `Pak/Bu [Nama], apa kabar? 🙏

Kami perhatikan listing Anda belum diupdate sejak [X] hari lalu. Ada beberapa hal yang mungkin Bapak/Ibu lewatkan:

🔥 [Y] buyer baru mencari properti di area listing Anda minggu ini
📈 Harga rata-rata area naik [Z]% — momentum bagus untuk jual
⏰ Listing yang tidak aktif >30 hari akan diturunkan visibility-nya

Action yang bisa dilakukan sekarang:
1. Update harga dan foto listing
2. Tambahkan listing baru jika ada
3. Respond inquiry yang masuk

Reply pesan ini kalau butuh bantuan — saya bisa bantu update dalam 10 menit. 💪` },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — INVESTOR URGENCY FUNNEL
   ═══════════════════════════════════════════════ */

const funnelStages = [
  { stage: "AWARENESS", icon: Eye, color: "text-chart-2", triggers: [
    { trigger: "New Listing Alert", condition: "New listing matches investor's saved criteria", message: "🏠 Properti baru di [Area] — Rp [X]B, [Y] kamar, ROI estimasi [Z]%. Sesuai dengan kriteria pencarian Anda." },
    { trigger: "Market Opportunity Signal", condition: "District shows >10% price growth in 90 days", message: "📈 Alert: Area [District] menunjukkan pertumbuhan harga 12% dalam 3 bulan. [X] properti tersedia di bawah market rate." },
    { trigger: "Weekly Digest", condition: "Every Monday 9AM", message: "📊 Ringkasan minggu ini: [X] properti baru, [Y] deal tertutup di area favorit Anda. Top opportunity: [Properti] dengan yield [Z]%." },
  ]},
  { stage: "CONSIDERATION", icon: BarChart3, color: "text-primary", triggers: [
    { trigger: "Data-Backed Reinforcement", condition: "Investor viewed listing 2+ times", message: "Anda sudah melihat [Properti] 3 kali. Ini datanya:\n📊 Harga: 8% di bawah rata-rata area\n📈 Capital appreciation area: 15%/tahun\n💰 Rental yield estimasi: 7.2%\n\nMau analisis ROI lengkap?" },
    { trigger: "Social Proof Push", condition: "Listing gets 5+ inquiries", message: "🔥 [Properti] sudah diminati [X] investor lain. [Y] sudah jadwalkan viewing minggu ini. Properti seperti ini biasanya terjual dalam [Z] hari." },
    { trigger: "Comparison Intelligence", condition: "Investor viewed 3+ similar listings", message: "Dari 3 properti yang Anda lihat, berikut perbandingannya:\n🏠 [A]: Rp [X] — yield [Y]%\n🏠 [B]: Rp [X] — yield [Y]%\n🏠 [C]: Rp [X] — yield [Y]% ⭐ Best value\n\nMau viewing untuk yang terbaik?" },
  ]},
  { stage: "DECISION", icon: Zap, color: "text-chart-4", triggers: [
    { trigger: "Urgency Close", condition: "Investor showed high intent (viewed + inquired + saved)", message: "Pak/Bu [Nama], [Properti] yang Anda minati sudah masuk tahap negosiasi dengan investor lain. Jika berminat serius, saya bisa prioritaskan viewing untuk Bapak/Ibu besok. Konfirmasi sekarang?" },
    { trigger: "Limited-Time Window", condition: "Vendor offers 48h exclusive preview", message: "⚡ EXCLUSIVE 48 JAM: [Properti] tersedia untuk preview khusus sebelum dibuka ke publik. Hanya untuk 3 investor pertama. Slot tersisa: [X]. Booking sekarang?" },
    { trigger: "Reservation Push", condition: "Post-viewing follow-up (Day 1)", message: "Terima kasih sudah viewing [Properti] kemarin! Bagaimana kesan Bapak/Ibu?\n\nUpdate: ada [X] investor lain yang sudah request viewing setelah Anda. Jika berminat, kami bisa bantu:\n✅ Lock harga saat ini\n✅ Mulai proses negosiasi\n✅ Koordinasi dokumen\n\nMau proceed?" },
  ]},
];

const investorKpis = [
  { metric: "Investor response time to alerts", target: "< 4 hours", warning: "> 24 hours" },
  { metric: "Viewing request rate (per alert sent)", target: "> 15%", warning: "< 5%" },
  { metric: "Viewing-to-offer conversion", target: "> 30%", warning: "< 10%" },
  { metric: "Deal commitment signals (saved + inquired + viewed)", target: "Growing weekly", warning: "Declining 2+ weeks" },
  { metric: "Time from first view to offer", target: "< 14 days", warning: "> 30 days" },
];

/* ═══════════════════════════════════════════════
   WEEKLY CHECKLIST & RISKS
   ═══════════════════════════════════════════════ */

const weeklyChecklist = [
  { task: "Review deal pipeline: how many at each stage?", category: "Pipeline" },
  { task: "Follow up on ALL stalled negotiations (>3 days idle)", category: "Deals" },
  { task: "Contact top 3 vendors with most inquiries — push for viewings", category: "Vendors" },
  { task: "Send urgency messages to high-intent investors", category: "Investors" },
  { task: "Review vendor response time — intervene on slow responders", category: "Vendors" },
  { task: "Check viewing-to-offer ratio — identify drop-off causes", category: "Analytics" },
  { task: "Celebrate & broadcast any closed deal to vendor network", category: "Momentum" },
  { task: "Update deal count tracker — are we on pace for 50?", category: "Pipeline" },
];

const transactionRisks = [
  { risk: "Vendors overpricing — buyers inquire but don't proceed", severity: "HIGH", mitigation: "Send weekly pricing intelligence. Show comparable sold prices. Vendors who won't adjust after 30 days: reduce visibility ranking. Market corrects overpriced listings — help vendors understand this before they waste 3 months." },
  { risk: "Viewing no-shows by buyers", severity: "MEDIUM", mitigation: "Confirm viewing 24h before AND 2h before. Send property summary + directions. If >30% no-show rate: require deposit hold or phone confirmation. Most no-shows happen because buyer forgot or found alternative." },
  { risk: "Negotiations stalling indefinitely", severity: "HIGH", mitigation: "Hard cap: 14 days max negotiation. After Day 7, platform sends structured compromise proposal. After Day 14, listing returns to public with 'Price Adjusted' badge. Urgency forces decision." },
  { risk: "Vendors going around the platform (direct deals)", severity: "CRITICAL", mitigation: "Early deals: accept it happens. Long-term: make the platform so valuable (buyer flow, analytics, facilitation) that vendors WANT to transact through you. Penalizing vendors creates resentment — add value instead." },
  { risk: "Low repeat buyer rate", severity: "MEDIUM", mitigation: "After first transaction: add buyer to VIP list, exclusive early access to new listings, personalized recommendations. A buyer who closed once is 5x more likely to transact again within 12 months." },
];

const categoryBadgeColors: Record<string, string> = {
  Pipeline: "bg-chart-2/10 text-chart-2",
  Deals: "bg-chart-4/10 text-chart-4",
  Vendors: "bg-primary/10 text-primary",
  Investors: "bg-chart-1/10 text-chart-1",
  Analytics: "bg-muted text-muted-foreground",
  Momentum: "bg-chart-5/10 text-chart-5",
};

/* ═══════════════════════════════════════════════ */

const First50DealsBlueprint: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => setCheckedItems(prev => {
    const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n;
  });

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="First 50 Deals Acceleration"
        description="Deal acceleration, vendor performance ranking & investor urgency funnels"
        icon={Rocket}
        badge={{ text: "🚀 Deals", variant: "outline" }}
      />

      <Tabs defaultValue="deals" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="deals" className="text-xs">50 Deals Plan</TabsTrigger>
          <TabsTrigger value="vendors" className="text-xs">Vendor Performance</TabsTrigger>
          <TabsTrigger value="investors" className="text-xs">Investor Urgency</TabsTrigger>
          <TabsTrigger value="monitor" className="text-xs">Weekly Monitor</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">Deal Risks</TabsTrigger>
        </TabsList>

        {/* ── 50 DEALS ACCELERATION ── */}
        <TabsContent value="deals" className="mt-4 space-y-4">
          {accelerationPhases.map((phase, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className={cn("text-sm", phase.color)}>{phase.phase}</CardTitle>
                  <Badge variant="outline" className="text-[9px]">{phase.range}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {phase.items.map((item, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground">{item.tactic}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Deal Milestone Trajectory</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {dealMilestones.map((dm, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/20 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <p className="text-xs font-semibold text-foreground">{dm.period}</p>
                    <Badge variant="default" className="text-[9px]">🎯 {dm.target}</Badge>
                  </div>
                  <p className="text-[9px] text-muted-foreground font-mono">{dm.kpis}</p>
                  <p className="text-[9px] text-chart-2">{dm.focus}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── VENDOR PERFORMANCE ── */}
        <TabsContent value="vendors" className="mt-4 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Vendor Scoring Logic</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {vendorScoring.map((vs, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/40 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <p className="text-xs font-semibold text-foreground">{vs.metric}</p>
                    <Badge variant="outline" className="text-[8px]">Weight: {vs.weight}</Badge>
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground">{vs.scoring}</p>
                  <p className="text-[9px] text-chart-2">{vs.why}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-chart-4" /> Performance Tiers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {vendorTiers.map((vt, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/20 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <p className="text-xs font-semibold text-foreground">{vt.tier}</p>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-[8px]">{vt.range}</Badge>
                      <Badge variant="secondary" className="text-[8px]">{vt.count}</Badge>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground">{vt.benefits}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Vendor Communication Scripts</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {vendorScripts.map((vs, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <vs.icon className="h-3.5 w-3.5 text-primary" />
                    <Badge variant="outline" className="text-[8px]">{vs.type}</Badge>
                  </div>
                  <pre className="text-[10px] text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-muted/30 rounded-lg p-3 border border-border/30">{vs.script}</pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── INVESTOR URGENCY ── */}
        <TabsContent value="investors" className="mt-4 space-y-4">
          {funnelStages.map((fs, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", fs.color)}>
                  <fs.icon className="h-4 w-4" /> {fs.stage}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fs.triggers.map((t, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <p className="text-xs font-semibold text-foreground">{t.trigger}</p>
                      <Badge variant="secondary" className="text-[8px]">{t.condition}</Badge>
                    </div>
                    <pre className="text-[10px] text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-muted/30 rounded-lg p-2 border border-border/30">{t.message}</pre>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Investor Engagement KPIs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {investorKpis.map((ik, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20 flex-wrap gap-1">
                  <p className="text-[10px] text-foreground font-medium">{ik.metric}</p>
                  <div className="flex gap-1">
                    <Badge variant="default" className="text-[8px]">🎯 {ik.target}</Badge>
                    <Badge variant="destructive" className="text-[8px]">⚠ {ik.warning}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── WEEKLY MONITOR ── */}
        <TabsContent value="monitor" className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Weekly Deal Momentum Checklist</h3>
            <Badge variant="outline" className="text-[9px]">{checkedItems.size}/{weeklyChecklist.length}</Badge>
          </div>
          <Progress value={(checkedItems.size / weeklyChecklist.length) * 100} className="h-2 mb-3" />
          {weeklyChecklist.map((item, i) => (
            <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg border border-border/40", checkedItems.has(i) && "opacity-50")}>
              <Checkbox checked={checkedItems.has(i)} onCheckedChange={() => toggle(i)} />
              <div className="flex-1">
                <p className={cn("text-xs text-foreground", checkedItems.has(i) && "line-through")}>{item.task}</p>
              </div>
              <Badge className={cn("text-[8px]", categoryBadgeColors[item.category] || "bg-muted text-muted-foreground")}>{item.category}</Badge>
            </div>
          ))}
        </TabsContent>

        {/* ── DEAL RISKS ── */}
        <TabsContent value="risks" className="mt-4 space-y-3">
          {transactionRisks.map((tr, i) => (
            <Card key={i} className={cn("border-border", tr.severity === "CRITICAL" && "border-destructive/30 bg-destructive/5")}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className={cn("h-4 w-4", tr.severity === "CRITICAL" ? "text-destructive" : "text-chart-4")} />
                  <Badge variant={tr.severity === "CRITICAL" ? "destructive" : "default"} className="text-[8px]">{tr.severity}</Badge>
                  <p className="text-xs font-semibold text-foreground">{tr.risk}</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{tr.mitigation}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default First50DealsBlueprint;
