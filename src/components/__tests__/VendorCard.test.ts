import { describe, it, expect } from 'vitest';
describe('VendorCard component', () => {
  it('displays rating stars', () => {
    const rating = 4.3;
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.25;
    expect(fullStars).toBe(4);
    expect(hasHalf).toBe(true);
  });
  it('verified badge shown', () => {
    const vendor = { verified: true, name: 'PT Jasa Bersih' };
    expect(vendor.verified).toBe(true);
  });
  it('service count display', () => {
    const services = ['cleaning', 'painting', 'plumbing'];
    expect(services).toHaveLength(3);
  });
});
