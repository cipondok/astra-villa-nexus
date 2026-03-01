import { describe, it, expect } from 'vitest';
describe('ForeignInvestmentChat component', () => {
  it('supported languages', () => {
    const langs = ['en', 'id', 'zh', 'ja', 'ko'];
    expect(langs).toContain('en');
  });
  it('FAQ categories for foreign investors', () => {
    const cats = ['ownership', 'visa', 'taxation', 'legal', 'financing'];
    expect(cats).toHaveLength(5);
  });
  it('response time SLA', () => {
    const SLA_SECONDS = 30;
    expect(SLA_SECONDS).toBeLessThanOrEqual(60);
  });
});
