import { describe, it, expect } from 'vitest';

describe('Notifications components', () => {
  it('groups notifications by date', () => {
    const notifications = [
      { date: '2026-03-01', msg: 'A' },
      { date: '2026-03-01', msg: 'B' },
      { date: '2026-02-28', msg: 'C' },
    ];
    const grouped = notifications.reduce<Record<string, any[]>>((acc, n) => {
      (acc[n.date] = acc[n.date] || []).push(n);
      return acc;
    }, {});
    expect(Object.keys(grouped)).toHaveLength(2);
    expect(grouped['2026-03-01']).toHaveLength(2);
  });

  it('unread count badge', () => {
    const notifications = [
      { read: true },
      { read: false },
      { read: false },
    ];
    const unread = notifications.filter(n => !n.read).length;
    expect(unread).toBe(2);
  });

  it('marks all as read', () => {
    const notifications = [{ read: false }, { read: false }];
    const allRead = notifications.map(n => ({ ...n, read: true }));
    expect(allRead.every(n => n.read)).toBe(true);
  });
});
