import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortfolioBuilderResult } from '@/hooks/usePortfolioBuilder';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import { TrendingUp, Calendar, Banknote, ArrowRightLeft, Target } from 'lucide-react';

interface Props {
  result: PortfolioBuilderResult;
}

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const formatShort = (v: number) => {
  if (v >= 1e12) return `${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)}jt`;
  return v.toLocaleString('id-ID');
};

type ViewMode = 'net_worth' | 'rental_income' | 'exit_timing';

export default function InvestmentTimelineForecast({ result }: Props) {
  const [view, setView] = useState<ViewMode>('net_worth');
  const horizon = result.investment_horizon;

  const data = useMemo(() => {
    const portfolio = result.portfolio;
    if (!portfolio.length) return { netWorth: [], rentalIncome: [], exitTiming: [], refinanceYear: null };

    const totalInvested = result.total_allocated;
    const avgYield = result.weighted_yield / 100;
    const avgGrowth = portfolio.reduce((s, p) => s + p.estimated_growth, 0) / portfolio.length / 100;

    // Net worth trajectory
    const netWorth = [];
    let cumulativeRent = 0;
    for (let y = 0; y <= Math.min(horizon, 10); y++) {
      const propertyValue = totalInvested * Math.pow(1 + avgGrowth, y);
      const yearlyRent = propertyValue * avgYield * 0.85; // 15% vacancy+expenses
      cumulativeRent += y > 0 ? yearlyRent : 0;
      const expenses = y > 0 ? propertyValue * 0.015 : 0; // 1.5% annual maintenance+tax
      const netValue = propertyValue + cumulativeRent - (y > 0 ? expenses * y : 0);
      netWorth.push({
        year: `Y${y}`,
        propertyValue: Math.round(propertyValue),
        rentalIncome: Math.round(cumulativeRent),
        netWorth: Math.round(netValue),
        equity: Math.round(propertyValue - totalInvested * 0.7), // assuming 30% DP
      });
    }

    // Monthly rental income per property (simplified)
    const rentalIncome = portfolio.map(p => {
      const monthlyRent = (p.price * (p.estimated_yield / 100)) / 12;
      return {
        name: p.city.slice(0, 8),
        monthly: Math.round(monthlyRent),
        adjusted: Math.round(monthlyRent * 0.85), // vacancy adjusted
      };
    });

    // Exit timing analysis
    const exitTiming = [];
    const capitalGainsTaxRate = 0.025; // PPh final 2.5% on sale
    for (let y = 1; y <= Math.min(horizon, 10); y++) {
      const valueAtYear = totalInvested * Math.pow(1 + avgGrowth, y);
      const cumulativeRentAtYear = totalInvested * avgYield * 0.85 * y;
      const capitalGains = valueAtYear - totalInvested;
      const tax = valueAtYear * capitalGainsTaxRate;
      const netProfit = capitalGains + cumulativeRentAtYear - tax;
      const annualizedReturn = (Math.pow((valueAtYear + cumulativeRentAtYear) / totalInvested, 1 / y) - 1) * 100;

      exitTiming.push({
        year: `Y${y}`,
        netProfit: Math.round(netProfit),
        tax: Math.round(tax),
        annualizedReturn: Math.round(annualizedReturn * 10) / 10,
        optimal: y >= 5 && y <= 7,
      });
    }

    // Refinance opportunity: when equity > 50%
    const refinanceYear = netWorth.findIndex(d => d.equity > d.propertyValue * 0.5);

    return { netWorth, rentalIncome, exitTiming, refinanceYear: refinanceYear > 0 ? refinanceYear : null };
  }, [result, horizon]);

  const views: { key: ViewMode; label: string; icon: any }[] = [
    { key: 'net_worth', label: 'Net Worth', icon: TrendingUp },
    { key: 'rental_income', label: 'Rental Income', icon: Banknote },
    { key: 'exit_timing', label: 'Exit Timing', icon: Target },
  ];

  return (
    <Card className="bg-card/80 backdrop-blur border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Investment Timeline Forecast
          </span>
          <Badge variant="secondary" className="text-[10px]">{horizon}-Year Projection</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* View tabs */}
        <div className="flex gap-1.5">
          {views.map(v => (
            <Button
              key={v.key}
              size="sm"
              variant={view === v.key ? 'default' : 'outline'}
              className="h-7 text-[11px]"
              onClick={() => setView(v.key)}
            >
              <v.icon className="h-3 w-3 mr-1" /> {v.label}
            </Button>
          ))}
        </div>

        {/* Net Worth Trajectory */}
        {view === 'net_worth' && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.netWorth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatShort(v)} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => formatIDR(v)}
                />
                <Area type="monotone" dataKey="propertyValue" name="Property Value" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                <Area type="monotone" dataKey="rentalIncome" name="Cum. Rental" stackId="2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Rental Income */}
        {view === 'rental_income' && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.rentalIncome}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatShort(v)} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => formatIDR(v)}
                />
                <Bar dataKey="monthly" name="Gross/mo" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="adjusted" name="Net/mo" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Exit Timing */}
        {view === 'exit_timing' && (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.exitTiming}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatShort(v)} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number, name: string) => name === 'annualizedReturn' ? `${v}%` : formatIDR(v)}
                  />
                  <Bar dataKey="netProfit" name="Net Profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tax" name="Tax (PPh)" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.exitTiming.filter(d => d.optimal).map(d => (
                <Badge key={d.year} className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 border text-[10px]">
                  ✅ {d.year} — {d.annualizedReturn}% annualized return
                </Badge>
              ))}
            </div>
          </>
        )}

        {/* Refinance opportunity */}
        {data.refinanceYear && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-primary/5 rounded-lg px-3 py-2 border border-primary/20">
            <ArrowRightLeft className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <span>
              <strong className="text-foreground">Refinancing opportunity at Year {data.refinanceYear}</strong> — 
              Equity exceeds 50% of property value. Consider cash-out refinance to fund additional investments.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
