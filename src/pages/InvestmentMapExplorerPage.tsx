import { useEffect, useRef, useState, useCallback, memo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  useInvestmentMapExplorer,
  useZoneStats,
  useZoneComparison,
  MapBounds,
  MapFilters,
  MapProperty,
  MapZone,
  ZoneStats,
  ZoneComparison,
} from "@/hooks/useInvestmentMapExplorer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import Price from "@/components/ui/Price";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Layers,
  MapPin,
  TrendingUp,
  TrendingDown,
  Flame,
  BarChart3,
  X,
  Maximize2,
  Minimize2,
  ChevronRight,
  BedDouble,
  Building2,
  Filter,
  Loader2,
  ArrowLeftRight,
  Eye,
  Sparkles,
  Clock,
  Calendar,
  DollarSign,
  Activity,
} from "lucide-react";

const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTN1eGo4eXAwMWV4MnFzYTNwaTgzZnN0In0.JfxWbLcAYW83y5b-A5hLUQ";

const LAYER_CONFIGS = {
  opportunity: { label: "Opportunity Score", color: ["#1a1a2e", "#e94560", "#ff6b6b", "#ffd93d"], icon: TrendingUp },
  demand: { label: "Rental Demand", color: ["#0f0f23", "#7b2ff7", "#c471f5", "#ff9a9e"], icon: Flame },
  price: { label: "Price Growth", color: ["#0a1628", "#00b4d8", "#48cae4", "#90e0ef"], icon: BarChart3 },
};

type LayerType = keyof typeof LAYER_CONFIGS;

const ZONE_BADGE: Record<string, { label: string; className: string }> = {
  hot_investment: { label: "🔥 Hot Investment", className: "bg-destructive/20 text-destructive border-destructive/30" },
  growing: { label: "📈 Growing", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  stable: { label: "🏛️ Stable", className: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
};

const formatPrice = (p: number) => {
  if (p >= 1e9) return `Rp ${(p / 1e9).toFixed(1)}B`;
  if (p >= 1e6) return `Rp ${(p / 1e6).toFixed(0)}M`;
  return `Rp ${p.toLocaleString()}`;
};

// ── Floating Analytics Panel ──
const AnalyticsPanel = memo<{
  zones: MapZone[];
  total: number;
  isLoading: boolean;
  onZoneClick: (zone: MapZone) => void;
  onCompareClick: (cities: string[]) => void;
  selectedZones: string[];
  setSelectedZones: (z: string[]) => void;
}>(({ zones, total, isLoading, onZoneClick, onCompareClick, selectedZones, setSelectedZones }) => {
  const sorted = [...zones].sort((a, b) => b.avg_score - a.avg_score);

  const toggleZoneSelect = (city: string) => {
    setSelectedZones(
      selectedZones.includes(city)
        ? selectedZones.filter((c) => c !== city)
        : selectedZones.length < 4
        ? [...selectedZones, city]
        : selectedZones
    );
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute top-4 left-4 z-20 w-80"
    >
      <Card className="bg-background/90 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Investment Zones</h3>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : `${total} properties`}
            </Badge>
          </div>

          {selectedZones.length >= 2 && (
            <Button
              size="sm"
              className="w-full mb-3 gap-2 text-xs"
              onClick={() => onCompareClick(selectedZones)}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Compare {selectedZones.length} Zones
            </Button>
          )}

          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {sorted.slice(0, 15).map((zone) => {
                const badge = ZONE_BADGE[zone.classification] || ZONE_BADGE.stable;
                const isSelected = selectedZones.includes(zone.city);
                return (
                  <motion.div
                    key={zone.city}
                    whileHover={{ scale: 1.01 }}
                    className={cn(
                      "p-2.5 rounded-xl border cursor-pointer transition-all",
                      isSelected
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/30 hover:border-primary/30 bg-background/60"
                    )}
                    onClick={() => onZoneClick(zone)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleZoneSelect(zone.city);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-3 w-3 rounded border-border accent-primary"
                          />
                          <span className="text-xs font-semibold text-foreground truncate">{zone.city}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", badge.className)}>
                            {badge.label}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{zone.count} listings</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-primary">{zone.avg_score}</div>
                        <div className="text-[9px] text-muted-foreground">Score</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
});
AnalyticsPanel.displayName = "AnalyticsPanel";

// ── Zone Detail Drawer ──
const ZoneDetailDrawer = memo<{
  stats: ZoneStats | null;
  isLoading: boolean;
  onClose: () => void;
}>(({ stats, isLoading, onClose }) => {
  if (!stats && !isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="absolute bottom-4 left-4 right-4 z-30"
      >
        <Card className="bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : stats ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{stats.city} Investment Profile</h3>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] mt-1", ZONE_BADGE[stats.classification]?.className)}
                    >
                      {ZONE_BADGE[stats.classification]?.label || stats.classification}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Properties", value: stats.total_properties, icon: Building2 },
                    { label: "Avg Score", value: stats.avg_opportunity_score, icon: TrendingUp },
                    { label: "Avg Demand", value: stats.avg_demand_score, icon: Flame },
                    { label: "Elite Deals", value: stats.elite_opportunities, icon: Sparkles },
                  ].map((kpi) => (
                    <div key={kpi.label} className="text-center p-2 rounded-lg bg-muted/30">
                      <kpi.icon className="h-3.5 w-3.5 mx-auto text-primary mb-1" />
                      <div className="text-sm font-bold text-foreground">{kpi.value}</div>
                      <div className="text-[9px] text-muted-foreground">{kpi.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">Avg Price</p>
                  <p className="text-sm font-bold text-primary">{formatPrice(stats.avg_price)}</p>
                </div>
                {Object.keys(stats.type_distribution).length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">Property Types</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(stats.type_distribution)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 6)
                        .map(([type, count]) => (
                          <Badge key={type} variant="secondary" className="text-[9px]">
                            {type}: {count}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
});
ZoneDetailDrawer.displayName = "ZoneDetailDrawer";

// ── Zone Comparison Modal ──
const ZoneComparisonPanel = memo<{
  data: ZoneComparison[] | null;
  onClose: () => void;
}>(({ data, onClose }) => {
  if (!data) return null;

  const maxScore = Math.max(...data.map((d) => d.avg_opportunity_score));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-40"
      >
        <Card className="bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Zone Comparison</h3>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.map((zone) => (
                <div
                  key={zone.city}
                  className={cn(
                    "p-3 rounded-xl border",
                    zone.avg_opportunity_score === maxScore
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/30 bg-muted/20"
                  )}
                >
                  <h4 className="text-xs font-bold text-foreground mb-2 truncate">{zone.city}</h4>
                  {zone.avg_opportunity_score === maxScore && (
                    <Badge className="text-[8px] mb-2 bg-primary/20 text-primary border-0">👑 Top Zone</Badge>
                  )}
                  <div className="space-y-1.5">
                    {[
                      { label: "Properties", value: zone.total_properties },
                      { label: "Avg Score", value: zone.avg_opportunity_score },
                      { label: "Demand", value: zone.avg_demand_score },
                      { label: "Elite %", value: `${zone.elite_ratio}%` },
                      { label: "Avg Price", value: formatPrice(zone.avg_price) },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-semibold text-foreground">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
});
ZoneComparisonPanel.displayName = "ZoneComparisonPanel";

// ── Property Popup ──
const PropertyPopup = memo<{ property: MapProperty; onClose: () => void }>(({ property, onClose }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-4 right-4 z-30 w-72"
    >
      <Card className="bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
        {property.image_url && (
          <div className="h-32 bg-muted">
            <img src={property.image_url} alt={property.title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <h4 className="text-xs font-bold text-foreground leading-tight flex-1 mr-2">{property.title}</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          {(property.city || property.district) && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                {[property.district, property.city].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          <p className="text-sm font-bold text-primary mt-1.5">{formatPrice(property.price)}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {property.bedrooms && (
              <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                <BedDouble className="h-2.5 w-2.5" /> {property.bedrooms} BR
              </span>
            )}
            {property.area_sqm && (
              <span className="text-[9px] text-muted-foreground">{property.area_sqm}m²</span>
            )}
            {property.opportunity_score && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] px-1.5 py-0",
                  property.opportunity_score >= 85
                    ? "text-emerald-400 border-emerald-500/30"
                    : property.opportunity_score >= 70
                    ? "text-amber-400 border-amber-500/30"
                    : "text-muted-foreground"
                )}
              >
                Score {property.opportunity_score}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            className="w-full mt-2.5 text-xs gap-1.5"
            onClick={() => navigate(`/property/${property.id}`)}
          >
            <Eye className="h-3 w-3" /> View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
});
PropertyPopup.displayName = "PropertyPopup";

// ── Filter Bar ──
const FilterBar = memo<{
  filters: MapFilters;
  setFilters: (f: MapFilters) => void;
  activeLayer: LayerType;
  setActiveLayer: (l: LayerType) => void;
  showHeat: boolean;
  setShowHeat: (v: boolean) => void;
}>(({ filters, setFilters, activeLayer, setActiveLayer, showHeat, setShowHeat }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
      {/* Layer toggle buttons */}
      <div className="flex gap-1.5 bg-background/90 backdrop-blur-xl rounded-xl border border-border/50 p-1.5 shadow-lg">
        {(Object.keys(LAYER_CONFIGS) as LayerType[]).map((key) => {
          const cfg = LAYER_CONFIGS[key];
          return (
            <Button
              key={key}
              variant={activeLayer === key ? "default" : "ghost"}
              size="sm"
              className="h-8 text-[10px] gap-1.5 px-2.5"
              onClick={() => setActiveLayer(key)}
            >
              <cfg.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{cfg.label}</span>
            </Button>
          );
        })}
        <div className="w-px bg-border/50 mx-0.5" />
        <div className="flex items-center gap-1.5 px-2">
          <Switch checked={showHeat} onCheckedChange={setShowHeat} className="h-4 w-7" />
          <Label className="text-[10px] text-muted-foreground">Heat</Label>
        </div>
      </div>

      {/* Filter toggle */}
      <Button
        variant="secondary"
        size="sm"
        className="gap-1.5 text-xs bg-background/90 backdrop-blur-xl border border-border/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter className="h-3.5 w-3.5" />
        Filters
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
          >
            <Card className="bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl w-64">
              <CardContent className="p-3 space-y-3">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Property Type</Label>
                  <Select
                    value={filters.property_type || "all"}
                    onValueChange={(v) => setFilters({ ...filters, property_type: v === "all" ? undefined : v })}
                  >
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Min Score: {filters.min_score || 0}</Label>
                  <Slider
                    value={[filters.min_score || 0]}
                    onValueChange={([v]) => setFilters({ ...filters, min_score: v || undefined })}
                    max={100}
                    step={5}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Min Bedrooms</Label>
                  <Select
                    value={String(filters.bedrooms || "any")}
                    onValueChange={(v) => setFilters({ ...filters, bedrooms: v === "any" ? undefined : Number(v) })}
                  >
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}+
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setFilters({})}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
FilterBar.displayName = "FilterBar";

// ── Main Page ──
export default function InvestmentMapExplorerPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [filters, setFilters] = useState<MapFilters>({});
  const [activeLayer, setActiveLayer] = useState<LayerType>("opportunity");
  const [showHeat, setShowHeat] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const { data, isLoading } = useInvestmentMapExplorer(bounds, filters);
  const zoneStatsMutation = useZoneStats();
  const { comparisonData, compare, clearComparison } = useZoneComparison();

  const updateBounds = useCallback(() => {
    if (!map.current) return;
    const b = map.current.getBounds();
    setBounds({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
  }, []);

  // Init map
  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [117.0, -2.5], // Indonesia center
      zoom: 5.5,
      pitch: 30,
      bearing: 0,
      antialias: true,
    });

    m.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "bottom-right");

    m.on("load", () => {
      setIsMapReady(true);
      updateBounds();

      // Add empty heatmap source
      m.addSource("heat-source", { type: "geojson", data: { type: "FeatureCollection", features: [] } });

      // Heatmap layer
      m.addLayer({
        id: "heat-layer",
        type: "heatmap",
        source: "heat-source",
        paint: {
          "heatmap-weight": ["get", "weight"],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 4, 0.3, 10, 1.5],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 4, 15, 10, 40],
          "heatmap-opacity": 0.7,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.2, "hsl(270,80%,30%)",
            0.4, "hsl(330,80%,50%)",
            0.6, "hsl(0,90%,55%)",
            0.8, "hsl(30,100%,55%)",
            1, "hsl(55,100%,65%)",
          ],
        },
      });
    });

    const debounce = (fn: () => void, ms: number) => {
      let t: NodeJS.Timeout;
      return () => { clearTimeout(t); t = setTimeout(fn, ms); };
    };
    const debouncedUpdate = debounce(updateBounds, 300);
    m.on("moveend", debouncedUpdate);
    m.on("zoomend", debouncedUpdate);

    map.current = m;
    return () => { m.remove(); };
  }, []);

  // Update heatmap data
  useEffect(() => {
    if (!map.current || !isMapReady || !data?.heat_points) return;

    const src = map.current.getSource("heat-source") as mapboxgl.GeoJSONSource;
    if (!src) return;

    const features = data.heat_points.map((pt) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [pt.lng, pt.lat] },
      properties: {
        weight: activeLayer === "opportunity" ? pt.weight : activeLayer === "demand" ? pt.demand : pt.price / 5e9,
      },
    }));

    src.setData({ type: "FeatureCollection", features });

    // Toggle heatmap visibility
    if (map.current.getLayer("heat-layer")) {
      map.current.setLayoutProperty("heat-layer", "visibility", showHeat ? "visible" : "none");
    }
  }, [data?.heat_points, activeLayer, showHeat, isMapReady]);

  // Update property markers
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!data?.properties) return;

    // Only show markers at zoom >= 10
    const zoom = map.current.getZoom();
    if (zoom < 9) return;

    data.properties.slice(0, 200).forEach((prop) => {
      if (!prop.latitude || !prop.longitude) return;

      const score = prop.opportunity_score || 50;
      const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#6b7280";

      const el = document.createElement("div");
      el.className = "investment-map-marker";
      el.style.cssText = `
        width: 12px; height: 12px; border-radius: 50%;
        background: ${color}; border: 2px solid rgba(255,255,255,0.8);
        box-shadow: 0 0 8px ${color}80;
        cursor: pointer; transition: transform 0.15s;
      `;
      el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.5)"; });
      el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([prop.longitude, prop.latitude])
        .addTo(map.current!);

      el.addEventListener("click", () => setSelectedProperty(prop));
      markersRef.current.push(marker);
    });
  }, [data?.properties, isMapReady]);

  // Handle zone click → fly to + fetch stats
  const handleZoneClick = useCallback(
    (zone: MapZone) => {
      if (map.current) {
        map.current.flyTo({ center: [zone.lng, zone.lat], zoom: 11, duration: 1500, pitch: 40 });
      }
      zoneStatsMutation.mutate(zone.city);
    },
    [zoneStatsMutation]
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainer.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={cn("relative w-full", isFullscreen ? "h-screen" : "h-[calc(100vh-80px)]")}>
      {/* Map */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="bg-background/80 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3 shadow-xl border border-border/50">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-xs font-medium text-foreground">Analyzing investment zones…</span>
          </div>
        </div>
      )}

      {/* Analytics Panel */}
      {data && (
        <AnalyticsPanel
          zones={data.zones}
          total={data.total}
          isLoading={isLoading}
          onZoneClick={handleZoneClick}
          onCompareClick={compare}
          selectedZones={selectedZones}
          setSelectedZones={setSelectedZones}
        />
      )}

      {/* Filter + Layer controls */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        showHeat={showHeat}
        setShowHeat={setShowHeat}
      />

      {/* Fullscreen button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-4 right-16 z-20 h-8 w-8 bg-background/90 backdrop-blur-xl border border-border/50"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>

      {/* Layer legend */}
      {showHeat && (
        <div className="absolute bottom-4 left-4 z-20 bg-background/90 backdrop-blur-xl rounded-lg border border-border/50 px-3 py-2 shadow-lg">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            {LAYER_CONFIGS[activeLayer].label}
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-muted-foreground">Low</span>
            <div className="h-2 w-24 rounded-full bg-gradient-to-r from-[hsl(270,80%,30%)] via-[hsl(0,90%,55%)] to-[hsl(55,100%,65%)]" />
            <span className="text-[8px] text-muted-foreground">High</span>
          </div>
        </div>
      )}

      {/* Zone Detail */}
      <ZoneDetailDrawer
        stats={zoneStatsMutation.data || null}
        isLoading={zoneStatsMutation.isPending}
        onClose={() => zoneStatsMutation.reset()}
      />

      {/* Zone Comparison */}
      <ZoneComparisonPanel data={comparisonData} onClose={clearComparison} />

      {/* Property Popup */}
      {selectedProperty && (
        <PropertyPopup property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </div>
  );
}
