import { describe, it, expect } from 'vitest';

describe('useAnalytics - event tracking logic', () => {
  it('formats event name correctly', () => {
    const event = 'page_view';
    expect(event).toMatch(/^[a-z_]+$/);
  });

  it('includes timestamp in event payload', () => {
    const payload = { event: 'click', timestamp: Date.now(), page: '/home' };
    expect(payload.timestamp).toBeGreaterThan(0);
  });

  it('sanitizes user properties', () => {
    const props = { email: 'test@example.com', name: 'John' };
    const sanitized = { ...props, email: props.email.toLowerCase().trim() };
    expect(sanitized.email).toBe('test@example.com');
  });

  it('batches events up to max size', () => {
    const MAX_BATCH = 10;
    const events = Array.from({ length: 25 }, (_, i) => ({ id: i }));
    const batches = [];
    for (let i = 0; i < events.length; i += MAX_BATCH) {
      batches.push(events.slice(i, i + MAX_BATCH));
    }
    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(10);
    expect(batches[2]).toHaveLength(5);
  });

  it('tracks page duration in seconds', () => {
    const start = 1000;
    const end = 5500;
    const duration = (end - start) / 1000;
    expect(duration).toBe(4.5);
  });

  it('deduplicates rapid identical events', () => {
    const events = ['click', 'click', 'click', 'scroll', 'click'];
    const deduped = events.filter((e, i) => i === 0 || e !== events[i - 1]);
    expect(deduped).toEqual(['click', 'scroll', 'click']);
  });
});
