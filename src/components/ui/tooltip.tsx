
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const getTooltipThemeClasses = (theme: 'light' | 'dark' | 'colorful') => {
  switch (theme) {
    case 'light':
      return "bg-background/95 border-border text-foreground shadow-md";
    case 'dark':
      return "bg-popover/95 border-border text-popover-foreground shadow-lg";
    case 'colorful':
      return "bg-gradient-to-br from-primary to-primary/80 border-primary/30 text-primary-foreground shadow-xl shadow-primary/20";
    default:
      return "bg-popover/95 border-border text-popover-foreground shadow-lg";
  }
};

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const getTheme = () => {
    try {
      const saved = localStorage.getItem('tooltip_preferences');
      return saved ? JSON.parse(saved).theme || 'dark' : 'dark';
    } catch {
      return 'dark';
    }
  };

  const theme = getTheme();

  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-[99999] overflow-hidden rounded-md backdrop-blur-sm px-3 py-1.5 text-sm font-medium animate-in fade-in-50 zoom-in-95 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        getTooltipThemeClasses(theme),
        className
      )}
      {...props}
    />
  );
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

const TooltipProviderWithDelay = ({ children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) => {
  // Read tooltip preferences from localStorage
  const getTooltipPrefs = () => {
    try {
      const saved = localStorage.getItem('tooltip_preferences');
      return saved ? JSON.parse(saved) : { enabled: true, delay: 300 };
    } catch {
      return { enabled: true, delay: 300 };
    }
  };

  const prefs = getTooltipPrefs();
  
  // If tooltips are disabled globally, don't render the provider
  if (!prefs.enabled) {
    return <>{children}</>;
  }

  return (
    <TooltipPrimitive.Provider delayDuration={prefs.delay} {...props}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipProviderWithDelay }
