import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityCheck {
  isBlocked: boolean;
  reason?: string;
  delay?: number;
  requiresCaptcha?: boolean;
  lockoutDuration?: number;
}

interface LoginAttempt {
  ip_address: string;
  email: string;
  user_agent: string;
  device_fingerprint: string;
  success: boolean;
  geolocation?: any;
  risk_score?: number;
}

export const useAdvancedAuthSecurity = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [progressiveDelay, setProgressiveDelay] = useState(0);
  const { toast } = useToast();

  // Generate device fingerprint
  const generateDeviceFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 10, 10);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }, []);

  // Get user's IP and location
  const getUserInfo = useCallback(async () => {
    try {
      const response = await fetch('https://api.ipapi.com/api/check?access_key=demo');
      const data = await response.json();
      return {
        ip: data.ip || '127.0.0.1',
        location: {
          country: data.country_name,
          region: data.region_name,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude
        }
      };
    } catch {
      return {
        ip: '127.0.0.1',
        location: {}
      };
    }
  }, []);

  // Check security before login attempt
  const checkSecurityBeforeLogin = useCallback(async (email: string): Promise<SecurityCheck> => {
    try {
      const userInfo = await getUserInfo();
      
      // Check IP rate limiting
      const { data: ipBlocked } = await supabase.rpc('check_ip_rate_limit', {
        p_ip_address: userInfo.ip
      });

      if (ipBlocked) {
        return {
          isBlocked: true,
          reason: 'IP address has exceeded the maximum number of login attempts. Please try again in 1 hour.',
          lockoutDuration: 60
        };
      }

      // Check account lockout
      const { data: accountLocked } = await supabase.rpc('check_account_lockout', {
        p_email: email
      });

      if (accountLocked) {
        return {
          isBlocked: true,
          reason: 'Account is temporarily locked due to suspicious activity. Please try again later.',
          lockoutDuration: 60
        };
      }

      // Check if CAPTCHA is required (after 3 failed attempts)
      const { data: recentAttempts } = await supabase
        .from('login_attempts')
        .select('id')
        .eq('email', email)
        .eq('success', false)
        .gte('attempt_time', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .limit(5);

      const failedCount = recentAttempts?.length || 0;
      
      if (failedCount >= 3) {
        setCaptchaRequired(true);
        return {
          isBlocked: false,
          requiresCaptcha: true,
          reason: 'Multiple failed attempts detected. Please complete CAPTCHA verification.'
        };
      }

      // Calculate progressive delay (exponential backoff)
      if (failedCount > 0) {
        const delay = Math.min(Math.pow(2, failedCount) * 1000, 30000); // Max 30 seconds
        setProgressiveDelay(delay);
        return {
          isBlocked: false,
          delay,
          reason: `Please wait ${delay / 1000} seconds before trying again.`
        };
      }

      return { isBlocked: false };
    } catch (error) {
      console.error('Security check failed:', error);
      return { isBlocked: false }; // Allow login if security check fails
    }
  }, [getUserInfo]);

  // Log login attempt
  const logLoginAttempt = useCallback(async (attempt: LoginAttempt) => {
    try {
      const userInfo = await getUserInfo();
      
      await supabase.from('login_attempts').insert({
        ip_address: userInfo.ip,
        email: attempt.email,
        user_agent: attempt.user_agent,
        device_fingerprint: attempt.device_fingerprint,
        success: attempt.success,
        geolocation: attempt.geolocation || userInfo.location,
        risk_score: attempt.risk_score || 0
      });

      // If login failed, check if account should be locked
      if (!attempt.success) {
        const { data: recentFailures } = await supabase
          .from('login_attempts')
          .select('id')
          .eq('email', attempt.email)
          .eq('success', false)
          .gte('attempt_time', new Date(Date.now() - 60 * 60 * 1000).toISOString());

        if (recentFailures && recentFailures.length >= 5) {
          // Create account lockout
          await supabase.rpc('create_account_lockout', {
            p_email: attempt.email,
            p_ip_address: userInfo.ip,
            p_duration_minutes: 60
          });

          // Create security alert
          await supabase.from('user_login_alerts').insert({
            user_id: null, // We might not have user_id for failed logins
            alert_type: 'multiple_sessions',
            device_info: { 
              user_agent: attempt.user_agent,
              device_fingerprint: attempt.device_fingerprint 
            },
            ip_address: userInfo.ip,
            location_data: userInfo.location,
            message: `Account locked due to 5 consecutive failed login attempts from IP ${userInfo.ip}`
          });

          toast({
            title: "Account Locked",
            description: "Your account has been temporarily locked due to multiple failed login attempts. Please try again in 1 hour.",
            variant: "destructive",
          });
        }
      } else {
        // Successful login - reset security flags
        setCaptchaRequired(false);
        setProgressiveDelay(0);
      }
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }
  }, [getUserInfo, toast]);

  // Enhanced login with security checks
  const secureLogin = useCallback(async (
    email: string, 
    password: string,
    captchaToken?: string
  ) => {
    setIsProcessing(true);

    try {
      // Pre-login security checks
      const securityCheck = await checkSecurityBeforeLogin(email);
      
      if (securityCheck.isBlocked) {
        toast({
          title: "Login Blocked",
          description: securityCheck.reason,
          variant: "destructive",
        });
        return { success: false, error: { message: securityCheck.reason } };
      }

      if (securityCheck.requiresCaptcha && !captchaToken) {
        toast({
          title: "CAPTCHA Required",
          description: securityCheck.reason,
          variant: "destructive",
        });
        return { success: false, error: { message: securityCheck.reason }, requiresCaptcha: true };
      }

      if (securityCheck.delay) {
        await new Promise(resolve => setTimeout(resolve, securityCheck.delay));
      }

      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      const deviceFingerprint = generateDeviceFingerprint();
      const userInfo = await getUserInfo();

      // Log the attempt
      await logLoginAttempt({
        ip_address: userInfo.ip,
        email,
        user_agent: navigator.userAgent,
        device_fingerprint: deviceFingerprint,
        success: !error,
        geolocation: userInfo.location,
        risk_score: error ? 25 : 0
      });

      if (error) {
        return { success: false, error };
      }

      // Successful login - create device session
      if (data.user) {
        await supabase.from('user_device_sessions').insert({
          user_id: data.user.id,
          session_token: data.session?.access_token || '',
          device_fingerprint: deviceFingerprint,
          device_info: {
            user_agent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          },
          ip_address: userInfo.ip,
          location_data: userInfo.location
        });
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Secure login failed:', error);
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  }, [checkSecurityBeforeLogin, logLoginAttempt, generateDeviceFingerprint, getUserInfo, toast]);

  return {
    isProcessing,
    captchaRequired,
    progressiveDelay,
    secureLogin,
    checkSecurityBeforeLogin,
    logLoginAttempt,
    setCaptchaRequired
  };
};