import React, { useState } from "react";
import {
  Rocket, Package, Users, Target, Phone, MessageSquare,
  CheckCircle2, AlertTriangle, TrendingUp, MapPin, Clock,
  Star, Zap, BarChart3, Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPageHeader from "./shared/AdminPageHeader";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   SECTION 1 — FEATURE BUILD PRIORITY
   ═══════════════════════════════════════════════ */

const featurePhases = [
  { phase: "CORE — Launch Phase", color: "text-chart-2", badge: "Week 1–4", features: [
    { name: "Property Listing Upload & Management", reason: "Without listings, there is no marketplace. Vendors must be able to create, edit, and manage their properties with minimal friction. This is the absolute foundation.", effort: "HIGH", impact: "CRITICAL" },
    { name: "Search & Filtering System", reason: "Buyers and investors need to find relevant properties quickly. Filters by city, district, price range, bedrooms, property type, and area are non-negotiable for any property platform.", effort: "HIGH", impact: "CRITICAL" },
    { name: "Inquiry / Contact Agent Flow", reason: "The moment a buyer clicks 'Inquire' is the moment the marketplace creates value. Without this, listings are just a gallery. This is the core conversion action.", effort: "MEDIUM", impact: "CRITICAL" },
    { name: "Image Gallery & Property Details", reason: "Properties sell visually. A clean gallery with multiple photos, floor plans, and structured details (price, area, bedrooms, amenities) is what separates a serious platform from a classified ad.", effort: "MEDIUM", impact: "HIGH" },
    { name: "Location Map Integration", reason: "Property is inherently spatial. A Mapbox integration showing exact or approximate location gives buyers confidence and context. District-level browsing increases engagement 40%+.", effort: "MEDIUM", impact: "HIGH" },
    { name: "Mobile Responsive Experience", reason: "In Indonesia, 85%+ of property browsing happens on mobile. If the platform isn't excellent on a phone screen, you lose the majority of your audience immediately.", effort: "MEDIUM", impact: "CRITICAL" },
  ]},
  { phase: "GROWTH — After Initial Traction", color: "text-primary", badge: "Month 2–4", features: [
    { name: "Listing Boost / Featured Placement", reason: "First monetization lever. Vendors pay to get more visibility. Proves revenue model to investors and creates the foundation for sustainable unit economics.", effort: "MEDIUM", impact: "HIGH" },
    { name: "Saved Properties & User Dashboard", reason: "Registered users who save properties return 3x more often. Dashboard creates engagement habit and gives you behavioral data for intelligence models.", effort: "MEDIUM", impact: "HIGH" },
    { name: "Agent Performance Analytics", reason: "Response time, inquiry-to-viewing conversion, and closing rates. Agents who see their metrics improve. Creates competitive pressure that raises marketplace quality.", effort: "MEDIUM", impact: "MEDIUM" },
    { name: "Investment Yield Calculator", reason: "Differentiates from classifieds. Shows rental yield, ROI projection, and price-per-sqm comparisons. Positions platform as intelligence tool, not just a listing board.", effort: "LOW", impact: "HIGH" },
    { name: "Notification & Alert System", reason: "Price drop alerts, new listing notifications, and inquiry updates keep users engaged without requiring them to actively return. Reduces dependency on paid acquisition.", effort: "MEDIUM", impact: "MEDIUM" },
  ]},
  { phase: "ADVANCED — Differentiation", color: "text-chart-4", badge: "Month 4–8", features: [
    { name: "Demand Heatmap Visualization", reason: "Shows where buyer interest concentrates. Helps vendors price correctly, helps investors identify opportunities. Creates 'intelligence platform' perception vs. 'listing site'.", effort: "HIGH", impact: "HIGH" },
    { name: "AI Deal Ranking & Opportunity Score", reason: "Automated scoring of investment quality. The feature that makes the platform genuinely different — turning raw listings into actionable intelligence.", effort: "HIGH", impact: "HIGH" },
    { name: "Automated Lead Routing", reason: "Routes inquiries to the most suitable and responsive agent. Improves conversion rates and buyer experience. Reduces vendor frustration from misrouted leads.", effort: "MEDIUM", impact: "MEDIUM" },
    { name: "Premium Subscription Tiers", reason: "Multi-tier monetization: basic free listing, premium visibility, and institutional access. Creates predictable recurring revenue alongside transactional income.", effort: "MEDIUM", impact: "HIGH" },
  ]},
];

/* ═══════════════════════════════════════════════
   SECTION 2 — VENDOR ACQUISITION
   ═══════════════════════════════════════════════ */

const vendorSegments = [
  { segment: "Independent Agents", icon: Users, count: "Target: 50 first month", approach: "WhatsApp + Instagram DM. They're mobile-first and respond to personal outreach. Offer free premium listing for first 3 months.", priority: "HIGH" },
  { segment: "Small Brokerage Offices", icon: Target, count: "Target: 10 offices (5-15 agents each)", approach: "In-person visit with printed one-pager. Meet the office manager. Offer bulk listing import assistance.", priority: "HIGH" },
  { segment: "Property Developers", icon: Package, count: "Target: 5 developers", approach: "Formal email + follow-up call. Position as marketing channel for new projects. Offer dedicated project page.", priority: "MEDIUM" },
  { segment: "Luxury Villa Specialists", icon: Star, count: "Target: 15 specialists", approach: "Instagram + LinkedIn outreach. These vendors value brand perception. Show platform design quality and investor audience.", priority: "MEDIUM" },
];

const outreachScripts = [
  { channel: "WhatsApp Introduction", icon: MessageSquare, script: `Selamat pagi Pak/Bu [Nama],

Saya [Nama Anda] dari Astra — platform properti baru yang membantu agen menjangkau investor aktif secara langsung.

Kami sedang mengundang agen-agen terbaik di [Kota] untuk bergabung sebagai mitra awal dengan benefit eksklusif:
✅ Listing premium GRATIS selama 3 bulan
✅ Akses langsung ke database investor aktif
✅ Analitik performa listing real-time

Boleh saya jelaskan lebih detail via call singkat 10 menit minggu ini?

Terima kasih 🙏` },
  { channel: "Direct Call Flow", icon: Phone, script: `1. OPENING (30 detik):
"Selamat pagi Pak/Bu, saya [Nama] dari Astra. Kami platform properti baru yang fokus menghubungkan agen dengan investor serius. Boleh minta waktu 3 menit?"

2. VALUE PROPOSITION (60 detik):
"Kami berbeda dari portal listing biasa — kami memiliki database investor aktif yang sedang mencari properti di [area]. Agen mitra awal kami mendapat listing premium gratis dan akses leads prioritas."

3. SOCIAL PROOF (30 detik):
"Sudah ada [X] agen di [Kota] yang bergabung minggu ini. Beberapa sudah dapat inquiry dalam 48 jam pertama."

4. CLOSE (30 detik):
"Untuk bergabung, saya hanya perlu 2-3 listing terbaik Bapak/Ibu. Kami bantu upload dan optimasi foto serta deskripsinya. Bisa kirim via WhatsApp hari ini?"` },
  { channel: "In-Person Meeting Pitch", icon: Users, script: `AGENDA (15 menit):

1. CREDIBILITY (2 menit):
- Tunjukkan platform di HP — desain profesional, fitur pencarian
- "Kami membangun platform berkualitas karena properti butuh presentasi yang serius"

2. PROBLEM (3 menit):
- "Berapa persen listing Bapak/Ibu yang dapat inquiry serius dari portal existing?"
- "Bagaimana cara membedakan investor serius dari yang hanya browsing?"

3. SOLUTION (5 menit):
- Demo listing upload (< 5 menit)
- Tunjukkan analytics: views, inquiries, investor profile
- "Kami filter buyer — hanya yang verified dan serius"

4. OFFER (3 menit):
- "Sebagai mitra awal: 3 bulan premium gratis, prioritas leads, personal support"
- "Kami hanya butuh 5 listing terbaik Bapak/Ibu untuk mulai"

5. NEXT STEP (2 menit):
- Bantu upload 1 listing di tempat
- Schedule follow-up WhatsApp dalam 48 jam` },
];

const dailyTargets = [
  { metric: "New vendors contacted", target: "10/day", method: "5 WhatsApp + 3 calls + 2 social DMs" },
  { metric: "Listings secured from contacts", target: "3–5/day", method: "Each converted vendor contributes 2-5 listings" },
  { metric: "Follow-up messages sent", target: "15/day", method: "48hr follow-up on all non-responsive contacts" },
  { metric: "In-person meetings booked", target: "2/week", method: "Priority for brokerage offices and developers" },
  { metric: "Listing upload assistance", target: "5/day", method: "Personally help vendors upload and optimize" },
];

/* ═══════════════════════════════════════════════
   SECTION 3 — FIRST 1,000 LISTINGS
   ═══════════════════════════════════════════════ */

const listingPhases = [
  { phase: "Phase 1 — Initial Supply Activation", timeline: "Week 1–3", target: "0 → 150 listings", color: "text-chart-2", actions: [
    { action: "Import existing listings from partner agents", detail: "Ask each onboarded agent for their current portfolio. Offer to upload for them — remove all friction. Target: 3-5 listings per agent × 30 agents = 90-150 listings." },
    { action: "Manually assist with listing uploads", detail: "For the first 100 listings, personally ensure photo quality, accurate descriptions, and correct pricing. Set the quality standard early — it compounds." },
    { action: "Focus on high-demand zones first", detail: "Concentrate on 3-5 districts with proven investor demand. Better to have 50 quality listings in one district than 150 scattered across the city. Density creates browsing satisfaction." },
    { action: "Seed with developer project listings", detail: "New development projects provide 20-50 unit listings at once. Even 2-3 developer partnerships can contribute 100+ listings rapidly." },
  ], kpis: ["15-20 listings added per day", "90%+ listings with 4+ quality photos", "Average listing completeness score >85%"] },
  { phase: "Phase 2 — Density Building", timeline: "Week 4–8", target: "150 → 500 listings", color: "text-primary", actions: [
    { action: "Cluster listings in key districts", detail: "When a buyer searches Canggu or Seminyak or Bandung Utara, they should find 30+ options — not 3. Density creates the perception of a complete marketplace." },
    { action: "Ensure price range diversity", detail: "Each target district needs listings across at least 3 price tiers: entry (<Rp 1B), mid (Rp 1-5B), premium (>Rp 5B). Gaps in range lose entire buyer segments." },
    { action: "Improve listing quality standards", detail: "Introduce photo quality guidelines. Reject blurry/dark images. Offer free photography for top-tier listings. Quality listings get 5x more inquiries — this is measurable." },
    { action: "Activate referral from existing vendors", detail: "Happy vendors refer other agents. Offer referral bonus: 'Invite an agent colleague → both get 1 month extra premium.' Target: each vendor refers 1-2 more." },
  ], kpis: ["10-15 listings added per day", "Inquiry rate >2% per listing per week", "<15% of listings with zero engagement after 7 days"] },
  { phase: "Phase 3 — Liquidity Signaling", timeline: "Week 9–14", target: "500 → 1,000 listings", color: "text-chart-4", actions: [
    { action: "Highlight active inventory on homepage", detail: "Dynamic counter: '987 properties available.' New listing carousel updated hourly. Signals active, living marketplace — not a static directory." },
    { action: "Showcase new listings daily", detail: "Daily 'New on Astra' section. Email digest to registered investors. Instagram stories featuring best new listings. Creates return visit habit." },
    { action: "Publish 'Hot Property' sections", detail: "Most-viewed, most-inquired, and price-reduced listings get special placement. Creates urgency and social proof: 'If others want it, it must be good.'" },
    { action: "Launch district completeness campaigns", detail: "Identify districts with <20 listings. Run targeted vendor outreach: 'We have 200 investors looking in [District] but only 12 listings. Your properties would get immediate attention.'" },
  ], kpis: ["8-12 listings added per day (organic growth increasing)", "Inquiry-to-listing ratio >5% weekly", "Vendor retention >80% (listings stay active)"] },
];

/* ═══════════════════════════════════════════════
   DAILY EXECUTION CHECKLIST & RISK SIGNALS
   ═══════════════════════════════════════════════ */

const dailyChecklist = [
  { time: "08:00", task: "Review overnight inquiries — respond or route within 2 hours", category: "Demand" },
  { time: "09:00", task: "Send 5 WhatsApp outreach messages to new vendor targets", category: "Supply" },
  { time: "10:00", task: "Make 3 follow-up calls to vendors contacted yesterday", category: "Supply" },
  { time: "11:00", task: "Help 2-3 vendors upload and optimize their listings", category: "Supply" },
  { time: "12:00", task: "Review listing quality — flag and fix low-quality uploads", category: "Quality" },
  { time: "14:00", task: "Post 1 Instagram story featuring a new/hot listing", category: "Demand" },
  { time: "15:00", task: "Check inquiry conversion — any leads going cold? Follow up", category: "Revenue" },
  { time: "16:00", task: "Send 5 more outreach messages (target different vendor segment)", category: "Supply" },
  { time: "17:00", task: "Review daily metrics: listings added, inquiries, vendor responses", category: "Analytics" },
  { time: "18:00", task: "Plan tomorrow's outreach targets and priority actions", category: "Planning" },
];

const riskSignals = [
  { signal: "Listings added per day drops below 3", severity: "HIGH", response: "Increase vendor outreach volume 2x. Revisit incentive offer. Consider listing import partnerships or scraping public data for initial seeding." },
  { signal: "Inquiry rate per listing falls below 1% weekly", severity: "HIGH", response: "Check traffic quality — are the right buyers finding the platform? Review SEO, social media targeting, and listing titles for search optimization." },
  { signal: "Vendor response time exceeds 24 hours", severity: "MEDIUM", response: "Implement automated 'still interested?' nudge to vendors. Consider removing consistently unresponsive vendors from featured placement." },
  { signal: ">30% of listings have zero views after 7 days", severity: "HIGH", response: "Listings are invisible or irrelevant. Check search algorithm, category placement, and whether listing descriptions contain searchable terms." },
  { signal: "Vendor churn exceeds 20% monthly", severity: "CRITICAL", response: "Vendors are leaving because they're not getting value. Survey departing vendors. Common causes: no inquiries, poor UX, or better alternatives." },
  { signal: "Photo quality declining as volume grows", severity: "MEDIUM", response: "Re-enforce photo guidelines. Consider automated quality scoring. Offer free photography service for listings above certain price threshold." },
];

const categoryColors: Record<string, string> = {
  Supply: "bg-chart-2/10 text-chart-2",
  Demand: "bg-primary/10 text-primary",
  Quality: "bg-chart-4/10 text-chart-4",
  Revenue: "bg-chart-1/10 text-chart-1",
  Analytics: "bg-muted text-muted-foreground",
  Planning: "bg-secondary text-secondary-foreground",
};

/* ═══════════════════════════════════════════════ */

const RealExecutionBlueprint: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Real Marketplace Execution"
        description="Feature priority, vendor acquisition scripts & first 1,000 listings strategy"
        icon={Rocket}
        badge={{ text: "🚀 Execution", variant: "outline" }}
      />

      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="features" className="text-xs">Feature Priority</TabsTrigger>
          <TabsTrigger value="vendors" className="text-xs">Vendor Acquisition</TabsTrigger>
          <TabsTrigger value="listings" className="text-xs">1,000 Listings</TabsTrigger>
          <TabsTrigger value="daily" className="text-xs">Daily Checklist</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">Risk Signals</TabsTrigger>
        </TabsList>

        {/* ── FEATURE PRIORITY ── */}
        <TabsContent value="features" className="mt-4 space-y-4">
          {featurePhases.map((fp, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className={cn("text-sm", fp.color)}>{fp.phase}</CardTitle>
                  <Badge variant="outline" className="text-[9px]">{fp.badge}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {fp.features.map((f, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <p className="text-xs font-semibold text-foreground">{f.name}</p>
                      <div className="flex gap-1">
                        <Badge variant={f.impact === "CRITICAL" ? "destructive" : "default"} className="text-[8px]">{f.impact}</Badge>
                        <Badge variant="outline" className="text-[8px]">Effort: {f.effort}</Badge>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{f.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── VENDOR ACQUISITION ── */}
        <TabsContent value="vendors" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vendorSegments.map((vs, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <vs.icon className="h-4 w-4 text-primary" />
                    <p className="text-xs font-bold text-foreground">{vs.segment}</p>
                    <Badge variant={vs.priority === "HIGH" ? "default" : "secondary"} className="text-[8px] ml-auto">{vs.priority}</Badge>
                  </div>
                  <p className="text-[10px] text-chart-2 font-medium">{vs.count}</p>
                  <p className="text-[10px] text-muted-foreground">{vs.approach}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ready-to-Use Outreach Scripts</h3>
            {outreachScripts.map((os, i) => (
              <Card key={i} className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <os.icon className="h-4 w-4 text-primary" /> {os.channel}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-[10px] text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-muted/30 rounded-lg p-3 border border-border/30">{os.script}</pre>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Daily Vendor Acquisition Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dailyTargets.map((dt, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{dt.metric}</p>
                    <p className="text-[9px] text-muted-foreground">{dt.method}</p>
                  </div>
                  <Badge variant="outline" className="text-xs font-bold">{dt.target}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FIRST 1,000 LISTINGS ── */}
        <TabsContent value="listings" className="mt-4 space-y-4">
          {listingPhases.map((lp, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className={cn("text-sm", lp.color)}>{lp.phase}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[9px]">{lp.timeline}</Badge>
                    <Badge variant="secondary" className="text-[9px]">{lp.target}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {lp.actions.map((a, j) => (
                  <div key={j} className="rounded-lg border border-border/40 p-3 space-y-1">
                    <p className="text-xs font-semibold text-foreground">{a.action}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{a.detail}</p>
                  </div>
                ))}
                <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-[9px] font-semibold text-muted-foreground mb-1">KPI TARGETS</p>
                  {lp.kpis.map((k, j) => (
                    <p key={j} className="text-[10px] text-foreground">📊 {k}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── DAILY CHECKLIST ── */}
        <TabsContent value="daily" className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Founder Daily Execution</h3>
            <Badge variant="outline" className="text-[9px]">{checkedItems.size}/{dailyChecklist.length} complete</Badge>
          </div>
          <Progress value={(checkedItems.size / dailyChecklist.length) * 100} className="h-2 mb-3" />
          {dailyChecklist.map((item, i) => (
            <div key={i} className={cn(
              "flex items-start gap-3 p-3 rounded-lg border border-border/40 transition-opacity",
              checkedItems.has(i) && "opacity-50"
            )}>
              <Checkbox
                checked={checkedItems.has(i)}
                onCheckedChange={() => toggleCheck(i)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[8px] font-mono">{item.time}</Badge>
                  <Badge className={cn("text-[8px]", categoryColors[item.category])}>{item.category}</Badge>
                </div>
                <p className={cn("text-xs text-foreground mt-1", checkedItems.has(i) && "line-through")}>{item.task}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ── RISK SIGNALS ── */}
        <TabsContent value="risks" className="mt-4 space-y-3">
          {riskSignals.map((rs, i) => (
            <Card key={i} className={cn("border-border", rs.severity === "CRITICAL" && "border-destructive/30 bg-destructive/5")}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn("h-4 w-4", rs.severity === "CRITICAL" ? "text-destructive" : rs.severity === "HIGH" ? "text-chart-4" : "text-muted-foreground")} />
                  <Badge variant={rs.severity === "CRITICAL" ? "destructive" : rs.severity === "HIGH" ? "default" : "secondary"} className="text-[8px]">{rs.severity}</Badge>
                  <p className="text-xs font-semibold text-foreground">{rs.signal}</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{rs.response}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealExecutionBlueprint;
