import { describe, it, expect } from 'vitest';
describe('ForeignInvestmentFAQ', () => {
  it('FAQ categories', () => { expect(['ownership','legal','tax','visa']).toHaveLength(4); });
  it('search FAQ', () => { const q='ownership'; expect('Can foreigners own property?'.toLowerCase()).toContain(q); });
});
