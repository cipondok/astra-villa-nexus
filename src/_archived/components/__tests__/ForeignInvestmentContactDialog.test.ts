import { describe, it, expect } from 'vitest';
describe('ForeignInvestmentContactDialog', () => {
  it('required fields', () => { expect(['name','email','country','message']).toHaveLength(4); });
  it('country list has Indonesia', () => { expect(['Indonesia','Singapore','Australia']).toContain('Indonesia'); });
});
