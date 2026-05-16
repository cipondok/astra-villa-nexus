import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  TrendingUp, Home, PieChart, Palmtree, Sparkles, MapPin, Shield,
  Zap, ArrowRight, ArrowLeft, CheckCircle2, Building2, Target,
  BarChart3, Globe, ChevronRight, Star, Flame, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

/* ================================================================
   INVESTOR ONBOARDING WIZARD — Multi-step Conversion Flow
   ================================================================ */

const TOTAL_STEPS = 6;

const INTENT_OPTIONS = [
  { id: 'appreciation', label: 'Long-term Appreciation', desc: 'Build wealth through property value growth over time', icon: TrendingUp },
  { id: 'rental', label: 'Rental Income Focus', desc: 'Generate consistent monthly cash flow from tenants', icon: Home },
  { id: 'diversification', label: 'Portfolio Diversification', desc: 'Add real estate to balance your investment portfolio', icon: PieChart },
  { id: 'lifestyle', label: 'Lifestyle Investment', desc: 'Own a property you can enjoy while it appreciates', icon: Palmtree },
];

const LOCATION_OPTIONS = [
  { id: 'bali', label: 'Bali', sub: 'Canggu · Seminyak · Ubud · Uluwatu', hot: true },
  { id: 'bandung', label: 'Bandung', sub: 'Mountain retreats · Urban growth', hot: false },
  { id: 'jakarta', label: 'Jakarta Metro', sub: 'CBD · South Jakarta · BSD', hot: false },
  { id: 'emerging', label: 'Emerging Hotspots', sub: 'Lombok · Labuan Bajo · Yogyakarta', hot: true },
];

const RISK_LEVELS = [
  { id: 'conservative', label: 'Conservative', desc: 'Stable assets with proven track records and lower volatility', icon: Shield },
  { id: 'balanced', label: 'Balanced', desc: 'Mix of stable and growth opportunities for optimal returns', icon: Target },
  { id: 'opportunistic', label: 'Opportunistic', desc: 'Higher growth potential in emerging markets and off-plan deals', icon: Flame },
];

const SAMPLE_LISTINGS = [
  { title: 'Modern Villa with Infinity Pool', location: 'Canggu, Bali', price: 'IDR 5.3B', score: 92, yield: '14.2%' },
  { title: 'Eco Retreat in Rice Terraces', location: 'Ubud, Bali', price: 'IDR 3.6B', score: 95, yield: '16.8%' },
  { title: 'Beachfront Penthouse', location: 'Seminyak, Bali', price: 'IDR 8.8B', score: 87, yield: '11.5%' },
];

const BUDGET_TIERS = [
  { min: 0, max: 3, label: 'Entry Investor', desc: 'Starting your property investment journey' },
  { min: 3, max: 8, label: 'Growth Investor', desc: 'Building a diversified property portfolio' },
  { min: 8, max: 20, label: 'Premium Investor', desc: 'Acquiring elite trophy assets' },
];

function getBudgetTier(value: number) {
  if (value < 3) return BUDGET_TIERS[0];
  if (value < 8) return BUDGET_TIERS[1];
  return BUDGET_TIERS[2];
}

export default function InvestorOnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [intents, setIntents] = useState<string[]>([]);
  const [budget, setBudget] = useState([5]);
  const [locations, setLocations] = useState<string[]>([]);
  const [risk, setRisk] = useState('balanced');
  const [completed, setCompleted] = useState(false);

  const canNext = () => {
    if (step === 1) return intents.length > 0;
    if (step === 3) return locations.length > 0;
    return true;
  };

  const next = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else {
      setCompleted(true);
      setTimeout(() => {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['hsl(var(--primary))', '#C8A855', '#E8D8B0'] });
      }, 300);
    }
  };

  const back = () => { if (step > 1) setStep(s => s - 1); };

  const toggleIntent = (id: string) => setIntents(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleLocation = (id: string) => setLocations(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const tier = getBudgetTier(budget[0]);

  if (completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="font-playfair text-3xl font-bold text-foreground mb-3">
            Your AI Investment Feed is Ready
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            ASTRA AI has calibrated your personalized opportunity intelligence.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            We'll surface the best deals matching your strategy in real-time.
          </p>
          <Button size="lg" className="h-12 px-8 text-base font-semibold" onClick={() => navigate('/search')}>
            Enter Investor Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with progress */}
      <div className="shrink-0 border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-playfair text-sm font-bold text-foreground">ASTRA AI</span>
            </div>
            <span className="text-xs text-muted-foreground">Step {step} of {TOTAL_STEPS}</span>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <motion.div
                key={i}
                className={cn(
                  'h-1 rounded-full flex-1 transition-colors duration-300',
                  i < step ? 'bg-primary' : 'bg-secondary'
                )}
                initial={false}
                animate={{ scaleX: i < step ? 1 : 0.95 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && <StepIntent intents={intents} toggle={toggleIntent} />}
              {step === 2 && <StepBudget budget={budget} setBudget={setBudget} tier={tier} />}
              {step === 3 && <StepLocation locations={locations} toggle={toggleLocation} />}
              {step === 4 && <StepRisk risk={risk} setRisk={setRisk} />}
              {step === 5 && <StepAIPreview />}
              {step === 6 && <StepFinal />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer nav */}
      <div className="shrink-0 border-t border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={back} disabled={step === 1} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />Back
          </Button>
          <Button size="sm" onClick={next} disabled={!canNext()} className="gap-1.5 px-6">
            {step === TOTAL_STEPS ? 'Complete Setup' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ===================== STEP 1 — Intent ===================== */
function StepIntent({ intents, toggle }: { intents: string[]; toggle: (id: string) => void }) {
  return (
    <div>
      <StepHeader
        title="What's your investment goal?"
        subtitle="Select all that match your strategy. This helps our AI find the right opportunities for you."
      />
      <div className="grid sm:grid-cols-2 gap-3">
        {INTENT_OPTIONS.map((opt, i) => {
          const selected = intents.includes(opt.id);
          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => toggle(opt.id)}
              className={cn(
                'text-left p-5 rounded-xl border-2 transition-all duration-200',
                selected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  selected ? 'bg-primary/15 text-primary' : 'bg-accent text-muted-foreground'
                )}>
                  <opt.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground mb-0.5">{opt.label}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{opt.desc}</div>
                </div>
              </div>
              {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== STEP 2 — Budget ===================== */
function StepBudget({ budget, setBudget, tier }: { budget: number[]; setBudget: (v: number[]) => void; tier: typeof BUDGET_TIERS[0] }) {
  return (
    <div>
      <StepHeader
        title="What's your investment budget?"
        subtitle="Set your comfortable range. We'll match properties within your parameters."
      />
      <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <motion.div
            key={budget[0]}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-foreground mb-1"
          >
            IDR {budget[0]}B
          </motion.div>
          <div className="text-sm text-muted-foreground">≈ USD ${Math.round(budget[0] * 62.7)}K</div>
        </div>

        <Slider value={budget} onValueChange={setBudget} min={1} max={20} step={0.5} className="mb-3" />

        <div className="flex justify-between text-[10px] text-muted-foreground mb-8">
          <span>IDR 1B</span>
          <span>IDR 20B+</span>
        </div>

        <motion.div
          key={tier.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/15 rounded-lg p-4 text-center"
        >
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs mb-2">{tier.label}</Badge>
          <p className="text-sm text-muted-foreground">{tier.desc}</p>
        </motion.div>
      </div>
    </div>
  );
}

/* ===================== STEP 3 — Location ===================== */
function StepLocation({ locations, toggle }: { locations: string[]; toggle: (id: string) => void }) {
  return (
    <div>
      <StepHeader
        title="Where would you like to invest?"
        subtitle="Select one or more regions. Our AI will prioritize these markets in your feed."
      />
      <div className="grid sm:grid-cols-2 gap-3">
        {LOCATION_OPTIONS.map((loc, i) => {
          const selected = locations.includes(loc.id);
          return (
            <motion.button
              key={loc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => toggle(loc.id)}
              className={cn(
                'text-left p-5 rounded-xl border-2 transition-all duration-200 relative',
                selected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    selected ? 'bg-primary/15 text-primary' : 'bg-accent text-muted-foreground'
                  )}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground mb-0.5 flex items-center gap-2">
                      {loc.label}
                      {loc.hot && <Badge variant="outline" className="text-[9px] text-primary border-primary/20">Trending</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">{loc.sub}</div>
                  </div>
                </div>
                {selected && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== STEP 4 — Risk ===================== */
function StepRisk({ risk, setRisk }: { risk: string; setRisk: (v: string) => void }) {
  return (
    <div>
      <StepHeader
        title="What's your risk appetite?"
        subtitle="This shapes how our AI ranks and surfaces opportunities for you."
      />
      <div className="space-y-3">
        {RISK_LEVELS.map((level, i) => {
          const selected = risk === level.id;
          return (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setRisk(level.id)}
              className={cn(
                'w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-start gap-4',
                selected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                selected ? 'bg-primary/15 text-primary' : 'bg-accent text-muted-foreground'
              )}>
                <level.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-foreground mb-0.5">{level.label}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{level.desc}</div>
              </div>
              {selected && <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== STEP 5 — AI Preview ===================== */
function StepAIPreview() {
  return (
    <div>
      <StepHeader
        title="Your AI intelligence is ready"
        subtitle="ASTRA AI is preparing your personalized opportunity intelligence."
      />

      {/* Loading shimmer effect */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-5 h-5"
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="text-sm font-semibold text-foreground">Curated for You</span>
          <Badge variant="outline" className="ml-auto text-[9px]">AI Selected</Badge>
        </div>

        <div className="space-y-3">
          {SAMPLE_LISTINGS.map((listing, i) => (
            <motion.div
              key={listing.title}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flex items-center gap-4 p-3 rounded-lg bg-accent/40"
            >
              <div className="w-14 h-14 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-muted-foreground/30" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{listing.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{listing.location}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-foreground">{listing.price}</div>
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-[10px] text-primary font-medium">{listing.yield}</span>
                  <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold">
                    <Zap className="w-2 h-2" />{listing.score}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-xs text-muted-foreground"
      >
        Based on your preferences, updated in real-time as the market evolves.
      </motion.div>
    </div>
  );
}

/* ===================== STEP 6 — Final CTA ===================== */
function StepFinal() {
  return (
    <div className="text-center py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Your smart property investing journey begins now
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          AI-powered insights, curated deals, and real-time market intelligence — all calibrated to your investment profile.
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
          {[
            { icon: Target, label: 'Personalized Feed' },
            { icon: BarChart3, label: 'Market Alerts' },
            { icon: Shield, label: 'AI Risk Analysis' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-accent/40"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-[10px] text-muted-foreground text-center">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ===================== Helpers ===================== */
function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-playfair text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
