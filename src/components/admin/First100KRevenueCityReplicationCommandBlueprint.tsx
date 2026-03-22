import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { DollarSign, MapPin, LayoutDashboard, CheckCircle, AlertTriangle, TrendingUp, Target, Zap, BarChart3, ArrowRight, RefreshCw, Eye, Users, Building } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: $100K Revenue ── */
const revenueLevers = [
  { lever: 'Transaction Commission Scale', target: '$40K/mo', pct: 40, tactics: ['Close 15-20 deals/month at avg $250K value', 'Reduce negotiation cycle to <10 days via structured follow-up', 'Deploy deal-stage escalation triggers at 48h stall points'], status: 'Core' },
  { lever: 'Premium & Featured Listings', target: '$25K/mo', pct: 25, tactics: ['Convert 80-100 vendors to premium ($250-500/mo)', 'Launch "Guaranteed 10 Inquiries" performance packages', 'Auto-trigger upgrade suggestion after 5+ inquiry threshold'], status: 'Scale' },
  { lever: 'Developer Project Partnerships', target: '$18K/mo', pct: 18, tactics: ['Maintain 5-8 active developer showcases at $2-4K each', 'Offer quarterly campaign bundles with inquiry guarantees', 'Create co-branded investment opportunity landing pages'], status: 'Scale' },
  { lever: 'Analytics & Data Subscriptions', target: '$10K/mo', pct: 10, tactics: ['Scale agent dashboard subscriptions to 100+ at $100/mo', 'Launch institutional investor data terminal at $500/mo', 'Bundle market reports with premium listing packages'], status: 'Growth' },
  { lever: 'Financing & Referral Revenue', target: '$7K/mo', pct: 7, tactics: ['Process 15-20 mortgage referrals/month at $350-500 each', 'Integrate financing CTA at offer submission stage', 'Partner with 3+ banks for exclusive referral rates'], status: 'Growth' },
];

const flywheelAccelerators = [
  { action: 'Weekly Revenue Sprint Cycles', desc: 'Run focused 5-day monetization sprints rotating across districts', impact: 90 },
  { action: 'Performance-Based Upgrade Triggers', desc: 'Auto-suggest premium when listing hits inquiry/viewing thresholds', impact: 82 },
  { action: 'Monthly Promotional Calendar', desc: 'Pre-planned campaign cadence: Flash Deals, Developer Launches, Weekend Blitz', impact: 75 },
  { action: 'Subscription Lock-In Incentives', desc: '3-month premium packages at 20% discount to increase recurring base', impact: 70 },
];

/* ── Section 2: City Replication ── */
const replicationPlaybook = [
  { phase: 'Pre-Launch Intelligence (Week -2 to 0)', actions: ['Map top 20 agencies in target city', 'Identify 2-3 districts with highest transaction velocity', 'Research local pricing benchmarks and competitor presence', 'Prepare localized marketing creative and scripts'], gate: '20+ target agents identified' },
  { phase: 'Supply Seeding (Week 1-2)', actions: ['Onboard 10-15 anchor agents with verified portfolios', 'Secure 50+ listings concentrated in priority districts', 'Launch agent referral incentive for network expansion', 'Deploy standardized listing quality checklist'], gate: '50+ listings live, 3 districts covered' },
  { phase: 'Demand Activation (Week 3-4)', actions: ['Run geo-targeted social ads within city radius', 'Broadcast curated property highlights to buyer database', 'Launch "Best Opportunities in [City]" content campaign', 'Activate buyer referral incentives'], gate: '100+ inquiries generated' },
  { phase: 'Transaction Kickstart (Week 5-8)', actions: ['Coordinate high-density viewing weekends', 'Deploy urgency closing dialogues for active buyers', 'Push premium listing upgrades to top-performing agents', 'Facilitate first 5-10 deal negotiations'], gate: 'First 3 deals closed' },
  { phase: 'Revenue Stabilization (Week 9-12)', actions: ['Achieve recurring premium subscription base of 20+ vendors', 'Establish developer partnership pipeline', 'Track unit economics parity with primary city', 'Set monthly revenue run-rate target'], gate: '$5K+ monthly revenue from new city' },
];

const benchmarks = [
  { metric: 'Time to First Deal', target: '<30 days', comparison: 'Primary city baseline' },
  { metric: 'Listings at Week 4', target: '100+', comparison: 'Minimum viable density' },
  { metric: 'Inquiry-to-Offer Ratio', target: '>20%', comparison: 'Cross-city average' },
  { metric: 'Revenue at Month 3', target: '$8-12K/mo', comparison: 'Break-even threshold' },
  { metric: 'Agent Retention at Month 3', target: '>70%', comparison: 'Ecosystem health signal' },
];

/* ── Section 3: Founder Command Dashboard ── */
const dashboardPanels = [
  { panel: 'Deal Flow Pulse', metrics: ['New serious inquiries today', 'Viewings scheduled (today/this week)', 'Offers submitted (today/this week)', 'Deals closed (this week/month)', 'Revenue generated (today/week/month)'], icon: TrendingUp, priority: 'Critical' },
  { panel: 'Liquidity Movement', metrics: ['Top 5 districts by inquiry velocity', 'High-intent listings (3+ inquiries this week)', 'Stalled negotiations >48h (requires intervention)', 'Supply-demand gap alerts by district', 'Price movement signals in active zones'], icon: BarChart3, priority: 'High' },
  { panel: 'Action Priority Queue', metrics: ['Agents needing follow-up push (slow response)', 'Buyers at decision stage (>2 viewings, no offer)', 'Premium upgrade opportunities (high-inquiry listings)', 'Developer projects pending onboarding', 'Revenue at-risk deals (stalled >72h)'], icon: Zap, priority: 'Critical' },
  { panel: 'City Performance Comparison', metrics: ['Revenue per city (daily/weekly/monthly)', 'Deal velocity ranking across markets', 'Listing density growth by city', 'Agent productivity comparison', 'Expansion market pipeline status'], icon: MapPin, priority: 'Medium' },
];

const commandActions = [
  { trigger: 'Stalled deal >48h', action: 'Auto-escalate to founder for direct intervention call', freq: 'Real-time' },
  { trigger: 'Agent response >2h', action: 'Flag agent + redirect lead to faster responder', freq: 'Real-time' },
  { trigger: 'Listing hits 5+ inquiries', action: 'Suggest premium upgrade to vendor', freq: 'Daily' },
  { trigger: 'District inquiry spike >50%', action: 'Alert: activate supply recruitment in zone', freq: 'Daily' },
  { trigger: 'Weekly revenue <80% of target', action: 'Trigger emergency flash promotion sprint', freq: 'Weekly' },
  { trigger: 'New city deal velocity lagging', action: 'Review replication playbook compliance', freq: 'Weekly' },
];

/* ── Monitoring ── */
const monitoring = [
  { freq: 'Weekly', items: ['Revenue vs $25K weekly target', 'Deal pipeline health (stage distribution)', 'Premium conversion rate trend', 'Agent response speed avg', 'New city activation milestones'] },
  { freq: 'Monthly', items: ['$100K revenue target progress', 'Revenue channel diversification balance', 'City-level revenue contribution mix', 'Subscription renewal rate', 'Expansion market ROI assessment'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'Revenue concentration in primary city >70%', signal: 'New markets not monetizing fast enough', fix: 'Accelerate replication playbook execution — enforce week-by-week gates' },
  { risk: 'Deal velocity plateau', signal: 'Consistent 15-20 deals/month with no growth', fix: 'Expand agent base + introduce deal bonus sprints to break ceiling' },
  { risk: 'Premium churn >30%/month', signal: 'Vendors not seeing ROI from upgrades', fix: 'Implement ROI reporting dashboard showing inquiry/viewing lift from premium' },
  { risk: 'Founder bottleneck on deal interventions', signal: '>10 escalations/day consuming founder time', fix: 'Hire/promote deal coordinator to handle L1 interventions' },
  { risk: 'Replication playbook inconsistency', signal: 'New cities showing wildly different conversion ratios', fix: 'Standardize onboarding + first-30-day execution with strict checklists' },
];

export default function First100KRevenueCityReplicationCommandBlueprint() {
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
                  <CardTitle className="text-xl">$100K Monthly Revenue + City Replication + Founder Command</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Scale monetization, replicate across cities, command execution daily</p>
                </div>
              </div>
              <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/30">💰 $100K/mo</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="revenue">💰 $100K Plan</TabsTrigger>
          <TabsTrigger value="replication">🏙️ City Replication</TabsTrigger>
          <TabsTrigger value="command">🎛️ Command Center</TabsTrigger>
          <TabsTrigger value="monitor">📋 Monitoring</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risks</TabsTrigger>
        </TabsList>

        {/* ── Revenue ── */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /> Revenue Channel Architecture — $100K/Month</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {revenueLevers.map((l, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-semibold text-sm">{l.lever}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">{l.target}</Badge>
                        <Badge variant="secondary" className="text-xs">{l.pct}%</Badge>
                        <Badge variant={l.status === 'Core' ? 'default' : 'outline'} className="text-[10px]">{l.status}</Badge>
                      </div>
                    </div>
                    <Progress value={l.pct * 2.5} className="h-1.5" />
                    <div className="grid gap-1">{l.tactics.map((t, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />{t}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><RefreshCw className="h-4 w-4 text-primary" /> Flywheel Accelerators</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {flywheelAccelerators.map((f, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium">{f.action}</span><Badge variant="outline" className="text-xs">Impact: {f.impact}%</Badge></div>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                    <Progress value={f.impact} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── City Replication ── */}
        <TabsContent value="replication" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> 12-Week City Expansion Playbook</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {replicationPlaybook.map((p, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{p.phase}</span>
                      <Badge variant="secondary" className="text-xs">Gate: {p.gate}</Badge>
                    </div>
                    <div className="grid gap-1">{p.actions.map((a, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />{a}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Cross-City Performance Benchmarks</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {benchmarks.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div><span className="text-sm font-medium">{b.metric}</span><p className="text-xs text-muted-foreground">{b.comparison}</p></div>
                    <Badge variant="outline" className="text-xs">{b.target}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Command Center ── */}
        <TabsContent value="command" className="space-y-4 mt-4">
          <motion.div {...anim(1)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><LayoutDashboard className="h-4 w-4 text-primary" /> Daily Command Dashboard Panels</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {dashboardPanels.map((p, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" /><span className="font-semibold text-sm">{p.panel}</span></div>
                      <Badge variant={p.priority === 'Critical' ? 'destructive' : 'secondary'} className="text-[10px]">{p.priority}</Badge>
                    </div>
                    <div className="grid gap-1">{p.metrics.map((m, j) => <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><Eye className="h-3 w-3 text-primary mt-0.5 shrink-0" />{m}</div>)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(2)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Automated Action Triggers</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {commandActions.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div><span className="text-sm font-medium">{c.trigger}</span><p className="text-xs text-muted-foreground">{c.action}</p></div>
                    <Badge variant="outline" className="text-xs shrink-0">{c.freq}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Monitoring ── */}
        <TabsContent value="monitor" className="space-y-4 mt-4">
          {monitoring.map((m, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base">{m.freq} Revenue & Execution Checklist</CardTitle></CardHeader>
                <CardContent><div className="grid gap-2">{m.items.map((item, j) => <div key={j} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary shrink-0" />{item}</div>)}</div></CardContent>
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
