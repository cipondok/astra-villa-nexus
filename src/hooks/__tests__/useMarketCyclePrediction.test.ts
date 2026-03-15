import { describe, it, expect } from 'vitest';
import {
  classifyCyclePhase,
  classifyCycleConfidence,
} from '../useMarketCyclePrediction';

describe('classifyCyclePhase', () => {
  it('EXPANSION when growth rising + demand momentum positive', () => {
    expect(classifyCyclePhase(10, 10, 55, 60, 0, 50, 0, 50, 50)).toBe('EXPANSION');
  });

  it('PEAK_RISK when growth/demand high but liquidity declining', () => {
    expect(classifyCyclePhase(3, 3, 65, 60, -10, 50, 0, 50, 60)).toBe('PEAK_RISK');
  });

  it('CORRECTION when demand dropping + deal weakening', () => {
    expect(classifyCyclePhase(0, -10, 40, 40, 0, 50, -10, 40, 50)).toBe('CORRECTION');
  });

  it('RECOVERY when liquidity stabilizing after decline', () => {
    expect(classifyCyclePhase(0, 0, 40, 40, 5, 50, 0, 40, 45)).toBe('RECOVERY');
  });

  it('fallback EXPANSION for high composite', () => {
    // growth/demand don't meet specific triggers but composite is high
    expect(classifyCyclePhase(3, 3, 70, 70, 0, 70, 0, 70, 70)).toBe('EXPANSION');
  });

  it('fallback CORRECTION for low composite', () => {
    expect(classifyCyclePhase(0, 0, 20, 20, 0, 20, 0, 20, 20)).toBe('CORRECTION');
  });
});

describe('classifyCycleConfidence', () => {
  it('HIGH confidence for strong expansion', () => {
    expect(classifyCycleConfidence('EXPANSION', 20, 20, 65, 0, 50, 0, 50)).toBe('HIGH');
  });

  it('MODERATE confidence for moderate expansion', () => {
    expect(classifyCycleConfidence('EXPANSION', 10, 10, 55, 0, 50, 0, 50)).toBe('MODERATE');
  });

  it('EARLY_SIGNAL for weak expansion', () => {
    expect(classifyCycleConfidence('EXPANSION', 6, 6, 50, 0, 50, 0, 50)).toBe('EARLY_SIGNAL');
  });

  it('HIGH confidence for severe peak risk', () => {
    expect(classifyCycleConfidence('PEAK_RISK', 0, 0, 60, -20, 40, 0, 50)).toBe('HIGH');
  });

  it('HIGH confidence for deep correction', () => {
    expect(classifyCycleConfidence('CORRECTION', 0, -20, 35, 0, 50, -20, 30)).toBe('HIGH');
  });

  it('HIGH confidence for confirmed recovery', () => {
    expect(classifyCycleConfidence('RECOVERY', 0, 5, 40, 15, 50, 0, 40)).toBe('HIGH');
  });

  it('EARLY_SIGNAL for weak recovery', () => {
    expect(classifyCycleConfidence('RECOVERY', 0, -2, 40, 1, 50, 0, 40)).toBe('EARLY_SIGNAL');
  });
});
