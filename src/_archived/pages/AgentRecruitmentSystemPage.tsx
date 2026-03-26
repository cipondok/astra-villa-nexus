import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Target, MessageSquare, ClipboardCheck, Trophy, Heart,
  Copy, Check, ChevronRight, BarChart3, Zap, Award, TrendingUp,
  Clock, Star, Shield, Phone, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const FADE = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

/* ── Outreach Scripts ── */
const SCRIPTS = [
  {
    id: 'first-contact',
    title: 'First Contact — WhatsApp',
    context: 'Cold outreach to agents active in target districts',
    tactic: 'Exclusivity Anchoring + Curiosity Gap',
    message: `Halo Pak/Bu [Nama] 👋

Saya dari ASTRA Villa — platform properti yang sekarang aktif di [Kota/Distrik].

Kami sedang membangun tim agen eksklusif untuk area [Distrik Target], dan nama Bapak/Ibu muncul sebagai salah satu agen paling aktif di sana.

Yang kami tawarkan berbeda dari portal listing biasa:
✅ Leads pembeli yang sudah terverifikasi finansial
✅ AI negotiation support untuk bantu closing lebih cepat
✅ Komisi kompetitif + bonus early partner

Apakah Bapak/Ibu bersedia luangkan 10 menit untuk saya jelaskan bagaimana agen kami rata-rata closing 2x lebih cepat?

Terima kasih 🙏`,
  },
  {
    id: 'value-proposition',
    title: 'Value Proposition Deep-Dive',
    context: 'Follow-up after agent shows initial interest',
    tactic: 'Social Proof + Concrete Numbers',
    message: `Terima kasih sudah merespons, Pak/Bu [Nama] 🙏

Berikut detail keunggulan bergabung sebagai ASTRA Agent:

📊 *Lead Generation*
→ Kami distribute 15-30 leads/bulan ke setiap agen aktif
→ Leads sudah di-scoring berdasarkan intent beli (bukan sekadar inquiry)

🤖 *AI Negotiation Support*
→ Sistem kami menyediakan range harga optimal + comparable data
→ Agen kami rata-rata closing 40% lebih cepat dari rata-rata pasar

💰 *Earning Potential*
→ Komisi standar 2.5% dari nilai transaksi
→ Early partner bonus: +0.5% untuk 6 bulan pertama
→ Performance bonus bulanan untuk top 10 agen

📱 *Technology Support*
→ CRM mobile-friendly untuk tracking semua deals
→ Dashboard performa real-time
→ Automated viewing scheduling

Mau saya kirim contoh dashboard agen kami? 📲`,
  },
  {
    id: 'objection-commission',
    title: 'Objection Handler — Commission',
    context: 'Agent questions commission structure',
    tactic: 'Risk Reversal + Value Reframe',
    message: `Pak/Bu [Nama], pertanyaan bagus tentang komisi 👍

Kalau dihitung dari sisi *net earning per jam kerja*, agen ASTRA justru lebih untung:

❌ Cara lama: Cari buyer sendiri → follow up manual → negosiasi panjang → closing 3-6 bulan
✅ ASTRA: Buyer terverifikasi → AI assist negotiation → closing rata-rata 45 hari

Dengan volume leads yang lebih tinggi dan waktu closing yang lebih pendek, total income per bulan justru naik signifikan.

Plus, sebagai early partner Bapak/Ibu dapat:
• Bonus +0.5% extra selama 6 bulan
• Prioritas lead allocation di distrik pilihan
• Zero onboarding cost

Apakah Bapak/Ibu mau coba 1 bulan dulu? Tidak ada lock-in contract 🤝`,
  },
  {
    id: 'objection-trust',
    title: 'Objection Handler — Trust',
    context: 'Agent is skeptical about the platform',
    tactic: 'Transparency + Proof Points',
    message: `Sangat wajar kalau Bapak/Ibu ingin memastikan dulu 🙏

Beberapa fakta tentang ASTRA:
📋 Terdaftar resmi dan legal
🏡 [X] listing aktif di database kami
✅ [Y] transaksi berhasil di-closing melalui platform
⭐ Rating kepuasan agen: 4.7/5.0

Kami juga bisa connect Bapak/Ibu dengan 2-3 agen aktif yang sudah bergabung — bisa tanya langsung pengalaman mereka.

Yang penting: tidak ada biaya apapun untuk mulai. Bapak/Ibu upload listing, kami bantu carikan buyer yang serius.

Kapan waktu yang nyaman untuk onboarding call 15 menit? 📞`,
  },
  {
    id: 'closing',
    title: 'Conversion Closing',
    context: 'Agent is warm — ready to commit',
    tactic: 'Scarcity + Immediate Action',
    message: `Pak/Bu [Nama], update penting 🔔

Kuota early partner untuk area [Distrik] tinggal [X] slot lagi. Setelah kuota penuh, bonus +0.5% dan prioritas lead tidak berlaku lagi.

Untuk bergabung sangat simple:
1️⃣ Klik link registrasi: [link]
2️⃣ Upload KTP + sertifikat agen (5 menit)
3️⃣ Upload 3-5 listing pertama
4️⃣ Tim kami akan bantu setup dalam 24 jam

Begitu aktif, leads pertama bisa masuk dalam hitungan hari.

Saya siap bantu proses onboarding-nya sekarang. Mau mulai? 🚀`,
  },
];

/* ── Onboarding Checklist ── */
const ONBOARDING_STEPS = [
  { step: 'Account Registration', owner: 'Agent', duration: '5 min', items: [
    'Complete registration form with personal details',
    'Upload KTP / identity verification document',
    'Upload professional certification (if available)',
    'Set preferred districts and property specializations',
  ]},
  { step: 'Profile Setup', owner: 'Agent', duration: '15 min', items: [
    'Upload professional headshot photo',
    'Write agent bio and experience summary',
    'Add contact preferences (WhatsApp, phone, email)',
    'Link social media profiles for credibility',
  ]},
  { step: 'Platform Training', owner: 'ASTRA Team', duration: '30 min', items: [
    'CRM walkthrough — lead management workflow',
    'Listing upload tutorial — photo standards and description guidelines',
    'Viewing scheduler demo — automated confirmations',
    'Negotiation assistant overview — AI-powered offer guidance',
  ]},
  { step: 'First Listings Upload', owner: 'Agent', duration: '20 min', items: [
    'Upload minimum 3 verified property listings',
    'Ensure high-quality photos (minimum 5 per listing)',
    'Set competitive pricing based on market data',
    'Complete all required listing fields',
  ]},
  { step: 'Performance Dashboard Orientation', owner: 'ASTRA Team', duration: '15 min', items: [
    'Explain lead scoring and priority indicators',
    'Show conversion funnel metrics and targets',
    'Demonstrate commission tracking and payout schedule',
    'Set up mobile push notifications for new leads',
  ]},
  { step: 'Go-Live Activation', owner: 'ASTRA Team', duration: '10 min', items: [
    'Verify all listings are published and indexed',
    'Confirm lead routing is active for agent districts',
    'Send welcome kit with brand assets and guidelines',
    'Schedule 7-day check-in call for first-week support',
  ]},
];

/* ── Performance KPIs ── */
const AGENT_KPIS = [
  { metric: 'Lead Response Time', target: '< 15 minutes', weight: '25%', icon: Clock, tier: 'critical' as const },
  { metric: 'Viewing Conversion Rate', target: '> 60%', weight: '20%', icon: ArrowUpRight, tier: 'high' as const },
  { metric: 'Offer Submission Rate', target: '> 25%', weight: '20%', icon: Target, tier: 'high' as const },
  { metric: 'Deal Closing Rate', target: '> 35%', weight: '20%', icon: Trophy, tier: 'critical' as const },
  { metric: 'Client Satisfaction (NPS)', target: '> 60', weight: '15%', icon: Star, tier: 'medium' as const },
];

/* ── Incentive Tiers ── */
const INCENTIVE_TIERS = [
  { name: 'Founding Agent', requirement: 'Join during first 90 days', benefits: ['+0.5% commission bonus for 6 months', 'Priority lead allocation in chosen district', 'Featured agent badge on profile', 'Direct access to founder for support'], color: 'hsl(var(--chart-1))' },
  { name: 'Performance Star', requirement: 'Close 5+ deals in a month', benefits: ['Monthly cash bonus Rp 2M-5M', 'Leaderboard featured position', '2x lead allocation multiplier', 'Premium listing boost for agent listings'], color: 'hsl(var(--chart-2))' },
  { name: 'Referral Champion', requirement: 'Recruit 3+ active agents', benefits: ['Rp 500k per recruited agent who closes a deal', 'Team lead title and expanded territory', 'Revenue share on recruited agent commissions', 'Quarterly leadership retreat invitation'], color: 'hsl(var(--chart-3))' },
  { name: 'Loyalty Elite', requirement: '12+ months active with 80%+ KPI score', benefits: ['Exclusive high-value lead access', 'Annual performance bonus', 'Co-branded marketing materials', 'Advisory council membership'], color: 'hsl(var(--chart-4))' },
];

/* ── Scaling Roadmap ── */
const SCALING_PHASES = [
  { phase: 'Seed (Month 1-2)', agents: '10-25', focus: 'Core team in 3-5 key districts', actions: ['Recruit via personal network and LinkedIn', 'Focus on agents with 2+ years experience', 'Weekly 1-on-1 support calls', 'Manual lead quality assurance'] },
  { phase: 'Growth (Month 3-4)', agents: '25-75', focus: 'District density in target city', actions: ['Launch structured referral program', 'Standardize onboarding with video training', 'Implement automated lead scoring', 'Monthly performance reviews with coaching'] },
  { phase: 'Scale (Month 5-8)', agents: '75-200', focus: 'Multi-district coverage', actions: ['Hire dedicated agent success manager', 'Deploy tiered agent certification program', 'Automate underperforming agent alerts', 'Expand to adjacent cities with proven playbook'] },
  { phase: 'Network Effect (Month 9-12)', agents: '200-500', focus: 'Self-sustaining growth via referrals', actions: ['Agent-recruits-agent flywheel active', 'Regional team leads managing sub-networks', 'AI-powered agent-listing matching', 'Brand becomes agent destination of choice'] },
];

function CopyableScript({ script }: { script: typeof SCRIPTS[0] }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(script.message);
    setCopied(true);
    toast.success('Script copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{script.title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{script.context}</p>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">{script.tactic}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <pre className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-4 border border-border leading-relaxed font-sans">
          {script.message}
        </pre>
        <Button variant="outline" size="sm" onClick={copy} className="gap-2">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy Script'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AgentRecruitmentSystemPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const totalItems = useMemo(() => ONBOARDING_STEPS.reduce((s, p) => s + p.items.length, 0), []);
  const completed = useMemo(() => Object.values(checkedItems).filter(Boolean).length, [checkedItems]);
  const toggle = (k: string) => setCheckedItems(p => ({ ...p, [k]: !p[k] }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div variants={FADE} initial="hidden" animate="show" className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Users className="h-7 w-7 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agent Recruitment & Performance System</h1>
              <p className="text-sm text-muted-foreground">Recruit, onboard, and scale a high-performing agent network</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="scripts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="scripts">Outreach</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
            <TabsTrigger value="incentives">Incentives</TabsTrigger>
            <TabsTrigger value="scaling">Scaling</TabsTrigger>
          </TabsList>

          {/* ── Scripts ── */}
          <TabsContent value="scripts" className="space-y-5">
            {SCRIPTS.map((s, i) => (
              <motion.div key={s.id} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.07 }}>
                <CopyableScript script={s} />
              </motion.div>
            ))}
          </TabsContent>

          {/* ── Onboarding ── */}
          <TabsContent value="onboarding" className="space-y-5">
            <div className="flex items-center gap-4">
              <Progress value={totalItems > 0 ? (completed / totalItems) * 100 : 0} className="flex-1 h-2.5" />
              <span className="text-sm font-semibold tabular-nums">{completed}/{totalItems}</span>
            </div>
            {ONBOARDING_STEPS.map((step, si) => (
              <motion.div key={step.step} variants={FADE} initial="hidden" animate="show" transition={{ delay: si * 0.06 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{si + 1}</span>
                        {step.step}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{step.owner}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{step.duration}</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {step.items.map((item, ii) => {
                      const k = `${si}-${ii}`;
                      return (
                        <label key={k} className="flex items-start gap-3 cursor-pointer group">
                          <Checkbox checked={!!checkedItems[k]} onCheckedChange={() => toggle(k)} className="mt-0.5" />
                          <span className={`text-sm leading-relaxed transition-colors ${checkedItems[k] ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-primary'}`}>{item}</span>
                        </label>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ── KPIs ── */}
          <TabsContent value="kpis" className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AGENT_KPIS.map((kpi, i) => (
                <motion.div key={kpi.metric} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.06 }}>
                  <Card className="h-full">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className={`p-2 rounded-lg shrink-0 ${kpi.tier === 'critical' ? 'bg-destructive/10' : kpi.tier === 'high' ? 'bg-primary/10' : 'bg-muted'}`}>
                        <kpi.icon className={`h-4 w-4 ${kpi.tier === 'critical' ? 'text-destructive' : kpi.tier === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">{kpi.metric}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold tabular-nums">{kpi.target}</span>
                          <Badge variant={kpi.tier === 'critical' ? 'destructive' : 'secondary'} className="text-[10px]">Weight: {kpi.weight}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Composite Agent Score Formula</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Agent Performance Score = (Response × 0.25) + (Viewing Conv × 0.20) + (Offer Rate × 0.20) + (Close Rate × 0.20) + (NPS × 0.15)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Top Performer', range: '85-100', color: 'bg-green-500/10 text-green-600' },
                    { label: 'Strong', range: '70-84', color: 'bg-primary/10 text-primary' },
                    { label: 'Developing', range: '50-69', color: 'bg-yellow-500/10 text-yellow-600' },
                    { label: 'At Risk', range: '< 50', color: 'bg-destructive/10 text-destructive' },
                  ].map(t => (
                    <div key={t.label} className={`p-3 rounded-lg ${t.color} text-center`}>
                      <p className="text-xs font-medium">{t.label}</p>
                      <p className="text-lg font-bold tabular-nums">{t.range}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Incentives ── */}
          <TabsContent value="incentives" className="space-y-5">
            {INCENTIVE_TIERS.map((tier, i) => (
              <motion.div key={tier.name} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.07 }}>
                <Card className="border-l-4" style={{ borderLeftColor: tier.color }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2"><Award className="h-4 w-4" style={{ color: tier.color }} />{tier.name}</span>
                      <Badge variant="outline" className="text-[10px]">{tier.requirement}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {tier.benefits.map(b => (
                        <div key={b} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="text-foreground">{b}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ── Scaling Roadmap ── */}
          <TabsContent value="scaling" className="space-y-5">
            {SCALING_PHASES.map((phase, i) => (
              <motion.div key={phase.phase} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.08 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{phase.phase}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="tabular-nums">{phase.agents} agents</Badge>
                      </div>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{phase.focus}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {phase.actions.map(a => (
                        <div key={a} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/40">
                          <Zap className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <span className="text-foreground">{a}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
