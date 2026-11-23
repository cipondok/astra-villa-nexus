import { NavLink, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Sparkles, BarChart3, User } from "lucide-react";
import { REOS_OPEN_MENU_EVENT } from "@/components/reos/ReosShell";
import { useTranslation } from "@/i18n/useTranslation";

type Tab =
  | { kind: "link"; to: string; icon: typeof Home; key: string; label: string; exact?: boolean; center?: boolean }
  | { kind: "menu"; icon: typeof Home; key: string; label: string };

const tabs: Tab[] = [
  { kind: "link", to: "/", icon: Home, key: "home", label: "Home", exact: true },
  { kind: "menu", icon: LayoutGrid, key: "ecosystem", label: "Ecosystem" },
  { kind: "link", to: "/ai-center", icon: Sparkles, key: "aiCenter", label: "AI Center", center: true },
  { kind: "link", to: "/investment", icon: BarChart3, key: "investment", label: "Investment" },
  { kind: "link", to: "/profile", icon: User, key: "account", label: "Account" },
];

/**
 * ASTRA Villa REOS — Mobile Bottom Navigation
 * Visible only on viewports < md. Uses the shared --reos-bottomnav-h
 * token and respects iOS safe-area insets. The centre AI Center action
 * is a raised, flat champagne-gold disc (no glow).
 */
export default function ReosMobileBottomNav() {
  const { pathname } = useLocation();
  const { t: tr } = useTranslation();
  const labelOf = (tab: Tab) => tr(`marketHome.bottomNav.${tab.key}`, tab.label);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const baseClass =
    "relative flex-1 flex flex-col items-center gap-0.5 min-h-11 text-[10px] font-medium tracking-wide touch-manipulation select-none";
  const itemClass = `${baseClass} justify-center`;
  const color = (active: boolean) => ({
    color: active ? "var(--gold-2, hsl(var(--primary)))" : "var(--text-2, hsl(var(--muted-foreground)))",
  });
  const Indicator = () => (
    <span
      aria-hidden
      className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-7 rounded-full"
      style={{ background: "var(--gold, hsl(var(--primary)))" }}
    />
  );

  return (
    <nav
      aria-label={tr("marketHome.bottomNav.label", "Primary")}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--line,hsl(var(--border)))] bg-[var(--header,hsl(var(--card)))]/95 backdrop-blur-xl"
      style={{
        height: `calc(var(--reos-bottomnav-h, 56px) + env(safe-area-inset-bottom, 0px))`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <ul className="h-[var(--reos-bottomnav-h,56px)] grid grid-cols-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          if (t.kind === "menu") {
            return (
              <li key={t.label} className="flex">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event(REOS_OPEN_MENU_EVENT))}
                  aria-haspopup="dialog"
                  aria-controls="reos-mobile-drawer"
                  className={itemClass}
                  style={color(false)}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                  <span>{labelOf(t)}</span>
                </button>
              </li>
            );
          }
          const active = isActive(t.to, t.exact);
          if (t.center) {
            return (
              <li key={t.to} className="flex">
                <NavLink
                  to={t.to}
                  aria-current={active ? "page" : undefined}
                  className={`${baseClass} justify-end pb-1.5`}
                  style={color(active)}
                >
                  <span
                    aria-hidden
                    className="absolute -top-5 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full flex items-center justify-center border-4"
                    style={{
                      background: "var(--gold, hsl(var(--primary)))",
                      color: "var(--gold-fg, hsl(var(--primary-foreground)))",
                      borderColor: "var(--header, hsl(var(--card)))",
                    }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2.2} />
                  </span>
                  <span>{labelOf(t)}</span>
                </NavLink>
              </li>
            );
          }
          return (
            <li key={t.to} className="flex">
              <NavLink
                to={t.to}
                aria-current={active ? "page" : undefined}
                className={itemClass}
                style={color(active)}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} aria-hidden />
                <span>{labelOf(t)}</span>
                {active && <Indicator />}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
