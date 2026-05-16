
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
    // Simple toggle between dark and light only
    const toggleTheme = () => {
      console.log('Toggling theme from:', theme);
      setTheme(theme === "dark" ? "light" : "dark");
    };

    const isDark = theme === "dark";
    const Icon = isDark ? Sun : Moon;
    const label = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={`relative w-10 h-10 p-0 rounded-xl bg-primary-foreground/15 hover:bg-primary-foreground/25 border border-primary-foreground/30 backdrop-blur-sm transition-all duration-300 shadow-md hover:shadow-lg group ${className}`}
        title={label}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ring-2 ring-primary-foreground/20 transition-all duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-accent to-primary' 
            : 'bg-gradient-to-br from-chart-3 to-gold-primary'
        }`}>
          <Icon className="h-4 w-4 text-primary-foreground drop-shadow-sm transition-transform group-hover:scale-110" />
        </div>
      </Button>
    );
  }

  return (
    <div className={`flex items-center bg-muted backdrop-blur-sm rounded-lg p-1 border border-border ${className}`}>
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
              ? 'bg-primary text-primary-foreground shadow-md font-medium' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
