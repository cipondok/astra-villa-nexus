import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LuxeAmbient } from "./LuxeAmbient";

interface LuxeLayoutProps {
  children: ReactNode;
  /** Deprecated — footer is owned by the app shell (ReosFooter). Kept for API compatibility. */
  hideFooter?: boolean;
  /** Deprecated — mobile dock is owned by the app shell (ReosMobileBottomNav). Kept for API compatibility. */
  hideDock?: boolean;
  /** Show the cinematic boot fade on mount (default true) */
  boot?: boolean;
  className?: string;
}

/**
 * LuxeLayout — cinematic page wrapper.
 *
 * IMPORTANT: The global header, footer, and mobile dock are rendered by the
 * app shell in `App.tsx` (ReosHeader / ReosFooter / ReosMobileBottomNav).
 * LuxeLayout intentionally does NOT render its own header/footer/dock —
 * doing so caused duplicate top headers on luxe pages.
 *
 * Provides:
 *   • Ambient mesh + grain background
 *   • Cinematic boot fade on first paint (once per session)
 */
export function LuxeLayout({
  children,
  boot = true,
  className,
}: LuxeLayoutProps) {
  const shouldBoot =
    boot &&
    typeof window !== "undefined" &&
    !window.sessionStorage.getItem("luxe-booted");
  const [booted, setBooted] = useState(!shouldBoot);

  useEffect(() => {
    if (!shouldBoot) return;
    const t = window.setTimeout(() => {
      setBooted(true);
      try { window.sessionStorage.setItem("luxe-booted", "1"); } catch {}
    }, 60);
    return () => window.clearTimeout(t);
  }, [shouldBoot]);

  return (
    <div className={cn("luxe-root", className)}>
      {shouldBoot && (
        <div className={cn("luxe-boot", booted && "ready")} aria-hidden={booted}>
          <div className="luxe-boot-mark">
            <span className="font-serif-l text-[22px] text-black">A</span>
          </div>
        </div>
      )}

      <LuxeAmbient />

      <div className="relative z-10">
        <main>{children}</main>
      </div>
    </div>
  );
}

