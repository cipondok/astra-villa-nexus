import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type IntentLevel = "low" | "medium" | "high";

export const useInvestorIntent = (propertyId?: string) => {
  const { user } = useAuth();
  const [intentLevel, setIntentLevel] = useState<IntentLevel>("low");
  const sessionStart = useRef(Date.now());
  const eventCount = useRef(0);

  const trackEvent = useCallback(
    async (eventType: string) => {
      if (!user?.id) return;
      eventCount.current++;

      // Calculate intent based on accumulated signals
      let level: IntentLevel = "low";
      const duration = Math.round((Date.now() - sessionStart.current) / 1000);
      if (eventCount.current >= 5 || duration > 120) level = "high";
      else if (eventCount.current >= 2 || duration > 45) level = "medium";

      setIntentLevel(level);

      try {
        await supabase.from("investor_behavior_events").insert({
          user_id: user.id,
          property_id: propertyId || null,
          event_type: eventType,
          session_duration_seconds: duration,
          intent_level: level,
        });
      } catch (_) {}
    },
    [user?.id, propertyId]
  );

  // Auto-track time on page
  useEffect(() => {
    sessionStart.current = Date.now();
    const interval = setInterval(() => {
      const duration = Math.round((Date.now() - sessionStart.current) / 1000);
      if (duration > 120 && eventCount.current >= 1) setIntentLevel("high");
      else if (duration > 45) setIntentLevel("medium");
    }, 15000);
    return () => clearInterval(interval);
  }, [propertyId]);

  return { intentLevel, trackEvent };
};
