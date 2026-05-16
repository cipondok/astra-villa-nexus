import { useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrackableEvent {
  event_type: string;
  property_id?: string;
  city?: string;
  metadata?: Record<string, any>;
  value?: number;
}

const SESSION_KEY = "astra_session_id";

function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

const FLUSH_INTERVAL = 5000; // 5 seconds
const MAX_BATCH = 30;

/**
 * Behavioral event tracking hook.
 * Batches events client-side and flushes to track-behavior edge function.
 */
export function useTrackEvent() {
  const buffer = useRef<TrackableEvent[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    if (buffer.current.length === 0) return;

    const events = buffer.current.splice(0, MAX_BATCH);
    const sessionId = getSessionId();

    try {
      await supabase.functions.invoke("track-behavior", {
        body: { events, session_id: sessionId },
      });
    } catch (err) {
      console.warn("Event tracking flush failed:", err);
      // Re-queue failed events (max 1 retry)
      buffer.current.unshift(...events.slice(0, 10));
    }
  }, []);

  // Auto-flush on interval
  useEffect(() => {
    timerRef.current = setInterval(flush, FLUSH_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      flush(); // flush remaining on unmount
    };
  }, [flush]);

  const trackEvent = useCallback((event_type: string, payload?: Omit<TrackableEvent, "event_type">) => {
    buffer.current.push({ event_type, ...payload });

    // Immediate flush if buffer full
    if (buffer.current.length >= MAX_BATCH) {
      flush();
    }
  }, [flush]);

  return { trackEvent };
}