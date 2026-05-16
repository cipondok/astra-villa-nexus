import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowRight, ArrowLeft, CheckCircle2, TrendingUp,
  MapPin, Building2, Wallet, Target, Sparkles
} from 'lucide-react';

const cities = ['Bali', 'Jakarta', 'Surabaya', 'Bandung', 'Yogyakarta', 'Lombok', 'Semarang', 'Labuan Bajo'];
const propertyTypes = ['Villa', 'Apartment', 'House', 'Commercial', 'Land'];
const budgetRanges = [
  { label: '< Rp 2B', min: 0, max: 2_000_000_000 },
  { label: 'Rp 2-5B', min: 2_000_000_000, max: 5_000_000_000 },
  { label: 'Rp 5-15B', min: 5_000_000_000, max: 15_000_000_000 },
  { label: 'Rp 15B+', min: 15_000_000_000, max: 100_000_000_000 },
];
const goals = ['Capital Growth', 'Rental Income', 'Holiday Home', 'Portfolio Diversification'];
const riskLevels = [
  { value: 'conservative', label: 'Conservative', desc: 'Stable yields, lower risk' },
  { value: 'moderate', label: 'Moderate', desc: 'Balanced growth & income' },
  { value: 'aggressive', label: 'Aggressive', desc: 'High growth potential' },
];

const InvestorOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState<{ min: number; max: number } | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [risk, setRisk] = useState('moderate');
  const [saving, setSaving] = useState(false);

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return selectedCities.length > 0 && selectedTypes.length > 0;
    if (step === 2) return budget !== null && selectedGoals.length > 0;
    return true;
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await (supabase as any).from('investor_preferences').insert({
        user_id: user?.id ?? null,
        preferred_cities: selectedCities,
        preferred_property_types: selectedTypes,
        budget_min: budget?.min ?? 0,
        budget_max: budget?.max ?? 0,
        investment_goals: selectedGoals,
        risk_tolerance: risk,
        experience_level: 'beginner',
        completed_at: new Date().toISOString(),
      });
      toast({ title: 'Profile created!', description: 'Your investment preferences are saved.' });
      navigate('/search');
    } catch {
      toast({ title: 'Error', description: 'Could not save preferences.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-8 h-8 text-gold-primary" />
      </div>
      <h2 className="font-playfair text-3xl md:text-4xl font-bold text-titanium-white mb-4">
        Welcome to ASTRA
      </h2>
      <p className="font-inter text-text-muted leading-relaxed mb-2">
        Tell us about your investment preferences and we'll curate opportunities matched to your goals.
      </p>
      <p className="font-inter text-xs text-text-muted/60">Takes less than 60 seconds</p>
    </div>,

    // Step 1: Location & Type
    <div key="prefs" className="max-w-xl mx-auto">
      <h2 className="font-playfair text-2xl font-bold text-titanium-white mb-2 text-center">Where & What</h2>
      <p className="font-inter text-sm text-text-muted text-center mb-8">Select your preferred cities and property types</p>

      <div className="mb-8">
        <label className="font-inter text-xs uppercase tracking-widest text-gold-primary mb-3 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" /> Preferred Cities
        </label>
        <div className="flex flex-wrap gap-2">
          {cities.map(c => (
            <button key={c} onClick={() => toggle(selectedCities, c, setSelectedCities)}
              className={`px-4 py-2 rounded-xl text-sm font-inter font-medium border transition-all ${
                selectedCities.includes(c)
                  ? 'bg-gold-primary/20 border-gold-primary/40 text-gold-primary'
                  : 'bg-card/5 border-border/15 text-text-muted hover:border-gold-primary/20'
              }`}>{c}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-inter text-xs uppercase tracking-widest text-gold-primary mb-3 flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5" /> Property Types
        </label>
        <div className="flex flex-wrap gap-2">
          {propertyTypes.map(t => (
            <button key={t} onClick={() => toggle(selectedTypes, t, setSelectedTypes)}
              className={`px-4 py-2 rounded-xl text-sm font-inter font-medium border transition-all ${
                selectedTypes.includes(t)
                  ? 'bg-gold-primary/20 border-gold-primary/40 text-gold-primary'
                  : 'bg-card/5 border-border/15 text-text-muted hover:border-gold-primary/20'
              }`}>{t}</button>
          ))}
        </div>
      </div>
    </div>,

    // Step 2: Budget & Goals
    <div key="budget" className="max-w-xl mx-auto">
      <h2 className="font-playfair text-2xl font-bold text-titanium-white mb-2 text-center">Budget & Goals</h2>
      <p className="font-inter text-sm text-text-muted text-center mb-8">Help us match you with the right opportunities</p>

      <div className="mb-8">
        <label className="font-inter text-xs uppercase tracking-widest text-gold-primary mb-3 flex items-center gap-2">
          <Wallet className="w-3.5 h-3.5" /> Investment Budget
        </label>
        <div className="grid grid-cols-2 gap-3">
          {budgetRanges.map(b => (
            <button key={b.label} onClick={() => setBudget({ min: b.min, max: b.max })}
              className={`px-4 py-3 rounded-xl text-sm font-inter font-medium border transition-all ${
                budget?.min === b.min
                  ? 'bg-gold-primary/20 border-gold-primary/40 text-gold-primary'
                  : 'bg-card/5 border-border/15 text-text-muted hover:border-gold-primary/20'
              }`}>{b.label}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-inter text-xs uppercase tracking-widest text-gold-primary mb-3 flex items-center gap-2">
          <Target className="w-3.5 h-3.5" /> Investment Goals
        </label>
        <div className="flex flex-wrap gap-2">
          {goals.map(g => (
            <button key={g} onClick={() => toggle(selectedGoals, g, setSelectedGoals)}
              className={`px-4 py-2 rounded-xl text-sm font-inter font-medium border transition-all ${
                selectedGoals.includes(g)
                  ? 'bg-gold-primary/20 border-gold-primary/40 text-gold-primary'
                  : 'bg-card/5 border-border/15 text-text-muted hover:border-gold-primary/20'
              }`}>{g}</button>
          ))}
        </div>
      </div>
    </div>,

    // Step 3: Risk & Finish
    <div key="risk" className="max-w-xl mx-auto">
      <h2 className="font-playfair text-2xl font-bold text-titanium-white mb-2 text-center">Risk Profile</h2>
      <p className="font-inter text-sm text-text-muted text-center mb-8">Choose your investment style</p>

      <div className="space-y-3 mb-8">
        {riskLevels.map(r => (
          <button key={r.value} onClick={() => setRisk(r.value)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all text-left ${
              risk === r.value
                ? 'bg-gold-primary/15 border-gold-primary/40'
                : 'bg-card/5 border-border/15 hover:border-gold-primary/20'
            }`}>
            <div>
              <p className={`font-inter text-sm font-semibold ${risk === r.value ? 'text-gold-primary' : 'text-titanium-white'}`}>{r.label}</p>
              <p className="font-inter text-xs text-text-muted">{r.desc}</p>
            </div>
            {risk === r.value && <CheckCircle2 className="w-5 h-5 text-gold-primary" />}
          </button>
        ))}
      </div>

      <div className="text-center p-5 rounded-xl border border-gold-primary/15 bg-gold-primary/5">
        <TrendingUp className="w-6 h-6 text-gold-primary mx-auto mb-2" />
        <p className="font-inter text-sm text-titanium-white font-medium">You're all set!</p>
        <p className="font-inter text-xs text-text-muted mt-1">We'll curate deals matching your {risk} profile across {selectedCities.length || 'all'} cities.</p>
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-astra-navy-dark flex flex-col">
      {/* Progress */}
      <div className="w-full px-4 pt-6">
        <div className="max-w-xl mx-auto flex gap-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-gold-primary' : 'bg-border/15'}`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-8">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="text-text-muted hover:text-titanium-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate('/')} className="text-text-muted hover:text-titanium-white">
              Skip
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-gold-primary to-astra-gold-muted text-astra-navy-dark font-semibold px-6 rounded-xl"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={saving}
              className="bg-gradient-to-r from-gold-primary to-astra-gold-muted text-astra-navy-dark font-semibold px-6 rounded-xl"
            >
              {saving ? 'Saving…' : 'View My Opportunities'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorOnboarding;
