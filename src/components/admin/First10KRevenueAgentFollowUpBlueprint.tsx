import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { DollarSign, MessageSquare, Target, CheckCircle, AlertTriangle, TrendingUp, Clock, Sun, Moon, Phone, Zap, Copy } from 'lucide-react';
import { toast } from 'sonner';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied to clipboard'); };

/* ── Section 1: $10K Weekly Revenue Plan ── */
const revenueStreams = [
  { stream: 'Premium Listing Upgrades', target: '$3,000/wk', actions: ['Identify 15+ listings with high inquiry activity', 'Offer 7-day featured boost at $200-500/listing', 'Bundle "Premium Week" packages for top agents'], weight: 30 },
  { stream: 'Transaction Commission (2.5%)', target: '$4,000/wk', actions: ['Accelerate 3-5 near-closing deals per week', 'Push agents for 24h counter-offer SLA', 'Facilitate pricing alignment for stalled negotiations'], weight: 40 },
  { stream: 'Developer Project Fees', target: '$2,000/wk', actions: ['Onboard 1-2 developer projects with dedicated landing pages', 'Charge project showcase fees ($1,000-2,000/project)', 'Drive inquiry volume via targeted campaign'], weight: 20 },
  { stream: 'Data & Analytics Subscriptions', target: '$1,000/wk', actions: ['Offer district price trend reports to agents ($50/mo)', 'Launch investor demand intelligence dashboard ($200/mo)', 'Upsell market insights to developer partners'], weight: 10 },
];

const dailyMicroTargets = [
  { day: 'Monday', revenue: '$1,200', focus: 'Activate 3 premium listing upgrades + push 1 near-closing deal' },
  { day: 'Tuesday', revenue: '$1,500', focus: 'Close 1 transaction commission + upsell 2 premium boosts' },
  { day: 'Wednesday', revenue: '$1,800', focus: 'Developer project fee collection + 2 premium upgrades' },
  { day: 'Thursday', revenue: '$2,000', focus: 'Push 2 deal closures + activate analytics subscriptions' },
  { day: 'Friday', revenue: '$1,500', focus: 'Close weekend premium packages + collect pending commissions' },
  { day: 'Weekend', revenue: '$2,000', focus: 'High-density viewing revenue + flash premium promotions' },
];

/* ── Section 2: Agent Follow-Up Scripts ── */
const followUpScripts = [
  {
    phase: 'Morning Lead Activation',
    time: '08:00 – 09:30',
    icon: Sun,
    color: 'text-yellow-500',
    scripts: [
      { label: 'New Inquiry Alert (WhatsApp)', text: 'Selamat pagi [Agent]! 🔔 Ada [X] inquiry baru masuk semalam. Lead paling panas: [Buyer Name] — budget Rp [X]M, cari [type] di [district]. Respond sebelum jam 10 ya! Speed = closing.' },
      { label: 'Hot Listing Reminder', text: '[Agent], listing Anda di [Address] sudah dapat [X] inquiry minggu ini. Ada 2 buyer yang sudah request viewing. Tolong konfirmasi jadwal viewing hari ini sebelum jam 12.' },
      { label: 'Viewing Confirmation Push', text: 'Reminder: Anda ada [X] viewing hari ini. Pastikan semua sudah confirmed. Kalau ada yang belum respond, kirim reminder sekarang. No-show = lost deal.' },
    ],
  },
  {
    phase: 'Midday Progress Check',
    time: '12:00 – 13:30',
    icon: Clock,
    color: 'text-primary',
    scripts: [
      { label: 'Negotiation Status Update', text: '[Agent], update status nego untuk [Property]: Buyer [Name] sudah offer Rp [X]M. Seller response? Kalau belum ada jawaban >24h, kita perlu escalate. Reply status sekarang.' },
      { label: 'Second Viewing Push', text: 'Buyer [Name] yang viewing kemarin di [Address] menunjukkan interest tinggi. Sudah follow up untuk second viewing? Suggest: besok jam 10 atau 14. Lock jadwalnya sekarang.' },
      { label: 'Pipeline Movement Check', text: 'Quick check — dari [X] active leads Anda minggu ini: berapa yang sudah maju ke viewing? Berapa yang ready untuk offer discussion? Update pipeline sebelum jam 15.' },
    ],
  },
  {
    phase: 'Evening Deal Status',
    time: '17:00 – 18:30',
    icon: Moon,
    color: 'text-indigo-400',
    scripts: [
      { label: 'Daily Closing Report Request', text: '[Agent], end-of-day report: 1) Offers submitted hari ini? 2) Negotiations yang maju? 3) Blockers/objections? 4) Tomorrow priority leads? Reply singkat sebelum jam 19.' },
      { label: 'Objection Resolution', text: 'Saya lihat deal [Property] stuck karena [objection]. Saran: [solution]. Mau saya bantu facilitate call dengan buyer besok pagi? Speed resolves = deals closed.' },
      { label: 'Next-Day Planning', text: 'Besok focus: 1) [Lead A] — ready for offer, push confirmation. 2) [Lead B] — second viewing, lock schedule. 3) [Lead C] — price alignment call needed. Good luck! 💪' },
    ],
  },
];

/* ── Section 3: Buyer Urgency Closing ── */
const closingDialogues = [
  {
    scenario: 'Post-Viewing Interest Confirmation',
    channel: 'WhatsApp',
    scripts: [
      { label: 'Opportunity Framing', text: 'Pak/Bu [Name], terima kasih sudah viewing [Property] hari ini. Berdasarkan kriteria Anda — [budget], [location preference], [property type] — properti ini sangat cocok. Dari 50+ listing yang kami punya di area ini, ini termasuk top 3 untuk value-nya.' },
      { label: 'Urgency Signal', text: 'Update: properti ini sudah mendapat [X] inquiry minggu ini dan ada [Y] orang lain yang sudah request viewing. Berdasarkan trend, properti seperti ini biasanya terjual dalam 2-3 minggu di area [district].' },
      { label: 'Commitment Prompt', text: 'Apakah Anda ingin kita diskusikan langkah selanjutnya? Saya bisa bantu prepare offer discussion atau arrange second viewing untuk keluarga. Available besok jam [X] atau [Y]?' },
    ],
  },
  {
    scenario: 'Price Negotiation Confidence',
    channel: 'Phone Call',
    scripts: [
      { label: 'Market Data Opening', text: '"Pak/Bu [Name], saya sudah analisis data harga di [district]. Rata-rata harga per meter untuk tipe serupa adalah Rp [X]jt. Listing ini di Rp [Y]jt/m² — jadi sebenarnya sudah competitive. Dengan demand yang tinggi di area ini, ini timing yang baik untuk submit offer."' },
      { label: 'Counter-Offer Guidance', text: '"Kalau Anda ingin nego, range yang realistis berdasarkan market data adalah Rp [X]M - Rp [Y]M. Saya suggest offer di Rp [Z]M — ini menunjukkan serious intent tapi masih ada room untuk counter. Mau saya bantu prepare offer-nya?"' },
      { label: 'Decision Timeline Close', text: '"Saya recommend kita submit offer dalam 48 jam. Kalau ada buyer lain yang move faster, opportunity ini bisa hilang. Saya available besok untuk finalize — jam berapa yang convenient?"' },
    ],
  },
  {
    scenario: 'Hesitant Buyer Re-engagement',
    channel: 'Voice Note',
    scripts: [
      { label: 'Gentle Re-engagement', text: '"Hai Pak/Bu [Name], ini [Agent] dari Astra. Saya ingat Anda sangat tertarik dengan [Property] waktu viewing. Saya mau update — harga area [district] mulai naik 3-5% quarter ini. Kalau masih interested, sekarang timing yang baik. Reply kapan convenient untuk discuss?"' },
      { label: 'New Opportunity Hook', text: '"Pak/Bu [Name], ada listing baru masuk yang mirip dengan preferensi Anda — [type] di [district], Rp [X]M. Ini belum dipublish ke public. Mau saya kirim detailnya? Bisa arrange exclusive viewing minggu ini."' },
    ],
  },
];

/* ── Daily Revenue Checklist ── */
const dailyChecklist = [
  { time: '08:00', action: 'Review overnight inquiries — flag high-intent leads' },
  { time: '09:00', action: 'Send morning follow-up scripts to all active agents' },
  { time: '10:00', action: 'Check premium listing upsell opportunities' },
  { time: '11:00', action: 'Push viewing confirmations for today\'s schedule' },
  { time: '12:00', action: 'Midday agent progress check — update pipeline' },
  { time: '14:00', action: 'Facilitate negotiation acceleration calls' },
  { time: '15:00', action: 'Track daily revenue micro-target progress' },
  { time: '16:00', action: 'Activate urgency closing dialogues for hot buyers' },
  { time: '17:00', action: 'Evening deal status collection from agents' },
  { time: '18:00', action: 'Log daily metrics: offers, viewings, revenue' },
  { time: '19:00', action: 'Plan next-day top 3 priority actions' },
];

/* ── Risk Indicators ── */
const risks = [
  { risk: 'Premium upsell rejection rate >70%', signal: 'Value proposition not connecting with agents', fix: 'Show before/after inquiry data for premium listings — prove ROI' },
  { risk: 'Agent follow-up compliance <50%', signal: 'Scripts ignored, leads going cold', fix: 'Implement response-speed scoring visible on agent dashboard' },
  { risk: 'Buyer urgency messaging fatigue', signal: 'Declining response rates to urgency messages', fix: 'Rotate messaging styles, lead with value not pressure' },
  { risk: 'Revenue concentrated in 1-2 deals', signal: 'No diversified monetization streams active', fix: 'Enforce minimum 3 revenue channels active per week' },
  { risk: 'Viewing-to-offer ratio below 15%', signal: 'Buyers viewing but not committing', fix: 'Audit post-viewing follow-up quality and timing' },
];

export default function First10KRevenueAgentFollowUpBlueprint() {
  const [activeTab, setActiveTab] = useState('revenue');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-green-500/20 bg-gradient-to-br from-background to-green-500/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <DollarSign className="h-7 w-7 text-green-500" />
                <div>
                  <CardTitle className="text-xl">First $10K Weekly Revenue + Agent Follow-Up Command + Buyer Urgency Closing</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Revenue activation machine — monetize, follow up, close deals</p>
                </div>
              </div>
              <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/30">💰 Revenue Sprint</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="revenue">💰 $10K Plan</TabsTrigger>
          <TabsTrigger value="followup">📱 Agent Scripts</TabsTrigger>
          <TabsTrigger value="closing">🎯 Buyer Closing</TabsTrigger>
          <TabsTrigger value="checklist">📋 Daily Track</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risk Signals</TabsTrigger>
        </TabsList>

        {/* ── Revenue Plan ── */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /> Revenue Stream Breakdown — $10K/Week Target</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {revenueStreams.map((s, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{s.stream}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{s.target}</Badge>
                        <Badge variant="secondary" className="text-xs">{s.weight}% weight</Badge>
                      </div>
                    </div>
                    <Progress value={s.weight * 2.5} className="h-1.5" />
                    <div className="grid gap-1">
                      {s.actions.map((a, j) => (
                        <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />{a}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-green-500" /> Daily Micro-Targets</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {dailyMicroTargets.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs w-20 justify-center">{d.day}</Badge>
                        <span className="text-sm">{d.focus}</span>
                      </div>
                      <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/30">{d.revenue}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Agent Scripts ── */}
        <TabsContent value="followup" className="space-y-4 mt-4">
          {followUpScripts.map((phase, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <phase.icon className={`h-5 w-5 ${phase.color}`} />
                      <CardTitle className="text-base">{phase.phase}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">{phase.time}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {phase.scripts.map((s, j) => (
                    <div key={j} className="p-3 rounded-lg bg-muted/40 border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">{s.label}</span>
                        <button onClick={() => copy(s.text)} className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
                      </div>
                      <p className="text-xs italic text-muted-foreground leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Buyer Closing ── */}
        <TabsContent value="closing" className="space-y-4 mt-4">
          {closingDialogues.map((scenario, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" />{scenario.scenario}</CardTitle>
                    <Badge variant="secondary" className="text-xs">{scenario.channel}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scenario.scripts.map((s, j) => (
                    <div key={j} className="p-3 rounded-lg bg-muted/40 border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">{s.label}</span>
                        <button onClick={() => copy(s.text)} className="text-muted-foreground hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
                      </div>
                      <p className="text-xs italic text-muted-foreground leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Daily Checklist ── */}
        <TabsContent value="checklist" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Daily Revenue Operations Timeline</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {dailyChecklist.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/20">
                      <Badge variant="outline" className="text-xs w-14 justify-center shrink-0">{c.time}</Badge>
                      <span className="text-sm">{c.action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Risks ── */}
        <TabsContent value="risks" className="space-y-4 mt-4">
          {risks.map((r, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card className="border-destructive/20">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="font-semibold text-sm">{r.risk}</span></div>
                  <div className="text-xs text-muted-foreground"><strong>Signal:</strong> {r.signal}</div>
                  <div className="text-xs"><strong>Fix:</strong> {r.fix}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
