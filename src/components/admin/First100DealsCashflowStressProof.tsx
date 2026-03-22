import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Swords, CheckCircle, AlertTriangle, TrendingUp, Target, Shield, DollarSign, BarChart3, Users, Zap, Brain, Heart, Clock, Phone, Wallet, Flame } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: First 100 Deals ── */
const dealPhases = [
  { phase: 'Phase 1 — First 10 Deals (Weeks 1–6)', icon: Flame, description: 'Pure hustle. No systems, no scale — just close deals by any means necessary.', tactics: [
    { tactic: 'Agent-With-Ready-Buyers First', detail: 'Don\'t onboard agents with "future listings." Find 5 agents who have buyers actively looking RIGHT NOW. Ask: "Do you have a buyer who needs a property this month?" If yes, onboard. If no, move on.' },
    { tactic: 'One Micro-District Only', detail: 'Pick ONE district (e.g., Dago, Bandung or Kemang, Jakarta). List every available property there — 30+ listings minimum. Buyers searching this district find you unavoidable. Depth beats breadth at this stage.' },
    { tactic: 'Price-To-Move Inventory', detail: 'Prioritize listings priced 10-15% below district average. These close fastest. Tell agents: "I need your most competitively priced properties first — they\'ll generate your first commissions fastest."' },
    { tactic: 'Founder-Led Follow-Up', detail: 'YOU personally call/WhatsApp every inquiry within 15 minutes. "Hi, I\'m the founder. I saw you inquired about [property]. Can I schedule a viewing for you tomorrow?" — founder attention converts at 3x agent response rate.' },
    { tactic: 'Same-Day Viewing Clusters', detail: 'Schedule 3-4 viewings for same buyer on same afternoon in same district. More options = higher chance one clicks. After viewings, call buyer that evening: "Which property felt right? Let\'s discuss next steps."' },
  ]},
  { phase: 'Phase 2 — Deals 10–50 (Weeks 6–14)', icon: Zap, description: 'Build repeatable patterns. Start delegating but stay close to every deal.', tactics: [
    { tactic: 'Expand to 3 Districts', detail: 'Add 2 adjacent districts. Now cover 100+ listings across 3 zones. Each zone has a "district champion" agent who knows every property and responds within 30 minutes.' },
    { tactic: 'Buyer Urgency Messaging', detail: 'After first viewing, send within 2 hours: "3 other buyers viewed this property this week. The seller is expecting offers by Friday." — create time pressure without lying (track actual viewing data).' },
    { tactic: 'Negotiation Intervention Protocol', detail: 'When deal stalls: Founder calls both buyer and seller agent separately. Understand objection. Propose bridge solution. "What if we split the difference and close by end of month?" — personal intervention closes 40% of stalled deals.' },
    { tactic: 'Weekly Deal Pipeline Review', detail: 'Every Monday: list all active negotiations. Red/yellow/green status. Red = intervene today. Yellow = follow up by Wednesday. Green = confirm close date. No deal sits without action for >48 hours.' },
    { tactic: 'First Premium Upsells', detail: 'Agents with 2+ closed deals offered free premium trial. Show them inquiry difference. "Your premium listings got 4x more inquiries. Want to keep this going?" — convert 30%+ to paid after seeing results.' },
  ]},
  { phase: 'Phase 3 — Deals 50–100 (Weeks 14–24)', icon: Target, description: 'Systemize what works. Build small team. Maintain deal quality.', tactics: [
    { tactic: 'Hire First Deal Coordinator', detail: 'One person dedicated to: scheduling viewings, following up after viewings, tracking negotiation status, updating pipeline. Founder shifts to intervention-only on stalled deals.' },
    { tactic: 'Agent Performance Ranking', detail: 'Rank agents by: response speed, viewing conversion, deal closure rate. Top 20% get priority inquiry routing. Bottom 20% get coaching call or replacement. Ruthless meritocracy drives results.' },
    { tactic: 'Buyer Referral Activation', detail: 'After every closed deal: "Do you know anyone else looking for property? We\'ll give them priority access to new listings." — 1 in 4 closed buyers refers someone. Best leads with zero acquisition cost.' },
    { tactic: 'Weekend Viewing Blitzes', detail: 'Monthly Saturday event: 10 properties, 20+ registered buyers, clustered viewings with refreshments. Creates event energy, competitive buyer psychology, and generates 3-5 offers per event.' },
    { tactic: 'Deal Velocity Tracking', detail: 'Measure average days: inquiry → viewing (target <3), viewing → offer (target <7), offer → close (target <21). Total pipeline: <31 days. Identify and eliminate bottlenecks weekly.' },
  ]},
];

const dealKPIs = [
  { kpi: 'Deals Closed Per Week', target: '4+ by month 4', description: 'Sustained weekly closure rate' },
  { kpi: 'Inquiry-to-Viewing Conversion', target: '>40%', description: 'Serious inquiries converting to scheduled viewings' },
  { kpi: 'Viewing-to-Offer Ratio', target: '>25%', description: 'Viewings resulting in offer submission' },
  { kpi: 'Average Deal Cycle', target: '<31 days', description: 'Inquiry to closed transaction duration' },
  { kpi: 'Agent Response Time', target: '<30 minutes', description: 'First response to buyer inquiry' },
  { kpi: 'Stalled Deal Recovery Rate', target: '>40%', description: 'Stalled negotiations rescued by intervention' },
];

/* ── Section 2: Cashflow Survival ── */
const cashflowPillars = [
  { pillar: 'Revenue First, Always', icon: DollarSign, description: 'Every decision filtered through: "Does this generate revenue this month?"', rules: [
    { rule: 'Monetize From Deal #1', detail: 'Don\'t wait for scale to monetize. First deal: take 1-2% facilitation fee or negotiate agent commission split. Even $50 per deal matters — it proves the model and builds revenue habit.' },
    { rule: 'Premium Upgrades Before Features', detail: 'Before building ANY new feature, ask: "Can I sell a premium listing upgrade instead?" Manual premium placement (you personally reorder search results) costs $0 to implement and generates immediate revenue.' },
    { rule: 'Vendor Promotional Packages', detail: 'Offer agents: "$100/month for 5 featured listings + weekly performance report." Start with 10 agents. That\'s $1K/month recurring. Simple. No tech needed — manage in a spreadsheet if necessary.' },
    { rule: 'Commission on Closed Deals', detail: 'Negotiate 0.5-1% platform commission on deals facilitated through platform. On Rp 2B property = Rp 10-20M ($600-1,200) per deal. 10 deals/month = $6K-12K. This is the core revenue engine.' },
    { rule: 'Kill Non-Revenue Activity', detail: 'If an activity doesn\'t lead to a listing, an inquiry, a viewing, or a deal within 7 days — stop doing it. Blog posts, social media, partnerships, integrations — all secondary until revenue covers monthly burn.' },
  ]},
  { pillar: 'Cost Containment — Survival Mode', icon: Shield, description: 'Spend like you have 3 months of runway even if you have 12', rules: [
    { rule: 'Zero Paid Marketing Until Deal #20', detail: 'First 20 deals come from direct outreach, agent networks, and founder hustle. If you can\'t close deals without paid ads, paid ads won\'t help — they\'ll just burn cash faster.' },
    { rule: 'No Hire Until Revenue Covers Salary', detail: 'First hire happens when monthly revenue consistently exceeds their salary by 2x. Until then: founder does everything. Co-founder or intern fills gaps. Resist the "I need a team" temptation.' },
    { rule: 'Tech Spending Cap: $200/month', detail: 'Supabase free tier, Vercel free tier, free analytics, WhatsApp personal account for comms. No premium tools, no fancy subscriptions. Every dollar to tech is a dollar not closing deals.' },
    { rule: 'Office = Coffee Shop or Home', detail: 'No office lease. No co-working membership over $50/month. Meet agents at their offices or property sites. Your office is your phone and laptop.' },
    { rule: 'Monthly Burn Review Ritual', detail: 'Last Friday of every month: list every expense. Ask for each: "Did this directly contribute to a deal this month?" If no for 2 consecutive months, cut it.' },
  ]},
  { pillar: 'Weekly Cashflow Visibility', icon: Wallet, description: 'Know your exact financial position every single week', rules: [
    { rule: 'Friday Cash Position Report', detail: 'Every Friday: bank balance, expected revenue next 2 weeks, committed expenses next 2 weeks, net position. Takes 15 minutes. Prevents cash surprises.' },
    { rule: 'Revenue Coverage Ratio', detail: 'Track: monthly revenue / monthly burn. Target: >0.3 by month 3, >0.6 by month 6, >1.0 by month 9. If ratio stalls for 2 months, cut costs immediately — don\'t hope for revenue acceleration.' },
    { rule: '6-Month Runway Floor', detail: 'Never let runway drop below 6 months. If approaching 6 months: stop all non-essential spending, accelerate revenue efforts, consider bridge funding. Running out of cash kills more startups than bad products.' },
    { rule: 'Revenue Milestones Gate Expansion', detail: '$1K/month → hire first part-time help. $3K/month → small marketing budget. $5K/month → first full-time hire. $10K/month → consider second city. Never expand ahead of revenue.' },
    { rule: 'Cash Buffer for Deal Commission Delays', detail: 'Property commissions take 30-60 days to collect after deal closes. Maintain 2-month cash buffer to survive commission collection delays. Factor this lag into all projections.' },
  ]},
];

const cashflowKPIs = [
  { kpi: 'Weekly Revenue', target: 'Growing every week', description: 'Any amount — but must trend upward consistently' },
  { kpi: 'Revenue Coverage Ratio', target: '>0.6 by month 6', description: 'Monthly revenue / monthly burn rate' },
  { kpi: 'Monthly Burn Rate', target: '<$2K for first 6 months', description: 'Total monthly operational spending' },
  { kpi: 'Runway Duration', target: '>6 months always', description: 'Months of operation at current burn with zero revenue' },
  { kpi: 'CAC Payback', target: '<60 days', description: 'Time to recover cost of acquiring a paying vendor' },
];

/* ── Section 3: Founder Stress-Proof OS ── */
const stressFrameworks = [
  { framework: 'Daily Priority Rule: The 3-Deal Filter', icon: Target, practices: [
    { practice: 'Morning Question (Before 8 AM)', detail: '"What are the 3 actions today that will move a deal closer to closing?" Write them down. Do them first. Everything else waits. Email, features, meetings — all secondary to deal-moving actions.' },
    { practice: 'The 15-Minute Response Rule', detail: 'Every inquiry gets founder response within 15 minutes during business hours. Set phone alerts. This one discipline alone can double your conversion rate. Speed = trust = deals.' },
    { practice: 'No-Meeting Mornings', detail: '8 AM – 12 PM: zero meetings. This is deal-closing time. Calls to buyers, agent follow-ups, negotiation interventions. Protect these hours ruthlessly — they generate 80% of your revenue.' },
    { practice: 'Evening Pipeline Update (5 minutes)', detail: 'Before ending work: update deal status for every active negotiation. Red/yellow/green. Tomorrow morning\'s 3 priorities come from this list. Never start a day without knowing exactly what to do.' },
    { practice: 'Weekly "What Actually Closed?" Review', detail: 'Every Sunday evening: how many deals actually closed this week? Not how many meetings, not how many features built — deals closed. If the number didn\'t grow, next week\'s plan must change.' },
  ]},
  { framework: 'Emotional Resilience Mechanics', icon: Heart, practices: [
    { practice: 'The "10 No\'s Before Breakfast" Mindset', detail: 'Rejection is the job. Agents saying no, buyers ghosting, deals falling through — this is normal. Track rejections. Celebrate reaching 10 no\'s before lunch — it means you\'re actually working, not hiding behind a screen.' },
    { practice: 'Small Wins Journal', detail: 'End of each day: write down 1 thing that went well, no matter how small. "Agent agreed to list 3 properties." "Buyer scheduled second viewing." Momentum comes from acknowledging progress, not just measuring gaps.' },
    { practice: 'The 48-Hour Perspective Rule', detail: 'When something feels catastrophic (lost deal, agent leaves, competitor launches): wait 48 hours before making strategic changes. 90% of "crises" look manageable after 2 days of continued execution.' },
    { practice: 'Founder Peer Check-In', detail: 'Weekly 30-minute call with another founder (not in real estate). Vent, compare notes, reality-check emotions. Isolation amplifies stress. One honest conversation per week is a survival tool.' },
    { practice: 'Separate Identity From Metrics', detail: 'A bad week doesn\'t mean you\'re a bad founder. Revenue dips are data points, not verdicts. Maintain this separation consciously — it prevents emotional spirals that destroy decision quality.' },
  ]},
  { framework: 'Execution Energy Management', icon: Zap, practices: [
    { practice: 'Peak Hours for Peak Tasks', detail: 'Identify your 3 highest-energy hours (usually morning). Use ONLY for deal-closing activities: buyer calls, agent negotiations, viewing coordination. Never waste peak hours on admin, email, or planning.' },
    { practice: 'The "Trusted 3" Support Circle', detail: 'Identify 3 people you can call for operational help: one agent who gives honest feedback, one mentor who\'s built a marketplace, one friend who keeps you grounded. Not advisors — people who answer the phone.' },
    { practice: 'Weekly Rhythm Over Daily Heroics', detail: 'Monday: supply push. Tuesday-Thursday: buyer conversion and deal closing. Friday: pipeline review and next week planning. Consistent rhythm beats occasional 16-hour heroic days.' },
    { practice: 'Physical Energy Non-Negotiables', detail: '7+ hours sleep, 30 minutes exercise, one proper meal before noon. These aren\'t luxuries — they\'re performance tools. Tired founders make bad decisions. Bad decisions kill startups.' },
    { practice: 'Quarterly Reset Day', detail: 'Every 3 months: one full day completely off. No phone, no email, no property talk. Return with fresh perspective. Founders who never disconnect slowly lose the creativity and judgment that made them founders.' },
  ]},
];

const founderKPIs = [
  { kpi: 'Daily Execution Consistency', target: '5+ days/week hitting 3 priorities', description: 'Days where all 3 deal-focused priorities completed' },
  { kpi: 'Decision Speed', target: '<24 hours for operational decisions', description: 'Time from problem identification to action taken' },
  { kpi: 'Stress Recovery Speed', target: '<48 hours after setback', description: 'Time to return to normal execution rhythm after a blow' },
  { kpi: 'Weekly Traction Momentum', target: 'Improving 4 of every 5 weeks', description: 'Weeks showing improvement in at least one core metric' },
];

/* ── Checklist ── */
const checklist = [
  { category: 'Deal Traction', items: ['Deals closed this week ≥ target', 'All active negotiations have <48h old follow-up', 'Agent response time <30 minutes maintained', 'Viewing-to-offer ratio tracked and improving', 'Stalled deals received personal intervention'] },
  { category: 'Cashflow Health', items: ['Friday cash position report completed', 'Revenue coverage ratio calculated and tracked', 'No expense added without "deal impact" justification', 'Runway >6 months confirmed', 'Commission collection timeline monitored'] },
  { category: 'Founder Execution', items: ['3 deal-focused priorities set every morning', 'No-meeting mornings protected', 'Evening pipeline status updated', 'Small wins journaled daily', 'Weekly peer check-in completed'] },
  { category: 'Growth Signals', items: ['At least 1 buyer referral received this week', 'Agent network growing (net positive onboarding)', 'Listing quality improving (photo/description standards)', 'Repeat inquiries from returning buyers observed', 'Premium upgrade interest from agents noted'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'Feature trap: spending weeks building features instead of closing deals — "If I just add this one feature, agents will come"', mitigation: 'Set hard rule: no feature development until 20 deals closed. Every feature idea goes on a list reviewed only after revenue milestone. The product is good enough — distribution is the bottleneck.' },
  { risk: 'Agent dependency: 1-2 agents generating all deals, creating single-point-of-failure risk', mitigation: 'Never let any agent represent >25% of deal pipeline. Actively onboard new agents even when current ones are producing. Diversification is survival insurance.' },
  { risk: 'Cash blindness: not tracking burn rate precisely, waking up to unexpected runway crisis', mitigation: 'Non-negotiable Friday cash report. Set phone alarm. Takes 15 minutes. If you skip it twice, you\'re in danger. Financial awareness is as important as deal closing.' },
  { risk: 'Founder burnout: 80-hour weeks for 3+ months without visible traction leading to decision paralysis', mitigation: 'Maintain physical non-negotiables (sleep, exercise). Use 48-hour perspective rule. Talk to peer founder weekly. If burnout symptoms appear, take 2 days off — lost deals are recoverable, lost health is not.' },
  { risk: 'Premature scaling: hiring team or expanding to new city before first city is reliably producing deals', mitigation: 'Gate all expansion behind revenue milestones. First city must produce 10+ deals/month before considering city #2. Scaling a broken model just breaks it faster and more expensively.' },
];

export default function First100DealsCashflowStressProof() {
  const [activeTab, setActiveTab] = useState('deals');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-destructive/20 bg-gradient-to-br from-background to-destructive/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Swords className="h-7 w-7 text-destructive" />
                <div>
                  <CardTitle className="text-xl">First 100 Deals + Cashflow Survival + Stress-Proof Execution</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Raw traction warfare, financial survival discipline & founder mental resilience</p>
                </div>
              </div>
              <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/30">⚔️ Survival Mode</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="deals">⚔️ 100 Deals</TabsTrigger>
          <TabsTrigger value="cashflow">💵 Cashflow</TabsTrigger>
          <TabsTrigger value="founder">🧠 Stress-Proof</TabsTrigger>
          <TabsTrigger value="monitor">📋 Checklists</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risk Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="space-y-4 mt-4">
          {dealPhases.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" /> {p.phase}</CardTitle>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </CardHeader>
                <CardContent className="grid gap-2">{p.tactics.map((t, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{t.tactic}</span>
                    <p className="text-xs text-muted-foreground">{t.detail}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Deal KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{dealKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4 mt-4">
          {cashflowPillars.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" /> {p.pillar}</CardTitle>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </CardHeader>
                <CardContent className="grid gap-2">{p.rules.map((r, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{r.rule}</span>
                    <p className="text-xs text-muted-foreground">{r.detail}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Cashflow KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{cashflowKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="founder" className="space-y-4 mt-4">
          {stressFrameworks.map((f, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><f.icon className="h-4 w-4 text-primary" /> {f.framework}</CardTitle></CardHeader>
                <CardContent className="grid gap-2">{f.practices.map((p, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{p.practice}</span>
                    <p className="text-xs text-muted-foreground">{p.detail}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Founder KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{founderKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4 mt-4">
          {checklist.map((c, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader><CardTitle className="text-base">{c.category}</CardTitle></CardHeader>
                <CardContent><div className="grid gap-2">{c.items.map((item, j) => <div key={j} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary shrink-0" />{item}</div>)}</div></CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="risks" className="space-y-4 mt-4">
          {risks.map((r, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card className="border-destructive/20">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="font-semibold text-sm">{r.risk}</span></div>
                  <div className="text-xs"><strong>Mitigation:</strong> {r.mitigation}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
