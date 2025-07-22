import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark' | 'system';

const AnimatedThemeToggle = () => {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as ThemeMode || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: ThemeMode) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return null;
  }

  const themes = [
    { mode: 'light' as ThemeMode, icon: Sun, label: 'Light' },
    { mode: 'dark' as ThemeMode, icon: Moon, label: 'Dark' },
    { mode: 'system' as ThemeMode, icon: Monitor, label: 'System' },
  ];

  return (
    <div className="relative">
      {/* Animated Background */}
      <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 transition-all duration-300">
        {/* Sliding indicator */}
        <div
          className={cn(
            "absolute top-1 bottom-1 rounded-full bg-white dark:bg-gray-700 transition-all duration-300 ease-out shadow-md",
            theme === 'light' && "left-1 w-10",
            theme === 'dark' && "left-12 w-10", 
            theme === 'system' && "left-[5.5rem] w-10"
          )}
        />
        
        {/* Theme buttons */}
        {themes.map(({ mode, icon: Icon, label }) => (
          <Button
            key={mode}
            variant="ghost"
            size="sm"
            onClick={() => handleThemeChange(mode)}
            className={cn(
              "relative z-10 flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200",
              "hover:bg-transparent",
              theme === mode 
                ? "text-gray-900 dark:text-white" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <Icon 
              className={cn(
                "h-4 w-4 transition-all duration-300",
                theme === mode && "scale-110"
              )} 
            />
            <span className="text-xs font-medium hidden sm:inline">
              {label}
            </span>
          </Button>
        ))}
      </div>

      {/* Tooltip for mobile */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none sm:hidden">
        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {themes.find(t => t.mode === theme)?.label} theme
        </div>
      </div>
    </div>
  );
};

export default AnimatedThemeToggle;