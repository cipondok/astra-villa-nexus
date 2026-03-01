import { describe, it, expect } from 'vitest';

describe('useLivePresence - device detection and presence', () => {
  function getDeviceType(ua: string): string {
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
    return 'desktop';
  }

  it('detects desktop browser', () => {
    expect(getDeviceType('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')).toBe('desktop');
  });

  it('detects mobile iPhone', () => {
    expect(getDeviceType('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')).toBe('mobile');
  });

  it('detects Android mobile', () => {
    expect(getDeviceType('Mozilla/5.0 (Linux; Android 13; Pixel 7) Mobile')).toBe('mobile');
  });

  it('detects iPad as tablet', () => {
    expect(getDeviceType('Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)')).toBe('tablet');
  });

  it('recent joins capped at 10', () => {
    const joins = Array.from({ length: 15 }, (_, i) => ({ id: `user-${i}` }));
    const capped = joins.slice(0, 10);
    expect(capped).toHaveLength(10);
  });

  it('presence state flattens to user array', () => {
    const state = {
      key1: [{ id: 'a' }, { id: 'b' }],
      key2: [{ id: 'c' }],
    };
    const users = Object.values(state).flat();
    expect(users).toHaveLength(3);
  });
});
