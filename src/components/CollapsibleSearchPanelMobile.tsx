import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface CollapsibleSearchPanelMobileProps {
  children: React.ReactNode;
  activeFiltersCount: number;
}

export const CollapsibleSearchPanelMobile: React.FC<CollapsibleSearchPanelMobileProps> = ({
  children,
  activeFiltersCount
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Handle sticky behavior on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsSticky(scrollY > 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={cn(
        "w-full transition-all duration-300 ease-out z-40",
        isSticky && "fixed top-0 left-0 right-0 px-2 pt-2 pb-1"
      )}
      style={isSticky ? { paddingTop: 'max(env(safe-area-inset-top), 8px)' } : undefined}
    >
      <div 
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          // Mobile app-like glass card styling
          "rounded-2xl",
          "border border-border/40",
          "bg-background/95 dark:bg-background/98",
          "shadow-lg shadow-black/5 dark:shadow-black/20",
          "backdrop-blur-2xl",
          // Sticky state enhancements
          isSticky && "shadow-xl shadow-black/10 dark:shadow-black/30 border-border/60"
        )}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />

        <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
          <CollapsibleTrigger asChild>
            <button 
              className={cn(
                "w-full flex items-center justify-between",
                "px-4 py-3",
                "bg-transparent hover:bg-muted/30",
                "active:bg-muted/50",
                "transition-all duration-200",
                "border-b border-border/20",
                "relative z-10",
                // Touch-friendly sizing
                "min-h-[52px]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center",
                  "w-9 h-9 rounded-xl",
                  "bg-primary/10 dark:bg-primary/20"
                )}>
                  <Search className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[15px] font-semibold text-foreground leading-tight">
                    Search Properties
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    Find your dream home
                  </span>
                </div>
                {activeFiltersCount > 0 && (
                  <span className={cn(
                    "ml-1 px-2.5 py-1 rounded-full",
                    "bg-primary text-primary-foreground",
                    "text-[11px] font-bold leading-none",
                    "min-w-[22px] text-center"
                  )}>
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center justify-center",
                  "w-8 h-8 rounded-lg",
                  "bg-muted/50 dark:bg-muted/30",
                  "transition-colors duration-200"
                )}>
                  <ChevronDown 
                    className={cn(
                      "h-4.5 w-4.5 text-muted-foreground",
                      "transition-transform duration-300 ease-out",
                      !isCollapsed && "rotate-180"
                    )} 
                  />
                </div>
              </div>
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 duration-200">
            <div className="relative z-[1]">
              {children}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      {/* Spacer when sticky to prevent content jump */}
      {isSticky && <div className="h-[70px]" />}
    </div>
  );
};
