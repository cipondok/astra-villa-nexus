import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Target, MessageSquare, Trophy, Heart, Copy, Check,
  ChevronRight, BarChart3, Zap, Award, TrendingUp, Clock,
  Star, Shield, DollarSign, Eye, ArrowUpRight, Gem
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const FADE = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

/* ── Playbook Phases ── */
const PLAYBOOK = [
  { phase: 'Investor Identification & Qualification', color: 'hsl(var(--chart-1))', items: [
    'Build target list of 30-50 capital-ready individuals from network, events, and inbound inquiries',
    'Score each prospect: investment budget > Rp 2B, prior property ownership, rental yield interest',
    'Verify financial readiness — proof of funds or KPR pre-approval documentation',
    'Classify investor profile: yield-seeker, capital-growth, diversifier, or first-time investor',
    'Assign dedicated relationship manager (founder for first 10)',
  ]},
  { phase: 'Curated Deal Presentation', color: 'hsl(var(--chart-2))', items: [
    'Pre-select 5-8 high-liquidity properties per investor profile (AI deal matching)',
    'Prepare personalized investment brief: ROI projection, rental yield estimate, capital growth forecast',
    'Include 3 comparable recent transactions as price validation',
    'Highlight negotiation opportunity — gap between ask price and AI fair market value',
    'Send curated deck via WhatsApp with follow-up call scheduled within 24 hours',
  ]},
  { phase: 'Trust Acceleration & Viewing', color: 'hsl(var(--chart-3))', items: [
    'Offer exclusive priority viewing slots (before public listing exposure)',
    'Founder personally accompanies first 3-5 investor viewings',
    'Share transparent market intelligence: district demand index, absorption rate, price trends',
    'Provide live demo of ASTRA investor dashboard and analytics tools on-site',
    'Collect viewing feedback within 2 hours — rate interest 1-5, capture objections',
  ]},
  { phase: 'Negotiation & Decision Support', color: 'hsl(var(--chart-4))', items: [
    'Present AI-generated optimal offer range based on FMV and comparable data',
    'Share urgency signals: competing inquiries count, demand heat score, listing velocity',
    'Facilitate digital offer submission with 72-hour validity window',
    'Manage counter-offer rounds with real-time messaging coordination',
    'Coordinate legal document checklist and notary scheduling proactively',
  ]},
  { phase: 'Closing Coordination', color: 'hsl(var(--chart-5))', items: [
    'Guide escrow deposit process (5-10% of transaction value)',
    'Assign legal coordinator for document verification and compliance',
    'Track all milestones daily: payment, legal, notary, handover',
    'Personally call investor on closing day — confirm satisfaction, celebrate milestone',
    'Issue ASTRA deal completion certificate with transaction summary',
  ]},
  { phase: 'Post-Close Relationship Building', color: 'hsl(var(--chart-1))', items: [
    'Onboard investor to ASTRA Portfolio Analytics dashboard within 48 hours',
    'Introduce premium Investor Intelligence Terminal subscription (free 3-month trial)',
    'Present rental yield optimization tools and renovation ROI calculator',
    'Request testimonial and video case study within 14 days',
    'Ask for 2-3 warm referral introductions to fellow investors',
  ]},
];

/* ── Communication Scripts ── */
const SCRIPTS = [
  {
    id: 'first-approach',
    title: 'First Investor Approach',
    context: 'Warm outreach to qualified investor prospect',
    tactic: 'Exclusivity + Intelligence Positioning',
    message: `Halo Pak/Bu [Nama] 👋

Saya [Nama Founder], founder ASTRA Villa — platform intelligence properti yang membantu investor menemukan dan menutup deal properti dengan data-driven insights.

Saya perhatikan Bapak/Ibu memiliki pengalaman di investasi properti di area [Kota/Distrik]. Saat ini kami memiliki beberapa deal eksklusif yang belum dipublikasikan ke pasar umum:

📊 [Tipe Properti] di [Distrik] — yield estimate [X]%/tahun
📈 Harga di bawah fair market value berdasarkan analisis AI kami
🔥 District demand index: [Score]/100

Sebagai investor prioritas, Bapak/Ibu bisa mendapat akses viewing dan data analisis sebelum listing dibuka ke publik.

Apakah ada waktu 15 menit minggu ini untuk saya presentasikan peluangnya? 🙏`,
  },
  {
    id: 'post-viewing',
    title: 'Post-Viewing Follow-Up',
    context: 'Sent within 2 hours after property viewing',
    tactic: 'Urgency + Data Reinforcement',
    message: `Pak/Bu [Nama], terima kasih untuk waktu viewingnya tadi 🙏

Berikut ringkasan data untuk properti yang kita lihat:

🏠 [Nama Properti]
💰 Asking price: Rp [X]
📊 AI Fair Market Value: Rp [Y] (selisih [Z]%)
📈 Projected rental yield: [A]%/tahun
🔥 Area demand score: [B]/100
👀 [C] investor lain sudah melihat listing ini minggu ini

Berdasarkan analisis kami, range penawaran optimal adalah Rp [Min] – Rp [Max].

Jika Bapak/Ibu tertarik untuk submit offer, saya bisa bantu persiapkan dokumennya hari ini.

Mau lanjut ke tahap penawaran? 📝`,
  },
  {
    id: 'urgency-push',
    title: 'Urgency Signal Alert',
    context: 'When competing interest detected on a listing',
    tactic: 'FOMO + Transparent Intelligence',
    message: `Pak/Bu [Nama], update penting tentang [Properti] 🔔

📊 Data real-time dari platform kami:
→ [X] inquiry baru masuk dalam 48 jam terakhir
→ [Y] viewing sudah dijadwalkan minggu ini
→ Listing ini masuk kategori "FAST CLOSE" — estimasi closing dalam [Z] hari

Berdasarkan pattern data kami, properti dengan sinyal seperti ini biasanya menerima offer dalam 5-7 hari.

Saya sudah siapkan draft offer di range optimal. Tinggal Bapak/Ibu konfirmasi, prosesnya bisa selesai dalam hitungan menit.

Apakah mau kita finalize hari ini? ⚡`,
  },
  {
    id: 'referral-ask',
    title: 'Post-Close Referral Request',
    context: 'Sent 7-14 days after successful transaction closing',
    tactic: 'Gratitude + Social Proof Request',
    message: `Pak/Bu [Nama], selamat atas closing properti [Alamat] 🎉🏠

Semoga investasinya memberikan return yang excellent. Tim kami akan terus monitor performa properti Bapak/Ibu melalui dashboard analytics.

Saya punya permintaan kecil — apakah Bapak/Ibu kenal 2-3 rekan investor yang mungkin juga mencari peluang properti serupa?

Sebagai apresiasi, untuk setiap referral yang berhasil closing:
🎁 Bapak/Ibu mendapat 3 bulan gratis Investor Intelligence Terminal
📊 Akses eksklusif ke pre-market deal alerts
⭐ Priority listing untuk deal selanjutnya

Terima kasih atas kepercayaannya 🙏`,
  },
];

/* ── KPI Benchmarks ── */
const KPIS = [
  { metric: 'Qualified Investor Pipeline', target: '30-50 prospects', benchmark: 'Need 5:1 ratio for 10 closes', icon: Users, tier: 'critical' as const },
  { metric: 'First Meeting Conversion', target: '> 60%', benchmark: '% of qualified who take a viewing', icon: Eye, tier: 'high' as const },
  { metric: 'Viewing → Offer Rate', target: '> 40%', benchmark: 'Investor submits offer after viewing', icon: ArrowUpRight, tier: 'critical' as const },
  { metric: 'Offer → Close Rate', target: '> 50%', benchmark: 'Higher than general market (investor deals)', icon: Trophy, tier: 'critical' as const },
  { metric: 'Average Days to Close', target: '< 35 days', benchmark: 'Investor deals close faster than retail', icon: Clock, tier: 'high' as const },
  { metric: 'Post-Close NPS', target: '> 70', benchmark: 'Must be exceptional for referral engine', icon: Star, tier: 'high' as const },
  { metric: 'Referral Conversion', target: '> 2 per investor', benchmark: 'Each closed investor refers 2+ prospects', icon: Heart, tier: 'medium' as const },
  { metric: 'Premium Subscription Uptake', target: '> 60%', benchmark: 'Free trial → paid conversion', icon: Gem, tier: 'medium' as const },
];

/* ── Retention & Upsell ── */
const RETENTION_TIERS = [
  { name: 'Founding Investor Circle', trigger: 'First 10 closed investors', benefits: ['Lifetime priority access to pre-market deals', 'Founder direct line for deal consultation', 'Featured investor profile on platform', 'Annual exclusive investment dinner invitation'], color: 'hsl(var(--chart-1))' },
  { name: 'Intelligence Subscription', trigger: 'Post-close Day 7', benefits: ['3-month free Investor Intelligence Terminal', 'Portfolio analytics with rental yield tracking', 'AI-powered diversification recommendations', 'Market prediction alerts for owned districts'], color: 'hsl(var(--chart-2))' },
  { name: 'Repeat Deal Incentives', trigger: 'After first successful deal', benefits: ['Reduced platform commission on 2nd deal', 'Priority agent assignment for next transaction', 'Early access to off-plan launch radar deals', 'Dedicated portfolio review sessions (quarterly)'], color: 'hsl(var(--chart-3))' },
  { name: 'Referral Network Rewards', trigger: 'Each successful referral', benefits: ['3 months free premium subscription per referral', 'Referral leaderboard recognition', 'Co-investment opportunity access for top referrers', 'Annual investor community ambassador title'], color: 'hsl(var(--chart-4))' },
];

function CopyableScript({ script }: { script: typeof SCRIPTS[0] }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(script.message);
    setCopied(true);
    toast.success('Script copied');
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
        <pre className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-4 border border-border leading-relaxed font-sans">{script.message}</pre>
        <Button variant="outline" size="sm" onClick={copy} className="gap-2">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy Script'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function First10InvestorClosingPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const totalItems = useMemo(() => PLAYBOOK.reduce((s, p) => s + p.items.length, 0), []);
  const completed = useMemo(() => Object.values(checkedItems).filter(Boolean).length, [checkedItems]);
  const toggle = (k: string) => setCheckedItems(p => ({ ...p, [k]: !p[k] }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div variants={FADE} initial="hidden" animate="show" className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Gem className="h-7 w-7 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">First 10 Investor Deal Closing</h1>
              <p className="text-sm text-muted-foreground">Elite conversion system for founding investor credibility</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Progress value={totalItems > 0 ? (completed / totalItems) * 100 : 0} className="flex-1 h-2.5" />
            <span className="text-sm font-semibold tabular-nums">{completed}/{totalItems}</span>
          </div>
        </motion.div>

        {/* Milestone Bar */}
        <motion.div variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.08 }} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { n: 1, label: 'First Blood', signal: 'System validated end-to-end' },
            { n: 3, label: 'Pattern Confirmed', signal: 'Repeatable process proven' },
            { n: 5, label: 'Referral Engine On', signal: 'Organic leads from investors' },
            { n: 8, label: 'Social Proof', signal: 'Case studies ready for PR' },
            { n: 10, label: 'Credibility Threshold', signal: 'Institutional confidence signal' },
          ].map(m => (
            <Card key={m.n} className="border">
              <CardContent className="p-3 text-center space-y-0.5">
                <p className="text-xl font-black tabular-nums text-primary">{m.n}</p>
                <p className="text-[10px] font-medium text-foreground">{m.label}</p>
                <p className="text-[9px] text-muted-foreground">{m.signal}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs defaultValue="playbook" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="playbook">Playbook</TabsTrigger>
            <TabsTrigger value="scripts">Scripts</TabsTrigger>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
          </TabsList>

          {/* ── Playbook ── */}
          <TabsContent value="playbook" className="space-y-5">
            {PLAYBOOK.map((phase, pi) => (
              <motion.div key={phase.phase} variants={FADE} initial="hidden" animate="show" transition={{ delay: pi * 0.06 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: phase.color }} />
                      {phase.phase}
                      <Badge variant="outline" className="ml-auto text-xs tabular-nums">
                        {phase.items.filter((_, i) => checkedItems[`${pi}-${i}`]).length}/{phase.items.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {phase.items.map((item, ii) => {
                      const k = `${pi}-${ii}`;
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

          {/* ── Scripts ── */}
          <TabsContent value="scripts" className="space-y-5">
            {SCRIPTS.map((s, i) => (
              <motion.div key={s.id} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.07 }}>
                <CopyableScript script={s} />
              </motion.div>
            ))}
          </TabsContent>

          {/* ── KPIs ── */}
          <TabsContent value="kpis" className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KPIS.map((kpi, i) => (
                <motion.div key={kpi.metric} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.05 }}>
                  <Card className="h-full">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className={`p-2 rounded-lg shrink-0 ${kpi.tier === 'critical' ? 'bg-destructive/10' : kpi.tier === 'high' ? 'bg-primary/10' : 'bg-muted'}`}>
                        <kpi.icon className={`h-4 w-4 ${kpi.tier === 'critical' ? 'text-destructive' : kpi.tier === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">{kpi.metric}</p>
                        <p className="text-lg font-bold tabular-nums text-foreground">{kpi.target}</p>
                        <p className="text-xs text-muted-foreground">{kpi.benchmark}</p>
                      </div>
                      <Badge variant={kpi.tier === 'critical' ? 'destructive' : 'secondary'} className="text-[10px] shrink-0">{kpi.tier}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Conversion Funnel — First 10 Investors</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { stage: 'Qualified Pipeline', count: '30-50', rate: '100%' },
                    { stage: 'First Meeting / Call', count: '18-30', rate: '60%' },
                    { stage: 'Property Viewing', count: '12-20', rate: '65%' },
                    { stage: 'Offer Submitted', count: '8-12', rate: '40-60%' },
                    { stage: 'Deal Closed', count: '10', rate: '50%+' },
                  ].map((f, i) => (
                    <div key={f.stage} className="flex items-center gap-3">
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-foreground flex-1">{f.stage}</span>
                      <span className="text-sm font-bold text-primary tabular-nums">{f.rate}</span>
                      <span className="text-xs text-muted-foreground tabular-nums w-16 text-right">{f.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Retention & Upsell ── */}
          <TabsContent value="retention" className="space-y-5">
            {RETENTION_TIERS.map((tier, i) => (
              <motion.div key={tier.name} variants={FADE} initial="hidden" animate="show" transition={{ delay: i * 0.07 }}>
                <Card className="border-l-4" style={{ borderLeftColor: tier.color }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2"><Award className="h-4 w-4" style={{ color: tier.color }} />{tier.name}</span>
                      <Badge variant="outline" className="text-[10px]">{tier.trigger}</Badge>
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
        </Tabs>
      </div>
    </div>
  );
}
