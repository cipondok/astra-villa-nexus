import React, { useState, useRef, useEffect, useMemo, useCallback, useId } from 'react';
import { navigationSections, sectionTitles, categories } from './navigationSections';
import {
  LayoutDashboard, Users, Building2, Wrench, Settings, Cog, Coins, Headphones,
  Store, BarChart3, HelpCircle, X, ArrowLeftRight, TrendingUp, FileSliders,
  Sparkles, Server, ChevronLeft, ChevronRight, Zap, type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from './adminLayoutTokens';
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
  /** Whether the mobile off-canvas drawer is open (only used below `lg`). */
  mobileOpen?: boolean;
  /** Close the mobile off-canvas drawer. */
  onMobileClose?: () => void;
}

export function AdminSidebar({
  activeSection,
  onSectionChange,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const menuItemRefs = useRef<HTMLButtonElement[]>([]);
  const lastOpenerRef = useRef<HTMLButtonElement | null>(null);

  const flyoutId = useId();

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

  const closeFlyout = useCallback((restoreFocus = true) => {
    setOpenCategory(null);
    if (restoreFocus && lastOpenerRef.current) {
      // Defer to next tick so React can unmount the flyout first.
      const opener = lastOpenerRef.current;
      requestAnimationFrame(() => opener.focus());
    }
  }, []);

  const handleCategoryClick = useCallback((category: string, event?: React.MouseEvent | React.KeyboardEvent) => {
    const sections = navigationSections[category as keyof typeof navigationSections];
    const target = event?.currentTarget as HTMLButtonElement | undefined;
    if (target) lastOpenerRef.current = target;

    if (sections && sections.length === 1) {
      onSectionChange(sections[0].key);
      setOpenCategory(null);
    } else {
      setOpenCategory(prev => prev === category ? null : category);
    }
  }, [onSectionChange]);

  const handleNavClick = useCallback((key: string) => {
    onSectionChange(key);
    // Selecting an item closes the flyout, focus returns to opener naturally on next tab.
    setOpenCategory(null);
    // Also close the mobile drawer if it is open.
    onMobileClose?.();
  }, [onSectionChange, onMobileClose]);

  useEffect(() => { setFlyoutQuery(''); menuItemRefs.current = []; }, [openCategory]);

  // Outside click closes flyout (do not restore focus — user clicked away).
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setOpenCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape closes flyout and returns focus to the opener.
  useEffect(() => {
    if (!openCategory) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeFlyout(true);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [openCategory, closeFlyout]);

  // When the flyout opens, move focus to the search input (if visible) or the first menu item.
  useEffect(() => {
    if (!openCategory) return;
    const raf = requestAnimationFrame(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      } else if (menuItemRefs.current[0]) {
        menuItemRefs.current[0].focus();
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [openCategory]);

  const openSections = openCategory ? navigationSections[openCategory as keyof typeof navigationSections] : null;
  const filteredOpenSections = openSections
    ? openSections.filter((section) => {
        if (!flyoutQuery.trim()) return true;
        const q = flyoutQuery.trim().toLowerCase();
        return section.label.toLowerCase().includes(q) || section.key.toLowerCase().includes(q);
      })
    : null;

  const showLabels = !collapsed;

  // Roving focus for category rail: ArrowUp / ArrowDown / Home / End move between category buttons.
  const handleRailKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = event.key;
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) return;
    event.preventDefault();

    const buttons = Array.from(categoryButtonRefs.current.values());
    if (buttons.length === 0) return;
    const active = document.activeElement as HTMLElement | null;
    const idx = buttons.findIndex((b) => b === active);
    let next = idx;
    if (key === 'ArrowDown') next = idx < 0 ? 0 : (idx + 1) % buttons.length;
    else if (key === 'ArrowUp') next = idx < 0 ? buttons.length - 1 : (idx - 1 + buttons.length) % buttons.length;
    else if (key === 'Home') next = 0;
    else if (key === 'End') next = buttons.length - 1;
    buttons[next]?.focus();
  }, []);

  // Roving focus inside flyout menu.
  const handleMenuKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = event.key;
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) return;
    // Let the search input handle its own arrow keys if it's focused for text editing.
    if (document.activeElement === searchInputRef.current && (key === 'ArrowLeft' || key === 'ArrowRight')) return;

    event.preventDefault();
    const items = menuItemRefs.current.filter(Boolean);
    if (items.length === 0) return;
    const active = document.activeElement as HTMLElement | null;
    const idx = items.findIndex((b) => b === active);
    let next = idx;
    if (key === 'ArrowDown') next = idx < 0 ? 0 : (idx + 1) % items.length;
    else if (key === 'ArrowUp') next = idx < 0 ? items.length - 1 : (idx - 1 + items.length) % items.length;
    else if (key === 'Home') next = 0;
    else if (key === 'End') next = items.length - 1;
    items[next]?.focus();
  }, []);

  return (
    <>
      {/* Backdrop */}
      {openCategory && (
        <div
          className="fixed inset-0 bg-black/30 z-[9998] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200"
          onClick={() => closeFlyout(false)}
          aria-hidden="true"
        />
      )}

      <nav
        ref={sidebarRef}
        data-admin-sidebar
        className={cn(
          "fixed top-0 left-0 h-screen z-[9999] flex",
          "motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none"
        )}
        aria-label="Admin navigation"
      >
        {/* Main sidebar column */}
        <div className={cn(
          "h-full bg-[hsl(var(--sidebar-background))] border-r border-border/30 flex flex-col",
          "motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none",
          showLabels ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED
        )}>
          {/* Logo area */}
          <div className="h-14 flex items-center px-3 border-b border-border/20 shrink-0 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span
              className={cn(
                "ml-2.5 font-semibold text-sm text-sidebar-foreground tracking-tight whitespace-nowrap",
                "motion-safe:transition-opacity motion-safe:duration-200 motion-reduce:transition-none",
                showLabels ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-hidden={!showLabels}
            >
              ASTRA
            </span>
          </div>

          {/* Nav items */}
          <ScrollArea className="flex-1 py-2">
            <div
              role="menubar"
              aria-orientation="vertical"
              className="flex flex-col gap-0.5 px-2"
              onKeyDown={handleRailKeyDown}
            >
              {categories.map((category) => {
                const sections = navigationSections[category as keyof typeof navigationSections];
                if (!sections || sections.length === 0) return null;

                const CategoryIcon = categoryIcons[category] || LayoutDashboard;
                const isActive = activeCategory === category;
                const isOpen = openCategory === category;
                const title = sectionTitles[category as keyof typeof sectionTitles] || category;
                const hasSubmenu = sections.length > 1;

                return (
                  <button
                    key={category}
                    ref={(el) => {
                      if (el) categoryButtonRefs.current.set(category, el);
                      else categoryButtonRefs.current.delete(category);
                    }}
                    onClick={(e) => handleCategoryClick(category, e)}
                    role="menuitem"
                    aria-label={title}
                    aria-haspopup={hasSubmenu ? 'menu' : undefined}
                    aria-expanded={hasSubmenu ? isOpen : undefined}
                    aria-controls={hasSubmenu && isOpen ? flyoutId : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 h-9 rounded-lg px-2.5 text-left w-full overflow-hidden",
                      "motion-safe:transition-colors motion-safe:duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-[hsl(var(--sidebar-background))]",
                      isOpen
                        ? "bg-primary text-primary-foreground"
                        : isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <CategoryIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span
                      className={cn(
                        "text-xs font-medium truncate whitespace-nowrap",
                        "motion-safe:transition-opacity motion-safe:duration-200",
                        showLabels ? "opacity-100" : "opacity-0 pointer-events-none"
                      )}
                      aria-hidden={!showLabels}
                    >
                      {title}
                    </span>

                    {/* Active indicator */}
                    {isActive && !isOpen && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" aria-hidden="true" />
                    )}

                    {/* Section count */}
                    {hasSubmenu && (
                      <span
                        className={cn(
                          "text-[9px] tabular-nums font-medium rounded px-1 py-0.5 ml-auto",
                          "motion-safe:transition-opacity motion-safe:duration-200",
                          showLabels ? "opacity-100" : "opacity-0 pointer-events-none",
                          isOpen ? "bg-primary-foreground/20 text-primary-foreground" :
                          isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}
                        aria-hidden="true"
                      >
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
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-pressed={collapsed}
                className={cn(
                  "w-full flex items-center justify-center h-8 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                  "motion-safe:transition-colors motion-safe:duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                {collapsed ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          )}
        </div>

        {/* Flyout Panel */}
        {openCategory && openSections && (
          <div
            ref={flyoutRef}
            id={flyoutId}
            role="menu"
            aria-label={sectionTitles[openCategory as keyof typeof sectionTitles]}
            onKeyDown={handleMenuKeyDown}
            className={cn(
              "absolute top-2 w-56 bg-popover border border-border/50 rounded-xl shadow-xl z-[9999] flex flex-col origin-left",
              "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:slide-in-from-left-2 motion-safe:duration-200",
              collapsed ? "left-14" : "left-14 lg:left-60"
            )}
            style={{ maxHeight: 'min(calc(100vh - 80px), 680px)' }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/30 shrink-0">
              <h3 className="font-semibold text-xs text-foreground">
                {sectionTitles[openCategory as keyof typeof sectionTitles]}
              </h3>
              <button
                onClick={() => closeFlyout(true)}
                aria-label="Close submenu"
                className={cn(
                  "w-5 h-5 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>

            {/* Search */}
            {(openSections.length > 6) && (
              <div className="px-2.5 py-2 border-b border-border/20 shrink-0">
                <Input
                  ref={searchInputRef}
                  value={flyoutQuery}
                  onChange={(e) => setFlyoutQuery(e.target.value)}
                  placeholder="Filter…"
                  aria-label="Filter menu items"
                  className="h-7 text-xs bg-muted/40"
                />
              </div>
            )}

            {/* Items */}
            <ScrollArea className="flex-1 overflow-auto" style={{ maxHeight: '560px' }}>
              <div className="p-1.5 space-y-0.5">
                {filteredOpenSections?.length ? filteredOpenSections.map((section, index) => {
                  const Icon = section.icon;
                  const isActive = section.key === activeSection;
                  return (
                    <button
                      key={section.key}
                      ref={(el) => {
                        if (el) menuItemRefs.current[index] = el;
                      }}
                      role="menuitem"
                      onClick={() => handleNavClick(section.key)}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left",
                        "motion-safe:transition-colors motion-safe:duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} aria-hidden="true" />
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
