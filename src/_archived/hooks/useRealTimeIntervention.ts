import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type InterventionAction =
  | 'show_urgency'
  | 'show_advisor'
  | 'show_trust_signal'
  | 'show_incentive'
  | 'require_verification'
  | 'restrict_action'
  | 'none';

export interface InterventionDecision {
  action: InterventionAction;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

interface InterventionInput {
  conversionScore: number;   // 0-100
  fraudScore: number;        // 0-100
  fraudLevel: string;
  segment: string;
  hesitationSignals: string[];
  currentPage: string;
}

const COOLDOWN_MS = 30000; // 30s between interventions

/**
 * Real-time intervention engine.
 * Combines conversion scoring, fraud detection, and hesitation signals
 * to trigger contextual UI actions.
 */
export function useRealTimeIntervention() {
  const [activeIntervention, setActiveIntervention] = useState<InterventionDecision | null>(null);
  const lastTriggerTime = useRef(0);
  const interventionHistory = useRef<InterventionDecision[]>([]);

  const evaluate = useCallback((input: InterventionInput): InterventionDecision => {
    const { conversionScore, fraudScore, fraudLevel, segment, hesitationSignals, currentPage } = input;

    // Priority 1: Fraud blocking
    if (fraudScore >= 70 || fraudLevel === 'blocked') {
      return {
        action: 'restrict_action',
        message: 'Account verification required to proceed with this action.',
        priority: 'critical',
        metadata: { fraudScore },
      };
    }

    // Priority 2: Suspicious — add friction
    if (fraudScore >= 45 || fraudLevel === 'suspicious') {
      return {
        action: 'require_verification',
        message: 'Please verify your identity to continue.',
        priority: 'high',
        metadata: { fraudScore },
      };
    }

    // Priority 3: High intent + hesitation → urgency
    if (conversionScore >= 60 && hesitationSignals.length > 0) {
      if (hesitationSignals.includes('long_dwell') || hesitationSignals.includes('repeated_scroll')) {
        return {
          action: 'show_urgency',
          message: 'This property is attracting significant investor interest.',
          priority: 'medium',
          metadata: { conversionScore, signals: hesitationSignals },
        };
      }
    }

    // Priority 4: Medium intent + hesitation → trust
    if (conversionScore >= 30 && conversionScore < 60 && hesitationSignals.length > 0) {
      if (segment === 'hesitant' || segment === 'price_sensitive') {
        return {
          action: 'show_trust_signal',
          message: 'All transactions are protected by our institutional-grade escrow system.',
          priority: 'medium',
        };
      }
    }

    // Priority 5: Low conversion → advisor
    if (conversionScore < 25 && hesitationSignals.includes('idle')) {
      return {
        action: 'show_advisor',
        message: 'Our investment advisors are available to help you find the right property.',
        priority: 'low',
      };
    }

    // Priority 6: High intent, no hesitation → incentive
    if (conversionScore >= 70 && segment === 'investor_ready') {
      return {
        action: 'show_incentive',
        message: 'Complete your investment today and lock in current pricing.',
        priority: 'low',
      };
    }

    return { action: 'none', message: '', priority: 'low' };
  }, []);

  const triggerIntervention = useCallback((input: InterventionInput) => {
    const now = Date.now();
    if (now - lastTriggerTime.current < COOLDOWN_MS) return;

    const decision = evaluate(input);
    if (decision.action === 'none') return;

    lastTriggerTime.current = now;
    setActiveIntervention(decision);
    interventionHistory.current.push(decision);

    // Log to Supabase
    supabase.auth.getUser().then(({ data: { user } }) => {
      supabase.from('intervention_logs' as any).insert({
        user_id: user?.id,
        intervention_type: decision.action,
        trigger_reason: JSON.stringify(input.hesitationSignals),
        conversion_score: input.conversionScore,
        fraud_score: input.fraudScore,
        action_taken: decision.action,
        metadata_json: decision.metadata || {},
      }).then(() => {});
    });
  }, [evaluate]);

  const dismissIntervention = useCallback(() => {
    setActiveIntervention(null);
  }, []);

  return {
    activeIntervention,
    triggerIntervention,
    dismissIntervention,
    evaluate,
  };
}
