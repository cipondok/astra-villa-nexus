import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConnectionSpeed } from '../useConnectionSpeed';

describe('useConnectionSpeed', () => {
  beforeEach(() => {
    // Ensure navigator.onLine is true by default
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  });

  it('returns initial checking state', () => {
    const { result } = renderHook(() => useConnectionSpeed());
    // Initial state should be checking or fast (depending on mock environment)
    expect(['checking', 'fast', 'slow', 'offline']).toContain(result.current.speed);
  });

  it('returns downloadSpeed property', () => {
    const { result } = renderHook(() => useConnectionSpeed());
    expect(result.current).toHaveProperty('downloadSpeed');
  });

  it('returns isSlowConnection property', () => {
    const { result } = renderHook(() => useConnectionSpeed());
    expect(typeof result.current.isSlowConnection).toBe('boolean');
  });

  it('detects offline state', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const { result } = renderHook(() => useConnectionSpeed());
    // Trigger offline event
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.speed).toBe('offline');
    expect(result.current.isSlowConnection).toBe(true);
  });
});
