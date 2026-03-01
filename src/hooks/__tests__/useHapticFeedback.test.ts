import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock the useIsMobile hook
vi.mock('../use-mobile', () => ({
  useIsMobile: () => ({ isMobile: true }),
}));

import { useHapticFeedback } from '../useHapticFeedback';

describe('useHapticFeedback', () => {
  let vibrateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vibrateMock = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateMock,
      writable: true,
      configurable: true,
    });
  });

  it('triggers light haptic pattern', () => {
    const { result } = renderHook(() => useHapticFeedback());
    result.current.triggerHaptic('light');
    expect(vibrateMock).toHaveBeenCalledWith(10);
  });

  it('triggers medium haptic pattern', () => {
    const { result } = renderHook(() => useHapticFeedback());
    result.current.triggerHaptic('medium');
    expect(vibrateMock).toHaveBeenCalledWith(20);
  });

  it('triggers heavy haptic pattern', () => {
    const { result } = renderHook(() => useHapticFeedback());
    result.current.triggerHaptic('heavy');
    expect(vibrateMock).toHaveBeenCalledWith(40);
  });

  it('triggers notification pattern', () => {
    const { result } = renderHook(() => useHapticFeedback());
    result.current.onNewMessage();
    expect(vibrateMock).toHaveBeenCalledWith([30, 50, 30]);
  });

  it('triggers warning pattern', () => {
    const { result } = renderHook(() => useHapticFeedback());
    result.current.onCountdownWarning();
    expect(vibrateMock).toHaveBeenCalledWith([20, 30, 20, 30, 20]);
  });

  it('triggers success pattern', () => {
    const { result } = renderHook(() => useHapticFeedback());
    result.current.triggerHaptic('success');
    expect(vibrateMock).toHaveBeenCalledWith([10, 20, 40]);
  });
});
