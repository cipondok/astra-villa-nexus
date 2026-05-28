import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LuxeAmbient } from "./LuxeAmbient";
import { LuxeHeader } from "./LuxeHeader";
import { LuxeFooter } from "./LuxeFooter";
import { LuxeMobileDock } from "./LuxeMobileDock";

interface LuxeLayoutProps {
  children: ReactNode;
  /** Hide the global footer (rare, e.g. fullscreen viewer pages) */
  hideFooter?: boolean;
  /** Hide the bottom mobile dock */
  hideDock?: boolean;
  /** Show the cinematic boot fade on mount (default true) */
  boot?: boolean;
  className?: string;
}

/**
 * LuxeLayout — global cinematic page shell.
 *
 * Provides:
 *   • Ambient mesh + grain background
 *   • Fixed luxe header (with mobile menu)
 *   • Bottom mobile dock
 *   • Footer
 *   • Cinematic boot fade on first paint
 *
 * Every customer-facing luxe page should wrap its content with this.
 */
export function LuxeLayout({
  children,
  hideFooter = false,
  hideDock = false,
  boot = true,
  className,
}: LuxeLayoutProps) {
  // Boot fade only once per browser session — prevents the jarring "jump to top"
  // overlay overlay on every SPA route change.
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
        <LuxeHeader />
        <main>{children}</main>
        {!hideFooter && <LuxeFooter />}
      </div>

      {!hideDock && <LuxeMobileDock />}
    </div>
  );
}
