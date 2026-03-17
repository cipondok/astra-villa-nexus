import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Square, SkipForward, SkipBack, RotateCcw,
  Maximize2, Minimize2, ChevronUp, ChevronDown, Radio,
  Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDemoMode, DEMO_SCENES } from '@/contexts/DemoModeContext';

const DemoModeController: React.FC = () => {
  const {
    isActive, currentScene, signals, isFullscreen,
    stopDemo, nextScene, prevScene, goToScene, resetDemo, toggleFullscreen,
  } = useDemoMode();
  const [collapsed, setCollapsed] = useState(false);
  const [showSignals, setShowSignals] = useState(false);

  if (!isActive) return null;

  const scene = DEMO_SCENES[currentScene];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2 z-[9990]',
          'w-[95vw] max-w-lg',
        )}
      >
        {/* Signal feed popup */}
        <AnimatePresence>
          {showSignals && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-2 p-3 rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl shadow-xl max-h-48 overflow-auto"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Live Signal Feed</span>
                <Badge variant="outline" className="text-[8px] h-4 px-1.5 animate-pulse">
                  <Radio className="h-2 w-2 mr-0.5 text-chart-1" /> LIVE
                </Badge>
              </div>
              {signals.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-3">Waiting for signals...</p>
              ) : (
                <div className="space-y-1">
                  {signals.slice(0, 8).map((sig) => (
                    <div key={sig.id} className="flex items-start gap-2 p-1.5 rounded-lg bg-muted/30 animate-fade-in">
                      <span className="text-sm shrink-0">{sig.emoji}</span>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-foreground block truncate">{sig.title}</span>
                        <span className="text-[8px] text-muted-foreground block truncate">{sig.message}</span>
                      </div>
                      <span className="text-[7px] text-muted-foreground shrink-0 ml-auto">
                        {sig.timestamp.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main controller bar */}
        <div className="rounded-2xl border border-primary/30 bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Demo mode indicator strip */}
          <div className="h-1 bg-gradient-to-r from-primary via-chart-1 to-chart-4 animate-pulse" />

          <div className="p-3">
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-1 animate-pulse" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Demo Mode Active</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowSignals(!showSignals)} className="p-1 rounded-md hover:bg-muted/50 transition-colors">
                  {showSignals ? <EyeOff className="h-3 w-3 text-muted-foreground" /> : <Eye className="h-3 w-3 text-muted-foreground" />}
                </button>
                <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-md hover:bg-muted/50 transition-colors">
                  {collapsed ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {/* Current scene */}
                  <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">
                        Scene {currentScene + 1} of {DEMO_SCENES.length}
                      </span>
                      <Badge variant="outline" className="text-[8px] h-4 px-1.5 text-primary border-primary/30">
                        {scene.emoji} Active
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-foreground">{scene.title}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{scene.description}</p>
                  </div>

                  {/* Scene dots */}
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    {DEMO_SCENES.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => goToScene(i)}
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-300',
                          i === currentScene ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50',
                        )}
                        title={s.title}
                      />
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Button size="icon-sm" variant="outline" onClick={prevScene} disabled={currentScene === 0}>
                        <SkipBack className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="cta" onClick={nextScene} disabled={currentScene === DEMO_SCENES.length - 1} className="gap-1 text-[10px]">
                        Next Step <SkipForward className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button size="icon-sm" variant="outline" onClick={toggleFullscreen} title="Toggle fullscreen">
                        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="icon-sm" variant="outline" onClick={resetDemo} title="Reset demo">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon-sm" variant="destructive" onClick={stopDemo} title="Stop demo">
                        <Square className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(DemoModeController);
