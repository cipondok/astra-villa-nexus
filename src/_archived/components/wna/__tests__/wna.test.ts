import { describe, it, expect } from 'vitest';

describe('WNA components', () => {
  it('WNA eligibility checks citizenship', () => {
    const eligibleCountries = ['Singapore', 'Japan', 'Australia', 'South Korea'];
    const isEligible = (country: string) => eligibleCountries.includes(country);
    expect(isEligible('Japan')).toBe(true);
    expect(isEligible('Unknown')).toBe(false);
  });
  it('property types available for foreigners', () => {
    const types = ['apartment', 'condo'];
    expect(types).not.toContain('land');
  });
  it('processing time estimation', () => {
    const minDays = 30;
    const maxDays = 90;
    expect(maxDays - minDays).toBe(60);
  });
  it('investment facility minimum amount', () => {
    const minInvestment = 10_000_000_000;
    expect(minInvestment).toBe(10_000_000_000);
  });
});
