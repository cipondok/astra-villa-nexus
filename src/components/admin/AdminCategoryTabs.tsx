import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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
  DollarSign,
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

const categoryThemes: Record<string, { header: string; active: string }> = {
  overview: { header: "bg-primary text-primary-foreground", active: "bg-primary text-primary-foreground" },
  transactions: { header: "bg-accent text-accent-foreground", active: "bg-accent text-accent-foreground" },
  "astra-token": { header: "bg-secondary text-secondary-foreground", active: "bg-secondary text-secondary-foreground" },
  tools: { header: "bg-muted text-foreground", active: "bg-primary text-primary-foreground" },
  "core-management": { header: "bg-primary text-primary-foreground", active: "bg-primary text-primary-foreground" },
  "customer-service": { header: "bg-accent text-accent-foreground", active: "bg-accent text-accent-foreground" },
  "vendor-management": { header: "bg-secondary text-secondary-foreground", active: "bg-secondary text-secondary-foreground" },
  "analytics-monitoring": { header: "bg-primary text-primary-foreground", active: "bg-primary text-primary-foreground" },
  "content-settings": { header: "bg-accent text-accent-foreground", active: "bg-accent text-accent-foreground" },
  "system-settings": { header: "bg-secondary text-secondary-foreground", active: "bg-secondary text-secondary-foreground" },
  technical: { header: "bg-destructive text-destructive-foreground", active: "bg-destructive text-destructive-foreground" },
  features: { header: "bg-primary text-primary-foreground", active: "bg-primary text-primary-foreground" },
  help: { header: "bg-muted text-foreground", active: "bg-primary text-primary-foreground" },
};

const VISIBLE_COUNT = 6;
const STORAGE_KEY = 'admin-tab-visit-history';

// Get visit history from localStorage
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
  const [expanded, setExpanded] = useState(false);
  const [visitHistory, setVisitHistory] = useState<Record<string, number>>(getVisitHistory);

  // Record visit when active section changes
  useEffect(() => {
    if (activeSection) {
      recordVisit(activeSection);
      setVisitHistory(getVisitHistory());
    }
  }, [activeSection]);

  // Find which category contains the active section
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

  // Sort sections: active first, then by most recently visited, then the rest
  const sortedSections = useMemo(() => {
    return [...categorySections].sort((a, b) => {
      if (a.key === activeSection) return -1;
      if (b.key === activeSection) return 1;
      const aTime = visitHistory[a.key] || 0;
      const bTime = visitHistory[b.key] || 0;
      return bTime - aTime;
    });
  }, [categorySections, activeSection, visitHistory]);

  const handleSectionClick = useCallback((key: string) => {
    onSectionChange(key);
  }, [onSectionChange]);

  if (!activeCategory || activeSection === 'overview') {
    return null;
  }

  const CategoryIcon = categoryIcons[activeCategory] || LayoutDashboard;
  const theme = categoryThemes[activeCategory] || categoryThemes.overview;
  const categoryTitle = sectionTitles[activeCategory as keyof typeof sectionTitles] || activeCategory;

  const visibleSections = expanded ? sortedSections : sortedSections.slice(0, VISIBLE_COUNT);
  const hiddenCount = sortedSections.length - VISIBLE_COUNT;
  const hasMore = sortedSections.length > VISIBLE_COUNT;

  const renderTab = (section: typeof categorySections[0], isActive: boolean) => {
    const Icon = section.icon;
    return (
      <button
        key={section.key}
        onClick={() => handleSectionClick(section.key)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all duration-150 whitespace-nowrap",
          isActive
            ? cn("shadow-sm ring-1 ring-primary/20", theme.active)
            : "hover:bg-muted/60 text-muted-foreground hover:text-foreground bg-muted/30"
        )}
      >
        <Icon className="h-3 w-3 shrink-0" />
        <span className="max-w-[100px] truncate">{section.label}</span>
        {'badge' in section && section.badge && (
          <Badge
            variant="secondary"
            className={cn(
              "text-[7px] px-1 py-0 h-3 leading-none",
              isActive
                ? "bg-primary-foreground/25 text-primary-foreground border-0"
                : String(section.badge) === 'New'
                  ? "bg-chart-1/15 text-chart-1 border-0"
                  : "bg-primary/10 text-primary border-0"
            )}
          >
            {String(section.badge)}
          </Badge>
        )}
      </button>
    );
  };

  return (
    <div className="mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="bg-background/80 backdrop-blur-sm border border-border/40 rounded-lg overflow-hidden shadow-sm">
        {/* Mini Header */}
        <div className={cn("px-3 py-1.5 flex items-center gap-2", theme.header)}>
          <CategoryIcon className="h-3.5 w-3.5" />
          <span className="text-[11px] font-bold tracking-wide uppercase">{categoryTitle}</span>
          <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-3.5 bg-background/20 text-inherit border-0 ml-auto">
            {categorySections.length} items
          </Badge>
        </div>

        {/* Mobile: horizontal scroll with top 6 */}
        <ScrollArea className="w-full md:hidden">
          <div className="flex items-center gap-1 p-1.5">
            {visibleSections.map((section) =>
              renderTab(section, section.key === activeSection)
            )}
            {hasMore && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 bg-muted/30 whitespace-nowrap shrink-0 transition-colors"
              >
                <ChevronDown className="h-3 w-3" />
                +{hiddenCount} more
              </button>
            )}
            {expanded && hasMore && (
              <button
                onClick={() => setExpanded(false)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-medium text-primary hover:bg-primary/10 whitespace-nowrap shrink-0 transition-colors"
              >
                <ChevronUp className="h-3 w-3" />
                Less
              </button>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="h-1" />
        </ScrollArea>

        {/* Desktop: show top 6, expandable */}
        <div className="hidden md:block p-1.5 bg-muted/10">
          <div className="flex flex-wrap items-center gap-1">
            {visibleSections.map((section) =>
              renderTab(section, section.key === activeSection)
            )}
            {hasMore && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 bg-muted/20 transition-colors border border-dashed border-border/40"
              >
                <ChevronDown className="h-3 w-3" />
                +{hiddenCount} more
              </button>
            )}
            {expanded && hasMore && (
              <button
                onClick={() => setExpanded(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <ChevronUp className="h-3 w-3" />
                Show less
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCategoryTabs;
