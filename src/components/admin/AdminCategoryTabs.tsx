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

// Unified panel theme — all categories use the same sleek style
const categoryAccent: Record<string, string> = {
  overview: "--panel-accent",
  transactions: "--panel-success",
  "astra-token": "--panel-accent",
  tools: "--panel-text-secondary",
  "core-management": "--panel-success",
  "customer-service": "--panel-accent",
  "vendor-management": "--panel-success",
  "analytics-monitoring": "--panel-accent",
  "content-settings": "--panel-accent",
  "system-settings": "--panel-text-secondary",
  technical: "--panel-danger",
  features: "--panel-accent",
  help: "--panel-text-secondary",
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
  const accentVar = categoryAccent[activeCategory] || "--panel-accent";
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
            ? "bg-[hsl(var(--panel-accent)/.12)] text-[hsl(var(--panel-accent))] ring-1 ring-[hsl(var(--panel-accent)/.2)] shadow-sm"
            : "text-[hsl(var(--panel-text-secondary))] hover:text-[hsl(var(--panel-text))] hover:bg-[hsl(var(--panel-hover))] bg-[hsl(var(--panel-border)/.3)]"
        )}
      >
        <Icon className="h-3 w-3 shrink-0" />
        <span className="max-w-[100px] truncate">{section.label}</span>
        {'badge' in section && section.badge && (
          <span
            className={cn(
              "text-[7px] px-1 py-0 h-3 leading-[12px] rounded font-semibold inline-block",
              isActive
                ? "bg-[hsl(var(--panel-accent)/.2)] text-[hsl(var(--panel-accent))]"
                : String(section.badge) === 'New'
                  ? "bg-[hsl(var(--panel-success)/.12)] text-[hsl(var(--panel-success))]"
                  : "bg-[hsl(var(--panel-accent)/.1)] text-[hsl(var(--panel-accent))]"
            )}
          >
            {String(section.badge)}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="mb-2 sticky top-0 z-40 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] rounded-lg overflow-hidden shadow-sm">
        {/* Mini Header */}
        <div className="px-3 py-1.5 flex items-center gap-2 border-b border-[hsl(var(--panel-border))]" style={{ background: `hsl(var(${accentVar}) / 0.08)` }}>
          <CategoryIcon className="h-3.5 w-3.5 text-[hsl(var(--panel-accent))]" />
          <span className="text-[11px] font-bold tracking-wide uppercase text-[hsl(var(--panel-text))]">{categoryTitle}</span>
          <span className="text-[8px] px-1.5 py-0 h-3.5 leading-[14px] rounded bg-[hsl(var(--panel-border)/.5)] text-[hsl(var(--panel-text-secondary))] font-medium ml-auto">
            {categorySections.length} items
          </span>
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
                className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-medium text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text))] hover:bg-[hsl(var(--panel-hover))] bg-[hsl(var(--panel-border)/.3)] whitespace-nowrap shrink-0 transition-colors"
              >
                <ChevronDown className="h-3 w-3" />
                +{hiddenCount} more
              </button>
            )}
            {expanded && hasMore && (
              <button
                onClick={() => setExpanded(false)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-medium text-[hsl(var(--panel-accent))] hover:bg-[hsl(var(--panel-accent)/.1)] whitespace-nowrap shrink-0 transition-colors"
              >
                <ChevronUp className="h-3 w-3" />
                Less
              </button>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="h-1" />
        </ScrollArea>

        {/* Desktop: show top 6, expandable */}
        <div className="hidden md:block p-1.5">
          <div className="flex flex-wrap items-center gap-1">
            {visibleSections.map((section) =>
              renderTab(section, section.key === activeSection)
            )}
            {hasMore && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text))] hover:bg-[hsl(var(--panel-hover))] bg-[hsl(var(--panel-border)/.2)] transition-colors border border-dashed border-[hsl(var(--panel-border))]"
              >
                <ChevronDown className="h-3 w-3" />
                +{hiddenCount} more
              </button>
            )}
            {expanded && hasMore && (
              <button
                onClick={() => setExpanded(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium text-[hsl(var(--panel-accent))] hover:bg-[hsl(var(--panel-accent)/.1)] transition-colors"
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
