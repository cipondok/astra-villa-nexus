import { describe, it, expect } from 'vitest';
import {
  classifyDealSignal,
  classifyTimingConfidence,
} from '../useDealTimingSignals';

describe('classifyDealSignal', () => {
  it('STRONG_BUY for high rank in recovery', () => {
    expect(classifyDealSignal(70, 60, 50, 55, 'RECOVERY')).toBe('STRONG_BUY');
  });

  it('STRONG_BUY for high rank in expansion', () => {
    expect(classifyDealSignal(65, 50, 50, 50, 'EXPANSION')).toBe('STRONG_BUY');
  });

  it('ACCUMULATE for high growth + low demand', () => {
    expect(classifyDealSignal(50, 60, 45, 50, 'RECOVERY')).toBe('ACCUMULATE');
  });

  it('EXIT_WARNING in peak risk with low liquidity', () => {
    expect(classifyDealSignal(40, 50, 60, 35, 'PEAK_RISK')).toBe('EXIT_WARNING');
  });

  it('HOLD as default', () => {
    expect(classifyDealSignal(40, 40, 50, 50, 'EXPANSION')).toBe('HOLD');
  });

  it('STRONG_BUY takes priority over ACCUMULATE when both match', () => {
    // rank >= 65, growth >= 55, demand < 60, cycle EXPANSION
    expect(classifyDealSignal(70, 60, 50, 55, 'EXPANSION')).toBe('STRONG_BUY');
  });
});

describe('classifyTimingConfidence', () => {
  it('HIGH_CONVICTION for strong buy with top metrics', () => {
    expect(classifyTimingConfidence('STRONG_BUY', 85, 65, 50, 55, 60, 5)).toBe('HIGH_CONVICTION');
  });

  it('MODERATE_CONVICTION for strong buy moderate rank', () => {
    expect(classifyTimingConfidence('STRONG_BUY', 72, 50, 50, 55, 60, 5)).toBe('MODERATE_CONVICTION');
  });

  it('EARLY_SIGNAL for strong buy lower rank', () => {
    expect(classifyTimingConfidence('STRONG_BUY', 65, 50, 50, 55, 60, 5)).toBe('EARLY_SIGNAL');
  });

  it('HIGH_CONVICTION for accumulate with high growth + low demand', () => {
    expect(classifyTimingConfidence('ACCUMULATE', 50, 75, 40, 50, 50, 3)).toBe('HIGH_CONVICTION');
  });

  it('HIGH_CONVICTION for exit with collapsed liquidity', () => {
    expect(classifyTimingConfidence('EXIT_WARNING', 40, 50, 60, 25, 30, 3)).toBe('HIGH_CONVICTION');
  });

  it('HIGH_CONVICTION for hold with strong fundamentals', () => {
    expect(classifyTimingConfidence('HOLD', 55, 50, 50, 60, 50, 5)).toBe('HIGH_CONVICTION');
  });

  it('EARLY_SIGNAL for hold with weak metrics', () => {
    expect(classifyTimingConfidence('HOLD', 30, 30, 50, 40, 30, 2)).toBe('EARLY_SIGNAL');
  });
});
