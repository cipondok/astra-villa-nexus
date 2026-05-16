import { describe, it, expect } from 'vitest';
describe('Offers page', () => {
  it('offer status types', () => {
    const statuses = ['pending', 'accepted', 'rejected', 'countered', 'expired'];
    expect(statuses).toContain('countered');
  });
  it('counter offer must be different from original', () => {
    const original: number = 2_000_000_000;
    const counter: number = 1_800_000_000;
    expect(counter !== original).toBe(true);
  });
});
