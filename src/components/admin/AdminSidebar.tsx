import React, { useState, useRef, useEffect } from 'react';
import { navigationSections, sectionTitles, categories } from './navigationSections';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Wrench, 
  Settings, 
  Cpu,
  Coins,
  Headphones,
  ShoppingBag,
  BarChart3,
  FileText,
  HelpCircle,
  X,
  DollarSign,
  type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const categoryIcons: Record<string, LucideIcon> = {
  "overview": LayoutDashboard,
  "transactions": DollarSign,
  "astra-token": Coins,
  "tools": Wrench,
  "core-management": Users,
  "customer-service": Headphones,
  "vendor-management": ShoppingBag,
  "analytics-monitoring": BarChart3,
  "content-settings": FileText,
  "system-settings": Settings,
  "technical": Cpu,
  "features": Building2,
  "help": HelpCircle,
};

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Find which category contains the active section
  const getActiveCategory = () => {
    for (const category of categories) {
      const sections = navigationSections[category as keyof typeof navigationSections];
      if (sections?.some((section) => section.key === activeSection)) {
        return category;
      }
    }
    return 'overview';
  };

  const handleCategoryClick = (category: string) => {
    if (openCategory === category) {
      setOpenCategory(null);
    } else {
      setOpenCategory(category);
    }
  };

  const handleNavClick = (key: string) => {
    onSectionChange(key);
    setOpenCategory(null);
  };

  // Close flyout when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setOpenCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenCategory(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const activeCategory = getActiveCategory();
  const openSections = openCategory ? navigationSections[openCategory as keyof typeof navigationSections] : null;

  return (
    <>
      {/* Backdrop overlay when flyout is open */}
      {openCategory && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30 animate-in fade-in-0 duration-200"
          onClick={() => setOpenCategory(null)}
        />
      )}
      
      <div ref={sidebarRef} className="relative h-full flex z-40">
        {/* Icon-only Sidebar - Compact */}
        <div className="w-12 h-full bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/30 flex flex-col py-2 px-1.5 gap-0.5 shadow-lg">
          {categories.map((category) => {
            const sections = navigationSections[category as keyof typeof navigationSections];
            if (!sections || sections.length === 0) return null;

            const CategoryIcon = categoryIcons[category] || LayoutDashboard;
            const isActive = activeCategory === category;
            const isOpen = openCategory === category;
            const isHovered = hoveredCategory === category;

            return (
              <div key={category} className="relative">
                {/* Icon Button - Smaller */}
                <button
                  onClick={() => handleCategoryClick(category)}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 group relative",
                    isOpen 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : isActive
                        ? "bg-primary/15 text-primary"
                        : "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                  )}
                >
                  <CategoryIcon className="h-4 w-4" />
                  
                  {/* Active indicator dot */}
                  {isActive && !isOpen && (
                    <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </button>

                {/* Hover Tooltip */}
                {isHovered && !openCategory && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 animate-in fade-in-0 slide-in-from-left-1 duration-150">
                    <div className="px-2 py-1 bg-slate-800/95 backdrop-blur-sm text-white text-xs font-medium rounded-md shadow-lg border border-slate-700/50 whitespace-nowrap">
                      {sectionTitles[category as keyof typeof sectionTitles]}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Flyout Panel - Compact with transparent bg */}
        {openCategory && openSections && (
          <div className="absolute left-12 top-0 h-full w-56 bg-background/95 backdrop-blur-md border-r border-border/50 shadow-xl z-40 animate-in slide-in-from-left-2 duration-150">
            {/* Panel Header - Compact */}
            <div className="flex items-center justify-between p-2.5 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-2">
                {(() => {
                  const CategoryIcon = categoryIcons[openCategory] || LayoutDashboard;
                  return (
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                      <CategoryIcon className="h-3.5 w-3.5 text-primary" />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="font-medium text-sm text-foreground leading-tight">
                    {sectionTitles[openCategory as keyof typeof sectionTitles]}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {openSections.length} item{openSections.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpenCategory(null)}
                className="w-6 h-6 rounded-md hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Panel Content - Compact */}
            <ScrollArea className="h-[calc(100%-52px)]">
              <div className="p-1.5 space-y-0.5">
                {openSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = section.key === activeSection;

                  return (
                    <button
                      key={section.key}
                      onClick={() => handleNavClick(section.key)}
                      className={cn(
                        "w-full flex items-start gap-2 p-2 rounded-lg transition-all duration-150 text-left group",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-muted/60 text-foreground"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors",
                        isActive 
                          ? "bg-primary-foreground/15" 
                          : "bg-muted/80 group-hover:bg-primary/10"
                      )}>
                        <Icon className={cn(
                          "h-3.5 w-3.5",
                          isActive ? "text-primary-foreground" : "text-primary"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "font-medium text-xs truncate",
                            isActive ? "text-primary-foreground" : "text-foreground"
                          )}>
                            {section.label}
                          </span>
                          {'badge' in section && section.badge && (
                            <span className={cn(
                              "text-[8px] px-1 py-0.5 rounded-full font-semibold shrink-0",
                              isActive 
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-destructive text-destructive-foreground"
                            )}>
                              {String(section.badge)}
                            </span>
                          )}
                        </div>
                        <p className={cn(
                          "text-[10px] mt-0.5 line-clamp-1",
                          isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {section.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </>
  );
}