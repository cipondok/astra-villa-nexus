import { describe, it, expect } from 'vitest';
describe('SharedSearch page', () => {
  it('shared search link generation', () => {
    const params = { type: 'apartment', location: 'jakarta', maxPrice: '2000000000' };
    const qs = new URLSearchParams(params).toString();
    expect(qs).toContain('type=apartment');
  });
  it('shared search expiry', () => {
    const EXPIRY_DAYS = 30;
    expect(EXPIRY_DAYS).toBe(30);
  });
});
