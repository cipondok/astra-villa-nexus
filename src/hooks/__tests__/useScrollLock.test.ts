import { describe, it, expect, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollLock } from '../useScrollLock';

describe('useScrollLock', () => {
  afterEach(() => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  });

  it('locks scroll when true', () => {
    renderHook(() => useScrollLock(true));
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('does not lock scroll when false', () => {
    renderHook(() => useScrollLock(false));
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.body.style.overflow).toBe('');
  });

  it('unlocks on unmount', () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.body.style.overflow).toBe('');
  });

  it('toggles lock when value changes', () => {
    const { rerender } = renderHook(({ lock }) => useScrollLock(lock), {
      initialProps: { lock: false },
    });
    expect(document.body.style.overflow).toBe('');
    rerender({ lock: true });
    expect(document.body.style.overflow).toBe('hidden');
    rerender({ lock: false });
    expect(document.body.style.overflow).toBe('');
  });
});
