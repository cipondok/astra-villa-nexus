import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Brain, Target, Zap, Handshake, Shield, Copy, CheckCircle2,
  TrendingUp, Users, Clock, Scale, MessageSquare, Eye,
  ChevronRight, AlertTriangle, BarChart3, Heart, ArrowRight,
  FileText, Gavel, Award, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

/* ─── Data ─── */

interface Principle {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Brain;
  color: string;
  bgColor: string;
  psychology: string;
  tactics: { tactic: string; script: string; aiTool: string; timing: string }[];
}

const PRINCIPLES: Principle[] = [
  {
    id: 'anchoring',
    title: 'Confidence Anchoring',
    subtitle: 'Establish rational price foundation before emotional negotiation begins',
    icon: Target,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    psychology: 'The anchoring bias means the first number presented heavily influences all subsequent judgment. By leading with AI-validated valuation data, you set a rational anchor that prevents irrational lowballing or emotional overpricing.',
    tactics: [
      {
        tactic: 'Present AI valuation estimate early',
        script: '"Berdasarkan analisis AI kami yang menggunakan 50+ data pembanding terkini, estimasi fair market value properti ini adalah Rp [X]. Ini bukan opini — ini kalkulasi berbasis data dari transaksi aktual di area yang sama."',
        aiTool: 'AI Pricing Advisor — Fair Market Value estimation with confidence score',
        timing: 'First 5 minutes of negotiation discussion',
      },
      {
        tactic: 'Highlight demand indicators to justify pricing',
        script: '"Properti ini sudah dilihat [X] investor aktif minggu ini, dan opportunity score-nya [Y]/100. Area ini menunjukkan tren demand yang [naik/stabil], yang berarti harga yang ditawarkan sudah sejalan dengan minat pasar."',
        aiTool: 'Property Detail — Opportunity Score + View count analytics',
        timing: 'Immediately after valuation presentation',
      },
    ],
  },
  {
    id: 'urgency',
    title: 'Urgency Framing',
    subtitle: 'Create time-bound decision context without artificial pressure',
    icon: Zap,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    psychology: 'Scarcity and social proof are powerful decision accelerators. By referencing real inquiry activity and genuine price trends, you create authentic urgency — the investor feels compelled to act because the opportunity is genuinely moving, not because of sales pressure.',
    tactics: [
      {
        tactic: 'Reference recent inquiry activity',
        script: '"Saya ingin transparan — minggu ini sudah ada [X] inquiry serius untuk properti ini. Saya tidak bisa menjamin properti ini masih available minggu depan. Saya lebih suka Anda membuat keputusan yang tepat daripada terburu-buru, tapi informasi ini penting untuk Anda pertimbangkan."',
        aiTool: 'Agent CRM — Live inquiry count for the specific property',
        timing: 'When investor shows interest but hesitates',
      },
      {
        tactic: 'Mention price trend direction',
        script: '"Data prediksi AI kami menunjukkan harga di area ini diprediksi [naik X%/stabil/koreksi] dalam 3-6 bulan ke depan. Jika trend ini berlanjut, beli sekarang di harga current berarti Anda mendapat posisi yang [lebih baik/optimal] dibanding menunggu."',
        aiTool: 'AI Price Prediction — 3m/6m/12m forecast with confidence',
        timing: 'When discussing timing of the offer',
      },
    ],
  },
  {
    id: 'winwin',
    title: 'Win-Win Positioning',
    subtitle: 'Frame negotiation as collaboration, not competition',
    icon: Handshake,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    psychology: 'Integrative negotiation outperforms positional bargaining. When both parties feel they are solving a problem together — finding the right price for a valuable asset — resistance drops and agreements happen faster. Flexible structures give the seller perceived wins while protecting the buyer\'s core interests.',
    tactics: [
      {
        tactic: 'Propose flexible offer structure',
        script: '"Daripada fokus hanya di angka final, mari kita lihat struktur yang bisa menguntungkan kedua pihak. Misalnya: pembayaran lebih cepat dengan diskon [X%], atau harga full tapi dengan cicilan [X] bulan. Mana yang lebih menarik untuk Anda?"',
        aiTool: 'Mortgage Calculator — Multiple payment scenario modeling',
        timing: 'When initial offer is rejected or countered',
      },
      {
        tactic: 'Emphasize long-term investment logic',
        script: '"Ini bukan hanya soal harga hari ini — berdasarkan prediksi AI, area ini menunjukkan proyeksi apresiasi [X%] per tahun dengan rental yield [Y%]. Investasi di harga ini memberikan ROI total yang sangat kompetitif dalam 3-5 tahun."',
        aiTool: 'AI Investment Recommendation — ROI projection + yield estimate',
        timing: 'To justify price acceptance or close negotiation gap',
      },
    ],
  },
  {
    id: 'risk',
    title: 'Risk Reduction Messaging',
    subtitle: 'Eliminate fear by providing institutional-grade process clarity',
    icon: Shield,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    psychology: 'Loss aversion is 2x stronger than gain motivation. Investors fear making a bad decision more than they desire a good one. By proactively addressing legal process, platform credibility, and transaction transparency, you neutralize the fear barrier that prevents deal closure.',
    tactics: [
      {
        tactic: 'Provide legal workflow support clarity',
        script: '"Setelah deal disepakati, tim legal kami akan membantu seluruh proses — dari verifikasi SHM, persiapan AJB/PPJB, koordinasi notaris, sampai serah terima. Anda tidak perlu khawatir tentang proses hukum — kami handle semuanya dengan transparan."',
        aiTool: 'Legal Services — Document verification + process timeline',
        timing: 'When investor expresses concern about process complexity',
      },
      {
        tactic: 'Reinforce platform credibility and transparency',
        script: '"Semua data yang Anda lihat di platform ini — harga, prediksi, skor — dihasilkan oleh AI yang dilatih dari data transaksi real. Kami tidak markup harga, tidak hidden fee. Platform kami mendapat revenue dari layanan premium, bukan dari komisi Anda."',
        aiTool: 'Platform trust indicators — Verified badges, transaction history',
        timing: 'When building initial rapport or addressing trust objections',
      },
    ],
  },
];

const SCENARIO_PLAYBOOKS = [
  {
    scenario: 'Investor offers 15-20% below asking price',
    response: 'Anchoring + Data',
    steps: [
      'Acknowledge offer respectfully — validate the investor\'s engagement',
      'Present AI fair market value with comparable transaction data',
      'Show the valuation gap analysis: "Data menunjukkan gap antara offer dan FMV adalah X%"',
      'Propose middle ground: "Bagaimana jika kita bertemu di [AI suggested price]?"',
    ],
    avoid: 'Never say "that\'s too low" — instead redirect to data',
  },
  {
    scenario: 'Seller refuses to negotiate at all',
    response: 'Win-Win + Urgency',
    steps: [
      'Understand the seller\'s non-negotiable: is it price, timing, or terms?',
      'If price: suggest alternative structures (faster closing, cash deal discount)',
      'If timing: show market trend data — "Menunggu bisa berarti X% koreksi harga"',
      'Frame flexibility as strength: "Seller yang fleksibel biasanya close lebih cepat"',
    ],
    avoid: 'Never pressure the seller — present data and let them decide',
  },
  {
    scenario: 'Investor wants to "think about it" indefinitely',
    response: 'Urgency + Risk Reduction',
    steps: [
      'Acknowledge: "Tentu, keputusan investasi perlu pertimbangan matang"',
      'Add context: share live inquiry count and recent view activity',
      'Set soft deadline: "Saya akan hold informasi ini untuk Anda sampai [date]"',
      'Offer low-commitment next step: "Apakah Anda mau schedule viewing dulu?"',
    ],
    avoid: 'Never create false urgency — only reference real platform data',
  },
  {
    scenario: 'Multiple investors interested in same property',
    response: 'Transparency + Fairness',
    steps: [
      'Inform all parties transparently that there is competing interest',
      'Encourage best-and-final offers with a clear deadline',
      'Present each offer\'s strengths beyond price (terms, timing, certainty)',
      'Let seller decide based on comprehensive offer comparison',
    ],
    avoid: 'Never fabricate competing interest — only reference verified inquiries',
  },
];

const ETHICAL_GUIDELINES = [
  { rule: 'Only reference real data', detail: 'All valuation, demand, and trend signals must come from actual platform AI tools — never fabricate numbers' },
  { rule: 'Transparent competing interest', detail: 'Only mention other inquiries if they genuinely exist in the CRM pipeline' },
  { rule: 'No artificial deadlines', detail: 'Urgency must be based on real market conditions, not manufactured pressure' },
  { rule: 'Respect decision time', detail: 'Allow investors reasonable consideration periods — rush tactics damage long-term trust' },
  { rule: 'Disclose all costs', detail: 'Proactively share all transaction costs (PPh, notary, agent commission) before offer stage' },
];

/* ─── Component ─── */

export default function NegotiationPsychologyPage() {
  const [activeTab, setActiveTab] = useState('principles');
  const [expandedId, setExpandedId] = useState<string>('anchoring');
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
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            Negotiation Psychology Framework
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Data-driven negotiation guidance — rational signals over emotional bargaining
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="principles">Core Principles</TabsTrigger>
            <TabsTrigger value="scenarios">Scenario Playbooks</TabsTrigger>
            <TabsTrigger value="ethics">Ethical Guidelines</TabsTrigger>
          </TabsList>

          {/* ═══ PRINCIPLES TAB ═══ */}
          <TabsContent value="principles" className="space-y-4">
            {PRINCIPLES.map((p, idx) => {
              const PIcon = p.icon;
              const isExpanded = expandedId === p.id;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Card
                    className={cn(
                      'border bg-card transition-all cursor-pointer',
                      isExpanded ? 'border-border shadow-sm' : 'border-border hover:border-border/80'
                    )}
                    onClick={() => setExpandedId(isExpanded ? '' : p.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', p.bgColor)}>
                          <PIcon className={cn('h-5 w-5', p.color)} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{p.title}</CardTitle>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{p.subtitle}</p>
                        </div>
                        <Badge variant="outline" className="text-[9px]">{p.tactics.length} tactics</Badge>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        {/* Psychology explanation */}
                        <div className="bg-muted/15 border border-border/30 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Lightbulb className="h-3 w-3 text-primary" />
                            <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Psychology</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{p.psychology}</p>
                        </div>

                        {/* Tactics */}
                        <div className="space-y-3">
                          {p.tactics.map((t, ti) => (
                            <div key={ti} className="border border-border/30 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-foreground">{t.tactic}</p>
                                <button
                                  onClick={() => copyText(t.script, `${p.id}-${ti}`)}
                                  className="flex items-center gap-1 text-[9px] text-primary hover:text-primary/80 px-2 py-0.5 rounded bg-primary/5 hover:bg-primary/10 transition-colors"
                                >
                                  {copiedIdx === `${p.id}-${ti}` ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                                  {copiedIdx === `${p.id}-${ti}` ? 'Copied' : 'Copy'}
                                </button>
                              </div>

                              {/* Script */}
                              <div className="bg-muted/10 border border-border/20 rounded-lg p-3 mb-2">
                                <pre className="text-[11px] text-foreground whitespace-pre-wrap font-sans leading-relaxed italic">
                                  {t.script}
                                </pre>
                              </div>

                              {/* Meta */}
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <Zap className="h-2.5 w-2.5 text-chart-2" />
                                  <span className="text-[9px] text-muted-foreground">{t.aiTool}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-2.5 w-2.5 text-chart-4" />
                                  <span className="text-[9px] text-muted-foreground">{t.timing}</span>
                                </div>
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
          </TabsContent>

          {/* ═══ SCENARIOS TAB ═══ */}
          <TabsContent value="scenarios" className="space-y-4">
            {SCENARIO_PLAYBOOKS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{s.scenario}</CardTitle>
                      <Badge variant="outline" className="text-[9px] text-primary border-primary/20">{s.response}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {s.steps.map((step, si) => (
                      <div key={si} className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/10 border border-border/20">
                        <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[9px] font-black text-primary">{si + 1}</span>
                        </div>
                        <p className="text-[11px] text-foreground leading-relaxed">{step}</p>
                      </div>
                    ))}
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/10 mt-1">
                      <AlertTriangle className="h-3 w-3 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-destructive/80"><span className="font-semibold">Avoid:</span> {s.avoid}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ═══ ETHICS TAB ═══ */}
          <TabsContent value="ethics" className="space-y-3">
            <Card className="border border-chart-2/15 bg-chart-2/3 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Data-Driven Integrity Standard</p>
                    <p className="text-[11px] text-muted-foreground">
                      Every negotiation technique in this framework is grounded in real platform data. The goal is to help investors make better decisions — not to manipulate outcomes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {ETHICAL_GUIDELINES.map((g, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="border border-border bg-card">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="h-3 w-3 text-chart-2" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{g.rule}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{g.detail}</p>
                      </div>
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
