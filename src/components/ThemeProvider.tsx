import { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * ASTRA Design System V3 — Theme Provider
 *
 * Two locked ASTRA themes:
 *   • astra-black-gold  → dark default (Obsidian Black + Champagne Gold)
 *   • astra-pearl-white → light default (Warm Ivory + Deep Gold)
 *
 * Legacy values 'dark' | 'light' | 'system' remain accepted and are
 * mapped to the new ASTRA themes so existing callers keep working.
 */
export type AstraTheme = "astra-black-gold" | "astra-pearl-white";
export type Theme = AstraTheme | "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  /** The resolved ASTRA theme currently applied to <html>. */
  theme: AstraTheme;
  /** Raw stored preference (may be 'system'). */
  preference: Theme;
  /** Set a new preference. Persists to localStorage. */
  setTheme: (theme: Theme) => void;
  /** Toggle between the two ASTRA themes. */
  toggleTheme: () => void;
};

const STORAGE_KEY_DEFAULT = "astra-villa-theme";

function normalize(value: Theme | null | undefined): AstraTheme | "system" {
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
  theme: "astra-black-gold",
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
  const [preference, setPreference] = useState<Theme>(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = localStorage.getItem(storageKey) as Theme | null;
        if (saved) return saved;
      }
    } catch {
      /* ignore */
    }
    return defaultTheme;
  });

  const normalized = normalize(preference);
  const resolved: AstraTheme = normalized === "system" ? resolveSystem() : normalized;

  // Apply the resolved theme to <html>
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "astra-pearl-white", "astra-black-gold");

    if (resolved === "astra-black-gold") {
      root.classList.add("dark");
      root.classList.add("astra-black-gold");
      root.setAttribute("data-theme", "astra-black-gold");
    } else {
      root.classList.add("light");
      root.classList.add("astra-pearl-white");
      root.setAttribute("data-theme", "astra-pearl-white");
    }

    // Follow OS only when preference is 'system'
    if (normalized !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      root.classList.remove("light", "dark", "astra-pearl-white", "astra-black-gold");
      const next: AstraTheme = mq.matches ? "astra-black-gold" : "astra-pearl-white";
      root.classList.add(next === "astra-black-gold" ? "dark" : "light");
      root.classList.add(next);
      root.setAttribute("data-theme", next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [resolved, normalized]);

  const setTheme = useCallback(
    (next: Theme) => {
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        /* ignore */
      }
      setPreference(next);
    },
    [storageKey]
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolved === "astra-black-gold" ? "astra-pearl-white" : "astra-black-gold");
  }, [resolved, setTheme]);

  return (
    <ThemeProviderContext.Provider
      value={{ theme: resolved, preference, setTheme, toggleTheme }}
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
