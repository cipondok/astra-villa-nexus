import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Droplets, TrendingUp, BarChart3, Activity, Zap, ArrowUpRight, ArrowDownRight,
  MapPin, Home, Eye, Clock, AlertTriangle, Target, Layers, ChevronRight,
  Flame, Building2, DollarSign, Signal
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// ── Mock Data ──

type MapLayer = 'demand' | 'supply' | 'velocity' | 'price_growth';

interface District {
  id: string;
  name: string;
  lat: number;
  lng: number;
  liquidityScore: number;
  avgDaysOnMarket: number;
  inquiryPerListing: number;
  activeListings: number;
  closedDeals30d: number;
  priceGrowth: number;
  demandIntensity: number;
  supplyDensity: number;
  closingVelocity: number;
  balanceStatus: 'oversupply' | 'balanced' | 'undersupply';
  trend: 'up' | 'down' | 'stable';
}

const DISTRICTS: District[] = [
  { id: '1', name: 'Seminyak', lat: -8.6912, lng: 115.1683, liquidityScore: 92, avgDaysOnMarket: 18, inquiryPerListing: 8.4, activeListings: 156, closedDeals30d: 42, priceGrowth: 12.4, demandIntensity: 94, supplyDensity: 72, closingVelocity: 88, balanceStatus: 'undersupply', trend: 'up' },
  { id: '2', name: 'Canggu', lat: -8.6478, lng: 115.1385, liquidityScore: 88, avgDaysOnMarket: 22, inquiryPerListing: 7.2, activeListings: 198, closedDeals30d: 38, priceGrowth: 15.8, demandIntensity: 90, supplyDensity: 78, closingVelocity: 82, balanceStatus: 'undersupply', trend: 'up' },
  { id: '3', name: 'Ubud', lat: -8.5069, lng: 115.2625, liquidityScore: 76, avgDaysOnMarket: 32, inquiryPerListing: 5.8, activeListings: 124, closedDeals30d: 24, priceGrowth: 8.2, demandIntensity: 72, supplyDensity: 65, closingVelocity: 68, balanceStatus: 'balanced', trend: 'stable' },
  { id: '4', name: 'Kuta', lat: -8.7184, lng: 115.1686, liquidityScore: 65, avgDaysOnMarket: 38, inquiryPerListing: 4.2, activeListings: 210, closedDeals30d: 18, priceGrowth: 3.1, demandIntensity: 55, supplyDensity: 85, closingVelocity: 52, balanceStatus: 'oversupply', trend: 'down' },
  { id: '5', name: 'Sanur', lat: -8.6880, lng: 115.2614, liquidityScore: 58, avgDaysOnMarket: 42, inquiryPerListing: 3.6, activeListings: 88, closedDeals30d: 12, priceGrowth: 2.8, demandIntensity: 48, supplyDensity: 55, closingVelocity: 45, balanceStatus: 'balanced', trend: 'stable' },
  { id: '6', name: 'Jimbaran', lat: -8.7676, lng: 115.1609, liquidityScore: 72, avgDaysOnMarket: 28, inquiryPerListing: 6.1, activeListings: 76, closedDeals30d: 16, priceGrowth: 9.4, demandIntensity: 68, supplyDensity: 42, closingVelocity: 72, balanceStatus: 'undersupply', trend: 'up' },
  { id: '7', name: 'Uluwatu', lat: -8.8291, lng: 115.0849, liquidityScore: 82, avgDaysOnMarket: 24, inquiryPerListing: 7.8, activeListings: 52, closedDeals30d: 14, priceGrowth: 18.2, demandIntensity: 85, supplyDensity: 35, closingVelocity: 78, balanceStatus: 'undersupply', trend: 'up' },
  { id: '8', name: 'Nusa Dua', lat: -8.8030, lng: 115.2320, liquidityScore: 68, avgDaysOnMarket: 35, inquiryPerListing: 4.8, activeListings: 94, closedDeals30d: 15, priceGrowth: 5.6, demandIntensity: 62, supplyDensity: 68, closingVelocity: 58, balanceStatus: 'balanced', trend: 'stable' },
  { id: '9', name: 'Denpasar', lat: -8.6705, lng: 115.2126, liquidityScore: 45, avgDaysOnMarket: 52, inquiryPerListing: 2.8, activeListings: 320, closedDeals30d: 22, priceGrowth: 1.2, demandIntensity: 38, supplyDensity: 92, closingVelocity: 35, balanceStatus: 'oversupply', trend: 'down' },
  { id: '10', name: 'Tabanan', lat: -8.5410, lng: 115.1268, liquidityScore: 38, avgDaysOnMarket: 68, inquiryPerListing: 1.8, activeListings: 42, closedDeals30d: 4, priceGrowth: -1.2, demandIntensity: 28, supplyDensity: 32, closingVelocity: 22, balanceStatus: 'oversupply', trend: 'down' },
  { id: '11', name: 'Pererenan', lat: -8.6350, lng: 115.1180, liquidityScore: 85, avgDaysOnMarket: 20, inquiryPerListing: 7.5, activeListings: 68, closedDeals30d: 18, priceGrowth: 22.4, demandIntensity: 88, supplyDensity: 38, closingVelocity: 84, balanceStatus: 'undersupply', trend: 'up' },
  { id: '12', name: 'Berawa', lat: -8.6580, lng: 115.1450, liquidityScore: 79, avgDaysOnMarket: 26, inquiryPerListing: 6.4, activeListings: 82, closedDeals30d: 20, priceGrowth: 14.2, demandIntensity: 78, supplyDensity: 58, closingVelocity: 74, balanceStatus: 'undersupply', trend: 'up' },
];

const SEGMENTS = [
  { type: 'Luxury Villa', priceRange: '$800K – $2M+', location: 'Seminyak, Uluwatu', avgDays: 16, velocity: 94, trend: 'up' as const },
  { type: 'Mid-Range Villa', priceRange: '$300K – $800K', location: 'Canggu, Berawa', avgDays: 24, velocity: 82, trend: 'up' as const },
  { type: 'Investment Land', priceRange: '$100K – $500K', location: 'Pererenan, Tabanan', avgDays: 42, velocity: 58, trend: 'stable' as const },
  { type: 'Apartment / Loft', priceRange: '$150K – $350K', location: 'Denpasar, Kuta', avgDays: 48, velocity: 44, trend: 'down' as const },
  { type: 'Eco Retreat', priceRange: '$200K – $600K', location: 'Ubud, Tabanan', avgDays: 36, velocity: 62, trend: 'stable' as const },
];

const MOMENTUM_HISTORY = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  momentum: 52 + i * 3.2 + Math.round(Math.random() * 8 - 4),
  transactions: 120 + i * 12 + Math.round(Math.random() * 20),
}));

const LAYER_CONFIG: Record<MapLayer, { label: string; color: string; icon: React.ElementType }> = {
  demand: { label: 'Buyer Demand', color: 'text-chart-1', icon: Eye },
  supply: { label: 'Supply Density', color: 'text-chart-2', icon: Building2 },
  velocity: { label: 'Closing Velocity', color: 'text-chart-3', icon: Zap },
  price_growth: { label: 'Price Growth', color: 'text-primary', icon: TrendingUp },
};

// ── Heatmap Node on Map ──

const HeatmapNode = ({ district, layer, selected, onClick }: {
  district: District; layer: MapLayer; selected: boolean; onClick: () => void;
}) => {
  const intensity = layer === 'demand' ? district.demandIntensity
    : layer === 'supply' ? district.supplyDensity
    : layer === 'velocity' ? district.closingVelocity
    : Math.max(0, Math.min(100, district.priceGrowth * 4));

  const size = 24 + (intensity / 100) * 32;
  const opacity = 0.3 + (intensity / 100) * 0.5;

  const colorVar = layer === 'demand' ? '--chart-1'
    : layer === 'supply' ? '--chart-2'
    : layer === 'velocity' ? '--chart-3'
    : '--primary';

  return (
    <motion.div
      className={cn("absolute cursor-pointer group", selected && "z-20")}
      style={{
        left: `${((district.lng - 115.05) / 0.25) * 100}%`,
        top: `${((district.lat + 8.48) / 0.4) * 100}%`,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.15 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Pulse ring */}
      <motion.div
        className="absolute rounded-full -inset-1"
        style={{ background: `hsl(var(${colorVar}) / ${opacity * 0.3})`, width: size + 8, height: size + 8, marginLeft: -(size + 8) / 2, marginTop: -(size + 8) / 2 }}
        animate={{ scale: [1, 1.3, 1], opacity: [opacity * 0.3, 0, opacity * 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Core */}
      <div
        className={cn("rounded-full flex items-center justify-center border-2 transition-all",
          selected ? "ring-2 ring-primary/50" : ""
        )}
        style={{
          width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2,
          background: `hsl(var(${colorVar}) / ${opacity})`,
          borderColor: `hsl(var(${colorVar}) / ${opacity + 0.2})`,
        }}
      >
        <span className="text-[7px] font-bold text-foreground tabular-nums">{intensity}</span>
      </div>
      {/* Label */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-popover border border-border rounded-md px-2 py-1 shadow-lg">
          <p className="text-[8px] font-semibold text-foreground">{district.name}</p>
          <p className="text-[7px] text-muted-foreground">Score: {district.liquidityScore} · {district.avgDaysOnMarket}d avg</p>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Component ──

const CityLiquidityHeatmap = () => {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('demand');
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  const sortedDistricts = useMemo(() =>
    [...DISTRICTS].sort((a, b) => b.liquidityScore - a.liquidityScore),
  []);

  const oversupply = DISTRICTS.filter(d => d.balanceStatus === 'oversupply');
  const undersupply = DISTRICTS.filter(d => d.balanceStatus === 'undersupply');

  const globalMomentum = Math.round(DISTRICTS.reduce((s, d) => s + d.liquidityScore, 0) / DISTRICTS.length);
  const momentumSignal = globalMomentum >= 75 ? 'Accelerating' : globalMomentum >= 55 ? 'Stable' : 'Decelerating';

  const radarData = selectedDistrict ? [
    { metric: 'Demand', value: selectedDistrict.demandIntensity },
    { metric: 'Supply', value: selectedDistrict.supplyDensity },
    { metric: 'Velocity', value: selectedDistrict.closingVelocity },
    { metric: 'Liquidity', value: selectedDistrict.liquidityScore },
    { metric: 'Growth', value: Math.min(100, Math.max(0, selectedDistrict.priceGrowth * 4)) },
  ] : null;

  const balanceData = DISTRICTS.map(d => ({
    name: d.name,
    demand: d.demandIntensity,
    supply: d.supplyDensity,
    gap: d.demandIntensity - d.supplyDensity,
  })).sort((a, b) => b.gap - a.gap);

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">City Liquidity Heatmap</h2>
            <p className="text-[10px] text-muted-foreground">Real-time property market intelligence terminal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[8px] h-5 text-chart-1 border-chart-1/20 gap-1">
            <Signal className="h-2.5 w-2.5" />LIVE
          </Badge>
          <Badge variant="outline" className="text-[8px] h-5 gap-1">
            <MapPin className="h-2.5 w-2.5" />Bali Region
          </Badge>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Market Momentum', value: `${globalMomentum}`, icon: Activity, delta: momentumSignal, up: globalMomentum >= 55, accent: 'text-primary' },
          { label: 'Total Listings', value: DISTRICTS.reduce((s, d) => s + d.activeListings, 0).toLocaleString(), icon: Building2, delta: '+124 this month', up: true, accent: 'text-chart-2' },
          { label: 'Deals (30d)', value: DISTRICTS.reduce((s, d) => s + d.closedDeals30d, 0).toString(), icon: Target, delta: '+18% vs prior', up: true, accent: 'text-chart-1' },
          { label: 'Avg Days on Market', value: `${Math.round(DISTRICTS.reduce((s, d) => s + d.avgDaysOnMarket, 0) / DISTRICTS.length)}d`, icon: Clock, delta: '-3d trend', up: true, accent: 'text-chart-3' },
          { label: 'Undersupply Zones', value: undersupply.length.toString(), icon: AlertTriangle, delta: `${oversupply.length} oversupply`, up: false, accent: 'text-destructive' },
        ].map((kpi, i) => (
          <Card key={i} className="border-border/30 hover:border-border/50 transition-colors">
            <CardContent className="p-2.5">
              <div className="flex items-center justify-between mb-1">
                <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center bg-primary/10")}>
                  <kpi.icon className={cn("h-3.5 w-3.5", kpi.accent)} />
                </div>
                <span className={cn("text-[7px] flex items-center gap-0.5", kpi.up ? "text-chart-1" : "text-chart-2")}>
                  {kpi.up ? <ArrowUpRight className="h-2 w-2" /> : <ArrowDownRight className="h-2 w-2" />}
                  {kpi.delta}
                </span>
              </div>
              <p className="text-xl font-bold text-foreground tabular-nums leading-tight">{kpi.value}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main Grid: Map + Right Panels ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        {/* LEFT: Map + Balance */}
        <div className="space-y-4">
          {/* Heatmap */}
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  Interactive Heatmap
                </CardTitle>
                <Tabs value={activeLayer} onValueChange={(v) => setActiveLayer(v as MapLayer)}>
                  <TabsList className="h-6">
                    {(Object.entries(LAYER_CONFIG) as [MapLayer, typeof LAYER_CONFIG[MapLayer]][]).map(([key, cfg]) => (
                      <TabsTrigger key={key} value={key} className="text-[7px] h-5 px-2 gap-1">
                        <cfg.icon className="h-2.5 w-2.5" />{cfg.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {/* Map container */}
              <div className="relative w-full h-[340px] rounded-xl border border-border/20 bg-muted/5 overflow-hidden">
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }} />

                {/* Map placeholder label */}
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="outline" className="text-[6px] h-4 bg-popover/80 backdrop-blur-sm">
                    <Map className="h-2 w-2 mr-1" />Mapbox-ready · Bali -8.4° to -8.9°
                  </Badge>
                </div>

                {/* Heatmap nodes */}
                {DISTRICTS.map(d => (
                  <HeatmapNode key={d.id} district={d} layer={activeLayer}
                    selected={selectedDistrict?.id === d.id}
                    onClick={() => setSelectedDistrict(d)} />
                ))}

                {/* Legend */}
                <div className="absolute bottom-2 right-2 z-10 bg-popover/80 backdrop-blur-sm border border-border/30 rounded-lg px-2.5 py-1.5">
                  <p className="text-[7px] text-muted-foreground mb-1">Intensity Scale</p>
                  <div className="flex items-center gap-1">
                    {[20, 40, 60, 80, 100].map(v => {
                      const colorVar = activeLayer === 'demand' ? '--chart-1' : activeLayer === 'supply' ? '--chart-2' : activeLayer === 'velocity' ? '--chart-3' : '--primary';
                      return (
                        <div key={v} className="flex flex-col items-center gap-0.5">
                          <div className="h-2.5 w-6 rounded-sm" style={{ background: `hsl(var(${colorVar}) / ${0.2 + (v / 100) * 0.6})` }} />
                          <span className="text-[5px] tabular-nums text-muted-foreground">{v}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected district detail */}
              <AnimatePresence>
                {selectedDistrict && radarData && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden">
                    <Card className="border-primary/20 bg-primary/[0.02]">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-primary" />{selectedDistrict.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className={cn("text-[6px] h-3.5",
                                selectedDistrict.balanceStatus === 'undersupply' ? 'text-chart-1 border-chart-1/20' :
                                selectedDistrict.balanceStatus === 'oversupply' ? 'text-destructive border-destructive/20' :
                                'text-muted-foreground border-border/30'
                              )}>
                                {selectedDistrict.balanceStatus}
                              </Badge>
                              <span className={cn("text-[7px] flex items-center gap-0.5",
                                selectedDistrict.trend === 'up' ? 'text-chart-1' : selectedDistrict.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                              )}>
                                {selectedDistrict.trend === 'up' ? <ArrowUpRight className="h-2 w-2" /> : selectedDistrict.trend === 'down' ? <ArrowDownRight className="h-2 w-2" /> : null}
                                {selectedDistrict.priceGrowth > 0 ? '+' : ''}{selectedDistrict.priceGrowth}% growth
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setSelectedDistrict(null)}>
                            <span className="text-[8px]">✕</span>
                          </Button>
                        </div>

                        <div className="grid grid-cols-[1fr_120px] gap-3">
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { l: 'Liquidity Score', v: selectedDistrict.liquidityScore, s: '/100' },
                              { l: 'Avg Days on Market', v: `${selectedDistrict.avgDaysOnMarket}d`, s: '' },
                              { l: 'Inquiry/Listing', v: selectedDistrict.inquiryPerListing.toFixed(1), s: 'ratio' },
                              { l: 'Active Listings', v: selectedDistrict.activeListings, s: '' },
                              { l: 'Closed (30d)', v: selectedDistrict.closedDeals30d, s: 'deals' },
                              { l: 'Demand Intensity', v: selectedDistrict.demandIntensity, s: '/100' },
                            ].map((m, i) => (
                              <div key={i} className="px-2 py-1.5 rounded-lg border border-border/15 bg-card/50">
                                <p className="text-[7px] text-muted-foreground">{m.l}</p>
                                <p className="text-[11px] font-bold text-foreground tabular-nums">
                                  {m.v} <span className="text-[6px] text-muted-foreground font-normal">{m.s}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                          <ResponsiveContainer width="100%" height={120}>
                            <RadarChart data={radarData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                              <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
                              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} />
                              <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={1.5} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Demand vs Supply Balance */}
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-chart-2" />
                Demand vs Supply Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={balanceData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.2} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={64} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 10 }} />
                  <Bar dataKey="demand" fill="hsl(var(--chart-1))" fillOpacity={0.7} radius={[0, 3, 3, 0]} name="Demand" barSize={8} />
                  <Bar dataKey="supply" fill="hsl(var(--chart-2))" fillOpacity={0.5} radius={[0, 3, 3, 0]} name="Supply" barSize={8} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-2">
                <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-chart-1/70" /><span className="text-[8px] text-muted-foreground">Demand</span></div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-chart-2/50" /><span className="text-[8px] text-muted-foreground">Supply</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT Column */}
        <div className="space-y-4">
          {/* District Liquidity Rankings */}
          <Card className="border-border/30">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1.5">
                <Droplets className="h-3 w-3 text-primary" />
                Liquidity Score by District
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1">
              {sortedDistricts.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer transition-colors",
                    selectedDistrict?.id === d.id ? "border-primary/30 bg-primary/5" : "border-border/10 hover:bg-muted/5"
                  )}
                  onClick={() => setSelectedDistrict(d)}>
                  <span className="text-[8px] tabular-nums text-muted-foreground w-3 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-medium text-foreground truncate">{d.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[7px] text-muted-foreground">{d.avgDaysOnMarket}d avg</span>
                      <span className="text-[7px] text-muted-foreground">{d.inquiryPerListing}x inq</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-10 h-1.5 rounded-full bg-muted/15 overflow-hidden">
                      <div className={cn("h-full rounded-full", d.liquidityScore >= 75 ? "bg-chart-1" : d.liquidityScore >= 50 ? "bg-chart-2" : "bg-destructive")}
                        style={{ width: `${d.liquidityScore}%` }} />
                    </div>
                    <span className={cn("text-[8px] font-bold tabular-nums w-5 text-right",
                      d.liquidityScore >= 75 ? "text-chart-1" : d.liquidityScore >= 50 ? "text-chart-2" : "text-destructive"
                    )}>{d.liquidityScore}</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Fastest Moving Segments */}
          <Card className="border-border/30">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1.5">
                <Flame className="h-3 w-3 text-chart-1" />
                Fastest Moving Segments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {SEGMENTS.map((seg, i) => (
                <motion.div key={seg.type} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="px-2.5 py-2 rounded-lg border border-border/15 hover:border-border/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-semibold text-foreground">{seg.type}</span>
                    <span className={cn("text-[7px] flex items-center gap-0.5",
                      seg.trend === 'up' ? 'text-chart-1' : seg.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                      {seg.trend === 'up' ? <ArrowUpRight className="h-2 w-2" /> : seg.trend === 'down' ? <ArrowDownRight className="h-2 w-2" /> : null}
                      {seg.velocity}% vel
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[7px] text-muted-foreground"><DollarSign className="h-2 w-2 inline" />{seg.priceRange}</span>
                    <span className="text-[7px] text-muted-foreground"><Clock className="h-2 w-2 inline" /> {seg.avgDays}d</span>
                  </div>
                  <span className="text-[6px] text-muted-foreground"><MapPin className="h-2 w-2 inline" /> {seg.location}</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Market Momentum Index */}
          <Card className="border-border/30">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-chart-3" />
                Market Momentum Index
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0">
              {/* Gauge */}
              <div className="flex items-center justify-center mb-3">
                <div className="relative h-20 w-20">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" strokeOpacity={0.15} />
                    <motion.circle cx="50" cy="50" r="38" fill="none"
                      stroke={globalMomentum >= 75 ? "hsl(var(--chart-1))" : globalMomentum >= 55 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"}
                      strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${(globalMomentum / 100) * 239} 239`}
                      initial={{ strokeDasharray: "0 239" }}
                      animate={{ strokeDasharray: `${(globalMomentum / 100) * 239} 239` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-foreground tabular-nums">{globalMomentum}</span>
                    <span className="text-[6px] text-muted-foreground">/ 100</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-3">
                <Badge variant="outline" className={cn("text-[7px] h-4",
                  globalMomentum >= 75 ? "text-chart-1 border-chart-1/20" :
                  globalMomentum >= 55 ? "text-chart-2 border-chart-2/20" :
                  "text-destructive border-destructive/20"
                )}>
                  {momentumSignal}
                </Badge>
                <p className="text-[7px] text-muted-foreground mt-1">Predicting increased transaction activity</p>
              </div>

              {/* Trend line */}
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={MOMENTUM_HISTORY} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gMomentum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <Area type="monotone" dataKey="momentum" stroke="hsl(var(--chart-3))" fill="url(#gMomentum)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CityLiquidityHeatmap;
