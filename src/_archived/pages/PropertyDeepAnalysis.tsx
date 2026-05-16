import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Bookmark, MessageSquare, Sparkles, Zap, TrendingUp, MapPin,
  Building2, BarChart3, Target, Shield, ChevronLeft, ChevronRight,
  ArrowRight, DollarSign, Globe, Flame, LineChart, Users, Star,
  Clock, Activity, Award, ArrowUpRight, Heart, Share2, Phone,
  Mail, CheckCircle2, Home, Maximize, BedDouble, Bath, TreePine,
  Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ================================================================
   PROPERTY DEEP ANALYSIS — Institutional-Grade Investment Report
   ================================================================ */

const IMAGES = [
  { id: 1, label: 'Exterior' },
  { id: 2, label: 'Pool' },
  { id: 3, label: 'Living Room' },
  { id: 4, label: 'Master Suite' },
  { id: 5, label: 'Kitchen' },
];

const SCORE_FACTORS = [
  { label: 'Price Benchmark', value: 88, icon: DollarSign, desc: 'Priced 7.2% below comparable fair market value in this micro-zone.' },
  { label: 'Rental Yield', value: 92, icon: TrendingUp, desc: 'Projected 14.2% gross yield — top 8% for Canggu short-term rentals.' },
  { label: 'Area Demand', value: 85, icon: Flame, desc: '312 active investor searches in this district over the past 30 days.' },
  { label: 'Exit Liquidity', value: 78, icon: Activity, desc: 'Median 38 days on market for comparable assets. High resale velocity.' },
  { label: 'Asset Quality', value: 90, icon: Award, desc: 'Premium build specification with verified title (SHM) and IMB compliance.' },
  { label: 'Macro Growth', value: 82, icon: Globe, desc: 'Bali tourism +18% YoY. New toll road reduces airport transit to 25 min.' },
];

const COMPARABLES = [
  { title: 'Villa Semara Luxury', location: 'Pererenan', price: 'IDR 5.1B', score: 84, yield: '12.8%', delta: '-4.5%' },
  { title: 'Casa Luna Estate', location: 'Canggu', price: 'IDR 5.8B', score: 79, yield: '11.2%', delta: '+8.6%' },
  { title: 'The Nest Hideaway', location: 'Berawa', price: 'IDR 4.6B', score: 88, yield: '15.1%', delta: '-13.9%' },
  { title: 'Tropicana Residence', location: 'Echo Beach', price: 'IDR 5.5B', score: 81, yield: '13.0%', delta: '+3.0%' },
];

export default function PropertyDeepAnalysis() {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [occupancy, setOccupancy] = useState([75]);
  const [saved, setSaved] = useState(false);

  const monthlyGross = Math.round(4200000 * (occupancy[0] / 100));
  const annualGross = monthlyGross * 12;
  const netYield = ((annualGross / 5340000000) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      {/* ========== HERO ========== */}
      <section className="relative">
        {/* Image Slider */}
        <div className="relative h-[50vh] sm:h-[60vh] bg-accent overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-gradient-to-br from-accent via-accent/80 to-accent/50 flex items-center justify-center"
            >
              <div className="text-center">
                <Building2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-2" />
                <span className="text-xs text-muted-foreground/40">{IMAGES[currentImage].label}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows */}
          <button
            onClick={() => setCurrentImage(i => (i - 1 + IMAGES.length) % IMAGES.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentImage(i => (i + 1) % IMAGES.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i === currentImage ? 'bg-primary w-6' : 'bg-background/50'
                )}
              />
            ))}
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Share + Save */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button className="w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setSaved(!saved); toast.success(saved ? 'Removed from watchlist' : 'Saved to watchlist'); }}
              className={cn(
                'w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors',
                saved ? 'bg-primary text-primary-foreground' : 'bg-background/70 hover:bg-background'
              )}
            >
              <Heart className={cn('w-4 h-4', saved && 'fill-current')} />
            </button>
          </div>
        </div>

        {/* Property Info Overlay */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl shadow-primary/5">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Left: Info */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]"><TrendingUp className="w-3 h-3 mr-1" />High Yield</Badge>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]"><Flame className="w-3 h-3 mr-1" />Growth Area</Badge>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]"><Activity className="w-3 h-3 mr-1" />Liquidity Strong</Badge>
                </div>
                <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Modern Villa with Infinity Pool & Private Garden
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Canggu, Badung, Bali — Berawa District</span>
                </div>

                {/* Specs row */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><BedDouble className="w-4 h-4" />3 Bedrooms</span>
                  <span className="flex items-center gap-1.5"><Bath className="w-4 h-4" />3 Bathrooms</span>
                  <span className="flex items-center gap-1.5"><Maximize className="w-4 h-4" />250 m² Building</span>
                  <span className="flex items-center gap-1.5"><TreePine className="w-4 h-4" />400 m² Land</span>
                  <span className="flex items-center gap-1.5"><Wifi className="w-4 h-4" />Fully Furnished</span>
                </div>
              </div>

              {/* Right: Price + Score */}
              <div className="flex flex-col items-center lg:items-end gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">Asking Price</div>
                  <div className="text-3xl font-bold text-foreground">IDR 5.34B</div>
                  <div className="text-xs text-primary font-medium mt-1">≈ USD $335,000</div>
                </div>
                {/* Opportunity Score */}
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" strokeWidth="6" className="stroke-secondary" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none" strokeWidth="6" strokeLinecap="round"
                      className="stroke-primary"
                      strokeDasharray={`${92 * 2.64} 264`}
                      initial={{ strokeDasharray: '0 264' }}
                      animate={{ strokeDasharray: `${92 * 2.64} 264` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">92</span>
                    <span className="text-[9px] text-muted-foreground">AI Score</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STICKY ACTION BAR ========== */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="hidden sm:block">
            <span className="text-sm font-semibold text-foreground">Modern Villa — Canggu</span>
            <span className="text-sm text-muted-foreground ml-2">IDR 5.34B</span>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => { setSaved(!saved); toast.success(saved ? 'Removed' : 'Saved to watchlist'); }}>
              <Bookmark className={cn('w-3.5 h-3.5', saved && 'fill-current text-primary')} />
              <span className="hidden sm:inline">Watchlist</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => navigate('/deal-room')}>
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deal Room</span>
            </Button>
            <Button size="sm" className="gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              AI Report
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-14">
        {/* ========== AI INVESTMENT SUMMARY ========== */}
        <RevealSection>
          <SectionHeader icon={<Sparkles className="w-5 h-5" />} title="AI Investment Summary" badge="Auto-generated" />
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
            <p className="text-foreground/90 leading-relaxed text-[15px]">
              This Canggu villa presents a <strong className="text-foreground">compelling entry point</strong> at 7.2% below comparable
              fair market value in the Berawa corridor. With short-term rental projections of <strong className="text-foreground">14.2% gross yield</strong> and
              the area experiencing <strong className="text-foreground">+18% YoY tourism growth</strong>, the asset combines immediate cash
              flow potential with medium-term appreciation upside. Investor demand for 3-bedroom villas in this
              micro-zone remains elevated — 312 active searches in the past 30 days — suggesting strong exit
              liquidity if repositioned within 24-36 months. The property's premium specification (infinity pool,
              full furnishing, SHM title) aligns with the profile of international investors seeking turnkey
              tropical assets with institutional-grade returns.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <MiniTag icon={<Target className="w-3 h-3" />} text="Best for: Short-term rental investors" />
              <MiniTag icon={<Clock className="w-3 h-3" />} text="Optimal hold: 24-36 months" />
              <MiniTag icon={<Shield className="w-3 h-3" />} text="Risk level: Low-Medium" />
            </div>
          </div>
        </RevealSection>

        {/* ========== OPPORTUNITY SCORE BREAKDOWN ========== */}
        <RevealSection>
          <SectionHeader icon={<Zap className="w-5 h-5" />} title="Opportunity Score Breakdown" badge="6 factors" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCORE_FACTORS.map((factor, i) => (
              <motion.div
                key={factor.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
                      <factor.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{factor.label}</span>
                  </div>
                  <span className={cn(
                    'text-lg font-bold tabular-nums',
                    factor.value >= 85 ? 'text-primary' : 'text-foreground'
                  )}>
                    {factor.value}
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${factor.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.06 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{factor.desc}</p>
              </motion.div>
            ))}
          </div>
        </RevealSection>

        {/* ========== YIELD & FINANCIAL PROJECTION ========== */}
        <RevealSection>
          <SectionHeader icon={<LineChart className="w-5 h-5" />} title="Yield & Financial Projection" />
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Rental Income Calculator */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 text-sm">Rental Income Simulator</h3>
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Occupancy Assumption</span>
                  <span className="text-sm font-bold text-foreground">{occupancy[0]}%</span>
                </div>
                <Slider value={occupancy} onValueChange={setOccupancy} min={30} max={95} step={5} className="mb-1" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                </div>
              </div>
              <Separator className="mb-4" />
              <div className="space-y-3">
                <FinRow label="Nightly Rate (avg)" value="IDR 4,200,000" />
                <FinRow label="Monthly Gross" value={`IDR ${(monthlyGross / 1000000).toFixed(0)}M`} highlight />
                <FinRow label="Annual Gross" value={`IDR ${(annualGross / 1000000000).toFixed(2)}B`} />
                <Separator />
                <FinRow label="Gross Yield" value={`${netYield}%`} highlight />
                <FinRow label="Net Yield (est.)" value={`${(parseFloat(netYield) * 0.72).toFixed(1)}%`} sub="After management + tax" />
              </div>
            </div>

            {/* 5-Year Appreciation */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 text-sm">5-Year Appreciation Projection</h3>
              <div className="space-y-3">
                {[
                  { year: 'Year 1', value: 'IDR 5.72B', pct: '+7.1%', bar: 20 },
                  { year: 'Year 2', value: 'IDR 6.15B', pct: '+15.2%', bar: 40 },
                  { year: 'Year 3', value: 'IDR 6.65B', pct: '+24.5%', bar: 60 },
                  { year: 'Year 4', value: 'IDR 7.18B', pct: '+34.5%', bar: 78 },
                  { year: 'Year 5', value: 'IDR 7.76B', pct: '+45.3%', bar: 95 },
                ].map((yr, i) => (
                  <motion.div
                    key={yr.year}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xs text-muted-foreground w-12">{yr.year}</span>
                    <div className="flex-1 h-7 bg-secondary/30 rounded-lg overflow-hidden relative">
                      <motion.div
                        className="h-full bg-primary/15 rounded-lg"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${yr.bar}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground w-16 text-right">{yr.value}</span>
                    <span className="text-[10px] font-semibold text-primary w-12 text-right">{yr.pct}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-4">Based on 7.1% CAGR from historical Canggu villa appreciation data.</p>
            </div>
          </div>
        </RevealSection>

        {/* ========== LOCATION INTELLIGENCE ========== */}
        <RevealSection>
          <SectionHeader icon={<MapPin className="w-5 h-5" />} title="Location Intelligence" />
          <div className="grid sm:grid-cols-3 gap-4">
            <LocationCard
              title="District Demand Heat"
              icon={<Flame className="w-4 h-4" />}
              value="Very High"
              detail="Berawa ranks #2 in Bali for investor search volume. 312 active searches, 18 inquiries this month."
              meter={88}
            />
            <LocationCard
              title="Infrastructure Growth"
              icon={<Globe className="w-4 h-4" />}
              value="Accelerating"
              detail="New toll road (2025), Ngurah Rai express link, planned commercial district — 25 min to airport."
              meter={75}
            />
            <LocationCard
              title="Lifestyle Demand"
              icon={<Users className="w-4 h-4" />}
              value="Premium"
              detail="Digital nomad hub, 200+ cafés/restaurants within 2km, international school access, beach proximity."
              meter={92}
            />
          </div>
        </RevealSection>

        {/* ========== COMPARABLE DEALS ========== */}
        <RevealSection>
          <SectionHeader icon={<BarChart3 className="w-5 h-5" />} title="Comparable Deals" badge={`${COMPARABLES.length} properties`} />
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {COMPARABLES.map((comp, i) => (
                <motion.div
                  key={comp.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="min-w-[260px] bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors cursor-pointer shrink-0"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Zap className="w-2.5 h-2.5 text-primary" />{comp.score}
                    </Badge>
                    <span className={cn(
                      'text-[10px] font-semibold',
                      comp.delta.startsWith('-') ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {comp.delta} vs this
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">{comp.title}</h4>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" />{comp.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{comp.price}</span>
                    <span className="text-[10px] text-primary font-medium">{comp.yield} yield</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </RevealSection>

        {/* ========== AGENT CONTACT ========== */}
        <RevealSection>
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <Users className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">Rina Saputra</h3>
                <Badge variant="outline" className="text-[9px] gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-primary" />Verified Agent
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Senior Investment Consultant — Canggu Specialist</p>
              <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-primary" />4.9 rating</span>
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />23 deals closed</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Avg response: 12 min</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="gap-1.5" onClick={() => navigate('/deal-room')}>
                  <MessageSquare className="w-3.5 h-3.5" />Start Negotiation
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Phone className="w-3.5 h-3.5" />Call
                </Button>
              </div>
            </div>
          </div>
        </RevealSection>
      </div>
    </div>
  );
}

/* ===================== Sub-components ===================== */

function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
      <h2 className="font-playfair text-xl font-bold text-foreground">{title}</h2>
      {badge && <Badge variant="outline" className="text-[10px] ml-auto">{badge}</Badge>}
    </div>
  );
}

function RevealSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.section>
  );
}

function MiniTag({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-accent/60 px-3 py-1.5 rounded-full">
      <span className="text-primary">{icon}</span>{text}
    </span>
  );
}

function FinRow({ label, value, highlight, sub }: { label: string; value: string; highlight?: boolean; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <div>
        <span className="text-xs text-muted-foreground">{label}</span>
        {sub && <span className="text-[10px] text-muted-foreground/60 block">{sub}</span>}
      </div>
      <span className={cn('text-sm font-semibold tabular-nums', highlight ? 'text-primary' : 'text-foreground')}>{value}</span>
    </div>
  );
}

function LocationCard({ title, icon, value, detail, meter }: {
  title: string; icon: React.ReactNode; value: string; detail: string; meter: number;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <span className="text-xs text-primary font-medium">{value}</span>
        </div>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${meter}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
    </div>
  );
}
