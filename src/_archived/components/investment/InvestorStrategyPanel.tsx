import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import Price from '@/components/ui/Price';
import { useInvestorStrategy, InvestmentStrategy, StrategyInput } from '@/hooks/useInvestorStrategy';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, TrendingUp, Shield, Target, MapPin,
  Flame, BarChart3, Building2, ChevronDown, ChevronUp,
  PieChart, Wallet, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const riskColor = (risk: number) => {
  if (risk <= 40) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
  if (risk <= 65) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
  return 'text-destructive bg-destructive/10 border-destructive/30';
};

const riskLabel = (risk: number) => risk <= 40 ? 'Low Risk' : risk <= 65 ? 'Medium Risk' : 'High Risk';

function StrategyCard({ strategy, index }: { strategy: InvestmentStrategy; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const navigate = useNavigate();

  const strategyIcon = index === 0 ? TrendingUp : index === 1 ? Shield : index === 2 ? Wallet : PieChart;
  const Icon = strategyIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Card className={cn(
        'border-border/40 transition-all',
        index === 0 && 'border-primary/30 bg-primary/[0.02]'
      )}>
        {/* Header */}
        <div
          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
            index === 0 ? 'bg-primary/10' : 'bg-muted/50'
          )}>
            <Icon className={cn('h-4 w-4', index === 0 ? 'text-primary' : 'text-muted-foreground')} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold">{strategy.name}</h4>
              {index === 0 && (
                <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">Best</Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{strategy.properties.length} properties</p>
          </div>

          {/* Key Metrics */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-primary">{strategy.portfolio_roi}% ROI</p>
              <p className="text-[9px] text-muted-foreground"><Price amount={strategy.total_investment} short /></p>
            </div>
            <Badge className={cn('text-[9px] border', riskColor(strategy.avg_risk))}>
              {riskLabel(strategy.avg_risk)}
            </Badge>
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0 space-y-3">
                {/* Summary */}
                <p className="text-xs text-muted-foreground leading-relaxed">{strategy.strategy_summary}</p>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Total Investment', value: <Price amount={strategy.total_investment} short />, icon: Wallet },
                    { label: 'Portfolio ROI', value: `${strategy.portfolio_roi}%/yr`, icon: TrendingUp },
                    { label: 'Risk Score', value: `${strategy.avg_risk}/100`, icon: AlertTriangle },
                    { label: 'Diversification', value: `${strategy.diversification_score}%`, icon: PieChart },
                  ].map(m => (
                    <div key={m.label} className="p-2 rounded-lg bg-muted/20 border border-border/30 text-center">
                      <m.icon className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                      <p className="text-xs font-bold">{m.value}</p>
                      <p className="text-[9px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Properties */}
                <div className="space-y-1.5">
                  {strategy.properties.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/20 hover:border-primary/20 transition-colors cursor-pointer"
                      onClick={() => navigate(`/properties/${p.id}`)}
                    >
                      {p.image_url && (
                        <img src={p.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold truncate">{p.title}</p>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                          <MapPin className="h-2 w-2" /> {p.city}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[11px] font-bold text-primary"><Price amount={p.price} short /></p>
                        <div className="flex items-center gap-2 justify-end mt-0.5">
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                            <Target className="h-2 w-2" />{p.investment_score}
                          </span>
                          <span className="text-[9px] text-emerald-500 flex items-center gap-0.5">
                            <TrendingUp className="h-2 w-2" />+{p.forecast_growth}%
                          </span>
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                            <Flame className="h-2 w-2" />{p.rental_yield}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

const InvestorStrategyPanel: React.FC = () => {
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [investmentGoal, setInvestmentGoal] = useState<'capital_growth' | 'rental_yield' | 'both'>('both');
  const strategy = useInvestorStrategy();

  const handleGenerate = () => {
    const budgetNum = Number(budget.replace(/[^0-9]/g, ''));
    if (budgetNum <= 0) return;
    strategy.mutate({ budget: budgetNum, location, risk_level: riskLevel, investment_goal: investmentGoal });
  };

  const data = strategy.data;

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
            </div>
            ASTRA Investor Strategy Engine
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Generate optimal property portfolio strategies tailored to your goals
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px]">Budget (IDR)</Label>
              <Input
                placeholder="e.g. 10000000000"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Location (optional)</Label>
              <Input
                placeholder="e.g. Bali, Jakarta"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Risk Tolerance</Label>
              <Select value={riskLevel} onValueChange={v => setRiskLevel(v as any)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk (Conservative)</SelectItem>
                  <SelectItem value="medium">Medium Risk (Balanced)</SelectItem>
                  <SelectItem value="high">High Risk (Aggressive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Investment Goal</Label>
              <Select value={investmentGoal} onValueChange={v => setInvestmentGoal(v as any)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="capital_growth">Capital Growth</SelectItem>
                  <SelectItem value="rental_yield">Rental Yield</SelectItem>
                  <SelectItem value="both">Balanced (Both)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={strategy.isPending || !budget}
            className="w-full mt-4 gap-2"
          >
            {strategy.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate Strategies
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Summary Bar */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-muted-foreground">
                {data.candidates_scanned} properties scanned · {data.eligible_after_risk_filter} passed risk filter
              </span>
              <Badge variant="outline" className="text-[9px]">
                {data.strategies.length} strategies
              </Badge>
            </div>

            {/* Strategy Cards */}
            {data.strategies.length === 0 ? (
              <Card className="border-border/40">
                <CardContent className="p-8 text-center">
                  <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No strategies could be generated</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Try increasing budget or adjusting risk tolerance</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {data.strategies.map((s, i) => (
                  <StrategyCard key={s.name} strategy={s} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvestorStrategyPanel;
