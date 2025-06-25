
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
      
      // Apply custom dark background for system dark mode
      if (systemTheme === "dark") {
        root.style.setProperty('--background', '51 52 70'); // #333446 in HSL
        root.style.setProperty('--card', '58 59 78'); // Slightly lighter for cards
      } else {
        root.style.removeProperty('--background');
        root.style.removeProperty('--card');
      }
      return;
    }

    root.classList.add(theme);
    
    // Apply custom dark background for dark and middle themes
    if (theme === "dark") {
      root.style.setProperty('--background', '51 52 70'); // #333446 in HSL
      root.style.setProperty('--card', '58 59 78'); // Slightly lighter for cards
    } else if (theme === "middle") {
      // Middle theme uses cream background, no custom override needed
      root.style.removeProperty('--background');
      root.style.removeProperty('--card');
    } else {
      root.style.removeProperty('--background');
      root.style.removeProperty('--card');
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
