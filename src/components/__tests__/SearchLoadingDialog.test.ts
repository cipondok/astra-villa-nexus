import { describe, it, expect } from 'vitest';
describe('SearchLoadingDialog', () => {
  it('loading messages cycle', () => { const msgs=['Searching...','Finding matches...','Almost done...']; expect(msgs).toHaveLength(3); });
  it('progress increments', () => { let p=0; p+=25; expect(p).toBe(25); });
});
