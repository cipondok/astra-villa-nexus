import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Phone, Calendar, FileText, CheckCircle, Clock, MessageSquare,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Star, Activity, Target,
  ChevronRight, Plus, Send, Eye, DollarSign, Zap, Shield,
  Building, MapPin, Tag, X, Check
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
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
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

// ─── Tab 1: Agent Follow-Up Task Engine ──────────────────────────────────────
const initialAgentTasks = [
  { id: 1, agent: "Wayan Sudira", district: "Seminyak", priority: "high" as const, lastContact: "2h ago", nextAction: "Confirm 3 new listing uploads", responsiveness: 92, done: false, notes: "Very active, 8 deals closed" },
  { id: 2, agent: "Made Artana", district: "Canggu", priority: "high" as const, lastContact: "5h ago", nextAction: "Follow up on buyer lead handoff", responsiveness: 84, done: false, notes: "Strong in villa segment" },
  { id: 3, agent: "Ketut Widia", district: "Ubud", priority: "medium" as const, lastContact: "1d ago", nextAction: "Schedule performance review call", responsiveness: 68, done: false, notes: "Needs listing quality coaching" },
  { id: 4, agent: "Putu Darma", district: "Sanur", priority: "medium" as const, lastContact: "2d ago", nextAction: "Re-engage with new buyer leads", responsiveness: 54, done: false, notes: "Slow response to buyers" },
  { id: 5, agent: "Nyoman Rai", district: "Uluwatu", priority: "low" as const, lastContact: "4d ago", nextAction: "Check listing activity status", responsiveness: 32, done: false, notes: "At risk of going inactive" },
  { id: 6, agent: "Kadek Sari", district: "Seminyak", priority: "high" as const, lastContact: "3h ago", nextAction: "Verify 2 deal closings this week", responsiveness: 88, done: true, notes: "Top performer this month" },
];

const AgentFollowUp = () => {
  const [tasks, setTasks] = useState(initialAgentTasks);
  const completed = tasks.filter(t => t.done).length;
  const rate = Math.round((completed / tasks.length) * 100);

  const toggle = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    toast.success("Task updated");
  };

  const priorityStyle = { high: "border-destructive/30 text-destructive", medium: "border-amber-500/30 text-amber-400", low: "border-border/60 text-muted-foreground" };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Kpi icon={Phone} label="Agents Contacted Today" value={String(completed)} sub={`of ${tasks.length} tasks`} />
        <Kpi icon={Target} label="Follow-Up Rate" value={`${rate}%`} delta={rate > 70 ? 12 : -8} accent={rate > 70 ? "bg-emerald-500/10" : "bg-amber-500/10"} />
        <Kpi icon={Users} label="Active Agent Network" value="34" delta={8} />
        <Kpi icon={AlertTriangle} label="At Risk (Inactive)" value="3" accent="bg-destructive/10" sub="No contact >3 days" />
      </div>

      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">Today's Agent Follow-Up Tasks</h3>
            <Badge variant="outline" className="text-[8px] h-5 border-primary/30 text-primary">{completed}/{tasks.length} Complete</Badge>
          </div>
          <Progress value={rate} className="h-1.5 mb-3" />
          <div className="space-y-1.5">
            {tasks.map(t => (
              <div key={t.id} className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${t.done ? "bg-muted/5 opacity-60" : "bg-muted/10 hover:bg-muted/20"}`}>
                <button onClick={() => toggle(t.id)} className={`h-5 w-5 rounded border shrink-0 flex items-center justify-center transition-colors ${
                  t.done ? "bg-emerald-500/20 border-emerald-500/40" : "border-border/60 hover:border-primary/40"
                }`}>
                  {t.done && <Check className="h-3 w-3 text-emerald-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.agent}</span>
                    <Badge variant="outline" className={`text-[7px] h-3.5 px-1 ${priorityStyle[t.priority]}`}>{t.priority}</Badge>
                    <span className="text-[8px] text-muted-foreground">· {t.district}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">{t.nextAction}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[8px] text-muted-foreground">Score:</span>
                    <span className={`text-[9px] font-bold ${t.responsiveness >= 75 ? "text-emerald-400" : t.responsiveness >= 50 ? "text-amber-400" : "text-destructive"}`}>{t.responsiveness}</span>
                  </div>
                  <span className="text-[8px] text-muted-foreground">{t.lastContact}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => toast.success(`Scheduled follow-up for ${t.agent}`)}>
                    <Calendar className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => toast.info(t.notes)}>
                    <FileText className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// ─── Tab 2: Viewing Calendar ─────────────────────────────────────────────────
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

const viewings = [
  { id: 1, day: 0, time: "10:00", property: "Villa Seminyak 3BR", buyer: "Ahmad K.", agent: "Wayan S.", status: "scheduled" as const },
  { id: 2, day: 0, time: "14:00", property: "Canggu Apartment 2BR", buyer: "Sarah L.", agent: "Made A.", status: "scheduled" as const },
  { id: 3, day: 1, time: "09:00", property: "Ubud Land 800m²", buyer: "Michael R.", agent: "Ketut W.", status: "scheduled" as const },
  { id: 4, day: 1, time: "15:00", property: "Sanur Villa 4BR", buyer: "Jessica T.", agent: "Putu D.", status: "completed" as const },
  { id: 5, day: 2, time: "11:00", property: "Seminyak Studio", buyer: "David W.", agent: "Wayan S.", status: "scheduled" as const },
  { id: 6, day: 3, time: "10:00", property: "Canggu Villa 2BR", buyer: "Linda M.", agent: "Made A.", status: "cancelled" as const },
  { id: 7, day: 4, time: "14:00", property: "Ubud 2BR Villa", buyer: "James P.", agent: "Ketut W.", status: "scheduled" as const },
  { id: 8, day: 5, time: "09:00", property: "Uluwatu Cliff Villa", buyer: "Anna S.", agent: "Nyoman R.", status: "scheduled" as const },
];

const statusStyle = {
  scheduled: "bg-primary/10 border-primary/20 text-primary",
  completed: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  cancelled: "bg-destructive/10 border-destructive/20 text-destructive",
};

const ViewingCalendar = () => (
  <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Kpi icon={Calendar} label="Viewings This Week" value="8" delta={33} />
      <Kpi icon={CheckCircle} label="Attendance Rate" value="82%" delta={5} accent="bg-emerald-500/10" />
      <Kpi icon={Target} label="Viewing → Offer" value="38%" delta={12} />
      <Kpi icon={AlertTriangle} label="Cancelled" value="1" accent="bg-destructive/10" sub="Reschedule needed" />
    </div>

    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground">Weekly Viewing Schedule</h3>
          <Badge variant="outline" className="text-[8px] h-5 border-primary/30 text-primary">This Week</Badge>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(d => (
                <div key={d} className="text-center text-[9px] font-bold text-muted-foreground py-1">{d}</div>
              ))}
            </div>

            {/* Time Grid */}
            {timeSlots.map(slot => (
              <div key={slot} className="grid grid-cols-7 gap-1 mb-1">
                {weekDays.map((_, dayIdx) => {
                  const viewing = viewings.find(v => v.day === dayIdx && v.time === slot);
                  return (
                    <div key={dayIdx} className={`min-h-[48px] rounded-md p-1 text-left ${viewing ? `border ${statusStyle[viewing.status]}` : "bg-muted/5 border border-transparent"}`}>
                      {viewing ? (
                        <div>
                          <p className="text-[8px] font-bold truncate">{viewing.property}</p>
                          <p className="text-[7px] opacity-80 truncate">{viewing.buyer}</p>
                          <p className="text-[7px] opacity-60">{slot} · {viewing.agent.split(" ")[0]}</p>
                        </div>
                      ) : (
                        <p className="text-[8px] text-muted-foreground/30 text-center pt-3">{slot}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>

    {/* Upcoming Viewings List */}
    <motion.div variants={fadeUp}>
      <Card className="p-4 border-border/40 bg-card/80">
        <h3 className="text-sm font-bold text-foreground mb-3">Upcoming Viewings</h3>
        <div className="space-y-1.5">
          {viewings.filter(v => v.status === "scheduled").map(v => (
            <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-foreground block">{v.property}</span>
                <p className="text-[9px] text-muted-foreground">Buyer: {v.buyer} · Agent: {v.agent}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-foreground">{weekDays[v.day]} {v.time}</span>
              </div>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-[9px] gap-1 shrink-0" onClick={() => toast.success("Confirmation sent!")}>
                <Send className="h-3 w-3" />Confirm
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  </motion.div>
);

// ─── Tab 3: Negotiation Notes CRM ────────────────────────────────────────────
const deals = [
  { id: 1, property: "Villa Seminyak 3BR", buyer: "Ahmad K.", sellerAsk: "Rp 3.8B", lastOffer: "Rp 3.2B", gap: 15.8, rounds: 3, momentum: "active" as const, stage: "Negotiation" },
  { id: 2, property: "Canggu Apartment 2BR", buyer: "Sarah L.", sellerAsk: "Rp 2.1B", lastOffer: "Rp 1.95B", gap: 7.1, rounds: 2, momentum: "active" as const, stage: "Counter Offer" },
  { id: 3, property: "Ubud Land 800m²", buyer: "Michael R.", sellerAsk: "Rp 2.8B", lastOffer: "Rp 2.5B", gap: 10.7, rounds: 1, momentum: "slow" as const, stage: "Initial Offer" },
];

const notesMock = [
  { id: 1, dealId: 1, date: "Mar 20, 14:30", tag: "price" as const, text: "Buyer countered at Rp 3.2B. Seller firm at 3.8B but indicated flexibility around 3.5B if closing within 30 days." },
  { id: 2, dealId: 1, date: "Mar 19, 10:15", tag: "urgency" as const, text: "Buyer has competing property in Canggu. Need to move fast — suggest seller consider Rp 3.4B to close this week." },
  { id: 3, dealId: 1, date: "Mar 18, 16:45", tag: "financing" as const, text: "Buyer confirmed cash purchase. No financing delays expected. Ready to proceed once price agreed." },
  { id: 4, dealId: 1, date: "Mar 17, 09:00", tag: "legal" as const, text: "Title check completed. Property clear for transfer. Notary identified and available." },
];

const offerTimeline = [
  { round: "R1", buyer: 2.8, seller: 3.8 },
  { round: "R2", buyer: 3.0, seller: 3.6 },
  { round: "R3", buyer: 3.2, seller: 3.5 },
];

const tagColors = {
  price: "bg-primary/10 text-primary border-primary/20",
  legal: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  urgency: "bg-destructive/10 text-destructive border-destructive/20",
  financing: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const NegotiationCRM = () => {
  const [selectedDeal, setSelectedDeal] = useState(0);
  const [newNote, setNewNote] = useState("");

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Kpi icon={FileText} label="Active Negotiations" value="3" />
        <Kpi icon={Activity} label="Avg Rounds" value="2.0" sub="Per deal" />
        <Kpi icon={Clock} label="Avg Response" value="1.8d" sub="Buyer response delay" />
        <Kpi icon={Target} label="Deal Momentum" value="Active" accent="bg-emerald-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Deal List */}
        <motion.div variants={fadeUp}>
          <Card className="p-4 border-border/40 bg-card/80 h-full">
            <h3 className="text-sm font-bold text-foreground mb-3">Deal Pipeline</h3>
            <div className="space-y-1.5">
              {deals.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeal(i)}
                  className={`w-full text-left p-2.5 rounded-lg transition-colors ${
                    selectedDeal === i ? "bg-primary/10 border border-primary/20" : "bg-muted/10 hover:bg-muted/20 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-foreground">{d.property}</span>
                    <Badge variant="outline" className={`text-[7px] h-3.5 px-1 ${d.momentum === "active" ? "border-emerald-500/30 text-emerald-400" : "border-amber-500/30 text-amber-400"}`}>{d.momentum}</Badge>
                  </div>
                  <p className="text-[9px] text-muted-foreground">{d.buyer} · Gap: {d.gap}% · {d.rounds} rounds</p>
                  <p className="text-[8px] text-primary mt-0.5">{d.stage}</p>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Deal Detail + Notes */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="p-4 border-border/40 bg-card/80 h-full">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">{deals[selectedDeal].property}</h3>
                <p className="text-[9px] text-muted-foreground">Buyer: {deals[selectedDeal].buyer} · Seller Ask: {deals[selectedDeal].sellerAsk} · Last Offer: {deals[selectedDeal].lastOffer}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-foreground">{deals[selectedDeal].gap}%</span>
                <p className="text-[8px] text-muted-foreground">Negotiation Gap</p>
              </div>
            </div>

            {/* Offer Timeline Chart */}
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={offerTimeline}>
                  <XAxis dataKey="round" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[2.5, 4]} />
                  <Tooltip content={<Tip />} />
                  <Line dataKey="buyer" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Buyer (B Rp)" />
                  <Line dataKey="seller" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ r: 3 }} name="Seller (B Rp)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Notes Feed */}
            <div className="mb-3">
              <h4 className="text-[10px] font-bold text-foreground mb-2">Negotiation Notes</h4>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                {notesMock.map(n => (
                  <div key={n.id} className="p-2 rounded-lg bg-muted/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] text-muted-foreground">{n.date}</span>
                      <Badge variant="outline" className={`text-[7px] h-3.5 px-1 ${tagColors[n.tag]}`}>{n.tag}</Badge>
                    </div>
                    <p className="text-[9px] text-foreground leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Note */}
            <div className="flex gap-2">
              <Input
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add negotiation note..."
                className="h-8 text-xs flex-1"
              />
              <Button size="sm" className="h-8 px-3 text-[10px]" onClick={() => { if (newNote) { toast.success("Note added"); setNewNote(""); } }}>
                <Plus className="h-3 w-3 mr-1" />Add
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Tab 4: Closing Checklist ────────────────────────────────────────────────
const initialStages = [
  { id: 1, stage: "Offer Accepted", tasks: [
    { label: "Buyer offer formally accepted by seller", done: true, responsible: "Agent", deadline: "Mar 15" },
    { label: "Acceptance letter generated and signed", done: true, responsible: "Legal", deadline: "Mar 16" },
  ]},
  { id: 2, stage: "Legal Document Preparation", tasks: [
    { label: "Title deed verification completed", done: true, responsible: "Legal", deadline: "Mar 18" },
    { label: "Sale & Purchase Agreement drafted", done: false, responsible: "Notary", deadline: "Mar 22" },
    { label: "Tax clearance certificate obtained", done: false, responsible: "Seller", deadline: "Mar 24" },
  ]},
  { id: 3, stage: "Financing Confirmation", tasks: [
    { label: "Buyer payment source verified", done: false, responsible: "Buyer", deadline: "Mar 25" },
    { label: "Bank loan approval (if applicable)", done: false, responsible: "Bank", deadline: "Mar 28" },
  ]},
  { id: 4, stage: "Escrow / Payment Arrangement", tasks: [
    { label: "Escrow account set up", done: false, responsible: "Notary", deadline: "Mar 30" },
    { label: "Down payment deposited", done: false, responsible: "Buyer", deadline: "Apr 1" },
    { label: "Payment schedule confirmed", done: false, responsible: "Agent", deadline: "Apr 2" },
  ]},
  { id: 5, stage: "Final Agreement Signing", tasks: [
    { label: "Final walkthrough completed", done: false, responsible: "Buyer", deadline: "Apr 5" },
    { label: "Agreement signed by all parties", done: false, responsible: "All", deadline: "Apr 7" },
  ]},
  { id: 6, stage: "Transaction Completion", tasks: [
    { label: "Full payment received", done: false, responsible: "Buyer", deadline: "Apr 10" },
    { label: "Title transfer registered", done: false, responsible: "Notary", deadline: "Apr 14" },
    { label: "Keys and documents handed over", done: false, responsible: "Agent", deadline: "Apr 15" },
  ]},
];

const ClosingChecklist = () => {
  const [stages, setStages] = useState(initialStages);

  const totalTasks = stages.reduce((s, st) => s + st.tasks.length, 0);
  const doneTasks = stages.reduce((s, st) => s + st.tasks.filter(t => t.done).length, 0);
  const readiness = Math.round((doneTasks / totalTasks) * 100);

  const toggleTask = (stageId: number, taskIdx: number) => {
    setStages(prev => prev.map(st =>
      st.id === stageId ? { ...st, tasks: st.tasks.map((t, i) => i === taskIdx ? { ...t, done: !t.done } : t) } : st
    ));
  };

  const pendingAlerts = [
    { type: "doc", msg: "Sale & Purchase Agreement not yet drafted — due Mar 22", icon: FileText },
    { type: "finance", msg: "Buyer payment source not verified — blocking escrow setup", icon: DollarSign },
    { type: "approval", msg: "Tax clearance certificate pending from seller", icon: Shield },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Kpi icon={CheckCircle} label="Tasks Completed" value={`${doneTasks}/${totalTasks}`} accent="bg-emerald-500/10" />
        <Kpi icon={Target} label="Closing Readiness" value={`${readiness}%`} accent={readiness >= 60 ? "bg-emerald-500/10" : "bg-amber-500/10"} />
        <Kpi icon={Clock} label="Est. Days to Close" value="26" sub="Based on current pace" />
        <Kpi icon={AlertTriangle} label="Pending Blockers" value={String(pendingAlerts.length)} accent="bg-destructive/10" />
      </div>

      {/* Alerts */}
      <motion.div variants={fadeUp}>
        <Card className="p-3 border-destructive/15 bg-destructive/5">
          <h4 className="text-[10px] font-bold text-foreground mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />Pending Blockers
          </h4>
          <div className="space-y-1">
            {pendingAlerts.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px] text-foreground">
                <a.icon className="h-3 w-3 text-destructive shrink-0" />
                <span>{a.msg}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Stages */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 border-border/40 bg-card/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">Closing Workflow — Villa Seminyak 3BR</h3>
            <Progress value={readiness} className="h-2 w-32" />
          </div>
          <div className="space-y-3">
            {stages.map((st, stIdx) => {
              const stageDone = st.tasks.filter(t => t.done).length;
              const stageTotal = st.tasks.length;
              const stageComplete = stageDone === stageTotal;
              return (
                <div key={st.id}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                      stageComplete ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" :
                      stageDone > 0 ? "bg-primary/20 border-primary/40 text-primary" : "bg-muted/20 border-border/40 text-muted-foreground"
                    }`}>{stIdx + 1}</div>
                    <span className="text-[10px] font-bold text-foreground">{st.stage}</span>
                    <span className="text-[8px] text-muted-foreground">{stageDone}/{stageTotal}</span>
                    {stageComplete && <CheckCircle className="h-3 w-3 text-emerald-400" />}
                  </div>
                  <div className="ml-8 space-y-1">
                    {st.tasks.map((t, tIdx) => (
                      <div key={tIdx} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/10 transition-colors">
                        <button onClick={() => toggleTask(st.id, tIdx)} className={`h-4 w-4 rounded border shrink-0 flex items-center justify-center ${
                          t.done ? "bg-emerald-500/20 border-emerald-500/40" : "border-border/60"
                        }`}>
                          {t.done && <Check className="h-3 w-3 text-emerald-400" />}
                        </button>
                        <span className={`text-[9px] flex-1 ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.label}</span>
                        <Badge variant="outline" className="text-[7px] h-3.5 px-1 border-border/40 text-muted-foreground">{t.responsible}</Badge>
                        <span className="text-[8px] text-muted-foreground shrink-0">{t.deadline}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
const DealOpsClosingManagement = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-foreground">Deal Operations & Closing Management</h1>
        <p className="text-[10px] text-muted-foreground">Agent follow-ups • Viewing calendar • Negotiation CRM • Closing workflow</p>
      </div>
      <Badge variant="outline" className="text-[9px] h-5 border-primary/30 text-primary">
        <Activity className="h-3 w-3 mr-1" />Operations
      </Badge>
    </div>

    <Tabs defaultValue="followup" className="space-y-3">
      <TabsList className="bg-muted/30 border border-border/40 h-9">
        <TabsTrigger value="followup" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Phone className="h-3 w-3" />Agent Follow-Up
        </TabsTrigger>
        <TabsTrigger value="viewings" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <Calendar className="h-3 w-3" />Viewing Calendar
        </TabsTrigger>
        <TabsTrigger value="negotiation" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <FileText className="h-3 w-3" />Negotiation CRM
        </TabsTrigger>
        <TabsTrigger value="closing" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
          <CheckCircle className="h-3 w-3" />Closing Checklist
        </TabsTrigger>
      </TabsList>

      <TabsContent value="followup"><AgentFollowUp /></TabsContent>
      <TabsContent value="viewings"><ViewingCalendar /></TabsContent>
      <TabsContent value="negotiation"><NegotiationCRM /></TabsContent>
      <TabsContent value="closing"><ClosingChecklist /></TabsContent>
    </Tabs>
  </div>
);

export default DealOpsClosingManagement;
