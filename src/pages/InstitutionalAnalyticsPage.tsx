import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, TrendingDown, DollarSign, MapPin,
  Target, Shield, AlertTriangle, Building2, Loader2, Globe,
  BarChart3, PieChart, Download, Search, ChevronRight,
  Layers, Activity, Eye, Zap, ArrowUpRight, ArrowDownRight,
  FileText, Briefcase, Filter, Hash, Gauge, Home
} from 'lucide-react';
import {
  BarChart, Bar, PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Treemap, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { useInstitutionalPortfolio, type GeoExposure, type PipelineCandidate, type CityOutlook } from '@/hooks/useInstitutionalPortfolio';

const fmtIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
const fmtB = (n: number) => {
  if (Math.abs(n) >= 1e12) return `Rp${(n / 1e12).toFixed(1)}T`;
  if (Math.abs(n) >= 1e9) return `Rp${(n / 1e9).toFixed(1)}M`;
  if (Math.abs(n) >= 1e6) return `Rp${(n / 1e6).toFixed(0)}jt`;
  return `Rp${n.toLocaleString('id-ID')}`;
};

const CHART_COLORS = [
  'hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))',
  'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))',
  'hsl(var(--accent))', 'hsl(var(--muted-foreground))',
];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  fontSize: 11,
  color: 'hsl(var(--popover-foreground))',
};

const GRADE_STYLES: Record<string, string> = {
  'A+': 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  'A': 'bg-primary/15 text-primary border-primary/30',
  'B+': 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  'B': 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  'C': 'bg-muted text-muted-foreground border-border',
};

const MOMENTUM_BADGE: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  ACCELERATING: { label: 'Accelerating', icon: <ArrowUpRight className="h-3 w-3" />, cls: 'bg-chart-1/10 text-chart-1 border-chart-1/20' },
  STABLE: { label: 'Stable', icon: <Activity className="h-3 w-3" />, cls: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  DECELERATING: { label: 'Decelerating', icon: <ArrowDownRight className="h-3 w-3" />, cls: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const InstitutionalAnalyticsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, error } = useInstitutionalPortfolio();
  const [pipelineFilter, setPipelineFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-[1440px]">
        {/* Header */}
        <div className="mb-8">
          <Link to="/user-dashboard">
            <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
            </Button>
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center border border-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Institutional Analytics</h1>
                <p className="text-sm text-muted-foreground">Enterprise-grade portfolio intelligence for capital allocation decisions</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs border-primary/20 text-primary gap-1">
              <Globe className="h-3 w-3" /> Live Market Data
            </Badge>
          </div>
        </div>

        {isLoading ? <LoadingSkeleton /> : error ? (
          <Card className="border-destructive/30 bg-destructive/5 p-8 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive">Failed to load institutional data. Please retry.</p>
          </Card>
        ) : data ? (
          <>
            {/* KPI Bar */}
            <InstitutionalKPIs data={data} />

            <Tabs defaultValue="exposure" className="mt-8">
              <TabsList className="grid w-full grid-cols-3 h-10">
                <TabsTrigger value="exposure" className="text-xs gap-1"><MapPin className="h-3.5 w-3.5" />Portfolio Exposure</TabsTrigger>
                <TabsTrigger value="pipeline" className="text-xs gap-1"><Target className="h-3.5 w-3.5" />Opportunity Pipeline</TabsTrigger>
                <TabsTrigger value="reports" className="text-xs gap-1"><FileText className="h-3.5 w-3.5" />Market Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="exposure" className="mt-6 space-y-6">
                <ExposureHeatView data={data} />
              </TabsContent>

              <TabsContent value="pipeline" className="mt-6 space-y-6">
                <OpportunityPipeline
                  pipeline={data.pipeline}
                  filter={pipelineFilter}
                  onFilterChange={setPipelineFilter}
                  search={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </TabsContent>

              <TabsContent value="reports" className="mt-6 space-y-6">
                <MarketReports outlooks={data.city_outlooks} />
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// KPIs
// ═══════════════════════════════════════════════════
const InstitutionalKPIs: React.FC<{ data: ReturnType<typeof useInstitutionalPortfolio>['data'] }> = ({ data }) => {
  if (!data) return null;
  const { totals } = data;
  const kpis = [
    { label: 'Total Market Exposure', value: fmtB(totals.total_market_value), icon: <DollarSign className="h-4 w-4" />, color: 'text-primary' },
    { label: 'Active Listings', value: totals.total_listings.toLocaleString(), icon: <Building2 className="h-4 w-4" />, color: 'text-chart-1' },
    { label: 'Avg Investment Score', value: `${totals.avg_investment_score}/100`, icon: <Target className="h-4 w-4" />, color: 'text-chart-2' },
    { label: 'Market Heat Index', value: `${totals.avg_heat}/100`, icon: <Zap className="h-4 w-4" />, color: 'text-chart-3' },
    { label: 'Geographic Reach', value: `${totals.unique_cities} cities`, icon: <MapPin className="h-4 w-4" />, color: 'text-chart-4' },
    { label: 'Province Coverage', value: `${totals.unique_provinces} provinces`, icon: <Globe className="h-4 w-4" />, color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((kpi, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <Card className="border-border/50 hover:border-primary/20 transition-colors">
            <CardContent className="pt-3 pb-2.5 px-3">
              <div className={`flex items-center gap-1.5 mb-1 ${kpi.color}`}>
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
// EXPOSURE HEAT VIEW
// ═══════════════════════════════════════════════════
const ExposureHeatView: React.FC<{ data: NonNullable<ReturnType<typeof useInstitutionalPortfolio>['data']> }> = ({ data }) => {
  const { geo_exposure, asset_classes } = data;
  const top10 = geo_exposure.slice(0, 10);
  const maxHeat = Math.max(...top10.map(g => g.avg_heat_score), 1);

  // Treemap data for geographic concentration
  const treemapData = top10.map((g, i) => ({
    name: g.city,
    size: g.total_value,
    score: g.avg_investment_score,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // HHI calculation for concentration risk
  const hhi = geo_exposure.reduce((s, g) => s + Math.pow(g.weight_pct, 2), 0);
  const concentrationLevel = hhi > 2500 ? 'HIGH' : hhi > 1500 ? 'MODERATE' : 'LOW';
  const concentrationColor = hhi > 2500 ? 'text-destructive' : hhi > 1500 ? 'text-chart-3' : 'text-chart-1';

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic Heat Table */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Geographic Investment Concentration
            </CardTitle>
            <CardDescription>City-level exposure weighted by total asset value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 text-[10px] text-muted-foreground uppercase tracking-wider px-3 pb-1 border-b border-border/30">
                <span className="col-span-3">City</span>
                <span className="col-span-2 text-right">Value</span>
                <span className="col-span-1 text-right">Listings</span>
                <span className="col-span-2 text-right">Inv. Score</span>
                <span className="col-span-2">Heat</span>
                <span className="col-span-2 text-right">Weight</span>
              </div>
              {top10.map((g, i) => (
                <motion.div
                  key={g.city}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-12 items-center px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors text-xs"
                >
                  <div className="col-span-3">
                    <p className="font-medium text-foreground truncate">{g.city}</p>
                    <p className="text-[10px] text-muted-foreground">{g.province}</p>
                  </div>
                  <p className="col-span-2 text-right font-medium text-foreground">{fmtB(g.total_value)}</p>
                  <p className="col-span-1 text-right text-muted-foreground">{g.listing_count}</p>
                  <div className="col-span-2 flex justify-end">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${g.avg_investment_score >= 70 ? 'border-chart-1/30 text-chart-1' : g.avg_investment_score >= 50 ? 'border-chart-4/30 text-chart-4' : 'border-border text-muted-foreground'}`}>
                      {g.avg_investment_score}
                    </Badge>
                  </div>
                  <div className="col-span-2 px-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(g.avg_heat_score / maxHeat) * 100}%`,
                          background: g.avg_heat_score >= 70 ? 'hsl(var(--chart-1))' : g.avg_heat_score >= 45 ? 'hsl(var(--chart-4))' : 'hsl(var(--muted-foreground))',
                        }}
                      />
                    </div>
                  </div>
                  <p className="col-span-2 text-right font-bold text-foreground">{g.weight_pct}%</p>
                </motion.div>
              ))}
            </div>

            {/* Concentration Risk Indicator */}
            <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Herfindahl-Hirschman Index (HHI)</p>
                <p className="text-sm font-bold text-foreground">{Math.round(hhi)}</p>
              </div>
              <Badge variant="outline" className={`text-xs ${concentrationColor}`}>
                <Shield className="h-3 w-3 mr-1" /> {concentrationLevel} Concentration
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Asset Class Donut */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-chart-4" />
              Asset Class Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RPieChart>
                <Pie
                  data={asset_classes}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                  dataKey="total_value"
                  nameKey="asset_class"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {asset_classes.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmtB(v), 'Value']} />
              </RPieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {asset_classes.slice(0, 6).map((ac, i) => (
                <div key={ac.asset_class} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-muted-foreground">{ac.asset_class}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-foreground font-medium">{ac.weight_pct}%</span>
                    <span className="text-muted-foreground text-[10px]">{ac.count} assets</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Value Distribution Bar Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-chart-2" />
            City Value Distribution — Top 10 Markets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={top10} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => fmtB(v)} />
              <YAxis type="category" dataKey="city" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={90} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmtIDR(v), 'Total Value']} />
              <Bar dataKey="total_value" radius={[0, 4, 4, 0]} name="Total Value">
                {top10.map((g, i) => (
                  <Cell key={i} fill={g.avg_heat_score >= 70 ? 'hsl(var(--chart-1))' : g.avg_heat_score >= 45 ? 'hsl(var(--chart-4))' : 'hsl(var(--primary))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};

// ═══════════════════════════════════════════════════
// OPPORTUNITY PIPELINE
// ═══════════════════════════════════════════════════
const OpportunityPipeline: React.FC<{
  pipeline: PipelineCandidate[];
  filter: string;
  onFilterChange: (v: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
}> = ({ pipeline, filter, onFilterChange, search, onSearchChange }) => {
  const filtered = pipeline
    .filter(p => filter === 'all' || p.opportunity_grade === filter)
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()));

  const gradeDistribution = ['A+', 'A', 'B+', 'B', 'C'].map(g => ({
    grade: g,
    count: pipeline.filter(p => p.opportunity_grade === g).length,
  }));

  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or city..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 text-sm h-9"
          />
        </div>
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-36 h-9 text-xs">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            <SelectItem value="A+">A+ Only</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B+">B+</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
          </SelectContent>
        </Select>

        {/* Grade distribution pills */}
        <div className="flex items-center gap-1.5 ml-auto">
          {gradeDistribution.map(g => (
            <Badge key={g.grade} variant="outline" className={`text-[10px] px-2 py-0.5 cursor-pointer ${GRADE_STYLES[g.grade]}`} onClick={() => onFilterChange(filter === g.grade ? 'all' : g.grade)}>
              {g.grade}: {g.count}
            </Badge>
          ))}
        </div>
      </div>

      {/* Pipeline Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-chart-1" />
            Bulk Acquisition Candidates
            <Badge variant="outline" className="ml-auto text-[10px]">{filtered.length} listings</Badge>
          </CardTitle>
          <CardDescription>Ranked by risk-adjusted return potential</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Table header */}
          <div className="grid grid-cols-12 text-[10px] text-muted-foreground uppercase tracking-wider px-3 pb-2 border-b border-border/30">
            <span className="col-span-4">Property</span>
            <span className="col-span-2 text-right">Price</span>
            <span className="col-span-1 text-center">Grade</span>
            <span className="col-span-1 text-right">Score</span>
            <span className="col-span-1 text-right">Heat</span>
            <span className="col-span-1 text-right">Yield</span>
            <span className="col-span-2 text-right">Risk-Adj Return</span>
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-0.5 mt-1">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="grid grid-cols-12 items-center px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors text-xs group"
              >
                <div className="col-span-4 min-w-0">
                  <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground">{p.city} • {p.property_type}</p>
                </div>
                <p className="col-span-2 text-right font-medium text-foreground">{fmtB(p.price)}</p>
                <div className="col-span-1 flex justify-center">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-bold ${GRADE_STYLES[p.opportunity_grade]}`}>
                    {p.opportunity_grade}
                  </Badge>
                </div>
                <p className="col-span-1 text-right text-foreground font-medium">{p.investment_score}</p>
                <p className={`col-span-1 text-right font-medium ${p.demand_heat_score >= 65 ? 'text-chart-1' : 'text-muted-foreground'}`}>{p.demand_heat_score}</p>
                <p className="col-span-1 text-right text-chart-4 font-medium">{p.rental_yield_est}%</p>
                <p className={`col-span-2 text-right font-bold ${p.risk_adjusted_return >= 5 ? 'text-chart-1' : 'text-foreground'}`}>
                  {p.risk_adjusted_return}%
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk-Adjusted Return Distribution */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            Risk-Adjusted Return Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={filtered.slice(0, 20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="city" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`${v}%`, name]} />
              <Bar dataKey="risk_adjusted_return" name="Risk-Adj Return" radius={[4, 4, 0, 0]}>
                {filtered.slice(0, 20).map((p, i) => (
                  <Cell key={i} fill={p.risk_adjusted_return >= 5 ? 'hsl(var(--chart-1))' : p.risk_adjusted_return >= 3 ? 'hsl(var(--chart-4))' : 'hsl(var(--muted-foreground))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};

// ═══════════════════════════════════════════════════
// MARKET REPORTS
// ═══════════════════════════════════════════════════
const MarketReports: React.FC<{ outlooks: CityOutlook[] }> = ({ outlooks }) => {
  const downloadReport = (city: CityOutlook) => {
    const report = [
      `ASTRA VILLA — City Investment Outlook Report`,
      `Generated: ${new Date().toISOString().split('T')[0]}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `CITY: ${city.city}, ${city.province}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `MARKET SUMMARY`,
      `  Active Listings:       ${city.total_listings}`,
      `  Average Price:         ${fmtIDR(city.avg_price)}`,
      `  Investment Score:      ${city.avg_investment_score}/100`,
      `  Demand Heat Index:     ${city.avg_heat_score}/100`,
      `  YoY Price Growth:      ${city.yoy_price_growth > 0 ? '+' : ''}${city.yoy_price_growth}%`,
      `  Trend Momentum:        ${city.momentum}`,
      `  Risk Level:            ${city.risk_level}`,
      `  Dominant Asset Type:   ${city.top_asset_type}`,
      ``,
      `STRATEGIC OUTLOOK`,
      `  ${city.outlook_summary}`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `DISCLAIMER: This report is generated from ASTRA Villa's`,
      `AI intelligence engine for informational purposes only.`,
      `Not investment advice. Past performance ≠ future results.`,
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ASTRA_Outlook_${city.city.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Momentum Overview Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-chart-2" />
            City Momentum & Investment Score Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={outlooks} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis type="category" dataKey="city" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={85} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="avg_investment_score" name="Investment Score" fill="hsl(var(--primary))" radius={[0, 3, 3, 0]} barSize={10} />
              <Bar dataKey="avg_heat_score" name="Heat Index" fill="hsl(var(--chart-1))" radius={[0, 3, 3, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* City Outlook Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {outlooks.map((city, i) => {
          const mb = MOMENTUM_BADGE[city.momentum];
          return (
            <motion.div
              key={city.city}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="border-border/50 hover:border-primary/20 transition-all group h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-foreground">{city.city}</CardTitle>
                      <CardDescription className="text-[10px]">{city.province} • {city.total_listings} listings</CardDescription>
                    </div>
                    <Badge variant="outline" className={`text-[10px] gap-0.5 ${mb.cls}`}>
                      {mb.icon} {mb.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Avg Price</p>
                      <p className="text-xs font-bold text-foreground">{fmtB(city.avg_price)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">YoY Growth</p>
                      <p className={`text-xs font-bold ${city.yoy_price_growth >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                        {city.yoy_price_growth > 0 ? '+' : ''}{city.yoy_price_growth}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Inv. Score</p>
                      <p className="text-xs font-bold text-foreground">{city.avg_investment_score}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Risk</p>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${city.risk_level === 'LOW' ? 'text-chart-1 border-chart-1/20' : city.risk_level === 'MODERATE' ? 'text-chart-3 border-chart-3/20' : 'text-destructive border-destructive/20'}`}>
                        {city.risk_level}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed flex-1 mb-3">{city.outlook_summary}</p>

                  <Button variant="outline" size="sm" className="w-full text-xs mt-auto" onClick={() => downloadReport(city)}>
                    <Download className="h-3 w-3 mr-1.5" /> Download Outlook Report
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════
const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  </div>
);

export default InstitutionalAnalyticsPage;
