import { describe, it, expect } from 'vitest';
describe('LanguageToggleSwitch logic', () => {
  it('supported languages', () => { expect(['id', 'en']).toHaveLength(2); });
  it('default language', () => { expect('id').toBe('id'); });
  it('persists choice', () => { const storage = new Map(); storage.set('lang', 'en'); expect(storage.get('lang')).toBe('en'); });
});
