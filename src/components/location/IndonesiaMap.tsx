import { useState, memo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ZoomIn, ZoomOut, Maximize2, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

// Indonesia GeoJSON URL - accurate province boundaries
const INDONESIA_TOPO_JSON = "https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-provinces.json";

// Province codes matching reference
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
};

// Unified sage green color matching reference image
const mapColors = {
  base: '#7d9d78',
  hover: '#6b8b66', 
  selected: '#5a7a55',
  border: '#ffffff',
};

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
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [hoveredProvinceName, setHoveredProvinceName] = useState<string | null>(null);
  const [position, setPosition] = useState({ coordinates: [118, -2] as [number, number], zoom: 1 });
  const navigate = useNavigate();

  const handleProvinceClick = (provinceName: string) => {
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

  return (
    <TooltipProvider>
      <div className="relative w-full aspect-[2.5/1] rounded-2xl overflow-hidden shadow-2xl border border-border/30 bg-white">
        {/* Map controls */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-9 w-9 bg-white/95 hover:bg-white shadow-lg border border-gray-200"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4 text-gray-700" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-9 w-9 bg-white/95 hover:bg-white shadow-lg border border-gray-200"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4 text-gray-700" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-9 w-9 bg-white/95 hover:bg-white shadow-lg border border-gray-200"
            onClick={handleReset}
          >
            <Maximize2 className="h-4 w-4 text-gray-700" />
          </Button>
        </div>

        {/* Map title */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-3 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-gray-100">
          <div className="h-8 w-8 rounded-lg bg-[#7d9d78]/20 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-[#5a7a55]" />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground block">Peta Indonesia</span>
            <span className="text-xs text-muted-foreground">34 Provinsi - Pilih untuk melihat properti</span>
          </div>
        </div>

        {/* Main Map */}
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 850,
            center: [118, -2]
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={(pos) => setPosition(pos)}
          >
            <Geographies geography={INDONESIA_TOPO_JSON}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const provinceName = geo.properties.state || geo.properties.name || geo.properties.NAME_1 || '';
                  const isHovered = hoveredProvince === geo.rsmKey;
                  const isSelected = selectedProvince === provinceName.toLowerCase().replace(/\s+/g, '-');
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => {
                        setHoveredProvince(geo.rsmKey);
                        setHoveredProvinceName(provinceName);
                      }}
                      onMouseLeave={() => {
                        setHoveredProvince(null);
                        setHoveredProvinceName(null);
                      }}
                      onClick={() => handleProvinceClick(provinceName)}
                      style={{
                        default: {
                          fill: mapColors.base,
                          stroke: mapColors.border,
                          strokeWidth: 0.5,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        hover: {
                          fill: mapColors.hover,
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
          </ZoomableGroup>
        </ComposableMap>

        {/* Province count badge */}
        <div className="absolute bottom-4 left-4 z-30 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border border-gray-100">
          <p className="text-xs font-bold text-gray-900 flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-[#5a7a55]" />
            34 Provinsi Indonesia
          </p>
        </div>

        {/* Hover info panel */}
        <AnimatePresence>
          {hoveredProvinceName && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 right-4 z-30 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-100 min-w-[220px]"
            >
              <div className="flex items-start gap-3">
                <div 
                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#7d9d78' }}
                >
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{hoveredProvinceName}</p>
                  <p className="text-sm text-gray-500 mb-1">
                    {provinceCodeMap[hoveredProvinceName] || 'ID'}
                  </p>
                  <p className="text-xs text-[#5a7a55] font-medium">Klik untuk lihat properti →</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compass rose */}
        <div className="absolute bottom-4 right-4 z-20">
          <svg width="48" height="48" viewBox="0 0 48 48" className="drop-shadow-md">
            <circle cx="24" cy="24" r="22" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <polygon points="24,6 28,20 24,16 20,20" fill="#5a7a55" />
            <polygon points="24,42 28,28 24,32 20,28" fill="#9ca3af" />
            <polygon points="42,24 28,20 32,24 28,28" fill="#9ca3af" />
            <polygon points="6,24 20,20 16,24 20,28" fill="#9ca3af" />
            <circle cx="24" cy="24" r="3" fill="#374151" />
            <text x="24" y="12" textAnchor="middle" fontSize="6" fill="#5a7a55" fontWeight="bold">N</text>
          </svg>
        </div>
      </div>
    </TooltipProvider>
  );
};

export const IndonesiaMap = memo(IndonesiaMapComponent);

export type { Province };
