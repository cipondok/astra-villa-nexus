import { useEffect, useState, memo, useCallback, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { feature } from 'topojson-client';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ZoomIn, ZoomOut, Maximize2, Compass, Flame, Layers, Eye, EyeOff, TrendingUp, Building2, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProvincePropertyCounts } from '@/hooks/useProvincePropertyCounts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const INDONESIA_TOPO_JSON = "/data/indonesia.json";

// ── Province Code Map ──
const provinceCodeMap: Record<string, string> = {
  'Aceh': 'IDAC', 'Bali': 'IDBA', 'Bangka Belitung': 'IDBB', 'Banten': 'IDBT',
  'Bengkulu': 'IDBE', 'Gorontalo': 'IDGO', 'Jakarta Raya': 'IDJK', 'Jambi': 'IDJA',
  'Jawa Barat': 'IDJB', 'Jawa Tengah': 'IDJT', 'Jawa Timur': 'IDJI',
  'Kalimantan Barat': 'IDKB', 'Kalimantan Selatan': 'IDKS', 'Kalimantan Tengah': 'IDKT',
  'Kalimantan Timur': 'IDKI', 'Kalimantan Utara': 'IDKU', 'Kepulauan Bangka Belitung': 'IDBB',
  'Kepulauan Riau': 'IDKR', 'Lampung': 'IDLA', 'Maluku': 'IDMA', 'Maluku Utara': 'IDMU',
  'Nusa Tenggara Barat': 'IDNB', 'Nusa Tenggara Timur': 'IDNT', 'Papua': 'IDPA',
  'Papua Barat': 'IDPB', 'Riau': 'IDRI', 'Sulawesi Barat': 'IDSR', 'Sulawesi Selatan': 'IDSN',
  'Sulawesi Tengah': 'IDST', 'Sulawesi Tenggara': 'IDSG', 'Sulawesi Utara': 'IDSA',
  'Sumatera Barat': 'IDSB', 'Sumatera Selatan': 'IDSS', 'Sumatera Utara': 'IDSU',
  'Yogyakarta': 'IDYO', 'DKI Jakarta': 'IDJK', 'DI Yogyakarta': 'IDYO',
  'West Sumatra': 'IDSB', 'North Sumatra': 'IDSU', 'South Sumatra': 'IDSS',
  'West Java': 'IDJB', 'Central Java': 'IDJT', 'East Java': 'IDJI',
  'West Kalimantan': 'IDKB', 'Central Kalimantan': 'IDKT',
  'South Kalimantan': 'IDKS', 'East Kalimantan': 'IDKI', 'North Kalimantan': 'IDKU',
  'North Sulawesi': 'IDSA', 'Central Sulawesi': 'IDST', 'South Sulawesi': 'IDSN',
  'Southeast Sulawesi': 'IDSG', 'West Sulawesi': 'IDSR',
  'West Nusa Tenggara': 'IDNB', 'East Nusa Tenggara': 'IDNT',
  'North Maluku': 'IDMU', 'West Papua': 'IDPB',
};

// ── Province Name Normalization ──
const normalizeProvinceName = (name: string): string => {
  const normalizations: Record<string, string> = {
    'Jakarta Raya': 'DKI Jakarta', 'DI Yogyakarta': 'Yogyakarta',
    'West Java': 'Jawa Barat', 'Central Java': 'Jawa Tengah', 'East Java': 'Jawa Timur',
    'West Sumatra': 'Sumatera Barat', 'North Sumatra': 'Sumatera Utara', 'South Sumatra': 'Sumatera Selatan',
    'West Kalimantan': 'Kalimantan Barat', 'Central Kalimantan': 'Kalimantan Tengah',
    'South Kalimantan': 'Kalimantan Selatan', 'East Kalimantan': 'Kalimantan Timur', 'North Kalimantan': 'Kalimantan Utara',
    'North Sulawesi': 'Sulawesi Utara', 'Central Sulawesi': 'Sulawesi Tengah',
    'South Sulawesi': 'Sulawesi Selatan', 'Southeast Sulawesi': 'Sulawesi Tenggara', 'West Sulawesi': 'Sulawesi Barat',
    'West Nusa Tenggara': 'Nusa Tenggara Barat', 'East Nusa Tenggara': 'Nusa Tenggara Timur',
    'North Maluku': 'Maluku Utara', 'West Papua': 'Papua Barat',
    'Kepulauan Bangka Belitung': 'Bangka Belitung',
  };
  return normalizations[name] || name;
};

// ── Canonical IDs ──
const provinceNameToCanonicalId: Record<string, string> = {
  'Aceh': 'aceh', 'Sumatera Utara': 'sumut', 'Sumatera Barat': 'sumbar',
  'Riau': 'riau', 'Kepulauan Riau': 'kepri', 'Jambi': 'jambi',
  'Sumatera Selatan': 'sumsel', 'Bengkulu': 'bengkulu', 'Bangka Belitung': 'babel',
  'Lampung': 'lampung', 'Banten': 'banten', 'DKI Jakarta': 'jakarta', 'Jakarta': 'jakarta',
  'Jawa Barat': 'jabar', 'Jawa Tengah': 'jateng', 'Yogyakarta': 'yogya',
  'Jawa Timur': 'jatim', 'Kalimantan Barat': 'kalbar', 'Kalimantan Tengah': 'kalteng',
  'Kalimantan Selatan': 'kalsel', 'Kalimantan Timur': 'kaltim', 'Kalimantan Utara': 'kaltara',
  'Sulawesi Utara': 'sulut', 'Gorontalo': 'gorontalo', 'Sulawesi Tengah': 'sulteng',
  'Sulawesi Barat': 'sulbar', 'Sulawesi Selatan': 'sulsel', 'Sulawesi Tenggara': 'sultra',
  'Bali': 'bali', 'Nusa Tenggara Barat': 'ntb', 'Nusa Tenggara Timur': 'ntt',
  'Maluku Utara': 'malut', 'Maluku': 'maluku', 'Papua Barat': 'papuabarat', 'Papua': 'papua',
};

const canonicalIdToProvinceName: Record<string, string> = Object.fromEntries(
  Object.entries(provinceNameToCanonicalId).map(([name, id]) => [id, name])
);

const getCanonicalProvinceId = (normalizedProvinceName: string) =>
  provinceNameToCanonicalId[normalizedProvinceName] || normalizedProvinceName.toLowerCase().replace(/\s+/g, '-');

// ── Province Coordinates ──
const provinceCoordinates: Record<string, [number, number]> = {
  'Aceh': [96.5, 4.7], 'Sumatera Utara': [99.0, 2.5], 'Sumatera Barat': [100.5, -0.9],
  'Riau': [102.0, 0.5], 'Kepulauan Riau': [104.5, 1.0], 'Jambi': [103.5, -1.6],
  'Sumatera Selatan': [104.5, -3.0], 'Bengkulu': [102.3, -3.8], 'Bangka Belitung': [106.5, -2.5],
  'Lampung': [105.0, -5.0], 'Banten': [106.0, -6.4], 'DKI Jakarta': [106.85, -6.2],
  'Jakarta Raya': [106.85, -6.2], 'Jawa Barat': [107.5, -6.9], 'Jawa Tengah': [110.0, -7.2],
  'Yogyakarta': [110.4, -7.8], 'DI Yogyakarta': [110.4, -7.8], 'Jawa Timur': [112.5, -7.5],
  'Bali': [115.2, -8.4], 'Nusa Tenggara Barat': [117.0, -8.6], 'Nusa Tenggara Timur': [121.0, -9.5],
  'Kalimantan Barat': [110.0, 0.0], 'Kalimantan Tengah': [114.0, -1.5],
  'Kalimantan Selatan': [115.5, -3.3], 'Kalimantan Timur': [117.0, 0.5], 'Kalimantan Utara': [117.0, 3.0],
  'Sulawesi Utara': [124.8, 1.5], 'Gorontalo': [122.5, 0.6], 'Sulawesi Tengah': [121.0, -1.4],
  'Sulawesi Barat': [119.4, -2.8], 'Sulawesi Selatan': [120.0, -4.0], 'Sulawesi Tenggara': [122.0, -4.0],
  'Maluku': [128.0, -3.2], 'Maluku Utara': [127.5, 1.5], 'Papua Barat': [133.0, -1.5], 'Papua': [138.0, -4.5],
};

// ── Heatmap Color Scale ──
const getHeatmapColor = (count: number, isDark: boolean): string => {
  if (count === 0) return isDark ? 'hsl(220, 15%, 22%)' : 'hsl(220, 15%, 88%)';
  if (count <= 50) return isDark ? 'hsl(210, 45%, 32%)' : 'hsl(210, 60%, 82%)';
  if (count <= 200) return isDark ? 'hsl(215, 55%, 38%)' : 'hsl(215, 65%, 68%)';
  if (count <= 500) return isDark ? 'hsl(225, 60%, 42%)' : 'hsl(225, 70%, 52%)';
  return isDark ? 'hsl(265, 60%, 48%)' : 'hsl(265, 65%, 55%)';
};

const getHeatmapHoverColor = (count: number, isDark: boolean): string => {
  if (count === 0) return isDark ? 'hsl(220, 18%, 30%)' : 'hsl(220, 18%, 80%)';
  if (count <= 50) return isDark ? 'hsl(210, 50%, 40%)' : 'hsl(210, 65%, 74%)';
  if (count <= 200) return isDark ? 'hsl(215, 60%, 46%)' : 'hsl(215, 70%, 60%)';
  if (count <= 500) return isDark ? 'hsl(225, 65%, 50%)' : 'hsl(225, 75%, 45%)';
  return isDark ? 'hsl(265, 65%, 56%)' : 'hsl(265, 70%, 48%)';
};

// ── Earthy fallback palette (no heatmap) ──
const getProvinceColors = (isDark: boolean) => {
  const light = [
    'hsl(210, 35%, 78%)', 'hsl(160, 30%, 72%)', 'hsl(35, 40%, 75%)', 'hsl(190, 30%, 70%)',
    'hsl(25, 35%, 72%)', 'hsl(145, 25%, 68%)', 'hsl(220, 30%, 75%)', 'hsl(45, 35%, 73%)',
    'hsl(175, 28%, 68%)', 'hsl(15, 30%, 70%)', 'hsl(200, 32%, 72%)', 'hsl(80, 25%, 70%)',
  ];
  const dark = [
    'hsl(210, 30%, 32%)', 'hsl(160, 25%, 28%)', 'hsl(35, 35%, 30%)', 'hsl(190, 25%, 28%)',
    'hsl(25, 30%, 30%)', 'hsl(145, 20%, 26%)', 'hsl(220, 25%, 32%)', 'hsl(45, 30%, 30%)',
    'hsl(175, 22%, 26%)', 'hsl(15, 25%, 28%)', 'hsl(200, 27%, 30%)', 'hsl(80, 20%, 28%)',
  ];
  return isDark ? dark : light;
};

// ── Investment score simulation (per province) ──
const investmentScores: Record<string, number> = {
  'Bali': 92, 'DKI Jakarta': 88, 'Jawa Barat': 85, 'Jawa Timur': 82,
  'Yogyakarta': 81, 'Banten': 78, 'Jawa Tengah': 76, 'Sulawesi Selatan': 74,
  'Kalimantan Timur': 72, 'Sumatera Utara': 70, 'Lampung': 68, 'Riau': 66,
  'Nusa Tenggara Barat': 65, 'Sumatera Barat': 63, 'Kalimantan Selatan': 60,
};

// Average price simulation (per province, in USD)
const avgPrices: Record<string, number> = {
  'Bali': 420000, 'DKI Jakarta': 580000, 'Jawa Barat': 320000, 'Jawa Timur': 280000,
  'Yogyakarta': 250000, 'Banten': 350000, 'Jawa Tengah': 220000, 'Sulawesi Selatan': 180000,
  'Kalimantan Timur': 200000, 'Sumatera Utara': 190000, 'Lampung': 150000, 'Riau': 170000,
  'Nusa Tenggara Barat': 160000, 'Sumatera Barat': 140000, 'Kalimantan Selatan': 130000,
};

// ── Types ──
interface Province {
  id: string;
  name: string;
  code: string;
}

interface IndonesiaMapProps {
  onProvinceSelect?: (province: Province) => void;
  selectedProvince?: string | null;
  userProvince?: string | null;
}

// ── Map Legend Component ──
const MapLegend = memo(({ isDark, showHeatmap, showHotspots }: { isDark: boolean; showHeatmap: boolean; showHotspots: boolean }) => {
  if (!showHeatmap) return null;
  const items = [
    { label: 'Tidak ada', color: getHeatmapColor(0, isDark) },
    { label: '1–50', color: getHeatmapColor(25, isDark) },
    { label: '51–200', color: getHeatmapColor(100, isDark) },
    { label: '201–500', color: getHeatmapColor(300, isDark) },
    { label: '500+', color: getHeatmapColor(501, isDark) },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute bottom-14 sm:bottom-16 left-3 sm:left-4 z-30 bg-background/95 backdrop-blur-sm rounded-xl px-3 py-2.5 shadow-lg border border-border/60"
    >
      <p className="text-[10px] font-bold text-foreground mb-1.5 uppercase tracking-wider">Kepadatan Properti</p>
      <div className="flex flex-col gap-1">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm border border-border/30" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
      {showHotspots && (
        <div className="mt-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm border-2 border-chart-3" style={{ background: 'linear-gradient(135deg, hsl(45, 95%, 55%), hsl(25, 90%, 50%))' }} />
            <span className="text-[10px] text-chart-3 font-semibold">Hotspot (Score 80+)</span>
          </div>
        </div>
      )}
    </motion.div>
  );
});
MapLegend.displayName = 'MapLegend';

// ── Rich Tooltip Component ──
const ProvinceTooltip = memo(({
  provinceName,
  propertyCount,
  avgPrice,
  investmentScore,
}: {
  provinceName: string;
  propertyCount: number;
  avgPrice?: number;
  investmentScore?: number;
}) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
    return `$${price}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-chart-1';
    if (score >= 60) return 'text-chart-3';
    return 'text-muted-foreground';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.94 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="bg-background/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-border/60 min-w-[200px]">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-foreground text-sm leading-tight block">{provinceName}</span>
            <span className="text-[10px] text-primary font-semibold">Klik untuk detail →</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Building2 className="h-3 w-3 text-primary" />
            </div>
            <p className="text-xs font-bold text-foreground">{propertyCount.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground">Properti</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <DollarSign className="h-3 w-3 text-chart-1" />
            </div>
            <p className="text-xs font-bold text-foreground">
              {avgPrice ? formatPrice(avgPrice) : '—'}
            </p>
            <p className="text-[9px] text-muted-foreground">Rata-rata</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <TrendingUp className="h-3 w-3 text-chart-3" />
            </div>
            <p className={`text-xs font-bold ${investmentScore ? getScoreColor(investmentScore) : 'text-muted-foreground'}`}>
              {investmentScore ?? '—'}
            </p>
            <p className="text-[9px] text-muted-foreground">Skor</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
ProvinceTooltip.displayName = 'ProvinceTooltip';

// ── Main Map Component ──
const IndonesiaMapComponent = ({ onProvinceSelect, selectedProvince, userProvince }: IndonesiaMapProps) => {
  const [hoveredProvinceName, setHoveredProvinceName] = useState<string | null>(null);
  const [position, setPosition] = useState({ coordinates: [118, -2] as [number, number], zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [provinceGeographies, setProvinceGeographies] = useState<GeoJSON.FeatureCollection | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showHotspots, setShowHotspots] = useState(false);
  const navigate = useNavigate();

  const { data: provincePropertyCounts = {} } = useProvincePropertyCounts();

  // Dark mode detection
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const mapColors = useMemo(() => ({
    selected: isDark ? 'hsl(45, 93%, 55%)' : 'hsl(45, 93%, 42%)',
    border: isDark ? 'hsl(220, 40%, 35%)' : 'hsl(220, 20%, 95%)',
    background: isDark ? 'hsl(220, 50%, 8%)' : 'hsl(220, 30%, 96%)',
  }), [isDark]);

  const getProvinceName = useCallback((properties: Record<string, unknown>): string => {
    const name = properties.name || properties.Name || properties.NAME ||
      properties.NAME_1 || properties.state || properties.PROVINSI ||
      properties.provinsi || properties.woe_name || properties.gn_name || null;
    return (name || 'Unknown') as string;
  }, []);

  const handleProvinceClick = useCallback((provinceName: string) => {
    const normalizedName = normalizeProvinceName(provinceName);
    const canonicalId = getCanonicalProvinceId(normalizedName);
    const code = provinceCodeMap[provinceName] || provinceCodeMap[normalizedName] || 'ID';
    const province: Province = { id: canonicalId, name: normalizedName, code };
    if (onProvinceSelect) {
      onProvinceSelect(province);
    } else {
      navigate(`/properties?location=${encodeURIComponent(normalizedName)}`);
    }
  }, [onProvinceSelect, navigate]);

  const handleZoomIn = useCallback(() => {
    setPosition(pos => pos.zoom >= 4 ? pos : { ...pos, zoom: pos.zoom * 1.5 });
  }, []);
  const handleZoomOut = useCallback(() => {
    setPosition(pos => pos.zoom <= 0.5 ? pos : { ...pos, zoom: pos.zoom / 1.5 });
  }, []);
  const handleReset = useCallback(() => {
    setPosition({ coordinates: [118, -2], zoom: 1 });
  }, []);

  // Load TopoJSON
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch(INDONESIA_TOPO_JSON);
        const topology = await res.json();
        const obj = topology?.objects?.states_provinces;
        if (!obj) throw new Error('TopoJSON missing objects.states_provinces');
        const fc = feature(topology, obj) as GeoJSON.FeatureCollection;
        const cleaned: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: (fc.features || []).filter((f: any) => {
            const n = f?.properties?.name;
            return typeof n === 'string' && n.trim().length > 0;
          }),
        };
        if (isMounted) setProvinceGeographies(cleaned);
      } catch (e) {
        console.error('Failed to load province geographies:', e);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  // Compute fill colors
  const getFillColor = useCallback((provinceName: string, normalizedName: string, index: number, isSelected: boolean, isUserProvince: boolean) => {
    if (isSelected) return mapColors.selected;
    if (isUserProvince) return 'hsl(var(--accent))';

    if (showHeatmap) {
      const count = provincePropertyCounts[normalizedName] || provincePropertyCounts[provinceName] || 0;
      return getHeatmapColor(count, isDark);
    }
    const colors = getProvinceColors(isDark);
    return colors[index % colors.length];
  }, [showHeatmap, provincePropertyCounts, isDark, mapColors.selected]);

  const getHoverFillColor = useCallback((provinceName: string, normalizedName: string, index: number, isSelected: boolean) => {
    if (isSelected) return mapColors.selected;
    if (showHeatmap) {
      const count = provincePropertyCounts[normalizedName] || provincePropertyCounts[provinceName] || 0;
      return getHeatmapHoverColor(count, isDark);
    }
    const colors = getProvinceColors(isDark);
    const base = colors[index % colors.length];
    const m = base.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (m) {
      const [, h, s, l] = m.map(Number);
      return `hsl(${h}, ${s}%, ${isDark ? Math.min(l + 15, 70) : Math.max(l - 10, 30)}%)`;
    }
    return base;
  }, [showHeatmap, provincePropertyCounts, isDark, mapColors.selected]);

  // Hotspot provinces
  const hotspotProvinces = useMemo(() => {
    if (!showHotspots) return new Set<string>();
    return new Set(Object.entries(investmentScores).filter(([, s]) => s >= 80).map(([p]) => p));
  }, [showHotspots]);

  // Hovered province data
  const hoveredData = useMemo(() => {
    if (!hoveredProvinceName) return null;
    const norm = normalizeProvinceName(hoveredProvinceName);
    return {
      name: norm,
      count: provincePropertyCounts[norm] || provincePropertyCounts[hoveredProvinceName] || 0,
      avgPrice: avgPrices[norm],
      investmentScore: investmentScores[norm],
    };
  }, [hoveredProvinceName, provincePropertyCounts]);

  return (
    <div
      className="relative w-full aspect-[4/3] sm:aspect-[2/1] rounded-[6px] overflow-hidden shadow-md border border-border"
      style={{ backgroundColor: mapColors.background }}
    >
      {/* ── Controls (right) ── */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-30 flex flex-col gap-2">
        <Button size="icon" variant="outline" className="h-8 w-8 sm:h-10 sm:w-10 bg-background border-border shadow-sm hover:bg-primary/5 hover:border-primary rounded-lg" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8 sm:h-10 sm:w-10 bg-background border-border shadow-sm hover:bg-primary/5 hover:border-primary rounded-lg" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8 sm:h-10 sm:w-10 bg-background border-border shadow-sm hover:bg-primary/5 hover:border-primary rounded-lg" onClick={handleReset}>
          <Maximize2 className="h-4 w-4" />
        </Button>
        {/* Divider */}
        <div className="h-px bg-border my-0.5" />
        {/* Heatmap toggle */}
        <Button
          size="icon"
          variant={showHeatmap ? 'default' : 'outline'}
          className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg ${showHeatmap ? 'bg-primary text-primary-foreground' : 'bg-background border-border shadow-sm'}`}
          onClick={() => setShowHeatmap(h => !h)}
          title="Toggle Heatmap"
        >
          <Layers className="h-4 w-4" />
        </Button>
        {/* Hotspot toggle */}
        <Button
          size="icon"
          variant={showHotspots ? 'default' : 'outline'}
          className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg ${showHotspots ? 'bg-chart-3 text-primary-foreground border-chart-3' : 'bg-background border-border shadow-sm'}`}
          onClick={() => setShowHotspots(h => !h)}
          title="Toggle Investment Hotspots"
        >
          <Flame className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Title (top-left) ── */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-30 flex items-center gap-2 sm:gap-3 bg-background/95 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-lg border border-border/60">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <MapPin className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <span className="text-sm font-bold text-foreground block">Peta Properti</span>
          <span className="text-[10px] text-muted-foreground hidden sm:block">
            {showHeatmap ? 'Heatmap Mode' : 'Default Mode'}
            {showHotspots ? ' · Hotspots On' : ''}
          </span>
        </div>
      </div>

      {/* ── SVG Map ── */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1400, center: [118, -2] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(pos) => setPosition(pos)}
        >
          {provinceGeographies ? (
            <Geographies geography={provinceGeographies}>
              {({ geographies }) =>
                geographies.map((geo, index) => {
                  const provinceName = getProvinceName(geo.properties);
                  const normalizedName = normalizeProvinceName(provinceName);
                  const provinceId = getCanonicalProvinceId(normalizedName);
                  const isSelected = selectedProvince === provinceId;
                  const isUserProvince = userProvince === provinceId;
                  const isHotspot = hotspotProvinces.has(normalizedName);

                  const fillColor = getFillColor(provinceName, normalizedName, index, isSelected, isUserProvince);
                  const hoverColor = getHoverFillColor(provinceName, normalizedName, index, isSelected);
                  const strokeColor = isHotspot && showHotspots
                    ? (isDark ? 'hsl(45, 95%, 60%)' : 'hsl(25, 90%, 50%)')
                    : isUserProvince ? 'hsl(var(--accent))' : mapColors.border;
                  const strokeW = isHotspot && showHotspots ? 1.8 : isUserProvince ? 1.2 : 0.5;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => setHoveredProvinceName(provinceName)}
                      onMouseLeave={() => setHoveredProvinceName(null)}
                      onClick={() => handleProvinceClick(provinceName)}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: strokeColor,
                          strokeWidth: strokeW,
                          outline: 'none',
                          cursor: 'pointer',
                          transition: 'fill 0.2s ease, stroke 0.2s ease',
                        },
                        hover: {
                          fill: hoverColor,
                          stroke: strokeColor,
                          strokeWidth: Math.max(strokeW, 0.8),
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        pressed: {
                          fill: mapColors.selected,
                          stroke: strokeColor,
                          strokeWidth: 1,
                          outline: 'none',
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          ) : null}

          {/* Property count markers */}
          {Object.entries(provinceCoordinates).map(([name, coords]) => {
            const count = provincePropertyCounts[name] || 0;
            if (count === 0) return null;
            const displayCount = count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K` : count.toString();
            const isLarge = count >= 5000;
            const r = isLarge ? 18 : 14;
            const tailY = isLarge ? 38 : 30;
            const countFontSize = isLarge ? '9px' : '7.5px';
            const iconScale = isLarge ? 0.055 : 0.044;

            return (
              <Marker key={name} coordinates={coords}>
                <g className="cursor-pointer" onClick={() => handleProvinceClick(name)} style={{ pointerEvents: 'all' }} transform={`translate(0, ${-tailY})`}>
                  <ellipse cx={1.5} cy={tailY + 3} rx={r * 0.5} ry={4} fill="rgba(0,0,0,0.25)" />
                  <path d={`M ${-r * 0.42} ${r * 0.78} Q 0 ${tailY + 2} ${r * 0.42} ${r * 0.78}`} fill="hsl(0, 85%, 45%)" stroke="white" strokeWidth={2} strokeLinejoin="round" />
                  <circle cx={0} cy={0} r={r} fill="hsl(0, 85%, 45%)" stroke="white" strokeWidth={2.2} />
                  <circle cx={-r * 0.3} cy={-r * 0.32} r={r * 0.3} fill="rgba(255,255,255,0.25)" />
                  <text textAnchor="middle" x={0} y={-r * 0.08} style={{ fontFamily: 'system-ui', fontSize: countFontSize, fontWeight: '900', fill: 'white', pointerEvents: 'none', letterSpacing: '0.04em' }}>
                    {displayCount}
                  </text>
                  <g transform={`translate(0, ${r * 0.35}) scale(${iconScale})`}>
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="rgba(255,255,255,0.75)" transform="translate(-12,-12)" />
                  </g>
                </g>
              </Marker>
            );
          })}

          {/* Investment Hotspot Glow Markers */}
          {showHotspots && Object.entries(investmentScores)
            .filter(([, score]) => score >= 80)
            .map(([name, score]) => {
              const coords = provinceCoordinates[name];
              if (!coords) return null;
              return (
                <Marker key={`hotspot-${name}`} coordinates={coords}>
                  <g style={{ pointerEvents: 'none' }}>
                    {/* Outer glow pulse */}
                    <circle r={22} fill="none" stroke="hsl(45, 95%, 55%)" strokeWidth={2}
                      className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ opacity: 0.4 }} />
                    <circle r={15} fill="none" stroke="hsl(25, 90%, 50%)" strokeWidth={1.5}
                      className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" style={{ opacity: 0.3 }} />
                    {/* Core badge */}
                    <circle r={10} fill="hsl(45, 95%, 55%)" fillOpacity={0.9} stroke="white" strokeWidth={1.5} />
                    <text textAnchor="middle" y={4} style={{ fontFamily: 'system-ui', fontSize: '8px', fontWeight: '900', fill: 'hsl(25, 50%, 20%)', pointerEvents: 'none' }}>
                      {score}
                    </text>
                  </g>
                </Marker>
              );
            })}

          {/* User Location Indicator */}
          {userProvince && (() => {
            const userProvinceName = canonicalIdToProvinceName[userProvince];
            const coords = userProvinceName ? provinceCoordinates[userProvinceName] : null;
            if (!coords) return null;
            const shouldAnimate = !isDragging;
            const pulseClass = shouldAnimate ? 'animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]' : '';
            return (
              <Marker coordinates={coords}>
                <g style={{ pointerEvents: 'none' }}>
                  <circle r={18} fill="hsl(var(--background))" fillOpacity={0.6} />
                  <circle r={14} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} className={pulseClass} style={{ opacity: 0.7 }} />
                  <circle r={7} fill="hsl(var(--primary))" fillOpacity={0.25} stroke="hsl(var(--primary))" strokeWidth={2} />
                  <circle r={4} fill="hsl(var(--primary))" />
                  <circle r={1.5} fill="hsl(var(--background))" />
                </g>
              </Marker>
            );
          })()}
        </ZoomableGroup>
      </ComposableMap>

      {/* ── Legend ── */}
      <AnimatePresence>
        <MapLegend isDark={isDark} showHeatmap={showHeatmap} showHotspots={showHotspots} />
      </AnimatePresence>

      {/* ── Province count badge ── */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-20 bg-background/95 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 shadow-lg border border-border/60">
        <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">34 Provinsi Indonesia</span>
          <span className="sm:hidden">34 Provinsi</span>
        </p>
      </div>

      {/* ── Rich Hover Tooltip ── */}
      <AnimatePresence>
        {hoveredData && (
          <ProvinceTooltip
            provinceName={hoveredData.name}
            propertyCount={hoveredData.count}
            avgPrice={hoveredData.avgPrice}
            investmentScore={hoveredData.investmentScore}
          />
        )}
      </AnimatePresence>

      {/* ── Compass Rose ── */}
      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-20">
        <div className="bg-background/95 backdrop-blur-sm rounded-full p-1.5 border border-border/60 shadow-lg">
          <svg width="32" height="32" viewBox="0 0 48 48" className="drop-shadow-sm sm:w-10 sm:h-10">
            <circle cx="24" cy="24" r="22" className="fill-transparent" />
            <polygon points="24,6 28,20 24,16 20,20" className="fill-primary" />
            <polygon points="24,42 28,28 24,32 20,28" className="fill-muted-foreground/60" />
            <polygon points="42,24 28,20 32,24 28,28" className="fill-muted-foreground/60" />
            <polygon points="6,24 20,20 16,24 20,28" className="fill-muted-foreground/60" />
            <circle cx="24" cy="24" r="3" className="fill-foreground/80" />
            <text x="24" y="12" textAnchor="middle" fontSize="6" className="fill-primary" fontWeight="bold">N</text>
          </svg>
        </div>
      </div>
    </div>
  );
};

export const IndonesiaMap = memo(IndonesiaMapComponent);

export type { Province };
