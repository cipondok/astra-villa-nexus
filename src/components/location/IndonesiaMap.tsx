import { useEffect, useState, memo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { feature } from 'topojson-client';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ZoomIn, ZoomOut, Maximize2, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Local Indonesia TopoJSON file
const INDONESIA_TOPO_JSON = "/data/indonesia.json";

// Province codes mapping
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

// Multi-color palette for provinces (theme-aware)
const getProvinceColors = (isDark: boolean) => {
  const lightColors = [
    'hsl(45, 85%, 65%)',   // Gold
    'hsl(200, 70%, 60%)',  // Blue
    'hsl(150, 60%, 55%)',  // Teal
    'hsl(280, 60%, 65%)',  // Purple
    'hsl(15, 80%, 60%)',   // Orange
    'hsl(340, 70%, 65%)',  // Pink
    'hsl(180, 55%, 50%)',  // Cyan
    'hsl(100, 50%, 55%)',  // Green
    'hsl(35, 90%, 60%)',   // Amber
    'hsl(260, 55%, 60%)',  // Violet
    'hsl(170, 60%, 50%)',  // Emerald
    'hsl(5, 75%, 60%)',    // Red
  ];
  
  const darkColors = [
    'hsl(45, 80%, 50%)',   // Gold
    'hsl(200, 65%, 45%)',  // Blue
    'hsl(150, 55%, 40%)',  // Teal
    'hsl(280, 55%, 50%)',  // Purple
    'hsl(15, 75%, 50%)',   // Orange
    'hsl(340, 65%, 50%)',  // Pink
    'hsl(180, 50%, 40%)',  // Cyan
    'hsl(100, 45%, 40%)',  // Green
    'hsl(35, 85%, 50%)',   // Amber
    'hsl(260, 50%, 50%)',  // Violet
    'hsl(170, 55%, 40%)',  // Emerald
    'hsl(5, 70%, 50%)',    // Red
  ];
  
  return isDark ? darkColors : lightColors;
};

// Get color for a province based on its index
const getProvinceColor = (index: number, isDark: boolean) => {
  const colors = getProvinceColors(isDark);
  return colors[index % colors.length];
};

// Get hover color (slightly darker/lighter)
const getHoverColor = (index: number, isDark: boolean) => {
  const colors = getProvinceColors(isDark);
  const baseColor = colors[index % colors.length];
  // Parse and adjust lightness
  const match = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (match) {
    const h = parseInt(match[1]);
    const s = parseInt(match[2]);
    const l = parseInt(match[3]);
    const newL = isDark ? Math.min(l + 15, 70) : Math.max(l - 10, 30);
    return `hsl(${h}, ${s}%, ${newL}%)`;
  }
  return baseColor;
};

// Theme-aware map colors
const getMapColors = (isDark: boolean) => ({
  selected: isDark ? 'hsl(45, 93%, 55%)' : 'hsl(45, 93%, 42%)',
  border: isDark ? 'hsl(220, 40%, 35%)' : 'hsl(220, 20%, 95%)',
  background: isDark ? 'hsl(220, 50%, 8%)' : 'hsl(220, 30%, 96%)',
});

interface Province {
  id: string;
  name: string;
  code: string;
}

interface IndonesiaMapProps {
  onProvinceSelect?: (province: Province) => void;
  selectedProvince?: string | null;
}

const IndonesiaMapComponent = ({ onProvinceSelect, selectedProvince }: IndonesiaMapProps) => {
  const [hoveredProvinceName, setHoveredProvinceName] = useState<string | null>(null);
  const [position, setPosition] = useState({ coordinates: [118, -2] as [number, number], zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [provinceGeographies, setProvinceGeographies] = useState<GeoJSON.FeatureCollection | null>(null);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const mapColors = getMapColors(isDark);

  const getProvinceName = (properties: Record<string, unknown>): string => {
    // Try various property names used in different GeoJSON/TopoJSON formats
    const name = properties.name || 
                 properties.Name ||
                 properties.NAME || 
                 properties.NAME_1 || 
                 properties.state || 
                 properties.PROVINSI ||
                 properties.provinsi ||
                 properties.woe_name ||
                 properties.gn_name ||
                 null;
    
    // Log for debugging
    if (!name) {
      console.log('Province properties:', properties);
    }
    
    return (name || 'Unknown') as string;
  };

  const handleProvinceClick = (provinceName: string) => {
    // Prevent click during drag
    if (isDragging) return;
    
    console.log('Province clicked:', provinceName);
    const code = provinceCodeMap[provinceName] || 'ID';
    const province: Province = {
      id: provinceName.toLowerCase().replace(/\s+/g, '-'),
      name: provinceName,
      code: code
    };
    
    if (onProvinceSelect) {
      onProvinceSelect(province);
    } else {
      navigate(`/properties?location=${encodeURIComponent(provinceName)}`);
    }
  };

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 0.5) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [118, -2], zoom: 1 });
  };


  useEffect(() => {
    let isMounted = true;

    const loadProvinces = async () => {
      try {
        const res = await fetch(INDONESIA_TOPO_JSON);
        const topology = await res.json();

        // This file contains multiple objects; we specifically want admin-1 provinces.
        const obj = topology?.objects?.states_provinces;
        if (!obj) throw new Error('TopoJSON missing objects.states_provinces');

        const fc = feature(topology, obj) as GeoJSON.FeatureCollection;

        // Filter out "minor island" / null-name features to avoid "Unknown" hover.
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

    loadProvinces();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div 
      className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-2xl border border-border/50"
      style={{ backgroundColor: mapColors.background }}
    >
      {/* Map controls - Glassy style */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-9 w-9 bg-background/40 backdrop-blur-md border border-border/50 shadow-lg hover:bg-background/60"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-9 w-9 bg-background/40 backdrop-blur-md border border-border/50 shadow-lg hover:bg-background/60"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-9 w-9 bg-background/40 backdrop-blur-md border border-border/50 shadow-lg hover:bg-background/60"
          onClick={handleReset}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Map title - Glassy style */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-3 bg-background/40 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-border/50">
        <div className="h-8 w-8 rounded-lg bg-primary/30 backdrop-blur-sm flex items-center justify-center">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <div>
          <span className="text-sm font-bold text-foreground block">Peta Indonesia</span>
          <span className="text-xs text-muted-foreground">34 Provinsi - Pilih untuk melihat properti</span>
        </div>
      </div>

      {/* Main Map - Zoomed in more */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1100,
          center: [118, -2]
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveStart={() => setIsDragging(true)}
          onMoveEnd={(pos) => {
            setPosition(pos);
            // Small delay to allow click to be blocked during drag
            setTimeout(() => setIsDragging(false), 100);
          }}
        >
          {provinceGeographies ? (
            <Geographies geography={provinceGeographies}>
              {({ geographies }) =>
                geographies.map((geo, index) => {
                  const provinceName = getProvinceName(geo.properties);
                  const isSelected = selectedProvince === provinceName.toLowerCase().replace(/\s+/g, '-');
                  const provinceColor = getProvinceColor(index, isDark);
                  const hoverColor = getHoverColor(index, isDark);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => {
                        setHoveredProvinceName(provinceName);
                      }}
                      onMouseLeave={() => {
                        setHoveredProvinceName(null);
                      }}
                      onClick={() => handleProvinceClick(provinceName)}
                      style={{
                        default: {
                          fill: isSelected ? mapColors.selected : provinceColor,
                          stroke: mapColors.border,
                          strokeWidth: 0.5,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        hover: {
                          fill: isSelected ? mapColors.selected : hoverColor,
                          stroke: mapColors.border,
                          strokeWidth: 0.8,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        pressed: {
                          fill: mapColors.selected,
                          stroke: mapColors.border,
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
        </ZoomableGroup>
      </ComposableMap>

      {/* Province count badge - Glassy style */}
      <div className="absolute bottom-4 left-4 z-30 bg-background/40 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-lg border border-border/50">
        <p className="text-xs font-bold text-foreground flex items-center gap-2">
          <Compass className="h-3.5 w-3.5 text-primary" />
          34 Provinsi Indonesia
        </p>
      </div>

      {/* Hover info panel - Glassy style */}
      <AnimatePresence>
        {hoveredProvinceName && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 right-4 z-30 bg-background/50 backdrop-blur-xl rounded-xl p-4 shadow-xl border border-border/50 min-w-[220px]"
          >
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/80 backdrop-blur-sm flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold text-foreground">{hoveredProvinceName}</p>
                <p className="text-sm text-muted-foreground mb-1">
                  {provinceCodeMap[hoveredProvinceName] || 'ID'}
                </p>
                <p className="text-xs text-primary font-medium">Klik untuk lihat properti →</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compass rose - Glassy style */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="bg-background/40 backdrop-blur-md rounded-full p-1 border border-border/50 shadow-lg">
          <svg width="40" height="40" viewBox="0 0 48 48" className="drop-shadow-sm">
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
