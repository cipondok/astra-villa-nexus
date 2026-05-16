import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export type HesitationSignal = 
  | 'long_dwell'        // > 30s on page without action
  | 'repeated_scroll'   // Scrolling up/down multiple times
  | 'back_navigation'   // Navigated back then returned
  | 'idle'              // No interaction for 15s+
  | 'low_balance'       // Wallet balance insufficient
  | 'price_shock';      // Viewing expensive property

interface HesitationState {
  isHesitating: boolean;
  signals: HesitationSignal[];
  dwellTime: number;
  idleTime: number;
}

/**
 * Detects user hesitation patterns to trigger contextual assistance.
 * Monitors: dwell time, idle periods, scroll behavior, navigation patterns.
 */
export const useHesitationDetector = () => {
  const location = useLocation();
  const [state, setState] = useState<HesitationState>({
    isHesitating: false,
    signals: [],
    dwellTime: 0,
    idleTime: 0,
  });

  const lastActivity = useRef(Date.now());
  const pageEntry = useRef(Date.now());
  const scrollDirectionChanges = useRef(0);
  const lastScrollY = useRef(0);
  const lastScrollDir = useRef<'up' | 'down' | null>(null);
  const prevPath = useRef(location.pathname);
  const backDetected = useRef(false);

  // Reset on navigation
  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      // Detect back navigation pattern
      if (window.history.length > 0) {
        backDetected.current = true;
      }
      prevPath.current = location.pathname;
      pageEntry.current = Date.now();
      lastActivity.current = Date.now();
      scrollDirectionChanges.current = 0;
      setState({ isHesitating: false, signals: [], dwellTime: 0, idleTime: 0 });
    }
  }, [location.pathname]);

  // Monitor idle + dwell
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const dwell = now - pageEntry.current;
      const idle = now - lastActivity.current;
      const signals: HesitationSignal[] = [];

      if (dwell > 30_000) signals.push('long_dwell');
      if (idle > 15_000) signals.push('idle');
      if (scrollDirectionChanges.current > 4) signals.push('repeated_scroll');
      if (backDetected.current) signals.push('back_navigation');

      setState({
        isHesitating: signals.length >= 1,
        signals,
        dwellTime: dwell,
        idleTime: idle,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Track scroll direction changes
  useEffect(() => {
    const handleScroll = () => {
      lastActivity.current = Date.now();
      const y = window.scrollY;
      const dir = y > lastScrollY.current ? 'down' : 'up';
      if (lastScrollDir.current && dir !== lastScrollDir.current) {
        scrollDirectionChanges.current++;
      }
      lastScrollDir.current = dir;
      lastScrollY.current = y;
    };

    const handleActivity = () => {
      lastActivity.current = Date.now();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  const addSignal = useCallback((signal: HesitationSignal) => {
    setState((prev) => {
      if (prev.signals.includes(signal)) return prev;
      const newSignals = [...prev.signals, signal];
      return { ...prev, signals: newSignals, isHesitating: true };
    });
  }, []);

  const dismiss = useCallback(() => {
    setState((prev) => ({ ...prev, isHesitating: false, signals: [] }));
    scrollDirectionChanges.current = 0;
    backDetected.current = false;
  }, []);

  return { ...state, addSignal, dismiss };
};

export default useHesitationDetector;
