import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search, Sparkles, Heart, User2, Menu, X, ArrowUpRight, ChevronRight, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandingLogo } from "@/hooks/useBrandingLogo";
import brandLogoFallback from "@/assets/astra-logo-optimized.png";
import { LUXE_NAV_LINKS, LUXE_NAV_LINKS_AUTH, type LuxeNavLink } from "./navLinks";
import { LuxeThemeToggle } from "./LuxeThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";

/**
 * LuxeHeader — fixed cinematic glass header + fullscreen mobile menu.
 * Use once per page (LuxeLayout already includes it).
 */
export function LuxeHeader() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const profileHref = user ? "/profile" : "/auth";
  const { logoUrl: headerLogo } = useBrandingLogo("headerLogo", brandLogoFallback);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  // Close menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + "/");
  const navLinks: LuxeNavLink[] = user ? [...LUXE_NAV_LINKS, ...LUXE_NAV_LINKS_AUTH] : LUXE_NAV_LINKS;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled ? "py-2.5" : "py-5"
        )}
      >
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <nav
            className={cn(
              "luxe-glass-card flex items-center justify-between rounded-full px-4 md:px-6 transition-all duration-500",
              scrolled
                ? "py-2 md:py-2.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)] bg-[color:var(--luxe-header-scrolled-bg)]"
                : "py-2.5 md:py-3"
            )}
          >
            <Link to="/" aria-label="ASTRA Villa — home" className="flex items-center gap-2.5 shrink-0 group">
              <span
                aria-hidden
                className="relative w-9 h-9 rounded-full grid place-items-center overflow-hidden transition-transform duration-500 group-hover:scale-[1.04]"
                style={{
                  background: "radial-gradient(120% 120% at 30% 25%, #E7CE96 0%, #C8A96B 45%, #6F5320 100%)",
                  boxShadow: "0 6px 20px -8px rgba(200,169,107,0.55), inset 0 0 0 1px rgba(255,255,255,0.18)",
                }}
              >
                <img src={headerLogo} alt="" className="relative w-7 h-7 object-contain" loading="eager" decoding="async" />
              </span>
              <span className="hidden sm:flex flex-col leading-none">
                <span className="font-serif-l text-[17px] tracking-wide">Astra<span className="text-luxe-gold"> Villa</span></span>
                <span className="text-[9px] uppercase tracking-[0.32em] text-luxe-mut mt-1">Property OS</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-7 text-[13px] text-luxe-fg/75">
              <Link
                to="/"
                className={cn("relative py-1 transition-colors duration-300 hover:text-luxe-gold", pathname === "/" && "text-luxe-gold")}
              >
                Home
                {pathname === "/" && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[color:var(--luxe-gold)]" />
                )}
              </Link>
              {navLinks.map((link) => {
                const active = link.match ? pathname.startsWith(link.match) : false;
                const hasMega = !!link.mega?.length;
                return (
                  <div key={link.to} className={cn("relative", hasMega && "group")}>
                    <Link
                      to={link.to}
                      className={cn(
                        "relative py-1 inline-flex items-center gap-1 transition-colors duration-300 hover:text-luxe-gold",
                        active && "text-luxe-gold"
                      )}
                    >
                      {link.label}
                      {hasMega && <ChevronRight className="w-3 h-3 rotate-90 opacity-50 group-hover:opacity-100 transition-opacity" />}
                      {active && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[color:var(--luxe-gold)]" />
                      )}
                    </Link>
                    {hasMega && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[320px] opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                        <div className="luxe-glass-card rounded-2xl p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] bg-[rgba(8,8,10,0.92)]">
                          {link.mega!.map((sub) => (
                            <Link
                              key={sub.to}
                              to={sub.to}
                              className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group/sub"
                            >
                              <div>
                                <div className="text-[13px] text-luxe-fg/90 group-hover/sub:text-luxe-gold transition-colors">{sub.label}</div>
                                {sub.desc && <div className="text-[11px] text-luxe-mut mt-0.5">{sub.desc}</div>}
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-luxe-mut group-hover/sub:text-luxe-gold transition-colors mt-0.5" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Secondary actions */}
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              {(() => {
                const baseIcon = "relative w-9 h-9 grid place-items-center rounded-full border transition-colors";
                const idleIcon = "bg-luxe-glass border-luxe hover:border-[color:var(--luxe-gold)] hover:text-luxe-gold";
                const activeIcon = "bg-[color:var(--luxe-gold)]/12 border-[color:var(--luxe-gold)]/55 text-luxe-gold shadow-[0_0_0_1px_rgba(200,169,107,0.25)]";
                const ActiveDot = () => (
                  <span aria-hidden className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[color:var(--luxe-gold)]" />
                );
                const searchActive = isActive("/search") || pathname === "/properties";
                const wishActive = isActive("/favorites") || isActive("/saved");
                const notifActive = isActive("/notifications");
                const profileActive = isActive(profileHref) || isActive("/profile") || isActive("/auth");
                return (
                  <>
                    <Link to="/properties" aria-label="Search villas" aria-current={searchActive ? "page" : undefined}
                      className={cn(baseIcon, "hidden md:grid", searchActive ? activeIcon : idleIcon)}>
                      <Search className="w-4 h-4" />
                      {searchActive && <ActiveDot />}
                    </Link>
                    <Link to="/wealth-advisor" aria-current={isActive("/wealth-advisor") ? "page" : undefined}
                      className={cn("hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-full border text-[12px] transition-colors",
                        isActive("/wealth-advisor")
                          ? "bg-[color:var(--luxe-gold)]/12 border-[color:var(--luxe-gold)]/55 text-luxe-gold"
                          : "bg-luxe-glass border-luxe hover:border-[color:var(--luxe-gold)]")}>
                      <Sparkles className="w-3.5 h-3.5 text-luxe-gold" /> AI Concierge
                    </Link>
                    <Link to="/favorites" aria-label="Wishlist" aria-current={wishActive ? "page" : undefined}
                      className={cn(baseIcon, wishActive ? activeIcon : idleIcon)}>
                      <Heart className={cn("w-4 h-4", wishActive && "fill-[color:var(--luxe-gold)]/30")} />
                      {wishActive && <ActiveDot />}
                    </Link>
                    {user && (
                      <div className="hidden md:grid place-items-center luxe-notif-bell">
                        <NotificationBell />
                      </div>
                    )}
                    <LuxeThemeToggle className="hidden sm:grid" />
                    {user && (
                      <Link
                        to="/add-property"
                        aria-label="List a property"
                        className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium luxe-gold-btn transition-all hover:shadow-[0_10px_28px_-12px_rgba(200,169,107,0.7)]"
                      >
                        <Plus className="w-3.5 h-3.5" /> List Property
                      </Link>
                    )}
                    <Link to={profileHref} aria-label="Profile" aria-current={profileActive ? "page" : undefined}
                      className={cn(baseIcon, profileActive ? activeIcon : idleIcon)}>
                      <User2 className="w-4 h-4" />
                      {profileActive && <ActiveDot />}
                    </Link>
                  </>
                );
              })()}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="lg:hidden w-10 h-10 grid place-items-center rounded-full bg-luxe-glass border border-luxe hover:border-[color:var(--luxe-gold)] transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden transition-opacity duration-500",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(70% 60% at 50% 30%, #0c0c10 0%, #050505 100%)" }}
          onClick={() => setMobileOpen(false)}
        />
        <div className={cn(
          "relative h-full overflow-y-auto px-6 pt-6 pb-12 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          mobileOpen ? "translate-y-0" : "translate-y-3"
        )}>
          <div className="flex items-center justify-between mb-10">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
              <span aria-hidden className="w-9 h-9 rounded-full grid place-items-center overflow-hidden"
                style={{
                  background: "radial-gradient(120% 120% at 30% 25%, #E7CE96 0%, #C8A96B 45%, #6F5320 100%)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
                }}>
                <img src={headerLogo} alt="" className="w-7 h-7 object-contain" />
              </span>
              <span className="font-serif-l text-[18px]">Astra<span className="text-luxe-gold"> Villa</span></span>
            </Link>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu"
              className="w-11 h-11 grid place-items-center rounded-full bg-luxe-glass border border-luxe hover:border-[color:var(--luxe-gold)] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex flex-col">
            {([{ label: "Home", to: "/" } as LuxeNavLink, ...navLinks]).map((link) => {
              const linkActive = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
              return (
                <div key={link.to} className="border-b border-luxe">
                  <Link to={link.to} aria-current={linkActive ? "page" : undefined}
                    className="flex items-center justify-between py-5 group">
                    <span className={cn(
                      "font-serif-l text-[28px] leading-none transition-colors",
                      linkActive ? "text-luxe-gold" : "group-hover:text-luxe-gold"
                    )}>
                      {link.label}
                    </span>
                    <span className="flex items-center gap-2">
                      {linkActive && (
                        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[color:var(--luxe-gold)] shadow-[0_0_10px_rgba(200,169,107,0.7)]" />
                      )}
                      <ArrowUpRight className={cn("w-5 h-5 transition-colors", linkActive ? "text-luxe-gold" : "text-luxe-mut group-hover:text-luxe-gold")} />
                    </span>
                  </Link>
                  {"mega" in link && link.mega && (
                    <div className="pb-4 pl-1 space-y-1">
                      {link.mega.map((sub) => {
                        const subActive = pathname === sub.to.split("?")[0];
                        return (
                          <Link key={sub.to} to={sub.to} aria-current={subActive ? "page" : undefined}
                            className={cn(
                              "block text-[13px] py-1.5 transition-colors",
                              subActive ? "text-luxe-gold" : "text-luxe-mut hover:text-luxe-gold"
                            )}>
                            — {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mt-10 grid grid-cols-2 gap-3">
            <Link to="/properties" className="luxe-glass-card flex items-center justify-center gap-2 py-4 rounded-2xl text-[12px] hover:text-luxe-gold">
              <Search className="w-4 h-4" /> Search Villas
            </Link>
            <Link to="/wealth-advisor" className="luxe-gold-btn flex items-center justify-center gap-2 py-4 rounded-2xl text-[12px] font-medium">
              <Sparkles className="w-4 h-4" /> AI Concierge
            </Link>
          </div>

          <div className="mt-8 text-center text-[10px] uppercase tracking-[0.32em] text-luxe-mut">
            ASTRA Villa · Property OS
          </div>
        </div>
      </div>
    </>
  );
}
