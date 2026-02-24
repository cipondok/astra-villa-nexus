
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslation } from "@/i18n/useTranslation";

interface ThemeToggleBarProps {
  language?: "en" | "id" | "zh" | "ja" | "ko";
}

const ThemeToggleBar = ({ language }: ThemeToggleBarProps) => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themes = [
    { key: "light", label: t('themeToggle.light'), icon: Sun },
    { key: "dark", label: t('themeToggle.dark'), icon: Moon }
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
