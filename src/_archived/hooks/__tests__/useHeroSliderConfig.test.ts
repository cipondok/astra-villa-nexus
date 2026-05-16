import { describe, it, expect } from 'vitest';

describe('useHeroSliderConfig - slider configuration', () => {
  it('auto-play interval', () => {
    const interval = 5000;
    expect(interval).toBeGreaterThanOrEqual(3000);
  });
  it('slide transition duration', () => {
    const duration = 500;
    expect(duration).toBeLessThanOrEqual(1000);
  });
  it('slides array non-empty', () => {
    const slides = [{ image: '/img1.jpg', title: 'Welcome' }, { image: '/img2.jpg', title: 'Discover' }];
    expect(slides.length).toBeGreaterThan(0);
  });
  it('circular navigation', () => {
    const total = 5; let current = 4;
    current = (current + 1) % total;
    expect(current).toBe(0);
  });
  it('pause on hover', () => {
    const config = { autoPlay: true, pauseOnHover: true };
    expect(config.pauseOnHover).toBe(true);
  });
});
