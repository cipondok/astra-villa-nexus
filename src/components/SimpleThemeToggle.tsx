
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
      className={`flex items-center gap-2 backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-yellow-500/30 hover:bg-white/20 dark:hover:bg-yellow-500/10 hover:border-white/30 dark:hover:border-yellow-500/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 rounded-xl ${className}`}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4 text-yellow-500" />
          <span className="hidden md:inline text-foreground font-medium">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-blue-500 dark:text-yellow-500" />
          <span className="hidden md:inline text-foreground font-medium">Dark</span>
        </>
      )}
    </Button>
  );
};

export default SimpleThemeToggle;
