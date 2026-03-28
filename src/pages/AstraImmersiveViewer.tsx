import React, { useState, Suspense, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2, Minimize2, RotateCcw, Play, Pause, Eye, MapPin,
  DollarSign, TrendingUp, Bed, Bath, Ruler, Star, Shield, ChevronRight,
  Sparkles, Building2, PanelLeftClose, PanelRightClose, Sun, Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PropertyScene } from '@/components/3d/PropertyScene';
import AIPanelContent from '@/components/3d/AIPanelContent';

// ── Property data ──
const PROPERTY = {
  name: 'Villa Serenity',
  location: 'Canggu, Bali',
  type: 'Luxury Villa',
  price: 'Rp 12.5B',
  priceUsd: '$780K',
  sqm: 450,
  bedrooms: 4,
  bathrooms: 5,
  landArea: 800,
  yearBuilt: 2023,
  investmentScore: 92,
  rentalYield: 8.4,
  appreciation: 14.2,
  occupancy: 87,
  description: 'A stunning contemporary villa with infinity pool overlooking rice paddies. Open-plan living, imported Italian marble, and smart home integration throughout.',
  features: ['Infinity Pool', 'Smart Home', 'Italian Marble', 'Private Garden', 'Solar Panels', 'EV Charging'],
};

// ── Glassmorphism Card ──
function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-[20px] border border-[hsl(var(--border))]/10',
      'bg-[#0B0B0B]/70 backdrop-blur-xl shadow-2xl',
      className
    )}>
      {children}
    </div>
  );
}

// ── Stat Row ──
function StatRow({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-3.5 w-3.5', accent ? 'text-[#C8A96A]' : 'text-muted-foreground')} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={cn('text-xs font-semibold', accent ? 'text-[#C8A96A]' : 'text-foreground')}>{value}</span>
    </div>
  );
}

// ── 3D Viewer Loading ──
function ViewerLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0B0B]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2 border-[#C8A96A]/20 border-t-[#C8A96A]"
      />
      <p className="text-xs text-[#C8A96A]/60 mt-3 font-mono tracking-wider">LOADING 3D MODEL</p>
    </div>
  );
}

// ── Main Page ──
export default function AstraImmersiveViewer() {
  const [autoRotate, setAutoRotate] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [isNight, setIsNight] = useState(false);

  const handleHotspotClick = (label: string) => {
    setActiveHotspot(label);
    setShowRight(true);
  };

  return (
    <div className={cn(
      "h-screen w-full bg-[#0B0B0B] text-foreground overflow-hidden relative",
      fullscreen ? "flex" : "grid grid-cols-12"
    )}>
      {/* ── Left Panel: Property Info (3 cols) ── */}
      <AnimatePresence>
        {showLeft && !fullscreen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="col-span-3 border-r border-[hsl(var(--border))]/8 flex flex-col overflow-y-auto z-10"
            style={{ background: 'linear-gradient(180deg, rgba(11,11,11,0.95) 0%, rgba(15,15,15,0.98) 100%)' }}
          >
            {/* Header */}
            <div className="px-5 pt-6 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C8A96A] to-[#C8A96A]/40 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-[#0B0B0B]" />
                </div>
                <span className="text-xs font-bold tracking-[0.2em] text-[#C8A96A]">ASTRA VILLA</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">{PROPERTY.name}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="h-3 w-3 text-[#C8A96A]" />
                <span className="text-xs text-muted-foreground">{PROPERTY.location}</span>
              </div>
            </div>

            {/* Price */}
            <div className="px-5 pb-4">
              <GlassCard className="p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Price</p>
                    <p className="text-2xl font-bold text-[#C8A96A] mt-1">{PROPERTY.price}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">≈ {PROPERTY.priceUsd}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10">
                    <Star className="h-3 w-3 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">{PROPERTY.investmentScore}</span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Key Stats */}
            <div className="px-5 pb-4">
              <GlassCard className="p-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Property Details</h3>
                <StatRow icon={Ruler} label="Living Area" value={`${PROPERTY.sqm} m²`} />
                <StatRow icon={Bed} label="Bedrooms" value={String(PROPERTY.bedrooms)} />
                <StatRow icon={Bath} label="Bathrooms" value={String(PROPERTY.bathrooms)} />
                <StatRow icon={Ruler} label="Land Area" value={`${PROPERTY.landArea} m²`} />
                <StatRow icon={Building2} label="Year Built" value={String(PROPERTY.yearBuilt)} />
              </GlassCard>
            </div>

            {/* Investment Metrics */}
            <div className="px-5 pb-4">
              <GlassCard className="p-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Investment Intelligence</h3>
                <StatRow icon={TrendingUp} label="Rental Yield" value={`${PROPERTY.rentalYield}%`} accent />
                <StatRow icon={DollarSign} label="Appreciation" value={`${PROPERTY.appreciation}%`} accent />
                <StatRow icon={Eye} label="Occupancy Rate" value={`${PROPERTY.occupancy}%`} accent />
              </GlassCard>
            </div>

            {/* Description */}
            <div className="px-5 pb-4">
              <GlassCard className="p-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{PROPERTY.description}</p>
              </GlassCard>
            </div>

            {/* Features */}
            <div className="px-5 pb-6">
              <GlassCard className="p-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Features</h3>
                <div className="flex flex-wrap gap-1.5">
                  {PROPERTY.features.map(f => (
                    <span key={f} className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[#C8A96A]/8 text-[#C8A96A] border border-[#C8A96A]/15">
                      {f}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* CTAs */}
            <div className="px-5 pb-6 mt-auto space-y-2">
              <button className="w-full h-12 rounded-xl bg-gradient-to-r from-[#C8A96A] to-[#B8955A] text-[#0B0B0B] text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#C8A96A]/20 transition-all">
                <DollarSign className="h-4 w-4" /> Invest Now
              </button>
              <button className="w-full h-10 rounded-xl border border-[#C8A96A]/20 text-[#C8A96A] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#C8A96A]/5 transition-all">
                <Shield className="h-3.5 w-3.5" /> Schedule Private Viewing
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Center: 3D Viewer ── */}
      <div className="flex-1 relative">
        <Suspense fallback={<ViewerLoader />}>
          <Canvas
            camera={{ position: [10, 6, 10], fov: 45, near: 0.1, far: 100 }}
            shadows
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            style={{ background: '#0B0B0B' }}
          >
            <color attach="background" args={['#0B0B0B']} />
            <fog attach="fog" args={['#0B0B0B', 20, 40]} />
            <PropertyScene onHotspotClick={handleHotspotClick} autoRotate={autoRotate} isNight={isNight} />
          </Canvas>
        </Suspense>

        {/* Hotspot notification */}
        <AnimatePresence>
          {activeHotspot && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-5 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl bg-[#0B0B0B]/80 backdrop-blur-xl border border-[#C8A96A]/30 z-20"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#C8A96A]" />
                <span className="text-xs font-semibold text-[#C8A96A]">{activeHotspot}</span>
                <button onClick={() => setActiveHotspot(null)} className="ml-2 text-muted-foreground hover:text-foreground text-xs">✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          <GlassCard className="flex items-center gap-1 p-1.5">
            <button
              onClick={() => setIsNight(!isNight)}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                isNight ? 'bg-[#C8A96A]/20 text-[#C8A96A]' : 'text-muted-foreground hover:text-foreground'
              )}
              title={isNight ? 'Switch to Day' : 'Switch to Night'}
            >
              {isNight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <div className="w-px h-5 bg-[hsl(var(--border))]/10 mx-0.5" />
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                autoRotate ? 'bg-[#C8A96A]/20 text-[#C8A96A]' : 'text-muted-foreground hover:text-foreground'
              )}
              title={autoRotate ? 'Pause rotation' : 'Auto rotate'}
            >
              {autoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setAutoRotate(false)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Reset view"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </GlassCard>
        </div>

        {/* Panel toggles */}
        {!fullscreen && (
          <>
            <button
              onClick={() => setShowLeft(!showLeft)}
              className="absolute top-4 left-4 w-8 h-8 rounded-xl bg-[#0B0B0B]/60 backdrop-blur-sm border border-[hsl(var(--border))]/10 flex items-center justify-center text-muted-foreground hover:text-foreground z-20"
            >
              <PanelLeftClose className={cn('h-4 w-4 transition-transform', !showLeft && 'rotate-180')} />
            </button>
            <button
              onClick={() => setShowRight(!showRight)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-[#0B0B0B]/60 backdrop-blur-sm border border-[hsl(var(--border))]/10 flex items-center justify-center text-muted-foreground hover:text-foreground z-20"
            >
              <PanelRightClose className={cn('h-4 w-4 transition-transform', !showRight && 'rotate-180')} />
            </button>
          </>
        )}
      </div>

      {/* ── Right Panel: AI Assistant ── */}
      <AnimatePresence>
        {showRight && !fullscreen && (
          <motion.aside
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-[320px] min-w-[320px] border-l border-[hsl(var(--border))]/8 flex flex-col z-10"
            style={{ background: 'linear-gradient(180deg, rgba(11,11,11,0.95) 0%, rgba(15,15,15,0.98) 100%)' }}
          >
            <AIPanelContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
