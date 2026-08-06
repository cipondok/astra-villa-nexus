import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackShareVisit } from "@/lib/shareAnalytics";

/**
 * Records inbound traffic that arrived from a social share preview or a
 * campaign-tagged link. Mounted once at the app root; runs on every route
 * change and is deduped per session + path inside `trackShareVisit`.
 */
export function useShareTrafficTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Wait a tick so SEOHead has written canonical/og:url for this route.
    const t = window.setTimeout(() => trackShareVisit(), 600);
    return () => window.clearTimeout(t);
  }, [pathname, search]);
}
