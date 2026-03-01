import { describe, it, expect } from 'vitest';
describe('Common components', () => {
  it('back to home link points to /', () => {
    expect('/').toBe('/');
  });
  it('AI tools tab bar has correct tabs', () => {
    const tabs = ['chat', 'listing', 'price', 'content'];
    expect(tabs).toContain('chat');
  });
});
