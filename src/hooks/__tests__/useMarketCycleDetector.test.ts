import { describe, it, expect } from 'vitest';
import { detectMarketCycle } from '../useMarketCycleDetector';

describe('detectMarketCycle', () => {
  it('returns PEAK for high signals', () => {
    const r = detectMarketCycle({ demand_index: 90, price_index: 85, confidence_level: 80 });
    expect(r.cycle_stage).toBe('PEAK');
    expect(r.composite_score).toBeGreaterThanOrEqual(76);
  });

  it('returns EXPANSION for moderate-high signals', () => {
    const r = detectMarketCycle({ demand_index: 70, price_index: 65, confidence_level: 60 });
    expect(r.cycle_stage).toBe('EXPANSION');
  });

  it('returns RECOVERY for moderate signals', () => {
    const r = detectMarketCycle({ demand_index: 50, price_index: 45, confidence_level: 40 });
    expect(r.cycle_stage).toBe('RECOVERY');
  });

  it('returns CORRECTION for low signals', () => {
    const r = detectMarketCycle({ demand_index: 25, price_index: 20, confidence_level: 30 });
    expect(r.cycle_stage).toBe('CORRECTION');
  });

  it('clamps out-of-range values', () => {
    const r = detectMarketCycle({ demand_index: 120, price_index: -5, confidence_level: 200 });
    expect(r.composite_score).toBeLessThanOrEqual(100);
    expect(r.composite_score).toBeGreaterThanOrEqual(0);
  });

  it('returns insight in Indonesian', () => {
    const r = detectMarketCycle({ demand_index: 60, price_index: 60, confidence_level: 60 });
    expect(r.cycle_insight).toContain('Pasar');
  });
});
