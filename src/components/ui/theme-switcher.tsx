
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
    // Cycle through themes with single button
    const currentIndex = themes.findIndex(t => t.key === theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    const Icon = nextTheme.icon;

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(nextTheme.key)}
        className={`flex items-center gap-3 text-white hover:bg-white/20 glass-ultra border-white/20 transition-all duration-300 group micro-bounce ${className}`}
      >
        <Icon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
        <span className="hidden md:inline text-white font-medium">{nextTheme.label}</span>
        <Sparkles className="h-3 w-3 animate-pulse" />
      </Button>
    );
  }

  return (
    <div className={`flex items-center glass-ultra rounded-3xl p-2 border border-border/20 ${className}`}>
      {themes.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(key)}
          className={`
            flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all duration-500 group micro-bounce
            ${theme === key 
              ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-2xl scale-105 animate-pulse-glow' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/10 hover:scale-105'
            }
          `}
        >
          <Icon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-semibold">{label}</span>
          {theme === key && <Sparkles className="h-3 w-3 animate-float" />}
        </Button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
