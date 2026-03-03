import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend } from 'recharts';
import Price from '@/components/ui/Price';
import {
  Loader2, Briefcase, TrendingUp, ShieldAlert, PieChart as PieIcon,
  DollarSign, Target, BarChart3, AlertTriangle, CheckCircle2, X,
} from 'lucide-react';

interface PropertyOption {
  id: string;
  title: string;
  city: string;
  price: number;
  property_type: string;
}

interface PropertyResult {
  property_id: string;
  title: string;
  city: string;
  property_type: string;
  purchase_price: number;
  projected_value: number;
  net_profit: number;
  roi_percent: number;
  annualized_return: number;
  investment_score: number;
  heat_score: number;
  days_to_sell: number;
  annual_rental_income: number;
}

interface PortfolioResponse {
  hold_years: number;
  property_count: number;
  properties: PropertyResult[];
  aggregation: {
    total_investment: number;
    projected_portfolio_value: number;
    total_profit: number;
    blended_roi_percent: number;
    total_annual_rental_income: number;
    avg_heat_score: number;
    avg_days_to_sell: number;
  };
  risk: {
    risk_score: number;
    risk_level: string;
    risk_factors: string[];
  };
  diversification: {
    cities: Record<string, number>;
    property_types: Record<string, number>;
    unique_cities: number;
    unique_property_types: number;
  };
}

const CHART_COLORS = [
  'hsl(152, 60%, 45%)', 'hsl(38, 90%, 55%)', 'hsl(220, 65%, 55%)',
  'hsl(340, 65%, 55%)', 'hsl(270, 55%, 55%)', 'hsl(180, 55%, 45%)',
  'hsl(15, 70%, 55%)', 'hsl(90, 50%, 45%)',
];

const PortfolioDashboard = () => {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [holdYears, setHoldYears] = useState('5');
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [result, setResult] = useState<PortfolioResponse | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase
        .from('properties')
        .select('id, title, city, price, property_type')
        .eq('status', 'published')
        .not('price', 'is', null)
        .gt('price', 0)
        .order('created_at', { ascending: false })
        .limit(200);
      setProperties(data || []);
      setLoadingProperties(false);
    };
    fetchProperties();
  }, []);

  const toggleProperty = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const removeProperty = (id: string) => {
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  const runAnalysis = async () => {
    if (selectedIds.length < 1) {
      setError('Please select at least 1 property');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setError('Please sign in to use this feature');
        setLoading(false);
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('core-engine', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          mode: 'portfolio_analysis',
          property_ids: selectedIds,
          hold_years: parseInt(holdYears),
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 40) return { color: 'hsl(152, 60%, 45%)', label: 'Low Risk', bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' };
    if (score <= 70) return { color: 'hsl(45, 90%, 50%)', label: 'Moderate', bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' };
    return { color: 'hsl(0, 70%, 50%)', label: 'High Risk', bg: 'bg-red-500/15', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/30' };
  };

  const filteredProperties = properties.filter(p =>
    !searchTerm || p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || p.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProperties = properties.filter(p => selectedIds.includes(p.id));

  const cityChartData = result ? Object.entries(result.diversification.cities).map(([name, value]) => ({ name, value })) : [];
  const typeChartData = result ? Object.entries(result.diversification.property_types).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-400/10 border border-emerald-500/20 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600 bg-clip-text text-transparent">
                Investor Portfolio Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">AI-powered portfolio analysis with risk scoring & diversification insights</p>
            </div>
          </div>
        </div>

        {/* Selection Panel */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500" />
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Build Your Portfolio</CardTitle>
            <p className="text-sm text-muted-foreground">Select properties and hold period to run portfolio analysis</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected chips */}
            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedProperties.map(p => (
                  <Badge key={p.id} variant="secondary" className="gap-1.5 py-1 px-2.5 text-xs">
                    {p.title?.slice(0, 30) || p.id.slice(0, 8)} · {p.city}
                    <button onClick={() => removeProperty(p.id)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <span className="text-xs text-muted-foreground self-center">{selectedIds.length} selected</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
              {/* Property multi-select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Properties</Label>
                <input
                  type="text"
                  placeholder={loadingProperties ? 'Loading properties...' : 'Search properties...'}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loadingProperties}
                />
                <ScrollArea className="h-[200px] rounded-md border border-border/50 bg-background/30">
                  <div className="p-2 space-y-0.5">
                    {filteredProperties.map(p => (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={selectedIds.includes(p.id)}
                          onCheckedChange={() => toggleProperty(p.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.city} · {p.property_type} · <Price amount={p.price} short /></p>
                        </div>
                      </label>
                    ))}
                    {filteredProperties.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No properties found</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Hold Period + Action */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Hold Period</Label>
                  <Select value={holdYears} onValueChange={setHoldYears}>
                    <SelectTrigger className="border-border/50 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 7, 10, 15, 20].map(y => (
                        <SelectItem key={y} value={String(y)}>{y} Years</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={runAnalysis}
                  disabled={loading || selectedIds.length < 1}
                  className="w-full bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-emerald-700 hover:to-amber-600 text-white shadow-lg shadow-emerald-500/20"
                  size="lg"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</>
                  ) : (
                    <><Briefcase className="h-4 w-4 mr-2" />Run Portfolio Analysis</>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <KpiCard
                  icon={<DollarSign className="h-5 w-5" />}
                  label="Total Investment"
                  value={<Price amount={result.aggregation.total_investment} short />}
                  iconColor="text-blue-500"
                />
                <KpiCard
                  icon={<Target className="h-5 w-5" />}
                  label="Projected Value"
                  value={<Price amount={result.aggregation.projected_portfolio_value} short />}
                  iconColor="text-emerald-500"
                />
                <KpiCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Total Profit"
                  value={<Price amount={result.aggregation.total_profit} short />}
                  iconColor="text-amber-500"
                />
                <KpiCard
                  icon={<BarChart3 className="h-5 w-5" />}
                  label="Blended ROI"
                  value={`${result.aggregation.blended_roi_percent}%`}
                  iconColor="text-purple-500"
                />
                <KpiCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Annual Rental"
                  value={<Price amount={result.aggregation.total_annual_rental_income} short />}
                  iconColor="text-orange-500"
                />
              </div>

              {/* Charts + Risk Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* City Distribution */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PieIcon className="h-4 w-4 text-blue-500" /> City Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={cityChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                          {cityChartData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <ReTooltip />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Property Type Distribution */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PieIcon className="h-4 w-4 text-amber-500" /> Property Type Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={typeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                          {typeChartData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[(i + 3) % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <ReTooltip />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Risk Gauge */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-red-500" /> Portfolio Risk Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center gap-4">
                    <RiskGauge score={result.risk.risk_score} />
                    <div className="w-full space-y-2">
                      {result.risk.risk_factors.map((factor, i) => {
                        const riskStyle = getRiskColor(result.risk.risk_score);
                        return (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            {result.risk.risk_score <= 40 ? (
                              <CheckCircle2 className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${riskStyle.text}`} />
                            ) : (
                              <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${riskStyle.text}`} />
                            )}
                            <span className="text-muted-foreground">{factor}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Per-Property Breakdown Table */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-amber-500" />
                    Property Breakdown
                    <Badge variant="secondary" className="ml-2 text-xs">{result.hold_years}-Year Hold</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/30">
                          <th className="text-left font-semibold px-4 py-3">Property</th>
                          <th className="text-right font-semibold px-4 py-3">Purchase</th>
                          <th className="text-right font-semibold px-4 py-3">Projected Value</th>
                          <th className="text-right font-semibold px-4 py-3">Net Profit</th>
                          <th className="text-right font-semibold px-4 py-3">ROI %</th>
                          <th className="text-right font-semibold px-4 py-3">Annual Return</th>
                          <th className="text-center font-semibold px-4 py-3">Score</th>
                          <th className="text-center font-semibold px-4 py-3">Heat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.properties.map((p, i) => (
                          <tr key={p.property_id} className={`border-b border-border/30 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                            <td className="px-4 py-3">
                              <p className="font-medium truncate max-w-[200px]">{p.title}</p>
                              <p className="text-xs text-muted-foreground">{p.city} · {p.property_type}</p>
                            </td>
                            <td className="text-right px-4 py-3"><Price amount={p.purchase_price} short /></td>
                            <td className="text-right px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium"><Price amount={p.projected_value} short /></td>
                            <td className="text-right px-4 py-3 font-medium"><Price amount={p.net_profit} short /></td>
                            <td className="text-right px-4 py-3 font-bold">{p.roi_percent}%</td>
                            <td className="text-right px-4 py-3">{p.annualized_return}%</td>
                            <td className="text-center px-4 py-3">
                              <Badge variant="outline" className="text-xs">{p.investment_score}/100</Badge>
                            </td>
                            <td className="text-center px-4 py-3">
                              <Badge variant="outline" className="text-xs">{p.heat_score}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── KPI Card ──
const KpiCard = ({ icon, label, value, iconColor }: { icon: React.ReactNode; label: string; value: React.ReactNode; iconColor: string }) => (
  <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-md">
    <CardContent className="p-4 flex flex-col gap-2">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-current/10 to-current/5 flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </CardContent>
  </Card>
);

// ── Risk Gauge ──
const RiskGauge = ({ score }: { score: number }) => {
  const getRiskInfo = (s: number) => {
    if (s <= 40) return { color: 'hsl(152, 60%, 45%)', label: 'Low Risk', stroke: 'stroke-emerald-500' };
    if (s <= 70) return { color: 'hsl(45, 90%, 50%)', label: 'Moderate', stroke: 'stroke-amber-500' };
    return { color: 'hsl(0, 70%, 50%)', label: 'High Risk', stroke: 'stroke-red-500' };
  };

  const info = getRiskInfo(score);
  const radius = 60;
  const circumference = Math.PI * radius; // semicircle
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-[160px] h-[100px]">
      <svg viewBox="0 0 160 100" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 10 90 A 60 60 0 0 1 150 90"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d="M 10 90 A 60 60 0 0 1 150 90"
          fill="none"
          stroke={info.color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
        <span className="text-2xl font-black" style={{ color: info.color }}>{score}</span>
        <span className="text-[10px] font-semibold text-muted-foreground">{info.label}</span>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
