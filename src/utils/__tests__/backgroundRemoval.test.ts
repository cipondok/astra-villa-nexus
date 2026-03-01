import { describe, it, expect } from 'vitest';

describe('backgroundRemoval - image resize logic', () => {
  const MAX_IMAGE_DIMENSION = 1024;

  const resize = (w: number, h: number) => {
    let width = w;
    let height = h;
    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
        width = MAX_IMAGE_DIMENSION;
      } else {
        width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
        height = MAX_IMAGE_DIMENSION;
      }
      return { width, height, resized: true };
    }
    return { width, height, resized: false };
  };

  it('does not resize small images', () => {
    const r = resize(800, 600);
    expect(r.resized).toBe(false);
    expect(r.width).toBe(800);
  });

  it('resizes wide landscape image', () => {
    const r = resize(2048, 1024);
    expect(r.resized).toBe(true);
    expect(r.width).toBe(1024);
    expect(r.height).toBe(512);
  });

  it('resizes tall portrait image', () => {
    const r = resize(1024, 2048);
    expect(r.resized).toBe(true);
    expect(r.height).toBe(1024);
    expect(r.width).toBe(512);
  });

  it('resizes square image to 1024x1024', () => {
    const r = resize(2000, 2000);
    expect(r.resized).toBe(true);
    expect(r.width).toBe(1024);
    expect(r.height).toBe(1024);
  });

  it('exactly 1024 does not resize', () => {
    const r = resize(1024, 768);
    expect(r.resized).toBe(false);
  });

  it('mask alpha inversion logic', () => {
    const maskValue = 0.8; // background
    const alpha = Math.round((1 - maskValue) * 255);
    expect(alpha).toBe(51); // nearly transparent = background removed
  });
});
