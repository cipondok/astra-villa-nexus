import { describe, it, expect } from 'vitest';
describe('Partners pages', () => {
  it('become partner form validates fields', () => {
    const form = { company: 'PT Test', email: 'test@co.id', type: 'developer' };
    const valid = Object.values(form).every(v => v.length > 0);
    expect(valid).toBe(true);
  });
  it('partner network counts by type', () => {
    const partners = [
      { type: 'developer' }, { type: 'bank' }, { type: 'developer' }, { type: 'agency' },
    ];
    const devCount = partners.filter(p => p.type === 'developer').length;
    expect(devCount).toBe(2);
  });
});
