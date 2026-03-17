import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Crown, Diamond, Target, Users, Eye, MessageSquare, Shield,
  TrendingUp, BarChart3, Zap, Star, Building2, Lock,
  ChevronRight, ArrowRight, CheckCircle2, Calendar,
  Briefcase, Globe, Bell, Award, Handshake, Lightbulb,
  Copy, Sparkles, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

/* ─── Data ─── */

const CONVERSION_PHASES = [
  {
    phase: 1,
    title: 'Exclusive Opportunity Positioning',
    subtitle: 'Signal scarcity and intelligence depth to filter serious investors',
    icon: Diamond,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    tactics: [
      {
        title: 'Curated Elite Listing Showcase',
        description: 'Present only AI-scored elite properties (opportunity score ≥85) as the entry point — not the full marketplace',
        script: '"Platform kami berbeda dari marketplace biasa. Kami hanya menampilkan properti yang sudah melalui AI scoring ketat — hanya 8% listing yang mencapai kategori Elite. Anda melihat peluang yang orang lain tidak lihat."',
        platformFeature: 'AI Smart Feed → Elite Deals (score ≥85) with pulsing score ring',
        link: '/recommendations',
      },
      {
        title: 'Advanced Analytics Dashboard Preview',
        description: 'Show institutional-grade analytics: portfolio ROI tracking, geographic diversification, absorption risk indicators',
        script: '"Ini bukan portal listing — ini terminal investasi. Dashboard analytics kami setara dengan tool yang dipakai fund manager profesional. Dari ROI tracking sampai market cycle detection, semua tersedia real-time."',
        platformFeature: 'Institutional Analytics Dashboard with market strategy benchmarks',
        link: '/institutional-analytics',
      },
      {
        title: 'AI Investment Report Deep-Dive',
        description: 'Generate personalized investment report for a property the investor has shown interest in',
        script: '"Untuk setiap properti, kami generate laporan investasi lengkap — ROI projection 3-5 tahun, opportunity score breakdown, buy vs rent comparison, dan market heat analysis. Ini contoh report untuk properti yang Anda minati."',
        platformFeature: 'AI Investment Report Generator with 5-dimension scoring',
        link: '/investment-report',
      },
    ],
  },
  {
    phase: 2,
    title: 'Personalized Engagement',
    subtitle: 'Make every HNW investor feel they have a private intelligence service',
    icon: Star,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    tactics: [
      {
        title: 'Private Demo Walkthrough',
        description: '1-on-1 guided platform tour showing tools matched to their investment style (yield-focused, growth, flip)',
        script: '"Saya ingin menunjukkan platform ini secara personal — disesuaikan dengan strategi investasi Anda. Apakah Anda lebih fokus pada yield bulanan, capital appreciation, atau quick flip? Demo ini hanya 15 menit dan sepenuhnya confidential."',
        platformFeature: 'Investor DNA Profiling → personalized recommendations based on strategy',
        link: '/live-demo',
      },
      {
        title: 'Tailored Investment Insight Package',
        description: 'Send a curated pack: 3 properties matching their criteria + AI analysis + market context',
        script: '"Berdasarkan profil investasi Anda, saya siapkan 3 properti yang cocok dengan kriteria Anda — lengkap dengan AI analysis, yield projection, dan market trend area tersebut. Ini exclusively untuk Anda, bukan listing publik."',
        platformFeature: 'AI Smart Recommendations + Investment Report per property',
        link: '/recommendations',
      },
      {
        title: 'Investor DNA Onboarding',
        description: 'After signup, the AI learns their investment DNA from behavior signals and adapts all recommendations',
        script: '"Setelah Anda bergabung, AI kami akan belajar gaya investasi Anda dari setiap interaksi — properti yang Anda lihat, simpan, dan inquiry. Dalam 48 jam, semua rekomendasi sudah dipersonalisasi untuk strategy Anda."',
        platformFeature: 'Investor DNA Engine — 11 dimensions, 4 predictive scores',
        link: '/investor-dna-admin',
      },
    ],
  },
  {
    phase: 3,
    title: 'Authority Signaling',
    subtitle: 'Establish ASTRA Villa as the definitive source of property intelligence',
    icon: Shield,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    tactics: [
      {
        title: 'Market Intelligence Report Sharing',
        description: 'Share weekly market intelligence: city trends, price predictions, hotspot analysis',
        script: '"Setiap minggu, kami publish market intelligence brief — prediksi harga, hotspot baru, dan analisis area. Ini bukan opini — ini hasil kalkulasi AI dari ribuan data point. Investor kami menggunakan ini untuk strategic planning."',
        platformFeature: 'Market Intelligence Feed + AI Market Heat Cluster Engine',
        link: '/market-intelligence-feed',
      },
      {
        title: 'Developer Partnership Portfolio',
        description: 'Showcase exclusive developer relationships and pre-launch access',
        script: '"Kami bermitra langsung dengan developer terkemuka. Investor kami mendapat akses pre-launch — booking unit sebelum public release, di harga launch yang belum mark-up. Ini advantage yang hanya tersedia melalui platform kami."',
        platformFeature: 'Developer Dashboard + Project Launch Radar',
        link: '/launch-radar',
      },
      {
        title: 'Global Macro Intelligence Layer',
        description: 'Present capital flow predictions, wealth migration patterns, and cross-border investment signals',
        script: '"Intelligence kami tidak hanya lokal — kami track capital flow global, prediksi migrasi wealth, dan sentimen investor internasional terhadap pasar Indonesia. Ini level analisis yang biasanya hanya tersedia untuk institutional investor."',
        platformFeature: 'Global Macro Intelligence + Capital Flow Prediction',
        link: '/global-macro-intelligence',
      },
    ],
  },
  {
    phase: 4,
    title: 'Retention & Lock-In',
    subtitle: 'Make leaving the platform feel like losing competitive advantage',
    icon: Lock,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    tactics: [
      {
        title: 'Early Access to Project Launches',
        description: 'HNW investors get 48-hour priority access to new developer project launches before public listing',
        script: '"Sebagai Diamond investor di platform kami, Anda mendapat akses 48 jam lebih awal ke setiap project launch baru. Beberapa unit terbaik sudah terjual sebelum listing dibuka ke publik — dan Anda yang pertama melihatnya."',
        platformFeature: 'Off-Plan Investment System → Priority launch notifications',
        link: '/developer-demand-forecast',
      },
      {
        title: 'Priority Deal Alert Notifications',
        description: 'AI-powered alerts for properties matching their DNA profile — before general users see them',
        script: '"AI kami akan mengirim alert personal setiap kali ada properti yang match dengan profil investasi Anda — price drop, elite deal baru, atau project launch. Anda mendapat signal lebih cepat dari investor lain."',
        platformFeature: 'Smart Notification System → Investor-specific deal alerts',
        link: '/notifications',
      },
      {
        title: 'Portfolio Command Center',
        description: 'Once invested, the portfolio tracker becomes indispensable — ROI tracking, rebalancing, exit timing',
        script: '"Setelah Anda mulai invest, Portfolio Command Center menjadi cockpit investasi Anda. Track ROI real-time, monitor market cycle, dan dapatkan AI recommendation kapan harus hold, kapan harus exit. Ini tool yang membuat Anda tidak mau pindah."',
        platformFeature: 'AI Portfolio Command Center with exit timing signals',
        link: '/portfolio-command-center',
      },
    ],
  },
];

const HNW_PROFILE = [
  { label: 'Primary Segment', value: 'Active investors with 2+ properties, Rp 5B+ portfolio', icon: Briefcase },
  { label: 'Secondary Segment', value: 'C-suite executives exploring first investment property', icon: Users },
  { label: 'Decision Drivers', value: 'Data quality, exclusivity, time efficiency, trusted process', icon: Target },
  { label: 'Preferred Channels', value: 'LinkedIn, private referrals, exclusive events, WhatsApp groups', icon: Globe },
];

const ENGAGEMENT_METRICS = [
  { metric: 'Demo-to-Signup', target: '45%', current: '38%', status: 'improving' },
  { metric: 'Signup-to-First-Inquiry', target: '30%', current: '27%', status: 'improving' },
  { metric: 'Inquiry-to-Offer', target: '20%', current: '18.4%', status: 'on-track' },
  { metric: 'Avg. Portfolio Value', target: 'Rp 8B+', current: 'Rp 6.2B', status: 'growing' },
  { metric: 'Monthly Active Rate', target: '60%+', current: '52%', status: 'improving' },
  { metric: 'Referral Rate', target: '25%', current: '19%', status: 'improving' },
];

/* ─── Component ─── */

export default function HNWInvestorStrategyPage() {
  const [activeTab, setActiveTab] = useState('playbook');
  const [expandedPhase, setExpandedPhase] = useState(1);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
  const { toast } = useToast();

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(id);
    toast({ title: 'Copied!', description: 'Script ready to use.' });
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                HNW Investor Conversion Strategy
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Premium intelligence positioning for high-value investor acquisition
              </p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-primary/20 text-primary">
              <Diamond className="h-3 w-3 mr-1.5" />
              Premium Segment Focus
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="playbook">Conversion Playbook</TabsTrigger>
            <TabsTrigger value="profile">Investor Profile</TabsTrigger>
            <TabsTrigger value="metrics">Engagement Metrics</TabsTrigger>
          </TabsList>

          {/* ═══ PLAYBOOK TAB ═══ */}
          <TabsContent value="playbook" className="space-y-4">
            {CONVERSION_PHASES.map((phase) => {
              const PhaseIcon = phase.icon;
              const isExpanded = expandedPhase === phase.phase;
              return (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: phase.phase * 0.06 }}
                >
                  <Card
                    className={cn(
                      'border bg-card transition-all cursor-pointer',
                      isExpanded ? 'border-border shadow-sm' : 'border-border hover:border-border/80'
                    )}
                    onClick={() => setExpandedPhase(isExpanded ? 0 : phase.phase)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', phase.bgColor)}>
                          <PhaseIcon className={cn('h-5 w-5', phase.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-bold">Phase {phase.phase}</Badge>
                            <CardTitle className="text-sm">{phase.title}</CardTitle>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{phase.subtitle}</p>
                        </div>
                        <Badge variant="secondary" className="text-[9px]">{phase.tactics.length} tactics</Badge>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-3 mt-2">
                          {phase.tactics.map((t, ti) => (
                            <div key={ti} className="border border-border/30 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-xs font-bold text-foreground">{t.title}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.description}</p>
                                </div>
                                <button
                                  onClick={() => copyText(t.script, `${phase.phase}-${ti}`)}
                                  className="flex items-center gap-1 text-[9px] text-primary hover:text-primary/80 px-2 py-0.5 rounded bg-primary/5 hover:bg-primary/10 transition-colors flex-shrink-0 ml-2"
                                >
                                  {copiedIdx === `${phase.phase}-${ti}` ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                                  {copiedIdx === `${phase.phase}-${ti}` ? 'Copied' : 'Copy'}
                                </button>
                              </div>

                              {/* Script */}
                              <div className="bg-muted/10 border border-border/20 rounded-lg p-3 mb-2.5">
                                <pre className="text-[11px] text-foreground whitespace-pre-wrap font-sans leading-relaxed italic">
                                  {t.script}
                                </pre>
                              </div>

                              {/* Platform feature link */}
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                                <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
                                <p className="text-[10px] text-primary font-medium flex-1">{t.platformFeature}</p>
                                <Badge variant="outline" className="text-[8px] text-primary border-primary/20">
                                  {t.link}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}

            {/* Conversion flow summary */}
            <Card className="border border-primary/10 bg-card">
              <CardContent className="p-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Conversion Flow</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Elite Showcase', 'Private Demo', 'Tailored Insights', 'Authority Reports', 'Early Access Lock-In'].map((step, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Badge variant={i === 0 ? 'default' : 'outline'} className="text-[9px]">{step}</Badge>
                      {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground/30" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ PROFILE TAB ═══ */}
          <TabsContent value="profile" className="space-y-4">
            {/* Investor Profile Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HNW_PROFILE.map((p, i) => {
                const PIcon = p.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="border border-border bg-card h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <PIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-medium">{p.label}</p>
                            <p className="text-xs font-semibold text-foreground mt-0.5">{p.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Differentiation */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Why HNW Investors Choose ASTRA Villa
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-1.5">
                {[
                  { point: 'AI-powered property scoring eliminates manual due diligence', diff: 'vs. browsing hundreds of unscored listings' },
                  { point: 'Institutional analytics dashboard matches fund-manager tooling', diff: 'vs. basic property portals with no analytics' },
                  { point: 'Pre-launch developer access creates genuine alpha', diff: 'vs. buying at public launch prices' },
                  { point: 'Investor DNA engine personalizes every recommendation', diff: 'vs. generic one-size-fits-all recommendations' },
                  { point: 'Portfolio command center provides ongoing value post-purchase', diff: 'vs. platforms that disappear after transaction' },
                ].map((d, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/10 border border-border/20">
                    <CheckCircle2 className="h-3.5 w-3.5 text-chart-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-medium text-foreground">{d.point}</p>
                      <p className="text-[9px] text-muted-foreground italic">{d.diff}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Membership tiers */}
            <Card className="border border-primary/10 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  Premium Tier Progression
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { tier: 'Gold / Insider', color: 'border-chart-4/30 bg-chart-4/5', features: ['AI scoring access', 'Deal alerts', 'Market reports'], icon: Award },
                    { tier: 'Platinum / Developer', color: 'border-primary/30 bg-primary/5', features: ['Portfolio analytics', 'Pre-launch access', 'Priority support'], icon: Star },
                    { tier: 'Diamond / VIP', color: 'border-chart-5/30 bg-chart-5/5', features: ['Private deals', 'Exit timing signals', 'Concierge service'], icon: Diamond },
                  ].map((t, i) => {
                    const TIcon = t.icon;
                    return (
                      <div key={i} className={cn('rounded-lg border p-3', t.color)}>
                        <div className="flex items-center gap-2 mb-2">
                          <TIcon className="h-4 w-4 text-foreground" />
                          <p className="text-xs font-bold text-foreground">{t.tier}</p>
                        </div>
                        {t.features.map((f, fi) => (
                          <div key={fi} className="flex items-center gap-1.5 mt-1">
                            <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">{f}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ METRICS TAB ═══ */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {ENGAGEMENT_METRICS.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="border border-border bg-card">
                    <CardContent className="p-3">
                      <p className="text-[10px] text-muted-foreground font-medium mb-1">{m.metric}</p>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-lg font-black text-foreground">{m.current}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[9px] text-muted-foreground">Target: {m.target}</span>
                            <Badge variant="outline" className={cn(
                              'text-[7px] px-1 py-0 h-3',
                              m.status === 'on-track' ? 'text-chart-2 border-chart-2/30' : 'text-primary border-primary/30'
                            )}>
                              {m.status}
                            </Badge>
                          </div>
                        </div>
                        <Activity className="h-4 w-4 text-muted-foreground/20" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Conversion funnel */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  HNW Investor Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-1.5">
                {[
                  { stage: 'Identified & Contacted', count: 200, pct: 100, color: 'bg-primary/15' },
                  { stage: 'Demo Completed', count: 76, pct: 38, color: 'bg-chart-4/15' },
                  { stage: 'Signed Up', count: 52, pct: 26, color: 'bg-chart-2/15' },
                  { stage: 'First Inquiry', count: 28, pct: 14, color: 'bg-chart-5/15' },
                  { stage: 'Deal Closed', count: 11, pct: 5.5, color: 'bg-destructive/10' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-36 flex-shrink-0">
                      <p className="text-[11px] font-medium text-foreground">{s.stage}</p>
                      <p className="text-[9px] text-muted-foreground">{s.count} investors</p>
                    </div>
                    <div className="flex-1 h-6 bg-muted/15 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(5, s.pct)}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={cn('h-full rounded-lg', s.color)}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-[10px] font-bold text-foreground">{s.pct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Revenue impact */}
            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">HNW Segment Revenue Impact</p>
                    <p className="text-[11px] text-muted-foreground">
                      11 closed deals from 200 HNW contacts = 5.5% conversion. Average deal value Rp 3.2B generates Rp 35.2B total transaction volume with est. Rp 704M platform revenue at 2% take rate.
                    </p>
                  </div>
                  <Badge className="bg-chart-2 text-chart-2-foreground text-xs flex-shrink-0">Rp 704M</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
