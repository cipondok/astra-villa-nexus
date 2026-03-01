import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCookieConsent } from '../useCookieConsent';

const KEY = 'astra-villa-cookie-consent';

describe('useCookieConsent', () => {
  beforeEach(() => localStorage.clear());

  it('shows banner when no consent stored', () => {
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.showBanner).toBe(true);
    expect(result.current.hasConsented).toBeNull();
  });

  it('hides banner when previously accepted', () => {
    localStorage.setItem(KEY, 'accepted');
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.showBanner).toBe(false);
    expect(result.current.hasConsented).toBe(true);
  });

  it('hides banner when previously rejected', () => {
    localStorage.setItem(KEY, 'rejected');
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.showBanner).toBe(false);
    expect(result.current.hasConsented).toBe(false);
  });

  it('acceptCookies sets consent and hides banner', () => {
    const { result } = renderHook(() => useCookieConsent());
    act(() => result.current.acceptCookies());
    expect(result.current.hasConsented).toBe(true);
    expect(result.current.showBanner).toBe(false);
    expect(localStorage.getItem(KEY)).toBe('accepted');
  });

  it('rejectCookies sets consent false and hides banner', () => {
    const { result } = renderHook(() => useCookieConsent());
    act(() => result.current.rejectCookies());
    expect(result.current.hasConsented).toBe(false);
    expect(result.current.showBanner).toBe(false);
    expect(localStorage.getItem(KEY)).toBe('rejected');
  });

  it('resetConsent clears storage and shows banner', () => {
    localStorage.setItem(KEY, 'accepted');
    const { result } = renderHook(() => useCookieConsent());
    act(() => result.current.resetConsent());
    expect(result.current.hasConsented).toBeNull();
    expect(result.current.showBanner).toBe(true);
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
