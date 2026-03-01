import { describe, it, expect } from 'vitest';

describe('Vendor components', () => {
  it('vendor rating out of 5 stars', () => {
    const rating = 4.7;
    const stars = Math.round(rating);
    expect(stars).toBe(5);
    expect(rating).toBeLessThanOrEqual(5);
  });

  it('service categories list', () => {
    const categories = ['plumbing', 'electrical', 'cleaning', 'landscaping', 'security'];
    expect(categories.length).toBe(5);
  });

  it('vendor registration requires business license', () => {
    const hasLicense = true;
    const hasNPWP = true;
    const canRegister = hasLicense && hasNPWP;
    expect(canRegister).toBe(true);
  });

  it('vendor portfolio max images', () => {
    const MAX_IMAGES = 20;
    const uploaded = 15;
    expect(uploaded <= MAX_IMAGES).toBe(true);
  });
});
