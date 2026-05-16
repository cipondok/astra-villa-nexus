import { describe, it, expect } from 'vitest';
import { blobToFile, getCompressionRatio } from '../imageCompression';

describe('blobToFile', () => {
  it('converts blob to File with .webp extension', () => {
    const blob = new Blob(['test'], { type: 'image/webp' });
    const file = blobToFile(blob, 'photo.jpg');
    expect(file.name).toBe('photo.webp');
    expect(file.type).toBe('image/webp');
  });

  it('replaces any extension with .webp', () => {
    const blob = new Blob(['test'], { type: 'image/webp' });
    expect(blobToFile(blob, 'image.png').name).toBe('image.webp');
    expect(blobToFile(blob, 'pic.bmp').name).toBe('pic.webp');
  });

  it('returns a File instance', () => {
    const blob = new Blob(['data']);
    const file = blobToFile(blob, 'test.jpg');
    expect(file).toBeInstanceOf(File);
  });
});

describe('getCompressionRatio', () => {
  it('returns 50 for half-size compression', () => {
    expect(getCompressionRatio(1000, 500)).toBe(50);
  });

  it('returns 0 when sizes are equal', () => {
    expect(getCompressionRatio(1000, 1000)).toBe(0);
  });

  it('returns 100 when compressed to 0', () => {
    expect(getCompressionRatio(1000, 0)).toBe(100);
  });

  it('returns rounded percentage', () => {
    expect(getCompressionRatio(1000, 333)).toBe(67);
  });
});
