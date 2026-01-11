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

// Accurate vector paths for Indonesian provinces
const provinces: Province[] = [
  // SUMATERA
  { id: 'aceh', name: 'Aceh', region: 'sumatera',
    path: 'M95.2,47.8l-2.5,3.1l-4.8,2.1l-3.2,4.5l0.8,5.2l3.1,4.1l5.6,2.3l4.2,-1.8l3.5,-4.2l1.2,-5.8l-2.1,-4.6l-3.8,-3.2z' },
  { id: 'sumut', name: 'Sumatera Utara', region: 'sumatera',
    path: 'M93.5,69.2l-3.2,2.8l-2.1,5.4l1.5,6.8l4.2,5.1l6.5,3.2l5.8,-0.5l4.1,-3.8l1.8,-6.2l-1.2,-5.8l-4.5,-4.2l-6.8,-2.1z' },
  { id: 'sumbar', name: 'Sumatera Barat', region: 'sumatera',
    path: 'M85.6,95.4l-2.8,4.5l-1.2,6.2l2.1,5.8l4.8,4.1l5.2,1.2l4.1,-2.5l2.1,-5.1l-0.5,-6.5l-3.5,-4.8l-5.8,-2.1z' },
  { id: 'riau', name: 'Riau', region: 'sumatera',
    path: 'M100.5,92.1l3.8,2.1l6.2,0.8l5.5,3.5l3.2,5.8l-0.8,5.2l-4.1,4.1l-6.5,1.2l-5.1,-2.8l-3.2,-5.5l-0.5,-6.8z' },
  { id: 'kepri', name: 'Kepulauan Riau', region: 'sumatera',
    path: 'M128.4,85.6l3.5,1.8l4.8,0.5l3.8,2.8l1.2,4.5l-1.8,3.8l-4.1,2.1l-4.5,-0.8l-3.2,-3.5l-0.8,-4.8l0.5,-4.2z' },
  { id: 'jambi', name: 'Jambi', region: 'sumatera',
    path: 'M98.2,115.8l2.5,3.2l5.1,2.8l4.5,4.5l1.8,5.8l-2.1,4.5l-5.2,2.1l-5.5,-1.5l-3.8,-4.2l-1.5,-5.8l1.2,-5.2z' },
  { id: 'sumsel', name: 'Sumatera Selatan', region: 'sumatera',
    path: 'M102.8,138.4l4.2,2.8l5.8,1.8l5.2,4.1l2.5,6.2l-1.2,5.5l-4.5,3.8l-6.2,0.5l-5.5,-3.2l-3.5,-5.8l-0.5,-6.5l2.1,-5.2z' },
  { id: 'bengkulu', name: 'Bengkulu', region: 'sumatera',
    path: 'M82.5,118.2l-2.1,4.8l-0.5,6.5l2.8,5.5l4.5,3.8l4.2,0.8l2.8,-3.5l0.5,-5.8l-2.5,-5.2l-4.8,-4.1z' },
  { id: 'babel', name: 'Bangka Belitung', region: 'sumatera',
    path: 'M135.8,132.5l4.2,1.2l4.5,3.5l2.1,5.2l-1.5,4.8l-4.8,2.5l-5.2,-0.8l-3.5,-4.2l-0.5,-5.5l2.2,-4.5z' },
  { id: 'lampung', name: 'Lampung', region: 'sumatera',
    path: 'M108.5,165.2l3.5,3.8l4.8,2.5l3.2,5.2l0.5,5.8l-3.2,4.5l-5.5,1.8l-5.2,-2.1l-3.8,-4.8l-1.2,-5.8l2.5,-5.2z' },

  // JAWA
  { id: 'banten', name: 'Banten', region: 'jawa',
    path: 'M148.5,185.2l3.2,2.5l5.5,1.8l4.2,3.8l1.5,4.8l-2.5,4.2l-5.2,1.5l-4.5,-2.1l-3.2,-4.5l-0.8,-5.2l1.2,-4.5z' },
  { id: 'jakarta', name: 'DKI Jakarta', region: 'jawa',
    path: 'M165.8,188.5l2.8,1.5l3.2,2.8l1.5,3.8l-1.2,3.5l-3.5,1.8l-3.2,-1.5l-2.1,-3.2l-0.5,-3.8l1.5,-3.2z' },
  { id: 'jabar', name: 'Jawa Barat', region: 'jawa',
    path: 'M162.5,198.2l4.5,2.1l6.8,1.2l5.5,3.5l4.2,5.5l1.2,5.8l-2.8,4.8l-5.8,2.5l-6.5,-0.5l-5.2,-3.8l-3.5,-5.5l-0.8,-6.2l1.2,-5.2z' },
  { id: 'jateng', name: 'Jawa Tengah', region: 'jawa',
    path: 'M185.2,205.8l5.2,1.8l7.5,0.5l6.2,3.2l5.5,5.2l2.1,6.5l-1.8,5.2l-5.5,3.8l-7.2,0.8l-6.5,-2.5l-4.8,-5.2l-2.5,-6.5l0.8,-5.8z' },
  { id: 'yogya', name: 'DI Yogyakarta', region: 'jawa',
    path: 'M202.5,228.5l2.8,1.5l3.8,2.5l1.8,4.2l-1.2,3.8l-3.5,2.1l-3.8,-1.2l-2.5,-3.5l-0.5,-4.2l1.5,-3.5z' },
  { id: 'jatim', name: 'Jawa Timur', region: 'jawa',
    path: 'M212.8,208.5l5.8,1.5l8.2,2.1l6.8,4.5l5.2,6.2l1.8,6.8l-2.5,5.5l-6.2,3.2l-7.8,0.5l-6.5,-3.2l-4.8,-5.8l-2.1,-6.8l0.5,-6.2z' },

  // KALIMANTAN
  { id: 'kalbar', name: 'Kalimantan Barat', region: 'kalimantan',
    path: 'M175.2,108.5l5.5,2.8l8.2,1.5l6.8,4.2l4.5,6.5l1.2,7.2l-2.1,6.5l-5.8,4.8l-7.5,1.8l-6.2,-2.5l-5.5,-5.8l-3.2,-7.2l0.5,-7.5l2.8,-6.5z' },
  { id: 'kalteng', name: 'Kalimantan Tengah', region: 'kalimantan',
    path: 'M195.5,145.2l6.2,2.1l8.5,1.8l7.2,4.8l5.2,6.8l1.5,7.5l-2.5,6.2l-6.5,4.2l-8.2,1.2l-7.2,-2.8l-5.5,-6.2l-2.8,-7.8l0.8,-7.2z' },
  { id: 'kalsel', name: 'Kalimantan Selatan', region: 'kalimantan',
    path: 'M218.5,178.2l5.5,2.5l6.8,3.8l4.2,5.5l1.5,6.2l-2.1,5.2l-5.5,3.5l-6.2,0.5l-5.2,-3.2l-3.5,-5.8l-1.2,-6.5l2.5,-5.8z' },
  { id: 'kaltim', name: 'Kalimantan Timur', region: 'kalimantan',
    path: 'M225.8,125.5l5.8,3.2l7.5,4.5l5.5,6.8l3.2,7.5l-0.5,6.8l-4.2,5.5l-6.8,3.2l-7.2,-0.8l-5.8,-4.5l-4.2,-6.8l-1.5,-7.5l2.2,-6.5z' },
  { id: 'kaltara', name: 'Kalimantan Utara', region: 'kalimantan',
    path: 'M235.2,95.8l4.8,2.8l6.2,4.2l4.5,5.8l2.1,6.5l-1.5,5.5l-5.2,4.2l-6.5,1.2l-5.5,-2.5l-4.2,-5.2l-2.1,-6.5l1.2,-5.8z' },

  // SULAWESI
  { id: 'sulut', name: 'Sulawesi Utara', region: 'sulawesi',
    path: 'M295.8,92.5l4.5,2.1l5.8,3.8l3.5,5.2l0.8,5.5l-2.5,4.8l-5.2,2.5l-5.5,-1.2l-4.2,-4.2l-2.1,-5.5l1.2,-5.2z' },
  { id: 'gorontalo', name: 'Gorontalo', region: 'sulawesi',
    path: 'M285.5,108.2l3.2,1.8l4.2,3.2l2.5,4.5l-0.5,4.2l-3.5,2.8l-4.5,0.5l-3.2,-2.8l-1.8,-4.2l0.5,-4.5z' },
  { id: 'sulteng', name: 'Sulawesi Tengah', region: 'sulawesi',
    path: 'M278.5,118.5l5.2,2.5l6.8,4.2l5.5,6.2l2.8,6.8l-1.2,5.8l-5.2,4.5l-7.2,1.5l-6.5,-2.8l-4.8,-5.8l-2.5,-7.2l1.5,-6.2z' },
  { id: 'sulbar', name: 'Sulawesi Barat', region: 'sulawesi',
    path: 'M268.2,148.5l3.5,2.2l4.8,3.8l2.8,5.2l0.5,5.5l-2.5,4.5l-5.2,2.2l-4.8,-1.5l-3.2,-4.5l-1.2,-5.5l1.8,-5.2z' },
  { id: 'sulsel', name: 'Sulawesi Selatan', region: 'sulawesi',
    path: 'M275.8,168.5l5.2,2.8l6.5,4.5l4.2,6.2l1.5,6.5l-2.2,5.5l-5.8,3.5l-6.5,0.5l-5.2,-3.5l-3.5,-6.2l-1.2,-6.8l2.5,-5.5z' },
  { id: 'sultra', name: 'Sulawesi Tenggara', region: 'sulawesi',
    path: 'M295.2,158.5l5.5,2.5l6.2,4.2l4.5,5.8l1.8,6.2l-1.5,5.5l-5.2,3.8l-6.5,0.8l-5.5,-3.2l-3.8,-5.8l-1.2,-6.5l2.2,-5.5z' },

  // BALI & NUSA TENGGARA
  { id: 'bali', name: 'Bali', region: 'bali-nusa',
    path: 'M248.5,225.2l3.2,1.8l4.2,2.8l2.5,4.2l0.5,4.5l-2.2,3.5l-4.5,1.8l-4.2,-1.5l-2.8,-3.8l-0.8,-4.5l1.5,-4.2z' },
  { id: 'ntb', name: 'Nusa Tenggara Barat', region: 'bali-nusa',
    path: 'M262.5,228.5l4.5,1.5l5.8,2.8l4.2,4.5l1.5,5.2l-1.8,4.5l-5.2,2.5l-5.5,-0.8l-4.2,-3.8l-2.1,-5.2l0.8,-5.5z' },
  { id: 'ntt', name: 'Nusa Tenggara Timur', region: 'bali-nusa',
    path: 'M282.5,232.8l6.2,1.8l8.5,2.5l6.8,4.2l4.5,5.5l1.2,5.8l-2.5,4.8l-6.8,2.5l-7.5,-0.5l-6.2,-3.8l-4.5,-5.8l-2.1,-6.2l1.2,-5.5z' },

  // MALUKU
  { id: 'malut', name: 'Maluku Utara', region: 'maluku',
    path: 'M328.5,98.2l4.8,2.5l5.5,4.2l3.5,5.5l1.2,5.8l-2.1,4.8l-5.5,2.5l-5.2,-1.2l-4.2,-4.2l-2.5,-5.5l0.8,-5.2z' },
  { id: 'maluku', name: 'Maluku', region: 'maluku',
    path: 'M338.5,128.5l5.8,2.8l6.5,4.5l4.2,6.2l1.5,6.8l-2.2,5.5l-6.2,3.5l-6.8,0.5l-5.5,-3.5l-3.8,-6.2l-1.2,-6.8l2.5,-5.8z' },

  // PAPUA
  { id: 'papuabarat', name: 'Papua Barat', region: 'papua',
    path: 'M368.5,118.5l6.5,2.8l8.2,4.5l5.8,6.5l2.5,7.2l-1.2,6.2l-5.5,4.8l-7.5,1.5l-6.8,-2.8l-5.2,-5.8l-2.8,-7.2l1.2,-6.5z' },
  { id: 'papua', name: 'Papua', region: 'papua',
    path: 'M395.5,125.8l8.5,3.5l12.2,5.2l9.5,7.8l6.2,9.5l2.5,10.2l-1.8,8.5l-6.5,6.8l-9.8,3.5l-10.5,-1.2l-8.5,-5.5l-6.2,-8.2l-3.5,-9.5l0.8,-9.2l3.2,-8.5z' },
  { id: 'papuaselatan', name: 'Papua Selatan', region: 'papua',
    path: 'M388.5,178.5l5.8,3.2l7.2,5.5l4.5,6.8l1.8,7.2l-2.5,5.5l-6.5,3.5l-7.2,0.5l-5.8,-3.8l-3.8,-6.5l-1.2,-7.2l2.5,-5.8z' },
  { id: 'papuatengah', name: 'Papua Tengah', region: 'papua',
    path: 'M405.5,165.8l6.2,3.5l7.5,5.8l4.2,7.2l1.2,7.5l-2.8,5.8l-6.8,3.2l-7.5,-0.5l-5.8,-4.5l-3.5,-7.2l-0.8,-7.5l3.2,-5.8z' },
  { id: 'papuapegunungan', name: 'Papua Pegunungan', region: 'papua',
    path: 'M398.2,148.5l5.5,2.8l6.8,4.8l4.2,6.2l1.5,6.5l-2.5,5.2l-6.2,3.2l-6.5,0.2l-5.2,-3.5l-3.5,-5.8l-1.2,-6.5l2.8,-5.2z' },
];

// Region colors - natural earth-toned map colors
const regionColors: Record<string, { base: string; hover: string; selected: string; dark: string }> = {
  'sumatera': { base: '#a8d5ba', hover: '#8fcea3', selected: '#5cb85c', dark: '#3d8b40' },
  'jawa': { base: '#f9d77e', hover: '#f7c94b', selected: '#f0ad4e', dark: '#c68c2e' },
  'kalimantan': { base: '#b8e0b8', hover: '#9bd69b', selected: '#5cb85c', dark: '#4a9c4a' },
  'sulawesi': { base: '#a3d4f7', hover: '#7bc4f4', selected: '#5bc0de', dark: '#31a2c7' },
  'bali-nusa': { base: '#e8b4d8', hover: '#de94c8', selected: '#d07cb8', dark: '#a85c94' },
  'maluku': { base: '#b8e8e8', hover: '#94dede', selected: '#5bc0de', dark: '#3da5a5' },
  'papua': { base: '#f5b8a8', hover: '#f19a85', selected: '#d9534f', dark: '#b94a47' },
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
