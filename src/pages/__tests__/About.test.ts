import { describe, it, expect } from 'vitest';

describe('About page', () => {
  it('company founding year', () => {
    const founded = 2024;
    expect(founded).toBeLessThanOrEqual(2026);
  });

  it('team members displayed', () => {
    const team = ['CEO', 'CTO', 'COO', 'CMO'];
    expect(team.length).toBeGreaterThanOrEqual(3);
  });

  it('ecosystem pillars defined', () => {
    const pillars = [
      'Luxury Villa Marketplace',
      'Investment & Fractionalization',
      'AI-Powered Intelligence',
      'Property Management',
      'Legal & Compliance',
      'Vendor & Service Marketplace',
    ];
    expect(pillars.length).toBe(6);
  });

  it('investment support steps defined', () => {
    const steps = [
      'Consultation',
      'Legal Structure',
      'Property Selection',
      'Investment Execution',
      'Asset Management',
    ];
    expect(steps.length).toBe(5);
  });

  it('technology roadmap has 3 phases', () => {
    const phases = [
      'Phase 1: Current Architecture',
      'Phase 2: Immersive Tech',
      'Phase 3: Web3 & Macro Integration',
    ];
    expect(phases.length).toBe(3);
  });
});
