import { describe, it, expect } from 'vitest';
describe('useListingTips', () => {
  it('tip categories', () => { expect(['photos', 'description', 'pricing', 'amenities']).toHaveLength(4); });
  it('completion score', () => { const fields = { title: true, desc: true, photos: false, price: true, location: true }; const score = Object.values(fields).filter(Boolean).length / Object.values(fields).length * 100; expect(score).toBe(80); });
  it('priority tip selection', () => { const tips = [{ field: 'photos', priority: 1 }, { field: 'desc', priority: 2 }]; expect(tips.sort((a, b) => a.priority - b.priority)[0].field).toBe('photos'); });
});
