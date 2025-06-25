
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "middle" | "light" | "system";

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
  defaultTheme = "system",
  storageKey = "astra-villa-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark", "middle");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      
      // Apply Samsung Blue Titanium colors for system theme
      if (systemTheme === "dark") {
        root.style.setProperty('--background', '220 30% 8%'); // Very Dark Titanium
        root.style.setProperty('--card', '220 30% 12%'); // Dark Card Background
        root.style.setProperty('--primary', '217 91% 60%'); // Bright Blue for dark mode
      } else {
        root.style.setProperty('--background', '0 0% 100%'); // White
        root.style.setProperty('--card', '0 0% 100%'); // White cards
        root.style.setProperty('--primary', '214 100% 47%'); // Samsung Blue Primary
      }
      return;
    }

    root.classList.add(theme);
    
    // Apply Samsung Blue Titanium colors based on theme
    if (theme === "dark") {
      root.style.setProperty('--background', '220 30% 8%'); // Very Dark Titanium
      root.style.setProperty('--card', '220 30% 12%'); // Dark Card Background
      root.style.setProperty('--primary', '217 91% 60%'); // Bright Blue for dark mode
    } else if (theme === "middle") {
      root.style.setProperty('--background', '220 15% 96%'); // Titanium White
      root.style.setProperty('--card', '0 0% 100%'); // Pure white cards
      root.style.setProperty('--primary', '214 100% 47%'); // Samsung Blue Primary
    } else {
      root.style.setProperty('--background', '0 0% 100%'); // White
      root.style.setProperty('--card', '0 0% 100%'); // White cards
      root.style.setProperty('--primary', '214 100% 47%'); // Samsung Blue Primary
    }
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
