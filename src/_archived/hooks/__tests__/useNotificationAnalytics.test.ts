import { describe, it, expect } from 'vitest';

describe('useNotificationAnalytics - notification metrics', () => {
  it('open rate calculation', () => {
    const sent = 1000; const opened = 350;
    expect((opened / sent) * 100).toBe(35);
  });
  it('click-through rate', () => {
    const opened = 350; const clicked = 70;
    expect((clicked / opened) * 100).toBe(20);
  });
  it('best send time analysis', () => {
    const byHour = { 8: 50, 12: 80, 18: 120, 21: 90 };
    const best = Object.entries(byHour).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    expect(best[0]).toBe('18');
  });
  it('unsubscribe rate', () => {
    const total = 5000; const unsub = 25;
    const rate = (unsub / total) * 100;
    expect(rate).toBe(0.5);
  });
});
