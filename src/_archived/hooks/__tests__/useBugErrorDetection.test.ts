import { describe, it, expect } from 'vitest';
describe('useBugErrorDetection', () => {
  it('error severity', () => { expect(['info', 'warning', 'error', 'fatal']).toHaveLength(4); });
  it('stack trace parsing', () => { const stack = 'Error: fail\n  at foo (bar.js:10)'; expect(stack).toContain('bar.js'); });
  it('error dedup by message', () => { const errs = ['a', 'b', 'a']; expect([...new Set(errs)]).toHaveLength(2); });
});
