import { describe, it, expect } from 'vitest';
import {
  scoreStageInactivity,
  scoreNegotiationGap,
  scoreEngagementDecline,
  scoreDocumentationDelay,
  scoreCancellationPattern,
  scoreFinancingRisk,
  detectDealRisk,
} from '../dealRiskDetection';

describe('scoreStageInactivity', () => {
  it('low risk within SLA', () => {
    expect(scoreStageInactivity('viewing', 3)).toBeLessThan(20);
  });
  it('high risk at 2x SLA', () => {
    expect(scoreStageInactivity('viewing', 14)).toBeGreaterThan(50);
  });
  it('critical at 3x SLA', () => {
    expect(scoreStageInactivity('offer', 15)).toBeGreaterThan(70);
  });
});

describe('scoreNegotiationGap', () => {
  it('low risk for small gap', () => {
    expect(scoreNegotiationGap(2_000_000_000, 1_960_000_000)).toBeLessThan(15);
  });
  it('high risk for wide gap', () => {
    expect(scoreNegotiationGap(2_000_000_000, 1_500_000_000)).toBeGreaterThan(75);
  });
});

describe('scoreEngagementDecline', () => {
  it('low when activity increasing', () => {
    expect(scoreEngagementDecline(10, 5)).toBeLessThan(20);
  });
  it('high when activity drops to zero', () => {
    expect(scoreEngagementDecline(0, 8)).toBe(100);
  });
  it('moderate when both zero', () => {
    expect(scoreEngagementDecline(0, 0)).toBe(70);
  });
});

describe('scoreDocumentationDelay', () => {
  it('zero when all submitted', () => {
    expect(scoreDocumentationDelay(5, 5)).toBe(0);
  });
  it('high when none submitted', () => {
    expect(scoreDocumentationDelay(0, 5)).toBe(95);
  });
});

describe('scoreCancellationPattern', () => {
  it('low with no cancellations', () => {
    expect(scoreCancellationPattern(0, 3)).toBe(0);
  });
  it('high with all cancellations', () => {
    expect(scoreCancellationPattern(3, 0)).toBeGreaterThan(90);
  });
});

describe('scoreFinancingRisk', () => {
  it('zero when preapproved', () => {
    expect(scoreFinancingRisk(true, true, 'payment')).toBe(0);
  });
  it('critical when not applied in late stage', () => {
    expect(scoreFinancingRisk(false, false, 'legal')).toBe(95);
  });
});

describe('detectDealRisk', () => {
  it('returns LOW for healthy deal', () => {
    const result = detectDealRisk({
      deal_value: 2_000_000_000,
      current_stage: 'negotiation',
      days_in_current_stage: 5,
      total_days_in_pipeline: 15,
      viewing_cancellations: 0,
      viewings_completed: 3,
      ask_price: 2_000_000_000,
      latest_offer: 1_950_000_000,
      buyer_messages_7d: 8,
      buyer_messages_prev_7d: 6,
      docs_submitted: 4,
      docs_required: 5,
      financing_preapproved: true,
      financing_applied: true,
      is_high_value: false,
    });
    expect(result.risk_level).toBe('LOW');
    expect(result.risk_score).toBeLessThan(35);
  });

  it('returns HIGH/CRITICAL for troubled deal', () => {
    const result = detectDealRisk({
      deal_value: 8_000_000_000,
      current_stage: 'payment',
      days_in_current_stage: 20,
      total_days_in_pipeline: 90,
      viewing_cancellations: 4,
      viewings_completed: 1,
      ask_price: 8_000_000_000,
      latest_offer: 6_000_000_000,
      buyer_messages_7d: 0,
      buyer_messages_prev_7d: 12,
      docs_submitted: 1,
      docs_required: 6,
      financing_preapproved: false,
      financing_applied: false,
      is_high_value: true,
    });
    expect(['HIGH', 'CRITICAL']).toContain(result.risk_level);
    expect(result.failure_causes.length).toBeGreaterThan(0);
    expect(result.interventions.length).toBeGreaterThan(0);
    expect(result.intervention_urgency).toBe('rescue');
  });
});
