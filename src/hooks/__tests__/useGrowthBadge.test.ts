import { describe, it, expect } from 'vitest';
import { generateGrowthBadge } from '../useGrowthBadge';

describe('generateGrowthBadge', () => {
  it('returns FUTURE PRIME AREA for EARLY OPPORTUNITY + high score', () => {
    const r = generateGrowthBadge(88, 'EARLY OPPORTUNITY');
    expect(r.label).toContain('FUTURE PRIME AREA');
    expect(r.variant).toBe('prime');
  });

  it('returns EARLY INVESTOR ZONE for EARLY OPPORTUNITY + moderate score', () => {
    const r = generateGrowthBadge(70, 'EARLY OPPORTUNITY');
    expect(r.label).toContain('EARLY INVESTOR ZONE');
    expect(r.variant).toBe('early');
  });

  it('returns RAPID GROWTH CORRIDOR for GROWTH PHASE + high score', () => {
    const r = generateGrowthBadge(80, 'GROWTH PHASE');
    expect(r.label).toContain('RAPID GROWTH CORRIDOR');
    expect(r.variant).toBe('growth');
  });

  it('returns STABLE MATURE MARKET for MATURE MARKET + decent score', () => {
    const r = generateGrowthBadge(65, 'MATURE MARKET');
    expect(r.label).toContain('STABLE MATURE MARKET');
    expect(r.variant).toBe('stable');
  });

  it('returns SPECULATIVE LAND PLAY for TOO EARLY + high score', () => {
    const r = generateGrowthBadge(70, 'TOO EARLY');
    expect(r.label).toContain('SPECULATIVE LAND PLAY');
    expect(r.variant).toBe('speculative');
  });

  it('returns HIGH-RISK FRONTIER for TOO EARLY + low score', () => {
    const r = generateGrowthBadge(30, 'TOO EARLY');
    expect(r.label).toContain('HIGH-RISK FRONTIER');
    expect(r.variant).toBe('speculative');
  });

  it('returns YIELD-FOCUSED ZONE for MATURE MARKET + low score', () => {
    const r = generateGrowthBadge(40, 'MATURE MARKET');
    expect(r.label).toContain('YIELD-FOCUSED ZONE');
    expect(r.variant).toBe('stable');
  });
});
