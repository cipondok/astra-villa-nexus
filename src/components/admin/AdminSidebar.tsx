import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { navigationSections, sectionTitles, categories } from './navigationSections';
import { 
  LayoutDashboard, Users, Building2, Wrench, Settings, Cog, Coins, Headphones,
  Store, BarChart3, HelpCircle, X, ArrowLeftRight, TrendingUp, FileSliders,
  Sparkles, Server, ChevronLeft, ChevronRight, Zap, type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

const categoryIcons: Record<string, LucideIcon> = {
  "overview": LayoutDashboard,
  "execution-command": Zap,
  "marketplace-growth": TrendingUp,
  "market-intelligence": BarChart3,
  "monetization": Coins,
  "operations": Cog,
  "investor-management": TrendingUp,
  "transactions": ArrowLeftRight,
  "astra-token": Coins,
  "tools": Wrench,
  "core-management": Building2,
  "customer-service": Headphones,
  "user-management": Users,
  "vendor-management": Store,
  "analytics-monitoring": BarChart3,
  "content-settings": FileSliders,
  "system-settings": Settings,
  "technical": Server,
  "features": Sparkles,
  "help": HelpCircle,
};

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({ activeSection, onSectionChange, collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [flyoutQuery, setFlyoutQuery] = useState('');

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
    if (category === 'overview') {
      onSectionChange('overview');
      setOpenCategory(null);
    } else {
      setOpenCategory(prev => prev === category ? null : category);
    }
  }, [onSectionChange]);

  const handleNavClick = useCallback((key: string) => {
    onSectionChange(key);
    setOpenCategory(null);
  }, [onSectionChange]);

  useEffect(() => { setFlyoutQuery(''); }, [openCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setOpenCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenCategory(null);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const openSections = openCategory ? navigationSections[openCategory as keyof typeof navigationSections] : null;
  const filteredOpenSections = openSections
    ? openSections.filter((section) => {
        if (!flyoutQuery.trim()) return true;
        const q = flyoutQuery.trim().toLowerCase();
        return section.label.toLowerCase().includes(q) || section.key.toLowerCase().includes(q);
      })
    : null;

  // Determine if we show labels (expanded mode on lg+)
  const showLabels = !collapsed;

  return (
    <>
      {/* Backdrop */}
      {openCategory && (
        <div 
          className="fixed inset-0 bg-black/30 z-[9998]"
          onClick={() => setOpenCategory(null)}
        />
      )}

      <nav
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-screen z-[9999] flex",
          "transition-all duration-200"
        )}
        aria-label="Admin navigation"
      >
        {/* Main sidebar column */}
        <div className={cn(
          "h-full bg-[hsl(var(--sidebar-background))] border-r border-border/30 flex flex-col transition-all duration-200",
          showLabels ? "w-14 lg:w-60" : "w-14"
        )}>
          {/* Logo area */}
          <div className="h-14 flex items-center px-3 border-b border-border/20 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className={cn(
              "ml-2.5 font-semibold text-sm text-sidebar-foreground tracking-tight transition-opacity duration-200",
              showLabels ? "hidden lg:block opacity-100" : "hidden opacity-0"
            )}>
              ASTRA
            </span>
          </div>

          {/* Nav items */}
          <ScrollArea className="flex-1 py-2">
            <div className="flex flex-col gap-0.5 px-2">
              {categories.map((category) => {
                const sections = navigationSections[category as keyof typeof navigationSections];
                if (!sections || sections.length === 0) return null;

                const CategoryIcon = categoryIcons[category] || LayoutDashboard;
                const isActive = activeCategory === category;
                const isOpen = openCategory === category;
                const title = sectionTitles[category as keyof typeof sectionTitles] || category;

                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    aria-label={title}
                    aria-expanded={isOpen}
                    className={cn(
                      "group relative flex items-center gap-3 h-9 rounded-lg px-2.5 transition-all duration-150 text-left w-full",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isOpen
                        ? "bg-primary text-primary-foreground"
                        : isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <CategoryIcon className="h-4 w-4 shrink-0" />
                    <span className={cn(
                      "text-xs font-medium truncate transition-opacity duration-200",
                      showLabels ? "hidden lg:block" : "hidden"
                    )}>
                      {title}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && !isOpen && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                    )}

                    {/* Section count */}
                    {sections.length > 1 && (
                      <span className={cn(
                        "text-[9px] tabular-nums font-medium rounded px-1 py-0.5 transition-opacity duration-200",
                        showLabels ? "hidden lg:block ml-auto" : "hidden",
                        isOpen ? "bg-primary-foreground/20 text-primary-foreground" :
                        isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {sections.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Collapse toggle */}
          {onToggleCollapse && (
            <div className="hidden lg:block border-t border-border/20 p-2 shrink-0">
              <button
                onClick={onToggleCollapse}
                className="w-full flex items-center justify-center h-8 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Flyout Panel */}
        {openCategory && openSections && (
          <div 
            role="menu"
            className="absolute left-14 lg:left-60 top-2 w-56 bg-popover border border-border/50 rounded-xl shadow-xl z-[9999] flex flex-col"
            style={{ maxHeight: 'min(calc(100vh - 80px), 680px)' }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/30 shrink-0">
              <h3 className="font-semibold text-xs text-foreground">
                {sectionTitles[openCategory as keyof typeof sectionTitles]}
              </h3>
              <button
                onClick={() => setOpenCategory(null)}
                className="w-5 h-5 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Search */}
            {(openSections.length > 6) && (
              <div className="px-2.5 py-2 border-b border-border/20 shrink-0">
                <Input
                  value={flyoutQuery}
                  onChange={(e) => setFlyoutQuery(e.target.value)}
                  placeholder="Filter…"
                  className="h-7 text-xs bg-muted/40"
                  autoFocus
                />
              </div>
            )}

            {/* Items */}
            <ScrollArea className="flex-1 overflow-auto" style={{ maxHeight: '560px' }}>
              <div className="p-1.5 space-y-0.5">
                {filteredOpenSections?.length ? filteredOpenSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = section.key === activeSection;
                  return (
                    <button
                      key={section.key}
                      onClick={() => handleNavClick(section.key)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                      <span className="text-[11px] truncate flex-1 font-medium">{section.label}</span>
                      {'badge' in section && section.badge && (
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded font-semibold shrink-0",
                          isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent text-accent-foreground"
                        )}>
                          {String(section.badge)}
                        </span>
                      )}
                    </button>
                  );
                }) : (
                  <div className="px-2 py-6 text-center text-[11px] text-muted-foreground">
                    No matches
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </nav>
    </>
  );
}
