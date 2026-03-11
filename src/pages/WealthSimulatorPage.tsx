import { useState, lazy, Suspense } from 'react';
import { usePortfolioManager } from '@/hooks/usePortfolioManager';
import {
  useWealthSimulator,
  SCENARIOS,
  DEFAULT_FINANCING,
  formatB,
  type ScenarioType,
  type FinancingConfig,
  type SimulationResult,
  type YearProjection,
  type WealthAdvice,
} from '@/hooks/useWealthSimulator';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart,
} from 'recharts';
import {
  TrendingUp, Wallet, Shield, Zap, Target, Clock,
  ArrowUpRight, ArrowDownRight, Landmark, RefreshCw,
  ChevronRight, AlertTriangle, Lightbulb, DollarSign,
  Building2, PiggyBank,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const YEAR_OPTIONS = [1, 3, 5, 10, 20];
const ALL_SCENARIOS: ScenarioType[] = ['bull', 'base', 'bear', 'hyper_growth', 'correction'];

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

export default function WealthSimulatorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const portfolio = usePortfolioManager();
  const properties = portfolio.data?.properties || [];

  // Controls
  const [maxYears, setMaxYears] = useState(10);
  const [selectedScenarios, setSelectedScenarios] = useState<ScenarioType[]>(['bull', 'base', 'bear']);
  const [financing, setFinancing] = useState<FinancingConfig>(DEFAULT_FINANCING);

  const results = useWealthSimulator(properties, selectedScenarios, financing, maxYears);
  const baseResult = results.find(r => r.scenario === 'base') || results[0];

  // Gather all milestones
  const allMilestones = results.flatMap(r =>
    r.projections.flatMap(p => p.milestones.map(m => ({ milestone: m, year: p.year, scenario: r.scenario })))
  );
  const uniqueMilestones = allMilestones.filter((m, i, arr) => arr.findIndex(a => a.milestone === m.milestone) === i);

  // Chart data: merge scenario projections
  const chartData = baseResult?.projections.map((_, i) => {
    const point: any = { year: i };
    for (const r of results) {
      const p = r.projections[i];
      if (p) {
        point[`${r.scenario}_value`] = p.market_value;
        point[`${r.scenario}_equity`] = p.equity;
        point[`${r.scenario}_rental`] = p.rental_income_cumulative;
        point[`${r.scenario}_cashflow`] = p.cashflow_annual;
        point[`${r.scenario}_loan`] = p.loan_balance;
        point[`${r.scenario}_networth`] = p.net_worth;
      }
    }
    return point;
  }) || [];

  const toggleScenario = (s: ScenarioType) => {
    setSelectedScenarios(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <Wallet className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Wealth Growth Simulator</h2>
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
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Wealth Growth Simulator</h1>
              <p className="text-sm text-muted-foreground">AI-powered projection of your portfolio's future financial life</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <p className="text-sm text-muted-foreground mb-4">Save properties to your portfolio to start simulating wealth growth</p>
            <Button onClick={() => navigate('/properties')}>Browse Properties</Button>
          </Card>
        ) : (
          <>
            {/* ═══════ CONTROLS ═══════ */}
            <motion.div {...fadeIn} transition={{ delay: 0.05 }}>
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Projection Horizon */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Projection Horizon</label>
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <ScoreRing score={baseResult.summary.wealth_acceleration_score} label="Wealth Acceleration" />
                  <ScoreRing score={baseResult.summary.risk_diversification_score} label="Risk Diversification" />
                  <ScoreRing score={baseResult.summary.capital_efficiency_score} label="Capital Efficiency" />
                  <ScoreRing score={100 - baseResult.summary.cashflow_stress_index} label="Cashflow Health" />
                  <ScoreRing score={baseResult.summary.leverage_efficiency_score} label="Leverage Efficiency" />
                </div>
              </motion.div>
            )}

            {/* ═══════ KPI CARDS ═══════ */}
            {baseResult && (
              <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Final Net Worth', value: formatB(baseResult.summary.final_net_worth), icon: Wallet, sub: `${baseResult.summary.total_return_pct.toFixed(0)}% total return` },
                    { label: 'Final Equity', value: formatB(baseResult.summary.final_equity), icon: Landmark, sub: `${maxYears}-year projection` },
                    { label: 'Total Rental Income', value: formatB(baseResult.summary.total_rental_income), icon: DollarSign, sub: 'Cumulative cashflow' },
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

            {/* ═══════ WEALTH GROWTH CURVE ═══════ */}
            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Net Worth Projection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={chartData}>
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

              {/* ═══════ CASHFLOW TIMELINE ═══════ */}
              <motion.div {...fadeIn} transition={{ delay: 0.28 }}>
                <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" /> Annual Cashflow
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
                            dataKey={`${r.scenario}_cashflow`}
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
                            { label: 'Total Return %', key: 'total_return_pct', fmt: (v: number) => `${v.toFixed(1)}%` },
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

            {/* ═══════ AI WEALTH ADVISOR ═══════ */}
            {baseResult && baseResult.advice.length > 0 && (
              <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
                <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" /> AI Wealth Strategy Advisor
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
