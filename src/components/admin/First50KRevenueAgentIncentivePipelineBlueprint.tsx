import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { DollarSign, Trophy, BarChart3, CheckCircle, AlertTriangle, TrendingUp, Target, Users, Zap, Crown, ArrowRight } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: $50K Monthly Revenue ── */
const revenueChannels = [
  { channel: 'Transaction Commission (2.5%)', monthly: '$20,000', pct: 40, actions: ['Close 8-12 deals/month averaging $200K value', 'Accelerate negotiation cycles to <14 days', 'Prioritize districts with highest deal velocity'], status: 'Primary' },
  { channel: 'Premium Listing Packages', monthly: '$12,000', pct: 24, actions: ['Convert 40-60 vendors to premium tiers ($200-500/mo)', 'Launch "Guaranteed Visibility" 30-day packages', 'Auto-suggest upgrades after inquiry spikes'], status: 'Growth' },
  { channel: 'Developer Project Showcases', monthly: '$10,000', pct: 20, actions: ['Onboard 3-5 developer projects at $2,000-3,000/project', 'Offer dedicated landing page + campaign bundles', 'Prove ROI with inquiry attribution reports'], status: 'Growth' },
  { channel: 'Data & Analytics Subscriptions', monthly: '$5,000', pct: 10, actions: ['Launch agent market intelligence dashboard at $100/mo', 'Offer investor demand reports at $200/mo', 'Bundle with premium listing for higher LTV'], status: 'Emerging' },
  { channel: 'Financing Referral Commissions', monthly: '$3,000', pct: 6, actions: ['Route pre-qualified buyers to partner banks', 'Earn $300-500 per successful mortgage referral', 'Integrate financing CTA into post-viewing flow'], status: 'Emerging' },
];

const weeklyTargets = [
  { week: 'Week 1', target: '$10,000', focus: 'Activate premium upsells + push 2-3 near-closing deals', milestone: 'Foundation' },
  { week: 'Week 2', target: '$12,500', focus: 'Developer project onboarding + accelerate negotiations', milestone: 'Acceleration' },
  { week: 'Week 3', target: '$13,500', focus: 'Flash promotion sprint + close high-value transactions', milestone: 'Push' },
  { week: 'Week 4', target: '$14,000', focus: 'Subscription renewals + final month deal closures', milestone: 'Close' },
];

const consistencyMechanisms = [
  { mechanism: 'Rolling Deal Pipeline Review', freq: 'Daily', desc: 'Review all deals >50% probability — intervene in any stalled >48h' },
  { mechanism: 'Premium Renewal Automation', freq: 'Weekly', desc: 'Auto-remind vendors 7 days before expiry with performance ROI data' },
  { mechanism: 'Revenue Diversification Audit', freq: 'Bi-weekly', desc: 'Ensure no single channel >50% of total — rebalance if concentrated' },
  { mechanism: 'District Revenue Heat Mapping', freq: 'Weekly', desc: 'Concentrate resources on top 3 revenue-producing districts' },
];

/* ── Section 2: Agent Incentives ── */
const incentiveTiers = [
  { tier: 'Bronze Closer', threshold: '2 deals/month', rewards: ['Name on weekly leaderboard', '10% extra lead routing priority', 'Performance badge on profile'], color: 'text-orange-600' },
  { tier: 'Silver Closer', threshold: '4 deals/month', rewards: ['Featured agent spotlight on homepage', '20% premium listing credits', 'Priority viewing coordination support'], color: 'text-muted-foreground' },
  { tier: 'Gold Closer', threshold: '6 deals/month', rewards: ['Exclusive lead access for new listings', '30% commission uplift for month', 'Co-branded marketing campaign'], color: 'text-yellow-500' },
  { tier: 'Diamond Closer', threshold: '8+ deals/month', rewards: ['Revenue-share partnership offer (85/15 split)', 'VIP developer project access', 'Public recognition + success story feature'], color: 'text-primary' },
];

const behavioralDrivers = [
  { behavior: 'Response Speed Excellence', metric: '<15 min avg response', reward: 'Priority lead routing access', impact: 85 },
  { behavior: 'Proactive Follow-Up Discipline', metric: '100% same-day follow-up', reward: 'Extra 5 premium leads/week', impact: 78 },
  { behavior: 'Listing Quality Standards', metric: '10+ photos, complete details', reward: 'Featured placement boost', impact: 70 },
  { behavior: 'Negotiation Close Rate', metric: '>30% offer-to-deal ratio', reward: 'Quarterly cash bonus', impact: 92 },
];

/* ── Section 3: Buyer Pipeline Forecast ── */
const pipelineStages = [
  { stage: 'New Inquiry', probability: '10%', avgDays: '0-3', signals: ['First contact, budget mentioned', 'Property type specified', 'Location preference indicated'], volume: '~200/mo' },
  { stage: 'Viewing Scheduled', probability: '30%', avgDays: '3-7', signals: ['Confirmed viewing appointment', 'Calendar invite accepted', 'Pre-viewing questions asked'], volume: '~60/mo' },
  { stage: 'Viewing Completed', probability: '45%', avgDays: '7-14', signals: ['Attended viewing', 'Positive feedback shared', 'Second viewing requested'], volume: '~40/mo' },
  { stage: 'Negotiation Active', probability: '65%', avgDays: '14-21', signals: ['Offer submitted or discussed', 'Counter-offer exchange', 'Financing pre-check initiated'], volume: '~20/mo' },
  { stage: 'Near-Closing', probability: '85%', avgDays: '21-30', signals: ['Price agreed', 'Documents in preparation', 'Payment timeline confirmed'], volume: '~12/mo' },
];

const forecastFormula = [
  { input: 'Viewing Completion Rate', weight: 30, desc: 'Higher viewing attendance = stronger pipeline health' },
  { input: 'Repeat Engagement Depth', weight: 25, desc: 'Multiple interactions (saves, inquiries, viewings) signal high intent' },
  { input: 'Budget-to-Listing Match', weight: 20, desc: 'Buyers whose budget aligns with viewed listings close faster' },
  { input: 'Response Speed Reciprocity', weight: 15, desc: 'Buyers who reply fast to agents have higher conversion probability' },
  { input: 'District Demand Pressure', weight: 10, desc: 'Buyers in high-competition zones decide faster' },
];

/* ── Monthly Monitoring ── */
const monthlyChecklist = [
  { category: 'Revenue Health', items: ['Monthly revenue on track vs $50K target', 'Revenue per channel within expected range', 'Premium renewal rate >60%', 'No single deal >20% of monthly revenue'] },
  { category: 'Agent Performance', items: ['Top 10 agents meeting closure targets', 'Incentive program participation >50%', 'Response speed avg improving month-over-month', 'Agent churn rate <10%'] },
  { category: 'Pipeline Quality', items: ['Pipeline-to-close ratio improving', 'Forecast accuracy within 20% margin', 'Stalled deals <15% of active pipeline', 'New inquiry volume growing week-over-week'] },
];

/* ── Risk Indicators ── */
const risks = [
  { risk: 'Revenue plateau at $30-40K', signal: 'Growth stalls after initial premium adoption wave', fix: 'Launch developer project channel + financing referrals to diversify' },
  { risk: 'Top agent dependency', signal: '3 agents producing >60% of deal revenue', fix: 'Invest in mid-tier agent coaching to expand closer base' },
  { risk: 'Pipeline inflation', signal: 'Growing pipeline but flat conversion rate', fix: 'Tighten qualification criteria — focus on high-probability leads only' },
  { risk: 'Premium fatigue', signal: 'Declining premium upgrade conversion after month 3', fix: 'Introduce new package tiers + prove ROI with data reports' },
  { risk: 'District concentration risk', signal: 'One district producing >50% of all revenue', fix: 'Aggressively seed supply in 2-3 adjacent high-demand districts' },
];

export default function First50KRevenueAgentIncentivePipelineBlueprint() {
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
                  <CardTitle className="text-xl">First $50K Monthly Revenue + Agent Incentives + Pipeline Forecast</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Scale monetization, motivate closers, predict deal flow</p>
                </div>
              </div>
              <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/30">💰 $50K/mo</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="revenue">💰 $50K Plan</TabsTrigger>
          <TabsTrigger value="incentives">🏆 Incentives</TabsTrigger>
          <TabsTrigger value="pipeline">📊 Pipeline</TabsTrigger>
          <TabsTrigger value="monitor">📋 Monthly</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risks</TabsTrigger>
        </TabsList>

        {/* ── Revenue ── */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /> Revenue Channel Mix — $50K/Month</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {revenueChannels.map((c, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-semibold text-sm">{c.channel}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{c.monthly}</Badge>
                        <Badge variant="secondary" className="text-xs">{c.pct}%</Badge>
                        <Badge variant={c.status === 'Primary' ? 'default' : 'outline'} className="text-[10px]">{c.status}</Badge>
                      </div>
                    </div>
                    <Progress value={c.pct * 2.5} className="h-1.5" />
                    <div className="grid gap-1">{c.actions.map((a, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />{a}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Weekly Revenue Targets</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {weeklyTargets.map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs w-16 justify-center">{w.week}</Badge>
                      <span className="text-sm">{w.focus}</span>
                    </div>
                    <div className="flex gap-2"><Badge variant="secondary" className="text-xs">{w.milestone}</Badge><Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/30">{w.target}</Badge></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Consistency Mechanisms</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {consistencyMechanisms.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div><span className="text-sm font-medium">{m.mechanism}</span><p className="text-xs text-muted-foreground">{m.desc}</p></div>
                    <Badge variant="outline" className="text-xs shrink-0">{m.freq}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Incentives ── */}
        <TabsContent value="incentives" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> Performance Tier Incentives</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {incentiveTiers.map((t, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Crown className={`h-4 w-4 ${t.color}`} /><span className="font-semibold text-sm">{t.tier}</span></div>
                      <Badge variant="secondary" className="text-xs">{t.threshold}</Badge>
                    </div>
                    <div className="grid gap-1">{t.rewards.map((r, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />{r}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Behavioral Performance Drivers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {behavioralDrivers.map((b, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium">{b.behavior}</span><Badge variant="outline" className="text-xs">{b.metric}</Badge></div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Reward: {b.reward}</span><span>Impact: {b.impact}%</span></div>
                    <Progress value={b.impact} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Pipeline ── */}
        <TabsContent value="pipeline" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Pipeline Stage Forecast Model</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {pipelineStages.map((s, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-2">
                        {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                        <span className="font-semibold text-sm">{s.stage}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="default" className="text-[10px]">P: {s.probability}</Badge>
                        <Badge variant="outline" className="text-[10px]">{s.avgDays} days</Badge>
                        <Badge variant="secondary" className="text-[10px]">{s.volume}</Badge>
                      </div>
                    </div>
                    <Progress value={parseInt(s.probability)} className="h-1.5" />
                    <div className="grid gap-1">{s.signals.map((sig, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />{sig}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Forecast Scoring Formula</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {forecastFormula.map((f, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium">{f.input}</span><Badge variant="secondary" className="text-xs">Weight: {f.weight}%</Badge></div>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                    <Progress value={f.weight * 3} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Monthly Monitoring ── */}
        <TabsContent value="monitor" className="space-y-4 mt-4">
          {monthlyChecklist.map((c, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base">{c.category}</CardTitle></CardHeader>
                <CardContent><div className="grid gap-2">{c.items.map((item, j) => <div key={j} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary shrink-0" />{item}</div>)}</div></CardContent>
              </Card>
            </motion.div>
          ))}
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
