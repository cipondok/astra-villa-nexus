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
    <div ref={sidebarRef} className="relative h-full flex">
      {/* Icon-only Sidebar */}
      <div className="w-16 h-full bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 flex flex-col py-3 px-2 gap-1 shadow-xl">
        {categories.map((category) => {
          const sections = navigationSections[category as keyof typeof navigationSections];
          if (!sections || sections.length === 0) return null;

          const CategoryIcon = categoryIcons[category] || LayoutDashboard;
          const isActive = activeCategory === category;
          const isOpen = openCategory === category;
          const isHovered = hoveredCategory === category;

          return (
            <div key={category} className="relative">
              {/* Icon Button */}
              <button
                onClick={() => handleCategoryClick(category)}
                onMouseEnter={() => setHoveredCategory(category)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative",
                  isOpen 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                    : isActive
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "hover:bg-slate-700/70 text-slate-400 hover:text-white"
                )}
              >
                <CategoryIcon className="h-5 w-5" />
                
                {/* Active indicator dot */}
                {isActive && !isOpen && (
                  <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </button>

              {/* Hover Tooltip */}
              {isHovered && !openCategory && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 animate-in fade-in-0 slide-in-from-left-2 duration-200">
                  <div className="px-3 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
                    {sectionTitles[category as keyof typeof sectionTitles]}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Flyout Panel */}
      {openCategory && openSections && (
        <div className="absolute left-16 top-0 h-full w-72 bg-background border-r border-border shadow-2xl z-40 animate-in slide-in-from-left-4 duration-200">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              {(() => {
                const CategoryIcon = categoryIcons[openCategory] || LayoutDashboard;
                return (
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                  </div>
                );
              })()}
              <div>
                <h3 className="font-semibold text-foreground">
                  {sectionTitles[openCategory as keyof typeof sectionTitles]}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {openSections.length} item{openSections.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpenCategory(null)}
              className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Panel Content */}
          <ScrollArea className="h-[calc(100%-73px)]">
            <div className="p-3 space-y-1">
              {openSections.map((section) => {
                const Icon = section.icon;
                const isActive = section.key === activeSection;

                return (
                  <button
                    key={section.key}
                    onClick={() => handleNavClick(section.key)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left group",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-muted/80 text-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      isActive 
                        ? "bg-primary-foreground/20" 
                        : "bg-muted group-hover:bg-primary/10"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        isActive ? "text-primary-foreground" : "text-primary"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium text-sm truncate",
                          isActive ? "text-primary-foreground" : "text-foreground"
                        )}>
                          {section.label}
                        </span>
                        {'badge' in section && section.badge && (
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0",
                            isActive 
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-destructive text-destructive-foreground"
                          )}>
                            {String(section.badge)}
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs mt-0.5 line-clamp-2",
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground"
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
  );
}