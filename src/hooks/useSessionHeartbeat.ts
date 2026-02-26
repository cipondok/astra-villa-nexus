import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { triggerAuthModal, isSessionCheckSuppressed } from '@/hooks/useSessionMonitor';
import { generateDeviceFingerprint, getDeviceInfo } from '@/lib/deviceFingerprint';

const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Pings session-heartbeat edge function every 5 min while user is active & online.
 * Sends device fingerprint + info so the server can track active sessions.
 */
export const useSessionHeartbeat = (isAuthenticated: boolean) => {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fingerprintRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Pre-compute fingerprint
    generateDeviceFingerprint().then(fp => { fingerprintRef.current = fp; });

    const beat = async () => {
      if (!navigator.onLine || document.visibilityState === 'hidden' || isSessionCheckSuppressed()) return;

      const deviceInfo = getDeviceInfo();
      const payload = {
        device_fingerprint: fingerprintRef.current || '',
        device_name: `${deviceInfo.deviceType === 'desktop' ? 'Desktop' : deviceInfo.deviceType === 'mobile' ? 'Mobile' : 'Tablet'} · ${deviceInfo.browserName} on ${deviceInfo.osName}`,
        device_type: deviceInfo.deviceType,
        browser: `${deviceInfo.browserName} ${deviceInfo.browserVersion}`,
        os: `${deviceInfo.osName} ${deviceInfo.osVersion}`.trim(),
      };

      try {
        const { data, error } = await supabase.functions.invoke('session-heartbeat', {
          method: 'POST',
          body: payload,
        });

        if (error) {
          const msg = typeof error === 'object' && 'message' in error ? (error as any).message : String(error);
          if (msg.includes('401') || msg.includes('403') || msg.includes('unauthorized') || msg.includes('JWT')) {
            triggerAuthModal('Session invalid – please sign in again');
          }
        }
      } catch {
        // Network error — silently ignore
      }
    };

    // First beat after 10 seconds (allow fingerprint to resolve)
    const initialTimeout = setTimeout(beat, 10_000);
    timerRef.current = setInterval(beat, HEARTBEAT_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated]);
};
