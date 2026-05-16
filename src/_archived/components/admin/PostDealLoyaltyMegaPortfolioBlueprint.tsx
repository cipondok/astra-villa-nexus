
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, Building2, Zap, AlertTriangle, ClipboardCheck, Copy, Check, Users, TrendingUp, CalendarDays, Star, Gift, Megaphone } from 'lucide-react';
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

const loyaltyLoop = {
  phases: [
    { phase: 'Day 0 — Closing Celebration', timing: 'Immediately after deal closes', actions: ['Send personalized congratulations message with property photo', 'Share "New Homeowner Welcome Pack" digital guide', 'Request Google/platform review while excitement is high', 'Add buyer to VIP past-customer segment'], template: `🎉 SELAMAT [Name]! 🏠

Properti impian Anda resmi menjadi milik Anda!

🏡 [Property Name] — [District]
💰 Harga final: Rp [Price]
📅 Tanggal closing: [Date]

🎁 WELCOME PACK UNTUK ANDA:
📋 Checklist pindahan → [link]
🔧 Rekomendasi vendor renovasi → [link]
📊 Area market report gratis → [link]

💬 Pengalaman Anda sangat berarti bagi kami.
Mau berbagi cerita? → [Review Link]

Terima kasih telah mempercayakan perjalanan properti Anda kepada ASTRA! 🙏

Best,
[Agent Name]` },
    { phase: 'Week 1 — Settlement Support', timing: '3-7 days post-deal', actions: ['Check in on moving/settlement process', 'Share helpful local service recommendations', 'Offer assistance with any post-purchase questions', 'Soft introduction to referral program'], template: `Hai [Name],

Semoga proses pindahan berjalan lancar! 🏠

Beberapa tips dari kami:
✅ Checklist utilitas: PLN, PDAM, internet → [link]
✅ Rekomendasi tukang terpercaya di area → [link]
✅ Info RT/RW dan komunitas sekitar → [link]

💡 Btw, jika ada teman/keluarga yang sedang cari properti, kami punya program referral spesial:
🎁 Rp [Amount] reward untuk setiap referral yang berhasil closing

Ada pertanyaan apapun? Kami selalu siap bantu! 😊` },
    { phase: 'Month 1 — Value Reinforcement', timing: '30 days post-deal', actions: ['Send first property value update report', 'Share neighborhood development news', 'Invite to exclusive past-buyer community group', 'Formal referral program enrollment'], template: `Hai [Name],

Sudah 1 bulan sebagai pemilik [Property Name]! 🎉

📊 UPDATE NILAI PROPERTI ANDA:
• Harga beli: Rp [Purchase Price]
• Estimasi nilai saat ini: Rp [Current Value]
• Perubahan: +Rp [Change] (+[X]%) ✅

📈 UPDATE AREA [District]:
• Avg price movement: +[Y]% bulan ini
• New development: [Project Name] announced nearby
• Demand index: [Score] — [Trending Up]

🤝 EXCLUSIVE ACCESS:
Anda sekarang bagian dari ASTRA VIP Owners Club:
• Early access ke investment opportunities
• Quarterly market briefing invitation
• Priority service untuk properti berikutnya

👉 Join VIP Group: [link]` },
    { phase: 'Quarterly — Investment Nurture', timing: 'Every 90 days ongoing', actions: ['Quarterly property valuation update', 'Investment opportunity alerts for second property', 'Seasonal market trend insights', 'Referral program reminder with success stories'], template: `Hai [Name],

📊 QUARTERLY PROPERTY INTELLIGENCE — Q[X] [Year]

🏠 Properti Anda: [Property Name]
💰 Estimasi nilai: Rp [Value] (+[X]% since purchase)
📈 Area growth: +[Y]% quarter ini

🔥 INVESTMENT OPPORTUNITIES:
Berdasarkan profil Anda, kami identifikasi:

1️⃣ [Opportunity 1] — Rp [Price]
   Yield potential: [X]%/year
   
2️⃣ [Opportunity 2] — Rp [Price]
   Growth forecast: +[Y]% in 12 months

🎁 REFERRAL UPDATE:
• Total referral rewards earned: Rp [Amount]
• Active referrals: [X] — [Y] in progress

Mau explore investment berikutnya? 📞 [Phone]` },
  ],
  kpis: [
    { metric: 'Referral-Driven New Buyers', target: '≥15% of new acquisitions', current: '3%' },
    { metric: 'Post-Deal Engagement (90-day)', target: '≥60% open rate', current: '22%' },
    { metric: 'Testimonial Participation', target: '≥40% of closed buyers', current: '8%' },
    { metric: 'Second Purchase Rate (24mo)', target: '≥12%', current: '2%' },
    { metric: 'Referral Program Enrollment', target: '≥70% of past buyers', current: '5%' },
  ],
};

const megaPortfolio = {
  targets: [
    { segment: 'Large Agencies (50+ listings)', approach: 'Executive partnership meeting → portfolio showcase deal', pitch: 'Dedicated landing page + priority lead routing + co-branded campaigns', onboarding: 'Bulk upload API + dedicated account manager', expectedListings: '50-200 per partner' },
    { segment: 'District-Dominant Teams (3-5 agents)', approach: 'Team leader outreach → district dominance proposition', pitch: 'Territory lead exclusivity + team performance dashboard + premium exposure', onboarding: 'Team training session + assisted first 20 uploads', expectedListings: '20-80 per team' },
    { segment: 'Developer Sales Teams', approach: 'Developer BD meeting → project showcase partnership', pitch: 'Project landing page + investor lead funnel + demand analytics', onboarding: 'Full project upload + marketing asset creation', expectedListings: '30-500 per project' },
    { segment: 'Independent Top Producers', approach: 'Performance data outreach → exclusive benefits invitation', pitch: 'VIP agent status + priority support + revenue share opportunity', onboarding: 'White-glove upload assistance + profile optimization', expectedListings: '10-30 per agent' },
  ],
  pitchScript: `🤝 PARTNERSHIP PROPOSAL — MEGA-PORTFOLIO PROGRAM

Kepada [Agency/Team Leader Name],

Kami mengundang [Agency Name] untuk bergabung dalam program Mega-Portfolio Partner ASTRA.

📊 MENGAPA SEKARANG:
• [District] buyer demand naik [X]% bulan ini
• [Y] active buyer searches matching inventory Anda
• Top agencies di platform kami mendapat avg [Z] inquiry/listing/bulan

🎁 MEGA-PORTFOLIO BENEFITS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 LISTING EXPOSURE:
• Dedicated agency landing page: astra.com/agency/[name]
• Priority placement di district search results
• Featured agency badge on all listings

📈 LEAD ACCESS:
• Direct routing of [District] buyer leads
• Real-time inquiry notifications
• Buyer intent scoring per listing

📊 ANALYTICS:
• Portfolio performance dashboard
• District market intelligence reports
• Competitive positioning insights

🤝 MARKETING:
• Co-branded social media campaigns
• Monthly property showcase features
• Event collaboration opportunities

💰 COMMERCIAL TERMS:
• Listing fee: [Waived/Discounted] for first [X] months
• Premium boost: [X] free boosts/month included
• Revenue share: [X]% on platform-generated transactions

📋 ONBOARDING PROCESS:
1️⃣ Agreement signing — hari ini
2️⃣ Bulk upload assistance — dalam 48 jam
3️⃣ Landing page live — dalam 72 jam
4️⃣ First lead routing — within 1 week
5️⃣ Performance review — 30 days

👉 Konfirmasi partnership: [link]
📞 Diskusi langsung: [Phone]

Salam,
[Founder Name]
CEO, ASTRA Villa`,
  onboardingFlow: [
    { step: 'Day 0', action: 'Partnership agreement + API credentials / upload access', owner: 'BD Lead' },
    { step: 'Day 1-2', action: 'Bulk listing upload (API or assisted manual)', owner: 'Ops + Partner' },
    { step: 'Day 3', action: 'Agency landing page live + profile optimization', owner: 'Product Team' },
    { step: 'Day 4-5', action: 'Lead routing activation + team training', owner: 'Growth Lead' },
    { step: 'Day 7', action: 'First performance check-in + quick wins report', owner: 'Account Manager' },
    { step: 'Day 14', action: 'First co-marketing campaign launch', owner: 'Marketing' },
    { step: 'Day 30', action: 'Full performance review + optimization session', owner: 'Founder + BD' },
  ],
  kpis: [
    { metric: 'Listings per Partnership', target: '≥50 avg' },
    { metric: 'Inquiry Growth Post-Onboarding', target: '+80% in 14 days' },
    { metric: 'Supply Density in Target Districts', target: '≥60% market share' },
    { metric: 'Partner Activation Rate (30-day)', target: '≥85% active' },
    { metric: 'Portfolio Retention (90-day)', target: '≥90% listings maintained' },
  ],
};

const weekendCampaign = {
  planning: [
    { criteria: 'District Readiness', weight: '30%', logic: '≥30 active listings + ≥3 agents confirmed available for viewings' },
    { criteria: 'Demand Signal Strength', weight: '25%', logic: 'Inquiry trend +15% week-over-week in target district' },
    { criteria: 'Inventory Quality', weight: '20%', logic: '≥70% of listings have 10+ photos + verified badge' },
    { criteria: 'Price Competitiveness', weight: '15%', logic: '≥40% of listings priced at/below district average' },
    { criteria: 'Past Campaign Performance', weight: '10%', logic: 'Previous weekend campaign ROI ≥3x in same district' },
  ],
  templates: [
    { format: 'Hyper-Liquidity Weekend Blast', template: `🔥 WEEKEND PROPERTI — [District] 🔥
⏰ Sabtu & Minggu, [Date Range]

🏠 [X] PROPERTI SIAP VIEWING!
💰 Range: Rp [Min] — Rp [Max]

⚡ WEEKEND EXCLUSIVE:
• Priority viewing untuk 20 pendaftar pertama
• Free property inspection report
• Instant financing pre-assessment
• Meet agents langsung di lokasi

🏡 TOP PICKS WEEKEND INI:

1️⃣ ⭐ [Property 1] — Rp [Price]
   📍 [Address] | 🛏️ [Beds] | 📐 [Area]m²
   🔥 [X] orang sudah inquiry!
   📅 Slot: Sabtu [Time] / Minggu [Time]

2️⃣ 💎 [Property 2] — Rp [Price]
   📍 [Address] | 🛏️ [Beds] | 📐 [Area]m²
   📈 Harga [Y]% below market!
   📅 Slot: Sabtu [Time] / Minggu [Time]

3️⃣ 🆕 [Property 3] — Rp [Price]
   📍 [Address] | 🛏️ [Beds] | 📐 [Area]m²
   ⭐ Baru listing — exclusive preview!
   📅 Slot: Sabtu [Time] / Minggu [Time]

📍 MEETING POINT: [Location]
🚗 Parking: [Info]
☕ Complimentary refreshments provided

👉 DAFTAR SEKARANG: [link]
📞 Fast booking: [Phone]

⚠️ Slots terbatas — first come first served!`, channel: 'WhatsApp + Push + SMS', timing: 'Thursday 6PM broadcast' },
    { format: 'Investor Weekend Sprint', template: `💰 INVESTOR WEEKEND SPRINT — [District]
📅 [Date] | ⏰ [Time Range]

Khusus investor serius:
[X] properti high-yield ready for assessment

📊 DISTRICT INTELLIGENCE:
• Avg rental yield: [X]%/year
• Price growth (12mo): +[Y]%
• Vacancy rate: [Z]%
• Upcoming infrastructure: [Project]

🏢 INVESTMENT-GRADE PROPERTIES:

1️⃣ [Property] — Rp [Price]
   📈 Yield: [X]% | ROI est: [Y] years
   
2️⃣ [Property] — Rp [Price]
   📈 Yield: [X]% | ROI est: [Y] years

🎁 INVESTOR WEEKEND BONUS:
• Private consultation with investment advisor
• Custom ROI analysis per property
• Fast-track financing connection
• Portfolio diversification strategy session

👉 Register: [link]
📞 Investor line: [Phone]`, channel: 'Email + WhatsApp to investor segment', timing: 'Wednesday AM' },
  ],
  executionTimeline: [
    { day: 'Monday', action: 'Select target district + confirm inventory + check agent availability', owner: 'Growth Lead' },
    { day: 'Tuesday', action: 'Prepare property shortlists + create visual assets + draft messages', owner: 'Content + Marketing' },
    { day: 'Wednesday', action: 'Investor segment pre-notification + social media teaser posts', owner: 'Marketing' },
    { day: 'Thursday', action: 'Main broadcast to buyer database + ad campaign launch + agent briefing', owner: 'Marketing + Ops' },
    { day: 'Friday', action: 'Final registration push + confirm all viewing slots + logistics check', owner: 'Ops Coordinator' },
    { day: 'Saturday', action: 'EXECUTE: Morning viewings + real-time lead capture + instant follow-up', owner: 'Agents + Coordinator' },
    { day: 'Sunday', action: 'EXECUTE: Afternoon viewings + hot lead escalation + offer facilitation', owner: 'Agents + Founder' },
    { day: 'Monday (Post)', action: 'Follow-up all leads + track conversions + performance review + next district selection', owner: 'Full Team' },
  ],
  kpis: [
    { metric: 'Weekend Inquiry Spike', target: '+150% vs normal weekend' },
    { metric: 'Viewing Attendance', target: '≥25 viewings per weekend campaign' },
    { metric: 'Offer Submissions (within 7 days)', target: '≥6 from weekend leads' },
    { metric: 'Campaign-to-Deal Conversion', target: '≥20% within 45 days' },
    { metric: 'Cost per Qualified Lead', target: '≤Rp 50,000' },
  ],
};

const monthlyChecklist = [
  { category: 'Post-Deal Loyalty', items: ['Send property value updates to all past buyers', 'Review referral program conversion metrics', 'Collect and publish 3+ new testimonials', 'Identify past buyers showing second-purchase signals'] },
  { category: 'Mega-Portfolio Supply', items: ['Contact 3+ new target agencies/teams', 'Review portfolio partner activation rates', 'Check listing quality across partner inventory', 'Assess district supply density vs targets'] },
  { category: 'Weekend Campaigns', items: ['Analyze last weekend campaign ROI', 'Select next target district based on readiness score', 'Review viewing attendance and no-show trends', 'Track campaign-to-deal conversion pipeline'] },
  { category: 'Overall Health', items: ['Compare supply growth vs demand growth ratio', 'Review customer lifetime value trends', 'Assess partner satisfaction and retention', 'Monitor campaign fatigue indicators'] },
];

const risks = [
  { signal: 'Post-deal communication perceived as spam by past buyers', severity: 84, mitigation: 'Limit to 1 touchpoint/month max; always lead with value (property valuation); include easy unsubscribe; personalize every message' },
  { signal: 'Mega-portfolio partner dominating platform listings creating dependency', severity: 88, mitigation: 'Cap single partner at ≤20% of total inventory; diversify across 5+ partners; maintain direct agent relationships as backup' },
  { signal: 'Weekend campaign fatigue — diminishing returns in same district', severity: 86, mitigation: 'Rotate districts every 2-3 weeks; vary campaign themes; track repeat-attendee ratio; pause if inquiry spike drops below +50%' },
  { signal: 'Referral program exploitation — low-quality referrals for rewards', severity: 79, mitigation: 'Reward only on verified deal closing; implement referral quality scoring; cap monthly referral rewards per person' },
  { signal: 'Bulk-uploaded listings having poor quality — hurting platform perception', severity: 91, mitigation: 'Enforce minimum quality standards before going live; automated photo quality check; 48hr review process for bulk uploads' },
];

const PostDealLoyaltyMegaPortfolioBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Heart className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Post-Deal Loyalty + Mega-Portfolio + Hyper-Liquidity Weekend</h2>
          <p className="text-sm text-muted-foreground">Customer lifecycle retention, large-scale supply acquisition & concentrated demand activation</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="loyalty" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="loyalty"><Heart className="h-4 w-4 mr-1.5" />Post-Deal Loyalty</TabsTrigger>
        <TabsTrigger value="mega"><Building2 className="h-4 w-4 mr-1.5" />Mega-Portfolio</TabsTrigger>
        <TabsTrigger value="weekend"><Zap className="h-4 w-4 mr-1.5" />Weekend Campaign</TabsTrigger>
        <TabsTrigger value="monthly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Monthly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* LOYALTY TAB */}
      <TabsContent value="loyalty" className="space-y-4">
        {loyaltyLoop.phases.map((p, i) => (
          <motion.div key={i} {...anim(i + 1)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {i === 0 && <Gift className="h-4 w-4 text-chart-3" />}
                    {i === 1 && <Users className="h-4 w-4 text-primary" />}
                    {i === 2 && <Star className="h-4 w-4 text-chart-4" />}
                    {i === 3 && <TrendingUp className="h-4 w-4 text-chart-5" />}
                    {p.phase}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">{p.timing}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {p.actions.map((a, j) => (
                    <div key={j} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 border border-border/30">
                      <span className="text-[10px] text-primary mt-0.5">✓</span>
                      <span className="text-[11px] text-foreground">{a}</span>
                    </div>
                  ))}
                </div>
                <CopyBlock text={p.template} />
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {loyaltyLoop.kpis.map((k, i) => (
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

      {/* MEGA-PORTFOLIO TAB */}
      <TabsContent value="mega" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />Target Segments</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {megaPortfolio.targets.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{t.segment}</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{t.expectedListings} listings</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">📞 {t.approach}</p>
                  <p className="text-[10px] text-foreground mt-0.5">🎁 {t.pitch}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">⚙️ {t.onboarding}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><CalendarDays className="h-4 w-4 text-chart-3" />Onboarding Flow</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {megaPortfolio.onboardingFlow.map((o, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <Badge variant="outline" className="text-[10px] w-16 justify-center flex-shrink-0">{o.step}</Badge>
                  <span className="text-[11px] text-foreground flex-1">{o.action}</span>
                  <Badge className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">{o.owner}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {megaPortfolio.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 3)}>
              <Card>
                <CardContent className="pt-3 pb-3 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div {...anim(8)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Mega-Portfolio Partnership Pitch</CardTitle></CardHeader>
            <CardContent><CopyBlock text={megaPortfolio.pitchScript} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* WEEKEND CAMPAIGN TAB */}
      <TabsContent value="weekend" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Megaphone className="h-4 w-4 text-destructive" />District Readiness Scoring</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {weekendCampaign.planning.map((p, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{p.criteria}</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Weight: {p.weight}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{p.logic}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><CalendarDays className="h-4 w-4 text-chart-3" />Weekly Execution Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {weekendCampaign.executionTimeline.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <Badge variant="outline" className={`text-[10px] w-24 justify-center flex-shrink-0 ${e.day.includes('Sat') || e.day.includes('Sun') ? 'bg-destructive/10 text-destructive border-destructive/20' : ''}`}>{e.day}</Badge>
                  <span className="text-[11px] text-foreground flex-1">{e.action}</span>
                  <Badge className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">{e.owner}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {weekendCampaign.templates.map((t, i) => (
          <motion.div key={i} {...anim(i + 3)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{t.format}</CardTitle>
                  <div className="flex gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{t.channel}</Badge>
                    <Badge className="text-[10px] bg-chart-3/10 text-chart-3 border-chart-3/20">{t.timing}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent><CopyBlock text={t.template} /></CardContent>
            </Card>
          </motion.div>
        ))}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {weekendCampaign.kpis.map((k, i) => (
            <motion.div key={i} {...anim(i + 5)}>
              <Card>
                <CardContent className="pt-3 pb-3 text-center">
                  <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{k.target}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
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

export default PostDealLoyaltyMegaPortfolioBlueprint;
