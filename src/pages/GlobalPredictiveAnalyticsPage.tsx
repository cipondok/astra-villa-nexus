import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/SEOHead';
import {
  Globe, TrendingUp, TrendingDown, BarChart3, Gauge, Zap, Building2,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Minus, Brain, MapPin,
  Target, Layers, Sparkles, Shield, ChevronRight, Activity, Signal,
  Cpu, DollarSign, Flame, Users, Clock, CheckCircle2, XCircle,
  GitCompare, Radio, Radar as RadarIcon, Eye, Landmark, Home,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, Legend,
  ScatterChart, Scatter, ZAxis, ReferenceLine,
} from 'recharts';

const TT = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 10, fontSize: 11,
    color: 'hsl(var(--popover-foreground))',
  },
};

/* ═══════════════════════════════════════════════════════════
   GLOBAL MARKET DATA
   ═══════════════════════════════════════════════════════════ */

interface RegionData {
  region: string;
  demandIntensity: number;    // 0-100
  trendAcceleration: number;  // -20 to +20 momentum
  avgYield: number;
  avgGrowth: number;
  affordabilityPressure: number; // 0-100 (higher = more unaffordable)
  supplySaturation: number;      // 0-100
  bubbleRisk: number;            // 0-100
  capitalInflow: number;         // 0-100
  cities: CityData[];
}

interface CityData {
  city: string;
  country: string;
  flag: string;
  region: string;
  demandScore: number;        // 0-100
  yieldPct: number;
  growthPct: number;
  affordabilityIndex: number; // 0-100 (100=most affordable)
  supplySaturation: number;   // 0-100
  investmentAttractiveness: number; // 0-100
  trendMomentum: number;      // -10 to +10
  growthProbability5yr: number; // 0-100%
  priceIndex: number;
  riskLevel: 'low' | 'moderate' | 'high';
  cyclePhase: 'recovery' | 'expansion' | 'peak' | 'correction';
  foreignBuyerPct: number;
  rentalDemand: number;       // 0-100
}

const REGIONS: RegionData[] = [
  {
    region: 'Southeast Asia',
    demandIntensity: 82, trendAcceleration: 8.2,
    avgYield: 6.1, avgGrowth: 7.4,
    affordabilityPressure: 38, supplySaturation: 32, bubbleRisk: 22, capitalInflow: 78,
    cities: [
      { city: 'Jakarta', country: 'Indonesia', flag: '🇮🇩', region: 'Southeast Asia', demandScore: 85, yieldPct: 7.2, growthPct: 8.5, affordabilityIndex: 72, supplySaturation: 35, investmentAttractiveness: 82, trendMomentum: 6.8, growthProbability5yr: 88, priceIndex: 112, riskLevel: 'moderate', cyclePhase: 'expansion', foreignBuyerPct: 12, rentalDemand: 78 },
      { city: 'Bali', country: 'Indonesia', flag: '🇮🇩', region: 'Southeast Asia', demandScore: 91, yieldPct: 8.5, growthPct: 9.2, affordabilityIndex: 55, supplySaturation: 48, investmentAttractiveness: 88, trendMomentum: 4.2, growthProbability5yr: 82, priceIndex: 135, riskLevel: 'moderate', cyclePhase: 'peak', foreignBuyerPct: 45, rentalDemand: 92 },
      { city: 'Bangkok', country: 'Thailand', flag: '🇹🇭', region: 'Southeast Asia', demandScore: 76, yieldPct: 5.8, growthPct: 6.2, affordabilityIndex: 68, supplySaturation: 42, investmentAttractiveness: 74, trendMomentum: 3.5, growthProbability5yr: 78, priceIndex: 108, riskLevel: 'low', cyclePhase: 'expansion', foreignBuyerPct: 18, rentalDemand: 72 },
      { city: 'Ho Chi Minh', country: 'Vietnam', flag: '🇻🇳', region: 'Southeast Asia', demandScore: 88, yieldPct: 6.5, growthPct: 9.1, affordabilityIndex: 78, supplySaturation: 28, investmentAttractiveness: 85, trendMomentum: 8.1, growthProbability5yr: 91, priceIndex: 98, riskLevel: 'moderate', cyclePhase: 'expansion', foreignBuyerPct: 8, rentalDemand: 80 },
      { city: 'Singapore', country: 'Singapore', flag: '🇸🇬', region: 'Southeast Asia', demandScore: 72, yieldPct: 3.2, growthPct: 3.5, affordabilityIndex: 15, supplySaturation: 55, investmentAttractiveness: 68, trendMomentum: 1.2, growthProbability5yr: 72, priceIndex: 195, riskLevel: 'low', cyclePhase: 'peak', foreignBuyerPct: 22, rentalDemand: 85 },
      { city: 'Kuala Lumpur', country: 'Malaysia', flag: '🇲🇾', region: 'Southeast Asia', demandScore: 65, yieldPct: 5.1, growthPct: 4.8, affordabilityIndex: 70, supplySaturation: 38, investmentAttractiveness: 70, trendMomentum: 2.8, growthProbability5yr: 75, priceIndex: 92, riskLevel: 'low', cyclePhase: 'recovery', foreignBuyerPct: 14, rentalDemand: 60 },
    ],
  },
  {
    region: 'Middle East',
    demandIntensity: 78, trendAcceleration: 6.5,
    avgYield: 5.8, avgGrowth: 7.2,
    affordabilityPressure: 45, supplySaturation: 40, bubbleRisk: 30, capitalInflow: 85,
    cities: [
      { city: 'Dubai', country: 'UAE', flag: '🇦🇪', region: 'Middle East', demandScore: 90, yieldPct: 6.0, growthPct: 7.8, affordabilityIndex: 42, supplySaturation: 45, investmentAttractiveness: 86, trendMomentum: 5.5, growthProbability5yr: 80, priceIndex: 145, riskLevel: 'moderate', cyclePhase: 'expansion', foreignBuyerPct: 55, rentalDemand: 88 },
      { city: 'Abu Dhabi', country: 'UAE', flag: '🇦🇪', region: 'Middle East', demandScore: 72, yieldPct: 5.5, growthPct: 6.2, affordabilityIndex: 48, supplySaturation: 35, investmentAttractiveness: 75, trendMomentum: 4.2, growthProbability5yr: 76, priceIndex: 128, riskLevel: 'low', cyclePhase: 'expansion', foreignBuyerPct: 40, rentalDemand: 70 },
      { city: 'Riyadh', country: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East', demandScore: 68, yieldPct: 5.2, growthPct: 8.5, affordabilityIndex: 55, supplySaturation: 22, investmentAttractiveness: 72, trendMomentum: 7.8, growthProbability5yr: 85, priceIndex: 105, riskLevel: 'moderate', cyclePhase: 'expansion', foreignBuyerPct: 5, rentalDemand: 65 },
    ],
  },
  {
    region: 'Europe',
    demandIntensity: 62, trendAcceleration: 2.1,
    avgYield: 4.2, avgGrowth: 4.5,
    affordabilityPressure: 68, supplySaturation: 52, bubbleRisk: 35, capitalInflow: 55,
    cities: [
      { city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', region: 'Europe', demandScore: 75, yieldPct: 4.8, growthPct: 5.5, affordabilityIndex: 52, supplySaturation: 42, investmentAttractiveness: 76, trendMomentum: 3.2, growthProbability5yr: 78, priceIndex: 115, riskLevel: 'low', cyclePhase: 'expansion', foreignBuyerPct: 32, rentalDemand: 82 },
      { city: 'Barcelona', country: 'Spain', flag: '🇪🇸', region: 'Europe', demandScore: 70, yieldPct: 4.2, growthPct: 5.0, affordabilityIndex: 45, supplySaturation: 48, investmentAttractiveness: 72, trendMomentum: 2.5, growthProbability5yr: 74, priceIndex: 125, riskLevel: 'low', cyclePhase: 'expansion', foreignBuyerPct: 28, rentalDemand: 78 },
      { city: 'Athens', country: 'Greece', flag: '🇬🇷', region: 'Europe', demandScore: 68, yieldPct: 5.2, growthPct: 6.8, affordabilityIndex: 65, supplySaturation: 30, investmentAttractiveness: 74, trendMomentum: 5.8, growthProbability5yr: 80, priceIndex: 88, riskLevel: 'moderate', cyclePhase: 'recovery', foreignBuyerPct: 22, rentalDemand: 75 },
      { city: 'Berlin', country: 'Germany', flag: '🇩🇪', region: 'Europe', demandScore: 60, yieldPct: 3.5, growthPct: 3.2, affordabilityIndex: 38, supplySaturation: 62, investmentAttractiveness: 58, trendMomentum: -1.2, growthProbability5yr: 62, priceIndex: 155, riskLevel: 'low', cyclePhase: 'correction', foreignBuyerPct: 15, rentalDemand: 85 },
    ],
  },
  {
    region: 'East Asia & Oceania',
    demandIntensity: 58, trendAcceleration: 1.5,
    avgYield: 3.8, avgGrowth: 3.8,
    affordabilityPressure: 75, supplySaturation: 58, bubbleRisk: 42, capitalInflow: 48,
    cities: [
      { city: 'Tokyo', country: 'Japan', flag: '🇯🇵', region: 'East Asia & Oceania', demandScore: 72, yieldPct: 4.5, growthPct: 3.0, affordabilityIndex: 35, supplySaturation: 45, investmentAttractiveness: 70, trendMomentum: 2.5, growthProbability5yr: 68, priceIndex: 165, riskLevel: 'low', cyclePhase: 'expansion', foreignBuyerPct: 10, rentalDemand: 82 },
      { city: 'Sydney', country: 'Australia', flag: '🇦🇺', region: 'East Asia & Oceania', demandScore: 65, yieldPct: 3.8, growthPct: 4.2, affordabilityIndex: 22, supplySaturation: 55, investmentAttractiveness: 62, trendMomentum: 1.8, growthProbability5yr: 70, priceIndex: 185, riskLevel: 'low', cyclePhase: 'peak', foreignBuyerPct: 18, rentalDemand: 78 },
      { city: 'Seoul', country: 'South Korea', flag: '🇰🇷', region: 'East Asia & Oceania', demandScore: 62, yieldPct: 3.2, growthPct: 3.5, affordabilityIndex: 28, supplySaturation: 60, investmentAttractiveness: 58, trendMomentum: -0.5, growthProbability5yr: 60, priceIndex: 175, riskLevel: 'moderate', cyclePhase: 'correction', foreignBuyerPct: 5, rentalDemand: 72 },
    ],
  },
  {
    region: 'Americas',
    demandIntensity: 55, trendAcceleration: 0.8,
    avgYield: 4.0, avgGrowth: 4.0,
    affordabilityPressure: 72, supplySaturation: 48, bubbleRisk: 38, capitalInflow: 52,
    cities: [
      { city: 'Miami', country: 'USA', flag: '🇺🇸', region: 'Americas', demandScore: 78, yieldPct: 4.5, growthPct: 5.2, affordabilityIndex: 30, supplySaturation: 42, investmentAttractiveness: 75, trendMomentum: 3.2, growthProbability5yr: 76, priceIndex: 168, riskLevel: 'moderate', cyclePhase: 'expansion', foreignBuyerPct: 25, rentalDemand: 85 },
      { city: 'Mexico City', country: 'Mexico', flag: '🇲🇽', region: 'Americas', demandScore: 72, yieldPct: 5.5, growthPct: 6.8, affordabilityIndex: 75, supplySaturation: 30, investmentAttractiveness: 78, trendMomentum: 5.2, growthProbability5yr: 82, priceIndex: 78, riskLevel: 'moderate', cyclePhase: 'expansion', foreignBuyerPct: 12, rentalDemand: 70 },
      { city: 'São Paulo', country: 'Brazil', flag: '🇧🇷', region: 'Americas', demandScore: 58, yieldPct: 5.0, growthPct: 4.5, affordabilityIndex: 68, supplySaturation: 40, investmentAttractiveness: 62, trendMomentum: 1.8, growthProbability5yr: 65, priceIndex: 85, riskLevel: 'high', cyclePhase: 'recovery', foreignBuyerPct: 6, rentalDemand: 55 },
    ],
  },
];

const ALL_CITIES: CityData[] = REGIONS.flatMap(r => r.cities);

const phaseConfig = {
  recovery: { color: 'text-chart-2', bg: 'bg-chart-2/10 border-chart-2/30', label: 'Recovery' },
  expansion: { color: 'text-chart-1', bg: 'bg-chart-1/10 border-chart-1/30', label: 'Expansion' },
  peak: { color: 'text-chart-3', bg: 'bg-chart-3/10 border-chart-3/30', label: 'Peak' },
  correction: { color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', label: 'Correction' },
};

const riskConfig = {
  low: { color: 'text-chart-1', label: 'Low' },
  moderate: { color: 'text-chart-3', label: 'Moderate' },
  high: { color: 'text-destructive', label: 'High' },
};

const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const MomentumArrow = ({ v }: { v: number }) =>
  v > 3 ? <ArrowUpRight className="h-3.5 w-3.5 text-chart-1" /> :
  v > 0 ? <TrendingUp className="h-3.5 w-3.5 text-primary" /> :
  v > -2 ? <Minus className="h-3.5 w-3.5 text-muted-foreground" /> :
  <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />;

const pressureColor = (v: number) => v >= 70 ? 'text-destructive' : v >= 45 ? 'text-chart-3' : 'text-chart-1';

/* ═══════════════════════════════════════════════════════════
   1. GLOBAL MARKET HEAT DASHBOARD
   ═══════════════════════════════════════════════════════════ */
const GlobalHeatDashboard: React.FC = () => {
  const pieData = REGIONS.map(r => ({ name: r.region, value: r.demandIntensity }));

  // Trend acceleration timeline (synthetic 12-month momentum)
  const trendTimeline = Array.from({ length: 12 }, (_, i) => {
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i];
    const row: any = { month };
    REGIONS.forEach(r => {
      row[r.region] = Math.round((r.trendAcceleration * (0.4 + i * 0.05) + Math.sin(i / 2) * 2) * 10) / 10;
    });
    return row;
  });

  return (
    <div className="space-y-6">
      {/* Region cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {REGIONS.map((r, i) => (
          <motion.div key={r.region} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/40 h-full">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">{r.region}</p>
                  <Badge variant="outline" className={`text-[9px] ${r.demandIntensity >= 75 ? 'text-chart-1 border-chart-1/30' : r.demandIntensity >= 55 ? 'text-primary border-primary/30' : 'text-muted-foreground border-border'}`}>
                    {r.demandIntensity >= 75 ? 'Hot' : r.demandIntensity >= 55 ? 'Warm' : 'Cool'}
                  </Badge>
                </div>

                {/* Demand intensity gauge */}
                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Demand Intensity</span>
                    <span className="font-bold text-foreground">{r.demandIntensity}</span>
                  </div>
                  <Progress value={r.demandIntensity} className="h-2" />
                </div>

                {/* Trend acceleration */}
                <div className="flex items-center gap-1.5">
                  <MomentumArrow v={r.trendAcceleration} />
                  <span className={`text-xs font-bold ${r.trendAcceleration > 3 ? 'text-chart-1' : r.trendAcceleration > 0 ? 'text-primary' : 'text-destructive'}`}>
                    {r.trendAcceleration > 0 ? '+' : ''}{r.trendAcceleration.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">momentum</span>
                </div>

                <Separator className="opacity-30" />

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-muted-foreground">Yield</span>
                    <p className="font-bold text-foreground">{r.avgYield}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Growth</span>
                    <p className="font-bold text-foreground">{r.avgGrowth}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capital</span>
                    <p className="font-bold text-foreground">{r.capitalInflow}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cities</span>
                    <p className="font-bold text-foreground">{r.cities.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Demand Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Regional Demand Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Acceleration Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-chart-1" /> Trend Acceleration (12-Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip {...TT} />
                {REGIONS.map((r, i) => (
                  <Line key={r.region} type="monotone" dataKey={r.region} stroke={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   2. MACRO RISK SIGNALS
   ═══════════════════════════════════════════════════════════ */
const MacroRiskSignals: React.FC = () => {
  const riskData = REGIONS.map(r => ({
    name: r.region,
    affordability: r.affordabilityPressure,
    supply: r.supplySaturation,
    bubble: r.bubbleRisk,
  }));

  // City-level affordability scatter
  const scatterData = ALL_CITIES.map(c => ({
    city: `${c.flag} ${c.city}`,
    x: 100 - c.affordabilityIndex, // pressure (inverted)
    y: c.supplySaturation,
    z: c.investmentAttractiveness,
    risk: c.riskLevel,
  }));

  return (
    <div className="space-y-6">
      {/* Risk overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Affordability Pressure', icon: DollarSign, desc: 'Markets where price-to-income ratios signal stress', metric: 'affordabilityPressure' as const, threshold: 60, warning: 'Elevated pricing pressure detected' },
          { title: 'Supply Saturation', icon: Building2, desc: 'Regions with oversupply risk from excess development', metric: 'supplySaturation' as const, threshold: 50, warning: 'Supply exceeding absorption capacity' },
          { title: 'Bubble Risk Index', icon: AlertTriangle, desc: 'Composite risk score from price velocity & credit growth', metric: 'bubbleRisk' as const, threshold: 35, warning: 'Elevated speculative activity' },
        ].map(card => {
          const atRisk = REGIONS.filter(r => r[card.metric] >= card.threshold);
          const avgVal = Math.round(REGIONS.reduce((s, r) => s + r[card.metric], 0) / REGIONS.length);

          return (
            <Card key={card.title} className={`border-border/40 ${avgVal >= card.threshold ? 'border-destructive/20' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <card.icon className={`h-4 w-4 ${pressureColor(avgVal)}`} />
                  {card.title}
                </CardTitle>
                <CardDescription className="text-xs">{card.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-end justify-between">
                  <p className={`text-3xl font-black ${pressureColor(avgVal)}`}>{avgVal}</p>
                  <span className="text-[10px] text-muted-foreground">/ 100</span>
                </div>
                <Progress value={avgVal} className="h-2" />

                {atRisk.length > 0 && (
                  <div className="p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-[10px] text-destructive font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {card.warning}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {atRisk.map(r => (
                        <Badge key={r.region} variant="outline" className="text-[9px] text-destructive border-destructive/20">{r.region}: {r[card.metric]}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Regional risk comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Regional Risk Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="affordability" name="Affordability" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="supply" name="Supply" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bubble" name="Bubble" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                <ReferenceLine y={50} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: 'Warning', fontSize: 9, fill: 'hsl(var(--destructive))' }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Affordability vs Supply scatter */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-chart-2" /> City Risk Quadrant</CardTitle>
            <CardDescription className="text-[10px]">X: Affordability pressure · Y: Supply saturation · Size: Attractiveness</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="x" name="Affordability Pressure" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="y" name="Supply Saturation" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <ZAxis dataKey="z" range={[40, 200]} />
                <Tooltip {...TT} formatter={(value: any, name: string) => [value, name === 'x' ? 'Affordability' : name === 'y' ? 'Supply' : 'Score']} />
                <ReferenceLine x={50} stroke="hsl(var(--destructive)/0.3)" strokeDasharray="3 3" />
                <ReferenceLine y={50} stroke="hsl(var(--destructive)/0.3)" strokeDasharray="3 3" />
                <Scatter data={scatterData} fill="hsl(var(--primary))">
                  {scatterData.map((d, i) => (
                    <Cell key={i} fill={d.risk === 'high' ? 'hsl(var(--destructive))' : d.risk === 'moderate' ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-1))'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* City-level risk table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">City Risk Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">City</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Affordability</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Supply</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Risk</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Phase</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Signal</th>
                </tr>
              </thead>
              <tbody>
                {ALL_CITIES.sort((a, b) => b.supplySaturation - a.supplySaturation).map(c => {
                  const pressure = 100 - c.affordabilityIndex;
                  const signal = pressure >= 60 && c.supplySaturation >= 50 ? 'Avoid' : pressure >= 50 ? 'Caution' : 'Clear';
                  const signalColor = signal === 'Avoid' ? 'text-destructive' : signal === 'Caution' ? 'text-chart-3' : 'text-chart-1';
                  return (
                    <tr key={`${c.city}-${c.country}`} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{c.flag} {c.city}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Progress value={pressure} className="h-1.5 w-12" />
                          <span className={`font-mono ${pressureColor(pressure)}`}>{pressure}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-mono ${pressureColor(c.supplySaturation)}`}>{c.supplySaturation}</span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className={`text-[9px] ${riskConfig[c.riskLevel].color}`}>{riskConfig[c.riskLevel].label}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className={`text-[9px] ${phaseConfig[c.cyclePhase].bg} ${phaseConfig[c.cyclePhase].color}`}>{phaseConfig[c.cyclePhase].label}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-xs font-bold ${signalColor}`}>{signal}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   3. CITY COMPARISON TOOLS
   ═══════════════════════════════════════════════════════════ */
const CityComparisonTools: React.FC = () => {
  const [selected, setSelected] = useState<string[]>(['Jakarta', 'Dubai', 'Lisbon']);
  const [sortBy, setSortBy] = useState<'attractiveness' | 'growth' | 'yield' | 'probability'>('attractiveness');

  const toggleCity = (city: string) => {
    setSelected(prev => {
      if (prev.includes(city)) return prev.filter(c => c !== city);
      if (prev.length >= 4) return prev;
      return [...prev, city];
    });
  };

  const selectedCities = ALL_CITIES.filter(c => selected.includes(c.city));

  const radarData = [
    'Demand', 'Yield', 'Growth', 'Affordability', 'Rental', 'Safety',
  ].map((axis, i) => {
    const row: any = { axis };
    selectedCities.forEach(c => {
      const vals = [c.demandScore, c.yieldPct * 12, c.growthPct * 10, c.affordabilityIndex, c.rentalDemand, 100 - (c.riskLevel === 'high' ? 70 : c.riskLevel === 'moderate' ? 40 : 15)];
      row[c.city] = Math.min(100, vals[i]);
    });
    return row;
  });

  const RADAR_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-4))'];

  const sortedCities = useMemo(() => {
    return [...ALL_CITIES].sort((a, b) => {
      switch (sortBy) {
        case 'growth': return b.growthPct - a.growthPct;
        case 'yield': return b.yieldPct - a.yieldPct;
        case 'probability': return b.growthProbability5yr - a.growthProbability5yr;
        default: return b.investmentAttractiveness - a.investmentAttractiveness;
      }
    });
  }, [sortBy]);

  return (
    <div className="space-y-6">
      {/* City selector */}
      <div className="flex flex-wrap gap-2">
        <p className="text-sm text-muted-foreground mr-2 pt-1">Compare (max 4):</p>
        {ALL_CITIES.map(c => (
          <Badge
            key={`${c.city}-${c.country}`}
            variant={selected.includes(c.city) ? 'default' : 'outline'}
            className="cursor-pointer text-xs gap-1"
            onClick={() => toggleCity(c.city)}
          >
            {c.flag} {c.city}
          </Badge>
        ))}
      </div>

      {/* Comparison panels */}
      {selectedCities.length >= 2 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Radar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><RadarIcon className="h-4 w-4 text-primary" /> Multi-Axis Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  {selectedCities.map((c, i) => (
                    <Radar key={c.city} name={c.city} dataKey={c.city} stroke={RADAR_COLORS[i]} fill={RADAR_COLORS[i]} fillOpacity={0.1} />
                  ))}
                  <Tooltip {...TT} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Side-by-side metrics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><GitCompare className="h-4 w-4 text-chart-2" /> Head-to-Head Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-muted-foreground font-medium">Metric</th>
                      {selectedCities.map(c => (
                        <th key={c.city} className="text-center p-3 font-medium">{c.flag} {c.city}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Attractiveness', fn: (c: CityData) => c.investmentAttractiveness, fmt: (v: number) => `${v}/100` },
                      { label: 'Rental Yield', fn: (c: CityData) => c.yieldPct, fmt: (v: number) => `${v}%` },
                      { label: 'Price Growth', fn: (c: CityData) => c.growthPct, fmt: (v: number) => `${v}%` },
                      { label: '5yr Growth Prob.', fn: (c: CityData) => c.growthProbability5yr, fmt: (v: number) => `${v}%` },
                      { label: 'Demand Score', fn: (c: CityData) => c.demandScore, fmt: (v: number) => `${v}/100` },
                      { label: 'Affordability', fn: (c: CityData) => c.affordabilityIndex, fmt: (v: number) => `${v}/100` },
                      { label: 'Supply Risk', fn: (c: CityData) => c.supplySaturation, fmt: (v: number) => `${v}/100` },
                      { label: 'Momentum', fn: (c: CityData) => c.trendMomentum, fmt: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}` },
                      { label: 'Foreign Buyer %', fn: (c: CityData) => c.foreignBuyerPct, fmt: (v: number) => `${v}%` },
                      { label: 'Cycle Phase', fn: (c: CityData) => 0, fmt: (_: number, c?: CityData) => c ? phaseConfig[c.cyclePhase].label : '' },
                    ].map(row => {
                      const vals = selectedCities.map(c => row.fn(c));
                      const best = row.label !== 'Supply Risk' && row.label !== 'Cycle Phase'
                        ? Math.max(...vals)
                        : row.label === 'Supply Risk' ? Math.min(...vals) : -1;

                      return (
                        <tr key={row.label} className="border-b border-border/30">
                          <td className="p-3 text-muted-foreground">{row.label}</td>
                          {selectedCities.map((c, i) => (
                            <td key={c.city} className={`p-3 text-center font-medium ${vals[i] === best && best !== -1 ? 'text-chart-1 font-bold' : 'text-foreground'}`}>
                              {row.label === 'Cycle Phase' ? row.fmt(0, c) : row.fmt(vals[i])}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full ranking table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Global City Investment Ranking</CardTitle>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-36 h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="attractiveness">Attractiveness</SelectItem>
                <SelectItem value="growth">Price Growth</SelectItem>
                <SelectItem value="yield">Rental Yield</SelectItem>
                <SelectItem value="probability">Growth Probability</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-center p-3 text-muted-foreground font-medium w-8">#</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">City</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Score</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Yield</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Growth</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">5yr Prob.</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Momentum</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Phase</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Risk</th>
                </tr>
              </thead>
              <tbody>
                {sortedCities.map((c, i) => (
                  <tr key={`${c.city}-${c.country}`} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-center text-muted-foreground font-mono">{i + 1}</td>
                    <td className="p-3 font-medium text-foreground">
                      <span>{c.flag} {c.city}</span>
                      <span className="text-muted-foreground ml-1">· {c.country}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-bold ${c.investmentAttractiveness >= 80 ? 'text-chart-1' : c.investmentAttractiveness >= 65 ? 'text-primary' : 'text-muted-foreground'}`}>
                        {c.investmentAttractiveness}
                      </span>
                    </td>
                    <td className="p-3 text-center text-foreground">{c.yieldPct}%</td>
                    <td className="p-3 text-center text-foreground">{c.growthPct}%</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Progress value={c.growthProbability5yr} className="h-1.5 w-10" />
                        <span className="font-mono text-foreground">{c.growthProbability5yr}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="flex items-center justify-center gap-0.5">
                        <MomentumArrow v={c.trendMomentum} />
                        <span className="font-mono">{c.trendMomentum > 0 ? '+' : ''}{c.trendMomentum.toFixed(1)}</span>
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={`text-[9px] ${phaseConfig[c.cyclePhase].bg} ${phaseConfig[c.cyclePhase].color}`}>
                        {phaseConfig[c.cyclePhase].label}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={`text-[9px] ${riskConfig[c.riskLevel].color}`}>{riskConfig[c.riskLevel].label}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
const GlobalPredictiveAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('heat');

  // Global KPIs
  const totalCities = ALL_CITIES.length;
  const avgAttractiveness = Math.round(ALL_CITIES.reduce((s, c) => s + c.investmentAttractiveness, 0) / totalCities);
  const hotRegions = REGIONS.filter(r => r.demandIntensity >= 75).length;
  const avgGrowthProb = Math.round(ALL_CITIES.reduce((s, c) => s + c.growthProbability5yr, 0) / totalCities);

  return (
    <>
      <SEOHead
        title="Global Predictive Analytics | ASTRA Villa"
        description="Macro-level predictive analytics visualizing global real estate investment trends, risk signals, and city-level growth forecasts across 20+ markets."
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />
          <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs border-primary/30">
                <Globe className="h-3.5 w-3.5 text-primary" /> Global Intelligence
              </Badge>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Predictive <span className="text-primary">Analytics</span> Terminal
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
                Strategic foresight into emerging property markets — region-level demand, macro risk signals, and city-level growth probability across 20+ global markets.
              </p>

              {/* KPI strip */}
              <div className="flex items-center justify-center gap-8 pt-3">
                {[
                  { label: 'Markets', value: totalCities, icon: MapPin, color: 'text-primary' },
                  { label: 'Hot Regions', value: hotRegions, icon: Flame, color: 'text-chart-1' },
                  { label: 'Avg Attractiveness', value: avgAttractiveness, icon: Target, color: 'text-chart-2' },
                  { label: 'Avg 5yr Prob.', value: `${avgGrowthProb}%`, icon: TrendingUp, color: 'text-chart-1' },
                ].map(kpi => (
                  <div key={kpi.label} className="text-center">
                    <kpi.icon className={`h-4 w-4 ${kpi.color} mx-auto mb-0.5`} />
                    <p className="text-lg font-black text-foreground">{kpi.value}</p>
                    <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-xl mx-auto grid-cols-3 h-10">
              <TabsTrigger value="heat" className="text-xs gap-1"><Flame className="h-3.5 w-3.5" /> Market Heat</TabsTrigger>
              <TabsTrigger value="risk" className="text-xs gap-1"><Shield className="h-3.5 w-3.5" /> Risk Signals</TabsTrigger>
              <TabsTrigger value="compare" className="text-xs gap-1"><GitCompare className="h-3.5 w-3.5" /> Compare</TabsTrigger>
            </TabsList>

            <TabsContent value="heat">
              <GlobalHeatDashboard />
            </TabsContent>

            <TabsContent value="risk">
              <MacroRiskSignals />
            </TabsContent>

            <TabsContent value="compare">
              <CityComparisonTools />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default GlobalPredictiveAnalyticsPage;
