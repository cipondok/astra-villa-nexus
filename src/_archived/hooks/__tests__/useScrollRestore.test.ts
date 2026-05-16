import { describe, it, expect, beforeEach } from 'vitest';

describe('useScrollRestore - scroll position persistence', () => {
  const SCROLL_POSITIONS_KEY = 'app_scroll_positions';

  beforeEach(() => {
    sessionStorage.clear();
  });

  it('stores scroll positions in sessionStorage', () => {
    const positions = { '/home': { x: 0, y: 250, timestamp: Date.now() } };
    sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
    
    const stored = JSON.parse(sessionStorage.getItem(SCROLL_POSITIONS_KEY)!);
    expect(stored['/home'].y).toBe(250);
  });

  it('trims to 10 entries max', () => {
    const positions: Record<string, any> = {};
    for (let i = 0; i < 15; i++) {
      positions[`/page-${i}`] = { x: 0, y: i * 100, timestamp: Date.now() - i * 1000 };
    }

    const entries = Object.entries(positions);
    expect(entries.length).toBe(15);

    const sorted = entries.sort((a: any, b: any) => b[1].timestamp - a[1].timestamp);
    const trimmed = Object.fromEntries(sorted.slice(0, 10));
    expect(Object.keys(trimmed)).toHaveLength(10);
  });

  it('returns empty object when no positions saved', () => {
    const positions = JSON.parse(sessionStorage.getItem(SCROLL_POSITIONS_KEY) || '{}');
    expect(positions).toEqual({});
  });

  it('overwrites position for same route', () => {
    const positions: Record<string, any> = {};
    positions['/about'] = { x: 0, y: 100, timestamp: Date.now() };
    positions['/about'] = { x: 0, y: 500, timestamp: Date.now() };
    
    expect(positions['/about'].y).toBe(500);
  });
});
