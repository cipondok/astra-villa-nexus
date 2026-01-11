import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Province {
  id: string;
  name: string;
  path: string;
  center: { x: number; y: number };
}

// Simplified SVG paths for Indonesian provinces (real geographic positions)
const provinces: Province[] = [
  { id: 'aceh', name: 'Aceh', path: 'M45,85 L60,75 L75,80 L80,95 L65,105 L50,100 Z', center: { x: 62, y: 90 } },
  { id: 'sumut', name: 'Sumatera Utara', path: 'M50,100 L65,105 L80,95 L90,110 L85,130 L65,140 L50,125 Z', center: { x: 68, y: 118 } },
  { id: 'sumbar', name: 'Sumatera Barat', path: 'M50,125 L65,140 L70,160 L55,170 L40,155 Z', center: { x: 55, y: 150 } },
  { id: 'riau', name: 'Riau', path: 'M65,140 L85,130 L100,135 L105,155 L90,165 L70,160 Z', center: { x: 85, y: 150 } },
  { id: 'kepri', name: 'Kepulauan Riau', path: 'M100,120 L120,115 L130,125 L125,140 L105,135 Z', center: { x: 115, y: 128 } },
  { id: 'jambi', name: 'Jambi', path: 'M70,160 L90,165 L95,185 L75,190 L60,180 Z', center: { x: 78, y: 175 } },
  { id: 'sumsel', name: 'Sumatera Selatan', path: 'M75,190 L95,185 L110,195 L105,220 L80,225 L65,210 Z', center: { x: 88, y: 205 } },
  { id: 'bengkulu', name: 'Bengkulu', path: 'M55,170 L70,160 L60,180 L65,210 L50,200 L45,180 Z', center: { x: 55, y: 188 } },
  { id: 'babel', name: 'Bangka Belitung', path: 'M120,185 L140,180 L150,195 L145,210 L125,205 Z', center: { x: 135, y: 195 } },
  { id: 'lampung', name: 'Lampung', path: 'M80,225 L105,220 L115,240 L95,255 L75,245 Z', center: { x: 92, y: 238 } },
  { id: 'banten', name: 'Banten', path: 'M145,270 L165,260 L175,275 L160,290 L145,285 Z', center: { x: 158, y: 277 } },
  { id: 'jakarta', name: 'DKI Jakarta', path: 'M175,275 L190,270 L195,280 L185,290 L175,285 Z', center: { x: 183, y: 280 } },
  { id: 'jabar', name: 'Jawa Barat', path: 'M160,290 L175,285 L195,280 L220,285 L230,305 L200,320 L165,310 Z', center: { x: 195, y: 298 } },
  { id: 'jateng', name: 'Jawa Tengah', path: 'M200,320 L230,305 L270,300 L290,315 L275,335 L235,340 L210,335 Z', center: { x: 250, y: 320 } },
  { id: 'yogya', name: 'DI Yogyakarta', path: 'M235,340 L255,338 L260,355 L240,360 Z', center: { x: 248, y: 348 } },
  { id: 'jatim', name: 'Jawa Timur', path: 'M275,335 L290,315 L330,310 L360,320 L355,345 L310,355 L280,350 Z', center: { x: 318, y: 332 } },
  { id: 'kalbar', name: 'Kalimantan Barat', path: 'M170,170 L210,155 L240,165 L245,200 L220,220 L180,215 L165,195 Z', center: { x: 205, y: 188 } },
  { id: 'kalteng', name: 'Kalimantan Tengah', path: 'M220,220 L245,200 L285,195 L310,215 L305,255 L260,265 L230,250 Z', center: { x: 265, y: 230 } },
  { id: 'kalsel', name: 'Kalimantan Selatan', path: 'M260,265 L305,255 L320,275 L305,295 L270,290 Z', center: { x: 290, y: 275 } },
  { id: 'kaltim', name: 'Kalimantan Timur', path: 'M285,195 L320,175 L355,165 L370,195 L360,235 L320,255 L310,215 Z', center: { x: 330, y: 210 } },
  { id: 'kaltara', name: 'Kalimantan Utara', path: 'M320,130 L355,120 L380,140 L370,165 L355,165 L320,175 Z', center: { x: 350, y: 148 } },
  { id: 'sulut', name: 'Sulawesi Utara', path: 'M420,160 L455,145 L480,155 L475,175 L445,180 L420,175 Z', center: { x: 450, y: 162 } },
  { id: 'gorontalo', name: 'Gorontalo', path: 'M420,175 L445,180 L450,195 L430,200 L415,190 Z', center: { x: 432, y: 188 } },
  { id: 'sulteng', name: 'Sulawesi Tengah', path: 'M400,195 L430,200 L450,195 L465,220 L450,250 L415,255 L390,235 Z', center: { x: 428, y: 225 } },
  { id: 'sulbar', name: 'Sulawesi Barat', path: 'M390,235 L415,255 L410,280 L385,275 L375,255 Z', center: { x: 395, y: 260 } },
  { id: 'sulsel', name: 'Sulawesi Selatan', path: 'M410,280 L415,255 L450,250 L460,285 L435,310 L405,305 Z', center: { x: 432, y: 280 } },
  { id: 'sultra', name: 'Sulawesi Tenggara', path: 'M450,250 L480,245 L510,265 L500,295 L460,285 Z', center: { x: 480, y: 268 } },
  { id: 'bali', name: 'Bali', path: 'M365,340 L385,335 L395,350 L380,360 L365,355 Z', center: { x: 378, y: 348 } },
  { id: 'ntb', name: 'Nusa Tenggara Barat', path: 'M400,345 L430,340 L450,355 L435,370 L405,365 Z', center: { x: 425, y: 355 } },
  { id: 'ntt', name: 'Nusa Tenggara Timur', path: 'M455,350 L500,340 L545,350 L540,375 L490,385 L455,370 Z', center: { x: 498, y: 362 } },
  { id: 'maluku', name: 'Maluku', path: 'M540,220 L580,210 L610,225 L605,260 L570,270 L540,255 Z', center: { x: 575, y: 240 } },
  { id: 'malut', name: 'Maluku Utara', path: 'M530,165 L565,155 L590,170 L585,195 L555,205 L530,190 Z', center: { x: 560, y: 178 } },
  { id: 'papuabarat', name: 'Papua Barat', path: 'M620,210 L665,195 L700,210 L695,250 L655,265 L620,250 Z', center: { x: 658, y: 230 } },
  { id: 'papua', name: 'Papua', path: 'M700,210 L780,195 L830,220 L825,280 L760,300 L700,285 L695,250 Z', center: { x: 760, y: 248 } },
  { id: 'papuaselatan', name: 'Papua Selatan', path: 'M700,285 L760,300 L755,340 L700,350 L680,320 Z', center: { x: 720, y: 318 } },
  { id: 'papuatengah', name: 'Papua Tengah', path: 'M760,300 L825,280 L830,320 L800,350 L755,340 Z', center: { x: 790, y: 315 } },
  { id: 'papuapegunungan', name: 'Papua Pegunungan', path: 'M720,260 L760,250 L780,270 L775,295 L740,290 L720,275 Z', center: { x: 750, y: 272 } },
];

interface IndonesiaMapProps {
  onProvinceSelect?: (province: Province) => void;
  selectedProvince?: string | null;
}

export const IndonesiaMap = ({ onProvinceSelect, selectedProvince }: IndonesiaMapProps) => {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleProvinceClick = (province: Province) => {
    if (onProvinceSelect) {
      onProvinceSelect(province);
    } else {
      navigate(`/location/${province.id}?name=${encodeURIComponent(province.name)}`);
    }
  };

  return (
    <TooltipProvider>
      <div className="relative w-full aspect-[2/1] bg-gradient-to-br from-primary/5 via-background to-secondary/10 rounded-2xl overflow-hidden border border-border/50 shadow-xl">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        {/* Map title */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-foreground">Peta Indonesia</span>
        </div>

        {/* SVG Map */}
        <svg
          viewBox="0 0 900 420"
          className="w-full h-full relative z-10"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
        >
          {/* Ocean background */}
          <rect x="0" y="0" width="900" height="420" fill="transparent" />

          {/* Province paths */}
          {provinces.map((province) => {
            const isHovered = hoveredProvince === province.id;
            const isSelected = selectedProvince === province.id;

            return (
              <Tooltip key={province.id}>
                <TooltipTrigger asChild>
                  <motion.path
                    d={province.path}
                    fill={isSelected ? 'hsl(var(--primary))' : isHovered ? 'hsl(var(--primary) / 0.7)' : 'hsl(var(--muted))'}
                    stroke={isSelected || isHovered ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                    strokeWidth={isSelected || isHovered ? 2 : 1}
                    className="cursor-pointer transition-colors duration-200"
                    onMouseEnter={() => setHoveredProvince(province.id)}
                    onMouseLeave={() => setHoveredProvince(null)}
                    onClick={() => handleProvinceClick(province)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ 
                      opacity: 1, 
                      scale: isHovered || isSelected ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.3, delay: Math.random() * 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  />
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="bg-background/95 backdrop-blur-md border-primary/20 shadow-lg"
                >
                  <div className="flex items-center gap-2 px-1 py-0.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{province.name}</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Province labels for major provinces */}
          {provinces
            .filter(p => ['jakarta', 'jabar', 'jateng', 'jatim', 'bali', 'sulsel', 'kalbar', 'papua'].includes(p.id))
            .map((province) => (
              <text
                key={`label-${province.id}`}
                x={province.center.x}
                y={province.center.y}
                textAnchor="middle"
                className="text-[8px] font-medium fill-foreground/70 pointer-events-none select-none"
              >
                {province.name.length > 10 ? province.name.slice(0, 8) + '..' : province.name}
              </text>
            ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-20 bg-background/80 backdrop-blur-md rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted border border-border" />
              <span className="text-muted-foreground">Provinsi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span className="text-muted-foreground">Terpilih</span>
            </div>
          </div>
        </div>

        {/* Hover info panel */}
        {hoveredProvince && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 z-20 bg-background/95 backdrop-blur-md rounded-lg p-4 border border-primary/20 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {provinces.find(p => p.id === hoveredProvince)?.name}
                </p>
                <p className="text-sm text-muted-foreground">Klik untuk lihat properti</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
};

export { provinces };
export type { Province };
