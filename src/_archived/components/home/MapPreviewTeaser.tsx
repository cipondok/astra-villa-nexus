import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { MapPin, Flame, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const hotspots = [
  { name: 'Jakarta Selatan', growth: '+12%', type: 'hotspot' as const },
  { name: 'Bali — Ubud', growth: '+18%', type: 'hotspot' as const },
  { name: 'Bandung', growth: '+9%', type: 'rising' as const },
  { name: 'Surabaya', growth: '+7%', type: 'rising' as const },
  { name: 'Yogyakarta', growth: '+14%', type: 'hotspot' as const },
  { name: 'Tangerang Selatan', growth: '+6%', type: 'rising' as const },
];

const dotPositions = [
  { top: '30%', left: '55%', city: 'Jakarta Selatan' },
  { top: '45%', left: '35%', city: 'Bali — Ubud' },
  { top: '60%', left: '65%', city: 'Bandung' },
  { top: '25%', left: '70%', city: 'Surabaya' },
  { top: '70%', left: '45%', city: 'Yogyakarta' },
];

export default function MapPreviewTeaser() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="w-full py-3 sm:py-4" id="hotspots">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm"
          role="region"
          aria-label="Property investment hotspots map"
        >
          <div className="flex flex-col sm:flex-row">
            {/* Left — visual map placeholder with gradient */}
            <div className="relative w-full sm:w-1/2 min-h-[180px] sm:min-h-[240px] bg-gradient-to-br from-primary/5 via-chart-4/5 to-primary/10 overflow-hidden" aria-hidden="true">
              {/* Grid dots */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              {/* Radar sweep */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-40 h-40 rounded-full border border-primary/10"
                  animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute w-28 h-28 rounded-full border border-gold-primary/15"
                  animate={{ scale: [1, 1.6], opacity: [0.25, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeOut', delay: 0.8 }}
                />
                <motion.div
                  className="absolute w-16 h-16 rounded-full border border-chart-4/20"
                  animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeOut', delay: 1.5 }}
                />
                {/* Center radar icon */}
                <div className="absolute p-3 rounded-full bg-background/50 backdrop-blur-sm border border-primary/15">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              </div>
              {/* Pulsing hotspot dots */}
              <TooltipProvider delayDuration={200}>
                {dotPositions.map((pos, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{ top: pos.top, left: pos.left }}
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="relative flex h-3 w-3 cursor-pointer">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-primary opacity-40" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-gold-primary shadow-lg shadow-gold-primary/30" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs font-medium">
                        {pos.city}
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                ))}
              </TooltipProvider>
            </div>

            {/* Right — hotspot list */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4 text-gold-primary" aria-hidden="true" />
                  <h3 className="font-playfair text-base sm:text-lg font-bold text-foreground">
                    Property Hotspots
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  AI-detected high-growth areas across Indonesia
                </p>
                <div className="grid grid-cols-1 gap-2" role="list">
                  {hotspots.map((h, i) => (
                    <motion.div
                      key={h.name}
                      initial={{ opacity: 0, x: 16 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.4 + i * 0.08, duration: 0.35 }}
                      className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30 border border-border/20"
                      role="listitem"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${h.type === 'hotspot' ? 'bg-gold-primary' : 'bg-chart-4'}`} aria-hidden="true" />
                        <span className="text-xs font-medium text-foreground">{h.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-chart-4">
                        <TrendingUp className="h-3 w-3" aria-hidden="true" />
                        {h.growth}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => navigate('/investment-map-explorer')}
                className="mt-4 w-full sm:w-auto h-10 text-xs font-semibold gap-1.5"
              >
                Explore Full Map
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
