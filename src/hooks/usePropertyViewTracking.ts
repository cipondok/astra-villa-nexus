import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const VIEWER_KEY = "astra_viewer_key";

/** Stable anonymous id for this browser (no personal data). */
export function getViewerKey(): string {
  try {
    let key = localStorage.getItem(VIEWER_KEY);
    if (!key || !/^[A-Za-z0-9_-]{8,80}$/.test(key)) {
      key = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VIEWER_KEY, key);
    }
    return key;
  } catch {
    return `v_${Math.random().toString(36).slice(2, 14)}`;
  }
}

/**
 * Records one real view per visitor per listing per day. The server ignores
 * bots, link-preview fetchers, owners viewing their own listing and floods.
 * Counted only after the visitor has stayed 3 seconds on the page.
 */
export function usePropertyViewTracking(propertyId?: string | null) {
  useEffect(() => {
    if (!propertyId) return;
    if (typeof navigator !== "undefined" && (navigator as Navigator & { webdriver?: boolean }).webdriver) return;
    const timer = window.setTimeout(() => {
      void supabase
        .rpc("record_property_view" as never, { p_property_id: propertyId, p_viewer_key: getViewerKey() } as never)
        .then(() => undefined, () => undefined);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [propertyId]);
}
