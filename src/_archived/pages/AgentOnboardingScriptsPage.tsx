import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  MessageSquare, Users, Zap, Shield, TrendingUp, Phone,
  ChevronRight, Copy, CheckCircle2, Target, Handshake,
  BarChart3, Building2, Star, Clock, ArrowRight, Send,
  Eye, Heart, FileText, Calendar, UserPlus, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

/* ─── Script Data ─── */

interface ScriptBlock {
  label: string;
  context: string;
  script: string;
  tips: string[];
}

const APPROACH_SCRIPTS: ScriptBlock[] = [
  {
    label: 'Cold Outreach — LinkedIn / WhatsApp',
    context: 'First contact with an agent you have no prior relationship with',
    script: `Halo Pak/Bu [Nama],

Saya dari tim ASTRA Villa — platform marketplace properti berbasis AI yang menghubungkan agen dengan investor berkualitas tinggi.

Kami sedang membangun platform penemuan investor properti berbasis AI yang membantu agen menerima leads berkualitas lebih tinggi dan visibilitas deal yang lebih cepat.

Saya melihat listing Anda di [Platform/Area] dan ingin menunjukkan bagaimana properti Anda bisa mendapat exposure yang lebih baik ke audience investor kami.

Boleh saya tunjukkan demo singkat 10 menit minggu ini?`,
    tips: [
      'Personalize with their specific listing or area expertise',
      'Keep initial message under 100 words',
      'Always propose a specific timeframe, not open-ended',
    ],
  },
  {
    label: 'Warm Introduction — Referral / Event',
    context: 'Agent referred by another partner or met at property event',
    script: `Halo Pak/Bu [Nama],

[Referral Name] menyarankan saya menghubungi Anda — beliau sudah bergabung sebagai partner agent di ASTRA Villa dan melihat peningkatan inquiry berkualitas untuk listing-nya.

Platform kami menggunakan AI scoring untuk mencocokkan properti Anda dengan investor yang benar-benar serius. Artinya, waktu Anda tidak terbuang untuk leads yang tidak qualified.

Boleh saya kirimkan contoh bagaimana listing seperti milik Anda perform di platform kami?`,
    tips: [
      'Always name-drop the referrer with permission',
      'Mention specific results the referrer experienced',
      'Offer to show, not tell — visual proof converts better',
    ],
  },
  {
    label: 'Follow-Up — After No Response',
    context: 'Second touch after 3-5 days without reply',
    script: `Halo Pak/Bu [Nama],

Hanya ingin follow up singkat — minggu lalu saya menghubungi tentang platform ASTRA Villa.

Sebagai info tambahan: minggu ini kami memiliki [X] investor aktif yang mencari properti di area [Area Agent]. Listing Anda bisa langsung terlihat oleh mereka.

Jika tertarik, saya bisa bantu upload listing pertama dalam 5 menit. Tidak ada biaya pendaftaran.

Terima kasih atas waktunya.`,
    tips: [
      'Add new value — share a relevant stat or investor demand signal',
      'Keep follow-ups shorter than initial outreach',
      'Maximum 2 follow-ups before moving on',
    ],
  },
];

const VALUE_POINTS = [
  {
    icon: TrendingUp,
    title: 'Intelligent Ranking Increases Listing Exposure',
    script: '"Setiap listing di ASTRA Villa mendapat AI Opportunity Score. Semakin tinggi skornya, semakin sering ditampilkan ke investor yang relevan. Ini berarti listing Anda tidak tenggelam — justru diprioritaskan berdasarkan kualitas."',
    proof: 'Listings with score >75 receive 3.2x more investor views than average',
  },
  {
    icon: Users,
    title: 'Investor-Focused Marketplace Audience',
    script: '"Audience kami bukan pencari rumah biasa — mereka investor aktif yang menggunakan data AI untuk keputusan. Artinya, setiap inquiry yang masuk lebih berkualitas dan lebih likely untuk convert ke deal."',
    proof: 'Average inquiry-to-offer conversion: 18.4% vs industry 3-5%',
  },
  {
    icon: Zap,
    title: 'Structured Inquiry & Negotiation Tools',
    script: '"Kami menyediakan CRM pipeline terintegrasi, negotiation tracker, dan AI pricing advisor — semua dalam satu platform. Anda bisa track setiap lead dari inquiry sampai closing tanpa spreadsheet manual."',
    proof: 'Agent CRM reduces average deal cycle by 35%',
  },
];

const TRUST_ELEMENTS = [
  {
    icon: BarChart3,
    title: 'Demo Property Performance Example',
    instruction: 'Show a real listing performance dashboard with view counts, inquiry stats, and opportunity score',
    script: '"Ini contoh listing serupa di area [Area] — dalam 2 minggu pertama mendapat [X] views dari investor verified, [Y] inquiries, dan [Z] offer requests. Ini data real, bukan proyeksi."',
    action: 'Open Property Detail → Investment Insights panel → Show AI scores',
  },
  {
    icon: Handshake,
    title: 'Commission Collaboration Model',
    instruction: 'Explain transparent commission structure with no hidden fees',
    script: '"Model kami sederhana — Anda tetap pegang komisi penuh dari deal Anda. ASTRA Villa tidak memotong komisi agent. Revenue kami dari premium features dan developer partnerships. Agent success = platform success."',
    action: 'Show commission structure page or partnership agreement',
  },
  {
    icon: Star,
    title: 'Early Partner Visibility Advantage',
    instruction: 'Highlight the first-mover advantage for agents joining now',
    script: '"Sebagai early partner, listing Anda mendapat priority visibility selama fase pertumbuhan kami. Plus, Anda mendapat badge Founding Agent — trust signal permanen yang meningkatkan kredibilitas di mata investor."',
    action: 'Show Founding Agent badge preview and priority listing placement',
  },
];

const FOLLOWUP_STEPS = [
  {
    step: 1,
    title: 'Send Platform Onboarding Guide',
    timeframe: 'Immediately after agreement',
    icon: FileText,
    actions: [
      'Send WhatsApp link to agent onboarding wizard',
      'Include video walkthrough (< 3 min) of listing upload process',
      'Share agent dashboard quick-start PDF',
      'Provide dedicated support contact for setup questions',
    ],
    script: '"Pak/Bu [Nama], terima kasih sudah bergabung! Saya kirimkan panduan onboarding — prosesnya sangat simpel, sekitar 5 menit. Jika ada pertanyaan, langsung hubungi saya ya."',
  },
  {
    step: 2,
    title: 'Assist First Listing Upload',
    timeframe: 'Within 24 hours of signup',
    icon: Building2,
    actions: [
      'Schedule 15-min assisted listing session via video call',
      'Help optimize photos, description, and pricing strategy',
      'Activate AI listing content generator for SEO-optimized copy',
      'Verify listing quality and approve for marketplace',
    ],
    script: '"Saya ingin bantu langsung untuk listing pertama Anda supaya hasilnya optimal. Bisa kita jadwalkan 15 menit untuk upload bersama? Saya akan bantu optimize deskripsi dan foto supaya AI score-nya tinggi."',
  },
  {
    step: 3,
    title: 'Schedule Performance Review',
    timeframe: 'Day 7 after first listing',
    icon: Calendar,
    actions: [
      'Review listing view count, inquiry stats, and investor engagement',
      'Suggest optimization based on AI recommendations',
      'Discuss adding more listings to portfolio',
      'Set monthly performance check-in cadence',
    ],
    script: '"Pak/Bu [Nama], listing Anda sudah 1 minggu live. Mari kita review performanya — saya akan tunjukkan analytics dan rekomendasi AI untuk meningkatkan visibility. Kapan waktu yang baik untuk call 15 menit?"',
  },
];

const OBJECTION_HANDLERS = [
  {
    objection: '"Saya sudah listing di platform lain"',
    response: 'Justru itu — ASTRA Villa bukan pengganti, tapi channel tambahan yang fokus ke investor. Listing Anda tetap di platform lain, tapi di sini Anda dapat audience berbeda yang lebih high-intent.',
  },
  {
    objection: '"Saya tidak punya waktu untuk platform baru"',
    response: 'Upload pertama hanya 5 menit, dan kami bantu langsung. Setelah itu, semuanya otomatis — leads masuk ke dashboard Anda, tidak perlu monitoring manual.',
  },
  {
    objection: '"Berapa biayanya?"',
    response: 'Tidak ada biaya listing. Agent bergabung gratis, dan kami tidak potong komisi Anda. Premium tools opsional, tapi listing dasar sepenuhnya free.',
  },
  {
    objection: '"Platform baru, belum terbukti"',
    response: 'Kami memahami itu — karena itu kami menawarkan Founding Agent badge dan priority visibility. Early partners mendapat keuntungan paling besar saat platform berkembang.',
  },
];

/* ─── Component ─── */

export default function AgentOnboardingScriptsPage() {
  const [activeTab, setActiveTab] = useState('approach');
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
  const { toast } = useToast();

  const copyScript = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(id);
    toast({ title: 'Script copied!', description: 'Ready to paste into your message.' });
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            Agent Onboarding Scripts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Communication framework for recruiting and activating property agent partners
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="approach">Approach Scripts</TabsTrigger>
            <TabsTrigger value="value">Value Points</TabsTrigger>
            <TabsTrigger value="trust">Trust Building</TabsTrigger>
            <TabsTrigger value="followup">Follow-Up Flow</TabsTrigger>
            <TabsTrigger value="objections">Objection Handling</TabsTrigger>
          </TabsList>

          {/* ═══ APPROACH SCRIPTS ═══ */}
          <TabsContent value="approach" className="space-y-4">
            {APPROACH_SCRIPTS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">{s.label}</CardTitle>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.context}</p>
                      </div>
                      <button
                        onClick={() => copyScript(s.script, `approach-${i}`)}
                        className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-lg bg-primary/5 hover:bg-primary/10"
                      >
                        {copiedIdx === `approach-${i}` ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copiedIdx === `approach-${i}` ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="bg-muted/15 border border-border/30 rounded-lg p-4 mb-3">
                      <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                        {s.script}
                      </pre>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tips</p>
                      {s.tips.map((tip, ti) => (
                        <div key={ti} className="flex items-start gap-2">
                          <ChevronRight className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-[11px] text-muted-foreground">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ═══ VALUE POINTS ═══ */}
          <TabsContent value="value" className="space-y-4">
            {VALUE_POINTS.map((v, i) => {
              const VIcon = v.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="border border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <VIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground mb-2">{v.title}</p>
                          <div className="bg-muted/15 border border-border/30 rounded-lg p-3 mb-2 relative">
                            <p className="text-xs text-foreground italic leading-relaxed">{v.script}</p>
                            <button
                              onClick={() => copyScript(v.script, `value-${i}`)}
                              className="absolute top-2 right-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                              {copiedIdx === `value-${i}` ? <CheckCircle2 className="h-3.5 w-3.5 text-chart-2" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] text-chart-2 border-chart-2/30">
                              <BarChart3 className="h-2.5 w-2.5 mr-1" />
                              Proof Point
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{v.proof}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ TRUST BUILDING ═══ */}
          <TabsContent value="trust" className="space-y-4">
            {TRUST_ELEMENTS.map((t, i) => {
              const TIcon = t.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="border border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                          <TIcon className="h-4 w-4 text-chart-2" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground">{t.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">{t.instruction}</p>

                          <div className="bg-muted/15 border border-border/30 rounded-lg p-3 mb-2 relative">
                            <p className="text-xs text-foreground italic leading-relaxed">{t.script}</p>
                            <button
                              onClick={() => copyScript(t.script, `trust-${i}`)}
                              className="absolute top-2 right-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                              {copiedIdx === `trust-${i}` ? <CheckCircle2 className="h-3.5 w-3.5 text-chart-2" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                            <Eye className="h-3 w-3 text-primary flex-shrink-0" />
                            <p className="text-[10px] text-primary font-medium">{t.action}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ FOLLOW-UP FLOW ═══ */}
          <TabsContent value="followup" className="space-y-4">
            {FOLLOWUP_STEPS.map((f, i) => {
              const FIcon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  {i > 0 && (
                    <div className="flex justify-center -mt-2 mb-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground/25 rotate-90" />
                    </div>
                  )}
                  <Card className="border border-border bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary">
                          {f.step}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{f.title}</CardTitle>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">{f.timeframe}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-1.5 mb-3">
                        {f.actions.map((a, ai) => (
                          <div key={ai} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                            <CheckCircle2 className="h-3 w-3 text-chart-2 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-foreground">{a}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-muted/15 border border-border/30 rounded-lg p-3 relative">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Script</p>
                        <p className="text-xs text-foreground italic leading-relaxed">{f.script}</p>
                        <button
                          onClick={() => copyScript(f.script, `followup-${i}`)}
                          className="absolute top-2 right-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {copiedIdx === `followup-${i}` ? <CheckCircle2 className="h-3.5 w-3.5 text-chart-2" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ OBJECTION HANDLING ═══ */}
          <TabsContent value="objections" className="space-y-3">
            <Card className="border border-border bg-card mb-4">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Framework: </span>
                  Acknowledge the concern → Reframe with value → Offer proof or low-risk next step
                </p>
              </CardContent>
            </Card>

            {OBJECTION_HANDLERS.map((o, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="border border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MessageSquare className="h-3 w-3 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-foreground mb-1.5">{o.objection}</p>
                        <div className="bg-chart-2/5 border border-chart-2/15 rounded-lg p-3 relative">
                          <div className="flex items-center gap-1 mb-1">
                            <ArrowRight className="h-2.5 w-2.5 text-chart-2" />
                            <span className="text-[9px] font-semibold text-chart-2 uppercase tracking-wider">Response</span>
                          </div>
                          <p className="text-xs text-foreground leading-relaxed">{o.response}</p>
                          <button
                            onClick={() => copyScript(o.response, `objection-${i}`)}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {copiedIdx === `objection-${i}` ? <CheckCircle2 className="h-3.5 w-3.5 text-chart-2" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
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
