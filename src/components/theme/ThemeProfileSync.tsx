import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, type AstraTheme } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";

/**
 * Bridges ThemeProvider ↔ profiles.preferred_theme.
 *
 * Mount once inside AuthProvider. On login it pulls the saved theme from
 * the profile; on user-driven theme changes it writes back to Supabase.
 */
export default function ThemeProfileSync() {
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const hydratedFor = useRef<string | null>(null);
  const lastWritten = useRef<AstraTheme | null>(null);

  // 1. Hydrate from profile on login
  useEffect(() => {
    if (!user?.id) {
      hydratedFor.current = null;
      lastWritten.current = null;
      return;
    }
    if (hydratedFor.current === user.id) return;
    const saved = (profile as any)?.preferred_theme as AstraTheme | undefined;
    if (saved === "astra-black-gold" || saved === "astra-pearl-white") {
      if (saved !== theme) setTheme(saved);
      lastWritten.current = saved;
    }
    hydratedFor.current = user.id;
  }, [user?.id, profile, theme, setTheme]);

  // 2. Persist on change
  useEffect(() => {
    if (!user?.id || hydratedFor.current !== user.id) return;
    if (lastWritten.current === theme) return;
    lastWritten.current = theme;
    void supabase
      .from("profiles")
      .update({ preferred_theme: theme } as any)
      .eq("id", user.id);
  }, [theme, user?.id]);

  return null;
}
