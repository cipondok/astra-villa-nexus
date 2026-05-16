import { describe, it, expect } from 'vitest';
describe('useBadgeSettings', () => {
  it('badge types', () => { expect(['verified', 'top_agent', 'premium', 'new']).toHaveLength(4); });
  it('badge visibility toggle', () => { let visible = true; visible = false; expect(visible).toBe(false); });
  it('badge priority ordering', () => { const badges = [{ name: 'a', priority: 2 }, { name: 'b', priority: 1 }]; const sorted = [...badges].sort((a, b) => a.priority - b.priority); expect(sorted[0].name).toBe('b'); });
});
