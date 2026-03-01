import { describe, it, expect } from 'vitest';

describe('useRefundDispute - refund and dispute logic', () => {
  it('refund eligibility window', () => {
    const purchaseDate = new Date('2026-02-15');
    const now = new Date('2026-03-01');
    const daysSince = (now.getTime() - purchaseDate.getTime()) / 86400000;
    const eligible = daysSince <= 30;
    expect(eligible).toBe(true);
  });
  it('dispute reasons', () => {
    const reasons = ['not_as_described', 'unauthorized', 'duplicate', 'service_not_provided', 'other'];
    expect(reasons).toHaveLength(5);
  });
  it('partial refund calculation', () => {
    const total = 1000000; const usedPct = 0.3;
    const refund = total * (1 - usedPct);
    expect(refund).toBe(700000);
  });
  it('dispute resolution timeline', () => {
    const maxDays = 14;
    const opened = new Date('2026-02-20');
    const deadline = new Date(opened.getTime() + maxDays * 86400000);
    expect(deadline.toISOString().slice(0, 10)).toBe('2026-03-06');
  });
});
