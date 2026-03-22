import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateDeviceFingerprint, getDeviceInfo } from '@/lib/deviceFingerprint';

// Progressive lockout durations in ms
const LOCKOUT_TIERS = [
  { threshold: 5, duration: 5 * 60 * 1000 },    // 5 failures → 5 min
  { threshold: 10, duration: 10 * 60 * 1000 },   // 10 failures → 10 min
  { threshold: 15, duration: 30 * 60 * 1000 },   // 15 failures → 30 min
];

// Common disposable email domains (client-side fast check)
const DISPOSABLE_DOMAINS_CLIENT = new Set([
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
  'yopmail.com', '10minutemail.com', 'trashmail.com', 'fakeinbox.com',
  'sharklasers.com', 'maildrop.cc', 'getnada.com', 'emailondeck.com',
  'temp-mail.org', 'mohmal.com', 'dispostable.com', 'mailnesia.com',
]);

export interface LoginSecurityState {
  failedAttempts: number;
  lockoutUntil: number | null;
  isLocked: boolean;
  lockoutRemaining: number;
}

export const useLoginSecurity = () => {
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Start countdown timer
  const startCountdown = useCallback((until: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const remaining = until - Date.now();
      if (remaining <= 0) {
        setLockoutUntil(null);
        setLockoutRemaining(0);
        setFailedAttempts(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setLockoutRemaining(Math.ceil(remaining / 1000));
      }
    }, 1000);
  }, []);

  const isLocked = lockoutUntil !== null && Date.now() < lockoutUntil;

  const getLockoutDuration = useCallback((attempts: number): number => {
    for (let i = LOCKOUT_TIERS.length - 1; i >= 0; i--) {
      if (attempts >= LOCKOUT_TIERS[i].threshold) {
        return LOCKOUT_TIERS[i].duration;
      }
    }
    return 0;
  }, []);

  const recordFailedAttempt = useCallback(() => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);

    const lockDuration = getLockoutDuration(newAttempts);
    if (lockDuration > 0) {
      const until = Date.now() + lockDuration;
      setLockoutUntil(until);
      setLockoutRemaining(Math.ceil(lockDuration / 1000));
      startCountdown(until);
    }

    return {
      attempts: newAttempts,
      isLocked: lockDuration > 0,
      lockDurationMs: lockDuration,
      attemptsUntilLock: Math.max(0, 5 - newAttempts),
    };
  }, [failedAttempts, getLockoutDuration, startCountdown]);

  const recordSuccess = useCallback(() => {
    setFailedAttempts(0);
    setLockoutUntil(null);
    setLockoutRemaining(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Log login activity to database
  const logLoginActivity = useCallback(async (
    email: string,
    success: boolean,
    userId?: string,
    failureReason?: string
  ) => {
    try {
      const deviceInfo = getDeviceInfo();
      let fingerprint = '';
      try {
        fingerprint = await generateDeviceFingerprint();
      } catch { /* ignore */ }

      await supabase.from('login_activity_log' as any).insert({
        user_id: userId || null,
        email,
        device_fingerprint: fingerprint,
        device_type: deviceInfo.deviceType,
        browser: `${deviceInfo.browserName} ${deviceInfo.browserVersion}`,
        os: `${deviceInfo.osName} ${deviceInfo.osVersion}`.trim(),
        login_success: success,
        failure_reason: failureReason || null,
        risk_score: success ? 0 : Math.min(failedAttempts * 20, 100),
        is_suspicious: failedAttempts >= 5,
      });
    } catch (error) {
      console.error('Failed to log login activity:', error);
    }
  }, [failedAttempts]);

  // Check if email is disposable (client-side fast check)
  const isDisposableEmail = useCallback((email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return DISPOSABLE_DOMAINS_CLIENT.has(domain);
  }, []);

  // Check disposable email against database
  const checkDisposableEmailDB = useCallback(async (email: string): Promise<boolean> => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;

    // Fast client check first
    if (DISPOSABLE_DOMAINS_CLIENT.has(domain)) return true;

    try {
      const { data } = await supabase
        .from('disposable_email_domains' as any)
        .select('id')
        .eq('domain', domain)
        .maybeSingle();
      return !!data;
    } catch {
      return false;
    }
  }, []);

  // Check if user email is verified
  const isEmailVerified = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email_confirmed_at != null;
    } catch {
      return false;
    }
  }, []);

  return {
    failedAttempts,
    lockoutUntil,
    isLocked,
    lockoutRemaining,
    recordFailedAttempt,
    recordSuccess,
    logLoginActivity,
    isDisposableEmail,
    checkDisposableEmailDB,
    isEmailVerified,
  };
};
