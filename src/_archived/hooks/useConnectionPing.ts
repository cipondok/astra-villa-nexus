import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Measures round-trip latency to Supabase every `intervalMs`.
 * Returns the latest ping in milliseconds, or null if not yet measured.
 */
export function useConnectionPing(intervalMs = 30_000) {
  const [ping, setPing] = useState<number | null>(null);
  const [status, setStatus] = useState<'online' | 'slow' | 'offline'>('online');
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const measure = async () => {
      const start = performance.now();
      try {
        // Lightweight query — just pings the DB
        await supabase.from('admin_alerts').select('id', { count: 'exact', head: true });
        const ms = Math.round(performance.now() - start);
        setPing(ms);
        setStatus(ms > 2000 ? 'slow' : 'online');
      } catch {
        setPing(null);
        setStatus('offline');
      }
    };

    measure();
    timer.current = setInterval(measure, intervalMs);
    return () => clearInterval(timer.current);
  }, [intervalMs]);

  return { ping, status };
}
