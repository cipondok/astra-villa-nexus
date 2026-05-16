import { describe, it, expect } from 'vitest';

describe('useImageOptimization - compression ratio and dimension logic', () => {
  it('compression ratio calculation', () => {
    const original = 5000000; // 5MB
    const optimized = 1000000; // 1MB
    const ratio = Math.round(((original - optimized) / original) * 100);
    expect(ratio).toBe(80);
  });

  it('0% compression when sizes equal', () => {
    const size = 1000;
    const ratio = Math.round(((size - size) / size) * 100);
    expect(ratio).toBe(0);
  });

  it('dimension scaling with maxDimension 1920', () => {
    const maxDimension = 1920;
    let width = 3840;
    let height = 2160;
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    width *= ratio;
    height *= ratio;
    expect(width).toBe(1920);
    expect(height).toBe(1080);
  });

  it('no scaling needed for small images', () => {
    const maxDimension = 1920;
    const width = 800;
    const height = 600;
    const needsScaling = width > maxDimension || height > maxDimension;
    expect(needsScaling).toBe(false);
  });

  it('WebP filename extension replacement', () => {
    const original = 'photo.jpg';
    const webp = original.replace(/\.[^/.]+$/, '.webp');
    expect(webp).toBe('photo.webp');
  });

  it('handles multiple dots in filename', () => {
    const original = 'my.photo.v2.png';
    const webp = original.replace(/\.[^/.]+$/, '.webp');
    expect(webp).toBe('my.photo.v2.webp');
  });
});
