import { describe, it, expect } from 'vitest';
import { generateDealConfidenceBadge } from '../useDealConfidenceBadge';

describe('generateDealConfidenceBadge', () => {
  it('returns FAST SELLING LISTING for score >= 81', () => {
    const r = generateDealConfidenceBadge(85);
    expect(r.label).toContain('FAST SELLING LISTING');
    expect(r.variant).toBe('hot');
  });

  it('returns STRONG BUYER INTEREST for score 61-80', () => {
    const r = generateDealConfidenceBadge(70);
    expect(r.label).toContain('STRONG BUYER INTEREST');
    expect(r.variant).toBe('strong');
  });

  it('returns STABLE MARKET LISTING for score 41-60', () => {
    const r = generateDealConfidenceBadge(50);
    expect(r.label).toContain('STABLE MARKET LISTING');
    expect(r.variant).toBe('stable');
  });

  it('returns NEED PRICE ADJUSTMENT for score 21-40', () => {
    const r = generateDealConfidenceBadge(30);
    expect(r.label).toContain('NEED PRICE ADJUSTMENT');
    expect(r.variant).toBe('caution');
  });

  it('returns LOW MARKET RESPONSE for score <= 20', () => {
    const r = generateDealConfidenceBadge(15);
    expect(r.label).toContain('LOW MARKET RESPONSE');
    expect(r.variant).toBe('cold');
  });

  it('clamps score above 100', () => {
    const r = generateDealConfidenceBadge(120);
    expect(r.variant).toBe('hot');
  });

  it('clamps score below 0', () => {
    const r = generateDealConfidenceBadge(-5);
    expect(r.variant).toBe('cold');
  });

  it('handles boundary at 81', () => {
    expect(generateDealConfidenceBadge(81).variant).toBe('hot');
    expect(generateDealConfidenceBadge(80).variant).toBe('strong');
  });
});
