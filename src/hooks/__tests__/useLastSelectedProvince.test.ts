import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLastSelectedProvince } from '../useLastSelectedProvince';

const KEY = 'lastSelectedProvince';

describe('useLastSelectedProvince', () => {
  beforeEach(() => localStorage.clear());

  it('starts null when nothing stored', () => {
    const { result } = renderHook(() => useLastSelectedProvince());
    expect(result.current.lastProvince).toBeNull();
  });

  it('loads from localStorage on init', () => {
    const data = { id: '1', name: 'Jakarta', code: 'JK', selectedAt: 1000 };
    localStorage.setItem(KEY, JSON.stringify(data));
    const { result } = renderHook(() => useLastSelectedProvince());
    expect(result.current.lastProvince?.name).toBe('Jakarta');
  });

  it('saves province with timestamp', () => {
    const { result } = renderHook(() => useLastSelectedProvince());
    act(() => result.current.saveLastProvince({ id: '2', name: 'Bali', code: 'BA' }));
    expect(result.current.lastProvince?.name).toBe('Bali');
    expect(result.current.lastProvince?.selectedAt).toBeGreaterThan(0);
    expect(JSON.parse(localStorage.getItem(KEY)!).name).toBe('Bali');
  });

  it('clears province', () => {
    const { result } = renderHook(() => useLastSelectedProvince());
    act(() => result.current.saveLastProvince({ id: '1', name: 'X', code: 'X' }));
    act(() => result.current.clearLastProvince());
    expect(result.current.lastProvince).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(KEY, 'not-json');
    const { result } = renderHook(() => useLastSelectedProvince());
    expect(result.current.lastProvince).toBeNull();
  });
});
