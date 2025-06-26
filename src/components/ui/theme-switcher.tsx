
import { Button } from "@/components/ui/button";
import { Sun, Moon, Sunset, Sparkles, DollarSign } from "lucide-react";
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
        className={`flex items-center gap-3 text-foreground hover:bg-yellow-400/20 glass-binance border-yellow-400/20 transition-all duration-300 group micro-bounce-binance ${className}`}
      >
        <Icon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
        <span className="hidden md:inline text-foreground font-medium">{nextTheme.label}</span>
        <DollarSign className="h-3 w-3 animate-pulse" />
      </Button>
    );
  }

  return (
    <div className={`flex items-center glass-binance rounded-2xl p-2 border border-border/20 ${className}`}>
      {themes.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(key)}
          className={`
            flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-500 group micro-bounce-binance
            ${theme === key 
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-2xl scale-105 animate-binance-glow' 
              : 'text-muted-foreground hover:text-foreground hover:bg-yellow-400/10 hover:scale-105'
            }
          `}
        >
          <Icon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-semibold">{label}</span>
          {theme === key && <Sparkles className="h-3 w-3 animate-binance-float" />}
        </Button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
