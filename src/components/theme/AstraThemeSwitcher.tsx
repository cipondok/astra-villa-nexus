import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  className?: string;
  size?: "sm" | "default" | "icon";
}

/**
 * ASTRA Theme Switcher — toggles between Black Gold ↔ Pearl White.
 * Single-button, instant. Keyboard accessible. Persists via ThemeProvider.
 */
export default function AstraThemeSwitcher({ className, size = "icon" }: Props) {
  const { astraTheme, toggleTheme } = useTheme();
  const isDark = astraTheme === "astra-black-gold";
  const label = isDark ? "Switch to Pearl White" : "Switch to Black Gold";

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={className}
    >
      {isDark ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
      {size !== "icon" && (
        <span className="ml-2 text-xs uppercase tracking-wider">
          {isDark ? "Pearl" : "Obsidian"}
        </span>
      )}
    </Button>
  );
}
