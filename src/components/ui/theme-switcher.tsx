
import { Button } from "@/components/ui/button";
import { Sun, Moon, Sunset, Sparkles } from "lucide-react";
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
    // Simple toggle between light and dark
    const toggleTheme = () => {
      console.log('Toggling theme from:', theme);
      if (theme === "dark") {
        setTheme("light");
      } else if (theme === "light") {
        setTheme("dark");
      } else {
        // If system, check current system preference and toggle opposite
        const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(systemIsDark ? "light" : "dark");
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
    const label = currentTheme === "dark" ? "Light Mode" : "Dark Mode";

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={`relative w-10 h-10 p-0 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-sm transition-all duration-300 shadow-md hover:shadow-lg group ${className}`}
        title={label}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-500 dark:from-purple-500 dark:to-blue-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white/20 transition-all duration-300">
          <Icon className="h-4 w-4 text-white drop-shadow-sm transition-transform group-hover:scale-110" />
        </div>
      </Button>
    );
  }

  return (
    <div className={`flex items-center bg-gray-100 dark:bg-gray-700 backdrop-blur-sm rounded-lg p-1 border border-gray-200 dark:border-gray-600 ${className}`}>
      {themes.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant="ghost"
          size="sm"
          onClick={() => {
            console.log('Setting theme to:', key);
            setTheme(key);
          }}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300
            ${theme === key 
              ? 'bg-blue-600 text-white shadow-md font-medium' 
              : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
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
