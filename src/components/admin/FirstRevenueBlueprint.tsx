import React, { useState } from "react";
import {
  DollarSign, BarChart3, MessageSquare, Target, TrendingUp,
  AlertTriangle, CheckCircle2, Zap, Clock, Phone, Users,
  Eye, Star, Shield, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — FIRST REVENUE CLOSING
   ═══════════════════════════════════════════════ */

const revenueStreams = [
  { stream: "Listing Boost Monetization", icon: Zap, color: "text-chart-4", priority: "LAUNCH FIRST",
    tactics: [
      { tactic: "Identify high-demand listings for upsell", detail: "Any listing with >30 views and >2 inquiries in its first week is a boost candidate. Message the vendor: 'Listing Anda sudah dapat 35 views — upgrade ke Featured untuk 3x lebih banyak exposure. Minggu ini diskon 50%: hanya Rp 750K.'" },
      { tactic: "Create urgency with limited featured slots", detail: "Only 3 Featured slots per district. Scarcity is real AND strategic — too many featured listings dilutes the value. 'Slot Featured di [District] tinggal 1 — 2 agen lain sudah booking minggu ini.'" },
      { tactic: "Simple 3-tier pricing", detail: "Standard: FREE (basic listing) | Boost: Rp 500K/week (2x visibility, badge) | Featured: Rp 1.5M/week (top placement, highlighted border, push notification to matching investors). Start with Boost — lowest friction first sale." },
    ],
    milestone: "First Rp 5M revenue from boosts within 30 days" },
  { stream: "Vendor Subscription Upgrade", icon: Star, color: "text-primary", priority: "WEEK 3+",
    tactics: [
      { tactic: "Pitch after proven value", detail: "Never pitch premium before the vendor has received at least 3 inquiries. Timing the upsell when value is demonstrated: 'Bapak sudah dapat 8 inquiry bulan ini. Dengan Premium, listing Anda akan tampil 3x lebih sering dan dapat badge Verified Agent.'" },
      { tactic: "Limited-time founding partner pricing", detail: "First 20 subscribers get 'Founding Partner' rate: Rp 299K/month (regular Rp 499K). Lock in for 6 months. Creates commitment and reduces churn." },
      { tactic: "Track conversion per outreach", detail: "Log every premium pitch: who, when, response. Target: 10% conversion on first pitch, 25% on follow-up after they've received 5+ inquiries." },
    ],
    milestone: "10 paying subscribers within 60 days = Rp 2.99M MRR" },
  { stream: "Investor / Buyer Premium Access", icon: Target, color: "text-chart-2", priority: "MONTH 2+",
    tactics: [
      { tactic: "Exclusive early-access deals", detail: "New listings visible to premium investors 48 hours before public. 'Dapatkan akses ke listing terbaru sebelum investor lain — properties terbaik sering terjual dalam 72 jam pertama.'" },
      { tactic: "Priority viewing scheduling", detail: "Premium buyers get guaranteed viewing within 24 hours. Free users wait for agent availability. Time advantage = competitive advantage in hot markets." },
      { tactic: "Investment intelligence reports", detail: "Monthly PDF report: 'Top 10 Investment Opportunities in [City]' with yield analysis, growth projections, and district comparisons. Free preview, full report for subscribers at Rp 199K/month." },
    ],
    milestone: "20 investor subscribers within 90 days = Rp 3.98M MRR" },
];

const revenueMilestones = [
  { period: "Week 1–2", target: "Rp 0", focus: "Build supply, generate inquiries. NO monetization pressure yet." },
  { period: "Week 3", target: "Rp 1–3M", focus: "First boost sales to vendors with proven inquiry traction." },
  { period: "Week 4", target: "Rp 3–5M", focus: "Expand boost adoption + first subscription pitches." },
  { period: "Month 2", target: "Rp 5–15M", focus: "Systematic boost + subscription revenue. First investor premium tests." },
  { period: "Month 3", target: "Rp 15–30M", focus: "Recurring revenue base established. Revenue per listing improving." },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — DAILY KPI WAR-ROOM
   ═══════════════════════════════════════════════ */

const kpiCategories = [
  { category: "Core Liquidity", icon: Activity, color: "text-chart-2", kpis: [
    { metric: "Listings added today", target: "5+", warning: "<2", why: "Supply growth is the engine. Below 2/day means vendor acquisition has stalled." },
    { metric: "Inquiry-to-listing ratio", target: ">3%", warning: "<1%", why: "Healthy marketplace = every listing gets attention. Below 1% means demand is too low or listings are poor quality." },
    { metric: "Inactive listings (no views in 7d)", target: "<15%", warning: ">30%", why: "Dead listings destroy buyer trust. If >30% are invisible, search algorithm or listing quality needs fixing." },
    { metric: "Average listing quality score", target: ">80%", warning: "<60%", why: "Photos, descriptions, pricing accuracy. Low quality = low inquiries = vendor churn." },
  ]},
  { category: "Demand & Engagement", icon: Eye, color: "text-primary", kpis: [
    { metric: "Serious buyer sessions (2+ listings viewed)", target: "100+/day", warning: "<30", why: "Vanity traffic doesn't matter. Only count users who actually browse properties." },
    { metric: "Repeat visit rate (weekly)", target: ">25%", warning: "<10%", why: "Repeat visitors are pre-qualified buyers. Low repeat = platform isn't sticky enough." },
    { metric: "Viewing requests initiated", target: "3+/day", warning: "0", why: "The strongest intent signal. Zero viewing requests means the funnel is broken somewhere." },
    { metric: "Average session duration", target: ">3 min", warning: "<1 min", why: "Short sessions = bad traffic quality or poor listing presentation." },
  ]},
  { category: "Monetization", icon: DollarSign, color: "text-chart-4", kpis: [
    { metric: "Boost purchases today", target: "1+", warning: "0 for 3+ days", why: "If vendors aren't buying boosts, either they don't see value or pricing is wrong." },
    { metric: "Vendor subscription activations (weekly)", target: "2+", warning: "0 for 2 weeks", why: "Subscriptions = recurring revenue = business sustainability." },
    { metric: "Revenue per 100 active listings", target: "Rp 500K+", warning: "<Rp 100K", why: "Revenue density shows monetization efficiency. Low = monetization features underutilized." },
    { metric: "Monetization conversion rate", target: ">5%", warning: "<1%", why: "Of vendors who receive the premium pitch, how many convert?" },
  ]},
  { category: "Execution Alerts", icon: AlertTriangle, color: "text-destructive", kpis: [
    { metric: "Inquiry decline (vs. yesterday)", target: "Stable or ↑", warning: ">30% drop", why: "Sudden inquiry drop = traffic source died, ad campaign stopped, or competitor launched." },
    { metric: "Vendor response time (avg)", target: "<4 hours", warning: ">24 hours", why: "Slow vendors lose buyers. Buyers who wait >24h for response rarely convert." },
    { metric: "Traffic quality (bounce rate)", target: "<60%", warning: ">80%", why: "High bounce = wrong audience or broken landing pages." },
    { metric: "Zero-inquiry listings (7d old+)", target: "<20%", warning: ">40%", why: "Listings that get no interest need pricing review, photo upgrade, or removal." },
  ]},
];

const dailyRoutine = [
  { time: "08:00", action: "Check overnight inquiries — respond or route within 2 hours", priority: "CRITICAL" },
  { time: "09:00", action: "Review yesterday's KPIs against targets — identify any red flags", priority: "HIGH" },
  { time: "10:00", action: "Vendor outreach: 5 new contacts + 5 follow-ups", priority: "HIGH" },
  { time: "12:00", action: "Check ad performance — pause underperformers, scale winners", priority: "MEDIUM" },
  { time: "14:00", action: "Pitch boost/premium to 2 vendors with proven inquiry traction", priority: "HIGH" },
  { time: "16:00", action: "Content: post 1 listing highlight on social media", priority: "MEDIUM" },
  { time: "17:00", action: "Follow up on all open buyer inquiries — push toward viewing", priority: "CRITICAL" },
  { time: "18:00", action: "End-of-day: log KPIs, plan tomorrow's priority actions", priority: "MEDIUM" },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — BUYER DEAL CLOSING SCRIPTS
   ═══════════════════════════════════════════════ */

const closingScripts = [
  { channel: "WhatsApp Chat Script", icon: MessageSquare, stages: [
    { stage: "Trust-Building Opening", script: `Selamat siang Pak/Bu [Nama] 🙏

Terima kasih sudah inquiry untuk [Nama Properti] di [District].

Saya [Nama] dari tim Astra — saya bantu carikan properti yang paling sesuai dengan kebutuhan Bapak/Ibu.

Boleh saya tanya sedikit supaya bisa recommend yang tepat:
1. Budget range yang dipertimbangkan?
2. Untuk investasi atau hunian pribadi?
3. Ada preferensi area tertentu?` },
    { stage: "Value Reinforcement", script: `Berdasarkan kriteria Bapak/Ibu, properti ini sangat menarik karena:

📊 Harga 12% di bawah rata-rata area — value terbaik di [District] saat ini
📈 Area ini sedang naik — harga properti serupa naik 18% dalam 12 bulan terakhir
🔥 Minggu ini sudah ada [X] investor lain yang inquiry untuk properti yang sama

Kalau berminat, saya bisa bantu arrange viewing dalam 24-48 jam. Mau saya jadwalkan?` },
    { stage: "Objection: Price Hesitation", script: `Saya mengerti pertimbangan budget-nya, Pak/Bu.

Yang menarik: properti serupa di area yang sama listing di Rp [X] — jadi ini sebenarnya sudah lebih competitive.

Tapi yang lebih penting dari harga awal adalah potensi return-nya:
• Rental yield area ini: 6-8% per tahun
• Capital appreciation: 15-20% dalam 3 tahun
• Kalau dihitung, dalam 5 tahun total return bisa 50-70%

Mau saya buatkan analisis ROI detail untuk properti ini?` },
    { stage: "Closing: Schedule Viewing", script: `Pak/Bu, dari pengalaman kami, properti berkualitas di area ini biasanya terjual dalam 2-3 minggu.

Saya bisa arrange viewing untuk Bapak/Ibu:
📅 Opsi 1: [Hari], jam [X]
📅 Opsi 2: [Hari], jam [X]

Mana yang lebih cocok? Saya yang koordinasi dengan pemilik/agen-nya. Tidak ada commitment — just to see the property in person 🏠` },
  ]},
  { channel: "Phone Call Script", icon: Phone, stages: [
    { stage: "Opening (30 detik)", script: `"Selamat siang Pak/Bu [Nama], saya [Nama] dari Astra. Terima kasih sudah tertarik dengan [Nama Properti] di platform kami.

Boleh minta waktu 3 menit? Saya ingin pastikan properti ini sesuai dengan yang Bapak/Ibu cari — dan kalau tidak, saya bisa suggest alternatif yang lebih cocok."` },
    { stage: "Discovery (60 detik)", script: `"Supaya saya bisa bantu dengan tepat:
- Ini untuk investasi atau tempat tinggal?
- Budget range yang nyaman untuk Bapak/Ibu?
- Ada deadline tertentu untuk transaksi?

[Dengarkan — jangan interrupt. Catat keyword: 'investasi', 'segera', 'cash', 'KPR']"` },
    { stage: "Pitch (60 detik)", script: `"Berdasarkan yang Bapak/Ibu sampaikan, [Properti] ini sangat cocok karena [sebutkan 2 alasan spesifik dari discovery].

Yang menarik — area ini sedang dalam fase pertumbuhan. Data kami menunjukkan [X]% kenaikan harga dalam 12 bulan terakhir. Dan properti ini di-price di bawah rata-rata area."` },
    { stage: "Close (30 detik)", script: `"Pak/Bu, cara terbaik untuk evaluate properti ini adalah lihat langsung. Saya bisa arrange viewing [besok/lusa] — hanya butuh 30 menit.

Jam berapa yang convenient untuk Bapak/Ibu? Saya yang koordinasi semuanya."

[Jika ragu]: "Tidak ada commitment sama sekali — ini purely supaya Bapak/Ibu bisa lihat kondisi real dan feel area-nya. Worth 30 menit untuk keputusan investasi sebesar ini."` },
  ]},
  { channel: "Voice Note (60 detik)", icon: Phone, stages: [
    { stage: "Quick Persuasion Voice Note", script: `"Hai Pak/Bu [Nama] 🙏 Saya [Nama] dari Astra.

Saya lihat Bapak/Ibu tertarik dengan [Properti] di [Area] — great choice. Area ini lagi sangat hot, minggu ini saja sudah ada [X] inquiry untuk area yang sama.

Properti ini priced sangat competitive — 10% di bawah market rate. Saya bisa arrange viewing dalam 24 jam kalau berminat.

Reply aja di sini atau hubungi saya di [nomor] — saya bantu dari A sampai Z. Terima kasih! 🏠"

[Keep under 45 seconds — friendly, confident, not pushy]` },
  ]},
];

const followUpCadence = [
  { timing: "Day 0 (inquiry)", action: "Respond within 2 hours. Acknowledge, ask 2-3 qualifying questions." },
  { timing: "Day 1", action: "Send property analysis: ROI calculation, area comparison, market context." },
  { timing: "Day 2", action: "Voice note or call: 'Ada pertanyaan tentang properti kemarin?'" },
  { timing: "Day 4", action: "Share 1-2 similar alternatives: 'Selain [Properti], ini juga menarik...'" },
  { timing: "Day 7", action: "Urgency nudge: 'Update — ada investor lain yang sudah schedule viewing.'" },
  { timing: "Day 14", action: "Final check: 'Masih mencari properti, Pak/Bu? Ada listing baru yang mungkin cocok.'" },
];

/* ═══════════════════════════════════════════════
   RISKS & CHECKLIST
   ═══════════════════════════════════════════════ */

const monetizationRisks = [
  { risk: "Vendors refuse to pay for boosts", severity: "HIGH", mitigation: "They haven't seen value yet. Wait until they've received 3+ inquiries, then pitch. If still refusing: boost is too expensive — test at Rp 250K." },
  { risk: "Inquiries come but no viewings happen", severity: "HIGH", mitigation: "The handoff is broken. Personally facilitate the first 10 viewings — coordinate between buyer and agent. Identify where the process stalls." },
  { risk: "Revenue stays at zero after 30 days", severity: "CRITICAL", mitigation: "Either not enough inquiries (demand problem) or not monetizing correctly (pricing/pitch problem). Survey 5 vendors: 'Would you pay Rp X for Y?' Iterate fast." },
  { risk: "Buyers inquire but ghost", severity: "MEDIUM", mitigation: "Follow-up cadence is missing. Implement the Day 0-14 follow-up sequence. Most deals close on the 3rd-5th touchpoint, not the first." },
  { risk: "Premium subscribers churn after month 1", severity: "MEDIUM", mitigation: "They didn't get enough value. Ensure each premium vendor gets at least 5 inquiries/month. If not, boost their listings manually until they do." },
];

const founderChecklist = [
  { task: "Check and respond to ALL overnight inquiries", category: "Revenue" },
  { task: "Review yesterday's revenue: any boost/subscription sales?", category: "Revenue" },
  { task: "Pitch premium to 2 vendors with high inquiry counts", category: "Revenue" },
  { task: "Follow up on 3 buyer inquiries — push toward viewing", category: "Conversion" },
  { task: "Review ad spend vs. inquiry cost — optimize or pause", category: "Efficiency" },
  { task: "Log daily KPIs in tracker", category: "Analytics" },
];

const categoryBadgeColors: Record<string, string> = {
  Revenue: "bg-chart-4/10 text-chart-4",
  Conversion: "bg-chart-2/10 text-chart-2",
  Efficiency: "bg-primary/10 text-primary",
  Analytics: "bg-muted text-muted-foreground",
};

/* ═══════════════════════════════════════════════ */

const FirstRevenueBlueprint: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => setCheckedItems(prev => {
    const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n;
  });

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="First Revenue & Deal Closing"
        description="Revenue activation, daily KPI war-room & buyer conversion scripts"
        icon={DollarSign}
        badge={{ text: "💰 Revenue", variant: "outline" }}
      />

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="revenue" className="text-xs">Revenue Closing</TabsTrigger>
          <TabsTrigger value="kpi" className="text-xs">KPI War-Room</TabsTrigger>
          <TabsTrigger value="scripts" className="text-xs">Buyer Scripts</TabsTrigger>
          <TabsTrigger value="checklist" className="text-xs">Daily Checklist</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">Revenue Risks</TabsTrigger>
        </TabsList>

        {/* ── REVENUE CLOSING ── */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          {revenueStreams.map((rs, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className={cn("text-sm flex items-center gap-2", rs.color)}>
                    <rs.icon className="h-4 w-4" /> {rs.stream}
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px]">{rs.priority}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {rs.tactics.map((t, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground">{t.tactic}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{t.detail}</p>
                  </div>
                ))}
                <div className="p-2 rounded-lg bg-chart-2/5 border border-chart-2/20">
                  <p className="text-[10px] text-chart-2 font-medium">🎯 {rs.milestone}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Milestone Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {revenueMilestones.map((rm, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{rm.period}</p>
                    <p className="text-[9px] text-muted-foreground">{rm.focus}</p>
                  </div>
                  <Badge variant="outline" className="text-xs font-bold">{rm.target}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── KPI WAR-ROOM ── */}
        <TabsContent value="kpi" className="mt-4 space-y-4">
          {kpiCategories.map((kc, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", kc.color)}>
                  <kc.icon className="h-4 w-4" /> {kc.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {kc.kpis.map((k, j) => (
                  <div key={j} className="p-3 rounded-lg border border-border/40 space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <p className="text-xs font-semibold text-foreground">{k.metric}</p>
                      <div className="flex gap-1">
                        <Badge variant="default" className="text-[8px]">🎯 {k.target}</Badge>
                        <Badge variant="destructive" className="text-[8px]">⚠ {k.warning}</Badge>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground">{k.why}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Daily Review Routine</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {dailyRoutine.map((dr, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] font-mono">{dr.time}</Badge>
                    <p className="text-[10px] text-foreground">{dr.action}</p>
                  </div>
                  <Badge variant={dr.priority === "CRITICAL" ? "destructive" : dr.priority === "HIGH" ? "default" : "secondary"} className="text-[8px]">{dr.priority}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── BUYER SCRIPTS ── */}
        <TabsContent value="scripts" className="mt-4 space-y-4">
          {closingScripts.map((cs, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <cs.icon className="h-4 w-4 text-primary" /> {cs.channel}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cs.stages.map((s, j) => (
                  <div key={j} className="space-y-1.5">
                    <Badge variant="outline" className="text-[8px]">{s.stage}</Badge>
                    <pre className="text-[10px] text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-muted/30 rounded-lg p-3 border border-border/30">{s.script}</pre>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Follow-Up Cadence</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {followUpCadence.map((fu, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/20 border border-border/20">
                  <Badge variant="outline" className="text-[8px] shrink-0">{fu.timing}</Badge>
                  <p className="text-[10px] text-foreground">{fu.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── DAILY CHECKLIST ── */}
        <TabsContent value="checklist" className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Founder Revenue Focus</h3>
            <Badge variant="outline" className="text-[9px]">{checkedItems.size}/{founderChecklist.length}</Badge>
          </div>
          <Progress value={(checkedItems.size / founderChecklist.length) * 100} className="h-2 mb-3" />
          {founderChecklist.map((item, i) => (
            <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg border border-border/40", checkedItems.has(i) && "opacity-50")}>
              <Checkbox checked={checkedItems.has(i)} onCheckedChange={() => toggle(i)} />
              <div className="flex-1">
                <p className={cn("text-xs text-foreground", checkedItems.has(i) && "line-through")}>{item.task}</p>
              </div>
              <Badge className={cn("text-[8px]", categoryBadgeColors[item.category])}>{item.category}</Badge>
            </div>
          ))}
        </TabsContent>

        {/* ── REVENUE RISKS ── */}
        <TabsContent value="risks" className="mt-4 space-y-3">
          {monetizationRisks.map((mr, i) => (
            <Card key={i} className={cn("border-border", mr.severity === "CRITICAL" && "border-destructive/30 bg-destructive/5")}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn("h-4 w-4", mr.severity === "CRITICAL" ? "text-destructive" : "text-chart-4")} />
                  <Badge variant={mr.severity === "CRITICAL" ? "destructive" : "default"} className="text-[8px]">{mr.severity}</Badge>
                  <p className="text-xs font-semibold text-foreground">{mr.risk}</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{mr.mitigation}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FirstRevenueBlueprint;
