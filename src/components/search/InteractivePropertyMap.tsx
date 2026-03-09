import { useEffect, useRef, useState, useCallback, memo, useMemo, createRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Search, SlidersHorizontal, X, Bed, Bath, Maximize2,
  Home, Building2, Layers, Flame, Pentagon, ChevronUp, ChevronDown,
  Loader2, TrendingUp, DollarSign, Eye, Sparkles, List, Map as MapIcon,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMapProperties, MapBounds, MapFilters, MapProperty } from '@/hooks/useMapProperties';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';
import MapNLPSearchBar, { MapNLPResult } from '@/components/search/MapNLPSearchBar';
import SyncedPropertyCard from '@/components/search/SyncedPropertyCard';
import { cn } from '@/lib/utils';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTN1eGo4eXAwMWV4MnFzYTNwaTgzZnN0In0.JfxWbLcAYW83y5b-A5hLUQ';

const DEFAULT_CENTER: [number, number] = [117.5, -2.5];
const DEFAULT_ZOOM = 5;

const formatPrice = (price: number) => {
  if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)}M`;
  if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)}jt`;
  if (price >= 1_000) return `Rp ${(price / 1_000).toFixed(0)}rb`;
  return `Rp ${price}`;
};

// ── Filter Panel ──
const FilterPanel = memo(({
  filters, onFiltersChange, showHeatmap, onToggleHeatmap,
  drawMode, onSetDrawMode, propertyCount, isLoading, isOpen, onToggle,
}: {
  filters: MapFilters;
  onFiltersChange: (f: MapFilters) => void;
  showHeatmap: boolean;
  onToggleHeatmap: (v: boolean) => void;
  drawMode: 'none' | 'polygon';
  onSetDrawMode: (m: 'none' | 'polygon') => void;
  propertyCount: number;
  isLoading: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const priceRange = [filters.minPrice || 0, filters.maxPrice || 50_000_000_000];

  return (
    <div className={`absolute top-4 left-4 z-30 transition-all duration-300 ${isOpen ? 'w-72' : 'w-auto'}`}>
      {!isOpen && (
        <Button size="sm" className="shadow-xl bg-background text-foreground border border-border hover:bg-muted" onClick={onToggle}>
          <SlidersHorizontal className="h-4 w-4 mr-2" /> Filter
          {propertyCount > 0 && <Badge variant="secondary" className="ml-2 text-[10px]">{propertyCount}</Badge>}
        </Button>
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <Card className="bg-background/95 backdrop-blur-md border-border/60 shadow-2xl overflow-hidden">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Filter Peta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : `${propertyCount} properti`}
                    </Badge>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onToggle}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Rentang Harga</Label>
                  <Slider value={priceRange} min={0} max={50_000_000_000} step={100_000_000}
                    onValueChange={([min, max]) => onFiltersChange({ ...filters, minPrice: min || undefined, maxPrice: max >= 50_000_000_000 ? undefined : max })}
                    className="py-2" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{priceRange[1] >= 50_000_000_000 ? 'Max' : formatPrice(priceRange[1])}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Kamar Tidur (min)</Label>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map(n => (
                      <Button key={n} size="sm" variant={(filters.minBedrooms || 0) === n ? 'default' : 'outline'}
                        className="h-7 px-2.5 text-xs flex-1"
                        onClick={() => onFiltersChange({ ...filters, minBedrooms: n || undefined })}>
                        {n === 0 ? 'All' : `${n}+`}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Tipe Properti</Label>
                  <Select value={filters.propertyType || 'all'} onValueChange={v => onFiltersChange({ ...filters, propertyType: v === 'all' ? undefined : v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tipe</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">Rumah</SelectItem>
                      <SelectItem value="land">Tanah</SelectItem>
                      <SelectItem value="commercial">Komersial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-px bg-border" />
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Overlay Peta</Label>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="heatmap-toggle" className="text-xs flex items-center gap-1.5 cursor-pointer">
                      <Flame className="h-3 w-3 text-chart-3" /> Heatmap
                    </Label>
                    <Switch id="heatmap-toggle" checked={showHeatmap} onCheckedChange={onToggleHeatmap} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Cari di Area</Label>
                  <Button size="sm" variant={drawMode === 'polygon' ? 'default' : 'outline'}
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => onSetDrawMode(drawMode === 'polygon' ? 'none' : 'polygon')}>
                    <Pentagon className="h-3.5 w-3.5 mr-2" />
                    {drawMode === 'polygon' ? 'Drawing...' : 'Gambar Polygon'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
FilterPanel.displayName = 'FilterPanel';

// ── Main Component ──
export default function InteractivePropertyMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const markersRef = useRef<Map<string, { marker: mapboxgl.Marker; el: HTMLDivElement }>>(new Map());
  const cardRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const listScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [filters, setFilters] = useState<MapFilters>({});
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [drawMode, setDrawMode] = useState<'none' | 'polygon'>('none');
  const [filterOpen, setFilterOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [nlpActive, setNlpActive] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(true);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'score' | 'newest'>('default');

  const navigate = useNavigate();
  const { data: properties = [], isLoading } = useMapProperties(bounds, filters, mapReady);

  // ── Sorted properties ──
  const sortedProperties = useMemo(() => {
    if (sortBy === 'default') return properties;
    const sorted = [...properties];
    switch (sortBy) {
      case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
      case 'score': return sorted.sort((a, b) => (b.investment_score || 0) - (a.investment_score || 0));
      case 'newest': return sorted; // already ordered by created_at from RPC
      default: return sorted;
    }
  }, [properties, sortBy]);

  // ── Hover handler (bidirectional) ──
  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  // ── Highlight marker on hover ──
  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
      const inner = el.firstElementChild as HTMLElement;
      if (!inner) return;
      if (id === hoveredId) {
        inner.style.transform = 'scale(1.35)';
        inner.style.zIndex = '999';
        inner.style.boxShadow = '0 0 0 4px hsl(var(--primary) / 0.4), 0 4px 16px rgba(0,0,0,0.3)';
        el.style.zIndex = '999';
      } else {
        inner.style.transform = 'scale(1)';
        inner.style.zIndex = '1';
        inner.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';
        el.style.zIndex = '1';
      }
    });

    // Auto-scroll property list to hovered card
    if (hoveredId) {
      const cardEl = cardRefsMap.current.get(hoveredId);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      // Mobile: scroll horizontal strip
      const mobileContainer = mobileScrollRef.current;
      if (mobileContainer && cardEl) {
        const offset = cardEl.offsetLeft - mobileContainer.offsetWidth / 2 + cardEl.offsetWidth / 2;
        mobileContainer.scrollTo({ left: offset, behavior: 'smooth' });
      }
    }
  }, [hoveredId]);

  // ── Property click → fly to + select ──
  const handlePropertyClick = useCallback((property: MapProperty) => {
    setSelectedProperty(property);
    const m = mapRef.current;
    if (m) {
      m.flyTo({ center: [property.longitude, property.latitude], zoom: Math.max(m.getZoom(), 14), duration: 1200 });
    }
  }, []);

  const handleViewDetails = useCallback(() => {
    if (selectedProperty) navigate(`/property/${selectedProperty.id}`);
  }, [selectedProperty, navigate]);

  // ── NLP search ──
  const handleNLPResult = useCallback((result: MapNLPResult) => {
    setFilters(result.filters);
    setNlpActive(Object.keys(result.filters).length > 0);
    if (result.flyTo && mapRef.current) {
      mapRef.current.flyTo({ center: [result.flyTo.lng, result.flyTo.lat], zoom: result.flyTo.zoom, duration: 2000 });
    }
  }, []);

  // ── Initialize map ──
  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 3,
      maxZoom: 18,
      attributionControl: false,
    });

    m.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    m.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
    m.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false }), 'bottom-right');

    const draw = new MapboxDraw({ displayControlsDefault: false, controls: {} });
    m.addControl(draw as any);
    drawRef.current = draw;

    m.on('load', () => {
      setMapReady(true);
      updateBounds(m);

      m.addSource('property-cluster', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true, clusterMaxZoom: 14, clusterRadius: 60,
      });

      m.addLayer({
        id: 'clusters', type: 'circle', source: 'property-cluster',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], 'hsl(215, 65%, 55%)', 10, 'hsl(265, 60%, 55%)', 50, 'hsl(340, 65%, 50%)'],
          'circle-radius': ['step', ['get', 'point_count'], 22, 10, 28, 50, 35],
          'circle-stroke-width': 2, 'circle-stroke-color': '#fff',
        },
      });

      m.addLayer({
        id: 'cluster-count', type: 'symbol', source: 'property-cluster',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['case', ['>=', ['get', 'point_count'], 1000],
            ['concat', ['to-string', ['/', ['round', ['/', ['get', 'point_count'], 100]], 10]], 'K'],
            ['to-string', ['get', 'point_count']]],
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: { 'text-color': '#ffffff' },
      });

      m.addSource('property-heat', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addLayer({
        id: 'property-heatmap', type: 'heatmap', source: 'property-heat',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'price'], 0, 0.1, 10000000000, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 15, 3],
          'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(33,102,172,0)', 0.2, 'hsl(215, 65%, 65%)', 0.4, 'hsl(180, 50%, 50%)',
            0.6, 'hsl(60, 80%, 55%)', 0.8, 'hsl(25, 85%, 55%)', 1, 'hsl(0, 80%, 50%)'],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 15, 30],
          'heatmap-opacity': 0.7,
        },
        layout: { visibility: 'none' },
      });

      m.on('click', 'clusters', (e) => {
        const features = m.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id;
        const source = m.getSource('property-cluster') as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !zoom) return;
          const coords = (features[0].geometry as any).coordinates;
          m.easeTo({ center: coords, zoom: zoom + 1 });
        });
      });

      m.on('mouseenter', 'clusters', () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'clusters', () => { m.getCanvas().style.cursor = ''; });
    });

    const onMoveEnd = () => updateBounds(m);
    m.on('moveend', onMoveEnd);
    mapRef.current = m;

    return () => { m.off('moveend', onMoveEnd); m.remove(); mapRef.current = null; };
  }, []);

  const updateBounds = useCallback((m: mapboxgl.Map) => {
    const b = m.getBounds();
    setBounds({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
  }, []);

  // ── Update markers ──
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !mapReady) return;

    // Remove old markers not in new set
    const newIds = new Set(properties.map(p => p.id));
    markersRef.current.forEach(({ marker }, id) => {
      if (!newIds.has(id)) { marker.remove(); markersRef.current.delete(id); }
    });

    // Build GeoJSON
    const features: GeoJSON.Feature[] = properties.map(p => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.longitude, p.latitude] },
      properties: { id: p.id, price: p.price, title: p.title },
    }));
    const geojson: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };

    const clusterSrc = m.getSource('property-cluster') as mapboxgl.GeoJSONSource | undefined;
    if (clusterSrc) clusterSrc.setData(geojson);
    const heatSrc = m.getSource('property-heat') as mapboxgl.GeoJSONSource | undefined;
    if (heatSrc) heatSrc.setData(geojson);

    // Price markers at zoom > 12
    if (m.getZoom() > 12) {
      properties.forEach(p => {
        if (markersRef.current.has(p.id)) return; // already exists

        const el = document.createElement('div');
        el.className = 'map-price-marker';
        el.innerHTML = `<div style="
          background: hsl(var(--primary));
          color: white;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          cursor: pointer;
          border: 2px solid white;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        ">${formatPrice(p.price)}</div>`;

        el.addEventListener('mouseenter', () => handleHover(p.id));
        el.addEventListener('mouseleave', () => handleHover(null));
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedProperty(p);
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([p.longitude, p.latitude])
          .addTo(m);
        markersRef.current.set(p.id, { marker, el });
      });
    } else {
      // Remove individual markers when zoomed out (clusters visible)
      markersRef.current.forEach(({ marker }, id) => { marker.remove(); });
      markersRef.current.clear();
    }
  }, [properties, mapReady, handleHover]);

  // ── Heatmap toggle ──
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !mapReady) return;
    try {
      m.setLayoutProperty('property-heatmap', 'visibility', showHeatmap ? 'visible' : 'none');
      m.setLayoutProperty('clusters', 'visibility', showHeatmap ? 'none' : 'visible');
      m.setLayoutProperty('cluster-count', 'visibility', showHeatmap ? 'none' : 'visible');
    } catch {}
  }, [showHeatmap, mapReady]);

  // ── Draw mode ──
  useEffect(() => {
    const draw = drawRef.current;
    const m = mapRef.current;
    if (!draw || !m) return;
    if (drawMode === 'polygon') draw.changeMode('draw_polygon');
    else draw.deleteAll();

    const onDrawCreate = () => setDrawMode('none');
    m.on('draw.create', onDrawCreate);
    return () => { m.off('draw.create', onDrawCreate); };
  }, [drawMode]);

  // Card ref setter
  const setCardRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) cardRefsMap.current.set(id, el);
    else cardRefsMap.current.delete(id);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background flex">
      {/* ═══ DESKTOP: Left Property List Panel ═══ */}
      <div className={cn(
        "hidden md:flex flex-col border-r border-border bg-background transition-all duration-300 relative z-10",
        panelCollapsed ? "w-0 overflow-hidden" : "w-[380px] lg:w-[420px]"
      )}>
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Properti</span>
            <Badge variant="secondary" className="text-[10px]">
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : properties.length}
            </Badge>
          </div>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPanelCollapsed(true)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable property list */}
        <div ref={listScrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
          {properties.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <MapPin className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">Tidak ada properti di area ini</p>
              <p className="text-xs mt-1">Geser peta atau ubah filter</p>
            </div>
          )}
          {isLoading && properties.length === 0 && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-[120px] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          )}
          {properties.map(p => (
            <SyncedPropertyCard
              key={p.id}
              ref={(el) => setCardRef(p.id, el)}
              property={p}
              isHighlighted={hoveredId === p.id}
              onHover={handleHover}
              onClick={handlePropertyClick}
            />
          ))}
        </div>
      </div>

      {/* Expand button when collapsed */}
      {panelCollapsed && (
        <Button
          size="icon"
          variant="outline"
          className="hidden md:flex absolute top-1/2 left-0 -translate-y-1/2 z-30 h-10 w-6 rounded-l-none rounded-r-lg border-l-0 bg-background shadow-lg"
          onClick={() => setPanelCollapsed(false)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* ═══ MAP AREA ═══ */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* AI NLP Search Bar */}
        <MapNLPSearchBar onResult={handleNLPResult} />

        {/* NLP active indicator */}
        <AnimatePresence>
          {nlpActive && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="absolute top-[4.5rem] left-1/2 -translate-x-1/2 z-30">
              <Badge className="bg-primary/90 text-primary-foreground text-[10px] gap-1.5 px-3 py-1 shadow-lg backdrop-blur-sm">
                <Sparkles className="h-3 w-3" /> AI filters active
                <button onClick={() => { setFilters({}); setNlpActive(false); }} className="ml-1 hover:opacity-70"><X className="h-3 w-3" /></button>
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Panel (on top of map) */}
        <FilterPanel
          filters={filters} onFiltersChange={setFilters}
          showHeatmap={showHeatmap} onToggleHeatmap={setShowHeatmap}
          drawMode={drawMode} onSetDrawMode={setDrawMode}
          propertyCount={properties.length} isLoading={isLoading}
          isOpen={filterOpen} onToggle={() => setFilterOpen(o => !o)}
        />

        {/* Property count badge */}
        <div className="absolute top-4 right-4 z-20 sm:right-16">
          <Badge className="bg-background/95 backdrop-blur-md text-foreground border border-border/60 shadow-lg text-xs px-3 py-1.5">
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Building2 className="h-3 w-3 mr-1.5 text-primary" />}
            {properties.length} properti
          </Badge>
        </div>

        {/* Selected Property Popup */}
        <AnimatePresence>
          {selectedProperty && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[340px] max-w-[90vw] hidden md:block"
            >
              <Card className="overflow-hidden border-border/60 shadow-2xl bg-card/95 backdrop-blur-md">
                <div className="relative">
                  <img
                    src={selectedProperty.thumbnail_url || selectedProperty.images?.[0] || '/placeholder.svg'}
                    alt={selectedProperty.title}
                    className="w-full h-40 object-cover" loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                  <Button size="icon" variant="ghost"
                    className="absolute top-2 right-2 h-7 w-7 bg-background/80 backdrop-blur-sm rounded-full"
                    onClick={() => setSelectedProperty(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground font-bold text-xs shadow-md">
                    {formatPrice(selectedProperty.price)}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-bold text-foreground line-clamp-1 mb-1">{selectedProperty.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {selectedProperty.city || selectedProperty.location}, {selectedProperty.state}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    {selectedProperty.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{selectedProperty.bedrooms}</span>}
                    {selectedProperty.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{selectedProperty.bathrooms}</span>}
                    {selectedProperty.building_area_sqm && <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" />{selectedProperty.building_area_sqm}m²</span>}
                    <Badge variant="outline" className="text-[10px] ml-auto">{selectedProperty.property_type}</Badge>
                  </div>
                  <Button size="sm" className="w-full h-8 text-xs font-semibold" onClick={handleViewDetails}>
                    <Eye className="h-3 w-3 mr-1.5" /> Lihat Detail
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ MOBILE: Bottom Swipeable Card Strip ═══ */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-20">
        {/* Toggle handle */}
        <div className="flex justify-center pb-1">
          <button
            onClick={() => setMobileSheetOpen(o => !o)}
            className="bg-background/95 backdrop-blur-md rounded-t-xl px-6 py-1.5 shadow-lg border border-b-0 border-border/60"
          >
            <div className="w-8 h-1 rounded-full bg-muted-foreground/40 mx-auto" />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              {properties.length} properti
            </span>
          </button>
        </div>

        <AnimatePresence>
          {mobileSheetOpen && (
            <motion.div
              initial={{ y: 160 }}
              animate={{ y: 0 }}
              exit={{ y: 160 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-background/95 backdrop-blur-md border-t border-border/60 shadow-2xl"
            >
              <div
                ref={mobileScrollRef}
                className="flex gap-3 px-4 py-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {properties.length === 0 && !isLoading && (
                  <div className="flex-shrink-0 w-full flex items-center justify-center py-4">
                    <p className="text-xs text-muted-foreground">Geser peta untuk cari properti</p>
                  </div>
                )}
                {properties.map(p => (
                  <SyncedPropertyCard
                    key={p.id}
                    ref={(el) => setCardRef(p.id, el)}
                    property={p}
                    isHighlighted={hoveredId === p.id}
                    onHover={handleHover}
                    onClick={handlePropertyClick}
                    compact
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile: Geser hint when sheet is closed */}
      {!mobileSheetOpen && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 md:hidden">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-[10px] border-border/40 shadow-md">
            <MapPin className="h-3 w-3 mr-1" /> Geser peta untuk cari properti
          </Badge>
        </div>
      )}
    </div>
  );
}
