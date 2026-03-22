import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Home, Users, Phone, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
  Target, Zap, CheckCircle, Clock, MessageSquare, Copy, Send,
  Calendar, AlertTriangle, Star, BarChart3, Activity, MapPin,
  ChevronRight, Eye, Sparkles, UserPlus, Building
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };

const Delta = ({ v }: { v: number }) => (
  <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${v >= 0 ? "text-emerald-400" : "text-red-400"}`}>
    {v >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
    {Math.abs(v)}%
  </span>
);

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border/60 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs font-bold text-foreground">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const Kpi = ({ icon: Icon, label, value, delta, sub, accent }: {
  icon: React.ElementType; label: string; value: string; delta?: number; sub?: string; accent?: string;
}) => (
  <motion.div variants={fadeUp}>
    <Card className="p-3 border-border/40 bg-card/80">
      <div className="flex items-center gap-2 mb-1">
        <div className={`h-7 w-7 rounded-lg ${accent || "bg-primary/10"} flex items-center justify-center`}>
          <Icon className={`h-3.5 w-3.5 ${accent ? accent.replace("bg-", "text-").replace("/10", "") : "text-primary"}`} />
        </div>
        <span className="text-[9px] text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-lg font-bold text-foreground leading-none">{value}</span>
        {delta !== undefined && <Delta v={delta} />}
      </div>
      {sub && <p className="text-[8px] text-muted-foreground mt-0.5">{sub}</p>}
    </Card>
  </motion.div>
);

// ─── Tab 1: 30-Day Traction Dashboard ────────────────────────────────────────
const dailyChecklist = [
  { task: "Follow up with 3 pending buyer inquiries", done: true },
  { task: "Contact 2 new agent prospects", done: true },
  { task: "Review and approve 5 new listings", done: false },
  { task: "Schedule viewings for qualified buyers", done: false },
  { task: "Update deal pipeline status", done: false },
  { task: "Post 1 property highlight on social media", done: false },
];

const tractionData = [
  { day: "D1", listings: 2, inquiries: 1, viewings: 0, deals: 0 },
  { day: "D5", listings: 8, inquiries: 4, viewings: 1, deals: 0 },
  { day: "D10", listings: 18, inquiries: 12, viewings: 4, deals: 0 },
  { day: "D15", listings: 32, inquiries: 24, viewings: 8, deals: 1 },
  { day: "D20", listings: 48, inquiries: 38, viewings: 14, deals: 2 },
  { day: "D25", listings: 68, inquiries: 56, viewings: 22, deals: 4 },
  { day: "D30", listings: 92, inquiries: 78, viewings: 32, deals: 6 },
];

const districtTraction = [
  { district: "Seminyak", listings: 24, inquiries: 18, score: 82 },
  { district: "Canggu", listings: 18, inquiries: 14, score: 72 },
  { district: "Ubud", listings: 14, inquiries: 8, score: 56 },
  { district: "Sanur", listings: 8, inquiries: 6, score: 48 },
  { district: "Uluwatu", listings: 6, inquiries: 4, score: 38 },
];

const TractionDashboard = () => {
  const [checklist, setChecklist] = useState(dailyChecklist);
  const completedCount = checklist.filter(c => c.done).length;
  const executionScore = Math.round((completedCount / checklist.length) * 100);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Kpi icon={Home} label="Listings Added Today" value="4" delta={33} sub="Target: 5" />
        <Kpi icon={MessageSquare} label="Buyer Inquiries Today" value="7" delta={16} />
        <Kpi icon={Calendar} label="Viewings This Week" value="12" delta={50} />
        <Kpi icon={Activity} label="Active Negotiations" value="3" sub="2 high probability" />
        <Kpi icon={CheckCircle} label="Deals Closed (Month)" value="2" accent="bg-emerald-500/10" />
        <Kpi icon={DollarSign} label="Revenue (Month)" value="Rp 28M" delta={0} accent="bg-emerald-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* 30-Day Progress */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="p-4 border-border/40 bg-card/80 h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">30-Day Traction Progress</h3>
              <Badge variant="outline" className="text-[8px] h-5 border-primary/30 text-primary">Day 18 of 30</Badge>
            </div>
            <Progress value={60} className="h-2 mb-3" />
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={tractionData}>
                <defs>
                  <linearGradient id="trGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Area dataKey="listings" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#trGrad)" name="Listings" />
                <Area dataKey="inquiries" stroke="hsl(var(--foreground))" strokeWidth={1.5} fill="none" name="Inquiries" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Daily Checklist + Execution Score */}
        <motion.div variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80 h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-foreground">Daily Actions</h3>
              <div className="text-right">
                <span className="text-lg font-bold text-foreground">{executionScore}%</span>
                <p className="text-[8px] text-muted-foreground">Execution Score</p>
              </div>
            </div>
            <Progress value={executionScore} className="h-1.5 mb-3" />
            <div className="space-y-1.5">
              {checklist.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const next = [...checklist];
                    next[i] = { ...next[i], done: !next[i].done };
                    setChecklist(next);
                  }}
                  className="flex items-center gap-2 w-full p-1.5 rounded-md hover:bg-muted/20 transition-colors text-left"
                >
                  <div className={`h-4 w-4 rounded border shrink-0 flex items-center justify-center ${
                    item.done ? "bg-emerald-500/20 border-emerald-500/40" : "border-border/60"
                  }`}>
                    {item.done && <CheckCircle className="h-3 w-3 text-emerald-400" />}
                  </div>
                  <span className={`text-[9px] ${item.done ? "text-muted-foreground line-through" : "text-foreground font-medium"}`}>{item.task}</span>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* District Traction */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80">
          <h3 className="text-sm font-bold text-foreground mb-3">District Traction Heat</h3>
          <div className="space-y-1.5">
            {districtTraction.map(d => (
              <div key={d.district} className="flex items-center gap-3 p-2 rounded-lg bg-muted/10">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-[10px] font-bold text-foreground w-20">{d.district}</span>
                <div className="flex-1 flex gap-4 text-[9px]">
                  <span className="text-muted-foreground">Listings: <span className="text-foreground font-bold">{d.listings}</span></span>
                  <span className="text-muted-foreground">Inquiries: <span className="text-foreground font-bold">{d.inquiries}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Progress value={d.score} className="h-1 w-16" />
                  <span className={`text-[9px] font-bold ${d.score >= 70 ? "text-emerald-400" : d.score >= 50 ? "text-primary" : "text-amber-400"}`}>{d.score}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// ─── Tab 2: Agent Cold Outreach Script Generator ─────────────────────────────
const AgentOutreach = () => {
  const [district, setDistrict] = useState("Seminyak");
  const [experience, setExperience] = useState("3-5 years");
  const [tone, setTone] = useState<"friendly" | "professional" | "urgent">("professional");

  const scripts: Record<string, string> = {
    friendly: `Hi! 👋 I'm reaching out from ASTRA — we're building a new property marketplace in ${district}.\n\nWith your ${experience} of experience in the area, I think you'd be a great fit for our agent network. We're offering:\n\n✅ Direct buyer leads in ${district}\n✅ Commission on every closed deal\n✅ Early adopter bonus program\n✅ Tech tools to manage listings & viewings\n\nWould you be open to a quick 10-minute chat this week? I'd love to tell you more about the opportunity!`,
    professional: `Dear Property Professional,\n\nASTRA is launching a technology-driven real estate marketplace in ${district}, and we are selectively recruiting experienced agents to join our founding network.\n\nGiven your ${experience} of industry experience, we believe you could benefit from:\n\n• Qualified buyer lead distribution\n• Competitive commission structure\n• Digital listing and deal management tools\n• Priority placement in our early agent network\n\nI would appreciate 15 minutes of your time to discuss this opportunity in detail. When would be convenient?`,
    urgent: `🔥 ${district} Agent Opportunity — Limited Spots\n\nASTRA is onboarding agents in ${district} NOW. With ${experience} experience, you qualify for our founding agent program:\n\n⚡ Buyer leads already flowing into ${district}\n⚡ Higher commission rates for early agents\n⚡ First-mover advantage in a growing marketplace\n⚡ Only 10 agent slots available in your district\n\nSerious agents only — reply to secure your position before spots fill up.`,
  };

  const talkingPoints = [
    "Commission: 2-3% per closed transaction",
    "Average deal value: Rp 2-5B in " + district,
    "Current buyer inquiries waiting in the area",
    "No upfront fees — earn from Day 1",
    "Exclusive leads system — no bidding against other agents",
    "Technology tools: listing dashboard, viewing scheduler, CRM",
  ];

  const copyScript = () => {
    navigator.clipboard.writeText(scripts[tone]);
    toast.success("Script copied to clipboard!");
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Input Panel */}
        <motion.div variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80 h-full">
            <h3 className="text-sm font-bold text-foreground mb-3">Agent Profile Setup</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[9px] text-muted-foreground font-medium mb-1 block">Target District</label>
                <Input value={district} onChange={e => setDistrict(e.target.value)} className="h-8 text-xs" placeholder="e.g., Seminyak" />
              </div>
              <div>
                <label className="text-[9px] text-muted-foreground font-medium mb-1 block">Experience Level</label>
                <Input value={experience} onChange={e => setExperience(e.target.value)} className="h-8 text-xs" placeholder="e.g., 3-5 years" />
              </div>
              <div>
                <label className="text-[9px] text-muted-foreground font-medium mb-1 block">Outreach Tone</label>
                <div className="flex gap-1.5">
                  {(["friendly", "professional", "urgent"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-medium transition-colors capitalize ${
                        tone === t ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted/20 text-muted-foreground border border-border/40 hover:bg-muted/30"
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-[10px] font-bold text-foreground mb-2">Call Talking Points</h4>
              <div className="space-y-1">
                {talkingPoints.map(p => (
                  <div key={p} className="flex items-start gap-1.5 text-[9px] text-muted-foreground">
                    <ChevronRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Generated Script */}
        <motion.div variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80 h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Generated Outreach Script</h3>
              <Badge variant="outline" className="text-[8px] h-5 capitalize border-primary/30 text-primary">{tone}</Badge>
            </div>
            <div className="p-3 rounded-lg bg-muted/10 border border-border/30 mb-3">
              <pre className="text-[10px] text-foreground whitespace-pre-wrap font-sans leading-relaxed">{scripts[tone]}</pre>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-[10px] h-8 gap-1.5" onClick={copyScript}>
                <Copy className="h-3 w-3" />Copy to Clipboard
              </Button>
              <Button size="sm" variant="outline" className="text-[10px] h-8 gap-1.5" onClick={() => toast.success("WhatsApp template ready!")}>
                <Send className="h-3 w-3" />Copy for WhatsApp
              </Button>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/15">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-bold text-primary">AI Suggestion</span>
              </div>
              <p className="text-[9px] text-foreground">Agents in {district} respond 40% more to messages mentioning specific buyer demand. Consider adding: "We have 7 active buyer inquiries in {district} this week looking for properties like the ones you represent."</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Tab 3: Buyer WhatsApp Conversion ────────────────────────────────────────
const buyerLeads = [
  { name: "Ahmad K.", property: "Villa Seminyak 3BR", intent: "high" as const, lastMsg: "2h ago", budget: "Rp 3.2B", status: "Awaiting viewing" },
  { name: "Sarah L.", property: "Canggu Apartment 2BR", intent: "high" as const, lastMsg: "4h ago", budget: "Rp 1.8B", status: "Price negotiation" },
  { name: "Michael R.", property: "Ubud Land 800m²", intent: "medium" as const, lastMsg: "1d ago", budget: "Rp 2.5B", status: "Requested info" },
  { name: "Jessica T.", property: "Sanur Villa 4BR", intent: "medium" as const, lastMsg: "1d ago", budget: "Rp 4.1B", status: "Follow-up needed" },
  { name: "David W.", property: "Seminyak Studio", intent: "low" as const, lastMsg: "3d ago", budget: "Rp 900M", status: "Initial inquiry" },
];

const templates = [
  { label: "Viewing Confirmation", icon: Calendar, msg: "Hi [Name]! 🏡 Your viewing for [Property] is confirmed for [Date] at [Time]. Our agent [Agent] will meet you at the property. Please confirm you'll be there! See you soon." },
  { label: "Urgency Message", icon: Zap, msg: "Hi [Name]! Quick update — [Property] has received 3 new inquiries this week. As you showed interest earlier, I wanted to give you priority access. Would you like to schedule a viewing before it gets more competitive?" },
  { label: "Price Negotiation Prep", icon: DollarSign, msg: "Hi [Name]! Regarding [Property] — I've spoken with the owner about your interest. They're open to discussing terms for serious buyers. Based on recent comparable sales in the area, the current asking price reflects good value. Would you like to submit a formal offer?" },
];

const BuyerConversion = () => {
  const [selectedBuyer, setSelectedBuyer] = useState(0);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Kpi icon={Users} label="Active Buyer Leads" value="14" delta={22} />
        <Kpi icon={Target} label="High Intent" value="5" accent="bg-emerald-500/10" sub="Ready to move" />
        <Kpi icon={Clock} label="Avg Response Time" value="18min" sub="Target: <15min" />
        <Kpi icon={Eye} label="Conversion Rate" value="28%" delta={6} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Buyer List */}
        <motion.div variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80 h-full">
            <h3 className="text-sm font-bold text-foreground mb-3">Active Buyer Leads</h3>
            <div className="space-y-1.5">
              {buyerLeads.map((b, i) => (
                <button
                  key={b.name}
                  onClick={() => setSelectedBuyer(i)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left ${
                    selectedBuyer === i ? "bg-primary/10 border border-primary/20" : "bg-muted/10 hover:bg-muted/20 border border-transparent"
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    b.intent === "high" ? "bg-emerald-400" : b.intent === "medium" ? "bg-amber-400" : "bg-muted-foreground"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-foreground">{b.name}</span>
                      <Badge variant="outline" className={`text-[7px] h-3.5 px-1 capitalize ${
                        b.intent === "high" ? "border-emerald-500/30 text-emerald-400" :
                        b.intent === "medium" ? "border-amber-500/30 text-amber-400" : "border-border/60 text-muted-foreground"
                      }`}>{b.intent}</Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground truncate">{b.property} · {b.budget}</p>
                  </div>
                  <span className="text-[8px] text-muted-foreground shrink-0">{b.lastMsg}</span>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Reply Templates */}
        <motion.div variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80 h-full">
            <h3 className="text-sm font-bold text-foreground mb-1">Quick Reply Templates</h3>
            <p className="text-[9px] text-muted-foreground mb-3">For: <span className="text-foreground font-medium">{buyerLeads[selectedBuyer].name}</span> — {buyerLeads[selectedBuyer].status}</p>

            <div className="space-y-2">
              {templates.map(t => (
                <div key={t.label} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <t.icon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-bold text-foreground">{t.label}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[9px] gap-1"
                      onClick={() => {
                        const personalized = t.msg
                          .replace("[Name]", buyerLeads[selectedBuyer].name.split(" ")[0])
                          .replace("[Property]", buyerLeads[selectedBuyer].property);
                        navigator.clipboard.writeText(personalized);
                        toast.success(`${t.label} copied!`);
                      }}
                    >
                      <Copy className="h-3 w-3" />Copy
                    </Button>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-relaxed">{t.msg}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-bold text-primary">AI Suggestion</span>
              </div>
              <p className="text-[9px] text-foreground">
                {buyerLeads[selectedBuyer].intent === "high"
                  ? `${buyerLeads[selectedBuyer].name.split(" ")[0]} shows high intent — schedule viewing within 24h to maintain momentum. Buyers at this stage have 68% conversion rate when viewing happens within 48h.`
                  : `${buyerLeads[selectedBuyer].name.split(" ")[0]} needs nurturing — send a comparable property suggestion to increase engagement before pushing for viewing.`}
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Tab 4: $100K Revenue Tracker ────────────────────────────────────────────
const revData = [
  { week: "W1", commission: 0, premium: 0, subscription: 0, total: 0 },
  { week: "W2", commission: 2.4, premium: 0.8, subscription: 0, total: 3.2 },
  { week: "W3", commission: 4.2, premium: 1.2, subscription: 0.5, total: 5.9 },
  { week: "W4", commission: 6.8, premium: 2.4, subscription: 1.0, total: 10.2 },
  { week: "W5", commission: 8.4, premium: 3.6, subscription: 1.5, total: 13.5 },
  { week: "W6", commission: 12.2, premium: 4.8, subscription: 2.0, total: 19.0 },
  { week: "W7", commission: 14.8, premium: 5.4, subscription: 2.5, total: 22.7 },
  { week: "W8", commission: 18.4, premium: 6.2, subscription: 3.0, total: 27.6 },
];

const milestones = [
  { label: "First $10K (Rp 160M)", target: 10, reached: true },
  { label: "First $25K (Rp 400M)", target: 25, reached: true },
  { label: "First $50K (Rp 800M)", target: 50, reached: false },
  { label: "First $100K (Rp 1.6B)", target: 100, reached: false },
];

const currentRevenue = 27.6; // in thousands ($K)

const RevenueTracker = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      <Kpi icon={DollarSign} label="Total Revenue" value="$27.6K" delta={45} accent="bg-emerald-500/10" sub="Rp 441M" />
      <Kpi icon={BarChart3} label="Commission Pipeline" value="$18.4K" delta={34} sub="From 3 pending deals" />
      <Kpi icon={Star} label="Premium Sales" value="$6.2K" delta={29} />
      <Kpi icon={Activity} label="Subscription MRR" value="$3.0K" delta={20} sub="6 active vendors" />
      <Kpi icon={Target} label="To $100K Goal" value="$72.4K" sub="72.4% remaining" />
    </div>

    {/* Milestone Progress */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80">
        <h3 className="text-sm font-bold text-foreground mb-3">Revenue Milestone Progress</h3>
        <div className="relative">
          <div className="h-3 rounded-full bg-muted/20 overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (currentRevenue / 100) * 100)}%` }} />
          </div>
          <div className="flex justify-between">
            {milestones.map(m => (
              <div key={m.label} className="text-center" style={{ width: `${m.target}%`, maxWidth: "25%" }}>
                <div className={`h-3 w-3 rounded-full mx-auto mb-1 border-2 ${
                  m.reached ? "bg-emerald-500/20 border-emerald-500" : currentRevenue >= m.target * 0.8 ? "border-primary bg-primary/20" : "border-border bg-muted/20"
                }`} />
                <span className={`text-[8px] font-medium ${m.reached ? "text-emerald-400" : "text-muted-foreground"}`}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Revenue Curve */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Revenue Accumulation ($K)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Area dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)" name="Total" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Deal Breakdown */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80 h-full">
          <h3 className="text-sm font-bold text-foreground mb-3">Revenue by Source ($K)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revData}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="commission" stackId="rev" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} name="Commission" />
              <Bar dataKey="premium" stackId="rev" fill="hsl(var(--foreground))" fillOpacity={0.3} name="Premium" />
              <Bar dataKey="subscription" stackId="rev" fill="hsl(var(--muted-foreground))" fillOpacity={0.3} radius={[2, 2, 0, 0]} name="Subscription" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>

    {/* Weekly Momentum */}
    <motion.div variants={fadeUp}>
      <Card className="p-3 border-primary/15 bg-primary/5">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-[10px] text-foreground"><span className="font-bold">Revenue Intelligence:</span> At current weekly closing velocity ($3.4K/week), projected to reach $50K milestone in ~7 weeks and $100K in ~22 weeks. Accelerating premium listing sales could compress timeline by 30%.</p>
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Main ────────────────────────────────────────────────────────────────────
const FirstTractionExecutionDashboard = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">First Traction Execution Dashboard</h1>
        <p className="text-[10px] text-muted-foreground">Daily traction • Agent outreach • Buyer conversion • Revenue milestones</p>
      </div>
      <Badge variant="outline" className="text-[9px] h-5 border-primary/30 text-primary">
        <Target className="h-3 w-3 mr-1" />Execution Mode
      </Badge>
    </div>

    <Tabs defaultValue="traction" className="space-y-3">
      <TabsList className="bg-muted/30 border border-border/40 h-9">
        <TabsTrigger value="traction" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Activity className="h-3 w-3" />30-Day Traction
        </TabsTrigger>
        <TabsTrigger value="outreach" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <UserPlus className="h-3 w-3" />Agent Outreach
        </TabsTrigger>
        <TabsTrigger value="buyer" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <MessageSquare className="h-3 w-3" />Buyer Conversion
        </TabsTrigger>
        <TabsTrigger value="revenue" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <DollarSign className="h-3 w-3" />$100K Tracker
        </TabsTrigger>
      </TabsList>

      <TabsContent value="traction"><TractionDashboard /></TabsContent>
      <TabsContent value="outreach"><AgentOutreach /></TabsContent>
      <TabsContent value="buyer"><BuyerConversion /></TabsContent>
      <TabsContent value="revenue"><RevenueTracker /></TabsContent>
    </Tabs>
  </div>
);

export default FirstTractionExecutionDashboard;
