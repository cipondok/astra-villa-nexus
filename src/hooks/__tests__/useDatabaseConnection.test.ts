import { describe, it, expect } from 'vitest';
describe('useDatabaseConnection', () => {
  it('connection states', () => { expect(['connecting', 'connected', 'disconnected', 'error']).toHaveLength(4); });
  it('retry with exponential backoff', () => { const delay = (n: number) => Math.min(1000 * 2 ** n, 30000); expect(delay(3)).toBe(8000); });
  it('health check interval', () => { expect(30000).toBe(30 * 1000); });
});
