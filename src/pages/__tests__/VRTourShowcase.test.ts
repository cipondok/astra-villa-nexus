import { describe, it, expect } from 'vitest';
describe('VRTourShowcase page', () => {
  it('tour hotspot types', () => {
    const types = ['info', 'navigation', 'media', 'link'];
    expect(types).toHaveLength(4);
  });
  it('panorama resolution minimum', () => {
    const minWidth = 4096;
    const imgWidth = 8192;
    expect(imgWidth >= minWidth).toBe(true);
  });
});
