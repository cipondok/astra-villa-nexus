import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Sparkles, Heart, User2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function LuxeMobileDock() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const items = [
    { id: "home",      to: "/",               icon: Home,     label: "Home" },
    { id: "discover",  to: "/properties",     icon: Compass,  label: "Discover" },
    { id: "concierge", to: "/wealth-advisor", icon: Sparkles, label: "Concierge", accent: true },
    { id: "wishlist",  to: "/favorites",      icon: Heart,    label: "Saved" },
    { id: "profile",   to: user ? "/profile" : "/auth", icon: User2, label: "You" },
  ] as const;

  const isActiveFor = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <nav
      aria-label="Primary mobile"
      className="md:hidden fixed left-3 right-3 z-[60] luxe-dock rounded-[28px] px-2 py-2 flex items-center justify-between"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
    >
      {items.map((it) => {
        const isActive = isActiveFor(it.to);
        const Icon = it.icon;
        return (
          <Link
            key={it.id}
            to={it.to}
            aria-current={isActive ? "page" : undefined}
            aria-label={it.label}
            className={cn(
              "relative flex-1 min-h-[52px] grid place-items-center rounded-2xl luxe-tap transition-colors",
              isActive ? "text-[color:var(--luxe-gold)]" : "text-luxe-fg/65"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="luxe-dock-pill"
                className="absolute inset-1 rounded-2xl luxe-dock-active border border-[color:var(--luxe-gold)]/20"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                aria-hidden
              />
            )}
            <span className="relative flex flex-col items-center gap-0.5">
              {(it as any).accent ? (
                <span className="w-10 h-10 grid place-items-center rounded-full luxe-gold-btn shadow-[0_10px_24px_-8px_rgba(200,169,107,0.7)]">
                  <Icon className="w-[18px] h-[18px]" />
                </span>
              ) : (
                <Icon className={cn("w-[20px] h-[20px] transition-transform", isActive && "scale-110 drop-shadow-[0_0_8px_rgba(200,169,107,0.55)]")} />
              )}
              <span className="text-[9px] tracking-[0.16em] uppercase font-mono-l opacity-80">{it.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
