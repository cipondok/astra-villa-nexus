
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UserCheck, Star, Map, ClipboardCheck, AlertTriangle, Copy, Check, Target, TrendingUp, Zap, Filter, Award, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const anim = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

const CopyBlock = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="text-xs bg-muted/50 border border-border/40 rounded-lg p-3 whitespace-pre-wrap font-mono">{text}</pre>
      <Button size="icon-sm" variant="ghost" className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); toast.success('Copied'); setTimeout(() => setCopied(false), 1500); }}>
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
};

const buyerQualification = {
  signals: [
    { issue: 'High volume of casual/unqualified inquiries', impact: 94, fix: 'Add intent-qualifying questions to inquiry form before routing to agent' },
    { issue: 'Buyers uncertain about budget range', impact: 87, fix: 'Require budget range selection + financing status in inquiry flow' },
    { issue: 'Low follow-through after initial inquiry', impact: 81, fix: 'Automated nurture sequence with 3-touch follow-up within 72hrs' },
    { issue: 'Viewing no-shows from unqualified leads', impact: 76, fix: 'Confirmation + deposit hold for premium viewings; 2-step booking' },
  ],
  intentTiers: [
    { tier: '🔴 Hot (Score 80–100)', criteria: 'Budget confirmed, financing ready, viewing scheduled, repeat browser', routing: 'Immediate agent routing — <5min response SLA', share: '15%' },
    { tier: '🟡 Warm (Score 50–79)', criteria: 'Budget range given, browsing 3+ listings, inquiry submitted', routing: 'Same-day follow-up — nurture toward viewing', share: '35%' },
    { tier: '🔵 Cool (Score 20–49)', criteria: 'Browsing casually, no budget info, single listing view', routing: 'Automated drip — weekly property alerts', share: '35%' },
    { tier: '⚪ Cold (Score 0–19)', criteria: 'Single visit, no engagement, no inquiry action', routing: 'Passive retargeting ads only', share: '15%' },
  ],
  qualificationQuestions: [
    { question: 'What is your budget range?', options: ['< Rp 500M', 'Rp 500M – 1B', 'Rp 1B – 3B', 'Rp 3B+'], purpose: 'Budget clarity' },
    { question: 'When do you plan to purchase?', options: ['Within 1 month', '1–3 months', '3–6 months', 'Just exploring'], purpose: 'Timeline urgency' },
    { question: 'How will you finance?', options: ['Cash/full payment', 'KPR/mortgage', 'Installment', 'Not sure yet'], purpose: 'Financing readiness' },
    { question: 'What type of property?', options: ['House/Villa', 'Apartment', 'Land', 'Commercial'], purpose: 'Intent specificity' },
  ],
  engagementWorkflow: [
    { segment: 'Hot Leads', actions: ['Instant WhatsApp from assigned agent', 'Same-day viewing offer', 'Pre-viewing property brief sent', 'Fair price range shared'], sla: '<5 min' },
    { segment: 'Warm Leads', actions: ['Personalized follow-up within 4hrs', 'Curated 3-property shortlist', 'Financing calculator link', 'Weekly market update enrollment'], sla: '<4 hrs' },
    { segment: 'Cool Leads', actions: ['Weekly automated property alerts', 'Monthly market insight email', 'Retargeting ads with viewed listings', 'Re-engagement after 30 days'], sla: 'Automated' },
  ],
  kpis: [
    { metric: 'Serious Buyer Ratio', target: '≥30% of all inquiries', current: '12%' },
    { metric: 'Viewing Request Rate', target: '≥40% of qualified leads', current: '18%' },
    { metric: 'Offer Intent Frequency', target: '≥20% of viewers', current: '8%' },
    { metric: 'Qualification Form Completion', target: '≥60%', current: '0%' },
  ],
};

const topAgentPartnership = {
  identificationCriteria: [
    { factor: 'Response Time Performance', weight: 25, benchmark: 'Avg <5min for 80%+ of leads' },
    { factor: 'Listing Volume & Quality', weight: 25, benchmark: '10+ active listings, avg quality score ≥7/10' },
    { factor: 'Inquiry Conversion Rate', weight: 25, benchmark: '≥25% inquiry-to-viewing' },
    { factor: 'Deal Closing Track Record', weight: 25, benchmark: '≥3 closed deals via platform' },
  ],
  partnershipTiers: [
    { tier: 'Gold Partner', threshold: 'Score ≥85', benefits: ['Priority hot lead routing (first access)', 'Free Spotlight listing (1/month)', 'Co-branded social media feature', 'Quarterly revenue-share bonus'], agents: 'Top 5%' },
    { tier: 'Silver Partner', threshold: 'Score 70–84', benefits: ['Priority lead routing (2nd tier)', 'Discounted Premium listings (50% off)', 'Monthly performance insights report', 'Featured agent badge on profile'], agents: 'Top 15%' },
    { tier: 'Bronze Partner', threshold: 'Score 55–69', benefits: ['Standard lead rotation + coaching', 'Access to training resources', 'Performance improvement roadmap', 'Pathway to Silver promotion'], agents: 'Top 30%' },
  ],
  outreachScript: `Pak/Bu [Agent Name],

Selamat! 🎉 Berdasarkan performa Anda di ASTRA Villa, kami mengundang Anda menjadi [Gold/Silver] Partner Agent.

📊 Performa Anda:
• Response time: [X] min (top [Y]%)
• Inquiry conversion: [X]%
• Deals closed: [X] via platform
• Listing quality score: [X]/10

🏆 Benefit [Gold/Silver] Partner:
• Priority akses ke hot leads berkualitas tinggi
• [Benefit spesifik tier]
• Co-branding & featured agent spotlight
• Quarterly performance review & growth planning

Sebagai partner, kami juga mengundang Anda untuk:
✅ Exclusive listing agreement untuk area [District]
✅ Meeting bulanan untuk market insights sharing
✅ Early access fitur baru platform

Apakah Bapak/Ibu bersedia meeting 30 menit minggu ini untuk membahas partnership ini?

Salam hangat,
[Your Name] — ASTRA Villa Partnership Team`,
  retentionStrategy: [
    'Monthly 1-on-1 performance review call (15 min)',
    'Quarterly partnership renewal with upgraded benefits',
    'Exclusive market data sharing (district trends, buyer behavior)',
    'Revenue-share bonus: 5% of platform fee from partner-closed deals',
    'Annual "Top Partner" award ceremony + social media recognition',
  ],
  kpis: [
    { metric: 'Deal Closure per Top Agent', target: '≥5/quarter' },
    { metric: 'Exclusive Listing Inventory', target: '≥20% of total' },
    { metric: 'Partner Retention Rate', target: '≥90% annual' },
    { metric: 'Partner NPS Score', target: '≥8/10' },
  ],
};

const liquidityHeatmap = {
  insightContent: [
    {
      type: 'Weekly Demand Heatmap Post',
      template: `🗺️ PETA DEMAND PROPERTI [CITY]
Minggu ke-[X], [Month] 2026

🔴 SANGAT TINGGI:
• [District A] — [X] inquiry/listing, harga naik [Y]%
• [District B] — [X] inquiry/listing, stok menipis

🟡 SEDANG:
• [District C] — permintaan stabil, harga datar
• [District D] — potensi naik, infrastruktur baru

🟢 PELUANG:
• [District E] — harga masih rendah, demand mulai naik
• [District F] — under-the-radar, ROI potential tinggi

💡 Insight: Buyer paling aktif mencari [property type] di range Rp [X]–[Y]

👉 Explore properti di area trending: [link]

#ASTRAVilla #PropertyHeatmap #[City]`,
      channel: 'Instagram carousel + Blog',
    },
    {
      type: 'Buyer Opportunity Alert',
      template: `🎯 ALERT: Peluang di [District]!

📊 Data ASTRA Villa menunjukkan:
• Harga [X]% di bawah rata-rata area sekitar
• Demand buyer meningkat [Y]% dalam 30 hari
• Hanya [Z] listing tersedia — supply terbatas

🏠 Rekomendasi properti:
1. [Property] — Rp [Price] | [X] views minggu ini
2. [Property] — Rp [Price] | [X] inquiries
3. [Property] — Rp [Price] | Baru listing

⏰ Window of opportunity: sebelum harga menyesuaikan

👉 Lihat semua: [link]`,
      channel: 'WhatsApp broadcast + Email',
    },
  ],
  vendorSignals: [
    { signal: 'High-demand district with low listings', action: 'Alert agents: "Demand tinggi di [District] — upload listing Anda untuk exposure maksimal"', frequency: 'Real-time' },
    { signal: 'Price undercut opportunity detected', action: 'Suggest: "Listing Anda di bawah market — pertimbangkan naikkan harga 5-8%"', frequency: 'Weekly' },
    { signal: 'Category gap in trending area', action: 'Recruit: "Kami butuh listing [type] di [District] — early-mover visibility bonus"', frequency: 'Bi-weekly' },
    { signal: 'Viewing velocity spike', action: 'Notify: "Area [District] sedang hot — [X] viewings dijadwalkan minggu ini"', frequency: 'Daily' },
  ],
  buyerGuidance: [
    { scenario: 'Buyer browsing saturated district', message: 'Area ini sangat kompetitif — pertimbangkan juga [adjacent district] dengan harga 15% lebih rendah', goal: 'Redistribute demand' },
    { scenario: 'Buyer viewing slow-moving listing', message: 'Properti ini sudah [X] hari di market — posisi negosiasi Anda kuat', goal: 'Empower negotiation' },
    { scenario: 'Buyer in high-demand zone', message: '[X] buyer lain juga tertarik area ini minggu ini — bertindak cepat untuk prioritas', goal: 'Create urgency' },
    { scenario: 'Buyer exploring new district', message: 'Area ini sedang naik — harga masih di bawah rata-rata tetangga [X]%', goal: 'Build confidence' },
  ],
  kpis: [
    { metric: 'Heatmap Content Engagement', target: '≥7% interaction rate' },
    { metric: 'Listing Uploads in Hot Zones', target: '+25% after signal' },
    { metric: 'Buyer Cross-District Exploration', target: '≥30% explore 2+ districts' },
    { metric: 'Signal-to-Action Conversion', target: '≥15% act within 48hrs' },
  ],
};

const weeklyChecklist = [
  { category: 'Buyer Qualification', items: ['Review intent score distribution', 'Audit qualification form completion rate', 'Check hot-lead response SLA compliance', 'Analyze viewing-to-offer funnel drop-offs'] },
  { category: 'Agent Partnerships', items: ['Score top agent performance rankings', 'Follow up on pending partnership invitations', 'Send monthly performance reports to partners', 'Process revenue-share bonus calculations'] },
  { category: 'Liquidity Intelligence', items: ['Publish weekly demand heatmap', 'Send vendor demand signals to agents', 'Update district supply-demand ratios', 'Track heatmap content engagement metrics'] },
  { category: 'Ecosystem Health', items: ['Monitor serious-to-casual buyer ratio trend', 'Check partner agent churn risk signals', 'Review demand imbalance hotspots', 'Audit data accuracy in heatmap signals'] },
];

const risks = [
  { signal: 'Qualification form causing inquiry drop-off >40%', severity: 92, mitigation: 'Reduce to 2 essential questions; make optional fields progressive; A/B test minimal form' },
  { signal: 'Top agents receiving disproportionate leads (>50%)', severity: 85, mitigation: 'Cap max lead share at 35%; ensure baseline allocation for all active agents' },
  { signal: 'Heatmap data perceived as manipulative', severity: 88, mitigation: 'Show methodology transparently; use verified transaction data only; add confidence intervals' },
  { signal: 'Partner agents listing exclusively elsewhere', severity: 80, mitigation: 'Strengthen exclusive listing incentives; demonstrate superior lead quality with data' },
  { signal: 'Demand signals creating artificial urgency', severity: 76, mitigation: 'Use factual language only; avoid inflated numbers; comply with consumer protection standards' },
];

const BuyerQualificationBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><UserCheck className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Buyer Qualification + Top Agent Partners + Liquidity Heatmap</h2>
          <p className="text-sm text-muted-foreground">Demand quality, agent excellence & market transparency intelligence</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="qualification" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="qualification"><Filter className="h-4 w-4 mr-1.5" />Buyer Qualification</TabsTrigger>
        <TabsTrigger value="partners"><Star className="h-4 w-4 mr-1.5" />Top Agents</TabsTrigger>
        <TabsTrigger value="heatmap"><Map className="h-4 w-4 mr-1.5" />Liquidity Heatmap</TabsTrigger>
        <TabsTrigger value="weekly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Weekly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* QUALIFICATION TAB */}
      <TabsContent value="qualification" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Demand Quality Issues</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {buyerQualification.signals.map((s, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{s.issue}</span><Badge variant="outline" className="text-[10px]">{s.impact}%</Badge></div>
                    <Progress value={s.impact} className="h-1.5" />
                    <p className="text-[11px] text-muted-foreground">→ {s.fix}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Qualification KPIs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {buyerQualification.kpis.map((k, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30">
                    <span className="text-xs font-medium text-foreground">{k.metric}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge>
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">→ {k.target}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-chart-3" />Intent Segmentation Tiers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {buyerQualification.intentTiers.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{t.tier}</span>
                    <Badge variant="outline" className="text-[10px]">{t.share} of traffic</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1">Criteria: {t.criteria}</p>
                  <p className="text-[11px] text-primary">→ {t.routing}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Qualification Questions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {buyerQualification.qualificationQuestions.map((q, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{q.question}</span>
                      <Badge variant="outline" className="text-[10px]">{q.purpose}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {q.options.map((o, j) => (
                        <Badge key={j} className="text-[10px] bg-primary/5 text-primary border-primary/15">{o}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(5)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Engagement Workflow by Segment</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {buyerQualification.engagementWorkflow.map((w, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-foreground">{w.segment}</span>
                      <Badge variant={w.sla === '<5 min' ? 'destructive' : 'outline'} className="text-[10px]">SLA: {w.sla}</Badge>
                    </div>
                    <ul className="space-y-1">
                      {w.actions.map((a, j) => (
                        <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5"><span className="text-primary">▸</span>{a}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </TabsContent>

      {/* TOP AGENTS TAB */}
      <TabsContent value="partners" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4 text-chart-3" />Identification Criteria</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {topAgentPartnership.identificationCriteria.map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{c.factor}</span><Badge variant="outline" className="text-[10px]">{c.weight}%</Badge></div>
                    <Progress value={c.weight * 4} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground">Benchmark: {c.benchmark}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-primary" />Partnership Tiers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {topAgentPartnership.partnershipTiers.map((t, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{t.tier}</span>
                      <div className="flex gap-1.5">
                        <Badge variant="outline" className="text-[10px]">{t.threshold}</Badge>
                        <Badge className="text-[10px] bg-chart-1/10 text-chart-1 border-chart-1/20">{t.agents}</Badge>
                      </div>
                    </div>
                    <ul className="space-y-0.5 mt-1">
                      {t.benefits.map((b, j) => (
                        <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5"><span className="text-primary">✓</span>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Partnership Invitation Script (Bahasa Indonesia)</CardTitle></CardHeader>
            <CardContent><CopyBlock text={topAgentPartnership.outreachScript} /></CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-chart-1" />Retention Strategy</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topAgentPartnership.retentionStrategy.map((s, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10"><span className="text-primary">▸</span>{s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(5)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Partnership KPIs</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {topAgentPartnership.kpis.map((k, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
                    <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                    <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </TabsContent>

      {/* HEATMAP TAB */}
      <TabsContent value="heatmap" className="space-y-4">
        {liquidityHeatmap.insightContent.map((c, i) => (
          <motion.div key={i} {...anim(i + 1)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{c.type}</CardTitle>
                  <Badge variant="outline" className="text-[10px]">{c.channel}</Badge>
                </div>
              </CardHeader>
              <CardContent><CopyBlock text={c.template} /></CardContent>
            </Card>
          </motion.div>
        ))}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(3)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-chart-3" />Vendor Demand Signals</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {liquidityHeatmap.vendorSignals.map((s, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{s.signal}</span>
                      <Badge variant="outline" className="text-[10px]">{s.frequency}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">→ {s.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(4)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Map className="h-4 w-4 text-primary" />Buyer Guidance Messages</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {liquidityHeatmap.buyerGuidance.map((g, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{g.scenario}</span>
                      <Badge variant="outline" className="text-[10px]">{g.goal}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">"{g.message}"</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(5)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Heatmap Intelligence KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {liquidityHeatmap.kpis.map((k, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* WEEKLY CHECK TAB */}
      <TabsContent value="weekly" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeklyChecklist.map((cat, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">{cat.category}</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {cat.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-4 w-4 rounded border border-border/60 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </TabsContent>

      {/* RISKS TAB */}
      <TabsContent value="risks" className="space-y-4">
        {risks.map((r, i) => (
          <motion.div key={i} {...anim(i + 1)}>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${r.severity >= 85 ? 'text-destructive' : 'text-chart-3'}`} />
                    <span className="text-sm font-medium text-foreground">{r.signal}</span>
                  </div>
                  <Badge variant={r.severity >= 85 ? 'destructive' : 'outline'} className="text-[10px]">{r.severity}%</Badge>
                </div>
                <Progress value={r.severity} className="h-1.5 mb-2" />
                <p className="text-xs text-muted-foreground">⚡ {r.mitigation}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </TabsContent>
    </Tabs>
  </div>
);

export default BuyerQualificationBlueprint;
