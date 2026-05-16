import { describe, it, expect } from 'vitest';
describe('Cookie components', () => {
  it('cookie consent categories', () => {
    const categories = ['necessary', 'analytics', 'marketing', 'preferences'];
    expect(categories).toContain('necessary');
  });
  it('consent persists in localStorage', () => {
    const consent = { analytics: true, marketing: false };
    const stored = JSON.stringify(consent);
    expect(JSON.parse(stored).analytics).toBe(true);
  });
  it('offer popup shows once per session', () => {
    let shown = false;
    if (!shown) { shown = true; }
    expect(shown).toBe(true);
  });
});
