
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
        className={`flex items-center gap-2 text-white hover:bg-white/20 dark:text-gray-300 dark:hover:bg-gray-600/50 transition-all duration-300 ${className}`}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden md:inline text-white dark:text-gray-300 font-medium text-sm">{label}</span>
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
