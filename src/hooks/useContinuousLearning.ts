/**
 * Continuous Learning Pipeline Hook
 * Collects feedback signals, triggers training, and manages model versioning.
 */
import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackSignal {
  property_id: string;
  signal_type: 'click' | 'save' | 'invest' | 'view' | 'dismiss' | 'inquiry';
  value?: number;
  dwell_time_ms?: number;
  metadata?: Record<string, unknown>;
}

const BATCH_SIZE = 20;
const FLUSH_MS = 8000;

export function useContinuousLearning() {
  const { user } = useAuth();
  const buffer = useRef<FeedbackSignal[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    if (buffer.current.length === 0 || !user?.id) return;
    const batch = buffer.current.splice(0, BATCH_SIZE);

    try {
      await supabase.functions.invoke('continuous-learning', {
        body: {
          mode: 'ingest',
          signals: batch,
        },
      });
    } catch (err) {
      console.warn('Learning signal flush failed:', err);
      buffer.current.unshift(...batch.slice(0, 10));
    }
  }, [user?.id]);

  useEffect(() => {
    timer.current = setInterval(flush, FLUSH_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
      flush();
    };
  }, [flush]);

  const recordSignal = useCallback((signal: FeedbackSignal) => {
    buffer.current.push(signal);
    if (buffer.current.length >= BATCH_SIZE) flush();
  }, [flush]);

  const recordClick = useCallback((propertyId: string, meta?: Record<string, unknown>) => {
    recordSignal({ property_id: propertyId, signal_type: 'click', metadata: meta });
  }, [recordSignal]);

  const recordSave = useCallback((propertyId: string) => {
    recordSignal({ property_id: propertyId, signal_type: 'save', value: 1 });
  }, [recordSignal]);

  const recordInvestment = useCallback((propertyId: string, amount: number) => {
    recordSignal({ property_id: propertyId, signal_type: 'invest', value: amount });
  }, [recordSignal]);

  const recordDwell = useCallback((propertyId: string, dwellMs: number) => {
    recordSignal({ property_id: propertyId, signal_type: 'view', dwell_time_ms: dwellMs });
  }, [recordSignal]);

  return { recordSignal, recordClick, recordSave, recordInvestment, recordDwell };
}
