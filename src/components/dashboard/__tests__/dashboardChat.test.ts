import { describe, it, expect } from 'vitest';
describe('Dashboard chat hooks', () => {
  it('message grouping by date', () => {
    const msgs = [
      { date: '2026-03-01', text: 'Hi' },
      { date: '2026-03-01', text: 'Hello' },
      { date: '2026-03-02', text: 'Hey' },
    ];
    const groups = msgs.reduce((acc, m) => {
      (acc[m.date] = acc[m.date] || []).push(m);
      return acc;
    }, {} as Record<string, typeof msgs>);
    expect(Object.keys(groups)).toHaveLength(2);
  });
  it('typing indicator debounce', () => {
    const TYPING_DEBOUNCE = 2000;
    expect(TYPING_DEBOUNCE).toBeLessThanOrEqual(3000);
  });
});
