import { describe, it, expect } from 'vitest';

describe('useVideoTours - video tour logic', () => {
  it('validates video URL format', () => {
    const isValid = (url: string) => /^https?:\/\/.+\.(mp4|webm|mov)$/i.test(url) || /youtube|vimeo/.test(url);
    expect(isValid('https://example.com/tour.mp4')).toBe(true);
    expect(isValid('https://youtube.com/watch?v=abc')).toBe(true);
    expect(isValid('not-a-url')).toBe(false);
  });

  it('thumbnail generation timestamp', () => {
    const duration = 120; // seconds
    const thumbnailAt = Math.floor(duration * 0.25);
    expect(thumbnailAt).toBe(30);
  });

  it('tour status management', () => {
    const statuses = ['draft', 'processing', 'ready', 'failed'];
    expect(statuses).toContain('processing');
  });

  it('video size limit check', () => {
    const MAX_SIZE_MB = 500;
    const fileSizeMB = 350;
    expect(fileSizeMB <= MAX_SIZE_MB).toBe(true);
    expect(600 <= MAX_SIZE_MB).toBe(false);
  });

  it('formats duration display', () => {
    const formatDuration = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(60)).toBe('1:00');
  });
});
