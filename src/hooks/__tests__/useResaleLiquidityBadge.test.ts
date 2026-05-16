import { describe, it, expect } from 'vitest';
import { generateResaleLiquidityBadge } from '../useResaleLiquidityBadge';

describe('generateResaleLiquidityBadge', () => {
  it('returns EASY RESALE for high liquidity + low risk', () => {
    const r = generateResaleLiquidityBadge(85, 'LOW');
    expect(r.label).toContain('EASY RESALE PROPERTY');
    expect(r.variant).toBe('excellent');
  });

  it('returns STRONG EXIT LIQUIDITY for high liquidity + medium risk', () => {
    const r = generateResaleLiquidityBadge(90, 'MEDIUM');
    expect(r.label).toContain('STRONG EXIT LIQUIDITY');
    expect(r.variant).toBe('good');
  });

  it('returns STABLE MARKET ASSET for medium liquidity + low risk', () => {
    const r = generateResaleLiquidityBadge(65, 'LOW');
    expect(r.label).toContain('STABLE MARKET ASSET');
    expect(r.variant).toBe('good');
  });

  it('returns SELECTIVE BUYER MARKET for medium liquidity + medium risk', () => {
    const r = generateResaleLiquidityBadge(60, 'MEDIUM');
    expect(r.label).toContain('SELECTIVE BUYER MARKET');
    expect(r.variant).toBe('neutral');
  });

  it('returns LONG HOLD for medium liquidity + high risk', () => {
    const r = generateResaleLiquidityBadge(55, 'HIGH');
    expect(r.label).toContain('LONG HOLD INVESTMENT');
    expect(r.variant).toBe('caution');
  });

  it('returns RESALE RISK ALERT for low liquidity + high risk', () => {
    const r = generateResaleLiquidityBadge(30, 'HIGH');
    expect(r.label).toContain('RESALE RISK ALERT');
    expect(r.variant).toBe('warning');
  });

  it('returns NICHE MARKET for low liquidity + low risk', () => {
    const r = generateResaleLiquidityBadge(40, 'LOW');
    expect(r.label).toContain('NICHE MARKET ASSET');
    expect(r.variant).toBe('neutral');
  });

  it('returns LIQUID BUT VOLATILE for high liquidity + high risk', () => {
    const r = generateResaleLiquidityBadge(85, 'HIGH');
    expect(r.label).toContain('LIQUID BUT VOLATILE');
    expect(r.variant).toBe('caution');
  });
});
