import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { generateDeviceFingerprint, getDeviceInfo } from '@/lib/deviceFingerprint';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to automatically register the current device on login
 * This should be called at the app root level
 */
export const useDeviceRegistration = () => {
  const { user } = useAuth();

  useEffect(() => {
    const registerDevice = async () => {
      if (!user) return;

      try {
        // Generate device fingerprint
        const fingerprint = await generateDeviceFingerprint();
        const deviceInfo = getDeviceInfo();

        // Call edge function to register device
        const { data, error } = await supabase.functions.invoke('register-device', {
          body: {
            device_fingerprint: fingerprint,
            device_type: deviceInfo.deviceType,
            browser_name: deviceInfo.browserName,
            browser_version: deviceInfo.browserVersion,
            os_name: deviceInfo.osName,
            os_version: deviceInfo.osVersion,
          },
        });

        if (error) {
          console.error('Device registration failed:', error);
        } else {
          console.log('Device registered successfully:', data);
        }
      } catch (error) {
        console.error('Error during device registration:', error);
      }
    };

    registerDevice();
  }, [user]);
};
