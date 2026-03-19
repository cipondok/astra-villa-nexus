import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, Droplets, Shield, Plus, Download, GitCompare,
  Building2, ArrowUpRight, ArrowDownRight, Zap, BarChart3, MapPin,
  ChevronRight, Lightbulb, LineChart, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const timeRanges = ['6M', '1Y', '3Y', '5Y'] as const;
type TimeRange = typeof timeRanges[number];

const chartData: Record<TimeRange, { month: string; value: number }[]> = {
  '6M': [
    { month: 'Oct', value: 12.4 }, { month: 'Nov', value: 12.7 }, { month: 'Dec', value: 12.5 },
    { month: 'Jan', value: 13.1 }, { month: 'Feb', value: 13.6 }, { month: 'Mar', value: 14.2 },
  ],
  '1Y': [
    { month: 'Apr', value: 10.8 }, { month: 'Jun', value: 11.2 }, { month: 'Aug', value: 11.5 },
    { month: 'Oct', value: 12.4 }, { month: 'Dec', value: 12.5 }, { month: 'Mar', value: 14.2 },
  ],
  '3Y': [
    { month: '2023', value: 7.2 }, { month: 'H2', value: 8.5 }, { month: '2024', value: 10.1 },
    { month: 'H2', value: 11.8 }, { month: '2025', value: 12.5 }, { month: 'Now', value: 14.2 },
  ],
  '5Y': [
    { month: '2021', value: 4.8 }, { month: '2022', value: 6.2 }, { month: '2023', value: 8.5 },
    { month: '2024', value: 11.0 }, { month: '2025', value: 12.5 }, { month: 'Proj', value: 18.6 },
  ],
};

const kpis = [
  { label: 'Total Portfolio Value', value: 'IDR 14.2B', icon: DollarSign, delta: '+8.4%', up: true, accent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10' },
  { label: 'Est. Appreciation', value: '+12.6%', icon: TrendingUp, delta: 'vs 9.2% market avg', up: true, accent: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10' },
  { label: 'Avg Rental Yield', value: '7.8%', icon: Droplets, delta: '+0.6% QoQ', up: true, accent: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10' },
  { label: 'Liquidity Strength', value: 'Strong', icon: Shield, delta: '82/100 score', up: true, accent: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10' },
];

const properties = [
  { name: 'Villa Harmony Canggu', location: 'Canggu, Bali', purchase: 'IDR 3.2B', current: 'IDR 3.9B', yield: 8.2, score: 88, scoreTrend: 'up', liquidity: 'high', img: '🏡' },
  { name: 'Menteng Townhouse', location: 'South Jakarta', purchase: 'IDR 5.1B', current: 'IDR 5.6B', yield: 6.4, score: 76, scoreTrend: 'stable', liquidity: 'medium', img: '🏢' },
  { name: 'Ubud Retreat Villa', location: 'Ubud, Bali', purchase: 'IDR 2.0B', current: 'IDR 2.5B', yield: 9.1, score: 92, scoreTrend: 'up', liquidity: 'high', img: '🌴' },
  { name: 'Bandung Hills Apartment', location: 'Bandung', purchase: 'IDR 1.4B', current: 'IDR 1.6B', yield: 7.0, score: 71, scoreTrend: 'down', liquidity: 'medium', img: '🏙️' },
  { name: 'Lombok Bay Land', location: 'Kuta Lombok', purchase: 'IDR 0.8B', current: 'IDR 1.1B', yield: 0, score: 85, scoreTrend: 'up', liquidity: 'low', img: '🏖️' },
];

const insights = [
  { text: 'Urban rental units outperforming villas this quarter — consider rebalancing exposure.', type: 'trend' },
  { text: 'Consider diversifying into emerging Bandung districts with 14% projected growth.', type: 'action' },
  { text: 'Ubud Retreat Villa yield increased 1.2% — top performer in portfolio.', type: 'highlight' },
  { text: 'Lombok Bay land valuation up 37% since acquisition — monitor exit window.', type: 'alert' },
];

const liquidityIcons: Record<string, { color: string; label: string }> = {
  high: { color: 'text-emerald-500', label: 'High' },
  medium: { color: 'text-amber-500', label: 'Med' },
  low: { color: 'text-red-500', label: 'Low' },
};

const InvestmentPerformanceTracker = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const data = chartData[timeRange];
  const maxVal = Math.max(...data.map(d => d.value));
  const minVal = Math.min(...data.map(d => d.value));
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - ((d.value - minVal) / range) * 80 - 10,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L 100 100 L 0 100 Z`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="secondary" className="text-[10px]">PORTFOLIO AI</Badge>
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mt-2">Investment Performance Tracker</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Real-time portfolio intelligence and asset performance monitoring</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success('Performance report downloading...')}>
                <Download className="w-4 h-4 mr-2" /> Report
              </Button>
              <Button size="sm" onClick={() => toast.success('Add investment form opened')}>
                <Plus className="w-4 h-4 mr-2" /> Add Investment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
              >
                <div className={`p-2.5 rounded-xl ${kpi.accent}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    {kpi.up && <ArrowUpRight className="w-3 h-3" />} {kpi.delta}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chart + Properties */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Growth Chart */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Portfolio Value Growth</h2>
                  <p className="text-sm text-muted-foreground">Tracked appreciation across all holdings</p>
                </div>
                <div className="flex bg-muted rounded-lg p-0.5">
                  {timeRanges.map(tr => (
                    <button
                      key={tr}
                      onClick={() => setTimeRange(tr)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        timeRange === tr
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative h-56">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border))" strokeWidth="0.3" />
                  ))}
                  <motion.path
                    d={areaPath}
                    fill="url(#chartFill)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  <motion.path
                    d={linePath}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="1.2" fill="hsl(var(--primary))" />
                  ))}
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                  {data.map((d, i) => (
                    <span key={i} className="text-[10px] text-muted-foreground">{d.month}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Current: <strong className="text-foreground">IDR {data[data.length - 1].value}B</strong></span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +{((data[data.length - 1].value - data[0].value) / data[0].value * 100).toFixed(1)}% period return
                </span>
              </div>
            </motion.div>

            {/* Property Performance Cards */}
            <div>
              <h2 className="text-base font-semibold text-foreground mb-4">Asset Performance</h2>
              <div className="space-y-3">
                {properties.map((prop, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                        {prop.img}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-foreground truncate">{prop.name}</h3>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="text-[10px]">
                              Score: {prop.score}
                            </Badge>
                            {prop.scoreTrend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />}
                            {prop.scoreTrend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {prop.location}
                        </p>
                        <div className="flex items-center gap-6 mt-2">
                          <div className="text-xs">
                            <span className="text-muted-foreground">Purchased: </span>
                            <span className="text-foreground font-medium">{prop.purchase}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">Current: </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{prop.current}</span>
                          </div>
                          {prop.yield > 0 && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">Yield: </span>
                              <span className="text-foreground font-medium">{prop.yield}%</span>
                            </div>
                          )}
                          <div className={`text-xs font-medium ${liquidityIcons[prop.liquidity].color} ml-auto flex items-center gap-1`}>
                            <Droplets className="w-3 h-3" /> {liquidityIcons[prop.liquidity].label}
                          </div>
                        </div>
                        {prop.yield > 0 && (
                          <div className="mt-2 w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${(prop.yield / 12) * 100}%` }}
                              transition={{ delay: 0.3 + i * 0.08, duration: 0.8 }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Row */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => toast.success('Scenario projection opened')}>
                <GitCompare className="w-4 h-4 mr-2" /> Compare Scenario Projection
              </Button>
            </div>
          </div>

          {/* Right: AI Insights */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-card p-6 sticky top-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lightbulb className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">AI Portfolio Intelligence</h3>
              </div>

              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="p-3.5 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {insight.type === 'trend' && <TrendingUp className="w-3.5 h-3.5 text-blue-500" />}
                        {insight.type === 'action' && <Target className="w-3.5 h-3.5 text-violet-500" />}
                        {insight.type === 'highlight' && <Zap className="w-3.5 h-3.5 text-emerald-500" />}
                        {insight.type === 'alert' && <LineChart className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                        {insight.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Portfolio Health</h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'Diversification', value: 72, status: 'Good' },
                    { label: 'Risk Exposure', value: 35, status: 'Low' },
                    { label: 'Growth Alignment', value: 88, status: 'Excellent' },
                  ].map((metric, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <span className="text-foreground font-medium">{metric.status}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 p-4 rounded-xl border border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Stats</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Assets</span><span className="text-foreground font-medium">5 properties</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Avg Hold Period</span><span className="text-foreground font-medium">14 months</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Best Performer</span><span className="text-foreground font-medium">Ubud Retreat</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Next Review</span><span className="text-foreground font-medium">April 1, 2026</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentPerformanceTracker;
