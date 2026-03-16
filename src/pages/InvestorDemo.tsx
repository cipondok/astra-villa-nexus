import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, ChevronRight, ChevronLeft, Pause, SkipForward,
  Home, Brain, MessageSquare, Map, Rocket, 
  Eye, TrendingUp, Users, BarChart3, Zap, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { SEOHead } from '@/components/SEOHead';

/* ─── Act definitions ─── */
interface DemoAct {
  id: number;
  title: string;
  subtitle: string;
  narrative: string;
  icon: typeof Home;
  route: string;
  duration: number; // seconds
  beats: { label: string; detail: string }[];
  takeaway: string;
}

const ACTS: DemoAct[] = [
  {
    id: 1,
    title: 'The Market Is Broken',
    subtitle: 'Homepage & AI Discovery',
    narrative: 'Property discovery in Indonesia is fragmented across 50+ portals with zero intelligence. Watch what happens when AI meets real estate.',
    icon: Home,
    route: '/',
    duration: 120,
    beats: [
      { label: 'Live Activity Ticker', detail: 'Real-time platform momentum signals' },
      { label: 'AI-Powered Search', detail: 'Predictive intent detection from natural language' },
      { label: 'Deal Score Ranking', detail: 'Results ranked by AI opportunity score, not date' },
      { label: 'Opportunity Zone', detail: 'Hot Streak cards with time-limited deals' },
    ],
    takeaway: 'This isn\'t a listing board — it\'s an intelligence layer.',
  },
  {
    id: 2,
    title: 'AI Sees What Humans Miss',
    subtitle: 'Property Intelligence & Scoring',
    narrative: 'Every property gets a 100-point AI analysis across fairness, yield, and growth potential.',
    icon: Brain,
    route: '/search?type=sale',
    duration: 180,
    beats: [
      { label: 'DealScore Badge', detail: 'AI-analyzed score on every card (0-100)' },
      { label: 'Demand Heat Badge', detail: 'Real-time view counts creating urgency' },
      { label: 'Full AI Panel', detail: 'FMV comparison, rental yield, 5-year ROI forecast' },
      { label: 'Investor DNA Match', detail: 'Personalized match % based on behavioral profiling' },
    ],
    takeaway: 'We don\'t just show listings — we score, rank, and explain every opportunity.',
  },
  {
    id: 3,
    title: 'Conversion, Not Just Browsing',
    subtitle: 'Inquiry Flow & Lead Intelligence',
    narrative: 'Intelligence without action is worthless. Here\'s how we close the gap between discovery and decision.',
    icon: MessageSquare,
    route: '/search?type=sale',
    duration: 120,
    beats: [
      { label: 'WhatsApp CTA', detail: 'Pre-filled message with property context, 8-min avg response' },
      { label: 'Side-by-Side Compare', detail: 'DealScore, yield, and price delta overlay' },
      { label: 'AI Copilot', detail: 'Structured buy/don\'t-buy analysis with risks and exit strategy' },
      { label: 'Lead Intelligence', detail: 'Intent scoring ≥75 flags Hot Leads with behavioral trail' },
    ],
    takeaway: 'We capture intent, qualify leads with AI, and reduce time-to-inquiry to minutes.',
  },
  {
    id: 4,
    title: '34 Provinces, One Intelligence Layer',
    subtitle: 'Analytics & Market Heatmap',
    narrative: 'This is where it gets exciting. We\'re not building for one city — we\'re building the national intelligence grid.',
    icon: Map,
    route: '/location',
    duration: 180,
    beats: [
      { label: 'Indonesia Heatmap', detail: '3 modes: density, demand, price — provinces light up' },
      { label: 'Province Drill-down', detail: 'Deal count, YoY growth, market cycle detection' },
      { label: 'Admin Intelligence', detail: 'AI job queue, SEO engine, health monitor — the brain' },
      { label: 'Market Forecast', detail: '12-month national outlook across 15+ metros' },
    ],
    takeaway: 'We have the data infrastructure to be the Bloomberg Terminal of Indonesian real estate.',
  },
  {
    id: 5,
    title: 'Category Leadership',
    subtitle: 'Scale, Vision & Growth',
    narrative: 'Here\'s why this is a $100M opportunity — and why we\'re positioned to capture it.',
    icon: Rocket,
    route: '/market-trends',
    duration: 120,
    beats: [
      { label: '34 Provinces · 514 Cities', detail: 'Full national geographic coverage from day one' },
      { label: 'SEO Location Pages', detail: 'Auto-generated for every kecamatan with listings' },
      { label: 'City Tier Expansion', detail: 'Metro → Secondary → Emerging with L0-L4 liquidity model' },
      { label: 'Unit Economics', detail: 'CAC < Rp 50K · 12:1 LTV:CAC · 60% organic channel mix' },
    ],
    takeaway: 'We\'re not competing with listing portals. We\'re building Indonesia\'s first AI-native property intelligence platform.',
  },
];

const PITCH_STATS = [
  { label: 'Market Size', value: '$180B', icon: TrendingUp },
  { label: 'Listings Analyzed', value: '300K+', icon: Eye },
  { label: 'Provinces', value: '34', icon: Map },
  { label: 'AI Data Points', value: '250M+', icon: BarChart3 },
];

export default function InvestorDemo() {
  const navigate = useNavigate();
  const [currentAct, setCurrentAct] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);

  const act = ACTS[currentAct];
  const progress = ((currentAct) / ACTS.length) * 100 + (elapsed / act.duration) * (100 / ACTS.length);

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setElapsed(prev => {
        if (prev >= act.duration) {
          if (currentAct < ACTS.length - 1) {
            setCurrentAct(c => c + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return prev;
          }
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, act.duration, currentAct]);

  const goToAct = useCallback((index: number) => {
    setCurrentAct(index);
    setElapsed(0);
  }, []);

  const nextAct = useCallback(() => {
    if (currentAct < ACTS.length - 1) {
      setCurrentAct(c => c + 1);
      setElapsed(0);
    }
  }, [currentAct]);

  const prevAct = useCallback(() => {
    if (currentAct > 0) {
      setCurrentAct(c => c - 1);
      setElapsed(0);
    }
  }, [currentAct]);

  const openInProduct = useCallback(() => {
    navigate(act.route);
  }, [navigate, act.route]);

  const ActIcon = act.icon;

  return (
    <>
      <SEOHead
        title="ASTRAVILLA — Investor Demo"
        description="Experience the AI-powered property intelligence platform transforming Indonesian real estate."
      />

      <div className="min-h-screen bg-background flex flex-col">
        {/* ─── Top Bar ─── */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold tracking-tight text-foreground">ASTRAVILLA</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                Investor Demo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                Exit Demo
              </Button>
            </div>
          </div>
          {/* Progress bar */}
          <Progress value={progress} className="h-1 rounded-none" />
        </header>

        {/* ─── Main Content ─── */}
        <div className="flex-1 flex flex-col lg:flex-row">

          {/* Left: Act Navigation */}
          <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border/40 bg-muted/20">
            <div className="p-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                Demo Storyline
              </p>
              {ACTS.map((a, i) => {
                const Icon = a.icon;
                const isActive = i === currentAct;
                const isDone = i < currentAct;
                return (
                  <button
                    key={a.id}
                    onClick={() => goToAct(i)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 border border-primary/20 text-foreground'
                        : isDone
                        ? 'text-muted-foreground hover:bg-muted/50'
                        : 'text-muted-foreground/60 hover:bg-muted/30'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 text-sm font-bold',
                      isActive ? 'bg-primary text-primary-foreground' :
                      isDone ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      {isDone ? '✓' : a.id}
                    </div>
                    <div className="min-w-0">
                      <p className={cn('text-sm font-medium truncate', isActive && 'text-foreground')}>
                        Act {a.id}: {a.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{a.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick stats */}
            <div className="border-t border-border/40 p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                Key Metrics
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PITCH_STATS.map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-muted/40 rounded-lg p-2.5 text-center">
                      <StatIcon className="h-3.5 w-3.5 mx-auto text-primary mb-1" />
                      <p className="text-sm font-bold text-foreground">{stat.value}</p>
                      <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right: Act Content */}
          <main className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col"
              >
                {/* Act Header */}
                <div className="border-b border-border/40 bg-muted/10 px-6 sm:px-10 py-8 sm:py-12">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        Act {act.id} of {ACTS.length}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {Math.ceil((act.duration - elapsed) / 60)} min remaining
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
                      "{act.title}"
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {act.narrative}
                    </p>
                  </div>
                </div>

                {/* Beats Grid */}
                <div className="flex-1 px-6 sm:px-10 py-8">
                  <div className="max-w-3xl space-y-8">
                    {/* Demo Beats */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4">
                        Key Demonstration Points
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {act.beats.map((beat, i) => (
                          <motion.div
                            key={beat.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                            className="flex gap-3 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors"
                          >
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary">{i + 1}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{beat.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{beat.detail}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Takeaway */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-1">
                            Investor Takeaway
                          </p>
                          <p className="text-sm font-medium text-foreground italic">
                            "{act.takeaway}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Open in product CTA */}
                    <Button
                      onClick={openInProduct}
                      className="gap-2"
                      size="lg"
                    >
                      <Eye className="h-4 w-4" />
                      See It Live in Product
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Controls */}
            <footer className="border-t border-border/40 bg-muted/10 px-6 py-4">
              <div className="max-w-3xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={prevAct} disabled={currentAct === 0}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsPlaying(p => !p)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextAct} disabled={currentAct === ACTS.length - 1}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  {ACTS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToAct(i)}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        i === currentAct ? 'w-6 bg-primary' :
                        i < currentAct ? 'w-2 bg-primary/40' : 'w-2 bg-muted-foreground/20'
                      )}
                    />
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} / {Math.floor(act.duration / 60)}:{String(act.duration % 60).padStart(2, '0')}
                </p>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </>
  );
}
