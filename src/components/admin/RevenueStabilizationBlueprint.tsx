import React, { useState } from "react";
import {
  DollarSign, BarChart3, Users, Shield, TrendingUp,
  AlertTriangle, CheckCircle2, Zap, Clock, Star,
  Eye, Target, Activity, Trophy, UserPlus, Handshake,
  MessageSquare, Heart, Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — $100K REVENUE STABILIZATION
   ═══════════════════════════════════════════════ */

const revenueStreams = [
  { stream: "Vendor Subscriptions (Recurring Base)", icon: Star, color: "text-primary", targetPct: "40%", targetAmount: "$40K/mo",
    tactics: [
      { tactic: "Annual commitment discount", detail: "Offer 20% discount for annual prepay vs monthly. 'Hemat Rp 1.2M/tahun dengan paket tahunan — hanya Rp 399K/bulan vs Rp 499K.' Goal: 60% of subscribers on annual plans = predictable 12-month revenue base." },
      { tactic: "Tiered value ladder", detail: "3 tiers: Silver (Rp 299K — basic visibility), Gold (Rp 699K — featured placement + analytics), Platinum (Rp 1.5M — dedicated leads + priority support). Most vendors start Silver → upgrade after seeing inquiry data. Target: 30% upgrade rate within 60 days." },
      { tactic: "Auto-renewal with value reminders", detail: "7 days before renewal: 'Bulan ini listing Anda mendapat [X] views dan [Y] inquiry. Renewal otomatis dalam 7 hari.' Show value BEFORE the charge. Reduces churn by 35%." },
    ]},
  { stream: "Listing Boost Revenue (Transactional)", icon: Zap, color: "text-chart-4", targetPct: "25%", targetAmount: "$25K/mo",
    tactics: [
      { tactic: "Scheduled boost campaigns", detail: "Every Friday: 'Weekend Boost Sale — 30% off semua boost paket. Listing yang di-boost weekend mendapat 2.5x lebih banyak views.' Create predictable weekly revenue spike. Track: avg 15-20 boost purchases per campaign." },
      { tactic: "Auto-boost recommendations", detail: "When listing hits 50+ views but <3% inquiry rate: 'Listing Anda populer tapi belum convert. Boost ke Featured untuk tampil di notifikasi [X] investor yang cocok. Rp 750K — guaranteed 500+ additional views.'" },
      { tactic: "Bundle pricing", detail: "Single boost: Rp 750K | 3-pack: Rp 1.8M (20% off) | 5-pack: Rp 2.5M (33% off). Bundles increase average transaction value by 40% and create usage commitment." },
    ]},
  { stream: "Investor Premium Access", icon: Target, color: "text-chart-2", targetPct: "20%", targetAmount: "$20K/mo",
    tactics: [
      { tactic: "Tiered investor plans", detail: "Explorer (Free — limited views) | Pro (Rp 499K/mo — full analytics + early access) | Institutional (Rp 5M/mo — API access + portfolio tools + dedicated analyst). Target: 200 Pro + 5 Institutional = stable $20K base." },
      { tactic: "Exclusive deal windows", detail: "Premium investors see new listings 48h before public. Track conversion: premium investors who act in the 48h window close 3x faster. This alone justifies the subscription cost." },
      { tactic: "Intelligence reports upsell", detail: "Monthly 'Market Intelligence Report' for each subscribed city. Free preview (3 data points), full report for Pro subscribers (50+ data points, yield analysis, growth projections)." },
    ]},
  { stream: "Transaction & Service Fees", icon: Handshake, color: "text-chart-5", targetPct: "15%", targetAmount: "$15K/mo",
    tactics: [
      { tactic: "Success fee on facilitated deals", detail: "0.5-1% platform fee on deals where Astra actively facilitated (connected buyer-vendor, coordinated viewing, supported negotiation). Position as value-add, not tax: 'Kami bantu dari inquiry sampai closing — fee hanya dikenakan jika deal berhasil.'" },
      { tactic: "Service marketplace commissions", detail: "Partner with notaris, bank, insurance, renovation services. 5-10% referral commission on each completed service. Target: 3-5 service partners per city generating passive revenue." },
      { tactic: "Premium listing creation service", detail: "Professional photography + copywriting + virtual tour: Rp 2-5M per listing. Outsource production, keep 40% margin. Vendors who use this service get 3x more inquiries — self-selling upgrade." },
    ]},
];

const monthlyMilestones = [
  { month: "Month 1", target: "$30-40K", focus: "Establish subscription base (50+ vendors) + consistent boost sales", risk: "Over-reliance on one-time boosts" },
  { month: "Month 2", target: "$50-65K", focus: "Launch investor premium + service partnerships + bundle pricing", risk: "Vendor churn if inquiry quality drops" },
  { month: "Month 3", target: "$70-85K", focus: "Scale annual commitments + institutional investor tier + transaction fees", risk: "Pricing pushback from market" },
  { month: "Month 4", target: "$85-100K", focus: "Revenue diversification stable across all 4 streams + buffer built", risk: "Seasonal demand fluctuation" },
  { month: "Month 5+", target: "$100K+ stable", focus: "Optimize unit economics, reduce CAC, increase LTV through retention", risk: "Competitor pricing pressure" },
];

const revenueAlerts = [
  { signal: "Boost purchases drop >30% week-over-week", action: "Check: are listings getting enough organic inquiries? If yes, vendors don't need boosts (good problem). If no, traffic acquisition has stalled (bad problem).", severity: "HIGH" },
  { signal: "Vendor subscription churn >10% monthly", action: "Exit survey every churner. Top reasons are usually: 'not enough inquiries' (demand problem) or 'too expensive for results' (pricing problem). Fix the root cause, not the symptom.", severity: "CRITICAL" },
  { signal: "Investor premium conversion <3%", action: "The value proposition isn't clear enough. A/B test: free trial (7 days full access) vs freemium (limited features forever). Most SaaS converts better with time-limited full access.", severity: "MEDIUM" },
  { signal: "Revenue concentration >50% from single stream", action: "Diversification urgency. If one stream dies, you lose half your revenue overnight. Accelerate development of the weakest stream.", severity: "HIGH" },
];

/* ═══════════════════════════════════════════════
   SECTION 2 — TRUST & REPUTATION
   ═══════════════════════════════════════════════ */

const trustPillars = [
  { pillar: "Social Proof & Authority", icon: Trophy, color: "text-chart-4", initiatives: [
    { initiative: "Deal success counter", detail: "Homepage banner: 'Rp [X]B+ transaksi difasilitasi melalui Astra | [Y]+ properti aktif | [Z]+ investor terdaftar'. Update weekly. Real numbers build real trust — never inflate." },
    { initiative: "Weekly market insights", detail: "Every Monday publish: 'Astra Market Pulse — [City]'. Include: listings added, average price movement, hottest districts, investor activity index. Position Astra as the market authority, not just a listing site." },
    { initiative: "Video testimonials", detail: "After every closed deal, ask both buyer and vendor for 60-second video testimonial. 'Bagaimana pengalaman Bapak/Ibu menggunakan Astra?' Aim for 2 new testimonials per month. Feature on homepage and social media." },
    { initiative: "Agent success stories", detail: "Monthly spotlight: 'Agent of the Month — [Nama] closed [X] deals worth Rp [Y]B through Astra this month.' Motivates other agents AND signals platform activity to buyers." },
  ]},
  { pillar: "User Experience Trust", icon: Shield, color: "text-primary", initiatives: [
    { initiative: "Listing verification badges", detail: "3 verification levels: ✅ 'Verified Photos' (platform-confirmed real photos) | ✅✅ 'Verified Details' (price, size, documents checked) | ✅✅✅ 'Astra Verified' (physical inspection completed). Each level increases inquiry rate by ~20%." },
    { initiative: "Price transparency scoring", detail: "Show buyers: 'Harga ini [X]% [di atas/di bawah] rata-rata area untuk properti serupa.' Transparency builds buyer confidence. Vendors initially resist — but properties with price context get 40% more serious inquiries." },
    { initiative: "Response time guarantee", detail: "Badge for agents: '⚡ Responds within 2 hours'. Buyers see this and prefer these agents. Agents who consistently miss the SLA lose the badge. Creates self-reinforcing quality standard." },
    { initiative: "Dispute resolution process", detail: "Published clear process: complaint → 24h acknowledgment → 48h investigation → resolution. Even if disputes are rare, having the process visible signals professionalism." },
  ]},
  { pillar: "Brand Authority Activities", icon: Award, color: "text-chart-2", initiatives: [
    { initiative: "Developer partnership announcements", detail: "Partner with 2-3 reputable developers for exclusive listing periods. Press release: 'Astra menjadi platform eksklusif untuk pemasaran [Developer] — [X] unit premium tersedia.' Borrows developer credibility." },
    { initiative: "Educational content series", detail: "Monthly webinar: 'Investasi Properti Cerdas' — free, educational, non-salesy. Topics: tax optimization, market timing, due diligence checklist. Attracts serious investors who become premium subscribers." },
    { initiative: "Local media presence", detail: "Quarterly market report shared with property journalists. Position founder as expert source: 'Menurut data Astra, pasar properti [City] menunjukkan [trend]...' Earned media > paid media for trust." },
    { initiative: "Industry association membership", detail: "Join REI (Real Estate Indonesia), AREBI, or local property associations. Display membership badges. Attend and speak at events. Institutional credibility accelerates vendor recruitment." },
  ]},
];

const trustKpis = [
  { metric: "Repeat visitor rate (monthly)", target: ">35%", warning: "<15%", why: "Repeat visitors trust your platform enough to come back. Growing repeat rate = growing trust." },
  { metric: "Vendor retention rate (monthly)", target: ">90%", warning: "<80%", why: "If vendors are leaving, trust is broken somewhere — inquiries, support, or perceived value." },
  { metric: "Positive feedback ratio", target: ">85%", warning: "<70%", why: "Of all feedback received, what percentage is positive? Below 70% = systemic issues." },
  { metric: "Verified listing percentage", target: ">60%", warning: "<30%", why: "Higher verification = higher buyer trust = higher inquiry quality = higher vendor satisfaction." },
  { metric: "Net Promoter Score (NPS)", target: ">40", warning: "<10", why: "Would users recommend Astra? NPS above 40 = strong organic growth potential." },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — AGENT NETWORK EXPANSION
   ═══════════════════════════════════════════════ */

const recruitmentChannels = [
  { channel: "Agency Partnerships", icon: Handshake, tactics: [
    { tactic: "Target top 10 agencies per city", detail: "Research the 10 highest-volume agencies in each target city. Approach the principal/owner — not individual agents. Offer: 'Semua agen di kantor Anda bisa listing gratis selama 3 bulan. Kami handle onboarding dan training.' Converting 1 agency = 10-30 agents at once." },
    { tactic: "Exclusive territory partnerships", detail: "Offer select agencies exclusive 'Premium Partner' status in their district. They get priority placement + dedicated support. In return: minimum 20 active listings and platform exclusivity for premium inventory." },
  ]},
  { channel: "Agent Referral Program", icon: Users, tactics: [
    { tactic: "Referral incentive structure", detail: "Existing agent refers new agent → both get 1 free Boost (worth Rp 750K) when the new agent publishes their first 3 listings. Simple, tangible, immediate reward. Target: 20% of new agents from referrals (lowest CAC channel)." },
    { tactic: "Top referrer rewards", detail: "Monthly: agent who refers the most active new agents gets 'Super Connector' badge + 1 month free Premium subscription. Gamification drives sustained referral behavior." },
  ]},
  { channel: "Event & Community Presence", icon: Star, tactics: [
    { tactic: "Property expo participation", detail: "Attend 1-2 property expos per quarter. Not as exhibitor (expensive) — as networking participant. Collect agent contacts, demo the platform 1-on-1. Convert 10-15 agents per event at near-zero cost." },
    { tactic: "Monthly agent meetups", detail: "Host informal gathering: 'Astra Agent Circle — Networking & Market Update'. Coffee, 30-min market presentation, Q&A. Creates community, loyalty, and word-of-mouth. Budget: Rp 2-3M per event for 20-30 agents." },
  ]},
  { channel: "Digital Recruitment", icon: Target, tactics: [
    { tactic: "LinkedIn and Instagram outreach", detail: "Target agents posting listings on social media but not on any platform. DM template: 'Saya lihat listing [Properti] Bapak/Ibu — sangat menarik. Minggu ini ada [X] investor aktif di area tersebut di platform kami. Mau coba listing gratis?' Show immediate value." },
    { tactic: "Agent success ads", detail: "Run targeted ads showing real agent success stories: '[Nama] closed Rp 3.5B in deals through Astra in 2 months. Join 500+ agents already growing their business.' Social proof + FOMO for agents not yet on the platform." },
  ]},
];

const onboardingFlow = [
  { step: "Day 0: Welcome & Setup", detail: "Personal welcome message + guided listing upload (screen share if needed). Goal: first listing published within 24 hours of signup. If they don't list within 48h, they likely never will." },
  { step: "Day 1-3: First Listing Optimization", detail: "Review their first listing. Provide specific feedback: photo quality, description improvement, pricing competitiveness. Help them understand what makes a listing convert." },
  { step: "Day 7: First Results Check", detail: "Message: 'Listing Anda sudah mendapat [X] views dan [Y] inquiries minggu ini. Ini [above/below] rata-rata untuk area tersebut. Tips untuk minggu depan: [specific suggestion].' Show them the platform works." },
  { step: "Day 14: Expansion Push", detail: "Encourage second and third listings: 'Agen dengan 5+ listing aktif mendapat 3x lebih banyak total inquiry. Ada properti lain yang bisa di-listing?' More listings = more stickiness." },
  { step: "Day 30: Performance Review & Upgrade", detail: "Share monthly performance summary. If results are strong: pitch Premium subscription. If weak: provide coaching and optimization support. Never let a new agent feel abandoned." },
];

const expansionKpis = [
  { metric: "New active agents per week", target: "10-15", warning: "<5" },
  { metric: "Agent activation rate (list within 48h)", target: ">70%", warning: "<40%" },
  { metric: "Listings per active agent", target: ">3", warning: "<1.5" },
  { metric: "Agent 90-day retention", target: ">75%", warning: "<50%" },
  { metric: "Agent referral rate", target: ">15%", warning: "<5%" },
  { metric: "Vendor productivity (inquiries/listing/month)", target: ">5", warning: "<2" },
];

/* ═══════════════════════════════════════════════
   MONTHLY CHECKLIST & RISKS
   ═══════════════════════════════════════════════ */

const monthlyChecklist = [
  { task: "Review MRR breakdown by stream — is diversification improving?", category: "Revenue" },
  { task: "Analyze vendor churn — exit-survey all churners this month", category: "Retention" },
  { task: "Check boost revenue trend — seasonal or structural decline?", category: "Revenue" },
  { task: "Review agent onboarding funnel — where are drop-offs?", category: "Growth" },
  { task: "Publish monthly Market Pulse report", category: "Trust" },
  { task: "Collect 2+ new testimonials from closed deals", category: "Trust" },
  { task: "Host agent community meetup or webinar", category: "Network" },
  { task: "Evaluate pricing tiers — any tier underperforming?", category: "Revenue" },
  { task: "Review investor premium conversion funnel", category: "Revenue" },
  { task: "Plan next month's promotional calendar", category: "Planning" },
];

const scaleRisks = [
  { risk: "Revenue plateau before $100K", severity: "HIGH", mitigation: "Likely a market size issue (not enough vendors/investors) or pricing ceiling. Solutions: 1) Expand to adjacent city to increase TAM, 2) Launch new revenue stream (service marketplace), 3) Increase ARPU through premium tier improvements." },
  { risk: "Agent network growth stalls", severity: "HIGH", mitigation: "Recruitment channels exhausted OR value proposition weakening. Survey inactive agents: 'Why did you stop listing?' Common answers: 'not enough inquiries' (demand problem), 'too complex' (UX problem), 'competitor offers more' (competitive problem). Fix the specific blocker." },
  { risk: "Market trust incident (fraud, misrepresentation)", severity: "CRITICAL", mitigation: "One bad experience shared publicly can destroy months of trust-building. Proactive: increase verification standards, create response playbook, maintain legal counsel on retainer. Reactive: acknowledge within 2 hours, investigate within 24 hours, resolve within 72 hours. Transparency > perfection." },
  { risk: "Competitor launches aggressive pricing", severity: "MEDIUM", mitigation: "Never compete on price alone — compete on value. Your moat is data intelligence + inquiry quality + vendor support. If a competitor offers free listings, respond with: 'Free listings get free results. Our vendors get [X] inquiries/month average.' Demonstrate ROI superiority." },
  { risk: "Seasonal revenue volatility", severity: "MEDIUM", mitigation: "Property markets have natural cycles (slower Dec-Jan, Ramadan period). Build 2-month cash buffer at $100K run rate. During slow periods: focus on platform improvements, agent training, content production — invest in future growth." },
];

const categoryBadgeColors: Record<string, string> = {
  Revenue: "bg-chart-4/10 text-chart-4",
  Retention: "bg-destructive/10 text-destructive",
  Growth: "bg-chart-2/10 text-chart-2",
  Trust: "bg-primary/10 text-primary",
  Network: "bg-chart-5/10 text-chart-5",
  Planning: "bg-muted text-muted-foreground",
};

/* ═══════════════════════════════════════════════ */

const RevenueStabilizationBlueprint: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => setCheckedItems(prev => {
    const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n;
  });

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="$100K Revenue Stabilization"
        description="Revenue consistency, market trust building & agent network expansion"
        icon={DollarSign}
        badge={{ text: "📈 Scale", variant: "outline" }}
      />

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="revenue" className="text-xs">$100K Revenue</TabsTrigger>
          <TabsTrigger value="trust" className="text-xs">Market Trust</TabsTrigger>
          <TabsTrigger value="agents" className="text-xs">Agent Network</TabsTrigger>
          <TabsTrigger value="monitor" className="text-xs">Monthly Monitor</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">Scale Risks</TabsTrigger>
        </TabsList>

        {/* ── REVENUE STABILIZATION ── */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          {revenueStreams.map((rs, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className={cn("text-sm flex items-center gap-2", rs.color)}>
                    <rs.icon className="h-4 w-4" /> {rs.stream}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-[9px]">{rs.targetPct}</Badge>
                    <Badge variant="default" className="text-[9px]">{rs.targetAmount}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {rs.tactics.map((t, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground">{t.tactic}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{t.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Milestone Trajectory</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {monthlyMilestones.map((mm, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/20 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <p className="text-xs font-semibold text-foreground">{mm.month}</p>
                    <Badge variant="default" className="text-[9px]">🎯 {mm.target}</Badge>
                  </div>
                  <p className="text-[9px] text-chart-2">{mm.focus}</p>
                  <p className="text-[9px] text-destructive/70">⚠ {mm.risk}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-chart-4" /> Revenue Alert Signals</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {revenueAlerts.map((ra, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/40 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={ra.severity === "CRITICAL" ? "destructive" : "default"} className="text-[8px]">{ra.severity}</Badge>
                    <p className="text-xs font-semibold text-foreground">{ra.signal}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{ra.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MARKET TRUST ── */}
        <TabsContent value="trust" className="mt-4 space-y-4">
          {trustPillars.map((tp, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", tp.color)}>
                  <tp.icon className="h-4 w-4" /> {tp.pillar}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tp.initiatives.map((init, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground">{init.initiative}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{init.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Trust & Reputation KPIs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {trustKpis.map((tk, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/40 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <p className="text-xs font-semibold text-foreground">{tk.metric}</p>
                    <div className="flex gap-1">
                      <Badge variant="default" className="text-[8px]">🎯 {tk.target}</Badge>
                      <Badge variant="destructive" className="text-[8px]">⚠ {tk.warning}</Badge>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground">{tk.why}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AGENT NETWORK ── */}
        <TabsContent value="agents" className="mt-4 space-y-4">
          {recruitmentChannels.map((rc, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <rc.icon className="h-4 w-4 text-primary" /> {rc.channel}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rc.tactics.map((t, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground">{t.tactic}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{t.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Agent Onboarding Flow (30-Day Journey)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {onboardingFlow.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/20">
                  <Badge variant="outline" className="text-[8px] shrink-0 mt-0.5">{i + 1}</Badge>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">{step.step}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Agent Network Expansion KPIs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {expansionKpis.map((ek, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20 flex-wrap gap-1">
                  <p className="text-[10px] text-foreground font-medium">{ek.metric}</p>
                  <div className="flex gap-1">
                    <Badge variant="default" className="text-[8px]">🎯 {ek.target}</Badge>
                    <Badge variant="destructive" className="text-[8px]">⚠ {ek.warning}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MONTHLY MONITOR ── */}
        <TabsContent value="monitor" className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Performance Checklist</h3>
            <Badge variant="outline" className="text-[9px]">{checkedItems.size}/{monthlyChecklist.length}</Badge>
          </div>
          <Progress value={(checkedItems.size / monthlyChecklist.length) * 100} className="h-2 mb-3" />
          {monthlyChecklist.map((item, i) => (
            <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg border border-border/40", checkedItems.has(i) && "opacity-50")}>
              <Checkbox checked={checkedItems.has(i)} onCheckedChange={() => toggle(i)} />
              <div className="flex-1">
                <p className={cn("text-xs text-foreground", checkedItems.has(i) && "line-through")}>{item.task}</p>
              </div>
              <Badge className={cn("text-[8px]", categoryBadgeColors[item.category] || "bg-muted text-muted-foreground")}>{item.category}</Badge>
            </div>
          ))}
        </TabsContent>

        {/* ── SCALE RISKS ── */}
        <TabsContent value="risks" className="mt-4 space-y-3">
          {scaleRisks.map((sr, i) => (
            <Card key={i} className={cn("border-border", sr.severity === "CRITICAL" && "border-destructive/30 bg-destructive/5")}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className={cn("h-4 w-4", sr.severity === "CRITICAL" ? "text-destructive" : "text-chart-4")} />
                  <Badge variant={sr.severity === "CRITICAL" ? "destructive" : "default"} className="text-[8px]">{sr.severity}</Badge>
                  <p className="text-xs font-semibold text-foreground">{sr.risk}</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{sr.mitigation}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueStabilizationBlueprint;
