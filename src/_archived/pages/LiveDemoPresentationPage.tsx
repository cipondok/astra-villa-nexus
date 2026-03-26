import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, ChevronLeft, ChevronRight, Monitor, Clock, Target,
  Sparkles, Map, BarChart3, PieChart, Building2, Zap,
  Eye, TrendingUp, Users, Globe, Layers, ArrowRight,
  Maximize, Minimize, MessageSquare, CheckCircle2, Star,
  Briefcase, ShieldCheck, Flame, LineChart, Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface TalkingPoint {
  text: string;
  emphasis?: boolean;
}

interface DemoAction {
  action: string;
  route?: string;
  visual: string;
}

interface DemoStep {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  durationSec: number;
  icon: typeof Play;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  objective: string;
  talkingPoints: TalkingPoint[];
  demoActions: DemoAction[];
  keyMessage: string;
  transition: string;
}

const STEPS: DemoStep[] = [
  {
    id: 1, title: 'Vision Context', subtitle: 'Why AI changes everything in property investment',
    duration: '1 min', durationSec: 60, icon: Globe,
    accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    objective: 'Create emotional connection with the problem. Make the audience feel the pain of traditional property investment.',
    talkingPoints: [
      { text: '"Investasi properti di Indonesia masih sangat manual — investor harus visit puluhan lokasi, baca ratusan listing, dan tetap sering salah pilih."' },
      { text: '"Data market tersebar di mana-mana. Tidak ada satu tempat yang bisa bilang: ini deal terbaik untuk profil investasi Anda."' },
      { text: '"ASTRA Villa dibangun untuk solve masalah ini — AI yang menganalisis ribuan data point dan memberikan investment intelligence secara real-time."', emphasis: true },
      { text: '"Hari ini saya akan tunjukkan bagaimana platform ini bekerja — dari discovery sampai portfolio management."' },
    ],
    demoActions: [
      { action: 'Show landing page hero section', route: '/landing', visual: 'Full-screen hero with tagline and value proposition' },
      { action: 'Scroll to social proof / stats section', visual: 'Animated counters showing platform scale' },
    ],
    keyMessage: 'Real estate investing is broken. ASTRA Villa is the intelligent solution.',
    transition: '"Sekarang mari saya tunjukkan bagaimana AI kami menemukan peluang investasi terbaik..."',
  },
  {
    id: 2, title: 'Opportunity Discovery', subtitle: 'AI-powered deal ranking and elite opportunity detection',
    duration: '3 min', durationSec: 180, icon: Search,
    accentClass: 'text-sky-400', borderClass: 'border-sky-400/30', bgClass: 'bg-sky-400',
    objective: 'Demonstrate the core AI value — showing how the platform surfaces deals that humans would miss.',
    talkingPoints: [
      { text: '"Ini adalah search engine kami. Bukan search biasa — setiap properti di-score oleh AI berdasarkan ROI potential, market demand, price gap, dan rental yield."' },
      { text: '"Perhatikan Opportunity Score di setiap card — ini angka 0-100 yang merangkum semua faktor investasi menjadi satu signal yang actionable."', emphasis: true },
      { text: '"Saya bisa filter berdasarkan kota, tipe, budget — dan AI langsung re-rank berdasarkan match dengan kriteria saya."' },
      { text: '"Coba kita buka satu properti — lihat AI Insight Panel di samping. Ini menjelaskan KENAPA properti ini mendapat score tinggi."' },
    ],
    demoActions: [
      { action: 'Open property search page', route: '/properties', visual: 'Grid of property cards with AI scores visible' },
      { action: 'Apply filters: Jakarta, Apartment, < 2B IDR', visual: 'Cards re-sort by opportunity score' },
      { action: 'Click top-scored property card', visual: 'Property detail page with AI insight panel' },
      { action: 'Highlight the opportunity score breakdown', visual: 'Score ring animation + factor weights' },
    ],
    keyMessage: 'AI finds deals humans miss — every property is scored, ranked, and explained.',
    transition: '"Score ini tidak datang dari vacuum. Mari saya tunjukkan data market intelligence yang feed into analisis ini..."',
  },
  {
    id: 3, title: 'Market Heat Intelligence', subtitle: 'Geospatial demand signals and emerging growth zones',
    duration: '2 min', durationSec: 120, icon: Map,
    accentClass: 'text-emerald-400', borderClass: 'border-emerald-400/30', bgClass: 'bg-emerald-400',
    objective: 'Show the map-based intelligence layer — making abstract market data visually tangible and exciting.',
    talkingPoints: [
      { text: '"Ini Investment Map Explorer — setiap zona di-color coded berdasarkan demand heat, price growth trajectory, dan opportunity density."' },
      { text: '"Warna merah terang = high demand zone. Ini artinya area dengan pertumbuhan inquiries paling cepat dalam 30 hari terakhir."', emphasis: true },
      { text: '"Klik zona manapun — langsung terlihat statistik: average yield, price per sqm trend, dan jumlah investor yang sedang aktif mencari di area itu."' },
      { text: '"Intelligence ini membuat investor bisa spot emerging area SEBELUM harga naik — bukan setelah."' },
    ],
    demoActions: [
      { action: 'Navigate to map explorer', route: '/investment-map-explorer', visual: 'Full map with neon heat layers active' },
      { action: 'Toggle between Opportunity Score and Rental Demand layers', visual: 'Heat colors shift dramatically' },
      { action: 'Click on a high-heat zone (e.g., BSD/Tangerang)', visual: 'Zone stats panel slides in with metrics' },
      { action: 'Show side-by-side province comparison', visual: 'Two panels comparing Jakarta vs Bali metrics' },
    ],
    keyMessage: 'See market movements before they happen — spot the next growth zone visually.',
    transition: '"Sekarang kita sudah tahu DIMANA yang hot. Pertanyaan berikutnya — bagaimana membandingkan dan simulasi return-nya?"',
  },
  {
    id: 4, title: 'Investment Decision Tools', subtitle: 'Property comparison and ROI simulation engine',
    duration: '2 min', durationSec: 120, icon: BarChart3,
    accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    objective: 'Show analytical depth — this is where investors realize the platform is a serious decision tool, not just a listing portal.',
    talkingPoints: [
      { text: '"Investor serius butuh alat untuk membandingkan opsi secara objektif. Comparison tool kami meletakkan properti side-by-side dengan semua metrik kunci."' },
      { text: '"Tapi yang paling powerful — Wealth Simulator. Input properti, holding period, dan market scenario — AI menghitung projection sampai 20 tahun ke depan."', emphasis: true },
      { text: '"Termasuk stress testing — bagaimana kalau ada resesi global? Berapa ketahanan investasi ini dalam skenario terburuk?"' },
      { text: '"Tools ini level institusional — biasanya hanya tersedia untuk fund manager besar. Kami memberikannya ke semua investor."' },
    ],
    demoActions: [
      { action: 'Open property comparison with 2-3 saved properties', visual: 'Side-by-side comparison table with AI scores' },
      { action: 'Navigate to Wealth Simulator', route: '/wealth-simulator', visual: 'Multi-year projection chart with scenario toggles' },
      { action: 'Switch between Bull / Base / Bear scenarios', visual: 'Chart lines shift dramatically between scenarios' },
      { action: 'Show stress test with "Global Recession" scenario', route: '/stress-test-engine', visual: 'Shock impact visualization with recovery timeline' },
    ],
    keyMessage: 'Institutional-grade analysis tools, accessible to every investor.',
    transition: '"Semua intelligence ini tidak berdiri sendiri — semuanya terintegrasi di portfolio dashboard..."',
  },
  {
    id: 5, title: 'Portfolio Intelligence', subtitle: 'Unified dashboard with growth projection and alerts',
    duration: '2 min', durationSec: 120, icon: PieChart,
    accentClass: 'text-rose-400', borderClass: 'border-rose-400/30', bgClass: 'bg-rose-400',
    objective: 'Show the "command center" feel — making investors envision using this daily for their portfolio.',
    talkingPoints: [
      { text: '"Ini portfolio dashboard — satu tempat untuk melihat semua aset, total valuation, projected growth, dan active alerts."' },
      { text: '"AI secara aktif memantau portfolio — kalau ada price drop di area Anda, atau ada new development yang bisa impact value, Anda langsung dapat alert."', emphasis: true },
      { text: '"Performance tracking real-time — lihat mana aset yang outperform, mana yang perlu di-rebalance."' },
      { text: '"Ini bukan sekedar tracker — ini investment command center yang terus belajar dari data baru setiap hari."' },
    ],
    demoActions: [
      { action: 'Open investor portfolio dashboard', visual: 'Portfolio overview with total value, allocation chart, and growth trend' },
      { action: 'Show AI alert notification (price drop detected)', visual: 'Alert card with "AI detected 12% below market" message' },
      { action: 'Expand growth projection chart', visual: 'Multi-year portfolio trajectory with confidence bands' },
      { action: 'Show watchlist with opportunity scores updating', visual: 'Watchlist cards with live score badges' },
    ],
    keyMessage: 'Your personal AI investment command center — always watching, always learning.',
    transition: '"Terakhir, saya ingin share bagaimana ini menjadi bisnis yang sustainable dan scalable..."',
  },
  {
    id: 6, title: 'Monetization & Ecosystem', subtitle: 'Revenue model, partnerships, and platform scalability',
    duration: '2 min', durationSec: 120, icon: Building2,
    accentClass: 'text-primary', borderClass: 'border-primary/30', bgClass: 'bg-primary',
    objective: 'Shift from product demo to business opportunity. Show this is a real business with multiple revenue streams.',
    talkingPoints: [
      { text: '"Platform ini bukan hanya tools — ini adalah ecosystem. Ada 4 revenue stream utama."' },
      { text: '"Pertama, developer partnerships — developer membayar untuk featured placement dan qualified lead generation. Kedua, premium subscriptions untuk investor yang mau akses AI tools lengkap."', emphasis: true },
      { text: '"Ketiga, property services marketplace — koneksi ke vendor renovasi, interior, smart home. Keempat, transaction facilitation fee untuk deal yang closing melalui platform."' },
      { text: '"Network effect sangat kuat — lebih banyak listing attracts lebih banyak investor, yang attracts lebih banyak developer. Flywheel ini sudah mulai berputar."' },
    ],
    demoActions: [
      { action: 'Show developer dashboard overview', route: '/developer-dashboard', visual: 'Developer project management with unit tracking' },
      { action: 'Show services marketplace page', visual: 'Vendor categories grid with booking flow' },
      { action: 'Show referral program dashboard', route: '/referral', visual: 'Gamified tiers with earnings tracker' },
      { action: 'Return to landing page — closing statement', route: '/landing', visual: 'Hero section with CTA' },
    ],
    keyMessage: 'A complete ecosystem with 4 revenue streams and powerful network effects.',
    transition: '"Itulah ASTRA Villa — AI-powered real estate intelligence platform. Pertanyaan?"',
  },
];

function StepSlide({ step, isActive }: { step: DemoStep; isActive: boolean }) {
  const Icon = step.icon;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Step header */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.borderClass} ${step.bgClass}/10 shrink-0`}>
              <Icon className={`h-6 w-6 ${step.accentClass}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`text-[10px] h-5 border ${step.borderClass} ${step.accentClass}`}>Step {step.id}</Badge>
                <h2 className="text-lg font-bold text-foreground font-serif">{step.title}</h2>
                <Badge variant="outline" className="text-[10px] h-5"><Clock className="h-2.5 w-2.5 mr-0.5" />{step.duration}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{step.subtitle}</p>
            </div>
          </div>

          {/* Objective */}
          <div className="rounded-lg border border-border/15 bg-muted/5 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-bold">Step Objective</span>
            </div>
            <p className="text-[11px] text-foreground leading-relaxed">{step.objective}</p>
          </div>

          {/* Two-column: Talking Points + Demo Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Talking points */}
            <div className="rounded-xl border border-border/15 bg-card/20 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold text-foreground">What to Say</span>
              </div>
              <div className="space-y-1.5">
                {step.talkingPoints.map((tp, i) => (
                  <div key={i} className={`rounded-lg px-3 py-2 ${tp.emphasis ? 'bg-primary/5 border border-primary/15' : 'bg-muted/5 border border-border/10'}`}>
                    <div className="flex items-start gap-2">
                      <span className={`text-[8px] font-bold mt-1 shrink-0 ${tp.emphasis ? 'text-primary' : 'text-muted-foreground/40'}`}>{i + 1}</span>
                      <p className={`text-[10px] leading-relaxed ${tp.emphasis ? 'text-foreground font-medium' : 'text-foreground'}`}>{tp.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo actions */}
            <div className="rounded-xl border border-border/15 bg-card/20 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold text-foreground">What to Show</span>
              </div>
              <div className="space-y-1.5">
                {step.demoActions.map((da, i) => (
                  <div key={i} className="rounded-lg bg-muted/5 border border-border/10 px-3 py-2">
                    <div className="flex items-start gap-2">
                      <Play className="h-2.5 w-2.5 text-muted-foreground mt-1 shrink-0" />
                      <div>
                        <p className="text-[10px] text-foreground font-medium">{da.action}</p>
                        {da.route && <code className="text-[9px] text-violet-400 font-mono">{da.route}</code>}
                        <p className="text-[9px] text-muted-foreground mt-0.5">{da.visual}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key message */}
          <div className={`rounded-xl border ${step.borderClass} ${step.bgClass}/5 p-3`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-bold">Key Takeaway for Audience</span>
            </div>
            <p className="text-sm text-foreground font-bold italic">"{step.keyMessage}"</p>
          </div>

          {/* Transition line */}
          <div className="rounded-lg border border-border/10 bg-muted/5 px-3 py-2 flex items-start gap-2">
            <ArrowRight className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-bold">Transition to Next</span>
              <p className="text-[10px] text-foreground italic">{step.transition}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LiveDemoPresentationPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalDuration = STEPS.reduce((s, st) => s + st.durationSec, 0);

  const goNext = useCallback(() => setActiveStep(p => Math.min(p + 1, STEPS.length - 1)), []);
  const goPrev = useCallback(() => setActiveStep(p => Math.max(p - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'Escape') setIsFullscreen(false);
      if (e.key === 'f' || e.key === 'F') setIsFullscreen(p => !p);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  const progressPct = ((activeStep + 1) / STEPS.length) * 100;
  const elapsedSec = STEPS.slice(0, activeStep).reduce((s, st) => s + st.durationSec, 0);

  return (
    <div className={`min-h-screen bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Top bar */}
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground font-serif">Live Demo Flow</h1>
                <p className="text-[10px] text-muted-foreground">{Math.floor(totalDuration / 60)} min total · {STEPS.length} steps · Keyboard: ← → Space F</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] h-6">
                <Clock className="h-3 w-3 mr-1" />
                ~{Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, '0')} elapsed
              </Badge>
              <button onClick={() => setIsFullscreen(p => !p)} className="p-1.5 rounded-lg border border-border/20 hover:bg-muted/10 transition-colors">
                {isFullscreen ? <Minimize className="h-4 w-4 text-muted-foreground" /> : <Maximize className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          {/* Step navigation pills */}
          <div className="flex items-center gap-1 mt-3">
            {STEPS.map((step, i) => {
              const StIcon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(i)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-medium transition-all border ${
                    i === activeStep
                      ? `${step.borderClass} ${step.bgClass}/10 ${step.accentClass}`
                      : i < activeStep
                      ? 'border-border/20 bg-muted/10 text-muted-foreground'
                      : 'border-border/10 text-muted-foreground/40'
                  }`}
                >
                  <StIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">{step.id}</span>
                </button>
              );
            })}
          </div>

          <Progress value={progressPct} className="h-1 mt-2" />
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
          {/* Slide content */}
          <div className="min-h-[500px]">
            <StepSlide step={STEPS[activeStep]} isActive={true} />
          </div>

          {/* Side overview */}
          <div className="space-y-3">
            <div className="rounded-xl border border-border/20 bg-card/30 p-3 sticky top-[140px]">
              <span className="text-[10px] font-bold text-foreground mb-2 block">All Steps</span>
              <div className="space-y-1">
                {STEPS.map((step, i) => {
                  const StIcon = step.icon;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(i)}
                      className={`w-full text-left rounded-lg px-2 py-1.5 flex items-center gap-2 transition-colors ${
                        i === activeStep ? `${step.bgClass}/10 border ${step.borderClass}` : 'hover:bg-muted/5 border border-transparent'
                      }`}
                    >
                      {i < activeStep ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                      ) : (
                        <StIcon className={`h-3 w-3 shrink-0 ${i === activeStep ? step.accentClass : 'text-muted-foreground/40'}`} />
                      )}
                      <div className="min-w-0">
                        <span className={`text-[10px] block truncate ${i === activeStep ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{step.title}</span>
                        <span className="text-[8px] text-muted-foreground/50">{step.duration}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <Separator className="opacity-15 my-2" />

              <div className="space-y-1.5 text-[9px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Duration</span>
                  <span className="text-foreground font-bold">{Math.floor(totalDuration / 60)} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Demo Actions</span>
                  <span className="text-foreground font-bold">{STEPS.reduce((s, st) => s + st.demoActions.length, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Talk Points</span>
                  <span className="text-foreground font-bold">{STEPS.reduce((s, st) => s + st.talkingPoints.length, 0)}</span>
                </div>
              </div>

              <Separator className="opacity-15 my-2" />

              <div className="text-[9px] text-muted-foreground space-y-0.5">
                <p><kbd className="px-1 py-0.5 rounded bg-muted/10 border border-border/20 text-[8px]">←</kbd> <kbd className="px-1 py-0.5 rounded bg-muted/10 border border-border/20 text-[8px]">→</kbd> Navigate</p>
                <p><kbd className="px-1 py-0.5 rounded bg-muted/10 border border-border/20 text-[8px]">F</kbd> Fullscreen</p>
                <p><kbd className="px-1 py-0.5 rounded bg-muted/10 border border-border/20 text-[8px]">Esc</kbd> Exit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/15">
          <button
            onClick={goPrev}
            disabled={activeStep === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/20 text-xs text-muted-foreground hover:bg-muted/5 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span className="text-[10px] text-muted-foreground">Step {activeStep + 1} of {STEPS.length}</span>
          <button
            onClick={goNext}
            disabled={activeStep === STEPS.length - 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary/30 bg-primary/10 text-xs text-foreground hover:bg-primary/20 disabled:opacity-30 transition-colors"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
