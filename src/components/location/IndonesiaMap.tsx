import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ZoomIn, ZoomOut, Compass, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface Province {
  id: string;
  code: string;
  name: string;
  path: string;
  region: 'sumatera' | 'jawa' | 'kalimantan' | 'sulawesi' | 'bali-nusa' | 'maluku' | 'papua';
}

// Unified sage green color scheme matching reference image
const mapColors = {
  base: '#7d9d78',
  hover: '#6b8b66',
  selected: '#5a7a55',
  border: '#ffffff',
  dark: '#4a6b45',
};

// Indonesia provinces with accurate SVG paths
const provinces: Province[] = [
  // SUMATERA
  { id: 'aceh', code: 'IDAC', name: 'Aceh', region: 'sumatera',
    path: 'M58,42 L52,48 L48,52 L45,58 L44,65 L46,72 L50,78 L56,82 L63,84 L70,82 L75,76 L78,68 L77,60 L72,52 L65,46 Z' },
  { id: 'sumut', code: 'IDSU', name: 'Sumatera Utara', region: 'sumatera',
    path: 'M56,82 L50,78 L46,72 L44,65 L42,72 L40,82 L42,92 L48,100 L56,106 L65,108 L74,104 L80,96 L82,86 L78,76 L72,70 L65,72 L60,78 Z' },
  { id: 'sumbar', code: 'IDSB', name: 'Sumatera Barat', region: 'sumatera',
    path: 'M48,100 L42,92 L36,98 L34,108 L38,118 L46,126 L56,130 L64,126 L68,118 L66,108 L60,100 L54,96 Z' },
  { id: 'riau', code: 'IDRI', name: 'Riau', region: 'sumatera',
    path: 'M65,108 L74,104 L84,108 L94,104 L102,98 L108,90 L112,82 L108,76 L100,74 L92,78 L86,86 L80,96 L74,104 Z' },
  { id: 'kepri', code: 'IDKR', name: 'Kepulauan Riau', region: 'sumatera',
    path: 'M112,82 L120,78 L128,76 L134,80 L138,88 L134,96 L126,100 L118,98 L112,92 L110,86 Z' },
  { id: 'jambi', code: 'IDJA', name: 'Jambi', region: 'sumatera',
    path: 'M64,126 L56,130 L52,138 L56,148 L64,156 L74,160 L84,156 L90,148 L88,138 L82,130 L74,126 Z' },
  { id: 'sumsel', code: 'IDSS', name: 'Sumatera Selatan', region: 'sumatera',
    path: 'M74,160 L64,156 L58,164 L60,176 L68,186 L80,192 L92,188 L100,178 L98,166 L90,158 L82,156 Z' },
  { id: 'bengkulu', code: 'IDBE', name: 'Bengkulu', region: 'sumatera',
    path: 'M46,126 L38,118 L32,126 L30,138 L36,150 L46,158 L56,160 L62,152 L58,140 L52,132 Z' },
  { id: 'babel', code: 'IDBB', name: 'Bangka Belitung', region: 'sumatera',
    path: 'M120,148 L130,144 L140,148 L146,158 L142,168 L132,174 L122,170 L118,160 L120,152 Z' },
  { id: 'lampung', code: 'IDLA', name: 'Lampung', region: 'sumatera',
    path: 'M80,192 L68,186 L64,196 L68,208 L78,218 L90,222 L102,216 L108,204 L104,192 L94,186 L86,188 Z' },

  // JAWA
  { id: 'banten', code: 'IDBT', name: 'Banten', region: 'jawa',
    path: 'M118,218 L110,214 L106,222 L110,232 L120,238 L130,236 L136,228 L132,220 L124,216 Z' },
  { id: 'jakarta', code: 'IDJK', name: 'Jakarta Raya', region: 'jawa',
    path: 'M136,228 L142,224 L148,228 L150,236 L146,242 L138,244 L132,240 L132,234 Z' },
  { id: 'jabar', code: 'IDJB', name: 'Jawa Barat', region: 'jawa',
    path: 'M150,236 L160,232 L172,234 L184,238 L192,246 L188,256 L176,262 L162,260 L150,254 L144,246 L146,240 Z' },
  { id: 'jateng', code: 'IDJT', name: 'Jawa Tengah', region: 'jawa',
    path: 'M192,246 L206,242 L222,244 L236,250 L244,260 L240,270 L226,276 L210,274 L196,268 L188,258 L188,252 Z' },
  { id: 'yogya', code: 'IDYO', name: 'Yogyakarta', region: 'jawa',
    path: 'M210,274 L218,280 L224,290 L218,298 L206,300 L198,294 L198,284 L204,278 Z' },
  { id: 'jatim', code: 'IDJI', name: 'Jawa Timur', region: 'jawa',
    path: 'M244,260 L260,254 L278,256 L294,264 L302,276 L296,288 L280,294 L262,290 L248,282 L240,272 L242,266 Z' },

  // KALIMANTAN
  { id: 'kalbar', code: 'IDKB', name: 'Kalimantan Barat', region: 'kalimantan',
    path: 'M168,128 L182,122 L198,124 L214,132 L224,144 L220,160 L206,172 L188,176 L172,170 L162,156 L160,142 L164,134 Z' },
  { id: 'kalteng', code: 'IDKT', name: 'Kalimantan Tengah', region: 'kalimantan',
    path: 'M188,176 L206,172 L224,176 L240,186 L248,200 L242,216 L226,226 L206,228 L190,220 L180,204 L180,188 Z' },
  { id: 'kalsel', code: 'IDKS', name: 'Kalimantan Selatan', region: 'kalimantan',
    path: 'M226,226 L242,222 L256,230 L264,244 L258,258 L244,266 L228,264 L218,252 L216,238 L220,230 Z' },
  { id: 'kaltim', code: 'IDKI', name: 'Kalimantan Timur', region: 'kalimantan',
    path: 'M224,144 L240,138 L258,144 L272,158 L276,176 L270,194 L256,206 L238,208 L224,198 L218,180 L218,162 L222,150 Z' },
  { id: 'kaltara', code: 'IDKU', name: 'Kalimantan Utara', region: 'kalimantan',
    path: 'M240,138 L254,130 L270,128 L284,136 L290,150 L284,166 L270,176 L254,174 L244,162 L240,148 Z' },

  // SULAWESI
  { id: 'sulut', code: 'IDSA', name: 'Sulawesi Utara', region: 'sulawesi',
    path: 'M326,106 L342,100 L358,104 L370,116 L366,132 L352,142 L336,140 L324,128 L322,116 Z' },
  { id: 'gorontalo', code: 'IDGO', name: 'Gorontalo', region: 'sulawesi',
    path: 'M310,128 L324,128 L336,140 L338,154 L328,164 L314,164 L304,154 L304,140 Z' },
  { id: 'sulteng', code: 'IDST', name: 'Sulawesi Tengah', region: 'sulawesi',
    path: 'M304,154 L314,164 L328,164 L342,172 L352,186 L346,202 L330,212 L312,210 L296,198 L292,182 L296,168 Z' },
  { id: 'sulbar', code: 'IDSR', name: 'Sulawesi Barat', region: 'sulawesi',
    path: 'M292,198 L296,182 L288,192 L282,208 L288,222 L300,230 L314,228 L322,218 L314,210 L302,204 Z' },
  { id: 'sulsel', code: 'IDSN', name: 'Sulawesi Selatan', region: 'sulawesi',
    path: 'M300,230 L288,222 L282,236 L288,252 L302,264 L318,268 L332,260 L338,244 L330,228 L318,222 L308,226 Z' },
  { id: 'sultra', code: 'IDSG', name: 'Sulawesi Tenggara', region: 'sulawesi',
    path: 'M330,212 L346,202 L358,210 L368,226 L362,244 L346,254 L328,252 L318,238 L320,222 L326,216 Z' },

  // BALI & NUSA TENGGARA
  { id: 'bali', code: 'IDBA', name: 'Bali', region: 'bali-nusa',
    path: 'M308,288 L320,282 L332,286 L340,298 L334,310 L320,316 L308,312 L302,300 L304,292 Z' },
  { id: 'ntb', code: 'IDNB', name: 'Nusa Tenggara Barat', region: 'bali-nusa',
    path: 'M340,298 L356,292 L374,296 L386,310 L380,324 L364,332 L346,328 L336,314 L338,304 Z' },
  { id: 'ntt', code: 'IDNT', name: 'Nusa Tenggara Timur', region: 'bali-nusa',
    path: 'M386,310 L406,302 L428,306 L448,318 L454,336 L444,352 L422,358 L398,352 L382,338 L380,324 Z' },

  // MALUKU
  { id: 'malut', code: 'IDMU', name: 'Maluku Utara', region: 'maluku',
    path: 'M388,124 L406,118 L424,124 L436,140 L430,158 L414,168 L396,164 L384,148 L384,134 Z' },
  { id: 'maluku', code: 'IDMA', name: 'Maluku', region: 'maluku',
    path: 'M396,182 L418,176 L442,184 L460,200 L458,222 L440,238 L416,240 L394,228 L386,208 L390,192 Z' },

  // PAPUA
  { id: 'papuabarat', code: 'IDPB', name: 'Papua Barat', region: 'papua',
    path: 'M472,148 L494,142 L518,150 L536,168 L534,192 L516,210 L492,214 L472,202 L464,180 L466,162 Z' },
  { id: 'papua', code: 'IDPA', name: 'Papua', region: 'papua',
    path: 'M536,168 L566,158 L600,168 L630,190 L640,222 L628,256 L596,278 L556,282 L522,266 L502,238 L506,204 L520,180 Z' },
];

// Region colors - unified sage green matching reference
const regionColors: Record<string, { base: string; hover: string; selected: string; dark: string }> = {
  'sumatera': { base: '#7d9d78', hover: '#6b8b66', selected: '#5a7a55', dark: '#4a6b45' },
  'jawa': { base: '#7d9d78', hover: '#6b8b66', selected: '#5a7a55', dark: '#4a6b45' },
  'kalimantan': { base: '#7d9d78', hover: '#6b8b66', selected: '#5a7a55', dark: '#4a6b45' },
  'sulawesi': { base: '#7d9d78', hover: '#6b8b66', selected: '#5a7a55', dark: '#4a6b45' },
  'bali-nusa': { base: '#7d9d78', hover: '#6b8b66', selected: '#5a7a55', dark: '#4a6b45' },
  'maluku': { base: '#7d9d78', hover: '#6b8b66', selected: '#5a7a55', dark: '#4a6b45' },
  'papua': { base: '#7d9d78', hover: '#6b8b66', selected: '#5a7a55', dark: '#4a6b45' },
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

  const getBorderColor = (_province: Province, isHovered: boolean, isSelected: boolean) => {
    if (isSelected || isHovered) return '#ffffff';
    return 'rgba(255,255,255,0.6)';
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
          <div className="h-8 w-8 rounded-lg bg-[#7d9d78]/20 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-[#5a7a55]" />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground block">Peta Indonesia</span>
            <span className="text-xs text-muted-foreground">34 Provinsi - Pilih untuk melihat properti</span>
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
            viewBox="0 0 680 340"
            className="w-full h-full relative z-10"
            style={{ 
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: 'center center'
            }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="provinceShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.1" />
              </filter>
              <filter id="provinceGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ffffff" floodOpacity="0.8" />
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
                      strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 1}
                      strokeLinejoin="round"
                      className="cursor-pointer"
                      style={{
                        filter: isHovered || isSelected ? 'url(#provinceGlow)' : 'url(#provinceShadow)',
                      }}
                      onMouseEnter={() => setHoveredProvince(province.id)}
                      onMouseLeave={() => setHoveredProvince(null)}
                      onClick={() => handleProvinceClick(province)}
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: 1,
                        scale: isHovered || isSelected ? 1.01 : 1,
                      }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      whileTap={{ scale: 0.99 }}
                    />
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    sideOffset={8}
                    className="bg-white border border-gray-200 shadow-xl px-4 py-3 rounded-xl z-50"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-5 w-5 rounded-md shadow-sm" 
                        style={{ backgroundColor: '#7d9d78' }}
                      />
                      <div>
                        <p className="font-bold text-gray-900">{province.name}</p>
                        <p className="text-xs text-gray-500">{province.code}</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </motion.svg>
        </motion.div>

        {/* Province count badge */}
        <div className="absolute bottom-4 left-4 z-30 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border border-gray-100">
          <p className="text-xs font-bold text-gray-900 flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-[#5a7a55]" />
            {provinces.length} Provinsi Indonesia
          </p>
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
                style={{ backgroundColor: '#7d9d78' }}
              >
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {provinces.find(p => p.id === hoveredProvince)?.name}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  {provinces.find(p => p.id === hoveredProvince)?.code}
                </p>
                <p className="text-xs text-[#5a7a55] font-medium">Klik untuk lihat properti →</p>
              </div>
            </div>
          </motion.div>
        )}

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

export { provinces };
export type { Province };
