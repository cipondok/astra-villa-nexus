import { useEffect, useState, memo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { feature } from 'topojson-client';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ZoomIn, ZoomOut, Maximize2, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProvincePropertyCounts } from '@/hooks/useProvincePropertyCounts';

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

// Normalize province names from various formats to standard Indonesian names
const normalizeProvinceName = (name: string): string => {
  const normalizations: Record<string, string> = {
    'Jakarta Raya': 'DKI Jakarta',
    'DI Yogyakarta': 'Yogyakarta',
    'Yogyakarta': 'Yogyakarta',
    'West Java': 'Jawa Barat',
    'Central Java': 'Jawa Tengah',
    'East Java': 'Jawa Timur',
    'West Sumatra': 'Sumatera Barat',
    'North Sumatra': 'Sumatera Utara',
    'South Sumatra': 'Sumatera Selatan',
    'West Kalimantan': 'Kalimantan Barat',
    'Central Kalimantan': 'Kalimantan Tengah',
    'South Kalimantan': 'Kalimantan Selatan',
    'East Kalimantan': 'Kalimantan Timur',
    'North Kalimantan': 'Kalimantan Utara',
    'North Sulawesi': 'Sulawesi Utara',
    'Central Sulawesi': 'Sulawesi Tengah',
    'South Sulawesi': 'Sulawesi Selatan',
    'Southeast Sulawesi': 'Sulawesi Tenggara',
    'West Sulawesi': 'Sulawesi Barat',
    'West Nusa Tenggara': 'Nusa Tenggara Barat',
    'East Nusa Tenggara': 'Nusa Tenggara Timur',
    'North Maluku': 'Maluku Utara',
    'West Papua': 'Papua Barat',
    'Kepulauan Bangka Belitung': 'Bangka Belitung',
  };
  return normalizations[name] || name;
};

// Province coordinates for markers (longitude, latitude)
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

// Default/fallback property counts (used when data is loading)
const defaultPropertyCounts: Record<string, number> = {};

// Harmonized color palette for provinces - earthy & professional tones
const getProvinceColors = (isDark: boolean) => {
  const lightColors = [
    'hsl(210, 35%, 78%)',  // Soft Blue
    'hsl(160, 30%, 72%)',  // Sage
    'hsl(35, 40%, 75%)',   // Sand
    'hsl(190, 30%, 70%)',  // Aqua
    'hsl(25, 35%, 72%)',   // Terracotta light
    'hsl(145, 25%, 68%)',  // Mint
    'hsl(220, 30%, 75%)',  // Periwinkle
    'hsl(45, 35%, 73%)',   // Wheat
    'hsl(175, 28%, 68%)',  // Teal light
    'hsl(15, 30%, 70%)',   // Coral light
    'hsl(200, 32%, 72%)',  // Steel blue
    'hsl(80, 25%, 70%)',   // Olive light
  ];
  
  const darkColors = [
    'hsl(210, 30%, 32%)',  // Soft Blue
    'hsl(160, 25%, 28%)',  // Sage
    'hsl(35, 35%, 30%)',   // Sand
    'hsl(190, 25%, 28%)',  // Aqua
    'hsl(25, 30%, 30%)',   // Terracotta
    'hsl(145, 20%, 26%)',  // Mint
    'hsl(220, 25%, 32%)',  // Periwinkle
    'hsl(45, 30%, 30%)',   // Wheat
    'hsl(175, 22%, 26%)',  // Teal
    'hsl(15, 25%, 28%)',   // Coral
    'hsl(200, 27%, 30%)',  // Steel blue
    'hsl(80, 20%, 28%)',   // Olive
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
  const [position, setPosition] = useState({ coordinates: [118, -2] as [number, number], zoom: 1.1 });
  const [isDragging, setIsDragging] = useState(false);
  const [provinceGeographies, setProvinceGeographies] = useState<GeoJSON.FeatureCollection | null>(null);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  
  // Fetch real property counts from database
  const { data: provincePropertyCounts = defaultPropertyCounts } = useProvincePropertyCounts();

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
    
    // Normalize the province name to standard Indonesian name
    const normalizedName = normalizeProvinceName(provinceName);
    console.log('Province clicked:', provinceName, '-> normalized to:', normalizedName);
    
    const code = provinceCodeMap[provinceName] || provinceCodeMap[normalizedName] || 'ID';
    const province: Province = {
      id: normalizedName.toLowerCase().replace(/\s+/g, '-'),
      name: normalizedName,
      code: code
    };
    
    if (onProvinceSelect) {
      onProvinceSelect(province);
    } else {
      navigate(`/properties?location=${encodeURIComponent(normalizedName)}`);
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
    setPosition({ coordinates: [118, -2], zoom: 1.1 });
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
      className="relative w-full aspect-[4/3] sm:aspect-[2/1] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl border border-border/50"
      style={{ backgroundColor: mapColors.background }}
    >
      {/* Map controls - Glassy style - Responsive */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-30 flex flex-col gap-1 sm:gap-2">
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7 sm:h-9 sm:w-9 bg-background/40 backdrop-blur-md border border-border/50 shadow-lg hover:bg-background/60"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7 sm:h-9 sm:w-9 bg-background/40 backdrop-blur-md border border-border/50 shadow-lg hover:bg-background/60"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7 sm:h-9 sm:w-9 bg-background/40 backdrop-blur-md border border-border/50 shadow-lg hover:bg-background/60"
          onClick={handleReset}
        >
          <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Map title - Glassy style - Responsive */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-30 flex items-center gap-2 sm:gap-3 bg-background/40 backdrop-blur-md px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-lg border border-border/50">
        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-md sm:rounded-lg bg-primary/30 backdrop-blur-sm flex items-center justify-center">
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
        </div>
        <div>
          <span className="text-xs sm:text-sm font-bold text-foreground block">Peta Indonesia</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">34 Provinsi - Pilih untuk melihat properti</span>
        </div>
      </div>

      {/* Main Map - Zoomed in more */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1400,
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
          
          {/* Property count markers on provinces */}
          {Object.entries(provinceCoordinates).map(([name, coords]) => {
            const count = provincePropertyCounts[name] || 0;
            if (count < 500) return null; // Only show markers for provinces with 500+ properties
            const displayCount = count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K` : count.toString();
            const isLarge = count >= 5000;
            
            return (
              <Marker key={name} coordinates={coords}>
                <g 
                  className="cursor-pointer"
                  onClick={() => handleProvinceClick(name)}
                  style={{ pointerEvents: 'all' }}
                >
                  {/* Pin marker shape - larger */}
                  <ellipse 
                    cx={0} 
                    cy={0} 
                    rx={isLarge ? 14 : 10} 
                    ry={isLarge ? 9 : 7} 
                    fill={isDark ? 'hsl(25, 90%, 50%)' : 'hsl(25, 85%, 55%)'} 
                    stroke={isDark ? 'hsl(25, 90%, 70%)' : 'hsl(25, 85%, 40%)'}
                    strokeWidth={0.8}
                    opacity={0.95}
                  />
                  {/* Count text - larger */}
                  <text
                    textAnchor="middle"
                    y={2}
                    style={{
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: isLarge ? '7px' : '6px',
                      fontWeight: 'bold',
                      fill: 'white',
                      pointerEvents: 'none',
                    }}
                  >
                    {displayCount}
                  </text>
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Province count badge - Glassy style - Responsive */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-30 bg-background/40 backdrop-blur-md rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2.5 shadow-lg border border-border/50">
        <p className="text-[10px] sm:text-xs font-bold text-foreground flex items-center gap-1 sm:gap-2">
          <Compass className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
          <span className="hidden sm:inline">34 Provinsi Indonesia</span>
          <span className="sm:hidden">34 Provinsi</span>
        </p>
      </div>

      {/* Hover info panel - Glassy style - Responsive with property count */}
      <AnimatePresence>
        {hoveredProvinceName && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 sm:top-20 right-2 sm:right-4 z-30 bg-background/50 backdrop-blur-xl rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-xl border border-border/50 min-w-[160px] sm:min-w-[220px]"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-primary/80 backdrop-blur-sm flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground text-xs sm:text-base">{hoveredProvinceName}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  {provinceCodeMap[hoveredProvinceName] || 'ID'}
                </p>
                {/* Property count display */}
                <div className="flex items-center gap-1 mt-1 sm:mt-1.5 bg-orange-500/20 rounded px-1.5 py-0.5 w-fit">
                  <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-500" />
                  <span className="text-[10px] sm:text-xs font-bold text-orange-600 dark:text-orange-400">
                    {(provincePropertyCounts[hoveredProvinceName] || 0).toLocaleString()} properti
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-primary font-medium mt-1">Klik untuk lihat →</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compass rose - Glassy style - Responsive */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20">
        <div className="bg-background/40 backdrop-blur-md rounded-full p-0.5 sm:p-1 border border-border/50 shadow-lg">
          <svg width="28" height="28" viewBox="0 0 48 48" className="drop-shadow-sm sm:w-10 sm:h-10">
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
