import { describe, it, expect } from 'vitest';
import {
  classifyOpportunity,
  classifyAction,
  detectKeyStrength,
} from '../useInvestmentAttractiveness';

describe('classifyOpportunity', () => {
  it('returns PRIME_INVESTMENT for >= 75', () => {
    expect(classifyOpportunity(75)).toBe('PRIME_INVESTMENT');
    expect(classifyOpportunity(95)).toBe('PRIME_INVESTMENT');
  });

  it('returns HIGH_POTENTIAL for 55-74', () => {
    expect(classifyOpportunity(55)).toBe('HIGH_POTENTIAL');
    expect(classifyOpportunity(74)).toBe('HIGH_POTENTIAL');
  });

  it('returns STABLE_OPTION for 35-54', () => {
    expect(classifyOpportunity(35)).toBe('STABLE_OPTION');
    expect(classifyOpportunity(54)).toBe('STABLE_OPTION');
  });

  it('returns SPECULATIVE_RISK for < 35', () => {
    expect(classifyOpportunity(34)).toBe('SPECULATIVE_RISK');
    expect(classifyOpportunity(0)).toBe('SPECULATIVE_RISK');
  });
});

describe('classifyAction', () => {
  it('returns ACQUIRE_NOW for high composite + deal score', () => {
    expect(classifyAction(75, 65)).toBe('ACQUIRE_NOW');
  });

  it('returns MONITOR_ENTRY for moderate composite', () => {
    expect(classifyAction(50, 30)).toBe('MONITOR_ENTRY');
  });

  it('returns LONG_TERM_HOLD for low composite', () => {
    expect(classifyAction(30, 20)).toBe('LONG_TERM_HOLD');
  });

  it('requires both composite >= 70 AND deal >= 60 for ACQUIRE_NOW', () => {
    expect(classifyAction(75, 50)).toBe('MONITOR_ENTRY');
    expect(classifyAction(65, 70)).toBe('MONITOR_ENTRY');
  });
});

describe('detectKeyStrength', () => {
  it('returns growth when growth is highest', () => {
    expect(detectKeyStrength(90, 50, 3, 40)).toBe('growth');
  });

  it('returns deal when deal is highest', () => {
    expect(detectKeyStrength(40, 85, 3, 50)).toBe('deal');
  });

  it('returns yield when normalized yield is highest', () => {
    // 8% yield * 12.5 = 100
    expect(detectKeyStrength(40, 50, 8, 60)).toBe('yield');
  });

  it('returns liquidity when liquidity is highest', () => {
    expect(detectKeyStrength(30, 40, 2, 90)).toBe('liquidity');
  });
});
