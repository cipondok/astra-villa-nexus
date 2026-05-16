
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, Trophy, Flame, AlertTriangle, ClipboardCheck, Copy, Check, Target, Zap, TrendingUp, Medal, Star } from 'lucide-react';
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

const secondViewing = {
  engagementFlow: [
    { phase: 'Immediate Post-Viewing (0–4hrs)', actions: ['Send property summary with key highlights buyer reacted to', 'Include 2–3 comparable properties for context', 'Ask: "Apakah ada yang ingin didiskusikan lebih lanjut?"'], conversionImpact: '+25% second viewing rate', priority: 'Critical' },
    { phase: 'Decision Window (4–48hrs)', actions: ['Share demand signal: "[X] buyer lain juga tertarik"', 'Offer 2–3 convenient second viewing slots', 'Suggest bringing family/partner for joint evaluation'], conversionImpact: '+18% commitment rate', priority: 'High' },
    { phase: 'Reinforcement (48hrs–5 days)', actions: ['Send neighborhood lifestyle insights', 'Provide financing scenario calculator link', 'Communicate: "Seller open untuk diskusi — timing bagus"'], conversionImpact: '+12% offer intent', priority: 'Medium' },
    { phase: 'Recovery (5–10 days)', actions: ['Share similar new listings as alternatives', 'Market movement update for the district', 'Final second viewing invitation before listing refresh'], conversionImpact: '+6% reactivation', priority: 'Low' },
  ],
  scripts: [
    { scenario: 'Post-Viewing Summary & Second Viewing Invite', template: `Hai [Name]! 👋

Terima kasih sudah viewing [Property Name] hari ini.

📋 Ringkasan Properti:
• Harga: Rp [Price] | [Beds] KT [Baths] KM | LB [Area]m²
• ✅ Yang menonjol: [Key highlight buyer liked]
• ✅ Plus: [Second highlight]
• 📍 Akses: [Nearby amenities]

📊 Konteks Pasar:
• Avg harga [Property Type] di [District]: Rp [Avg]
• Posisi listing ini: [X]% [below/at/above] market
• Properti serupa terjual dalam avg [Y] hari

🤔 Ingin lihat lagi lebih detail?
Kami bisa arrange second viewing dengan fokus pada:
□ Cek kondisi bangunan lebih teliti
□ Bawa keluarga/partner untuk evaluasi bersama
□ Diskusi langsung dengan pemilik tentang terms

📅 Slot tersedia:
• [Date 1] — [Time]
• [Date 2] — [Time]
• [Date 3] — [Time]

👉 Konfirmasi slot: [link]
📞 Atau hubungi langsung: [Phone]`, channel: 'WhatsApp (within 4hrs)' },
    { scenario: '48-Hour Decision Reinforcement', template: `Hai [Name],

Quick update untuk [Property Name]:

📈 Sejak viewing Anda 2 hari lalu:
• [X] inquiry baru masuk
• [Y] orang request viewing
• Status: Masih tersedia ✅

💡 Insight dari team kami:
"[Property Name] termasuk [X]% listing terbaik di [District] dari sisi value-for-money. Buyer yang melakukan second viewing punya success rate 3x lebih tinggi."

🏠 Pertimbangan untuk second viewing:
• Cek pencahayaan di waktu berbeda (pagi/sore)
• Evaluasi suara lingkungan sekitar
• Diskusikan renovation potential dengan agent

Masih tertarik? Saya bisa arrange second viewing besok atau lusa.

Best,
[Agent Name]`, channel: 'WhatsApp' },
    { scenario: 'Family/Partner Joint Viewing Invite', template: `Hai [Name],

Banyak buyer kami yang merasa lebih confident setelah membawa pasangan atau keluarga untuk second viewing bersama.

🏠 [Property Name] masih tersedia dan kami bisa arrange:

📅 Family Viewing Session:
• Waktu: Weekend [Date], fleksibel pagi atau sore
• Durasi: 30–45 menit (lebih santai dari viewing pertama)
• Bonus: Kami siapkan neighborhood guide + financing overview

💬 Selama second viewing, Anda bisa:
✅ Diskusi layout dan kebutuhan keluarga
✅ Cek detail yang mungkin terlewat
✅ Tanya langsung ke agent tentang negosiasi

Mau kami jadwalkan?
👉 [link] atau reply dengan waktu preferensi Anda.`, channel: 'WhatsApp / Email' },
  ],
  confidenceTools: [
    { tool: 'Property Comparison Sheet', description: 'Side-by-side comparison of viewed property vs 2–3 alternatives', benefit: 'Helps buyer validate their preference with data' },
    { tool: 'Financing Quick Check', description: 'Simple calculator: estimated monthly payment based on property price', benefit: 'Removes financial uncertainty barrier' },
    { tool: 'Neighborhood Score Card', description: 'Rating card: safety, schools, transport, amenities, growth potential', benefit: 'Supports lifestyle decision beyond just property' },
    { tool: 'Soft Offer Discussion Guide', description: 'Framework for discussing offer range during second viewing', benefit: 'Bridges viewing to negotiation naturally' },
  ],
  kpis: [
    { metric: 'First-to-Second Viewing Rate', target: '≥35%', current: '12%' },
    { metric: 'Time Between Viewings', target: '≤4 days avg', current: '11 days' },
    { metric: 'Second Viewing to Offer Ratio', target: '≥45%', current: '18%' },
    { metric: 'Family/Partner Joint Viewing Rate', target: '≥25%', current: '5%' },
  ],
};

const leaderboard = {
  metrics: [
    { metric: 'Response Speed Score', weight: '25%', calculation: 'Avg response time to inquiries (target <5 min = 100 pts)', tiers: ['🥇 <2 min = 100', '🥈 2–5 min = 80', '🥉 5–15 min = 50', '⚠️ >15 min = 20'] },
    { metric: 'Viewing Conversion Score', weight: '25%', calculation: 'Inquiry-to-viewing ratio × viewing attendance rate', tiers: ['🥇 >50% = 100', '🥈 35–50% = 80', '🥉 20–35% = 50', '⚠️ <20% = 20'] },
    { metric: 'Deal Closure Volume', weight: '30%', calculation: 'Completed transactions in territory per month', tiers: ['🥇 ≥5 deals = 100', '🥈 3–4 deals = 80', '🥉 1–2 deals = 50', '⚠️ 0 deals = 0'] },
    { metric: 'Listing Quality Score', weight: '20%', calculation: 'Avg engagement time + photo quality + description completeness', tiers: ['🥇 ≥90% = 100', '🥈 70–89% = 80', '🥉 50–69% = 50', '⚠️ <50% = 20'] },
  ],
  badges: [
    { badge: '⚡ Speed Demon', criteria: 'Avg response time <2 min for 30 consecutive days', reward: 'Priority lead routing + badge on profile' },
    { badge: '🏆 Territory Champion', criteria: 'Highest composite score in district for the month', reward: 'Featured agent spotlight + premium listing boost' },
    { badge: '🔥 Hot Streak', criteria: '3+ deals closed in a single week', reward: 'Social media recognition + exclusive lead access' },
    { badge: '⭐ Quality King', criteria: 'Listing quality score ≥95% across all listings', reward: 'Auto-premium placement for new listings' },
    { badge: '📈 Growth Star', criteria: 'Biggest score improvement month-over-month', reward: 'Mentorship with top agent + strategy session' },
  ],
  weeklyTemplate: `🏆 TERRITORY LEADERBOARD — [District] — Minggu [Week]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🥇 #1 [Agent Name] — [Score] pts
   ⚡ Response: [X] min avg | 📊 Conversion: [Y]% | 💰 Deals: [Z]
   
🥈 #2 [Agent Name] — [Score] pts
   ⚡ Response: [X] min avg | 📊 Conversion: [Y]% | 💰 Deals: [Z]
   
🥉 #3 [Agent Name] — [Score] pts
   ⚡ Response: [X] min avg | 📊 Conversion: [Y]% | 💰 Deals: [Z]

📊 TERRITORY STATS:
• Total listings: [X]
• Inquiry volume: [Y] this week
• Avg response: [Z] min
• Deals closed: [W]

🎯 IMPROVEMENT AREAS:
• [X] agents below response target — coaching needed
• [Y] listings need quality refresh
• [Z] hot leads awaiting follow-up

💡 TIP MINGGU INI:
"[Actionable tip from top performer]"

👉 Full dashboard: [link]
📅 Next update: [Date]`,
  incentives: [
    { position: 'Top 3 Monthly', reward: 'Premium Boost credits (5 listings × 14 days)', value: 'Est. Rp 2.5M in exposure value' },
    { position: 'Most Improved', reward: 'Featured Agent interview on platform blog/social', value: 'Brand building + credibility boost' },
    { position: 'Consistent Top 10', reward: 'Exclusive quarterly strategy session with founder', value: 'Relationship + insider insights' },
    { position: 'Category Winner', reward: 'Specialized lead routing for winning metric area', value: 'Higher quality leads → more deals' },
  ],
  kpis: [
    { metric: 'Agent Leaderboard Check Rate', target: '≥70% weekly' },
    { metric: 'Response Speed Improvement', target: '+40% in 30 days' },
    { metric: 'Territory Listing Density Growth', target: '+20% per quarter' },
    { metric: 'Agent Satisfaction Score', target: '≥4.2/5.0' },
  ],
};

const urgentDeal = {
  selectionCriteria: [
    { criteria: 'Competitive Pricing', weight: '30%', logic: '≥10% below district average or recent price reduction', verification: 'Auto-calculated from market data' },
    { criteria: 'Active Demand Signals', weight: '25%', logic: '≥3 inquiries in last 7 days or saved by ≥10 users', verification: 'Platform analytics' },
    { criteria: 'High-Liquidity District', weight: '20%', logic: 'District with inquiry-to-listing ratio ≥3:1', verification: 'Liquidity score system' },
    { criteria: 'Listing Quality Score', weight: '15%', logic: '≥8 photos, complete description, verified badge', verification: 'Quality gate check' },
    { criteria: 'Seller Motivation', weight: '10%', logic: 'Seller has indicated urgency or flexibility', verification: 'Agent confirmation' },
  ],
  campaignFormats: [
    { format: 'Social Media Spotlight', template: `🔥 DEAL OF THE WEEK — [District]

🏠 [Property Name]
📍 [Full Address]

💰 Rp [Price] (📉 [X]% below market avg!)

Kenapa ini deal istimewa:
✅ [Key benefit 1]
✅ [Key benefit 2]  
✅ [Key benefit 3]

📊 Market Context:
• Avg [Property Type] di [District]: Rp [Avg]
• Properti ini: Rp [Price] — SAVE Rp [Difference]!
• [X] orang sudah viewing minggu ini

⏰ Limited viewing slots tersisa:
• [Slot 1]
• [Slot 2]
• [Slot 3]

👉 Book viewing: [link]
📞 Fast response: [Phone]

#ASTRAVilla #DealOfTheWeek #[District] #PropertyInvestment`, channel: 'Instagram + Facebook + TikTok' },
    { format: 'WhatsApp Broadcast Alert', template: `⚡ URGENT DEAL ALERT ⚡

Hai [Name],

Deal langka minggu ini yang cocok dengan preferensi Anda:

🏠 [Property Name] — [District]
💰 Rp [Price] (🔥 [X]% di bawah pasar!)

📊 Kenapa urgent:
• [Y] buyer lain sudah inquiry
• Harga ini valid sampai [Date]
• Seller motivated — nego terbuka

🏆 Deal Score: [X]/100 (TOP 5% di platform)

⏰ Viewing slots terbatas:
Reply "1" untuk book besok
Reply "2" untuk book lusa
Reply "3" untuk info lengkap

Jangan lewatkan! 🏃`, channel: 'WhatsApp broadcast to matched buyers' },
    { format: 'Homepage Banner', template: `🔥 DEAL OF THE WEEK
[Property Name] — [District]
Rp [Price] (Save [X]%!)
[Y] buyers interested • [Z] viewing slots left
[CTA: Book Viewing Now]`, channel: 'Platform homepage + email header' },
  ],
  weeklyCalendar: [
    { day: 'Monday', action: 'Select Deal of the Week based on scoring criteria', owner: 'Founder / Growth Lead' },
    { day: 'Tuesday', action: 'Create campaign assets (photos, copy, social posts)', owner: 'Content / Marketing' },
    { day: 'Wednesday AM', action: 'Launch social media spotlight + WhatsApp broadcast', owner: 'Marketing' },
    { day: 'Wednesday PM', action: 'Activate homepage banner + email blast', owner: 'Growth Lead' },
    { day: 'Thursday–Friday', action: 'Coordinate viewing slots + fast follow-up', owner: 'Agent + Coordinator' },
    { day: 'Saturday', action: 'Weekend viewing execution + real-time updates', owner: 'Agent' },
    { day: 'Sunday', action: 'Campaign performance review + next week deal shortlist', owner: 'Founder' },
  ],
  kpis: [
    { metric: 'Inquiry Spike During Campaign', target: '+80% vs normal week' },
    { metric: 'Viewing Bookings from Campaign', target: '≥10 per deal' },
    { metric: 'Offer Submission Acceleration', target: '≥3 offers within campaign week' },
    { metric: 'Campaign Engagement Rate', target: '≥45%' },
    { metric: 'Deal-of-Week Closing Rate', target: '≥30% within 30 days' },
  ],
};

const weeklyChecklist = [
  { category: 'Second Viewing Conversion', items: ['Review first-to-second viewing conversion rate vs 35% target', 'Audit post-viewing summary delivery (within 4hrs)', 'Track family/partner joint viewing requests', 'Follow up on buyers stuck in "considering" phase >5 days'] },
  { category: 'Territory Leaderboard', items: ['Publish weekly leaderboard rankings', 'Identify agents needing coaching (bottom quartile)', 'Distribute performance badges and rewards', 'Review response speed trends across territories'] },
  { category: 'Urgent Deal Campaign', items: ['Select next week Deal of the Week candidate', 'Review current campaign inquiry and viewing metrics', 'Coordinate viewing slots with featured agent', 'Analyze post-campaign conversion follow-through'] },
  { category: 'Ecosystem Health', items: ['Check overall viewing-to-offer pipeline health', 'Monitor agent satisfaction with leaderboard fairness', 'Validate campaign claims against actual data', 'Assess buyer sentiment on urgency messaging'] },
];

const risks = [
  { signal: 'Campaign fatigue — declining engagement after 4+ consecutive weeks', severity: 86, mitigation: 'Rotate campaign formats (video tour, live session, auction-style); skip a week periodically; vary districts and property types' },
  { signal: 'Leaderboard demotivating bottom performers instead of inspiring', severity: 84, mitigation: 'Show improvement trajectories not just rankings; create skill-specific categories; offer coaching instead of just ranking' },
  { signal: 'Second viewing pressure perceived as pushy', severity: 88, mitigation: 'Frame as "we want you to feel confident" not urgent; always offer "take your time" option; focus on added value not pressure' },
  { signal: 'Deal of the Week selection bias or favoritism perception', severity: 82, mitigation: 'Publish transparent scoring criteria; rotate agents featured; allow agent self-nomination with data backing' },
  { signal: 'Over-reliance on urgency reducing baseline organic inquiry quality', severity: 79, mitigation: 'Maintain 70/30 ratio (organic content vs urgency campaigns); track organic inquiry trend independently; strengthen SEO and content' },
];

const SecondViewingLeaderboardBlueprint = () => (
  <div className="space-y-6">
    <motion.div {...anim(0)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Eye className="h-6 w-6 text-primary" /></div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Second Viewing + Agent Leaderboard + Urgent Deal Campaign</h2>
          <p className="text-sm text-muted-foreground">Deep conversion, performance gamification & urgency-driven deal momentum</p>
        </div>
      </div>
    </motion.div>

    <Tabs defaultValue="viewing" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="viewing"><Eye className="h-4 w-4 mr-1.5" />Second Viewing</TabsTrigger>
        <TabsTrigger value="leaderboard"><Trophy className="h-4 w-4 mr-1.5" />Leaderboard</TabsTrigger>
        <TabsTrigger value="urgent"><Flame className="h-4 w-4 mr-1.5" />Urgent Deal</TabsTrigger>
        <TabsTrigger value="weekly"><ClipboardCheck className="h-4 w-4 mr-1.5" />Weekly Check</TabsTrigger>
        <TabsTrigger value="risks"><AlertTriangle className="h-4 w-4 mr-1.5" />Risks</TabsTrigger>
      </TabsList>

      {/* SECOND VIEWING TAB */}
      <TabsContent value="viewing" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Post-Viewing Engagement Flow</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {secondViewing.engagementFlow.map((p, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{p.phase}</span>
                    <div className="flex gap-1.5">
                      <Badge className={`text-[10px] ${p.priority === 'Critical' ? 'bg-destructive/10 text-destructive border-destructive/20' : p.priority === 'High' ? 'bg-chart-3/10 text-chart-3 border-chart-3/20' : 'bg-primary/10 text-primary border-primary/20'}`}>{p.priority}</Badge>
                      <Badge variant="outline" className="text-[10px]">{p.conversionImpact}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.actions.map((a, j) => (
                      <Badge key={j} className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">▸ {a}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-chart-3" />Confidence Support Tools</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {secondViewing.confidenceTools.map((t, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs font-semibold text-foreground mb-0.5">{t.tool}</p>
                    <p className="text-[10px] text-muted-foreground">{t.description}</p>
                    <p className="text-[10px] text-primary mt-0.5">→ {t.benefit}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Second Viewing KPIs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {secondViewing.kpis.map((k, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="font-medium text-foreground">{k.metric}</span><div className="flex gap-1.5"><Badge variant="outline" className="text-[10px] text-destructive">{k.current}</Badge><Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">→ {k.target}</Badge></div></div>
                    <Progress value={parseInt(k.current)} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {secondViewing.scripts.map((s, i) => (
          <motion.div key={i} {...anim(i + 4)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{s.scenario}</CardTitle>
                  <Badge variant="outline" className="text-[10px]">{s.channel}</Badge>
                </div>
              </CardHeader>
              <CardContent><CopyBlock text={s.template} /></CardContent>
            </Card>
          </motion.div>
        ))}
      </TabsContent>

      {/* LEADERBOARD TAB */}
      <TabsContent value="leaderboard" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Medal className="h-4 w-4 text-chart-3" />Scoring Metrics</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {leaderboard.metrics.map((m, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{m.metric}</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Weight: {m.weight}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1">{m.calculation}</p>
                  <div className="flex flex-wrap gap-1">
                    {m.tiers.map((t, j) => (
                      <Badge key={j} variant="outline" className="text-[9px]">{t}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div {...anim(2)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-chart-3" />Achievement Badges</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {leaderboard.badges.map((b, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-foreground">{b.badge}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{b.criteria}</p>
                    <p className="text-[10px] text-primary mt-0.5">🎁 {b.reward}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...anim(3)}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Position Rewards</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {leaderboard.incentives.map((inc, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-foreground">{inc.position}</span>
                    </div>
                    <p className="text-[11px] text-foreground">{inc.reward}</p>
                    <p className="text-[10px] text-primary mt-0.5">💰 {inc.value}</p>
                  </div>
                ))}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {leaderboard.kpis.map((k, i) => (
                    <div key={i} className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
                      <p className="text-[10px] text-muted-foreground">{k.metric}</p>
                      <p className="text-xs font-bold text-foreground mt-1">{k.target}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div {...anim(4)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Weekly Leaderboard Template</CardTitle></CardHeader>
            <CardContent><CopyBlock text={leaderboard.weeklyTemplate} /></CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* URGENT DEAL TAB */}
      <TabsContent value="urgent" className="space-y-4">
        <motion.div {...anim(1)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-destructive" />Deal Selection Scoring</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {urgentDeal.selectionCriteria.map((c, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{c.criteria}</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Weight: {c.weight}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{c.logic}</p>
                  <p className="text-[10px] text-primary mt-0.5">✅ {c.verification}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(2)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-chart-3" />Weekly Execution Calendar</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {urgentDeal.weeklyCalendar.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                  <Badge variant="outline" className="text-[10px] w-24 justify-center flex-shrink-0">{d.day}</Badge>
                  <span className="text-[11px] text-foreground flex-1">{d.action}</span>
                  <Badge className="text-[9px] bg-muted/50 text-muted-foreground border-border/30">{d.owner}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {urgentDeal.campaignFormats.map((c, i) => (
          <motion.div key={i} {...anim(i + 3)}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{c.format}</CardTitle>
                  <Badge variant="outline" className="text-[10px]">{c.channel}</Badge>
                </div>
              </CardHeader>
              <CardContent><CopyBlock text={c.template} /></CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div {...anim(6)}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Campaign KPIs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              {urgentDeal.kpis.map((k, i) => (
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

export default SecondViewingLeaderboardBlueprint;
