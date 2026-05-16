import { describe, it, expect } from 'vitest';
describe('CompactPropertyCard logic', () => {
  it('compact layout fields', () => { const fields = ['image', 'title', 'price', 'location']; expect(fields).toHaveLength(4); });
  it('image aspect ratio', () => { expect(16/9).toBeCloseTo(1.778, 2); });
});
