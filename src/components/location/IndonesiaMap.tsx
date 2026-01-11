import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ZoomIn, ZoomOut, Compass, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface Province {
  id: string;
  name: string;
  path: string;
  region: 'sumatera' | 'jawa' | 'kalimantan' | 'sulawesi' | 'bali-nusa' | 'maluku' | 'papua';
}

// Province codes matching the user's reference
const provinceNames: Record<string, string> = {
  'IDAC': 'Aceh', 'IDBA': 'Bali', 'IDBB': 'Bangka-Belitung', 'IDBE': 'Bengkulu',
  'IDBT': 'Banten', 'IDGO': 'Gorontalo', 'IDJA': 'Jambi', 'IDJB': 'Jawa Barat',
  'IDJI': 'Jawa Timur', 'IDJK': 'Jakarta Raya', 'IDJT': 'Jawa Tengah',
  'IDKB': 'Kalimantan Barat', 'IDKI': 'Kalimantan Timur', 'IDKR': 'Kepulauan Riau',
  'IDKS': 'Kalimantan Selatan', 'IDKT': 'Kalimantan Tengah', 'IDKU': 'Kalimantan Utara',
  'IDLA': 'Lampung', 'IDMA': 'Maluku', 'IDMU': 'Maluku Utara',
  'IDNB': 'Nusa Tenggara Barat', 'IDNT': 'Nusa Tenggara Timur',
  'IDPA': 'Papua', 'IDPB': 'Papua Barat', 'IDRI': 'Riau',
  'IDSA': 'Sulawesi Utara', 'IDSB': 'Sumatera Barat', 'IDSG': 'Sulawesi Tenggara',
  'IDSN': 'Sulawesi Selatan', 'IDSR': 'Sulawesi Barat', 'IDSS': 'Sumatera Selatan',
  'IDST': 'Sulawesi Tengah', 'IDSU': 'Sumatera Utara', 'IDYO': 'Yogyakarta'
};

// Unified green color scheme matching reference image
const mapColors = {
  base: '#7d9d78',      // Sage green from reference
  hover: '#6b8b66',     // Darker on hover
  selected: '#5a7a55',  // Even darker when selected
  border: '#ffffff',    // White borders between provinces
};

interface IndonesiaMapProps {
  onProvinceSelect?: (province: Province) => void;
  selectedProvince?: string | null;
}

export const IndonesiaMap = ({ onProvinceSelect, selectedProvince }: IndonesiaMapProps) => {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  const handleProvinceClick = (province: Province) => {
    if (onProvinceSelect) {
      onProvinceSelect(province);
    } else {
      navigate(`/properties?location=${encodeURIComponent(province.name)}`);
    }
  };

  const getProvinceColor = (province: Province, isHovered: boolean, isSelected: boolean) => {
    const colors = regionColors[province.region];
    if (isSelected) return colors.selected;
    if (isHovered) return colors.hover;
    return colors.base;
  };

  const getBorderColor = (province: Province, isHovered: boolean, isSelected: boolean) => {
    const colors = regionColors[province.region];
    if (isSelected || isHovered) return colors.dark;
    return colors.dark + '80';
  };

  return (
    <TooltipProvider>
      <div className="relative w-full aspect-[2.2/1] rounded-2xl overflow-hidden shadow-2xl border border-border/30 bg-gradient-to-b from-[#cce7f5] to-[#e8f4fc]">
        {/* Ocean pattern */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }}>
          <defs>
            <pattern id="wavePattern" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
              <path d="M0 10 Q25 0 50 10 T100 10" fill="none" stroke="#a8d4e6" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b8dff5" />
              <stop offset="50%" stopColor="#cce7f5" />
              <stop offset="100%" stopColor="#e0f0fa" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#oceanGradient)" />
          <rect width="100%" height="100%" fill="url(#wavePattern)" />
        </svg>

        {/* Map controls */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-9 w-9 bg-white/95 hover:bg-white shadow-lg border border-gray-200"
            onClick={() => setZoom(Math.min(zoom + 0.25, 2.5))}
          >
            <ZoomIn className="h-4 w-4 text-gray-700" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-9 w-9 bg-white/95 hover:bg-white shadow-lg border border-gray-200"
            onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
          >
            <ZoomOut className="h-4 w-4 text-gray-700" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-9 w-9 bg-white/95 hover:bg-white shadow-lg border border-gray-200"
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          >
            <Maximize2 className="h-4 w-4 text-gray-700" />
          </Button>
        </div>

        {/* Map title */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-3 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-gray-100">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground block">Peta Indonesia</span>
            <span className="text-xs text-muted-foreground">Pilih provinsi untuk melihat properti</span>
          </div>
        </div>

        {/* SVG Map Container */}
        <motion.div
          className="w-full h-full cursor-grab active:cursor-grabbing"
          drag
          dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
          onDrag={(_, info) => setPan({ x: info.offset.x, y: info.offset.y })}
        >
          <motion.svg
            viewBox="0 0 450 260"
            className="w-full h-full relative z-10"
            style={{ 
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: 'center center'
            }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Land shadow */}
              <filter id="provinceShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15" />
              </filter>
              
              {/* Glow effect */}
              <filter id="provinceGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feFlood floodColor="#ffffff" floodOpacity="0.5" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Inner shadow for depth */}
              <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feComponentTransfer in="SourceAlpha">
                  <feFuncA type="table" tableValues="1 0" />
                </feComponentTransfer>
                <feGaussianBlur stdDeviation="1" />
                <feOffset dx="0" dy="1" result="offset" />
                <feFlood floodColor="#000" floodOpacity="0.2" result="color" />
                <feComposite in="color" in2="offset" operator="in" result="shadow" />
                <feComposite in="shadow" in2="SourceAlpha" operator="in" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode />
                </feMerge>
              </filter>
            </defs>

            {/* Province paths */}
            {provinces.map((province) => {
              const isHovered = hoveredProvince === province.id;
              const isSelected = selectedProvince === province.id;
              const fillColor = getProvinceColor(province, isHovered, isSelected);
              const strokeColor = getBorderColor(province, isHovered, isSelected);

              return (
                <Tooltip key={province.id}>
                  <TooltipTrigger asChild>
                    <motion.path
                      d={province.path}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 1.5 : isHovered ? 1.2 : 0.8}
                      strokeLinejoin="round"
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        filter: isHovered || isSelected ? 'url(#provinceGlow)' : 'url(#provinceShadow)',
                      }}
                      onMouseEnter={() => setHoveredProvince(province.id)}
                      onMouseLeave={() => setHoveredProvince(null)}
                      onClick={() => handleProvinceClick(province)}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ 
                        opacity: 1,
                        scale: isHovered || isSelected ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      whileTap={{ scale: 0.98 }}
                    />
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    sideOffset={8}
                    className="bg-white border-0 shadow-xl px-4 py-3 rounded-xl z-50"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-5 w-5 rounded-md shadow-sm border border-white/50" 
                        style={{ backgroundColor: regionColors[province.region].selected }}
                      />
                      <div>
                        <p className="font-bold text-gray-900">{province.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{province.region.replace('-', ' & ')}</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </motion.svg>
        </motion.div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-30 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-100">
          <p className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-primary" />
            Wilayah Indonesia
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(regionColors).map(([region, colors]) => (
              <div key={region} className="flex items-center gap-2">
                <div 
                  className="w-4 h-3 rounded-sm shadow-sm" 
                  style={{ 
                    backgroundColor: colors.base,
                    border: `1px solid ${colors.dark}40`
                  }}
                />
                <span className="text-xs text-gray-600 capitalize font-medium">
                  {region.replace('-', ' & ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hover info panel */}
        {hoveredProvince && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 right-4 z-30 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-100 min-w-[220px]"
          >
            <div className="flex items-start gap-3">
              <div 
                className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ 
                  backgroundColor: regionColors[provinces.find(p => p.id === hoveredProvince)?.region || 'jawa'].base,
                  border: `2px solid ${regionColors[provinces.find(p => p.id === hoveredProvince)?.region || 'jawa'].dark}40`
                }}
              >
                <MapPin 
                  className="h-5 w-5" 
                  style={{ color: regionColors[provinces.find(p => p.id === hoveredProvince)?.region || 'jawa'].dark }}
                />
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {provinces.find(p => p.id === hoveredProvince)?.name}
                </p>
                <p className="text-sm text-gray-500 capitalize mb-1">
                  {provinces.find(p => p.id === hoveredProvince)?.region.replace('-', ' & ')}
                </p>
                <p className="text-xs text-primary font-medium">Klik untuk lihat properti →</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Compass rose */}
        <div className="absolute bottom-4 right-4 z-20">
          <svg width="52" height="52" viewBox="0 0 52 52" className="drop-shadow-lg">
            <circle cx="26" cy="26" r="24" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="26" cy="26" r="20" fill="none" stroke="#f3f4f6" strokeWidth="1" />
            {/* North pointer */}
            <polygon points="26,6 30,22 26,18 22,22" fill="#ef4444" />
            {/* South pointer */}
            <polygon points="26,46 30,30 26,34 22,30" fill="#6b7280" />
            {/* East pointer */}
            <polygon points="46,26 30,22 34,26 30,30" fill="#6b7280" />
            {/* West pointer */}
            <polygon points="6,26 22,22 18,26 22,30" fill="#6b7280" />
            {/* Center circle */}
            <circle cx="26" cy="26" r="3" fill="#374151" />
            {/* N label */}
            <text x="26" y="13" textAnchor="middle" fontSize="7" fill="#ef4444" fontWeight="bold">N</text>
          </svg>
        </div>

        {/* Scale indicator */}
        <div className="absolute bottom-16 right-4 z-20 bg-white/90 rounded-lg px-3 py-1.5 shadow-md border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-12 h-1 bg-gray-800 rounded-full relative">
              <div className="absolute -left-0.5 -top-1 w-0.5 h-3 bg-gray-800" />
              <div className="absolute -right-0.5 -top-1 w-0.5 h-3 bg-gray-800" />
            </div>
            <span className="text-xs text-gray-600 font-medium">500 km</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export { provinces };
export type { Province };
