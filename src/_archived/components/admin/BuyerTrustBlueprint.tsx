
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Shield, Users, MessageSquare, TrendingUp, CheckCircle2, ArrowUpRight,
  Target, Zap, BarChart3, AlertTriangle, ShieldAlert, CalendarDays,
  Camera, Star, Heart, Eye, Clock, Copy, Phone, Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// ── Section 1: Buyer Trust ───────────────────────────────────────────────────
const trustMechanisms = [
  {
    area: 'Listing Verification Framework',
    icon: Shield,
    items: [
      'Verified badge: agent submits ID + business license → manual review → badge activated',
      'Minimum quality gate: 8+ photos, complete description, valid price before listing goes live',
      'Auto-reject listings with stock photos, duplicate content, or missing location data',
      'Agent identity indicator: "KYC Verified" badge with verification date displayed',
      '"Report Listing" button on every card — reviewed within 24 hours'
    ],
    impact: 'Verified listings receive 2.8x more inquiries than unverified'
  },
  {
    area: 'Transparency & Confidence Signals',
    icon: Eye,
    items: [
      'Price accuracy badge: "Price verified within last 30 days" indicator',
      'Agent response time displayed: "Avg. reply: 2 hours" on agent profile',
      'Real inquiry count: "12 people inquired this week" social proof',
      'Success story carousel: "Andi found his villa through Astra" with photo + quote',
      'Market data transparency: area price/sqm comparison shown on listing'
    ],
    impact: 'Trust signals increase inquiry form completion by 55%'
  },
  {
    area: 'Buyer Support Experience',
    icon: Heart,
    items: [
      '"We reply within 5 minutes" promise badge near inquiry form',
      'WhatsApp support button — persistent, bottom-right on all pages',
      '"How Property Buying Works" guide link on homepage and listing pages',
      '"Your data is protected" lock icon + microcopy near contact forms',
      'FAQ section: "Is this listing real?", "How do I schedule a viewing?"'
    ],
    impact: 'Support visibility reduces bounce rate by 35%'
  }
];

const trustKPIs = [
  { label: 'Inquiry Form Completion', target: '60%+', current: 25 },
  { label: 'Repeat Visitor Growth', target: '30%+', current: 15 },
  { label: 'Session Duration', target: '3min+', current: 30 },
  { label: 'Trust Badge CTR', target: '5%+', current: 10 }
];

// ── Section 2: Influencer Marketing ──────────────────────────────────────────
const influencerStrategy = [
  {
    category: 'Influencer Identification',
    icon: Users,
    tactics: [
      'Tier 1 (1K–10K): Local property agents with active Instagram/TikTok showing listings',
      'Tier 2 (10K–50K): Bali/Jakarta lifestyle vloggers covering living & investment topics',
      'Tier 3 (50K+): Architecture/design creators who can showcase premium properties',
      'Property photographers with strong visual portfolios and engaged audiences',
      'Expat community leaders who advise on relocation and property purchase'
    ],
    metric: 'Target: 5–10 micro-influencers in first month'
  },
  {
    category: 'Collaboration Concepts',
    icon: Camera,
    tactics: [
      '"Property Tour of the Week" — 60s Instagram Reel/TikTok walkthrough of hot listing',
      '"Would You Buy This?" — interactive poll story with property details + price reveal',
      '"Neighborhood Guide" — 3min video: best cafes, beaches, investment potential of district',
      '"Day in the Life" — influencer explores area, visits Astra-listed properties',
      '"Before & After" — renovation transformation of investment property'
    ],
    metric: 'Target: 2 content pieces per influencer per month'
  },
  {
    category: 'Campaign Amplification',
    icon: TrendingUp,
    tactics: [
      'Unique tracking link per influencer: astra.co/ref/[name] with UTM parameters',
      'Co-branded story templates with Astra logo for influencer to repost',
      'Referral bonus: Rp 500K per qualified inquiry from influencer content',
      'Feature top-performing influencer content on Astra homepage/social channels',
      'Monthly "Creator Spotlight" — celebrate best-performing influencer publicly'
    ],
    metric: 'Target: 200+ visits per influencer post, 3%+ inquiry rate'
  }
];

const influencerKPIs = [
  { label: 'Traffic per Collab', target: '200+', current: 20 },
  { label: 'Inquiry Spike', target: '3x baseline', current: 15 },
  { label: 'Brand Search Growth', target: '+20%/mo', current: 10 },
  { label: 'Cost per Inquiry', target: '<Rp 50K', current: 30 }
];

// ── Section 3: Follow-Up Scripts ─────────────────────────────────────────────
const followUpScripts = [
  {
    stage: 'Immediate Response (< 5 min)',
    icon: Zap,
    whatsapp: `Hi [Name]! 👋 Thank you for your interest in [Property Title] in [District].

Great news — this property is available for viewing! Would you like to schedule a visit this week?

I can arrange:
📅 Tomorrow or this weekend
⏰ Morning or afternoon

Just let me know your preferred time and I'll confirm immediately! 🏡`,
    phone: `"Hi [Name], this is [Agent] from Astra Property. I saw you were interested in [Property] — it's a fantastic property and still available. I'd love to help you schedule a viewing. Would [tomorrow/this weekend] work for you?"`,
    email: `Subject: Your inquiry: [Property Title] — Viewing available!

Hi [Name],

Thank you for your interest in [Property Title] in [District]. This property is currently available and we'd love to help you see it in person.

Would you be available for a viewing this [day]? I can arrange a convenient time that works for you.

Best regards,
[Agent Name] | Astra Property`,
    timing: 'Within 5 minutes of inquiry submission'
  },
  {
    stage: 'Warm Follow-Up (Same Day)',
    icon: MessageSquare,
    whatsapp: `Hi [Name], just following up on [Property Title] 🏠

A few things that make this property special:
✅ [Key benefit 1 — e.g., 8% rental yield]
✅ [Key benefit 2 — e.g., 5 min walk to beach]
✅ [Key benefit 3 — e.g., newly renovated]

Also, [X] other people have inquired about this property this week.

Would you like me to send you more photos or arrange a quick video call walkthrough? 📱`,
    phone: `"Hi [Name], I wanted to share some additional details about the property you liked. The area has seen 15% price growth this year, and this property is priced below the district average. We've had several other inquiries — shall I hold a viewing slot for you?"`,
    email: `Subject: More details on [Property Title] + market insights

Hi [Name],

I wanted to share some additional insights about [Property Title]:

• Current rental yield potential: [X]%
• Area price trend: +[X]% this year
• [X] inquiries received this week

I'd be happy to arrange a private viewing or video walkthrough at your convenience.

Best regards,
[Agent Name]`,
    timing: '4–6 hours after initial contact if no response'
  },
  {
    stage: 'Urgency Conversion (Next Day)',
    icon: Clock,
    whatsapp: `Hi [Name], quick update on [Property Title] 🔔

We've had [X] viewing requests for this property, and the owner is considering offers this week.

If you're interested, I'd recommend scheduling a viewing soon — I have slots available:
📅 [Date 1] at [Time]
📅 [Date 2] at [Time]

Shall I reserve one for you? No obligation — just a chance to see it before it's gone! 🏡`,
    phone: `"Hi [Name], just a quick heads-up — we've had strong interest in [Property] and the owner may finalize a deal soon. I don't want you to miss out. Can I schedule a 30-minute viewing for you this week? No pressure at all."`,
    email: `Subject: ⏰ [Property Title] — high demand update

Hi [Name],

Quick update: [Property Title] has received [X] viewing requests this week, and the owner is actively reviewing offers.

If you're still interested, I'd recommend scheduling a viewing soon. I have availability on [Date 1] and [Date 2].

Let me know and I'll confirm immediately.

Best regards,
[Agent Name]`,
    timing: 'Next morning if no viewing scheduled'
  }
];

const cadenceRules = [
  { rule: 'Initial reply within 5 minutes', priority: 'Critical' },
  { rule: 'Same-day warm follow-up at 4–6 hour mark', priority: 'High' },
  { rule: 'Next-day urgency message if no response', priority: 'High' },
  { rule: 'Day 3: "Similar properties" alternative suggestion', priority: 'Medium' },
  { rule: 'Day 7: Monthly market update inclusion', priority: 'Low' },
  { rule: 'After Day 7: move to nurture list (weekly digest)', priority: 'Low' }
];

// ── Section 4: Monitoring Checklist ──────────────────────────────────────────
const monitoringChecklist = [
  { item: 'Check inquiry form completion rate vs 60% target', category: 'Trust' },
  { item: 'Review agent average response time — flag >30 min', category: 'Response' },
  { item: 'Audit 3 listings for verification badge accuracy', category: 'Trust' },
  { item: 'Track influencer content performance — clicks & inquiries', category: 'Influencer' },
  { item: 'Send follow-up messages for all unanswered inquiries', category: 'Follow-Up' },
  { item: 'Monitor repeat visitor percentage trend', category: 'Engagement' },
  { item: 'Check "Report Listing" queue — resolve within 24h', category: 'Trust' },
  { item: 'Post daily social content (property tour or insight)', category: 'Content' },
  { item: 'Review buyer session duration trends', category: 'Engagement' },
  { item: 'Evening: note conversion wins and blockers', category: 'Execution' }
];

// ── Section 5: Reputation Risks ──────────────────────────────────────────────
const risks = [
  {
    signal: 'Inquiry form completion drops below 40%',
    action: 'Audit trust signals — add verification badges, support chat visibility, and "data protected" messaging',
    severity: 'Critical'
  },
  {
    signal: 'Average response time exceeds 30 minutes',
    action: 'Implement auto-reply with property details + expected response time. Call slow agents directly.',
    severity: 'Critical'
  },
  {
    signal: 'Fake listing reports exceed 3 per week',
    action: 'Tighten verification gate — require agent video call before listing approval. Public "0 tolerance" statement.',
    severity: 'Critical'
  },
  {
    signal: 'Influencer content generates views but zero inquiries',
    action: 'Fix CTA — add direct inquiry link in bio/caption. Test "DM us for details" vs landing page approach.',
    severity: 'High'
  },
  {
    signal: 'Buyer repeat visit rate stagnates below 15%',
    action: 'Improve saved property UX, add email alerts for price drops, and weekly "new listings" digest.',
    severity: 'Medium'
  }
];

const severityColor = (s: string) => {
  if (s === 'Critical') return 'bg-destructive/10 text-destructive border-destructive/20';
  if (s === 'High') return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
  return 'bg-primary/10 text-primary border-primary/20';
};

const categoryColor = (c: string) => {
  const map: Record<string, string> = {
    Trust: 'bg-chart-1/10 text-chart-1',
    Response: 'bg-chart-3/10 text-chart-3',
    Influencer: 'bg-chart-4/10 text-chart-4',
    'Follow-Up': 'bg-primary/10 text-primary',
    Engagement: 'bg-chart-5/10 text-chart-5',
    Content: 'bg-chart-2/10 text-chart-2',
    Execution: 'bg-muted-foreground/10 text-muted-foreground'
  };
  return map[c] || 'bg-muted/30 text-muted-foreground';
};

const priorityColor = (p: string) => {
  if (p === 'Critical') return 'bg-destructive/10 text-destructive';
  if (p === 'High') return 'bg-chart-3/10 text-chart-3';
  if (p === 'Medium') return 'bg-chart-4/10 text-chart-4';
  return 'bg-muted/30 text-muted-foreground';
};

const BuyerTrustBlueprint = () => {
  const [activeTab, setActiveTab] = useState('trust');
  const { toast } = useToast();

  const copyScript = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} script copied to clipboard` });
  };

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-chart-1/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Buyer Trust + Influencer Marketing + Follow-Up
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Trust assurance • Local influencer campaigns • Inquiry conversion scripts
                  </p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                Trust & Conversion
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="trust" className="text-xs">🛡️ Buyer Trust</TabsTrigger>
          <TabsTrigger value="influencer" className="text-xs">📣 Influencers</TabsTrigger>
          <TabsTrigger value="followup" className="text-xs">💬 Follow-Up</TabsTrigger>
          <TabsTrigger value="monitor" className="text-xs">📋 Monitoring</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs">⚠️ Risks</TabsTrigger>
        </TabsList>

        {/* ── Buyer Trust ─────────────────────────────────────────────────── */}
        <TabsContent value="trust" className="space-y-4 mt-4">
          {trustMechanisms.map((mech, i) => (
            <motion.div key={mech.area} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 hover:border-chart-1/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <mech.icon className="h-4 w-4 text-chart-1" />
                    {mech.area}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1.5 mb-3">
                    {mech.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-chart-1 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="p-2 rounded-md bg-chart-1/5 border border-chart-1/10">
                    <p className="text-[10px] text-chart-1 font-medium">📈 {mech.impact}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Trust KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {trustKPIs.map((kpi) => (
                  <div key={kpi.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-sm font-bold text-foreground mb-1">{kpi.target}</p>
                    <Progress value={kpi.current} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Influencer Marketing ────────────────────────────────────────── */}
        <TabsContent value="influencer" className="space-y-4 mt-4">
          {influencerStrategy.map((cat, i) => (
            <motion.div key={cat.category} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <cat.icon className="h-4 w-4 text-primary" />
                    {cat.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1.5 mb-3">
                    {cat.tactics.map((t, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ArrowUpRight className="h-3 w-3 text-chart-4 mt-0.5 flex-shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="p-2 rounded-md bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-primary font-medium">{cat.metric}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Influencer KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {influencerKPIs.map((kpi) => (
                  <div key={kpi.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-sm font-bold text-foreground mb-1">{kpi.target}</p>
                    <Progress value={kpi.current} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Follow-Up Scripts ────────────────────────────────────────────── */}
        <TabsContent value="followup" className="space-y-4 mt-4">
          {followUpScripts.map((script, i) => (
            <motion.div key={script.stage} {...fadeIn} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <script.icon className="h-4 w-4 text-primary" />
                      {script.stage}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">{script.timing}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {/* WhatsApp */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-chart-1 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> WhatsApp
                      </span>
                      <button
                        onClick={() => copyScript(script.whatsapp, 'WhatsApp')}
                        className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <pre className="p-3 rounded-md bg-chart-1/5 border border-chart-1/10 text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {script.whatsapp}
                    </pre>
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-chart-4 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Phone Call
                      </span>
                      <button
                        onClick={() => copyScript(script.phone, 'Phone')}
                        className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <pre className="p-3 rounded-md bg-chart-4/5 border border-chart-4/10 text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {script.phone}
                    </pre>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-chart-5 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email
                      </span>
                      <button
                        onClick={() => copyScript(script.email, 'Email')}
                        className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <pre className="p-3 rounded-md bg-chart-5/5 border border-chart-5/10 text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {script.email}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Cadence Rules */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Follow-Up Cadence Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cadenceRules.map((rule, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    <span className="text-xs text-muted-foreground">{rule.rule}</span>
                    <Badge className={`text-[10px] ${priorityColor(rule.priority)}`}>{rule.priority}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Monitoring ──────────────────────────────────────────────────── */}
        <TabsContent value="monitor" className="mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Buyer Engagement Performance Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {monitoringChecklist.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{item.item}</span>
                    </div>
                    <Badge className={`text-[10px] ${categoryColor(item.category)}`}>{item.category}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Risks ───────────────────────────────────────────────────────── */}
        <TabsContent value="risks" className="space-y-3 mt-4">
          {risks.map((r, i) => (
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

export default BuyerTrustBlueprint;
