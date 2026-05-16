import { describe, it, expect } from 'vitest';
import { generateUrgencyLabel } from '../useUrgencyLabel';

describe('generateUrgencyLabel', () => {
  it('returns FAST SELLING ZONE for VERY HIGH + BELOW MARKET', () => {
    const result = generateUrgencyLabel('VERY HIGH', 'BELOW MARKET');
    expect(result.label).toContain('FAST SELLING ZONE');
    expect(result.variant).toBe('hot');
  });

  it('returns INVESTOR HOTSPOT for HIGH + BELOW MARKET', () => {
    const result = generateUrgencyLabel('HIGH', 'BELOW MARKET');
    expect(result.label).toContain('INVESTOR HOTSPOT');
    expect(result.variant).toBe('hot');
  });

  it('returns HIGH DEMAND AREA for VERY HIGH + ABOVE MARKET', () => {
    const result = generateUrgencyLabel('VERY HIGH', 'ABOVE MARKET');
    expect(result.label).toContain('HIGH DEMAND AREA');
    expect(result.variant).toBe('warm');
  });

  it('returns PREMIUM SLOW MARKET for MODERATE + ABOVE MARKET', () => {
    const result = generateUrgencyLabel('MODERATE', 'ABOVE MARKET');
    expect(result.label).toContain('PREMIUM SLOW MARKET');
    expect(result.variant).toBe('cool');
  });

  it('returns LIMITED BUYER INTEREST for LOW + FAIR MARKET', () => {
    const result = generateUrgencyLabel('LOW', 'FAIR MARKET');
    expect(result.label).toContain('LIMITED BUYER INTEREST');
    expect(result.variant).toBe('cool');
  });

  it('returns SLOW MARKET ZONE for LOW + ABOVE MARKET', () => {
    const result = generateUrgencyLabel('LOW', 'ABOVE MARKET');
    expect(result.label).toContain('SLOW MARKET ZONE');
    expect(result.variant).toBe('cold');
  });

  it('returns VALUE OPPORTUNITY for MODERATE + BELOW MARKET', () => {
    const result = generateUrgencyLabel('MODERATE', 'BELOW MARKET');
    expect(result.label).toContain('VALUE OPPORTUNITY');
    expect(result.variant).toBe('warm');
  });

  it('returns STEADY MARKET for MODERATE + FAIR MARKET', () => {
    const result = generateUrgencyLabel('MODERATE', 'FAIR MARKET');
    expect(result.label).toContain('STEADY MARKET');
    expect(result.variant).toBe('neutral');
  });
});
