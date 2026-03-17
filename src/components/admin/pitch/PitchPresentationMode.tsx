import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, X, Sun, Moon, MessageSquare,
  Maximize2, Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PresentationSlide {
  slideNumber: number;
  title: string;
  subtitle: string;
  emoji: string;
  speakerNotes: string;
  sectionDivider?: boolean;
  sectionLabel?: string;
  content: React.ReactNode;
}

interface PitchPresentationModeProps {
  slides: PresentationSlide[];
  onExit: () => void;
}

const SLIDE_W = 1920;
const SLIDE_H = 1080;

const slideVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 120 : -120,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -120 : 120,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const PitchPresentationMode: React.FC<PitchPresentationModeProps> = ({ slides, onExit }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [darkTheme, setDarkTheme] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [scale, setScale] = useState(1);

  // Compute scale to fit viewport
  const updateScale = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setScale(Math.min(vw / SLIDE_W, vh / SLIDE_H) * 0.92);
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  // Fullscreen API
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setDirection(1);
        setCurrent((c) => Math.min(c + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setDirection(-1);
        setCurrent((c) => Math.max(c - 1, 0));
      } else if (e.key === 'Escape') {
        onExit();
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes((v) => !v);
      } else if (e.key === 't' || e.key === 'T') {
        setDarkTheme((v) => !v);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [slides.length, onExit, toggleFullscreen]);

  const slide = slides[current];
  const progress = ((current + 1) / slides.length) * 100;

  const bg = darkTheme ? 'bg-[hsl(220,20%,8%)]' : 'bg-[hsl(0,0%,96%)]';
  const fg = darkTheme ? 'text-[hsl(0,0%,95%)]' : 'text-[hsl(220,15%,15%)]';
  const muted = darkTheme ? 'text-[hsl(0,0%,60%)]' : 'text-[hsl(0,0%,45%)]';
  const cardBg = darkTheme ? 'bg-[hsl(220,18%,12%)]' : 'bg-[hsl(0,0%,100%)]';
  const borderClr = darkTheme ? 'border-[hsl(220,15%,20%)]' : 'border-[hsl(0,0%,85%)]';

  return (
    <div className={cn('fixed inset-0 z-[9999] flex flex-col select-none', bg, fg)}
         style={{ cursor: 'none' }}
         onMouseMove={(e) => {
           (e.currentTarget as HTMLDivElement).style.cursor = 'default';
           clearTimeout((window as any).__pitchCursorTimer);
           (window as any).__pitchCursorTimer = setTimeout(() => {
             (e.currentTarget as HTMLDivElement).style.cursor = 'none';
           }, 3000);
         }}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-chart-1 to-chart-4"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Top controls — fade in on hover */}
      <div className="absolute top-3 right-4 z-50 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity duration-300"
           style={{ pointerEvents: 'auto' }}>
        <button onClick={() => setShowNotes((v) => !v)} className={cn('p-2 rounded-lg transition-colors', darkTheme ? 'hover:bg-white/10' : 'hover:bg-black/10')}>
          <MessageSquare className="h-4 w-4" />
        </button>
        <button onClick={() => setDarkTheme((v) => !v)} className={cn('p-2 rounded-lg transition-colors', darkTheme ? 'hover:bg-white/10' : 'hover:bg-black/10')}>
          {darkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button onClick={toggleFullscreen} className={cn('p-2 rounded-lg transition-colors', darkTheme ? 'hover:bg-white/10' : 'hover:bg-black/10')}>
          {document.fullscreenElement ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
        <button onClick={onExit} className={cn('p-2 rounded-lg transition-colors', darkTheme ? 'hover:bg-white/10 text-red-400' : 'hover:bg-black/10 text-red-500')}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Slide canvas */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute"
            style={{
              width: SLIDE_W,
              height: SLIDE_H,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
            <div className={cn('w-full h-full rounded-2xl border overflow-hidden flex flex-col', cardBg, borderClr)}>
              {/* Slide header */}
              {slide.sectionDivider ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                  <span className={cn('text-2xl font-medium uppercase tracking-[0.3em]', muted)}>
                    {slide.sectionLabel}
                  </span>
                  <h1 className="text-[80px] font-bold leading-tight text-center px-20">
                    {slide.emoji} {slide.title}
                  </h1>
                  <p className={cn('text-3xl', muted)}>{slide.subtitle}</p>
                </div>
              ) : (
                <>
                  <div className="px-20 pt-16 pb-6">
                    <span className={cn('text-lg font-mono tracking-wider', muted)}>
                      {String(slide.slideNumber).padStart(2, '0')}
                    </span>
                    <h1 className="text-[56px] font-bold leading-tight mt-2">
                      {slide.emoji} {slide.title}
                    </h1>
                    <p className={cn('text-2xl mt-2', muted)}>{slide.subtitle}</p>
                  </div>
                  <div className="flex-1 px-20 pb-16 overflow-hidden">
                    {slide.content}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        <button
          onClick={() => { setDirection(-1); setCurrent((c) => Math.max(c - 1, 0)); }}
          disabled={current === 0}
          className={cn('absolute left-4 p-3 rounded-full transition-all disabled:opacity-0',
            darkTheme ? 'hover:bg-white/10' : 'hover:bg-black/10'
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => { setDirection(1); setCurrent((c) => Math.min(c + 1, slides.length - 1)); }}
          disabled={current === slides.length - 1}
          className={cn('absolute right-4 p-3 rounded-full transition-all disabled:opacity-0',
            darkTheme ? 'hover:bg-white/10' : 'hover:bg-black/10'
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom bar */}
      <div className={cn('flex items-center justify-between px-6 py-3 text-sm', muted)}>
        <span className="font-mono">{current + 1} / {slides.length}</span>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === current
                  ? 'w-6 bg-primary'
                  : i < current
                  ? 'w-1.5 bg-primary/40'
                  : cn('w-1.5', darkTheme ? 'bg-white/20' : 'bg-black/20')
              )}
            />
          ))}
        </div>
        <span className="font-mono text-xs">
          ESC exit · ← → navigate · N notes · T theme · F fullscreen
        </span>
      </div>

      {/* Speaker notes drawer */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'absolute bottom-0 left-0 right-0 border-t p-6 max-h-[30vh] overflow-auto',
              darkTheme ? 'bg-[hsl(220,18%,10%)] border-[hsl(220,15%,20%)]' : 'bg-white border-gray-200'
            )}
          >
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Speaker Notes
            </h3>
            <p className={cn('text-base leading-relaxed italic', muted)}>
              {slide.speakerNotes}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(PitchPresentationMode);
