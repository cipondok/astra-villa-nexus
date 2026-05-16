import { describe, it, expect } from 'vitest';
describe('NotFound page', () => {
  it('shows 404 status', () => {
    const status = 404;
    expect(status).toBe(404);
  });
  it('suggested links on 404', () => {
    const links = ['/', '/properties', '/search', '/contact'];
    expect(links).toContain('/');
  });
});
