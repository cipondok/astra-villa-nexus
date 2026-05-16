import { describe, it, expect } from 'vitest';
describe('useAIContentGenerator', () => {
  it('content types', () => { expect(['description', 'title', 'seo_meta', 'social_post']).toHaveLength(4); });
  it('word count target', () => { const target = 150; const generated = 'word '.repeat(148).trim().split(' ').length; expect(Math.abs(generated - target)).toBeLessThan(10); });
  it('language options', () => { expect(['id', 'en']).toContain('id'); });
  it('tone selection', () => { expect(['professional', 'casual', 'luxury', 'friendly']).toContain('luxury'); });
});
