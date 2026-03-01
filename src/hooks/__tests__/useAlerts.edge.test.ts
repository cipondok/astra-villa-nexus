import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAlerts } from '../useAlerts';

describe('useAlerts edge cases', () => {
  it('removing non-existent id does not throw', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => result.current.addAlert('info', 'A', 'B'));
    act(() => result.current.removeAlert('nonexistent'));
    expect(result.current.alerts).toHaveLength(1);
  });

  it('supports multiple alerts of same type', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => {
      result.current.showError('E1', 'M1');
      result.current.showError('E2', 'M2');
      result.current.showError('E3', 'M3');
    });
    expect(result.current.alerts).toHaveLength(3);
    expect(result.current.alerts.every(a => a.type === 'error')).toBe(true);
  });

  it('clearAll on empty is safe', () => {
    const { result } = renderHook(() => useAlerts());
    act(() => result.current.clearAllAlerts());
    expect(result.current.alerts).toEqual([]);
  });
});
