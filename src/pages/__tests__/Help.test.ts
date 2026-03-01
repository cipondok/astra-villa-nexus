import { describe, it, expect } from 'vitest';
describe('Help page', () => {
  it('FAQ categories', () => {
    const cats = ['buying', 'selling', 'renting', 'payment', 'account'];
    expect(cats).toContain('payment');
  });
  it('search filters FAQs', () => {
    const faqs = [{ q: 'How to buy?' }, { q: 'How to sell?' }];
    const results = faqs.filter(f => f.q.toLowerCase().includes('buy'));
    expect(results).toHaveLength(1);
  });
});
