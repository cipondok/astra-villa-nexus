import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

// ── Demo Scene Definitions ──

export interface DemoScene {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

export const DEMO_SCENES: DemoScene[] = [
  { id: 'opportunity', title: 'AI Finds Elite Opportunity', description: 'AI discovers undervalued property with 92/100 score in emerging zone', emoji: '💎' },
  { id: 'heatmap', title: 'Market Heat Surge', description: 'Demand cluster detected in South Jakarta — heat score jumps to 89', emoji: '🔥' },
  { id: 'prediction', title: 'Price Prediction Update', description: 'AI forecasts 18.5% appreciation in Bali luxury segment over 12 months', emoji: '📈' },
  { id: 'portfolio', title: 'Portfolio Value Growth', description: 'Investor portfolio projected ROI increases from 12% to 17.3%', emoji: '💰' },
  { id: 'advisor', title: 'AI Strategic Buy Signal', description: 'AI Advisor recommends strategic acquisition — confidence 94%', emoji: '🤖' },
];

// ── Signal Types ──

export interface DemoSignal {
  id: string;
  type: 'opportunity' | 'heat' | 'prediction' | 'portfolio' | 'alert';
  title: string;
  message: string;
  emoji: string;
  timestamp: Date;
}

// ── Context Shape ──

interface DemoModeState {
  isActive: boolean;
  currentScene: number;
  signals: DemoSignal[];
  isFullscreen: boolean;
}

interface DemoModeContextValue extends DemoModeState {
  startDemo: () => void;
  stopDemo: () => void;
  nextScene: () => void;
  prevScene: () => void;
  goToScene: (index: number) => void;
  resetDemo: () => void;
  toggleFullscreen: () => void;
}

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

// ── Simulated signal generator ──

const SIMULATED_SIGNALS: Omit<DemoSignal, 'id' | 'timestamp'>[] = [
  { type: 'opportunity', title: 'New Elite Deal', message: 'Villa in Canggu — Score 94/100, 23% below market', emoji: '💎' },
  { type: 'heat', title: 'Heat Surge Detected', message: 'South Jakarta cluster demand +340% this week', emoji: '🔥' },
  { type: 'prediction', title: 'Price Forecast Update', message: 'Bali luxury segment: +18.5% projected 12-month growth', emoji: '📈' },
  { type: 'alert', title: 'Deal Alert', message: 'Undervalued townhouse detected — Rp 2.1B vs Rp 2.8B market', emoji: '⚡' },
  { type: 'portfolio', title: 'Portfolio Update', message: 'Your portfolio projected IRR increased to 17.3%', emoji: '💰' },
  { type: 'opportunity', title: 'AI Match Found', message: 'New property matches your investment DNA — 96% fit', emoji: '🎯' },
  { type: 'heat', title: 'Emerging Zone Alert', message: 'Tangerang Selatan showing early growth signals', emoji: '🌡️' },
  { type: 'prediction', title: 'Risk Signal', message: 'Market cycle shifting to Peak phase in BSD City', emoji: '⚠️' },
];

// ── Provider ──

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoModeState>({
    isActive: false,
    currentScene: 0,
    signals: [],
    isFullscreen: false,
  });

  const signalTimerRef = useRef<ReturnType<typeof setInterval>>();
  const signalIndexRef = useRef(0);

  const fireSignal = useCallback(() => {
    const template = SIMULATED_SIGNALS[signalIndexRef.current % SIMULATED_SIGNALS.length];
    signalIndexRef.current++;

    const signal: DemoSignal = {
      ...template,
      id: `demo-${Date.now()}-${signalIndexRef.current}`,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      signals: [signal, ...prev.signals].slice(0, 20),
    }));

    // Show toast notification
    toast(
      `${signal.emoji} ${signal.title}`,
      {
        description: signal.message,
        duration: 4000,
        className: 'demo-signal-toast',
      }
    );
  }, []);

  const startDemo = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: true, currentScene: 0, signals: [] }));
    signalIndexRef.current = 0;

    // Fire first signal after 3s, then every 8s
    signalTimerRef.current = setInterval(fireSignal, 8000);
    setTimeout(fireSignal, 3000);

    toast('🎬 Demo Mode Activated', {
      description: 'Platform is now in presentation simulation mode',
      duration: 3000,
    });
  }, [fireSignal]);

  const stopDemo = useCallback(() => {
    if (signalTimerRef.current) clearInterval(signalTimerRef.current);
    setState({ isActive: false, currentScene: 0, signals: [], isFullscreen: false });

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }

    toast('Demo Mode Deactivated', {
      description: 'Restored to live data mode',
      duration: 2000,
    });
  }, []);

  const nextScene = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentScene: Math.min(prev.currentScene + 1, DEMO_SCENES.length - 1),
    }));
    // Fire a contextual signal on scene change
    fireSignal();
  }, [fireSignal]);

  const prevScene = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentScene: Math.max(prev.currentScene - 1, 0),
    }));
  }, []);

  const goToScene = useCallback((index: number) => {
    setState((prev) => ({ ...prev, currentScene: index }));
  }, []);

  const resetDemo = useCallback(() => {
    if (signalTimerRef.current) clearInterval(signalTimerRef.current);
    signalIndexRef.current = 0;
    setState((prev) => ({ ...prev, currentScene: 0, signals: [] }));

    toast('🔄 Demo Reset', { description: 'Simulation state cleared', duration: 2000 });
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setState((prev) => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen?.();
      setState((prev) => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (signalTimerRef.current) clearInterval(signalTimerRef.current);
    };
  }, []);

  return (
    <DemoModeContext.Provider
      value={{
        ...state,
        startDemo,
        stopDemo,
        nextScene,
        prevScene,
        goToScene,
        resetDemo,
        toggleFullscreen,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) {
    // Return a safe no-op when outside provider
    return {
      isActive: false,
      currentScene: 0,
      signals: [] as DemoSignal[],
      isFullscreen: false,
      startDemo: () => {},
      stopDemo: () => {},
      nextScene: () => {},
      prevScene: () => {},
      goToScene: () => {},
      resetDemo: () => {},
      toggleFullscreen: () => {},
    } as DemoModeContextValue;
  }
  return ctx;
}
