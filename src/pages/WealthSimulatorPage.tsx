import { useState, lazy, Suspense, useCallback } from 'react';
import { usePortfolioManager } from '@/hooks/usePortfolioManager';
import {
  useWealthSimulator,
  SCENARIOS,
  DEFAULT_FINANCING,
  formatB,
  type ScenarioType,
  type InvestmentStrategy,
  type FinancingConfig,
  type SimulationResult,
  type YearProjection,
  type WealthAdvice,
  type SavedScenario,
  type TimingSensitivity,
  type InvestmentMixRecommendation,
} from '@/hooks/useWealthSimulator';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart,
} from 'recharts';
import {
  TrendingUp, Wallet, Shield, Zap, Target, Clock,
  ArrowUpRight, ArrowDownRight, Landmark, RefreshCw,
  ChevronRight, AlertTriangle, Lightbulb, DollarSign,
  Building2, PiggyBank, Save, GitCompare, Timer,
  PieChart, Trash2, Home, Briefcase,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const YEAR_OPTIONS = [1, 3, 5, 10, 20];
const ALL_SCENARIOS: ScenarioType[] = ['bull', 'base', 'bear', 'hyper_growth', 'correction'];
const STRATEGIES: { value: InvestmentStrategy; label: string; icon: any; desc: string }[] = [
  { value: 'rental', label: 'Rental Income', icon: Home, desc: 'Maximize passive income' },
  { value: 'resale', label: 'Capital Gain', icon: TrendingUp, desc: 'Maximize resale profit' },
  { value: 'hybrid', label: 'Hybrid', icon: Briefcase, desc: 'Balanced approach' },
];

const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const tooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  fontSize: 11,
  color: 'hsl(var(--popover-foreground))',
};

// ── Score Ring ──
function ScoreRing({ score, label, size = 72 }: { score: number; label: string; size?: number }) {
  const color = score >= 70 ? 'stroke-emerald-500' : score >= 40 ? 'stroke-amber-500' : 'stroke-destructive';
  const textColor = score >= 70 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-destructive';
  const r = 36;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="6" className="stroke-muted/20" />
          <circle
            cx="50" cy="50" r={r} fill="none" strokeWidth="6"
            strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${textColor}`}>
          {score}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Advice Card ──
function AdviceCard({ advice }: { advice: WealthAdvice }) {
  const icons = { sell: ArrowDownRight, refinance: RefreshCw, acquire: Building2, rebalance: Target, hold: Shield };
  const colors = { sell: 'text-destructive', refinance: 'text-primary', acquire: 'text-emerald-500', rebalance: 'text-amber-500', hold: 'text-muted-foreground' };
  const Icon = icons[advice.type] || Lightbulb;
  const colorCls = colors[advice.type] || 'text-foreground';
  const priorityCls = advice.priority === 'high' ? 'border-destructive/30 bg-destructive/5' : advice.priority === 'medium' ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/30 bg-muted/5';

  return (
    <div className={`p-3 rounded-lg border ${priorityCls} transition-all`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 mt-0.5 ${colorCls}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[9px] h-4 capitalize">{advice.type}</Badge>
            <span className="text-[10px] text-muted-foreground">Year {advice.year}</span>
          </div>
          <p className="text-xs text-foreground">{advice.message}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Impact: {advice.impact}</p>
        </div>
      </div>
    </div>
  );
}

// ── Milestone Badge ──
function MilestoneBadge({ milestone, year }: { milestone: string; year: number }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
      <Zap className="w-3 h-3 text-primary" />
      <span className="text-[10px] font-medium text-primary">{milestone}</span>
      <span className="text-[9px] text-muted-foreground">Y{year}</span>
    </div>
  );
}

// ── Timing Sensitivity Panel ──
function TimingSensitivityPanel({ ts }: { ts: TimingSensitivity }) {
  const ratingColors = {
    LOW: 'text-chart-1 bg-chart-1/10 border-chart-1/20',
    MODERATE: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    HIGH: 'text-chart-3 bg-chart-3/10 border-chart-3/20',
    CRITICAL: 'text-destructive bg-destructive/10 border-destructive/20',
  };

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary" /> Timing Sensitivity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`rounded-lg border p-3 ${ratingColors[ts.sensitivity_rating]}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">{ts.sensitivity_rating} Sensitivity</span>
            <Badge variant="outline" className="text-[10px]">Peak ROI: Year {ts.peak_roi_year}</Badge>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Optimal Entry</span>
            <span className="font-medium text-foreground">{ts.optimal_entry_window}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delay Cost/Year</span>
            <span className="font-medium text-destructive">-{ts.delay_cost_per_year_pct}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Early Exit Penalty</span>
            <span className="font-medium text-amber-500">-{ts.early_exit_penalty_pct}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Investment Mix Panel ──
function InvestmentMixPanel({ mix }: { mix: InvestmentMixRecommendation }) {
  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" /> Recommended Investment Mix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Allocation Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Rental {mix.rental_allocation_pct}%</span>
            <span>Resale {mix.resale_allocation_pct}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex">
            <div className="bg-chart-1 transition-all" style={{ width: `${mix.rental_allocation_pct}%` }} />
            <div className="bg-chart-4 transition-all" style={{ width: `${mix.resale_allocation_pct}%` }} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{mix.mix_summary}</p>

        <Separator />

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground mb-1">Cities</p>
            <div className="flex flex-wrap gap-1">
              {mix.recommended_cities.map(c => (
                <Badge key={c} variant="outline" className="text-[9px]">{c}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Types</p>
            <div className="flex flex-wrap gap-1">
              {mix.recommended_types.map(t => (
                <Badge key={t} variant="outline" className="text-[9px] capitalize">{t}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Diversification</span>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-chart-1 rounded-full transition-all" style={{ width: `${mix.diversification_score}%` }} />
          </div>
          <span className="font-medium">{mix.diversification_score}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WealthSimulatorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const portfolio = usePortfolioManager();
  const properties = portfolio.data?.properties || [];

  // Controls
  const [maxYears, setMaxYears] = useState(10);
  const [selectedScenarios, setSelectedScenarios] = useState<ScenarioType[]>(['bull', 'base', 'bear']);
  const [financing, setFinancing] = useState<FinancingConfig>(DEFAULT_FINANCING);
  const [strategy, setStrategy] = useState<InvestmentStrategy>('hybrid');
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [comparingId, setComparingId] = useState<string | null>(null);

  const results = useWealthSimulator(properties, selectedScenarios, financing, maxYears, strategy, investmentAmount || undefined);
  const baseResult = results.find(r => r.scenario === 'base') || results[0];

  // Saved scenario for comparison
  const comparingScenario = savedScenarios.find(s => s.id === comparingId);

  // Gather all milestones
  const allMilestones = results.flatMap(r =>
    r.projections.flatMap(p => p.milestones.map(m => ({ milestone: m, year: p.year, scenario: r.scenario })))
  );
  const uniqueMilestones = allMilestones.filter((m, i, arr) => arr.findIndex(a => a.milestone === m.milestone) === i);

  // Chart data: merge scenario projections + range band
  const chartData = baseResult?.projections.map((_, i) => {
    const point: any = { year: i };
    let minNW = Infinity, maxNW = -Infinity;
    for (const r of results) {
      const p = r.projections[i];
      if (p) {
        point[`${r.scenario}_value`] = p.market_value;
        point[`${r.scenario}_equity`] = p.equity;
        point[`${r.scenario}_rental`] = p.rental_income_cumulative;
        point[`${r.scenario}_cashflow`] = p.cashflow_annual;
        point[`${r.scenario}_loan`] = p.loan_balance;
        point[`${r.scenario}_networth`] = p.net_worth;
        point[`${r.scenario}_resale`] = p.resale_net_profit;
        if (p.net_worth < minNW) minNW = p.net_worth;
        if (p.net_worth > maxNW) maxNW = p.net_worth;
      }
    }
    point.range_min = minNW === Infinity ? 0 : minNW;
    point.range_max = maxNW === -Infinity ? 0 : maxNW;
    point.range_band = maxNW - minNW;
    return point;
  }) || [];

  const toggleScenario = (s: ScenarioType) => {
    setSelectedScenarios(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSaveScenario = useCallback(() => {
    const name = `${strategy} · ${selectedScenarios.length}S · ${maxYears}Y`;
    const saved: SavedScenario = {
      id: Date.now().toString(),
      name,
      timestamp: Date.now(),
      strategy,
      scenarios: [...selectedScenarios],
      financing: { ...financing },
      maxYears,
      investmentAmount,
      results: results.map(r => ({ ...r })),
    };
    setSavedScenarios(prev => [...prev, saved]);
    toast.success(`Scenario "${name}" saved`);
  }, [strategy, selectedScenarios, financing, maxYears, investmentAmount, results]);

  const handleDeleteSaved = (id: string) => {
    setSavedScenarios(prev => prev.filter(s => s.id !== id));
    if (comparingId === id) setComparingId(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <Wallet className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Investment Strategy Simulator</h2>
          <p className="text-sm text-muted-foreground mb-4">Sign in to simulate your portfolio's future wealth trajectory</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div {...fadeIn} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Investment Strategy Simulator</h1>
              <p className="text-sm text-muted-foreground">AI-powered scenario analysis & predictive decision intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {results.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleSaveScenario}>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Scenario
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/investor-dashboard')}>
              <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" /> Investor Dashboard
            </Button>
          </div>
        </motion.div>

        {portfolio.isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : properties.length === 0 ? (
          <Card className="p-12 text-center">
            <PiggyBank className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No Properties in Portfolio</h2>
            <p className="text-sm text-muted-foreground mb-4">Save properties to your portfolio to start simulating investment strategies</p>
            <Button onClick={() => navigate('/properties')}>Browse Properties</Button>
          </Card>
        ) : (
          <>
            {/* ═══════ STRATEGY SELECTOR ═══════ */}
            <motion.div {...fadeIn} transition={{ delay: 0.03 }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STRATEGIES.map(s => {
                  const Icon = s.icon;
                  const active = strategy === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => setStrategy(s.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        active
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/20'
                          : 'border-border/50 bg-card hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>{s.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ═══════ CONTROLS ═══════ */}
            <motion.div {...fadeIn} transition={{ delay: 0.05 }}>
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Investment Amount */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Investment Amount
                      </label>
                      <Input
                        type="number"
                        placeholder="Auto (full portfolio)"
                        value={investmentAmount || ''}
                        onChange={e => setInvestmentAmount(Number(e.target.value) || 0)}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Projection Horizon */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Holding Period</label>
                      <div className="flex gap-1.5">
                        {YEAR_OPTIONS.map(y => (
                          <Button
                            key={y}
                            size="sm"
                            variant={maxYears === y ? 'default' : 'outline'}
                            className="text-xs h-8 flex-1"
                            onClick={() => setMaxYears(y)}
                          >
                            {y}Y
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Down Payment */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Down Payment: {financing.down_payment_pct}%
                        {financing.down_payment_pct >= 100 && <Badge variant="outline" className="ml-1 text-[8px]">Cash</Badge>}
                      </label>
                      <Slider
                        value={[financing.down_payment_pct]}
                        min={10}
                        max={100}
                        step={5}
                        onValueChange={([v]) => setFinancing(f => ({ ...f, down_payment_pct: v }))}
                      />
                    </div>

                    {/* Loan Rate */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Loan Rate: {financing.loan_rate_annual}%
                      </label>
                      <Slider
                        value={[financing.loan_rate_annual]}
                        min={4}
                        max={15}
                        step={0.5}
                        onValueChange={([v]) => setFinancing(f => ({ ...f, loan_rate_annual: v }))}
                      />
                    </div>

                    {/* Loan Term */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Loan Term</label>
                      <Select
                        value={String(financing.loan_term_years)}
                        onValueChange={v => setFinancing(f => ({ ...f, loan_term_years: Number(v) }))}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 15, 20, 25, 30].map(t => (
                            <SelectItem key={t} value={String(t)}>{t} years</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Scenario toggles */}
                  <Separator className="my-3" />
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-medium text-muted-foreground self-center mr-1">Scenarios:</span>
                    {ALL_SCENARIOS.map(s => {
                      const sc = SCENARIOS[s];
                      const active = selectedScenarios.includes(s);
                      return (
                        <Button
                          key={s}
                          size="sm"
                          variant={active ? 'default' : 'outline'}
                          className="text-[10px] h-7"
                          onClick={() => toggleScenario(s)}
                        >
                          <span
                            className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0"
                            style={{ backgroundColor: sc.color }}
                          />
                          {sc.label}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ═══════ SUMMARY SCORES ═══════ */}
            {baseResult && (
              <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <ScoreRing score={baseResult.summary.wealth_acceleration_score} label="Wealth Acceleration" />
                  <ScoreRing score={baseResult.summary.risk_diversification_score} label="Diversification" />
                  <ScoreRing score={baseResult.summary.capital_efficiency_score} label="Capital Efficiency" />
                  <ScoreRing score={100 - baseResult.summary.cashflow_stress_index} label="Cashflow Health" />
                  <ScoreRing score={baseResult.summary.leverage_efficiency_score} label="Leverage Efficiency" />
                  <ScoreRing score={Math.max(0, 100 - baseResult.summary.risk_volatility)} label="Stability" />
                </div>
              </motion.div>
            )}

            {/* ═══════ KPI CARDS ═══════ */}
            {baseResult && (
              <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Final Net Worth', value: formatB(baseResult.summary.final_net_worth), icon: Wallet, sub: `${baseResult.summary.total_return_pct.toFixed(0)}% total return` },
                    { label: 'Final Equity', value: formatB(baseResult.summary.final_equity), icon: Landmark, sub: `${maxYears}-year projection` },
                    { label: 'Total Rental Income', value: formatB(baseResult.summary.total_rental_income), icon: DollarSign, sub: 'Cumulative cashflow' },
                    { label: 'Resale Net Profit', value: formatB(baseResult.summary.resale_net_profit), icon: TrendingUp, sub: `After PPh & exit costs` },
                    { label: 'Portfolio Properties', value: String(properties.length), icon: Building2, sub: `${portfolio.data?.unique_cities?.length || 0} cities` },
                  ].map((kpi, i) => (
                    <Card key={i} className="bg-card/60 backdrop-blur-xl border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <kpi.icon className="w-4 h-4" />
                          <span className="text-xs">{kpi.label}</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══════ MILESTONES ═══════ */}
            {uniqueMilestones.length > 0 && (
              <motion.div {...fadeIn} transition={{ delay: 0.18 }}>
                <div className="flex flex-wrap gap-2">
                  {uniqueMilestones.map((m, i) => (
                    <MilestoneBadge key={i} milestone={m.milestone} year={m.year} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══════ NET WORTH CHART WITH RANGE BAND ═══════ */}
            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> Portfolio Value Projection
                    </CardTitle>
                    {results.length > 1 && (
                      <Badge variant="outline" className="text-[9px]">
                        Best/Worst Range: {formatB(chartData[chartData.length - 1]?.range_band || 0)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="rangeBand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.08} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="year"
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                        tickFormatter={v => `Y${v}`}
                      />
                      <YAxis
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                        tickFormatter={v => formatB(v as number)}
                        width={70}
                      />
                      <Tooltip
                        formatter={(v: number, name: string) => [formatIDR(v), name.replace(/_/g, ' ')]}
                        contentStyle={tooltipStyle}
                      />
                      {/* Range band between best and worst */}
                      {results.length > 1 && (
                        <Area
                          type="monotone"
                          dataKey="range_max"
                          stroke="none"
                          fill="url(#rangeBand)"
                          fillOpacity={1}
                          name="Best Case"
                        />
                      )}
                      {results.map(r => (
                        <Area
                          key={r.scenario}
                          type="monotone"
                          dataKey={`${r.scenario}_networth`}
                          name={`${r.params.label} Net Worth`}
                          stroke={r.params.color}
                          fill={r.params.color}
                          fillOpacity={0.08}
                          strokeWidth={2}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* ═══════ TIMING & MIX INSIGHTS ═══════ */}
            {baseResult && (
              <motion.div {...fadeIn} transition={{ delay: 0.22 }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <TimingSensitivityPanel ts={baseResult.timingSensitivity} />
                  <InvestmentMixPanel mix={baseResult.investmentMix} />
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ═══════ EQUITY vs LOAN ═══════ */}
              <motion.div {...fadeIn} transition={{ delay: 0.25 }}>
                <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-primary" /> Equity vs Loan Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} tickFormatter={v => `Y${v}`} />
                        <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} tickFormatter={v => formatB(v as number)} width={65} />
                        <Tooltip formatter={(v: number) => formatIDR(v)} contentStyle={tooltipStyle} />
                        {baseResult && (
                          <>
                            <Area type="monotone" dataKey={`${baseResult.scenario}_equity`} name="Equity" fill="hsl(var(--chart-2))" fillOpacity={0.15} stroke="hsl(var(--chart-2))" strokeWidth={2} />
                            <Line type="monotone" dataKey={`${baseResult.scenario}_loan`} name="Loan" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                          </>
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ═══════ CASHFLOW / RESALE TIMELINE ═══════ */}
              <motion.div {...fadeIn} transition={{ delay: 0.28 }}>
                <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      {strategy === 'resale' ? 'Resale Net Profit Timeline' : 'Annual Cashflow'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} tickFormatter={v => `Y${v}`} />
                        <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} tickFormatter={v => formatB(v as number)} width={65} />
                        <Tooltip formatter={(v: number) => formatIDR(v)} contentStyle={tooltipStyle} />
                        {results.map(r => (
                          <Bar
                            key={r.scenario}
                            dataKey={strategy === 'resale' ? `${r.scenario}_resale` : `${r.scenario}_cashflow`}
                            name={`${r.params.label}`}
                            fill={r.params.color}
                            fillOpacity={0.7}
                            radius={[2, 2, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ═══════ SCENARIO COMPARISON TABLE ═══════ */}
            {results.length > 1 && (
              <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
                <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Scenario Comparison ({maxYears}Y)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border/30">
                            <th className="text-left py-2 text-muted-foreground font-medium">Metric</th>
                            {results.map(r => (
                              <th key={r.scenario} className="text-right py-2 font-medium" style={{ color: r.params.color }}>
                                {r.params.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                          {[
                            { label: 'Final Net Worth', key: 'final_net_worth', fmt: formatB },
                            { label: 'Final Equity', key: 'final_equity', fmt: formatB },
                            { label: 'Total Rental Income', key: 'total_rental_income', fmt: formatB },
                            { label: 'Resale Net Profit', key: 'resale_net_profit', fmt: formatB },
                            { label: 'Total Return %', key: 'total_return_pct', fmt: (v: number) => `${v.toFixed(1)}%` },
                            { label: 'Risk Volatility', key: 'risk_volatility', fmt: (v: number) => `${v}/100` },
                            { label: 'Cashflow Stress', key: 'cashflow_stress_index', fmt: (v: number) => `${v}/100` },
                          ].map(row => (
                            <tr key={row.key}>
                              <td className="py-2 text-muted-foreground">{row.label}</td>
                              {results.map(r => (
                                <td key={r.scenario} className="py-2 text-right font-medium text-foreground">
                                  {row.fmt((r.summary as any)[row.key])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ═══════ SAVED SCENARIOS & COMPARE ═══════ */}
            {savedScenarios.length > 0 && (
              <motion.div {...fadeIn} transition={{ delay: 0.32 }}>
                <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-primary" /> Saved Scenarios
                    </CardTitle>
                    <CardDescription className="text-xs">Compare saved scenarios against current simulation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {savedScenarios.map(s => {
                        const sBase = s.results.find(r => r.scenario === 'base') || s.results[0];
                        const isComparing = comparingId === s.id;
                        return (
                          <div
                            key={s.id}
                            className={`p-3 rounded-lg border transition-all ${
                              isComparing ? 'border-primary bg-primary/5' : 'border-border/50 bg-muted/20'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-foreground truncate">{s.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleDeleteSaved(s.id)}
                              >
                                <Trash2 className="w-3 h-3 text-muted-foreground" />
                              </Button>
                            </div>
                            {sBase && (
                              <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                                <div><span className="text-muted-foreground">Net Worth:</span> <span className="font-medium">{formatB(sBase.summary.final_net_worth)}</span></div>
                                <div><span className="text-muted-foreground">ROI:</span> <span className="font-medium">{sBase.summary.total_return_pct.toFixed(0)}%</span></div>
                                <div><span className="text-muted-foreground">Strategy:</span> <span className="font-medium capitalize">{s.strategy}</span></div>
                                <div><span className="text-muted-foreground">Period:</span> <span className="font-medium">{s.maxYears}Y</span></div>
                              </div>
                            )}
                            <Button
                              variant={isComparing ? 'default' : 'outline'}
                              size="sm"
                              className="w-full text-[10px] h-7"
                              onClick={() => setComparingId(isComparing ? null : s.id)}
                            >
                              <GitCompare className="w-3 h-3 mr-1" />
                              {isComparing ? 'Comparing...' : 'Compare'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Comparison Summary */}
                    {comparingScenario && baseResult && (() => {
                      const cBase = comparingScenario.results.find(r => r.scenario === 'base') || comparingScenario.results[0];
                      if (!cBase) return null;
                      const nwDiff = baseResult.summary.final_net_worth - cBase.summary.final_net_worth;
                      const roiDiff = baseResult.summary.total_return_pct - cBase.summary.total_return_pct;
                      return (
                        <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                          <p className="text-xs font-semibold text-foreground mb-2">Current vs "{comparingScenario.name}"</p>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground">Net Worth Δ</span>
                              <p className={`font-bold ${nwDiff >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                                {nwDiff >= 0 ? '+' : ''}{formatB(nwDiff)}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">ROI Δ</span>
                              <p className={`font-bold ${roiDiff >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                                {roiDiff >= 0 ? '+' : ''}{roiDiff.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Better Strategy</span>
                              <p className="font-bold text-primary">
                                {nwDiff >= 0 ? 'Current' : comparingScenario.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ═══════ AI WEALTH ADVISOR ═══════ */}
            {baseResult && baseResult.advice.length > 0 && (
              <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
                <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" /> AI Strategy Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {baseResult.advice
                        .sort((a, b) => {
                          const pMap = { high: 0, medium: 1, low: 2 };
                          return pMap[a.priority] - pMap[b.priority];
                        })
                        .map((adv, i) => (
                          <AdviceCard key={i} advice={adv} />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
