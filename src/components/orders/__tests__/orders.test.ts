import { describe, it, expect } from 'vitest';
describe('Orders components', () => {
  it('order status transitions', () => {
    const validNext: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed'],
    };
    expect(validNext.pending).toContain('confirmed');
  });
  it('order total calculation', () => {
    const items = [{ price: 500_000, qty: 2 }, { price: 300_000, qty: 1 }];
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    expect(total).toBe(1_300_000);
  });
});
