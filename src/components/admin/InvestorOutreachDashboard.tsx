
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target, Users, MessageSquare, Send, Calendar, TrendingUp,
  CheckCircle, Globe, Linkedin, Handshake, Star, Zap,
  BarChart3, FileText, Clock, ArrowRight, Shield, Coffee
} from 'lucide-react';

const InvestorOutreachDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Investor Outreach Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Structured pre-fundraising outreach — targeting, channels, conversations, and follow-up cadence
        </p>
      </div>

      {/* Pipeline Funnel */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { stage: 'Identified', count: '80-120', icon: Target, desc: 'Research & list' },
          { stage: 'Warm Intro', count: '40-60', icon: Handshake, desc: '50% conversion' },
          { stage: 'First Call', count: '20-30', icon: Coffee, desc: 'Feedback meetings' },
          { stage: 'Follow-Up', count: '10-15', icon: Send, desc: 'Traction updates' },
          { stage: 'Term Sheet', count: '2-4', icon: FileText, desc: 'Formal interest' },
        ].map((s) => (
          <Card key={s.stage} className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 text-center">
              <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{s.count}</p>
              <p className="text-[10px] font-medium text-foreground">{s.stage}</p>
              <p className="text-[9px] text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="targeting" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {[
            { key: 'targeting', label: 'Targeting', icon: Target },
            { key: 'channels', label: 'Channels', icon: Globe },
            { key: 'conversations', label: 'First Call', icon: MessageSquare },
            { key: 'followup', label: 'Follow-Up', icon: Send },
            { key: 'timeline', label: 'Weekly Cadence', icon: Calendar },
          ].map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="text-xs gap-1.5 data-[state=active]:bg-background">
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Targeting Tab */}
        <TabsContent value="targeting" className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Ideal Investor Profiles</h3>
            <p className="text-[11px] text-muted-foreground">Target investors with thesis alignment — not just capital, but strategic value</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                type: 'PropTech-Focused Angels',
                why: 'Direct domain expertise, agent/developer network access, credibility signal',
                signals: ['Invested in property platforms before', 'Real estate industry background', 'Active in Southeast Asian markets'],
                examples: 'Ex-founders of property portals, real estate developers turned investors, property fund managers',
                priority: 'critical' as const,
              },
              {
                type: 'Marketplace Operators',
                why: 'Understand two-sided marketplace dynamics, supply-side strategy, and liquidity challenges',
                signals: ['Built or invested in marketplace startups', 'Understand network effects', 'Value organic growth metrics'],
                examples: 'Founders/angels from classifieds, e-commerce, or service marketplaces',
                priority: 'critical' as const,
              },
              {
                type: 'AI/Deep Tech Investors',
                why: 'Appreciate AI differentiation, data moat potential, and technical defensibility',
                signals: ['Portfolio includes AI-first companies', 'Technical background', 'Long-term thesis on AI applications'],
                examples: 'AI fund managers, ex-ML engineers turned angels, deep tech accelerator partners',
                priority: 'important' as const,
              },
              {
                type: 'SEA Ecosystem Investors',
                why: 'Regional market knowledge, regulatory familiarity, follow-on potential',
                signals: ['Active in Indonesia/SEA deals', 'Local network of LPs', 'Understand rupiah-denominated economics'],
                examples: 'SEA-focused micro-VCs, Indonesian angel networks, regional accelerator mentors',
                priority: 'important' as const,
              },
              {
                type: 'Strategic Corporate Angels',
                why: 'Distribution channels, partnership pipeline, and market access',
                signals: ['Real estate developers with CVC arms', 'Bank/fintech executives', 'Construction/materials industry leaders'],
                examples: 'Sinar Mas, Lippo, BCA/Mandiri executives, Jababeka ecosystem',
                priority: 'nice-to-have' as const,
              },
              {
                type: 'Seed-Stage VCs',
                why: 'Larger check sizes, structured support, institutional follow-on signal',
                signals: ['$50K-$500K check sizes', 'Pre-seed/seed focus', 'Marketplace or PropTech thesis'],
                examples: 'East Ventures, AC Ventures, Antler, Iterative, 500 Global SEA',
                priority: 'nice-to-have' as const,
              },
            ].map((profile) => (
              <div key={profile.type} className="border border-border/50 rounded-xl p-3 bg-card/40">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[12px] font-semibold text-foreground">{profile.type}</p>
                  <Badge variant="outline" className={`text-[9px] ${
                    profile.priority === 'critical' ? 'border-destructive/50 text-destructive' :
                    profile.priority === 'important' ? 'border-amber-500/50 text-amber-500' : ''
                  }`}>{profile.priority}</Badge>
                </div>
                <p className="text-[10px] text-primary mb-1.5">{profile.why}</p>
                <p className="text-[10px] font-medium text-foreground mb-1">Look for:</p>
                <ul className="space-y-0.5 mb-1.5">
                  {profile.signals.map((s, i) => (
                    <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />{s}
                    </li>
                  ))}
                </ul>
                <p className="text-[9px] text-muted-foreground italic">{profile.examples}</p>
              </div>
            ))}
          </div>

          {/* Scoring */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-foreground mb-2">Investor Fit Scoring (Prioritize Outreach Order)</p>
              <div className="space-y-1.5">
                {[
                  { factor: 'Thesis Alignment (PropTech/Marketplace/AI)', weight: '30%' },
                  { factor: 'Geographic Focus (Indonesia/SEA)', weight: '25%' },
                  { factor: 'Check Size Match ($25K-$200K)', weight: '15%' },
                  { factor: 'Strategic Value (Network, Expertise)', weight: '20%' },
                  { factor: 'Warm Introduction Available', weight: '10%' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] text-foreground flex-1">{f.factor}</span>
                    <Badge variant="outline" className="text-[9px]">{f.weight}</Badge>
                    <Progress value={parseInt(f.weight)} className="h-1 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Outreach Channel Strategy</h3>
            <p className="text-[11px] text-muted-foreground">Prioritize warm intros over cold outreach — 3x higher conversion rate</p>
          </div>

          <div className="space-y-3">
            {[
              {
                channel: 'Warm Introductions',
                icon: Handshake,
                effectiveness: 90,
                tactics: [
                  'Map your existing network: who knows investors 1 degree away?',
                  'Ask advisors/mentors for specific introductions (name the investor)',
                  'Attend startup events and request introductions from organizers',
                  'Use LinkedIn mutual connections — request forwardable intro blurb',
                ],
                template: '"Hi [Connector], I\'m building an AI-powered property marketplace for Indonesia. [Investor Name] seems like a great fit given their [thesis]. Would you be comfortable making an introduction? I\'ve attached a one-pager."',
              },
              {
                channel: 'Startup Events & Demo Days',
                icon: Star,
                effectiveness: 70,
                tactics: [
                  'Apply to pitch at accelerator demo days (Antler, Plug and Play, GK-Plug)',
                  'Attend investor meetups: Angel Investor Network Indonesia, ANGIN',
                  'Present at proptech/fintech meetups in Jakarta',
                  'Host your own "AI in Real Estate" micro-event (10-15 invited guests)',
                ],
                template: 'After meeting: "Great connecting at [Event]. As discussed, we\'re building [one-line pitch]. I\'d love to share our deck and get your feedback on our approach to [specific topic discussed]."',
              },
              {
                channel: 'LinkedIn Strategic Networking',
                icon: Linkedin,
                effectiveness: 45,
                tactics: [
                  'Engage with investor content for 2-3 weeks before reaching out',
                  'Post founder journey content to build visibility and credibility',
                  'Send personalized connection requests referencing their portfolio',
                  'Share platform milestones publicly — investors notice organic traction',
                ],
                template: '"Hi [Name], I\'ve been following your insights on [topic]. I\'m building [one-line]. Your investment in [portfolio company] caught my eye — we\'re tackling a similar thesis in Indonesian real estate. Would love to get your perspective over a 15-min call."',
              },
              {
                channel: 'Ecosystem Referrals',
                icon: Globe,
                effectiveness: 60,
                tactics: [
                  'Join startup WhatsApp groups and founder communities',
                  'Ask other founders who recently raised for investor recommendations',
                  'Engage with accelerator alumni networks',
                  'Connect with co-working space communities (WeWork, GoWork, UnionSpace)',
                ],
                template: '"[Founder Name] from [Company] suggested I reach out. We\'re both in the marketplace space and they thought our AI approach to property might align with your thesis. Would you have 15 minutes this week?"',
              },
            ].map((ch) => (
              <Card key={ch.channel} className="bg-card/60 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ch.icon className="h-4 w-4 text-primary" />
                    <p className="text-[12px] font-semibold text-foreground flex-1">{ch.channel}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-muted-foreground">Effectiveness</span>
                      <Progress value={ch.effectiveness} className="h-1.5 w-16" />
                      <span className="text-[10px] font-medium text-foreground">{ch.effectiveness}%</span>
                    </div>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {ch.tactics.map((t, i) => (
                      <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary">▸</span>{t}
                      </li>
                    ))}
                  </ul>
                  <div className="bg-muted/30 rounded-lg p-2.5 border border-border/20">
                    <p className="text-[9px] text-primary mb-0.5">Message Template</p>
                    <p className="text-[10px] text-foreground italic">{ch.template}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* First Conversation Tab */}
        <TabsContent value="conversations" className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">First Conversation Framework</h3>
            <p className="text-[11px] text-muted-foreground">Goal: feedback + relationship, not a pitch. Listen more than you talk.</p>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-primary mb-1">Mindset Shift</p>
              <p className="text-[12px] font-semibold text-foreground">
                "I'm not asking for money today. I'm seeking your expertise and building a relationship for when the time is right."
              </p>
            </CardContent>
          </Card>

          {/* Call Structure */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">30-Minute Call Structure</p>
            {[
              { min: '0-3', phase: 'Warm-Up', script: 'Thank them for time. Ask about their recent investments or something specific from their background.', tip: 'Show you did your homework' },
              { min: '3-8', phase: 'Your Story (2 min max)', script: '"We\'re building an AI-powered property marketplace for Indonesia. Think [comparable] but with AI valuation and investment intelligence built in."', tip: 'One sentence, not a pitch deck' },
              { min: '8-15', phase: 'Problem & Market', script: 'Share 2-3 data points about the market problem. Ask: "Does this resonate with what you\'ve seen?"', tip: 'Make it conversational, not presentational' },
              { min: '15-20', phase: 'Traction Sharing', script: '"We currently have [X] listings, [Y] agents, and [Z] monthly traffic. Our AI valuation is within [%] accuracy."', tip: 'Numbers, not adjectives' },
              { min: '20-25', phase: 'Ask for Feedback', script: '"What would you want to see before this becomes investable for someone like you?" or "What\'s the biggest risk you see?"', tip: 'This is the gold — take notes' },
              { min: '25-30', phase: 'Close & Next Steps', script: '"Can I send you monthly updates on our progress? And would you be open to a follow-up in [6-8 weeks] when we hit [specific milestone]?"', tip: 'Always secure permission to follow up' },
            ].map((step, i) => (
              <div key={i} className="border border-border/50 rounded-xl p-3 bg-card/40">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[9px] w-12 justify-center">{step.min}</Badge>
                  <p className="text-[11px] font-semibold text-foreground">{step.phase}</p>
                </div>
                <p className="text-[10px] text-foreground ml-14 mb-1">{step.script}</p>
                <p className="text-[9px] text-primary ml-14">💡 {step.tip}</p>
              </div>
            ))}
          </div>

          {/* Questions to Ask */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-foreground mb-2">High-Value Questions to Ask Investors</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  '"What metrics would make this a no-brainer investment for you?"',
                  '"Who else in your network should I be talking to?"',
                  '"What\'s the biggest mistake you\'ve seen marketplace founders make?"',
                  '"If you were building this, what would you do differently?"',
                  '"What\'s your timeline for new investments this year?"',
                  '"Would you prefer to invest now or after we hit [milestone]?"',
                ].map((q, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <MessageSquare className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground italic">{q}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-Up Tab */}
        <TabsContent value="followup" className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Follow-Up Engagement System</h3>
            <p className="text-[11px] text-muted-foreground">Consistent traction updates build investor confidence over time</p>
          </div>

          {/* Update Cadence */}
          <div className="space-y-3">
            {[
              {
                timing: '24 Hours After Call',
                type: 'Thank You Email',
                content: 'Personal thank you, recap 1-2 key insights they shared, attach one-pager or deck if requested.',
                template: '"Thank you for the conversation today. Your point about [specific feedback] really resonated — we\'re already thinking about how to address that. As promised, [deck/one-pager] attached. I\'ll keep you updated on our progress."',
              },
              {
                timing: 'Every 2 Weeks',
                type: 'Traction Update (Short)',
                content: '3-5 bullet points: key metrics moved, milestone hit, notable win. Max 200 words.',
                template: '"Quick update from ASTRA: ✅ Listings: 800 → 1,200 (+50%) ✅ Organic traffic: 15K → 22K (+47%) ✅ New partnership: [Developer Name] ✅ AI valuation accuracy: 88% → 91%. Next goal: 2,000 listings by [date]."',
              },
              {
                timing: 'Monthly',
                type: 'Investor Newsletter',
                content: 'Detailed update with charts: growth metrics, product milestones, team updates, upcoming goals.',
                template: 'Subject: "[Platform] Monthly Update — [Month]: [Headline Achievement]". Include: metrics dashboard screenshot, 3 wins, 1 challenge + how you\'re solving it, 1 ask (intro, advice, etc.)',
              },
              {
                timing: '6-8 Weeks After First Call',
                type: 'Milestone Follow-Up',
                content: 'Reference the specific milestone they said would make it investable. Show you hit it.',
                template: '"Hi [Name], when we spoke in [month], you mentioned you\'d want to see [specific metric]. We just crossed that threshold: [data]. Would you be open to a follow-up conversation about potentially participating in our round?"',
              },
            ].map((fu, i) => (
              <Card key={i} className="bg-card/60 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold text-foreground">{fu.type}</p>
                      <p className="text-[10px] text-muted-foreground">{fu.timing}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">{fu.content}</p>
                  <div className="bg-muted/30 rounded-lg p-2.5 border border-border/20">
                    <p className="text-[9px] text-primary mb-0.5">Template</p>
                    <p className="text-[10px] text-foreground italic">{fu.template}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CRM Tracking */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-foreground mb-2">Pipeline Tracking Fields (Spreadsheet/CRM)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  'Investor Name', 'Fund/Affiliation', 'Thesis Fit Score', 'Intro Source',
                  'First Contact Date', 'Last Contact Date', 'Stage', 'Check Size Range',
                  'Key Feedback Given', 'Next Follow-Up Date', 'Interest Level (1-5)', 'Notes',
                ].map((field) => (
                  <div key={field} className="flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground">{field}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Cadence Tab */}
        <TabsContent value="timeline" className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">12-Week Outreach Cadence</h3>
            <p className="text-[11px] text-muted-foreground">Pre-fundraising relationship building → formal raise transition</p>
          </div>

          <div className="space-y-2">
            {[
              { weeks: 'Weeks 1-2', phase: 'Research & List Building', tasks: ['Build target list of 80-120 investors', 'Score and rank by fit', 'Map warm intro paths for top 30', 'Prepare one-pager and deck'], effort: '6-8h/week' },
              { weeks: 'Weeks 3-4', phase: 'Warm Intro Activation', tasks: ['Request 10-15 warm intros per week', 'Attend 1-2 startup events', 'Start LinkedIn engagement with target investors', 'Book first 5-8 feedback calls'], effort: '8-10h/week' },
              { weeks: 'Weeks 5-6', phase: 'First Call Sprint', tasks: ['Conduct 4-6 investor calls per week', 'Send 24h follow-ups after every call', 'Log feedback and refine pitch based on patterns', 'Share first bi-weekly traction update'], effort: '10-12h/week' },
              { weeks: 'Weeks 7-8', phase: 'Feedback Integration', tasks: ['Incorporate top 3 investor feedback themes into pitch', 'Hit 1-2 milestones investors said they wanted to see', 'Send milestone follow-ups to warm investors', 'Continue 3-4 new calls per week'], effort: '8-10h/week' },
              { weeks: 'Weeks 9-10', phase: 'Interest Validation', tasks: ['Circle back to most engaged investors', 'Share monthly investor newsletter', 'Identify 5-10 investors showing genuine interest', 'Begin discussing terms informally with top 3-5'], effort: '8-10h/week' },
              { weeks: 'Weeks 11-12', phase: 'Raise Decision Point', tasks: ['Evaluate: enough interest to formally raise?', 'If yes: set raise timeline, create SAFE/term sheet, begin closing', 'If no: continue building, extend to Week 16-20', 'Send "we\'re raising" update to warm pipeline'], effort: '10-15h/week' },
            ].map((week, i) => (
              <div key={i} className="border border-border/50 rounded-xl p-3 bg-card/40">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{week.weeks}</Badge>
                    <p className="text-[12px] font-semibold text-foreground">{week.phase}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground">{week.effort}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 ml-2">
                  {week.tasks.map((task, j) => (
                    <div key={j} className="flex items-start gap-1.5">
                      <ArrowRight className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] text-muted-foreground">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Time Block */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium text-foreground mb-2">Recommended Weekly Time Blocks for Fundraising</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { day: 'Monday', block: '2h — Research new investors, update pipeline, prep outreach' },
                  { day: 'Tuesday', block: '2h — Send intro requests, LinkedIn engagement, event follow-ups' },
                  { day: 'Wednesday', block: '2h — Investor calls (batch 2-3 in afternoon)' },
                  { day: 'Thursday', block: '1h — Follow-up emails, traction update drafting' },
                  { day: 'Friday', block: '1h — Weekly pipeline review, plan next week outreach' },
                ].map((d, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge variant="outline" className="text-[9px] w-14 justify-center flex-shrink-0">{d.day.slice(0, 3)}</Badge>
                    <span className="text-[10px] text-muted-foreground">{d.block}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestorOutreachDashboard;
