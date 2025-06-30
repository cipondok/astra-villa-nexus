
import { Button } from "@/components/ui/button";
import { Sun, Moon, Sunset, Sparkles, Crown } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ThemeSwitcherProps {
  className?: string;
  variant?: "default" | "compact";
}

const ThemeSwitcher = ({ className = "", variant = "default" }: ThemeSwitcherProps) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Sunset }
  ] as const;

  if (variant === "compact") {
    // Toggle between light and dark (skip system for compact mode)
    const toggleTheme = () => {
      if (theme === "dark") {
        setTheme("light");
      } else {
        setTheme("dark");
      }
    };

    const getCurrentTheme = () => {
      if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return theme;
    };

    const currentTheme = getCurrentTheme();
    const Icon = currentTheme === "dark" ? Sun : Moon;
    const label = currentTheme === "dark" ? "Light" : "Dark";

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={`flex items-center gap-2 text-white hover:bg-white/20 transition-all duration-300 ${className}`}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden md:inline text-white font-medium">{label}</span>
      </Button>
    );
  }

  return (
    <div className={`flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20 ${className}`}>
      {themes.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(key)}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300
            ${theme === key 
              ? 'bg-white/20 text-white shadow-md font-medium' 
              : 'text-white/70 hover:text-white hover:bg-white/10'
            }
          `}
        >
          <Icon className="h-4 w-4" />
          <span className="text-sm">{label}</span>
          {theme === key && <Sparkles className="h-3 w-3 animate-pulse" />}
        </Button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
