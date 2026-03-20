import { describe, it, expect } from 'vitest';
import { computeSentimentIndex, classifyNarrativeStrength, detectRiskAlerts } from '../useInvestorSentiment';

describe('computeSentimentIndex', () => {
  it('returns BULLISH_MOMENTUM for strong signals', () => {
    const result = computeSentimentIndex({
      analystUpgrades: 5,
      institutionalInflowTrend: 90,
      mediaToneScore: 85,
      retailMomentum: 80,
      shortInterestRatio: 10,
      optionsIVTrend: 15,
    });
    expect(result.regime).toBe('BULLISH_MOMENTUM');
    expect(result.score).toBeGreaterThan(75);
  });

  it('returns STABLE_ACCUMULATION for moderate signals', () => {
    const result = computeSentimentIndex({
      analystUpgrades: 1,
      institutionalInflowTrend: 55,
      mediaToneScore: 50,
      retailMomentum: 50,
      shortInterestRatio: 40,
      optionsIVTrend: 40,
    });
    expect(result.regime).toBe('STABLE_ACCUMULATION');
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.score).toBeLessThanOrEqual(75);
  });

  it('returns DEFENSIVE for weak signals', () => {
    const result = computeSentimentIndex({
      analystUpgrades: -3,
      institutionalInflowTrend: 15,
      mediaToneScore: 20,
      retailMomentum: 20,
      shortInterestRatio: 80,
      optionsIVTrend: 85,
    });
    expect(result.regime).toBe('DEFENSIVE');
    expect(result.score).toBeLessThan(50);
  });
});

describe('classifyNarrativeStrength', () => {
  it('STRONG for high media + analyst', () => {
    expect(classifyNarrativeStrength(85, 4, 70).level).toBe('STRONG');
  });
  it('WEAK for low signals', () => {
    expect(classifyNarrativeStrength(20, -2, 15).level).toBe('WEAK');
  });
});

describe('detectRiskAlerts', () => {
  it('detects elevated short interest', () => {
    const alerts = detectRiskAlerts({
      analystUpgrades: 0, institutionalInflowTrend: 50,
      mediaToneScore: 50, retailMomentum: 50,
      shortInterestRatio: 75, optionsIVTrend: 30,
    });
    expect(alerts).toContain('Elevated short interest — potential squeeze or attack');
  });

  it('returns empty for healthy signals', () => {
    const alerts = detectRiskAlerts({
      analystUpgrades: 2, institutionalInflowTrend: 60,
      mediaToneScore: 65, retailMomentum: 55,
      shortInterestRatio: 20, optionsIVTrend: 25,
    });
    expect(alerts).toHaveLength(0);
  });
});
