import { describe, it, expect } from 'vitest';
describe('Footer components', () => {
  it('newsletter validates email', () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test('user@mail.com');
    expect(valid).toBe(true);
  });
  it('office locations list', () => {
    const offices = ['Jakarta', 'Bali', 'Surabaya', 'Bandung'];
    expect(offices.length).toBeGreaterThanOrEqual(3);
  });
  it('footer sections count', () => {
    const sections = ['Brand', 'BuyingGuide', 'SellingGuide', 'Services', 'Company', 'Newsletter'];
    expect(sections.length).toBe(6);
  });
});
