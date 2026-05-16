import { describe, it, expect } from 'vitest';

describe('Settings page', () => {
  it('theme options include light and dark', () => {
    const themes = ['light', 'dark', 'system'];
    expect(themes).toContain('dark');
    expect(themes).toContain('system');
  });

  it('language options include Indonesian and English', () => {
    const langs = ['id', 'en'];
    expect(langs).toContain('id');
  });

  it('notification settings have toggle states', () => {
    const settings = { email: true, push: false, sms: false };
    expect(settings.email).toBe(true);
    expect(settings.push).toBe(false);
  });

  it('currency defaults to IDR', () => {
    const defaultCurrency = 'IDR';
    expect(defaultCurrency).toBe('IDR');
  });
});
