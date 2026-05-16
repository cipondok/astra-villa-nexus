
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Users, MapPin, MessageSquare, Target, CheckCircle2,
  ArrowUpRight, Zap, Copy, TrendingUp, AlertTriangle,
  Bell, Mail, Phone, Clock, BarChart3, ShieldAlert
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

// ── Section 1: First 100 Buyers ──────────────────────────────────────────────
const buyerChannels = [
  {
    channel: 'Geo-Targeted Search Ads',
    budget: '40% of spend',
    tactics: [
      'Google Ads: "beli villa [district]", "investasi properti [city]"',
      'Landing pages per district with top 5 listings + inquiry CTA',
      'Retargeting pixel on all listing pages — 7-day remarketing window',
      'A/B test: "Hot Deals This Week" vs "Investment Opportunities"'
    ],
    expectedCPA: 'Rp 25K–50K per serious lead'
  },
  {
    channel: 'WhatsApp & Direct Outreach',
    budget: '20% of effort',
    tactics: [
      'Click-to-WhatsApp ads on Instagram/Facebook for hot listings',
      'Weekly "Top 5 Properties" broadcast to subscriber list',
      'Personal follow-up within 5 minutes of every inquiry',
      'Voice note property walkthroughs for high-value listings'
    ],
    expectedCPA: 'Rp 10K–25K per engaged lead'
  },
  {
    channel: 'Content & SEO',
    budget: '25% of effort',
    tactics: [
      'Blog: "Best areas to invest in [city] 2026" — long-tail SEO',
      'Instagram Reels: 60s property tours with price + yield data',
      'YouTube: "Property market update [district]" weekly series',
      'TikTok: Before/after renovation stories, price reveals'
    ],
    expectedCPA: 'Rp 5K–15K (organic, slower but compounds)'
  },
  {
    channel: 'Network & Referral',
    budget: '15% of effort',
    tactics: [
      'Referral reward: Rp 500K voucher for successful buyer introduction',
      'Partner with mortgage brokers — shared lead exchange',
      'Relocation agent partnerships for expat buyer traffic',
      'Social sharing: "Share this listing" with tracking links'
    ],
    expectedCPA: 'Rp 15K–30K per qualified referral'
  }
];

const buyerKPIs = [
  { label: 'Serious Signups/Day', target: '5+', current: 0 },
  { label: 'Inquiry Conversion', target: '15%+', current: 0 },
  { label: 'Repeat Visit Rate', target: '30%+', current: 0 },
  { label: 'WhatsApp Response <5min', target: '90%+', current: 0 }
];

// ── Section 2: District Domination ───────────────────────────────────────────
const dominationPhases = [
  {
    phase: 'Week 1–2: Supply Saturation',
    actions: [
      'Map every active agent in target district — contact ALL of them',
      'Secure 50+ listings across villa, apartment, land categories',
      'Ensure coverage: Rp 500M–5B price range minimum',
      'Personally quality-check every listing: photos, pricing, description accuracy',
      'Import any missing listings by assisting agents with uploads'
    ]
  },
  {
    phase: 'Week 3–4: Visibility Takeover',
    actions: [
      'Launch district landing page: "/invest/[district-name]"',
      'Run "Top Properties in [District]" social media campaign (3x/week)',
      'Publish district market insight: avg prices, demand trends, yield data',
      'SEO-optimize for "[district] property for sale" and investment keywords',
      'Add "🔥 [X] people viewed this week" badges on high-traffic listings'
    ]
  },
  {
    phase: 'Week 5–6: Liquidity Lock',
    actions: [
      'Highlight "10 new listings this week in [district]" on homepage',
      'Share first closed deal story: "[Agent] sold via Astra in 3 weeks"',
      'Push vendor upgrades: "Your listing got 15 views — boost for more?"',
      'Reach 70%+ of active district listings on platform',
      'Start replicating playbook to adjacent district'
    ]
  }
];

const dominationKPIs = [
  { label: 'District Listings Share', target: '70%+' },
  { label: 'Inquiry Volume vs Competitors', target: '2x leader' },
  { label: 'Active Agents in District', target: '80%+ onboarded' },
  { label: 'Weekly New Listings', target: '10+ per week' }
];

// ── Section 3: Vendor Follow-Up Scripts ──────────────────────────────────────
const followUpScripts = [
  {
    type: 'Immediate Inquiry Alert',
    trigger: 'New buyer inquiry on vendor listing',
    whatsapp: '🔔 Hi [Agent]! A serious buyer just inquired about your listing at [Property Address]. They\'re looking to schedule a viewing this week. Can you respond within the next hour? Here\'s their message: "[Inquiry Preview]"',
    email: 'Subject: New Buyer Inquiry — [Property Address]\n\nHi [Agent], a qualified buyer has just submitted an inquiry for your listing. Quick response = higher close rate. Click here to view and respond.',
    notification: '🔔 New inquiry on [Property] — respond now for best conversion'
  },
  {
    type: 'Daily Performance Summary',
    trigger: 'Automated at 6 PM daily',
    whatsapp: '📊 Today\'s Astra Report for [Agent]:\n• Views: [X] (+[Y]% vs yesterday)\n• Inquiries: [X]\n• Top listing: [Property] — [X] views\n\nTip: Listings with updated photos get 3x more views. Need help? Reply here!',
    email: 'Subject: Your Daily Astra Performance\n\nHi [Agent], here\'s your daily snapshot. [X] total views, [Y] inquiries. Your best performer: [Property]. Consider boosting it for premium visibility.',
    notification: '📊 Daily report: [X] views, [Y] inquiries — view details'
  },
  {
    type: 'Weekly Growth Opportunity',
    trigger: 'Automated Monday 9 AM',
    whatsapp: '🚀 Weekly Update [Agent]!\n\nBuyers are searching for [Property Type] in [District] — we have [X] active searches with no matching listings.\n\nDo you have any [Property Type] to list? Early listings get maximum exposure. Send details and we\'ll upload for you!',
    email: 'Subject: Buyers Searching in Your Area — Supply Gap Alert\n\nHi [Agent], we\'ve detected [X] active buyer searches for [Property Type] in [District] with limited supply. List now to capture this demand.',
    notification: '🚀 Supply gap detected in [District] — list now for premium exposure'
  },
  {
    type: 'Top Performer Recognition',
    trigger: 'Weekly for top 10% agents',
    whatsapp: '🏆 Congratulations [Agent]! You\'re a Top Performer this week on Astra:\n• [X] inquiries received\n• [Y] viewings booked\n• Ranked #[Z] in [District]\n\nAs a reward, your next listing gets FREE premium boost for 7 days! 🎉',
    email: 'Subject: 🏆 You\'re a Top Astra Agent This Week!\n\nHi [Agent], your performance puts you in the top 10%. Enjoy a free premium boost on your next listing.',
    notification: '🏆 Top performer! Free boost reward unlocked'
  },
  {
    type: 'Inactive Agent Reactivation',
    trigger: '7 days with no listing activity',
    whatsapp: 'Hi [Agent], we noticed you haven\'t been active on Astra recently. Meanwhile, buyer traffic in [District] is up [X]% this week!\n\nWe have [Y] buyers looking for properties like yours. Want me to help upload your latest listings? Just send photos + details here 📸',
    email: 'Subject: Your Buyers Are Waiting — [X]% Traffic Increase in [District]\n\nHi [Agent], buyer demand in your area is growing. Re-activate your listings to capture these leads.',
    notification: '📈 [District] traffic up [X]% — re-list to capture demand'
  }
];

// ── Section 4: Daily Monitoring ──────────────────────────────────────────────
const dailyChecklist = [
  { item: 'Check all overnight inquiries — respond before 9 AM', done: false },
  { item: 'Review new listings added — flag quality issues', done: false },
  { item: 'Contact 5 new agents in target district', done: false },
  { item: 'Post 1 "hot property" on social media', done: false },
  { item: 'Follow up on all active deal negotiations', done: false },
  { item: 'Send daily performance summary to top 10 agents', done: false },
  { item: 'Review ad spend ROI — pause underperforming campaigns', done: false },
  { item: 'Schedule 2+ viewings for serious buyers', done: false },
  { item: 'Update district listings count vs target', done: false },
  { item: 'Evening reflection: wins, blockers, tomorrow\'s priority', done: false }
];

// ── Section 5: Risk Signals ──────────────────────────────────────────────────
const riskSignals = [
  {
    signal: 'Buyer signups plateau below 3/day',
    action: 'Shift ad budget to highest-converting channel; test new creatives',
    severity: 'Critical'
  },
  {
    signal: 'Inquiry response time exceeds 30 minutes',
    action: 'Set up instant WhatsApp auto-reply + personal follow-up within 15 min',
    severity: 'Critical'
  },
  {
    signal: 'District listings share drops below 50%',
    action: 'Aggressive agent outreach blitz — offer free premium visibility',
    severity: 'High'
  },
  {
    signal: 'Vendor activity drops >3 days inactive',
    action: 'Trigger reactivation script + personal call from founder',
    severity: 'High'
  },
  {
    signal: 'Low listing quality dragging inquiry rates',
    action: 'Offer free photo improvement service; reject below-standard uploads',
    severity: 'Medium'
  }
];

const severityColor = (s: string) => {
  if (s === 'Critical') return 'bg-destructive/10 text-destructive border-destructive/20';
  if (s === 'High') return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
  return 'bg-primary/10 text-primary border-primary/20';
};

const First100BuyersBlueprint = () => {
  const [activeTab, setActiveTab] = useState('buyers');

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-chart-1/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    First 100 Buyers + District Domination Blueprint
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Buyer acquisition • Hyper-local domination • Vendor follow-up automation
                  </p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                Growth Activation
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="buyers" className="text-xs">👥 100 Buyers</TabsTrigger>
          <TabsTrigger value="district" className="text-xs">📍 District Dom</TabsTrigger>
          <TabsTrigger value="followup" className="text-xs">💬 Vendor Scripts</TabsTrigger>
          <TabsTrigger value="daily" className="text-xs">📋 Daily Check</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">⚠️ Risk Signals</TabsTrigger>
        </TabsList>

        {/* ── 100 Buyers ──────────────────────────────────────────────────── */}
        <TabsContent value="buyers" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buyerChannels.map((ch, i) => (
              <motion.div key={ch.channel} {...fadeIn} transition={{ delay: i * 0.05 }}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-foreground">{ch.channel}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">{ch.budget}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1.5 mb-3">
                      {ch.tactics.map((t, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowUpRight className="h-3 w-3 text-chart-1 mt-0.5 flex-shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div className="p-2 rounded-md bg-chart-1/5 border border-chart-1/10">
                      <p className="text-[10px] text-muted-foreground">
                        <strong className="text-chart-1">Expected CPA:</strong> {ch.expectedCPA}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Buyer Acquisition KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {buyerKPIs.map((kpi) => (
                  <div key={kpi.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-sm font-bold text-foreground">{kpi.target}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── District Domination ──────────────────────────────────────────── */}
        <TabsContent value="district" className="space-y-4 mt-4">
          {dominationPhases.map((phase, i) => (
            <motion.div key={phase.phase} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 hover:border-chart-1/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-chart-1" />
                    {phase.phase}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1.5">
                    {phase.actions.map((a, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-chart-1 mt-0.5 flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                District Domination KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dominationKPIs.map((kpi) => (
                  <div key={kpi.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-sm font-bold text-foreground">{kpi.target}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Vendor Follow-Up Scripts ─────────────────────────────────────── */}
        <TabsContent value="followup" className="space-y-3 mt-4">
          {followUpScripts.map((s, i) => (
            <motion.div key={s.type} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{s.type}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{s.trigger}</Badge>
                  </div>
                  <div className="space-y-2">
                    {/* WhatsApp */}
                    <div className="p-3 rounded-lg bg-chart-1/5 border border-chart-1/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-chart-1 uppercase flex items-center gap-1">
                          <Phone className="h-3 w-3" /> WhatsApp
                        </span>
                        <button onClick={() => copyText(s.whatsapp)} className="p-1 rounded hover:bg-muted/50">
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{s.whatsapp}</p>
                    </div>
                    {/* Notification */}
                    <div className="p-2 rounded-md bg-muted/30 border border-border/30 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Bell className="h-3 w-3" /> Dashboard: {s.notification}
                      </span>
                      <button onClick={() => copyText(s.notification)} className="p-1 rounded hover:bg-muted/50">
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* ── Daily Checklist ──────────────────────────────────────────────── */}
        <TabsContent value="daily" className="mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Daily Traction Monitoring Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dailyChecklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{item.item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Risk Signals ─────────────────────────────────────────────────── */}
        <TabsContent value="risks" className="space-y-3 mt-4">
          {riskSignals.map((r, i) => (
            <motion.div key={r.signal} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-chart-3 flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">{r.signal}</span>
                    </div>
                    <Badge className={`text-[10px] border ${severityColor(r.severity)}`}>{r.severity}</Badge>
                  </div>
                  <div className="ml-6 p-2 rounded-md bg-chart-1/5 border border-chart-1/10">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-chart-1">Action:</strong> {r.action}
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

export default First100BuyersBlueprint;
