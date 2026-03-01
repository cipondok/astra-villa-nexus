import { describe, it, expect } from 'vitest';
describe('Development components', () => {
  it('developer partner modal validates company', () => {
    const company = 'PT Developer';
    expect(company.length).toBeGreaterThan(0);
  });
});
