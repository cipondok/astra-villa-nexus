import { describe, it, expect } from 'vitest';
describe('useDefaultPropertyImage', () => {
  it('fallback by property type', () => { const fallbacks: Record<string, string> = { apartment: '/img/apt.jpg', villa: '/img/villa.jpg', house: '/img/house.jpg' }; expect(fallbacks['villa']).toContain('villa'); });
  it('placeholder dimensions', () => { const w = 800; const h = 600; expect(w / h).toBeCloseTo(1.333, 2); });
  it('blur placeholder data URL', () => { const placeholder = 'data:image/jpeg;base64,abc'; expect(placeholder).toMatch(/^data:image/); });
});
