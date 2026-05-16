import { useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FraudSignal {
  type: string;
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface FraudProfile {
  score: number;                // 0-100
  level: 'safe' | 'watch' | 'suspicious' | 'blocked';
  signals: FraudSignal[];
  requiresKYC: boolean;
  actionRestricted: boolean;
}

const THRESHOLDS = {
  rapidClicks: { window: 3000, max: 15 },
  rapidPageViews: { window: 10000, max: 12 },
  sessionAge: { botThreshold: 2000 },         // ms — interactions under 2s after load
  failedPayments: { max: 3 },
};

/**
 * Client-side fraud scoring engine.
 * Analyzes behavioral patterns in real-time and assigns a composite fraud score.
 */
export function useFraudScoring() {
  const clickTimestamps = useRef<number[]>([]);
  const pageViewTimestamps = useRef<number[]>([]);
  const failedPayments = useRef(0);
  const sessionStart = useRef(Date.now());
  const lastScore = useRef<FraudProfile | null>(null);

  const recordClick = useCallback(() => {
    clickTimestamps.current.push(Date.now());
    // Keep only last 30
    if (clickTimestamps.current.length > 30) clickTimestamps.current.shift();
  }, []);

  const recordPageView = useCallback(() => {
    pageViewTimestamps.current.push(Date.now());
    if (pageViewTimestamps.current.length > 20) pageViewTimestamps.current.shift();
  }, []);

  const recordFailedPayment = useCallback(() => {
    failedPayments.current++;
  }, []);

  const computeScore = useCallback((): FraudProfile => {
    const signals: FraudSignal[] = [];
    let rawScore = 0;
    const now = Date.now();

    // 1. Rapid click detection
    const recentClicks = clickTimestamps.current.filter(
      t => now - t < THRESHOLDS.rapidClicks.window
    ).length;
    if (recentClicks > THRESHOLDS.rapidClicks.max) {
      const severity = recentClicks > THRESHOLDS.rapidClicks.max * 2 ? 'critical' : 'high';
      signals.push({ type: 'rapid_clicks', value: recentClicks, severity });
      rawScore += severity === 'critical' ? 35 : 20;
    }

    // 2. Rapid page navigation (bot-like)
    const recentPages = pageViewTimestamps.current.filter(
      t => now - t < THRESHOLDS.rapidPageViews.window
    ).length;
    if (recentPages > THRESHOLDS.rapidPageViews.max) {
      signals.push({ type: 'rapid_navigation', value: recentPages, severity: 'high' });
      rawScore += 25;
    }

    // 3. Bot-speed interaction
    const sessionAge = now - sessionStart.current;
    if (sessionAge < THRESHOLDS.sessionAge.botThreshold && clickTimestamps.current.length > 5) {
      signals.push({ type: 'bot_speed', value: sessionAge, severity: 'critical' });
      rawScore += 30;
    }

    // 4. Failed payments
    if (failedPayments.current >= THRESHOLDS.failedPayments.max) {
      const sev = failedPayments.current >= 5 ? 'critical' : 'high';
      signals.push({ type: 'repeated_failed_payments', value: failedPayments.current, severity: sev });
      rawScore += sev === 'critical' ? 30 : 20;
    }

    const score = Math.min(100, rawScore);
    let level: FraudProfile['level'] = 'safe';
    if (score >= 70) level = 'blocked';
    else if (score >= 45) level = 'suspicious';
    else if (score >= 20) level = 'watch';

    const profile: FraudProfile = {
      score,
      level,
      signals,
      requiresKYC: score >= 45,
      actionRestricted: score >= 70,
    };

    lastScore.current = profile;
    return profile;
  }, []);

  /** Persist a fraud signal to Supabase for admin review */
  const persistSignal = useCallback(async (signal: FraudSignal) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('fraud_signals' as any).insert({
        user_id: user?.id,
        signal_type: signal.type,
        signal_value: signal.value,
        severity: signal.severity,
        session_id: sessionStorage.getItem('astra_session_id'),
      });
    } catch {
      // Silent — fraud logging should never break UX
    }
  }, []);

  return {
    recordClick,
    recordPageView,
    recordFailedPayment,
    computeScore,
    persistSignal,
    getLastScore: () => lastScore.current,
  };
}
