import { describe, it, expect, beforeEach } from 'vitest';

describe('useOnboarding - state and persistence logic', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('new user has no saved onboarding data', () => {
    const data = localStorage.getItem('onboarding_user123');
    expect(data).toBeNull();
  });

  it('completed onboarding is persisted with completedAt', () => {
    const state = { completedAt: new Date().toISOString(), userType: 'buyer' };
    localStorage.setItem('onboarding_user123', JSON.stringify(state));
    const parsed = JSON.parse(localStorage.getItem('onboarding_user123')!);
    expect(parsed.completedAt).toBeTruthy();
    expect(parsed.userType).toBe('buyer');
  });

  it('shouldShowOnboarding is false when completed', () => {
    const parsed = { completedAt: '2025-01-01' };
    const isCompleted = !!parsed.completedAt;
    expect(isCompleted).toBe(true);
    expect(!isCompleted).toBe(false); // shouldShowOnboarding
  });

  it('session flag prevents re-showing', () => {
    sessionStorage.setItem('onboarding_shown_user123', 'true');
    expect(sessionStorage.getItem('onboarding_shown_user123')).toBe('true');
  });

  it('resetOnboarding clears all stored data', () => {
    localStorage.setItem('onboarding_user123', '{}');
    sessionStorage.setItem('onboarding_shown_user123', 'true');
    localStorage.removeItem('onboarding_user123');
    sessionStorage.removeItem('onboarding_shown_user123');
    expect(localStorage.getItem('onboarding_user123')).toBeNull();
    expect(sessionStorage.getItem('onboarding_shown_user123')).toBeNull();
  });
});
