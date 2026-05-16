
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Scale, Users, Megaphone, ClipboardCheck, AlertTriangle, Copy, Check, Target, TrendingUp, BarChart3, Zap, MessageSquare } from 'lucide-react';
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

const negotiationSystem = {
  frictionPoints: [
    { issue: 'Price expectation gap (seller vs buyer)', impact: 94, fix: 'Show AI-driven comparable data + recent sold prices in area' },
    { issue: 'Slow seller/agent communication', impact: 87, fix: 'Auto-escalation after 4hr silence; assign deal coordinator' },
    { issue: 'No comparable market context', impact: 79, fix: 'Auto-attach area price range + demand heatmap to every offer' },
    { issue: 'Buyer unclear on next steps', impact: 72, fix: 'Step-by-step offer wizard with progress tracker' },
  ],
  pricingGuidance: [
    '📊 Auto-generate CMA (Comparative Market Analysis) for listing area',
    '🔥 Show demand intensity: "X inquiries in 7 days" alongside price',
    '📈 Display price trend: "Area avg +8% YoY — competitive window"',
    '💡 Suggest negotiation range: "Fair offer zone: Rp X – Rp Y"',
  ],
  communicationFlow: [
    { stage: 'Post-Viewing (0–2hr)', action: 'Send buyer feedback form + agent thank-you note', tone: 'warm' },
    { stage: 'Interest Signal (2–24hr)', action: '"Would you like to explore an offer?" — soft prompt', tone: 'neutral' },
    { stage: 'Offer Submitted', action: 'Confirm receipt to both parties + set 48hr response window', tone: 'professional' },
    { stage: 'Counter-Offer', action: 'Present counter with data context + suggest compromise zone', tone: 'mediating' },
    { stage: 'Stalled (72hr+)', action: 'Escalate: "Both parties close — shall we bridge the gap?"', tone: 'urgent' },
    { stage: 'Agreement', action: 'Instant confirmation + next-steps checklist (legal, payment)', tone: 'celebratory' },
  ],
  momentumScripts: {
    competingInterest: `Pak/Bu [Buyer Name],

Terima kasih atas minat Anda pada [Property Name].

📊 Update: Properti ini mendapat [X] inquiry minggu ini, dan [Y] viewing sudah dijadwalkan.

Jika Anda serius, kami sarankan untuk submit penawaran dalam 48 jam ke depan agar posisi Anda diprioritaskan.

Kami siap bantu proses offer — tinggal reply pesan ini.

Salam,
Tim ASTRA Villa`,
    digitalOffer: `📋 FORMULIR PENAWARAN DIGITAL

Properti: [Property Name]
Harga Listing: Rp [Price]
Penawaran Anda: Rp [___]
Metode Pembayaran: [ ] Cash  [ ] KPR  [ ] Bertahap
Timeline Closing: [ ] 30 hari  [ ] 60 hari  [ ] 90 hari
Catatan Tambahan: [___]

Dengan submit ini, saya menyatakan minat serius untuk membeli properti di atas.

✅ Submit → Tim kami akan konfirmasi dalam 2 jam.`,
  },
  kpis: [
    { metric: 'Viewing-to-Offer Rate', target: '≥25%', current: '10%' },
    { metric: 'Negotiation Cycle Duration', target: '<7 days', current: '18 days' },
    { metric: 'Deal Closure Success', target: '≥40% of offers', current: '15%' },
    { metric: 'Platform Mediation Usage', target: '≥60% of deals', current: '0%' },
  ],
};

const leadDistribution = {
  scoringWeights: [
    { factor: 'Response Time (<5min = 100pts)', weight: 30, icon: '⚡' },
    { factor: 'Inquiry Conversion History', weight: 25, icon: '📈' },
    { factor: 'Listing Quality Score', weight: 20, icon: '🏠' },
    { factor: 'Active Listing Volume', weight: 15, icon: '📋' },
    { factor: 'Platform Tenure & Loyalty', weight: 10, icon: '⭐' },
  ],
  rotationModel: [
    { tier: 'New Agents (0–30 days)', allocation: 'Equal rotation baseline — guaranteed minimum leads', color: 'chart-1' },
    { tier: 'Proven Performers (Score >70)', allocation: 'Priority routing — 2x lead volume + hot leads access', color: 'primary' },
    { tier: 'Average Performers (Score 40–70)', allocation: 'Standard rotation — performance coaching offered', color: 'chart-3' },
    { tier: 'Inactive/Low (Score <40)', allocation: 'Reduced routing — reactivation prompt sent after 7 days', color: 'destructive' },
  ],
  dashboardMetrics: [
    'Real-time lead allocation count (today/week/month)',
    'Response time ranking vs peers',
    'Conversion rate trend chart',
    'Upcoming lead queue preview',
    'Performance score breakdown with improvement tips',
  ],
  fairnessKpis: [
    { metric: 'Agent Satisfaction Score', target: '≥4.2/5' },
    { metric: 'Lead Response Speed (avg)', target: '<5 min' },
    { metric: 'Vendor Retention Rate', target: '≥85%' },
    { metric: 'Lead Dispute Rate', target: '<3%' },
  ],
};

const districtPR = {
  campaigns: [
    {
      name: 'Dominance Declaration',
      actions: [
        '"#1 property platform in [District]" — social media banner campaign',
        'Infographic: "[X] active listings • [Y] inquiries • [Z] viewings this month"',
        'Google Ads: "[District] properties — browse [X]+ verified listings"',
      ],
      timeline: 'Week 1–2',
    },
    {
      name: 'Community Authority',
      actions: [
        'Host free "Property Investment 101" meetup at local co-working space',
        'Collaborate with 3 local property bloggers for listing reviews',
        'Sponsor local business community newsletter with market insights',
      ],
      timeline: 'Week 2–4',
    },
    {
      name: 'Social Proof Cascade',
      actions: [
        'Video testimonials: 3 agents + 2 buyers sharing platform experience',
        '"Deal of the Week" recurring Instagram/TikTok series',
        'WhatsApp broadcast: weekly district market update to buyer list',
      ],
      timeline: 'Week 3–6',
    },
    {
      name: 'Media & SEO Lock-In',
      actions: [
        'Pitch local news: "How digital platforms are changing [District] property market"',
        'Launch SEO landing page: "Best Properties in [District] 2026"',
        'Monthly district price index report — shareable PDF + social graphics',
      ],
      timeline: 'Week 4–8',
    },
  ],
  prScript: `PRESS RELEASE DRAFT

ASTRA Villa Menjadi Platform Properti Digital Paling Aktif di [District]

[City], [Date] — ASTRA Villa, platform marketplace properti berbasis intelligence, mengumumkan pencapaian sebagai platform properti digital dengan listing terbanyak dan inquiry teraktif di area [District].

Dengan lebih dari [X] properti aktif dan [Y] inquiry per minggu, ASTRA Villa membantu pembeli menemukan properti ideal dan membantu agen menjual lebih cepat melalui teknologi matching dan demand analytics.

"Kami fokus membangun liquidity di satu distrik terlebih dahulu, memastikan setiap listing mendapat exposure maksimal dan setiap buyer menemukan pilihan terbaik," kata [Founder Name], CEO ASTRA Villa.

Fitur utama platform meliputi:
• Verified listings dengan standar kualitas foto & deskripsi
• Real-time demand analytics untuk agen dan developer
• Instant inquiry & viewing scheduling system

Untuk informasi lebih lanjut: [website] | [WhatsApp]`,
  kpis: [
    { metric: 'District Brand Search Growth', target: '+50% in 60 days' },
    { metric: 'Inbound Vendor Requests', target: '5+/week' },
    { metric: 'Buyer Inquiry Volume Growth', target: '+30%/month' },
    { metric: 'Media Mention Count', target: '3+ in 90 days' },
  ],
};

const weeklyChecklist = [
  { category: 'Negotiation Pipeline', items: ['Review active offers & counter-offers', 'Check stalled deals (>72hr no response)', 'Update CMA data for top listings', 'Follow up on post-viewing buyer signals'] },
  { category: 'Lead Distribution', items: ['Audit agent response time rankings', 'Review lead allocation fairness metrics', 'Coach bottom-20% agents on improvement', 'Process any lead dispute complaints'] },
  { category: 'District PR', items: ['Publish 2+ social proof posts', 'Check SEO landing page traffic', 'Follow up with media/blogger contacts', 'Update district market stats graphics'] },
  { category: 'Risk Monitoring', items: ['Monitor agent churn signals', 'Check buyer complaint trends', 'Review deal drop-off reasons', 'Audit content accuracy & claims'] },
];

const risks = [
  { signal: 'Agent complaints about unfair lead allocation', severity: 92, mitigation: 'Publish transparent scoring criteria; add agent dashboard with real-time metrics' },
  { signal: 'Negotiation stall rate >60%', severity: 88, mitigation: 'Introduce platform mediation service; auto-suggest compromise pricing zones' },
  { signal: 'PR claims exceed actual marketplace activity', severity: 85, mitigation: 'Always use verifiable data in PR; maintain conservative claim language' },
  { signal: 'Top agents receiving 80%+ of leads', severity: 78, mitigation: 'Implement guaranteed minimum allocation for new agents; cap max lead share at 40%' },
  { signal: 'Buyer trust drops after failed negotiation', severity: 72, mitigation: 'Send empathetic follow-up with alternative options; survey for feedback' },
];

const OfferNegotiationBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Scale className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Offer Negotiation + Lead Distribution + District PR</h2>
          <p className="text-sm text-muted-foreground">Transaction acceleration, agent fairness & hyper-local brand dominance</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="negotiation" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="negotiation"><MessageSquare className="h-4 w-4 mr-1.5" />Negotiation</TabsTrigger>
        <TabsTrigger value="leads"><Users className="h-4 w-4 mr-1.5" />Lead Distribution</TabsTrigger>
        <TabsTrigger value="pr"><Megaphone className="h-4 w-4 mr-1.5" />District PR</TabsTrigger>
        <TabsTrigger value="weekly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Weekly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* NEGOTIATION TAB */}
      <TabsContent value="negotiation" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Deal-Stage Friction Analysis</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {negotiationSystem.frictionPoints.map((f, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{f.issue}</span><Badge variant="outline" className="text-[10px]">{f.impact}%</Badge></div>
                    <Progress value={f.impact} className="h-1.5" />
                    <p className="text-[11px] text-muted-foreground">→ {f.fix}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />KPI Targets</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {negotiationSystem.kpis.map((k, i) => (
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
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-chart-1" />Data-Driven Pricing Guidance</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {negotiationSystem.pricingGuidance.map((g, i) => (
                  <li key={i} className="text-xs text-foreground p-2 rounded-lg bg-primary/5 border border-primary/10">{g}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Communication Facilitation Flow</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {negotiationSystem.communicationFlow.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <Badge variant={c.tone === 'urgent' ? 'destructive' : c.tone === 'celebratory' ? 'default' : 'outline'} className="text-[10px] min-w-[110px] justify-center flex-shrink-0">{c.stage}</Badge>
                  <div>
                    <p className="text-xs text-foreground">{c.action}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Tone: {c.tone}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(5)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Competing Interest Script</CardTitle></CardHeader>
              <CardContent><CopyBlock text={negotiationSystem.momentumScripts.competingInterest} /></CardContent>
            </Card>
          </motion.div>
          <motion.div {...anim(6)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Digital Offer Form Template</CardTitle></CardHeader>
              <CardContent><CopyBlock text={negotiationSystem.momentumScripts.digitalOffer} /></CardContent>
            </Card>
          </motion.div>
        </div>
      </TabsContent>

      {/* LEAD DISTRIBUTION TAB */}
      <TabsContent value="leads" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-chart-3" />Performance Scoring Weights</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {leadDistribution.scoringWeights.map((s, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">{s.icon} {s.factor}</span>
                      <Badge variant="outline" className="text-[10px]">{s.weight}%</Badge>
                    </div>
                    <Progress value={s.weight * 3.33} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Rotation Model Tiers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {leadDistribution.rotationModel.map((r, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{r.tier}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{r.allocation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-chart-1" />Agent Dashboard Metrics</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {leadDistribution.dashboardMetrics.map((m, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-2 p-2 rounded-lg bg-muted/20 border border-border/20"><span className="text-primary mt-0.5">▸</span>{m}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Fairness KPIs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {leadDistribution.fairnessKpis.map((k, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-xs text-foreground">{k.metric}</span>
                  <Badge variant="outline" className="text-[10px]">{k.target}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* DISTRICT PR TAB */}
      <TabsContent value="pr" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {districtPR.campaigns.map((c, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{c.name}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">{c.timeline}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {c.actions.map((a, j) => (
                      <li key={j} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">▸</span>{a}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(5)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Press Release Template (Bahasa Indonesia)</CardTitle></CardHeader>
            <CardContent><CopyBlock text={districtPR.prScript} /></CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(6)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-chart-1" />PR KPIs</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {districtPR.kpis.map((k, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-xs text-foreground">{k.metric}</span>
                  <Badge variant="outline" className="text-[10px]">{k.target}</Badge>
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

export default OfferNegotiationBlueprint;
