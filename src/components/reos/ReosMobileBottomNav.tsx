import { NavLink, useLocation } from "react-router-dom";
import { Home, Building2, TrendingUp, Sparkles, User } from "lucide-react";

const tabs = [
  { to: "/", icon: Home, label: "Home", exact: true },
  { to: "/properties", icon: Building2, label: "Properties" },
  { to: "/investment", icon: TrendingUp, label: "Invest" },
  { to: "/ai-search", icon: Sparkles, label: "AI" },
  { to: "/profile", icon: User, label: "Profile" },
];

/**
 * ASTRA Villa REOS — Mobile Bottom Navigation
 * Visible only on viewports < md. Uses the shared --reos-bottomnav-h
 * token and respects iOS safe-area insets.
 */
export default function ReosMobileBottomNav() {
  const { pathname } = useLocation();

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--line,hsl(var(--border)))] bg-[var(--surface,hsl(var(--card)))]/92 backdrop-blur-xl"
      style={{
        height: `calc(var(--reos-bottomnav-h, 56px) + env(safe-area-inset-bottom, 0px))`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <ul className="h-[var(--reos-bottomnav-h,56px)] grid grid-cols-5">
        {tabs.map((t) => {
          const active = isActive(t.to, t.exact);
          const Icon = t.icon;
          return (
            <li key={t.to} className="flex">
              <NavLink
                to={t.to}
                aria-current={active ? "page" : undefined}
                className="relative flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium tracking-wide touch-manipulation select-none"
                style={{
                  color: active
                    ? "var(--gold-2, hsl(var(--primary)))"
                    : "var(--text-2, hsl(var(--muted-foreground)))",
                }}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={active ? 2.4 : 1.8}
                  aria-hidden
                />
                <span>{t.label}</span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-b-full"
                    style={{ background: "var(--gold, hsl(var(--primary)))" }}
                  />
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
