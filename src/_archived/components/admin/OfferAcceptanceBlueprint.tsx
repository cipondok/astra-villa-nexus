
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Handshake, DollarSign, MapPin, ClipboardCheck, AlertTriangle, Copy, Check, Target, TrendingUp, Zap, Timer, Award, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const anim = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

const CopyBlock = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="text-xs bg-muted/50 border border-border/40 rounded-lg p-3 whitespace-pre-wrap font-mono">{text}</pre>
      <Button size="sm" variant="ghost" className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); toast.success('Copied'); setTimeout(() => setCopied(false), 1500); }}>
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
};

const offerAcceleration = {
  delays: [
    { cause: 'Unrealistic seller price expectations', impact: 94, fix: 'Show verified comparable transactions within 500m radius + time-on-market data for overpriced listings' },
    { cause: 'Slow negotiation communication cycles', impact: 88, fix: 'Enforce 24hr response SLA; automated nudges at 12hr & 20hr marks; escalate to founder at 48hr' },
    { cause: 'Seller uncertainty about market demand', impact: 82, fix: 'Share property-specific engagement dashboard: views, inquiries, viewing count, watchlist adds' },
    { cause: 'No structured follow-up after offer', impact: 76, fix: '5-step post-offer workflow with defined timeline and automated status tracking' },
  ],
  pricingAlignment: [
    { tool: 'Comparable Transaction Report', description: 'Auto-generated report showing 5-10 recent sales within 1km, same property type, last 6 months', deliverable: 'PDF/WhatsApp card with price range, avg $/sqm, days-on-market' },
    { tool: 'Property Demand Score Card', description: 'Real-time engagement metrics: total views, inquiry count, viewing requests, watchlist adds', deliverable: 'Dashboard widget shared with seller via agent' },
    { tool: 'Suggested Offer Range', description: 'Algorithm-based fair price band (±10%) based on comparables, condition, and demand signals', deliverable: 'Range indicator shown to buyer before offer submission' },
    { tool: 'Time-on-Market Alert', description: 'Auto-notification to seller when listing exceeds avg days-on-market for area', deliverable: 'Gentle price adjustment suggestion with data backing' },
  ],
  postOfferWorkflow: [
    { step: 'Offer Submitted', timing: 'T+0', actions: ['Instant notification to agent + seller', 'Confirm receipt to buyer within 15 min', 'Start 48hr response countdown'], script: `📋 OFFER RECEIVED

🏠 [Property Name] — [District]
💰 Offer: Rp [Amount]
👤 Buyer: [Name] — verified, financing [status]

📊 Market context:
• Comparable range: Rp [X]–[Y]
• Offer vs asking: [X]% 
• Property demand: [X] views, [Y] inquiries

⏰ Response requested within 48 jam.
Reply: ACCEPT / COUNTER / DISCUSS` },
    { step: 'Seller Acknowledgment', timing: 'T+2hrs', actions: ['Confirm seller has seen the offer', 'Share comparable data if not yet sent', 'Set expectation for response timeline'], script: `Pak/Bu [Seller],

Offer sudah masuk untuk properti Anda di [District].

📊 Berdasarkan data market kami:
• Harga rata-rata area: Rp [X]/m²
• Offer ini: [X]% dari asking price
• [Y] buyer lain juga aktif melihat listing ini

Kami sarankan respon dalam 24-48 jam untuk menjaga momentum buyer.

Ada pertanyaan? Kami siap bantu analisa. 🤝` },
    { step: '24hr Check-in', timing: 'T+24hrs', actions: ['Follow up if no response', 'Offer additional market insights', 'Gauge seller sentiment'], script: `⏰ Quick check-in — offer masih menunggu respon.

💡 Update: [X] buyer baru melihat properti serupa di [District] hari ini.

Respon cepat = posisi negosiasi lebih kuat.

Apakah Bapak/Ibu ingin: ACCEPT / COUNTER / DISKUSI?` },
    { step: '48hr Escalation', timing: 'T+48hrs', actions: ['Direct call from team lead', 'Present final data summary', 'Warn about buyer attention window'], script: `🔔 URGENT: Offer menunggu 48 jam

Buyer commitment window biasanya 3-5 hari. Tanpa respon, risiko buyer move ke properti lain tinggi.

Rekomendasi: Respon hari ini — bahkan counter-offer menjaga deal alive.

📞 Tim kami siap bantu diskusi — reply atau call [number].` },
    { step: 'Resolution', timing: 'T+72hrs', actions: ['Final status confirmation', 'If accepted: initiate transaction process', 'If rejected: feedback capture + buyer redirect'], script: `✅ DEAL UPDATE: [Status]

[If Accepted]
Selamat! 🎉 Next steps:
1. Document preparation checklist
2. Legal verification scheduling  
3. Payment timeline confirmation

[If Counter]
Counter-offer: Rp [Amount]
Buyer response window: 48 jam

[If Declined]
Terima kasih. Feedback captured.
Buyer akan diarahkan ke properti alternatif.` },
  ],
  kpis: [
    { metric: 'Offer Acceptance Ratio', target: '≥55%', current: '28%' },
    { metric: 'Avg Negotiation Duration', target: '≤5 days', current: '14 days' },
    { metric: 'Offer-to-Close Rate', target: '≥70%', current: '35%' },
    { metric: 'Seller Response <48hrs', target: '≥80%', current: '42%' },
  ],
};

const commissionIncentive = {
  tiers: [
    { tier: '🚀 Sprint Bonus', trigger: 'Deal closed within 14 days of listing', reward: '+25% commission bonus', example: 'Standard 2% → 2.5% effective rate', motivation: 'Speed incentive' },
    { tier: '🔥 Volume Accelerator', trigger: '3+ deals closed in calendar month', reward: '+15% on all deals that month', example: '3rd deal onwards earns 2.3% vs 2%', motivation: 'Volume drive' },
    { tier: '⭐ Quality Premium', trigger: 'Listing quality score ≥9/10 + deal closed', reward: '+10% bonus + free Premium listing', example: 'High-quality listing that converts = extra reward', motivation: 'Quality incentive' },
    { tier: '🏆 Elite Monthly Champion', trigger: 'Highest revenue contribution in month', reward: 'Rp 5M cash bonus + featured spotlight', example: 'Top performer recognition + tangible reward', motivation: 'Competition drive' },
  ],
  campaignIncentives: [
    { campaign: 'Weekend Blitz', duration: 'Fri–Sun', mechanic: '2x commission on deals initiated during weekend viewings', target: 'Boost weekend activity' },
    { campaign: 'New District Push', duration: '2 weeks', mechanic: '+30% commission for first 10 deals in new target district', target: 'Territory expansion' },
    { campaign: 'Listing Rush', duration: '1 week', mechanic: 'Rp 500K bonus per 5 quality listings uploaded', target: 'Supply acceleration' },
    { campaign: 'Reactivation Sprint', duration: '1 week', mechanic: '+20% commission for closing deals on listings >30 days old', target: 'Stale inventory clearing' },
  ],
  behavioralDrivers: [
    { behavior: 'Response speed <5 min consistently', reward: 'Priority lead routing upgrade', tracking: 'Auto-measured via platform response timestamps' },
    { behavior: 'Proactive follow-up (3-touch within 72hrs)', reward: 'Lead quality score boost (+10 points)', tracking: 'Follow-up logging in CRM' },
    { behavior: 'Listing photo/description improvement', reward: 'Free Premium boost for improved listings', tracking: 'Before/after quality score comparison' },
    { behavior: 'Successful negotiation (offer→close <7 days)', reward: 'Negotiation mastery badge + bonus', tracking: 'Deal timeline tracking' },
  ],
  transparencyScript: `📊 PERFORMANCE DASHBOARD — [Agent Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 Monthly Score: [X]/100
📈 Ranking: #[X] of [Y] active agents

Performance Breakdown:
• Response Speed: [X]/25 — avg [Y] min
• Deal Closures: [X]/25 — [Y] deals this month  
• Listing Quality: [X]/25 — avg score [Y]/10
• Client Satisfaction: [X]/25 — [Y]/5 rating

💰 Commission Summary:
• Base earned: Rp [X]
• Sprint bonus: +Rp [Y]
• Volume accelerator: +Rp [Z]
• Total this month: Rp [Total]

🎯 Next milestone: [Description] → unlocks [Reward]

📅 Next review: [Date]`,
  kpis: [
    { metric: 'Deals per Agent (Monthly)', target: '≥4' },
    { metric: 'Response Time Improvement', target: '-40% vs baseline' },
    { metric: 'Agent Monetization Participation', target: '≥70%' },
    { metric: 'Incentive ROI', target: '≥3x payout in revenue' },
  ],
};

const microDistrict = {
  selectionCriteria: [
    { factor: 'Transaction Velocity Potential', weight: 30, description: 'Districts with recent transaction activity + growing demand signals' },
    { factor: 'Supply Accessibility', weight: 25, description: 'Areas where agents are recruitable and listings are obtainable quickly' },
    { factor: 'Competitive Vacuum', weight: 25, description: 'Zones underserved by existing portals or with fragmented agent presence' },
    { factor: 'Price Range Attractiveness', weight: 20, description: 'Properties in high-demand budget brackets (Rp 500M–3B sweet spot)' },
  ],
  supplyDensity: [
    { tactic: 'Agent Cluster Partnership', action: 'Recruit 5-8 agents operating in same micro-district; create exclusive listing agreements', target: '≥60% of active listings in zone' },
    { tactic: 'Listing Diversity Push', action: 'Ensure coverage across house, apartment, land, commercial within 2km radius', target: '4+ property categories represented' },
    { tactic: 'Rapid Refresh Protocol', action: 'Weekly listing audit: update photos, refresh descriptions, verify pricing', target: '<5% stale listings at any time' },
    { tactic: 'New Listing Fast-Track', action: 'Same-day upload assistance for agents in target district; free photo service for first 10 listings', target: '3+ new listings/week in zone' },
  ],
  demandCampaigns: [
    { channel: 'Geo-Targeted Ads', budget: 'Rp 2-5M/week', content: '"Properti terbaik di [District] — [X] listing eksklusif tersedia"', kpi: 'CTR ≥3%, CPC <Rp 5K' },
    { channel: 'WhatsApp Broadcast', budget: 'Free', content: 'Weekly "Top 5 di [District]" curated list to buyer database', kpi: 'Open rate ≥60%, inquiry ≥10%' },
    { channel: 'Instagram Carousel', budget: 'Rp 1-3M/week', content: '"Kenapa [District]? 5 alasan investasi" + property showcase', kpi: 'Engagement ≥5%, saves ≥2%' },
    { channel: 'Local SEO Landing Page', budget: 'One-time setup', content: '"Properti dijual di [District] — [City]" optimized page', kpi: 'Organic traffic ≥100/month within 90 days' },
  ],
  authoritySignals: [
    { signal: 'Listing count leadership badge', display: '"Platform #1 di [District] — [X] properti aktif"', placement: 'District landing page + social posts' },
    { signal: 'Viewing activity statistics', display: '"[X] viewings dijadwalkan di [District] minggu ini"', placement: 'Property cards + buyer notifications' },
    { signal: 'Success deal showcase', display: '"[X] properti terjual via ASTRA Villa di [District] bulan ini"', placement: 'Social proof banner + agent recruitment pitch' },
    { signal: 'Price intelligence snippet', display: '"Harga rata-rata [District]: Rp [X]/m² — naik [Y]% dari 6 bulan lalu"', placement: 'Blog posts + email newsletters' },
  ],
  dominationScript: `🗺️ MICRO-DISTRICT DOMINATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Target: [District Name], [City]
📅 Week [X] of domination campaign

📊 SUPPLY METRICS:
• Active listings: [X] (market share: [Y]%)
• New listings this week: [X]
• Agent partners in zone: [X]
• Listing categories covered: [X]/4

📈 DEMAND METRICS:
• Inquiries this week: [X] (+[Y]% vs last week)
• Viewings scheduled: [X]
• Unique buyer searches: [X]
• Avg time-on-listing: [X] min

💰 DEAL METRICS:
• Offers submitted: [X]
• Deals in negotiation: [X]
• Closed this month: [X]
• Revenue from zone: Rp [X]

🎯 DOMINATION STATUS: [🔴/🟡/🟢]
Next action: [Priority action item]`,
  kpis: [
    { metric: 'Micro-District Listing Share', target: '≥65%' },
    { metric: 'Inquiry Velocity Leadership', target: '2x nearest competitor' },
    { metric: 'Vendor Adoption in Zone', target: '≥80% of active agents' },
    { metric: 'Zone Revenue Contribution', target: '≥30% of city revenue' },
  ],
};

const weeklyChecklist = [
  { category: 'Offer & Negotiation', items: ['Review offer acceptance rate vs 55% target', 'Audit seller response SLA (<48hr) compliance', 'Check stuck negotiations >7 days — intervene', 'Send comparable market data to pending sellers'] },
  { category: 'Commission & Incentives', items: ['Update agent performance scorecards', 'Process Sprint/Volume bonus calculations', 'Announce weekly campaign incentive results', 'Review incentive ROI vs revenue generated'] },
  { category: 'Micro-District Domination', items: ['Track listing market share in target zone', 'Audit demand campaign performance metrics', 'Recruit new agents in underserved micro-areas', 'Publish district authority content/signals'] },
  { category: 'Deal Pipeline Health', items: ['Count active offers in pipeline', 'Monitor avg negotiation cycle duration', 'Identify top 5 highest-probability deals', 'Follow up on post-viewing no-offer leads'] },
];

const risks = [
  { signal: 'Offer acceptance rate dropping below 30%', severity: 92, mitigation: 'Audit pricing alignment tool accuracy; increase seller education on market reality; add mandatory comp data to all offers' },
  { signal: 'Commission costs exceeding 40% of transaction revenue', severity: 86, mitigation: 'Cap bonus tiers; shift to performance-based only; increase base platform fee to offset; review ROI monthly' },
  { signal: 'Micro-district saturation without proportional demand', severity: 84, mitigation: 'Rebalance ad spend to demand activation; expand target radius; recruit buyer-side partnerships (mortgage, relocation)' },
  { signal: 'Agents gaming incentive metrics (fake inquiries/views)', severity: 90, mitigation: 'Implement verified-only metrics; cross-check with buyer confirmation; audit suspicious patterns weekly; penalty policy' },
  { signal: 'Seller frustration with platform-mediated negotiation', severity: 78, mitigation: 'Position as facilitation not interference; ensure agent remains primary contact; gather seller feedback quarterly' },
];

const OfferAcceptanceBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Handshake className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Offer Acceptance + Commission Incentive + Micro-District Liquidity</h2>
          <p className="text-sm text-muted-foreground">Deal closure acceleration, agent motivation & hyper-local market control</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="offer" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="offer"><Handshake className="h-4 w-4 mr-1.5" />Offer Acceleration</TabsTrigger>
        <TabsTrigger value="commission"><DollarSign className="h-4 w-4 mr-1.5" />Commission Incentive</TabsTrigger>
        <TabsTrigger value="district"><MapPin className="h-4 w-4 mr-1.5" />Micro-District</TabsTrigger>
        <TabsTrigger value="weekly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Weekly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* OFFER TAB */}
      <TabsContent value="offer" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Acceptance Delay Causes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {offerAcceleration.delays.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{d.cause}</span><Badge variant="outline" className="text-[10px]">{d.impact}%</Badge></div>
                    <Progress value={d.impact} className="h-1.5" />
                    <p className="text-[11px] text-muted-foreground">→ {d.fix}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Offer KPIs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {offerAcceleration.kpis.map((k, i) => (
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
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-chart-3" />Pricing Alignment Tools</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {offerAcceleration.pricingAlignment.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{t.tool}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1">{t.description}</p>
                  <p className="text-[11px] text-primary">📦 {t.deliverable}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          {offerAcceleration.postOfferWorkflow.map((step, i) => (
            <motion.div key={i} {...anim(i + 4)}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{step.step}</CardTitle>
                    <Badge className="text-[10px] bg-chart-1/10 text-chart-1 border-chart-1/20">{step.timing}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1">
                    {step.actions.map((a, j) => (
                      <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5"><span className="text-primary">▸</span>{a}</li>
                    ))}
                  </ul>
                  <CopyBlock text={step.script} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </TabsContent>

      {/* COMMISSION TAB */}
      <TabsContent value="commission" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4 text-chart-3" />Commission Bonus Tiers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {commissionIncentive.tiers.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{t.tier}</span>
                    <Badge variant="outline" className="text-[10px]">{t.motivation}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Trigger: {t.trigger}</p>
                  <p className="text-[11px] text-primary">Reward: {t.reward}</p>
                  <p className="text-[10px] text-muted-foreground">Example: {t.example}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />Campaign Incentives</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {commissionIncentive.campaignIncentives.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{c.campaign}</span>
                      <Badge variant="outline" className="text-[10px]">{c.duration}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{c.mechanic}</p>
                    <p className="text-[10px] text-primary">→ {c.target}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-chart-1" />Behavioral Drivers</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {commissionIncentive.behavioralDrivers.map((b, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <span className="text-xs font-semibold text-foreground">{b.behavior}</span>
                    <p className="text-[11px] text-primary mt-0.5">🎁 {b.reward}</p>
                    <p className="text-[10px] text-muted-foreground">📊 {b.tracking}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Agent Performance Dashboard Template</CardTitle></CardHeader>
            <CardContent><CopyBlock text={commissionIncentive.transparencyScript} /></CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(5)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Incentive KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {commissionIncentive.kpis.map((k, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* MICRO-DISTRICT TAB */}
      <TabsContent value="district" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-chart-3" />District Selection Criteria</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {microDistrict.selectionCriteria.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{c.factor}</span><Badge variant="outline" className="text-[10px]">{c.weight}%</Badge></div>
                  <Progress value={c.weight * 3.3} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground">{c.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Supply Density Tactics</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {microDistrict.supplyDensity.map((s, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{s.tactic}</span>
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{s.target}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{s.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-chart-1" />Demand Campaigns</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {microDistrict.demandCampaigns.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{c.channel}</span>
                      <Badge variant="outline" className="text-[10px]">{c.budget}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{c.content}</p>
                    <p className="text-[10px] text-primary">📊 {c.kpi}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Authority Signals</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {microDistrict.authoritySignals.map((s, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{s.signal}</span>
                    <Badge variant="outline" className="text-[10px]">{s.placement}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">"{s.display}"</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(5)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Domination Report Template</CardTitle></CardHeader>
            <CardContent><CopyBlock text={microDistrict.dominationScript} /></CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(6)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Micro-District KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {microDistrict.kpis.map((k, i) => (
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

export default OfferAcceptanceBlueprint;
