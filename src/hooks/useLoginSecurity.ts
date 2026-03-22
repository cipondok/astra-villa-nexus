import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateDeviceFingerprint, getDeviceInfo } from '@/lib/deviceFingerprint';

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
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown timer
  const startCountdown = useCallback((seconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsLocked(true);
    setLockoutRemaining(seconds);

    intervalRef.current = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setFailedAttempts(0);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Server-side lockout check (called before login attempt)
  const checkServerLockout = useCallback(async (email: string): Promise<{ locked: boolean; remainingSeconds: number }> => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-engine', {
        body: { action: 'check_lockout', email },
      });
      if (error || !data) return { locked: false, remainingSeconds: 0 };

      if (data.locked) {
        startCountdown(data.remaining_seconds);
        return { locked: true, remainingSeconds: data.remaining_seconds };
      }
      return { locked: false, remainingSeconds: 0 };
    } catch {
      return { locked: false, remainingSeconds: 0 };
    }
  }, [startCountdown]);

  // Server-side record attempt
  const recordAttemptServer = useCallback(async (
    email: string,
    success: boolean,
    userId?: string,
    failureReason?: string
  ): Promise<{ locked: boolean; lockDurationMin?: number; attemptsUntilLock?: number }> => {
    try {
      let fingerprint = '';
      try { fingerprint = await generateDeviceFingerprint(); } catch { /* ignore */ }

      const { data, error } = await supabase.functions.invoke('auth-engine', {
        body: {
          action: 'record_login_attempt',
          email,
          success,
          failure_reason: failureReason,
          device_fingerprint: fingerprint,
          user_id: userId,
        },
      });

      if (error || !data) return { locked: false };

      if (data.locked) {
        const seconds = (data.lockout_duration_min || 5) * 60;
        startCountdown(seconds);
        setFailedAttempts(data.total_failures || 0);
        return {
          locked: true,
          lockDurationMin: data.lockout_duration_min,
        };
      }

      setFailedAttempts(data.total_failures || 0);
      return {
        locked: false,
        attemptsUntilLock: data.attempts_until_lock,
      };
    } catch {
      return { locked: false };
    }
  }, [startCountdown]);

  // Convenience wrappers maintaining backward compatibility
  const recordFailedAttempt = useCallback(() => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    return {
      attempts: newAttempts,
      isLocked: false,
      lockDurationMs: 0,
      attemptsUntilLock: Math.max(0, 5 - newAttempts),
    };
  }, [failedAttempts]);

  const recordSuccess = useCallback(() => {
    setFailedAttempts(0);
    setIsLocked(false);
    setLockoutRemaining(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Log login activity to database (legacy, now handled by server)
  const logLoginActivity = useCallback(async (
    email: string,
    success: boolean,
    userId?: string,
    failureReason?: string
  ) => {
    // Now delegates to server-side recording
    await recordAttemptServer(email, success, userId, failureReason);
  }, [recordAttemptServer]);

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
    lockoutUntil: null,
    isLocked,
    lockoutRemaining,
    recordFailedAttempt,
    recordSuccess,
    logLoginActivity,
    isDisposableEmail,
    checkDisposableEmailDB,
    isEmailVerified,
    checkServerLockout,
    recordAttemptServer,
  };
};
