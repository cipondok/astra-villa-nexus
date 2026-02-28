import React, { useState } from 'react';
import { SavedScenario } from '@/hooks/useSavedScenarios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, GitCompareArrows, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCurrencyFormatter } from '@/stores/currencyStore';

const fmt = getCurrencyFormatter();

interface Props {
  scenarios: SavedScenario[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const ScenarioComparison: React.FC<Props> = ({ scenarios, onRemove, onClearAll }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const compared = scenarios.filter(s => selected.has(s.id));
  const isComparing = compared.length >= 2;

  // Find best values for highlighting
  const bestMonthly = isComparing ? Math.min(...compared.map(s => s.monthlyPayment)) : 0;
  const bestTotal = isComparing ? Math.min(...compared.map(s => s.totalPayment)) : 0;
  const bestInterest = isComparing ? Math.min(...compared.map(s => s.totalInterest)) : 0;
  const bestRate = isComparing ? Math.min(...compared.map(s => s.interestRate)) : 0;

  if (scenarios.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <GitCompareArrows className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">No saved scenarios yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Adjust the calculator above and click "Save Scenario" to start comparing
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Saved list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <GitCompareArrows className="h-5 w-5" />
                Saved Scenarios ({scenarios.length})
              </CardTitle>
              <CardDescription>
                Select 2 or more to compare side-by-side
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selected.size > 0 && (
                <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>
                  <X className="h-3 w-3 mr-1" /> Clear Selection
                </Button>
              )}
              <Button size="sm" variant="ghost" className="text-destructive" onClick={onClearAll}>
                <Trash2 className="h-3 w-3 mr-1" /> Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[300px]">
            <div className="grid gap-2">
              {scenarios.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                    selected.has(s.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => toggle(s.id)}
                >
                  <Checkbox
                    checked={selected.has(s.id)}
                    onCheckedChange={() => toggle(s.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{s.label}</span>
                      {s.bankName && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {s.bankName}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <span>DP {s.downPaymentPercent}%</span>
                      <span>{s.loanTermYears}yr</span>
                      <span>{s.interestRate}%</span>
                      <span className="font-mono">{fmt(s.monthlyPayment)}/mo</span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); onRemove(s.id); setSelected(prev => { const n = new Set(prev); n.delete(s.id); return n; }); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Comparison table */}
      {isComparing && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Side-by-Side Comparison
            </CardTitle>
            <CardDescription>
              <span className="text-chart-1 font-medium">■</span> Best value highlighted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px] sticky left-0 bg-background z-10">Metric</TableHead>
                    {compared.map(s => (
                      <TableHead key={s.id} className="min-w-[160px] text-center">
                        <div className="font-medium">{s.label}</div>
                        {s.bankName && <div className="text-xs font-normal text-muted-foreground">{s.bankName}</div>}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <ComparisonRow label="Property Price" values={compared.map(s => ({ v: s.propertyPrice, formatted: fmt(s.propertyPrice) }))} />
                  <ComparisonRow label="Down Payment" values={compared.map(s => ({ v: s.downPaymentPercent, formatted: `${s.downPaymentPercent}% (${fmt(s.downPayment)})` }))} />
                  <ComparisonRow label="Loan Amount" values={compared.map(s => ({ v: s.loanAmount, formatted: fmt(s.loanAmount) }))} />
                  <ComparisonRow label="Loan Term" values={compared.map(s => ({ v: s.loanTermYears, formatted: `${s.loanTermYears} years` }))} />
                  <ComparisonRow
                    label="Interest Rate"
                    values={compared.map(s => ({ v: s.interestRate, formatted: `${s.interestRate}%` }))}
                    bestValue={bestRate}
                    lowerIsBetter
                  />
                  <ComparisonRow
                    label="Monthly Payment"
                    values={compared.map(s => ({ v: s.monthlyPayment, formatted: fmt(s.monthlyPayment) }))}
                    bestValue={bestMonthly}
                    lowerIsBetter
                    highlight
                  />
                  <ComparisonRow
                    label="Total Payment"
                    values={compared.map(s => ({ v: s.totalPayment, formatted: fmt(s.totalPayment) }))}
                    bestValue={bestTotal}
                    lowerIsBetter
                  />
                  <ComparisonRow
                    label="Total Interest"
                    values={compared.map(s => ({ v: s.totalInterest, formatted: fmt(s.totalInterest) }))}
                    bestValue={bestInterest}
                    lowerIsBetter
                  />
                  <ComparisonRow
                    label="DTI Ratio"
                    values={compared.map(s => ({
                      v: s.affordabilityRatio ?? 999,
                      formatted: s.affordabilityRatio ? `${s.affordabilityRatio.toFixed(1)}%` : '—'
                    }))}
                    lowerIsBetter
                  />
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface ComparisonRowProps {
  label: string;
  values: { v: number; formatted: string }[];
  bestValue?: number;
  lowerIsBetter?: boolean;
  highlight?: boolean;
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({ label, values, bestValue, lowerIsBetter, highlight }) => {
  return (
    <TableRow className={highlight ? 'bg-primary/5' : ''}>
      <TableCell className="font-medium sticky left-0 bg-background z-10">{label}</TableCell>
      {values.map((val, i) => {
        const isBest = bestValue !== undefined && Math.abs(val.v - bestValue) < 0.01;
        return (
          <TableCell key={i} className={cn("text-center font-mono text-sm", isBest && "text-chart-1 font-semibold")}>
            {val.formatted}
            {isBest && <span className="ml-1 text-[10px]">✦</span>}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

export default ScenarioComparison;
