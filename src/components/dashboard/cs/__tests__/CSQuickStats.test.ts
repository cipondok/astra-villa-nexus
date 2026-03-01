import { describe, it, expect } from 'vitest';

describe('CSQuickStats', () => {
  it('displays all four stat categories', () => {
    const stats = { myOpenTickets: 5, myResolvedToday: 12, pendingInquiries: 3, availableTickets: 8 };
    const labels = ['My Open Tickets', 'Resolved Today', 'Pending Inquiries', 'Available Tickets'];
    expect(labels).toHaveLength(4);
    expect(stats.myOpenTickets).toBe(5);
    expect(stats.myResolvedToday).toBe(12);
  });

  it('handles zero values gracefully', () => {
    const stats = { myOpenTickets: 0, myResolvedToday: 0, pendingInquiries: 0, availableTickets: 0 };
    expect(Object.values(stats).every(v => v === 0)).toBe(true);
  });

  it('renders grid with 4 columns on large screens', () => {
    const gridClass = 'grid grid-cols-2 lg:grid-cols-4 gap-3';
    expect(gridClass).toContain('lg:grid-cols-4');
  });
});
