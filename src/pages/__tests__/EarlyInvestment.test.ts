import { describe, it, expect } from 'vitest';
import { DEMO_PROJECTS, DEMO_DEVELOPERS } from '@/data/demoOffPlanProjects';

describe('EarlyInvestment page', () => {
  it('demo projects have required fields', () => {
    DEMO_PROJECTS.forEach(p => {
      expect(p.id).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.startingPrice).toBeGreaterThan(0);
      expect(p.estimatedCompletionValue).toBeGreaterThan(p.startingPrice);
      expect(p.completionPct).toBeGreaterThanOrEqual(0);
      expect(p.completionPct).toBeLessThanOrEqual(100);
      expect(p.phases.length).toBe(6);
    });
  });

  it('each project has exactly one current phase', () => {
    DEMO_PROJECTS.forEach(p => {
      const currentPhases = p.phases.filter(ph => ph.current);
      expect(currentPhases).toHaveLength(1);
    });
  });

  it('completed phases precede current phase', () => {
    DEMO_PROJECTS.forEach(p => {
      const currentIdx = p.phases.findIndex(ph => ph.current);
      p.phases.forEach((ph, i) => {
        if (i < currentIdx) expect(ph.completed).toBe(true);
        if (i > currentIdx) expect(ph.completed).toBe(false);
      });
    });
  });

  it('capital gain calculation is correct', () => {
    DEMO_PROJECTS.forEach(p => {
      const gain = ((p.estimatedCompletionValue - p.startingPrice) / p.startingPrice) * 100;
      expect(gain).toBeGreaterThan(0);
    });
  });

  it('developers have valid ratings', () => {
    DEMO_DEVELOPERS.forEach(d => {
      expect(d.rating).toBeGreaterThanOrEqual(1);
      expect(d.rating).toBeLessThanOrEqual(5);
      expect(d.completedProjects).toBeLessThanOrEqual(d.totalProjects);
      expect(d.onTimeDeliveryPct).toBeGreaterThan(0);
      expect(d.onTimeDeliveryPct).toBeLessThanOrEqual(100);
      expect(d.badges.length).toBeGreaterThan(0);
    });
  });

  it('ROI calculator formulas', () => {
    const purchase = 2_000_000_000;
    const completion = 2_600_000_000;
    const rentalYield = 7.5;
    const years = 3;

    const capitalGain = completion - purchase;
    expect(capitalGain).toBe(600_000_000);

    const capitalGainPct = (capitalGain / purchase) * 100;
    expect(capitalGainPct).toBe(30);

    const annualized = (Math.pow(1 + capitalGainPct / 100, 1 / years) - 1) * 100;
    expect(annualized).toBeGreaterThan(9);
    expect(annualized).toBeLessThan(10);

    const monthlyRental = Math.round(completion * (rentalYield / 100) / 12);
    expect(monthlyRental).toBeGreaterThan(16_000_000);

    const breakEvenMonths = Math.ceil(purchase / monthlyRental);
    expect(breakEvenMonths).toBeGreaterThan(100);
    expect(breakEvenMonths).toBeLessThan(140);
  });

  it('city filter produces correct subsets', () => {
    const baliProjects = DEMO_PROJECTS.filter(p => p.city === 'Bali');
    expect(baliProjects.length).toBeGreaterThanOrEqual(2);
    baliProjects.forEach(p => expect(p.city).toBe('Bali'));
  });

  it('early bird and pre-launch flags exist', () => {
    const earlyBird = DEMO_PROJECTS.filter(p => p.isEarlyBird);
    const preLaunch = DEMO_PROJECTS.filter(p => p.isPreLaunch);
    expect(earlyBird.length).toBeGreaterThan(0);
    expect(preLaunch.length).toBeGreaterThan(0);
  });
});
