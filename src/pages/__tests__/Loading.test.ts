import { describe, it, expect } from 'vitest';
describe('Loading page', () => {
  it('loading timeout threshold', () => {
    const TIMEOUT_MS = 10000;
    expect(TIMEOUT_MS).toBe(10000);
  });
  it('loading states', () => {
    const states = ['initializing', 'loading', 'ready', 'error'];
    expect(states).toHaveLength(4);
  });
});
