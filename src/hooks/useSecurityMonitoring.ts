
import { useState, useCallback } from 'react';

interface SecurityEvent {
  type: string;
  details: any;
  timestamp?: number;
}

interface BehavioralMetrics {
  keystrokes: number[];
  mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
  typingPattern: number[];
}

interface BreachCheckResult {
  breached: boolean;
  breachCount?: number;
  message?: string;
}

export const useSecurityMonitoring = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);

  const logSecurityEvent = useCallback((event: SecurityEvent) => {
    const eventWithTimestamp = {
      ...event,
      timestamp: Date.now()
    };
    
    console.log('🔒 Security Event:', eventWithTimestamp);
    setSecurityEvents(prev => [...prev.slice(-99), eventWithTimestamp]); // Keep last 100 events
  }, []);

  const calculateRiskScore = useCallback((metrics: BehavioralMetrics): number => {
    // Simple risk scoring based on behavioral patterns
    let riskScore = 0;
    
    // Check typing pattern consistency
    if (metrics.typingPattern.length > 5) {
      const avgTypingSpeed = metrics.typingPattern.reduce((a, b) => a + b, 0) / metrics.typingPattern.length;
      const variance = metrics.typingPattern.reduce((acc, val) => acc + Math.pow(val - avgTypingSpeed, 2), 0) / metrics.typingPattern.length;
      
      // High variance in typing pattern increases risk
      if (variance > 10000) riskScore += 30;
      else if (variance > 5000) riskScore += 15;
    }
    
    // Check mouse movement patterns
    if (metrics.mouseMovements.length > 10) {
      const distances = [];
      for (let i = 1; i < metrics.mouseMovements.length; i++) {
        const prev = metrics.mouseMovements[i - 1];
        const curr = metrics.mouseMovements[i];
        const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
        distances.push(distance);
      }
      
      const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
      
      // Very erratic mouse movements increase risk
      if (avgDistance > 100) riskScore += 20;
      else if (avgDistance > 50) riskScore += 10;
    }
    
    // Check keystroke timing
    if (metrics.keystrokes.length > 5) {
      const avgKeystroke = metrics.keystrokes.reduce((a, b) => a + b, 0) / metrics.keystrokes.length;
      
      // Very fast or very slow typing increases risk
      if (avgKeystroke < 50 || avgKeystroke > 1000) riskScore += 25;
    }
    
    return Math.min(riskScore, 100); // Cap at 100
  }, []);

  const checkBreachStatus = useCallback(async (email: string): Promise<BreachCheckResult> => {
    try {
      // In a real implementation, you would call an actual breach checking service
      // For now, we'll simulate a basic check
      console.log('🔍 Checking breach status for:', email);
      
      // Simulate some known compromised email patterns
      const compromisedPatterns = ['test@', 'admin@', '123@'];
      const isCompromised = compromisedPatterns.some(pattern => email.toLowerCase().includes(pattern));
      
      if (isCompromised) {
        return {
          breached: true,
          breachCount: 1,
          message: 'Email found in known data breaches'
        };
      }
      
      return {
        breached: false,
        message: 'No known breaches found'
      };
    } catch (error) {
      console.error('Error checking breach status:', error);
      return {
        breached: false,
        message: 'Unable to check breach status'
      };
    }
  }, []);

  return {
    securityEvents,
    logSecurityEvent,
    calculateRiskScore,
    checkBreachStatus
  };
};
