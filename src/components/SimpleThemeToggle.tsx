
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
      className={`flex items-center gap-2 text-white hover:bg-white/20 ${className}`}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="hidden md:inline text-white">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="hidden md:inline text-white">Dark</span>
        </>
      )}
    </Button>
  );
};

export default SimpleThemeToggle;
