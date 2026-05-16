import { useState, useMemo } from 'react';
import { useMortgageInvestmentSimulator } from '@/hooks/useMortgageInvestmentSimulator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calculator, TrendingUp, TrendingDown, DollarSign, Home,
  BarChart3, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Minus,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Area, AreaChart,
} from 'recharts';

const VERDICT_CONFIG: Record<string, { color: string; icon: typeof CheckCircle2; bg: string }> = {
  excellent: { color: 'text-emerald-500', icon: CheckCircle2, bg: 'bg-emerald-500/10 border-emerald-500/20' },
  good: { color: 'text-green-500', icon: CheckCircle2, bg: 'bg-green-500/10 border-green-500/20' },
  fair: { color: 'text-amber-500', icon: AlertTriangle, bg: 'bg-amber-500/10 border-amber-500/20' },
  poor: { color: 'text-destructive', icon: XCircle, bg: 'bg-destructive/10 border-destructive/20' },
  neutral: { color: 'text-muted-foreground', icon: Minus, bg: 'bg-muted/30 border-border' },
};

const formatIDR = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
const formatShort = (v: number) => v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1e3).toFixed(0)}K`;

interface Props {
  propertyPrice?: number;
  propertyId?: string;
}

const MortgageInvestmentSimulator = ({ propertyPrice: initialPrice, propertyId }: Props) => {
  const [price, setPrice] = useState(initialPrice || 2_000_000_000);
  const [dpPercent, setDpPercent] = useState(20);
  const [rate, setRate] = useState(8);
  const [term, setTerm] = useState(20);

  const input = useMemo(() => ({
    property_price: price,
    down_payment_percent: dpPercent,
    interest_rate: rate,
    loan_term_years: term,
    property_id: propertyId,
  }), [price, dpPercent, rate, term, propertyId]);

  const { data, isLoading } = useMortgageInvestmentSimulator(input);

  const verdictCfg = data ? (VERDICT_CONFIG[data.verdict] || VERDICT_CONFIG.neutral) : VERDICT_CONFIG.neutral;
  const VerdictIcon = verdictCfg.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mortgage & Investment Simulator</h2>
          <p className="text-sm text-muted-foreground">Analyze financing options, cashflow & ROI projections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="bg-card/60 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="w-4 h-4 text-primary" /> Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Property Price (IDR)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className="text-sm"
              />
              <p className="text-[10px] text-muted-foreground">{formatIDR(price)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Down Payment</span>
                <span className="font-semibold text-foreground">{dpPercent}%</span>
              </div>
              <Slider value={[dpPercent]} onValueChange={([v]) => setDpPercent(v)} min={10} max={50} step={5} />
              <p className="text-[10px] text-muted-foreground">{formatIDR(price * dpPercent / 100)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Interest Rate</span>
                <span className="font-semibold text-foreground">{rate}%</span>
              </div>
              <Slider value={[rate]} onValueChange={([v]) => setRate(v)} min={3} max={15} step={0.25} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Loan Term</span>
                <span className="font-semibold text-foreground">{term} years</span>
              </div>
              <Slider value={[term]} onValueChange={([v]) => setTerm(v)} min={5} max={30} step={5} />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-64" />
            </div>
          ) : data ? (
            <>
              {/* Verdict Banner */}
              <Card className={`border ${verdictCfg.bg}`}>
                <CardContent className="py-4 flex items-center gap-4">
                  <VerdictIcon className={`w-8 h-8 ${verdictCfg.color}`} />
                  <div className="flex-1">
                    <p className={`text-lg font-bold ${verdictCfg.color}`}>{data.verdict_label}</p>
                    <p className="text-xs text-muted-foreground">
                      DSCR: {data.dscr}x · CoC Return: {data.cash_on_cash_return}%
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${verdictCfg.color}`}>
                    {data.cashflow_status === 'positive' ? '+' : ''}{formatIDR(data.net_monthly_cashflow)}/mo
                  </Badge>
                </CardContent>
              </Card>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Loan Amount', value: formatIDR(data.loan_amount), icon: DollarSign, sub: `${data.down_payment_percent}% DP` },
                  { label: 'Monthly Payment', value: formatIDR(data.monthly_payment), icon: Calculator, sub: `${data.interest_rate}% for ${data.loan_term_years}yr` },
                  { label: 'Monthly Rent', value: formatIDR(data.monthly_rent), icon: Home, sub: `Yield: ${data.rental_yield_percent}%` },
                  {
                    label: 'Net Cashflow',
                    value: formatIDR(data.net_monthly_cashflow),
                    icon: data.net_monthly_cashflow >= 0 ? TrendingUp : TrendingDown,
                    sub: `Break-even: ${formatIDR(data.break_even_rent)}`,
                  },
                ].map((kpi, i) => (
                  <Card key={i} className="bg-card/50">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <kpi.icon className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{kpi.label}</span>
                      </div>
                      <p className="text-sm font-bold text-foreground">{kpi.value}</p>
                      <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Equity & Value Chart */}
                <Card className="bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> 10-Year Projection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={data.yearly_projection} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                        <defs>
                          <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v) => `Y${v}`} />
                        <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v) => formatShort(v)} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                          formatter={(v: number, name: string) => [formatIDR(v), name]}
                        />
                        <Area type="monotone" dataKey="equity" name="Equity" stroke="hsl(var(--primary))" fill="url(#equityGrad)" strokeWidth={2} />
                        <Line type="monotone" dataKey="property_value" name="Property Value" stroke="hsl(var(--chart-2))" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="remaining_balance" name="Loan Balance" stroke="hsl(var(--destructive))" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Cashflow Chart */}
                <Card className="bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" /> Annual Cashflow
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={data.yearly_projection} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v) => `Y${v}`} />
                        <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v) => formatShort(v)} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                          formatter={(v: number) => [formatIDR(v), 'Cashflow']}
                        />
                        <Bar dataKey="annual_cashflow" name="Annual Cashflow" radius={[4, 4, 0, 0]} barSize={24}>
                          {data.yearly_projection.map((entry, i) => (
                            <Cell key={i} fill={entry.annual_cashflow >= 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--destructive))'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* ROI Timeline */}
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Total ROI (%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data.yearly_projection} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v) => `Year ${v}`} />
                      <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                        formatter={(v: number) => [`${v}%`, 'Total ROI']}
                      />
                      <Line type="monotone" dataKey="total_roi" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Rate Sensitivity */}
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" /> Interest Rate Sensitivity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {data.rate_scenarios.map((s) => (
                      <div
                        key={s.interest_rate}
                        className={`rounded-lg p-3 text-center border ${
                          s.interest_rate === data.interest_rate
                            ? 'border-primary bg-primary/5'
                            : 'border-border/30 bg-muted/20'
                        }`}
                      >
                        <p className="text-xs font-bold text-foreground">{s.interest_rate}%</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Payment</p>
                        <p className="text-xs font-semibold text-foreground">{formatShort(s.monthly_payment)}</p>
                        <Separator className="my-1.5" />
                        <p className="text-[10px] text-muted-foreground">Cashflow</p>
                        <p className={`text-xs font-bold ${s.cashflow_status === 'positive' ? 'text-emerald-500' : 'text-destructive'}`}>
                          {s.net_cashflow >= 0 ? '+' : ''}{formatShort(s.net_cashflow)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Total Payment</p>
                  <p className="text-sm font-bold text-foreground">{formatIDR(data.total_payment)}</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Total Interest</p>
                  <p className="text-sm font-bold text-destructive">{formatIDR(data.total_interest)}</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Rent Source</p>
                  <p className="text-sm font-medium text-foreground">{data.rent_source.replace(/_/g, ' ')}</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">10Y ROI</p>
                  <p className="text-sm font-bold text-primary">
                    {data.yearly_projection[data.yearly_projection.length - 1]?.total_roi || 0}%
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MortgageInvestmentSimulator;
