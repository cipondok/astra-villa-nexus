import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Sunrise, Clock, Zap, Target, Users, Building, MessageSquare,
  Phone, Send, TrendingUp, AlertTriangle, CheckCircle, Copy,
  Rocket, Flame, Shield, BarChart3, Brain, ChevronRight, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useDailyGrowthPlan } from "@/hooks/useDailyGrowthPlan";
import { useWeeklyGrowthPlan } from "@/hooks/useWeeklyGrowthPlan";
import { useDailyGrowthMetrics } from "@/hooks/useDailyGrowthMetrics";

const anim = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

function copy(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

// ── Supply Outreach Templates ──
const SUPPLY_TEMPLATES = {
  agent: {
    label: "Agent Outreach (WhatsApp)",
    lang: { en: `Hi [Name], I'm from ASTRA Villa — we're building Indonesia's fastest-growing property marketplace with AI-powered buyer matching.\n\nWe currently have active investors looking in your area. Would you like to list your properties on ASTRA for free? We handle marketing + buyer matching.\n\nLet's schedule a quick 10-min call? 🏡`, id: `Halo [Nama], saya dari ASTRA Villa — marketplace properti terdepan di Indonesia dengan teknologi AI buyer matching.\n\nSaat ini kami punya investor aktif yang mencari properti di area Anda. Mau listing properti secara gratis di ASTRA? Kami bantu marketing + matching pembeli.\n\nBisa kita jadwalkan call 10 menit? 🏡` },
  },
  owner: {
    label: "Direct Owner (Instagram DM)",
    lang: { en: `Hi! Beautiful property 🏠 I'm from ASTRA Villa marketplace. We help owners sell faster with AI-powered buyer matching. Zero listing fees. Interested?`, id: `Halo! Properti yang bagus 🏠 Saya dari ASTRA Villa marketplace. Kami bantu pemilik jual lebih cepat dengan AI buyer matching. Gratis listing. Tertarik?` },
  },
  developer: {
    label: "Developer Partnership",
    lang: { en: `Dear [Developer],\n\nASTRA Villa offers premium digital distribution for new developments. Our AI matches your units with qualified investors globally.\n\nBenefits:\n• AI-powered buyer targeting\n• Premium listing placement\n• Real-time analytics dashboard\n• Escrow-secured transactions\n\nLet's discuss a partnership.`, id: `Yth. [Developer],\n\nASTRA Villa menawarkan distribusi digital premium untuk proyek baru. AI kami mencocokkan unit Anda dengan investor qualified global.\n\nKeuntungan:\n• AI buyer targeting\n• Premium listing placement\n• Dashboard analytics real-time\n• Transaksi terjamin escrow\n\nMari diskusi kerjasama.` },
  },
};

// ── Demand Broadcast Templates ──
const DEMAND_BROADCASTS = [
  { label: "Urgency Broadcast", text: "🔥 FLASH OPPORTUNITY: Premium Bali villa — ocean view, 12.4% projected yield. Only 3 positions left. First-mover advantage expires in 48 hours. View now → [link]" },
  { label: "Social Proof", text: "📊 This week: 47 investors viewed this property, 12 inquiries submitted, 3 in negotiation. Smart money is moving. Don't miss your window → [link]" },
  { label: "Exclusive Access", text: "🔐 EXCLUSIVE: Pre-market listing — luxury development in [City]. AI analysis shows 18% undervalued vs comparables. Limited to verified investors only → [link]" },
  { label: "ROI Highlight", text: "💰 INVESTOR ALERT: [Property] showing 9.2% rental yield + 15% appreciation forecast (12mo). Our AI confidence score: 87/100. Explore details → [link]" },
];

// ── Deal Follow-up Scripts ──
const FOLLOWUP_SCRIPTS = [
  { stage: "Post-Inquiry (24h)", script: "Hi [Name], thanks for your interest in [Property]. I've prepared a detailed investment brief including ROI projections and market comparables. When would be a good time for a 15-min walkthrough call?" },
  { stage: "Post-Viewing (Same Day)", script: "Great meeting you today at [Property]! As discussed, here's the investment summary. The current asking price reflects a 12% discount vs market. I can hold priority for 48 hours if you'd like to proceed." },
  { stage: "Negotiation Stall (48h)", script: "Hi [Name], I wanted to follow up on [Property]. We've had 2 new inquiries this week. I'd hate for you to miss this opportunity. Can we discuss your concerns and find a path forward?" },
  { stage: "Price Objection Handler", script: "I understand the price concern. Let me share: comparable properties in this area sold at [X]% higher. Our AI valuation model shows this is actually priced below fair market value by [Y]%. Plus, with our escrow protection, your investment is secured from day one." },
  { stage: "Trust Objection Handler", script: "Great question about security. ASTRA uses bank-grade escrow with [Partner]. Funds are locked until all conditions are met. We also verify every listing with AI + manual review. Over [X] transactions completed safely." },
  { stage: "Timing Objection Handler", script: "I get it — timing matters. But consider: our market intelligence shows prices in [Area] have risen [X]% in the last quarter. Waiting could mean paying more. Would a smaller initial position work for you to get started?" },
];

// ── Social Content Ideas ──
const SOCIAL_IDEAS = [
  { format: "Short Video (Reels/TikTok)", idea: "\"3 reasons smart investors are buying Bali villas in 2026\" — quick cuts of properties, overlay stats, CTA to ASTRA" },
  { format: "Carousel (Instagram)", idea: "\"Your money in savings vs real estate\" — 5-slide comparison showing compound growth, rental yield, inflation hedge" },
  { format: "Story Poll", idea: "\"Would you invest Rp 500M in: A) Bali villa B) Jakarta apartment C) Lombok land\" — engagement + lead capture" },
  { format: "Testimonial Clip", idea: "Quick interview format: \"How I found my first investment property on ASTRA\" — social proof + trust building" },
];

interface KPITarget { label: string; target: number; current: number; unit: string; icon: React.ElementType }

const DailyOpsBattleStation: React.FC = () => {
  const [lang, setLang] = useState<"en" | "id">("en");
  const [dailyNotes, setDailyNotes] = useState("");
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const metrics = useDailyGrowthMetrics();
  const dailyPlan = useDailyGrowthPlan();
  const weeklyPlan = useWeeklyGrowthPlan();

  const toggleTask = (id: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const kpiTargets: KPITarget[] = useMemo(() => [
    { label: "Listings Added", target: 5, current: metrics.data?.new_listings_today ?? 0, unit: "listings", icon: Building },
    { label: "New Inquiries", target: 8, current: metrics.data?.inquiries_today ?? 0, unit: "inquiries", icon: MessageSquare },
    { label: "Negotiations Opened", target: 3, current: metrics.data?.active_negotiations ?? 0, unit: "active", icon: Target },
    { label: "Deals Advanced", target: 2, current: metrics.data?.offers_today ?? 0, unit: "offers", icon: TrendingUp },
  ], [metrics.data]);

  const totalProgress = kpiTargets.length > 0
    ? Math.round(kpiTargets.reduce((sum, k) => sum + Math.min(100, (k.current / k.target) * 100), 0) / kpiTargets.length)
    : 0;

  const morningTasks = [
    { id: "m1", text: "Review yesterday's KPI dashboard — identify misses", icon: BarChart3 },
    { id: "m2", text: "Send 10 agent outreach messages (WhatsApp/Instagram)", icon: Send },
    { id: "m3", text: "Post 1 property listing from pipeline", icon: Building },
    { id: "m4", text: "Check property portals for new listing opportunities", icon: Target },
    { id: "m5", text: "Follow up with 3 pending agent responses", icon: Phone },
  ];
  const middayTasks = [
    { id: "d1", text: "Send investor broadcast (urgency/opportunity)", icon: Rocket },
    { id: "d2", text: "Post social media content (video/carousel)", icon: Flame },
    { id: "d3", text: "Respond to all new inquiries within 30 min", icon: MessageSquare },
    { id: "d4", text: "Update CRM with new leads and status changes", icon: RefreshCw },
    { id: "d5", text: "Qualify top 3 prospects for deal progression", icon: Users },
  ];
  const eveningTasks = [
    { id: "e1", text: "Send follow-ups to all active negotiation leads", icon: Send },
    { id: "e2", text: "Apply urgency framing to stalled deals", icon: AlertTriangle },
    { id: "e3", text: "Prepare tomorrow's listing pipeline (5 targets)", icon: Building },
    { id: "e4", text: "Log daily KPIs and reflection notes", icon: Brain },
    { id: "e5", text: "Review market signals for strategy adjustment", icon: TrendingUp },
  ];

  const allTasks = [...morningTasks, ...middayTasks, ...eveningTasks];
  const taskProgress = allTasks.length > 0 ? Math.round((completedTasks.size / allTasks.length) * 100) : 0;

  const reflectionPrompts = [
    "Which listing source produced the most quality leads today?",
    "Are inquiries converting to negotiations? If not, where's the drop-off?",
    "Which city/area showed the strongest demand signals?",
    "Did any price resistance patterns emerge from buyer feedback?",
    "What's the #1 objection you heard today? How will you address it tomorrow?",
    "Are agents responding to outreach? What message angle worked best?",
    "Is there a property type (villa/apartment/land) getting disproportionate attention?",
  ];

  const TaskList = ({ tasks }: { tasks: typeof morningTasks }) => (
    <div className="space-y-2">
      {tasks.map((t) => (
        <motion.div key={t.id} variants={anim}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${completedTasks.has(t.id) ? "bg-primary/10 border-primary/30 line-through opacity-60" : "bg-card border-border hover:border-primary/40"}`}
          onClick={() => toggleTask(t.id)}
        >
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${completedTasks.has(t.id) ? "border-primary bg-primary" : "border-muted-foreground"}`}>
            {completedTasks.has(t.id) && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
          </div>
          <t.icon className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm">{t.text}</span>
        </motion.div>
      ))}
    </div>
  );

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={stagger}>
      {/* Header */}
      <motion.div variants={anim} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" /> Daily Ops Battle Station
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Aggressive daily execution plan for marketplace liquidity creation</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}>EN</Button>
          <Button size="sm" variant={lang === "id" ? "default" : "outline"} onClick={() => setLang("id")}>ID</Button>
        </div>
      </motion.div>

      {/* KPI Targets Row */}
      <motion.div variants={anim}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Daily KPI Targets</CardTitle>
              <Badge variant={totalProgress >= 75 ? "default" : totalProgress >= 40 ? "secondary" : "destructive"}>
                {totalProgress}% Overall
              </Badge>
            </div>
            <Progress value={totalProgress} className="h-2 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kpiTargets.map((k) => {
                const pct = Math.min(100, Math.round((k.current / k.target) * 100));
                return (
                  <div key={k.label} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <k.icon className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{k.label}</span>
                    </div>
                    <div className="text-2xl font-bold">{k.current}<span className="text-sm text-muted-foreground">/{k.target}</span></div>
                    <Progress value={pct} className="h-1.5 mt-1" />
                    <span className="text-xs text-muted-foreground">{k.unit}</span>
                  </div>
                );
              })}
            </div>
            {totalProgress < 50 && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">Recovery Mode Activated</p>
                  <p className="text-xs text-muted-foreground mt-1">Yesterday's targets were missed. Double down on outreach volume today — aim for 15 agent messages and 2 extra listing posts.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="execution" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="execution">⚡ Execution</TabsTrigger>
          <TabsTrigger value="supply">🏗️ Supply</TabsTrigger>
          <TabsTrigger value="demand">🎯 Demand</TabsTrigger>
          <TabsTrigger value="closing">🤝 Closing</TabsTrigger>
          <TabsTrigger value="reflect">🧠 Reflect</TabsTrigger>
        </TabsList>

        {/* Execution Tab */}
        <TabsContent value="execution" className="space-y-4">
          <motion.div variants={anim}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2"><Sunrise className="w-4 h-4" /> Task Completion</CardTitle>
                  <Badge>{completedTasks.size}/{allTasks.length} Done</Badge>
                </div>
                <Progress value={taskProgress} className="h-2 mt-2" />
              </CardHeader>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            <motion.div variants={anim}>
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Sunrise className="w-4 h-4 text-amber-500" /> Morning: Supply Attack</CardTitle>
                  <p className="text-xs text-muted-foreground">7:00 — 11:00 AM</p>
                </CardHeader>
                <CardContent><TaskList tasks={morningTasks} /></CardContent>
              </Card>
            </motion.div>
            <motion.div variants={anim}>
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> Midday: Demand Activation</CardTitle>
                  <p className="text-xs text-muted-foreground">11:00 AM — 3:00 PM</p>
                </CardHeader>
                <CardContent><TaskList tasks={middayTasks} /></CardContent>
              </Card>
            </motion.div>
            <motion.div variants={anim}>
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" /> Evening: Deal Acceleration</CardTitle>
                  <p className="text-xs text-muted-foreground">3:00 — 7:00 PM</p>
                </CardHeader>
                <CardContent><TaskList tasks={eveningTasks} /></CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Supply Tab */}
        <TabsContent value="supply" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {Object.entries(SUPPLY_TEMPLATES).map(([key, tmpl]) => (
              <motion.div key={key} variants={anim}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{tmpl.label}</CardTitle>
                      <Button size="sm" variant="outline" onClick={() => copy(tmpl.lang[lang])}>
                        <Copy className="w-3 h-3 mr-1" /> Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-3 rounded-lg whitespace-pre-wrap font-sans">{tmpl.lang[lang]}</pre>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <motion.div variants={anim}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">📋 Target Property Types (Early Stage)</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: "Bali Luxury Villas", range: "Rp 3-15B", priority: "High" },
                      { type: "Jakarta Apartments", range: "Rp 500M-3B", priority: "Medium" },
                      { type: "Lombok Land", range: "Rp 200M-2B", priority: "High" },
                      { type: "Bandung Townhouses", range: "Rp 800M-2B", priority: "Medium" },
                      { type: "Yogyakarta Heritage", range: "Rp 1-5B", priority: "Low" },
                      { type: "Surabaya Commercial", range: "Rp 2-10B", priority: "Low" },
                    ].map((p) => (
                      <div key={p.type} className="p-2 rounded border bg-card flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium">{p.type}</p>
                          <p className="text-xs text-muted-foreground">{p.range}</p>
                        </div>
                        <Badge variant={p.priority === "High" ? "default" : p.priority === "Medium" ? "secondary" : "outline"} className="text-[10px]">{p.priority}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* Demand Tab */}
        <TabsContent value="demand" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            <motion.div variants={anim}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">📢 Investor Broadcast Templates</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {DEMAND_BROADCASTS.map((b, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-[10px]">{b.label}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => copy(b.text)}><Copy className="w-3 h-3" /></Button>
                      </div>
                      <p className="text-xs">{b.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={anim}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">🎬 Social Content Ideas</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {SOCIAL_IDEAS.map((s, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-card">
                      <Badge variant="outline" className="text-[10px] mb-1">{s.format}</Badge>
                      <p className="text-xs mt-1">{s.idea}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={anim}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">🎯 HNW Targeting Strategy</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    {[
                      "LinkedIn: Search 'property investor' + 'Indonesia' — send connection + value message",
                      "Instagram: Follow accounts engaging with luxury property content in SEA",
                      "WhatsApp Groups: Join expat investment groups in Bali, Jakarta, Singapore",
                      "Events: Attend/sponsor local property investment seminars — collect cards",
                      "Referral: Ask current investors to introduce 2 friends for priority access",
                    ].map((s, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded bg-muted">
                        <ChevronRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* Closing Tab */}
        <TabsContent value="closing" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {FOLLOWUP_SCRIPTS.map((f, i) => (
              <motion.div key={i} variants={anim}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{f.stage}</CardTitle>
                      <Button size="sm" variant="outline" onClick={() => copy(f.script)}><Copy className="w-3 h-3 mr-1" /> Copy</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs bg-muted p-3 rounded-lg">{f.script}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Reflection Tab */}
        <TabsContent value="reflect" className="space-y-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            <motion.div variants={anim}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">🧠 End-of-Day Intelligence Reflection</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {reflectionPrompts.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg border bg-card">
                      <Brain className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-xs">{q}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={anim}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">📝 Daily Notes & Learnings</CardTitle></CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="What worked today? What signals did you observe? What will you change tomorrow?"
                    value={dailyNotes}
                    onChange={(e) => setDailyNotes(e.target.value)}
                    className="min-h-[120px] text-sm"
                  />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={anim}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">📊 Signals to Watch Tomorrow</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { signal: "Price Resistance", desc: "Buyers pushing back on asking prices in specific areas" },
                      { signal: "Hot Location", desc: "Which cities/areas get the most views and saves?" },
                      { signal: "Investor Hesitation", desc: "Inquiries not converting — what's blocking?" },
                      { signal: "Agent Response Rate", desc: "Which outreach angle gets the best reply rate?" },
                      { signal: "Content Performance", desc: "Which social post drove the most profile visits?" },
                      { signal: "Deal Velocity", desc: "Time from inquiry to negotiation shortening or lengthening?" },
                    ].map((s) => (
                      <div key={s.signal} className="p-2 rounded-lg border bg-card">
                        <p className="text-xs font-medium">{s.signal}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
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

export default DailyOpsBattleStation;
