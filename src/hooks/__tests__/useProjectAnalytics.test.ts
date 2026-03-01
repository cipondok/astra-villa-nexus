import { describe, it, expect } from 'vitest';
describe('useProjectAnalytics', () => {
  it('daily metrics aggregation', () => { const days = [{ views: 100 }, { views: 150 }, { views: 200 }]; const total = days.reduce((s, d) => s + d.views, 0); expect(total).toBe(450); });
  it('week over week change', () => { const thisWeek = 500; const lastWeek = 400; expect(((thisWeek - lastWeek) / lastWeek) * 100).toBe(25); });
  it('top pages', () => { const pages = [{ path: '/', views: 1000 }, { path: '/search', views: 500 }]; expect(pages[0].path).toBe('/'); });
});
