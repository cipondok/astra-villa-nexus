import { describe, it, expect } from 'vitest';
import { modelRevenue } from '../revenueMilestone';

const BASE: Parameters<typeof modelRevenue>[0] = {
  avg_deal_value: 2_500_000_000, commission_rate_pct: 2, deals_closed_month: 5,
  investor_subscribers: 20, investor_arpu: 500_000, vendor_subscribers: 15, vendor_arpu: 750_000,
  premium_slots_sold: 10, slot_price: 1_500_000, monthly_revenue_target: 500_000_000,
};

describe('modelRevenue', () => {
  it('calculates total correctly', () => {
    const r = modelRevenue(BASE);
    const expected = 2_500_000_000 * 0.02 * 5 + 20 * 500_000 + 15 * 750_000 + 10 * 1_500_000;
    expect(r.total_monthly_revenue).toBe(expected);
  });

  it('3 streams sum to total', () => {
    const r = modelRevenue(BASE);
    const sum = r.streams.reduce((s, st) => s + st.revenue, 0);
    expect(sum).toBe(r.total_monthly_revenue);
  });

  it('ACHIEVED when exceeding target', () => {
    const r = modelRevenue({ ...BASE, monthly_revenue_target: 100_000_000 });
    expect(r.status).toBe('ACHIEVED');
    expect(r.gap.shortfall).toBe(0);
  });

  it('BEHIND when far from target', () => {
    const r = modelRevenue({ ...BASE, deals_closed_month: 0, investor_subscribers: 0, vendor_subscribers: 0, premium_slots_sold: 0 });
    expect(r.status).toBe('BEHIND');
    expect(r.gap.shortfall).toBe(BASE.monthly_revenue_target);
  });

  it('gap.deals_needed is sensible', () => {
    const r = modelRevenue({ ...BASE, deals_closed_month: 0, monthly_revenue_target: 250_000_000 });
    expect(r.gap.deals_needed).toBeGreaterThan(0);
    expect(r.gap.deals_needed).toBeLessThan(20);
  });

  it('generates priority actions when not achieved', () => {
    const r = modelRevenue(BASE);
    if (r.status !== 'ACHIEVED') {
      expect(r.priority_actions.length).toBeGreaterThan(0);
    }
  });
});
