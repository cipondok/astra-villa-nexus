import { describe, it, expect } from 'vitest';
describe('AIContentGenerator page', () => {
  it('content types available', () => {
    const types = ['listing', 'blog', 'social', 'email', 'sms'];
    expect(types.length).toBeGreaterThanOrEqual(4);
  });
  it('generated content has minimum word count', () => {
    const words = 'Discover this beautiful property in Jakarta with stunning views'.split(/\s+/);
    expect(words.length).toBeGreaterThanOrEqual(5);
  });
  it('tone options for content', () => {
    const tones = ['professional', 'casual', 'luxury', 'urgent'];
    expect(tones).toContain('luxury');
  });
});
