
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface SimpleThemeToggleProps {
  className?: string;
}

const SimpleThemeToggle = ({ className = "" }: SimpleThemeToggleProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`flex items-center gap-2 backdrop-blur-xl bg-background/10 dark:bg-background/20 border border-border/20 dark:border-chart-3/30 hover:bg-background/20 dark:hover:bg-chart-3/10 hover:border-border/30 dark:hover:border-chart-3/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 rounded-xl ${className}`}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4 text-chart-3" />
          <span className="hidden md:inline text-foreground font-medium">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-primary dark:text-chart-3" />
          <span className="hidden md:inline text-foreground font-medium">Dark</span>
        </>
      )}
    </Button>
  );
};

export default SimpleThemeToggle;
