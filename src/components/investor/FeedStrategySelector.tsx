import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  useInvestorFeedPreferences,
  useSaveInvestorPreferences,
  STRATEGY_PRESETS,
  StrategyType,
} from '@/hooks/useInvestorFeedPreferences';
import {
  Sparkles, TrendingUp, DollarSign, Zap, Shield,
  Settings2, Save, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';

const STRATEGY_ICONS: Record<StrategyType, any> = {
  aggressive_growth: TrendingUp,
  passive_income: DollarSign,
  short_term_flip: Zap,
  luxury_preservation: Shield,
};

export default function FeedStrategySelector() {
  const { data: prefs, isLoading } = useInvestorFeedPreferences();
  const saveMutation = useSaveInvestorPreferences();
  const [strategy, setStrategy] = useState<StrategyType>('passive_income');
  const [weights, setWeights] = useState({ yield: 25, appreciation: 25, deal: 25, liquidity: 25 });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (prefs) {
      setStrategy(prefs.strategy_type as StrategyType);
      setWeights({
        yield: Number(prefs.weight_rental_yield),
        appreciation: Number(prefs.weight_appreciation),
        deal: Number(prefs.weight_deal_score),
        liquidity: Number(prefs.weight_liquidity),
      });
    }
  }, [prefs]);

  const selectStrategy = (s: StrategyType) => {
    setStrategy(s);
    setWeights(STRATEGY_PRESETS[s].weights);
  };

  const handleSave = () => {
    saveMutation.mutate({
      strategy_type: strategy,
      weight_rental_yield: weights.yield,
      weight_appreciation: weights.appreciation,
      weight_deal_score: weights.deal,
      weight_liquidity: weights.liquidity,
    });
  };

  if (isLoading) return null;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Investment Strategy</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setShowAdvanced(o => !o)}
            >
              <Settings2 className="h-3 w-3 mr-1" />
              {showAdvanced ? 'Simple' : 'Advanced'}
              {showAdvanced ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
              Save
            </Button>
          </div>
        </div>

        {/* Strategy preset buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          {(Object.entries(STRATEGY_PRESETS) as [StrategyType, typeof STRATEGY_PRESETS[StrategyType]][]).map(([key, preset]) => {
            const Icon = STRATEGY_ICONS[key];
            const isActive = strategy === key;
            return (
              <button
                key={key}
                onClick={() => selectStrategy(key)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                    : 'border-border bg-background hover:border-primary/40'
                }`}
              >
                <Icon className={`h-4 w-4 mb-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-xs font-semibold text-foreground">{preset.label}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{preset.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Weight distribution summary */}
        <div className="flex gap-1.5 mb-2">
          {[
            { key: 'yield', label: 'Yield', color: 'bg-emerald-500' },
            { key: 'appreciation', label: 'Growth', color: 'bg-blue-500' },
            { key: 'deal', label: 'Deal', color: 'bg-amber-500' },
            { key: 'liquidity', label: 'Liquid', color: 'bg-purple-500' },
          ].map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[10px] text-muted-foreground">{label}: {weights[key as keyof typeof weights]}%</span>
            </div>
          ))}
        </div>

        {/* Weight bar visualization */}
        <div className="h-2 rounded-full overflow-hidden flex mb-1">
          <div className="bg-emerald-500 transition-all" style={{ width: `${weights.yield}%` }} />
          <div className="bg-blue-500 transition-all" style={{ width: `${weights.appreciation}%` }} />
          <div className="bg-amber-500 transition-all" style={{ width: `${weights.deal}%` }} />
          <div className="bg-purple-500 transition-all" style={{ width: `${weights.liquidity}%` }} />
        </div>

        {/* Advanced weight sliders */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {[
                  { key: 'yield' as const, label: 'Rental Yield Weight', color: 'text-emerald-400' },
                  { key: 'appreciation' as const, label: 'Appreciation Weight', color: 'text-blue-400' },
                  { key: 'deal' as const, label: 'Deal Score Weight', color: 'text-amber-400' },
                  { key: 'liquidity' as const, label: 'Liquidity Weight', color: 'text-purple-400' },
                ].map(({ key, label, color }) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className={`text-xs ${color}`}>{label}</Label>
                      <Badge variant="secondary" className="text-[10px]">{weights[key]}%</Badge>
                    </div>
                    <Slider
                      value={[weights[key]]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={([v]) => setWeights(w => ({ ...w, [key]: v }))}
                    />
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground text-center">
                  Total: {weights.yield + weights.appreciation + weights.deal + weights.liquidity}%
                  {weights.yield + weights.appreciation + weights.deal + weights.liquidity !== 100 && (
                    <span className="text-destructive ml-1">(should equal 100%)</span>
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
