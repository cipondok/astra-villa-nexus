import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

/**
 * ASTRA Design System V3 — Theme Provider
 *
 * Two locked ASTRA themes:
 *   • astra-black-gold  → dark default (Obsidian Black + Champagne Gold)
 *   • astra-pearl-white → light default (Warm Ivory + Deep Gold)
 *
 * Backwards compat: `theme` is exposed as the legacy 'dark' | 'light'
 * union (black-gold === 'dark', pearl-white === 'light') so existing
 * comparisons across the codebase keep working. Use `astraTheme` for
 * the full ASTRA name when needed.
 */
export type AstraTheme = "astra-black-gold" | "astra-pearl-white";
export type ThemePreference = AstraTheme | "dark" | "light" | "system";
/** Legacy-compatible theme value emitted by useTheme().theme. */
export type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: ThemePreference;
  storageKey?: string;
};

type ThemeProviderState = {
  /** Legacy compat value: 'dark' (Black Gold) or 'light' (Pearl White). */
  theme: Theme;
  /** Full ASTRA theme name currently applied. */
  astraTheme: AstraTheme;
  /** Raw stored preference (may be 'system'). */
  preference: ThemePreference;
  /** Set a new preference. Accepts ASTRA names or legacy 'dark'|'light'|'system'. */
  setTheme: (theme: ThemePreference) => void;
  /** Toggle between the two ASTRA themes. */
  toggleTheme: () => void;
};

const STORAGE_KEY_DEFAULT = "astra-villa-theme";

function normalize(value: ThemePreference | null | undefined): AstraTheme | "system" {
  if (value === "astra-black-gold" || value === "dark") return "astra-black-gold";
  if (value === "astra-pearl-white" || value === "light") return "astra-pearl-white";
  return "system";
}

function resolveSystem(): AstraTheme {
  if (typeof window === "undefined") return "astra-black-gold";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "astra-black-gold"
    : "astra-pearl-white";
}

const initialState: ThemeProviderState = {
  theme: "dark",
  astraTheme: "astra-black-gold",
  preference: "astra-black-gold",
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "astra-black-gold",
  storageKey = STORAGE_KEY_DEFAULT,
}: ThemeProviderProps) {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = localStorage.getItem(storageKey) as ThemePreference | null;
        if (saved) return saved;
      }
    } catch {
      /* ignore */
    }
    return defaultTheme;
  });

  const normalized = normalize(preference);
  const astraTheme: AstraTheme =
    normalized === "system" ? resolveSystem() : normalized;
  const theme: Theme = astraTheme === "astra-black-gold" ? "dark" : "light";

  // Apply the resolved theme to <html>
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "astra-pearl-white", "astra-black-gold");

    if (astraTheme === "astra-black-gold") {
      root.classList.add("dark", "astra-black-gold");
      root.setAttribute("data-theme", "astra-black-gold");
    } else {
      root.classList.add("light", "astra-pearl-white");
      root.setAttribute("data-theme", "astra-pearl-white");
    }

    // Follow OS only when preference is 'system'
    if (normalized !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      root.classList.remove("light", "dark", "astra-pearl-white", "astra-black-gold");
      const next: AstraTheme = mq.matches ? "astra-black-gold" : "astra-pearl-white";
      root.classList.add(next === "astra-black-gold" ? "dark" : "light", next);
      root.setAttribute("data-theme", next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [astraTheme, normalized]);

  const setTheme = useCallback(
    (next: ThemePreference) => {
      if (next === preference) return;
      const root = window.document.documentElement;
      root.classList.add("theme-transitioning");

      // Inject motion flash overlay
      const existingFlash = document.getElementById("theme-motion-flash");
      if (existingFlash) existingFlash.remove();
      const flash = document.createElement("div");
      flash.id = "theme-motion-flash";
      flash.className = "theme-motion-flash";
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 400);

      setTimeout(() => root.classList.remove("theme-transitioning"), 250);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        /* ignore */
      }
      setPreference(next);
    },
    [storageKey, preference]
  );

  const toggleTheme = useCallback(() => {
    setTheme(
      astraTheme === "astra-black-gold"
        ? "astra-pearl-white"
        : "astra-black-gold"
    );
  }, [astraTheme, setTheme]);

  return (
    <ThemeProviderContext.Provider
      value={{ theme, astraTheme, preference, setTheme, toggleTheme }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
