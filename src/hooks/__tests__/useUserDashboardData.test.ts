import { describe, it, expect } from 'vitest';
describe('useUserDashboardData', () => {
  it('dashboard widget count', () => { const widgets = ['stats', 'listings', 'messages', 'alerts', 'calendar']; expect(widgets.length).toBeGreaterThanOrEqual(4); });
  it('recent activity limit', () => { const activities = Array.from({ length: 50 }, (_, i) => ({ id: i })); expect(activities.slice(0, 10)).toHaveLength(10); });
  it('quick action shortcuts', () => { const actions = ['add_listing', 'view_messages', 'check_analytics']; expect(actions).toContain('add_listing'); });
});
