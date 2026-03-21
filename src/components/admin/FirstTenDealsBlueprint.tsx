
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Target, CheckCircle2, AlertTriangle, ArrowUpRight, Zap,
  Clock, Sun, Sunset, Moon, Phone, Users, MessageSquare,
  Copy, HandshakeIcon, TrendingUp, ShieldAlert, CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const copyText = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard');
};

// ── Section 1: First 10 Deals ────────────────────────────────────────────────
const dealPhases = [
  {
    phase: 'Week 1–2: Pipeline Building',
    target: '20+ viewings scheduled',
    actions: [
      'Identify top 30 listings with correct pricing + strong location demand',
      'Personally call every agent with high-potential listings to confirm availability',
      'Follow up on EVERY inquiry within 15 minutes — no exceptions',
      'Offer to coordinate viewings directly (remove friction for buyer)',
      'Send "multiple interest detected" nudge to hesitant buyers'
    ]
  },
  {
    phase: 'Week 3–4: Conversion Push',
    target: '5+ offers initiated',
    actions: [
      'Share comparable recent sales data with serious buyers to build confidence',
      'Coach vendors on realistic pricing expectations using market intelligence',
      'Create urgency: "This property had 8 inquiries this week"',
      'Facilitate direct buyer-agent WhatsApp connections for hot leads',
      'Follow up daily on every viewing — "How did it go? Ready to make an offer?"'
    ]
  },
  {
    phase: 'Week 5–6: Deal Closing',
    target: '10 closed transactions',
    actions: [
      'Support negotiation by sharing objective market comparisons',
      'Introduce financing partner connections if buyer needs mortgage',
      'Maintain daily contact with both sides until deal closes',
      'Document every closed deal for social proof and case studies',
      'Celebrate publicly — tag agents, share success on social media'
    ]
  }
];

const dealKPIs = [
  { label: 'Viewings/Week', target: '10+', current: 0 },
  { label: 'Inquiry Response <15min', target: '95%', current: 0 },
  { label: 'Viewing→Offer Rate', target: '25%', current: 0 },
  { label: 'Offer→Close Rate', target: '60%', current: 0 }
];

// ── Section 2: Daily Command ─────────────────────────────────────────────────
const dailyBlocks = [
  {
    time: '07:00–09:00',
    label: 'Morning Market Scan',
    icon: Sun,
    color: 'text-chart-3',
    tasks: [
      'Review all new listings added overnight — flag top 5 high-potential',
      'Check all new inquiries — respond immediately to hot leads',
      'Identify supply gaps: which districts need more inventory?',
      'Scan competitor portals for exclusive listings to recruit',
      'Set 3 non-negotiable growth targets for the day'
    ],
    kpi: 'All inquiries responded to before 9 AM'
  },
  {
    time: '09:00–12:00',
    label: 'Midday Growth Actions',
    icon: Zap,
    color: 'text-primary',
    tasks: [
      'Contact 5 new agents — pitch platform with recent traction data',
      'Help 3 existing vendors improve listing photos or descriptions',
      'Post 2 "hot property" social media highlights',
      'Send WhatsApp broadcast to buyer list with new opportunities',
      'Activate any paid traffic campaigns for high-demand areas'
    ],
    kpi: '5 new agent contacts, 3 listings improved'
  },
  {
    time: '12:00–16:00',
    label: 'Afternoon Revenue Focus',
    icon: Sunset,
    color: 'text-chart-1',
    tasks: [
      'Follow up on all active deal negotiations — push toward commitment',
      'Coordinate viewing schedules for weekend appointments',
      'Pitch listing boost to vendors with high-inquiry properties',
      'Review monetization pipeline — any upsell opportunities?',
      'Meet or call 1 strategic agent for deeper partnership discussion'
    ],
    kpi: '2+ viewings scheduled, 1 monetization attempt'
  },
  {
    time: '16:00–18:00',
    label: 'Evening Reflection',
    icon: Moon,
    color: 'text-muted-foreground',
    tasks: [
      'Count: listings added, inquiries received, viewings booked, deals progressing',
      'Note top growth win of the day — what worked?',
      'Identify biggest bottleneck — what blocked progress?',
      'Write tomorrow\'s top 3 priorities',
      'Send appreciation message to most active agent of the day'
    ],
    kpi: 'Daily scorecard completed, next-day plan set'
  }
];

// ── Section 3: Agent Persuasion ──────────────────────────────────────────────
const scripts = [
  {
    stage: 'Opening (30 seconds)',
    label: 'Hook & Position',
    script: `"Hi [Name], I'm [Founder] from Astra. We're a new property platform that's already generating real buyer inquiries in [City]. I noticed your listings in [District] — I think we can bring you serious leads for those properties. Do you have 5 minutes?"`,
    tone: 'Confident, direct, peer-to-peer — NOT salesy'
  },
  {
    stage: 'Value Demo (2 minutes)',
    label: 'Show the Advantage',
    script: `"We're different from traditional portals in 3 ways: First, we target high-intent investors and serious buyers — not browsers. Second, your listings get intelligent visibility — our system pushes properties to buyers whose search patterns match. Third, early agents get premium exposure at no cost while we build the marketplace. Right now, agents who join are getting [X] inquiries per listing per week."`,
    tone: 'Factual, benefit-focused, data-backed'
  },
  {
    stage: 'Objection: "I use other portals"',
    label: 'Reframe',
    script: `"That makes total sense — and you should keep using them. We're not asking you to replace anything. Think of us as an additional channel that costs you nothing right now. Most of our top agents use 3-4 platforms. The question is: why miss out on leads that are already searching here?"`,
    tone: 'Non-confrontational, additive positioning'
  },
  {
    stage: 'Objection: "No time to upload"',
    label: 'Remove Friction',
    script: `"I completely understand — that's why we handle it for you. Just send me your listing details on WhatsApp — photos, price, description — and our team uploads everything within 24 hours. You just approve and start receiving inquiries."`,
    tone: 'Helpful, service-oriented'
  },
  {
    stage: 'Objection: "Not sure about lead quality"',
    label: 'Reassure',
    script: `"Fair concern. Let me propose this: give us 5 listings for 2 weeks. If you don't get at least [X] quality inquiries, you've lost nothing. But if you do — you've found a new revenue channel. Most agents who try us keep listing because the leads convert."`,
    tone: 'Low-risk trial framing'
  },
  {
    stage: 'Close (30 seconds)',
    label: 'Get Commitment',
    script: `"Great — so let's start with 5 of your best properties. Can you WhatsApp me the details today or tomorrow? I'll have them live within 24 hours and send you the first inquiry report by end of week. Here's my direct number."`,
    tone: 'Clear next step, specific timeline'
  }
];

// ── Section 4: Tracking Metrics ──────────────────────────────────────────────
const trackingMetrics = [
  { metric: 'New agents contacted', daily: '5', weekly: '25', status: 'Critical' },
  { metric: 'Listings uploaded', daily: '3–5', weekly: '15–25', status: 'Critical' },
  { metric: 'Buyer inquiries received', daily: '5+', weekly: '25+', status: 'High' },
  { metric: 'Viewings scheduled', daily: '2+', weekly: '10+', status: 'High' },
  { metric: 'Offers initiated', daily: '—', weekly: '3+', status: 'Medium' },
  { metric: 'Deals closed', daily: '—', weekly: '1–2', status: 'Target' }
];

// ── Section 5: Common Mistakes ───────────────────────────────────────────────
const mistakes = [
  {
    mistake: 'Waiting for agents to come to you',
    fix: 'Outbound first — call, visit, WhatsApp 5+ agents daily without exception',
    severity: 'Fatal'
  },
  {
    mistake: 'Slow inquiry response (>1 hour)',
    fix: 'Set phone alerts for every inquiry — respond within 15 minutes personally',
    severity: 'Fatal'
  },
  {
    mistake: 'Accepting low-quality listings',
    fix: 'Help agents improve photos and descriptions before publishing — quality drives trust',
    severity: 'Critical'
  },
  {
    mistake: 'Building features instead of closing deals',
    fix: 'Product is good enough — spend 80% of time on supply acquisition and deal facilitation',
    severity: 'Critical'
  },
  {
    mistake: 'Not following up after viewings',
    fix: 'Call both buyer and agent same evening — "How did it go? What\'s the next step?"',
    severity: 'High'
  },
  {
    mistake: 'Spreading across too many districts',
    fix: 'Focus on 3–5 high-demand districts first — density beats coverage at launch',
    severity: 'High'
  }
];

const severityColor = (s: string) => {
  if (s === 'Fatal') return 'bg-destructive/10 text-destructive border-destructive/20';
  if (s === 'Critical') return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
  return 'bg-primary/10 text-primary border-primary/20';
};

const FirstTenDealsBlueprint = () => {
  const [activeTab, setActiveTab] = useState('deals');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeIn}>
        <Card className="border-chart-1/20 bg-gradient-to-r from-chart-1/5 via-background to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-chart-1/10 border border-chart-1/20">
                  <HandshakeIcon className="h-6 w-6 text-chart-1" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    First 10 Deals Action Blueprint
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Deal closing tactics • Daily founder command • Agent persuasion scripts
                  </p>
                </div>
              </div>
              <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-xs">
                Launch Execution
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="deals" className="text-xs">🎯 First 10 Deals</TabsTrigger>
          <TabsTrigger value="daily" className="text-xs">⏰ Daily Command</TabsTrigger>
          <TabsTrigger value="scripts" className="text-xs">🗣️ Agent Scripts</TabsTrigger>
          <TabsTrigger value="tracking" className="text-xs">📊 Tracking</TabsTrigger>
          <TabsTrigger value="mistakes" className="text-xs">⚠️ Avoid These</TabsTrigger>
        </TabsList>

        {/* ── First 10 Deals ──────────────────────────────────────────────── */}
        <TabsContent value="deals" className="space-y-4 mt-4">
          {dealPhases.map((phase, i) => (
            <motion.div key={phase.phase} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 hover:border-chart-1/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-chart-1" />
                      {phase.phase}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">{phase.target}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1.5">
                    {phase.actions.map((a, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ArrowUpRight className="h-3 w-3 text-chart-1 mt-0.5 flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Deal KPIs */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Deal Conversion Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dealKPIs.map((kpi) => (
                  <div key={kpi.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-sm font-bold text-foreground">{kpi.target}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Daily Command ────────────────────────────────────────────────── */}
        <TabsContent value="daily" className="space-y-4 mt-4">
          {dailyBlocks.map((block, i) => (
            <motion.div key={block.time} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <block.icon className={`h-4 w-4 ${block.color}`} />
                      {block.label}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono">{block.time}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1.5 mb-3">
                    {block.tasks.map((t, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-chart-1 mt-0.5 flex-shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="p-2 rounded-md bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-muted-foreground">
                      <strong className="text-foreground">KPI:</strong> {block.kpi}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Agent Scripts ────────────────────────────────────────────────── */}
        <TabsContent value="scripts" className="space-y-3 mt-4">
          {scripts.map((s, i) => (
            <motion.div key={s.stage} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">{s.stage}</span>
                      <Badge variant="outline" className="text-[10px]">{s.label}</Badge>
                    </div>
                    <button
                      onClick={() => copyText(s.script)}
                      className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                      title="Copy script"
                    >
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30 mb-2">
                    <p className="text-xs text-foreground leading-relaxed italic">{s.script}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    <strong>Tone:</strong> {s.tone}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Tracking ─────────────────────────────────────────────────────── */}
        <TabsContent value="tracking" className="mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Early Traction Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trackingMetrics.map((m) => (
                  <div key={m.metric} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                    <span className="text-xs font-medium text-foreground flex-1">{m.metric}</span>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-[9px] text-muted-foreground uppercase">Daily</p>
                        <p className="text-xs font-mono font-bold text-foreground">{m.daily}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] text-muted-foreground uppercase">Weekly</p>
                        <p className="text-xs font-mono font-bold text-foreground">{m.weekly}</p>
                      </div>
                      <Badge className={`text-[10px] border ${severityColor(m.status)}`}>{m.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Common Mistakes ──────────────────────────────────────────────── */}
        <TabsContent value="mistakes" className="space-y-3 mt-4">
          {mistakes.map((m, i) => (
            <motion.div key={m.mistake} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-destructive flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">{m.mistake}</span>
                    </div>
                    <Badge className={`text-[10px] border ${severityColor(m.severity)}`}>{m.severity}</Badge>
                  </div>
                  <div className="ml-6 p-2 rounded-md bg-chart-1/5 border border-chart-1/10">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-chart-1">Fix:</strong> {m.fix}
                    </p>
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

export default FirstTenDealsBlueprint;
