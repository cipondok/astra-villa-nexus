import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface Province {
  id: string;
  name: string;
  path: string;
  center: { x: number; y: number };
  region: 'sumatera' | 'jawa' | 'kalimantan' | 'sulawesi' | 'bali-nusa' | 'maluku' | 'papua';
}

// Realistic SVG paths for Indonesian provinces
const provinces: Province[] = [
  // Sumatera
  { id: 'aceh', name: 'Aceh', path: 'M52,78 L58,72 L68,70 L78,74 L82,82 L80,92 L72,98 L62,96 L54,90 Z', center: { x: 66, y: 84 }, region: 'sumatera' },
  { id: 'sumut', name: 'Sumatera Utara', path: 'M54,90 L62,96 L72,98 L80,92 L88,100 L92,112 L86,126 L72,132 L58,124 L52,108 Z', center: { x: 72, y: 112 }, region: 'sumatera' },
  { id: 'sumbar', name: 'Sumatera Barat', path: 'M52,124 L58,124 L72,132 L74,148 L68,162 L54,164 L46,152 L44,136 Z', center: { x: 58, y: 146 }, region: 'sumatera' },
  { id: 'riau', name: 'Riau', path: 'M72,132 L86,126 L102,128 L112,140 L108,158 L92,164 L74,158 L74,148 Z', center: { x: 90, y: 146 }, region: 'sumatera' },
  { id: 'kepri', name: 'Kepulauan Riau', path: 'M108,118 L122,112 L136,116 L140,128 L132,140 L118,138 L110,130 Z', center: { x: 124, y: 126 }, region: 'sumatera' },
  { id: 'jambi', name: 'Jambi', path: 'M74,158 L92,164 L98,180 L88,194 L72,190 L64,176 L68,162 Z', center: { x: 82, y: 176 }, region: 'sumatera' },
  { id: 'sumsel', name: 'Sumatera Selatan', path: 'M72,190 L88,194 L104,200 L112,218 L100,234 L80,238 L66,224 L64,204 Z', center: { x: 86, y: 216 }, region: 'sumatera' },
  { id: 'bengkulu', name: 'Bengkulu', path: 'M46,164 L54,164 L68,162 L64,176 L64,204 L52,212 L42,196 L40,176 Z', center: { x: 52, y: 188 }, region: 'sumatera' },
  { id: 'babel', name: 'Bangka Belitung', path: 'M126,186 L144,180 L158,188 L160,204 L148,214 L132,208 L124,196 Z', center: { x: 142, y: 196 }, region: 'sumatera' },
  { id: 'lampung', name: 'Lampung', path: 'M80,238 L100,234 L114,248 L108,268 L88,276 L72,264 L74,248 Z', center: { x: 92, y: 256 }, region: 'sumatera' },
  
  // Jawa
  { id: 'banten', name: 'Banten', path: 'M148,282 L166,274 L180,280 L182,294 L168,304 L152,300 L146,290 Z', center: { x: 164, y: 290 }, region: 'jawa' },
  { id: 'jakarta', name: 'DKI Jakarta', path: 'M180,280 L194,276 L200,284 L196,294 L184,296 L180,288 Z', center: { x: 190, y: 286 }, region: 'jawa' },
  { id: 'jabar', name: 'Jawa Barat', path: 'M168,304 L182,294 L196,294 L220,292 L238,304 L232,324 L204,336 L176,328 L164,316 Z', center: { x: 200, y: 314 }, region: 'jawa' },
  { id: 'jateng', name: 'Jawa Tengah', path: 'M204,336 L232,324 L238,304 L268,296 L296,306 L294,328 L270,344 L242,348 L216,342 Z', center: { x: 256, y: 324 }, region: 'jawa' },
  { id: 'yogya', name: 'DI Yogyakarta', path: 'M242,348 L260,346 L268,358 L258,368 L244,366 L238,356 Z', center: { x: 252, y: 356 }, region: 'jawa' },
  { id: 'jatim', name: 'Jawa Timur', path: 'M270,344 L294,328 L296,306 L328,298 L362,308 L366,332 L348,356 L312,364 L282,358 L270,350 Z', center: { x: 318, y: 334 }, region: 'jawa' },
  
  // Kalimantan
  { id: 'kalbar', name: 'Kalimantan Barat', path: 'M178,162 L208,148 L244,156 L256,180 L252,212 L224,232 L188,224 L172,196 L170,176 Z', center: { x: 212, y: 190 }, region: 'kalimantan' },
  { id: 'kalteng', name: 'Kalimantan Tengah', path: 'M224,232 L252,212 L292,204 L324,220 L320,264 L284,280 L248,272 L232,252 Z', center: { x: 276, y: 244 }, region: 'kalimantan' },
  { id: 'kalsel', name: 'Kalimantan Selatan', path: 'M284,280 L320,264 L340,280 L336,304 L308,316 L284,308 L276,292 Z', center: { x: 308, y: 290 }, region: 'kalimantan' },
  { id: 'kaltim', name: 'Kalimantan Timur', path: 'M292,204 L324,184 L360,172 L384,192 L380,236 L352,264 L324,260 L324,220 Z', center: { x: 344, y: 218 }, region: 'kalimantan' },
  { id: 'kaltara', name: 'Kalimantan Utara', path: 'M324,136 L356,124 L388,140 L392,168 L384,192 L360,172 L324,184 L316,160 Z', center: { x: 356, y: 156 }, region: 'kalimantan' },
  
  // Sulawesi
  { id: 'sulut', name: 'Sulawesi Utara', path: 'M432,156 L464,142 L496,152 L500,172 L476,184 L448,180 L432,168 Z', center: { x: 464, y: 164 }, region: 'sulawesi' },
  { id: 'gorontalo', name: 'Gorontalo', path: 'M432,168 L448,180 L456,196 L444,208 L424,200 L420,184 Z', center: { x: 438, y: 190 }, region: 'sulawesi' },
  { id: 'sulteng', name: 'Sulawesi Tengah', path: 'M408,196 L424,200 L444,208 L468,200 L488,224 L476,260 L440,272 L408,256 L396,228 Z', center: { x: 442, y: 234 }, region: 'sulawesi' },
  { id: 'sulbar', name: 'Sulawesi Barat', path: 'M396,248 L408,256 L440,272 L436,296 L412,304 L388,292 L384,268 Z', center: { x: 410, y: 276 }, region: 'sulawesi' },
  { id: 'sulsel', name: 'Sulawesi Selatan', path: 'M412,304 L436,296 L440,272 L476,260 L492,288 L476,320 L444,332 L416,324 Z', center: { x: 452, y: 300 }, region: 'sulawesi' },
  { id: 'sultra', name: 'Sulawesi Tenggara', path: 'M476,260 L508,252 L544,272 L540,304 L508,320 L484,312 L476,288 Z', center: { x: 510, y: 284 }, region: 'sulawesi' },
  
  // Bali & Nusa Tenggara
  { id: 'bali', name: 'Bali', path: 'M376,348 L396,340 L412,352 L408,368 L388,376 L372,366 Z', center: { x: 390, y: 358 }, region: 'bali-nusa' },
  { id: 'ntb', name: 'Nusa Tenggara Barat', path: 'M420,348 L452,340 L476,356 L468,376 L436,384 L416,372 Z', center: { x: 446, y: 362 }, region: 'bali-nusa' },
  { id: 'ntt', name: 'Nusa Tenggara Timur', path: 'M484,352 L528,340 L580,348 L588,372 L556,392 L504,396 L480,380 Z', center: { x: 532, y: 368 }, region: 'bali-nusa' },
  
  // Maluku
  { id: 'maluku', name: 'Maluku', path: 'M564,224 L604,212 L644,228 L648,268 L616,288 L576,280 L556,252 Z', center: { x: 602, y: 252 }, region: 'maluku' },
  { id: 'malut', name: 'Maluku Utara', path: 'M548,164 L584,152 L620,168 L624,200 L592,216 L556,208 L540,188 Z', center: { x: 582, y: 184 }, region: 'maluku' },
  
  // Papua
  { id: 'papuabarat', name: 'Papua Barat', path: 'M652,208 L696,192 L740,204 L748,244 L716,272 L672,264 L648,240 Z', center: { x: 700, y: 236 }, region: 'papua' },
  { id: 'papua', name: 'Papua', path: 'M740,204 L820,188 L880,216 L884,280 L840,316 L780,324 L736,304 L724,264 L748,244 Z', center: { x: 804, y: 260 }, region: 'papua' },
  { id: 'papuaselatan', name: 'Papua Selatan', path: 'M736,304 L780,324 L784,364 L740,380 L704,360 L700,328 Z', center: { x: 742, y: 344 }, region: 'papua' },
  { id: 'papuatengah', name: 'Papua Tengah', path: 'M780,324 L840,316 L856,352 L824,380 L784,364 Z', center: { x: 816, y: 348 }, region: 'papua' },
  { id: 'papuapegunungan', name: 'Papua Pegunungan', path: 'M756,268 L796,256 L824,280 L820,312 L784,320 L756,304 L748,284 Z', center: { x: 786, y: 288 }, region: 'papua' },
];

// Region colors - earthy, realistic map colors
const regionColors: Record<string, { base: string; hover: string; selected: string }> = {
  'sumatera': { base: '#7cb342', hover: '#8bc34a', selected: '#558b2f' },
  'jawa': { base: '#ffa726', hover: '#ffb74d', selected: '#f57c00' },
  'kalimantan': { base: '#66bb6a', hover: '#81c784', selected: '#43a047' },
  'sulawesi': { base: '#42a5f5', hover: '#64b5f6', selected: '#1e88e5' },
  'bali-nusa': { base: '#ab47bc', hover: '#ba68c8', selected: '#8e24aa' },
  'maluku': { base: '#26c6da', hover: '#4dd0e1', selected: '#00acc1' },
  'papua': { base: '#ef5350', hover: '#e57373', selected: '#d32f2f' },
};

interface IndonesiaMapProps {
  onProvinceSelect?: (province: Province) => void;
  selectedProvince?: string | null;
}

export const IndonesiaMap = ({ onProvinceSelect, selectedProvince }: IndonesiaMapProps) => {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
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

  return (
    <TooltipProvider>
      <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-2xl border border-border/30">
        {/* Ocean gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#e3f2fd] via-[#bbdefb] to-[#90caf9]" />
        
        {/* Ocean texture pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="oceanPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="20" fill="none" stroke="#64b5f6" strokeWidth="0.5" opacity="0.3" />
              <circle cx="30" cy="30" r="10" fill="none" stroke="#42a5f5" strokeWidth="0.3" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#oceanPattern)" />
        </svg>

        {/* Map controls */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-8 w-8 bg-white/90 hover:bg-white shadow-lg"
            onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-8 w-8 bg-white/90 hover:bg-white shadow-lg"
            onClick={() => setZoom(Math.max(zoom - 0.2, 0.6))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Map title */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/50">
          <Compass className="h-5 w-5 text-primary" />
          <span className="text-base font-bold text-foreground">Peta Indonesia</span>
        </div>

        {/* SVG Map */}
        <motion.svg
          viewBox="0 0 950 440"
          className="w-full h-full relative z-10"
          style={{ 
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          <defs>
            {/* Land gradient for 3D effect */}
            <linearGradient id="landGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
            </linearGradient>
            
            {/* Shadow filter */}
            <filter id="landShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.25" />
            </filter>
            
            {/* Glow filter for hover */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Province paths with shadows */}
          {provinces.map((province) => {
            const isHovered = hoveredProvince === province.id;
            const isSelected = selectedProvince === province.id;
            const fillColor = getProvinceColor(province, isHovered, isSelected);

            return (
              <g key={province.id}>
                {/* Shadow layer */}
                <path
                  d={province.path}
                  fill="rgba(0,0,0,0.2)"
                  transform="translate(3, 4)"
                  style={{ filter: 'blur(4px)' }}
                />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.path
                      d={province.path}
                      fill={fillColor}
                      stroke={isSelected || isHovered ? '#ffffff' : 'rgba(255,255,255,0.6)'}
                      strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.5}
                      className="cursor-pointer"
                      style={{
                        filter: isHovered || isSelected ? 'url(#glow)' : 'url(#landShadow)',
                      }}
                      onMouseEnter={() => setHoveredProvince(province.id)}
                      onMouseLeave={() => setHoveredProvince(null)}
                      onClick={() => handleProvinceClick(province)}
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: 1,
                        scale: isHovered || isSelected ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    />
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-white/95 backdrop-blur-md border-0 shadow-xl px-4 py-3 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-4 w-4 rounded-full shadow-inner" 
                        style={{ backgroundColor: regionColors[province.region].base }}
                      />
                      <div>
                        <p className="font-bold text-foreground">{province.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{province.region.replace('-', ' & ')}</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Overlay gradient for 3D effect */}
                <path
                  d={province.path}
                  fill="url(#landGradient)"
                  className="pointer-events-none"
                  opacity="0.4"
                />
              </g>
            );
          })}

          {/* Province labels for major provinces */}
          {provinces
            .filter(p => ['jakarta', 'jabar', 'jateng', 'jatim', 'bali', 'sulsel', 'kalbar', 'sumut', 'papua'].includes(p.id))
            .map((province) => (
              <g key={`label-${province.id}`} className="pointer-events-none">
                <text
                  x={province.center.x}
                  y={province.center.y}
                  textAnchor="middle"
                  className="select-none"
                  style={{
                    fontSize: '8px',
                    fontWeight: 600,
                    fill: '#ffffff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  {province.name.length > 12 ? province.name.slice(0, 10) + '..' : province.name}
                </text>
              </g>
            ))}
        </motion.svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-30 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/50">
          <p className="text-xs font-bold text-foreground mb-3">Wilayah Indonesia</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries(regionColors).map(([region, colors]) => (
              <div key={region} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm shadow-sm border border-white/50" 
                  style={{ backgroundColor: colors.base }}
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {region.replace('-', ' & ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hover info panel */}
        {hoveredProvince && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-16 right-4 z-30 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/50 min-w-[200px]"
          >
            <div className="flex items-center gap-3">
              <div 
                className="h-12 w-12 rounded-xl flex items-center justify-center shadow-inner"
                style={{ backgroundColor: regionColors[provinces.find(p => p.id === hoveredProvince)?.region || 'jawa'].base + '20' }}
              >
                <MapPin 
                  className="h-6 w-6" 
                  style={{ color: regionColors[provinces.find(p => p.id === hoveredProvince)?.region || 'jawa'].base }}
                />
              </div>
              <div>
                <p className="font-bold text-foreground">
                  {provinces.find(p => p.id === hoveredProvince)?.name}
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  {provinces.find(p => p.id === hoveredProvince)?.region.replace('-', ' & ')}
                </p>
                <p className="text-xs text-primary mt-1">Klik untuk lihat properti →</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Compass rose */}
        <div className="absolute bottom-4 right-4 z-20 opacity-60">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="22" fill="white" stroke="#e0e0e0" strokeWidth="1" />
            <polygon points="24,4 28,20 24,16 20,20" fill="#ef5350" />
            <polygon points="24,44 28,28 24,32 20,28" fill="#424242" />
            <polygon points="4,24 20,20 16,24 20,28" fill="#424242" />
            <polygon points="44,24 28,20 32,24 28,28" fill="#424242" />
            <text x="24" y="10" textAnchor="middle" fontSize="6" fill="#ef5350" fontWeight="bold">N</text>
          </svg>
        </div>
      </div>
    </TooltipProvider>
  );
};

export { provinces };
export type { Province };
