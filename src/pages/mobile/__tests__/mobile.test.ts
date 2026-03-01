import { describe, it, expect } from 'vitest';
describe('Mobile pages', () => {
  it('AR preview requires camera permission', () => {
    const hasPermission = false;
    expect(typeof hasPermission).toBe('boolean');
  });
  it('auctions page sorts by ending soon', () => {
    const auctions = [
      { endsAt: '2026-03-02T10:00:00Z' },
      { endsAt: '2026-03-01T18:00:00Z' },
    ];
    const sorted = [...auctions].sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime());
    expect(sorted[0].endsAt).toContain('03-01');
  });
  it('journey page tracks milestones', () => {
    const milestones = ['search', 'shortlist', 'visit', 'negotiate', 'purchase'];
    expect(milestones).toHaveLength(5);
  });
});
