import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIntersectionObserver } from '../useIntersectionObserver';

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class {
    constructor(public callback: IntersectionObserverCallback) {}
    observe = mockObserve;
    disconnect = mockDisconnect;
    unobserve = vi.fn();
  });
  mockObserve.mockClear();
  mockDisconnect.mockClear();
});

describe('useIntersectionObserver', () => {
  it('returns a ref and initial visibility false', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    const [ref, isVisible] = result.current;
    expect(ref).toBeDefined();
    expect(isVisible).toBe(false);
  });

  it('accepts custom options', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ threshold: 0.5, rootMargin: '0px' })
    );
    expect(result.current[1]).toBe(false);
  });

  it('disconnects on unmount', () => {
    const { unmount } = renderHook(() => useIntersectionObserver());
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
