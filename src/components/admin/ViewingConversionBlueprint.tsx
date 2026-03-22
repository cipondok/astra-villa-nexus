
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Building2, Megaphone, ClipboardCheck, AlertTriangle, Copy, Check, Clock, Target, Users, TrendingUp } from 'lucide-react';
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

const viewingOptimization = {
  frictionPoints: [
    { issue: 'Slow agent response', impact: 92, fix: 'Auto-assign coordinator for leads >5min unresponded' },
    { issue: 'Buyer time hesitation', impact: 78, fix: 'Offer 30-min express viewings + virtual preview option' },
    { issue: 'Unclear expectations', impact: 71, fix: 'Send pre-viewing property brief with photos & map' },
    { issue: 'Scheduling conflicts', impact: 65, fix: 'Instant multi-slot calendar picker in inquiry flow' },
  ],
  fastScheduling: [
    'Embed 3 time-slot options in every inquiry confirmation',
    'Auto-send calendar invite + WhatsApp reminder 2hrs before',
    'Assign dedicated viewing coordinator for top-20 listings',
    'Enable same-day viewing for properties with ready agents',
  ],
  preViewingBoosters: [
    'Property highlight card: 3 key benefits + price positioning',
    'Google Maps pin + driving directions + parking info',
    'Comparable listings data: "Similar units sold at X in Y days"',
    'Demand signal: "12 inquiries this week — high interest area"',
  ],
  followUpCadence: [
    { time: '0–5 min', action: 'Instant WhatsApp: confirm interest + offer 3 time slots', priority: 'critical' },
    { time: '30 min', action: 'If no reply: "Slots filling — want me to hold one?"', priority: 'high' },
    { time: '4 hours', action: 'Share additional property insight or similar option', priority: 'medium' },
    { time: '24 hours', action: 'Final nudge: "Last available slot this week"', priority: 'medium' },
    { time: '72 hours', action: 'Soft close: "Still interested? New options available"', priority: 'low' },
  ],
  kpis: [
    { metric: 'Inquiry-to-Viewing Ratio', target: '≥35%', current: '18%' },
    { metric: 'No-Show Rate', target: '<15%', current: '32%' },
    { metric: 'Avg Response Time', target: '<5 min', current: '47 min' },
    { metric: 'Viewing-to-Offer Rate', target: '≥20%', current: '8%' },
  ],
};

const developerPartnership = {
  targets: [
    { segment: 'Mid-Size Developers', desc: 'Active launches, 10-50 units, need digital exposure', priority: 'primary' },
    { segment: 'Boutique Luxury Builders', desc: 'Premium villas/townhouses, high-margin projects', priority: 'primary' },
    { segment: 'Township Developers', desc: 'Large-scale projects needing sustained buyer pipeline', priority: 'secondary' },
    { segment: 'Land Bank Holders', desc: 'Pre-development stage, investor audience needed', priority: 'tertiary' },
  ],
  valueProps: [
    '🎯 Curated investor & buyer leads — pre-qualified by intent signals',
    '📊 Demand analytics dashboard — real-time pricing strategy insights',
    '🏠 Premium project showcase — dedicated landing page + SEO',
    '📱 Multi-channel campaign — social, WhatsApp broadcast, email',
    '💰 Performance-based model — pay for results, not impressions',
  ],
  outreachScript: `Selamat pagi Pak/Bu [Name],

Saya [Your Name] dari ASTRA Villa — platform properti digital yang membantu developer mendapatkan buyer & investor berkualitas.

Kami melihat proyek [Project Name] di [Location] sangat menarik. Saya ingin menawarkan:

✅ Showcase eksklusif proyek Anda di platform kami
✅ Akses ke database investor aktif kami
✅ Dashboard analytics demand real-time
✅ Pilot campaign GRATIS untuk 30 hari pertama

Apakah Bapak/Ibu bersedia meeting singkat 20 menit minggu ini?

Saya siap datang ke kantor atau virtual call — mana yang lebih nyaman.

Terima kasih 🙏`,
  meetingOutline: [
    '1. Market context: digital property discovery trend data',
    '2. Platform demo: live listing + inquiry flow walkthrough',
    '3. Case study: inquiry volume for similar project type',
    '4. Pilot proposal: 30-day free premium showcase',
    '5. Success metrics: agreed KPIs for pilot evaluation',
    '6. Next steps: content handover timeline',
  ],
  kpis: [
    { metric: 'Projects Onboarded/Month', target: '3–5' },
    { metric: 'Developer Listing Volume', target: '50+ units' },
    { metric: 'Campaign Inquiry Spike', target: '+40% vs baseline' },
    { metric: 'Pilot-to-Paid Conversion', target: '≥60%' },
  ],
};

const dealStoryMarketing = {
  formats: [
    { type: 'Quick Win Post', template: '🏡 SOLD in [X] days!\n\n[Property Type] di [Location]\n💰 [Price Range]\n👤 Buyer: [Profile — e.g., young family, investor]\n⚡ [Key selling point]\n\nPlatform ASTRA Villa mempertemukan buyer & seller dengan cepat.\n\n#ASTRAVilla #PropertySold #RealEstate', channel: 'Instagram/TikTok' },
    { type: 'Buyer Journey Story', template: '📖 Cerita Sukses Buyer\n\n"Saya mencari villa investasi di Bali selama 3 bulan. Setelah mendaftar di ASTRA Villa, dalam 2 minggu saya sudah viewing 4 properti dan closing di properti ke-3."\n\n— [Buyer Name], [City]\n\nTotal waktu dari inquiry → closing: [X] hari\nROI estimasi: [X]% per tahun', channel: 'Blog/LinkedIn' },
    { type: 'Agent Spotlight', template: '⭐ Agent of the Month\n\n[Agent Name] — [Agency]\n📊 [X] deals closed via ASTRA Villa\n⏱️ Avg response time: [X] min\n💬 "[Quote from agent about platform]"\n\nBergabung sebagai partner agent →', channel: 'All channels' },
  ],
  amplificationChannels: [
    { channel: 'Instagram Reels', frequency: '3x/week', focus: 'Quick property sold visuals + stats' },
    { channel: 'WhatsApp Broadcast', frequency: '1x/week', focus: 'Deal roundup to agent & buyer lists' },
    { channel: 'Website Success Page', frequency: 'Ongoing', focus: 'Evergreen deal portfolio showcase' },
    { channel: 'Email Newsletter', frequency: 'Bi-weekly', focus: 'Market insights + deal highlights' },
    { channel: 'YouTube Shorts', frequency: '2x/week', focus: 'Before/after + buyer testimonials' },
  ],
  milestones: [
    { deals: 5, action: 'First "5 Deals Closed" milestone post', impact: 'Initial credibility signal' },
    { deals: 10, action: 'Launch dedicated success stories page', impact: 'SEO + trust anchor' },
    { deals: 15, action: 'Agent testimonial video compilation', impact: 'B2B recruitment fuel' },
    { deals: 20, action: '"20 Families Found Their Home" campaign', impact: 'Emotional brand authority' },
  ],
  kpis: [
    { metric: 'Engagement Rate on Deal Stories', target: '≥5%' },
    { metric: 'Traffic Spike After Publication', target: '+25%' },
    { metric: 'Vendor Inbound Interest Growth', target: '+15%/month' },
    { metric: 'Deal Story → Inquiry Attribution', target: '≥8%' },
  ],
};

const weeklyChecklist = [
  { category: 'Viewing Conversion', items: ['Review inquiry-to-viewing ratio', 'Check avg response time', 'Audit no-show reasons', 'Optimize pre-viewing briefs'] },
  { category: 'Developer Pipeline', items: ['Follow up pending developer meetings', 'Send pilot performance reports', 'Identify 3 new target developers', 'Update partnership CRM'] },
  { category: 'Deal Stories', items: ['Publish 2+ deal success posts', 'Collect new testimonials', 'Update website success page', 'Track content engagement metrics'] },
  { category: 'Risk Monitoring', items: ['Check agent response degradation', 'Monitor viewing cancellation trends', 'Review developer satisfaction signals', 'Audit content authenticity'] },
];

const risks = [
  { signal: 'Viewing no-show rate >30%', severity: 95, mitigation: 'Implement 2-step confirmation + deposit hold for premium viewings' },
  { signal: 'Agent response time >30min avg', severity: 88, mitigation: 'Auto-reassign leads after 10min; penalize slow responders in ranking' },
  { signal: 'Developer pilot churn >40%', severity: 82, mitigation: 'Weekly check-in calls; guarantee minimum inquiry volume in pilot' },
  { signal: 'Deal stories feel inauthentic', severity: 75, mitigation: 'Use real data, real names (with consent), avoid exaggeration' },
  { signal: 'Inquiry volume drops post-campaign', severity: 70, mitigation: 'Maintain consistent content cadence; diversify traffic sources' },
];

const ViewingConversionBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Calendar className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Viewing Conversion + Developer Partnership + Deal Stories</h2>
          <p className="text-sm text-muted-foreground">Traction execution blueprint for deal acceleration & market trust</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="viewing" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="viewing"><Calendar className="h-4 w-4 mr-1.5" />Viewing Conversion</TabsTrigger>
        <TabsTrigger value="developer"><Building2 className="h-4 w-4 mr-1.5" />Developer Partners</TabsTrigger>
        <TabsTrigger value="stories"><Megaphone className="h-4 w-4 mr-1.5" />Deal Stories</TabsTrigger>
        <TabsTrigger value="weekly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Weekly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      <TabsContent value="viewing" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Friction Point Analysis</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {viewingOptimization.frictionPoints.map((f, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{f.issue}</span><Badge variant="outline" className="text-[10px]">Impact: {f.impact}%</Badge></div>
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
                {viewingOptimization.kpis.map((k, i) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(3)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-chart-3" />Fast Scheduling System</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {viewingOptimization.fastScheduling.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">▸</span>{s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(4)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-chart-1" />Pre-Viewing Confidence Boosters</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {viewingOptimization.preViewingBoosters.map((b, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-chart-1 mt-0.5">▸</span>{b}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(5)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Follow-Up Cadence Protocol</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {viewingOptimization.followUpCadence.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                    <Badge variant={f.priority === 'critical' ? 'destructive' : 'outline'} className="text-[10px] min-w-[60px] justify-center">{f.time}</Badge>
                    <span className="text-xs text-foreground">{f.action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      <TabsContent value="developer" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />Target Developer Segments</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {developerPartnership.targets.map((t, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{t.segment}</span>
                      <Badge variant={t.priority === 'primary' ? 'default' : 'outline'} className="text-[10px]">{t.priority}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-chart-1" />Partnership Value Props</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {developerPartnership.valueProps.map((v, i) => (
                    <li key={i} className="text-xs text-foreground p-2 rounded-lg bg-primary/5 border border-primary/10">{v}</li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-foreground">Partnership KPIs</p>
                  {developerPartnership.kpis.map((k, i) => (
                    <div key={i} className="flex justify-between text-xs p-1.5 rounded bg-muted/30">
                      <span className="text-muted-foreground">{k.metric}</span>
                      <Badge variant="outline" className="text-[10px]">{k.target}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(3)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Developer Outreach Script (Bahasa Indonesia)</CardTitle></CardHeader>
            <CardContent><CopyBlock text={developerPartnership.outreachScript} /></CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Meeting Presentation Outline</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {developerPartnership.meetingOutline.map((m, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-2 p-2 rounded-lg bg-muted/20 border border-border/20"><span className="text-primary font-bold">{i + 1}.</span>{m.substring(3)}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      <TabsContent value="stories" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {dealStoryMarketing.formats.map((f, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{f.type}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">{f.channel}</Badge>
                  </div>
                </CardHeader>
                <CardContent><CopyBlock text={f.template} /></CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Megaphone className="h-4 w-4 text-chart-3" />Amplification Channels</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {dealStoryMarketing.amplificationChannels.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs font-semibold text-foreground">{c.channel}</p>
                    <p className="text-[11px] text-muted-foreground">{c.frequency} — {c.focus}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(5)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Deal Story Milestones</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {dealStoryMarketing.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                    <Badge className="text-[10px] bg-chart-1/10 text-chart-1 border-chart-1/20">{m.deals} deals</Badge>
                    <div><p className="text-xs font-medium text-foreground">{m.action}</p><p className="text-[10px] text-muted-foreground">{m.impact}</p></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(6)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Marketing KPIs</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {dealStoryMarketing.kpis.map((k, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-muted/30 border border-border/30">
                    <span className="text-xs text-foreground">{k.metric}</span>
                    <Badge variant="outline" className="text-[10px]">{k.target}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </TabsContent>

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
                  <Badge variant={r.severity >= 85 ? 'destructive' : 'outline'} className="text-[10px]">Severity: {r.severity}%</Badge>
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

export default ViewingConversionBlueprint;
