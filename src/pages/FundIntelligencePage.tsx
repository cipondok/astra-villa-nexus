import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain, TrendingUp, Shield, Target, DollarSign, BarChart3, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Timer, Wallet, PieChart, Activity, Zap,
  Globe, Building2, RefreshCw, ChevronRight, Loader2, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, PieChart as RePieChart, Pie, Cell, Area, AreaChart, Legend
} from 'recharts';
import {
  useCapitalAllocation, usePortfolioRebalancing, useEntryTiming,
  useExitStrategy, useWealthSimulation, useDealReadiness,
  type CapitalAllocationResult, type RebalancingResult,
  type EntryTimingResult, type ExitStrategyResult,
  type WealthSimulationResult, type DealReadinessResult,
} from '@/hooks/useFundIntelligence';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--accent))'];

const severityColors: Record<string, string> = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-muted text-muted-foreground',
};

function formatCurrency(n: number) {
  if (n >= 1e12) return `Rp ${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)}M`;
  return `Rp ${n.toLocaleString()}`;
}

// ── Capital Allocation Tab ──
function CapitalAllocationTab() {
  const mutation = useCapitalAllocation();
  const [budget, setBudget] = useState(5_000_000_000);
  const [risk, setRisk] = useState('balanced');
  const result = mutation.data as CapitalAllocationResult | undefined;

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Capital Allocation Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Investment Budget</Label>
              <Input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">{formatCurrency(budget)}</p>
            </div>
            <div className="space-y-2">
              <Label>Risk Preference</Label>
              <Select value={risk} onValueChange={setRisk}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => mutation.mutate({ budget, risk_preference: risk })} disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><Brain className="h-4 w-4 mr-2" /> Generate Allocation Strategy</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Expected Return</p>
                <p className="text-2xl font-bold text-primary">{result.expected_annual_return}%</p>
              </CardContent>
            </Card>
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Volatility</p>
                <p className="text-2xl font-bold">{result.portfolio_volatility}%</p>
              </CardContent>
            </Card>
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">10Y Growth</p>
                <p className="text-2xl font-bold text-emerald-500">{formatCurrency(result.wealth_growth_10y)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold">{result.confidence_score}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card/60 border-border/40">
              <CardHeader><CardTitle className="text-sm">Allocation Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RePieChart>
                    <Pie data={result.allocation_matrix} dataKey="allocation_pct" nameKey="city" cx="50%" cy="50%" outerRadius={100} label={({ city, allocation_pct }) => `${city} ${allocation_pct}%`}>
                      {result.allocation_matrix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-card/60 border-border/40">
              <CardHeader><CardTitle className="text-sm">City Metrics</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={result.allocation_matrix}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="city" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip />
                    <Bar dataKey="expected_yield" name="Yield %" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expected_growth" name="Growth %" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ── Portfolio Rebalancing Tab ──
function RebalancingTab() {
  const mutation = usePortfolioRebalancing();
  const result = mutation.data as RebalancingResult | undefined;

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="h-5 w-5 text-primary" />
            Portfolio Rebalancing Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Analyzes your watchlisted properties for concentration risk, underperformers, and new opportunities.</p>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning Portfolio...</> : <><Activity className="h-4 w-4 mr-2" /> Analyze Portfolio</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-card/60"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Portfolio Value</p><p className="text-xl font-bold">{formatCurrency(result.total_portfolio_value)}</p></CardContent></Card>
            <Card className="bg-card/60"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Properties</p><p className="text-xl font-bold">{result.property_count}</p></CardContent></Card>
            <Card className="bg-card/60"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Urgency</p><Badge className={result.rebalancing_urgency === 'critical' ? 'bg-destructive' : result.rebalancing_urgency === 'high' ? 'bg-orange-500' : 'bg-emerald-500'}>{result.rebalancing_urgency}</Badge></CardContent></Card>
          </div>

          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Signals ({result.signals.length})</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {result.signals.map((s, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/40 bg-background/50">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">{s.signal_type.replace(/_/g, ' ')}</Badge>
                        <Badge className={severityColors[s.severity] || 'bg-muted'}>{s.severity}</Badge>
                      </div>
                      <p className="text-sm mt-1">{s.reasoning}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">{s.action}</Badge>
                        {s.expected_impact_pct > 0 && <span className="text-xs text-muted-foreground">Impact: +{s.expected_impact_pct}%</span>}
                      </div>
                    </div>
                  ))}
                  {result.signals.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Portfolio is well balanced. No rebalancing needed.</p>}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ── Entry Timing Tab ──
function EntryTimingTab() {
  const mutation = useEntryTiming();
  const [city, setCity] = useState('all');
  const result = mutation.data as EntryTimingResult | undefined;

  const signalColors: Record<string, string> = {
    acquisition_window: 'text-emerald-500',
    pre_launch_arb: 'text-primary',
    distress_sale: 'text-orange-400',
    correction_entry: 'text-chart-2',
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Target className="h-5 w-5 text-primary" /> Entry Timing Engine</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Target City</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Yogyakarta', 'Dubai', 'Singapore', 'Bangkok'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => mutation.mutate({ city })} disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</> : <><Timer className="h-4 w-4 mr-2" /> Find Entry Windows</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {result.top_opportunity && (
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2"><Sparkles className="h-5 w-5 text-primary" /><span className="font-semibold">Top Opportunity: {result.top_opportunity.city}</span></div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Confidence:</span> <strong>{result.top_opportunity.timing_confidence}%</strong></div>
                  <div><span className="text-muted-foreground">Upside:</span> <strong>{result.top_opportunity.upside_multiplier}x</strong></div>
                  <div><span className="text-muted-foreground">Momentum:</span> <strong>{result.top_opportunity.price_momentum}%</strong></div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm">Entry Signal Confidence</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={result.entry_signals.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                  <Tooltip />
                  <Bar dataKey="timing_confidence" name="Confidence %" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ── Wealth Simulator Tab ──
function WealthSimulatorTab() {
  const mutation = useWealthSimulation();
  const [persona, setPersona] = useState('balanced');
  const [capital, setCapital] = useState(1_000_000_000);
  const [monthly, setMonthly] = useState(10_000_000);
  const [years, setYears] = useState(10);
  const result = mutation.data as WealthSimulationResult | undefined;

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Wallet className="h-5 w-5 text-primary" /> Wealth Simulation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Investor Persona</Label>
              <Select value={persona} onValueChange={setPersona}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Initial Capital</Label><Input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} /><p className="text-xs text-muted-foreground">{formatCurrency(capital)}</p></div>
            <div className="space-y-2"><Label>Monthly Contribution</Label><Input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} /><p className="text-xs text-muted-foreground">{formatCurrency(monthly)}</p></div>
            <div className="space-y-2"><Label>Projection Years: {years}</Label><Slider min={5} max={30} step={1} value={[years]} onValueChange={v => setYears(v[0])} /></div>
          </div>
          <Button onClick={() => mutation.mutate({ persona, initial_capital: capital, monthly_contribution: monthly, projection_years: years })} disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Simulating...</> : <><BarChart3 className="h-4 w-4 mr-2" /> Run Monte Carlo Simulation</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-card/60"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Expected Net Worth</p><p className="text-xl font-bold text-primary">{formatCurrency(result.final_net_worth.expected)}</p></CardContent></Card>
            <Card className="bg-card/60"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total Return</p><p className="text-xl font-bold text-emerald-500">{result.total_return_pct}%</p></CardContent></Card>
            <Card className="bg-card/60"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Sharpe Ratio</p><p className="text-xl font-bold">{result.sharpe_ratio}</p></CardContent></Card>
            <Card className="bg-card/60"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Max Drawdown</p><p className="text-xl font-bold text-destructive">{result.max_drawdown_pct}%</p></CardContent></Card>
          </div>

          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm">Net Worth Trajectory</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={result.net_worth_trajectory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tickFormatter={(v) => `${(v / 1e9).toFixed(0)}B`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Area type="monotone" dataKey="net_worth" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="cumulative_invested" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted) / 0.2)" strokeWidth={1} strokeDasharray="5 5" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card/60 border-border/40">
              <CardHeader><CardTitle className="text-sm">Cashflow Evolution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.cashflow_curve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="net_cashflow" name="Net Cashflow" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-card/60 border-border/40">
              <CardHeader><CardTitle className="text-sm">Outcome Range</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Pessimistic (P10)</span><span className="text-destructive font-medium">{formatCurrency(result.final_net_worth.pessimistic)}</span></div><Progress value={Math.min(100, (result.final_net_worth.pessimistic / result.final_net_worth.optimistic) * 100)} className="h-2" /></div>
                <div className="space-y-1"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Expected (P50)</span><span className="text-primary font-medium">{formatCurrency(result.final_net_worth.expected)}</span></div><Progress value={Math.min(100, (result.final_net_worth.expected / result.final_net_worth.optimistic) * 100)} className="h-2" /></div>
                <div className="space-y-1"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Optimistic (P90)</span><span className="text-emerald-500 font-medium">{formatCurrency(result.final_net_worth.optimistic)}</span></div><Progress value={100} className="h-2" /></div>
                <div className="mt-4 p-3 rounded-lg bg-muted/30 text-sm">
                  <p className="text-muted-foreground">Compounding Efficiency: <strong className="text-foreground">{result.compounding_efficiency}%</strong> above invested capital</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ── Exit Strategy Tab ──
function ExitStrategyTab() {
  const mutation = useExitStrategy();
  const [price, setPrice] = useState(2_000_000_000);
  const [city, setCity] = useState('Jakarta');
  const [holdYears, setHoldYears] = useState(3);
  const result = mutation.data as ExitStrategyResult | undefined;

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ArrowUpRight className="h-5 w-5 text-primary" /> Exit Strategy Optimizer</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Purchase Price</Label><Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /><p className="text-xs text-muted-foreground">{formatCurrency(price)}</p></div>
            <div className="space-y-2"><Label>City</Label>
              <Select value={city} onValueChange={setCity}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Dubai', 'Singapore'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Holding Period: {holdYears}yr</Label><Slider min={1} max={10} step={1} value={[holdYears]} onValueChange={v => setHoldYears(v[0])} /></div>
          </div>
          <Button onClick={() => mutation.mutate({ purchase_price: price, city, holding_years: holdYears })} disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><TrendingUp className="h-4 w-4 mr-2" /> Generate Exit Scenarios</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1"><Zap className="h-4 w-4 text-primary" /><span className="font-semibold">Recommended: {result.recommended_strategy.replace(/_/g, ' ')}</span></div>
              <p className="text-sm text-muted-foreground">{result.reasoning} • Exit window: {result.optimal_exit_window}</p>
              <p className="text-sm mt-1">Peak probability: <strong>{result.peak_probability}%</strong></p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm">Scenario Comparison</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={result.scenarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tickFormatter={(v) => `${(v / 1e9).toFixed(1)}B`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="net_profit" name="Net Profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tax_impact" name="Tax" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.scenarios.map((s, i) => (
              <Card key={i} className={`bg-card/60 border-border/40 ${s.strategy_type === result.recommended_strategy ? 'ring-1 ring-primary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{s.name}</span>
                    {s.strategy_type === result.recommended_strategy && <Badge className="bg-primary text-primary-foreground text-xs">Recommended</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Exit Price:</span> {formatCurrency(s.exit_price)}</div>
                    <div><span className="text-muted-foreground">Net Profit:</span> <span className={s.net_profit >= 0 ? 'text-emerald-500' : 'text-destructive'}>{formatCurrency(s.net_profit)}</span></div>
                    <div><span className="text-muted-foreground">Return:</span> {s.profit_pct}%</div>
                    <div><span className="text-muted-foreground">Hold:</span> {s.holding_period}yr</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ──
export default function FundIntelligencePage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10"><Brain className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Fund Intelligence Engine</h1>
            <p className="text-sm text-muted-foreground">Autonomous AI investment fund — hedge-fund-level strategy for real estate capital deployment</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="allocation" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-1">
          <TabsTrigger value="allocation" className="text-xs gap-1"><Globe className="h-3.5 w-3.5" /><span className="hidden sm:inline">Allocation</span></TabsTrigger>
          <TabsTrigger value="rebalancing" className="text-xs gap-1"><RefreshCw className="h-3.5 w-3.5" /><span className="hidden sm:inline">Rebalance</span></TabsTrigger>
          <TabsTrigger value="entry" className="text-xs gap-1"><Target className="h-3.5 w-3.5" /><span className="hidden sm:inline">Entry Timing</span></TabsTrigger>
          <TabsTrigger value="exit" className="text-xs gap-1"><ArrowUpRight className="h-3.5 w-3.5" /><span className="hidden sm:inline">Exit Strategy</span></TabsTrigger>
          <TabsTrigger value="wealth" className="text-xs gap-1"><Wallet className="h-3.5 w-3.5" /><span className="hidden sm:inline">Wealth Sim</span></TabsTrigger>
        </TabsList>

        <TabsContent value="allocation"><CapitalAllocationTab /></TabsContent>
        <TabsContent value="rebalancing"><RebalancingTab /></TabsContent>
        <TabsContent value="entry"><EntryTimingTab /></TabsContent>
        <TabsContent value="exit"><ExitStrategyTab /></TabsContent>
        <TabsContent value="wealth"><WealthSimulatorTab /></TabsContent>
      </Tabs>
    </div>
  );
}
