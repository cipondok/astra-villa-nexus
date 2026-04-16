import { useMemo } from 'react';
import type { FraudProfile } from '@/hooks/useFraudScoring';

export interface AIDecision {
  bestCTA: string;
  bestMicrocopy: string;
  uiVariant: 'trust_heavy' | 'urgency' | 'standard' | 'minimal' | 'restricted';
  restrictions: string[];
  boostTriggers: string[];
  confidence: number; // 0-100
}

interface DecisionInput {
  segment: string;
  conversionScore: number;
  fraudProfile: FraudProfile | null;
  hesitationSignals: string[];
  propertyPrice?: number;
  pageContext: string;
}

const CTA_MAP: Record<string, Record<string, string>> = {
  investor_ready: {
    urgency: 'Secure This Investment',
    standard: 'Begin Investment Process',
    trust_heavy: 'Invest with Full Escrow Protection',
  },
  high_intent: {
    urgency: 'Reserve Now — High Demand',
    standard: 'Start Your Investment',
    trust_heavy: 'Proceed with Secured Transaction',
  },
  hesitant: {
    trust_heavy: 'Learn More About Our Protection',
    standard: 'Explore Investment Details',
    minimal: 'View Property Analysis',
  },
  price_sensitive: {
    standard: 'See Financing Options',
    trust_heavy: 'Start with Flexible Deposit',
    minimal: 'Calculate Your Investment',
  },
};

const MICROCOPY_MAP: Record<string, string[]> = {
  trust_heavy: [
    'Protected by institutional-grade escrow',
    'Verified by independent legal review',
    'Full refund guarantee during due diligence',
  ],
  urgency: [
    'Limited availability — high investor interest',
    'Price locked for the next 48 hours',
    'Join verified investors who secured this asset',
  ],
  standard: [
    'Transparent pricing with no hidden fees',
    'Professional due diligence included',
    'Dedicated investment advisor available',
  ],
  minimal: [
    'Explore at your own pace',
    'Save for later review',
  ],
};

/**
 * AI Decision Layer — synthesizes all signals into concrete UI decisions.
 */
export function useAIDecisionLayer(input: DecisionInput): AIDecision {
  return useMemo(() => {
    const { segment, conversionScore, fraudProfile, hesitationSignals } = input;
    const fraudScore = fraudProfile?.score ?? 0;
    const restrictions: string[] = [];
    const boostTriggers: string[] = [];

    // Determine UI variant
    let uiVariant: AIDecision['uiVariant'] = 'standard';
    if (fraudScore >= 70) {
      uiVariant = 'restricted';
      restrictions.push('escrow_blocked', 'payment_blocked');
    } else if (fraudScore >= 45) {
      uiVariant = 'restricted';
      restrictions.push('kyc_required');
    } else if (hesitationSignals.length >= 2 || segment === 'hesitant') {
      uiVariant = 'trust_heavy';
    } else if (conversionScore >= 65 && segment !== 'price_sensitive') {
      uiVariant = 'urgency';
      boostTriggers.push('social_proof', 'scarcity');
    } else if (conversionScore < 20) {
      uiVariant = 'minimal';
    }

    // Pick CTA
    const segmentCTAs = CTA_MAP[segment] || CTA_MAP['high_intent'];
    const bestCTA = segmentCTAs[uiVariant] || segmentCTAs['standard'] || 'View Details';

    // Pick microcopy
    const copyPool = MICROCOPY_MAP[uiVariant] || MICROCOPY_MAP['standard'];
    const bestMicrocopy = copyPool[Math.floor(Math.random() * copyPool.length)] || '';

    // Revenue boost triggers
    if (conversionScore >= 50 && fraudScore < 30) {
      boostTriggers.push('incentive_eligible');
    }
    if (segment === 'investor_ready' && conversionScore >= 70) {
      boostTriggers.push('premium_offer');
    }

    // Confidence based on signal quality
    const signalCount = (hesitationSignals.length > 0 ? 1 : 0)
      + (conversionScore > 0 ? 1 : 0)
      + (fraudProfile ? 1 : 0)
      + (segment !== 'unknown' ? 1 : 0);
    const confidence = Math.min(100, signalCount * 25);

    return { bestCTA, bestMicrocopy, uiVariant, restrictions, boostTriggers, confidence };
  }, [input.segment, input.conversionScore, input.fraudProfile?.score, input.hesitationSignals.length, input.pageContext]);
}
