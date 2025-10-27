
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ThemeToggleSwitchProps {
  language?: "en" | "id";
  className?: string;
  showLabel?: boolean;
}

const ThemeToggleSwitch = ({ language = "en", className = "", showLabel = true }: ThemeToggleSwitchProps) => {
  const { theme, setTheme } = useTheme();

  const text = {
    en: {
      light: "Light",
      dark: "Dark"
    },
    id: {
      light: "Terang",
      dark: "Gelap"
    }
  };

  const currentText = text[language];

  // Toggle between light and dark
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
        return { icon: Sun, label: currentText.light, color: "text-yellow-500" };
      case "dark":
        return { icon: Moon, label: currentText.dark, color: "text-blue-400" };
      default:
        return { icon: Sun, label: currentText.light, color: "text-yellow-500" };
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
        backdrop-blur-xl bg-white/10 dark:bg-black/20 
        border border-white/20 dark:border-yellow-500/30
        hover:bg-white/20 dark:hover:bg-yellow-500/10 
        hover:border-white/30 dark:hover:border-yellow-500/40
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
