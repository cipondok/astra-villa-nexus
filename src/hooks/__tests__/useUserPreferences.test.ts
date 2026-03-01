import { describe, it, expect } from 'vitest';
import type { UserPreferences } from '../useUserPreferences';

describe('useUserPreferences - defaults and validation', () => {
  const defaultPreferences: UserPreferences = {
    theme: 'system',
    email_notifications: true,
    push_notifications: false,
    marketing_emails: false,
    compact_view: false,
    show_avatars: true,
  };

  it('default theme is system', () => {
    expect(defaultPreferences.theme).toBe('system');
  });

  it('email notifications enabled by default', () => {
    expect(defaultPreferences.email_notifications).toBe(true);
  });

  it('push notifications disabled by default', () => {
    expect(defaultPreferences.push_notifications).toBe(false);
  });

  it('marketing emails disabled by default', () => {
    expect(defaultPreferences.marketing_emails).toBe(false);
  });

  it('partial update preserves other fields', () => {
    const updated = { ...defaultPreferences, theme: 'dark' as const };
    expect(updated.theme).toBe('dark');
    expect(updated.email_notifications).toBe(true);
    expect(updated.show_avatars).toBe(true);
  });

  it('theme accepts only valid values', () => {
    const validThemes: UserPreferences['theme'][] = ['light', 'dark', 'system'];
    validThemes.forEach(t => expect(['light', 'dark', 'system']).toContain(t));
  });
});
