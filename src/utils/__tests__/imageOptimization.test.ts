import { describe, it, expect } from 'vitest';
import { formatFileSize } from '../imageOptimization';

describe('formatFileSize', () => {
  it('formats 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
  });

  it('formats with decimals', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('formats fractional MB', () => {
    const result = formatFileSize(2.5 * 1024 * 1024);
    expect(result).toBe('2.5 MB');
  });
});
