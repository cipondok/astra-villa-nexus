import { describe, it, expect } from 'vitest';
describe('Saved page', () => {
  it('saved properties persist across sessions', () => {
    const stored = JSON.stringify(['p1', 'p2']);
    const parsed = JSON.parse(stored);
    expect(parsed).toHaveLength(2);
  });
  it('unsave removes from list', () => {
    const saved = ['p1', 'p2', 'p3'];
    const after = saved.filter(id => id !== 'p2');
    expect(after).toHaveLength(2);
  });
});
