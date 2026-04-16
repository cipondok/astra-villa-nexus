import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Session ID persists across navigations but resets on tab close
const getSessionId = (() => {
  let id: string | null = null;
  return () => {
    if (!id) {
      id = sessionStorage.getItem('astra_conv_session');
      if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem('astra_conv_session', id);
      }
    }
    return id;
  };
})();

export type ConversionEventType =
  | 'page_view'
  | 'click'
  | 'cta_click'
  | 'hesitation'
  | 'rage_click'
  | 'flow_start'
  | 'flow_complete'
  | 'flow_abandon'
  | 'scroll_depth';

interface ConversionEvent {
  eventType: ConversionEventType;
  elementId?: string;
  flowName?: string;
  flowStep?: number;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

// Batching
const queue: ConversionEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let currentPath = '/';
let currentUserId: string | null = null;

const flushQueue = async () => {
  if (queue.length === 0) return;
  const batch = queue.splice(0, queue.length);
  const sessionId = getSessionId();
  try {
    const rows = batch.map((e) => ({
      session_id: sessionId,
      user_id: currentUserId || null,
      event_type: e.eventType,
      page_path: currentPath,
      element_id: e.elementId || null,
      flow_name: e.flowName || null,
      flow_step: e.flowStep ?? null,
      duration_ms: e.durationMs ?? null,
      metadata: e.metadata || {},
    }));
    await supabase.from('behavior_events' as any).insert(rows);
  } catch {
    // Silent — analytics should never break UX
  }
};

const scheduleFlush = () => {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushQueue();
  }, 3000);
};

/**
 * Conversion-focused behavior tracking hook.
 * Separate from useBehaviorTracking (AI match engine).
 * Tracks conversion funnel events, hesitation, rage clicks, and CTA performance.
 * Events are batched and flushed to behavior_events table every 3 seconds.
 */
export const useConversionTracking = (flowName?: string) => {
  const location = useLocation();
  const { user } = useAuth();
  const pageEntryTime = useRef(Date.now());
  const clickTimestamps = useRef<number[]>([]);

  useEffect(() => {
    currentPath = location.pathname;
    currentUserId = user?.id || null;
  }, [location.pathname, user?.id]);

  // Page view on navigation
  useEffect(() => {
    pageEntryTime.current = Date.now();
    queue.push({ eventType: 'page_view', flowName });
    scheduleFlush();

    return () => {
      const duration = Date.now() - pageEntryTime.current;
      if (duration > 30_000) {
        queue.push({ eventType: 'hesitation', flowName, durationMs: duration });
        scheduleFlush();
      }
    };
  }, [location.pathname, flowName]);

  // Flush on unload
  useEffect(() => {
    const handleUnload = () => {
      if (flowName) queue.push({ eventType: 'flow_abandon', flowName });
      flushQueue();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [flowName]);

  const trackEvent = useCallback((params: ConversionEvent) => {
    queue.push({ ...params, flowName: params.flowName || flowName });
    scheduleFlush();
  }, [flowName]);

  const trackClick = useCallback((elementId: string, metadata?: Record<string, unknown>) => {
    const now = Date.now();
    clickTimestamps.current.push(now);
    const recent = clickTimestamps.current.filter((t) => now - t < 1500);
    clickTimestamps.current = recent;

    queue.push({
      eventType: recent.length >= 3 ? 'rage_click' : 'click',
      elementId,
      flowName,
      metadata: recent.length >= 3 ? { clickCount: recent.length, ...metadata } : metadata,
    });
    scheduleFlush();
  }, [flowName]);

  const trackCTA = useCallback((ctaId: string, metadata?: Record<string, unknown>) => {
    queue.push({ eventType: 'cta_click', elementId: ctaId, flowName, metadata });
    scheduleFlush();
  }, [flowName]);

  const trackFlowStep = useCallback((step: number, metadata?: Record<string, unknown>) => {
    queue.push({
      eventType: step === 0 ? 'flow_start' : 'click',
      flowName,
      flowStep: step,
      metadata,
    });
    scheduleFlush();
  }, [flowName]);

  const trackFlowComplete = useCallback((metadata?: Record<string, unknown>) => {
    queue.push({ eventType: 'flow_complete', flowName, metadata });
    scheduleFlush();
  }, [flowName]);

  return { trackEvent, trackClick, trackCTA, trackFlowStep, trackFlowComplete, sessionId: getSessionId() };
};

export default useConversionTracking;
