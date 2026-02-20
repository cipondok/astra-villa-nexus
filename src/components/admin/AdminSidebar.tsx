import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  Globe,
  Palette,
  Sparkles,
  type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

const categoryIcons: Record<string, LucideIcon> = {
  "overview": LayoutDashboard,
  "investor-management": Globe,
  "transactions": DollarSign,
  "astra-token": Coins,
  "tools": Wrench,
  "core-management": Building2,
  "customer-service": Headphones,
  "user-management": Users,
  "vendor-management": ShoppingBag,
  "analytics-monitoring": BarChart3,
  "content-settings": Palette,
  "system-settings": Settings,
  "technical": Cpu,
  "features": Sparkles,
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
  const [flyoutQuery, setFlyoutQuery] = useState('');

  // Memoize expensive active category lookup
  const activeCategory = useMemo(() => {
    for (const category of categories) {
      const sections = navigationSections[category as keyof typeof navigationSections];
      if (sections?.some((section) => section.key === activeSection)) {
        return category;
      }
    }
    return 'overview';
  }, [activeSection]);

  const handleCategoryClick = useCallback((category: string) => {
    setOpenCategory(prev => prev === category ? null : category);
  }, []);

  const handleNavClick = useCallback((key: string) => {
    onSectionChange(key);
    setOpenCategory(null);
  }, [onSectionChange]);

  // Reset flyout search when category changes/closes
  useEffect(() => {
    setFlyoutQuery('');
  }, [openCategory]);

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

  
  const openSections = openCategory ? navigationSections[openCategory as keyof typeof navigationSections] : null;
  const filteredOpenSections = openSections
    ? openSections.filter((section) => {
        if (!flyoutQuery.trim()) return true;
        const q = flyoutQuery.trim().toLowerCase();
        return (
          section.label.toLowerCase().includes(q) ||
          section.key.toLowerCase().includes(q) ||
          section.description.toLowerCase().includes(q)
        );
      })
    : null;

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
         <div className="w-12 h-full bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/30 flex flex-col py-2 px-1.5 shadow-lg">
           {/* IMPORTANT: category list must be scrollable or bottom categories (like Features) become unreachable */}
           <ScrollArea className="flex-1">
             <div className="flex flex-col gap-0.5">
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
                         "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 group relative",
                         isOpen
                           ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105"
                           : isActive
                             ? "bg-primary/15 text-primary"
                             : "hover:bg-slate-700/60 text-slate-400 hover:text-slate-100 hover:scale-105"
                       )}
                     >
                       <CategoryIcon className="h-4 w-4 transition-transform duration-200" />

                       {/* Active indicator bar */}
                       {isActive && !isOpen && (
                         <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full transition-all duration-300" />
                       )}
                       {/* Open indicator bar */}
                       {isOpen && (
                         <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground/60 rounded-full" />
                       )}
                     </button>

                      {/* Hover Tooltip */}
                      {isHovered && openCategory !== category && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50 animate-in fade-in-0 slide-in-from-left-2 duration-150 pointer-events-none">
                          <div className="px-2.5 py-1.5 bg-foreground text-background text-xs font-medium rounded-md shadow-xl border border-border/20 whitespace-nowrap">
                            {sectionTitles[category as keyof typeof sectionTitles]}
                            {/* Arrow */}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
                          </div>
                        </div>
                      )}
                   </div>
                 );
               })}
             </div>
           </ScrollArea>
         </div>

        {/* Flyout Panel */}
        {openCategory && openSections && (
          <div className="absolute left-14 top-2 max-h-[calc(100%-16px)] w-52 bg-popover/98 backdrop-blur-xl rounded-xl border border-border/60 shadow-2xl z-40 animate-in slide-in-from-left-3 fade-in-0 duration-200 overflow-hidden ring-1 ring-black/5">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2">
                {(() => {
                  const CategoryIcon = categoryIcons[openCategory] || LayoutDashboard;
                  return <CategoryIcon className="h-3.5 w-3.5 text-primary" />;
                })()}
                <h3 className="font-semibold text-xs text-foreground">
                  {sectionTitles[openCategory as keyof typeof sectionTitles]}
                </h3>
              </div>
              <button
                onClick={() => setOpenCategory(null)}
                className="w-5 h-5 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-150 hover:scale-110"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Quick search within category */}
            <div className="px-2.5 py-2 border-b border-border/30">
              <Input
                value={flyoutQuery}
                onChange={(e) => setFlyoutQuery(e.target.value)}
                placeholder={`Search ${sectionTitles[openCategory as keyof typeof sectionTitles] ?? 'sections'}...`}
                className="h-7 text-xs bg-background/50"
                autoFocus
              />
            </div>

            {/* Panel Content */}
            <ScrollArea className="max-h-[300px]">
              <div className="p-1.5 pb-2">
                {filteredOpenSections?.length ? filteredOpenSections.map((section, idx) => {
                  const Icon = section.icon;
                  const isActive = section.key === activeSection;

                  return (
                    <button
                      key={section.key}
                      onClick={() => handleNavClick(section.key)}
                      style={{ animationDelay: `${idx * 20}ms` }}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-150 text-left group animate-in fade-in slide-in-from-left-1 duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-accent/60 text-foreground"
                      )}
                    >
                      <Icon className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:scale-110",
                        isActive ? "text-primary-foreground" : "text-primary"
                      )} />
                      <span className={cn(
                        "text-[11px] truncate flex-1 font-medium",
                        isActive ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {section.label}
                      </span>
                      {'badge' in section && section.badge && (
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded-full font-semibold shrink-0",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-destructive text-destructive-foreground"
                        )}>
                          {String(section.badge)}
                        </span>
                      )}
                    </button>
                  );
                }) : (
                  <div className="px-2 py-8 text-center">
                    <p className="text-[11px] text-muted-foreground">No matches for "{flyoutQuery}"</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </>
  );
}