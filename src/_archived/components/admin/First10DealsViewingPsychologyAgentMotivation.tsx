import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle, AlertTriangle, Target, Eye, Heart, Star, BarChart3, Clock, Zap, Brain, MessageSquare, Users, Flame, Award } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: First 10 Closed Deals ── */
const dealPhases = [
  { phase: 'Deals 1–3: Brute Force Closing (Weeks 1–4)', icon: Flame, description: 'Your only job is closing. Everything else is a distraction.', tactics: [
    { tactic: 'The "Ready-To-Buy" Filter', detail: 'Stop wasting time on browsers. Ask every inquiry 3 qualifying questions: (1) "What\'s your budget range?" (2) "When do you need to move/invest by?" (3) "Have you viewed any properties yet?" If they can\'t answer all three — they\'re not serious. Move on. Focus only on buyers with budget, timeline, and intent.' },
    { tactic: 'Top 5 Hotlist Strategy', detail: 'From all your listings, identify the 5 with strongest buyer signals: most inquiries, most viewings, or best price-to-value ratio. Put 80% of your energy into closing deals on THESE 5 properties. Don\'t spread thin across 50 listings — depth beats breadth for first deals.' },
    { tactic: 'The 2-Hour Post-Viewing Call', detail: 'After every viewing, call the buyer within 2 hours. Not a text — a CALL. "Hi [Name], how did you feel about the property? I could see it fits your [stated need]. If you\'re interested, I can check what negotiation room is available — shall I?" Strike while emotional impression is fresh.' },
    { tactic: 'Seller-Side Price Reality Check', detail: 'Before pushing any deal, call the seller/agent: "I have a serious buyer. Their budget is Rp [X]. What\'s the lowest you\'d realistically accept?" Know the real floor price BEFORE negotiation starts. Most deals die because no one bothered to find the seller\'s actual flexibility first.' },
    { tactic: 'Daily Offer Countdown', detail: 'Track a simple number every day: "How many offers are we trying to get submitted THIS WEEK?" Target: 2 offers per week minimum. If it\'s Thursday and zero offers submitted — emergency mode: call every HOT lead and push for commitment before weekend.' },
  ]},
  { phase: 'Deals 4–7: Pattern Recognition (Weeks 4–8)', icon: Target, description: 'You now know what a closeable deal looks like. Replicate the pattern.', tactics: [
    { tactic: 'Clone Your First Deal Profile', detail: 'Analyze deals 1-3: What property type closed? What price range? What buyer profile? What district? Find MORE properties matching that exact profile. If 2-bedroom apartments at Rp 1.2B in Dago closed — get 10 more like that. Don\'t reinvent; replicate.' },
    { tactic: 'The "Negotiation Bridge" Technique', detail: 'When buyer and seller are apart on price: don\'t just relay numbers. Propose the bridge yourself: "Buyer is at Rp 1.8B, seller at Rp 2.1B. Based on recent transactions in this area, Rp 1.95B is fair market value. I recommend we meet there." Be the dealmaker, not the messenger.' },
    { tactic: 'Parallel Deal Pipelines', detail: 'Never rely on one deal closing. Maintain 5-7 active negotiations simultaneously. When one stalls, another progresses. Diversification prevents the emotional devastation of a single deal falling through. Pipeline math: 7 active negotiations → 2-3 closures.' },
    { tactic: 'Weekend Closing Push', detail: 'Friday afternoon: call every active negotiation buyer. "I spoke with the seller — they\'re ready to finalize this weekend. Can we confirm your offer by Saturday evening?" Weekends are when families discuss big decisions. Give them a reason to decide NOW.' },
    { tactic: 'Transaction Coordination Simplification', detail: 'Remove friction from the closing process. Prepare a simple deal checklist: offer letter template, required documents list, timeline expectations, payment milestones. Buyers who feel the process is clear and simple commit faster than those facing ambiguity.' },
  ]},
  { phase: 'Deals 8–10: Momentum Lock-In (Weeks 8–12)', icon: Trophy, description: 'Build closing rhythm. Your reputation now generates its own gravity.', tactics: [
    { tactic: 'Success Story Marketing', detail: 'After every closed deal (with permission): post a celebration. "🎉 Congratulations to our buyer who just secured their dream home in [District]! This is our [X]th successful transaction." Every success story brings 2-3 new serious inquiries from people who now believe you actually close deals.' },
    { tactic: 'Agent Referral Activation', detail: 'Tell your best-performing agents: "We\'ve closed [X] deals together. I want to grow this. For every new serious buyer you bring me, I\'ll give their listing priority visibility for 2 weeks." Agents who\'ve seen you close deals become your best sales force.' },
    { tactic: 'Buyer Referral at Closing', detail: 'The moment a deal closes — within 24 hours: "Congratulations on your new property! Do you know anyone else looking to buy or invest? I\'d love to give them the same experience." Post-closing happiness = highest referral conversion moment. Don\'t miss it.' },
    { tactic: 'Deal Velocity Optimization', detail: 'By deal 8, you know your bottlenecks. If viewing-to-offer takes too long: push harder on post-viewing follow-up. If negotiation stalls: intervene faster. If document processing delays: prepare templates in advance. Shave 3-5 days off each stage systematically.' },
    { tactic: 'The "10 Deals" Milestone Announcement', detail: 'When you hit 10 deals: make it an event. Email all agents, post on social, update your platform messaging. "10 successful transactions completed. [District] buyers trust us to find and close the best deals." This milestone transforms you from "new platform" to "proven platform."' },
  ]},
];

const dealKPIs = [
  { kpi: 'Offers Submitted Per Week', target: '2+ by week 4', description: 'Active offer submissions from serious buyers' },
  { kpi: 'Negotiation-to-Closure Ratio', target: '>30%', description: 'Active negotiations that result in closed deal' },
  { kpi: 'Viewing-to-Offer Days', target: '<7 days', description: 'Average time from first viewing to offer submission' },
  { kpi: 'Active Negotiation Pipeline', target: '5-7 simultaneous', description: 'Concurrent deals in negotiation stage' },
  { kpi: 'Deal Cycle Duration', target: '<28 days', description: 'Total time from first inquiry to transaction closure' },
  { kpi: 'Stalled Deal Intervention Speed', target: '<48 hours', description: 'Time to intervene when negotiation stops progressing' },
];

/* ── Section 2: Viewing Conversion Psychology ── */
const psychologyPhases = [
  { phase: 'PRE-VIEWING: Expectation Engineering', icon: Brain, description: 'The viewing starts BEFORE the buyer arrives. Frame their expectations to maximize conversion.', techniques: [
    { technique: 'Priority Alignment Call (24h Before)', detail: 'Call the buyer the day before: "Before tomorrow\'s viewing, I want to make sure we focus on what matters to you. What are your top 3 non-negotiables?" Then at the viewing, point out how the property meets THOSE specific criteria. When buyers see their own priorities reflected, they feel the property was "chosen for them."' },
    { technique: 'Value Anchoring Message', detail: 'Send a WhatsApp 3 hours before viewing: "Quick context for tomorrow — similar properties in [District] are listed at Rp [Higher Price]. The one we\'re viewing is priced at Rp [Lower Price] because [reason: motivated seller / new listing / off-market]. Just wanted you to have the full picture." This anchors perceived value BEFORE they walk in.' },
    { technique: 'Scarcity Pre-Frame', detail: 'If true, mention: "I should let you know — two other parties have requested viewings this week. I scheduled yours first because you seem the most serious. If you like it, I\'d recommend moving quickly." Only say this with verified data. Authentic scarcity creates healthy urgency.' },
    { technique: 'Investment Narrative Setup', detail: 'For investor buyers: send a 3-line market brief. "📊 [District] rental yield: 6.2% average. Property appreciation last 2 years: +18%. This area is outperforming [comparison district] by 2.1%." Numbers transform emotional decisions into rational ones — which paradoxically makes investors decide faster.' },
  ]},
  { phase: 'DURING VIEWING: Emotional Anchoring', icon: Eye, description: 'Buyers decide emotionally and justify logically. Guide both processes.', techniques: [
    { technique: 'The "Ownership Visualization" Technique', detail: 'Don\'t just show rooms — help buyers imagine living there. "This living room gets beautiful morning light — perfect for your coffee routine." "This bedroom would work great as a home office." "Your kids would love this garden space." When buyers mentally move in, they\'re halfway to buying.' },
    { technique: 'The "Best Feature Last" Sequence', detail: 'Tour the property strategically: start with good rooms, save the BEST feature for last (rooftop view, garden, renovated kitchen). The last impression dominates memory. When you ask "What did you think?" their mind goes to that final wow moment.' },
    { technique: 'Silent Observation Moments', detail: 'After showing a great feature, STOP TALKING for 10-15 seconds. Let the buyer absorb it. Most agents nervously fill silence with facts. But silence creates space for the buyer to feel. "Look at this view..." [pause]. Their emotional reaction in silence is worth more than 100 data points.' },
    { technique: 'Casual Comparison Dropping', detail: '"Honestly, I showed a similar property last week at Rp [Higher Price] and it didn\'t have this [feature]. You\'re getting a better deal here." This isn\'t pressure — it\'s context. Buyers who understand relative value feel confident in their assessment.' },
    { technique: 'The Physical Anchor', detail: 'Encourage buyers to touch things: open cabinets, sit on the terrace, look out windows. Physical interaction creates psychological ownership. "Go ahead, check the kitchen counter — it\'s real marble." The more they interact, the more it feels like theirs.' },
  ]},
  { phase: 'POST-VIEWING: Decision Momentum', icon: Zap, description: 'The 48 hours after a viewing determine everything. Act fast or lose the deal.', techniques: [
    { technique: 'The 2-Hour Debrief Call', detail: 'Call within 2 hours: "I saw your face light up when you saw [specific feature]. What was your overall impression?" Start with their emotional reaction, then move to practical questions. This call has ONE goal: identify if they\'re ready to discuss an offer or what\'s holding them back.' },
    { technique: 'The "Simple Comparison" Follow-Up', detail: 'Send a WhatsApp within 4 hours with a simple 3-column comparison: the property they viewed vs 2 alternatives (one more expensive, one with fewer features). Make the viewed property the obvious best choice. Visual comparisons eliminate decision paralysis.' },
    { technique: 'Verified Competition Signal', detail: '24 hours after viewing, if another party has shown interest: "Just wanted to update you — another buyer has requested a second viewing for [Property]. I don\'t want you to miss out if you\'re seriously considering it. Want to discuss next steps?" Only use with real, verified signals.' },
    { technique: 'The "Next Step" Close', detail: 'Never ask "Are you interested?" Instead ask: "Would you like me to check what negotiation room is available with the seller?" This assumes interest and proposes a concrete action. It\'s easier to say yes to a small step than to a big decision.' },
    { technique: 'The 72-Hour Decision Window', detail: 'If buyer is interested but hesitating: "I completely understand wanting to think it over. Can I suggest we set a decision checkpoint for Wednesday? That way I can hold your priority position and you have time to discuss with your family." Deadlines create action.' },
  ]},
];

const psychKPIs = [
  { kpi: 'Pre-Viewing Briefing Completion', target: '100% of viewings', description: 'Every viewing preceded by priority alignment call' },
  { kpi: 'Post-Viewing 2-Hour Follow-Up', target: '100% compliance', description: 'Debrief call completed within 2 hours of every viewing' },
  { kpi: 'Viewing-to-Offer Conversion', target: '>25%', description: 'Viewings that result in offer submission' },
  { kpi: 'Second Viewing Request Rate', target: '>40%', description: 'First viewings that lead to second viewing or offer discussion' },
  { kpi: 'Buyer Response Speed Post-Follow-Up', target: '<4 hours', description: 'Time for buyer to respond after follow-up message' },
];

/* ── Section 3: Agent Motivation Micro-System ── */
const motivationPillars = [
  { pillar: 'Recognition & Status Drivers', icon: Star, description: 'Agents are motivated by visibility and peer recognition more than money alone.', mechanics: [
    { mechanic: 'Weekly "Deal Closer" Spotlight', detail: 'Every Monday, announce in agent WhatsApp group: "🏆 This week\'s top performer: [Agent Name] — closed [X] deals, responded to inquiries in an average of [Y] minutes. Thank you for setting the standard!" Public recognition among peers is the most powerful motivator. It costs nothing and drives everything.' },
    { mechanic: 'First Deal Celebration', detail: 'When an agent closes their first deal through your platform: send a personal congratulations message, share the success in the agent group, and offer a small perk (2 weeks free premium listing). First-deal celebration creates emotional commitment to your platform — they\'ll always remember you celebrated their win.' },
    { mechanic: 'Monthly Agent Leaderboard', detail: 'Simple ranking: Top 5 agents by (1) deals closed, (2) response speed, (3) viewing conversion rate. Share on the 1st of every month. Agents are competitive — seeing their ranking drives improvement. Even agents ranked #6 will work harder to make the top 5 next month.' },
    { mechanic: '"Trusted Agent" Badge', detail: 'After 3 successful deals: agent receives a "Trusted Agent" badge visible on their listings. This badge increases buyer inquiry rates by signaling reliability. Agents who earn it become emotionally invested in maintaining that status. Loss aversion > acquisition motivation.' },
  ]},
  { pillar: 'Performance-Based Incentives', icon: Award, description: 'Small, frequent rewards beat large, distant promises. Make success feel immediate.', mechanics: [
    { mechanic: 'Milestone Visibility Rewards', detail: 'After Deal #1: 1 week free premium listing. After Deal #3: 2 weeks premium + featured agent status. After Deal #5: 1 month premium + priority inquiry routing. Small, escalating rewards create a progression feeling — each deal brings a tangible benefit. Agents see direct ROI from effort.' },
    { mechanic: 'Speed Response Bonus', detail: 'Agents who maintain <15-minute average response time for a full week: get 3 free listing boosts. Track and announce weekly: "These agents responded fastest this week: [Names]. Their listings are getting priority visibility." Speed becomes a competitive advantage agents can see.' },
    { mechanic: 'Referral Commission Enhancement', detail: 'Agents who refer another agent who lists 5+ properties: get enhanced visibility for 2 weeks. "Grow our network and your own exposure grows." This turns agents into recruiters — they bring colleagues because it directly benefits their own business.' },
    { mechanic: 'Flash Performance Challenges', detail: 'Weekly micro-challenges: "First agent to schedule 3 viewings this week gets their top listing featured on the homepage for 5 days." Short-burst competitions create excitement without requiring sustained effort. Variety keeps motivation fresh.' },
  ]},
  { pillar: 'Daily Engagement & Support', icon: MessageSquare, description: 'Agents stay when they feel supported, not just monitored.', mechanics: [
    { mechanic: 'Morning Briefing Message', detail: 'Every morning at 8 AM, send to agent group: "Good morning team! 📊 Yesterday: [X] new inquiries, [Y] viewings completed, [Z] offers submitted. Today\'s opportunity: [District] has 5 new buyer inquiries — respond fast for best results!" Daily context makes agents feel part of something active and growing.' },
    { mechanic: 'Negotiation Coaching Moments', detail: 'When an agent\'s deal stalls, call them: "I noticed the negotiation on [Property] hasn\'t moved in 3 days. What\'s the blocker? Let me help." Then provide specific advice: price adjustment suggestion, buyer re-engagement script, or seller flexibility check. Agents who receive coaching stay longer than those who receive orders.' },
    { mechanic: 'Weekly 1-on-1 Check-In (Top 5 Agents)', detail: 'Spend 10 minutes per week with each top-5 agent: "How are things going? What challenges are you facing? How can I help you close more deals?" Personal attention from the platform founder creates loyalty that competitors can\'t match with features alone.' },
    { mechanic: 'Lead Quality Feedback Loop', detail: 'After every inquiry routed to an agent, ask: "How was this lead? Serious/moderate/not serious?" Use feedback to improve routing quality. Agents who see their feedback improving lead quality feel valued and invested in the system\'s success.' },
  ]},
];

const retentionKPIs = [
  { kpi: 'Weekly Active Agent Rate', target: '>80%', description: 'Agents who respond to at least 1 inquiry per week' },
  { kpi: 'Agent Listing Continuity', target: '90%+ listings kept active', description: 'Agents maintaining their listings on platform' },
  { kpi: 'Agent NPS/Satisfaction', target: '>7/10 average', description: 'Monthly quick satisfaction pulse check' },
  { kpi: 'Agent Referral Rate', target: '1 in 5 agents refers a colleague', description: 'Agents bringing new agents to the platform' },
  { kpi: 'Top Agent Retention', target: '100% of top 5 retained monthly', description: 'Best performers staying active on platform' },
];

/* ── Checklist ── */
const checklist = [
  { category: 'Deal Pipeline Health', items: ['Active negotiations ≥ 5 simultaneously', 'At least 2 offers submitted this week', 'All stalled negotiations intervened within 48 hours', 'Seller price flexibility verified for top 5 listings', 'Deal progress tracker updated daily'] },
  { category: 'Viewing Conversion Discipline', items: ['Pre-viewing briefing call completed for every viewing', 'Post-viewing debrief call within 2 hours — no exceptions', 'Comparison follow-up sent within 4 hours', 'Decision checkpoint proposed within 72 hours', 'Competition signals shared only when verified'] },
  { category: 'Agent Ecosystem Vitality', items: ['Monday spotlight announcement sent', 'Response time leaderboard updated', 'At least 1 coaching call with struggling agent this week', 'Morning briefing message sent every day', 'Top 5 agent check-ins completed'] },
  { category: 'Momentum Signals to Track', items: ['Referrals received from closed-deal buyers', 'Agents proactively sending new listings', 'Repeat inquiries from returning buyers', 'Organic agent sign-ups (not recruited)', 'Success story engagement on social channels'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'Deal-stage paralysis: buyers view properties, express interest, but never submit offers — pipeline looks healthy but nothing actually closes', mitigation: 'Diagnose the specific block for each stalled buyer. Is it price? Ask "What price would make this a yes?" Is it timing? Ask "What needs to happen before you can decide?" Is it confidence? Provide market data and comparables. Usually it\'s simply that nobody directly asked: "Shall I check negotiation room with the seller?" Ask the closing question.' },
  { risk: 'Agent ghosting: agents list properties but stop responding to inquiries — they treat your platform as a passive billboard rather than an active deal channel', mitigation: 'Implement 24-hour response monitoring. If an agent doesn\'t respond to an inquiry within 24 hours: reassign the lead to another agent AND notify the original agent: "Your lead was reassigned due to no response. Respond within 1 hour to retain future leads." Loss of leads is a stronger motivator than promises of rewards.' },
  { risk: 'Price expectation mismatch: sellers want premium prices, buyers want bargains — every negotiation dies in the gap between expectations', mitigation: 'Become the market data authority. Before listing, show sellers recent transaction data: "Similar properties sold at Rp [X], not Rp [Y]." Before negotiating, show buyers fair value range. When both parties trust your data, they meet in the middle. Your role is truth-teller, not cheerleader for either side.' },
  { risk: 'Viewing tourism: buyers schedule viewings for entertainment or distant future planning — they consume agent time without genuine purchase intent', mitigation: 'Pre-qualify harder. Before scheduling any viewing, ask: "If you love this property, are you ready to discuss an offer within a week?" If the answer is no, they\'re not ready for a viewing — send them listing details and follow up when they are. Protect agent time ruthlessly; it\'s your most valuable asset.' },
  { risk: 'Single-agent dependency: 1-2 agents generate all activity — if they leave or slow down, your entire pipeline collapses', mitigation: 'Never let one agent represent >30% of your active pipeline. Actively onboard new agents every week even when current agents are producing. When your top agent sees you growing the network, they\'ll work harder to maintain their position — healthy competition strengthens everyone.' },
];

export default function First10DealsViewingPsychologyAgentMotivation() {
  const [activeTab, setActiveTab] = useState('deals');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Trophy className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">First 10 Closed Deals + Viewing Psychology + Agent Motivation</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Deal acceleration tactics, buyer decision psychology & agent ecosystem motivation</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">🏆 First 10</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="deals">🏆 10 Deals</TabsTrigger>
          <TabsTrigger value="psychology">🧠 Psychology</TabsTrigger>
          <TabsTrigger value="motivation">⭐ Motivation</TabsTrigger>
          <TabsTrigger value="monitor">📋 Checklists</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risks</TabsTrigger>
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
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Deal Acceleration KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{dealKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="psychology" className="space-y-4 mt-4">
          {psychologyPhases.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" /> {p.phase}</CardTitle>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </CardHeader>
                <CardContent className="grid gap-2">{p.techniques.map((t, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{t.technique}</span>
                    <p className="text-xs text-muted-foreground">{t.detail}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Psychology KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{psychKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="motivation" className="space-y-4 mt-4">
          {motivationPillars.map((p, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><p.icon className="h-4 w-4 text-primary" /> {p.pillar}</CardTitle>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </CardHeader>
                <CardContent className="grid gap-2">{p.mechanics.map((m, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <span className="text-sm font-medium">{m.mechanic}</span>
                    <p className="text-xs text-muted-foreground">{m.detail}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Retention KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{retentionKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
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
