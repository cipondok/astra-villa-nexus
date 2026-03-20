import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { navigationSections, sectionTitles, categories } from './navigationSections';
import { Input } from "@/components/ui/input";
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
  DollarSign,
  Search,
  ChevronDown,
  ChevronUp,
  type LucideIcon 
} from 'lucide-react';

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

const STORAGE_KEY = 'admin-tab-visit-history';
const COLLAPSED_VISIBLE = 10;

function getVisitHistory(): Record<string, number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function recordVisit(sectionKey: string) {
  try {
    const history = getVisitHistory();
    history[sectionKey] = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

interface AdminCategoryTabsProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AdminCategoryTabs({ activeSection, onSectionChange }: AdminCategoryTabsProps) {
  const [visitHistory, setVisitHistory] = useState<Record<string, number>>(getVisitHistory);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (activeSection) {
      recordVisit(activeSection);
      setVisitHistory(getVisitHistory());
    }
  }, [activeSection]);

  const activeCategory = useMemo((): string | null => {
    for (const category of categories) {
      const sections = navigationSections[category as keyof typeof navigationSections];
      if (sections?.some((section) => section.key === activeSection)) {
        return category;
      }
    }
    return null;
  }, [activeSection]);

  const categorySections = useMemo(() => 
    activeCategory ? (navigationSections[activeCategory as keyof typeof navigationSections] || []) : [],
    [activeCategory]
  );

  const sortedSections = useMemo(() => {
    return [...categorySections].sort((a, b) => {
      if (a.key === activeSection) return -1;
      if (b.key === activeSection) return 1;
      const aTime = visitHistory[a.key] || 0;
      const bTime = visitHistory[b.key] || 0;
      return bTime - aTime;
    });
  }, [categorySections, activeSection, visitHistory]);

  const filteredSections = useMemo(() => {
    if (!query.trim()) return sortedSections;
    const q = query.toLowerCase();
    return sortedSections.filter(s => s.label.toLowerCase().includes(q));
  }, [sortedSections, query]);

  const handleSectionClick = useCallback((key: string) => {
    onSectionChange(key);
  }, [onSectionChange]);

  if (!activeCategory || activeSection === 'overview') {
    return null;
  }

  const CategoryIcon = categoryIcons[activeCategory] || LayoutDashboard;
  const categoryTitle = sectionTitles[activeCategory as keyof typeof sectionTitles] || activeCategory;
  const totalCount = categorySections.length;
  const showToggle = filteredSections.length > COLLAPSED_VISIBLE && !query.trim();
  const displaySections = showToggle && !expanded 
    ? filteredSections.slice(0, COLLAPSED_VISIBLE) 
    : filteredSections;
  const hiddenCount = filteredSections.length - COLLAPSED_VISIBLE;

  return (
    <div className="mb-3 sticky top-0 z-30 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-sm overflow-hidden shadow-sm">
        {/* Header row */}
        <div className="px-3 py-2 flex items-center gap-3 border-b border-border/40">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10">
              <CategoryIcon className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-foreground tracking-wide truncate">
              {categoryTitle}
            </span>
            <span className="text-[10px] tabular-nums font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
              {totalCount}
            </span>
          </div>
          
          {/* Inline search — only show when many items */}
          {totalCount > 8 && (
            <div className="ml-auto relative max-w-[180px] w-full">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setExpanded(true); }}
                placeholder="Filter…"
                className="h-6 text-[10px] pl-6 pr-2 bg-muted/40 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
          )}
        </div>

        {/* Mobile: horizontal scroll */}
        <ScrollArea className="w-full md:hidden">
          <div className="flex items-center gap-1 p-2">
            {displaySections.map((section) => {
              const isActive = section.key === activeSection;
              const Icon = section.icon;
              return (
                <button
                  key={section.key}
                  onClick={() => handleSectionClick(section.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-150 whitespace-nowrap shrink-0",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[90px]">{section.label}</span>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-1" />
        </ScrollArea>

        {/* Desktop: compact grid of chips */}
        <div className="hidden md:block p-2">
          <div className="grid grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1">
            {displaySections.map((section) => {
              const isActive = section.key === activeSection;
              const Icon = section.icon;
              const hasBadge = 'badge' in section && section.badge;
              return (
                <button
                  key={section.key}
                  onClick={() => handleSectionClick(section.key)}
                  title={section.label}
                  className={cn(
                    "group relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-150 text-left overflow-hidden",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    "active:scale-[0.97]",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60 bg-muted/30"
                  )}
                >
                  <Icon className={cn(
                    "h-3 w-3 shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className="truncate flex-1 leading-tight">{section.label}</span>
                  {hasBadge && (
                    <span className={cn(
                      "text-[7px] leading-none px-1 py-0.5 rounded font-bold uppercase shrink-0",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : String(section.badge) === 'New'
                          ? "bg-accent text-accent-foreground"
                          : "bg-primary/10 text-primary"
                    )}>
                      {String(section.badge)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Show more / less toggle */}
          {showToggle && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 w-full flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  {hiddenCount} more sections
                </>
              )}
            </button>
          )}

          {/* Empty search state */}
          {query.trim() && filteredSections.length === 0 && (
            <div className="py-4 text-center text-[11px] text-muted-foreground">
              No sections match "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCategoryTabs;
