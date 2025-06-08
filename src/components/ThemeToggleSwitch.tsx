
import { Button } from "@/components/ui/button";
import { Sun, Sunset, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ThemeToggleSwitchProps {
  language?: "en" | "id";
  className?: string;
}

const ThemeToggleSwitch = ({ language = "en", className = "" }: ThemeToggleSwitchProps) => {
  const { theme, setTheme } = useTheme();

  const text = {
    en: {
      light: "Light",
      middle: "Middle", 
      dark: "Dark"
    },
    id: {
      light: "Terang",
      middle: "Tengah",
      dark: "Gelap"
    }
  };

  const currentText = text[language];

  // 3-step theme cycling function
  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("middle");
    } else if (theme === "middle") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const getCurrentThemeData = () => {
    switch (theme) {
      case "light":
        return { icon: Sun, label: currentText.light, color: "text-yellow-500" };
      case "middle":
        return { icon: Sunset, label: currentText.middle, color: "text-orange-500" };
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
      onClick={cycleTheme}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300
        glass-ios border border-border/30 hover:bg-foreground/10
        ${className}
      `}
    >
      <Icon className={`h-4 w-4 ${currentThemeData.color}`} />
      <span className="text-sm font-medium text-foreground">{currentThemeData.label}</span>
    </Button>
  );
};

export default ThemeToggleSwitch;
