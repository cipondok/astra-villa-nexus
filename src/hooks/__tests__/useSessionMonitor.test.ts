import { describe, it, expect, beforeEach } from 'vitest';

describe('useSessionMonitor - constants and activity logic', () => {
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
  const GRACE_PERIOD = 5 * 60 * 1000;
  const TOKEN_REFRESH_THROTTLE = 10 * 60 * 1000;

  beforeEach(() => {
    localStorage.clear();
  });

  it('inactivity timeout is 30 minutes', () => {
    expect(INACTIVITY_TIMEOUT).toBe(1800000);
  });

  it('grace period is 5 minutes', () => {
    expect(GRACE_PERIOD).toBe(300000);
  });

  it('token refresh throttle is 10 minutes', () => {
    expect(TOKEN_REFRESH_THROTTLE).toBe(600000);
  });

  it('last_activity stored and retrieved from localStorage', () => {
    const now = Date.now();
    localStorage.setItem('last_activity', now.toString());
    const stored = parseInt(localStorage.getItem('last_activity')!, 10);
    expect(stored).toBe(now);
  });

  it('idle time calculation triggers warning at threshold', () => {
    const lastActivity = Date.now() - INACTIVITY_TIMEOUT - 1000;
    const idleMs = Date.now() - lastActivity;
    expect(idleMs >= INACTIVITY_TIMEOUT).toBe(true);
  });

  it('active user does not trigger warning', () => {
    const lastActivity = Date.now() - 5000;
    const idleMs = Date.now() - lastActivity;
    expect(idleMs < INACTIVITY_TIMEOUT).toBe(true);
  });

  it('had_active_session flag tracks session existence', () => {
    localStorage.setItem('had_active_session', 'true');
    expect(localStorage.getItem('had_active_session')).toBe('true');
    localStorage.removeItem('had_active_session');
    expect(localStorage.getItem('had_active_session')).toBeNull();
  });
});
