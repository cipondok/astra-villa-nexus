
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslation } from "@/i18n/useTranslation";

interface ThemeToggleSwitchProps {
  language?: "en" | "id" | "zh" | "ja" | "ko";
  className?: string;
  showLabel?: boolean;
}

const ThemeToggleSwitch = ({ className = "", showLabel = true }: ThemeToggleSwitchProps) => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const getCurrentThemeData = () => {
    switch (theme) {
      case "light":
        return { icon: Sun, label: t('themeToggle.light'), color: "text-gold-primary" };
      case "dark":
        return { icon: Moon, label: t('themeToggle.dark'), color: "text-chart-4" };
      default:
        return { icon: Sun, label: t('themeToggle.light'), color: "text-gold-primary" };
    }
  };

  const currentThemeData = getCurrentThemeData();
  const Icon = currentThemeData.icon;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300
        backdrop-blur-xl bg-muted/10 dark:bg-muted/20 
        border border-border/20 dark:border-gold-primary/30
        hover:bg-muted/20 dark:hover:bg-gold-primary/10 
        hover:border-border/30 dark:hover:border-gold-primary/40
        hover:scale-105 shadow-lg hover:shadow-xl
        ${className}
      `}
    >
      <Icon className={`h-4 w-4 ${currentThemeData.color}`} />
      {showLabel && <span className="text-sm font-medium text-foreground">{currentThemeData.label}</span>}
    </Button>
  );
};

export default ThemeToggleSwitch;
