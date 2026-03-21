import React, { useState } from "react";
import {
  Flame, Calendar, Users, Target, MessageSquare, Phone,
  TrendingUp, AlertTriangle, CheckCircle2, Zap, Eye,
  BarChart3, Share2, Search, Star, Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — 30-DAY LAUNCH CALENDAR
   ═══════════════════════════════════════════════ */

const weeks = [
  { week: "WEEK 1 — Supply Activation", color: "text-chart-2", badge: "Day 1–7", dailyTargets: { vendors: 12, listings: 8, calls: 10 },
    days: [
      { day: "Day 1–2", tasks: ["Finalize target list: 100 agents in top 5 districts", "Prepare WhatsApp scripts, one-pager PDF, demo video", "Set up CRM tracker (even a Google Sheet works)", "Send first 20 WhatsApp outreach messages"] },
      { day: "Day 3–4", tasks: ["Follow-up calls on Day 1–2 messages — aim for 30% response", "First in-person meetings with 2 brokerage offices", "Manually upload 10 listings from first committed agents", "Post platform preview on personal social media for credibility"] },
      { day: "Day 5–7", tasks: ["Send 30 more outreach messages to second wave of agents", "Help 5 vendors upload their own listings with live support", "Quality-check all listings: photos, pricing, descriptions", "Target: 40+ listings live by end of Week 1"] },
    ]},
  { week: "WEEK 2 — Buyer Awareness Push", color: "text-primary", badge: "Day 8–14", dailyTargets: { visitors: 200, inquiries: 5, content: 3 },
    days: [
      { day: "Day 8–9", tasks: ["Launch Google Ads: '[City] property for sale' keywords — Rp 500K/day budget", "Create 3 Instagram Reels: 'Top 5 Villas Under Rp 3B' style content", "Set up Facebook pixel and retargeting audience", "Email/WhatsApp blast to personal network: 'We just launched'"] },
      { day: "Day 10–11", tasks: ["Launch Facebook/IG ads: carousel of best 10 listings", "Create SEO landing pages for top 3 districts", "Post daily 'New Listing Alert' on Instagram Stories", "Start WhatsApp broadcast list: send 'Property of the Day'"] },
      { day: "Day 12–14", tasks: ["Analyze first ad performance — kill underperformers, double winners", "Direct outreach to 20 known active property investors", "Publish first blog post: 'Best Investment Areas in [City] 2024'", "Target: 100+ daily visitors, 15+ inquiries by end of Week 2"] },
    ]},
  { week: "WEEK 3 — Conversion Acceleration", color: "text-chart-4", badge: "Day 15–21", dailyTargets: { inquiries: 10, viewings: 3, conversions: 1 },
    days: [
      { day: "Day 15–16", tasks: ["Review all inquiries — personally follow up on every one within 2 hours", "Test urgency messaging: 'Only 3 units left at this price' on hot listings", "Offer first 5 vendors a free 'Featured Listing' boost for 7 days", "Schedule property viewing assistance for top 3 serious inquiries"] },
      { day: "Day 17–18", tasks: ["Launch retargeting ads to all listing page visitors (Rp 300K/day)", "Create 'Investor Deal of the Week' content series", "Direct message 30 new agents with proof: 'X inquiries generated this week'", "A/B test listing page CTAs: 'Inquire Now' vs 'Schedule Viewing' vs 'Get Price Analysis'"] },
      { day: "Day 19–21", tasks: ["Push vendor WhatsApp group: share inquiry stats and social proof", "Test premium listing pricing with 3 willing vendors (Rp 500K-1.5M)", "Introduce 'Price Drop Alert' notifications for saved properties", "Target: 30+ total inquiries, first facilitated viewing or deal connection"] },
    ]},
  { week: "WEEK 4 — Market Momentum Lock", color: "text-foreground", badge: "Day 22–30", dailyTargets: { listings: 5, retention: 90, revenue: 1 },
    days: [
      { day: "Day 22–24", tasks: ["Publish marketplace stats: '200+ listings, 50+ inquiries this month'", "Create success story: interview first agent who received quality leads", "Launch 'Agent Leaderboard' — rank by response time and inquiry count", "Push vendor upgrade: 'Upgrade to Premium — 3x more visibility'"] },
      { day: "Day 25–27", tasks: ["Fix top 3 UX friction points identified from user behavior", "Optimize search: ensure top districts show quality results immediately", "Launch 'Invite an Agent' referral: both get 1 month free premium", "Send personalized reports to every vendor: 'Your listing got X views'"] },
      { day: "Day 28–30", tasks: ["Month-end review: total listings, inquiries, vendor retention, revenue", "Set Month 2 targets based on actual Week 1–4 data", "Identify top 10 performing vendors — give exclusive 'Founding Partner' badge", "Target: 150+ listings, 80+ inquiries, first revenue from premium placements"] },
    ]},
];

/* ═══════════════════════════════════════════════
   SECTION 2 — BUYER TRAFFIC SYSTEM
   ═══════════════════════════════════════════════ */

const trafficChannels = [
  { channel: "Geo-Targeted Search Ads", icon: Search, budget: "Rp 500K–1M/day", priority: "CRITICAL",
    tactics: ["Target: 'jual villa [kota]', 'rumah dijual [district]', 'investasi properti [area]'", "Landing pages per district with 10+ listings each — not homepage", "Negative keywords: 'sewa', 'kontrakan' if focusing on sales", "Expected CPC: Rp 2,000–5,000 | Target CTR: >4%"],
    kpi: "50–100 qualified daily visitors from search" },
  { channel: "Social Media Retargeting", icon: Eye, budget: "Rp 300K–500K/day", priority: "HIGH",
    tactics: ["Pixel all listing page visitors — retarget within 48 hours", "Carousel ads showing properties they viewed + similar options", "Video ads: 30-sec property walkthrough of premium listings", "Frequency cap: 3x per user per week to avoid fatigue"],
    kpi: "15–25% return visit rate from retargeted users" },
  { channel: "Content-Driven Organic", icon: TrendingUp, budget: "Time only", priority: "HIGH",
    tactics: ["Weekly: 'Top 5 Properties Under Rp X' Instagram Reels/TikTok", "Monthly: 'Best Investment Districts in [City]' blog + SEO", "Daily: Instagram Story — new listing showcase with swipe-up link", "Bi-weekly: YouTube video — property market update or area guide"],
    kpi: "500+ organic monthly visitors within 60 days" },
  { channel: "WhatsApp & Network Activation", icon: MessageSquare, budget: "Minimal", priority: "HIGH",
    tactics: ["Weekly broadcast to investor list: 'Top Deals This Week' with 3-5 listings", "Agent-shared links: each vendor gets a trackable referral link", "Buyer WhatsApp group: 'Astra Property Alerts [City]' — daily updates", "Personal network activation: ask 50 contacts to share launch post"],
    kpi: "20% of total traffic from referral/direct within 30 days" },
];

const trafficKPIs = [
  { metric: "Daily Serious Visitors", target: "200+ by Day 30", formula: "Visitors who view ≥2 listings or spend >2 min on platform" },
  { metric: "Inquiry Conversion Rate", target: ">3% of visitors", formula: "Inquiries / unique listing page visitors" },
  { metric: "Repeat Visit Rate", target: ">25% weekly", formula: "Users visiting 2+ times per week / total users" },
  { metric: "Cost Per Inquiry", target: "<Rp 50,000", formula: "Total ad spend / total inquiries generated" },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — AGENT CONVERSION PSYCHOLOGY
   ═══════════════════════════════════════════════ */

const motivationTriggers = [
  { trigger: "Fear of Missing Out (FOMO)", icon: Zap, psychology: "Agents are competitive. When they hear competitors are getting leads from a new platform, they can't afford to NOT be there.", script: "\"Sudah ada 15 agen di [District] yang bergabung minggu ini. Beberapa sudah dapat 5+ inquiry serius. Kami masih buka slot untuk area Bapak/Ibu — tapi premium placement tinggal 3 slot lagi.\"" },
  { trigger: "Lead Quality Promise", icon: Target, psychology: "Agents waste 80% of their time on unserious inquiries. Promise of pre-filtered, serious buyer leads is irresistible.", script: "\"Kami filter semua inquiry — hanya buyer yang sudah verified dan punya budget yang sesuai yang kami kirim ke agen. Tidak ada lagi buang waktu dengan penanya yang tidak serius.\"" },
  { trigger: "Performance Visibility", icon: BarChart3, psychology: "Agents who can SEE their metrics (views, inquiries, response time) become addicted to optimizing. Data transparency creates engagement.", script: "\"Setiap listing Bapak/Ibu punya dashboard sendiri — berapa views, berapa inquiry, response time rata-rata. Agen dengan response time <2 jam dapat 3x lebih banyak leads.\"" },
  { trigger: "Social Proof Cascade", icon: Users, psychology: "Once 3-5 agents in a district join, the rest follow. Nobody wants to be the last agent without a digital presence.", script: "\"Di Canggu, 8 dari 12 agen top sudah aktif di Astra. Buyer yang cari properti di area ini sekarang mulai dari platform kami. Kalau listing Bapak/Ibu belum ada, mereka tidak akan terlihat.\"" },
];

const objectionHandling = [
  { objection: "\"Saya sudah pakai portal lain\"", response: "\"Bagus — kami bukan pengganti, kami tambahan channel. Agen terbaik kami pasang listing di 3-4 platform. Yang penting: di Astra, buyer-nya sudah difilter, jadi inquiry yang masuk lebih serius. Coba 3 bulan — gratis. Kalau tidak dapat hasil, tidak ada ruginya.\"" },
  { objection: "\"Saya tidak punya waktu upload listing\"", response: "\"Kami yang uploadkan. Kirim saja foto dan detail via WhatsApp, tim kami yang proses semuanya. Bapak/Ibu tinggal terima notifikasi kalau ada inquiry masuk.\"" },
  { objection: "\"Platform baru, belum ada buyer\"", response: "\"Minggu ini kami sudah dapat [X] inquiry dari [Y] investor aktif. Budget iklan kami Rp [Z] juta per bulan khusus untuk datangkan buyer ke platform. Agen yang gabung sekarang dapat semua traffic itu dengan sedikit kompetisi.\"" },
  { objection: "\"Berapa biayanya?\"", response: "\"Untuk mitra awal: GRATIS 3 bulan full premium. Setelah itu mulai dari Rp 299K/bulan — lebih murah dari 1x makan siang bisnis. Dan itu sudah termasuk analytics, featured placement, dan lead prioritas.\"" },
];

const closingQuestions = [
  "\"Kalau saya bisa buatkan listing Bapak/Ibu live dalam 24 jam dan gratis 3 bulan — ada alasan untuk tidak coba?\"",
  "\"Mau mulai dengan 3 listing terbaik dulu? Kirim via WhatsApp hari ini, besok sudah live.\"",
  "\"Dari portofolio Bapak/Ibu, listing mana yang paling butuh exposure tambahan? Kita mulai dari situ.\"",
];

const retentionMechanics = [
  { mechanic: "Weekly Performance Reports", detail: "Every Monday: 'Listing Anda mendapat 45 views dan 3 inquiry minggu ini.' Agents who see results stay. Agents who don't see reports churn." },
  { mechanic: "Response Time Leaderboard", detail: "Rank agents by response speed. Top 10 get 'Fast Responder' badge visible to buyers. Creates competitive engagement." },
  { mechanic: "Founding Partner Badge", detail: "First 50 agents get permanent 'Founding Partner' status — priority support, early access to features, and premium placement preference." },
  { mechanic: "Upgrade Pathway Nudges", detail: "After agent receives 5th inquiry: 'Upgrade ke Premium untuk 3x lebih banyak exposure.' Timing the upsell when value is proven." },
];

/* ═══════════════════════════════════════════════
   DAILY MONITORING & RISKS
   ═══════════════════════════════════════════════ */

const dailyMonitoring = [
  { metric: "New listings added", target: "5+", warning: "<2" },
  { metric: "Total inquiries today", target: "5+", warning: "<1" },
  { metric: "Vendor messages sent", target: "10+", warning: "<5" },
  { metric: "Ad spend ROI (cost per inquiry)", target: "<Rp 50K", warning: ">Rp 100K" },
  { metric: "Average vendor response time", target: "<4 hours", warning: ">24 hours" },
  { metric: "Listing page bounce rate", target: "<60%", warning: ">80%" },
  { metric: "Unique visitors today", target: "100+", warning: "<30" },
  { metric: "Social media post engagement", target: ">3%", warning: "<0.5%" },
];

const launchRisks = [
  { risk: "Zero inquiries in first 2 weeks", severity: "CRITICAL", mitigation: "Pivot to hyper-local: pick ONE district, saturate with 30+ listings, run ads ONLY for that area. Density beats coverage at launch." },
  { risk: "Agents agree but never upload listings", severity: "HIGH", mitigation: "Do it FOR them. Ask for photos via WhatsApp, upload yourself. First 100 listings are founder's manual labor — no shortcuts." },
  { risk: "Traffic but no inquiries", severity: "HIGH", mitigation: "Inquiry button is buried, or listings lack detail. A/B test CTAs, add WhatsApp inquiry option, ensure phone numbers are visible." },
  { risk: "Ad budget burns with no conversions", severity: "HIGH", mitigation: "Pause broad targeting. Switch to exact-match keywords and retargeting only. Rp 300K/day on retargeting outperforms Rp 1M on broad." },
  { risk: "Vendors leave after 2 weeks", severity: "MEDIUM", mitigation: "They didn't see value. Send weekly reports even if numbers are small. 'Your listing got 23 views' is better than silence." },
  { risk: "Competitor copies your outreach", severity: "LOW", mitigation: "Speed is the moat. They can copy the script; they can't copy the relationships you built in Week 1-2. Move fast." },
];

/* ═══════════════════════════════════════════════ */

const ThirtyDayLaunchBlueprint: React.FC = () => {
  const [checkedMetrics, setCheckedMetrics] = useState<Set<number>>(new Set());

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="30-Day Hardcore Launch Plan"
        description="Week-by-week execution, buyer traffic tactics & agent conversion psychology"
        icon={Flame}
        badge={{ text: "🔥 30 Days", variant: "outline" }}
      />

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="calendar" className="text-xs">30-Day Calendar</TabsTrigger>
          <TabsTrigger value="traffic" className="text-xs">Buyer Traffic</TabsTrigger>
          <TabsTrigger value="agents" className="text-xs">Agent Conversion</TabsTrigger>
          <TabsTrigger value="monitor" className="text-xs">Daily Monitor</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">Launch Risks</TabsTrigger>
        </TabsList>

        {/* ── 30-DAY CALENDAR ── */}
        <TabsContent value="calendar" className="mt-4 space-y-4">
          {weeks.map((w, i) => (
            <Card key={i} className={cn("border-border", i === 0 && "border-chart-2/30 bg-chart-2/5")}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className={cn("text-sm", w.color)}>{w.week}</CardTitle>
                  <Badge variant="outline" className="text-[9px]">{w.badge}</Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(w.dailyTargets).map(([k, v]) => (
                    <Badge key={k} variant="secondary" className="text-[8px]">{k}: {v}/day</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {w.days.map((d, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1.5">
                    <p className="text-xs font-bold text-foreground">{d.day}</p>
                    {d.tasks.map((t, k) => (
                      <div key={k} className="flex items-start gap-2 text-[10px] text-foreground">
                        <span className="text-primary shrink-0">→</span> {t}
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── BUYER TRAFFIC ── */}
        <TabsContent value="traffic" className="mt-4 space-y-4">
          {trafficChannels.map((tc, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <tc.icon className="h-4 w-4 text-primary" /> {tc.channel}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge variant={tc.priority === "CRITICAL" ? "destructive" : "default"} className="text-[8px]">{tc.priority}</Badge>
                    <Badge variant="outline" className="text-[8px]">{tc.budget}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {tc.tactics.map((t, j) => (
                  <div key={j} className="flex items-start gap-2 text-[10px] text-foreground">
                    <span className="text-primary shrink-0">→</span> {t}
                  </div>
                ))}
                <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-[10px] text-primary font-medium">🎯 {tc.kpi}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Traffic KPI Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trafficKPIs.map((k, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{k.metric}</p>
                    <p className="text-[9px] text-muted-foreground">{k.formula}</p>
                  </div>
                  <Badge variant="outline" className="text-xs font-bold">{k.target}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AGENT CONVERSION ── */}
        <TabsContent value="agents" className="mt-4 space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Motivation Triggers & Scripts</h3>
            {motivationTriggers.map((mt, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <mt.icon className="h-4 w-4 text-primary" />
                    <p className="text-xs font-bold text-foreground">{mt.trigger}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{mt.psychology}</p>
                  <pre className="text-[10px] text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-muted/30 rounded-lg p-3 border border-border/30">{mt.script}</pre>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Objection Handling</h3>
            {objectionHandling.map((oh, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-3 space-y-2">
                  <p className="text-xs font-bold text-destructive">{oh.objection}</p>
                  <pre className="text-[10px] text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-chart-2/5 rounded-lg p-3 border border-chart-2/20">{oh.response}</pre>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Closing Questions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {closingQuestions.map((cq, i) => (
                <p key={i} className="text-xs text-foreground font-medium italic bg-primary/5 p-2 rounded-lg">{cq}</p>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Retention Mechanics</h3>
            {retentionMechanics.map((rm, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-3 space-y-1">
                  <p className="text-xs font-semibold text-foreground">{rm.mechanic}</p>
                  <p className="text-[10px] text-muted-foreground">{rm.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── DAILY MONITOR ── */}
        <TabsContent value="monitor" className="mt-4 space-y-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Daily Traction Dashboard</h3>
          {dailyMonitoring.map((dm, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={checkedMetrics.has(i)}
                  onCheckedChange={() => {
                    setCheckedMetrics(prev => {
                      const n = new Set(prev);
                      n.has(i) ? n.delete(i) : n.add(i);
                      return n;
                    });
                  }}
                />
                <p className="text-xs text-foreground">{dm.metric}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="default" className="text-[8px]">🎯 {dm.target}</Badge>
                <Badge variant="destructive" className="text-[8px]">⚠ {dm.warning}</Badge>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ── LAUNCH RISKS ── */}
        <TabsContent value="risks" className="mt-4 space-y-3">
          {launchRisks.map((lr, i) => (
            <Card key={i} className={cn("border-border", lr.severity === "CRITICAL" && "border-destructive/30 bg-destructive/5")}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn("h-4 w-4", lr.severity === "CRITICAL" ? "text-destructive" : lr.severity === "HIGH" ? "text-chart-4" : "text-muted-foreground")} />
                  <Badge variant={lr.severity === "CRITICAL" ? "destructive" : lr.severity === "HIGH" ? "default" : "secondary"} className="text-[8px]">{lr.severity}</Badge>
                  <p className="text-xs font-semibold text-foreground">{lr.risk}</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{lr.mitigation}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThirtyDayLaunchBlueprint;
