
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

  // Initialize behavioral profiling
  useEffect(() => {
    const storedProfile = localStorage.getItem('behavioral_profile');
    if (storedProfile) {
      setBehavioralProfile(JSON.parse(storedProfile));
    }
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
    
    // Check for new device
    const deviceFingerprint = generateDeviceFingerprint();
    const knownDevice = localStorage.getItem('device_fingerprint') === deviceFingerprint;
    if (!knownDevice) score += 20;
    
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
    setBehavioralProfile(prev => {
      const updated = { ...prev, ...metrics } as BehavioralProfile;
      localStorage.setItem('behavioral_profile', JSON.stringify(updated));
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
