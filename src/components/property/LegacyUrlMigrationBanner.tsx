import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Info, X } from "lucide-react";

interface LegacyUrlMigrationBannerProps {
  /** Canonical path for this property, e.g. /property/abc */
  canonicalPath: string;
}

/**
 * Shown when a visitor arrived through the deprecated `/properties/:id` URL.
 * Explains the URL change and offers a one-click link to the canonical page.
 */
export const LegacyUrlMigrationBanner = ({ canonicalPath }: LegacyUrlMigrationBannerProps) => {
  const location = useLocation();
  const state = location.state as { legacyPropertyUrl?: string } | null;
  const legacyUrl = state?.legacyPropertyUrl;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [legacyUrl]);

  if (!legacyUrl || dismissed) return null;

  return (
    <div className="px-4 md:px-8 pt-20 md:pt-24">
      <div
        role="status"
        className="max-w-[1440px] mx-auto flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 backdrop-blur-sm"
      >
        <Info className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-[13px] leading-snug text-foreground/90 flex-1 min-w-[220px]">
          Our property URLs have changed from{" "}
          <span className="font-medium">/properties/…</span> to{" "}
          <span className="font-medium">/property/…</span>. You were redirected automatically —
          please update your bookmarks.
        </p>
        <Link
          to={canonicalPath}
          replace
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/70 px-3 py-1.5 text-[12px] font-medium text-primary transition-colors hover:bg-primary/10 min-h-[36px]"
        >
          Open new page
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss URL change notice"
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default LegacyUrlMigrationBanner;
