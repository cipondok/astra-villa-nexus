
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

    console.log('Theme changed to:', theme);

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
      console.log('System theme detected:', systemTheme);
    }

    // Apply theme classes
    root.classList.add(effectiveTheme);
    body.classList.add(effectiveTheme);

    // Enhanced CSS custom properties with better color combinations
    const updateCSSVariables = () => {
      if (effectiveTheme === "dark") {
        // Dark mode - Rich dark theme
        root.style.setProperty('--background', '2 6 23');           // Deep navy
        root.style.setProperty('--foreground', '248 250 252');      // Soft white
        root.style.setProperty('--card', '15 23 42');               // Dark blue-gray
        root.style.setProperty('--card-foreground', '248 250 252');
        root.style.setProperty('--primary', '99 102 241');          // Bright indigo
        root.style.setProperty('--primary-foreground', '255 255 255');
        root.style.setProperty('--secondary', '30 41 59');          // Dark blue
        root.style.setProperty('--secondary-foreground', '203 213 225');
        root.style.setProperty('--muted', '30 41 59');
        root.style.setProperty('--muted-foreground', '148 163 184');
        root.style.setProperty('--border', '51 65 85');
        root.style.setProperty('--input', '30 41 59');
        root.style.setProperty('--ring', '99 102 241');
        root.style.setProperty('--destructive', '248 113 113');
        root.style.setProperty('--destructive-foreground', '255 255 255');
        root.style.setProperty('--popover', '15 23 42');
        root.style.setProperty('--popover-foreground', '248 250 252');
        root.style.setProperty('--accent', '34 197 94');            // Bright green
        root.style.setProperty('--accent-foreground', '255 255 255');
      } else {
        // Light mode - Clean and modern
        root.style.setProperty('--background', '248 250 252');      // Soft gray-blue
        root.style.setProperty('--foreground', '15 23 42');         // Rich dark blue-gray
        root.style.setProperty('--card', '255 255 255');            // Pure white
        root.style.setProperty('--card-foreground', '15 23 42');
        root.style.setProperty('--primary', '59 130 246');          // Vibrant blue
        root.style.setProperty('--primary-foreground', '255 255 255');
        root.style.setProperty('--secondary', '241 245 249');       // Light blue-gray
        root.style.setProperty('--secondary-foreground', '51 65 85');
        root.style.setProperty('--muted', '248 250 252');
        root.style.setProperty('--muted-foreground', '100 116 139');
        root.style.setProperty('--border', '226 232 240');
        root.style.setProperty('--input', '255 255 255');
        root.style.setProperty('--ring', '59 130 246');
        root.style.setProperty('--destructive', '239 68 68');
        root.style.setProperty('--destructive-foreground', '255 255 255');
        root.style.setProperty('--popover', '255 255 255');
        root.style.setProperty('--popover-foreground', '15 23 42');
        root.style.setProperty('--accent', '16 185 129');           // Fresh emerald
        root.style.setProperty('--accent-foreground', '255 255 255');
      }
    };

    // Apply CSS variables immediately
    updateCSSVariables();

    // Force a reflow to ensure changes are applied
    document.body.offsetHeight;

    console.log('Enhanced theme applied:', effectiveTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        console.log('System theme changed, re-applying');
        // Force re-render
        setTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      console.log('Setting theme to:', theme);
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
