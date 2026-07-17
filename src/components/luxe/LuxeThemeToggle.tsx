import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LuxeThemeToggleProps {
  className?: string;
  /** "icon" = round 36px icon button (header). "pill" = wider segmented pill. */
  variant?: "icon" | "pill";
}

/**
 * Premium glass theme toggle.
 * Resolves system → light/dark; tapping sets explicit preference.
 */
export function LuxeThemeToggle({ className, variant = "icon" }: LuxeThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  // ThemeProvider already resolves 'system' to 'dark'|'light'.
  const resolved = theme;
  const next = resolved === "dark" ? "light" : "dark";
  const isDark = resolved === "dark";

  if (variant === "pill") {
    return (
      <div
        className={cn(
          "luxe-glass-card inline-flex items-center rounded-full p-1 border",
          "border-luxe gap-1",
          className
        )}
      >
        {(["light", "dark"] as const).map((t) => {
          const active = resolved === t;
          const Icon = t === "dark" ? Moon : Sun;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              aria-pressed={active}
              aria-label={`Switch to ${t} theme`}
              className={cn(
                "relative w-9 h-9 grid place-items-center rounded-full transition-all duration-300 luxe-tap",
                active
                  ? "luxe-gold-btn shadow-[0_8px_22px_-10px_rgba(200,169,107,0.7)]"
                  : "text-luxe-mut hover:text-luxe-gold"
              )}
            >
              <Icon className="w-[15px] h-[15px]" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={cn(
        "relative w-9 h-9 grid place-items-center rounded-full border luxe-tap overflow-hidden",
        "bg-luxe-glass border-luxe hover:border-[color:var(--luxe-gold)] hover:text-luxe-gold",
        "transition-colors duration-300",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 grid place-items-center transition-all duration-500 ease-\[cubic-bezier(0.22,1,0.36,1)\]",
          isDark ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"
        )}
      >
        <Moon className="w-4 h-4 text-luxe-gold" />
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 grid place-items-center transition-all duration-500 ease-\[cubic-bezier(0.22,1,0.36,1)\]",
          !isDark ? "rotate-0 opacity-100 scale-100" : "rotate-90 opacity-0 scale-50"
        )}
      >
        <Sun className="w-4 h-4 text-luxe-gold" />
      </span>
    </button>
  );
}
