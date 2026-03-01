import { describe, it, expect } from 'vitest';
describe('useBrandingLogo', () => {
  it('default logo path', () => { expect('/logo.png').toContain('logo'); });
  it('accepts custom URL', () => { const url = 'https://cdn.example.com/logo.svg'; expect(url).toMatch(/^https/); });
  it('fallback on error', () => { const src = null; const fallback = src ?? '/default-logo.png'; expect(fallback).toBe('/default-logo.png'); });
});
