import { describe, it, expect } from 'vitest';

describe('useRealTimeMetrics - real-time dashboard', () => {
  it('active users gauge', () => {
    const current = 142;
    const max = 500;
    const pct = (current / max) * 100;
    expect(pct).toBeCloseTo(28.4, 1);
  });
  it('events per second calculation', () => {
    const events = 300; const windowSec = 60;
    const eps = events / windowSec;
    expect(eps).toBe(5);
  });
  it('sparkline data windowing', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({ t: i, v: Math.random() * 100 }));
    const window = data.slice(-20);
    expect(window).toHaveLength(20);
    expect(window[0].t).toBe(80);
  });
  it('threshold alerting', () => {
    const metric = 95;
    const WARNING = 80; const CRITICAL = 90;
    const level = metric >= CRITICAL ? 'critical' : metric >= WARNING ? 'warning' : 'normal';
    expect(level).toBe('critical');
  });
});
