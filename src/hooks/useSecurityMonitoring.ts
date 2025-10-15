
import { useState, useEffect, useCallback } from "react";

interface SecurityEvent {
  type: "login_attempt" | "suspicious_activity" | "breach_detected" | "rate_limit";
  timestamp: number;
  details: Record<string, any>;
}

interface BehavioralProfile {
  typingSpeed: number;
  mouseMovementPattern: number[];
  loginTimes: number[];
  deviceFingerprint: string;
}

export const useSecurityMonitoring = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [behavioralProfile, setBehavioralProfile] = useState<BehavioralProfile | null>(null);
  const [riskScore, setRiskScore] = useState(0);

  // Note: Behavioral profiling moved to server-side for security
  // Client-side localStorage is not secure and can be manipulated
  useEffect(() => {
    // Removed localStorage usage - security data should be server-side only
    console.warn('Behavioral profiling should be implemented server-side');
  }, []);

  const logSecurityEvent = useCallback((event: Omit<SecurityEvent, "timestamp">) => {
    const newEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    };
    
    setSecurityEvents(prev => [...prev.slice(-99), newEvent]); // Keep last 100 events
    
    // Log to server in real implementation
    console.log('Security Event:', newEvent);
  }, []);

  const calculateRiskScore = useCallback((metrics: any) => {
    let score = 0;
    
    // SECURITY WARNING: Device fingerprinting should be done server-side
    // Client-side checks can be easily bypassed
    const deviceFingerprint = generateDeviceFingerprint();
    // Removed localStorage check - not secure for authentication decisions
    score += 10; // Base score without localStorage dependency
    
    // Check unusual login time
    const currentHour = new Date().getHours();
    const isUnusualTime = currentHour < 6 || currentHour > 23;
    if (isUnusualTime) score += 15;
    
    // Check typing pattern deviation
    if (behavioralProfile && metrics.typingSpeed) {
      const deviation = Math.abs(metrics.typingSpeed - behavioralProfile.typingSpeed);
      if (deviation > 50) score += 25; // Significant typing speed change
    }
    
    // Check for multiple rapid attempts
    const recentAttempts = securityEvents.filter(
      event => event.type === "login_attempt" && Date.now() - event.timestamp < 60000
    );
    if (recentAttempts.length > 3) score += 30;
    
    setRiskScore(Math.min(score, 100));
    return score;
  }, [behavioralProfile, securityEvents]);

  const updateBehavioralProfile = useCallback((metrics: Partial<BehavioralProfile>) => {
    // SECURITY: Do not store security-sensitive data in localStorage
    // This should be handled server-side via edge functions
    setBehavioralProfile(prev => {
      const updated = { ...prev, ...metrics } as BehavioralProfile;
      // Removed localStorage.setItem - security data belongs server-side
      return updated;
    });
  }, []);

  const generateDeviceFingerprint = () => {
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
  };

  const checkBreachStatus = async (email: string) => {
    try {
      // Simulate HaveIBeenPwned API call
      const response = await fetch('/api/check-breach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.breached) {
          logSecurityEvent({
            type: "breach_detected",
            details: { email, breaches: data.breaches }
          });
        }
        return data;
      }
    } catch (error) {
      console.error('Breach check failed:', error);
    }
    return { breached: false };
  };

  return {
    securityEvents,
    behavioralProfile,
    riskScore,
    logSecurityEvent,
    calculateRiskScore,
    updateBehavioralProfile,
    checkBreachStatus,
    generateDeviceFingerprint
  };
};
