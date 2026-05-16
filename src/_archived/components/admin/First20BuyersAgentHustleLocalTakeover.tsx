import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Users, CheckCircle, AlertTriangle, Target, Phone, MapPin, Zap, BarChart3, Clock, MessageSquare, TrendingUp, Eye, Flame } from 'lucide-react';

const anim = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

/* ── Section 1: First 20 Serious Buyers ── */
const buyerPhases = [
  { phase: 'Week 1–2: Seed The Pipeline (Target: 5 Serious Buyers)', icon: Target, description: 'Go where buyers already are. Don\'t wait for them to find you.', tactics: [
    { tactic: 'Infiltrate Property WhatsApp/Telegram Groups', detail: 'Join 10-15 local property investment groups. Don\'t spam listings. Instead post: "I have access to 3 properties in [District] priced 15% below market. Serious buyers only — DM me for details." Scarcity + exclusivity attracts real buyers, not tire-kickers.' },
    { tactic: 'Curate a "Top 5 Deals This Week" List', detail: 'Select 5 best-value listings. Create a simple WhatsApp broadcast or Instagram story: "🔥 Top 5 Deals in [District] This Week — prices won\'t last." Include one photo, price, and key selling point per listing. Send every Monday morning.' },
    { tactic: 'Personal Network Mining', detail: 'Message 50 people you know personally: "Hey, do you know anyone looking to buy/invest in property in [City]? I\'m curating exclusive deals below market price." 1 in 10 will refer someone. That\'s 5 warm leads from people who already trust you.' },
    { tactic: 'Respond to Every Inquiry in <10 Minutes', detail: 'Speed is trust. When someone asks about a listing: call them within 10 minutes. "Hi, I saw you\'re interested in [Property]. I can arrange a viewing as early as tomorrow — what time works?" Fast response = serious platform perception.' },
    { tactic: 'Offer "Private Viewing" Experience', detail: 'Don\'t say "schedule a viewing." Say "I\'ve arranged a private showing just for you at [time]." Exclusivity framing converts 2x better than generic scheduling. Even if others are viewing too — make each buyer feel prioritized.' },
  ]},
  { phase: 'Week 3–4: Convert Interest to Action (Target: 15 Serious Buyers)', icon: Zap, description: 'Turn curiosity into physical viewings and real conversations.', tactics: [
    { tactic: 'The "3 Viewings in 1 Afternoon" Package', detail: 'Call every inquiry from weeks 1-2: "I\'ve lined up 3 properties matching your criteria on Saturday afternoon — different prices, same district. One visit, three options." Batched viewings feel efficient and show you have inventory depth.' },
    { tactic: 'Price Comparison Intelligence', detail: 'Before every viewing, send buyer a simple comparison: "This property at Rp 1.8B vs similar properties in the area at Rp 2.1-2.3B. Here\'s why this is strong value." Data-backed value framing accelerates buyer confidence and decision speed.' },
    { tactic: 'Post-Viewing 2-Hour Follow-Up Rule', detail: 'Within 2 hours after every viewing, call the buyer: "How did you feel about the property? What stood out? Any concerns?" This is when emotions are highest. Waiting 24 hours loses 60% of momentum. Strike while the impression is fresh.' },
    { tactic: 'Activate Social Proof Signals', detail: 'After viewings, message buyer: "Just so you know, 2 other parties viewed this property this week and one is considering an offer." Only say this if true — verified competition creates urgency without manipulation.' },
    { tactic: 'Referral Ask After Every Positive Viewing', detail: 'When buyer says they liked a property: "Glad you liked it! By the way, do you know anyone else who might be interested in this area? I can give them priority access." Happy prospects are your best lead source.' },
  ]},
  { phase: 'Week 5–6: Lock In Commitment (Target: 20 Serious Buyers)', icon: Flame, description: 'Push from "interested" to "ready to negotiate" through structured urgency.', tactics: [
    { tactic: 'Weekly "Market Pulse" Update to All Leads', detail: 'Every Monday, send all active leads a 3-line update: "📊 [District] Update: 4 new listings this week, 2 properties under negotiation, 1 sold last week. Reply if you want first access to new inventory." Keeps you top-of-mind without being pushy.' },
    { tactic: 'The "Decision Clarity" Call', detail: 'For buyers who\'ve viewed 2+ properties: "I want to help you make the best decision. Let\'s spend 15 minutes comparing the properties you\'ve seen — I\'ll share what I know about pricing trends and negotiation room." Position yourself as advisor, not salesperson.' },
    { tactic: 'Viewing Event: "Open House Saturday"', detail: 'Organize 1 event per month: 5 properties, 10+ registered buyers, consecutive viewings with refreshments. Creates competitive energy. Buyers see other buyers — "I better decide fast." Generates 2-3 offers per event on average.' },
    { tactic: 'Re-Engagement of Silent Leads', detail: 'Leads who went quiet: "Hi [Name], a new property just came up in [District] that matches what you were looking for — better price than what we saw before. Want me to send details?" New inventory is the best re-engagement trigger.' },
    { tactic: 'Buyer Readiness Scoring', detail: 'Rank all leads: HOT (viewed 2+ properties, asking about price/negotiation), WARM (viewed 1, engaged in conversation), COLD (inquired but no viewing). Spend 70% of time on HOT, 20% on WARM, 10% on COLD. Ruthless prioritization.' },
  ]},
];

const buyerKPIs = [
  { kpi: 'Serious Viewing Requests/Week', target: '5+ by week 4', description: 'Buyers actively requesting property viewings' },
  { kpi: 'Inquiry-to-Viewing Conversion', target: '>35%', description: 'Inquiries that result in scheduled viewings' },
  { kpi: 'Post-Viewing Follow-Up Rate', target: '100% within 2 hours', description: 'Viewings followed up with call/message' },
  { kpi: 'Referral Rate', target: '1 in 4 buyers refers someone', description: 'Satisfied viewers who refer new prospects' },
  { kpi: 'HOT Lead Pipeline', target: '8+ by week 6', description: 'Buyers who viewed 2+ properties and discuss pricing' },
];

/* ── Section 2: Agent Daily Hustle ── */
const hustleBlocks = [
  { block: '☀️ MORNING ACTIVATION (8:00–10:00 AM)', icon: Clock, tone: 'Energetic — "Attack the day before competitors wake up"', scripts: [
    { time: '8:00 AM', action: 'Inbox Blitz', script: 'Open all new inquiries from last night. Respond to EVERY one within 30 minutes. Template: "Good morning! Thank you for your interest in [Property]. I can arrange a viewing for you today or tomorrow — which works better?" Speed is the #1 competitive advantage.' },
    { time: '8:30 AM', action: 'Viewing Confirmation Push', script: 'Call every buyer with a scheduled viewing today: "Hi [Name], just confirming your viewing at [Time] today at [Address]. I\'ll be there 10 minutes early to prepare everything for you." No-show rate drops 40% with morning confirmation calls.' },
    { time: '9:00 AM', action: 'Hot Listing Promotion', script: 'Identify 3 listings with strongest engagement. Share on personal WhatsApp status and 2 property groups: "🔥 High demand alert: [Property] in [District] — 5 viewings scheduled this week. Contact me for priority access." Create urgency from real activity signals.' },
    { time: '9:30 AM', action: 'New Listing Upload Check', script: 'Any properties received from sellers/landlords yesterday? Upload with professional photos, accurate pricing, and compelling descriptions BEFORE 10 AM. Fresh listings get 3x more visibility in first 24 hours. Don\'t let them sit overnight.' },
  ]},
  { block: '🔥 MIDDAY PIPELINE PRESSURE (12:00–2:00 PM)', icon: Phone, tone: 'Opportunity-focused — "Every conversation is a potential deal"', scripts: [
    { time: '12:00 PM', action: 'Post-Viewing Follow-Up Calls', script: 'Call every buyer who viewed a property in the last 48 hours: "Hi [Name], I wanted to check in after your viewing of [Property]. What were your thoughts? If you\'re considering it, I can help you understand the negotiation room available." Convert viewing memory into action.' },
    { time: '12:30 PM', action: 'Negotiation Acceleration', script: 'For active negotiations: call the buyer\'s side and seller\'s agent separately. Understand current positions. Propose bridge: "The seller is at Rp 2.1B, you\'re at Rp 1.9B. Based on market data, Rp 2.0B is fair — shall I propose this?" Be the deal-maker, not just the messenger.' },
    { time: '1:00 PM', action: 'Owner Demand Update', script: 'Call 3 listing owners: "Your property received [X] inquiries and [Y] viewings this week. Interest is strong. Would you consider a small price adjustment to accelerate the transaction?" Owners who see demand signals are more flexible on pricing.' },
    { time: '1:30 PM', action: 'Second Viewing Push', script: 'Buyers who liked a property but didn\'t commit: "I noticed you seemed interested in [Property]. Would you like a second viewing? I can also arrange for you to see a similar property nearby for comparison." Second viewings convert at 2x the rate of first viewings.' },
  ]},
  { block: '🌙 EVENING CLOSURE DISCIPLINE (5:00–7:00 PM)', icon: Target, tone: 'Accountability-driven — "End the day with clear next actions"', scripts: [
    { time: '5:00 PM', action: 'Offer Intention Check', script: 'Call all HOT leads: "Hi [Name], I wanted to check — have you had a chance to discuss [Property] with your family/partner? If you\'re leaning toward making an offer, I can guide you through the process tonight so we can submit tomorrow morning." Evening is decision time for families.' },
    { time: '5:30 PM', action: 'Objection Resolution', script: 'Any buyer who raised concerns: address them directly. Price too high? Share comparable data. Location concern? Highlight development plans. Financing worry? Connect with mortgage partner. Every objection left overnight becomes a reason to say no tomorrow.' },
    { time: '6:00 PM', action: 'Tomorrow\'s Pipeline Prep', script: 'Write down: (1) Who needs a follow-up call tomorrow? (2) Which viewings are scheduled? (3) Which negotiations need intervention? (4) Any new listings to upload? Having this list ready means tomorrow\'s Morning Activation starts instantly.' },
    { time: '6:30 PM', action: 'Daily Performance Self-Check', script: '3 questions: How many viewings did I schedule today? How many follow-ups did I complete? Did any deal move forward? If all three answers are zero — tomorrow must be different. Track honestly, improve consistently.' },
  ]},
];

const hustleKPIs = [
  { kpi: 'First Response Time', target: '<15 minutes', description: 'Time from inquiry to first agent response' },
  { kpi: 'Daily Viewings Scheduled', target: '2+ per agent', description: 'New viewings booked per day' },
  { kpi: 'Follow-Up Completion Rate', target: '100%', description: 'All post-viewing follow-ups completed within 2 hours' },
  { kpi: 'Negotiation Progression', target: '1+ deal moved forward daily', description: 'At least one negotiation advancing per day' },
  { kpi: 'Listing Upload Speed', target: '<24 hours from receipt', description: 'New property listed within one business day' },
];

/* ── Section 3: Local Market Takeover ── */
const takeoverPhases = [
  { phase: 'Phase 1 — Supply Control (Weeks 1–3)', icon: MapPin, description: 'Own the inventory. If you have the listings, you have the power.', tactics: [
    { tactic: 'District Agent Census', detail: 'Identify EVERY active agent in your target micro-district. Visit their offices. Introduce yourself: "We\'re building the most complete property directory for [District]. I want to make sure your listings get maximum visibility — for free initially." Target: onboard 80% of active agents.' },
    { tactic: 'Multi-Price Coverage', detail: 'Ensure listings span the full price range: entry-level (first-time buyers), mid-range (upgraders), premium (investors). A buyer searching your district should find options at every budget. Gaps in coverage = lost buyers to competitors.' },
    { tactic: 'Listing Quality Blitz', detail: 'Visit top 20 properties personally. Take professional-quality photos (natural light, wide angles, clean spaces). Write compelling descriptions highlighting lifestyle and investment value. Quality listings get 5x more inquiries than phone-camera uploads.' },
    { tactic: 'Exclusive First-Access Deals', detail: 'Negotiate with 3-5 agents: "Give me 48-hour exclusive first-access to your new listings before they go on other platforms. In exchange, I\'ll promote them with premium visibility." Exclusive inventory = unique value = buyer magnet.' },
  ]},
  { phase: 'Phase 2 — Demand Magnet (Weeks 3–6)', icon: TrendingUp, description: 'Pull buyers into YOUR district. Make it the obvious place to search.', tactics: [
    { tactic: 'Hyper-Local Facebook/Instagram Ads', detail: 'Budget: $5-10/day. Target: people interested in property + living within 30km of district. Ad copy: "🏠 [District] Property Alert: 15 new listings this week, prices from Rp 800M. See all deals →" Link to district landing page with all listings.' },
    { tactic: '"Most Active Property Area" Content', detail: 'Post weekly on social media: "[District] Property Activity Report: 12 viewings this week, 3 offers submitted, 1 deal closed. The market is moving." Real activity data creates FOMO and positions your district as the place to buy.' },
    { tactic: 'Local Community Partnership', detail: 'Partner with 2-3 local businesses (coffee shops, co-working spaces): put QR code posters linking to your district listings. Offer their customers a "neighborhood guide" with property options. Hyper-local trust beats generic online marketing.' },
    { tactic: 'Word-of-Mouth Referral Engine', detail: 'After every viewing: "If you know anyone interested in [District], I\'ll give them priority access to new listings before they go public." After every closed deal: "Thank you! Any friends or family looking to invest?" Each satisfied interaction is a marketing channel.' },
  ]},
  { phase: 'Phase 3 — Transaction Dominance (Weeks 6–10)', icon: Flame, description: 'Close deals and make it known. Perception of leadership attracts more deals.', tactics: [
    { tactic: 'Deal Velocity Push', detail: 'Every active negotiation gets daily attention. Call both parties. Identify blockers. Propose solutions. Target: close 3-5 deals in your district within 10 weeks. Each closed deal is proof of marketplace leadership.' },
    { tactic: 'Success Story Broadcasting', detail: 'After every closed deal (with permission): "🎉 Another successful transaction in [District]! Congratulations to our buyer and seller. Looking for similar opportunities? We have [X] more properties available." Post on all channels. Success attracts success.' },
    { tactic: 'Local Market Intelligence Authority', detail: 'Publish simple monthly district reports: average prices, popular property types, demand trends, time-on-market data. Position yourself as THE authority on [District] property market. Agents and buyers will come to you because you know the market best.' },
    { tactic: 'Defend Your Territory', detail: 'Monitor competitor activity in your district. If another platform lists properties you don\'t have — onboard those agents immediately. If competitors run promotions — counter with better value. Your district is your fortress. Defend it aggressively.' },
  ]},
];

const takeoverKPIs = [
  { kpi: 'Listings Density Share', target: '>60% of district inventory', description: 'Percentage of known active listings in your micro-district' },
  { kpi: 'Inquiry Volume Growth', target: '+30% week-over-week', description: 'Growing inquiry volume for district listings' },
  { kpi: 'Agent Coverage', target: '>80% of district agents onboarded', description: 'Active agents in district using your platform' },
  { kpi: 'Deals Closed in District', target: '3-5 within 10 weeks', description: 'Transactions completed through your platform' },
  { kpi: 'Brand Recognition', target: '"First name mentioned" for district property', description: 'Local perception as the go-to property platform' },
];

/* ── Checklist ── */
const checklist = [
  { category: 'Buyer Pipeline Health', items: ['Total HOT leads ≥ 8 and growing', 'At least 3 new viewing requests this week', 'All post-viewing follow-ups completed within 2 hours', 'Referral asked after every positive viewing', 'Weekly "Market Pulse" sent to all active leads'] },
  { category: 'Agent Execution Discipline', items: ['All inquiries responded to within 15 minutes', 'Morning viewing confirmations completed by 9 AM', 'Midday negotiation follow-ups done by 2 PM', 'Evening pipeline prep list written before leaving', 'Daily self-check completed honestly'] },
  { category: 'District Domination Progress', items: ['New agents onboarded this week (target: 2+)', 'Listing quality audit done (photos, descriptions, pricing)', 'Local ad campaign running and monitored', 'At least 1 success story shared this week', 'Competitor activity monitored and countered'] },
  { category: 'Momentum Signals', items: ['Viewing-to-offer ratio improving', 'Returning buyer inquiries observed', 'Agent referrals bringing new listings', 'Organic inquiries increasing (non-paid)', 'Word-of-mouth mentions reported'] },
];

/* ── Risks ── */
const risks = [
  { risk: 'Trust deficit: buyers don\'t believe a new platform has real, quality listings — they default to established portals or direct agent contact', mitigation: 'Lead with personal credibility, not platform brand. "I personally verified these properties and can arrange viewings today." Show real photos, real prices, real agent contacts. Trust transfers from people first, platforms second.' },
  { risk: 'Agent apathy: agents list properties but don\'t actively respond to inquiries or push viewings — treating your platform as a passive billboard', mitigation: 'Track and rank agent response times publicly. Reward fast responders with more inquiry routing. Call slow agents directly: "You missed 3 inquiries this week. Buyers went to other agents. Let\'s fix this." Accountability drives behavior.' },
  { risk: 'Viewer-but-not-buyer syndrome: lots of browsing, viewings scheduled, but no one submits offers — pipeline stalls at consideration stage', mitigation: 'Diagnose the block: Is it pricing (too high)? Financing (uncertain)? Decision paralysis (too many options)? Address each specifically. Often it\'s simply no one asking: "Are you ready to make an offer?" — ask directly and guide the process.' },
  { risk: 'District leakage: buyers discover properties through you but close deals directly with agents, bypassing the platform entirely', mitigation: 'Make yourself indispensable to the transaction — provide price comparison data, negotiation support, and viewing coordination that agents can\'t easily replicate alone. The more value you add beyond discovery, the harder you are to bypass.' },
  { risk: 'Founder solo bottleneck: everything depends on the founder\'s personal energy — no systems, no delegation, no sustainable rhythm', mitigation: 'Document every repeatable action as a simple checklist by week 4. By week 6, identify one person (even part-time) who can handle viewing scheduling and follow-up calls. Your job shifts from doing everything to managing the system.' },
];

export default function First20BuyersAgentHustleLocalTakeover() {
  const [activeTab, setActiveTab] = useState('buyers');

  return (
    <div className="space-y-6">
      <motion.div {...anim(0)}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Users className="h-7 w-7 text-primary" />
                <div>
                  <CardTitle className="text-xl">First 20 Serious Buyers + Agent Daily Hustle + Local Market Takeover</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Grassroots buyer acquisition, street-level agent execution & hyper-local district domination</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">🏘️ Street Level</Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="buyers">👥 20 Buyers</TabsTrigger>
          <TabsTrigger value="hustle">📞 Agent Hustle</TabsTrigger>
          <TabsTrigger value="takeover">📍 Takeover</TabsTrigger>
          <TabsTrigger value="monitor">📋 Checklists</TabsTrigger>
          <TabsTrigger value="risks">⚠️ Risks</TabsTrigger>
        </TabsList>

        <TabsContent value="buyers" className="space-y-4 mt-4">
          {buyerPhases.map((p, i) => (
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
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Buyer Acquisition KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{buyerKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="hustle" className="space-y-4 mt-4">
          {hustleBlocks.map((b, i) => (
            <motion.div key={i} {...anim(i + 1)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><b.icon className="h-4 w-4 text-primary" /> {b.block}</CardTitle>
                  <p className="text-xs text-muted-foreground italic">Tone: {b.tone}</p>
                </CardHeader>
                <CardContent className="grid gap-2">{b.scripts.map((s, j) => (
                  <div key={j} className="p-2 rounded border bg-muted/20 space-y-1">
                    <div className="flex items-center gap-2"><Badge variant="outline" className="text-xs shrink-0">{s.time}</Badge><span className="text-sm font-medium">{s.action}</span></div>
                    <p className="text-xs text-muted-foreground">{s.script}</p>
                  </div>
                ))}</CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div {...anim(4)}>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Agent Hustle KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{hustleKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="takeover" className="space-y-4 mt-4">
          {takeoverPhases.map((p, i) => (
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
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Takeover KPIs</CardTitle></CardHeader>
              <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">KPI</th><th className="text-left p-2">Target</th><th className="text-left p-2">Description</th></tr></thead><tbody>{takeoverKPIs.map((k, i) => (<tr key={i} className="border-b border-border/50"><td className="p-2 font-medium">{k.kpi}</td><td className="p-2"><Badge variant="outline" className="text-xs">{k.target}</Badge></td><td className="p-2 text-xs text-muted-foreground">{k.description}</td></tr>))}</tbody></table></div></CardContent>
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
