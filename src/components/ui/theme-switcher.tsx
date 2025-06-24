
import { Button } from "@/components/ui/button";
import { Sun, Moon, Sunset } from "lucide-react";
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
    // Cycle through themes with single button
    const currentIndex = themes.findIndex(t => t.key === theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    const Icon = nextTheme.icon;

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(nextTheme.key)}
        className={`flex items-center gap-2 text-white hover:bg-white/20 ${className}`}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden md:inline text-white">{nextTheme.label}</span>
      </Button>
    );
  }

  return (
    <div className={`flex items-center glass-ios rounded-full p-1 border border-border/30 ${className}`}>
      {themes.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(key)}
          className={`
            flex items-center space-x-1 px-3 py-1 rounded-full transition-all duration-200
            ${theme === key 
              ? 'bg-primary text-primary-foreground shadow-md' 
              : 'text-muted-foreground hover:text-foreground hover:bg-foreground/10'
            }
          `}
        >
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{label}</span>
        </Button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
