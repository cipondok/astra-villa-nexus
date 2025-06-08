
import { Button } from "@/components/ui/button";
import { Sun, Sunset, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ThemeToggleBarProps {
  language: "en" | "id";
}

const ThemeToggleBar = ({ language }: ThemeToggleBarProps) => {
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

  const themes = [
    { key: "light", label: currentText.light, icon: Sun },
    { key: "middle", label: currentText.middle, icon: Sunset },
    { key: "dark", label: currentText.dark, icon: Moon }
  ] as const;

  return (
    <div className="flex items-center glass-ios rounded-full p-1 border border-border/30">
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

export default ThemeToggleBar;
