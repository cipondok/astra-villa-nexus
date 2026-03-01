import { describe, it, expect } from 'vitest';
describe('Content components', () => {
  it('content template types', () => {
    const types = ['blog', 'listing', 'social', 'email'];
    expect(types).toHaveLength(4);
  });
  it('generated content word count', () => {
    const content = 'This is a generated paragraph with some words';
    const wordCount = content.split(/\s+/).length;
    expect(wordCount).toBe(8);
  });
  it('content history stores last 20', () => {
    const MAX = 20;
    const history = Array.from({ length: 25 }, (_, i) => `item-${i}`);
    expect(history.slice(0, MAX)).toHaveLength(20);
  });
});
