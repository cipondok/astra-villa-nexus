import { describe, it, expect } from 'vitest';
import {
  classifyConfidence,
  classifyEngagement,
  detectMismatchRisks,
} from '../useBuyerListingMatch';

describe('classifyConfidence', () => {
  it('STRONG_MATCH for >= 75 with no mismatch', () => {
    expect(classifyConfidence(80, false)).toBe('STRONG_MATCH');
  });
  it('MODERATE_MATCH for >= 75 with mismatch', () => {
    expect(classifyConfidence(80, true)).toBe('MODERATE_MATCH');
  });
  it('MODERATE_MATCH for 50-74', () => {
    expect(classifyConfidence(60, false)).toBe('MODERATE_MATCH');
  });
  it('LOW_MATCH for < 50', () => {
    expect(classifyConfidence(30, false)).toBe('LOW_MATCH');
  });
});

describe('classifyEngagement', () => {
  it('IMMEDIATE_VIEWING for strong match + high intent', () => {
    expect(classifyEngagement('STRONG_MATCH', 70)).toBe('IMMEDIATE_VIEWING');
  });
  it('FOLLOWUP_NURTURING for moderate match', () => {
    expect(classifyEngagement('MODERATE_MATCH', 80)).toBe('FOLLOWUP_NURTURING');
  });
  it('ALTERNATIVE_LISTING for low match', () => {
    expect(classifyEngagement('LOW_MATCH', 90)).toBe('ALTERNATIVE_LISTING');
  });
  it('ALTERNATIVE_LISTING for strong match + low intent', () => {
    expect(classifyEngagement('STRONG_MATCH', 40)).toBe('ALTERNATIVE_LISTING');
  });
});

describe('detectMismatchRisks', () => {
  it('returns empty for perfect fit', () => {
    expect(detectMismatchRisks(90, true, true)).toEqual([]);
  });
  it('detects budget mismatch', () => {
    expect(detectMismatchRisks(30, true, true)).toContain('BUDGET_MISMATCH');
  });
  it('detects location conflict', () => {
    expect(detectMismatchRisks(80, false, true)).toContain('LOCATION_CONFLICT');
  });
  it('detects type mismatch', () => {
    expect(detectMismatchRisks(80, true, false)).toContain('TYPE_MISMATCH');
  });
  it('detects all three risks', () => {
    const risks = detectMismatchRisks(10, false, false);
    expect(risks).toHaveLength(3);
  });
});
