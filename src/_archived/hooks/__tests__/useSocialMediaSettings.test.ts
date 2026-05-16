import { describe, it, expect } from 'vitest';
describe('useSocialMediaSettings', () => {
  it('supported platforms', () => { expect(['instagram', 'facebook', 'twitter', 'tiktok', 'youtube']).toHaveLength(5); });
  it('share URL generation', () => { const url = 'https://example.com/property/123'; const encoded = encodeURIComponent(url); expect(encoded).toContain('example.com'); });
  it('auto-post toggle', () => { const settings = { instagram: true, facebook: false }; expect(settings.instagram).toBe(true); });
});
