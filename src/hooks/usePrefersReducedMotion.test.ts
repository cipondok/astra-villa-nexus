import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

describe('usePrefersReducedMotion', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return false for prefersReducedMotion by default', () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current.prefersReducedMotion).toBe(false);
    expect(result.current.isOverridden).toBe(false);
  });

  it('should detect system preference for reduced motion', () => {
    // Mock matchMedia to return matches: true
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current.prefersReducedMotion).toBe(true);
  });

  it('should toggle manual override', () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    
    act(() => {
      result.current.toggleOverride();
    });

    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.isOverridden).toBe(true);
    expect(localStorage.getItem('dev-reduced-motion-override')).toBe('true');

    act(() => {
      result.current.toggleOverride();
    });

    expect(result.current.prefersReducedMotion).toBe(false);
    expect(result.current.isOverridden).toBe(true);
    expect(localStorage.getItem('dev-reduced-motion-override')).toBe('false');
  });

  it('should clear manual override', () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    
    // Set override
    act(() => {
      result.current.toggleOverride();
    });
    expect(result.current.isOverridden).toBe(true);

    // Clear override
    act(() => {
      result.current.clearOverride();
    });

    expect(result.current.isOverridden).toBe(false);
    expect(localStorage.getItem('dev-reduced-motion-override')).toBeNull();
  });

  it('should load override from localStorage on mount', () => {
    localStorage.setItem('dev-reduced-motion-override', 'true');
    
    const { result } = renderHook(() => usePrefersReducedMotion());
    
    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.isOverridden).toBe(true);
  });

  it('should prioritize manual override over system preference', () => {
    // Mock system preference as false
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => usePrefersReducedMotion());
    
    // Manual override to true
    act(() => {
      result.current.toggleOverride();
    });

    // Should be true despite system preference being false
    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.isOverridden).toBe(true);
  });

  it('should log to console when toggling override', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const { result } = renderHook(() => usePrefersReducedMotion());
    
    act(() => {
      result.current.toggleOverride();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Dev Override: Reduced motion manually set to')
    );
  });

  it('should log to console when clearing override', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const { result } = renderHook(() => usePrefersReducedMotion());
    
    act(() => {
      result.current.toggleOverride();
      result.current.clearOverride();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Dev Override: Cleared')
    );
  });
});
