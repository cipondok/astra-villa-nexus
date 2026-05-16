import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavedScenarios, SavedScenario } from '@/hooks/useSavedScenarios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Banknote, Trash2, Calculator, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import Price from '@/components/ui/Price';
import { motion } from 'framer-motion';

const KprScenariosTab = () => {
  const navigate = useNavigate();
  const { scenarios, removeScenario, clearAll } = useSavedScenarios();

  const getAffordabilityColor = (ratio?: number) => {
    if (!ratio) return 'text-muted-foreground';
    if (ratio <= 30) return 'text-chart-1';
    if (ratio <= 40) return 'text-gold-primary';
    return 'text-destructive';
  };

  const getAffordabilityLabel = (ratio?: number) => {
    if (!ratio) return null;
    if (ratio <= 30) return 'Comfortable';
    if (ratio <= 40) return 'Moderate';
    return 'Stretched';
  };

  if (!scenarios.length) {
    return (
      <Card className="backdrop-blur-xl bg-card/60 border-gold-primary/10">
        <CardContent className="p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-gold-primary/10 flex items-center justify-center mx-auto mb-3">
            <Calculator className="h-6 w-6 text-gold-primary/50" />
          </div>
          <h3 className="text-sm font-semibold mb-1">No KPR scenarios</h3>
          <p className="text-xs text-muted-foreground mb-3">Use the KPR calculator to simulate mortgage scenarios and save them for comparison</p>
          <Button size="sm" onClick={() => navigate('/kpr-calculator')} className="h-7 text-xs bg-gradient-to-r from-gold-primary to-gold-primary/80 text-background hover:from-gold-primary/90 hover:to-gold-primary/70">
            <Calculator className="h-3 w-3 mr-1" />
            Open Calculator
          </Button>
        </CardContent>
      </Card>
    );
  }

  const lowestMonthly = Math.min(...scenarios.map(s => s.monthlyPayment));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{scenarios.length} saved scenarios</p>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-6 text-[10px] border-gold-primary/20 text-gold-primary hover:bg-gold-primary/5" onClick={() => navigate('/kpr-calculator')}>
            <Calculator className="h-2.5 w-2.5 mr-0.5" />New
          </Button>
          {scenarios.length > 1 && (
            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive hover:text-destructive" onClick={clearAll}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {scenarios.map((scenario, i) => (
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="backdrop-blur-xl bg-card/60 border-gold-primary/10 hover:shadow-md hover:shadow-gold-primary/5 hover:border-gold-primary/25 transition-all duration-300">
            <CardContent className="p-2.5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="h-4 w-4 rounded bg-gold-primary/10 flex items-center justify-center flex-shrink-0">
                      <Banknote className="h-2.5 w-2.5 text-gold-primary" />
                    </div>
                    <h4 className="text-[11px] font-semibold truncate">
                      {scenario.label || `Scenario ${i + 1}`}
                    </h4>
                    {scenario.monthlyPayment === lowestMonthly && scenarios.length > 1 && (
                      <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5 text-gold-primary border-gold-primary/30 bg-gold-primary/5">
                        Best
                      </Badge>
                    )}
                  </div>
                  {scenario.bankName && (
                    <p className="text-[9px] text-muted-foreground">
                      {scenario.bankName} {scenario.rateName ? `— ${scenario.rateName}` : ''}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-destructive hover:text-destructive flex-shrink-0"
                  onClick={() => removeScenario(scenario.id)}
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-muted/30 rounded p-1.5">
                  <p className="text-[7px] text-muted-foreground uppercase tracking-wide">Property</p>
                  <p className="text-[10px] font-bold"><Price amount={scenario.propertyPrice} short /></p>
                </div>
                <div className="bg-gold-primary/5 rounded p-1.5 border border-gold-primary/10">
                  <p className="text-[7px] text-muted-foreground uppercase tracking-wide">Monthly</p>
                  <p className="text-[10px] font-bold text-gold-primary"><Price amount={scenario.monthlyPayment} short /></p>
                </div>
                <div className="bg-muted/30 rounded p-1.5">
                  <p className="text-[7px] text-muted-foreground uppercase tracking-wide">DP ({scenario.downPaymentPercent}%)</p>
                  <p className="text-[10px] font-semibold"><Price amount={scenario.downPayment} short /></p>
                </div>
                <div className="bg-muted/30 rounded p-1.5">
                  <p className="text-[7px] text-muted-foreground uppercase tracking-wide">Rate / Term</p>
                  <p className="text-[10px] font-semibold">{scenario.interestRate}% / {scenario.loanTermYears}yr</p>
                </div>
              </div>

              {scenario.affordabilityRatio != null && (
                <div className="flex items-center gap-1.5 mt-1.5 p-1 bg-gold-primary/5 rounded border border-gold-primary/10">
                  {scenario.affordabilityRatio <= 30 ? (
                    <TrendingDown className="h-3 w-3 text-chart-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-destructive" />
                  )}
                  <span className={`text-[9px] font-medium ${getAffordabilityColor(scenario.affordabilityRatio)}`}>
                    DTI: {scenario.affordabilityRatio.toFixed(1)}% — {getAffordabilityLabel(scenario.affordabilityRatio)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[7px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="h-2 w-2" />
                  Total interest: <Price amount={scenario.totalInterest} short />
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default KprScenariosTab;
