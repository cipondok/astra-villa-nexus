import { describe, it, expect } from 'vitest';
import { classifyMarketSignal, scoreSeoReadiness } from '../useSeoLocationBlueprint';

describe('classifyMarketSignal', () => {
  it('HIGH_DEMAND when demand >= 65 and growth >= 60', () => {
    expect(classifyMarketSignal(70, 65, 50)).toBe('HIGH_DEMAND');
  });
  it('GROWING when growth >= 55', () => {
    expect(classifyMarketSignal(50, 58, 40)).toBe('GROWING');
  });
  it('STABLE when demand >= 45 and liquidity >= 45', () => {
    expect(classifyMarketSignal(50, 40, 50)).toBe('STABLE');
  });
  it('EMERGING as fallback', () => {
    expect(classifyMarketSignal(30, 30, 30)).toBe('EMERGING');
  });
});

describe('scoreSeoReadiness', () => {
  it('high score for optimal inputs', () => {
    const score = scoreSeoReadiness(60, 'Rumah Dijual di Menteng Jakarta Pusat', 'Temukan 60 properti di Menteng dengan harga mulai Rp 2 Miliar. Pasar tinggi permintaan.', 30, 5);
    expect(score).toBeGreaterThanOrEqual(80);
  });
  it('low score for minimal inputs', () => {
    const score = scoreSeoReadiness(1, 'Hi', 'Short', 5, 0);
    expect(score).toBeLessThanOrEqual(35);
  });
  it('capped at 100', () => {
    const score = scoreSeoReadiness(100, 'x'.repeat(40), 'y'.repeat(140), 30, 5);
    expect(score).toBeLessThanOrEqual(100);
  });
});
