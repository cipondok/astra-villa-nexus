import { useEffect, useRef, useState, useCallback, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Search, SlidersHorizontal, X, Bed, Bath, Maximize2,
  Home, Building2, Layers, Flame, Pentagon, ChevronUp, ChevronDown,
  Loader2, TrendingUp, DollarSign, Eye,
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

const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTN1eGo4eXAwMWV4MnFzYTNwaTgzZnN0In0.JfxWbLcAYW83y5b-A5hLUQ';

// Indonesia center
const DEFAULT_CENTER: [number, number] = [117.5, -2.5];
const DEFAULT_ZOOM = 5;

const formatPrice = (price: number) => {
  if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)}M`;
  if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)}jt`;
  if (price >= 1_000) return `Rp ${(price / 1_000).toFixed(0)}rb`;
  return `Rp ${price}`;
};

// ── Property Popup Card ──
const PropertyPopupCard = memo(({ property, onClose, onViewDetails }: {
  property: MapProperty;
  onClose: () => void;
  onViewDetails: () => void;
}) => {
  const imageUrl = property.thumbnail_url
    || (property.images && property.images.length > 0 ? property.images[0] : null)
    || (property.image_urls && property.image_urls.length > 0 ? property.image_urls[0] : null)
    || '/placeholder.svg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[340px] max-w-[90vw]"
    >
      <Card className="overflow-hidden border-border/60 shadow-2xl bg-card/95 backdrop-blur-md">
        <div className="relative">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-40 object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-7 w-7 bg-background/80 backdrop-blur-sm rounded-full"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground font-bold text-xs shadow-md">
            {formatPrice(property.price)}
          </Badge>
          {property.investment_score && property.investment_score >= 80 && (
            <Badge className="absolute bottom-2 right-2 bg-chart-3/90 text-primary-foreground text-[10px]">
              <TrendingUp className="h-3 w-3 mr-1" /> Score {property.investment_score}
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="text-sm font-bold text-foreground line-clamp-1 mb-1">{property.title}</h3>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.city || property.location}, {property.state}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {property.bedrooms}</span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {property.bathrooms}</span>
            )}
            {property.building_area_sqm && (
              <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" /> {property.building_area_sqm}m²</span>
            )}
            <Badge variant="outline" className="text-[10px] ml-auto">{property.property_type}</Badge>
          </div>
          <Button size="sm" className="w-full h-8 text-xs font-semibold" onClick={onViewDetails}>
            <Eye className="h-3 w-3 mr-1.5" /> Lihat Detail
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
});
PropertyPopupCard.displayName = 'PropertyPopupCard';

// ── Filter Panel ──
const FilterPanel = memo(({
  filters,
  onFiltersChange,
  showHeatmap,
  onToggleHeatmap,
  drawMode,
  onSetDrawMode,
  propertyCount,
  isLoading,
  isOpen,
  onToggle,
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
      {/* Toggle button */}
      {!isOpen && (
        <Button
          size="sm"
          className="shadow-xl bg-background text-foreground border border-border hover:bg-muted"
          onClick={onToggle}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filter
          {propertyCount > 0 && (
            <Badge variant="secondary" className="ml-2 text-[10px]">{propertyCount}</Badge>
          )}
        </Button>
      )}

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
          >
            <Card className="bg-background/95 backdrop-blur-md border-border/60 shadow-2xl overflow-hidden">
              <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Filter Peta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : `${propertyCount} properti`}
                    </Badge>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onToggle}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Rentang Harga</Label>
                  <Slider
                    value={priceRange}
                    min={0}
                    max={50_000_000_000}
                    step={100_000_000}
                    onValueChange={([min, max]) => onFiltersChange({ ...filters, minPrice: min || undefined, maxPrice: max >= 50_000_000_000 ? undefined : max })}
                    className="py-2"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{priceRange[1] >= 50_000_000_000 ? 'Max' : formatPrice(priceRange[1])}</span>
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Kamar Tidur (min)</Label>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map(n => (
                      <Button
                        key={n}
                        size="sm"
                        variant={(filters.minBedrooms || 0) === n ? 'default' : 'outline'}
                        className="h-7 px-2.5 text-xs flex-1"
                        onClick={() => onFiltersChange({ ...filters, minBedrooms: n || undefined })}
                      >
                        {n === 0 ? 'All' : `${n}+`}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Tipe Properti</Label>
                  <Select
                    value={filters.propertyType || 'all'}
                    onValueChange={v => onFiltersChange({ ...filters, propertyType: v === 'all' ? undefined : v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
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

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Map Overlays */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Overlay Peta</Label>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="heatmap-toggle" className="text-xs flex items-center gap-1.5 cursor-pointer">
                      <Flame className="h-3 w-3 text-chart-3" /> Heatmap
                    </Label>
                    <Switch id="heatmap-toggle" checked={showHeatmap} onCheckedChange={onToggleHeatmap} />
                  </div>
                </div>

                {/* Draw tools */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Cari di Area</Label>
                  <Button
                    size="sm"
                    variant={drawMode === 'polygon' ? 'default' : 'outline'}
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => onSetDrawMode(drawMode === 'polygon' ? 'none' : 'polygon')}
                  >
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
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [filters, setFilters] = useState<MapFilters>({});
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [drawMode, setDrawMode] = useState<'none' | 'polygon'>('none');
  const [filterOpen, setFilterOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [nlpActive, setNlpActive] = useState(false);

  const navigate = useNavigate();

  const { data: properties = [], isLoading } = useMapProperties(bounds, filters, mapReady);

  // Handle NLP search result
  const handleNLPResult = useCallback((result: MapNLPResult) => {
    const m = mapRef.current;
    // Apply filters
    setFilters(result.filters);

    if (Object.keys(result.filters).length > 0) {
      setNlpActive(true);
    } else {
      setNlpActive(false);
    }

    // Fly to location if detected
    if (result.flyTo && m) {
      m.flyTo({
        center: [result.flyTo.lng, result.flyTo.lat],
        zoom: result.flyTo.zoom,
        duration: 2000,
        essential: true,
      });
    }
  }, []);

  // Initialize map
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

    // Draw tools
    const draw = new MapboxDraw({ displayControlsDefault: false, controls: {} });
    m.addControl(draw as any);
    drawRef.current = draw;

    m.on('load', () => {
      setMapReady(true);
      updateBounds(m);

      // Add GeoJSON source for clustering
      m.addSource('property-cluster', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 60,
      });

      // Cluster circles
      m.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'property-cluster',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], 'hsl(215, 65%, 55%)', 10, 'hsl(265, 60%, 55%)', 50, 'hsl(340, 65%, 50%)'],
          'circle-radius': ['step', ['get', 'point_count'], 22, 10, 28, 50, 35],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Cluster count labels
      m.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'property-cluster',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': [
            'case',
            ['>=', ['get', 'point_count'], 1000],
            ['concat', ['to-string', ['/', ['round', ['/', ['get', 'point_count'], 100]], 10]], 'K'],
            ['to-string', ['get', 'point_count']],
          ],
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: { 'text-color': '#ffffff' },
      });

      // Heatmap layer (hidden by default)
      m.addSource('property-heat', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      m.addLayer({
        id: 'property-heatmap',
        type: 'heatmap',
        source: 'property-heat',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'price'], 0, 0.1, 10000000000, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 15, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'hsl(215, 65%, 65%)',
            0.4, 'hsl(180, 50%, 50%)',
            0.6, 'hsl(60, 80%, 55%)',
            0.8, 'hsl(25, 85%, 55%)',
            1, 'hsl(0, 80%, 50%)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 15, 30],
          'heatmap-opacity': 0.7,
        },
        layout: { visibility: 'none' },
      });

      // Click cluster to zoom
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

    // Update bounds on move
    const onMoveEnd = () => updateBounds(m);
    m.on('moveend', onMoveEnd);

    mapRef.current = m;

    return () => {
      m.off('moveend', onMoveEnd);
      m.remove();
      mapRef.current = null;
    };
  }, []);

  const updateBounds = useCallback((m: mapboxgl.Map) => {
    const b = m.getBounds();
    setBounds({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    });
  }, []);

  // Update markers when properties change
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !mapReady) return;

    // Clear existing markers
    markersRef.current.forEach(mk => mk.remove());
    markersRef.current = [];

    // Build GeoJSON for clusters & heatmap
    const features: GeoJSON.Feature[] = properties.map(p => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.longitude, p.latitude] },
      properties: { id: p.id, price: p.price, title: p.title },
    }));

    const geojson: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };

    // Update cluster source
    const clusterSrc = m.getSource('property-cluster') as mapboxgl.GeoJSONSource | undefined;
    if (clusterSrc) clusterSrc.setData(geojson);

    // Update heatmap source
    const heatSrc = m.getSource('property-heat') as mapboxgl.GeoJSONSource | undefined;
    if (heatSrc) heatSrc.setData(geojson);

    // Add individual price markers for unclustered points (zoom > 12)
    if (m.getZoom() > 12) {
      properties.forEach(p => {
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
          transition: transform 0.15s;
        ">${formatPrice(p.price)}</div>`;

        el.addEventListener('mouseenter', () => {
          (el.firstElementChild as HTMLElement).style.transform = 'scale(1.1)';
        });
        el.addEventListener('mouseleave', () => {
          (el.firstElementChild as HTMLElement).style.transform = 'scale(1)';
        });
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedProperty(p);
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([p.longitude, p.latitude])
          .addTo(m);
        markersRef.current.push(marker);
      });
    }
  }, [properties, mapReady]);

  // Toggle heatmap visibility
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !mapReady) return;
    try {
      m.setLayoutProperty('property-heatmap', 'visibility', showHeatmap ? 'visible' : 'none');
      m.setLayoutProperty('clusters', 'visibility', showHeatmap ? 'none' : 'visible');
      m.setLayoutProperty('cluster-count', 'visibility', showHeatmap ? 'none' : 'visible');
    } catch {}
  }, [showHeatmap, mapReady]);

  // Draw mode
  useEffect(() => {
    const draw = drawRef.current;
    const m = mapRef.current;
    if (!draw || !m) return;

    if (drawMode === 'polygon') {
      draw.changeMode('draw_polygon');
    } else {
      draw.deleteAll();
    }

    const onDrawCreate = (e: any) => {
      setDrawMode('none');
      // Could filter properties inside polygon here
    };
    m.on('draw.create', onDrawCreate);
    return () => { m.off('draw.create', onDrawCreate); };
  }, [drawMode]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        showHeatmap={showHeatmap}
        onToggleHeatmap={setShowHeatmap}
        drawMode={drawMode}
        onSetDrawMode={setDrawMode}
        propertyCount={properties.length}
        isLoading={isLoading}
        isOpen={filterOpen}
        onToggle={() => setFilterOpen(o => !o)}
      />

      {/* Property count badge (top-right) */}
      <div className="absolute top-4 right-4 z-20 sm:right-16">
        <Badge className="bg-background/95 backdrop-blur-md text-foreground border border-border/60 shadow-lg text-xs px-3 py-1.5">
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
          ) : (
            <Building2 className="h-3 w-3 mr-1.5 text-primary" />
          )}
          {properties.length} properti di area ini
        </Badge>
      </div>

      {/* Selected Property Popup */}
      <AnimatePresence>
        {selectedProperty && (
          <PropertyPopupCard
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
            onViewDetails={() => {
              navigate(`/property/${selectedProperty.id}`);
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile bottom hint */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 sm:hidden">
        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-[10px] border-border/40 shadow-md">
          <MapPin className="h-3 w-3 mr-1" /> Geser peta untuk cari properti
        </Badge>
      </div>
    </div>
  );
}
