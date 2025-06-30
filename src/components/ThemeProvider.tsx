
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "astra-villa-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    // Remove all theme classes first
    root.classList.remove("light", "dark");
    body.classList.remove("dark", "light");

    let effectiveTheme = theme;

    // Handle system theme
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      effectiveTheme = systemTheme;
    }

    // Apply theme classes
    root.classList.add(effectiveTheme);
    if (effectiveTheme === "dark") {
      body.classList.add("dark");
    } else {
      body.classList.add("light");
    }

    // Set CSS custom properties for consistent theming
    if (effectiveTheme === "dark") {
      root.style.setProperty('--background', '0 0 0');
      root.style.setProperty('--foreground', '255 255 255');
      root.style.setProperty('--card', '28 28 30');
      root.style.setProperty('--card-foreground', '255 255 255');
      root.style.setProperty('--primary', '217 91 60');
      root.style.setProperty('--primary-foreground', '255 255 255');
      root.style.setProperty('--secondary', '44 44 46');
      root.style.setProperty('--secondary-foreground', '255 255 255');
      root.style.setProperty('--muted', '44 44 46');
      root.style.setProperty('--muted-foreground', '174 174 178');
      root.style.setProperty('--border', '58 58 60');
    } else {
      root.style.setProperty('--background', '255 255 255');
      root.style.setProperty('--foreground', '0 0 0');
      root.style.setProperty('--card', '255 255 255');
      root.style.setProperty('--card-foreground', '0 0 0');
      root.style.setProperty('--primary', '217 91 60');
      root.style.setProperty('--primary-foreground', '255 255 255');
      root.style.setProperty('--secondary', '245 245 247');
      root.style.setProperty('--secondary-foreground', '0 0 0');
      root.style.setProperty('--muted', '248 248 248');
      root.style.setProperty('--muted-foreground', '99 99 102');
      root.style.setProperty('--border', '229 229 234');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        // Trigger re-render when system theme changes
        setTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
