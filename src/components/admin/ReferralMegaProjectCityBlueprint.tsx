
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Share2, Building2, Globe, AlertTriangle, ClipboardCheck, Copy, Check, Users, TrendingUp, Megaphone, Target, Gift, Rocket, Crown, BarChart3 } from 'lucide-react';
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

const referralFlywheel = {
  mechanics: [
    { layer: 'Buyer → Buyer Referral', trigger: 'Post-deal satisfaction + viewing excitement', reward: 'Rp 500K credit per successful referral closing', viral: 'Each buyer avg knows 3-5 people actively looking', template: `🎁 REFERRAL PROGRAM — ASTRA Villa

Hai [Name],

Punya teman/keluarga yang sedang cari properti?

💰 REWARDS:
• Anda mendapat: Rp 500,000 credit per referral yang closing
• Teman Anda mendapat: Priority viewing + free property report
• Bonus: 3 referral closing = VIP Investor status upgrade! 🏆

📊 STATS ANDA:
• Referral link: astra.com/ref/[CODE]
• Total referrals: [X]
• Successful closings: [Y]
• Total rewards earned: Rp [Amount]

📱 CARA MUDAH:
1️⃣ Share link ke WhatsApp / social media
2️⃣ Teman Anda sign up & inquiry
3️⃣ Saat mereka closing → reward otomatis!

👉 Share sekarang: [Referral Link]
📋 Copy referral code: [CODE]

💡 Tip: Share listing yang menarik — conversion rate 3x lebih tinggi!` },
    { layer: 'Agent → Agent Referral', trigger: 'Agent success + territory expansion needs', reward: 'Priority lead routing bonus + 1 month free Premium', viral: 'Top agents connected to 10-20 peer agents', template: `🤝 AGENT REFERRAL — Expand Your Network

Hai [Agent Name],

Kenal agent yang mau grow bisnisnya?

🎁 AGENT REFERRAL REWARDS:
• Anda: 1 bulan Premium Boost GRATIS per referred agent yang aktif
• Agent baru: Onboarding assistance + 5 free listing boosts
• Bonus: 5 referrals = Gold Partner fast-track! 🥇

📊 PERFORMANCE ANDA:
• Ranking: Top [X]% agents
• Deals bulan ini: [Y]
• Referral agents aktif: [Z]

💡 Kenapa refer?
• Agent baru di area lain = cross-referral opportunities
• Lebih banyak inventory = lebih banyak buyer traffic
• Network growth = your growth

👉 Refer agent: [link]
📞 Discuss: [Phone]` },
    { layer: 'Listing Social Sharing', trigger: 'Attractive property discovery', reward: 'Visibility boost for shared listings', viral: 'Average WhatsApp share reaches 8-12 people', template: `🏠 TRENDING PROPERTY — Share & Earn!

[Property Name] — [District]
💰 Rp [Price] | 🛏️ [Beds] | 📐 [Area]m²

🔥 [X] orang sudah lihat properti ini!

📱 Share ke teman yang lagi cari:
• WhatsApp: [Share Link]
• Instagram: [Share Link]
• Copy link: [Link]

🎁 Share bonus:
• Listing yang di-share mendapat extra visibility boost
• Jika teman Anda inquiry → Anda masuk referral tracking
• Top sharers featured di weekly highlights!

👉 Lihat detail: [Property Link]` },
  ],
  flywheelStages: [
    { stage: 'Seed', description: 'Satisfied buyer/agent has positive experience', action: 'Trigger referral prompt within 48hrs of positive milestone', metric: 'Referral prompt delivery rate' },
    { stage: 'Share', description: 'User shares link/listing/referral code', action: 'Make sharing frictionless — 1-tap WhatsApp, pre-written message', metric: 'Share rate per satisfied user' },
    { stage: 'Arrive', description: 'New user arrives via referral', action: 'Personalized welcome + referrer credit shown + priority onboarding', metric: 'Referral landing conversion rate' },
    { stage: 'Activate', description: 'New user takes first meaningful action', action: 'Guide to first inquiry/listing within 24hrs of signup', metric: 'Activation rate within 7 days' },
    { stage: 'Convert', description: 'New user generates value (deal/listing)', action: 'Fast-track deal support + reward both referrer and referee', metric: 'Referral-to-deal conversion rate' },
    { stage: 'Amplify', description: 'Converted user becomes new referrer', action: 'Celebrate success + introduce referral program + show reward history', metric: 'Referred user re-referral rate' },
  ],
  kpis: [
    { metric: 'Buyers via Referrals', target: '≥25% of new acquisitions', current: '3%' },
    { metric: 'Agent Referral Rate', target: '≥15% of new agents', current: '2%' },
    { metric: 'Listing Share Rate', target: '≥10% of active listings shared/week', current: '1%' },
    { metric: 'Referral-to-Deal Conversion', target: '≥30% within 90 days', current: '5%' },
    { metric: 'Viral Coefficient (k-factor)', target: '≥0.4', current: '0.05' },
  ],
};

const megaProject = {
  acquisition: [
    { phase: 'Intelligence', timing: 'Ongoing', actions: ['Monitor building permit databases for upcoming projects', 'Track developer announcements and land acquisitions', 'Map developer sales team contacts', 'Identify projects 3-6 months from launch'], output: 'Target developer pipeline list' },
    { phase: 'Outreach', timing: 'T-90 days before launch', actions: ['Send executive partnership proposal', 'Present platform demand data for project location', 'Offer pilot campaign with performance guarantees', 'Schedule decision-maker meeting'], output: 'Partnership LOI signed' },
    { phase: 'Onboarding', timing: 'T-30 days', actions: ['Full project data upload (floor plans, specs, pricing)', 'Create dedicated project landing page', 'Prepare marketing asset library', 'Configure lead routing to developer sales team'], output: 'Project live on platform' },
    { phase: 'Pre-Launch', timing: 'T-14 days', actions: ['Teaser campaign to investor segment', 'Influencer preview arrangement', 'Media/PR distribution prep', 'VIP early-access registration drive'], output: 'Pre-registration pipeline' },
    { phase: 'Launch', timing: 'Day 0', actions: ['Full campaign activation across all channels', 'Homepage featured placement', 'Investor alert broadcast', 'Live/virtual project showcase event'], output: 'Inquiry surge + viewing bookings' },
    { phase: 'Momentum', timing: 'Day 1-30', actions: ['Daily lead follow-up coordination', 'Weekly performance reports to developer', 'Staged unit release for urgency', 'Testimonial capture from early buyers'], output: 'Sustained conversion pipeline' },
  ],
  launchTemplate: `🏗️ MEGA PROJECT LAUNCH — [Project Name]

By [Developer Name] | 📍 [Location]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏠 PROJECT OVERVIEW:
• Total units: [X]
• Types: [Studio / 1BR / 2BR / 3BR / Penthouse]
• Price range: Rp [Min] — Rp [Max]
• Completion: [Date]
• Concept: [Brief description]

💎 KEY HIGHLIGHTS:
• [Highlight 1 — e.g., "Rooftop infinity pool with city view"]
• [Highlight 2 — e.g., "Direct MRT access — 2 min walk"]
• [Highlight 3 — e.g., "Smart home technology in every unit"]
• [Highlight 4 — e.g., "Developed by [Award-winning developer]"]

📊 INVESTMENT INTELLIGENCE:
• District price growth (12mo): +[X]%
• Projected rental yield: [Y]%/year
• Comparable projects: [Z]% sold within [W] months
• Infrastructure pipeline: [Project nearby]

🔥 LAUNCH EXCLUSIVE:
• Early-bird pricing: [Discount]% below projected market
• Flexible payment scheme: [Terms]
• Priority unit selection for first [X] registrants
• Free furnishing package (limited units)

⏰ PRE-REGISTRATION:
Phase 1 release: [X] units only
Registration deadline: [Date]
[Y] investors already registered!

👉 REGISTER NOW: [link]
📞 Project hotline: [Phone]
🏢 Showroom: [Address]

📅 OPEN HOUSE EVENT:
[Date] | [Time] | [Location]
RSVP: [link]`,
  kpis: [
    { metric: 'Inquiry Volume per Project', target: '≥200 in first 30 days' },
    { metric: 'Pre-Registration Conversion', target: '≥15% of registrants to viewing' },
    { metric: 'Viewing-to-Reservation Rate', target: '≥25%' },
    { metric: 'Developer Re-Partnership Rate', target: '≥80% for next project' },
    { metric: 'Revenue per Project Campaign', target: '≥Rp 50M' },
  ],
};

const cityDomination = {
  pillars: [
    { pillar: 'Supply Fortress', icon: '🏗️', strategies: [
      { strategy: 'Multi-Agency Blitz', description: 'Onboard top 20 agencies in city simultaneously', target: '≥50% of city active listings on platform', timeline: '60 days' },
      { strategy: 'Developer Pipeline Lock', description: 'Secure partnerships with all major developers', target: '≥70% of new projects launching on platform', timeline: '90 days' },
      { strategy: 'Independent Agent Sweep', description: 'Targeted outreach to top independent producers', target: '≥200 active independent agents', timeline: '120 days' },
      { strategy: 'Category Coverage', description: 'Ensure listings across all segments (luxury, mid, affordable, land, commercial)', target: 'No segment with <50 listings', timeline: '90 days' },
    ]},
    { pillar: 'Demand Engine', icon: '🔥', strategies: [
      { strategy: 'SEO Domination', description: 'Rank #1 for "[city] property" and district-level searches', target: '≥30% organic search market share', timeline: '6 months' },
      { strategy: 'Performance Marketing Scale', description: 'Aggressive geo-targeted campaigns across Google + Meta', target: '≥5,000 serious visitors/day', timeline: '90 days' },
      { strategy: 'Influencer Army', description: 'Activate 10+ local property content creators', target: '≥500K monthly reach through influencers', timeline: '60 days' },
      { strategy: 'Community Gravity', description: 'Build investor community with regular events and content', target: '≥2,000 active community members', timeline: '120 days' },
    ]},
    { pillar: 'Authority Perception', icon: '👑', strategies: [
      { strategy: 'City Market Report', description: 'Publish monthly "[City] Property Market Intelligence" report', target: 'Media pickup in ≥5 outlets', timeline: '30 days recurring' },
      { strategy: 'Transaction Momentum PR', description: 'Publicize deal volume and platform activity statistics', target: 'Recognized as #1 digital property platform', timeline: '6 months' },
      { strategy: 'Industry Event Presence', description: 'Sponsor or host quarterly property industry events', target: '≥200 attendees per event', timeline: 'Quarterly' },
      { strategy: 'Award & Recognition', description: 'Apply for PropTech awards and industry recognition', target: '≥2 industry awards in Year 1', timeline: '12 months' },
    ]},
  ],
  campaignTemplate: `🏙️ [CITY] PROPERTY INTELLIGENCE — [Month] [Year]

📊 MARKET SNAPSHOT:
• Total active listings on ASTRA: [X] (↑[Y]% vs last month)
• Average price movement: [+/-Z]%
• Hottest district: [District Name] (inquiry index: [Score])
• Buyer demand index: [Score]/100

🔥 TOP TRENDS:
1️⃣ [Trend 1 — e.g., "Investor demand shifting to South corridor"]
2️⃣ [Trend 2 — e.g., "2BR apartments seeing +15% inquiry growth"]
3️⃣ [Trend 3 — e.g., "New infrastructure driving [District] premium"]

🏠 FEATURED OPPORTUNITIES:
• [Property 1] — Rp [Price] | [District] | [Key highlight]
• [Property 2] — Rp [Price] | [District] | [Key highlight]
• [Property 3] — Rp [Price] | [District] | [Key highlight]

📈 PLATFORM ACTIVITY:
• Viewings scheduled this month: [X]
• Deals facilitated: [Y]
• New listings added: [Z]
• Active serious buyers: [W]

💡 INVESTMENT INSIGHT:
[2-3 sentence analysis of market direction and opportunity]

👉 Explore opportunities: [link]
📊 Full market report: [link]
📞 Investment consultation: [Phone]`,
  kpis: [
    { metric: 'City Listings Market Share', target: '≥40%', current: '5%' },
    { metric: 'Daily Serious Visitors', target: '≥5,000', current: '400' },
    { metric: 'Monthly Inquiry Volume', target: '≥3,000', current: '180' },
    { metric: 'Vendor Inbound Requests', target: '≥50/month', current: '3/month' },
    { metric: 'Brand Search Volume', target: '≥10,000/month', current: '500/month' },
  ],
};

const monthlyChecklist = [
  { category: 'Referral Flywheel', items: ['Review referral-to-deal conversion funnel', 'Analyze viral coefficient (k-factor) trend', 'Refresh referral messaging and rewards', 'Identify top referrers for recognition'] },
  { category: 'Mega Projects', items: ['Track active project campaign performance', 'Pipeline 2-3 upcoming developer partnerships', 'Review project inquiry-to-reservation conversion', 'Collect developer satisfaction feedback'] },
  { category: 'City Domination', items: ['Measure city listings market share vs competitors', 'Track daily visitor trend and source mix', 'Review SEO rankings for key property terms', 'Assess district-level supply density gaps'] },
  { category: 'Growth Health', items: ['Compare organic vs paid acquisition ratio', 'Monitor customer acquisition cost trends', 'Review retention rates across segments', 'Check supply-demand balance across districts'] },
];

const risks = [
  { signal: 'Referral program attracting low-quality leads gaming rewards', severity: 83, mitigation: 'Reward only on verified deal closing; implement referral quality scoring; monitor referral-to-deal conversion per referrer' },
  { signal: 'Developer project over-concentration — single project dominating platform', severity: 86, mitigation: 'Cap single project at ≤15% of homepage visibility; maintain organic listing mix; rotate featured projects weekly' },
  { signal: 'City expansion outpacing operational capacity', severity: 91, mitigation: 'Gate expansion with ops readiness checklist; hire ahead of demand; maintain response SLAs during growth spurts' },
  { signal: 'Demand dilution across too many districts simultaneously', severity: 88, mitigation: 'Focus demand activation on 3-5 priority districts; achieve dominance before expanding; track per-district liquidity health' },
  { signal: 'Competitor counter-attack in response to market share gains', severity: 85, mitigation: 'Accelerate exclusive inventory partnerships; deepen vendor switching costs; maintain superior lead quality perception' },
];

const ReferralMegaProjectCityBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Share2 className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Referral Flywheel + Mega Project Launch + City Liquidity Domination</h2>
          <p className="text-sm text-muted-foreground">Viral network growth, large-scale project activation & city-wide marketplace leadership</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="referral" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="referral"><Share2 className="h-4 w-4 mr-1.5" />Referral Flywheel</TabsTrigger>
        <TabsTrigger value="mega"><Building2 className="h-4 w-4 mr-1.5" />Mega Project</TabsTrigger>
        <TabsTrigger value="city"><Globe className="h-4 w-4 mr-1.5" />City Domination</TabsTrigger>
        <TabsTrigger value="monthly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Monthly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* REFERRAL TAB */}
      <TabsContent value="referral" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Rocket className="h-4 w-4 text-primary" />Flywheel Stages</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {referralFlywheel.flywheelStages.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <Badge variant="outline" className="text-[10px] w-20 justify-center flex-shrink-0 mt-0.5">{s.stage}</Badge>
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-foreground">{s.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">→ {s.action}</p>
                    <p className="text-[10px] text-primary mt-0.5">📊 {s.metric}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {referralFlywheel.mechanics.map((m, i) => (
          <motion.div key={i} {...anim(i + 2)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{m.layer}</CardTitle>
                  <Badge className="text-[10px] bg-chart-3/10 text-chart-3 border-chart-3/20">{m.reward}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-[10px] text-muted-foreground">🎯 Trigger</p>
                    <p className="text-[11px] text-foreground">{m.trigger}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-primary">📈 Viral Potential</p>
                    <p className="text-[11px] text-foreground">{m.viral}</p>
                  </div>
                </div>
                <CopyBlock text={m.template} />
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {referralFlywheel.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 5)}>
              <Card>
                <CardContent className="pt-3 pb-3 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge>
                    <span className="text-[10px] text-muted-foreground">→</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{k.target}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </TabsContent>

      {/* MEGA PROJECT TAB */}
      <TabsContent value="mega" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />6-Phase Launch Pipeline</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {megaProject.acquisition.map((p, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{p.phase}</span>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[10px]">{p.timing}</Badge>
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{p.output}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.actions.map((a, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">✓ {a}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {megaProject.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 2)}>
              <Card>
                <CardContent className="pt-3 pb-3 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(7)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Mega Project Launch Template</CardTitle></CardHeader>
            <CardContent><CopyBlock text={megaProject.launchTemplate} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* CITY DOMINATION TAB */}
      <TabsContent value="city" className="space-y-4">
        {cityDomination.pillars.map((p, i) => (
          <motion.div key={i} {...anim(i + 1)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">{p.icon} {p.pillar}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {p.strategies.map((s, j) => (
                  <div key={j} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{s.strategy}</span>
                      <Badge variant="outline" className="text-[10px]">{s.timeline}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{s.description}</p>
                    <p className="text-[10px] text-primary mt-0.5">🎯 {s.target}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {cityDomination.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 4)}>
              <Card>
                <CardContent className="pt-3 pb-3 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge>
                    <span className="text-[10px] text-muted-foreground">→</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{k.target}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(9)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">City Market Intelligence Template</CardTitle></CardHeader>
            <CardContent><CopyBlock text={cityDomination.campaignTemplate} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* MONTHLY CHECK TAB */}
      <TabsContent value="monthly" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monthlyChecklist.map((cat, i) => (
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

export default ReferralMegaProjectCityBlueprint;
