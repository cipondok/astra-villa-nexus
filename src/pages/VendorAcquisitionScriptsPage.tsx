import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  MessageSquare, Copy, Check, ArrowUpRight, Layers,
  Phone, UserPlus, Clock, Shield, Star, Wrench, Paintbrush,
  Sparkles, Scale, Sofa, AlertTriangle, Zap, Target, Gift,
  CheckCircle2, Circle, Users, Calendar, TrendingUp, Trophy,
  ChevronRight, MapPin, FileText, Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ── Animation ── */

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

/* ── Copy Button ── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Script copied');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" className="text-xs gap-1.5 h-7" onClick={handleCopy}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
}

/* ── Vendor Categories ── */

interface VendorCategory {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  painPoints: string[];
  valueHooks: string[];
  avgDealSize: string;
  demandSignal: string;
}

const VENDOR_CATEGORIES: VendorCategory[] = [
  {
    key: 'renovation', label: 'Renovation Contractors', icon: Wrench,
    color: 'text-chart-4', bg: 'bg-chart-4/10', border: 'border-chart-4/30',
    painPoints: ['Inconsistent project flow', 'Client trust issues', 'Payment delays'],
    valueHooks: ['Steady investor-driven renovation projects', 'Verified client profiles', 'Milestone-based payment protection'],
    avgDealSize: 'Rp 50-200M', demandSignal: 'High — 73% of investors renovate within 60 days of purchase',
  },
  {
    key: 'interior', label: 'Interior Designers', icon: Paintbrush,
    color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30',
    painPoints: ['Portfolio visibility limited', 'Client acquisition cost high', 'Scope creep without structure'],
    valueHooks: ['Digital portfolio showcase to 10K+ investors', 'Pre-qualified project briefs', 'Structured scope + budget framework'],
    avgDealSize: 'Rp 30-150M', demandSignal: 'Medium-High — 45% of premium property buyers use interior services',
  },
  {
    key: 'cleaning', label: 'Cleaning & Maintenance', icon: Sparkles,
    color: 'text-chart-2', bg: 'bg-chart-2/10', border: 'border-chart-2/30',
    painPoints: ['Low margins per job', 'Seasonal demand swings', 'Scaling staff utilization'],
    valueHooks: ['Recurring contracts from property managers', 'Volume-based pricing power', 'Predictable monthly job flow'],
    avgDealSize: 'Rp 2-15M/mo', demandSignal: 'Very High — recurring demand from rental property portfolio owners',
  },
  {
    key: 'legal', label: 'Legal & Inspection', icon: Scale,
    color: 'text-chart-3', bg: 'bg-chart-3/10', border: 'border-chart-3/30',
    painPoints: ['Client education overhead', 'Fee negotiation pressure', 'Reputation difficult to build'],
    valueHooks: ['Pre-educated clients via ASTRA guides', 'Standardized fee structure protection', 'Verified credential badge + reviews'],
    avgDealSize: 'Rp 5-25M', demandSignal: 'High — every transaction requires legal + inspection',
  },
  {
    key: 'furnishing', label: 'Furnishing Suppliers', icon: Sofa,
    color: 'text-chart-5', bg: 'bg-chart-5/10', border: 'border-chart-5/30',
    painPoints: ['Showroom foot traffic declining', 'Online competition from e-commerce', 'Bulk order sourcing difficult'],
    valueHooks: ['Direct access to property developers + investors', 'Bundle deals with renovation packages', 'AI-powered furnishing recommendations'],
    avgDealSize: 'Rp 20-100M', demandSignal: 'Medium — growing with furnished rental trend',
  },
];

/* ── Script Data ── */

interface ScriptData {
  id: string;
  title: string;
  timing: string;
  icon: React.ElementType;
  accentBorder: string;
  badgeClass: string;
  script: string;
  tactics: string[];
}

const OUTREACH_SCRIPTS: ScriptData[] = [
  {
    id: 'first-contact', title: 'First Contact — Category Intro', timing: 'Day 1', icon: UserPlus,
    accentBorder: 'border-l-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20',
    script: `Halo Pak/Bu [Nama],

Saya [Nama] dari ASTRA Villa, platform properti digital yang menghubungkan investor aktif dengan vendor terpercaya.

Saat ini kami sedang membuka akses vendor eksklusif di area [Bandung/Jakarta] untuk kategori [renovasi/interior/legal/dsb].

Kenapa ini relevan untuk Bapak/Ibu:
✓ Investor kami aktif membeli properti dan membutuhkan jasa [kategori] dalam 30-60 hari
✓ Rata-rata nilai proyek: Rp [50-200M]
✓ Kami yang mencarikan klien — Bapak/Ibu fokus kerja

Sebagai early partner, benefit eksklusif:
🎯 Prioritas lead proyek langsung
🎯 Profil premium gratis 3 bulan
🎯 Badge "Vendor Terverifikasi" untuk trust building

Apakah ada waktu 10 menit untuk saya jelaskan via call?

Terima kasih 🙏`,
    tactics: [
      'Personalize [Nama] — never send generic messages',
      'Category-specific value — match to their exact service type',
      'Concrete numbers (Rp 50-200M) anchor perceived opportunity',
      'Early partner framing creates exclusivity urgency',
      'Low commitment CTA — "10 menit" removes anxiety',
    ],
  },
  {
    id: 'value-prop', title: 'Value Proposition Deep-Dive', timing: 'Day 1 (Post-Reply)', icon: Star,
    accentBorder: 'border-l-chart-2', badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    script: `Pak/Bu [Nama], terima kasih sudah respon 🙏

Saya jelaskan singkat bagaimana ASTRA Villa membantu bisnis Bapak/Ibu:

📊 Predictable Job Flow
→ Investor kami melakukan [X] transaksi/bulan di [Area]
→ 73% membutuhkan jasa [kategori] dalam 60 hari
→ Kami match otomatis berdasarkan lokasi + spesialisasi

📱 Digital Profile Visibility
→ Profil vendor tampil di hadapan 10,000+ investor aktif
→ Portfolio + review terverifikasi = trust instan
→ Ranking AI berdasarkan performa — semakin bagus, semakin banyak lead

📈 Performance-Based Growth
→ Vendor top-performer mendapat 3x lebih banyak lead
→ Akses ke proyek premium (developer partnership)
→ Fitur analytics untuk track konversi + revenue

Apakah Bapak/Ibu tertarik untuk daftar sebagai early partner? Prosesnya hanya 15 menit.`,
    tactics: [
      'Three clear value pillars with emoji headers for scanability',
      'Data-backed claims ("73% membutuhkan jasa")',
      'Performance incentive framing — work harder = get more',
      'Specific signup time ("15 menit") removes ambiguity',
    ],
  },
  {
    id: 'followup', title: 'Follow-Up Nudge', timing: 'Day 3-5', icon: Clock,
    accentBorder: 'border-l-chart-4', badgeClass: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    script: `Pak/Bu [Nama], izin follow up 🙏

Minggu ini sudah ada [X] vendor [kategori] di [Area] yang mulai menerima lead proyek dari investor kami.

Slot early partner kami terbatas — hanya [Y] posisi tersisa untuk area [Area] agar kualitas tetap terjaga.

Benefit yang masih tersedia:
✓ 3 bulan profil premium GRATIS
✓ Prioritas lead untuk [Y] slot pertama
✓ Setup profil dibantu tim kami

Hari ini atau besok, apakah ada 10 menit untuk penjelasan singkat?`,
    tactics: [
      'Social proof — other vendors already receiving leads',
      'Scarcity with specifics — "[Y] posisi tersisa"',
      'Quality framing justifies limited slots',
      'Repeat free trial offer to reduce friction',
      'Binary time choice ("hari ini atau besok") increases commitment',
    ],
  },
  {
    id: 'objection', title: 'Objection Handler — Commission', timing: 'During Call', icon: Shield,
    accentBorder: 'border-l-chart-3', badgeClass: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    script: `"Pak/Bu, pertanyaan bagus tentang komisi. Izin saya jelaskan:

1️⃣ ASTRA tidak memotong pendapatan Bapak/Ibu
→ Komisi platform hanya 5-8% dari nilai proyek
→ Bapak/Ibu menetapkan harga sendiri — kami tidak intervensi
→ Bandingkan: biaya iklan sendiri bisa 15-20% dari revenue

2️⃣ Yang Bapak/Ibu dapat sebagai gantinya:
→ Klien sudah ter-verified dan siap bayar
→ Tidak perlu biaya marketing sendiri
→ Repeat business dari database investor aktif

3️⃣ Contoh nyata:
→ Vendor [Kategori] di [Area] rata-rata dapat 4-6 proyek/bulan
→ Dari 0 online presence → Rp [X]M revenue tambahan

Jadi komisi 5-8% ini sebenarnya menggantikan biaya marketing yang jauh lebih besar. Masuk akal?"`,
    tactics: [
      'Reframe commission as marketing cost replacement',
      'Comparison anchor — "iklan sendiri 15-20%"',
      'Concrete case study with numbers builds credibility',
      'Close with agreement question — "Masuk akal?"',
    ],
  },
  {
    id: 'objection-trust', title: 'Objection Handler — Trust', timing: 'During Call', icon: AlertTriangle,
    accentBorder: 'border-l-destructive', badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
    script: `"Saya sangat mengerti kekhawatiran Bapak/Ibu. Platform baru memang perlu dibuktikan.

Ini yang kami tawarkan untuk membangun kepercayaan:

1️⃣ Zero Risk Trial
→ Daftar gratis — tidak ada biaya sampai Bapak/Ibu dapat proyek
→ 3 bulan profil premium tanpa bayar
→ Bisa berhenti kapan saja, tanpa penalti

2️⃣ Sudah Berjalan
→ [X] vendor sudah aktif di platform kami
→ [Y] proyek sudah di-match minggu ini
→ Investor kami sudah terverifikasi identitas + dana

3️⃣ Jaminan Kualitas
→ Review dari kedua sisi (vendor + klien)
→ Tim support dedicated untuk vendor
→ Dispute resolution jika ada masalah

Bagaimana kalau kita mulai dengan trial 1 bulan dulu? Tidak ada yang dirugikan."`,
    tactics: [
      'Acknowledge concern genuinely — "Saya sangat mengerti"',
      'Remove all risk — free trial, no penalty, quit anytime',
      'Social proof with real numbers',
      'Micro-commitment close — "trial 1 bulan dulu"',
    ],
  },
  {
    id: 'closing', title: 'Conversion Closing Script', timing: 'End of Call', icon: Zap,
    accentBorder: 'border-l-chart-1', badgeClass: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    script: `"Pak/Bu [Nama], terima kasih sudah meluangkan waktu.

Ringkasan yang kita diskusikan:
✓ ASTRA mencarikan klien investor untuk [kategori] Bapak/Ibu
✓ 3 bulan profil premium gratis sebagai early partner
✓ Komisi hanya berlaku saat proyek berhasil

Langkah selanjutnya sangat simpel:
1. Saya kirim link pendaftaran — isi 10 menit
2. Tim kami bantu setup profil + portfolio
3. Dalam 7 hari, profil sudah live dan siap terima lead

🎁 Bonus early partner (terbatas [X] slot):
→ Badge 'Founding Vendor' permanen
→ Prioritas lead selama 6 bulan pertama
→ Akses ke grup eksklusif vendor ASTRA

Apakah saya kirim link pendaftarannya sekarang?"`,
    tactics: [
      'Summarize agreed value to reinforce decision',
      'Three-step process removes complexity anxiety',
      'Bonus stack creates urgency to act now',
      'Direct closing question — "kirim sekarang?"',
      'Founding Vendor badge appeals to status + permanence',
    ],
  },
];

/* ── Onboarding Checklist ── */

interface ChecklistItem {
  step: number;
  task: string;
  owner: string;
  duration: string;
  details: string;
}

const ONBOARDING_CHECKLIST: ChecklistItem[] = [
  { step: 1, task: 'Complete registration form', owner: 'Vendor', duration: '10 min', details: 'Business name, category, service area, contact details, ID verification' },
  { step: 2, task: 'Submit business documents', owner: 'Vendor', duration: '15 min', details: 'SIUP/NIB, portfolio photos (min 5), service price list' },
  { step: 3, task: 'Profile setup & optimization', owner: 'ASTRA Team', duration: '1-2 days', details: 'Photo editing, description writing, SEO optimization, category tagging' },
  { step: 4, task: 'Verification call & quality check', owner: 'ASTRA Team', duration: '15 min', details: 'Verify credentials, discuss service standards, explain platform rules' },
  { step: 5, task: 'Platform training session', owner: 'ASTRA Team', duration: '20 min', details: 'Dashboard walkthrough, lead management, review response, analytics access' },
  { step: 6, task: 'Activate profile & first lead', owner: 'ASTRA Team', duration: '1-3 days', details: 'Go live, AI matching activation, first lead notification, 7-day check-in' },
];

/* ── Incentive Tiers ── */

interface IncentiveTier {
  tier: string;
  label: string;
  color: string;
  bg: string;
  threshold: string;
  benefits: string[];
}

const INCENTIVE_TIERS: IncentiveTier[] = [
  {
    tier: 'founding', label: 'Founding Partner', color: 'text-chart-4', bg: 'bg-chart-4/10',
    threshold: 'First 50 vendors per city',
    benefits: ['Permanent "Founding Vendor" badge', '6 months priority lead access', '3 months free premium profile', 'Exclusive vendor WhatsApp group'],
  },
  {
    tier: 'performance', label: 'Performance Bonus', color: 'text-chart-1', bg: 'bg-chart-1/10',
    threshold: 'Complete 5+ projects in first 90 days',
    benefits: ['Commission rate reduced by 2%', 'Featured on homepage for 30 days', 'Access to developer partnership projects', 'Quarterly performance award recognition'],
  },
  {
    tier: 'referral', label: 'Vendor Referral Program', color: 'text-primary', bg: 'bg-primary/10',
    threshold: 'Refer another vendor who completes signup',
    benefits: ['Rp 200K credit per successful referral', '1 month free premium upgrade per 3 referrals', 'Top referrer: quarterly cash bonus Rp 2M', 'Referral leaderboard visibility'],
  },
  {
    tier: 'loyalty', label: 'Loyalty Rewards', color: 'text-chart-3', bg: 'bg-chart-3/10',
    threshold: 'Active for 6+ months with 4.5+ rating',
    benefits: ['Annual performance certificate', 'Priority access to new city launches', 'Revenue sharing from premium upsells', 'Invitation to annual vendor summit'],
  },
];

/* ── Sprint Plan ── */

interface SprintWeek {
  week: number;
  phase: string;
  phaseColor: string;
  focus: string;
  targets: string[];
  activities: string[];
}

const SPRINT_PLAN: SprintWeek[] = [
  {
    week: 1, phase: 'Prep', phaseColor: 'text-chart-4', focus: 'List Building & Targeting',
    targets: ['200 vendor contacts collected', '5 categories mapped per district'],
    activities: ['Scrape Google Maps + Tokopedia for vendor contacts per category', 'Prioritize by rating, review count, and location density', 'Segment into renovation, interior, cleaning, legal, furnishing', 'Prepare personalized scripts for each category'],
  },
  {
    week: 2, phase: 'Blitz', phaseColor: 'text-primary', focus: 'Mass Outreach Wave 1',
    targets: ['100 first-contact messages sent', '35+ replies received'],
    activities: ['Send Day 1 scripts to top-priority vendors (renovation + legal first)', 'Personalize each message with vendor name + specific category', 'Track response rates by category and district', 'Schedule calls with interested vendors'],
  },
  {
    week: 3, phase: 'Blitz', phaseColor: 'text-primary', focus: 'Follow-Up & Conversion',
    targets: ['Day 3-5 follow-ups completed', '20+ calls booked', '10+ signups'],
    activities: ['Send follow-up scripts to non-responders', 'Conduct value proposition calls with interested vendors', 'Handle objections using prepared scripts', 'Complete onboarding for confirmed vendors'],
  },
  {
    week: 4, phase: 'Convert', phaseColor: 'text-chart-1', focus: 'Close & Activate',
    targets: ['25+ vendors onboarded', '15+ profiles live', '5+ first leads matched'],
    activities: ['Closing scripts for remaining pipeline', 'Profile setup for onboarded vendors', 'First lead matching and notification', 'Collect early feedback and testimonials'],
  },
  {
    week: 5, phase: 'Scale', phaseColor: 'text-chart-2', focus: 'Wave 2 + Optimization',
    targets: ['50+ total vendors', 'Category coverage complete', '10+ projects matched'],
    activities: ['Launch Wave 2 for remaining categories (interior, cleaning, furnishing)', 'Optimize scripts based on Week 2-3 conversion data', 'Start vendor referral program activation', 'Plan expansion to adjacent districts'],
  },
  {
    week: 6, phase: 'Scale', phaseColor: 'text-chart-2', focus: 'Density & Retention',
    targets: ['75+ vendors across all categories', '<10% early churn', 'Founding partner slots filled'],
    activities: ['Fill remaining founding partner slots with urgency messaging', 'First vendor satisfaction survey', 'Identify top performers for case study creation', 'Prepare Week 7+ expansion plan for next district'],
  },
];

/* ── Script Card Component ── */

function ScriptCard({ script }: { script: ScriptData }) {
  const Icon = script.icon;
  return (
    <motion.div variants={fadeSlide}>
      <Card className={cn('border-border/50 border-l-4', script.accentBorder)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                <Icon className="h-4.5 w-4.5 text-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant="outline" className={cn('text-[9px] font-mono', script.badgeClass)}>{script.timing}</Badge>
                </div>
                <CardTitle className="text-base">{script.title}</CardTitle>
              </div>
            </div>
            <CopyButton text={script.script} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-3 p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-1.5 mb-3">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp Message</span>
              </div>
              <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">{script.script}</pre>
            </div>
            <div className="md:col-span-2 space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Psychology Tactics</span>
              {script.tactics.map((t, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-foreground">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Main Page ── */

export default function VendorAcquisitionScriptsPage() {
  const metrics = [
    { label: 'Scripts', value: '6', sub: 'Full funnel coverage', icon: MessageSquare },
    { label: 'Target Reply', value: '>35%', sub: 'First contact rate', icon: Send },
    { label: 'Call Booking', value: '>18%', sub: 'From outreach', icon: Phone },
    { label: 'Signup Goal', value: '75+', sub: 'Per 6-week sprint', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-6xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Field Execution</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Vendor Acquisition Scripts & Sprint Plan</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-2xl">
            Complete field execution system — outreach scripts, objection handlers, onboarding workflows, and a 6-week acquisition sprint plan for 5 vendor categories.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-6xl py-6 space-y-6">
        {/* KPI Bar */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <motion.div key={m.label} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</span>
                  <div className="text-xl font-bold font-mono text-foreground">{m.value}</div>
                  <span className="text-[10px] text-primary flex items-center gap-0.5"><m.icon className="h-3 w-3" />{m.sub}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="scripts" className="w-full">
          <TabsList className="h-9">
            <TabsTrigger value="scripts" className="text-xs px-4">Outreach Scripts</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs px-4">Vendor Categories</TabsTrigger>
            <TabsTrigger value="onboarding" className="text-xs px-4">Onboarding & Incentives</TabsTrigger>
            <TabsTrigger value="sprint" className="text-xs px-4">6-Week Sprint</TabsTrigger>
          </TabsList>

          {/* ── Scripts Tab ── */}
          <TabsContent value="scripts" className="mt-4 space-y-5">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger} className="space-y-5">
              {OUTREACH_SCRIPTS.map((s) => (
                <ScriptCard key={s.id} script={s} />
              ))}
            </motion.div>

            {/* Psychology Framework */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Persuasion Psychology Framework</span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    {[
                      { principle: 'Exclusivity Anchoring', detail: '"Akses eksklusif" + "slot terbatas" creates perceived scarcity and elevates vendor status before any value is delivered.' },
                      { principle: 'Social Proof Cascade', detail: 'Follow-up references other vendors receiving leads — loss aversion ("missing out") drives faster conversion.' },
                      { principle: 'Micro-Commitment Ladder', detail: '"10 menit call" → "isi form 15 menit" → "trial 1 bulan" — each step is small enough to say yes.' },
                      { principle: 'Risk Reversal', detail: '"Gratis", "tanpa penalti", "berhenti kapan saja" — remove every possible objection before it surfaces.' },
                      { principle: 'Status Elevation', detail: '"Founding Vendor", "Badge Terverifikasi" — vendors see themselves as partners, not just suppliers.' },
                      { principle: 'Reciprocity Hook', detail: 'Free profile setup, free premium trial — creates obligation to reciprocate with signup commitment.' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                        <p className="text-xs font-semibold text-foreground mb-1">{item.principle}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Categories Tab ── */}
          <TabsContent value="categories" className="mt-4 space-y-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger} className="grid md:grid-cols-2 gap-4">
              {VENDOR_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <motion.div key={cat.key} variants={fadeSlide}>
                    <Card className="border-border/50 h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center', cat.bg)}>
                              <Icon className={cn('h-3.5 w-3.5', cat.color)} />
                            </div>
                            {cat.label}
                          </CardTitle>
                          <Badge variant="outline" className={cn('text-[8px] h-5 px-2', cat.color, cat.bg, cat.border)}>
                            {cat.avgDealSize}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-2 rounded-lg bg-muted/20 border border-border/20">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Demand Signal</span>
                          <p className="text-xs text-foreground mt-0.5">{cat.demandSignal}</p>
                        </div>

                        <div>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-destructive/80">Pain Points</span>
                          <div className="space-y-1 mt-1">
                            {cat.painPoints.map((p, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <AlertTriangle className="h-2.5 w-2.5 text-destructive/50 shrink-0" />
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-chart-1">Value Hooks</span>
                          <div className="space-y-1 mt-1">
                            {cat.valueHooks.map((v, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs text-foreground">
                                <CheckCircle2 className="h-2.5 w-2.5 text-chart-1 shrink-0" />
                                {v}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </TabsContent>

          {/* ── Onboarding & Incentives Tab ── */}
          <TabsContent value="onboarding" className="mt-4 space-y-5">
            {/* Onboarding Checklist */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Vendor Onboarding Checklist
                  </CardTitle>
                  <CardDescription className="text-xs">
                    6-step process from registration to first lead — target completion in 3-5 days
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ONBOARDING_CHECKLIST.map((item) => (
                    <div key={item.step} className="flex items-start gap-3 p-3 rounded-lg border border-border/20 bg-muted/5">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{item.step}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-foreground">{item.task}</span>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[7px] h-4 px-1.5 text-muted-foreground">{item.owner}</Badge>
                            <Badge variant="outline" className="text-[7px] h-4 px-1.5 text-chart-4 bg-chart-4/5 border-chart-4/20">{item.duration}</Badge>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.details}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Incentive Tiers */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
              <motion.div variants={fadeSlide}>
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Gift className="h-4 w-4 text-chart-1" />
                      Performance Incentive Design
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Four-tier incentive structure to drive acquisition, activation, referrals, and long-term retention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {INCENTIVE_TIERS.map((tier) => (
                        <div key={tier.tier} className={cn('p-4 rounded-xl border border-border/30', tier.bg)}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn('text-sm font-bold', tier.color)}>{tier.label}</span>
                            <Trophy className={cn('h-4 w-4', tier.color)} />
                          </div>
                          <Badge variant="outline" className="text-[8px] h-4 px-1.5 text-muted-foreground mb-2">{tier.threshold}</Badge>
                          <div className="space-y-1.5 mt-2">
                            {tier.benefits.map((b, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                                <CheckCircle2 className={cn('h-3 w-3 shrink-0 mt-0.5', tier.color)} />
                                {b}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ── Sprint Tab ── */}
          <TabsContent value="sprint" className="mt-4 space-y-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    6-Week Local Acquisition Sprint
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Structured execution plan to onboard 75+ vendors across 5 categories in a single launch market
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Progress overview */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[
                      { label: 'Week 1-2', phase: 'Prep + Blitz', pct: 25, color: 'text-chart-4' },
                      { label: 'Week 3', phase: 'Follow-Up', pct: 50, color: 'text-primary' },
                      { label: 'Week 4', phase: 'Convert', pct: 75, color: 'text-chart-1' },
                      { label: 'Week 5-6', phase: 'Scale', pct: 100, color: 'text-chart-2' },
                    ].map((p) => (
                      <div key={p.label} className="text-center">
                        <span className={cn('text-[9px] font-bold', p.color)}>{p.label}</span>
                        <Progress value={p.pct} className="h-1.5 mt-1" />
                        <span className="text-[8px] text-muted-foreground">{p.phase}</span>
                      </div>
                    ))}
                  </div>

                  {/* Week cards */}
                  {SPRINT_PLAN.map((week) => (
                    <div key={week.week} className="p-3 rounded-xl border border-border/30 bg-card/80">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-[9px] h-5 px-2 font-bold text-foreground bg-muted/20">
                          Week {week.week}
                        </Badge>
                        <Badge variant="outline" className={cn('text-[8px] h-4 px-1.5', week.phaseColor,
                          week.phaseColor === 'text-chart-4' ? 'bg-chart-4/10 border-chart-4/30' :
                          week.phaseColor === 'text-primary' ? 'bg-primary/10 border-primary/30' :
                          week.phaseColor === 'text-chart-1' ? 'bg-chart-1/10 border-chart-1/30' :
                          'bg-chart-2/10 border-chart-2/30')}>
                          {week.phase}
                        </Badge>
                        <span className="text-xs font-semibold text-foreground">{week.focus}</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-chart-1 block mb-1">Targets</span>
                          {week.targets.map((t, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-foreground">
                              <Target className="h-2.5 w-2.5 text-chart-1 shrink-0" />
                              {t}
                            </div>
                          ))}
                        </div>
                        <div>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Activities</span>
                          {week.activities.map((a, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <ChevronRight className="h-2.5 w-2.5 shrink-0 mt-0.5" />
                              {a}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Sprint success criteria */}
                  <div className="p-3 rounded-lg bg-chart-1/5 border border-chart-1/10">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-chart-1">Sprint Success Criteria</span>
                    <div className="grid sm:grid-cols-3 gap-2 mt-2">
                      {[
                        { metric: '75+ vendors onboarded', target: 'Across 5 categories' },
                        { metric: '<10% early churn', target: 'First 30-day retention' },
                        { metric: '15+ projects matched', target: 'Proving lead flow value' },
                      ].map((s) => (
                        <div key={s.metric} className="p-2 rounded-lg bg-chart-1/5 border border-chart-1/10 text-center">
                          <span className="text-sm font-bold text-foreground block">{s.metric}</span>
                          <span className="text-[9px] text-muted-foreground">{s.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
