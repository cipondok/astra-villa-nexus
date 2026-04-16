/**
 * Unified AI Orchestrator
 * Combines all AI systems into a single decision layer for the platform
 */

import { useMemo, useCallback } from 'react';
import { useFraudScoring } from '@/hooks/useFraudScoring';
import { useConversionScoring } from '@/hooks/useConversionScoring';
import { useGeoPersonalization } from '@/hooks/useGeoPersonalization';
import { useLuxuryMicrocopy } from '@/hooks/useLuxuryMicrocopy';

interface OrchestratorInput {
  segment?: string;
  propertyId?: string;
  pageContext?: 'listing' | 'checkout' | 'wallet' | 'dashboard' | 'detail';
}

interface OrchestratorDecision {
  // UI variant to render
  uiVariant: 'luxury_default' | 'trust_heavy' | 'urgency' | 'restricted' | 'nurture';
  // Best CTA text
  ctaText: string;
  ctaVariant: 'primary' | 'secondary' | 'gold' | 'outline';
  // Microcopy to show
  microcopy: string[];
  // Trust signals to display
  trustSignals: string[];
  // Restrictions
  restrictions: {
    canTransact: boolean;
    requiresKYC: boolean;
    maxAmount: number | null;
    reason?: string;
  };
  // Recommendation category to highlight
  recommendationFocus: 'roi' | 'growth' | 'stability' | 'prestige';
  // Intervention trigger
  shouldIntervene: boolean;
  interventionType?: 'assist' | 'incentive' | 'verify' | 'restrict';
  interventionMessage?: string;
}

export function useUnifiedAIOrchestrator(input: OrchestratorInput = {}) {
  const fraud = useFraudScoring();
  const { geoProfile } = useGeoPersonalization();
  const copy = useLuxuryMicrocopy();

  const makeDecision = useCallback((): OrchestratorDecision => {
    const fraudScore = fraud.getLastScore?.()?.score ?? 0;
    const fraudStatus = fraud.getLastScore?.()?.status ?? 'safe';
    const segment = input.segment || 'visitor';
    const context = input.pageContext || 'listing';

    // Base restrictions from fraud
    const restrictions = {
      canTransact: fraudStatus !== 'blocked' && fraudStatus !== 'high_risk',
      requiresKYC: fraudScore > 40 || geoProfile.compliance.requiresKYC,
      maxAmount: fraudStatus === 'high_risk' ? 0 : geoProfile.compliance.maxTransactionWithoutKYC,
      reason: fraudStatus === 'blocked' ? 'Account flagged for security review' : undefined,
    };

    // Determine UI variant
    let uiVariant: OrchestratorDecision['uiVariant'] = 'luxury_default';
    if (fraudStatus === 'blocked' || fraudStatus === 'high_risk') {
      uiVariant = 'restricted';
    } else if (segment === 'high_intent' || segment === 'investor_ready') {
      uiVariant = 'urgency';
    } else if (segment === 'new_visitor' || segment === 'returning') {
      uiVariant = 'trust_heavy';
    } else if (segment === 'at_risk') {
      uiVariant = 'nurture';
    }

    // CTA based on context + segment
    let ctaText = copy.label('view_details');
    let ctaVariant: OrchestratorDecision['ctaVariant'] = 'primary';
    
    if (context === 'checkout') {
      ctaText = copy.label('confirm');
      ctaVariant = 'gold';
    } else if (context === 'detail' && (segment === 'high_intent' || segment === 'investor_ready')) {
      ctaText = copy.label('buy');
      ctaVariant = 'gold';
    } else if (context === 'listing') {
      ctaText = copy.label('view_details');
      ctaVariant = 'primary';
    }

    // Microcopy
    const microcopy: string[] = [];
    if (uiVariant === 'trust_heavy') {
      microcopy.push(copy.trust('escrow'), copy.trust('legal'));
    }
    if (uiVariant === 'urgency') {
      microcopy.push(copy.signal('scarcity'), copy.signal('urgency'));
    }
    if (context === 'checkout') {
      microcopy.push(copy.trust('institutional'));
    }

    // Trust signals
    const trustSignals: string[] = [copy.trust('escrow')];
    if (context === 'checkout' || context === 'wallet') {
      trustSignals.push(copy.trust('institutional'));
    }

    // Recommendation focus
    let recommendationFocus: OrchestratorDecision['recommendationFocus'] = 'growth';
    if (geoProfile.tier === 'mena') recommendationFocus = 'prestige';
    else if (segment === 'investor_ready') recommendationFocus = 'roi';
    else if (segment === 'new_visitor') recommendationFocus = 'stability';

    // Intervention
    let shouldIntervene = false;
    let interventionType: OrchestratorDecision['interventionType'];
    let interventionMessage: string | undefined;

    if (fraudStatus === 'blocked') {
      shouldIntervene = true;
      interventionType = 'restrict';
      interventionMessage = 'Account requires verification before proceeding';
    } else if (segment === 'at_risk') {
      shouldIntervene = true;
      interventionType = 'assist';
      interventionMessage = 'Need help? Our investment advisors are available 24/7';
    }

    return {
      uiVariant,
      ctaText,
      ctaVariant,
      microcopy,
      trustSignals,
      restrictions,
      recommendationFocus,
      shouldIntervene,
      interventionType,
      interventionMessage,
    };
  }, [fraud, geoProfile, copy, input]);

  const decision = useMemo(() => makeDecision(), [makeDecision]);

  return { decision, refreshDecision: makeDecision };
}
