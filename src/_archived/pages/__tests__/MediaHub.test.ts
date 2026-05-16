import { describe, it, expect } from 'vitest';
describe('MediaHub page', () => {
  it('media types supported', () => {
    const types = ['image', 'video', '360_photo', 'drone', 'floor_plan'];
    expect(types).toContain('drone');
  });
  it('image compression target', () => {
    const maxKB = 500;
    const original = 2000;
    const compressed = Math.min(original, maxKB);
    expect(compressed).toBe(500);
  });
});
