import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, TrendingDown, DollarSign, Clock,
  Target, Shield, Zap, AlertTriangle, CheckCircle2,
  Loader2, Sparkles, Save, Trash2, GitCompare, BarChart3,
  Home, PiggyBank, ArrowUpRight, ArrowDownRight, Gauge,
  ChevronRight, Activity, Eye, Layers, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ComposedChart, Cell
} from 'recharts';
import {
  useScenarioSimulation,
  DEFAULT_SCENARIO,
  type ScenarioInputs,
  type SimulationOutput,
  type ScenarioSnapshot,
} from '@/hooks/useScenarioSimulation';

const fmtIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const fmtB = (n: number) => {
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}M`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(0)}jt`;
  return n.toLocaleString('id-ID');
};

const tooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  fontSize: 11,
  color: 'hsl(var(--popover-foreground))',
};

const InvestmentScenarioSimulatorPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [inputs, setInputs] = useState<ScenarioInputs>({ ...DEFAULT_SCENARIO });
  const [snapshots, setSnapshots] = useState<ScenarioSnapshot[]>([]);
  const [comparingId, setComparingId] = useState<string | null>(null);

  const output = useScenarioSimulation(inputs);

  const update = useCallback(<K extends keyof ScenarioInputs>(key: K, val: ScenarioInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  }, []);

  const saveSnapshot = useCallback(() => {
    const snap: ScenarioSnapshot = {
      id: crypto.randomUUID(),
      name: `Scenario ${snapshots.length + 1}`,
      inputs: { ...inputs },
      output,
      created_at: Date.now(),
    };
    setSnapshots(prev => [snap, ...prev].slice(0, 5));
  }, [inputs, output, snapshots.length]);

  const deleteSnapshot = useCallback((id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
    if (comparingId === id) setComparingId(null);
  }, [comparingId]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const comparingSnap = snapshots.find(s => s.id === comparingId);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/user-dashboard">
            <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-chart-1/20 flex items-center justify-center border border-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Investment Scenario Simulator</h1>
              <p className="text-sm text-muted-foreground">Model risk-return tradeoffs with real-time interactive projections</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ═══ LEFT: Controls ═══ */}
          <div className="lg:col-span-4 space-y-4">
            <ControlPanel inputs={inputs} update={update} onSave={saveSnapshot} />
            {snapshots.length > 0 && (
              <SnapshotPanel
                snapshots={snapshots}
                comparingId={comparingId}
                onCompare={setComparingId}
                onDelete={deleteSnapshot}
                onLoad={(snap) => setInputs({ ...snap.inputs })}
              />
            )}
          </div>

          {/* ═══ RIGHT: Results ═══ */}
          <div className="lg:col-span-8 space-y-6">
            <KPIStrip output={output} />

            <Tabs defaultValue="projection" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-9">
                <TabsTrigger value="projection" className="text-xs"><TrendingUp className="h-3.5 w-3.5 mr-1" />Projection</TabsTrigger>
                <TabsTrigger value="risk" className="text-xs"><Shield className="h-3.5 w-3.5 mr-1" />Risk</TabsTrigger>
                <TabsTrigger value="cashflow" className="text-xs"><DollarSign className="h-3.5 w-3.5 mr-1" />Cashflow</TabsTrigger>
              </TabsList>

              <TabsContent value="projection" className="mt-4 space-y-4">
                <ProjectionChart output={output} comparingSnap={comparingSnap} />
                <ROIBreakdownCards output={output} />
              </TabsContent>

              <TabsContent value="risk" className="mt-4 space-y-4">
                <DownsideRiskPanel output={output} />
                <BreakevenTimeline output={output} />
              </TabsContent>

              <TabsContent value="cashflow" className="mt-4 space-y-4">
                <CashflowChart output={output} />
                <CashOnCashChart output={output} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// CONTROL PANEL
// ═══════════════════════════════════════════════════
const ControlPanel: React.FC<{
  inputs: ScenarioInputs;
  update: <K extends keyof ScenarioInputs>(key: K, val: ScenarioInputs[K]) => void;
  onSave: () => void;
}> = ({ inputs, update, onSave }) => {
  const SliderControl = ({ label, value, min, max, step, unit, onChange, hint }: {
    label: string; value: number; min: number; max: number; step: number; unit: string;
    onChange: (v: number) => void; hint?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-sm font-bold text-foreground">{value}{unit}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );

  return (
    <Card className="border-primary/20 sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Simulation Controls
        </CardTitle>
        <CardDescription className="text-xs">Adjust assumptions — results update instantly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Purchase Price */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Purchase Price (IDR)</Label>
          <Input
            type="number"
            value={inputs.purchase_price}
            onChange={e => update('purchase_price', Number(e.target.value) || 0)}
            className="text-sm font-medium"
          />
        </div>

        {/* Monthly Rental */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Monthly Rental Income (IDR)</Label>
          <Input
            type="number"
            value={inputs.monthly_rental}
            onChange={e => update('monthly_rental', Number(e.target.value) || 0)}
            className="text-sm font-medium"
          />
        </div>

        <Separator />

        {/* Key Sliders */}
        <SliderControl
          label="Holding Period" value={inputs.holding_years}
          min={1} max={30} step={1} unit=" years"
          onChange={v => update('holding_years', v)}
        />
        <SliderControl
          label="Annual Appreciation" value={inputs.appreciation_rate}
          min={-10} max={25} step={0.5} unit="%"
          onChange={v => update('appreciation_rate', v)}
          hint="Historical avg: 5-8% (Indonesia residential)"
        />
        <SliderControl
          label="Occupancy Rate" value={inputs.occupancy_rate}
          min={0} max={100} step={5} unit="%"
          onChange={v => update('occupancy_rate', v)}
          hint="Bali villa avg: 65-80%"
        />
        <SliderControl
          label="Rental Growth" value={inputs.rental_growth}
          min={0} max={15} step={0.5} unit="%/yr"
          onChange={v => update('rental_growth', v)}
        />

        <Separator />

        {/* Financing */}
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Financing</p>
        <SliderControl
          label="Down Payment" value={inputs.down_payment_pct}
          min={10} max={100} step={5} unit="%"
          onChange={v => update('down_payment_pct', v)}
        />
        <SliderControl
          label="Loan Rate" value={inputs.loan_rate}
          min={0} max={18} step={0.25} unit="%"
          onChange={v => update('loan_rate', v)}
        />
        <SliderControl
          label="Maintenance Cost" value={inputs.maintenance_pct}
          min={0} max={5} step={0.25} unit="%/yr"
          onChange={v => update('maintenance_pct', v)}
        />

        <Button onClick={onSave} variant="outline" className="w-full mt-2" size="sm">
          <Save className="h-3.5 w-3.5 mr-1.5" /> Save Snapshot
        </Button>
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════════════
// SNAPSHOT PANEL
// ═══════════════════════════════════════════════════
const SnapshotPanel: React.FC<{
  snapshots: ScenarioSnapshot[];
  comparingId: string | null;
  onCompare: (id: string | null) => void;
  onDelete: (id: string) => void;
  onLoad: (snap: ScenarioSnapshot) => void;
}> = ({ snapshots, comparingId, onCompare, onDelete, onLoad }) => (
  <Card className="border-border/50">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <GitCompare className="h-4 w-4 text-chart-4" />
        Saved Scenarios ({snapshots.length})
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {snapshots.map(snap => (
        <div key={snap.id} className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
          comparingId === snap.id ? 'border-primary/40 bg-primary/5' : 'border-border/30 bg-muted/20 hover:bg-muted/40'
        }`}>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onLoad(snap)}>
            <p className="font-medium text-foreground truncate">{snap.name}</p>
            <p className="text-muted-foreground">
              ROI {snap.output.summary.total_roi_pct}% • {snap.inputs.holding_years}yr
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Button
              variant="ghost" size="icon" className="h-6 w-6"
              onClick={() => onCompare(comparingId === snap.id ? null : snap.id)}
            >
              <Eye className={`h-3 w-3 ${comparingId === snap.id ? 'text-primary' : 'text-muted-foreground'}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(snap.id)}>
              <Trash2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

// ═══════════════════════════════════════════════════
// KPI STRIP
// ═══════════════════════════════════════════════════
const KPIStrip: React.FC<{ output: SimulationOutput }> = ({ output }) => {
  const { summary } = output;
  const kpis = [
    { label: 'Total ROI', value: `${summary.total_roi_pct}%`, icon: <TrendingUp className="h-4 w-4" />, color: summary.total_roi_pct > 0 ? 'text-chart-1' : 'text-destructive' },
    { label: 'IRR', value: `${summary.irr_estimate}%`, icon: <Target className="h-4 w-4" />, color: 'text-primary' },
    { label: 'Equity Multiple', value: `${summary.equity_multiple}x`, icon: <Layers className="h-4 w-4" />, color: 'text-chart-4' },
    { label: 'Break-Even', value: summary.breakeven_year ? `Year ${summary.breakeven_year}` : 'N/A', icon: <Clock className="h-4 w-4" />, color: summary.breakeven_year ? 'text-chart-2' : 'text-muted-foreground' },
    { label: 'Net Profit', value: `IDR ${fmtB(summary.net_profit)}`, icon: <DollarSign className="h-4 w-4" />, color: summary.net_profit > 0 ? 'text-chart-1' : 'text-destructive' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {kpis.map((kpi, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Card className="border-border/50">
            <CardContent className="pt-3 pb-2.5 px-3">
              <div className={`flex items-center gap-1 mb-1 ${kpi.color}`}>
                {kpi.icon}
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════
// PROJECTION CHART
// ═══════════════════════════════════════════════════
const ProjectionChart: React.FC<{ output: SimulationOutput; comparingSnap?: ScenarioSnapshot | null }> = ({ output, comparingSnap }) => {
  const data = output.years.map((y, i) => ({
    year: `Y${y.year}`,
    equity: y.equity,
    value: y.property_value,
    roi: y.total_roi_pct,
    compEquity: comparingSnap?.output.years[i]?.equity,
    compRoi: comparingSnap?.output.years[i]?.total_roi_pct,
  }));

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-chart-1" />
          ROI & Equity Projection
          {comparingSnap && (
            <Badge variant="outline" className="text-[10px] ml-auto border-chart-4/30 text-chart-4">
              <GitCompare className="h-3 w-3 mr-1" /> Comparing: {comparingSnap.name}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="gEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => fmtB(v)} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => {
              if (name.includes('Equity')) return [fmtIDR(v), name];
              return [`${v}%`, name];
            }} />
            <Area yAxisId="left" type="monotone" dataKey="equity" stroke="hsl(var(--primary))" fill="url(#gEquity)" strokeWidth={2} name="Equity" />
            <Line yAxisId="right" type="monotone" dataKey="roi" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ r: 3 }} name="Total ROI %" />
            {comparingSnap && (
              <>
                <Line yAxisId="left" type="monotone" dataKey="compEquity" stroke="hsl(var(--chart-4))" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name={`${comparingSnap.name} Equity`} />
                <Line yAxisId="right" type="monotone" dataKey="compRoi" stroke="hsl(var(--chart-3))" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name={`${comparingSnap.name} ROI %`} />
              </>
            )}
            <ReferenceLine yAxisId="right" y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════════════
// ROI BREAKDOWN CARDS
// ═══════════════════════════════════════════════════
const ROIBreakdownCards: React.FC<{ output: SimulationOutput }> = ({ output }) => {
  const { summary } = output;
  const items = [
    { label: 'Total Investment', value: fmtIDR(summary.total_investment), icon: <Home className="h-4 w-4 text-primary" />, desc: 'Down payment + transaction costs' },
    { label: 'Total Rental Income', value: fmtIDR(summary.total_rental_income), icon: <PiggyBank className="h-4 w-4 text-chart-1" />, desc: 'Cumulative gross rental over hold' },
    { label: 'Final Property Value', value: fmtIDR(summary.final_property_value), icon: <TrendingUp className="h-4 w-4 text-chart-2" />, desc: 'Estimated exit value' },
    { label: 'Final Equity', value: fmtIDR(summary.final_equity), icon: <Layers className="h-4 w-4 text-chart-4" />, desc: 'Value minus remaining loan' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="pt-4 pb-3 px-3">
            <div className="flex items-center gap-1.5 mb-1">{item.icon}<span className="text-[10px] text-muted-foreground">{item.label}</span></div>
            <p className="text-base font-bold text-foreground">{item.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════
// DOWNSIDE RISK PANEL
// ═══════════════════════════════════════════════════
const DownsideRiskPanel: React.FC<{ output: SimulationOutput }> = ({ output }) => {
  const severityColors = ['border-yellow-500/30 bg-yellow-500/5', 'border-destructive/30 bg-destructive/5', 'border-destructive/40 bg-destructive/10'];
  const severityIcons = [
    <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    <AlertTriangle className="h-5 w-5 text-destructive" />,
    <Shield className="h-5 w-5 text-destructive" />,
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4 text-destructive" />
          Downside Risk Scenarios
        </CardTitle>
        <CardDescription>Stress-tested outcomes under adverse market conditions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {output.downside.map((ds, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-xl border p-4 ${severityColors[i]}`}
          >
            <div className="flex items-start gap-3">
              {severityIcons[i]}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h4 className="text-sm font-semibold text-foreground">{ds.scenario}</h4>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{ds.probability_label} likelihood</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Final Value</p>
                    <p className="text-sm font-bold text-foreground">IDR {fmtB(ds.final_value)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Total ROI</p>
                    <p className={`text-sm font-bold ${ds.total_roi_pct >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                      {ds.total_roi_pct > 0 ? '+' : ''}{ds.total_roi_pct}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Max Drawdown</p>
                    <p className="text-sm font-bold text-destructive">−{ds.max_drawdown_pct}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Recovery</p>
                    <p className="text-sm font-bold text-foreground">{ds.recovery_years ? `${ds.recovery_years} years` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Drawdown Bar Visualization */}
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Maximum Drawdown Comparison</p>
          {output.downside.map((ds, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-28 truncate">{ds.scenario}</span>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(ds.max_drawdown_pct * 2, 100)}%`,
                    background: i === 0 ? 'hsl(var(--chart-3))' : i === 1 ? 'hsl(var(--destructive) / 0.7)' : 'hsl(var(--destructive))',
                  }}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-10 text-right">−{ds.max_drawdown_pct}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════════════
// BREAKEVEN TIMELINE
// ═══════════════════════════════════════════════════
const BreakevenTimeline: React.FC<{ output: SimulationOutput }> = ({ output }) => {
  const { summary, years } = output;
  const beYear = summary.breakeven_year;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-chart-2" />
          Break-Even Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          {beYear ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-chart-1/5 border border-chart-1/20 flex-1">
              <CheckCircle2 className="h-6 w-6 text-chart-1" />
              <div>
                <p className="text-lg font-bold text-foreground">Year {beYear}</p>
                <p className="text-xs text-muted-foreground">Cumulative cashflow turns positive</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20 flex-1">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div>
                <p className="text-lg font-bold text-foreground">Not Reached</p>
                <p className="text-xs text-muted-foreground">Cashflow does not break even within hold period</p>
              </div>
            </div>
          )}
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={years}>
            <defs>
              <linearGradient id="gCumCF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `Y${v}`} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => fmtB(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmtIDR(v), 'Cumulative Cashflow']} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: 'Break-Even', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <Area type="monotone" dataKey="cumulative_cashflow" stroke="hsl(var(--chart-2))" fill="url(#gCumCF)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════════════
// CASHFLOW CHART
// ═══════════════════════════════════════════════════
const CashflowChart: React.FC<{ output: SimulationOutput }> = ({ output }) => (
  <Card className="border-border/50">
    <CardHeader className="pb-2">
      <CardTitle className="text-base flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        Annual Net Cashflow
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={output.years}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `Y${v}`} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => fmtB(v)} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmtIDR(v), 'Net Cashflow']} />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
          <Bar dataKey="annual_cashflow" radius={[4, 4, 0, 0]} name="Net Cashflow">
            {output.years.map((y, i) => (
              <Cell key={i} fill={y.annual_cashflow >= 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--destructive))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// ═══════════════════════════════════════════════════
// CASH-ON-CASH CHART
// ═══════════════════════════════════════════════════
const CashOnCashChart: React.FC<{ output: SimulationOutput }> = ({ output }) => (
  <Card className="border-border/50">
    <CardHeader className="pb-2">
      <CardTitle className="text-base flex items-center gap-2">
        <Gauge className="h-4 w-4 text-chart-4" />
        Cash-on-Cash Return & Annualized ROI
      </CardTitle>
      <CardDescription>Year-over-year capital efficiency</CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={output.years}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `Y${v}`} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`${v}%`, name]} />
          <Line type="monotone" dataKey="cash_on_cash_pct" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} name="Cash-on-Cash %" />
          <Line type="monotone" dataKey="annualized_roi_pct" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Annualized ROI %" />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default InvestmentScenarioSimulatorPage;
