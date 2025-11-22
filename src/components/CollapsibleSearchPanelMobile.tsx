import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CollapsibleSearchPanelMobileProps {
  children: React.ReactNode;
  activeFiltersCount: number;
}

export const CollapsibleSearchPanelMobile: React.FC<CollapsibleSearchPanelMobileProps> = ({
  children,
  activeFiltersCount
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="w-full relative transition-all duration-300">
      <div className="relative backdrop-blur-2xl bg-gradient-to-br from-background/95 via-background/90 to-background/95 border-b-2 border-border/40 shadow-2xl rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-60 animate-shimmer" />
        
        <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-all duration-300 border-b border-border/20 relative z-10">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Search Properties</span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <ChevronDown className={`h-5 w-5 text-primary transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="relative z-[1]">
              {children}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
