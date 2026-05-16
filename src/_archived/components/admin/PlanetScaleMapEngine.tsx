import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, MapPin, TrendingUp, Activity, AlertTriangle, Building2,
  Users, BarChart3, Layers, ChevronRight, ArrowUpRight, Shield,
  Zap, Target, X, Maximize2
} from 'lucide-react';

/* ─── Types ─── */
interface CityNode {
  name: string;
  country: string;
  lat: number;
  lng: number;
  vendors: number;
  avgYield: number;
  liquidityIndex: number;
  growthForecast: number;
  riskLevel: 'low' | 'medium' | 'high';
  listingDensity: number;
  txnVelocity: number;
  revenueIntensity: number;
  demandSignal: number;
  expansionReadiness: number;
  classification: 'dominant' | 'growing' | 'emerging' | 'exploring';
}

const CITIES: CityNode[] = [
  { name: 'Bali', country: 'Indonesia', lat: -8.34, lng: 115.09, vendors: 284, avgYield: 8.7, liquidityIndex: 89, growthForecast: 14.2, riskLevel: 'low', listingDensity: 94, txnVelocity: 87, revenueIntensity: 91, demandSignal: 95, expansionReadiness: 98, classification: 'dominant' },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.17, lng: 106.84, vendors: 156, avgYield: 6.4, liquidityIndex: 72, growthForecast: 11.5, riskLevel: 'low', listingDensity: 78, txnVelocity: 71, revenueIntensity: 74, demandSignal: 80, expansionReadiness: 92, classification: 'growing' },
  { name: 'Surabaya', country: 'Indonesia', lat: -7.25, lng: 112.75, vendors: 67, avgYield: 7.1, liquidityIndex: 58, growthForecast: 9.8, riskLevel: 'medium', listingDensity: 52, txnVelocity: 48, revenueIntensity: 45, demandSignal: 62, expansionReadiness: 78, classification: 'emerging' },
  { name: 'Lombok', country: 'Indonesia', lat: -8.65, lng: 116.35, vendors: 43, avgYield: 9.2, liquidityIndex: 45, growthForecast: 18.5, riskLevel: 'medium', listingDensity: 38, txnVelocity: 35, revenueIntensity: 32, demandSignal: 71, expansionReadiness: 65, classification: 'emerging' },
  { name: 'Yogyakarta', country: 'Indonesia', lat: -7.79, lng: 110.36, vendors: 28, avgYield: 6.8, liquidityIndex: 34, growthForecast: 7.2, riskLevel: 'low', listingDensity: 29, txnVelocity: 25, revenueIntensity: 22, demandSignal: 45, expansionReadiness: 55, classification: 'exploring' },
  { name: 'Bandung', country: 'Indonesia', lat: -6.91, lng: 107.61, vendors: 35, avgYield: 5.9, liquidityIndex: 41, growthForecast: 8.1, riskLevel: 'low', listingDensity: 34, txnVelocity: 30, revenueIntensity: 28, demandSignal: 52, expansionReadiness: 62, classification: 'exploring' },
  { name: 'Medan', country: 'Indonesia', lat: 3.59, lng: 98.67, vendors: 12, avgYield: 5.4, liquidityIndex: 22, growthForecast: 6.5, riskLevel: 'high', listingDensity: 15, txnVelocity: 12, revenueIntensity: 10, demandSignal: 28, expansionReadiness: 35, classification: 'exploring' },
  { name: 'Makassar', country: 'Indonesia', lat: -5.14, lng: 119.43, vendors: 18, avgYield: 6.1, liquidityIndex: 28, growthForecast: 7.8, riskLevel: 'medium', listingDensity: 21, txnVelocity: 18, revenueIntensity: 15, demandSignal: 35, expansionReadiness: 42, classification: 'exploring' },
];

const LAYER_CONFIG = [
  { key: 'listingDensity', label: 'Listing Density', color: 'chart-1' },
  { key: 'txnVelocity', label: 'Transaction Velocity', color: 'chart-2' },
  { key: 'revenueIntensity', label: 'Revenue Intensity', color: 'chart-3' },
  { key: 'demandSignal', label: 'Demand Signal', color: 'chart-4' },
  { key: 'expansionReadiness', label: 'Expansion Readiness', color: 'primary' },
] as const;

const CLASSIFICATION_STYLES: Record<string, { bg: string; text: string; ring: string }> = {
  dominant:  { bg: 'bg-chart-1/15', text: 'text-chart-1', ring: 'ring-chart-1/30' },
  growing:   { bg: 'bg-chart-2/15', text: 'text-chart-2', ring: 'ring-chart-2/30' },
  emerging:  { bg: 'bg-chart-3/15', text: 'text-chart-3', ring: 'ring-chart-3/30' },
  exploring: { bg: 'bg-muted/15',   text: 'text-muted-foreground', ring: 'ring-border/30' },
};

/* ─── City Node on Map ─── */
const CityMarker = ({ city, layer, isSelected, onClick }: {
  city: CityNode; layer: string; isSelected: boolean; onClick: () => void;
}) => {
  const value = (city as any)[layer] || 0;
  const size = 12 + (value / 100) * 28;
  const style = CLASSIFICATION_STYLES[city.classification];

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: Math.random() * 0.3, duration: 0.4 }}
      onClick={onClick}
      className={cn(
        "absolute flex flex-col items-center z-10 group",
        isSelected && "z-20"
      )}
      style={{ left: `${((city.lng - 95) / 30) * 100}%`, top: `${((city.lat + 10) / 20) * 100}%` }}
    >
      <div className={cn(
        "rounded-full border-2 transition-all duration-300 ring-2",
        style.bg, style.ring,
        isSelected ? "ring-4 ring-primary/40 border-primary" : "border-transparent hover:border-foreground/20"
      )} style={{ width: size, height: size }}>
        {value > 70 && (
          <motion.div
            className={cn("absolute inset-0 rounded-full", style.bg)}
            animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
      </div>
      <span className={cn(
        "text-[7px] font-medium mt-0.5 whitespace-nowrap transition-opacity",
        isSelected ? 'text-foreground opacity-100' : 'text-muted-foreground opacity-60 group-hover:opacity-100'
      )}>{city.name}</span>
    </motion.button>
  );
};

/* ─── City Detail Panel ─── */
const CityPanel = ({ city, onClose }: { city: CityNode; onClose: () => void }) => {
  const style = CLASSIFICATION_STYLES[city.classification];
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.15 }}
      className="w-[240px] shrink-0 border border-border/30 rounded-lg bg-card p-3 space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-primary" />
          <h3 className="text-xs font-semibold text-foreground">{city.name}</h3>
          <Badge className={cn("text-[7px] h-3.5 px-1", style.bg, style.text)}>{city.classification}</Badge>
        </div>
        <button onClick={onClose} className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted"><X className="h-3 w-3 text-muted-foreground" /></button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: 'Vendors', value: city.vendors, icon: Users },
          { label: 'Avg Yield', value: `${city.avgYield}%`, icon: TrendingUp },
          { label: 'Liquidity', value: city.liquidityIndex, icon: Activity },
          { label: 'Growth', value: `+${city.growthForecast}%`, icon: ArrowUpRight },
        ].map((m) => (
          <div key={m.label} className="px-2 py-1.5 rounded-md border border-border/20 bg-muted/10">
            <div className="flex items-center gap-1 mb-0.5">
              <m.icon className="h-2.5 w-2.5 text-muted-foreground" />
              <span className="text-[7px] text-muted-foreground">{m.label}</span>
            </div>
            <span className="text-[11px] font-bold text-foreground tabular-nums">{m.value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Layer Scores</p>
        {LAYER_CONFIG.map(l => {
          const val = (city as any)[l.key] || 0;
          return (
            <div key={l.key} className="flex items-center gap-1.5">
              <span className="text-[8px] text-muted-foreground w-20 truncate">{l.label}</span>
              <div className="flex-1 h-1 rounded-full bg-muted/20 overflow-hidden">
                <div className={cn("h-full rounded-full bg-" + l.color)} style={{ width: `${val}%` }} />
              </div>
              <span className="text-[8px] tabular-nums text-foreground w-5 text-right">{val}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1 pt-1">
        <Shield className={cn("h-3 w-3", city.riskLevel === 'low' ? 'text-chart-1' : city.riskLevel === 'medium' ? 'text-chart-3' : 'text-destructive')} />
        <span className="text-[8px] text-muted-foreground capitalize">Risk: {city.riskLevel}</span>
      </div>
    </motion.div>
  );
};

/* ─── Main Dashboard ─── */
const PlanetScaleMapEngine = () => {
  const [activeLayer, setActiveLayer] = useState<string>('listingDensity');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState('all');
  const [yieldRange, setYieldRange] = useState([0, 15]);

  const filteredCities = useMemo(() => {
    return CITIES.filter(c => {
      if (regionFilter !== 'all' && c.country !== regionFilter) return false;
      if (c.avgYield < yieldRange[0] || c.avgYield > yieldRange[1]) return false;
      return true;
    });
  }, [regionFilter, yieldRange]);

  const selectedCityData = selectedCity ? CITIES.find(c => c.name === selectedCity) : null;

  const topHotspots = useMemo(() =>
    [...CITIES].sort((a, b) => b.growthForecast - a.growthForecast).slice(0, 3),
  []);

  const oversupplyZones = useMemo(() =>
    CITIES.filter(c => c.listingDensity > 70 && c.demandSignal < 50),
  []);

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Planet-Scale Intelligence Map</h2>
          <Badge variant="outline" className="text-[7px] h-4 text-chart-1 border-chart-1/20">{CITIES.length} Markets</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="h-7 w-32 text-[9px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[10px]">All Regions</SelectItem>
            <SelectItem value="Indonesia" className="text-[10px]">Indonesia</SelectItem>
          </SelectContent>
        </Select>

        {LAYER_CONFIG.map(l => (
          <button
            key={l.key}
            onClick={() => setActiveLayer(l.key)}
            className={cn(
              "h-7 px-2.5 rounded-md text-[9px] font-medium border transition-colors",
              activeLayer === l.key
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-muted/10 border-border/20 text-muted-foreground hover:text-foreground"
            )}
          >
            {l.label}
          </button>
        ))}

        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[8px] text-muted-foreground">Yield:</span>
          <Slider
            value={yieldRange}
            onValueChange={setYieldRange}
            min={0} max={15} step={0.5}
            className="w-24"
          />
          <span className="text-[8px] tabular-nums text-foreground">{yieldRange[0]}-{yieldRange[1]}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-3">
        {/* Map area */}
        <div className="flex gap-3">
          <Card className="flex-1 border-border/20 overflow-hidden">
            <CardContent className="p-0 relative" style={{ minHeight: 380 }}>
              {/* Grid background */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
              {/* Map nodes */}
              <div className="absolute inset-4">
                {filteredCities.map(city => (
                  <CityMarker
                    key={city.name}
                    city={city}
                    layer={activeLayer}
                    isSelected={selectedCity === city.name}
                    onClick={() => setSelectedCity(selectedCity === city.name ? null : city.name)}
                  />
                ))}
              </div>
              {/* Legend */}
              <div className="absolute bottom-2 left-2 flex items-center gap-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm border border-border/20">
                {Object.entries(CLASSIFICATION_STYLES).map(([key, style]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className={cn("h-2 w-2 rounded-full", style.bg, "border border-current", style.text)} />
                    <span className="text-[7px] text-muted-foreground capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* City detail panel */}
          <AnimatePresence>
            {selectedCityData && (
              <CityPanel city={selectedCityData} onClose={() => setSelectedCity(null)} />
            )}
          </AnimatePresence>
        </div>

        {/* Right insight column */}
        <div className="space-y-2">
          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold text-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-chart-1" />Emerging Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {topHotspots.map((city, i) => (
                <div key={city.name} className="flex items-center gap-2 cursor-pointer hover:bg-muted/10 rounded-md px-1.5 py-1" onClick={() => setSelectedCity(city.name)}>
                  <span className="text-[9px] font-bold text-primary tabular-nums">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-foreground">{city.name}</p>
                    <p className="text-[7px] text-muted-foreground">{city.vendors} vendors</p>
                  </div>
                  <Badge variant="outline" className="text-[7px] h-3.5 text-chart-1 border-chart-1/20">
                    +{city.growthForecast}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {oversupplyZones.length > 0 && (
            <Card className="border-chart-3/20">
              <CardHeader className="p-2.5 pb-1.5">
                <CardTitle className="text-[10px] font-semibold text-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-chart-3" />Oversupply Warning
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 pt-0 space-y-1">
                {oversupplyZones.map(city => (
                  <div key={city.name} className="flex items-center justify-between">
                    <span className="text-[9px] text-foreground">{city.name}</span>
                    <span className="text-[8px] text-chart-3">Supply: {city.listingDensity} / Demand: {city.demandSignal}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="border-border/20">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="text-[10px] font-semibold text-foreground flex items-center gap-1">
                <Zap className="h-3 w-3 text-primary" />Capital Flow Direction
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-1.5">
              {CITIES.filter(c => c.classification === 'dominant' || c.classification === 'growing').map(city => (
                <div key={city.name} className="flex items-center gap-2">
                  <ArrowUpRight className="h-2.5 w-2.5 text-chart-1" />
                  <span className="text-[9px] text-foreground flex-1">{city.name}</span>
                  <div className="flex-1 h-1 rounded-full bg-muted/20 overflow-hidden">
                    <div className="h-full rounded-full bg-chart-1" style={{ width: `${city.liquidityIndex}%` }} />
                  </div>
                  <span className="text-[8px] tabular-nums text-foreground">{city.liquidityIndex}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanetScaleMapEngine;
